# P0 · Editor Primitives — written specification

Drawn 24 August 2026 · Paper pack, S4 editor chrome. This pass designs the repeating fixes from the
controls-reconciliation audit **once**, as shared editor primitives. Every category patch that follows
reuses them **by name** and never redesigns them.

Frames: `P0-0 Greyed Control Pattern` · `P0-1 Inline Text Toolbar` · `P0-2 Icon Slot and Picker` ·
`P0-3 Item List Controls` · `P0-4 Member Action Editor` · `P0-5 Populate From Panel` ·
`P0-6 Editor State Switcher` · `S14 Editor Cards` (all `.dc.html`).

Everything here is drawn from A1's established components verbatim (primary button, icon button,
dropdown panel, segmented control, toggle) and the S4 chrome (top-bar pills, sidebar groups, selection
ring, section badge). Where this file and a drawn frame disagree, the frame is wrong and this file wins.

---

## P0·0 · The greyed-control pattern

Drawn once here. Every category points at this frame instead of inventing a treatment, and supplies only
its own sentence. **The numbering of P0·1–P0·8 is untouched** — this section is added ahead of them, and
no existing number moved.

**A control switched off by another is greyed, with the reason beside it.** Never hidden, and never left
accepting a value it will not honour. A control that vanishes teaches nothing — the user cannot tell a
rule from a bug — and one that silently ignores you is worse.

**The greyed state.** Label and values go placeholder-grey; field fills and borders go to the disabled
pair; the cursor is `not-allowed`; the control is not focusable for editing. **The value in force stays
legible** — a greyed segmented control keeps its pill on the value that actually renders, a greyed toggle
shows the state in force rather than the state the user last chose ⚑, a greyed stepper shows the number
that will render. Nothing is removed from the row, and the row does not move.

**A single value switched off inside a control that stays live takes the same greyed treatment** —
placeholder-grey `#A8A29A`, `cursor: not-allowed`, not selectable — while the rest of the control
behaves normally and the pill sits on the value in force. **Owner-ruled, 31 August 2026: one grey, one
meaning.** A lighter second grey meaning "one value unavailable" as against "whole control off" was
refused, on the ground that the difference cannot be explained in a sentence. Categories that had drawn
a disabled value at another value correct it to this one.

**Where the sentence sits.** Directly under the control it explains, inside that control's own row group,
at panel body size in the muted role. **Not a tooltip, not a help icon, not a footnote at the foot of the
panel.** One sentence, present tense, naming the control that switched it off — "Not available while the
media uses the accent colour." The panel grows by the height of the sentence, which is why the sentence
is one line or two and never a paragraph.

**The shapes it covers.** Select · segmented · toggle · swatch row · stepper. All five grey the same way
and are drawn together on the frame, so a category never has to derive one.

**Where the reason lives, owner-ruled 1 September 2026.** **It ships in this shared control
definition, not per category as each one is patched** — every category will need it, and the
per-category route produces eight variants of one field. **Every greyed row carries a reason string
on the control, written per design** — a greyed state, a struck value, that string and a named
fallback, as one mechanism the build provides once. **It is the same mechanism a locked row already
needed**, and it is now owed by every greyed row rather than only by a locked one: A19 alone has ten
cases across nine designs plus two on every design in the category. **The alternatives he refused:**
a fixed library of standard reasons — the sentences are per design and would flatten into
uselessness — and leaving each panel to write its own, which is how a greyed row ends up with no
explanation and a rule reads as a bug.

