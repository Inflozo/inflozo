# A29 Archive Headers — written specification

14 designs · Paper pack · drawn 23 August 2026 · controls-reconciled 25 August 2026 · **design-patched 30 August 2026**

The frames are `A29-0 Category Proof.dc.html` and `A29-1` … `A29-14`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Design patch pass — 30 August 2026 (this document's current state).** The ten library-wide rules were
applied to all fourteen designs. **Three changed what a visitor sees.** *No design ever turns into another
design* deleted **5 Full Bleed's hand-off to 1 Centred** — the frame now keeps its height and its type and
the picture slot resolves to the pack's contrast ground — and deleted **11 Filter's "the design is 1 Centred
left-aligned"**. *Avatars with no photograph* cut **12 Portrait's initials circle from two letters to one**.
*There is no "Inherit" choice anywhere* **removed the value 9 Big Type's Background role was locked at**.
Two more changed a control: *the Remove button never greys out* (the tag list's ✕ at two items) and *item counts are a number picker* (**13 Index's Columns**). *Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript* added two notes to the three designs that carry an action. **Nothing was renumbered**, no design was deleted and no module was coined. Every change carries the **name** of the rule that required it in **Patch notes** at the end. **Both of the pass's questions were ruled by the owner on 30 August 2026** — the free pair is 1 Centred and 8 Bar, and 9 Big Type's background row stays open, resting at Background — and **nothing in this category is left open to him**.

**[Free] designs:** 1 Centred · 8 Bar

*(Shortlisted in this pass — 1 Centred, 8 Bar, 10 Boxed, 4 Panel, 7 Rail: the five plainest heads, none of which depends on the customer having good photography — recommended, and **ruled by the owner on 30 August 2026**: the category default plus the lightest head in it, and neither needs a picture or a description.)*

**Controls-reconciliation pass (the previous pass), 25 August 2026.** The category was
audited design by design against the PRD's control vocabulary and Ghost's verified data surface,
thinking like an end user editing their own site. **No layout was redesigned**; two designs had
section frames redrawn because the pass changes what they render. The shared editor primitives are
the ones designed in **P0 · Editor primitives** — the inline text toolbar and its link popover
(P0·1), the icon slot and Icon Picker (P0·2), the item-list controls (P0·3), the member-aware action
editor (P0·4), the "Populate from…" panel (P0·5) and the editor state switcher (P0·6) — cited by
name and never redrawn. The pass's own account of itself is the last section of this file,
**Reconciliation notes**, and its banner is the second frame of `A29-0`.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A29·11's head in three packs, light and dark), the stress frame, the roster, the component
inventory and the four settlements in full. The shared field list is repeated below because the
build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A28 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A29 is

**The head of a route that lists posts.** A tag archive, an author archive, or a date collection.
It has one job the post header does not: it has to say what the reader is looking at *before* they
have read anything, and it has to do it from three different Ghost objects with one design.

A29 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96
· 132); **A25's 720 measure and its 240 · 48 · 1,008 rail division**; **A1's eyebrow, primary
button, back link, avatar and initials fallback, and its active-state convention**; **A20·1's pill
and A20·7's index line, verbatim**; **A20·13's warm scrim and its white-over-image rule**; **A26·3
and A27·4's call that a full-width plane is a ground rather than a containment**; and, from this
pass, **A21·6's author social row**. **A29 adds four components to the vocabulary — the archive meta
line, the zero-archive notice, the sticky bar and the all-topics link — and nothing else.**

### The four settlements (§8 of the brief)

**1 · One design, three archives.** A tag, an author and a date collection are one section with one
field list. **The eyebrow is what changes** — "Tag", "Author", "Archive" ⚑ — and the name,
description and count come from whichever Ghost object the route provides: `{{#tag}}`, `{{#author}}`,
or the route's own title. **Ghost has no native date archive** ⚑: a date collection is a
`routes.yaml` entry and its title is authored there, which is finding 1. **Only 12 Portrait is built
around one archive type** and it draws the other two without breaking. **Reconciled:** because the
eyebrow *defaults* by route, clearing the field brought the default straight back and the label could
never be switched off — **`Eyebrow: Show · Hide` now exists in all fourteen** ⚑.

**2 · Description and count, and an archive with neither.** **Most tags have no description** ⚑ —
Ghost leaves it empty and most publications never fill it — so absence is the normal case, not an
empty state: **the stack closes up and nothing is reserved**. The count is always available from
`{{pagination.total}}` and is the one fact every archive has. **An archive with neither is a name and
a label**, and 1, 7, 8 and 9 are the four designs that still read as compositions at that size.

**3 · A tag with a feature image, and one without.** **Two designs of the fourteen draw the image** —
5 Full Bleed and 6 Image Split. 6 *uses* it: with none, the picture column goes and the text keeps
its measure. **5 is built around it**, and with none **it renders itself** ⚑: the frame keeps its Height and its bottom-left type, and the picture slot resolves to the pack's contrast ground — white ink unchanged, no scrim drawn. **Amended in the design patch pass: the hand-off to 1 Centred is deleted**, because no design ever turns into another design. The panel advises — "no picture on this tag — 1 Centred reads better here" — and never switches. **Reconciled:** both designs now carry
**`imageFocus` — Centre · Top · Bottom** ⚑, in the Image Picker's popover, applied to an upload **and
to the Ghost image**.

**4 · The zero-post archive.** It is reachable — an empty tag, a new author, a month with nothing in
it — and **A17 Post Grids does not render at all when the query is empty**. So **A29 owns the
message** ⚑: the head renders in full, the count reads the **`archive.count_empty`** catalog string
("No posts yet" by default, **a template literal no longer** ⚑), and `emptyText` renders under it.
**Hiding the head is not offered** ⚑ — with A17 silent, hiding it leaves a blank route. 4 Panel and
10 Boxed are the two designs whose zero state looks finished rather than broken.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The seam.** A29 sits directly under A1's site header and draws its own padding: **64 · 96 · 132**
  at 1440, **80** at 834, **64** at 390 ⚑ — A17's ladder, and since this pass **the universal Vertical
  spacing control is the thing that sets it**. **3, 5 and 8 have no padding of their own** (the band,
  the image and the bar carry it, and their Vertical spacing resolves 0) and **14 has none below**.
- **The three universal controls.** **Background role · Vertical spacing · Top divider**, on every
  placeable section and **outside each design's own control list** ⚑, uncounted. Any per-design
  "Padding" on the page ladder **was** Vertical spacing and is retired into it. **Genuinely different
  ladders keep their own names**: **3's Band depth** (48 · 72 · 104, inside the band), **8's Bar
  height** (a strip height, 88 at Comfortable), **10's Box padding** (inside the box), **5's Height**
  (a media depth). **Locked with the reason shown:** Background role on **3** (Contrast — the inverted ground *is* the design) and on **5** (Image — the photograph is the ground). **9's row is no longer locked** ⚑ — it was locked at Inherit and **Inherit is removed**, so the row is open and rests at Background; Vertical spacing on 3, 5 and 8 (resolves 0);
  Top divider on 3, 5 and 8.
- **The eyebrow can be turned off.** **`Eyebrow: Show · Hide` in all fourteen** ⚑. It was on 8 Bar and
  9 Big Type only, and because the field defaults by route there was no off.
- **The measures.** A17's content box, unchanged. The head's own measure is **720** in 1, 5 and 10,
  A25's. The description is clamped at **620** on page, **640** on the band, **560** on an image and
  **380** beside the index ⚑.
- **The name.** One control, three named values, and **five ladders** ⚑ — page 40 · 52 · 68 (1, 5) ·
  plane and box 36 · 44 · 56 (4, 10, 12) · column 38 · 48 · 60 (2, 7, 11, 13) · display 76 · 104 ·
  132 (9) · bar 24 · 30 (8). **Nothing auto-fits** ⚑: a long name wraps, or in 8 ellipsises, and the
  panel names the control that fixes it.
- **The type.** Eyebrow 13 uppercase tracked .08em · name by ladder · description 17, 16 at 390 ·
  count 15, 17 in 9 · meta and back link 14 · index line 15 with a 13 count. **Nothing below 13, and
  nothing between 13 and 15** ⚑.
- **Accent, twice in fourteen.** **Only 11 Filter's active pill and 12 Portrait's action use accent**
  ⚑; 13 Index's 2 px underline is the third appearance. **No name, count, eyebrow, rule or link is
  ever accent.** 3 Contrast Band has an action and it is **not** accent — on the band accent measures
  4.0:1 at 14 px and is disabled with its ratio shown ⚑. **Reconciled, as A30's band already states:
  each pack re-checks its own accent on its own band** ⚑ and may enable the value; **Paper is where it
  is disabled**, and the ratio is shown either way.
- **Named values only.** No px, hex, unit or free CSS at section level, anywhere in the category ⚑.
- **No fixed English visitor-facing string ships.** Every authored string keeps its old literal as a
  default and edits inline; **the zero count leaves the template** ⚑ — "No posts yet" is the
  **`archive.count_empty` translation-catalog string**, because it renders inside every design's count
  slot and is a plural form of Ghost's number rather than a sentence a publication writes.
- **Editing, once for the category.** Every authored text edits inline with **P0·1**'s toolbar — bold ·
  italic · underline · link, its popover carrying **Open in new tab** and rel **nofollow · noreferrer ·
  sponsored**. **Ghost-owned content is never inline-editable** ⚑ — the archive name, the post count,
  tag names drawn by a query, the author bio, location, website and every handle answer **"Edit in
  Ghost"** or show P0·1's lock pill. **Every URL field opens the Ghost-aware Link Picker.** Buttons
  take an optional **Icon Picker** icon before or after the label (P0·2: always Small, label-coloured).
  Authored lists use **P0·3**; **Ghost-sourced lists show its read-only card with no Add button** ⚑.
  The three CTA designs use **P0·4** under a section-level **Member visibility** row. States are
  **P0·6**'s switcher. **No design had a "Preview" control to remove** — rule 7 is satisfied by
  construction.
- **Every image field carries Image focus** — Centre · Top · Bottom, in the Image Picker's popover and
  never a hidden field ⚑. In A29 that is `featureImage` in **5** and **6**, and the focus **applies to
  the Ghost image too**, because Ghost stores none.
- **Targets.** Back links, pills, index rows, the all-topics link, social icon slots and actions are
  44 px. **Nothing interactive is under 44** ⚑, including the index row, where **the whole row is the
  target rather than the name** ⚑.
