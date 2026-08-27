# P0 · Editor Primitives — written specification

Drawn 24 August 2026 · Paper pack, S4 editor chrome. This pass designs the repeating fixes from the
controls-reconciliation audit **once**, as shared editor primitives. Every category patch that follows
reuses them **by name** and never redesigns them.

Frames: `P0-1 Inline Text Toolbar` · `P0-2 Icon Slot and Picker` · `P0-3 Item List Controls` ·
`P0-4 Member Action Editor` · `P0-5 Populate From Panel` · `P0-6 Editor State Switcher` ·
`S14 Editor Cards` (all `.dc.html`).

Everything here is drawn from A1's established components verbatim (primary button, icon button,
dropdown panel, segmented control, toggle) and the S4 chrome (top-bar pills, sidebar groups, selection
ring, section badge). Where this file and a drawn frame disagree, the frame is wrong and this file wins.

---

## P0·1 · Inline text toolbar

The floating toolbar over any selection in any inline-editable text prop, **headlines included** (FR-D4).

**Actions — exactly five, fixed order, fixed width.**

| # | Action | Key | Disabled when |
|---|---|---|---|
| 1 | Bold | ⌘B | never |
| 2 | Italic | ⌘I | never |
| 3 | Underline | ⌘U | never |
| 4 | Link | ⌘K | never |
| 5 | Remove link | — | the selection carries no link (35 % opacity) |

No font, no size, no colour — those belong to the Style Pack and the section. Bold on a heading renders
the pack's heavier heading weight, never faux-bold. An active mark shows as a pressed chip
(selected-tint fill, strong-accent glyph); clicking a pressed chip removes the mark.

**Anatomy.** Editor chrome, not canvas content: white surface, 1 px editor border, 10 px radius, md
shadow, 3 px padding, five 30 px targets, hairline divider before the link pair. B/I/U are letterform
glyphs in the canvas serif; Link and Remove link are stroke icons. Centres over the selection 8 px
above; flips below when the selection starts in the top 48 px of the canvas. Appears with the
selection, leaves with it. Does not scale with the text under it.

**At 390.** The floating bar docks: a 52 px full-width bar at the canvas foot, above the keyboard, five
44 px targets, same order, same disabled rule. The link popover becomes a bottom sheet, same content.

**The Link popover.** One popover, two states; ⌘K or the Link action opens it; **editing an existing
link re-opens the same popover pre-filled**. 340 wide, replaces the toolbar at the same anchor.

- *Search state.* One field ("Search pages, posts — or paste a URL"), live-searched groups in order:
  **Pages · Posts · Tags · Authors** (each omitted when it has no match, never shown empty; matched
  substrings bold; posts show date, tags show post count) then **Portal actions** — always last, always
  all four, as chips: Sign up (`signup`) · Sign in (`signin`) · Account (`account`) · Upgrade
  (`account/plans`). A pasted URL or typed email bypasses search and shows one "Link to …" row.
