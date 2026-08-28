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
  (`account/plans`) — then a **SITE** group holding one chip, **Ghost search** (Part B·B1), which
  points any button or link at Ghost's own search so opening search needs no new control anywhere in
  the library. A pasted URL or typed email bypasses search and shows one "Link to …" row.
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

**Typed tokens.** A text field that accepts placeholder tokens **shows the exact list it accepts**,
as mono chips under the field, and each chip inserts at the cursor. The list is the field's own — a
field with no tokens shows no row, and there is no global token vocabulary. **Anything else in braces
stays literal**: `{this}` prints as `{this}`. Tokens resolve server-side; a token with no value
prints nothing, and the sentence around it must still read. Tokens are plain text, so the toolbar is
unaffected. Drawn field: `{total_members}` · `{total_paid_members}` · `{site_title}` — Ghost's own
helpers. **Both member counts return a rounded, human figure** ("1,200+" for 1,225; "100k+" higher up),
never an exact number, so no copy may imply one; the field's helper says so and the frame shows the
rendered line beside the authored one. A10's Ghost-sourced member stats read the same two helpers.

**⌘K is retained here** ⚑. Part B·B5 retires Ctrl-K on the **published site**, where Ghost's own
search binds it. Inflozo's editor is not a Ghost site and no section design binds the key; the Link
action keeps it.

**Flagged ⚑** — the five-action vocabulary and plain-text-lock are the brief's; mine: the docked-bar
treatment at 390, external URLs defaulting "Open in new tab" on, Portal actions as chips, the lock
pill's wording, the 48 px flip threshold, the token-chip row and its literal-braces rule.

---

## P0·2 · Icon slot + Icon Picker

Icons exist **only in icon slots** a design declares. A slot is **filled** (shows its icon) or
**empty** — a dashed 20 px placeholder (1.5 px dashed border, plus glyph, editor placeholder grey)
visible **only while the section is selected**. On the live site an empty slot renders nothing and
siblings shift; the layout never reserves the filled size.

**Library ruling ⚑.** The set is **a curated set from Tabler Icons** (MIT) — not the whole library —
and the picker **names it that way in its own header**, with one stroke weight and one grid so any two
icons sit together. Its `brand-*` glyphs cover the social rows. The PRD's Lucide reference is **amended** — Lucide 1.0 removed all brand icons. Drawn
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

**Social glyphs — exactly nine.** The Social group holds the nine platforms **Ghost keeps a field
for**: Facebook · X · LinkedIn · Bluesky · Threads · Mastodon · TikTok · YouTube · Instagram. A tenth
brand glyph would point at a link Ghost has nowhere to store. **Version note — settled this pass ⚑:**
Facebook and X have always existed. The other seven arrived **for staff profiles in Ghost 5.118.0**
(announced 28 April 2025) and **for the site itself in Ghost 6.38.0** (released 13 May 2026, announced
4 June 2026). **The "all nine from 6.36" figure in A1·0·8 is wrong** and should be corrected to 6.38.0
when A1 next runs; A21 may proceed on 6.38.0. There are **two separate sets of the same nine fields** —
the site's own accounts and each staff profile's: a header or footer row reads the site's, an author
block reads that person's. Ghost 6.38.0 also shipped a **block helper that loops over whichever
accounts are filled in**, so a social row is one loop rather than nine hard-coded checks; it still
reports X under its old name, `twitter`, so **the icon set maps that key to the X glyph** ⚑.
On an older server the seven resolve to nothing and their rows do not render, per each category's
empty rule. Links are read through **Ghost's own social-URL helper, never printed raw** — the rule
A21 also carries for author social links. The frames draw placement cells, not hand-drawn brand
marks ⚑; production ships Tabler's glyphs verbatim.
Brand glyphs come from the same picker's Social / Brands group. Display form —
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
- **How many is always a number picker (Part A·A5).** Item counts are a stepper — never a fixed row
  of buttons ("Three · Four · Six"). A design may cap its own maximum, and the panel **states the
  reason** ("This grid tops out at 24 posts."); a value a design locks out is drawn **disabled with
  its reason readable**. A design may **advise** at a count ("at this count, 1 Row reads better") and
  may never switch itself (Part A·A8). **⚑ Interpretation, flagged:** A5 governs how many *items*
  (posts, tiers, logos, steps, figures), not how many *columns* or *per row*, which are arrangements
  and keep their named segmented values — logged as an open question below.