- **Responsive floor.** **Margin furniture leaves at 1,200** (7) · **splits collapse at 834** (2, 6,
  13) · **bands, boxes, planes and cards do not collapse at all** (3, 4, 5, 8, 10, 12). Every element
  that leaves a width has a stated destination.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows
  dropped and the hairline carrying every plane. **Image scrims deepen rather than invert** ⚑; white
  over an image stays white.
- **Print.** **The head prints; the bar, the pill row with its all-topics link, and the index do not**
  ⚑ — a printed archive page is a list of titles and its name belongs at the top of it. The first
  category in four that prints anything.
- **Behaviour.** **Two designs declare a module** — 9's `count-up` (only when Count animation is On)
  and 11's `filter-strip`. The other twelve declare none. **14 Sticky pins with CSS and declares
  nothing** ⚑. **This pass adds no module and coins no name**; the all-topics link and the social row
  are ordinary links.
- **Refused category-wide, each with a reason:** sorting or ordering the posts ⚑ (a Ghost route
  setting, not a section setting) · an RSS link ⚑ (A3 owns it) · a search field in the head ⚑ (A23's,
  and two search entries on one route is one too many) · breadcrumbs ⚑ (Ghost has no hierarchy above
  a tag) · a posts-per-page control (routes.yaml) · a related-tags query ⚑ (finding 2) · a comment or
  reading-time total for the archive ⚑ (neither is queryable across a collection). **Withdrawn in this
  pass: the focal point** — Image focus now ships on 5 and 6, and finding 3 is amended rather than
  answered.

### The controls every design shares

**Two groups, both outside each design's own list and neither counted** ⚑.

**The universal trio.**

| Row | Values | Notes |
|---|---|---|
| Background role | Background · Surface · Contrast | Locked on 3 (Contrast) and 5 (Image). **9's row is open and rests at Background — Inherit is removed** ⚑ |
| Vertical spacing | Compact · Comfortable · Spacious | 64 · 96 · 132; 80 at 834, 64 at 390. **This is what every design called Padding** ⚑. Resolves 0 on 3, 5, 8; above-only on 14 |
| Top divider | None · Line · Fade | Default None — A29 is first on the route. Locked None on 3, 5, 8 |

**The Data group** — the archive source, five rows in twelve designs and **six in 5 and 6**, one of
them read-only.

| Field | Type | Values |
|---|---|---|
| `nameSource` | enum req | From Ghost · Custom text → reads `{{#tag}}{{name}}`, `{{#author}}{{name}}` or the route's title ⚑ |
| `descriptionSource` | enum req | From Ghost · Custom text · Off — From Ghost reads the tag description or the author bio |
| `imageSource` | enum req | From Ghost · Upload · Off — **drawn disabled in the twelve designs that draw no image** ⚑; the field is kept, not discarded |
| `imageFocus` | enum opt | **Centre · Top · Bottom — 5 and 6 only, new in this pass** ⚑; applies to the Ghost image as well as an upload |
| `emptyBehaviour` | enum req | Head and notice (default ⚑) · Head only — **Hide is not offered** ⚑ |
| *Where this runs* | read-only | Tag archive · Author archive · Date collection — **Ghost's route decides; the section reports it** ⚑ |

**P0·5's "Populate from…" panel lands nowhere in A29** ⚑ — the section draws no post list, and the
Data group governs where one name, one description and one image come from, not a query. The one
query the category does own — 11 and 13's tag list — is a control in those two designs, with **P0·3's
Ghost-sourced list card** under it.

### The roster

Control counts are **each design's own rows**; the trio and the Data group are outside them.

| # | Design | Tuple | When the content is thin | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Centred | `stack · none · page · none · none · a centred name on the measure` | Stack closes up; count moves under the name | 6 | — |
| 2 | Split Head | `split · none · page · none · none · name left, description and count right` | Right column is a count and a link; 1 is suggested | 7 | — |
| 3 | Contrast Band | `stack · none · contrast · none · none · an inverted band above the archive` | Band shortens to its content; no minimum height | 8 | — |
| 4 | Panel | `stack · none · surface · none · none · the head on a raised plane` | Plane closes to 138; the zero state is its best | 6 | — |
| 5 | Full Bleed | `media frame · none · image · none · full-bleed · the feature image carrying the name` | No picture → the frame keeps its height and its type on the contrast ground | 7 | — |
| 6 | Image Split | `split · none · page · none · right · the feature image beside the name` | Picture column goes; the text keeps its 636 | 6 | — |
| 7 | Rail | `edge rail · none · page · none · none · the head standing in the margin` | Rail is unchanged; the body is the name alone | 7 | — |
| 8 | Bar | `bar · none · surface · none · none · a one-line archive bar` | Nothing to lose — it never drew a description | 6 | — |
| 9 | Big Type | `stack · none · page · none · none · the name at display scale` ⚑ (was `transparent`) | Name and count alone, which is its best state | 5 | `count-up` |
| 10 | Boxed | `stack · box · page · none · none · a hairline box round the head` | Box closes to 174 and keeps the content width | 7 | — |
| 11 | Filter | `bar · none · page · variable · none · sibling tags as a filter row` | The row is the most useful thing on the route | 7 | `filter-strip` |
| 12 | Portrait | `stack · card · page · none · left · the author portrait in a card` | Initials fallback; meta line drops to the count | 8 | — |
| 13 | Index | `grid-of-N · none · page · many · none · the tag index beside the name` | The index sets the height; the head can be four lines | 6 | — |
| 14 | Sticky | `sticky · none · page · none · none · the name condensing to a pinned bar` | The bar renders and never pins | 6 | — |

**Five to eight rows a design**, against the PRD's ceiling of about fifteen. **Every design lost its
Padding row and gained an Eyebrow row**, so the net is one design shorter (9), five unchanged and
eight longer by one or two.

### Tuple uniqueness — the honest statement

**All fourteen are distinct on the five closed slots.** **Archetype carries the category** — six
`stack`, two `split`, two `bar`, and one each of `media frame`, `edge rail`, `grid-of-N` and
`sticky`. **Ground separated the six stacks**: `page` (1), `contrast` (3), `surface` (4), and `transparent` (9) — **until this pass removed Inherit and 9's ground became `page`** ⚑; **containment separates the last two**, `box` (10) and `card` (12). **Media
separates 2 from 6** and **item-count separates 8 from 11**.

**A29's containment rule, which the next category should reuse rather than re-decide:** a full-width
fill is a **ground** (4 Panel, `surface`) · an unfilled border is a **box** (10 Boxed) · an inset
object with its own plane is a **card** (12 Portrait) ⚑. That reading is consistent with A26·3 and
A27·4 and is what makes those three designs three designs.

**What the check cannot promise.** 1 Centred and 10 Boxed differ by a hairline rectangle; 2 Split
Head and 6 Image Split by whether the right column is words or a picture. Both distinctions are real
and both are visible. **But 7 Rail and 2 Split Head reach different archetypes for what a reader
might call the same idea** — a name with its meta to one side — and that distinction rests on the
emphasis phrase, which no machine reads.

**And 9 Big Type no longer has a ground of its own to claim.** Inherit is removed, its row rests at Background, and `page` is what the tuple reads — which means **9 and 1 differ on the emphasis phrase alone**: a display-scale name with its count in the opposite corner and no back link, against a centred name on the measure. Both are visible at a glance, and neither is a distinction a machine reads. **Ruled by the owner on 30 August 2026**, and finding 8 is closed by the rule rather than by the product.

### Repeating items — the whole category, in one place

**There is exactly one field in A29 that is an array the user authors:** `links[]`, the tag list.
**Two designs draw it — 11 Filter as a pill row and 13 Index as ruled columns** — and it is authored
only at **Tag row / Index list: Chosen tags**, where it gets **P0·3's authored item list**. At the
other two values the list is a Ghost query ordered by post count or alphabetically: it shows
**P0·3's Ghost-sourced card** — count and order over read-only rows, marked "From Ghost", **and no
Add button** ⚑. The user changes it by changing the query. **The posts themselves are never the
section's items** ⚑ — A29 draws no posts.

- **Add an item.** "+ Add a tag" at the foot of the list. **It opens Ghost's tag picker rather than a
  blank text row** ⚑ — a tag that does not exist has no archive to link to — and the chosen tag lands
  at the end of the list carrying its real name and count. **Add arrives with content**, per P0·3.
- **Remove an item.** The ✕ on each row; **never disabled and never hidden**. **At two tags it is still drawn and still clickable, and clicking it says why it cannot go lower** ⚑ — "a filter row needs at least two tags" on 11, "an index needs at least two tags" on 13. **Amended in the design patch pass**: removing the last one used to return the control to Most used, which took the user's list away at a click.
- **Reorder.** Drag by the ⠿ handle. **Order is meaningful in both designs** — 11 reads left to right
  and wraps; **13 reads down each column and then across** ⚑, which is how a printed index reads.
- **Inside an item the user edits content only** — the label and the link ⚑. Both arrive from Ghost
  when the tag is picked; **the label is editable and the link is not** ⚑, because it is the tag's
  archive URL and re-pointing it would break the active state. **A chosen tag's label stays
  inline-editable even though it arrived from Ghost** — once picked it is authored text on the section
  — while **a tag name drawn by the query is Ghost's** and answers "Edit in Ghost". That is the one
  place this pass's rule 4 and the category's own ruling meet, and it is recorded in the notes.
  **There is no per-item styling anywhere in A29**, by construction.
- **Minimum and maximum.** **Two to twelve** ⚑. 11 Filter is designed for 6–10, correct at 2–12; **at
  one pill it is "All posts" and one tag, which reads as a mistake and the panel says so**. 13 Index
  is designed for 12, correct at 6–12; **below the column count the last columns are empty** ⚑ and the
  panel says to use Two. **Above twelve both truncate at the query limit** — and **11 now closes its
  row with an all-topics link** ⚑ while **13 deliberately does not**; finding 5, amended.
- **At zero items.** The row or the index does not render and **each design is its own head alone** ⚑: 11 is its head left-aligned on the content box, 13 is its head on the content box. **Neither becomes another design** — amended in this pass. **Neither draws an empty container,
  a placeholder pill or a "no tags yet" line.**

