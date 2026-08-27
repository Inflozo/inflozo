# A17 Post Grids — written specification

18 designs · Paper pack · drawn 21–22 August 2026

**Controls-reconciliation patch — 24 August 2026.** The category was audited, design by design,
against the PRD's control vocabulary and Ghost's verified data surface, thinking like a user editing
their own site. This revision reuses the shared editor primitives from **P0 · Editor primitives**
by name — the **P0·1** inline text toolbar with its link popover, the **P0·2** icon slot and Icon
Picker, the **P0·3** item controls, the **P0·4** member-aware action editor, the **P0·5**
"Populate from…" data panel and the **P0·6** editor state switcher — and never redraws them.
Seven rules now sit on every design: the universal trio outside each control list, **Hand-picked**
in Source, **Count as a stepper**, the main feed's empty state and its pagination select, **Tag
Show · Hide**, the **Meta** enum with **With photograph**, and inline-editable head strings against
Ghost-owned post content. What each design gained is in a **Reconciled** paragraph at the foot of
its entry, and the frame-by-frame list is in **Reconciliation notes** at the end.

The frames are `A17-0 Category Proof.dc.html` and `A17-1` … `A17-18`. **Where this file and a
drawn panel disagree, the panel is the authority** — it is the thing that was designed; this is the
thing that was written down. Every invented decision is marked ⚑ here and on the frame.

---

## 0 · The category layer

### What A17 is

Eighteen arrangements of a post. **The user does not author the set**: there is no Add that creates a
post, no Remove that deletes one, and no per-post styling anywhere in the category. The section is
handed a query, Ghost answers it, and the designs draw whatever comes back. **One amendment from the
reconciliation pass:** at **Source: Hand-picked** the user *chooses and orders* posts through a
Ghost-aware post picker, storing references — picking is not authoring, and the refusals above all
still hold.

A17 also settles **the post card**, which A18 Post Lists, A19 Featured, A20 Tag Collections,
A21 Author Showcases and A27 Related Posts all inherit verbatim.

### The four settlements (§8)

**1 · Counts.** Zero published → the section does not render: no head, no empty grid, no placeholder,
no sample post — **except on the designated main feed**, amended in this pass: at **Source: This
route's posts** on a paginated template the section **renders an empty state**, an authored heading
and body (defaults "Nothing here yet" and "There are no posts on this page yet. Try the archive."),
because **an empty tag archive must render a page, not nothing** ⚑. Zero in the editor → the grid's outline at its count plus one line naming the query
("No posts tagged Reporting. This section will not appear on the site."), never published ⚑. One
post → one cell at the count's width, at the left; not stretched, centred or promoted. Fewer than
the count → short last row keeps the cell width at the left; nothing rebalances. More than the count
→ the extra posts are not drawn.

**2 · The card's fields.** Ghost guarantees `title`, `url`, `published_at`, `primary_author.name`
and nothing more. **Missing feature image → the tag plate**: the image box keeps its ratio and
radius, fills with the pack's hover surface (`#F4F0E8` Paper light, `#2A251E` dark), and carries the
post's primary tag centred at eyebrow size in `text-muted` ⚑. No tag either → plain plate. **No
image on any post in the set → the image row is not drawn at all**; 8 Overlay, 11 Masonry and
18 Edge to Edge hand off to 9 Big Type ⚑. **The excerpt binds `excerpt`** — the custom excerpt where one
is authored, Ghost's generated plaintext otherwise, clamped by line as designed. ⚑ **Overruled in
this pass**: the old rule was `custom_excerpt` only, and the argument for it survives (a machine-cut
first sentence is what makes a template grid look generated) while the rule does not — **a site that
never authors excerpts would get bare grids in all eighteen designs**, which is the worse default.
`custom_excerpt`-only is kept for designs that **frame** the excerpt, which is A19's Quote and
nothing here.

**3 · The featured post.** Drawn as **the first cell spanning two columns** — same card, bigger box,
plus the excerpt where uniform cells draw none. Refused: badge, label, border, fill, accent hairline,
shadow, star, different ground. **Nothing featured → the grid is uniform and no cell is promoted**;
no space is reserved. More than one flagged → only the first in the set's order spans ⚑. Offered as
a control in 1, 3, 4, 11, 15 and 16; always on in 5 Lead + Grid; ignored by the other eleven.

**4 · Pagination.** No A17 design draws page numbers, a next link, a counter or a range of its own.
⚑ **Amended:** "A34 attaches below and the section boundary is the seam" describes a section a user
placed on a page; **on the main feed pagination is a control on the feed** — at Source: This route's
posts the Data group carries **A34's Pagination style** (Numbered · Newer and older · Load more ·
None) on that section's own sidebar. **16 Load More locks it at Load more**, because that design *is*
the continuation and two mechanisms on one feed is a bug. One exception: **16 Load More**, whose
`load-more` module grows the grid in place and whose no-JS branch is Ghost's own numbered links.
On an archive route Ghost's pagination governs and Show is ignored, disclosed in the panel ⚑.
**`infinite-scroll` is refused category-wide.**

### The post card

DOM order **image → tag → title → excerpt → meta**, in all eighteen. What varies is whether the
image sits above the text or beside it, and which optional parts are drawn; **a design never
re-orders the parts**, so switching designs never changes what a screen reader hears about a post.
One departure, stated: 9 Big Type moves the tag into the meta line.

- **Title** in the pack's *heading* font ⚑ (a departure from A12, where names were body). 22 px in a
  416 cell · 19 in 306 · 17 in 240 or 196. **Wraps, never clamped, never truncated.** Excerpts are
  clamped by line instead.
- **The whole card is the link** ⚑, taking its accessible name from the title. Therefore the tag
  inside a card is text, not a link (A20 owns tag destinations), and the author's name is text
  (A21 owns author destinations). 15 Filtered's strip is the only tag link in the category.
- **No card fill, border, shadow or radius** — the image has the radius, the card does not. 4 Cards
  and 17 Panel are the category's only two planes.
- **Hover:** a 2 px accent underline on the title, 160 ms. **Focus:** A6's ring on the whole card
  box. Refused everywhere: image zoom, card lift, scale, shadow bloom, fade, overlay wash, a
  "Read more" that appears. One exception: 4 Cards takes the `md` shadow on hover ⚑.
- **Ratio is named, never computed** — Landscape 3:2 (default in fourteen designs) · Wide 16:9 ·
  Square 1:1 · Portrait 4:5. `object-fit: cover`, centred. **No focal-point control anywhere in A17** — and the reconciliation
pass gives the absence its reason rather than leaving it as an omission: **A17 authors no image**, so
rule 10's Image focus has nothing to attach to; the focal point belongs to the post, in Ghost.
**The tag chip is governed everywhere by Tag: Show · Hide**, and the meta row by the **Meta** enum
(None · Date only · Name and date · Name, date and reading time · **With photograph**).
- Reading time "9 min read", date "12 March 2026". **Relative dates refused** ⚑. Two designs
  abbreviate to "12 Mar" — 10 Ledger and 14 Dense — with the full ISO date in `datetime`.

### The shared floor

- **Cells** Two 636 · Three 416 · Four 306 · Five 240 · Six 196, on a 24 px gutter across a 1,296
  content width. **Row gap 48** ⚑. 18 Edge to Edge is the only design that abandons these divisions.
- **The universal trio, outside every design's control list.** **Background role** (Background ·
  Surface · Contrast), **Vertical spacing** (Compact 64 · Comfortable 96 · Spacious 132; 80 at 834;
  64 at 390) and **Top divider** (None · Line · Fade). **Every design's old Padding row was Vertical
  spacing under another name and is gone.** 7 Contrast Band's 64 · 88 · 120 is kept as *this row's
  resolution*, not as a second row; 17 Panel keeps **Inset** (32 · 56 · 80) because a panel's own
  edge is a genuinely different ladder; **8 Overlay and 17 Panel gain a padding control they never
  had.** Background role is **locked** where the ground is the design — 7 at Contrast, 8 at
  Background — with the reason shown; Top divider is locked None on 7 and 18. Page margin
  72 / 40 / 20; 18 Edge to Edge has none.
- **Head** eyebrow 13 uppercase `.08em` muted · title on a 780 measure · sub 17 muted on 620 ·
  head-to-grid 48 · note 32 under the grid · link 20 under the note. **Title ladder:** Small 28 ·
  Medium 34 (sixteen designs) · Large 40 (6 Split Head) · Display 48 (9 Big Type only).
- **Order is a rule, never a sequence:** Newest first · Oldest first, and **disabled at Hand-picked**,
  where the user's drag order is the order. **`shuffle` is declared
  nowhere** ⚑ — a grid whose order changes on reload cannot be proof-read.
- **Responsive floor.** Five → four at 1080 → three at 834 → **one at ≤ 767 wherever the card draws
  a feature image.** Sixteen of the eighteen draw one; **fourteen of those sixteen collapse to a
  single column.** Two stay two across: 10 Ledger (no image) and 14 Dense (title under a very small
  one). 13 Thumb Side keeps its row unchanged.
