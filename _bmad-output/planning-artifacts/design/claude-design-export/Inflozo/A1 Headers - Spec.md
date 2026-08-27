# A1 · Headers & Navigation — written specification

Pack drawn: **Paper**. **All 16 designs complete.** Category artefacts (tokenisation proof, stress frame, shared field list, roster) are in **A1-0 Category Proof.dc.html**.

Frames: `A1-1 Rail` · `A1-2 Split Rail` · `A1-3 Stacked Masthead` · `A1-4 Overlay` · `A1-5 Floating Pill` · `A1-6 Drawer-First` · `A1-7 Mega Bar` · `A1-8 Utility + Nav` · `A1-9 Search-Forward` · `A1-10 Contrast Band` · `A1-11 Side Rail` · `A1-12 Boxed` · `A1-13 Centre Nav` · `A1-14 Icon Utilities` · `A1-15 Big Type` · `A1-16 Reveal` (all `.dc.html`)

**Frame set per design, from design 5 onward:** desktop 1440 light (primary) · the design's behaviour state · a hover/focus states frame · tablet 834 always, even when it only narrows · mobile 390 closed and open · dark desktop · an annotated accessibility frame · control panel · spec card. Designs 1–4 predate the last three of those; their states and accessibility notes live in their spec cards and in §0 below.

**Controls-reconciliation pass, third round.** The whole category was audited against the PRD's control vocabulary and Ghost's verified data surface. This round reuses the shared editor primitives designed in **P0 · Editor primitives** — the inline text toolbar (P0·1), the icon slot + Icon Picker (P0·2), the item-list controls (P0·3), the member-aware action editor (P0·4), the "Populate from…" data panel (P0·5) and the editor state switcher (P0·6) — **by name, never redesigned**. What changed: the universal control trio moved outside every per-design list (and absorbed every "Height" row), search and the dark-mode toggle became controls on all sixteen, a second navigation source (Ghost prefixes) was added, the Actions vocabulary was defined precisely and given the P0·4 editor, fold thresholds became a control, every fixed English string was resolved, social rows were bound to Ghost, and nine designs took per-design corrections. Changed frames are listed at the head of §21 · Reconciliation notes. Earlier rounds' corrections (registry module names, six-slot structural descriptors) stand.

---

## 0 · Category-wide rules

These apply to all 16 designs and are not repeated per design.

**Placement.** Site-wide furniture. Sits below the announcement bar (A2) and above everything else. Present on every template.

**Breakpoints.** Desktop ≥ 1024 · tablet 768–1023 · mobile ≤ 767. The drawer arrives at 767 in every design except A1·6, where it is the design.

**Type floors.** Nav 15 px desktop / 15 px mobile, never below. Meta and utility 13–14 px. Wordmark 17 px minimum. Tap targets 44 px.

**Motion.** 160 ms ease-out, one transition per state change, no in-between states. Sticky transitions fire once at 80 px of scroll. Drawer opens with a 160 ms translate, no bounce. All of it is suppressed under `prefers-reduced-motion` — the states still change, instantly. Nothing animates while the section is being edited: the resting state is what the editor shows.

**Hover, focus and pressed — library-wide.** Nav items change colour only on hover (`text-muted` → `text`); the accent underline means "you are here" and hover never imitates it. Focus-visible is a 2 px `accent` ring at 2 px offset, 6 px radius — on an accent fill it gets a `background`-coloured gap first, and on a `contrast` ground it switches to the pack's lightest surface. Buttons darken the accent one step on hover and two when pressed, both supplied by the pack. Hover and keyboard focus land on the same shape in dropdowns and panels. Two exceptions, each justified on its frame: takeover items at display size underline in accent on hover (A1·6), and 13 px utility-strip links underline in `border` colour (A1·8).

**Content parity across frames.** Every frame of a design draws the same authored content: the same four nav items, the same children and grandchildren, the same two member actions, the same tag chips. Only what a stated rule names may differ by width — a fold to More, a column stack, a dropped rail, an element that moves to the drawer. A frame that quietly carries less content than its siblings is a defect, not a simplification.

**Accent budget.** Once or twice per header. The permitted uses are: the primary action's fill, the active nav item's 2 px underline, the logo mark, and (A1·3 only) the reading-progress rule. Never on hairlines, never on hover backgrounds. (A1·11's former third use — the active row's 2 px leading bar — was removed this pass; see §11.)

### 0·1 · The universal controls

Every placeable section carries **Background role**, **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade) **outside its own control list**, in the panel's universal block. On A1 they read as follows.

- **Vertical spacing is the bar height.** Every per-design "Height (Compact · Comfortable · Spacious)" row was that control wearing a local name and has been **removed from all sixteen lists**; the universal row carries it, and each design's spec keeps its px readings (Comfortable = 76 on the bars, etc.). Genuinely different ladders keep their own names and stay in the lists: A1·3's **Masthead height** (it measures one tier, not the section), A1·15's **Wordmark size** (type scale, not spacing — but its "Padding" row was the duplicate and is removed). A1·11 has no height at all: its universal Vertical spacing row is **disabled with the reason shown** ("A fixed rail fills the viewport — it has no height to set").
- **Background role** offers **Background · Surface** on a header — never Contrast, because an inverted header is A1·10, a design, not a setting (§19's own rule: two designs that differ only by a control value are one design). **Locked, with the reason shown:** A1·4 ("Transparent over the hero is this design"), A1·10 ("The contrast band is this design"), A1·12 ("The box sits on the page ground; its fill is the Box treatment control"). On A1·5 it sets the page ground around the capsule; the capsule itself stays `surface` (that is the design). A1·11's former "Rail ground" row was this control wearing a local name and is removed; see §21 for the fate of its Contrast value.
- **Top divider** is the seam **above** the header — under the announcement bar when one is present. It is distinct from the designs' own bottom-edge rows, which are renamed **"Divider under"** wherever the old name was the bare "Divider" (A1·1, A1·8, A1·13); A1·2's "Hairline under" and A1·3's "Rules" already said which edge they mean.

**Control budget.** The earlier 4–7 norm is lifted where this pass adds controls; the ceiling is the PRD's ≈15 visible controls per design, plus the three universal controls and the Data group. Controls tables below are ordered by impact; **the first 3–5 rows are the design's Quick Controls**. No A1 design exceeds ten listed controls after this pass.

### 0·2 · Editing — what is inline, what is locked, what is picked

- **Every visible authored text is editable inline** with the shared floating toolbar (P0·1: bold / italic / underline / link; the link popover carries "Open in new tab" and the rel toggles `nofollow` · `noreferrer` · `sponsored`). That includes wordmark-as-text, taglines, nav-item labels in Authored mode, children, descriptions, column titles, `stripNote`, the strip's authored items, `featuredHeading`, `railHeading`, the BY TOPIC / BY AUTHORS headlines, `searchPlaceholder`, and every action label via its P0·4 card.
- **Ghost-owned content never shows the toolbar**: site title, site description (the tagline default), post titles, post dates, excerpts, tag names, author names, member name/tier/renewal, and nav labels in **From Ghost navigation** mode. Clicking it shows the P0·1 plain-text lock pill ("Site title — plain text, set in Ghost" / "Edit navigation in Ghost"); editing site title and description edits the Ghost setting.
- **Every URL field opens the Ghost-aware Link Picker** (the P0·1 link popover): `ctaUrl`, child targets, authored strip items, authored column links, foot links, the P0·4 Link rows (Portal actions first).
- **Every image field carries an Image focus (Centre · Top · Bottom), reachable from the Image Picker popover** — never a hidden field. A1's authored image fields: `logo`, `logoLight`, A1·15's logo image. Post feature images (A1·6, A1·7) are Ghost's and take no focus control here.
- **Buttons accept an optional icon before or after the label**, from the Icon Picker with its size/colour-role popover (P0·2 button-icon rules: always Small, inherits the label colour). Applies to the primary button and the ghost action in all sixteen.
- **No "Preview"-type control exists in any panel.** A1 shipped none (verified design by design); states are the editor's P0·6 switcher, audiences are View as.

### 0·3 · Actions, defined precisely

The **Actions** control's values name the slots, not fixed strings: **None · Sign in · Subscribe · Sign in + Subscribe**. The value "Subscribe" renders the authored `ctaLabel`/`ctaUrl` button — a custom CTA ("Hire Me") is therefore real on every design, with "Subscribe" → Portal `signup` only the shipped default.

**Sign in** and **Subscribe/CTA** each carry the **P0·4 member-aware editor** — one compact sub-editor per action, never twelve top-level controls. Per state (Logged out · Free member · Paid member): Show · Label · Link (Link Picker, Portal actions first). Shipped defaults for A1: logged out — "Sign in" → `signin`, "Subscribe" → `signup`; free and paid members — the Sign in slot becomes "Account" → Portal `account`; the Subscribe slot's Show is **off** for both member states (the free-member upgrade ask → `account/plans` exists in the editor but ships off in A1). Show = off removes the action for that audience server-side; siblings shift per each design's empty rule. Members disabled in Ghost → each card collapses to one plain Label + Link editor with the reason shown.

**No section-level Member Visibility on A1.** The category's CTA-bearing designs would ordinarily carry it (Everyone · Logged out · Free · Paid), but a site header must render for every audience; the P0·4 per-action model subsumes every legitimate use. Recorded in §21.

### 0·4 · Search and the dark-mode toggle — on all sixteen

- **"Search in header: On · Off"** is a control on **all 16 designs**, drawn with the shared 38 px affordance (icon button in the bar, 44 px target on mobile, labelled field in the drawer; opens the A23 surface via `search-overlay`). Local names stay where the placement is the point: "Search in pill" (5), "Search in band" (10), "Search in rail" (11), "Search at the top" (16). On A1·2 it lives inside the Right cluster values; on A1·14 inside the Icons values — those two lists are the control there, stated in each sidebar. On A1·9 it is **forced On and shown locked with the reason** ("The field is the design"). Default off elsewhere, as before.
- **"Dark mode toggle: On · Off"** is a control on **all 16 designs**, drawn by the registry **`mode-toggle`** module and **offered only when the project ships both modes** (otherwise the row is absent, not disabled). Placement when On: the standard 38 px icon button beside the search affordance in the bar's utility cluster, plus a switch row in the drawer, the two kept in sync. Local exceptions: A1·14 draws it inside its Icons cluster (its Icons values are the control); A1·8's toggle no longer lives in the strip (see §8). **JS off:** "`prefers-color-scheme` still drives Auto mode entirely in CSS (FR-E4); only the manual override control is hidden."

### 0·5 · Two navigation sources

**"Nav children: Authored in Inflozo (default) · From Ghost navigation (prefixes)"** — a category-wide control in the Data group of all sixteen.

- **Authored in Inflozo** (default): as before — Ghost's flat primary nav supplies the items; children, grandchildren and descriptions are authored here with the P0·3 item controls.
- **From Ghost navigation (prefixes):** the whole tree is read out of Ghost's primary navigation by label prefix. A label prefixed **`+`** is a dropdown parent (its URL is `#` in Ghost; if a URL is present, it is ignored). The **`-`**-prefixed items immediately after it are its children (usual URLs); after the last child, the next item is a new parent or a plain link. A dropdown may sit first, middle or last. **One child level only — grandchildren remain Inflozo-authored** in either mode. In this mode every nav list in the sidebar is **read-only rows with an "Edit navigation in Ghost" row — never an Add button** (P0·3's Ghost-sourced list card).
- **ARCHITECT: registry addition (`nav-transform`).** The DOM transform that folds Ghost's flat list into parents and children is behaviour no registry module covers; it is flagged on the frames and here, and no module name is coined. **Owner ruling: this scheme requires JavaScript and gets no no-JS accommodation.** Without JS the nav renders Ghost's flat list as-is — prefixes visible, one level. That is the module's whole degradation line, and nothing is designed for that case.
- A1·2 additionally reads a **`|` marker item** and A1·6/A1·7 read prefix groups into their own surfaces; each is specified in its own section.

### 0·6 · Fold thresholds

**"Nav items before More: Auto · Four · Five · Six"** joins the bar designs — **A1·1, A1·4, A1·5, A1·7, A1·9, A1·10, A1·12, A1·13, A1·14, A1·15, A1·16**. "Auto" is the design's drawn threshold (4 on all of these) adjusted down when the actions and search leave no room; Four/Five/Six pin it, so a five-item site is never forced into More. §20's per-design table reads as the Auto values. Not offered on A1·2 (the Split control owns distribution; fold stays at 6), A1·3 (the full-width row caps at 8 and scrolls at tablet instead of folding), A1·6 (uncapped — no More exists), A1·11 (the column folds at 7 to a More row; a vertical rail has no width pressure) — each stated in its sidebar.