### The shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | all 14 | Defaults by route: Tag · Author · Archive ⚑. **`Eyebrow: Show · Hide` is what turns it off** |
| `titleOverride` | text | opt | 60 ch | all 14 | Empty means "use Ghost's name" ⚑ |
| `description` | text | opt | 240 ch | all but 8 | Falls back to the tag description or the author bio |
| `featureImage` | image | opt | — | 5, 6 | Tag feature image or author **cover**, not the profile picture ⚑ |
| `imageFocus` | enum | opt | — | 5, 6 | **New** ⚑. Centre · Top · Bottom, in the Image Picker popover; **applies to the Ghost image too** |
| `backLabel` | text | opt | 24 ch | 1, 2, 4, 6, 7, 8, 10, 13, 14 | Default "All posts" ⚑ |
| `backUrl` | url | opt | — | same | Link Picker; defaults to `{{@site.url}}` ⚑ |
| `actionLabel` | text | opt | 20 ch | 3, 7, 12 | Default "Subscribe" ⚑. **Per member state, P0·4**; plain text, no toolbar |
| `actionUrl` | url | opt | — | 3, 7, 12 | Link Picker, Portal actions first; defaults to `#/portal/signup` ⚑ |
| `actionIcon` | icon | opt | — | 3, 7, 12 | **New** ⚑. Optional, before or after the label, from the Icon Picker |
| `links[]` | array | opt | 2–12 | 11, 13 | `{label, url}`. **The category's one authored array** |
| `allTopicsLabel` | text | opt | 24 ch | 11 | **New** ⚑. Default "All topics →" |
| `allTopicsUrl` | url | opt | — | 11 | **New** ⚑. Link Picker. **ARCHITECT: the tags-route decision**; with no target the link does not render |
| `emptyText` | text | opt | 120 ch | all 14 | Default "No posts filed here yet…" ⚑ |
| `archive.count_empty` | catalog | req | — | all 14 | **New** ⚑. "No posts yet" — a theme translation string, **not an authored field** |
| *name* | Ghost | req | — | all 14 | Tag name, author name, or the route's title |
| *pagination.total* | Ghost | req | — | all 14 | The count. **Not `count.posts`** ⚑ — finding 4 |
| *profile_image* | Ghost | opt | — | 12 | Initials fallback, A1·6's |
| *location, website* | Ghost | opt | — | 12 | Usually empty; drop with their separators ⚑ |
| *the nine handles, website* | Ghost | opt | — | 12 at Socials: Show | **New** ⚑. A21·6's row; nine on Ghost ≥ 6.36, three on 5.x; read from the author, never `social_url` |

**Fourteen authored fields, one catalog string and five reads from Ghost.** A design may use fewer —
8 Bar uses four — but **none needs a field the category does not have**, so switching between any two
of the fourteen preserves everything the user typed. **8 Bar and 9 Big Type keep `description`
without drawing it** ⚑, and 8's panel now shows it greyed rather than silently storing it: the field
is on the section, not on the design.

---

## The fourteen designs

Every entry carries all ten fields in the brief's order. Controls are listed **in sidebar order**;
the universal trio and the Data group follow each list and are not counted.

---

### 1 · Centred

1. **Descriptor.** Eyebrow, name, description and count centred on a 720 measure. The category
   default and the arrangement the other thirteen depart from.
2. **Tuple.** `stack · none · page · none · none · a centred name on the measure`
   Containment `none` — no box, no plane. Item-count `none` — nothing repeats.
3. **Archetype.** stack. **No departures.**
4. **Responsive.** **1440** measure 720 centred in the 1,296 box on a 72 margin, name 52,
   description 17 clamped 620, count 15, spacing 96. **834** measure 640, name 44, spacing 80.
   **≤ 767** measure = frame less its 20 margins, name 34, description 16, gaps 12 and 14, spacing 64.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `backLabel`/`backUrl` · `emptyText`.
   From Ghost: name, description or bio, `{{pagination.total}}`.
6. **Controls.** Name size *Regular · Large · Display* — Eyebrow *Show · Hide* (**new** ⚑) —
   Description *Show · Hide* — Post count *Under the description · Beside the eyebrow · Off* — Back
   link *Show · Hide* — **Bottom rule** *On · Off* (**was Divider** ⚑). **Six.** Plus the trio —
   Vertical spacing is the old Padding — and the Data group.
7. **Data.** `{{#tag}}` / `{{#author}}` / the route's title ⚑. **0** → name, the catalog zero count,
   notice. **1** → singular via `{{plural}}`. **many** → unchanged.
8. **Empty.** No description → the stack closes up and the count moves 18 px under the name. Zero
   posts → the head renders in full and `emptyText` renders under it ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Name is the route's **h1** ⚑ — the only h1 on an archive route, so A17's section head
    below is an h2. The eyebrow is a `<p>`, not a level. Focus order name → back link → grid.
    **Flagged ⚑** eyebrow defaults by route · back-link target and wording · no native date archive ·
    the notice and its wording · the name ladder.

---

### 2 · Split Head

1. **Descriptor.** Name in a left column, description, count and back link in a right column on a
   fixed 100 px gutter. The design for archives that have a description.
2. **Tuple.** `split · none · page · none · none · name left, description and count right`
   `split` separates it from 1; media `none` separates it from 6.
3. **Archetype.** split. **One departure** — collapses at **834** rather than 767.
4. **Responsive.** **1440** 596 · 100 · 600, right column offset 12 px to the name's first baseline,
   name 48, spacing 96. **834** stacked, name 40, description full 754, gaps 16, spacing 80.
   **≤ 767** stacked, name 32, description 16, spacing 64.
5. **Fields.** As 1. No field is unique to this design.
6. **Controls.** Split *Even · Wide name · Wide description* — Name size *Regular · Large · Display*
   (**Display disabled at Wide description**, ratio shown ⚑) — Eyebrow *Show · Hide* (**new** ⚑) —
   Description *Show · Hide* — Post count *In the right column · Under the name · Off* — Back link
   *Show · Hide* — **Bottom rule** *On · Off* (**was Divider** ⚑). **Seven.** Plus the trio and the
   Data group.
7. **Data.** As 1. **0** → the notice takes the description's place at the top of the right column.
   **No description** → the right column is a count and a link, and the panel **suggests 1 Centred
   without switching** ⚑.
8. **Empty.** The near-empty right column is drawn on the states strip. It does not collapse ⚑ — the
   count would jump 700 px left.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Name is the **h1**. DOM order name → description → count → back link, matching the
    visual left-to-right order ⚑.
    **Flagged ⚑** fixed 100 px gutter · the 12 px baseline offset · Display disabled at Wide
    description · suggestion-not-a-switch · collapse at 834.

---

### 3 · Contrast Band

1. **Descriptor.** The head as a full-bleed inverted band directly under the site header, with the
   category's only resting-state action.
2. **Tuple.** `stack · none · contrast · none · none · an inverted band above the archive`
   The band is a ground, not a box — A26·3 and A27·4's call, followed.
3. **Archetype.** stack. **One departure** — the section's own vertical spacing resolves to 0 at
   every value because the band carries its depth internally ⚑.
4. **Responsive.** **1440** band 1440 wide, content 1,296 on a 72 margin, 72 inside, name 48,
   description clamped 640. **834** 56 inside, margin 40, name 40. **≤ 767** 40 inside, margin 20,
   name 32, **button stays auto-width** ⚑. **No collapse at any width.**
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `actionLabel` (default "Subscribe" ⚑,
   **per member state**) · `actionUrl` (default `#/portal/signup` ⚑) · `actionIcon` · `emptyText`.
6. **Controls.** **Band depth** *Compact · Comfortable · Spacious* — 48 · 72 · 104 inside the band,
   **the band's own ladder, renamed from Padding** ⚑ — Name size — Eyebrow *Show · Hide* (**new** ⚑) —
   Description — Post count *Beside the eyebrow · Under the description · Off* — Alignment *Left ·
   Centre* — Action *Button · Link · Off* (**accent fill disabled in Paper at 4.0:1; each pack
   re-checks its own accent on its own band** ⚑) — **Member visibility** *Everyone · Logged out · Free
   members · Paid members* (**new** ⚑). **Eight.** Plus the trio — **Background role locked at
   Contrast**, Vertical spacing resolving 0, Top divider locked None — and the Data group.
7. **Data.** As 1, plus the authored action. **0** → notice in `onContrastMuted`, action stays.
8. **Empty.** No description → the band shortens to its content; **no minimum height** ⚑.
9. **Module.** None. **No-JS: the band is pixel-identical and the action does nothing** ⚑ — it opens Ghost's own sign-up pop-up, which needs JavaScript. **The action also does not render when the connected site cannot support it** ⚑ — self-signup switched off, or no payment provider connected. **P0·4's per-state rules compile server-side** — no module either.
10. **A11y.** Name is the **h1**. **The band is a section landmark, not a banner** — `banner` is A1's
    ⚑. Name 13.4:1, description 5.1:1, button ink 13.4:1, **Paper's accent 4.0:1 and disabled** ⚑.
    An action icon is decorative and carries `aria-hidden`.
    **Flagged ⚑** the band's own depth ladder · Vertical spacing resolving 0 · no minimum height ·
    accent disabled with its ratio, per pack · Portal signup default · description clamped 640.

---

### 4 · Panel

1. **Descriptor.** The head on a raised surface plane inset in the content box, count and back link
   at the plane's right edge.
2. **Tuple.** `stack · none · surface · none · none · the head on a raised plane`
   **Containment `none`, not `card`** — the plane is a ground ⚑. 12 Portrait is the `card`.
3. **Archetype.** stack. **One departure** — at 390 the count and back link move under the name.
4. **Responsive.** **1440** plane 1,296, padding 44 × 48, name 44, description 640, count and link
   right, offset 8 px. **834** plane 754, padding 36 × 40, name 38. **≤ 767** plane 350, padding 24,
   name 30, count and link under the name.
5. **Fields.** As 1.
6. **Controls.** Plane *Raised · Flat* (**dark forces Flat** ⚑) — Name size *38 · 44 · 56* ⚑ —
   Eyebrow *Show · Hide* (**new** ⚑) — Description — Post count *Right of the name · Under the name ·
   Off* — Back link *Show · Hide*. **Six.** Plus the trio — **Vertical spacing is the old Padding, the
   space around the plane; the plane's internal 44 × 48 stays fixed and uncontrolled** ⚑ — and the
   Data group.
7. **Data.** As 1. **0** → notice inside the plane; **this is the design's strongest state** ⚑.
   **No description** → the plane closes to 138 px, no minimum ⚑.