- **Print.** Every design prints as drawn except three: 15 Filtered without its strip, 16 Load More
  with the posts it had loaded, 7 Contrast Band as 1 Three Up. Print is the light mode.
- **Behaviour.** Two designs declare a module, sixteen declare none. `core` is assumed, not declared
  per design. **No A17 design loses a post without JavaScript**, and sixteen are pixel-identical with
  it off. **`reveal` is refused on a grid.**
- **Dark.** Ground deepens, tag plate lifts to `#2A251E`, hairlines take `#332E27` — **measured, the
  light rule sits 9.1 lightness points below its ground and the dark rule 9.8 above its own, so one
  symmetric step serves both modes.** Photographs untouched. 8 Overlay's scrim re-tunes 45% → 55%.
- **Accent** is spent twice in the category: a title's hover underline and A6's focus ring. Three
  designs spend a third and all three are controls — 15 Filtered's active tag, 16 Load More's Solid
  button, 7 Contrast Band's lifted accent. **A tag is never accent.**
- **Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; posts a `<ul>` of `<li>`;
  **each title an `<h3>`** inside the card's `<a>`; tag and meta `<p>`s; image `<img>` with
  `feature_image_alt` or `alt=""`; tag plate `aria-hidden`.

### The Data group — what replaces a repeater

**P0·5 "Populate from…" configured for posts**, identical in all eighteen, below each design's own
controls, **not counted toward the brief's control budget** ⚑:

| Field | Type | Values |
|---|---|---|
| `source` | enum req | Latest posts · By tag · By author · Featured only · This route's posts · **Hand-picked** |
| `filterValue` | ref opt | a tag or an author; read at By tag / By author |
| `postRefs` | ref[] opt | read at Hand-picked; the Ghost post picker's references, **drag order = drawn order** |
| `count` | int req | **a stepper, 1–100**, with per-design minimum, maximum and step |
| `order` | enum req | Newest first · Oldest first; disabled at Hand-picked |
| `paginationStyle` | enum opt | main feed only: Numbered · Newer and older · Load more · None (A34's) |
| `emptyHeading` `emptyBody` | text opt | main feed only; authored, with defaults |

**Hand-picked, added in this pass.** Search-and-pick, drag to order, references stored — never
copies. ⚑ **This overrules the old answer**, which was "use a tag the site controls": **a tag
invented to arrange a layout pollutes the site's public tag namespace**, appearing on the post, in
its tag list, on its archive route and everywhere else the theme draws tags. **The refusals stand:**
no Add that creates a post, no Remove that deletes one, no per-post styling — design controls write
one value onto the section and every post reads it.

**Count is one stepper.** ⚑ The fixed 3 · 6 · 9 · 12 enum could not say five, which made **12 Bento's
forced count unexpressible**; the stepper carries per-design bounds and **locks drawn disabled with
their reason** — 12 Bento locked at 5, 10 Ledger reaching 30, 2 Two Up stopping at 6.

**The main feed.** At Source: This route's posts the group gains **Pagination style** and the
**empty-state pair**. See settlements 1 and 4.

**Member visibility is not offered anywhere in A17** ⚑ — the only actions in the category are
navigation (the cards, the head link, 16's button), and a grid that hid itself from members would
hide the site's writing rather than a call to action. `visibility` is read and never drawn (A32's).

### The content

Nine invented posts (Orbit Weekly), used in the same positions in every frame. Four carry the hard
cases: **post 2** a 69-character title, **post 3** no feature image, **post 4** no tag and no
excerpt, **post 5** an author with no photograph. **Post 1 is the featured post.** Excerpts are
authored on five of the nine. ⚑ All content is invented; no frame contains a real photograph.

### Tuple uniqueness — the honest statement

Every design's tuple is recorded below. **Nine of the eighteen do not distinguish themselves on the
five closed slots:**

- Seven share `grid-of-N · none · page · many · top` — **1, 3, 4, 5, 11, 14, 15**.
- Two share `grid-of-N · none · page · few · top` — **2 and 12**.

Those nine rest entirely on the emphasis phrase, which no machine reads. The brief says uniqueness
beyond structure, containment and ground is a judgement rather than a gate, and this is that
judgement: a 636 cell with three lines of excerpt and a 196 cell with a title are not the same
design, but the tuple cannot say so. **The nine that are structurally unique** are 6 (split),
7 (contrast), 8 (background), 9 (few · none), 10 (table), 13 (left), 16 (feed), 17 (card · surface)
and 18 (full-bleed).

---

## The eighteen designs

Each entry gives the ten required fields. Fields shared with the floor above are not repeated;
**only departures are stated.**

---

### 1 · Three Up

1. **Descriptor.** Three 416 cells, image above tag, title, excerpt and meta. The category's default
   and what a site gets when it types "posts".
2. **Tuple.** `grid-of-N · none · page · many · top · the default three-up`
3. **Archetype.** grid-of-N. No departures.
4. **Responsive.** 1440 three 416 · 1080 three narrowed · 834 three 235, excerpt to two lines ·
   ≤ 767 one column.
5. **Fields.** All six section fields; all four query fields; **all eight card fields** — the only
   design that draws every one.
6. **Controls.** Per row Three · Four — Image ratio Landscape · Wide · Square · Portrait — Excerpt
   Off · Two lines · Three lines *(three unavailable at Four)* — Meta None · Date only · Name and
   date · Name, date and reading time — Feature Off · First cell spans two — **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **Receives the hand-off from nine other designs**,
   which makes it the most-received design in A17.
8. **Empty.** Tag plate; no tag → title moves up; no excerpt → shorter cell, mixed cells ordinary.
9. **Module.** None; `core` assumed. **No-JS: pixel-identical.** Edit-safe.
10. **A11y.** Floor as written. Contrast 15.46:1 / 5.56:1 light, 15.64:1 / 6.89:1 dark.

**Reconciled — 24 August 2026.** *Controls, seven:* Per row · Image ratio · Excerpt · **Meta** (five values, **With photograph** added) · Feature · **Tag Show · Hide** · **"View all" link** Matches the query · Custom. Padding retired into the universal Vertical spacing. *Data:* Source gains **Hand-picked**; Count is a stepper **1–24** (designed 3, 6, 9); the excerpt binds `excerpt`. *Main feed:* at This route's posts the section renders the authored empty state and carries A34's Pagination style. *Editing:* head strings take the P0·1 toolbar; post content says "Edit in Ghost".

---

### 2 · Two Up

1. **Descriptor.** Two 636 cells — the largest ordinary image in the category — with three lines of
   excerpt.
2. **Tuple.** `grid-of-N · none · page · few · top · largest ordinary cell`
   *(shares its closed slots with 12 Bento)*
3. **Archetype.** grid-of-N. **One departure at 834:** one column rather than two at 365, because a
   365 cell with three lines of excerpt is a different design.
4. **Responsive.** 1440 two 636, title 26 · 834 one at 754 · ≤ 767 one column, title 22.
5. **Fields.** Section six; query four; card fields all except reading time by default.
6. **Controls.** Image ratio · Excerpt Off · Two lines · Three lines · Meta · Alignment Left ·
   Centred · **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 2 and 4; correct at 1–6. **Receives 12 Bento's under-five hand-off.**
8. **Empty.** Plate at 636 × 424 — large, and the frame draws it.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Floor. Same four contrast values.

**Reconciled.** *Controls, seven:* Image ratio · Excerpt · Columns · Title · **Meta** (five values, **With photograph** — the 636 cell is where the avatar costs least, and the primary frame already drew it) · **Tag** · **"View all" link**. *Data:* Hand-picked; Count stepper **1–6**, above which the panel points at 1 Three Up rather than shrinking the cell; `excerpt` binding; main-feed empty state and Pagination style.

---

### 3 · Four Up

1. **Descriptor.** Four 306 cells with two lines of excerpt — the densest grid that still carries one.
2. **Tuple.** `grid-of-N · none · page · many · top · densest cell with an excerpt`
3. **Archetype.** grid-of-N. No departures.
4. **Responsive.** 1440 four 306 · 834 three 235 · ≤ 767 one column.
5. **Fields.** As 1 Three Up, excerpt capped at two lines.
6. **Controls.** Per row Four · Five — Image ratio — Excerpt Off · Two lines — Meta — Feature —
   Padding.
7. **Data.** Designed for 4, 8, 12; correct at 1–12. **The category's stress frame is drawn on this
   design** (seven posts at Count Four).
8. **Empty.** Plate at 306 × 204.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Floor. Row rule `#E7E2DB` light / `#332E27` dark — 9.1 and 9.8 lightness points from
    their grounds, measured, one symmetric step ⚑.

**Reconciled.** *Controls, seven:* Image ratio · Excerpt · Meta · Row rule · Feature · **Tag** · **"View all" link**. **With photograph is refused here** ⚑ — a 24 px circle beside 13 px text in a 306 cell leaves the name nowhere to wrap, and the reason sits at the control. *Data:* Hand-picked; Count stepper **1–24**; `excerpt` binding; main-feed empty state and Pagination style.

---

### 4 · Cards

1. **Descriptor.** One post per card on a surface plane with a hairline, equalised per row. **The
   only design in A17 that gives a post a plane**, and the only hover lift.
2. **Tuple.** `grid-of-N · none · page · many · top · per-post plane`
3. **Archetype.** grid-of-N. No departures.
4. **Responsive.** 1440 three 416 (`box-sizing: border-box` — the border is inside the cell) ·
   834 two 365 · ≤ 767 one column.
5. **Fields.** As 1 Three Up.
6. **Controls.** Per row · Image ratio · Excerpt · Meta · Feature · **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **No count threshold and no hand-off.**
8. **Empty.** Plate inside the card's own radius. Cards in a row are equalised, so a short card's
   space falls at its foot.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Floor. The plane is a `<li>` with a border, not a landmark.

**Reconciled.** *Controls, eight:* Per row · Image · Cards · Excerpt · **Meta** (five values) · **Card plane Surface · Outline** · **Tag** · **"View all" link**. The plane's fill was the one thing this design could not say, and A18 and A19 both offer it; **it is drawn as "Card plane" rather than "Card"** because a *Cards* row (Equal · Natural height) already sits above it. The hover-lift exception stands at both values. *Empty:* at Outline the tag plate derives from the page ground rather than from the card. *Data:* Hand-picked; Count stepper **1–24**; `excerpt` binding; main-feed empty state and Pagination style.

---

### 5 · Lead + Grid

1. **Descriptor.** The span as the design: first cell across two columns with the excerpt, the rest
   beside and beneath it. **The one design where the feature span is not a control.**
2. **Tuple.** `grid-of-N · none · page · many · top · lead cell spanning two`
3. **Archetype.** grid-of-N. Lead placement is a `grid-column` move, never `order`.
4. **Responsive.** 1440 lead 856 + one 416; 834 lead full width above three · ≤ 767 one column, lead
   keeps its type step.
5. **Fields.** As 1 Three Up. **Reads `featured`; with nothing featured it promotes the newest post**
   — the one place in A17 a design promotes without a flag.
6. **Controls.** Lead side Left · Right — Image ratio — Excerpt — Meta — **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 4, 5, 7; correct at 2–9. **1 post → draws the lead alone.**
8. **Empty.** Plate; a lead with no image is the frame's worst case and is drawn.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** The lead's `<h3>` is **not** promoted to `<h2>` — its prominence is editorial.

**Reconciled.** *Controls, six:* Lead side · Followers · Image ratio · **Meta** (five values; one value for every cell, lead included — the lead does not get its own meta) · **Tag** · **"View all" link**. *Data:* Hand-picked, where **the first pick takes the lead cell** — the clearest use of the picker in the category; Count stepper **1–9**, drawing the lead alone at 1; main-feed empty state and Pagination style.

---

### 6 · Split Head

1. **Descriptor.** Head, sub, note and link in a 416 column, the grid in the 856 beside it.
2. **Tuple.** `split · none · page · many · top · head in its own column`
3. **Archetype.** **split.** **Refuses the archetype's collapse** at 834 — see 4.
4. **Responsive.** 1440 head 416 + grid 856 (two 416) · **834 the head does not collapse above the
   grid; it narrows and stays beside it**, because a design that becomes 1 Three Up at one width
   makes the picker a lie ⚑ · ≤ 767 head above, one column.
5. **Fields.** Section six, **title at Large 40**; query four; card fields as 1 Three Up.
6. **Controls.** Head side Left · Right — Per row Two · Three — Image ratio — Excerpt — **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 4 and 6; correct at 2–8.
8. **Empty.** At Head None the split has nothing in its column — **the design's degenerate case, and
   the panel says so.**
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** At Head Right, DOM order and visual order diverge; the head is always first in source.
    Head-column hairline `#332E27` in dark.

**Reconciled.** *Controls, eight:* Head side · Title · Head sticky · Posts per row · Excerpt · **Meta** (new — this design drew a meta row with nothing governing it; five values) · **Tag** · **"View all" link**. *Data:* Hand-picked; Count stepper **2–8**; `excerpt` binding; main-feed empty state and Pagination style. *Behaviour:* Head sticky is CSS `position: sticky`, not a module.

---

### 7 · Contrast Band

1. **Descriptor.** 1 Three Up inverted onto the `contrast` token at the band's own vertical scale.
2. **Tuple.** `grid-of-N · none · contrast · many · top · inverted band`
3. **Archetype.** grid-of-N. Band scale 64 · 88 · 120.
4. **Responsive.** As 1 Three Up. **Prints as 1 Three Up** — the band is dropped.
5. **Fields.** As 1 Three Up.
6. **Controls.** Per row · Image ratio · Excerpt · Meta · **Vertical spacing** *(universal, outside
   the list, resolving the band's own 64 · 88 · 120)*.
7. **Data.** As 1 Three Up.
8. **Empty.** Plate derived from the band, not the page.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y. Contrast computed on the band:** text `#FAF7F2` on `#232019` **15.21:1**; derived muted
    `#A8A29A` **6.42:1**; **Paper's own accent `#D96C3F` 4.77:1 — it passes AA on the band with no
    lift**; the lifted `#E8834F` **6.03:1**, headroom rather than a repair.
    **⚑ The finding this design exists to raise:** Paper clears AA by 0.27, and the other eleven
    packs' accents have never been measured on their own `contrast` ground. **A pack-level
    `accent-on-contrast` token settles it once**; deriving a lift by eye in each section spec does not.
    **Derivation rule:** every value is a `color-mix` of the band toward its own text —
    **muted 60% · hairline 10% · tag plate 7%** — never away from the text.

**Reconciled.** *Controls, six:* Band · Per row · Excerpt · Meta · **Tag** · **"View all" link**. *Universal:* **Background role ships locked at Contrast** — the old "no Ground control" ruling keeps its argument and loses its refusal, with the reason at the control; **Vertical spacing resolves the band's own 64 · 88 · 120** rather than adding a second Band padding row; **Top divider locked None** (a band brings its own top edge). **With photograph is refused** ⚑ — every value on this ground is a `color-mix` toward the band's own text, and a photograph cannot be mixed. *Data:* Hand-picked; Count stepper **1–12**; main-feed empty state and Pagination style.

---

### 8 · Overlay

1. **Descriptor.** Title and tag set over the image behind a scrim, at Portrait 4:5. **The one scrim
   in A17.**
2. **Tuple.** `grid-of-N · none · page · many · background · scrim over image`
3. **Archetype.** grid-of-N.
4. **Responsive.** 1440 three 416 × 520 · 834 two · ≤ 767 one column.
5. **Fields.** Section six; query four; **no excerpt at any setting** (text over an image is a
   caption, not a paragraph).
6. **Controls.** Per row · Image ratio Portrait · Square — Scrim Light · Standard · Heavy — Meta —
   Padding.
7. **Data.** Designed for 3 and 6; correct at 1–9.
8. **Empty.** **No image → the design cannot exist; hands off to 9 Big Type** when no post in the
   set has one. A single imageless post draws the plate with its title in `text`.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Scrim 45% light / **55% dark** — a deepened ground makes a light image read brighter.
    White title on the scrim; the plate case falls back to `text`.

**Reconciled.** *Controls, seven:* Per row · Image ratio · Scrim · Text · Meta (three values, **no With photograph** — an avatar inside a scrimmed caption is a second image, the same reason there is no excerpt) · **Tag** · **"View all" link**. *Universal:* **Background role locked at Background** (the photographs are the ground; a contrast band would only tint the gaps) and **Vertical spacing ships** — **the design's no-padding flag is closed**, not defended. *Data:* Hand-picked; Count stepper **1–9**; main-feed empty state and Pagination style.

---

### 9 · Big Type

1. **Descriptor.** Titles at Display scale, two to a row, hairline-ruled, tag folded into the date
   line, **no images at any setting** — the text grid and the category's image-less fallback.
2. **Tuple.** `grid-of-N · none · page · few · none · display-scale titles`
3. **Archetype.** grid-of-N. **One departure at 834:** one column at 754 rather than two at 365.
4. **Responsive.** 1440 two 636, Display 48, row gap 0 with the rule separating · 834 one column,
   44 · **≤ 767 Display resolves to 30 — the steepest type drop in A17**, and at that width the
   design is honestly a text list rather than big type ⚑.
5. **Fields.** Section six, **title at Small 28** so the head does not compete ⚑. **Never reads
   `feature_image`** — the only design in A17 that never touches the field, which is what lets it be
   three designs' fallback.
6. **Controls.** Per row Two · Three — Title Large · Display *(unavailable at Three)* — Rule None ·
   Hairline — Excerpt Off · Two lines — Meta None · Date only · **Tag and date** · Tag, author and
   date — **Vertical spacing** *(universal, outside the list)*.
   *The Display disable rests on the cell, not a line count: measured, a 69-character title wraps to
   four lines at both 48 and 40 in a 416 column, but 48 makes the block 20% taller for no gain, and
   416 is 65% of the 636 the size was set for. Measured first lines at 636 hold 25–31 characters.*
7. **Data.** Designed for 4 and 6; correct at 1–8, degrading **by taste rather than by layout**
   above that. **From about eight the panel suggests 10 Ledger — a suggestion, never a switch.**
   **Receives the hand-off from 8, 11 and 18**; the query, count and order travel, the ratio does not.
8. **Empty.** Almost none — everything but tag and excerpt is Ghost-guaranteed. **A missing feature
   image is not an empty state here; it is why the design exists.**
9. **Module.** None. **No-JS: pixel-identical.** `typewriter` considered and not declared.
10. **A11y. ⚑ The DOM order departs from the card rule:** the tag moves after the title into the meta
    line, so a screen reader hears the headline first and its section second. **The fields are
    preserved; the tag's position within them is not.** A finding for the architect. An `<h3>` at
    48 px is not a heading-level claim. Contrast 15.46 / 5.56 light, 15.64 / 6.89 dark.

**Reconciled.** *Controls, six:* Per row · Title · Rule · Excerpt · Meta (four values, tag folded in) · **"View all" link**. **No Tag row** ⚑ — this is the one design where the tag lives inside the Meta enum, so a second control would fight it, and the category-wide row is stated as not applying rather than added and disabled. **No With photograph**: a design that never touches `feature_image` does not start with `profile_image`. *Data:* Hand-picked; Count stepper **1–8**; `excerpt` binding; main-feed empty state and Pagination style — this design inherits three others' queries unchanged.

---

### 10 · Ledger

1. **Descriptor.** Title, tag and abbreviated date on one hairline-divided row, two columns, rows as
   tall as their contents — the archive as a table.
2. **Tuple.** `table · none · page · many · none · hairline row rhythm`
3. **Archetype.** **table** — the only one in A17. Its ladder sheds fields and columns rather than
   narrowing cells.
4. **Responsive.** 1440 two 636, padding 16, title 19, "12 Mar 2026" right on tabular numerals ·
   834 two 365, **year drops to "12 Mar"** · **≤ 767 two columns kept at 157**, but the row stops
   being a row — date moves under the title, tag dropped, **and Date Right / Date Lead both stop
   applying** ⚑. Columns One keeps the row intact at every width.
5. **Fields.** `title`, `url`, `published_at`, `primary_tag` — **four, the fewest in A17.** No image,
   excerpt, author or reading time at any setting.
6. **Controls.** Columns One · Two · Three — Rows Divided · Open — Date Right · Lead · Off — Tag
   On · Off — Title Standard · Small — **Vertical spacing** *(universal, outside the list)*. **All six are density controls**, which no other
   design can say.
   *⚑ Measured: Title Small saves ~4% of a row's height (78 → 75) because the row is mostly padding
   and tag. Tag Off removes 20 px and Rows Open 13 more, taking a row to 45 — a 42% gain; all three
   together reach 42 px, 46%. Title is the weakest lever, and the sidebar note says so.*
7. **Data.** Designed for 8 and 12; **correct at 2–30 — the widest range in A17**, because a table
   improves with more rows. 1 post → one ruled row, **this design's weakest case, disclosed rather
   than special-cased.** From about sixteen the panel suggests Columns One.
8. **Empty.** No tag → the row is one line shorter; **rows are stretched by their tallest cell as
   everywhere in A17, so a missing tag shows as space at the row's foot, not a shorter row.**
9. **Module.** None. **No-JS: pixel-identical.** **⚑ No sort control:** a table invites sorting by
   column and no module covers it; the honest fix is a third `order` value server-side.
10. **A11y. ⚑ It is a `<ul>` of `<li>`, not a `<table>`** — no column headers, no cell relationships;
    marking it up as a table would promise navigation that does not exist. The archetype names its
    responsive behaviour, not its markup. Abbreviated date is visual only; `<time datetime>` carries
    it in full. **⚑ Tabular figures are a pack requirement A17 cannot state** — a pack whose body
    font lacks them renders a ragged right edge; it degrades acceptably.

**Reconciled.** *Controls, six:* Columns · Rows · Date · Tag *(already governed here)* · Title · **"View all" link**; Padding retired into Vertical spacing. **No Meta enum and no With photograph** — there is no author at any setting. *Data:* Hand-picked, and a hand-ordered ledger is the plainest use of the picker; Count stepper **2–30**, the widest in A17; **the main feed's empty state and Pagination style matter most here**, because this is the design most likely to *be* the archive. The sort gap is unchanged: no module covers it and none is coined.

---

### 11 · Masonry

1. **Descriptor.** Three independent columns filled top to bottom with consecutive posts, each cell's
   ratio taken from a cycle indexed by **`((row − 1) + (column − 1)) mod 3`** — a diagonal, so no two
   rows align. **Not true masonry:** nothing measures, nothing packs, no JavaScript.
2. **Tuple.** `grid-of-N · none · page · many · top · alternating ratios`
3. **Archetype.** grid-of-N. **The diagonal is recomputed at each column count**, so **a post's crop
   is not stable across widths and cannot be** — the rule takes the column as an input. A rule using
   the post's index alone would be stable and would stagger nothing.
4. **Responsive.** 1440 three 416, cell gap 40 · 834 two 365, diagonal recomputed (left P·L, right
   L·S) · **≤ 767 one column, P·L·S down the page — the design's idea is gone**, leaving varied crop
   heights without stagger. **It does not hand off**; the picker discloses it.
5. **Fields.** As 1 Three Up. **⚑ Uses `cycle`, not `ratio`.**
6. **Controls.** Columns Two · Three · Four *(changes every crop)* — Cycle Portrait–Landscape–Square ·
   Square–Landscape–Portrait · Landscape–Portrait — Excerpt — Meta — **Vertical spacing** *(universal, outside the list)*.
   *⚑ Enumerated: two columns run the same sequence exactly when their index difference is a multiple
   of the cycle length. **So the column count must be no greater than the cycle length** — three
   ratios support three columns; **at four, columns one and four are identical.** Columns Four is
   therefore a real gap: either remove the value or add a fourth ratio. Left in place with a warning
   note; the architect should pick.*
7. **Data.** Designed for 9 and 12; correct at 5–15. **Below five hands off to 1 Three Up**, disclosed.
   Columns end unevenly even at 9 in 3 — measured 74 px apart — **a property, not an empty state.**
8. **Empty.** Plate at the cell's dictated ratio. **No image on any post → hands off to 9 Big Type**;
   plates at mixed ratios read as holes in the page.
9. **Module.** **None — and this is where that claim is worth most**, because the layout it imitates
   normally cannot make it. Three server-rendered lists and one `aspect-ratio` per cell via
   `:nth-child`. **No-JS: pixel-identical.**
10. **A11y. ⚑ Three separate `<ul>`s, one per column** — a screen reader announces "list, 3 items"
    three times rather than "list, 9 items" once. **What it buys is that source order and visual
    order agree.** CSS `columns` fragments cells; one `<ul>` with grid placement would put the DOM in
    row-major order while the eye reads column-major. A finding for the architect.

**Reconciled.** *Controls, six:* Columns **Two · Three** · Cycle · Excerpt · **Meta** (now a select, four values including **With photograph** — a 416 cell carries the avatar and the cycle never narrows a column below it) · **Tag** · **"View all" link**. **Columns Four is removed** ⚑ — under the three-ratio cycle columns one and four run identical crop sequences, so the value drew a stagger that was not there; 3 Four Up exists and is cheaper than a fourth ratio. **Finding 4 is closed by removal**: column count ≤ cycle length is now enforced by the control rather than by a warning note. *Data:* Hand-picked; Count stepper **1–15**, disclosing the hand-off below five rather than clamping it.

---

### 12 · Bento

1. **Descriptor.** Five posts in a fixed two-column composition of unequal cells — one tall spanning
   two rows, two wide stacked beside it, two square beneath — the tall cell promoted by size, type
   step and excerpt.
2. **Tuple.** `grid-of-N · none · page · few · top · unequal cell sizes`
   *(shares its closed slots with 2 Two Up; **the only design whose count is a requirement**)*
3. **Archetype.** grid-of-N. **One departure at 834:** the composition unstacks to one column and
   every ratio resolves to 3:2, so **the cell shapes are a desktop property rather than a design
   property.**
4. **Responsive.** 1440 two 636 columns, three rows, 24 gutter both ways; tall 636 × 795 (4:5),
   wides 636 × 358 (16:9), squares 636 × 636 · 834 one column, all 3:2, tall keeps its 26 px title
   and excerpt so the ranking survives · ≤ 767 one column, tall title 24. **Arrangement stops
   applying below 834.**
5. **Fields.** Section six; query `source`, `filterValue`, `order` — **`count` forced to 5** ⚑.
   Card fields as 1 Three Up; excerpt on the tall cell only by default. **`featured` read and
   deliberately not drawn.**
6. **Controls.** Arrangement Tall left · Tall right — Excerpt Off · Tall cell only · All cells —
   Meta — **Vertical spacing** *(universal, outside the list)*. **Four — the fewest in A17 and the brief's floor.** **No Image ratio control:**
   the three ratios pair the columns' photography — two wide cells and their gutter are
   358 + 24 + 358 = **740 px against the tall image's 795**, a 55 px difference the right column
   absorbs because it carries two text blocks to the left's one. (The cell *boxes* are equal
   automatically; a row-spanning grid item is as tall as the rows it spans.)
7. **Data.** `limit` fixed at 5. **Under five → hands off to 2 Two Up. Over five → draws the first
   five and suggests 1 Three Up; it does not hand off**, because a site with twelve matching posts
   still wants its five-cell front page. **One hand-off, one truncation.** 0 → does not render; the
   editor's outline is the most informative zero state in A17.
8. **Empty.** Plate at the cell's ratio; **the wide 636 × 358 plate is the least flattering in the
   category** and is drawn on both the light and dark frames. **No image on any post → no hand-off**;
   five plates at three shapes still read as a bento. Not good, not broken.
9. **Module.** None. **No-JS: pixel-identical** — `grid-template-columns`, explicit `grid-row` spans,
   `aspect-ratio` boxes, and a `grid-column` swap for the mirror.
10. **A11y.** One `<ul>` of five `<li>`s in query order, placed by explicit grid coordinates —
    **unlike 11 Masonry this design keeps a single list.** The tall cell's `<h3>` is not promoted.
    At Tall right, DOM and visual order diverge — the accepted cost of refusing `order`.
    **⚑ Two findings:** exactly five is unexpressible in the shared Show (3 · 6 · 9 · 12) — it needs
    a fifth value, a per-design Show, or the forced five specified here; and **`featured` would be
    the natural input for "this post takes the tall cell"**, unused because five designs already read
    that flag to mean a two-column span.

**Reconciled.** *Controls, six:* Arrangement · Excerpt · **Meta** (now a select, four values including **With photograph** — every cell in the composition is 636 wide) · **Tall cell First in order · Featured post** · **Tag** · **"View all" link**. **Tall cell closes the second finding** ⚑: `featured` was read and deliberately not drawn, which left the natural input unused; nothing flagged falls back to First in order, and more than one flagged takes the first in the set. *Data:* **Count locked at 5, drawn disabled with its reason** — the first finding, closed: this is exactly what the 3 · 6 · 9 · 12 enum could not express. Hand-picked is the one Source where the five cells are chosen by hand, in drag order.

---

### 13 · Thumb Side

1. **Descriptor.** A fixed-size square thumbnail at the left of each row with title and meta beside
   it, two columns, no hairlines — **the image sized rather than proportioned, so the row is
   identical at every width.**
2. **Tuple.** `grid-of-N · none · page · many · left · fixed-size thumbnail`
   *(the only `left` in A17)*
3. **Archetype.** grid-of-N. **One departure, a refusal:** the ladder collapses to one column and
   sheds the image at ≤ 767; this design keeps both.
4. **Responsive.** 1440 two 636 rows, thumb 120, gap 20, text 496, 32 between rows · 834 one column
   at 754, **thumb holds 120 and the extra width goes to the text** · ≤ 767 **thumb 96 (27% of a
   350 row), plate tag 10 px, title 17 — the row, side and reading order unchanged.**
5. **Fields.** As 1 Three Up plus `reading_time`; **no `profile_image` at any setting** (an avatar
   beside a thumbnail is two identifying images in one row). **⚑ Uses `thumbSize`, not `ratio`.**
6. **Controls.** Columns One · Two — Thumbnail Small 96 · Medium 120 · Large 160 — Thumbnail side
   Left · Right — Excerpt Off · **One line** · Two lines — Meta *(four values; the only design where
   all four meta parts fit one line)* — **Vertical spacing** *(universal, outside the list)*. **No Image ratio — square is structural.**
   *160 is the ceiling: past about a quarter of the row an image stops being a thumbnail. 160 of 636
   is 25.2%.*
7. **Data.** Designed for 8 and 12; correct at 1–24 — **second only to 10 Ledger's 2–30, and the
   wider of the two that keeps its photographs.** **No hand-off and no count threshold** — one of
   three image-bearing designs with none, alongside 1 Three Up and 4 Cards.
8. **Empty.** **The smallest and least conspicuous plate in the category.** No image on any post →
   no hand-off; a column of small plates beside titles is still a legible list.
9. **Module.** None. **No-JS: pixel-identical.** `lightbox` considered and not declared.
10. **A11y.** **A17-0's DOM order honoured exactly** — notable because the image is visually beside
    rather than above the text. Thumbnail side Right is `row-reverse`. The 120 px thumb is well past
    the 44 px touch minimum, and the whole row is the target.
    **⚑ The general finding this design contributes: the category collapses at 767 because its images
    are proportional, not because phones are narrow.**

**Reconciled.** *Controls, seven:* Columns · Thumbnail · Thumbnail side · Excerpt · Meta (four values) · **Tag** · **"View all" link**. **With photograph is refused** ⚑ and the reason is the design's own: an avatar beside a thumbnail is two identifying images in one row. *Data:* Hand-picked; Count stepper **1–24**; `excerpt` binding; main-feed empty state and Pagination style.

---

### 14 · Dense

1. **Descriptor.** Six 196 cells carrying an image, a title and an abbreviated date and nothing else
   — the narrowest cell in A17 and its only use of the Six division.
2. **Tuple.** `grid-of-N · none · page · many · top · smallest cell`
3. **Archetype.** grid-of-N. **Two departures:** at 834 it stops at four rather than three (three at
   235 is 3 Four Up); at ≤ 767 it keeps two columns.
4. **Responsive.** 1440 six 196, image 131, row gap 36, title 17 · 1080 five 240 · **834 four 177,
   image 118 — ⚑ just under the design's own 120 px picture floor, accepted and flagged** ·
   ≤ 767 two at 167, image 111. **Never one column.**
5. **Fields.** `title`, `url`, `published_at`, `feature_image` + alt, `primary_tag` — **five, the
   fewest of any image-bearing design.** Never reads excerpt, author or reading time.
6. **Controls.** Per row Four · Five · Six — Image ratio Landscape · Square *(no Portrait, no Wide)*
   — Tag On · **Off (default — the only design where it is)** — Date On · Off — **Vertical spacing** *(universal, outside the list)*.
   **⚑ No Excerpt control in any form — the only design in A17 without one**; a 196 px cell cannot
   hold legible body text. **No Meta enum** — there is no author or reading time to enumerate.
7. **Data.** Designed for 12 and 18; correct at 3–18. **1 or 2 posts is the weakest case by a
   distance** — the panel suggests a wider design rather than handing off. The orphan row is more
   conspicuous here than anywhere else; the counter names the divisors. **Above 18 the panel points
   at 16 Load More, not at A34.**
8. **Empty.** Plate at 196 × 131 with the tag at 11 px. **No image on any post → no hand-off**; at
   this size a wall of plates is a texture rather than a series of holes.
9. **Module.** None. **No-JS: pixel-identical.** **⚑ The thing a 196 px cell most wants is an excerpt
   on hover, and no module in the registry covers it — a finding, and I am not naming one.**
10. **A11y.** Title 17 px is above the body floor. **The 11 px plate tag is the smallest type in A17**
    — `aria-hidden` decoration, and at Tag Off it is the only place the tag appears, **a real gap
    flagged rather than solved.**
    **⚑ Squint test:** at 25% this is a regular field with no focal point. The brief asks for one
    composition with an obvious focal point; **a design whose subject is "how much has been
    published" has the grid itself as its focal point.** Recorded as a considered exception.

**Reconciled.** *Controls, five:* Per row · Image ratio · Tag *(already governed here)* · Date · **"View all" link**; Padding retired into Vertical spacing. **No Meta enum and no With photograph** — there is no author or reading time to enumerate, and a 24 px avatar is an eighth of a 196 px cell. *Data:* Hand-picked; Count stepper **3–18**; main-feed empty state and Pagination style. The excerpt-on-hover gap is unchanged and still unnamed.

---

### 15 · Filtered

1. **Descriptor.** A strip of tag links above the grid with the current one marked — **the only
   design with links outside its cards.**
2. **Tuple.** `grid-of-N · none · page · many · top · tag filter strip`
3. **Archetype.** grid-of-N; the strip wraps freely above it.
4. **Responsive.** 1440 three 416, strip on one line · 834 three 235, strip still one line at this
   section's tag count · ≤ 767 one column, **strip becomes a horizontally scrollable row.**
   **Prints without the strip.**
5. **Fields.** As 1 Three Up, plus the strip's source.
6. **Controls.** Tags **From these posts** · All site tags · Chosen tags — Strip Pills · Text —
   Per row — Image ratio — Excerpt — Feature — **Vertical spacing** *(universal, outside the list)*.
7. **Data.** Designed for 6 and 9; correct at 1–12. **The strip lists the distinct primary tags of
   the posts actually drawn** — the six on the primary frame carry four between them — **so every
   pill has at least one post behind it. Tags belonging to posts outside the count are absent from
   the strip rather than dead in it.**
8. **Empty.** No tags on any drawn post → the strip is not rendered and the grid draws alone.
9. **Module.** **`filter-strip`.** **No-JS, quoted: "Filters are `<a href>` links to Ghost routes and
   work perfectly — this module needs JS least of all."** Edit-safe.
10. **A11y.** The active pill uses the accent — **the third design to derive an on-accent label
    colour independently.** `#1A1712` on `#D96C3F` measures **6.63:1**; inactive pills 9.92:1 light.
    **⚑ Pills are 33 px tall — 11 px under the 44 px touch minimum, deliberately, as a dense
    secondary control.** Measured, not estimated. A finding rather than a defence.

**Reconciled.** *Controls, eight:* Tags · Strip style · "All" link · Per row · Excerpt · **Meta** (new; five values) · **Tag** *(the chip inside the cards, not the strip above them — two tags, two controls, and the panel says so)* · **"View all" link**. *Behaviour:* **`filter-strip` is navigation to Ghost's tag routes at every value** ⚑ — real `<a href>` links; the module marks the current pill and manages the scrollable row below 767, and **any in-place filtering is dropped** because it promised a client-side subset the query never had. The "All" pill stays and points at the section's unfiltered route; **its label is a theme translation-catalog string** ⚑. *A11y:* **the pills keep their 33 px look and gain a 44 px hit area** — 5.5 px of transparent padding top and bottom, so the target passes without the strip growing. *Data:* Hand-picked, where the strip then lists the picked posts' tags; Count stepper **1–12**.

---

### 16 · Load More

1. **Descriptor.** A three-up grid that appends the next batch in place under one centred button with
   a live count beneath it — **the only design in A17 that grows, and the only one with a button.**
2. **Tuple.** `feed · none · page · many · top · load-more button`  *(the only `feed`)*
3. **Archetype.** **feed.** grid-of-N's ladder for the cells plus one rule: the control goes
   full-width below 767.
4. **Responsive.** 1440 three 416, button intrinsic and centred 48 below, count 16 below it ·
   834 three 235, button unchanged · ≤ 767 one column, **button full-width, padding 13 → 15.**
   **No departures above 767** — stated rather than invented.
5. **Fields.** Section six; query four, **`count` read as batch size as well**; plus `buttonStyle`,
   `showCount`, `batch`. **The button's label, the count and the exhausted line are composed from
   data — no authored strings in this design's own furniture.**
6. **Controls.** Batch 3 · 6 · 9 · 12 *(mirrors Show)* — Button Outline · Solid · Text — Count On ·
   Off — Per row Two · Three · Four · Six — Excerpt — **Vertical spacing** *(universal, outside the list)*. **Cut: auto-load-on-scroll** — that is
   `infinite-scroll`, refused category-wide.
7. **Data.** First batch server-rendered; subsequent batches fetched against the same query.
   Designed for 12–48 across two to four presses. **0 → no section and no button. 1 → one cell and
   no button. Fewer posts than the batch → no button**, the same rule as exhausted applied before the
   first press. **A34 is not used with this design.**
   **⚑ "Showing 6 of 12" counts the section's query, not the site** — a site with 400 matching posts
   shows "6 of 400"; Count Off exists for that, and capping the denominator would be a lie.
8. **Empty.** Nothing left to load → **the button is replaced by "That's all 12 posts." in the
   button's own position**, so the page does not jump. It does not grey out and stay.
9. **Module.** **`load-more`.** **No-JS, quoted: "Ghost's numbered `/page/2/` pagination links render
   instead (FR-G4, explicitly)."** The button is absent in that branch, not inert. Edit-safe;
   **persists nothing — ⚑ a reader who presses twice, follows a post and comes back lands on six
   again.**
10. **A11y.** A real `<button>`. Appended cells join the same `<ul>`. **⚑ Focus stays on the button
    after a press and the new count is announced in a polite live region**; when the button is
    replaced, focus moves to the line. Button **45 px measured** at 1440 and 834, 49 px on a phone —
    above the 44 px minimum, by 1 px at the desktop widths.
    **⚑ The strongest form of the on-accent finding:** three designs in this category now derive an
    on-accent or on-contrast text colour independently (7, 15, 16). **A pack needs stated `on-accent`
    and `on-contrast` values.** Outline is the default partly because it is the one button style with
    no dark-mode decision to make.

**Reconciled.** *Controls, nine:* Batch · Button · **Count line** *(renamed — the Data group's Count is the batch, and two rows called Count in one sidebar is a control that lies)* · Per row · Excerpt · **Image ratio** (new — the feed drew a fixed 3:2 crop, alone among the image-bearing designs; appended batches inherit the value) · **Meta** (new; five values) · **Tag** · **"View all" link**. *Content fields:* **`buttonLabel` is an authored field with the default "Load more"**, inline-editable, and **the count line and the exhausted line are theme translation-catalog strings** ⚑ — "composed from data" was the old rule and it shipped fixed English. The button takes an optional **P0·2** icon before or after its label, off by default. *Data:* Count **is** the batch, stepper **1–100**; **Pagination style locked at Load more**, A34's other values drawn disabled with that reason; the main-feed empty state replaces both button and count.

---

### 17 · Panel

1. **Descriptor.** The entire section — head, grid, note and link — inside one surface panel with a
   hairline and the pack's radius, **the posts themselves left bare.**
2. **Tuple.** `grid-of-N · card · surface · many · top · contained section`
   **The only `card` containment and the only `surface` ground in A17.**
3. **Archetype.** grid-of-N. **One departure:** below 767 the container goes full-bleed, dropping its
   page margin, radius and side borders to become a band with two horizontal hairlines.
4. **Responsive.** 1440 panel at 1,296, inset 56, three cells at 378 — **9% narrower than the
   category's 416, the panel's tax** · 834 inset 40, three at 208 · ≤ 767 full-bleed band, inset 20,
   one column, image 350. *Cell widths follow `(width − 2·inset − 48) / 3`; the desktop ladder gives
   394 / 378 / 362 at Compact / Comfortable / Spacious.*
5. **Fields.** **Identical to 1 Three Up's list** — this design adds a container, not content.
6. **Controls.** Panel edge Hairline · Fill only · Outline — Inset Compact 32 · Comfortable 56 ·
   Spacious 80 — Head Inside · Outside — Per row — Excerpt. Five.
   ⚑ **The "no Padding control" absence is closed by this pass**: the universal **Vertical spacing**
   governs the page around the panel and **Inset** governs the panel's own edge, so the two are not
   indistinguishable in use after all — two ladders, two names, both honest. (Before the pass the
   section's vertical padding was fixed at Comfortable 96.) **Cut: panel radius and panel colour**, both of which break
   rule 1.
7. **Data.** Designed for 6 and 9; correct at 1–12. **0 → does not render, and an empty panel is the
   one zero state that would look deliberate, which is exactly why it must not.** **1 → a 1,296 px
   box holding one 378 px card is 70% empty surface — the weakest case**, and the panel suggests
   dropping the container. A34 attaches **below the panel, on the page ground.**
8. **Empty.** **⚑ The plate must derive from the panel it sits on rather than from the page** — in
   Paper light both resolve to `#F4F0E8`, but in a pack with a stronger surface step they differ.
   A context-dependence no other design exposes.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y. ⚑ The panel is a `<div>` with no role** — a visual container, not a landmark; `region`
    or `group` would announce a boundary that means nothing to a reader who cannot see it. Head
    Outside moves the heading out of the panel in the DOM as well as visually. **A6's 4 px ring
    offset fits inside the 32 px inset floor.** Contrast on the panel's `#FFFFFF` **16.25:1** and
    muted **5.85:1**; dark `#F2EDE4` on `#1F1C17` **14.56:1** and muted **6.41:1**.
    **⚑ The honest argument against this design: a panel breaks the page's left edge.** Head Outside
    recovers the head's alignment; the grid's is still lost.
    **⚑ Two control values move closed slots** — Panel edge Outline arguably makes the ground
    `transparent`, and below 767 the containment is closer to `none`. The tuple records the default
    at the primary width.
    **⚑ The `sm` shadow is dropped in dark** — a near-black shadow on a dark ground is invisible, and
    a pale glow is a different design language. **A17 has exactly two shadowed things, this panel and
    4 Cards' hover, and both lose their shadow in dark.** Which makes **Fill only stronger in dark
    than in light** — a control whose usefulness inverts between modes.

**Reconciled.** *Controls, eight:* Panel edge · Inset · Head · Per row · Excerpt · **Meta** (new; five values) · **Tag** · **"View all" link**. *Universal:* **Vertical spacing now ships** and governs the page around the panel, **Inset keeps its own 32 · 56 · 80** — the "no Padding control" absence is closed by two ladders with two names. Background role governs the page behind the panel, and the panel keeps its own step above whatever it resolves to. *Empty:* the main feed's empty state draws **inside** the panel; Pagination style attaches below the panel, on the page ground. *Data:* Hand-picked; Count stepper **1–12**.

---

### 18 · Edge to Edge

1. **Descriptor.** Squared images filling the full viewport with no gutter and no page margin, text
   inset beneath each — the category's only full-bleed design and its only unrounded image.
2. **Tuple.** `grid-of-N · none · page · many · full-bleed · gutterless band`
   *(the only `full-bleed` in A17)*
3. **Archetype.** grid-of-N. **One departure running the other way:** the cell count drops as usual,
   but the cells never narrow relative to the screen, because they divide the viewport rather than a
   content column. **The design's proportions are identical at every width.**
4. **Responsive.** 1440 three at 480 (`1440/3`), image 320, zero gutter, row gap 48, text inset 24,
   head at the 72 px page margin · 1080 three at 360 · 834 two at 417, image 278 — **arguably the
   design's best width, with exactly one internal boundary** · ≤ 767 one column at the full viewport,
   image 260. **No page margin at any width.**
5. **Fields.** As 1 Three Up minus the excerpt — **never reads `custom_excerpt`**, the second design
   after 14 Dense with none, and here because an excerpt would break the band rather than because it
   would not fit. No `profile_image`, no `reading_time`.
6. **Controls.** Per row Two · Three · Four — Image ratio Landscape · Square · Portrait
   *(no restriction at any count — the only unrestricted ratio control in A17)* — Text Under · Over —
   Head Inset · Edge — **Vertical spacing** *(universal, outside the list; vertical only, there
   being no page margin to set)*. **Cut: a gutter control and a radius control**,
   each of which would undo the design.
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **The orphan row costs more here than anywhere
   else** — a full-bleed row one third full leaves 960 px of empty page. The counter advises 3, 6 or
   9 and does not enforce. **Under three it does not hand off** — an image touching the screen's edge
   is still recognisably this design.
8. **Empty.** **A full-cell 480 × 320 plate, the most damaging in A17** — no radius and no gutter, so
   it shares an edge with the photograph beside it and reads as a gap in the band.
   **No image on any post → hands off to 9 Big Type.**
   **⚑ Flagged: this design has the strongest case in the category for handing off when *any* post
   lacks an image rather than when all do.** Kept at "every post" for consistency with 8 Overlay and
   11 Masonry; the inconsistency is flagged rather than resolved alone.
9. **Module.** None. **No-JS: pixel-identical.** `lightbox` considered and not declared.
10. **A11y. ⚑ The focus ring is this design's real problem:** A6's ring sits 4 px outside the element
    and **a cell at the screen's edge has no 4 px outside it** — the ring is clipped on the first and
    last cell of every row. **Specified as an inset ring on edge cells (`outline-offset: -4px`)**,
    which changes the ring's appearance between cells in the same row — a real inconsistency worth
    the architect's attention.
    **⚑ The squared image is a departure from the pack, not from taste** — the one place rule 1's
    "only tokens change" is strained, and the strongest single argument against this design existing.
    **⚑ This is the one design in A17 that improves as the screen narrows:** every other spends its
    width on columns and loses them; this one spends its width on the image and keeps all of it.

**Reconciled.** *Controls, eight:* Per row · Image ratio · Text · Head · **Meta** (new; five values) · **Scrim Light · Standard · Heavy** · **Tag** · **"View all" link**. **Scrim is the condition of Text Over surviving** ⚑ — 8 Overlay's wash, 45% light and 55% dark at Standard, disabled at Text Under; white text on a raw photograph was not shippable and the alternative was cutting the value. The frame already borrowed the scrim; the panel now names it. The plate cell still cannot carry Over and falls back to `text` on the plate. *Universal:* **Top divider locked None** — the images reach both edges and a rule at the page margin has nothing to align to. *Data:* Hand-picked; Count stepper **1–12**; main-feed empty state and Pagination style, both at the page margin rather than at the band's edge.

---

## Block 1 · Component inventory

Cumulative. **Established in A17** unless another category is named; provenance for pre-A17
components is as cited on the A17 frames.

| Component | What it is | First from |
|---|---|---|
| **Post card** | Image, tag, title, excerpt, meta in fixed DOM order; whole card is one `<a>`; heading-font title, never clamped; no plane of its own | **A17** |
| **Tag plate** | Missing-feature-image substitute — hover-surface box at the cell's ratio carrying the post's primary tag, centred, `aria-hidden` | **A17** |
| **Data group** | Source · Tag/Author · Hand-picked posts · Count · Order (+ the main feed's pagination and empty-state fields); the query panel that replaces a repeater; identical in all eighteen | **A17** |
| **Load-more button** | Outline / Solid / Text at 24 px radius, 45 px tall, centred, full-width below 767; resting, loading, exhausted states | **A17** (16) |
| **Tag pill** | Filter-strip chip; inactive on hover-surface, active on accent with a derived on-accent label | **A17** (15) |
| **Image scrim** | 45% light / 55% dark wash under text set over a photograph | **A17** (8) |
| **On-contrast derivation** | `color-mix` toward the band's own text: muted 60% · hairline 10% · plate 7% | **A17** (7) |
| **Ratio cycle** | Diagonal ratio assignment `((row−1)+(col−1)) mod cycleLength`; column count ≤ cycle length | **A17** (11) |
| **Section head** | Eyebrow 13 tracked · title · sub 17 on 620 · note · link; all optional, link as a pair | A1 |
| **Meta row** | 24 px avatar + name · date · reading time at 13 px muted | A1 (A1·6) |
| **Focus ring** | 2 px accent ring at 4 px offset on the whole interactive box | A6 |
| **Author initials block** | Two-letter fallback in a circle at the pack's hover surface, for a missing `profile_image` | A12 |
| **Striped image placeholder** | 45° two-tone stripe with a mono caption naming the crop; frames only, never shipped | A1 |
| **Cell divisions** | Two 636 · Three 416 · Four 306 · Five 240 · Six 196 on a 24 gutter across 1,296 | A10 |
| **Named ratio ladder** | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5, never computed | A8 (A8·8) |
| **Split layout** | Head column beside a content column, `grid-column` move rather than `order` | A8 (A8·6) |
| **Bento arrangement** | Fixed composition of unequal cells at one exact count | A5 (A5·9) |
| **Short-last-row rule** | Orphan keeps the cell width and sits at the left; never rebalanced, stretched, centred or hidden | A12 |
| **Editor count line** | "N posts match. M drawn." plus the divisor advice, in the Data group | **A17** |
| **Post picker** | Ghost-aware search-and-pick list storing post references; drag order is drawn order; no blank Add, remove never disabled | **A17** |
| **Feed empty state** | Authored heading and body drawn by the designated main feed when its route has no posts | **A17** |
| **Count stepper** | One numeric stepper, 1–100, with per-design bounds and locks drawn disabled with their reason | **A17** |
| **Avatar in the meta row** | The 24 px `profile_image` as the Meta enum's fifth value, initials block as fallback | A19 |

## Block 2 · Shared field list

**Twenty-six fields after the reconciliation pass** — twenty before it. Counted as the schema counts
them: `feature_image` carries its `feature_image_alt`, and `primary_author` carries its `name` and
its `profile_image`.

**Authored on the section — nine, and ten on 16 Load More.** All optional.
`eyebrow` text ≤ 26 · `title` text ≤ 104 · `sub` text ≤ 178 · `note` text ≤ 120 ·
`linkLabel` text ≤ 24 · `linkUrl` url · **`linkTarget` enum** (Matches the query · Custom) ·
**`emptyHeading` text ≤ 60** and **`emptyBody` text ≤ 160**, main feed only, authored with defaults ·
**`buttonLabel` text ≤ 24 on 16 Load More**, default "Load more". **The link pair is a pair: one
without the other is not drawn.** **There is no `image` field on an A17 section** — every image
belongs to a post, which is why rule 10's Image focus has nothing here to attach to.
**All of these edit inline with the P0·1 toolbar; none of a post's own fields does.**

**The query — six, in the Data group.**
`source` enum req (six values, **Hand-picked** among them) · `filterValue` ref opt ·
**`postRefs` ref[] opt** · `count` int req (**a stepper, 1–100, per-design bounds**) ·
`order` enum req · **`paginationStyle` enum opt**, main feed only. *12 Bento locks `count` at 5,
and the stepper is what makes that expressible.*

**Read from each post — ten, three optional.**
`title` req · `url` req · `published_at` req · `reading_time` req (computed by Ghost) ·
`feature_image` + `feature_image_alt` opt · `primary_tag` opt · **`excerpt` opt** — custom where
authored, Ghost's generated plaintext otherwise ·
`primary_author` req, whose `name` is req and whose `profile_image` is opt · `featured` boolean,
read by seven designs and stored by all eighteen · `visibility` **read and never drawn** (A32's).

**Ghost-owned, never inline-editable.** Every field in this paragraph is read from the post and
clicking it in the editor says **"Edit in Ghost"** ⚑ — titles, tags, author names, excerpts and
dates alike.

**Per-design image field — the open question.** Fourteen designs use `ratio`, 11 Masonry uses
`cycle`, 13 Thumb Side uses `thumbSize`. **Three section fields for what a user experiences as one
control**, and switching between the three groups honours none of the others. Specified separately
here; the architect should decide whether they collapse into one polymorphic field.

**Why the union is short.** Nothing in this list is authored in the section except the head and
empty-state fields, so "content preserved across a design switch" means something different in A17 than in A12:
**the query is preserved, and the query is what the user owns.** Switching from 1 Three Up to
10 Ledger drops the image and the excerpt from the drawing and nothing from the site.

---

## Findings for the architect

### Closed by the controls-reconciliation pass

- **3 · 12 Bento's count of five** — closed. Count is one stepper with per-design bounds, and 12
  Bento's is locked at 5 with the reason drawn beside it.
- **4 · 11 Masonry's Columns Four** — closed by removal. Column count ≤ cycle length is enforced by
  the control instead of by a warning note.
- **5 · `custom_excerpt` only** — closed. Cell excerpts bind `excerpt`; `custom_excerpt`-only is kept
  for designs that frame the excerpt, which is A19's and none of A17's.
- **The hand-picked set** — closed. A Ghost post picker storing references replaces the
  tag-the-site-controls workaround, which polluted the public tag namespace.
- **The main feed's zero state** — closed. It renders an authored empty state and carries A34's
  Pagination style on its own sidebar.
- **9 Big Type's DOM order** (old finding 8) — unchanged and still a finding, but no longer a
  surprise: the design's Meta enum is now the only place its tag can be governed, which is why it is
  the one design with no Tag row.

### Still open

1. **A pack-level `on-accent` and `on-contrast` text colour.** Three designs (7, 15, 16) derive one
   independently. The strongest finding in the category.
2. **One image field or three?** `ratio` / `cycle` / `thumbSize` — see Block 2.
3. **12 Bento needs a count of five**, which the shared Show cannot express.
4. **11 Masonry's Columns Four repeats a column** under the default three-ratio cycle.
5. **`custom_excerpt` only** — no generated-excerpt fallback anywhere in A17.
6. **No module covers an excerpt on hover** (14 Dense) or a client-side sort (10 Ledger). Both are
   named as gaps rather than given invented module names.
7. **Tabular figures are a pack requirement A17 cannot state** (10 Ledger).
8. **9 Big Type moves the tag after the title in the DOM** — the one departure from the card's
   promised field order.
9. **18 Edge to Edge's focus ring must invert to an inset offset on edge cells.**
10. **18 Edge to Edge's squared image** is a departure from the pack's radius token.
11. **`postRefs` needs an ordering contract in the schema.** Drag order is drawn order in the
    editor; the template must be handed the references *in that order* rather than re-sorting them
    by `published_at`, and Ghost's `#get` helper does not preserve an arbitrary order for free.
12. **The theme translation catalogue now has A17 entries** — 15 Filtered's "All" pill, 16 Load
    More's count and exhausted lines. A17 previously shipped no catalog string at all.
13. **The main feed needs to be *designated*.** "This route's posts on a paginated template" is a
    template fact, not a section setting; the builder has to tell the section which it is, or the
    empty state and the pagination select cannot be shown conditionally.

---

## Reconciliation notes

**Frames changed in this pass — nineteen.** `A17-0 Category Proof` and **all eighteen
control-panel frames**: `A17-1 Three Up`, `A17-2 Two Up`, `A17-3 Four Up`, `A17-4 Cards`,
`A17-5 Lead and Grid`, `A17-6 Split Head`, `A17-7 Contrast Band`, `A17-8 Overlay`,
`A17-9 Big Type`, `A17-10 Ledger`, `A17-11 Masonry`, `A17-12 Bento`, `A17-13 Thumb Side`,
`A17-14 Dense`, `A17-15 Filtered`, `A17-16 Load More`, `A17-17 Panel`, `A17-18 Edge to Edge`.

**What changed on A17-0.** Settlement 1 amended (the main feed's empty state), settlement 2 amended
(the `excerpt` binding), settlement 4 amended (Pagination style is a control on the feed); the Posts
block redrawn as **the Data group** with Hand-picked, the post picker, the Count stepper and the
main-feed sub-block; the "use a tag the site controls" paragraph struck and overruled in place; the
shared field list updated; and one new card, **the seven rules this pass put on every design**.

**What changed on all eighteen panels.** The **Padding** row retired into the universal **Vertical
spacing**, drawn outside the design's list with **Background role** and **Top divider**. The Posts
block replaced by the **Data group** (P0·5 "Populate from…" configured for posts). Three new groups
added under it — **EDITING · the P0 primitives**, **BEHAVIOUR · from the fixed registry**,
**DATA · Ghost's surface, and what A17 refuses** — and a **⚑ RECONCILED** card added to every spec
frame. **No Preview control existed to remove** anywhere in A17.

**Frame-by-frame.** **Tag Show · Hide** added on 1–8, 11–13, 15–18 (10 and 14 already governed it;
**9 excepted**, its tag being inside the Meta enum). **"View all" link Matches the query · Custom**
added on all eighteen. **Meta** added where the design drew a meta row and could not govern it — **6,
15, 16, 17, 18** — and **With photograph** added as its fifth value on **1, 2, 4, 5, 6, 11, 12, 15,
16, 17, 18**, refused with a stated reason on **3** (306 cell), **7** (a photograph cannot be
colour-mixed onto the band), **8** (an avatar inside a scrimmed caption), **13** (two identifying
images in one row), **10** and **14** (no author at any setting). **Background role locked** on
**7** (Contrast) and **8** (Background); **Top divider locked None** on **7** and **18**. **8 and 17
gained a vertical-spacing control they never had**; **7 keeps its band scale as that row's
resolution**; **17 keeps Inset as a separate ladder**. Per design: **4** gained **Card plane**,
**11** lost **Columns Four**, **12** gained **Tall cell** and a locked Count of 5, **15** had
`filter-strip` redefined as navigation and its pills given a 44 px hit area, **16** gained **Image
ratio**, an authored `buttonLabel`, catalog strings and a renamed **Count line**, **18** gained
**Scrim**.

**Primary section frames redrawn: none.** Every item in this pass changed a control, a rule or a
string rather than a drawing. Three primary frames were **re-labelled**: **1, 2 and 5** already drew
the 24 px avatar, so their captions now read *meta With photograph* — the value the drawing was
always at. **18 Edge to Edge's Text Over tile already drew 8 Overlay's scrim**; this pass names it in
the panel and the spec rather than adding it to the frame.

### Where this pass overruled the category's own rulings

- **"Where a site wants a hand-picked set, the answer is a tag."** Overruled. The tag pollutes the
  site's public tag namespace; a post picker storing references does not.
- **"Excerpt is `custom_excerpt` only; Ghost's generated excerpt is refused."** Overruled for cells,
  kept for framed excerpts (A19's).
- **"Zero published → the section does not render."** Amended for the designated main feed only.
- **"A34 attaches below, and the section boundary is the seam."** Amended: on the main feed
  Pagination style is a control in the Data group, and **16 Load More locks it**.
- **"8 Overlay has no Padding control, and its absence is deliberate."** Withdrawn — the universal
  row closes it. **17 Panel's "no Padding control — the only design in A17 without one"** withdrawn
  the same way, with Inset kept as a genuinely different ladder.
- **"Columns Four is left in place with a warning note; the architect should pick."** Picked: removed.
- **"`featured` is read and deliberately not drawn" (12 Bento).** Overruled: it is the Tall cell's
  input.
- **"Pills are 33 px, deliberately under the touch minimum."** Kept as a look, closed as a defect —
  the hit area is 44 px.
- **"The button's label, the count and the exhausted line are composed from data — no authored
  strings in this design's own furniture" (16 Load More).** Overruled: `buttonLabel` is authored with
  a default, and the two lines are catalog strings.

### Conflicts recorded rather than resolved

- **The patch asks for "Card: Surface · Outline" on 4 Cards; the panel draws "Card plane".** 4 Cards
  already has a **Cards** row (Equal · Natural height), and two rows called Card and Cards in one
  sidebar is a control that lies. The values are the patch's; the label is not.
- **The patch adds a fifth Meta value "wherever the meta row can carry the 24 px avatar".** Six
  designs are judged not to, each for a reason already drawn at its control. That is a judgement, and
  this is where it is recorded.
- **Rule 9 asks for Member visibility on CTA-bearing designs. A17 ships none.** Every action in the
  category is navigation — a card, a head link, a load-more button — and a grid that hid itself from
  logged-out readers would hide the site's writing rather than an offer. Recorded here rather than
  added as eighteen rows nobody should use.
- **Rule 10 asks for Image focus on every image field. A17 has no image field.** The crop is named by
  the ratio ladder and the focal point belongs to the post, in Ghost. The old flat statement "no
  focal-point control anywhere in A17" now carries that reason.
- **Rule 11's button icon reaches one design.** Only 16 Load More has a button; the head link is text
  with an accent underline, and an icon on it would make it look like one.
- **The count stepper's ceiling is 100; two designs' honest ceilings are lower and one is higher.**
  2 Two Up stops at 6 and 12 Bento at 5 by lock; 10 Ledger is correct to 30 and behaves past it. The
  per-design bounds are the truth and the 1–100 range is only the widest of them.
- **No module name was coined.** The two gaps stay named and unowned: an excerpt on hover (14 Dense)
  and a client-side sort (10 Ledger). `infinite-scroll` stays refused category-wide.