### 0·7 · Visitor-facing strings — no fixed English ships

Every string a visitor can read is either an **editable field with a default** or a **theme translation-catalog string**. The ruling, per string:

| String | Ruling |
|---|---|
| "More" (the fold trigger, all folding designs) | **Field** `moreLabel`, default "More" — one shared category field, edited inline where it renders |
| "Menu" / "Close" (A1·6's toggle) | **Fields** `menuLabel` / `closeLabel`, defaults "Menu" / "Close" |
| "Skip to content" | **Catalog string** — uniform chrome, translated per locale, never per-site copy |
| Drawer group labels ("Navigation", "Follow", "Preferences") | **Catalog strings** |
| Drawer search placeholder ("Search {site name}") | **Catalog string** with the site-name placeholder |
| "Sign in", "Subscribe", "Account" | **Fields** — the P0·4 per-state labels, with those defaults |
| A1·9's field placeholder | **Field** `searchPlaceholder` (as before); its default's "essays and interviews" noun is part of the default, replaced wholesale when edited |
| A1·9's "No matches for '…' — try a tag", "See all results", the live count line | **Catalog strings** with placeholders |
| Foot-link labels carrying live counts ("All {n} sections", "All {n} tags", "All authors") | **Catalog strings** with the count placeholder |
| "Dark mode" (the toggle's name) | **Catalog string** |
| A1·3's date line | Not a string — a locale-formatted date; see §3 |

### 0·8 · Social links

Wherever social glyphs render (A1·8's strip, A1·14's cluster), `socialLinks` **binds to Ghost's social accounts**: **Facebook and X only on Ghost 5.x; all nine platforms on ≥ 6.36** — the sidebar rows are version-gated and absent on the older data surface, not disabled. Each glyph is a **P0·2 icon slot** (defaults from the Icon Picker's Social/Brands group, swappable); rows follow Ghost's field order (§20 — no reorder handles). Authored extras beyond Ghost's fields remain, as P0·3 authored rows.

**Shared components established here, reused verbatim for the rest of the library.**

| Component | Definition |
|---|---|
| Logo lockup | 26 px accent rounded-square mark (radius token − 1) + wordmark in the pack heading font at 19 px, 10 px gap. Mark is optional; wordmark alone is valid. |
| Nav item | 15 px body font. Resting `text-muted`; active `text` + 2 px `accent` underline offset 2 px. Hover → `text`, 160 ms. |
| Dropdown panel | 248 px, `surface`, 1 px `border`, radius token, md shadow, 8 px padding, items 14 px in 6 px-radius rows, hovered row on a one-step-warmer surface. Left-aligned to trigger. Two levels: a child may carry its own group, shown indented under it against a hairline at 13.5 px, never a third level and never a second flyout panel. |
| Primary button | `accent` fill, `background`-coloured label, 14 px / 600, padding 9 × 17, radius token. Accepts a P0·2 icon Before/After. |
| Ghost action | `text-muted` label, 14 px, no border in the bar; 1 px `border` and radius token when it appears as a full-width drawer button. Accepts a P0·2 icon. |
| Overflow menu | `moreLabel` + 9 px caret, uses the dropdown panel. |
| Drawer | Full-height panel on `surface` (or `contrast` for A1·4), 64 px close row, nav items in the heading font at 22–26 px, actions pinned to the foot, focus trapped. |
| Search affordance | 38 px icon button (1 px `border`, radius token, 19 px glyph) in the bar; a 44 px target with a 20 px glyph on mobile; a labelled field in the drawer. Opens the A23 surface. |
| Mode toggle | 38 px icon button, on state a contrast fill, `aria-pressed`, name "Dark mode"; a switch row in the drawer, the two in sync. |

**Accessibility floor for every design.** One `<header>` landmark; one `<nav aria-label="Primary">`. The wordmark links to `/` and is not an `<h1>` except on the home page. Dropdown triggers are `<button aria-expanded>`; panels close on Escape and on focus leaving. The drawer traps focus and returns it to its toggle. A skip-to-content link is first in focus order on every design. Visual focus is a 2 px `accent` ring at 2 px offset. DOM order follows reading order regardless of visual arrangement.

**Data.** `navItems` is Ghost's primary navigation; `secondaryNav` is Ghost's secondary navigation; `socialLinks` reads Ghost's social account fields (§0·8). Member actions are hidden wholesale when members are disabled in Ghost. In Authored mode, children and descriptions are authored in Inflozo because Ghost's navigation is flat; two levels of child are supported, three are not. In Ghost-prefix mode, one level comes from Ghost (§0·5).

**Empty-data floor.** Zero nav items never leaves a ruled empty band: the nav row or the hairline that framed it is removed. Zero member actions shifts remaining content, it does not leave a gap. A missing logo image falls back to the wordmark as text, never to a broken-image box.

**Behaviour modules.** All non-CSS behaviour in A1 comes from the fixed registry (FR-G7). A1 uses eight of its modules, `mode-toggle` now on all sixteen rather than two. `core` is present site-wide and is not repeated on the per-design lines. One registry addition is flagged for the architect: **`nav-transform`** (§0·5) — flagged, not coined. No A1 design is module-free, because navigation itself is a module in all sixteen.

| Module | What A1 uses it for | With JavaScript off (registry text, quoted) |
|---|---|---|
| `core` | The `.js-enabled` class every other module's CSS branches on. | "Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch." |
| `nav-drawer` | The mobile drawer in all sixteen designs and A1·6's takeover: open and close, focus trap, page inert, scroll lock, focus returned to the trigger. | "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." |
| `header-scroll` | Every scroll state named in the category — sticky, shrink, solidify, re-form left, stick and narrow, stick and fill, collapse to bar, hide — and A1·16's direction-driven reveal. | "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." |
| `accordion` | Click-to-open surfaces: nav dropdowns, More, A1·7's mega panel, A1·11's side panels and in-place child expansion, in-drawer child expansion. Owns `aria-expanded`, Escape, click-outside and hover intent. | "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." |
| `search-overlay` | The search affordance wherever it is offered, and A1·9's field: debounce, minimum length, suggestion rows, recent-query store, combobox keys, live count — client-side over the Content API (§9). | "The trigger is a real `<form action="/search/" method="get">`, so search submits as a normal page navigation." |
| `carousel` | A1·3's horizontally scrolling nav rail at ≤ 1023. | "The slide track is a native horizontally-scrollable `scroll-snap` strip — fully usable, only dots and arrow buttons are hidden." |
| `reading-progress` | A1·3's 2 px rule on the pinned nav row; post and page templates only. | "The bar is hidden entirely (it is decorative)." |
| `mode-toggle` | The dark-mode control on all sixteen (§0·4), kept in sync with the drawer's switch row. | "`prefers-color-scheme` still drives Auto mode entirely in CSS (FR-E4); only the manual override control is hidden." |
| **ARCHITECT: `nav-transform`** | The Ghost-prefix nav scheme (§0·5), A1·2's `|` marker, A1·6's and A1·7's prefix groups. | Owner ruling: Ghost's flat list renders as-is; nothing further is designed. |

**Renamed from the first round.** M-sticky and M-reveal → `header-scroll` · M-disclosure → `accordion` · M-drawer → `nav-drawer` · M-search → `search-overlay` · M-scrollrail → `carousel` · M-progress → `reading-progress` · M-mode → `mode-toggle` · M-hero-probe → not a module, see finding 2. Every no-JS sentence written for those names is discarded in favour of the registry's.

**Two findings for the architect, not new modules.**

1. **A1·16 watches scroll direction and no registry module does.** `header-scroll` is the closest and is what the design declares; the registry's `reveal` is a content module and is not this. Under `header-scroll`'s degradation A1·16 renders its resting state, which is A1·1 Rail in flow — so the no-JS answer is already right. What needs deciding is whether direction-watching is a named state of `header-scroll` or a thirty-second module.
2. **A1·4 must know whether the section below it has a loadable image.** No module inspects a neighbouring section, and the closest is `core`. The design therefore declares this as a server-side precondition rather than behaviour: the template resolves the image before render and picks A1·4 or A1·1. Nothing about that choice needs JavaScript. The related risk — a sticky transparent bar surviving past the hero when the transition module is absent — is on A1·4's own line.

**Edit-safe** means the module does not run while the section is being edited and never writes to authored DOM, so the editor shows the resting state — the category motion rule above, stated as a property of the module. Two designs need an exception and say so on their own line: A1·6's takeover and A1·7's panel are pinned open while their contents are selected, because that is where their authored content lives.

**No-JS baseline.** Composed from the registry sentences above, not from a rule of my own. Nav is a plain stacked link list below the logo with no hamburger; dropdowns, More, the mega panel and A1·6's takeover contents are native `<details>` and remain fully keyboard-operable; search is a real `GET` form; every header renders in its resting state with CSS `position: sticky` intact and no transition; A1·3's nav rail scrolls natively; the reading-progress rule is hidden and the dark-mode toggles fall to `prefers-color-scheme`. In Ghost-prefix nav mode the flat list renders as-is (§0·5, owner ruling). What is lost: the scroll transitions and every state that depends on them, the focus trap, the scroll lock, the inert page, hover intent, click-outside dismissal, typeahead and the manual mode control. Each design states its own outcome on its Behaviour module line.

**Flagged.** The registry, the module names and every no-JS sentence are FR-G7's and FR-G4's, not mine. What is mine in this pass: the reconciliation rulings recorded in §21, the mapping above, the two findings, the edit-safe definition, the two pinning exceptions, the structural-descriptor readings in §19 and the item-count ranges in §20.

---

## 1 · Rail

Logo left, nav inline beside it, actions right, hairline under. The library's baseline; every other design's sticky state falls back to it.

**Descriptor.** The undecorated single row — logo, nav, actions, hairline — and the only design that adds nothing to it; four other designs fall back to this arrangement rather than inventing one.

**Structural descriptor.** `bar · none · page · few · none · hairline and accent underline`

**Archetype.** bar

**Behaviour module.** `header-scroll` (Sticky, Shrink) · `accordion` (child dropdowns, More) · `nav-drawer` (the ≤ 767 drawer) · `mode-toggle` (when its control is On). All edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — so the bar renders complete and navigable at its resting height with the hairline, and Shrink never fires. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — below 767 the four items stack under the wordmark instead of waiting behind a toggle.

**Content fields.** `logo` (image, opt) · `siteTitle` (text, from Ghost, req) · `navItems[]` (link list, opt — Auto shows 4; the fold follows Nav items before More) · `navItems[].children[]` (link list, opt, ≤ 8 per parent, two levels, Authored mode) · `signInLabel` and both action labels/links via P0·4 · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18 chars, optional `ctaLabelShort`) · `moreLabel` · `searchEnabled` (bool, default off) · `darkModeToggle` (bool, opt).

**Controls.**

| Control | Values |
|---|---|
| On scroll | Static · Sticky · Shrink |
| Nav position | Beside logo · Centre · Right |
| Actions | None · Sign in · Subscribe · Sign in + Subscribe (each slot a P0·4 card) |
| Nav items before More | Auto · Four · Five · Six |
| Divider under | Hairline · Shadow · None |
| Search in header | On · Off |
| Dark mode toggle | On · Off (offered only when the project ships both modes) |

**Data.** Primary nav from Ghost; Nav children per §0·5. Empty nav → logo + actions only, full height, hairline kept. Members off in Ghost → both actions hidden, nav unchanged in position.

**Responsive.** 1440–1024 as drawn. 1023–768 is a simple narrowing — bar height holds at 76 (height follows the universal Vertical spacing, never the width), wordmark 19 → 18, mark 26 → 24, padding 72 → 40, nav gaps 28 → 20; both actions stay in the bar and the fold threshold is unchanged, so the four drawn items all survive at 834. ≤ 767 nav to drawer, primary CTA stays in the bar (short label if given), hairline kept, bar height 64 minimum and grows if the wordmark takes two lines.

**Behaviour.** *Shrink*: 76 → 56 px, wordmark 19 → 16, mark 26 → 22, hairline replaced by md shadow, ghost Sign in dropped so the primary action survives. Fires once at 80 px. *Dropdown*: 248 px panel, left-aligned, opens on click and on focus, 160 ms.

**Empty state.** No logo → wordmark text. No CTA → nav gains the space, bar keeps its height. No children on a nav item → no caret rendered.

**Accessibility.** As the category floor. The More trigger is a button with `aria-expanded`; its panel is the same component as a nav dropdown so keyboard behaviour is identical.

---