8. **Empty.** Every case stays inside the plane; **the plane never renders empty**.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Name is the **h1**. **The plane is decorative** — no role, no label ⚑.
    **Flagged ⚑** internal padding fixed at 44 × 48 · dark forces Flat · the plane's own name ladder ·
    plane-is-a-ground · zero named as the best case · no minimum plane height.

---

### 5 · Full Bleed

1. **Descriptor.** The tag or author feature image full-bleed under the site header, name and count
   on a warm scrim, bottom-left on the content box.
2. **Tuple.** `media frame · none · image · none · full-bleed · the feature image carrying the name`
3. **Archetype.** media frame. **One departure** — the ratio is not preserved across widths; each
   width has its own stated height.
4. **Responsive.** **1440** 1440 × 440, text 48 above the foot on the 1,296 box, name 52, description
   560. **834** 834 × 380, name 44. **≤ 767** 390 × 420, name 34, description full width, text 32
   above the foot. **No image at any width** → the frame keeps its stated height and its type on the pack's contrast ground ⚑.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `featureImage` — **the one field a design in A29 is built around** ⚑ — **`imageFocus`** · `emptyText`.
6. **Controls.** Height *Short · Standard · Tall* — **the image's own depth, 440 at Standard on 1440**
   ⚑, which is why it keeps its name against Vertical spacing — Scrim *Light · Medium · Strong*
   (**Light disabled against light images**, checked on the bottom third **in the editor when the picture is chosen — CSS cannot see a photograph, and the check does not re-run when the publication swaps the Ghost image** ⚑) — Name size — Eyebrow
   *Show · Hide* (**new** ⚑) — Description — Post count — Alignment *Left · Centre*. **Seven.** Plus
   the trio — **Background role locked at Image**, Vertical spacing resolving 0, Top divider locked
   None — and the Data group, which carries **Image focus *Centre · Top · Bottom*** ⚑.
7. **Data.** `{{#tag}}{{feature_image}}` or `{{#author}}{{cover_image}}` ⚑ — the cover, not the
   profile picture. **0** → notice on the scrim, image unchanged. **No image** → the picture slot resolves to the contrast ground and the design renders itself ⚑; the panel advises and never switches.
8. **Empty.** **The no-picture state is drawn on the states strip** — the frame, the flat contrast ground and the white type.
9. **Module.** None. **No-JS: pixel-identical** — the image is a CSS background on a real
   `{{img_url}}` ⚑, the focus compiles to a background position, and the scrim is a gradient.