**Accessibility.** A greyed control is announced with its value and its reason as one string ("Overlay
tint, Soft dark, unavailable — not available while the media uses the accent colour"). The reason is
text in the panel, so it is reachable by reading order as well as by focus.

**The one exception, and it is different in kind.** A control **this project can never offer** is not
drawn at all, and the panel says why in one note where the control would have been. The test is
permanence: a control another control switched off comes back when that control changes, so it waits in
place, greyed; a control that never comes back would be a permanently grey row, which is furniture the
user learns to ignore. **The visitor dark-mode switch under a pinned colour scheme is the only current
case.** A category that believes it has a second one puts it to the owner rather than drawing it.

**What this pattern does not reach.** Three things, all owner-ruled.

1. **A mode, as against a switched-off control.** A control that belongs to a mode the user is not in is
   **absent**; a control that belongs to this mode but is currently unavailable is **greyed with its
   reason**. Greying a control that has no meaning in the current mode is its own confusion. The absent
   cases in this library are: P0·5's filter block under Source = Static, ~~P0·5's Count and Order under
   Filter = Hand-picked (the picked list *is* the count and the order)~~ **— moved to the greyed side
   by the owner on 1 September 2026, see below —** P0·2's Recent row when nothing
   has been picked yet, and the Add / Remove / drag controls on a Ghost-sourced list in P0·3. A category
   that thinks it has a new absent case states which side of this line it falls on, in words, in its own
   spec. **⚑ Amended by the owner, 1 September 2026 — P0·5's Count and Order at Hand-picked are greyed
   with the reason at the control, not absent.** A18 and A19 have shipped the greyed form since their
   reconciliation passes, and **both readings passed the test above**: the two rows belong to the
   Hand-picked mode as much as they are switched off inside it. He took the greyed one because
   **they are rows a user expects to find** — unlike the picker, which exists only once you are in
   that mode. **One panel changes rather than two shipped categories**, and no A18 or A19 frame
   redraws. The picker itself is settled the other way: it is a mode, and this pattern does not reach
   it.
2. **The inline text toolbar (P0·1).** A mark a field does not permit is **absent** from the toolbar,
   not greyed. A floating toolbar over a text selection has no room for a sentence, and the mark never
   returns for that field — the same permanence test the never-offered exception uses. The per-prop mark
   allowlist as written stands; this rule carries the carve-out rather than the allowlist carrying an
   apology.
3. **The Remove button (P0·3).** Remove is switched off by nothing — its floor is a rule about content
   the user owns — so it stays fully clickable and answers **after** the click. A control switched off by
   another control is answered **before** the click, because the user cannot act on it at all. Both
   answers are a sentence in the panel; neither is a tooltip.

**Flagged ⚑** — the pattern and its exception are the owner's; mine: the exact greyed palette pair, the
five shapes drawn together, the in-force-value rule on toggles and segmented controls, the announcement
string.

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

**Not every field permits every mark, and the toolbar says so** ⚑ *(the per-prop mark allowlist —
AD-4 carries the rule, this is how the editor shows it)*. The default set for a text field is the
four above: **bold, italic, underline, link**. A field may **narrow** that set, and its own category
spec declares the narrowing; a field may never gain a mark AD-4 does not define, except where the
PRD records a delta.

- **A mark a field does not permit is not drawn in its toolbar at all** — not greyed. Greying is for
  a mark that exists here and is unavailable right now (Remove link with nothing linked); absence is
  for a mark this field never has. An editor should not learn a button and then find it dead.
- **The toolbar therefore varies in width by field**, which is why its buttons are a fixed order:
  a field permitting only bold and link draws two buttons in the same order as a field permitting
  four, so the shapes stay recognisable.
- **Two narrowings are on record today**, both from the reconciliation and both stated in their own
  specs: **Testimonials' quote fields permit NO marks** — a pull quote is typographic, and emphasis
  inside one fights the design that carries it — and **FAQ's answer fields add `code`**, which is a
  PRD delta recorded in that category's settlement 3 rather than smoothed over.
- **Where a spec says nothing, the default four apply.** Silence is not a narrowing.

> **This block is maintained in the repository, not in Claude Design** — it is re-applied by
> `tools/reapply-export-edits.py` after every export and gated by `tools/verify-design-pass.py`.
> A Claude Design session cannot preserve it, because its project copy has never held it.


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
the label. Slot rules apply; button icons are always Small and inherit the label colour. **The Size and
Colour rows are drawn greyed with their reason beside them** — "Button icons are always small, so they
sit on the label's line." / "A button icon takes the label's colour." — per the greyed-control pattern
(P0·0). **Owner-ruled this pass:** they were previously hidden; they are controls this popover genuinely
has and this context overrides, which is exactly the case the pattern was written for. The greyed value
shown is the one in force: Small, and the label's colour. 8 px gap to the label; the A1·1 button
otherwise unchanged.

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
  dimmed, never hidden, never a disabled menu item**, and the sentence clears on the next edit. **The
  greyed-control pattern (P0·0) does not reach this control** — that pattern is for a control another
  control switched off, and Remove is switched off by nothing. The
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

## P0·4a · The Actions control — one toggle per action

**Settled by the owner, 31 August 2026, and split library-wide as a scheduled job.** This was the one
compound control left standing after the Headers pass wrote *one toggle per thing* (P0·8, rule 12): it is
shared by every category that carries an action, so it could not be re-cut category by category without
the same control behaving differently in different panels. The owner chose the library-wide split.

**The rule.** Wherever a section offers more than one action, the panel carries a **labelled Actions
group holding one On · Off toggle per action** — never a menu of the combinations someone happened to
draw. Each toggle opens its own **P0·4 member-aware card** (Show · Label · Link per audience). **All
toggles off is the old "None" value**; there is no separate None.

**What it replaces, and the mapping.** Every old value set maps onto switch positions with nothing
gained or lost in what renders:

| Old value set | Where | Becomes |
|---|---|---|
| None · Sign in · Subscribe · Sign in + Subscribe | A1, seven designs | **Sign in** · **Subscribe** |
| Button · Link · Button + link · None | A2·11 | **Button** · **Link** |
| Both · Primary · None | A4, fourteen designs | **Primary action** · **Secondary action** |
| None · Primary | A4·7 | **Primary action** alone — one toggle, and the group says why |
| Both · Primary | A6, eleven designs | **Secondary action** alone — the primary is always drawn |
| Button · Button and email field (· Text link) | A32·1, A32·6 | the form axis stays a control; **Email field** becomes a toggle |

**Three consequences, each already covered by an existing rule rather than a new mechanism.**

1. **A constant is not a toggle.** Where an action is always drawn — A6's primary, A32·6's button — the
   group **states the constant and offers no switch** (P0·8, rule 12's own words). A6's group therefore
   holds one toggle, not two, and A32·6's form row disappeared because splitting the field out left it
   with a single value.
2. **A combination nobody drew is greyed, not invented.** A4's old list never offered a secondary
   without a primary, so **Secondary greys with its reason while Primary is off** — "a secondary action
   needs a primary beside it" — under the greyed-control pattern (P0·0). A1's two actions were each
   drawn alone and stay independent, with no dependency between them.
3. **A group with a floor keeps its last toggle on**, refusing to switch it off with the reason shown,
   in the words of the rule that the Remove button never greys out. No A-category group has hit that
   floor yet; the rule stands for the ones that will.

**What does not become a toggle.** A single-axis choice is still one control: a **form**
(Action: Button · Text link), a **placement** (Actions: At each row · One for the section · None,
A1·11's Pinned to the foot · Under the nav), an **alignment**, a **treatment**. The test is unchanged —
"A + B" in a value name is two things; a list of settings for one thing is one control.

**Flagged ⚑** — the ruling and the schedule are the owner's. Mine: the group's drawn shape (the labelled
mono heading over the switches, matching the split groups the Headers pass already drew), the wording of
each group's constant and dependency sentences, and the decision to grey rather than draw A4's
undrawn primary-off-secondary-on combination.

---

## P0·5 · "Populate from…" data panel

One shared panel — the sidebar **Data** group's entire body — for every section that can draw content
from the user's Ghost site instead of authored content.

**Source** — segmented: **Static (authored) · From posts.** Static: the filter block is absent, not
disabled — a mode the user is not in, which P0·0 keeps absent rather than greyed; the Content group shows
the P0·3 authored list. From posts reveals:

| Control | Values |
|---|---|
| Filter | Latest · Featured · By tag · By author · Hand-picked (select, A1 dropdown panel) |
| — By tag | tag select below the filter: live-searched, tag name + post count. Single pick |
| — By author | author select: avatar + name + post count. Single pick — multi-author feeds belong to routes ⚑ |
| — Hand-picked | search-and-pick post list: drag reorders, × unpicks; **Count and Order grey with the reason at the control** ⚑ *amended 1 September 2026 — they used to hide; A18 and A19 have shipped them greyed* — the picked list is the count and the order. **No maximum**: past 25 picks the count turns warning-toned and a sentence names the cost — every pick adds a database query, **on every page this section appears on**, not once per section; three sections of this size means 75 database queries and about three-quarters of a second added to every visitor's load. The warning names those figures. The warning **names the measured figures**: three hand-picked sections at 25 each is **75 database queries, about three-quarters of a second** added to every visitor's page load. Nothing is blocked. An unpublished pick drops out server-side; its row stays with an "Unpublished" note |
| Count | stepper, 1–{design max}, **hard cap 100** |
| Order | Newest · Oldest |
| Meta toggles | chips, per-design: only the fields this design can place — from date · author · excerpt · reading time · tag chip |

**Constraints (library-wide, stated once).**
- The **Count stepper** caps at 100. **Hand-picked has no maximum** — it warns past 25, and the warning names the measured cost per page: 75 queries and roughly three-quarters of a second for three sections of 25 (above).
- **When nothing matches — Hide the section · Show the latest post. Owner-ruled 1 September 2026:
  this belongs to the panel, not to a category.** A19 drew it first as a fifth query field, and every
  category that asks Ghost for posts has the same zero-item question. It ships here; categories draw
  it and stop owning it.
- **No relative-date filters** — "this month" is route vocabulary (routes.yaml), not section vocabulary.
- **A secondary feed renders nothing at zero items — heading and container together.** An empty
  "More essays" band is a defect the panel prevents by construction. The editor shows the zero state
  as a note in the Data group, not as an empty band on canvas.
- Meta toggles a design lacks a slot for are never offered.
- Tag/author selects live-search past ten entries with the Link Picker's field grammar.

**Accessibility.** The revealed filter block is announced as it appears; selects are comboboxes;
the hand-picked list follows P0·3's keyboard-reorder pattern.

**Initials, drawn here for the whole library.** Wherever this panel or its section shows a person, a
person with no photograph shows initials, and **the two forms are not interchangeable**: **two letters**
where the user typed the name ("Jane Doe" → JD), **one letter** where Ghost supplied it ("Jane Doe" → J).
This is not a style choice — Ghost's template language cannot split a name on the versions this library
supports, so two initials are unreachable for anything Ghost supplies: authors, staff, members. Both
forms are drawn side by side and labelled on the frame so no category has to guess which it is looking
at. Same circle, same ground, same type; only the letter count differs. A person with a photograph never
shows initials, and no fallback ever shows a silhouette glyph. The library-wide statement is P0·8, rule 4.

**Flagged ⚑** — the control vocabulary and constraints are the brief's; mine: hand-picked greying
Count/Order (the owner amended this from hiding on 1 September 2026), the single-pick rulings, the unpublished-row note.

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
   produce two initials from a name. **The two forms are not interchangeable and are never mixed inside
   one component**: a team grid of typed people is JD throughout, an author row of Ghost people is J
   throughout, and a section that can switch source switches form with it, whole. A typed name of one
   word ("Madonna") yields one letter; that is the string, not the rule. A person with a photograph never
   shows initials, and no fallback ever shows a silhouette glyph. Both forms are drawn in P0·5.
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
   `mode-toggle`, `price-toggle`, `member-form`, `lightbox`, `countdown`, `count-up`,
   `accordion`, `tabs`, `carousel`, `share`, `filter-strip`, `nav-transform`, `contact-form`,
   `group-headings`…). **Retired and not nameable:** `search-overlay`, `search-expand` and
   `command-palette` all went with the Search category (rule 10) — no design may declare them. If an instruction needs behaviour no
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
   off with the reason shown, in rule 2's words. **Now applied to the shared Actions control too** (formerly None · Sign in · Subscribe · Sign in + Subscribe) — it was held back as compound and library-wide, the owner scheduled the split on 31 August 2026, and it is done. The canonical definition, the value mapping and the three consequences are **P0·4a**; the designs touched are in the migration record.
13. **A control switched off by another is greyed, with the reason beside it (new this pass).** Greyed,
   never hidden, and never left accepting a value it will not honour; the reason is a short sentence at
   the control, not a tooltip. The pattern, its five shapes and its accessibility string are **P0·0** —
   categories cite that frame and supply only their own sentence. **Three carve-outs, all owner-ruled
   and all stated in P0·0:** a control belonging to a **mode** the user is not in is absent, not greyed;
   the **inline text toolbar** omits a mark a field does not permit rather than greying it; and the
   **Remove button** never greys (rule below). **One exception of a different kind:** a control this
   project can *never* offer is not drawn at all and the panel says why — the visitor dark-mode switch
   under a pinned colour scheme is the only current case.
14. **The Remove button never greys out.** Unchanged, and restated here because it is the reference case
   rule 13 points at. Remove stays visible and fully clickable at a list's floor, and clicking it
   produces the floor and the reason as one sentence under the list (P0·3).
15. **A count that picks between drawn layouts is a named set, not a number picker (new this pass).**
   The test is whether every value has a frame somebody has actually looked at. "How many items to show"
   stays a number picker (A5, P0·3). "Which of three drawn arrangements" is three named values. Neither
   is ever converted into the other.
16. **A design may declare the width below which its script runs (new this pass).** Written in the
   design's own words as a width — "collapses into sections under 768". Where a design declares one, its
   **no-JavaScript line must describe the state on both sides of that width**, not only the narrow one.
   The primitives themselves declare no modules (rule 11), so no P0 frame declares a width; the rule is
   recorded here because every category inherits this list.

---

## Component inventory

For the category patches to cite by name.

| Component | What it is | First established |
|---|---|---|
| Greyed control | a control another control switched off: greyed, the value in force still legible, the reason as a sentence under it | P0·0 |
| Never-offered note | the single note that sits where a control this project can never offer would have been | P0·0 |
| Initials avatar | two letters for a name the user typed, one letter for a name Ghost supplied; never mixed in one component | P0·5 |
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

### Correction pass — 28 August 2026

| What | Change |
|---|---|
| Rule 11 still listed a deleted module | `search-overlay` is **removed from the registry list**. It went with the Search category, which rule 10 already records, and every category reads this list to learn what it may declare. `search-expand` and `command-palette` were already absent; all three are now **named as retired and not nameable**, so a later session cannot reintroduce them by reading past the omission. |
| Three modules created in the same pass were missing from the list | `nav-transform`, `contact-form` and `group-headings` **added**. |
| The two free designs | Still **not applicable to P0** — these are editor controls, not placeable designs, so there is no roster and no free pair. The two design categories patched alongside this one (Headers and Heroes) each had their pair put to the owner and decided. |

### Patch pass two — 31 August 2026

Frames updated: **`P0-0 Greyed Control Pattern` (new)** · `P0-3 Item List Controls` ·
`P0-5 Populate From Panel`. Every change carries the **name** of the rule that required it.

| Rule | Change |
|---|---|
| A control switched off by another is greyed, with the reason beside it | **New frame and new spec section, P0·0.** Resting state, greyed state, and where the sentence sits, drawn once; the five control shapes (select, segmented, toggle, swatch row, stepper) greyed together; the value in force stays legible; the reason is text under the control, never a tooltip. The **one exception** — a control this project can never offer is not drawn at all and the panel says why, the visitor dark-mode switch under a pinned colour scheme being the only current case — is drawn beside it. Recorded library-wide as P0·8 rule 13. Categories cite the frame and supply only their own sentence. |
| The Remove button never greys out | **Restated in the item-list controls (P0·3).** Never greys, never hides; at the minimum it stays fully clickable and the click produces the floor and the reason as one line of text under the list. The *remove at minimum* frame gains the restatement and an explicit boundary: the greyed-control pattern does **not** reach this control, because Remove is switched off by nothing. Recorded as P0·8 rule 14. |
| Avatars with no photograph show initials, and the two forms are not interchangeable | **New frame in P0·5** drawing both, labelled: **two letters** for a list the user typed ("Jane Doe" → JD), **one letter** for a person Ghost supplied ("Jane Doe" → J), with the reason on the frame — Ghost's template language cannot split a name on the supported versions. Rule 4 in P0·8 extended with "never mixed inside one component" and the photograph/silhouette floor. |
| A count that picks between drawn layouts is a named set, not a number picker | Recorded as P0·8 rule 15 with its test — every value must have a frame somebody has looked at. **No frame changes here:** P0·3's stepper already governs *how many items*, and arrangement controls already keep their named values. The rule is written down so categories stop converting one into the other in either direction. |
| A design may declare the width below which its script runs | Recorded as P0·8 rule 16, including the requirement that a design declaring a width describes its no-JavaScript state on **both** sides of it. **No frame changes here** — the primitives are editor software and declare no modules (rule 11), so no P0 design declares a width. |
| The feature-image caption renders differently on the two Ghost versions (tested 2026-08-31) | **No P0 change, recorded so the silence is not read as an omission.** No primitive renders a feature-image caption; the finding belongs to the categories that draw one. |
| A comment count renders nothing at all without JavaScript (tested 2026-08-31) | **No P0 change, same reason.** No primitive reads a comment count. P0·4's no-JavaScript notice covers **forms**, which it already says in those words, and it is not extended to cover counts. |
| Printed design totals | **Untouched.** No P0 frame or spec line carries a design total, and none was added. |
| P0's per-prop mark allowlist | **Left alone.** The section stating the default inline marks, that a field may narrow the set, and that a mark a field does not permit is **absent** from the toolbar rather than greyed **is not present in this project's copy of the spec** — it was written in the repository. It has not been re-authored or paraphrased here. Its interaction with the new greyed-control rule was put to the owner and **ruled the same day**: the toolbar is a named carve-out in P0·0, and the allowlist text stands unchanged. |

### Re-run check — 31 August 2026 (patch pass two, second issue of the instructions)

The pass-two instructions were issued a second time. Every item on the work list was checked against the
current files and found **already applied** by the first issue, recorded above. Nothing was redrawn and no
copy was re-authored. What the check produced:

| Rule | Change |
|---|---|
| A control switched off by another is greyed, with the reason beside it | **One frame label corrected on `P0-0`.** The shapes panel was headed "THE FOUR CONTROL SHAPES · SELECT · SEGMENTED · TOGGLE · SWATCH ROW" while the specification says five shapes are drawn together and the frame in fact draws all five — the select greyed in the resting/greyed pair above, the other four in the panel below. The heading now reads five and names where the select sits. No control, colour, sentence or layout changed. |
| A control switched off by another is greyed, with the reason beside it | Frames `P0-0`, `P0-3` (*remove at minimum*) and `P0-5` (*initials fallback*) re-read in full. All three carry the drawn states, the sentences and the boundary notes the pass asked for. Left untouched. |
| The Remove button never greys out | Restatement present in `P0-3` and in P0·8 rule 14, including the explicit boundary that the greyed-control pattern does not reach it. Left untouched. |
| Avatars with no photograph show initials | Both forms drawn and labelled in `P0-5`, with the reason on the frame. Left untouched. |
| Printed design totals | No total appears in any P0 frame or in this file, and none was added. The count-agnostic copy written in the repository was not touched. |
| P0's per-prop mark allowlist | **Left alone, again.** The allowlist text is not in this project's copy of the specification — it was written in the repository. It has not been re-authored, paraphrased or softened, and "absent" was not changed to "disabled". Its carve-out in P0·0 and rule 13 is unchanged. |
| The feature-image caption renders differently on the two Ghost versions | No P0 change. No primitive renders a feature-image caption. |
| A comment count renders nothing at all without JavaScript | No P0 change. No primitive reads a comment count; P0·4's notice covers forms and was not extended. |
| A count that picks between drawn layouts is a named set | Recorded as rule 15 already; no frame change, in either direction. |
| A design may declare the width below which its script runs | Recorded as rule 16 already; the primitives declare no modules, so no P0 design declares a width. |

~~**OPEN QUESTION raised by this re-run.** The instructions' output item 4 requires confirming that the
"**[Free] designs:**" line is present and names two designs that exist. **This contradicts a ruling already
in this file** — the owner settled on 31 August 2026 that P0 is exempt, because it holds shared editor
controls and no placeable designs, and closed open question 9 with "this does not need raising again in a
later pass." Applying the instruction would mean inventing two design names that do not exist. **Not
chosen either way and not invented.** The exemption stands as written until the owner rules otherwise.~~
**Settled by the owner, 2 September 2026: the exemption stands and no "[Free] designs:" line is added.**
Raising it rather than inventing two names was the right call. Recorded in full at open question 10 and in
the Confirmations.

### Owner's rulings on this pass's open questions — 31 August 2026

The three questions this pass raised were put to the owner and answered before it closed. Recorded here
with what changed.

| Question | Ruling | What changed |
|---|---|---|
| Five places already remove a control instead of greying it | **Split them.** A control belonging to a **mode** the user is not in stays absent; a control this context **overrides** greys with its reason. Four of the five are mode changes and stand: P0·5's filter block under Static, P0·5's Count and Order under Hand-picked, P0·2's empty Recent row, and the missing Add / Remove / drag on a Ghost-sourced list. | **P0·2's button icons change.** The Size and Colour rows are no longer hidden — they are **greyed with their reasons beside them** ("Button icons are always small, so they sit on the label's line." / "A button icon takes the label's colour."), with the value in force still shown. Frame `P0-2` gains the drawn popover; the spec's button-icon paragraph is rewritten; the mode/override distinction is written into P0·0 and rule 13. |
| The mark allowlist says "absent", the pattern says "greyed" | **Name it an exception.** A floating toolbar has no room for a sentence and the mark never returns for that field — the same permanence test the never-offered exception uses. | The **inline text toolbar** is a named carve-out in P0·0 and in rule 13. The repository's allowlist text is untouched, unsoftened and not re-authored. |
| P0 has no roster and no free pair | **Confirmed exempt.** The requirement does not apply to primitive categories. | Stated once in the Confirmations below so it stops being re-raised each pass. Open question 9 is closed; no "[Free] designs:" line was invented. |

### Open questions

Settled items are struck through with the name of whoever settled them. Anything still genuinely open
carries **OPEN FOR THE OWNER** on its own line.

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
4. ~~A8 versus §7.8 of the master brief.~~ **Settled by the owner: strike §7.8.** The
   session-brief files in this project already carry the rule and do **not** carry §7.8's permission,
   so the strike is needed only in the owner's own master brief, which is not a file here. Replacement
   wording, to paste in §7.8's place: *"A placed design is the design that renders. It may reflow, hide,
   scroll or collapse to fit any width; it may never be served as a different design. A design that
   cannot hold together at 390 is redrawn with its own narrow arrangement, or cut."* The four permitted
   moves and the redraw-or-cut rule are now stated in P0·8, rule 8.
   **Still outstanding elsewhere** ⚑ *re-checked 1 September 2026*: **A9·4, A19·7 and A29·5 are clear** —
   each now draws its own state and its file names the hand-off only in its patch note. **Two build files still
   draw the old language:** `A6-13 Overlap` (§7·8's hand-off named as a live mechanism) and `A8-14 Slim Line`
   (a states caption reading "past the ceiling · the design hands off to 1 Single"). **Two designs still hand off
   in substance, not just in wording:** `A22-6 Image Split` (no image → 5 Panel) and `A22-7 Cover` (no image →
   4 Contrast Band), which A22's own patch notes record as left as found. Those four are their own categories'
   patches; they are recorded here so the list is not lost.
5. ~~A2's floor sentences.~~ **Settled by the owner:** each category supplies its own, and **one clause
   only**: "A pricing table needs at least two tiers." · "A bar needs at least one message." No floor
   sentence points the user at another control. Two are drawn here as examples; the rest arrive with
   their categories.
6. ~~Five places in this library already remove a control instead of greying it.~~ **Settled by the owner,
   31 August 2026: split them.** A control belonging to a **mode** the user is not in stays absent; a
   control this context **overrides** greys with its reason. The four mode cases stood as drawn — P0·5's
   filter block under Source = Static, P0·5's Count and Order under Filter = Hand-picked, P0·2's empty
   Recent row, and the absent Add / Remove / drag on a Ghost-sourced list — **until 1 September 2026,
   when the owner moved Count and Order to the greyed side, leaving three.** **P0·2's button-icon Size and
   Colour rows are now greyed with their reasons**, not hidden. The distinction is written into P0·0 and
   rule 13.
7. ~~The per-prop mark allowlist says "absent"; the new pattern says "greyed, never hidden".~~ **Settled
   by the owner, 31 August 2026: the inline text toolbar is a named exception.** A floating toolbar has
   no room for a sentence and the mark never returns for that field. The repository's allowlist text is
   unchanged and was not re-authored; the carve-out is carried by P0·0 and rule 13.
8. ~~**The shared Actions control** is the one compound value not split under "one toggle per thing".~~ **Settled by the owner, 31 August 2026: split it library-wide as a scheduled job**, and the job is done in the same pass — **P0·4a** carries the definition and the mapping, and the migration record lists all 36 designs, their 36 control tables and their 36 redrawn panels.
   **OPEN FOR THE OWNER**
9. ~~This category has no roster and no free pair.~~ **Settled by the owner, 31 August 2026: P0 is exempt.**
   The roster and "[Free] designs:" requirements apply to design categories, not to primitive categories
   — P0 is the set of shared editor controls, not placeable designs. Stated in the Confirmations below so
   it is not raised again; no line was invented.

10. ~~The re-issued instructions require a "[Free] designs:" line here; this file records the owner's
   exemption for P0. The two cannot both hold, and inventing two design names to satisfy the line is
   the one thing neither permits.~~ **Settled by the owner, 2 September 2026: P0 is exempt and the
   exemption is final.** P0 holds shared editor controls and no placeable designs, so it has nothing to
   make free; the standing instruction's "[Free] designs:" line does not apply here and **no line is
   added**. The previous session's refusal to invent two design names to satisfy it was correct. **This
   is settled and no later pass re-raises it.** Every design category still marks its own two.

### Confirmations

- **Design numbering is unchanged.** This category's numbers are **P0·1 · P0·2 · P0·3 · P0·4 · P0·5 ·
  P0·6 · P0·7 (S14) · P0·8**, exactly as before. This pass **adds P0·0**, ahead of them; nothing was
  renumbered, renamed or removed. Frame files: `P0-0 Greyed Control Pattern` (new) · `P0-1` · `P0-2` ·
  `P0-3` · `P0-4` · `P0-5` · `P0-6`.
- **There is no "[Free] designs:" line, and P0 is exempt from the requirement.** Settled by the owner,
  31 August 2026 and **confirmed final by the owner on 2 September 2026**: the roster and free-pair
  requirements apply to **design categories**, not to primitive categories. P0 is the set of shared editor
  controls every category's panel draws from — there are no placeable designs here to mark, and any line
  would name designs that do not exist. **This is settled; no later pass re-raises it, and no line is
  added.** Every design category still marks its own two.

— End of specification —


---

### Patch pass — the Actions split, 31 August 2026

| Rule | Change |
|---|---|
| One toggle per thing — no compound values | **New section P0·4a.** The shared Actions control is split into a labelled group of one On · Off toggle per action, each opening its own P0·4 member-aware card; all off is the old None. P0·4a carries the rule, the full old-to-new value mapping for all five affected categories, and the three consequences — a constant is stated not switched, an undrawn combination is greyed not invented, and a group with a floor keeps its last toggle on. **No P0 frame changed:** P0·4's card is the same card, reached from a toggle instead of from a value. |
| One toggle per thing — no compound values | **Rule 12 amended** — its "not applied to the shared Actions control" carve-out is withdrawn and now points at P0·4a. **Open item 8 is struck through and closed**, naming the owner and the date. |
| A design may offer fewer choices on a shared control, and must say why | Unaffected, and worth stating: the split does not let a category rename the group or its toggles. A category may hold **fewer** toggles where it has fewer actions — A6 one, A4·7 one — and must say why in the group, which both do. |

**Numbering unchanged.** P0·0 · P0·1 · P0·2 · P0·3 · P0·4 · **P0·4a (new)** · P0·5 · P0·6 · P0·7 (S14) · P0·8. Nothing was renumbered; the new section takes a letter rather than a number so no existing reference moves.

**There is no "[Free] designs:" line, and P0 remains exempt** by the owner's earlier ruling.

---

### Patch pass three — 2 September 2026 · P0 Editor Primitives

One work item, one ruling, no redesign. **Frames updated: none** — see the frame check below. Every change
carries the **name** of the rule that required it.

| Rule | Change |
|---|---|
| Mark the two free designs | **Struck as settled, and it is the whole of this pass's work list.** The owner ruled on 2 September 2026 that **P0 is exempt**: it holds the shared editor controls every category's panel draws from, it has no placeable designs, so it has nothing to make free. **No "[Free] designs:" line was added and no design names were invented.** Open question 10 is struck with the owner and the date; the re-run's duplicate statement of the same question is struck beside it; the Confirmations now carry the exemption as final so no later pass re-raises it. The previous session flagged the contradiction rather than resolving it, which is the behaviour the ruling endorses. |
| A control switched off by another is greyed, with the reason beside it | **Checked, no change.** Already carried by P0·0 in full — the greyed state, the value in force staying legible, the reason as a short sentence at the control rather than a tooltip, and the one exception of a different kind (a control this project can never offer is not drawn at all and the panel says why; the visitor dark-mode switch under a pinned colour scheme remains the only current case). Recorded library-wide as rule 13. |
| Avatars with no photograph show initials, and the two forms are not interchangeable | **Checked, no change.** Two letters for a list the user types, one letter for a person Ghost supplied, never mixed inside one component — drawn in P0·5 and stated as rule 4. |
| The Remove button never greys out | **Checked, no change.** Carried by P0·3 with its explicit boundary — the greyed-control pattern does not reach it, because Remove is switched off by nothing — and by rule 14. |
| A count that picks between drawn layouts is a named set, not a number picker | **Checked, no change.** Rule 15, with its test intact: every value must have a frame somebody has looked at. Item counts stay steppers; arrangement controls keep their named values; neither is converted into the other. |
| A design may declare the width below which its script runs | **Checked, no change.** Rule 16, including the requirement that a design declaring a width describes its no-JavaScript state on both sides of it. **No P0 design declares one** — the primitives are editor software and declare no modules (rule 11). |
| Printed design totals | **Untouched, and nothing new was authored carrying one.** No P0 frame or spec line prints a design total. The count-agnostic marketing and app copy maintained in the repository was not touched, and is not in this project's files to touch. |
| P0's per-prop mark allowlist | **Left alone, a third time.** It is not in this project's copy of the specification — it was written in the repository. It has not been re-authored, paraphrased or softened, and "absent" was not changed to "greyed": the inline text toolbar's carve-out in P0·0 and rule 13 stands unchanged. |
| The frames | **Re-read in full and left untouched.** `P0-0` · `P0-1` · `P0-2` · `P0-3` · `P0-4` · `P0-5` · `P0-6`. **None of them carries a roster, a "[Free]" mark or an open-question block**, so the one work item on this pass's list has nowhere to land on a frame. Nothing was redrawn: no arrangement moved, no control was added, removed or renamed, and no value, default, type scale, colour or sentence changed. |

**Left alone, and why — recorded rather than edited.**

- **The owner is named in this file as "the owner" and nowhere by a proper name.** The strike therefore
  reads "Settled by the owner, 2 September 2026", in the form every earlier ruling in this file uses. A
  proper name was not invented.
- **Open question 8 carries a stray `OPEN FOR THE OWNER` line beneath its struck-through text.** The
  question itself is struck and closed (the Actions split, 31 August 2026, delivered as P0·4a), so the
  marker is a leftover from the pass that closed it. This pass's list does not name it and removing it
  would be an edit nobody asked for, so **it is left as found** and flagged here instead.

**OPEN QUESTION — the one thing this pass could not close.** The instructions' **output item 4** requires
confirming that the "**[Free] designs:**" line is present and names two designs that exist. **The same
instructions' work list rules the opposite** — the exemption stands, do not add a [Free] line — and item 4
cannot be satisfied without inventing two design names, which both the work list and the ruling forbid.
The work list is the ruling and dated 2 September 2026, so **it governs and item 4's boilerplate is
treated as stale for this category only**. The conflict is recorded here rather than resolved silently;
the confirmation below states the position plainly instead of asserting a line that does not exist.
**FOR THE OWNER'S NOTE, NOT A QUESTION REOPENED.**

### Confirmations — patch pass three

- **The design numbering is unchanged.** This category's numbers are **P0·0 · P0·1 · P0·2 · P0·3 · P0·4 ·
  P0·4a · P0·5 · P0·6 · P0·7 (S14) · P0·8**. Nothing was renumbered, renamed, added or removed in this
  pass.
- **There is no "**[Free] designs:**" line, and there is not meant to be one.** P0 is exempt by the
  owner's ruling of 31 August 2026, confirmed final on 2 September 2026: it holds shared editor controls
  and no placeable designs, so no two designs exist to name and none were invented. This is the one output
  item the pass's own work list forbids satisfying, and the conflict is recorded above.