## 2 · Split Rail

Wordmark centred, nav divided around it, utilities right. Same components, one axis of symmetry.

**Descriptor.** The only design with a centred wordmark and the nav split around it, so the header reads from an axis of symmetry rather than left to right.

**Structural descriptor.** `split · none · page · many · none · axial symmetry`

**Archetype.** split

**Behaviour module.** `header-scroll` (Re-form left, Hide) · `accordion` (More, and the drawer's in-place child expansion) · `nav-drawer` · `mode-toggle`. Edit-safe; Re-form left is the one state in A1 that changes arrangement, and suspending it in the editor means the resting three-column grid is always what the user edits. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the resting split therefore holds for the whole page and neither Re-form left nor Hide fires. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — below 767 the split becomes one stacked list under the centred wordmark. The `|` marker (below) is `nav-transform` and gets no no-JS accommodation (§0·5).

**Content fields.** Shared list. Uses `logo`, `siteTitle`, `navItems[]` (6 shown at ≥ 1024, 3 at 768–1023, overflow folds to More — 1–3 left, 4–6 right), `children[]`, `ctaLabel`/`ctaUrl`, `signInLabel`, `searchEnabled`, `moreLabel`.

**The `|` marker.** In Ghost navigation, a marker item whose label is `|` (URL `#`, ignored) splits the row: items before it sit left of the wordmark, items after sit right. **The marker wins when present; the Split control (Even · Weight left · Weight right) is the no-marker fallback** — that precedence is the rule, stated in the sidebar whenever a marker is in force ("Split set by the | item in Ghost navigation"). Declared under **ARCHITECT: `nav-transform`** (§0·5); without JS the flat list renders as-is, marker visible — nothing further designed, by owner ruling.

**Controls.**

| Control | Values |
|---|---|
| Wordmark size | Small · Medium · Large |
| Split | Even · Weight left · Weight right (fallback when no `\|` marker) |
| Right cluster | Subscribe · Search + Subscribe · Search only · Sign in + Subscribe · Sign in only · Hidden |
| On scroll | Static · Re-form left · Hide |
| Hairline under | On · Off |
| Dark mode toggle | On · Off |

Search on this design lives inside the Right cluster values — stated in the sidebar; there is no separate toggle. The two new cluster values put `signInLabel` on the desktop bar at last — before this pass it silently lived in the drawer even on desktop.

**Data.** Ghost nav, split by index or by marker. Odd counts weight left; at 5 items "Even" is not achievable and degrades to Weight left, stated in the sidebar. 0 items → centred wordmark alone at Comfortable height.

**Responsive.** 1440–1024 three-column grid. 1023–768 even narrowing, items 4+ to More. ≤ 767 hamburger left / wordmark centre / search right; the CTA moves to the drawer and pins to its foot on a hairline, because a centred wordmark and a button cannot share a 390 bar without one dropping below its floor. In the drawer, children expand in place beneath their parent (indented against a hairline, body size, accent caret) rather than sliding to a second panel; opening one parent collapses any other.

**Behaviour.** *Re-form left*: on scroll the header becomes A1·1 Rail at 58 px — logo left, nav single-file. This is the only structural change on scroll permitted anywhere in the library, and it is why Rail is design 1.

**Empty state.** No CTA and no search → nav splits 3/3 and the right column holds nothing; the grid keeps the wordmark optically centred rather than re-centring on content.

**Accessibility.** DOM order is logo → nav → utilities regardless of the visual split, so focus never zig-zags across the wordmark. One nav landmark containing both halves, not two.

---

## 3 · Stacked Masthead

Masthead row (date · wordmark + tagline · actions) over a ruled nav row. The nav row detaches on scroll and carries the reading-progress rule. A1's one display moment.

**Descriptor.** The only design whose lower tier is a full-width nav row that detaches from the masthead on scroll and carries the reading-progress rule.

**Structural descriptor.** `stack · none · page · many · none · display wordmark between rules`

**Archetype.** stack

**Behaviour module.** `header-scroll` (Nav row sticks, Whole header sticks) · `reading-progress` (post and page templates only) · `carousel` (the ≤ 1023 nav rail) · `accordion` · `nav-drawer` · `mode-toggle`. Edit-safe; `reading-progress` reads scroll position and writes only into its own 2 px rule. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — both sticky settings survive, but the pinned row does not gain the wordmark, because that swap is the module's. "The bar is hidden entirely (it is decorative)." "The slide track is a native horizontally-scrollable `scroll-snap` strip — fully usable, only dots and arrow buttons are hidden." — the rail keeps its CSS edge fade. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list plus `tagline` (text, opt, ≤ 48 chars, defaults to Ghost's site description — plain-text-locked while bound; editing the override is inline) and `dateLine` (bool, surfaced as the Date control) with `dateMode` (Site timezone · Custom) and `customDate` (date, via the Date Picker). `navItems[]` max 8 here — the row is full-width.

**Controls.**

| Control | Values |
|---|---|
| Masthead height | Compact · Comfortable · Spacious (one tier, not the section — kept distinct from Vertical spacing) |
| Nav row | Centred · Left · Justified |
| On scroll | Static · Nav row sticks · Whole header sticks |
| Rules | Hairline · Double · None |
| Tagline | On · Off |
| Date | Show · Hide |
| Date shown | Site timezone (default) · Custom date (Date Picker) |
| Reading progress | On · Off (post and page templates only; disabled elsewhere with the reason shown) |
| Search in header | On · Off |
| Dark mode toggle | On · Off |

**The date.** Site timezone renders today's date in Ghost's site timezone, formatted for the site locale, **computed client-side by `core`'s date stamp — never server-rendered**, because a server-rendered "today" goes stale under page caching. Custom date renders the picked date as authored. **A visitor-local browser date is deferred by owner ruling — Site timezone and Custom are the full value set.** Without JS the Site-timezone date is absent (it is decoration, not content); Custom renders, being server-rendered content.

**Data.** Ghost nav for the row; tagline from Ghost's description unless overridden. Empty nav → both rules and the nav row are removed, leaving the masthead alone. Reading progress requires a post context.

**Responsive.** 1440–1024 as drawn. 1023–768 **re-arranges**: the date line and both actions leave the masthead row (to the drawer), the wordmark centres alone, and the nav row becomes a horizontally scrolling rail with a fade at its right edge — six equal magazine sections have no obvious sixth-place item to hide, so nothing folds to More. ≤ 767 wordmark 23 px, rail shows two items, drawer holds the rest plus date and actions.

**Behaviour.** *Nav row sticks*: masthead scrolls away with the page, nav row pins at 52 px and gains the wordmark at body size so the site name is never off-screen. Progress is a 2 px accent rule on the pinned bar's bottom edge.