- Range line in the group header, mono: `2–6 · 4 used`. **At max:** Add disables (dashed border fades,
  label placeholder-grey) with a one-sentence reason below ("The ticker holds 6 messages. Remove one
  to add another."); Duplicate disables too. **At min (Part A·A2):** the Remove control **stays visible
  and fully active**. Clicking it answers with the floor and the reason in one sentence, as text under
  the list, in the category's own words — "A ticker needs at least 2 messages. Edit this one instead,
  or add a third and then remove it." / "A pricing table needs at least two tiers." It is **never
  dimmed, never hidden, never a disabled menu item**, and the sentence clears on the next edit. The
  previously drawn disabled-Remove treatment is withdrawn here and in every category panel that draws
  a list.
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

**The ask is conditional (Part A·A9).** Every sign-up, subscribe and paid-tier action carries a panel
note: **it does not render when the connected site has self-signup switched off, or has no payment
provider connected** for a paid ask. Every action whose link opens Ghost's Portal carries a second
line: **with JavaScript off, nothing happens.** Both are part of the action card, not a one-time tip.

**The no-JavaScript form notice (Part A·A10), designed once here.** Tested against both live servers:
Ghost's signup endpoint will not accept a plain form submission, so a subscribe or sign-in form is
**JavaScript-required**. Where script is unavailable the form is **replaced by a designed notice at
the same band height** — the page does not jump — carrying a heading and one sentence, both authored
fields with the drawn copy as their default: "Signing up needs JavaScript" / "It is switched off in
this browser, so the form would not reach us. Turn it on and the form appears here." **Two sizes and
no more:** the band notice, and a **slim one-line variant** for announcement bars, footer rows and any
band under 60 px. **The notice never carries a button** — every destination it could offer is also
Portal. It is reused by name in **A2, A3, A6, A16, A22, A30, A31's gate and A32**, and appears in the
P0·6 switcher as the **No JavaScript** state. **Sent / error / loading / subscribed states are
unchanged** — Ghost's own script applies those; what was withdrawn is the claim that anything here
works without JavaScript ⚑.

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
| — Hand-picked | search-and-pick post list: drag reorders, × unpicks; **Count and Order hide** — the picked list is the count and the order. **No maximum**: past 25 picks the count turns warning-toned and a sentence names the cost — every pick adds a database query, **on every page this section appears on**, not once per section; three sections of this size means 75 database queries and about three-quarters of a second added to every visitor's load. The warning names those figures. The warning **names the measured figures**: three hand-picked sections at 25 each is **75 database queries, about three-quarters of a second** added to every visitor's page load. Nothing is blocked. An unpublished pick drops out server-side; its row stays with an "Unpublished" note |
| Count | stepper, 1–{design max}, **hard cap 100** |
| Order | Newest · Oldest |
| Meta toggles | chips, per-design: only the fields this design can place — from date · author · excerpt · reading time · tag chip |

**Constraints (library-wide, stated once).**
- The **Count stepper** caps at 100. **Hand-picked has no maximum** — it warns past 25, and the warning names the measured cost per page: 75 queries and roughly three-quarters of a second for three sections of 25 (above).
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
expired / subscribed** (A16, A22, A30) · **No JavaScript**, on every design that declares a form
(A2, A3, A6, A16, A22, A30, A31, A32) · **Signed out**, on the account designs (A30) · the paywall's
four gates (A32) · the error pages' three copy sets (A31) · scroll-triggered bars (A24 sticky, A27
carousel). **Search's three states leave the list with A23** (Part B·B1).

**The two states this pass adds.** *No JavaScript* renders P0·4's notice in place, so its heading and
sentence are editable there; it is offered on sections that declare a form and on no others. *Signed
out* renders the account page **as Ghost serves it to an anonymous visitor — Ghost does not redirect
them** ⚑; A30 owns the finished design of that state for each of its thirteen, and the switcher entry
is defined here. Neither prints a member's name or email. Both compose with View as, and both are
previews: per session, never a setting.

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
**Card** (the **nineteen** stylable Koenig cards, Ghost's order: image, markdown, HTML, gallery,
divider, bookmark, email content, call to action, button, callout, GIF, toggle, audio, video, file,
product, header, embeds, signup). **Public preview is not in the list** — Ghost leaves only an
invisible comment at the paywall cut, so there is no element to style (A33 patch). A **customised** badge marks any card the user changed, in the
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