10. **A11y.** Name is the **h1**, checked at Medium against the darkest and lightest thirds of the
    sample crop ⚑. **The image is decorative and takes an empty alt** ⚑.
    **Flagged ⚑** white over the image is a literal in every pack (A20·13's rule) · author cover not
    profile picture · **the crop is authored through Image focus and computed never** · scrim percentages · Light disabled by a bottom-third check **made in the editor** · per-width heights · **the no-picture state and the contrast ground it resolves to** ⚑.

---

### 6 · Image Split

1. **Descriptor.** The head in one half of the content box and the feature image in the other,
   vertically centred against each other.
2. **Tuple.** `split · none · page · none · right · the feature image beside the name`
   The Image side control moves it left **visually without changing the tuple** ⚑.
3. **Archetype.** split. **One departure** — it collapses at 834 with the media going **below** the
   text rather than above it ⚑.
4. **Responsive.** **1440** 636 · 24 · 636, image 3:2, text vertically centred, name 44. **834**
   stacked, text 754 then image 754 × 300, name 38. **≤ 767** stacked, image 350 × 220, name 30.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `featureImage` · **`imageFocus`** ·
   `backLabel`/`backUrl` · `emptyText`.
6. **Controls.** Image side *Left · Right* (visual only ⚑) — Image shape *Landscape 3:2 · Four by
   three · Square* — Name size — Eyebrow *Show · Hide* (**new** ⚑) — Description — Post count.
   **Six.** Plus the trio (Vertical spacing is the old Padding) and the Data group with **Image
   focus** ⚑.
7. **Data.** As 5 for the image. **No image** → the column goes and **the text keeps 636** ⚑; no
   hand-off, because the remaining design is still a legitimate head. **0** → notice under the name.
8. **Empty.** One empty half is the design's weakest state and is drawn.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Name is the **h1**. **DOM order is name-then-image at both Image side values** ⚑; the
    image takes an empty alt.
    **Flagged ⚑** Image side is visual only · the text column does not widen · media below on
    collapse · per-width ratios · **Image focus does its hardest work at Square, where a landscape
    file is cropped most** · the three named shapes.

---

### 7 · Rail

1. **Descriptor.** Label, count and back link in a 240 px margin rail; name and description in the
   1,008 px body. A25's division, reused verbatim.
2. **Tuple.** `edge rail · none · page · none · none · the head standing in the margin`
3. **Archetype.** edge rail. **One departure** — the rail leaves at **1,200** rather than 834 ⚑.
4. **Responsive.** **1440** 240 · 48 · 1,008, rail offset 10 px to the first baseline, name 48
   clamped 880, description 720. **1,200–834** stacked, rail items above the name, gap 24. **≤ 767**
   stacked, gap 20, name 32, description 16.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `backLabel`/`backUrl` ·
   `actionLabel`/`actionUrl`/`actionIcon` (only at Rail contents: action) · `emptyText`.
6. **Controls.** Rail side *Left · Right* (visual only ⚑) — Rail contents *Label and count · Label,
   count and link · Label, count and action* — Name size — Eyebrow *Show · Hide* (**new** ⚑) —
   Description — **Gutter rule** *On · Off* (**was Divider** ⚑) — **Member visibility** (**new** ⚑,
   greyed unless the rail carries the action). **Seven.** Plus the trio and the Data group.
7. **Data.** As 1. **0** → the rail reads the catalog zero count and the body carries the notice ⚑.
   **No description** → the body is the name alone at 76 px tall, drawn.
8. **Empty.** **The rail never renders empty** — always at least a label and a count.
9. **Module.** None. **No-JS: the head and the rail are pixel-identical**; at *Rail contents: Label, count and action* **the Portal action is drawn and does nothing with JavaScript off** ⚑, and **it does not render when the site has self-signup off or no payment provider** ⚑. **The rail is not sticky** ⚑; 14 is the design that pins.
10. **A11y.** Name is the **h1** and is **first in the DOM** ⚑ — the rail is written after the body
    and placed with `order`.
    **Flagged ⚑** rail leaves at 1,200 · the 10 px offset · DOM order body-first · **the rule is in
    the gutter, which is why it is Gutter rule and not Bottom rule** · controls stay live and inert
    below 1,200 · count and notice say different things at zero.

---

### 8 · Bar

1. **Descriptor.** A one-line surface band carrying the label, name, count and way back. The lightest
   head in the category and the only one that draws no description.
2. **Tuple.** `bar · none · surface · none · none · a one-line archive bar`
3. **Archetype.** bar. **One departure** — it abandons its fixed height at 390 and becomes two rows.
4. **Responsive.** **1440** 88 tall, content on the 1,296 box, name 24, count and link right. **834**
   88 tall, name 22. **≤ 767** two rows, content plus 14 above and below, name 20, **Bar height
   inert** ⚑.
5. **Fields.** `eyebrow` · `titleOverride` · `backLabel`/`backUrl` · `emptyText`. **`description`,
   `featureImage` and `imageFocus` are in the union and are not drawn here** ⚑ — kept, not discarded,
   and `description` is now **drawn greyed in the Content group** so the user can see it survives.
6. **Controls.** **Bar height** *Compact · Comfortable · Spacious* — 88 at Comfortable, **a real
   height, not padding; renamed from Height** ⚑ — Name size *Regular · Large* (**no Display** ⚑) —
   Eyebrow *Show · Hide* — Post count *At the right · After the name · Off* — Back link *Show · Hide*
   — Rules *Top and bottom · Bottom only · None*. **Six.** Plus the trio — **Vertical spacing
   resolving 0, Top divider locked None because Rules owns the bar's top edge** ⚑ — and the Data
   group.
7. **Data.** As 1. **0** → count reads the catalog zero string and **the notice renders below the bar
   on the page ground** ⚑. **Long names** → ellipsise at the count's left edge; never wrap ⚑.
8. **Empty.** **The bar itself has no empty state** — it always has a name and a count.
9. **Module.** None. **No-JS: pixel-identical.** **Deliberately not sticky** ⚑ — 14 is where that is
   designed.
10. **A11y.** Name is the **h1**, inside the bar. **The ellipsis is CSS, so the full name stays in the
    accessible name** ⚑ — and in the inline editor, so what is edited is never what is cut. The bar is
    not a landmark.
    **Flagged ⚑** no description at any width and the field kept and shown greyed · fixed height
    rather than padding · Bar height inert at 390 · no Display · Rules: None near-invisible in some
    packs · Top divider locked because Rules overlaps it · notice below the bar · names ellipsise.
    **The stress frame draws this design at 834, not 1440** ⚑ — the 69-character stress name is 718 px
    in a 1,296 box and never reaches the count, so the ellipsis rule is drawn at the width where it
    fires.

---

### 9 · Big Type

1. **Descriptor.** The archive name at display scale across the content box, count in the opposite
   corner, no ground of its own.
2. **Tuple.** `stack · none · page · none · none · the name at display scale` ⚑
   **Ground `transparent` was the claim** — the section declared no background and showed what was beneath it — and **this pass withdraws it** ⚑: there is no Inherit choice anywhere in the library, so the row is open, rests at **Background**, and the tuple reads `page`. **What separates it from 1 Centred is now the display scale, the count in the opposite corner and the absent back link.** **Ruled by the owner on 30 August 2026: the row stays open and rests at Background** — the editor may put the display-scale name on the page, on a raised plane or on a band, and a visitor sees today's rendering at the default.
3. **Archetype.** stack. **One departure** — the count leaves the corner at 390.
4. **Responsive.** **1440** name 104 clamped 1,180, count 17 offset 12 px, description 620, gaps 28
   and 14. **834** name 76, count in the corner. **≤ 767** name 48, count under the name, gaps 20 and
   12.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `emptyText`. **No image, no back link** —
   a 104 px name with a 14 px link under it is two designs arguing ⚑.
6. **Controls.** Name size *Large · Display · Poster* (its own ladder and its own value names ⚑) —
   Eyebrow *Show · Hide* — Description — Post count *In the corner · Under the name · Off* — Count animation *On · Off*, **off by default** ⚑. **Five — the category's shortest list.** Plus the trio — **Background role open and resting at Background; Inherit is removed** ⚑ — **the owner's ruling, 30 August 2026** — Vertical spacing the old Padding, and the Data group.
7. **Data.** As 1. **0** → the catalog zero string in the corner, notice under the name; **Count
   animation does nothing at zero** ⚑. **Long names** wrap, never shrink — **no auto-fit** ⚑.
8. **Empty.** No description → name and count alone, the design's best state.
9. **Module.** **`count-up`**, declared only when Count animation is On. **Edit-safe: no** — it does
   not run while editing and the resting frame is the final value. **No-JS: "The final value renders
   as static text — it is already in the HTML before JS ever runs."** Reduced-motion: static.
10. **A11y.** Name is the **h1** at 104 px. **The count is not an aria-live region even when
    animating** ⚑ — the final value is in the DOM from the start, which is also why the no-JS case
    works. Clicking the count shows P0·1's lock pill, "Post count — from Ghost".
    **Flagged ⚑** no auto-fit · its own ladder and value names · the 12 px offset · no back link · **the withdrawn `transparent` ground and the removed Inherit value** ⚑ · animation off by default · no aria-live.

---

### 10 · Boxed

1. **Descriptor.** A hairline box on the page ground with the head centred inside it. A boundary
   rather than a surface.
2. **Tuple.** `stack · box · page · none · none · a hairline box round the head`
   **Containment `box` is the only one in A29** ⚑.
3. **Archetype.** stack. **No departures.**
4. **Responsive.** **1440** box 1,296, padding 48 × 56, measure 720 centred, name 40. **834** box 754,
   padding 40, measure 600, name 36. **≤ 767** box 350, padding **28 × 24** ⚑, measure full, name 28.
5. **Fields.** As 1.
6. **Controls.** **Box padding** *Compact · Comfortable · Spacious* — inside the box, **renamed from
   Padding** ⚑ — Alignment *Left · Centre* — Name size *36 · 40 · 52* ⚑ — Eyebrow *Show · Hide*
   (**new** ⚑) — Description — Post count — Back link. **Seven.** Plus the trio — **Vertical spacing
   now owns the space around the box, which this design had fixed at 96 with no control** ⚑ — and the
   Data group.
7. **Data.** As 1. **0** → notice inside the box. **No description** → the box closes to 174 px and
   **keeps its width** ⚑.
8. **Empty.** **The box never renders empty and never shrinks to its content** ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Name is the **h1**. **The box is decorative** — no role, no label ⚑.
    **Flagged ⚑** the inside is a control and the outside is now the universal row, which still
    inverts 4 Panel · its own name ladder · asymmetric 28 × 24 at 390 · no Fill and no Corners
    controls · the box keeps the content-box width.

---

### 11 · Filter

1. **Descriptor.** The archive name over a row of sibling-tag links, the current one accent-filled,
   the row closed by an all-topics link.
2. **Tuple.** `bar · none · page · variable · none · sibling tags as a filter row`
3. **Archetype.** bar. **One departure** — it is two rows at every width, not one.
4. **Responsive.** **1440** name 40, description 620, pill row wraps, 8 px gaps, the all-topics link
   after the last pill. **834** name 36, row wraps to two lines. **≤ 767** name 28, **row scrolls
   sideways, forced** ⚑, with the link as its last item.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `links[]` 2–12 ⚑ · **`allTopicsLabel`**
   (default "All topics →" ⚑) · **`allTopicsUrl`** · `emptyText`.
6. **Controls.** Name size — Eyebrow *Show · Hide* (**new** ⚑) — Description — Tag row *Most used ·
   Alphabetical · Chosen tags* (+ **P0·3's item list** at that value ⚑) — Counts on tags *Show · Hide*
   — Row overflow *Wrap · Scroll* (**forced Scroll at 390** ⚑) — **All topics link** *Show · Hide*
   (**new** ⚑). **Seven**, plus the item list. Plus the trio and the Data group.
7. **Data.** `{{#get "tags" limit="12" order="count.posts desc" include="count.posts"}}` ⚑. **0 tags on the site** → no row and no link; **the design is its own head, left-aligned on the content box** ⚑, and it does not become another design. **1 tag** → "All posts"
   plus one pill. **More than 12** → truncated by the limit, **and the all-topics link is what says so** — a 44 px text link, never a pill, so it cannot be read as a tag. **It carries no number** ⚑: a template cannot count what the query left out. **0 posts** → the row is the most
   useful thing on the route.
8. **Empty.** **The active pill is absent on an author or date route** ⚑ — nothing matches, and that
   is drawn rather than faked. **With no `allTopicsUrl` the link does not render**, which is the
   shipped default until the product has a tags route.
9. **Module.** **`filter-strip`**. **Edit-safe: yes** — the pills are links and do nothing in the
   editor. **No-JS: "Filters are `<a href>` links to Ghost routes and work perfectly — this module
   needs JS least of all."**
10. **A11y.** Name is the **h1**. The row is a **`<nav aria-label="Topics">`** of ordinary links ⚑;
    the active pill carries `aria-current="page"` ⚑ and **the all-topics link is the nav's last item,
    a link like the others** ⚑. 44 px targets. **The 390 scroll row is a real overflow container**, so
    it is keyboard-scrollable and every pill is in the tab order.
    **Flagged ⚑** no co-occurrence query, so the row is site-wide · nothing active on author and date
    routes · the 12 limit, and **the link as its exit** · **ARCHITECT: the tags route the link points
    at** · Scroll forced at 390 with no fade or arrows · accent as the active state · counts need
    `include="count.posts"` · no sort control, with its reason.

---

### 12 · Portrait

1. **Descriptor.** The author archive as an inset card carrying the portrait, name, bio, meta line,
   an optional social row and one action. The only design in A29 that draws a face.
2. **Tuple.** `stack · card · page · none · left · the author portrait in a card`
   **Containment `card`** — an inset object with its own plane ⚑.
3. **Archetype.** stack. **One departure** — the portrait moves from left to top at 390.
4. **Responsive.** **1440** card 864 centred, padding 36 × 40, portrait 96 left, name 34, bio 520.
   **834** card 754, padding 32, portrait 96 left, name 32. **≤ 767** card 350, padding 24 × 20,
   portrait 64 above, name 26. The social row wraps under the meta line and never changes the card's
   width.
5. **Fields.** `eyebrow` · `titleOverride` · `description` (the bio) ·
   `actionLabel`/`actionUrl`/`actionIcon` · `emptyText`. From Ghost:
   `{{#author}}{{profile_image}} {{location}} {{website}}` ⚑ and, at *Socials: Show*, **the nine
   handles and the website** — **all optional and commonly empty**.
6. **Controls.** Card width *Inset · Wide* — Portrait *Large · Small · Off* (**greys on a tag route**
   ⚑) — Eyebrow *Show · Hide* (**new** ⚑) — Description — Meta line *Location, posts and site · Posts
   only · Off* — **Socials** *Show · Hide* (**new** ⚑, **Hide by default**) — Action *Button · Link ·
   Off* — **Member visibility** (**new** ⚑). **Eight.** Plus the trio and the Data group.
7. **Data.** `{{#author}}` on an author route; on a tag route the portrait slot is empty and the card
   holds the tag head ⚑. **0** → an author with no posts yet — card, bio, social row and action all
   stay ⚑. **Socials** reads the author's own fields, **never `social_url`** ⚑, and is
   **version-gated**: Facebook, X and the website on Ghost 5.x, nine handles and the website on
   ≥ 6.36.
8. **Empty.** No portrait → A1's initials. No bio → name straight to meta. No location or website →
   **the meta line is the count alone** ⚑, with no orphan separators. **No handles → no social row and
   nothing reserved** ⚑, which is why the control is Hide by default.
9. **Module.** None. The action is a plain link to Ghost's Portal ⚑ and P0·4's per-state rules compile server-side. **No-JS: the card is pixel-identical and the action does nothing** ⚑ — Ghost's sign-up pop-up needs JavaScript — and **the action does not render when the site has self-signup off or no payment provider** ⚑.
10. **A11y.** Name is the **h1**. **The portrait takes an empty alt** ⚑. The website is a real link
    and precedes the action in the tab order; the action is a 44 px target. **Each social slot is a
    44 px link whose accessible name is the network** ⚑ — A21·6's rule — and its glyph is
    `aria-hidden`.
    **Flagged ⚑** inset card at 864 and the card/ground/box distinction · Wide is 4 Panel with a face
    and says so · portrait greys rather than vanishes · the category's only accent fill · Portal
    signup default · meta items drop with their separators · portrait above the text at 390 · **the
    social row is A21·6's, version-gated, and Hide by default**.

---

### 13 · Index

1. **Descriptor.** The archive head in a 416 column beside the full tag index in ruled columns, the
   current tag marked.
2. **Tuple.** `grid-of-N · none · page · many · none · the tag index beside the name`
3. **Archetype.** grid-of-N. **One departure** — the head column is not a cell of the grid; it stacks
   above it at 834 rather than becoming a column.
4. **Responsive.** **1440** 416 · 24 · 856, index three columns of four, rows 36 px, description 380.
   **834** stacked, index two columns of six. **≤ 767** stacked, **one column of twelve, nothing
   truncated** ⚑, Columns inert.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `links[]` 2–12 ⚑ · `backLabel`/`backUrl`
   · `emptyText`.
6. **Controls.** Name size — Eyebrow *Show · Hide* (**new** ⚑) — Description — Index list *Most used ·
   Alphabetical · Chosen tags* (+ **P0·3's item list** ⚑) — **Columns** a number picker, **2–3, default 3** (**was two fixed words; 3 is the ceiling, greyed with its reason on the control — a fourth column is 202 px and clipped tag names over 22 characters** ⚑) — Counts *Show · Hide*. **Six**, plus the item list. Plus the trio and the Data
   group.
7. **Data.** `{{#get "tags" limit="12" order="count.posts desc" include="count.posts"}}` ⚑. **0
   tags** → no index; the head takes the content box ⚑. **Fewer than the column count** → the last columns are empty and the panel advises 2 ⚑. **More than 12** → **truncated silently, and
   deliberately so**: 11 Filter's all-topics link is this pass's answer and **13 does not take it**,
   because a thirteenth ruled line in a printed index is not an exit.
8. **Empty.** No description → a four-line head against a twelve-row index, drawn. Zero posts → the
   current tag is marked and reads 0.
9. **Module.** None. **No-JS: pixel-identical** ⚑. `filter-strip` was considered and **not declared**
   — nothing here filters; these are navigations.
10. **A11y.** Name is the **h1**. The index is a **`<nav aria-label="All topics">`** containing a
    `<ul>` ⚑; the current tag carries `aria-current="page"`. **The 2 px underline is not the only
    marker** — the weight change carries it too ⚑. **The whole row is the target** ⚑, which is also
    what the inline editor selects.
    **Flagged ⚑** no sibling query, so the index is site-wide · no tag-index page is created · the 12
    limit and its silence, kept here on purpose · **Four removed because 202 px clipped names over 22
    characters** · description clamped 380 · reading order down then across · one column of twelve at
    390 rather than truncation.

---

### 14 · Sticky

1. **Descriptor.** A full head with a slim full-bleed bar at its foot that pins to the top of the
   window as the grid scrolls.
2. **Tuple.** `sticky · none · page · none · none · the name condensing to a pinned bar`
   Ground `page` for the head; **the bar is `surface` and is a part of the section, not its ground**
   ⚑.
3. **Archetype.** sticky. **One departure** — no bottom spacing at any width; the bar is the
   section's last pixel ⚑.
4. **Responsive.** **1440** head on the 1,296 box, name 44, 36 px to the bar, bar 56 full-bleed.
   **834** name 38, bar 56. **≤ 767** name 30, 28 px to the bar, bar 52, **back link dropped from the
   bar** ⚑.
5. **Fields.** `eyebrow` · `titleOverride` · `description` · `backLabel`/`backUrl` · `emptyText`.
   **The bar authors nothing of its own** — it is a second rendering of the head's fields ⚑, so every
   string is written once and edited once.
6. **Controls.** Name size *(head only; the bar is fixed at 17 ⚑)* — Eyebrow *Show · Hide* (**new** ⚑,
   and it takes the bar's label with it) — Description *(head only; **never in the bar** ⚑)* — Post
   count *In the bar · In both · Off* — Bar contents *Label, name and count · Label, name, count and
   link · Name and count only* — Bar rule *Hairline · None* (**None disabled while pinned, with the reason on the control** ⚑ — an edgeless surface bar over a scrolling grid has no boundary at all in a light pack).
   **Six.** Plus the trio — **Vertical spacing above only; below stays 0 at every value** ⚑ — and the
   Data group.
7. **Data.** As 1. **0** → the bar renders and never pins ⚑. **many** → the bar pins for the length
   of the grid and **unpins at A34's pagination**, because the sticky context ends with the page ⚑.
8. **Empty.** No description → head is eyebrow and name, 36 px above the bar. Zero posts → notice in
   the head, bar unchanged.
9. **Module.** **None.** `position: sticky` is CSS and needs no script ⚑. **No-JS: pixel-identical,
   including the pinning.** **A shrinking or solidifying bar would need `header-scroll`, which is
   A1's site-header module**; A29 does not declare it and does not invent one — finding 6.
10. **A11y.** The head's name is the **h1**; **the bar's name is a `<p>`, not a heading** ⚑, so the
    outline has no phantom level. The bar is not a landmark. Pinned, it reduces the viewport by 56 px,
    which is why **`scroll-margin-top` is set on the grid's cells** ⚑.
    **Flagged ⚑** no shrink, shadow or transition on pin · the bar's name in the body font at a fixed
    17 · never carries the description · Bar rule: None disabled while pinned · back link dropped at
    390 · no bottom spacing · unpins at A34 · `scroll-margin-top` on the grid · `header-scroll` named
    as closest and not claimed.

---

## Findings for the architect

1. **Ghost has no date archive.** §8 asks for tag, author and date archives from one design; Ghost
   provides the first two. A date collection is a `routes.yaml` entry the publication writes, and
   **its title comes from the route file rather than from any Ghost object** ⚑.
2. **There is no related-tag query.** 11 and 13 draw sibling tags and **Ghost cannot return "tags
   that co-occur with this one"** ⚑. Both draw the site's tag list ordered by post count and mark the
   current one; on author and date routes nothing is marked.
3. **There is no focal point on a feature image.** 5 and 6 crop from the centre because **Ghost
   stores no focal-point data** ⚑. **Amended in the reconciliation pass:** `imageFocus` — Centre · Top · Bottom — now ships on both designs and is applied to the Ghost image as well as an upload, so the crop is
   **authored** rather than computed. The finding stands for what Ghost *stores*: nothing. **It is
   also short a horizontal axis**, as A12 and A13 both found — Centre · Top · Bottom has nothing to
   say about a 3:2 crop of a portrait file.
4. **`pagination.total` and `count.posts` can disagree.** A29 counts what the archive query returns;
   **A20 Tag Collections counts what the tag holds** ⚑. On a site with member-only posts a reader can
   see "42 posts" on a tag card and "37 posts" on its archive. One of the two has to change, and it is
   not a design decision.
5. **The tag list truncates at twelve.** Both list designs cap at the query limit. **Amended in this
   pass:** **11 Filter now closes its row with an all-topics link** ⚑ — a 44 px text link, never a
   pill — and **13 Index deliberately does not**. **What is still open is the route the link points
   at**: Ghost provides no tag index, as A20 also found, so `allTopicsUrl` **has no default until the
   product makes that decision**, and with no target the link does not render.
6. **There is no sticky module for anything but the site header.** 14 pins with CSS and does not
   shrink, because a shrinking bar needs a scroll listener and **the registry's only scroll module is
   `header-scroll`, which is A1's** ⚑. If a condensing archive bar is wanted, that is a registry
   change.
7. **A29 draws its own spacing and cannot know what precedes it.** It assumes A1's site header
   directly above ⚑ — the same route-awareness gap A26, A27 and A28 each raised, and the first time
   the section is the **first** thing on the route rather than the last.
8. **The universal Background role has no "Inherit" value — and the rule closes it by removing the value.** ⚑ **Raised in the reconciliation pass; closed in the design patch pass.** **9 Big
   Type's ground is `transparent`** — it declares none and shows whatever it is dropped onto, which is
   the whole of its difference from 1 Centred — and the universal control offers Background · Surface ·
   Contrast, all three of which paint. The row **was locked at Inherit**, a value the product does not have. **The library-wide rule is that there is no Inherit choice anywhere, so the value is removed**: the row is open and rests at **Background**, and **A29·9's ground slot changes to `page`** — the design keeps its display scale, its corner count and its absent back link, and loses the ground that separated it from 1 Centred. **A28·10 Slim raised this first.** **The owner ruled on 30 August 2026 that A29·9's row stays open and rests at Background**, and that the product is not being asked for a "same as the page" value — so this finding is closed here rather than passed on. A28·10 needs the same ruling in its own category.

**Answered for A20, which asked:** A29 does repeat the tag's name — every design draws it — and the
counts agree except in the case above.

---

## Component inventory

Cumulative. Reused components are listed with the category that set them.

| Component | What it is | First set |
|---|---|---|
| Eyebrow | 13 px uppercase tracked .08em in `text-muted` | A1·1 |
| Primary button | Accent fill, 14/600, 44 px tall, radius token | A1·1 |
| Ghost action / back link | Muted 14 px text with a ← glyph, 44 px target | A1·1 |
| Avatar + initials fallback | Circle at 96 · 64 · 24, heading-font initial in `hover` | A1·6 |
| Striped image plate | The placeholder and its mono crop caption | A1 |
| Warm scrim | `rgba(35,32,25,.58)` foot fading out at 34%; white text over it | A20·13 |
| Tag pill | 15/500 in a hairline box at the radius token, 44 px, count at 13 | A20·1 |
| Index line | Name 15 and count 13 tabular over a hairline, 36 px row | A20·7 |
| Active state | Accent fill + `onAccent`, or a 2 px accent underline | A1·1 |
| Surface plane | Surface + hairline + md shadow; no shadow in dark | A26·3, A27·4 |
| Rail division | 240 · 48 · 1,008, leaving at 1,200 | A25 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132 | A17 |
| Author social row | Filled-in handles as 32-in-44 icon slots from P0·2's brand set, version-gated at Ghost 6.36; absent handles drop | A21·6 |
| Archive meta line | 14 px muted items separated by `·`, absent items dropped with their separators | A29·12 |
| Zero-archive notice | 17 px muted line under the head, clamped at 560 | A29·1 |
| Archive sticky bar | 56 px surface bar, name at 17/600 in the body font, hairline foot | A29·14 |
| **Archive all-topics link** | **A 44 px text link closing a truncated tag row — "All topics →", never a pill, so it cannot be read as a tag** | **A29·11 — new** |

---

## Reconciliation notes

**Frames changed in this pass — fifteen, and every one of them.** `A29-0 Category Proof` (a new
**reconciliation banner** as its second frame, settlements 1 and 4 amended, four new rules on the
shared floor, the Refused list's focal point withdrawn, the roster's control counts and its header
line, five new rows in the field list, two new rows in the component inventory, **findings 3 and 5
amended and finding 8 added**), and all fourteen design frames: `A29-1 Centred`, `A29-2 Split Head`,
`A29-3 Contrast Band`, `A29-4 Panel`, `A29-5 Full Bleed`, `A29-6 Image Split`, `A29-7 Rail`,
`A29-8 Bar`, `A29-9 Big Type`, `A29-10 Boxed`, `A29-11 Filter`, `A29-12 Portrait`, `A29-13 Index`,
`A29-14 Sticky`. **On all fourteen:** the control-panel frame was rebuilt — Padding retired or
renamed, `Eyebrow: Show · Hide` added, the universal trio drawn outside the list, a **Content** group
added for the authored strings, the Archive source group recut as the **Data** group with its Image
row drawn disabled where nothing draws an image, and an **Editing** group added naming the P0
primitives; the masthead, the panel header line and the footer count were rewritten with the design's
Quick Controls; a **Reconciled** paragraph was added to the panel card and a **Reconciled** line to
the drawn spec, whose Controls entry was rewritten. **Section frames redrawn on two** — **11 Filter**
(the all-topics link now closes the row in all seven drawn rows, and a new state card draws a site
with twenty-six tags) and **12 Portrait** (a new state card draws *Socials: Show* as A21·6's icon-slot
row, with the Ghost 5.x version gate beside it). **No other section frame was redrawn:** nothing else
in this pass changes what the site renders at the defaults.

**Where this pass conflicts with something A29 already ruled, one line each.**

- **"A focal point for the feature image" is withdrawn from the refused list.** It was refused on the
  grounds that Ghost stores none — which is still true. **`imageFocus` is a section field, not a read
  of Ghost's data**, so the objection does not apply to it; A30, A31 and A32 already carry it, and A29
  was the odd one out.
- **7 Rail's rule is renamed Gutter rule, not Bottom rule.** The patch named "Bottom rule" for 1, 2
  and 7; on 7 the hairline runs **down the gutter**, so that name would have replaced one wrong name
  with another. 1 and 2 take **Bottom rule** as instructed. Recorded rather than settled silently.
- **8 Bar's Rules row overlaps the universal Top divider, and Rules wins.** The bar's own top edge is
  part of the bar. **Top divider is locked at None** with the reason shown; the alternative was two
  lines a pixel apart.
- **3 Contrast Band keeps a band-internal ladder where A28·4 declined the same exemption.** A28 ruled
  that a band *is* the section, so its internal padding is Vertical spacing under another name; this
  patch instructed the opposite for A29·3 and A29·10, and the instruction is followed — **Band depth**
  (48 · 72 · 104) and **Box padding** are separate rows, with Vertical spacing resolving 0 on 3. The
  two categories now name the same mechanism differently. Recorded, not resolved uninstructed.
- **10 Boxed's "outside is fixed at 96" is withdrawn.** The universal Vertical spacing owns the space
  around the box, which is what the user was actually asking about; the inside stays **Box padding**,
  so the design still inverts 4 Panel.
- **9 Big Type's Background role is locked at a value the product does not have.** **Inherit** is
  named on the frame with its reason and asked for in finding 8. The alternative — unlocking the row
  and letting three painting values overwrite a `transparent` ground — would delete the design.
  **A28·10 Slim needed it first**; two designs in two categories is a pattern, not a special case.
- **13 Index's Columns: Four is removed, and its own defence is overruled.** The panel argued that
  Four was "offered with its consequence stated rather than disabled". **The consequence was a clipped
  tag name**, and the library's ethos is that a name wraps or the layout changes — never clips. Two
  and Three remain.
- **The zero count's three words are not authored fields.** A28 made `countSingular`, `countPlural`
  and `countEmpty` panel fields. **A29 makes only the zero form a string, and it is a catalog string**
  — `archive.count_empty` — because the singular and plural here are Ghost's `{{plural}}` helper
  output, not a phrase the section composes.
- **A chosen tag's label stays inline-editable, although it arrives from Ghost.** Rule 4 says
  Ghost-owned content is never inline-editable; the category ruled that `links[]` labels are authored.
  **Both hold, on different objects**: once picked, the label is authored text on the section; a tag
  name drawn by the query at *Most used* or *Alphabetical* is Ghost's and answers "Edit in Ghost".
- **Member Visibility lands on three designs, and nowhere else.** 3, 7 (at *Rail contents: Label,
  count and action*) and 12 are the only CTA-bearing designs; the other eleven draw a count, a link
  and a name. A row on those would be a control with nothing to gate.
- **P0·5's "Populate from…" panel lands nowhere.** A29 draws no post list. The Data group governs one
  name, one description and one image; 11 and 13's tag query is a control in those designs, with
  P0·3's Ghost-sourced card under it.
- **The Image row is now drawn disabled in the twelve designs that draw no image.** The field list had
  already ruled it; the panels were drawing it live. The field is kept, not discarded, and the note
  says so.
- **No registry addition was needed**, and no frame carries an "ARCHITECT: registry addition" note.
  `count-up` on 9 and `filter-strip` on 11 remain the category's only two modules: the all-topics
  link and the social row are ordinary links, P0·4's per-state rules compile server-side, and 14 still
  pins with CSS.
- **No Preview control was removed, because none existed.** Rule 7 is satisfied by construction; the
  states that would have needed one — the zero archive, the no-description case, 5's hand-off, 11's
  author route with nothing active — are attributed to **P0·6**'s state switcher.
- **The 4–7 control norm is superseded** by the PRD's ~15 ceiling. A29 now ranges **five to eight**,
  so no design was cut to fit; every design lost Padding and gained Eyebrow, and the three CTA designs
  gained Member visibility.
- **Two open questions, named rather than answered.** (1) **The tags route** `allTopicsUrl` points at,
  which is finding 5 and a product decision. (2) **The Inherit value** 9 Big Type's ground needs,
  which is finding 8 and A28's finding 7 restated by a second category.

---

## Patch notes — archive headers patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered: the letter-and-number codes elsewhere in this project are filing labels and mean
nothing outside it.

**Frames changed — fifteen, and every one of them.** `A29-0 Category Proof` gains a **DESIGN PATCH
PASS** section (the numbering line, the free-designs shortlist and recommendation, the deleted hand-off
and what 5 draws instead, the one-letter avatar, the number-picker Columns, Remove at the minimum, the
removal of Inherit, the three member actions, the rules that land nowhere, the four platform facts and
the two open questions) and **five of its existing cards were corrected** where they still stated the old
behaviour — settlement 3, the roster's thin-content cell for 5, the locked-rows line, the repeating-items
card and finding 8. **All fourteen design frames** gain a **DESIGN PATCH** block naming, rule by rule,
what changed in that design and what was already satisfied, and all fourteen mastheads are stamped
*patched 30 August 2026*.

**Drawn content changed on six designs.** **5 Full Bleed** — the hand-off state card is replaced by the
design's own no-picture state, and the descriptor, the responsive line, the Data note, the scrim note and
the drawn spec changed with it. **9 Big Type** — the Background role row is redrawn from a locked *Inherit*
to an open Background · Surface · Contrast resting at Background, in the panel, the reconciled note, the
tuple line and the descriptor. **12 Portrait** — the initials circle is redrawn from **RM** to **R**, with
its caption. **13 Index** — Columns is redrawn as a number picker with a greyed ceiling. **11 Filter** and
**13 Index** — the item list's Remove note is rewritten. **3 Contrast Band**, **7 Rail** and **12 Portrait**
— the Action and Member visibility rows gain two notes each. **14 Sticky** — Bar rule's reason moves onto
the control. **No arrangement moved, and no type scale, colour pack or spacing step changed.**

### What changed, and the rule that required it

1. **5 Full Bleed's hand-off to 1 Centred is deleted, and the design draws its own no-picture state** —
   *no design ever turns into another design*. With no feature image the frame keeps its **Height** and
   its bottom-left type, the white ink stays white, **no scrim is drawn** (there is nothing to scrim) and
   **the picture slot resolves to the pack's contrast ground** — a flat ink plane at the stated height,
   which is a designed state rather than a grey slab. **Background role stays locked at Image** with its
   reason. **The panel advises** — "no picture on this tag — 1 Centred reads better here" — **and never
   switches.** Settlement 3 is amended in the same words on the proof frame and in this document.
2. **11 Filter's "the design is 1 Centred left-aligned" is deleted** — *no design ever turns into another
   design*. With no tags on the site the row and the all-topics link do not render and the design is
   **its own head, left-aligned on the content box**. Nothing draws an empty container, a placeholder
   pill or a "no tags yet" line, and the active pill is simply absent on an author or date route.
3. **Three advisory sentences were checked and kept, and three denials with them** — *no design ever turns
   into another design*, which permits advice. **2 Split Head** ("with no description, 1 Centred is the
   better choice"), **6 Image Split** ("at one empty half, 1 Centred is the better design") and **13
   Index** ("below the column count, use 2") all advise in the panel and none switches. The denials —
   **7 Rail** and **8 Bar** are not sticky, **6 Image Split** has no hand-off — are the rule being obeyed
   and stay as written. **12 Portrait's** "Wide is 4 Panel with a face" is a comparison, not a
   destination.
4. **12 Portrait's initials circle shows one letter** — *avatars with no photograph*. It drew **RM**. The
   author comes from Ghost, and **Ghost cannot produce two initials from a name**, so "Rosa Menendez"
   shows **R**. It is the only design in A29 that draws a face, and **no list in this category is typed by
   the site**, so the two-initial form has no subject here.
5. **Inherit is removed, and 9 Big Type's Background role is open** — *a design may offer fewer choices on
   a shared control and must say why, and there is no "Inherit" choice anywhere; remove it*. The row was
   locked at a value the product does not have. It now offers **Background · Surface · Contrast** and
   rests at **Background**, which is what a visitor sees today. **What the design gives up is its
   `transparent` ground** and, with it, the tuple slot that separated it from 1 Centred; the display
   scale, the count in the opposite corner and the absent back link are what separate them now. **Ruled by the owner on 30 August 2026: the row stays open and rests at Background** — the rule settled the value, and he settled what the design does about it. Editors gain two grounds the design never offered; nothing a visitor sees changes at the default.
6. **The tag list's Remove stays clickable at two items and says why** — *the Remove button never greys
   out*. In **11 Filter** and **13 Index** the ✕ is never dimmed and never hidden, and at the minimum
   clicking it explains rather than acting: "a filter row needs at least two tags" / "an index needs at
   least two tags". **The previous behaviour is withdrawn**: removing the last one used to return the
   control to *Most used*, which took the user's list away at a click and disagreed with the stated
   minimum of two.
7. **13 Index's Columns is a number picker, 2–3, default 3** — *item counts are a number picker, never a
   row of fixed buttons*. It was two fixed words. **3 is this design's ceiling, greyed at the + with its
   reason on the control**: a fourth column is 202 px and clipped tag names over 22 characters, and
   nothing in this library clips a name it could wrap. That is where the previous pass's "Four is
   removed" now lives — **a capped maximum with its reason visible, rather than a missing value.**
8. **The three member actions gained two notes each, and three no-JavaScript lines changed** — *member
   buttons are conditional, and Ghost's sign-up pop-up needs JavaScript*. On **3 Contrast Band**, **7
   Rail** (at *Rail contents: Label, count and action*) and **12 Portrait**: the action **does not render
   when the connected site cannot support it** — self-signup switched off, or no payment provider
   connected — and **with JavaScript off the Portal link is drawn and nothing happens**. Their
   no-JavaScript lines read "the head is pixel-identical and the action is inert" where they read
   "pixel-identical". The other eleven designs bear no action.
9. **5 Full Bleed's scrim check is stated as an editor-time measurement** — *CSS cannot see content*. The
   frame said *Light is disabled against light images, checked on the bottom third*, as though the
   stylesheet could read the photograph. **The check is made in the editor when the picture is chosen**,
   it **cannot re-run when the publication swaps the Ghost image later**, and that is why Medium is the
   default. The bottom-third rule itself is unchanged.
10. **14 Sticky's Bar rule: None gained its reason on the control** — *a design may offer fewer choices on
    a shared control, and must say why*. It was drawn disabled while pinned with the reason only in the
    notes: an edgeless surface bar over a scrolling grid has no boundary at all in a light pack, so the
    posts appear to run through it.
11. **11 Filter's all-topics link is stated to carry no number** — *Ghost's templates cannot count, add,
    or remember*. "All topics →" is the whole claim: nothing can count what the query's limit of twelve
    left out. The drawn spec's *"the row says nothing about it"* is replaced by the link and its silence.
12. **Nothing was renumbered and no design was deleted.** Fourteen designs, 1 to 14, no gap created or
    closed, no number reused.

### Rules and facts that were already satisfied, checked design by design

| Rule or fact | Where it lands in A29 |
|---|---|
| **Slider labels** | **No subject.** A29 draws no slider. Every scale is a named-value row whose title says what it affects and whose values reuse the standard words — **Vertical spacing** Compact · Comfortable · Spacious, **3's Band depth**, **8's Bar height**, **10's Box padding**, **5's Height**, and the five **Name size** ladders. No invented three-word vocabulary anywhere. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A29 exposes no gap control at any width: the 100 px gutter on 2, the 24 px gutters on 6 and 13, A25's 240 · 48 · 1,008 rail on 7, the 8 px pill gap on 11 and the 36 px row on 13 are fixed values in the arrangement. **No Tight/Even/Airy or Tight/Standard/Wide existed to rename.** |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fourteen; the two that were short of a reason are in **What changed** above. **The colour swatch row is Base.** **There is now no "Inherit" value anywhere in A29** — it was in one place and it is gone. No design renames a shared control or adds a choice to one. The narrowings that were already right, each with its reason drawn: 3's locked Contrast, Vertical spacing at 0, locked Top divider and disabled accent with its 4.0:1 ratio; 5's locked Image and disabled Light scrim; 2's Display disabled at Wide description; 8's absent Display, inert Bar height at 390 and Top divider locked because Rules owns the bar's top edge; 4's dark-forces-Flat; 10's Box padding inside against Vertical spacing outside; 12's greyed Portrait on a tag route and Hide-by-default Socials; 13's inert Columns at 390. |
| **The no-JavaScript notice** | **No subject, and no promise to withdraw.** A29 holds **no subscribe field and no sign-in field** in fourteen designs, so there is nothing for the notice to replace, and no sentence here ever said a reader could subscribe without JavaScript. The three member *actions* are links, and the rule *member buttons are conditional* covers them — see **What changed**. Twelve designs remain **pixel-identical with JavaScript off**; 9 Big Type's `count-up` resolves to the final value, which is in the HTML before any script runs; 14 Sticky pins with CSS, **including the pinning**. |
| **Item counts are a number picker** | One subject, in **What changed** (13's Columns). Everything else was already clean: **nothing in A29 repeats except the tag list**, which is P0·3's authored list of two to twelve with Add opening Ghost's tag picker — a list, not a quantity — and the query's `limit="12"` is not exposed as a row. 8's *Bar contents*, 7's *Rail contents* and 14's *Bar contents* are named combinations, not counts. |
| **Avatars with no photograph** | One subject, in **What changed** (12's circle). **No other design in A29 draws a face**, and **no list in this category is typed by the site**, so the two-initial form has no subject at all here. |
| **The Remove button never greys out** | One subject, in **What changed**. **Nothing else in A29 is a repeating list**: A29 draws no posts, the social row is Ghost's filled-in handles rather than an authored list, and there is no Add anywhere else in the category. |
| **Ghost's templates cannot count, add, or remember** | Two subjects in **What changed** (11's link, and the no-arithmetic statement on 9). Everything else was already right: the count is Ghost's own **`{{pagination.total}}`**, the singular is `{{plural}}`, **the zero form is the `archive.count_empty` catalog string** rather than a template literal, the tag counts come from `include="count.posts"`, and **nothing anywhere shows a total it computed, a saving, an "and 2 others" or a heading that appears only when a value changes.** A29 draws no list of posts, so `group-headings` has no subject either. |
| **CSS cannot see content** | Two subjects in **What changed** (5's scrim, and the statements added per design). Already right elsewhere: every description clamp is a **max-width**, never a character count; **a long name wraps and nothing auto-fits**; 8's ellipsis is `text-overflow`, which truncates without knowing the length, and **the full name stays in the accessible name and in the editor**; 12's meta items drop with their separators server-side; and **nothing in A29 reorders the DOM at a breakpoint** — 7's rail is placed with `order` in one fixed order, 6 keeps name-then-image at both Image side values, 4's and 8's phone arrangements are grid placement, and 13 reads down each column then across at every width. |
| **Some fields we drew do not exist** | **Nothing missing is read.** A29 reads five things from Ghost — the name, `{{pagination.total}}`, the tag description or author bio, the tag feature image or author **cover**, and on 12 the portrait, location, website and the nine handles (version-gated at Ghost 6.36, read from the author and never from `social_url`). **No member join date, no member newsletter list, no newsletter cadence, no site address and no "posts per page" setting appears anywhere** — posts-per-page is `routes.yaml`, and "Joined last month" on 12's no-posts card is **the author's own bio text, not a join date**. `imageFocus` is the section's own field because **Ghost stores no focal point**, and **Ghost has no date archive** — a date collection's title comes from the route file. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere.** All fourteen are placeable sections at the head of a listing route: their markup, their ARIA and their words are ours end to end. A33 is the category for Ghost-rendered body content. Recorded, applied nowhere. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest heads, none of which depends on the customer owning good photography — **1 Centred · 8 Bar · 10 Boxed · 4 Panel · 7 Rail** — recommended **1 Centred and 8 Bar**, and **ruled by him on 30 August 2026**. The line the merge reads is at the head of this document, on its own line, in the required shape. |

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14** — fourteen
   designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the
   required shape, and names **1 Centred** and **8 Bar** — both of which exist in this category's roster.
   It is **the owner's own choice, ruled on 30 August 2026**.

### The owner's rulings — 30 August 2026

**Nothing in this category is left open to him.**

1. **The free designs are 1 Centred and 8 Bar** — *the two free designs are the owner's choice*. Between them a free site gets the arrangement the whole category is built from and the lightest possible head, and neither needs a picture or a description — which most tags do not have. The pairs he refused: **1 with 4 Panel** (it gives away the strongest empty-archive state) and **1 with 10 Boxed** (the two differ only by a rectangle, so a free customer effectively gets one design).
2. **9 Big Type's background row stays open and rests at Background** — *there is no "Inherit" choice anywhere*. The editor may put the display-scale name on the page, on a raised plane or on a band; a visitor sees today's rendering at the default; and **the product is not being asked for a "same as the page" value**. What the design gives up is the `transparent` ground that separated it from 1 Centred — the display scale, the corner count and the absent back link carry that now.

### The questions as they were put to him

**QUESTION 1 — Which two designs are free**

Every category ships two designs a free customer can use, and which two is your call. For the head of an
archive page — the block that says "Tag: Infrastructure · 42 posts" above the list of posts — five are
plain enough to ship without looking unfinished, and none of them needs the customer to own good
photographs.

1. **1 Centred and 8 Bar (RECOMMENDED — and his ruling).** A centred name with its count on the measure, and a single-line
   bar carrying the label, name, count and way back. Recommended because between them a free site gets
   the arrangement the whole category is built from **and** the lightest possible head, and neither needs
   a picture or a description — which most tags do not have.
   *What it gives up:* the free tier has nothing with a raised plane or a boundary, so a free site's
   archive head never looks like an object on the page.
   *What a visitor sees:* "Tag / Infrastructure / 42 posts / ← All posts" centred over the grid, or the
   same four things on one 88 px line.
2. **1 Centred and 4 Panel.** The default, plus the head on a raised surface plane.
   *Costs:* Panel is the strongest empty-archive state in the category, so paid customers lose the one
   thing they would most notice; and a plane is a stronger design statement to hand a customer who has
   not chosen anything yet.
   *What a visitor sees:* the same words inside a pale raised panel with the count at its right edge.
3. **1 Centred and 10 Boxed.** The default, plus a hairline box round the head.
   *Costs:* Boxed and Centred differ only by a rectangle, so the free pair reads as one design with a
   border — a free customer effectively gets one choice, not two.
   *What a visitor sees:* the same words inside a thin ruled box.

**QUESTION 2 — The big-name design has no "plain background" setting any more**

One design in this set — the one that prints the archive name very large across the page — used to say
"paint no background of my own; show whatever is underneath me". Every section in the product now shares
one background setting with three choices: the page colour, a slightly raised panel colour, or a dark
band. The rule we are working to says there must be no fourth "same as underneath" choice anywhere, so
that setting has been removed, and this design now sits on the plain page colour like the others. A
visitor sees exactly what they see today. What should the setting do?

1. **Leave the row open on the page colour (RECOMMENDED — and his ruling).** The editor can put the big name on the page,
   on a raised panel or on a dark band, and it starts on the page.
   *What it costs:* the design no longer has a background story of its own, so on paper it is "the
   centred design with a much bigger name". Nothing a visitor sees changes.
   *What the editor sees:* three background choices, none of them greyed.
2. **Lock the row to the page colour, with the reason shown.** Closest to the old intention: this design
   is always on the plain page.
   *What it costs:* an editor who wants the big name on a dark band cannot have it, and has to place the
   dark-band design instead and give up the display-scale name.
   *What the editor sees:* one greyed row reading "Background — always the page colour on this design".
3. **Ask the product for a "same as the page" choice on every section.** Two designs in two different
   categories have now asked for it.
   *What it costs:* a change to a setting that appears on every section in the product, which is
   engineering work outside this library, and it re-opens the rule that says there is no such choice.
   *What the editor sees:* a fourth choice on every section in the product.

**Still open with the architect, unchanged by this pass:** the address the "All topics →" link points at.
Ghost provides no tag-index page, so the link has no default target and does not render until the product
makes that decision.