**Empty state.** No tagline → wordmark sits alone, masthead height unchanged (the space is the design, not the text's). Date hidden → left cell empty, wordmark stays optically centred.

**Accessibility.** Wordmark is the site link, not an `<h1>`, on every template except home. Tagline is a `<p>`. The date is a `<time>` with a machine datetime. The scroll rail is keyboard-scrollable and no item is reachable by focus while clipped from view — focus scrolls it into the rail.

---

## 4 · Overlay

Rail's arrangement with no ground of its own, sitting on the first section's image; solidifies once the hero passes.

**Descriptor.** The only design with no ground of its own — it renders on the image of the section beneath it, and the only one whose existence depends on another section's content.

**Structural descriptor.** `overlay · none · transparent · few · background · scrim and inverted lockup`

**Archetype.** overlay

**Behaviour module.** `header-scroll` (Solidify) · `accordion` · `nav-drawer` · `mode-toggle`. The hero probe is **not a module**: no registry module inspects a neighbouring section, so the precondition is resolved server-side before render and the editor shows its outcome — A1·4 over a loadable image, A1·1 without one — as a structural choice (§0, second finding). Edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the transparent state renders over a server-checked hero and Solidify never fires; because `position: sticky` still works, a pinned transparent bar can outlive the hero it was contrast-checked against, which is a consequence of the registry's degradation and a finding for the architect rather than a fallback I may write. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list plus `logoLight` (image, opt) — a second logo file for dark imagery. If absent, "Header colour on image: Light" renders the wordmark as text rather than tinting the user's file.

**Controls.**

| Control | Values |
|---|---|
| Scrim | None · Subtle · Strong |
| Header colour on image | Light · Dark · Match pack |
| On scroll | Stay transparent · Solidify to surface · Solidify to contrast |
| Drawer | Full screen · Sheet |
| Actions in bar | On · Off (moves both to the drawer) |
| Nav items before More | Auto · Four · Five · Six |
| Search in header | On · Off |
| Dark mode toggle | On · Off |

Background role is **locked** here, with the reason shown: transparent over the hero is this design.

**Data.** Ghost nav as elsewhere. **Depends on the section below it:** if the first section has no image, or its image fails to load, the header renders as A1·1 Rail on the pack's surface and the sidebar says so. No transparent header over a flat pack colour.

**Responsive.** 1440–768 transparent, nav folds per the fold control. ≤ 767 wordmark + toggle only; both actions move to the drawer foot.

**Behaviour.** *Solidify*: crossing the hero's bottom edge the bar takes `background` at 94 % with the md shadow, the logo mark returns to `accent`, the inverted button becomes the standard accent button, height 76 → 64. One transition, no in-between. *Drawer*: full-screen on the `contrast` token — the only use of contrast in A1 — so the drawer never has to solve legibility against the image behind it.

**Empty state.** No hero image → falls back to Rail (above). No CTA → nav gains the space; the scrim is unchanged, since it serves the hero text as well as the header.

**Accessibility.** AA is checked against the **scrimmed** image, not the raw image. Subtle is the minimum that passes at the drawn crop; choosing None disables the Light/Dark auto-pick and warns. The accent is deliberately absent from the transparent state because a pack accent is not guaranteed to hold contrast over an arbitrary photograph — the inverted action uses the pack's lightest surface instead.

---

## 5 · Floating Pill

A capsule on `surface`, inset from three sides, with the page ground visible around it. Rail's contents held in an object. The only design with a shadow at rest.

**Descriptor.** The only design that is a detached object rather than a band — a capsule inset from three sides with the page ground visible around it, and the only header carrying a shadow at rest.

**Structural descriptor.** `bar · pill · surface · few · none · detached capsule, resting shadow`

**Archetype.** bar

**Behaviour module.** `header-scroll` (Stick, Stick and narrow) · `accordion` · `nav-drawer` · `mode-toggle`. Edit-safe; the inset, radius and shadow are CSS, so the editor shows the design with the modules idle. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the pill holds 68 px and its gutter width, and the narrowing, the inset change and the 94 % ground do not happen. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — the stacked list inherits the pill's surface and inset.

**Content fields.** Shared list, no additions.

**Controls.** Pill width (Narrow · Page gutter · Edge to edge) · On scroll (Static · Stick · Stick and narrow) · Lift (Flat · Subtle · Lifted) · Actions (None · Sign in · Subscribe · Sign in + Subscribe) · Nav items before More (Auto · Four · Five · Six) · Search in pill (On · Off) · Dark mode toggle (On · Off). Background role sets the page ground around the capsule; the capsule stays `surface` — that is the design.

**Data.** Ghost primary nav. Empty nav → the pill shrinks to logo + actions and stays centred at Page-gutter width. Members off → both actions hidden; with no actions and no search the pill narrows to its content, the one case where it stops tracking the page gutter.

**Responsive.** 1440–1024 inset 20/72. 1023–768 narrows only: inset 16/32, gaps 26 → 18; height, search, both actions and the fold threshold hold. ≤ 767 inset 12/12, height floor 60, nav and Sign in move to the drawer, short CTA label stays in the pill; the drawer inherits the pill's surface, border and inset — the only drawer in A1 that does not touch the screen edges.

**Behaviour.** *Stick and narrow*: pill pulls to 74 % of the gutter, top inset 20 → 12, height 68 → 56, ground to 94 % opacity, search and ghost action drop. The shadow does not change — it was already there.

**Empty state.** No logo → wordmark alone. No CTA → nav gains the room, height unchanged. Minimum pill width 240 px; below that it carries the wordmark only.

**Accessibility.** Skip link sits over the page ground above the pill, not inside it, where the capsule would clip it. Focus rings are drawn inside the pill for the same reason. Contrast is checked against the pill's `surface`, not the page `background`. Narrowing on scroll does not reorder the DOM.

**Flagged.** The full-round outer corner overrides the pack radius token — the only such override in A1. Inner elements still take the token.

---

## 6 · Drawer-First

No nav in the bar at any width: wordmark, labelled Menu button, search, one action, and a takeover holding the whole navigation at display size.

**Descriptor.** The only design with no nav in the bar at any width — navigation exists solely as a display-size takeover, which is why it is the only design with no cap on items.

**Structural descriptor.** `overlay · none · surface · variable · inline · display-size type, full surface`

**Archetype.** overlay

**Behaviour module.** `nav-drawer` (the takeover: open and close, focus trap, page inert, scroll lock, Menu → Close) · `accordion` (children inside the takeover) · `mode-toggle` · `search-overlay` (the bar's search affordance). No `header-scroll` — this design has no scroll control. Ghost-mode takeover columns are **ARCHITECT: `nav-transform`** (§0·5). Edit-safe with a deliberate exception: the takeover is **pinned open** while any of its content is selected, since all the authored navigation lives there. **JS off:** "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — so there is no takeover and no Menu button; the whole navigation renders as a stacked link list below the wordmark, with the secondary list and the featured post following it in the same flow, both being server-rendered content rather than module output. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." keeps the children openable inside that list. In Ghost-prefix mode the flat list renders as-is (owner ruling, §0·5). This is the widest gap between designed and degraded state in the category, and it is the registry's answer rather than a failure — noted for the architect.

**Content fields.** Shared list — the only design that uses all of it, with no cap on `navItems`, both levels of children, `secondaryNav`, `socialLinks`. Adds `featuredPost` (bound via the Data group), `featuredHeading` (text, default "Latest", editable inline), `menuLabel` (default "Menu"), `closeLabel` (default "Close").

**Controls.**

| Control | Values |
|---|---|
| Menu button | Icon + label · Label only · Icon only |
| Takeover | Full page below bar · Panel from right · Panel from left |
| Takeover ground | Surface · Contrast |
| Featured post in menu | On · Off |
| Show date | On · Off (on the featured post) |
| Show excerpt | On · Off (on the featured post) |
| Subscribe in bar | On · Off |
| Search in header | On · Off — the 38 px icon button beside Subscribe and Menu |
| Dark mode toggle | On · Off (a switch row above the takeover's secondary links) |

**Data.** The featured-post block populates from the **P0·5 panel in single-post mode: Latest · Featured · By tag · By author · Hand-picked** — "Latest post · Chosen post" was the same idea with a private vocabulary and is replaced. 0 posts → the block is dropped and the columns re-centre. Primary nav fills column one, secondary nav the row beneath column two. **Empty primary nav → the Menu button is not rendered at all** — a takeover with nothing in it is a dead end — and the bar becomes wordmark + search + action.

**The Ghost-mode takeover.** With Nav children = From Ghost navigation, the takeover builds entirely from the prefix scheme: **`+` labels become the column headlines** ("Sections", "More"), their `-` children the column rows; **up to five such columns** — more than three hides the latest-post column; **past five, remaining groups fold under the last column**; **unprefixed labels render as plain links** (Newsletter, Membership, Privacy), replacing the secondary-nav row. Lists are read-only in the sidebar ("Edit navigation in Ghost"). Declared under **ARCHITECT: `nav-transform`**; no no-JS accommodation beyond the flat list (§0·5).

**Responsive.** Closed: 1440–768 narrowing only, height, search and both buttons hold; ≤ 767 wordmark 17, short CTA label, the search icon becomes the 44 px target, Menu keeps its label at 13 px. Open: two section columns ≥ 1024; one column at 834 with the featured post beneath the list; at ≤ 767 one column, items 30 → 25, secondary links become a wrapping row on a hairline, and the featured post is **dropped** — the only content this design drops rather than relocates, stated in the sidebar.

**Behaviour.** Takeover keeps the bar in place and fills the rest with `surface` (or `contrast`); Menu becomes Close (`menuLabel` → `closeLabel`); the rules cross-fade with the label rather than morphing into an X. Opens on click only, never on hover.

**Empty state.** No featured post → columns re-centre. No secondary nav → the second column holds sections only.

**Accessibility.** `aria-expanded` + `aria-controls` on the toggle, its accessible name changing `menuLabel` → `closeLabel` with no aria-label overriding visible text. Focus moves to the search field on open (or the first nav item), is trapped, and returns to the toggle on Escape; the page behind is inert. One `nav` containing two labelled lists, then the secondary list, then the featured post as its own region — column layout is CSS, never DOM order. Display-size rows are full-width targets with a 44 px minimum height.

---

## 7 · Mega Bar

Rail's bar with a full-width panel behind it: children in columns with descriptions, a grandchild group indented under any child that has one. The resting bar is the primary frame.

**Descriptor.** The only design that expands into a full-width panel of bound or authored columns with descriptions and grandchild groups, instead of a 248 px dropdown.

**Structural descriptor.** `bar · none · page · many · edge · full-width panel behind bar`

**Archetype.** bar

**Behaviour module.** `accordion` (the panel: click, Enter, 120 ms hover intent on fine pointers, 200 ms leave delay, no focus trap — hover intent only when Panel opens on = Hover and click) · `header-scroll` (Sticky, Shrink) · `nav-drawer` · `mode-toggle`. Ghost-nav columns are **ARCHITECT: `nav-transform`** (§0·5). Edit-safe with the same pinning exception as A1·6: the panel is held open while its columns are edited, and hover intent is off in the editor so it never opens under the pointer. **JS off:** "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." — the panel opens on click or Enter with every column, second line and grandchild group present, and bound columns are rendered server-side so it carries the same posts; hover intent, the leave delay, click-outside and Escape are gone. "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — and below 767 there is no panel in any case.

**Content fields.** Shared list plus `panelTags` (tag list, opt), `featuredPost` → the rail's binding (Data group), `railHeading` (text, default "Latest", editable inline), `byTopicHeading` (default "By topic", editable inline), `byAuthorsHeading` (default "By authors", editable inline), and `panelColumns[]` — the per-column binding record: `{title, source, tagOrAuthor, navGroup, order, count, secondLine, footLink, whenEmpty, links[]}`. Uses `children[].description` (≤ 60 chars) and grandchildren (≤ 6 per child) — the design where both earn their place.

**Controls.** Panel width (Full bleed · Page gutter · Under trigger) · Columns (Two · Three · Four) · Second line (Show · Hide) · Panel opens on (Click only · Hover and click) · On scroll (Static · Sticky · Shrink) · Nav items before More (Auto · Four · Five · Six) · Search in header (On · Off) · Dark mode toggle (On · Off).

**Second line, defined.** One section value. On **authored** columns the second line is `children[].description`, editable inline with P0·1. On **bound** columns it is post data — the date, or the excerpt, per the column's Second line field — plain-text-locked, **never editable**. Hide removes the line everywhere and the panel loses half its height.

**Data block (the sidebar's Data group).** The panel's columns — reorderable, addable up to the Columns setting (P0·3 authored-list rules; a new column arrives titled "New column", Fill with = Authored links, three placeholder rows) — with the selected column's binding beneath it:

| Field | Values |
|---|---|
| Column title | free text, editable inline; defaults to the tag, author or nav-group name |
| Fill with | Authored links · **From Ghost Nav (prefix group)** · Posts in a tag · Posts by an author · Latest posts · Tag list |
| Nav group | (Ghost Nav fill) which `+` group; **up to two prefix columns — extra prefixed groups list under the second** |
| Tag / Author | Ghost picker showing each option's post count |
| Order | Newest · Oldest · Featured first |
| Show | Three · Four · Six |
| Second line | Date · Excerpt · None (bound columns; authored columns use descriptions) |
| Foot link | Tag archive · Custom link · None — label carries the real count ("All {n} in series") |
| If the tag is empty | Hide column · Show fallback |

**The default panel, re-cut.** The SERIES column's default is now a **Ghost-nav-driven column** (the "Writing" pattern: a `+` group's children as rows); the tag-driven series fill remains a listed option. **When a column is filled with posts, each post carries its date in a smaller line** (13 px, `text-muted`). The **"All 12 in series" foot-link style is kept and reused**: BY TOPIC closes with "All {n} tags", the authors block with "All authors" (catalog strings, §0·7). **BY TOPIC** (tags ranked by post count, headline editable inline) gains a sibling: **BY AUTHORS** below it — authors ranked by post count, avatar + name rows, headline editable inline. **The rail post populates from the full P0·5 sources** (Latest · Featured · By tag · By author · Hand-picked) under its editable `railHeading`.

One source per column; a column never mixes authored links with bound posts, because sort order cannot be defined across both. A bound column renders posts in the same shape as an authored one — title 15 px, meta 13.5 px — so the reader cannot tell which is which. Bindings are stored with the content, so switching to A1·1 renders the same bound posts as a flat dropdown list.

**Data.** Ghost primary nav in the bar; authored columns from Inflozo, bound columns from Ghost per the Data block above; the tag and author blocks read Ghost with count-capped foot links; the rail reads its P0·5 binding. **0 children → a plain link, no caret. 1 child → a 248 px dropdown, not a panel.** A bound column whose tag has 0 published posts hides and the remaining columns re-flow (or shows its fallback line, by setting). 0 posts on the site → rail dropped.

**Responsive.** ≥ 1024 columns as set plus a fixed 300 px rail divided by a hairline. 768–1023 all columns stack in order with their grandchild groups intact, divided by hairlines; the rail and featured post are dropped; the bar keeps every item and its fold threshold, losing only search and the ghost Sign in. ≤ 767 **no panel at all** — the drawer carries children with their second lines at 13 px and a caret for grandchildren.

**Behaviour.** Panel is full-bleed `surface`, hairline above, md shadow below; the bar's own hairline disappears while it is open. Opens on click, on Enter, or — when Panel opens on = Hover and click — on hover after 120 ms of intent (fine pointers only). Closes on click outside, Escape, pointer leaving bar and panel for 200 ms, or another trigger opening — never while focus is inside it.

**Empty state.** Second line hidden or unwritten → titles tighten to a 14 px row list and the panel loses half its height.

**Accessibility.** Focus is **not** trapped: Tab moves through the panel and on to the next bar item, because a mega panel is an expansion of the page, not a modal. Column eyebrows are the lists' headings. Grandchildren are a nested `ul` inside their child's `li`, always visible when the panel is — never a hover-revealed flyout. Each link's accessible name is title plus second line as one string, not `aria-describedby`.

---

## 8 · Utility + Nav

A 38 px utility strip above the main bar: secondary links, social, an optional editorial note. The first design to render Ghost's secondary navigation in the header.

**Descriptor.** The only design with a second, thinner tier above the bar on its own ground, carrying secondary nav, social and a note.

**Structural descriptor.** `stack · none · surface · many · none · tier ground change`

**Archetype.** stack

**Behaviour module.** `header-scroll` (Main bar sticks, Whole header sticks) · `mode-toggle` (no longer in the strip — see below) · `accordion` · `nav-drawer`. Edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — *Main bar sticks* therefore survives intact, since CSS `position: sticky` on the lower tier alone is exactly the specified behaviour. "`prefers-color-scheme` still drives Auto mode entirely in CSS (FR-E4); only the manual override control is hidden." "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." Both tiers stay fully navigable.

**Content fields.** Shared list plus `stripNote` (text, opt, ≤ 40 chars, editable inline) and `stripItems[]` (authored strip links, Authored mode). Renders `secondaryNav[]` (capped 5) and `socialLinks[]` (capped 3, bound per §0·8) in the strip.

**Controls.**

| Control | Values |
|---|---|
| Strip source | From Ghost secondary nav (read-only rows) · Authored |
| Strip content | Links · Links + social · Links + note + social |
| Strip ground | Surface · Background · Contrast (the strip tier, not the section — kept distinct from Background role) |
| Nav position | Beside logo · Centre · Right |
| On scroll | Static · Main bar sticks · Whole header sticks |
| Divider under | Hairline · Shadow · None |
| Search in header | On · Off |
| Dark mode toggle | On · Off |

**The strip's toggle is gone.** The former "…+ mode" Strip-content value is removed: `mode-toggle` leaves the strip. When Dark mode toggle = On it renders as the standard 38 px icon button in the **main bar's** action cluster and as the drawer's switch row — the owner's line moves it "to the drawer", which covers ≤ 767; the bar placement is the §0·4 default filling the desktop gap, recorded in §21.

**Strip source.** *From Ghost secondary nav*: read-only rows, "Edit navigation in Ghost", never an Add button (P0·3 Ghost-list card). *Authored*: a full P0·3 item list — **add items on either side by reorder**, each row `{label, url}`, label editable inline (P0·1), link via the Link Picker; a new item arrives as "New link" → `/`. Caps and shed order unchanged in both modes.

**Data.** Strip links per Strip source; social from Ghost's account fields (§0·8) plus authored extras. **Empty strip (no links, no social, no note) → the strip is not rendered and the design degrades to Rail**, stated in the sidebar.

**Responsive.** ≥ 1024 both tiers full. 768–1023 the strip sheds social, then the note, keeping links; the bar loses search and the ghost action. ≤ 767 the strip is removed entirely and its contents move into a labelled group in the drawer, with the mode toggle as a switch row; the note is dropped. Strip height 38 and bar height hold at every width above the drawer.

**Behaviour.** *Main bar sticks*: the strip scrolls away with the page and does not return until the reader is back at the top; bar 74 → 60, wordmark 19 → 16, hairline to md shadow.

**Empty state.** A strip with one link renders as one link — it does not stretch or centre.

**Accessibility.** Two navs, two names: `aria-label="Secondary"` on the strip, `"Primary"` on the bar, one `header` around both. Focus order is top tier first, which makes the skip link mandatory here rather than merely required. 13 px `text-muted` on `surface` is the lowest-contrast pair in the design and every pack must clear AA at it or the strip falls back to `text`. The mode toggle (in the bar, when On) is a button with `aria-pressed` and the name "Dark mode", never a glyph alone, in sync with the drawer's switch. Scrolling away is not removal from the tree or the tab order.

**Flagged.** The shed order (social, then note), the 5/3 caps, and the assumption that an announcement bar may sit above a utility strip — with A2 taking `contrast` so three bands read as three — are mine. A2 decides the last one.

---

## 9 · Search-Forward

A persistent search field between the nav and the actions, taking the slack in the bar.

**Descriptor.** The only design with a persistent search field in the bar at every width, sized by whatever slack the nav and actions leave — and the only one where search survives the mobile collapse.

**Structural descriptor.** `form · none · page · few · none · field takes the slack`

**Archetype.** form

**Behaviour module.** `search-overlay` (the query surface: 200 ms debounce, 3-character minimum, suggestion rows, recent-query store, combobox keys, live count — **client-side over the Content API; never a `/search/` page that pretends to render results server-side**; the registry's degradation form posts to `/search/`, which is the A23 surface itself and stays client-rendered, so the round trip lands the reader on the same client-side surface with the query prefilled) · `accordion` · `nav-drawer` · `mode-toggle`. Not `search-expand`: the field is persistent here and never expands from a trigger. Edit-safe — the suggestion panel never opens in the editor (results states are reached with the P0·6 state switcher: no query / results / no matches), so the frame being edited is the resting empty field. **JS off:** "The trigger is a real `<form action="/search/" method="get">`, so search submits as a normal page navigation." — one round trip instead of typeahead, with no suggestions, no recent queries, no most-read fallback and no live count; the placeholder keeps its server-rendered archive size.

**Content fields.** Shared list plus `searchPlaceholder` (text, opt, ≤ 40 chars; defaults to "Search N essays and interviews" with the live post count). `searchEnabled` is **forced on and shown locked with the reason** — the field is the design.

**Controls.**

| Control | Values |
|---|---|
| Field position | After nav · Before nav · Second row |
| Field width | Compact · Takes the slack · Wide |
| Field treatment | Outlined · Filled · Underlined |
| Suggestions | Recent, then results · Results only · Off |
| Results at a time | 5 · 8 · 10 |
| Search in | Titles and excerpts (default) · Full content |
| Match highlight | Marked · Plain |
| Result meta | Show · Hide (section · author · date under each title) |
| Actions | None · Sign in · Subscribe · Sign in + Subscribe |
| Dark mode toggle | On · Off |

**Data.** Queries run client-side over the Content API against the Search-in scope, debounced 200 ms, minimum 3 characters, the Results-at-a-time count plus a "See all results" row into the A23 surface. Matched substrings render `<mark>` when Match highlight = Marked. Recent queries are local to the reader; a first-time visitor gets the site's three most-read posts instead. 0 results → one line, "No matches for '…' — try a tag" (catalog string), plus the tag list. Under 20 posts on the site → the placeholder drops to plain "Search".

**Responsive.** ≥ 1024 one row, field 240 px minimum. 768–1023 the field moves to a full-width second row and the header becomes two tiers; nav, both actions and the placeholder are unchanged. ≤ 767 the field keeps its second row in the bar — the only design where search survives the drawer collapse — and is focused on open in the drawer, where results push the nav list down rather than replacing it.

**Behaviour.** Suggestions align to the field and never exceed its width. The page dims behind the panel but does not scroll or become inert. Escape has two steps: close the panel keeping the query, then clear.

**Empty state.** No recent queries and no typing → most-read posts. Field never narrower than 240 px; below that the design falls back to the second row.

**Accessibility.** The field sits in its own `search` region with a visually hidden label — the placeholder carries the archive size and a placeholder is not a label. Combobox semantics: `aria-expanded`, `aria-activedescendant` for arrow-key selection, and a polite live region announcing the result count. `<mark>` highlighting is visual only and does not fragment the accessible name. Each row's accessible name is title, section, author, date (the Result meta fields; hiding them visually does not remove them from the name). Hit area 44 px; clear button named "Clear search". Focus order is logo → nav → search → actions at every width.

**Flagged.** The 200 ms debounce, 3-character minimum, 240 px floor and the most-read fallback are mine; the result-count, scope, highlight and meta controls are the owner's.

---

## 10 · Contrast Band

Rail's arrangement on the `contrast` token. The structure is settled; the design is the answer to what the accent does on an inverted ground.

**Descriptor.** The only design on the `contrast` token, where the accent's usual jobs are reassigned to other tokens rather than recoloured.

**Structural descriptor.** `bar · none · contrast · few · none · inverted ground`

**Archetype.** bar

**Behaviour module.** `header-scroll` (Sticky, Shrink) · `accordion` · `nav-drawer` · `mode-toggle`. Edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the band renders exactly as drawn, since the three substitutions and the 76 % muted floor are CSS; sticky stays opaque, which is what the module would have done anyway, and Shrink does not fire. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." — dropdowns still open on the light surface over the page. "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." — the stacked list continues the band's contrast ground.

**Content fields.** Shared list. Uses `logoLight` — an image logo on the band needs its inverted file; without one the wordmark renders as text rather than being tinted.

**Controls.** Band width (Full bleed · Page gutter) · Nav position (Beside logo · Centre · Right) · Primary action (Surface fill · Outline · Accent) · On scroll (Static · Sticky · Shrink) · Nav items before More (Auto · Four · Five · Six) · Search in band (On · Off) · Dark mode toggle (On · Off). Background role is **locked**, with the reason shown: the contrast band is this design.

**Data.** Identical to Rail. No data of its own.

**Responsive.** 1440–1024 as drawn. 1023–768 narrowing only — wordmark 18, mark 24, padding 40, gaps 18, search button leaves; height, both actions and the fold threshold hold. ≤ 767 nav to drawer; the drawer continues the band's contrast ground and Subscribe stays in the bar as a surface fill.

**Behaviour.** Sticky **stays opaque** — the only design that does not drop to 94 %, because a near-black band at 94 % over moving text turns to mud. It takes a deeper shadow instead. Height 76 → 56 on Shrink.

**Three substitutions, and no others.** Logo mark takes `surface` instead of `accent`; the primary button becomes a surface fill with contrast-coloured text; the active underline uses the pack's *opposite-mode* accent, already tuned for a deep ground. Muted text is surface at 76 %, not a new token. The dropdown keeps the light surface and opens over the page, ignoring the band.

**Empty state.** No image logo → wordmark in surface colour. Empty nav → band holds logo and actions at full height; a contrast band reads fine with two items in it.

**Accessibility.** 76 % is the muted floor (8.1:1 on Paper); a pack that cannot meet it renders muted items at full surface. "Primary action: Accent" is **disabled where it fails** — Paper measures 3.1:1 — and the sidebar shows the number. The focus ring on the band is always `surface`, never accent, and takes a band-coloured gap over a surface fill; off the band it returns to accent. The band is not a colour scheme: `color-scheme` stays as the site's, and forced-colours mode gets system colours plus a real border.

**Flagged.** The 76 % opacity, the stays-opaque rule, the opposite-mode accent underline, and the schema requirement that **`contrast` be defined per mode in every pack** — near-ink in light, pale warm neutral in dark. Confirm before the 12 packs are built.

---

## 11 · Side Rail

A fixed 240 px column at the left: logo top, nav as rows, actions pinned to the foot. It changes the page's layout rather than sitting on top of it, and it exists only at 1200 and wider.

**Descriptor.** The only design that is a vertical column instead of a horizontal band, and the only one that takes width out of the page layout rather than sitting above it.

**Structural descriptor.** `edge rail · none · page · many · top · column occupies page layout`

**Archetype.** edge rail

**Behaviour module.** `accordion` (the side panels — and, with Children open = Below the parent, the in-place expansion: open sideways or expand beneath, close on Escape, on leaving both, and on scroll) · `nav-drawer` (below 767, inherited with the handoff to Rail) · `mode-toggle`. No `header-scroll` — a fixed rail does not answer scroll — and the 1200 handoff is a media query, not a module. Edit-safe. **JS off:** the rail is CSS layout and is unaffected; column, rows, pinned foot actions and the handoff to Rail below 1200 all hold. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." — panels open natively but no longer close on scroll, so a panel can lose its anchor while the page moves beside it; that is the one real loss here, and Below-the-parent expansion avoids it entirely. "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list. Highest cap in the category: **7 nav items** shown, items 8+ fold to a More row, because a fixed column has vertical room a bar does not.

**Controls.**

| Control | Values |
|---|---|
| Rail width | Narrow 200 · Comfortable 240 · Wide 280 |
| Rail side | Left · Right |
| Actions | Pinned to the foot · Under the nav |
| Icons | Off · Shown — when Shown, a P0·2 icon slot before each menu item (Icon Picker; empty slots render nothing on the live site) |
| Children open | Separate panel (as drawn) · Below the parent |
| Becomes a top bar | Early 1400 · Standard 1200 · Late 1024 |
| Search in rail | On · Off |
| Dark mode toggle | On · Off |

The former "Rail ground" row was the universal Background role wearing a local name and is removed (§0·1); its Contrast value is withdrawn with it — see §21. The universal Vertical spacing row is disabled here with the reason shown: a rail has no height.

**The active row, re-cut.** The 2 px leading accent bar is **removed** — the owner ruled this class of ornament out. The active state is now **full-strength label (`text`) at 500 weight on the hover surface**; hover on other rows is the same fill with the label staying `text` at 400. `aria-current="page"` is kept, and the weight change means the state was never colour-only. The accent budget in this design drops to the logo mark and the primary action.

**Children open.** *Separate panel*: the 248 px panel opening to the side, as drawn. *Below the parent*: the in-place expansion reusing **Split Rail's drawer pattern** — children indented against a hairline beneath their parent row, body size; **opening one parent collapses the other**. No panel exists in this mode, and the close-on-scroll rule is moot.

**Data.** Ghost primary nav as rows; children per Children open, two levels (Authored mode). Empty nav → the rail keeps its width and holds logo, search and actions, because the page layout depends on it.

**Responsive.** ≥ 1200 the rail. **1199 and below the design becomes A1·1 Rail** — rows to inline items, active row treatment to the underline, panel or expansion opens downward, foot actions rejoin the bar, cap folds 7 → 4 with items 5+ in More. ≤ 767 Rail's drawer. The sidebar states which design is in force at the previewed width. Icons chosen for rows travel into Rail's inline items as Small leading icons.

**Behaviour.** Rail is fixed; the page scrolls beside it and the rail never scrolls. The side panel overlaps the page rather than pushing it, never covers its own row, and closes on Escape, on leaving both, or on scroll — a fixed panel over scrolling text loses its anchor.

**States.** The whole 220 px row is the target. Hover fills it with the hover surface; the active row is the same fill with the label at full strength and 500 weight — hover and active differ by the label alone. The primary action is full-width here, since a 240 px column has no right side for it to sit on, with the ghost action as centred text beneath it.

**Empty state.** No CTA → the foot holds the ghost action alone, still pinned. No logo image → wordmark, wrapping to two lines if it must; two lines are comfortable at this width.

**Accessibility.** Source order is header-first regardless of Rail side — "Right" is a visual swap only. The skip link is mandatory and lands on the reading column. `aria-current="page"` on the active row — the weight-plus-fill treatment is not colour-only, and the attribute states it outright. Row icons are `aria-hidden` decoration (P0·2). At 200 % zoom a 1440 viewport is effectively 720, so the design has already handed off to Rail and cannot crowd the text; that is why the threshold is 1200 rather than lower.

**Flagged.** The 1200 threshold, the 7-item cap, the three rail widths, and the decision that this design **becomes another design** below its threshold instead of inventing a narrow-rail variant. The last of those matters most: it establishes that library designs may hand off to one another. Confirm before A2.

---

## 12 · Boxed

A hairline box aligned to the content column, so the nav's left edge is the headline's left edge.

**Descriptor.** The only design bounded by a box measured to the content column, so the nav's left edge and the body text's left edge are the same line.

**Structural descriptor.** `bar · box · transparent · few · none · box on content column`

**Archetype.** bar

**Behaviour module.** `header-scroll` (Stick and fill, Hide) · `accordion` · `nav-drawer` · `mode-toggle`. Edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the box stays sticky in its resting treatment and does not fill, so on a page set to *Stick and fill* body text runs visibly under a hairline box; the no-JS-safe setting is Box treatment = Filled or Both, and no invented fallback replaces the registry's answer. *Hide* does not fire, and the 74 px scroll padding is CSS and survives. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list, no additions. Children two deep.

**Controls.** Box width (Content column · Page gutter · Narrow) · Box treatment (Hairline · Filled · Both) · Nav position (Beside logo · Centre · Right) · Actions (None · Sign in · Subscribe · Sign in + Subscribe) · On scroll (Static · Stick and fill · Hide) · Nav items before More (Auto · Four · Five · Six) · Search in header (On · Off) · Dark mode toggle (On · Off). No radius control — the box takes the pack token exactly, which is what distinguishes it from A1·5. Background role is **locked**, with the reason shown: the box sits on the page ground; its fill is the Box treatment control.

**Data.** Identical to Rail. Empty nav → the box holds logo and actions and keeps its width, which comes from the content column, not its contents.

**Responsive.** 1440–1024 inset 28/120 on the content column. 1023–768 narrowing only: inset 22/40, gaps 16, search leaves; height, radius, both actions and the fold threshold hold. ≤ 767 inset 14/16, height 62, nav to drawer; the drawer inherits the box's inset, hairline and radius and fills with surface.

**Behaviour.** *Stick and fill*: the box fills with `surface` and takes the md shadow — at rest it is transparent with a hairline, so without a fill the page would run visibly underneath. Top inset 28 → 14, height 72 → 60, search and ghost action drop. It keeps the content-column width while stuck, staying aligned with the text behind it.

**Empty state.** No CTA → nav gains the room. The box never shrinks to fit its contents; the alignment with body text is the design.

**Accessibility.** The box is the header's own border, not a nested region — nothing extra announced. 22 px side padding guarantees a 2 px focus ring at 2 px offset never touches the hairline. Forced-colours mode gets a system border and no fill. Sticky adds 74 px of scroll padding so in-page anchors do not land under it. **A pack whose dark border falls under 1.5:1 against its background renders Filled instead of Hairline**, so the header is never an invisible container.

**Flagged.** The 22 px padding, the 74 px scroll padding and the 1.5:1 dark-border fallback are mine. The content-column width comes from the pack's measure, which is why the control has no pixel value.

---

## 13 · Centre Nav

Logo left, actions right, nav centred between them in a three-column grid.

**Descriptor.** The only design where the nav is centred on the page rather than on the slack between logo and actions, held there by equal outer grid columns whatever the CTA label says.

**Structural descriptor.** `bar · none · page · few · none · nav centred on page`

**Archetype.** bar

**Behaviour module.** `header-scroll` (Sticky, Shrink, per Rail) · `accordion` · `nav-drawer` · `mode-toggle`. The 1024 re-anchor is a grid change in a media query, not a module. Edit-safe. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — both the centred and the re-anchored arrangements are CSS grid and intact, and Shrink does not fire. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list, no additions.

**Controls.** Centring (True centre · Optical · Space between) · Actions (None · Sign in · Subscribe · Sign in + Subscribe) · Nav spacing (Tight 20 · Even 30 · Airy 40) · On scroll (Static · Sticky · Shrink) · Divider under (Hairline · Shadow · None) · Nav items before More (Auto · Four · Five · Six) · Search in header (On · Off) · Dark mode toggle (On · Off).

**Data.** Identical to Rail. Empty nav → the centre column is removed and the grid becomes logo left, actions right, at full height.

**Responsive.** ≥ 1025 three-column grid with the nav truly centred on the page. ≤ 1024 the grid becomes a row and the nav anchors beside the logo; nothing is dropped or folded at that point. 1023–768 narrowing only. ≤ 767 nav and Sign in to the drawer, Subscribe stays with its short label.

**Behaviour.** The re-anchor is a layout change with no change to content or order. Shrink follows Rail: 76 → 56, search and the ghost action drop.

**Empty state.** No CTA → the right column holds search and Sign in; the nav stays centred, since the grid's outer columns are equal regardless of contents.

**Accessibility.** Grid placement only — DOM order stays logo → nav → actions in both arrangements, so focus never zig-zags. Nothing is announced on re-anchor and no focus is lost. Nav spacing has a 20 px floor so 15 px labels do not read as one string and the focus ring has room.

**Flagged.** The 1024 re-anchor threshold, the 20/30/40 spacing values, and making True centre the default over Optical — optical centring shifts the nav when the CTA label changes.

---

## 14 · Icon Utilities

Rail's bar with a bare-icon cluster at the right: search, RSS, dark mode, beside the standard actions. The signed-out cluster is the design.

**Descriptor.** The only design whose right side is an icon cluster beside the actions instead of labelled actions alone — and, since this pass, a design with **no member furniture of its own**: signed-in members see the member-aware action labels, not an avatar.

**Structural descriptor.** `bar · none · page · many · none · icon cluster`

**Archetype.** bar

**Behaviour module.** `mode-toggle` (the toggle, synced with the drawer switch) · `accordion` · `header-scroll` (Sticky, Shrink) · `nav-drawer`. The 500 ms tooltips are not a registry module: they are native `title` attributes, and every icon carries a text accessible name either way. Edit-safe; tooltips are suppressed in the editor so they never cover the element being edited. **JS off:** "`prefers-color-scheme` still drives Auto mode entirely in CSS (FR-E4); only the manual override control is hidden." "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown." Search and RSS are plain links and work; the actions are links and work.

**The member avatar is removed.** The avatar, the member pill, its account menu and the "Member control" control are **gone from this design entirely** (owner ruling). The signed-out cluster — **Sign in · Subscribe · Search** (plus RSS and the mode toggle by the Icons control) — **is the design**. Signed-in members see the P0·4 member-aware labels on the same two action slots (§0·3 defaults: Sign in → "Account" → Portal `account`; the Subscribe slot hidden), so the bar never rearranges itself — the same slots change label, exactly as everywhere else in the library. Everything the account menu carried is Portal's.

**The RSS glyph** is a standard **P0·2 icon-slot glyph** like the rest of the cluster (Tabler `rss` default, swappable in the Icon Picker) — the mono "RSS" wordmark is retired.

**Content fields.** Shared list, and the design that renders `socialLinks[]` as icons in the bar — capped at 2 alongside search and the mode toggle, bound per §0·8. No new fields.

**Controls.** Icons (Search · Search + RSS · Search + RSS + Dark mode · Search + Dark mode) · Icon style (Bare · Outlined · Filled) · Actions (None · Sign in · Subscribe · Sign in + Subscribe) · Nav position (Beside logo · Centre · Right) · On scroll (Static · Sticky · Shrink) · Nav items before More (Auto · Four · Five · Six). Search and the mode toggle live inside the Icons values — stated in the sidebar; there are no separate toggles here.

**Data.** Signed-in rendering is the P0·4 compile — server-side member checks, nothing flashes. Members disabled in Ghost → the action cards collapse to plain Label + Link (§0·3) and the icon cluster stands alone. Dark mode appears only if the pack ships both modes. Social icons per §0·8.

**Responsive.** 1440–1024 as drawn. 1023–768 narrowing only: padding 40, nav gaps 16, cluster gaps 3; icons stay 38 px and both actions hold. ≤ 767 the cluster becomes labelled rows in the drawer — search as a field, dark mode as a switch, RSS as a link — and the bar carries the short CTA (or "Account" for members) and the drawer toggle.

**Empty state.** No social links and no dark mode → the cluster is search alone and the hairline separator between cluster and actions is dropped rather than left dividing one item. Empty nav → logo, cluster and actions at full height.

**Accessibility.** Every icon has a text accessible name — "Search", "RSS feed", "Dark mode" — plus a tooltip on hover and focus after 500 ms; glyphs are decorative and hidden from the tree (P0·2). The toggle is a button with `aria-pressed`, its on state a fill rather than a colour change so it survives forced-colours mode, kept in sync with the drawer's switch. Bare icons need muted-on-background to clear 4.5:1; a pack that cannot manage it renders Outlined instead.

**Flagged.** The 2-social cap, the 500 ms tooltip delay and the Bare → Outlined fallback are mine. The avatar's removal, the signed-out cluster as the design and the RSS icon-slot ruling are the owner's. The former member block read tier and renewal date from Ghost; that question now belongs to A30 Members Pages alone.

---

## 15 · Big Type

The wordmark at 64 px with the nav small and low beside it. Suits a home page or an archive rather than a post.

**Descriptor.** The only design where the wordmark is the display moment and the nav is subordinate to it.

**Structural descriptor.** `stack · none · page · few · none · wordmark at display scale`

**Archetype.** stack

**Behaviour module.** `header-scroll` (Collapse to bar, Hide) · `accordion` · `nav-drawer` · `mode-toggle`. Edit-safe: the collapse never fires in the editor, so the 64 px wordmark is always what is being edited. **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the header renders at full display size and holds it; the collapsed Rail state does not exist without the module. The 24-character auto-step is server-side and the 28 px mobile floor is CSS, so the type never breaks its own rules. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list, using `tagline` as A1·3 does. `logo` is now **rendered when the Logo control says so** — the spec's own §15 flag is resolved: the old ruling ("an image logo cannot be set at 64 px reliably") is replaced by fixed sizes that can.

**Controls.**

| Control | Values |
|---|---|
| Wordmark size | Large 48 · Larger 64 · Largest 80 |
| Logo | Wordmark only (default) · Image (Small 40 · Medium 56) |
| Nav placement | Low right · Below · Top right |
| Tagline | On · Off |
| Actions | None · Sign in · Subscribe · Sign in + Subscribe |
| On scroll | Static · Collapse to bar · Hide |
| Nav items before More | Auto · Four · Five · Six |
| Search in header | On · Off |
| Dark mode toggle | On · Off |

The old "Padding" row was the universal Vertical spacing and is removed (§0·1). The 26 px logo *mark* is still not offered — a small badge beside display type reads as debris; the Image values set the image on the display line itself, baseline-aligned, at 40 or 56 px, with the wordmark beside it or alone per the site's file.

**Data.** Ghost site title and description. A site title over 24 characters drops one size step automatically, since at 80 px a long name would wrap on desktop.

**Responsive.** 1440 wordmark 64, nav and actions stacked at the right on a shared baseline with the tagline. 1023–768 the nav drops to its own row beneath, actions stay top right, wordmark 46, logo image 40. ≤ 767 wordmark 28 — the floor — with a two-line wrap and the bar growing to fit; the logo image holds 40; tagline 11; nav and Sign in to the drawer; drawer wordmark 20.

**Behaviour.** *Collapse to bar*: the stuck state is A1·1 Rail at 56 px with the wordmark at 17 (logo image at 24 when set). Tagline, search and the ghost action leave with the large type. The transition is a 160 ms cross-fade rather than a size animation — interpolating 64 px down to 17 px draws the eye to the movement instead of the page.

**Empty state.** No tagline → the wordmark sits alone and the header keeps its padding. Empty nav → the actions hold their position and the second row is removed rather than left empty. Logo = Image with no file → Wordmark only, stated in the sidebar.

**Accessibility.** Size confers no heading level: the wordmark is a link to `/` at every size and an `h1` only on the home page. The hover underline is 3 px at 8 px offset — the 2 px body-size underline proportioned to display type. The 28 px floor and two-line wrap keep the wordmark inside a 320 px viewport with no horizontal scrolling. Under reduced motion the collapse swaps instantly; neither state reorders the DOM. The tagline is a paragraph, hidden by its control rather than emptied. The logo image's alt is the site title; with the wordmark also drawn, the image is decorative.

**Flagged.** The 48/64/80 sizes, the 28 px mobile floor, the 24-character auto-step, the cross-fade over a size animation, and the 40/56 image sizes and their responsive steps are mine; offering the image at all is the owner's resolution of the old flag.

---

## 16 · Reveal

Rail's bar, hidden while the reader goes down the page and back on any upward scroll. Three states, and the design is the rules between them.

**Descriptor.** The only design defined by scroll direction rather than scroll position: hidden going down the page, returned as a floating panel going up, in flow at the top.

**Structural descriptor.** `sticky · none · page · few · none · scroll direction drives state`

**Archetype.** sticky

**Behaviour module.** `header-scroll` (200 px threshold, hide going down, return as a floating panel going up, restore in flow at the top; suspended while the drawer is open) · `accordion` · `nav-drawer` · `mode-toggle`. The registry has no direction-watching module, and its `reveal` is a content module — hide-then-reveal on entry — not this; `header-scroll` is the closest and is what this design declares (§0, first finding). Edit-safe by suspension, and this is the design where that matters most: a header that hid itself in the editor could not be selected (the hidden and returned states are reached with the P0·6 switcher's simulate-scroll entry). **JS off:** "Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent." — the resting state is A1·1 Rail in flow at the top, and that is what a reader gets: it never hides and never returns, so they get a static header rather than a broken one but do not get this design. "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all." "Nav renders as a plain always-visible link list below the logo (CSS-only stacked layout); no hamburger is shown."

**Content fields.** Shared list, no additions. The Returned-contents control decides what the panel carries.

**Controls.** Hides after (Immediately · Short scroll 200 px · Long scroll) · Returned ground (Surface · Contrast · Page) · Returned shape (Inset panel · Full-width bar) · Returned contents (Nav only · Nav + Subscribe · Nav + both actions · Wordmark + nav) · Nav items before More (Auto · Four · Five · Six) · Search at the top (On · Off) · Dark mode toggle (On · Off). No On-scroll control — the scroll behaviour is the design.

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
2. **Two levels of dropdown** — approved. In Authored mode children and grandchildren are Inflozo-authored because Ghost's nav is flat; in Ghost-prefix mode one child level comes from Ghost and grandchildren remain Inflozo-authored (§0·5). Grandchildren render as an indented group under their child, never as a second flyout, and there is no third level.
3. **Unused fields go to the drawer foot.** Content is never lost when switching design. Some drawers get long as a result.
4. **Numeric limits** — 280 px wordmark cap, 150 px nav-label ellipsis, 248 px dropdown, 44 px targets — are mine. The brief fixes roles and named values, not these. (The fold caps are now the Auto values of the Nav-items-before-More control, §0·6.)
5. **Pack details** — Ink's header on `surface` rather than `background`, and the dark-mode border values for Tangerine and Ink — are mine, extending the existing Calibration Set.
6. **A2 above.** Every A1 design must tolerate an announcement bar above it, including Overlay, where the bar is opaque and the header is not, and Utility + Nav, where it makes three stacked bands. That interaction is drawn in A2, not here.
7. **Per-design inventions** are flagged in each design's Flagged line and on its frames.
8. **Designs may hand off to other designs.** A1·11 becomes A1·1 below 1200; A1·15's collapsed state is A1·1; A1·4 and A1·8 fall back to A1·1 when their preconditions are absent. This is now a category rule, established by those four, and it needs your confirmation before A2 relies on it.

---

## 18 · A1 is closed

Sixteen designs, each with desktop 1440, its behaviour states, hover/focus states, tablet 834, mobile 390 closed and open, dark desktop, an annotated accessibility frame, its control panel and its spec. Category artefacts — the three-pack tokenisation proof, the stress frame and the shared field list — are in `A1-0 Category Proof.dc.html`.

**The shared field list, amended by this pass.** logo, logoLight, siteTitle, tagline, dateLine + dateMode + customDate, navItems[], children[] (two levels), descriptions, secondaryNav[], signInLabel, ctaLabel/ctaUrl, searchEnabled, searchPlaceholder, socialLinks[], darkModeToggle, moreLabel, plus per-design fields menuLabel/closeLabel (6), featuredHeading (6), railHeading/byTopicHeading/byAuthorsHeading (7), stripNote + stripItems[] (8), and the structural records panelColumns[], panelTags[], featuredPost. Every design draws from it; nothing a design ignores is discarded — unused content goes to the drawer foot. The A1-0 field-list card predates this amendment; this section is the record.

**Components established here, carried forward verbatim:** logo lockup, nav item, dropdown panel (248 px, two levels), primary button, ghost action, overflow menu, drawer, search affordance (38 px / 19 px glyph), icon button (38 px box, three styles), mode toggle, takeover, floating panel. (The member pill and account menu are withdrawn with A1·14's re-cut; if a later category needs member furniture it is designed there.)

**Decisions waiting on you before A2:**

1. Designs may hand off to other designs (§17.8).
2. `contrast` must be defined per mode in every pack (§10).
3. Whether scroll-direction reveal is a named state of `header-scroll` or a thirty-second module (§0, finding 1).
4. Whether A1·4's hero precondition may be resolved server-side, since no module covers it (§0, finding 2).
5. The `nav-transform` registry addition (§0·5) — the prefix scheme, the `|` marker, and the takeover/mega-panel group reads all hang on it.

**Next category: A2 Announcement Bars, 15 designs.** It sits above every A1 design, including Overlay, where the bar is opaque and the header is not, and Utility + Nav, where it makes three stacked bands.

---

## 19 · Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. The first five slots are closed sets, written as the bare word with nothing appended. All sixteen checked against each other.

| # | Design | Archetype | Containment | Ground | Items | Media | Emphasis mechanism |
|---|---|---|---|---|---|---|---|
| 1 | Rail | bar | none | page | few | none | hairline and accent underline |
| 2 | Split Rail | split | none | page | many | none | axial symmetry |
| 3 | Stacked Masthead | stack | none | page | many | none | display wordmark between rules |
| 4 | Overlay | overlay | none | transparent | few | background | scrim and inverted lockup |
| 5 | Floating Pill | bar | pill | surface | few | none | detached capsule, resting shadow |
| 6 | Drawer-First | overlay | none | surface | variable | inline | display-size type, full surface |
| 7 | Mega Bar | bar | none | page | many | edge | full-width panel behind bar |
| 8 | Utility + Nav | stack | none | surface | many | none | tier ground change |
| 9 | Search-Forward | form | none | page | few | none | field takes the slack |
| 10 | Contrast Band | bar | none | contrast | few | none | inverted ground |
| 11 | Side Rail | edge rail | none | page | many | top | column occupies page layout |
| 12 | Boxed | bar | box | transparent | few | none | box on content column |
| 13 | Centre Nav | bar | none | page | few | none | nav centred on page |
| 14 | Icon Utilities | bar | none | page | many | none | icon cluster |
| 15 | Big Type | stack | none | page | few | none | wordmark at display scale |
| 16 | Reveal | sticky | none | page | few | none | scroll direction drives state |

**Changed this pass:** A1·14's media slot was `inline` — the member avatar. With the avatar removed the slot reads `none` and the emphasis mechanism drops "and avatar". The tuple stays unique: 7 is the other `bar · none · page · many` and separates on media (`edge`).

**How each slot was read.**

**Containment** is `none` in fourteen of sixteen, because a header is a band. Only A1·5 (pill) and A1·12 (box) contain themselves. The drawer, A1·6's takeover and A1·7's panel are **not** containment: they are surfaces the section opens, and the section itself is still a bare bar.

**Ground** — page ×11 · surface ×3 (A1·5's capsule, A1·6's takeover, A1·8's strip) · contrast ×1 (A1·10) · transparent ×2 (A1·4, A1·12). `image` and `accent` are unused: A1·4 sits over an image but has no ground of its own, which is exactly what `transparent` means, and the image is recorded in media placement instead.

**Item-count class** — few ×8 · many ×7 · variable ×1 (A1·6, the only uncapped nav). `none` and `one` are unused, since every header draws a nav list. Where a design shows four items and folds the rest to More it is `few`: the fold is the cap, not authorial freedom.

**Media placement** — none ×12 · background (A1·4's hero image) · inline (A1·6's featured-post thumbnail) · edge (A1·7's 300 px panel rail, divided by a hairline) · top (A1·11's logo at the head of the column). The logo lockup is **not** counted as media anywhere else: it is present in all sixteen and separates nothing.

**Archetype spread.** Seven of the fourteen values are used: bar ×7 (1, 5, 7, 10, 12, 13, 14) · stack ×3 (3, 8, 15) · overlay ×2 (4, 6) · split, form, edge rail, sticky ×1 each. Seven values — grid-of-N, nav, feed, carousel, table, media frame, article body — are unused in A1 and stay available for later categories.

**The close pairs, stated rather than buried.** 1 / 5 / 12 are all bars of few items with no media: they separate on containment and ground (full-bleed band on page, capsule on surface, box on transparent). 1 / 10 separate on ground alone, which is the category rule doing its job — the same header on page and on contrast are two designs. 3 / 15 are both stacks on page and separate on item count. 7 / 14 are both bars of many items on page and separate on media placement. 4 / 12 are both transparent and separate on containment and media.

**One pair separates on the last slot alone, and it should be looked at.** 1 Rail and 13 Centre Nav are both `bar · none · page · few · none`; only the emphasis differs — nav beside the logo versus nav centred on the page by equal outer grid columns. The difference is real and is the reason 13 exists (the nav does not move when the CTA label changes), but §19's own rule says nav position is a control, not a separator. If any pair in A1 is to be merged into one design with a Nav-position control, it is this one. That is a finding, not a change: no frame moved in this pass.

**Not used as a separator.** Height, sticky setting and colour never appear in a tuple: they are controls or tokens, and two designs that differ only by a control setting are one design.

---

## 20 · Repeating items — the controls for them

**The arrays, found by reading the field list back.** `navItems[]` · `navItems[].children[]` and their grandchildren · `secondaryNav[]` · `stripItems[]` (new, A1·8 Authored mode) · `socialLinks[]` · `panelColumns[]` and `panelColumns[].links[]` · `panelTags[]`. Single values, which get no item controls: `logo`, `logoLight`, `siteTitle`, `tagline`, `dateLine`/`dateMode`/`customDate`, `signInLabel`, `ctaLabel`/`ctaUrl`, `searchEnabled`, `searchPlaceholder`, `darkModeToggle`, `moreLabel`, `menuLabel`/`closeLabel`, `featuredHeading`, `railHeading`, `byTopicHeading`, `byAuthorsHeading`, `stripNote`, `featuredPost`. Two things that look like lists and are not: A1·14's icon cluster, which is a set chosen by the Icons control, and A1·9's suggestion rows, which are query results. Every one of the sixteen designs draws more than one nav item, so this section applies to all sixteen. **All authored lists here use the P0·3 item controls verbatim; all Ghost-sourced lists use the P0·3 Ghost-list card verbatim.**

**Ownership decides what the sidebar may do.**

- **Ghost owns the list.** `navItems[]`, `secondaryNav[]` (and, in From-Ghost mode, the children read from prefixes, A1·6's takeover groups, A1·7's nav-group columns, A1·8's strip rows) and Ghost's social account fields are site settings. The sidebar shows them as the P0·3 Ghost-sourced card — each row with its label, its target and, where relevant, its resolved count or prefix role (`+ parent`, `- child`, `| marker`) — and add, remove and reorder collapse to one "Edit navigation in Ghost" row that opens Ghost's settings. **Never an Add button.** A theme does not write site settings, and a sidebar that pretended otherwise would silently lose the edit.
- **Inflozo owns the list.** `children[]` (Authored mode), grandchildren, `children[].description`, `stripItems[]`, `panelColumns[]`, `panelColumns[].links[]` and authored social extras are the theme's own content. These get the full P0·3 controls below.

**Add an item.** The P0·3 Add row at the foot of that list in the sidebar's Content section — never a floating button on the canvas. A new item lands last and **arrives with content, never as an empty shell** (a row with no label would render as a 15 px blank in the bar):

- a child: label "New link", target `/`, description empty
- a grandchild: the same, indented under the child that was selected
- a strip item (A1·8): label "New link", target `/`
- a panel column (A1·7): title "New column", Fill with = Authored links, three placeholder rows, Second line = None, Foot link = None
- a social extra (A1·8, A1·14): the next service Ghost has not already filled, its URL empty and the row marked incomplete until it has one

**Remove an item.** Remove sits in the P0·3 row overflow (with Duplicate) and is **never disabled**. Removing a parent removes its children and says how many. Removing the last child of a nav item leaves the item as a plain link and drops its caret — the 0-children behaviour each design already states.

**Reorder.** Drag on the P0·3 row handle, with keyboard movement per P0·3. Order is meaningful, and therefore reorderable, for `navItems[]` (in Ghost), `children[]`, grandchildren, `stripItems[]` (reorder is also how an authored strip item changes sides, §8) and `panelColumns[]`: it is reading order, it is tab order, and on the fold designs it decides which items fold to More. Order is **not** meaningful for `socialLinks[]`, which render in Ghost's fixed field order, or for `panelTags[]`, the BY AUTHORS ranking and bound columns, which are ordered by their Order setting or by post count; those rows show no handle rather than offering an order that will not hold.

**Design controls apply to every item at once.** A control writes one value onto the section and the stylesheet reads it, so "make item 3 bigger" is not expressible. The one place A1 looks like it wants per-item styling is A1·7, where each panel column has its own binding record: that is data, not style. Columns, Second line and Panel width all write single section values, and a bound column renders in the same shape as an authored one by design. A1·8's shed order (social, then note) is likewise a section rule, not a per-item setting.

**Inside an item, content only.** Selecting an item on the canvas opens exactly these fields and nothing else — no size, no alignment, no spacing, no colour, no per-item emphasis. Text edits inline with P0·1; links open the Link Picker; icons (A1·11 rows) are P0·2 slots.

| Item | Editable | Optional | What an empty optional field looks like |
|---|---|---|---|
| Nav item | label, target (in Ghost); children and description added in Inflozo | children, description | No children → no caret. No description → the row is title-only. |
| Child | label, target, description (≤ 60 chars), its own grandchild group; in Ghost-prefix mode label and target are Ghost's (locked) | description, grandchildren | No description → the row tightens to a 14 px title-only row, and the panel loses half its height (A1·7). Descriptions are drawn only by A1·7 and its drawer; written elsewhere they are kept, not shown, per §17.3. |
| Grandchild | label, target | — | No third level exists, so nothing to leave empty. |
| Panel column (A1·7) | title, binding record, authored links | title, Second line, Foot link | Empty title → the tag, author or nav-group name. A bound column whose tag has no published posts hides and the rest re-flow, or shows its fallback line, by setting. |
| Strip item (A1·8 Authored) | label, target | — | An item with no label is not created; Add arrives with content. |
| Secondary link (A1·8 Ghost mode) | label, target (in Ghost) | — | Strip caps at 5; one link renders as one link and does not stretch. |
| Social link | service (icon slot), URL | URL on an authored extra | An extra with no URL is not rendered and its glyph holds no space. |

**Counts per design.** What each design is laid out for, and what it does at either end. "Laid out for" reads as the fold control's Auto value where one exists (§0·6).

| # | Design | Lists it draws | Laid out for | Fewer | More | At zero items |
|---|---|---|---|---|---|---|
| 1 | Rail | navItems, children | 3–4 in the bar | 1–2 sit beside the logo; nothing re-centres | past the fold threshold items go to More, which lists 8, so 12 is the ceiling and past it the panel scrolls | logo + actions at full height, hairline kept |
| 2 | Split Rail | navItems, children | 4–6, split 3/3 or by the `\|` marker | 2–3 splits 1/1 or 2/1 and reads sparse; 1 item cannot split and sits left of the wordmark | 7+ fold to More on the right half | centred wordmark alone at Comfortable height |
| 3 | Stacked Masthead | navItems, children | 5–8 in the row | 2–4 follow the Nav row control and the rules stay | 9+ fold to More at the row's end | both rules and the nav row removed, masthead alone |
| 4 | Overlay | navItems, children | 3–4 | fewer items widen nothing; the scrim is unchanged | past the fold to More | wordmark and actions over the image; no hairline to remove |
| 5 | Floating Pill | navItems, children | 3–4 | the pill stops tracking the gutter only when search and both actions are absent too | past the fold to More | pill holds logo + actions, centred at Page-gutter width, 240 px floor |
| 6 | Drawer-First | navItems (uncapped), children, grandchildren, secondaryNav | 5–20 in the takeover | 1–2 still render at display size in one column; the sidebar says the design is built for 5 and up | past 20 the takeover column scrolls; the bar is unaffected; Ghost-prefix mode caps at five columns (§6) | **the Menu button is not rendered at all** and the bar becomes wordmark + search + action |
| 7 | Mega Bar | navItems, children, grandchildren, panelColumns, column links, panelTags, authors block | 4 in the bar; 2–4 columns; 3, 4 or 6 links each; ≤ 6 grandchildren per child; ≤ 2 Ghost-nav columns | 1 column is not a panel — it renders as the 248 px dropdown | a fifth column needs the Columns control raised; links past Show are not drawn and the Foot link carries the real count | 0 columns → plain link, no caret |
| 8 | Utility + Nav | navItems, children, secondaryNav or stripItems (≤ 5), socialLinks (≤ 3) | 4 primary, 3–5 secondary, 2–3 social | one secondary link renders as one link; the strip neither stretches nor centres | 6+ secondary links drop to the drawer's labelled group; a fourth social link is not drawn | no strip links, no social, no note → **the strip is not rendered and the design degrades to Rail** |
| 9 | Search-Forward | navItems, children | 3–4, field 240 px minimum | the field takes the freed room only when Field width = Takes the slack | past the fold to More; the field moves to its second row before it goes under 240 px | logo, field and actions; the field keeps its set width |
| 10 | Contrast Band | navItems, children | 3–4 | a contrast band reads fine with two items in it | past the fold to More | band holds logo and actions at full height |
| 11 | Side Rail | navItems, children | 4–7 rows | fewer rows leave the column its width and the foot actions pinned | 8+ fold to a More row; the column itself never scrolls | rail keeps its width and holds logo, search and actions |
| 12 | Boxed | navItems, children | 3–4 | the box never shrinks to fit its contents | past the fold to More | box holds logo and actions and keeps its content-column width |
| 13 | Centre Nav | navItems, children | 3–4 | the centre column stays centred whatever it holds | past the fold to More | centre column removed; logo left, actions right |
| 14 | Icon Utilities | navItems, children, socialLinks (≤ 2) | 4 primary, cluster of 2–4 | a cluster of one drops the hairline separator | a third social link is not drawn | bar holds logo, cluster and actions |
| 15 | Big Type | navItems, children | 3–4 low right | fewer items leave the shared baseline as drawn | past the fold to More at nav size | actions hold their position and the second row is removed |
| 16 | Reveal | navItems, children | 3–4 | fewer items shorten the returned panel | past the fold to More in the top state; the returned panel carries what Returned contents says | panel carries the wordmark and the action |

**Flagged.** Mine in this section: the 12-item ceiling on a More panel, A1·6's 5–20 comfort range and scrolling takeover, the drop of over-cap secondary links to the drawer group, the placeholder content each added item arrives with, and the read-only Ghost list behind an "Edit navigation in Ghost" row. That last one is the load-bearing decision: if the sidebar is expected to write Ghost's navigation setting, every nav list in the library becomes editable in place and this section changes.

---

## 21 · Reconciliation notes

**Frames changed in this pass.** All sixteen control-panel frames (universal trio added outside the list; Height rows removed; new rows per design; footer counts updated). Section frames redrawn where visible content changed: **A1-6** (search icon button in the bar beside Subscribe and Menu) · **A1-7** (dates on bound-column posts; BY AUTHORS block under BY TOPIC with reused foot-link style; rail headline marked editable) · **A1-8** (mode toggle removed from the strip drawings) · **A1-11** (2 px leading accent bar removed from every rail frame; active row re-cut to weight + full-strength label; states and accessibility captions rewritten) · **A1-14** (member avatar, pill and account menu removed everywhere; signed-out cluster is the primary frame; signed-in shown as the member-aware labels; RSS wordmark replaced by an icon-slot glyph). No other section frame moved.

Conflicts between this patch and what the category had already ruled, one line each:

1. **Height vs Vertical spacing.** Every per-design "Height" row used the universal values and is ruled to *be* Vertical spacing (removed, §0·1); A1·3's Masthead height and A1·15's Wordmark size stay as genuinely distinct ladders; A1·15's "Padding" was the duplicate and is removed.
2. **Top divider vs the bottom-edge rows.** The universal Top divider is the seam above the header; the designs' own rows are the bottom edge and are renamed "Divider under" (A1·1, A1·8, A1·13) rather than removed — different edges, both real.
3. **Background role would recreate A1·10.** A Rail set to a contrast Background role is Contrast Band by §19's own rule, so the universal control offers Background · Surface only on A1; 4, 10 and 12 lock it with reasons. **A1·11's "Rail ground" merged into the universal control and its Contrast value is withdrawn by the same rule — the drawn Contrast rail is overruled; flag to the owner.**
4. **Member Visibility is not offered on A1.** The patch's category rule adds it to CTA-bearing designs "unless a richer member-state model already subsumes it"; the P0·4 per-action states subsume it here, and a site header must render for every audience — recorded as the subsumption case, not an omission.
5. **A1·8's toggle: "moves to the drawer" vs desktop.** The owner's line relocates the strip toggle to the drawer, but the drawer exists only ≤ 767; on desktop the On state renders the §0·4 standard icon button in the main bar's cluster. Interpretation recorded; overrule if the desktop toggle should not exist at all.
6. **A1·9 vs the registry's `/search/` degradation.** The owner rules "never a `/search/` page that pretends to render results server-side"; the registry's no-JS sentence posts to `/search/`. Reconciled: `/search/` is A23's client-side surface, so the no-JS form lands there with the query prefilled and no server-rendered results exist — both texts stand.
7. **A1·14's descriptor and §19 tuple changed.** The signed-in avatar was the design's stated identity ("the signed-in state is the primary frame"); the owner's removal re-cuts descriptor, tuple (media `inline` → `none`) and primary frame. The uniqueness check still passes (vs A1·7 on media).
8. **A1·14 previously ruled the avatar into the 390 bar** ("a signed-in reader's route to their account should not be two taps deep"); with the avatar gone the route is the bar's "Account" label — same tap count, ruling superseded rather than contradicted.
9. **A1·15's §15 flag is resolved against the old ruling.** "Not rendering an image logo at all" is overturned by the owner's Logo control (Image Small 40 · Medium 56); the 26 px mark stays unoffered.
10. **A1·2's §17.3 behaviour ("unused signInLabel renders in the drawer") stands**, but the new Right-cluster values make Sign in placeable on the desktop bar, ending the silent-drawer-only state the audit flagged.
11. **A1·2 marker precedence.** The `|` marker wins over the Split control when present; Split is the no-marker fallback — stated in §2 as the owner ruled, no conflict with the drawn control.
12. **Fold thresholds vs §20's fixed caps.** The hard-coded 4-item folds become the Auto value of "Nav items before More"; §20's table now reads as Auto. Not offered on A1·2, A1·3, A1·6, A1·11, whose thresholds are structural (split distribution, full-width row, uncapped takeover, vertical fold at 7) — stated in each sidebar.
13. **A1·6's "Latest post · Chosen post" vocabulary is replaced** by the P0·5 source set (Latest · Featured · By tag · By author · Hand-picked); "Chosen post" survives as Hand-picked.
14. **A1·7's "Descriptions" control is renamed "Second line"** and widened: authored columns show `children[].description` (editable inline), bound columns show post data (locked) — the old control's Off value survives as Hide.
15. **A1·7's SERIES default column changes source** (tag fill → Ghost-nav group fill); the tag-driven series fill remains a listed option, so no drawn binding is lost.
16. **A1·7 hover intent becomes a control** ("Panel opens on"); the drawn 120 ms hover-intent behaviour is the Hover-and-click value's, unchanged; Click only is new.
17. **A1·3's date line becomes two controls** (Date, Date shown); the visitor-local browser date is deferred by owner ruling, and the site-timezone date is client-computed because a server-rendered "today" goes stale under page caching — this narrows the old always-server-rendered assumption.
18. **The Ghost-prefix nav scheme, the `|` marker and the group reads have no no-JS design by owner ruling** — this is the one place the category's own no-JS-baseline duty is explicitly waived; the flat-list sentence in §0·5 is the entire degradation story.
19. **"Preview" controls: none existed in A1** — verified against all sixteen panels; nothing to remove, rule recorded.
20. **`searchEnabled` default off stands category-wide**, with A1·9's forced-On now shown as a locked control rather than a sidebar sentence.
21. **The seven designs whose responsive or empty-state text referenced search without offering it** (3, 4, 6, 7, 8, 12, 13) now carry the control; their drawn search affordances were already the shared component, so only panels changed except A1·6 (§21 head).
22. **Social rows are version-gated** (Facebook/X on Ghost 5.x; nine platforms ≥ 6.36) — the old "Ghost's social fields" line under-specified this; rows absent, not disabled, on the older surface.

— End of specification —