**What A33's patch removes from this screen.** The **HTML card** leaves the target list of both the
Rules control and the Contrast Band — it emits no wrapper element, so those controls would do nothing
for it, and its rows say so. **Gallery and embed cards lose Full bleed**: Ghost fixes their width and
we may not override it, so bleed applies to images and video only. **Signup, call-to-action and header
cards leave the Contrast Band's inversion list** — the band's background may run behind them, their
surfaces stay as the post author set them inline. **This screen controls no translatable strings** ⚑ —
those live inside Ghost's own renderer.

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
4. **Avatars with no photograph (Part A·A1).** A list the user types themselves keeps **two initials**
   ("JD"). An author pulled from Ghost shows **one letter** ("J") — Ghost gives a theme no way to
   produce two initials from a name.
5. **Scale labels (Part A·A3).** A slider's **title** says what it affects; its three values reuse the
   standard words. "Card padding: Compact · Comfortable · Spacious" is correct. No new three-word
   vocabulary per slider.
6. **Gap names are Tight · Normal · Loose (Part A·A4)**, library-wide. Any Tight/Even/Airy or
   Tight/Standard/Wide is replaced.
7. **Universal controls may offer fewer values and must say why (Part A·A6).** A design may hide
   choices that would break it — "this design is always on a contrast background" — and may **never
   rename a universal control or add values to it**. The colour swatch row is named **Base**. **There
   is no "Inherit" value anywhere in the library**; it is removed wherever it was drawn.
8. **No design ever turns into another design (Part A·A8).** Every "below this width it draws as design
   1" / "with no image it becomes the solid header" clause is deleted. A placed design is the design
   that renders: it **hides what does not apply** (a sideways-scrolling row whose track fits shows no
   arrows and no fade), and the panel may **advise** — never switch. Per the owner's ruling of this
   pass this applies in **all 33 categories**, including those A8's own list does not name.
   **What a design may do instead — the four permitted moves, so "never switch" is not read as "never
   adapt" ⚑:** **reflow** (columns stack, a row wraps), **hide** (a part that cannot fit goes, and its
   neighbours close up), **scroll** (a row becomes a swipeable track with its own arrows and fade), and
   **collapse** (a nav folds into a menu button, a set of panels into an accordion). All four keep the
   design's own type, colour, spacing and claim, which is what makes them not a substitution.
   **Every design is responsive by its own means at every width — responsiveness is a requirement, not
   a control.** A design's written spec says in words what it does at 834 and at 390, and its frame set
   includes both, so a design that cannot hold together at 390 is caught while it is being drawn.
   **If one cannot:** it is **redrawn with its own narrow arrangement** (still one design, specced and
   framed as part of it) or, if even that fails, **the design is cut and its number retired**. It is
   never quietly served as a different design.
9. **Member asks are conditional and Portal needs JavaScript (Part A·A9, A10).** See P0·4 for the
   panel notes and the no-JavaScript form notice.