- *Filled state.* Target row (type icon, title, mono `TYPE · /slug/`, Change) · **Open in new tab**
  (checkbox — default off; default **on** for external URLs, flagged) · **Rel** row of three independent
  toggles `nofollow` · `noreferrer` · `sponsored` (mono-labelled; they write real `rel` values and are
  the library's one deliberate literal) · Remove link (strips the mark, closes) · Done (commits).
  Esc closes without committing a target change.

**Plain-text-locked.** A text prop bound to a Ghost Admin setting or Ghost data (site title, site
description, member counts, author names, tier names) **never shows the toolbar**. Selection still
renders; in the toolbar's place a lock pill names the binding ("Site title — plain text, set in
Ghost"). The pill is informational, not a control. ⌘B/⌘I/⌘U/⌘K do nothing on locked text; nothing
flashes. Editing the text edits the Ghost setting.

**States.** Resting · mark-active (pressed chip) · Remove-link disabled · docked (390) · locked (pill) ·
popover search · popover filled.

**Accessibility.** The toolbar is a `role="toolbar"` with `aria-label="Text formatting"`; Alt-F10
focuses it, arrow keys move, Esc returns focus to the text. Marks are announced ("Bold, on"). The
popover is a dialog anchored to the selection; focus lands in the search field; Tab order is field →
results → chips → (filled:) Change → checkbox → rel toggles → Remove → Done; Esc returns to the text
with the selection intact. All targets ≥ 30 px desktop, 44 px at 390.

**Flagged ⚑** — the five-action vocabulary and plain-text-lock are the brief's; mine: the docked-bar
treatment at 390, external URLs defaulting "Open in new tab" on, Portal actions as chips, the lock
pill's wording, the 48 px flip threshold.

---

## P0·2 · Icon slot + Icon Picker

Icons exist **only in icon slots** a design declares. A slot is **filled** (shows its icon) or
**empty** — a dashed 20 px placeholder (1.5 px dashed border, plus glyph, editor placeholder grey)
visible **only while the section is selected**. On the live site an empty slot renders nothing and
siblings shift; the layout never reserves the filled size.

**Library ruling ⚑.** The set is **Tabler Icons** (MIT): one set whose `brand-*` glyphs cover the
social rows. The PRD's Lucide reference is **amended** — Lucide 1.0 removed all brand icons. Drawn
glyphs in the frames are placement references in Tabler's stroke style (24 grid, stroke 2, round caps);
production ships the set verbatim.

**Icon Picker.** Opens from any slot click (either state). 380 wide, anchored to the slot; bottom sheet
at 390.

| Element | Spec |
|---|---|
| Search | one field, matches name + aliases; no-match state is a sentence ("Nothing for 'quartz'") + clear-search link, never a bare empty grid |
| Category chips | All (default) · Arrows · Interface · Media · Commerce · Social / Brands — single-select, filter the grid |
| Recent row | last 8 icons picked in this project; omitted entirely when empty ⚑ |
| Grid | 38 px cells, 8 per row, grouped under 10.5 px caps labels; current icon marked with the selection ring |
| Remove icon | footer link, present only when opened from a filled slot |

**Filled-slot popover.** Clicking a filled slot while its section is selected. Exactly four things:

| Control | Values |
|---|---|
| Swap | current icon row → re-opens the picker |
| Size | Small · Medium · Large (the pack's icon scale; Paper: 16 · 22 · 28) |
| Colour | role swatches: Text · Muted · Accent · On-accent — never a hex. A role failing AA on its ground is disabled with its ratio shown |
| Remove | empties the slot back to its dashed state |

**Button icons.** When any button is selected, its popover offers an optional icon **Before / After**
the label. Slot rules apply; button icons are always Small and inherit the label colour — the Size and
Colour rows are hidden for them ⚑. 8 px gap to the label; the A1·1 button otherwise unchanged.

**Social glyphs.** Brand glyphs come from the same picker's Social / Brands group. Display form —
icon-only · icon + full name · icon + short form (Fb, X, Li, In, Yt) — is a **per-section control**
on categories whose issues call for it, never a picker feature.

**Accessibility.** The slot is a button ("Icon: bolt" / "Add icon"); the picker is a dialog, search
first in focus order, grid is a labelled listbox with arrow-key movement; every icon has its name as
its accessible label; the rendered icon on the live site is `aria-hidden` decoration unless a category
spec names it meaningful.

**Flagged ⚑** — the Tabler ruling and its reason are the owner's; mine: the picker's category list
beyond the brief's examples, the 8-icon recent cap, On-accent's AA-disable behaviour, button icons
locking Size/Colour.

---

## P0·3 · Item-list controls

For sections whose repeating items the user authors (FAQ entries, stats, ticker messages, steps,
gallery images, testimonials…). Renders in the sidebar's **Content** group.

**The authored list.**

- Rows: drag handle (reorder) · label (the item's first text field, truncated) · per-row overflow
  containing **Duplicate · Remove** and nothing else.
- **Add {item}** button at the foot (dashed, full width). A new item lands **last** and carries
  **sensible placeholder content, never an empty shell** — the placeholder copy is named per category
  in that category's spec.
- Range line in the group header, mono: `2–6 · 4 used`. **At max:** Add disables (dashed border fades,
  label placeholder-grey) with a one-sentence reason below ("The ticker holds 6 messages. Remove one
  to add another."); Duplicate disables too. **At min:** each row's Remove disables inside the overflow
  with the same grammar.
- Selecting a row selects the item on canvas and vice versa (selection ring both places).
- **Selecting an item on canvas edits its content only** — text inline (P0·1), image via the image
  slot, link via the Link popover. Per-item layout, spacing or emphasis does not exist: a design
  control writes one value on the whole section, by construction.
- **Partial display:** where a design shows fewer items than exist, the header line reads
  `8 items · 3 shown in this design`; hidden items dim to 55 % but keep their handles (reordering into
  the shown set is the point). Switching designs never discards content.

**The Ghost-sourced list** (posts, tags, authors, tiers) is **not** this: no Add, no Remove, no drag.
Its controls are **how many to show and in what order** (Count stepper · Order Newest/Oldest at
minimum; the full source vocabulary is P0·5). It carries a "From Ghost" mark, read-only preview rows,
and a plain sentence: "Add and remove them in Ghost — this design chooses how many to show, and in
what order."

**Accessibility.** The list is reorderable by keyboard: the handle is a button ("Move: Can I use my own
domain?"), arrow keys move, changes announced ("Moved to position 2 of 5"). Overflow is a menu button.
The disabled Add keeps its reason readable (it is text, not a tooltip).

**Flagged ⚑** — mine: the 55 % dim, row-label truncation rule, the exact disabled-Add treatment.

---

## P0·4 · Member-aware action editor

For sign-in / subscribe / account actions in headers, footers and CTA rows. **Per action**, a compact
three-state editor. Compiles to server-side member checks; **nothing flashes client-side**.

**Anatomy.** One card per action slot (e.g. "Ghost action", "Primary action"), tagged `MEMBER-AWARE`.
Expanded: a segmented row **Logged out · Free · Paid** switching which state is being **edited** (not
what the canvas shows — the canvas follows the top bar's **View as**; editing a state the canvas isn't
showing marks the tab with a dot until viewed). Each state carries:

| Field | Control |
|---|---|
| Show | toggle ("Show for free members") |
| Label | text, plain-text (the P0·1 toolbar never appears on action labels) |
| Link | the Link Picker, **Portal actions first**; Portal targets render "Portal · Name" + mono action |

Collapsed, the card summarises all three states in three lines (`Free — "Upgrade" → account/plans`);
Hidden states in placeholder grey.

**Defaults, as shipped.** Logged out: "Sign in" → `signin` and "Subscribe" → `signup`. Free and paid
members: "Account" → `account`. Free members **may** see an upgrade ask → `account/plans` — on by
default only where a category's spec says so.

**Show = off** removes the action for that audience server-side; siblings shift per the section's own
empty rule — never a reserved gap.

**Distinct from Member visibility.** The section-level control (Everyone · Logged out · Free · Paid)
hides a **whole section**; this edits **one action**. Both appear in one panel, scope-tagged `SECTION`
and `ONE ACTION`. When visibility already excludes an audience, that audience's action rows collapse
to a note ("Never seen — section is hidden") instead of editable fields — no collecting copy no reader
sees. In the editor, a section hidden for the current View as audience ghosts to 40 % with a "Hidden
for this audience" pill; it is never removed from the editor.

**Members disabled in Ghost:** the whole Actions group collapses to one plain Label + Link editor per
action, with a sentence saying why.

**Accessibility.** The segmented row is a tablist; each state's fields are grouped under a heading
("Free member state"). The unviewed-edit dot has a text equivalent. Toggles are labelled switches.

**Flagged ⚑** — defaults and the compile-to-server rule are the brief's; mine: the edit-dot, the
collapsed three-line summary, the visibility-excluded collapse, the 40 % ghost + pill treatment.

---

## P0·5 · "Populate from…" data panel

One shared panel — the sidebar **Data** group's entire body — for every section that can draw content
from the user's Ghost site instead of authored content.

**Source** — segmented: **Static (authored) · From posts.** Static: the filter block is absent, not
disabled; the Content group shows the P0·3 authored list. From posts reveals:

| Control | Values |
|---|---|
| Filter | Latest · Featured · By tag · By author · Hand-picked (select, A1 dropdown panel) |
| — By tag | tag select below the filter: live-searched, tag name + post count. Single pick |
| — By author | author select: avatar + name + post count. Single pick — multi-author feeds belong to routes ⚑ |
| — Hand-picked | search-and-pick post list: drag reorders, × unpicks; **Count and Order hide** — the picked list is the count and the order. An unpublished pick drops out server-side; its row stays with an "Unpublished" note |
| Count | stepper, 1–{design max}, **hard cap 100** |
| Order | Newest · Oldest |
| Meta toggles | chips, per-design: only the fields this design can place — from date · author · excerpt · reading time · tag chip |

**Constraints (library-wide, stated once).**
- Count caps at 100.
- **No relative-date filters** — "this month" is route vocabulary (routes.yaml), not section vocabulary.
- **A secondary feed renders nothing at zero items — heading and container together.** An empty
  "More essays" band is a defect the panel prevents by construction. The editor shows the zero state
  as a note in the Data group, not as an empty band on canvas.
- Meta toggles a design lacks a slot for are never offered.
- Tag/author selects live-search past ten entries with the Link Picker's field grammar.

**Accessibility.** The revealed filter block is announced as it appears; selects are comboboxes;
the hand-picked list follows P0·3's keyboard-reorder pattern.

**Flagged ⚑** — the control vocabulary and constraints are the brief's; mine: hand-picked hiding
Count/Order, the single-pick rulings, the unpublished-row note.

---

## P0·6 · Editor state switcher

One affordance for every state that never shows at rest: form states **sent / invalid / failed /
expired / subscribed** (A16, A22, A30) · the paywall's four gates (A32) · the error pages' three copy
sets (A31) · search's **no query / results / no matches** (A23) · scroll-triggered bars (A24 sticky,
A27 carousel).

**Placement.** A **State** pill in the canvas chrome, beside the member-state toggle (View as) —
**never a sidebar control, never a per-section "Preview" control.** It appears only while the selected
section declares states; deselecting returns the canvas to rest. The choice is per-editor-session and
never ships: a state is a preview, not a setting.

**Behaviour.** The dropdown lists **only the states the selected section actually has**, first entry
the resting state annotated "— at rest". Switching re-renders the section in that state **in place**,
so its copy is editable inline (with P0·1 where the field allows marks). States compose with View as:
the switcher picks the state, View as picks the reader.

**Drawn.** Subscribe form: Empty · Invalid · Done · Subscribed — the invalid sentence, confirmation
line and already-subscribed line are each authored fields edited in the state that shows them; Done
holds the band height so the page never jumps. Paywall: Free signup · Paid · Upgrade · Named tier —
per-gate heading, pitch and secondary line authored; the tier name is Ghost data, plain-text-locked.

**Simulate scroll.** One switcher entry (not a scrubber) for scroll-triggered elements: renders the
post-threshold state (A24's condensed sticky bar, A27's in-view carousel) with the surrounding article
dimmed as editor chrome. Threshold values stay the category's own and are not editable here.

**Accessibility.** The pill is a menu button ("Section state: Invalid"); switching announces the new
state; inline-editable fields in a state are reachable in normal canvas tab order.

**Flagged ⚑** — mine: the "— at rest" annotation, the composition rule with View as, the dim treatment
under simulate scroll.

---

## P0·7 · S14 Editor Cards (new screen)

Koenig cards are styled **once per project, not per post**. Reached from the S4 editor's left
navigation (Pages · Layers · **Editor cards**) and from Theme Settings.

**Entry point (S14d).** The three surface links sit in one group above the per-page Layers list, divided
by a rule; Editor cards carries an amber count of customised cards (absent at zero — never "0") and
`aria-current="page"` when active. Editor cards is project-level, so it does not change with the page
switcher; Theme Settings → Editor cards lands on the same screen with the last-viewed card selected.

**Card selected (S14e).** Selection uses the canvas's own accent ring plus a card-name tag — the same
selection chrome sections use. Panel status is the **customised** pill alone, and it clears with the reset.

**Chrome.** Two dropdowns in the template-switcher position: **Treatment** (the six A33 whole-set
styles — Plain · Card · Panel · Wide · Full Bleed · Contrast Band — one active per project) then
**Card** (all twenty Koenig cards, Ghost's order: image, markdown, HTML, gallery, divider, bookmark,
email content, call to action, public preview, button, callout, GIF, toggle, audio, video, file,
product, header, embeds, signup). A **customised** badge marks any card the user changed, in the
dropdown and in a left-rail "Customised" list. View as and Ship it unchanged from S4.

**Canvas.** The chosen card rendered inside the style-guide post fixture (C.4) at reading width, live
in the project's Style Pack. Switching treatment re-renders the fixture; a card override the new
treatment claims (e.g. plane) is dropped with a one-line notice in the panel — never silently kept and
outvoted.

**Right sidebar — the card's own panel.** 4–7 controls, named values only, plus a read-only
**"From the {treatment} treatment"** block (plane · space around · corners) so a user sees where a
value came from, plus **Reset to Ghost default** per card. Callout, as drawn: Callout colours
(Pack tokens · Ghost's palette) · Background role (Base · Surface · Tint · Accent) · Emoji (show/hide)
· Emoji size (Small · Large).

**Colour controls are never offered for header, signup and CTA cards** ⚑ — the post author sets their
colours inline in Ghost's editor, and a control that silently loses to an inline style is worse than
none. Stated on the frame, in those cards' dropdown rows (`NO COLOUR CTLS`) and in their panels.

**Reset confirm.** Per card, one step (undoable from the editor's undo stack): names the change count
and the changed controls; second sentence always "Posts keep their content." No whole-set reset exists.

**Flagged ⚑** — the brief's callout example lists "radius", but A33's floor rules corners read-only
from the pack token in every treatment; this screen follows A33 and shows Corners in the read-only
block. Also mine: the Customised left-rail list, the override-drop notice, the no-whole-set-reset
ruling.

---

## P0·8 · Library-wide rules (no frames)

1. **Every "Preview" control is removed from every control panel in the library.** Previewing is the
   editor's global affordance — View as for audiences, the P0·6 state switcher for states. Category
   patches list each removed control by name.
2. **The 4–7-controls norm is lifted where this pass adds controls**: the ceiling is the PRD's
   **≈15 visible controls per design**, plus the 3 universal controls and the Data group. Quick
   Controls stay the 3–5 highest-impact.
3. **Named values only, everywhere** — never px, hex or free CSS. A value that would fail contrast is
   disabled with its ratio shown, never silently allowed (the A2 rule, restated as library-wide).
4. **Any new behaviour must name a module from the fixed registry** (`marquee`, `rotator`, `dismiss`,
   `mode-toggle`, `search-overlay`, `price-toggle`, `member-form`, `lightbox`, `countdown`, `count-up`,
   `accordion`, `tabs`, `carousel`, `share`, `filter-strip`…). If an instruction needs behaviour no
   module covers, mark it **"ARCHITECT: registry addition"** on the frame and in the spec and design
   the no-JS state — never invent a module name. The primitives themselves are editor software, not
   theme behaviour, and declare no modules ⚑; what they *write* (e.g. P0·4's member checks) compiles
   server-side with no module needed.

---

## Component inventory

For the category patches to cite by name.

| Component | What it is | First established |
|---|---|---|
| Inline text toolbar | 5-action floating toolbar over any text selection; docks at 390 | P0·1 |
| Link popover | Ghost-aware link picker: pages/posts/tags/authors live-searched, Portal chips, URL/email, new-tab + rel toggles | P0·1 |
| Plain-text lock pill | the pill naming a Ghost binding where the toolbar would sit | P0·1 |
| Icon slot | the only place an icon can exist; dashed 20 px empty state while selected | P0·2 |
| Icon Picker | searchable Tabler grid: chips, recent row, no-match sentence | P0·2 |
| Icon slot popover | swap · Size S/M/L · Colour role ×4 · Remove | P0·2 |
| Button icon option | Before/After icon on any button; Small, label-coloured | P0·2 |
| Authored item list | drag rows + overflow (Duplicate·Remove) + Add-with-placeholder + range line | P0·3 |
| Ghost-sourced list card | count + order over read-only rows, "From Ghost" mark | P0·3 |
| Partial-display line | "8 items · 3 shown in this design" + 55 % dim | P0·3 |
| Member action editor | per-action Logged out/Free/Paid: Show · Label · Link | P0·4 |
| Scope tags | SECTION vs ONE ACTION labels disambiguating visibility from actions | P0·4 |
| Audience-hidden ghost | 40 % ghost + "Hidden for this audience" pill under View as | P0·4 |
| Populate-from panel | Source · Filter (5) · Count · Order · meta chips, with tag/author/hand-picked states | P0·5 |
| State switcher | contextual State pill in canvas chrome beside View as | P0·6 |
| Simulate-scroll entry | post-threshold render for scroll-triggered elements | P0·6 |
| S14 Editor Cards screen | treatment + card dropdowns, fixture canvas, per-card panel | P0·7 (S14) |
| Customised badge | amber pill marking changed cards, dropdown + left rail + nav count | P0·7 (S14) |
| Surface switcher | Pages · Layers · Editor cards group above the Layers list, with customised count | P0·7 (S14d) |
| Treatment read-only block | "From the {treatment} treatment" rows in per-card panels | P0·7 (S14), after A33 |
| Reset-to-default confirm | per-card confirm naming count + controls, "Posts keep their content." | P0·7 (S14) |
| Stepper | − / value / + compact number control | P0·3 (drawn), P0·5 (named values rule applies: steppers are for counts only) |

— End of specification —