10. **Ctrl-K is unbound on the published site (Part B·B5).** No design may bind it — Ghost's own search
    already does, on every site. The command-palette behaviour is gone with A23. The editor's own ⌘K
    (P0·1's Link action) is unaffected.
11. **Any new behaviour must name a module from the fixed registry** (`marquee`, `rotator`, `dismiss`,
   `mode-toggle`, `search-overlay`, `price-toggle`, `member-form`, `lightbox`, `countdown`, `count-up`,
   `accordion`, `tabs`, `carousel`, `share`, `filter-strip`…). If an instruction needs behaviour no
   module covers, mark it **"ARCHITECT: registry addition"** on the frame and in the spec and design
   the no-JS state — never invent a module name. The primitives themselves are editor software, not
   theme behaviour, and declare no modules ⚑; what they *write* (e.g. P0·4's member checks) compiles
   server-side with no module needed.
12. **One toggle per thing — no compound values (the owner's ruling, Headers pass).** A control whose
   values combine two or more independent things with a "+" is **not one control — it is one toggle
   per thing**, drawn as a **labelled group** with the group's name above the switches. "Links + note +
   social", "Nav + Subscribe", "Search + RSS + Dark mode" and "Icon + label" each hid two or three
   separate decisions behind a list of the combinations that happened to be drawn, so an editor who
   wanted an unusual pair had to hunt for it or do without. **Panels may gain rows; the editor gains
   granular control — that trade is accepted.** A **single-axis** choice stays one control, because it
   names one thing with several settings: a **form**, a **width**, a **placement**, a **ladder**, a
   **ground**, a **treatment**, a **behaviour state**. Whatever a design always draws states itself in
   the panel and takes no switch. A group with a **floor keeps its last toggle on**, refusing to switch
   off with the reason shown, in rule 2's words. **Not applied to the shared Actions control**
   (None · Sign in · Subscribe · Sign in + Subscribe) ⚑ — it is compound and library-wide, so it is
   put to the owner as an open question in the Headers spec rather than re-cut here.

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
| Stepper | − / value / + compact number control; **every item count is one** (A5), with caps and locked values drawn disabled and reasoned | P0·3 (drawn), P0·5 |
| Minimum-reached explanation | the sentence a fully active Remove produces at a list's floor (A2) | P0·3 |
| Token chip row | the exact list of tokens a text field accepts; everything else in braces stays literal | P0·1 |
| Conditional-ask notes | "does not render without self-signup / a payment provider" + "Portal: with JavaScript off, nothing happens" | P0·4 |
| No-JavaScript form notice | the designed replacement for a form that cannot run — band and slim variants, same height, no button | P0·4 |
| No JavaScript state | switcher entry rendering the notice in place for inline editing | P0·6 |
| Signed-out account state | switcher entry for the account page as an anonymous visitor receives it | P0·6 |

## Patch notes

Every change carries the **name** of the rule that required it. Frames updated: `P0-1 Inline Text
Toolbar` · `P0-2 Icon Slot and Picker` · `P0-3 Item List Controls` · `P0-4 Member Action Editor` ·
`P0-5 Populate From Panel` · `P0-6 Editor State Switcher`.

| Rule | Change |
|---|---|
| Avatars with no photograph | Initials split: two letters for a list the user types, **one** letter for an author pulled from Ghost (P0·8). |
| The Remove button never greys out | P0·3's disabled-Remove-at-minimum is withdrawn. The control stays visible and fully active; clicking it at the floor produces the floor and the reason as one sentence of text under the list. New frame: *remove at minimum*. |
| Slider labels | A slider's title says what it affects; its three values reuse the standard words. Added to P0·8. |
| Gap names are "Tight · Normal · Loose" | Fixed library-wide; any Tight/Even/Airy or Tight/Standard/Wide is replaced (P0·8). |
| Item counts are a number picker | Every item count is a stepper, never a row of fixed buttons. New frame: *counts are number pickers* — a design's own cap with its reason, and a locked value drawn greyed with the reason readable. |
| A design may offer fewer choices on a shared control, and must say why | Universals may narrow with a stated reason and may never be renamed or extended; the swatch row is **Base**; **there is no "Inherit" value anywhere** (P0·8). |
| No design ever turns into another design | Hand-off abolished in **all 33 categories** per the owner's ruling (P0·8, rule 8). A section hides what does not apply, and the panel may advise at a count; it may never switch. |
| Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript | Conditional-ask notes added to every member action in P0·4 — self-signup off, no payment provider — plus the Portal line: with JavaScript off, nothing happens. |
| The no-JavaScript notice | Designed once in P0·4 (band + slim variants, same band height, no button) and added to the P0·6 switcher as *No JavaScript*. Sent / error / loading / subscribed states untouched — only the "works without JavaScript" promise was withdrawn. |
| Mark the two free designs | **Not applicable here.** These are the shared editor controls, not placeable designs, so there is no roster to mark. Recorded so the omission is not read as a miss; every design category marks its own two. |
| The Search category is deleted | Its fifteen frames, spec, build files and session prompt are removed; search's three states leave the P0·6 vocabulary. Also deleted: **A1·9 Search-Forward** and **A4·15 Search**. All three numbers stay permanently retired. |
| Ctrl-K belongs to Ghost's own search | Unbound on the published site (P0·8, rule 10); the command palette went with the Search category; the editor's own ⌘K (the Link action) is retained and flagged. |
| The signed-out account page | Added to the switcher as a state; the Members Pages category owns the finished design of it per design. No design prints a member's name or email. |
| The editor-cards screen | P0·7 (S14): **public preview leaves the card list — nineteen, not twenty**; the HTML card leaves the Rules and Contrast Band target lists; gallery and embed cards lose Full bleed; signup / call-to-action / header cards leave the Contrast Band inversion list; the screen controls **no translatable strings**. |
| Hand-picked posts have no maximum | No cap at all — the earlier twelve was withdrawn after measurement. The field warns past 25 and the warning states the cost **per page, not per section**, now with the measured figures named: three hand-picked sections at 25 each is **75 database queries, about three-quarters of a second** on every visitor's page load (P0·5, new frame; the warning state is drawn). |
| Fields that accept a placeholder token | The field shows the exact list of tokens it accepts as mono chips; anything else in braces stays literal text (P0·1, new frame). |
| Icons are Tabler throughout | The picker names itself a curated set from Tabler Icons in its own header, and its Social group is exactly the **nine** platforms Ghost keeps a field for (P0·2, new frame). |
| Icons are Tabler throughout | **Social versions settled:** the seven added platforms arrived for staff profiles in Ghost 5.118.0 (28 April 2025) and for the site in Ghost 6.38.0 (13 May 2026, announced 4 June 2026). The "6.36" figure elsewhere in the library is wrong. Recorded with the two-sets-of-fields distinction and the helper's legacy `twitter` key (P0·2). |

| One toggle per thing (new, from the Headers pass) | **Compound "A + B" control values are split into one toggle per thing**, in a labelled group; single-axis choices (form, width, placement, ladder, ground, treatment, behaviour state) stay as they are; a group with a floor keeps its last toggle on with the reason shown. Recorded as rule 12 above. **The shared Actions control is the one compound value not yet split** ⚑ — with the owner. |

### Open questions

1. ~~A5 and arrangement controls.~~ **Confirmed by the owner:** A5 covers *how many items* only.
   **Columns and per-row controls keep their named segmented values** in every category.
2. ~~`{member_count}` needs a source.~~ **Closed by the owner:** Ghost has native
   `{{total_members}}` and `{{total_paid_members}}` helpers, so the tokens are
   `{total_members}` and `{total_paid_members}`. Both return **rounded** figures ("1,200+",
   "100k+"), which is now stated in P0·1 and drawn on the frame. A10 should be checked against the
   same fact when it runs — an exact-number stat pulled from Ghost is not available.
3. ~~The per-page cost figures.~~ **Closed:** the measured figures arrived and are now named in the
   warning — three sections of 25 is 75 queries, about three-quarters of a second per visitor page
   load. The per-page framing is unchanged; the figures sit inside it.
4. **A8 versus §7.8 of the master brief. Ruled by the owner this pass: strike §7.8.** The
   session-brief files in this project already carry the rule and do **not** carry §7.8's permission,
   so the strike is needed only in the owner's own master brief, which is not a file here. Replacement
   wording, to paste in §7.8's place: *"A placed design is the design that renders. It may reflow, hide,
   scroll or collapse to fit any width; it may never be served as a different design. A design that
   cannot hold together at 390 is redrawn with its own narrow arrangement, or cut."* The four permitted
   moves and the redraw-or-cut rule are now stated in P0·8, rule 8.
   **Still outstanding elsewhere:** hand-off language remains drawn in already-finished categories —
   A6·13, A8·14, A9·4, A19·7 and A29's build files each name a design they hand off to. Those are
   their own categories' patches; they are recorded here so the list is not lost.
5. **A2's floor sentences.** Each category supplies its own, and **one clause only** (owner's ruling):
   "A pricing table needs at least two tiers." · "A bar needs at least one message." No floor sentence
   points the user at another control. Two are drawn here as examples; the rest arrive with their
   categories.

— End of specification —
