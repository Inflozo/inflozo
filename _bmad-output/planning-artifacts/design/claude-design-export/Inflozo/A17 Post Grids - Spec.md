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

**Design patch pass — 29 August 2026 (this document's current state).** Four rulings landed on this category and one of them reaches every design in it. **Ghost's templates cannot look across a loop**, so the span belongs to **the first post** rather than the first featured post, the filter strip cannot be built from the tags of the posts drawn, and 12 Bento's tall cell loses the flag as its input. **Load more is the main feed's only.** **Every hand-off in the category is deleted** — a placed design is the design that renders; where a precondition fails the section hides what does not apply and the panel may advise. **An author drawn from Ghost shows one letter, never two.** Every change is listed with the name of the rule that required it in **Patch notes** at the end. **Nothing was renumbered.**

**Pass two — 1 September 2026 (this document's current state).** Two jobs, both narrow. **The disabled-control pattern** was applied wherever one control switches another off: eight per-design cases are now drawn greyed with the reason at the control, and the universal **Order** row states its reason at **Source: Hand-picked**. **The avatar rule** was carried across the eleven designs whose Meta enum offers **With photograph** — an author drawn from Ghost shows **one letter, never two** — and restated as refused, with its existing reason, on the other seven. **No control was added, removed or renamed, no default changed, no design renumbered, and no layout, type scale, colour pack or spacing step moved.** Four cases could not be applied without inventing a decision and are written as OPEN QUESTIONS in **Patch notes — pass two** at the end.

**Pass four — 3 September 2026 (this document's current state).** Three work-list items, and **none of them changes a drawing.** **The post card's exceptions are written into the card**, which is defined here: the **four DOM-order departures** — A17·9, A18·4, A18·9, A18·13 — and the **one truncation**, A18·3 Slim, are recorded in the card's own definition instead of in five separate design specs, so the fifth exception is not filed where nobody looks. **One control name means one set of values** *(the owner's ruling, 3 September 2026)*: `thumbSize` and `order` are each declared once for the categories that inherit the card, **`ratio` / `cycle` / `thumbSize` are ratified as three controls rather than three value sets of one name**, and **10 Ledger may not coin a third `order` value** — its sort gap keeps a reason as well as an absence. **The excerpt floor is exclusive**: three lines needs a text column **above** 306 px, so at exactly 306 three lines is already refused and falls to two — which is what the shared floor and the disabled-control table have said all along, and the conflict pass three recorded is closed on the floor's side. **Four answers are written in as facts rather than decided here:** the pack's contrast colours **and its tabular figures are COMPUTED**, so no design derives one; **the main feed is designated and the project file stores which section it is**; **a dependency is declared in the control's own definition and carries its reason**; and **hand-picked references keep the order they were dragged**. **Nothing was renumbered, renamed, redrawn or deleted, no control was added or removed, no value changed, no default changed, no layout, type scale, colour pack or spacing step moved, and no design total is written anywhere.**

**[Free] designs:** 1 Three Up · 4 Cards

*(Shortlisted in this pass — 1 Three Up, 10 Ledger, 9 Big Type, 13 Thumb Side, 4 Cards — and **ruled by the owner on 29 August 2026**: the category default and the per-post plane. A free customer gets the plain grid and the card grid; the picture-free table, 10 Ledger, stays paid.)*

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
18 Edge to Edge draw their cells without their image boxes — 8 Overlay's scrim goes with it — and
their panels carry one quiet line — **"None of these posts has a picture. 9 Big Type is built for
text."**, advice and never a warning *(the owner's ruling, 29 August 2026)* ⚑ **amended 29 August 2026: no design ever turns into another
design**. **The excerpt binds `excerpt`** — the custom excerpt where one
is authored, Ghost's generated plaintext otherwise, clamped by line as designed. ⚑ **Overruled in
this pass**: the old rule was `custom_excerpt` only, and the argument for it survives (a machine-cut
first sentence is what makes a template grid look generated) while the rule does not — **a site that
never authors excerpts would get bare grids in all eighteen designs**, which is the worse default.
`custom_excerpt`-only is kept for designs that **frame** the excerpt, which is A19's Quote and
nothing here.

**3 · The first cell's span.** Drawn as **the first post in the set spanning two columns** — same card,
bigger box, plus the excerpt where uniform cells draw none. **Position, not the featured flag**
⚑ **29 August 2026, the owner's ruling**: a template cannot tell which flagged post is the first inside
one loop, and the two-query alternative was declined, so the span goes to the post the query returns first, and **a grid of featured posts is still available
by setting Source to Featured only**. Refused: badge, label, border, fill, accent hairline, shadow,
star, different ground. **At Off the grid is uniform and no cell is promoted**; no space is reserved,
and “more than one post is flagged” is no longer a case. The row is drawn **First cell: Off · Spans
two columns**; always on in 5 Lead + Grid, where **the lead is the first post in the set's order**.
**`featured` is stored by all eighteen designs and read by none.** *Which designs carry the row is a
conflict this pass records rather than resolves — see Patch notes.*

**4 · Pagination.** No A17 design draws page numbers, a next link, a counter or a range of its own.
⚑ **Amended:** "A34 attaches below and the section boundary is the seam" describes a section a user
placed on a page; **on the main feed pagination is a control on the feed** — at Source: This route's
posts the Data group carries **A34's Pagination style** (Numbered · Newer and older · Load more ·
None) on that section's own sidebar. **16 Load More locks it at Load more**, because that design *is*
the continuation and two mechanisms on one feed is a bug. One exception: **16 Load More**, whose
`load-more` module grows the grid in place and whose no-JS branch is Ghost's own numbered links.
On an archive route Ghost's pagination governs and Show is ignored, disclosed in the panel ⚑.
**Load more is the main feed's only** ⚑ **29 August 2026**: a section placed in a page has no page 2 to
load, so **16 Load More's `source` is locked at This route's posts** with the other five values drawn
greyed and the reason beside them, and A34's **Load more** pagination value appears only on the
designated main feed.
**`infinite-scroll` is refused category-wide.**

### The post card

DOM order **image → tag → title → excerpt → meta**, in all eighteen. What varies is whether the
image sits above the text or beside it, and which optional parts are drawn; **a design never
re-orders the parts**, so switching designs never changes what a screen reader hears about a post —
**except in the four designs named in the register below.**

**The DOM-order register** ⚑ 3 September 2026, *the card's exceptions belong in the card*. The four
departures were recorded in four separate design specs, one per design that made one, which is how a
fifth would have come to be filed where nobody looks. **This is the whole list. A design not named
here may not depart, and a new departure is added here or nowhere.**

| Design | What it draws instead | Why |
|---|---|---|
| **A17·9 Big Type** | tag after the title, folded into the meta line | a display-scale headline is heard first and its section second; the fields are preserved, the tag's position within them is not |
| **A18·4 Dated** | date, tag, title, excerpt, author | the leading date column *is* the design, and visual and reading order agree |
| **A18·9 Big Type** | title, then tag | A17·9's move in A18's ladder — the same exception, twice |
| **A18·13 Timeline** | date, tag, title, excerpt, author | A18·4's departure, for A18·4's reason |

**Every other design that inherits the card keeps the order exactly** — seventeen of A17's eighteen and
twelve of A18's fifteen. **The card's promise is narrower than it read and true as it now reads:**
switching between any two designs not on this list never changes what a screen reader hears about a
post.

- **Title** in the pack's *heading* font ⚑ (a departure from A12, where names were body). 22 px in a
  416 cell · 19 in 306 · 17 in 240 or 196. **Wraps, never clamped, never truncated — with one
  exception, written here so the promise stops being false** ⚑ 3 September 2026, *the card's
  exceptions belong in the card*: **A18·3 Slim** clips its single-line row's title with
  `white-space: nowrap` + `text-overflow: ellipsis`. **The full string stays in the DOM**, is the
  link's accessible name and is what is indexed; **no `title` attribute is added**. **It is the only
  truncation in the library, and no A17 design truncates anything.** Excerpts are clamped by line
  instead.
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
**At With photograph an author with no `profile_image` draws ONE letter in the circle, never two** ⚑
1 September 2026, *avatars with no photograph show initials, and the two forms are not interchangeable*:
every byline in A17 comes from Ghost, whose template language cannot split a name on the versions we
support, so two initials are unreachable here. The two-initial form belongs to a list the user types
and **A17 has none**; the forms are never mixed inside one component. **Eleven designs offer the
value — 1, 2, 4, 5, 6, 11, 12, 15, 16, 17, 18 — and the other seven refuse it with the reason
already at the control.**
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
- **Order is a rule, never a sequence:** Newest first · Oldest first, and **greyed at Hand-picked with
  the reason beside it** — "not available while posts are hand-picked: your drag order is the order"
  ⚑ 1 September 2026, *a control switched off by another is greyed, with the reason beside it*. The row
  was already switched off; what the pass adds is the sentence at the control and a row that is greyed
  rather than left accepting a value the query will not honour. **`shuffle` is declared
  nowhere** ⚑ — a grid whose order changes on reload cannot be proof-read.
- **Responsive floor.** Five → four at 1080 → three at 834 → **one at ≤ 767 wherever the card draws
  a feature image.** Sixteen of the eighteen draw one; **fourteen of those sixteen collapse to a
  single column.** Two stay two across: 10 Ledger (no image) and 14 Dense (title under a very small
  one). 13 Thumb Side keeps its row unchanged.
- **Print.** Every design prints as drawn except three: 15 Filtered without its strip, 16 Load More
  with the posts it had loaded, 7 Contrast Band **without its band** — the grid prints on white at the
  same cells, the same measure and the same rules ⚑ 29 August 2026, no design ever turns into another
  design. Print is the light mode.
- **Behaviour.** Two designs declare a module, sixteen declare none. `core` is assumed, not declared
  per design. **No A17 design loses a post without JavaScript**, and sixteen are pixel-identical with
  it off. **`reveal` is refused on a grid.** **No A17 design declares a width below which its script
  runs** ⚑ 1 September 2026, *a design may declare the width below which its script runs*: both modules
  run at every width and both no-JavaScript lines already read at every width. 15 Filtered's strip below
  767 is the one place the claim is ambiguous, and it is an open question rather than a declaration.
- **Dark.** Ground deepens, tag plate lifts to `#2A251E`, hairlines take `#332E27` — **measured, the
  light rule sits 9.1 lightness points below its ground and the dark rule 9.8 above its own, so one
  symmetric step serves both modes.** Photographs untouched. 8 Overlay's scrim re-tunes 45% → 55%.
- **Accent** is spent twice in the category: a title's hover underline and A6's focus ring. Three
  designs spend a third and all three are controls — 15 Filtered's active tag, 16 Load More's Solid
  button, 7 Contrast Band's lifted accent. **A tag is never accent.**
- **The pack supplies its own contrast colours, and no design derives one** ⚑ 3 September 2026, *an
  answer that already existed*. **Every Style Pack value is marked COMPUTED or AUTHORED**, and
  **on-contrast text, accent-on-contrast, dark elevation, dark hover-surface and tabular figures are
  all COMPUTED** from colours the pack already declares. The three independent derivations this
  category recorded — 7 Contrast Band's band, 15 Filtered's active pill, 16 Load More's Solid button
  — are **readings of those tokens rather than arithmetic a section performs**, and 10 Ledger's
  tabular figures are supplied rather than hoped for. **No colour, contrast measurement or drawn
  value in A17 changes**; what changes is where the value comes from.
- **Structure.** `<section aria-labelledby>` named by its title, an `<h2>`; posts a `<ul>` of `<li>`;
  **each title an `<h3>`** inside the card's `<a>`; tag and meta `<p>`s; image `<img>` with
  `feature_image_alt` or `alt=""`; tag plate `aria-hidden`.

### The disabled-control pattern

**A control switched off by another is greyed, with the reason beside it** — P0's treatment, applied
without exception in this category: the row is drawn, the switched-off value is struck through, the
reason is one short sentence at the control rather than a tooltip, and **no row is ever left accepting
a value it will not honour**. **How the relationship is written down was answered on 3 September 2026**
⚑, *an answer that already existed*: **the dependency is declared in the control's own definition and
carries its reason**, so the panel, the checker and the compiler read one source and **no A17 design
hand-draws the relationship**. The eleven cases below are declarations, not drawings that happen to
agree. **Nothing in A17 is hidden by another control** except the main feed's
own pair, which the Data group hides because **P0·5** does — recorded as a conflict in Patch notes
rather than resolved here. **The rule's one exception is claimed nowhere in A17**: no control in this
category is one the project can never offer, so nothing is left undrawn.

| Where | What greys, and the reason at the control |
|---|---|
| **Every design** | **Order**, at Source: Hand-picked — "not available while posts are hand-picked: your drag order is the order." |
| **1 Three Up** | **Excerpt: Three lines**, at Per row Four — three lines of 15 px text under a 306 px image is a paragraph in a thumbnail. Falls to Two lines. |
| **3 Four Up** | **Excerpt**, the whole row, at Per row Five — the floor draws no excerpt below a 306 px cell and Five is 240. Falls to Off. |
| **7 Contrast Band** | **Excerpt: Three lines**, at Per row Four — 1 Three Up's cell, so 1 Three Up's narrowing. Falls to Two lines. |
| **9 Big Type** | **Title: Display**, at Per row Three — 416 is 65% of the 636 the size was set for. Falls to Large. |
| **11 Masonry** | **Columns: Three**, on the two-ratio cycle Landscape–Portrait — columns one and three would run the same crop sequence. Falls to Two. |
| **15 Filtered** | **Excerpt: Three lines**, at Per row Four — a 306 px cell holds two. Falls to Two lines. |
| **16 Load More** | **Excerpt: Three lines** at Per row Four and **the whole row** at Per row Six (196 px). Falls to Two lines, and to Off. |
| **18 Edge to Edge** | **Scrim**, the whole row, at Text Under — there is nothing for the wash to sit behind. Returns at Standard. |
| **4 Cards** | **Excerpt**, the whole row, at Per row Four — the card's 20 px padding leaves a 264 px text column. Falls to Off. *(Owner's ruling, 1 September 2026.)* |
| **6 Split Head** | **Excerpt**, the whole row, at Per row Three — 856 in three is a 269 px cell. Falls to Off. *(Owner's ruling, 1 September 2026.)* |
| **17 Panel** | **Excerpt**, the whole row, at Per row Four — the panel's cells run 278–290 px at every Inset. Falls to Off. *(Owner's ruling, 1 September 2026.)* |

**Locked is a different case from switched off, and both are drawn.** A row the design fixes —
7 at Background role Contrast, 8 at Background, 7 and 18 at Top divider None, 12 at Count 5,
16 at Source This route's posts and at Pagination style Load more — is drawn with its reason beside
it and never hidden. **The excerpt floor measures the text column, not the outer cell** ⚑ 1 September 2026, the owner's
ruling — which is what put 4 Cards, 6 Split Head and 17 Panel in the table above. **Eleven cases in
all**, and none of them hidden.

**The floor is exclusive, and this is where the two tiers are stated once** ⚑ 3 September 2026,
corrected centrally: **three lines needs a text column above 306 px**, so **at exactly 306 three lines
is already refused and falls to two** (1 Three Up, 7 Contrast Band and 15 Filtered at Per row Four),
and **below 306 no excerpt is drawn at all** (3 Four Up at 240 falls to Off; 4 Cards at 264, 6 Split
Head at 269 and 17 Panel at 278–290 grey the whole row). **The conflict pass three would not choose is
closed on the floor's side**: the instruction whose example implied the opposite has been corrected,
nothing in this document reads the other way, and **no frame changed** — every greyed row was already
drawn at the floor's reading.

### One control name, one set of values

**The owner's ruling, 3 September 2026.** A user who learns a control in one design must not meet a
different control wearing the same name in the next. **One name owns one list of values.** Where two
designs genuinely differ, **they differ by name** — and some designs lose a value they had, which is
the intended cost.

**What the set is.** The set is the **list of value names**, in one order, with no design adding,
removing or re-ordering an entry. A design states **what those names resolve to in its own geometry**;
that resolution is a measurement, not a value. The universal Vertical spacing already works this way —
Compact · Comfortable · Spacious, resolved 64 · 96 · 132 at 1440 and 80 / 64 further down the ladder.

**As it lands in A17, name by name:**

| Name | The one set | A17's resolution |
|---|---|---|
| `order` | **Newest first · Oldest first** | identical in all eighteen, greyed at Hand-picked. **No design may add a third value under this name** |
| `thumbSize` | **Small · Medium · Large** | 13 Thumb Side resolves 96 · 120 · 160. **A17 has one design that writes it.** A control that can also be switched *off* is a different control and takes a different name |
| `rowDensity` | — | **No subject: no A17 design writes it.** 10 Ledger's six density rows are Columns, Rows, Date, Tag and Title; 17 Panel's is Inset; the section's is the universal Vertical spacing. Checked so that A17 does not become another set under the name |
| `ratio` · `cycle` · `thumbSize` | three names, one set each | **Ratified rather than merged.** The collision the ruling forbids is one name carrying several sets, not several names carrying one set each — a named ratio, a repeating cycle and a fixed pixel size are three controls a user meets in three designs, and a single polymorphic field would honour none of the other two's values on a switch |

**What A17 gives up.** **10 Ledger may not coin a third `order` value.** Its A11y note says the honest
fix for the missing client-side sort is "a third `order` value server-side"; under this ruling that
value would give one name two sets, so **the sort gap stays a gap and now has a reason as well as an
absence**. Nothing drawn changes: no A17 design ever offered a third value.

**What is recorded for the categories that inherit the card.** A18 writes `rowDensity` with five
quantity ladders, `thumbSize` with a set that begins **Off**, and `order` with a third value
(**Title A–Z**, at A18·14 Index). **Those are A18's rows to reconcile in A18's pass**, against the set
declared here; this pass names them rather than editing another category's designs. **The one question
the ruling does not settle for A17 is written as an OPEN QUESTION in Patch notes** — whether a differing
*quantity* under a shared value name counts as a second set, which is the only reading under which
13 Thumb Side's 96 · 120 · 160 would have to move.

### The Data group — what replaces a repeater

**P0·5 "Populate from…" configured for posts**, identical in all eighteen, below each design's own
controls, **not counted toward the brief's control budget** ⚑:

| Field | Type | Values |
|---|---|---|
| `source` | enum req | Latest posts · By tag · By author · Featured only · This route's posts · **Hand-picked** |
| `filterValue` | ref opt | a tag or an author; read at By tag / By author |
| `postRefs` | ref[] opt | read at Hand-picked; the Ghost post picker's references, **drag order = drawn order** |
| `count` | int req | **a stepper, 1–100**, with per-design minimum, maximum and step |
| `order` | enum req | Newest first · Oldest first — **two values, and two is the whole set** (see *One control name, one set of values*); **greyed at Hand-picked, with the reason at the control** |
| `paginationStyle` | enum opt | main feed only: Numbered · Newer and older · Load more · None (A34's) |
| `emptyHeading` `emptyBody` | text opt | main feed only; authored, with defaults |

**Hand-picked, added in this pass.** Search-and-pick, drag to order, references stored — never
copies. **The references are held in the order the user dragged them and handed to the template that
way, never re-sorted by date** ⚑ *ruled 2 September 2026*, which is why Order is greyed in that path
rather than quietly ignored. ⚑ **This overrules the old answer**, which was "use a tag the site controls": **a tag
invented to arrange a layout pollutes the site's public tag namespace**, appearing on the post, in
its tag list, on its archive route and everywhere else the theme draws tags. **The refusals stand:**
no Add that creates a post, no Remove that deletes one, no per-post styling — design controls write
one value onto the section and every post reads it.

**Count is one stepper.** ⚑ The fixed 3 · 6 · 9 · 12 enum could not say five, which made **12 Bento's
forced count unexpressible**; the stepper carries per-design bounds and **locks drawn disabled with
their reason** — 12 Bento locked at 5, 10 Ledger reaching 30, 2 Two Up stopping at 6.

**The main feed.** At Source: This route's posts the group gains **Pagination style** and the
**empty-state pair**. See settlements 1 and 4. **Which section is the main feed is designated, not
inferred** ⚑ 3 September 2026, *an answer that already existed*: **exactly one section per page is the
main feed and the project file stores which one**. A design is told; it does not work it out. That is
what makes the empty state and the page-number control conditional, and it is what makes 16 Load
More's locked Source meaningful.

**Member visibility is not offered anywhere in A17** ⚑ — the only actions in the category are
navigation (the cards, the head link, 16's button), and a grid that hid itself from members would
hide the site's writing rather than a call to action. `visibility` is read and never drawn (A32's).

### The content

Nine invented posts (Orbit Weekly), used in the same positions in every frame. Four carry the hard
cases: **post 2** a 69-character title, **post 3** no feature image, **post 4** no tag and no
excerpt, **post 5** an author with no photograph. **Post 1 is both the first post in the set and the post Ghost has flagged**, and after this pass the span follows its position rather than its flag. Excerpts are
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Three · Four |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · ~~Three lines~~ **greyed at Per row Four**, with the reason at the control; falls to Two lines |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | First cell | Off · Spans two columns |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **Named as advice by nine other designs' panels** ⚑ 29 August 2026 —
   advice, never a switch; nothing hands off here.
8. **Empty.** Tag plate; no tag → title moves up; no excerpt → shorter cell, mixed cells ordinary.
9. **Behaviour module.** **None**; `core` is assumed by the theme and never declared per design. **Edit-safe: yes** — nothing on this design moves, loads or listens, so the editor canvas is the site drawing. **JS off:** pixel-identical — server-rendered markup, a CSS hover underline and a CSS focus ring.
10. **A11y.** Floor as written. Contrast 15.46:1 / 5.56:1 light, 15.64:1 / 6.89:1 dark.

**Reconciled — 24 August 2026.** *Controls, seven:* Per row · Image ratio · Excerpt · **Meta** (five values, **With photograph** added) · **First cell** · **Tag Show · Hide** · **"View all" link** Matches the query · Custom. Padding retired into the universal Vertical spacing. *Data:* Source gains **Hand-picked**; Count is a stepper **1–24** (designed 3, 6, 9); the excerpt binds `excerpt`. *Main feed:* at This route's posts the section renders the authored empty state and carries A34's Pagination style. *Editing:* head strings take the P0·1 toolbar; post content says "Edit in Ghost".

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · Three lines |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Alignment | Left · Centred |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 2 and 4; correct at 1–6. **12 Bento's panel advises it when its own five cells cannot be filled** ⚑ 29 August 2026.
8. **Empty.** Plate at 636 × 424 — large, and the frame draws it.
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing runs. **JS off:** pixel-identical; both 636 cells, their excerpts and their meta are server-rendered.
10. **A11y.** Floor. Same four contrast values.

**Reconciled.** *Controls, seven:* Image ratio · Excerpt · Columns · Title · **Meta** (five values, **With photograph** — the 636 cell is where the avatar costs least, and the primary frame already drew it) · **Tag** · **"View all" link**. *Data:* Hand-picked; Count stepper **1–6**, above which the panel points at 1 Three Up rather than shrinking the cell; `excerpt` binding; main-feed empty state and Pagination style.

---

### 3 · Four Up

1. **Descriptor.** Four 306 cells with two lines of excerpt — the densest grid that still carries one.
2. **Tuple.** `grid-of-N · none · page · many · top · densest cell with an excerpt`
3. **Archetype.** grid-of-N. No departures.
4. **Responsive.** 1440 four 306 · 834 three 235 · ≤ 767 one column.
5. **Fields.** As 1 Three Up, excerpt capped at two lines.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Four · Five |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · ~~Two lines~~ **greyed at Per row Five**, with the reason at the control; falls to Off |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | First cell | Off · Spans two columns |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the old Padding row, under the universal name) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 4, 8, 12; correct at 1–12. **The category's stress frame is drawn on this
   design** (seven posts at Count Four).
8. **Empty.** Plate at 306 × 204.
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing runs. **JS off:** pixel-identical, including the stress frame's short last row.
10. **A11y.** Floor. Row rule `#E7E2DB` light / `#332E27` dark — 9.1 and 9.8 lightness points from
    their grounds, measured, one symmetric step ⚑.

**Reconciled.** *Controls, seven:* Image ratio · Excerpt · Meta · Row rule · **First cell** · **Tag** · **"View all" link**. **With photograph is refused here** ⚑ — a 24 px circle beside 13 px text in a 306 cell leaves the name nowhere to wrap, and the reason sits at the control. *Data:* Hand-picked; Count stepper **1–24**; `excerpt` binding; main-feed empty state and Pagination style.

---

### 4 · Cards

1. **Descriptor.** One post per card on a surface plane with a hairline, equalised per row. **The
   only design in A17 that gives a post a plane**, and the only hover lift.
2. **Tuple.** `grid-of-N · none · page · many · top · per-post plane`
3. **Archetype.** grid-of-N. No departures.
4. **Responsive.** 1440 three 416 (`box-sizing: border-box` — the border is inside the cell) ·
   834 two 365 · ≤ 767 one column.
5. **Fields.** As 1 Three Up.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Three · Four |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · Three lines; **the whole row greys at Per row Four** — the card's 20 px padding leaves a 264 px text column — with the reason at the control; falls to Off |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | ~~Feature~~ | not drawn — the panel draws no span control; the panel is the authority (see Patch notes) |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **No count threshold, and no design switch — there are none left in A17.**
8. **Empty.** Plate inside the card's own radius. Cards in a row are equalised, so a short card's
   space falls at its foot.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the hover shadow is a CSS transition on the card and does not run while a card is being edited. **JS off:** pixel-identical; the plane, its hairline and its radius are CSS, and the hover lift simply never fires without a pointer.
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
5. **Fields.** As 1 Three Up. **The lead is the first post in the set's order** ⚑ 29 August 2026 —
   position, not the flag, because a Ghost template cannot look across a loop to find the flagged post.
   `featured` is not read.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Lead side | Left · Right |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · Three lines |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 4, 5, 7; correct at 2–9. **1 post → draws the lead alone.**
8. **Empty.** Plate; a lead with no image is the frame's worst case and is drawn.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the lead is a `grid-column` placement, not a script. **JS off:** pixel-identical, lead cell included.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Head side | Left · Right |
   | Per row | Two · Three |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · Three lines; **the whole row greys at Per row Three** — 856 in three is a 269 px cell — with the reason at the control; falls to Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 4 and 6; correct at 2–8.
8. **Empty.** At Head None the split has nothing in its column — **the design's degenerate case, and
   the panel says so.**
9. **Behaviour module.** **None.** **Edit-safe: yes** — Head sticky is CSS `position: sticky`, not a module. **JS off:** pixel-identical; the head stays beside the grid and sticks or does not exactly as drawn.
10. **A11y.** At Head Right, DOM order and visual order diverge; the head is always first in source.
    Head-column hairline `#332E27` in dark.

**Reconciled.** *Controls, eight:* Head side · Title · Head sticky · Posts per row · Excerpt · **Meta** (new — this design drew a meta row with nothing governing it; five values) · **Tag** · **"View all" link**. *Data:* Hand-picked; Count stepper **2–8**; `excerpt` binding; main-feed empty state and Pagination style. *Behaviour:* Head sticky is CSS `position: sticky`, not a module.

---

### 7 · Contrast Band

1. **Descriptor.** 1 Three Up inverted onto the `contrast` token at the band's own vertical scale.
2. **Tuple.** `grid-of-N · none · contrast · many · top · inverted band`
3. **Archetype.** grid-of-N. Band scale 64 · 88 · 120.
4. **Responsive.** As 1 Three Up. **Prints without its band** — the grid prints on white at the same cells, the same measure and the same rules ⚑ 29 August 2026.
5. **Fields.** As 1 Three Up.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Three · Four |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · ~~Three lines~~ **greyed at Per row Four**, with the reason at the control; falls to Two lines |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Background role (universal) | **Contrast (locked)** — the band is the design |
   | Vertical spacing (universal) | the band's own **64 · 88 · 120** |
   | Top divider (universal) | **Locked None** — a band brings its own top edge |
7. **Data.** As 1 Three Up.
8. **Empty.** Plate derived from the band, not the page.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the inversion is a token substitution. **JS off:** pixel-identical, band and all.
10. **A11y. Contrast computed on the band:** text `#FAF7F2` on `#232019` **15.21:1**; derived muted
    `#A8A29A` **6.42:1**; **Paper's own accent `#D96C3F` 4.77:1 — it passes AA on the band with no
    lift**; the lifted `#E8834F` **6.03:1**, headroom rather than a repair.
    **⚑ The finding this design exists to raise:** Paper clears AA by 0.27, and the other eleven
    packs' accents have never been measured on their own `contrast` ground. **A pack-level
    `accent-on-contrast` token settles it once**; deriving a lift by eye in each section spec does not.
    **Answered 3 September 2026:** the pack has one, and **`accent-on-contrast` and on-contrast text
    are COMPUTED** — this design reads them and derives nothing. The measurements above stand as
    measurements, and the `color-mix` derivation rule stays as the description of what the computed
    values do.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Three · Four |
   | Image ratio | Portrait · Square |
   | Scrim | Light · Standard · Heavy |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Background role (universal) | **Background (locked)** — the photographs are the ground |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the old Padding row, under the universal name) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 3 and 6; correct at 1–9.
8. **Empty.** **No image anywhere in the set → the image box and its scrim are not drawn** and each
   cell keeps its tag, title and meta; the panel may advise 9 Big Type ⚑ 29 August 2026. A single
   imageless post draws the plate with its title in `text`.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the scrim is a CSS gradient over a server-rendered image. **JS off:** pixel-identical; title, tag and meta stay legible over the scrim because the scrim is CSS.
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
   `feature_image`** — the only design in A17 that never touches the field, which is what makes it the design
   a site with no photographs picks ⚑ 29 August 2026.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Two · Three |
   | Title | Large · ~~Display~~ **greyed at Per row Three**, with the reason at the control; falls to Large |
   | Rule | None · Hairline |
   | Excerpt | Off · Two lines |
   | Meta | None · Date only · **Tag and date** · Tag, author and date |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   *The Display disable rests on the cell, not a line count: measured, a 69-character title wraps
   to four lines at both 48 and 40 in a 416 column, but 48 makes the block 20% taller for no gain,
   and 416 is 65% of the 636 the size was set for. Measured first lines at 636 hold 25–31
   characters.*
7. **Data.** Designed for 4 and 6; correct at 1–8, degrading **by taste rather than by layout**
   above that. **From about eight the panel suggests 10 Ledger — a suggestion, never a switch.**
   **Nothing hands off to it** ⚑ 29 August 2026 — 8, 11 and 18 hide their image boxes and their panels may advise this design; the user picks it.
8. **Empty.** Almost none — everything but tag and excerpt is Ghost-guaranteed. **A missing feature
   image is not an empty state here; it is why the design exists.**
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing runs. **JS off:** pixel-identical; the design is type and hairlines. `typewriter` considered and not declared — a title that types itself out is a link a reader cannot click until it finishes.
10. **A11y. ⚑ The DOM order departs from the card rule:** the tag moves after the title into the meta
    line, so a screen reader hears the headline first and its section second. **The fields are
    preserved; the tag's position within them is not.** **Recorded in the card's own DOM-order
    register, 3 September 2026** — one of the four exceptions, and the register is now the only place
    a departure may be declared; it is no longer a loose finding in this design's spec. Nothing on this
    design changes. An `<h3>` at 48 px is not a heading-level claim. Contrast 15.46 / 5.56 light, 15.64 / 6.89 dark.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | One · Two · Three |
   | Rows | Divided · Open |
   | Date | Right · Lead · Off |
   | Tag | On · Off |
   | Title | Standard · Small |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   **All six are density controls**, which no other design can say. *⚑ Measured: Title Small saves
   ~4% of a row's height (78 → 75) because the row is mostly padding and tag. Tag Off removes 20 px
   and Rows Open 13 more, taking a row to 45 — a 42% gain; all three together reach 42 px, 46%.
   Title is the weakest lever, and the sidebar note says so.*
7. **Data.** Designed for 8 and 12; **correct at 2–30 — the widest range in A17**, because a table
   improves with more rows. 1 post → one ruled row, **this design's weakest case, disclosed rather
   than special-cased.** From about sixteen the panel suggests Columns One.
8. **Empty.** No tag → the row is one line shorter; **rows are stretched by their tallest cell as
   everywhere in A17, so a missing tag shows as space at the row's foot, not a shorter row.**
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing sorts, filters or measures. **JS off:** pixel-identical; every row, its tag and its abbreviated date are server-rendered. **⚑ No sort control:** a table invites sorting by column and no module covers it; the honest fix is a third `order` value server-side.
10. **A11y. ⚑ It is a `<ul>` of `<li>`, not a `<table>`** — no column headers, no cell relationships;
    marking it up as a table would promise navigation that does not exist. The archetype names its
    responsive behaviour, not its markup. Abbreviated date is visual only; `<time datetime>` carries
    it in full. **⚑ Tabular figures are a pack requirement A17 cannot state** — a pack whose body
    font lacks them renders a ragged right edge; it degrades acceptably. **Answered 3 September 2026:
    tabular figures are a COMPUTED pack value**, supplied rather than hoped for; the degradation note
    stands only for a pack whose body font genuinely has none.

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
   heights without stagger. **It does not switch design**; the picker discloses it.
5. **Fields.** As 1 Three Up. **⚑ Uses `cycle`, not `ratio`.**
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three (changes every crop; **Four was removed on 24 August 2026** and the table is corrected to match the frame, the owner's ruling of 1 September 2026); **Three greys on the two-ratio cycle Landscape–Portrait**, with the reason at the control, and falls to Two |
   | Cycle | Portrait–Landscape–Square · Square–Landscape–Portrait · Landscape–Portrait |
   | Excerpt | Off · Two lines · Three lines |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   *⚑ Enumerated: two columns run the same sequence exactly when their index difference is a
   multiple of the cycle length. **So the column count must be no greater than the cycle length** —
   three ratios support three columns; **at four, columns one and four are identical.** Columns
   Four was therefore **removed on 24 August 2026** — the enumerated rule is enforced by the control
   and no fourth ratio was added. ⚑ 2 September 2026, *the panel is the authority*: **this paragraph
   was the last place in the document still saying the value was "left in place with a warning note;
   the architect should pick"**, which the frame has contradicted since 24 August and the control
   table since 1 September. **The paragraph is what was corrected; nothing drawn changed.***
7. **Data.** Designed for 9 and 12; correct at 5–15. **Below five the columns draw with what they have and the panel may advise 1 Three Up** ⚑ 29 August 2026.
   Columns end unevenly even at 9 in 3 — measured 74 px apart — **a property, not an empty state.**
8. **Empty.** Plate at the cell's dictated ratio. **No image anywhere in the set → the image boxes are not
   drawn**, and the panel may advise 9 Big Type because plates at mixed ratios read as holes in the
   page ⚑ 29 August 2026.
9. **Behaviour module.** **None — and this is where that claim is worth most**, because the layout it imitates normally cannot make it: three server-rendered lists and one `aspect-ratio` per cell via `:nth-child`. **Edit-safe: yes** — nothing measures and nothing packs. **JS off:** pixel-identical, diagonal included.
10. **A11y. ⚑ Three separate `<ul>`s, one per column** — a screen reader announces "list, 3 items"
    three times rather than "list, 9 items" once. **What it buys is that source order and visual
    order agree.** CSS `columns` fragments cells; one `<ul>` with grid placement would put the DOM in
    row-major order while the eye reads column-major. A finding for the architect.

**Reconciled.** *Controls, six:* Columns **Two · Three** · Cycle · Excerpt · **Meta** (now a select, four values including **With photograph** — a 416 cell carries the avatar and the cycle never narrows a column below it) · **Tag** · **"View all" link**. **Columns Four is removed** ⚑ — under the three-ratio cycle columns one and four run identical crop sequences, so the value drew a stagger that was not there; 3 Four Up exists and is cheaper than a fourth ratio. **Finding 4 is closed by removal**: column count ≤ cycle length is now enforced by the control rather than by a warning note. *Data:* Hand-picked; Count stepper **1–15**, disclosing the advice below five rather than clamping it.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Arrangement | Tall left · Tall right |
   | Excerpt | Off · Tall cell only · All cells |
   | Meta | None · Date only · Name and date · Name, date and reading time |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   **Four — the fewest in A17 and the brief's floor.** **No Image ratio control:** the three ratios
   pair the columns' photography — two wide cells and their gutter are 358 + 24 + 358 = **740 px
   against the tall image's 795**, a 55 px difference the right column absorbs because it carries
   two text blocks to the left's one. (The cell *boxes* are equal automatically; a row-spanning
   grid item is as tall as the rows it spans.)
7. **Data.** `limit` fixed at 5. **Under five → the cells with no post are not drawn and the panel
   may advise 2 Two Up. Over five → it draws the first five and may advise 1 Three Up**, because a site with twelve matching posts
   still wants its five-cell front page. **One piece of advice, one truncation** ⚑ 29 August 2026. 0 → does not render; the
   editor's outline is the most informative zero state in A17.
8. **Empty.** Plate at the cell's ratio; **the wide 636 × 358 plate is the least flattering in the
   category** and is drawn on both the light and dark frames. **No image on any post → no design switch**;
   five plates at three shapes still read as a bento. Not good, not broken.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the composition is `grid-template-columns`, explicit `grid-row` spans, `aspect-ratio` boxes and a `grid-column` swap for the mirror. **JS off:** pixel-identical; all five cells keep their sizes and their order.
10. **A11y.** One `<ul>` of five `<li>`s in query order, placed by explicit grid coordinates —
    **unlike 11 Masonry this design keeps a single list.** The tall cell's `<h3>` is not promoted.
    At Tall right, DOM and visual order diverge — the accepted cost of refusing `order`.
    **⚑ Two findings:** exactly five is unexpressible in the shared Show (3 · 6 · 9 · 12) — it needs
    a fifth value, a per-design Show, or the forced five specified here; and **`featured` cannot be the input**
    for "this post takes the tall cell" ⚑ 29 August 2026 — a Ghost template cannot look across a loop to
    find the flagged item — so the tall cell is the first post in the set's order and Order decides which.

**Reconciled.** *Controls, six:* Arrangement · Excerpt · **Meta** (now a select, four values including **With photograph** — every cell in the composition is 636 wide) · ~~**Tall cell**~~ **withdrawn 29 August 2026** · **Tag** · **"View all" link**. **Tall cell is withdrawn and the finding is closed by the platform rather than by a decision** ⚑ 29 August 2026: `featured` cannot be reached across a loop, so the tall cell is the first post in the set's order, one value is not a control, and the Featured post value is drawn struck through with its reason on the frame. *Data:* **Count locked at 5, drawn disabled with its reason** — the first finding, closed: this is exactly what the 3 · 6 · 9 · 12 enum could not express. Hand-picked is the one Source where the five cells are chosen by hand, in drag order.

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
   beside a thumbnail is two identifying images in one row). **⚑ Uses `thumbSize`, not `ratio`** —
   **one name, one set: Small · Medium · Large**, resolved here at 96 · 120 · 160 ⚑ 3 September 2026,
   *one control name means one set of values*.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | One · Two |
   | Thumbnail | Small 96 · Medium 120 · Large 160 |
   | Thumbnail side | Left · Right |
   | Excerpt | Off · **One line** · Two lines |
   | Meta | None · Date only · Name and date · Name, date and reading time (the only design where all four meta parts fit one line) |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   **No Image ratio — square is structural.** *160 is the ceiling: past about a quarter of the row
   an image stops being a thumbnail. 160 of 636 is 25.2%.*
7. **Data.** Designed for 8 and 12; correct at 1–24 — **second only to 10 Ledger's 2–30, and the
   wider of the two that keeps its photographs.** **No design switch and no count threshold** — one of
   three image-bearing designs with none, alongside 1 Three Up and 4 Cards.
8. **Empty.** **The smallest and least conspicuous plate in the category.** No image on any post →
   no design switch; a column of small plates beside titles is still a legible list.
9. **Behaviour module.** **None.** **Edit-safe: yes** — Thumbnail side Right is `row-reverse` and nothing else in the row moves. **JS off:** pixel-identical. `lightbox` considered and not declared — the whole row is a link to the post, and a 120 px thumbnail is not what a reader wants enlarged.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Four · Five · Six |
   | Image ratio | Landscape · Square (no Portrait, no Wide) |
   | Tag | On · **Off (default — the only design where it is)** |
   | Date | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   **⚑ No Excerpt control in any form — the only design in A17 without one**; a 196 px cell cannot
   hold legible body text. **No Meta enum** — there is no author or reading time to enumerate.
7. **Data.** Designed for 12 and 18; correct at 3–18. **1 or 2 posts is the weakest case by a
   distance** — the panel suggests a wider design rather than handing off. The orphan row is more
   conspicuous here than anywhere else; the counter names the divisors. **Above 18 the panel points
   at 16 Load More, not at A34.**
8. **Empty.** Plate at 196 × 131 with the tag at 11 px. **No image on any post → no design switch**; at
   this size a wall of plates is a texture rather than a series of holes.
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing runs. **JS off:** pixel-identical; a wall of 196 px cells is markup and one grid rule. **⚑ The thing a 196 px cell most wants is an excerpt on hover, and no module in the registry covers it — a finding, and I am not naming one.**
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Tags | **All site tags** · Chosen tags (From these posts deleted, 29 August 2026) |
   | Strip | Pills · Text |
   | Per row | Three · Four |
   | Image ratio | Landscape · Wide · Square · Portrait |
   | Excerpt | Off · Two lines · ~~Three lines~~ **greyed at Per row Four**, with the reason at the control; falls to Two lines |
   | ~~Feature~~ | not drawn — the panel draws no span control; the panel is the authority (see Patch notes) |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |
7. **Data.** Designed for 6 and 9; correct at 1–12. **The strip is Ghost's own tag list at All site
   tags and the authored list at Chosen tags** ⚑ 29 August 2026 — a template cannot compute a distinct
   set of tags across a loop, so a strip built from the posts actually drawn is not renderable at all.
   **A pill with no post behind it is therefore possible at both values, and the drawn "no posts for
   this tag" state is what answers it.**
8. **Empty.** No tags on the site, or none chosen → the strip is not rendered and the grid draws alone.
9. **Behaviour module.** **`filter-strip`.** **Edit-safe: yes** — the module **only marks the current pill**, at every width; the scrollable row below 767 is native CSS overflow with no script involved ⚑ 1 September 2026, the owner's ruling, *a design may declare the width below which its script runs* — **this design declares none**. It it adds, removes and reorders nothing the editor placed, and it opens nothing over the canvas. **JS off, quoted: "Filters are `<a href>` links to Ghost routes and work perfectly — this module needs JS least of all."** Every pill still navigates to its tag archive; the current pill loses its marked state and the strip below 767 scrolls natively.
10. **A11y.** The active pill uses the accent — **the third design to derive an on-accent label
    colour independently**, and **after 3 September 2026 it derives nothing: `accent-on-contrast` is a
    COMPUTED pack value and the pill reads it.** `#1A1712` on `#D96C3F` measures **6.63:1**; inactive pills 9.92:1 light.
    **⚑ Pills are 33 px tall — 11 px under the 44 px touch minimum, deliberately, as a dense
    secondary control.** Measured, not estimated. A finding rather than a defence.

**Reconciled.** *Controls, eight:* Tags *(two values after this pass)* · Strip style · "All" link · Per row · Excerpt · **Meta** (new; five values) · **Tag** *(the chip inside the cards, not the strip above them — two tags, two controls, and the panel says so)* · **"View all" link**. *Behaviour:* **`filter-strip` is navigation to Ghost's tag routes at every value** ⚑ — real `<a href>` links; the module marks the current pill and nothing else, the scrollable row below 767 being native overflow, and **any in-place filtering is dropped** because it promised a client-side subset the query never had. The "All" pill stays and points at the section's unfiltered route; **its label is a theme translation-catalog string** ⚑. *A11y:* **the pills keep their 33 px look and gain a 44 px hit area** — 5.5 px of transparent padding top and bottom, so the target passes without the strip growing. *Data:* Hand-picked, where the strip is still the site's tag list or the chosen list; Count stepper **1–12**.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Batch | **a number picker, 3–24, default 6** (mirrors Count; the number is the theme's `posts_per_page`, site-wide) |
   | Button | Outline · Solid · Text |
   | Count | On · Off |
   | Per row | Two · Three · Four · Six |
   | Excerpt | Off · Two lines · Three lines; **Three lines greys at Per row Four and the whole row greys at Per row Six**, with the reason at the control; falls to Two lines and to Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   **Cut: auto-load-on-scroll** — that is `infinite-scroll`, refused category-wide.
7. **Data.** **`source` is locked at This route's posts** ⚑ 29 August 2026 — load more is available only on the site's main feed. First batch server-rendered; subsequent batches fetched against the same query.
   Designed for 12–48 across two to four presses. **0 → no section and no button. 1 → one cell and
   no button. Fewer posts than the batch → no button**, the same rule as exhausted applied before the
   first press. **A34 is not used with this design.**
   **⚑ "Showing 6 of 12" counts the section's query, not the site** — a site with 400 matching posts
   shows "6 of 400"; Count Off exists for that, and capping the denominator would be a lie.
8. **Empty.** Nothing left to load → **the button is replaced by "That's all 12 posts." in the
   button's own position**, so the page does not jump. It does not grey out and stay.
9. **Behaviour module.** **`load-more`.** **Edit-safe: no** — it appends posts the editor did not place. **JS off, quoted: "Ghost's numbered `/page/2/` pagination links render instead (FR-G4, explicitly)."** The button is absent in that branch rather than inert, the count line and the exhausted line go with it, and the archive stays fully readable. **⚑ Persists nothing** — a reader who presses twice, follows a post and comes back lands on six again. ⚑ **This line corrects the earlier "Edit-safe" on this design**; see the module-declaration entry in Patch notes.
10. **A11y.** A real `<button>`. Appended cells join the same `<ul>`. **⚑ Focus stays on the button
    after a press and the new count is announced in a polite live region**; when the button is
    replaced, focus moves to the line. Button **45 px measured** at 1440 and 834, 49 px on a phone —
    above the 44 px minimum, by 1 px at the desktop widths.
    **⚑ The strongest form of the on-accent finding:** three designs in this category now derive an
    on-accent or on-contrast text colour independently (7, 15, 16). **A pack needs stated `on-accent`
    and `on-contrast` values.** **Answered 3 September 2026: it has them, and they are COMPUTED** —
    the three derivations become three readings and the finding is closed. Outline is the default partly because it is the one button style with
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Panel edge | Hairline · Fill only · Outline |
   | Inset | Compact 32 · Comfortable 56 · Spacious 80 |
   | Head | Inside · Outside |
   | Per row | Three · Four |
   | Excerpt | Off · Two lines · Three lines; **the whole row greys at Per row Four** — the panel's cells run 278–290 px at every Inset — with the reason at the control; falls to Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (80 at 834, 64 at 390) |
   | Top divider (universal) | None · Line · Fade |

   Five. ⚑ **The "no Padding control" absence is closed by this pass**: the universal **Vertical
   spacing** governs the page around the panel and **Inset** governs the panel's own edge, so the
   two are not indistinguishable in use after all — two ladders, two names, both honest. (Before
   the pass the section's vertical padding was fixed at Comfortable 96.) **Cut: panel radius and
   panel colour**, both of which break rule 1.
7. **Data.** Designed for 6 and 9; correct at 1–12. **0 → does not render, and an empty panel is the
   one zero state that would look deliberate, which is exactly why it must not.** **1 → a 1,296 px
   box holding one 378 px card is 70% empty surface — the weakest case**, and the panel suggests
   dropping the container. A34 attaches **below the panel, on the page ground.**
8. **Empty.** **⚑ The plate must derive from the panel it sits on rather than from the page** — in
   Paper light both resolve to `#F4F0E8`, but in a pack with a stronger surface step they differ.
   A context-dependence no other design exposes.
9. **Behaviour module.** **None.** **Edit-safe: yes** — the panel is a container, not a behaviour. **JS off:** pixel-identical; the full-bleed band below 767 is a media query.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Per row | Two · Three · Four |
   | Image ratio | Landscape · Square · Portrait (no restriction at any count — the only unrestricted ratio control in A17) |
   | Text | Under · Over |
   | Scrim | Light · Standard · Heavy — **the whole row greys at Text Under**, with the reason at the control (there is nothing for the wash to sit behind) |
   | Head | Inset · Edge |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (vertical only, there being no page margin to set) |
   | Top divider (universal) | **Locked None** |

   **Cut: a gutter control and a radius control**, each of which would undo the design.
7. **Data.** Designed for 3, 6, 9; correct at 1–12. **The orphan row costs more here than anywhere
   else** — a full-bleed row one third full leaves 960 px of empty page. The counter advises 3, 6 or
   9 and does not enforce. **Under three it does not hand off** — an image touching the screen's edge
   is still recognisably this design.
8. **Empty.** **A full-cell 480 × 320 plate, the most damaging in A17** — no radius and no gutter, so
   it shares an edge with the photograph beside it and reads as a gap in the band.
   **No image on any post → the image boxes are not drawn and the captions keep their cells**; the panel may advise 9 Big Type ⚑ 29 August 2026.
   **⚑ Recorded: the case for hiding the image boxes when *any* single post lacks an image is stronger
   here than anywhere else.** Kept at "every post" for consistency with 8 Overlay and 11 Masonry; the
   inconsistency is recorded rather than resolved alone.
9. **Behaviour module.** **None.** **Edit-safe: yes** — nothing runs. **JS off:** pixel-identical; the band, its zero gutter and its scrim at Text Over are CSS. `lightbox` considered and not declared — a full-bleed picture is the most tempting place for it in A17 and the cell is already a link to the post.
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
| **Post card** | Image, tag, title, excerpt, meta in fixed DOM order; whole card is one `<a>`; heading-font title, never clamped; no plane of its own. **Its exceptions live in the card: a four-design DOM-order register and one truncation, A18·3** ⚑ 3 September 2026 | **A17** |
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
| **Author initial** | **One letter** in a circle at the pack's hover surface, for a missing `profile_image` ⚑ 29 August 2026 — Ghost gives a theme one initial from an author's name and never two. A list the user types themselves keeps two initials, and A17 has no such list | A12 |
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
| **Avatar in the meta row** | The 24 px `profile_image` as the Meta enum's fifth value, **the one-letter initial** as fallback | A19 |

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
**stored by all eighteen and read by none** ⚑ 29 August 2026 · `visibility` **read and never drawn** (A32's).

**Ghost-owned, never inline-editable.** Every field in this paragraph is read from the post and
clicking it in the editor says **"Edit in Ghost"** ⚑ — titles, tags, author names, excerpts and
dates alike.

**Per-design image field — answered 3 September 2026.** Fourteen designs use `ratio`, 11 Masonry uses
`cycle`, 13 Thumb Side uses `thumbSize`. **They stay three fields**, under *one control name means one
set of values*: the collision that ruling forbids is one name carrying several value sets, not several
names each carrying one. A named ratio, a repeating cycle and a fixed pixel size are three different
controls, and a single polymorphic field would honour neither of the other two's values on a design
switch — which is the cost the old question was worried about, and it is unavoidable rather than
caused by the naming. **`thumbSize`'s one set is Small · Medium · Large**, resolved at 96 · 120 · 160
here.

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
- **9 Big Type's DOM order** (old finding 8) — **closed as a loose finding on 3 September 2026** and
  **registered in the post card** instead: it is one of the card's four DOM-order exceptions, and the
  register in the card's definition is now the only place a departure may be declared. The design is
  unchanged, and its Meta enum is still the only place its tag can be governed, which is why it is the
  one design with no Tag row.

### Still open

*Marked again on 3 September 2026. An item answered by this pass is struck through with the answer and
its date; the answers are facts that already existed elsewhere in the project rather than decisions
made here.*

1. ~~**A pack-level `on-accent` and `on-contrast` text colour.** Three designs (7, 15, 16) derive one
   independently. The strongest finding in the category.~~ **Answered 3 September 2026: every Style
   Pack value is marked COMPUTED or AUTHORED, and on-contrast text, accent-on-contrast, dark
   elevation, dark hover-surface and tabular figures are all COMPUTED.** The three derivations become
   three readings; no colour on any frame changes.
2. ~~**One image field or three?** `ratio` / `cycle` / `thumbSize` — see Block 2.~~ **Answered
   3 September 2026 by *one control name means one set of values*:** three names each carrying one set
   is what the ruling asks for; one name carrying three sets is what it forbids. They stay three
   fields.
3. ~~**12 Bento needs a count of five**, which the shared Show cannot express.~~ **Closed by the
   reconciliation pass, 24 August 2026** — listed as closed above and left in place here until now;
   struck on 3 September 2026 as housekeeping.
4. ~~**11 Masonry's Columns Four repeats a column** under the default three-ratio cycle.~~ **Closed by
   removal, 24 August 2026**; struck here on 3 September 2026 as housekeeping.
5. ~~**`custom_excerpt` only** — no generated-excerpt fallback anywhere in A17.~~ **Closed by the
   reconciliation pass, 24 August 2026** — cells bind `excerpt`; struck here on 3 September 2026 as
   housekeeping.
6. **No module covers an excerpt on hover** (14 Dense) or a client-side sort (10 Ledger). Both are
   named as gaps rather than given invented module names. **10 Ledger's gap now carries a second
   reason:** a third `order` value would give one name two value sets, which *one control name means
   one set of values* forbids.
   **OPEN FOR THE OWNER**
7. ~~**Tabular figures are a pack requirement A17 cannot state** (10 Ledger).~~ **Answered
   3 September 2026: tabular figures are a COMPUTED pack value.**
8. ~~**9 Big Type moves the tag after the title in the DOM** — the one departure from the card's
   promised field order.~~ **Answered 3 September 2026 by *the card's exceptions belong in the card*:**
   it is one of four registered departures, written into the card's definition; and it was never the
   only one.
9. **18 Edge to Edge's focus ring must invert to an inset offset on edge cells.**
   **OPEN FOR THE OWNER**
10. **18 Edge to Edge's squared image** is a departure from the pack's radius token.
    **OPEN FOR THE OWNER**
11. ~~**`postRefs` needs an ordering contract in the schema.**~~ **Answered — ruled 2 September 2026:**
    references are held in the order the user dragged them and handed to the template that way, never
    re-sorted by date. The schema half stands as the builder's work, not as an open decision.
12. **The theme translation catalogue now has A17 entries** — 15 Filtered's "All" pill, 16 Load
    More's count and exhausted lines. A17 previously shipped no catalog string at all.
13. ~~**The main feed needs to be *designated*.**~~ **Answered 3 September 2026: exactly one section
    per page is designated the main feed and the project file stores which one.** A design is told
    rather than working it out, which is what makes the empty state and the pagination select
    conditional and 16 Load More's locked Source meaningful.

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


---

## Patch notes — post grids patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named and never numbered: the letter-and-number labels elsewhere in this project are filing codes and
say nothing about what a rule requires.

**Frames updated — all nineteen.** `A17-0 Category Proof` and every design frame `A17-1` … `A17-18`.
Each design frame gained a **POST GRIDS PATCH** card stating in one line each what changed on that
frame and which rule required it; where a rule had no subject on a frame, the card says so rather
than staying silent.

**What was redrawn, and what was not.** Three drawn things changed: **16 Load More's Batch row** is a
number picker where it drew four fixed buttons, **16 Load More's Source row** is a locked value with
its reason and the five greyed values beside it, and **12 Bento's Tall cell** is drawn with its
Featured post value struck through and the row withdrawn. **15 Filtered's strip caption and default**
were relabelled to All site tags. **The avatar circle on `A17-0` and `A17-1` reads `N` where it read
`NA`.** Nothing else moved: no layout, type scale, colour pack, spacing value or drawn state anywhere
in the category, and **no design number changed**.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **The first post spans, not the first featured post** *(the owner's ruling, 29 August 2026)* | **Settlement 3 is rewritten.** A template can test the flag on each post and can fetch flagged posts with a second query; what it cannot do is tell which flagged post is the first inside one loop. Given the choice between a two-query "featured leads" and a one-query positional span, **the owner ruled position only**: one query, the same behaviour on a placed section and on the main feed. The span goes to **the first post the query returns**; the row is drawn **First cell: Off · Spans two columns** with the note "position, not the featured flag"; **a grid of featured posts is still available at Source: Featured only**. Consequences, design by design: **5 Lead + Grid's lead is the first post in the set's order** and its "unprompted promotion" is gone with the flag; **12 Bento's Tall cell loses its Featured post value and with it the control** — one value is not a control — and the finding that the flag was "the natural input" is closed by the platform rather than by a decision; **4 Cards' line saying it reads the flag and draws it as an ordinary card is withdrawn**; **`featured` is now stored by all eighteen designs and read by none**, in the shared field list and on every frame. |
| **No design ever turns into another design** | **Every hand-off in A17 is deleted — there were nine.** 8 Overlay, 11 Masonry, 18 Edge to Edge and 5 Lead + Grid no longer become 9 Big Type when a set has no photographs: **the image box is not drawn** (8 Overlay's scrim with it), each cell keeps its tag, title and meta, and **the panel may advise 9 Big Type**. 11 Masonry under five posts **draws the columns it can fill** and may advise 1 Three Up; 12 Bento under five **draws the cells it has** and may advise 2 Two Up. **7 Contrast Band no longer "prints as 1 Three Up"**: the band is not printed and the grid prints on white at the same cells, measure and rules, so the design loses its ground rather than its identity. **9 Big Type stops being "A17's receiving design"** — it is the design a site with no photographs chooses. The roster's **HANDS OFF** column is now **WHAT IT ADVISES**, and the "two receiving designs" paragraph is replaced by the rule. Every remaining cross-reference in the category was checked and is advice: 9 Big Type suggesting 10 Ledger past eight, 14 Dense pointing at 16 Load More past eighteen, 2 Two Up pointing at 1 Three Up past eight, 17 Panel suggesting the container be dropped at one post. Advice, never a switch. |
| **The filtered strip cannot list the drawn posts' tags** | **15 Filtered's Tags value "From these posts" is deleted.** A Ghost template cannot compute a distinct set across a loop. The values are **All site tags**, now the default, and **Chosen tags**. Three consequences are written rather than hidden: the primary frame's strip is Ghost's own tag list, **a dead pill is possible at both values** (the drawn "no posts for this tag" state already answered it), and the cut count-per-pill argument is restated — on a site-wide list a count is a second query per pill. |
| **Load more is main-feed-only** | **16 Load More's `source` is locked at This route's posts**, the other five values drawn greyed with the reason beside them: elsewhere in a page there is no page 2 to load. **The two rows those values fed — Tag or author, and the Hand-picked post picker — are drawn greyed and marked not applicable on this design**, rather than removed, so the Data group stays the same group in all eighteen. Settlement 4 carries the line, and **A34's Load more pagination value appears only on the designated main feed**. Pagination style stays locked at Load more on this design. A site that wants this arrangement elsewhere uses 1 Three Up. |
| **Avatars with no photograph** | **One letter, never two, for an author drawn from Ghost.** Ghost cannot produce two initials from a name. The avatar circle on `A17-0` and `A17-1` reads **N** for Naomi Alder where it read NA; **every "initials block" in the category now reads "one-letter initial"**, in all nineteen frames and in the component inventory. The two-initial fallback stays where the user types the list themselves, and **A17 has no such list** — every name here comes from Ghost. |
| **Item counts are a number picker** | **16 Load More's Batch becomes a number picker — 3–24, default 6** — where it drew Three · Six · Nine · Twelve. Count was already a stepper everywhere with per-design bounds drawn disabled and their reasons visible. The row also now discloses what the owner ruled in the post lists category on 28 August 2026: **the batch is the theme's `posts_per_page`**, which lives in the theme package rather than in Ghost's admin and is **site-wide**, so changing it changes every paginated list on the site. **Two rows were checked and left as named values:** every design's **Per row** and 11 Masonry's **Columns** are drawn column widths — each value a measured cell checked against a long title — not a number of posts. Recorded rather than decided, as the same question was in the post lists and about-and-team categories. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all eighteen. The swatch row is **Base**; **there is no "Inherit" value anywhere in A17**; no design renames a shared control or adds a value to one; and every narrowing shows its reason — 7 Contrast Band's Background role locked at Contrast and Top divider locked None, 8 Overlay's Background role locked at Background and its two-value Image ratio, 18 Edge to Edge's Top divider locked None, 3 Four Up's Excerpt without Three lines, 12 Bento's locked Count of 5, and now **15 Filtered's two-value Tags** and **16 Load More's locked Source**. **One rename is made and it is category-wide, not per design:** the span row is **First cell** everywhere it appears, because a row called Feature that no longer reads the featured flag is a control that lies. ⚑ The label is put to the owner as question 2. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs that do not depend on the customer having good photography — **1 Three Up · 10 Ledger · 9 Big Type · 13 Thumb Side · 4 Cards** — recommended 1 Three Up and 10 Ledger, and **the owner ruled 1 Three Up and 4 Cards on 29 August 2026**. Badged **[Free] — confirmed** on the proof frame's roster and written in §0 as the line the merge reads: **`**[Free] designs:** 1 Three Up · 4 Cards`**. |
| **The Remove button never greys out** | **No subject, and nothing to fix.** Nothing in A17 is authored as a repeating list: there is no repeater, no Add that creates a post and no Remove that deletes one. The post picker at Source: Hand-picked has no minimum — remove is visible and clickable at every count, and removing the last reference empties the set. |
| **Slider labels** | **No subject.** A17 draws no slider. Every control is a named-value row or a number picker whose title says what it affects — Per row, Image ratio, Excerpt, Meta, Inset, Thumbnail, Batch. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A17 has no gap control: the 24 px gutter and the 48 px row gap are the grid rather than a preference, and 18 Edge to Edge's gutterless band is the design. The ladders that do exist are padding — Vertical spacing and 17 Panel's Inset — and both use the standard padding words. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** Every action in A17 is navigation: a card, the head link, 15 Filtered's tag pills, 16 Load More's button. There is no subscribe button, no paid tier and no Portal link, so there is nothing to make conditional. Member visibility is offered nowhere, and that refusal keeps its reason in §0. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A17 contains no subscribe or sign-in form, so there is nothing for the notice to replace, and the category never promised one worked without JavaScript. The per-design no-JavaScript line is restated instead: **sixteen designs are pixel-identical with script off**, **15 Filtered's strip is real `<a href>` links and needs JavaScript least of all**, and **16 Load More renders Ghost's numbered `/page/2/` links in place of its button**. No post is lost in any of the eighteen. The sent, error and loading states elsewhere in the library are untouched. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16 · 17 · 18.** Eighteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Conflicts recorded rather than resolved

- **Which designs carry the span row.** Settlement 3 names **1, 3, 4, 11, 15 and 16**; the drawn
  panels of **4 Cards, 11 Masonry, 15 Filtered and 16 Load More** carry no span control at all, and
  three of them say in prose that they deliberately do not. **The document's own rule is that the
  panel is the authority**, which would make the row **1 Three Up and 3 Four Up only**. Recorded here
  and on the four frames rather than deleted from the settlement, because the count "five designs
  offer it" is quoted in the roster and in the proof frame's own prose.
- **The span row's label.** "Feature" was the name of a control that read the featured flag. It is drawn
  as **First cell** in both panels that carry it, **confirmed with the positional ruling on 29 August
  2026**: the row enlarges the first post in the grid and says so.
- **12 Bento's Tall cell.** The patch's ruling removes the row's only second value. Withdrawing the
  row is the honest consequence, but it undoes a control the previous pass added on purpose. Recorded
  as a change of ruling rather than a drawing error.
- **The batch and the theme package.** Making the batch a number picker is straightforward; the number
  it writes is a value in the theme's `package.json` rather than a section setting, and the path from
  a section control to a theme-package value is still the architect's to specify.

### Open questions for the architect

*Marked item by item, 1 September 2026. A settled item is struck through with who settled it; a live
one carries **OPEN FOR THE OWNER** on its own line. **Nothing here was answered in the housekeeping.***

1. **Carried forward.** The pack-level `on-accent` / `on-contrast` derivation (three independent
   derivations in this category), one image field or three (`ratio` / `cycle` / `thumbSize`), tabular
   figures as a pack requirement, 9 Big Type's tag after the title in the DOM, 18 Edge to Edge's inset
   focus ring and its squared image, the two new catalogue strings, and **the main feed needing to be
   *designated*** — which this pass leans on harder than the last one, because 16 Load More's locked
   Source is only meaningful if the builder knows which section is the feed.
   **OPEN FOR THE OWNER**
2. ~~`postRefs` needs an ordering contract.~~ **Settled in this document by the reconciliation pass,
   24 August 2026**, and unchanged since: the Data group states **drag order = drawn order**, and
   5 Lead + Grid states that the first pick takes the lead cell.
3. ~~11 Masonry's Columns Four.~~ **Settled by the reconciliation pass, 24 August 2026** — closed by
   removal; column count ≤ cycle length is enforced by the control. *(~~The design's control table still
   prints the value; the disagreement between table and Reconciled paragraph is recorded in Patch
   notes — pass two rather than resolved there.~~ **The table was corrected on 1 September 2026 and the
   enumerated paragraph on 2 September 2026; table, paragraph and frame now agree.**)*
4. ~~12 Bento's count of five.~~ **Settled by the reconciliation pass, 24 August 2026** — Count is one
   stepper and this design's is locked at 5, drawn disabled with its reason.
5. ~~12 Bento's unused `featured` input.~~ **Settled by the design patch pass, 29 August 2026, on the
   platform's authority** — a Ghost template cannot look across a loop, so the flag is unreachable and
   the tall cell is the first post in the set's order.
6. ~~15 Filtered's "All" pill and its dead-filter state.~~ **Settled by the design patch pass,
   29 August 2026**, in the same sentence that raised it: both are drawn, neither needs a module, and
   the "All" pill points at the section's unfiltered route.
7. ~~The three excerpt narrowings on non-standard cell ladders — 4 Cards, 6 Split Head, 17 Panel — and
   whether 15 Filtered's `filter-strip` does anything below 767 that CSS does not.~~ **Settled by the
   owner, 1 September 2026:** the excerpt floor measures the text column, so all three grey; and the
   strip's scroll is native CSS, so the module declares no width. Applied to the frames and the
   control tables.
8. **The conflict pass two will not choose:** a switched-off control is never hidden, and the Data
   group hides the main feed's pair because **P0·5** does.
   **OPEN FOR THE OWNER**

### Module declarations added — 31 August 2026

**Every design in this category now carries a Behaviour module line at field 9** naming its script or
declaring none, stating whether it is edit-safe, and saying what a visitor sees with JavaScript
switched off. The category stated its two modules in §0 and in prose; **it did not declare them per
design in a form the build can read**, and a script mentioned in a sentence is not the same as a
script a design depends on. **No frame changed and no design changed. Field 9 was relabelled from
Module to Behaviour module and nothing was renumbered.**

| # | Design | Declared |
|---|---|---|
| 1 | Three Up | **None** · edit-safe: yes · JS off: pixel-identical |
| 2 | Two Up | **None** · edit-safe: yes · JS off: pixel-identical |
| 3 | Four Up | **None** · edit-safe: yes · JS off: pixel-identical |
| 4 | Cards | **None** · edit-safe: yes, the hover lift is a CSS transition · JS off: pixel-identical |
| 5 | Lead + Grid | **None** · edit-safe: yes · JS off: pixel-identical, lead cell included |
| 6 | Split Head | **None** · edit-safe: yes, Head sticky is CSS `position: sticky` · JS off: pixel-identical |
| 7 | Contrast Band | **None** · edit-safe: yes · JS off: pixel-identical |
| 8 | Overlay | **None** · edit-safe: yes, the scrim is a CSS gradient · JS off: pixel-identical |
| 9 | Big Type | **None** · edit-safe: yes · JS off: pixel-identical; `typewriter` considered and not declared |
| 10 | Ledger | **None** · edit-safe: yes · JS off: pixel-identical; the sort gap stays a gap |
| 11 | Masonry | **None** · edit-safe: yes, nothing measures and nothing packs · JS off: pixel-identical, diagonal included |
| 12 | Bento | **None** · edit-safe: yes · JS off: pixel-identical |
| 13 | Thumb Side | **None** · edit-safe: yes · JS off: pixel-identical; `lightbox` considered and not declared |
| 14 | Dense | **None** · edit-safe: yes · JS off: pixel-identical; the excerpt-on-hover gap stays unnamed |
| 15 | Filtered | **`filter-strip`** · **edit-safe: yes** — it marks the current pill and nothing else, and adds, removes or reorders nothing the editor placed · JS off: every pill still navigates to its tag archive as an `<a href>`; the current pill loses its marked state and the strip scrolls natively below 767 |
| 16 | Load More | **`load-more`** · **edit-safe: no** — it appends posts the editor did not place · JS off: Ghost's own numbered `/page/2/` links render in place of the button, which is absent rather than inert, so the archive is still fully readable |

**Sixteen declare none and two declare a script**, which is what §0 already said; the count is now
readable design by design rather than only in the category's prose. **No name outside the registry
was used**, no deleted name appears anywhere in this document, and **`infinite-scroll` stays refused
category-wide**. The two gaps the category records — an excerpt on hover at 14 Dense and a
client-side sort at 10 Ledger — are still named and unowned, and no module was invented for either.

**One correction, recorded rather than buried.** 16 Load More's field 9 read **"Edit-safe"**. It is
now **edit-safe: no**: the module appends posts the editor did not place, which is exactly what the
edit-safe test asks about. The design's other statements are unchanged, including that the module
persists nothing between visits.

**Numbering.** Unchanged — **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18**:
eighteen designs, no gap created or closed, no number reused, nothing added, removed or renumbered.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
   17, 18** — eighteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present** at the head of this document, on its own line, in the
   required shape, and names **1 Three Up** and **4 Cards** — both of which exist in this category's
   roster. It is **the owner's own choice, ruled on 29 August 2026**.

### Questions for the owner

**QUESTION 1 — Which two of the eighteen post grids are free? — ANSWERED 29 AUGUST 2026: 1 Three Up and 4 Cards (option 2).**

Exactly two designs in this category are free for customers on the free plan. My shortlist is the
five that look finished on a site with no professional photographs:

1. **1 Three Up and 10 Ledger. (RECOMMENDED)**
   Three Up is what a site gets when it types "posts" — the plainest grid in the category, and it
   fills a missing picture with the post's tag rather than a hole. Ledger draws no pictures at all: a
   ruled two-column list of titles and dates, which is what an archive page wants. A free customer
   gets one design for a front page and one for an archive. Cost: the free tier shows no photography
   at all in Ledger, so a picture-led site will feel the paywall sooner.
2. **1 Three Up and 4 Cards.**
   Both are picture grids, and Cards puts each post on its own panel with a hairline, which flatters a
   thin set of posts. Cost: a free customer has no picture-free option, so a site with no photographs
   has nothing here that looks finished.
3. **1 Three Up and 13 Thumb Side.**
   Thumb Side keeps a small square picture beside each title, so it survives poor photography and
   stays a list. Cost: it is the least distinctive of the three pairs — two designs that both look
   like a list of posts.

**QUESTION 2 — ANSWERED 29 AUGUST 2026: position only — the first post in the grid spans (option 3). The row keeps the label `First cell`.**

*What Ghost can and cannot do, precisely.* A template **can** test the flag on each post inside a loop
— `{{#if featured}}` is documented and works — and it **can** reach the flagged posts directly with a
second query, `{{#get "posts" filter="featured:true" limit="1"}}`, excluding that post from the main
query with `filter="id:-{{id}}"`. What it **cannot** do is, inside one loop, know *which* flagged post
is the first one: there is no counter and no access to the previous item. So "the first featured post
spans, and everything else keeps the query's order" is the only form that is genuinely
unimplementable. **The blanket statement written earlier in this pass was too strong**: the choice
between "the flagged post leads, fetched by a second query" and "the first post leads, by position" is
a design decision rather than a platform limit. **It was put back to the owner and he ruled position
only on 29 August 2026** — the first post in the grid spans, one query, the same behaviour on a placed
section and on the main feed, and the editor chooses which post leads with Order or by hand-picking.
The frames as drawn are correct and were not redrawn. The row keeps the label **First cell**, which is
now the honest name for what it does.

**QUESTION 2 — What should the row that spans the first post be called, and what should it read?**

The row used to be called **Feature** because it used the "featured" tick on a post. It cannot do
that any more: Ghost's page templates cannot look through a list of posts and find which one is
ticked. The row now simply makes **the first post in the grid twice as wide**.

1. **"First cell" — Off · Spans two columns. (RECOMMENDED)**
   It says exactly what it does and cannot be mistaken for the featured tick. An editor who wants a
   grid of ticked posts sets the source to Featured, which is a different row.
2. **Keep "Feature" — Off · First cell spans two.**
   Nothing to relearn for anyone who has seen the old panel, and the word matches what publishers
   call a featured story. Cost: it names the tick it no longer reads, so an editor who ticks a post
   and sees nothing change has been told a lie by the control.
3. **"Lead post" — Off · Twice as wide.**
   Warmest of the three and closest to how an editor talks. Cost: "lead" is 5 Lead + Grid's name, so
   two different things in the picker would be called the lead.

**QUESTION 3 — When a set of posts has no pictures at all, should the grid say so? — ANSWERED 29 AUGUST 2026: a quiet line of advice (option 1).**

Four of these designs are built around photography. If not one post in the set has a picture, they now
draw the words only — the picture box is not drawn at all — and the editor's panel suggests the design
built for text. Nothing changes on the live site either way; the question is what the editor is told.

1. **The panel suggests the text design, and the live site just shows the words. (RECOMMENDED)**
   The visitor sees a clean grid of titles; the editor sees one line of advice and decides. Cost: an
   editor who never opens the panel never learns why the design looks plainer than the picker showed.
2. **The panel says nothing.**
   Quietest, and the drawing is still correct. Cost: the editor is left to work out on their own that
   the pictures are missing rather than broken.
3. **The editor sees a warning, not a suggestion.**
   Hardest to miss. Cost: a warning implies something is wrong, and a site that simply does not use
   photographs would be scolded on every page.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Behaviour declared, design by design.** Every design in this category already carried a **Behaviour module** line at field 9 naming its script in backticks or stating **None**, saying whether it is edit-safe, and saying concretely what a visitor with JavaScript off sees. The lines were re-read design by design in this pass and confirmed; **nothing was added, renamed or removed**, and no script outside the registry is named anywhere in the category.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** eighteen designs, numbered **1–18**.

---

## Patch notes — pass two, 1 September 2026

Every change carries the **name** of the rule that required it. **Frames updated:** all eighteen
design frames (`A17-1` … `A17-18`) and the proof frame `A17-0`, each gaining a **PASS TWO PATCH**
block naming, for that design, what changed and the rule behind it; **`A17-0`, `A17-1`, `A17-3`,
`A17-7`, `A17-8`, `A17-9`, `A17-11`, `A17-12`, `A17-15`, `A17-16` and `A17-18` also gain the greyed
rows drawn** in P0's treatment, and the eleven designs that offer **With photograph** gain the drawn
one-letter avatar with its reason. **Nothing was renumbered, renamed, redrawn or deleted; no control
was added or removed; no value changed; no default changed; no layout, type scale, colour pack or
spacing step moved.**

### What changed, and the rule that required it

1. **Order greys at Source: Hand-picked in all eighteen** — *a control switched off by another is
   greyed, with the reason beside it*. The row was already switched off and the document already said
   so; what was missing is the half of the rule that matters in use — the sentence at the control
   ("not available while posts are hand-picked: your drag order is the order") and a row that is
   greyed rather than left accepting a value the query will not honour. **Drawn on `A17-0`.**
2. **Eight per-design narrowings are now drawn greyed with their reason** — *a control switched off by
   another is greyed, with the reason beside it*. **1 Three Up** (Excerpt: Three lines at Per row
   Four) and **9 Big Type** (Title: Display at Per row Three) had the narrowing written as
   "unavailable" and were resolving it silently. **7 Contrast Band** and **15 Filtered** inherit
   1 Three Up's 306 px cell and inherit its narrowing; both were still accepting three lines.
   **3 Four Up** (Excerpt at Per row Five, a 240 px cell) and **16 Load More** (Three lines at Per row
   Four, the whole row at Per row Six, a 196 px cell) were accepting an excerpt at widths the
   category floor already says draws none — *the floor's rule, applied, not a new one*.
   **11 Masonry** greys **Columns: Three** on the two-ratio cycle, which is the design's own
   enumerated rule (column count ≤ cycle length) enforced in the direction that was still open.
   **18 Edge to Edge** greys the whole **Scrim** row at Text Under, where the wash has nothing to sit
   behind — the dependency was written last pass and the row was still live at both values of Text.
   **Every fallback is the value the design already resolved to; no new value, no new control, no
   changed default.**
3. **The locked rows are restated as drawn, not hidden** — *a control switched off by another is
   greyed, with the reason beside it*, its neighbouring case. 7 at Background role Contrast, 8 at
   Background, 7 and 18 at Top divider None, 12 at Count 5, 16 at Source This route's posts and at
   A34's Pagination style Load more. **A lock by the design is not a switch by another control**, and
   both are drawn with a reason. Nothing about them changed.
4. **One letter, never two, across the eleven Meta designs** — *avatars with no photograph show
   initials, and the two forms are not interchangeable*. **1, 2, 4, 5, 6, 11, 12, 15, 16, 17 and 18**
   offer **With photograph**; every byline they draw comes from Ghost, so a missing `profile_image`
   draws **one** initial. The rule was applied to `A17-0` and `A17-1` on 29 August and is now stated
   at the control on all eleven, with the drawn circle reading **N** for Naomi Alder. **The other
   seven refuse the value with the reason already at the control** — 3 (a 306 px cell), 7 (a
   photograph cannot be colour-mixed onto the band), 8 (an avatar inside a scrimmed caption), 9 (never
   touches `feature_image`), 13 (two identifying images in one row), 10 and 14 (no author at any
   setting). **No two-initial avatar exists anywhere in A17 and none may be introduced.**
5. **No design declares a width below which its script runs** — *a design may declare the width below
   which its script runs*. Sixteen declare no module; `filter-strip` and `load-more` both run at every
   width, and both no-JavaScript lines already read at every width. **Nothing was declared, because
   declaring one would be a decision rather than a record** — see the open question on 15 Filtered.
6. **Open questions marked item by item** — housekeeping. Five items were settled elsewhere in this
   document and are struck through with who settled them; three are live and each carries **OPEN FOR
   THE OWNER** on its own line. **Nothing was answered in the housekeeping.**
7. **Nothing was renumbered and no design was deleted.** Eighteen designs, 1 to 18.

### Rules and facts checked, design by design

| Rule or fact (by name) | Where it lands in A17 |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **The pass's whole subject.** Every case is listed in **The disabled-control pattern** in the category layer: the universal Order row, eight per-design narrowings and six locks. **The rule's one exception is claimed nowhere in A17** — no control here is one the project can never offer, so nothing is left undrawn. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **Eleven designs carry the value and all eleven show one letter**; seven refuse it with a stated reason. Ghost supplies every byline in the category, so the two-initial form is unreachable and is used nowhere. |
| **The Remove button never greys out** | **No subject, and nothing to fix.** A17 authors no list: no Add creates a post, no Remove deletes one. The post picker at Hand-picked has an ✕ on every row, no floor, and removing the last reference leaves the section unrendered on the site and outlined in the editor. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No row changed, in either direction.** Per row, Columns, Arrangement, Cycle, Strip, Button and the rest are named values with a drawn frame behind each; Count and 16's Batch count items. The category's one conversion — 16's Batch, from four fixed buttons to a picker — was made on 29 August and meets the rule's test. |
| **A design may declare the width below which its script runs** | **None does.** Two modules, both running at every width, both no-JavaScript lines reading at every width. 15 Filtered's below-767 strip is an open question, not a declaration. |
| **Ghost's templates cannot count, add, or remember** | **Unchanged by this pass, and re-checked.** The span follows the first post's position, 12 Bento's tall cell likewise, 15's strip is Ghost's tag list or an authored one, 16's count line is composed from the query. No arithmetic was introduced. |
| **CSS cannot see content** | **Re-checked, nothing withdrawn.** The greying added here is editor state — the panel knowing another control's value — not a stylesheet measuring content. Excerpts still clamp by line without reading their length. |
| **Some fields we drew do not exist** | **Unchanged.** A17 reads `title`, `url`, `published_at`, `primary_author`, `primary_tag`, `excerpt`, `feature_image` and `reading_time`, and nothing this pass touched adds a field. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere in A17.** These are placeable sections whose markup this project owns; a post's body is A25's and A33's surface. |
| **The feature-image caption renders differently on the two Ghost versions** | **No subject, and worth one line for a builder.** No A17 design draws a feature image's caption: the card reads `feature_image` and its alt text, and the paragraph under a title is `excerpt`. **The difference cannot reach this category**, and no design may start reading a caption without inheriting it. |
| **A comment count renders nothing at all without JavaScript** | **No subject.** A17 reads no comment count, ships no comment noun in its translation catalogue and puts no accessible label on a number. |
| **The two free designs are the owner's choice** | **Unchanged: 1 Three Up and 4 Cards**, ruled 29 August 2026, both present in the roster. |

### The conflict this pass will not choose

**Rule A says a control switched off by another is greyed and never hidden. A17's Data group hides the
main feed's pair — Pagination style and the empty-state heading and body — at every Source except
This route's posts, and it hides them because P0·5 does.** The hiding is caused by another control, so
the rule reaches it; it cannot be greyed without redesigning P0·5, which this pass is instructed not to
do. **Listed here rather than resolved**, and no A17 panel was changed on account of it.

### Open questions raised by this pass

1. ~~**4 Cards, at Per row Four.** The card's own padding takes the text column under the 306 px the
   excerpt floor is written against, so **Excerpt: Three lines may be a value this design cannot
   honour**. Greying it means deciding that a padded cell counts as its outer width or its inner one,
   which is a decision.~~ **Settled by the owner, 1 September 2026** — the floor measures the inner
   width; the greyed row is drawn on `A17-4`. *Restated by the owner on 2 September 2026, and the
   restatement's own example sentence conflicts with the category floor — listed in Patch notes —
   pass three rather than chosen.*
2. ~~**6 Split Head, at Per row Three.** The grid column divides 856 into cells of about 269 px — under
   the floor's 306 — so Excerpt may offer lines the design does not draw. The floor was written for the
   1,296 divisions and this design does not use them.~~ **Settled by the owner, 1 September 2026** —
   same test, same treatment; the greyed row is drawn on `A17-6`.
3. ~~**17 Panel, at Per row Four.** The panel's cells are *(width − 2·inset − 48) / 3*, giving about
   278–290 px at every Inset, again under 306. Same question, on a ladder this design invented.~~
   **Settled by the owner, 1 September 2026** — same test, same treatment; the greyed row is drawn on
   `A17-17`.
4. ~~**15 Filtered, below 767.** The design's no-JavaScript line says the strip **scrolls natively**;
   its reconciliation paragraph says the module **manages** that scroll. If the module does nothing
   there that CSS does not, the design declares no width; if it does, the width is 768 and the
   no-JavaScript line must read on both sides of it.~~ **Settled by the owner, 1 September 2026** —
   the scroll is native CSS, so **the design declares no width** and the no-JavaScript line stands.
5. ~~**11 Masonry's control table still prints Columns Four** while the Reconciled paragraph says the
   value was removed on 24 August. **Recorded, not resolved** — the frame is the authority and this
   pass was not asked to change a value.~~ **Settled by the owner, 1 September 2026** and finished on
   **2 September 2026**: the table dropped the value then, the enumerated paragraph now.

### Left alone deliberately

**Two things were edited outside this environment and are untouched here.** **No printed design total
was reintroduced** anywhere in this document or on any A17 frame — nothing in the category quotes a
library size, and the count-agnostic copy stands. **P0's per-prop mark allowlist is not rewritten,
softened or dropped**: the default inline marks, a field's right to narrow that set, and a disallowed
mark being **absent** from the toolbar rather than greyed, all stand as written. **One thing was left
because it may be deliberate**: 11 Masonry's control table keeps its Columns Four cell, listed above
as an open question rather than edited out. *(Superseded: the table was corrected on 1 September 2026
and the enumerated paragraph on 2 September 2026, both under the owner's ruling — see Patch notes —
pass three.)*

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
   17, 18** — eighteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present** at the head of this document, on its own line, and
   names **1 Three Up** and **4 Cards** — both of which exist in this category's roster of eighteen.

---

## The owner's rulings — 1 September 2026

Five, all applied above; each carries the rule that governs it.

1. **The excerpt floor measures the text column, not the outer cell** — *a control switched off by
   another is greyed, with the reason beside it*. **4 Cards** greys Excerpt at Per row Four (a 306 px
   card with 20 px padding leaves 264), **6 Split Head** at Per row Three (856 in three is 269), and
   **17 Panel** at Per row Four (278–290 at every Inset). All three fall to **Off** and return one
   count wider. One test, three designs, and no new value or default anywhere.
   *Recorded alongside it:* 4 Cards at Per row Three leaves a 374 px column, between the floor's two
   named widths of 306 and 416; **its values are unchanged there**, and nothing in this ruling touches
   the two-lines-or-three question at intermediate widths.
2. **15 Filtered's `filter-strip` only marks the current pill** — *a design may declare the width
   below which its script runs*. The strip's horizontal scroll below 767 is native CSS overflow, so
   **the design declares no width** and its no-JavaScript line, already true at every width, stands
   unchanged. The contradicting half-sentence in the reconciliation paragraph is corrected.
3. **11 Masonry's control table drops Columns Four** — bookkeeping under *the panel is the authority*.
   The frame has said the value was removed since 24 August; the written table was still printing it.
   **No value on the frame changed**, and no fourth ratio was added.
4. **Nothing else moved.** No control was added, removed or renamed; no default changed; no layout,
   type scale, colour pack or spacing step moved; **the numbering is 1–18, unchanged**.
5. **Frames updated by these rulings:** `A17-4`, `A17-6`, `A17-15`, `A17-17` — each gaining the drawn
   greyed row or the corrected behaviour line — and `A17-11`, which records the written table's
   correction without changing anything drawn.

---

## Patch notes — pass three, 2 September 2026

Every change carries the **name** of the rule that required it. **Two work-list items arrived and
both had already landed in this document and on its frames on 1 September 2026, under the same two
rulings.** They were re-read design by design and confirmed rather than re-applied; what was still
outstanding was one stale paragraph and the bookkeeping around it. **Nothing was renumbered, renamed,
redrawn or deleted; no control was added or removed; no value changed; no default changed; no layout,
type scale, colour pack or spacing step moved.**

**Frames updated:** `A17-11` only, which gains a **PASS THREE RECORD** block. **Nothing drawn on it
changed** — it has drawn **Columns Two · Three** since 24 August. `A17-4`, `A17-6` and `A17-17`
already carry the drawn greyed **Excerpt** row with its reason at the control, and `A17-15` already
carries the corrected behaviour line; all four were checked and left exactly as drawn.

### What changed, and the rule that required it

1. **11 Masonry's enumerated paragraph now agrees with the frame** — *the panel is the authority*.
   **Which of the two was wrong, and which was corrected: the writing.** The frame draws a two-value
   Columns control and its note reads "Four was removed in this pass"; the control table was corrected
   to match on 1 September 2026; **the enumerated ⚑ paragraph under that table was the last place in
   the document still reading "Columns Four is therefore a real gap … left in place with a warning
   note; the architect should pick."** That sentence is replaced with what the frame does — the value
   was removed on 24 August, the rule *column count ≤ cycle length* is enforced by the control, and no
   fourth ratio was added. **No value on any frame changed and no fourth ratio exists.**
2. **Two stale cross-references struck** — housekeeping under the same rule. The Reconciled open
   question "the design's control table still prints the value" and pass two's "left because it may be
   deliberate" both described a disagreement that no longer exists; each is struck through with the
   date it was closed.
3. **Pass two's five open questions are marked settled** — housekeeping. Items 1, 2, 3 and 5 carry
   **Settled by the owner, 1 September 2026**; item 4 the same. **Nothing was answered in the
   housekeeping**, and item 1 additionally records the conflict below.
4. **No design total appears anywhere in this document or on any A17 frame.** Nothing authored in this
   pass quotes a library size, and no A17 copy string counts designs.

### The five rules of this pass, checked against A17

| Rule (by name) | Where it lands in A17 |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Eleven cases, all drawn, none hidden** — the universal Order row, eight per-design narrowings and the three the width-floor ruling added. Unchanged by this pass. The rule's **one exception** is claimed nowhere in A17: no control here is one this project can never offer. The **conflict** with P0·5's hiding of the main feed's pair stands as recorded in pass two, unresolved and unchanged. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **Unchanged.** Eleven designs offer **With photograph** and all eleven draw **one letter**; the other seven refuse the value with the reason already at the control. **No two-initial avatar exists in A17** — every byline comes from Ghost — and none may be introduced. |
| **The Remove button never greys out** | **No subject.** A17 authors no list. The post picker at Source: Hand-picked has an ✕ on every row, no floor, and removing the last reference leaves the section unrendered and outlined in the editor. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No row changed, in either direction.** Per row, Columns, Cycle, Arrangement, Thumbnail, Strip and Button are named values with a drawn frame behind each; Count and 16 Load More's Batch count items. |
| **A design may declare the width below which its script runs** | **None does**, and this is now settled rather than open: two modules, `filter-strip` and `load-more`, both run at every width, and both no-JavaScript lines already read at every width. 15 Filtered's below-767 scroll is native CSS overflow, so **no width is declared** and no no-JavaScript line needed a second half. |

### The conflict this pass will not choose

***Closed on 3 September 2026, on the floor's side — see Patch notes — pass four. The record below is
left as written.***

**The width-floor ruling's example sentence and the category floor disagree about what a text column
under 306 px may draw.** The ruling as restated on 2 September asks that "the excerpt value the design
cannot draw" be greyed and offers the sentence *"at four across this card's text column is 290 px;
three lines needs 306"* — which reads as **Three lines greyed, falling to Two lines**. The category
floor in §"The shared floor" and the disabled-control table say the opposite twice: **at exactly 306
Three lines is already refused and falls to Two** (1 Three Up, 7 Contrast Band, 15 Filtered), and
**below 306 no excerpt is drawn at all** (3 Four Up at 240 falls to Off). On that floor a 264, 269 or
290 px column greys **the whole Excerpt row**, which is what was drawn on `A17-4`, `A17-6` and
`A17-17` on 1 September and what the table records. **Both readings cannot hold: either the floor's
two tiers move, or the example sentence's numbers do.** **The frames are left as drawn and nothing is
chosen here.** **OPEN FOR THE OWNER**

### Left alone deliberately

**The two repository-maintained pieces are untouched**, as asked: no design total was written into any
copy authored here, and **P0's per-prop mark allowlist is not rewritten, softened or dropped**.
**The greyed Excerpt treatment on 4 Cards, 6 Split Head and 17 Panel is left exactly as drawn** —
whole row, falling to Off, with the 264 / 269 / 278–290 px reason at the control — because changing it
to a single greyed value would decide the conflict above. **The 1 September rulings' own record is not
rewritten**: its dates stand as the dates the work landed.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
   17, 18** — eighteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present** at the head of this document, on its own line, and
   names **1 Three Up** and **4 Cards** — both of which exist in this category's roster of eighteen.


---

## Patch notes — pass four, 3 September 2026

Every change carries the **name** of the rule or ruling that required it. **Three work-list items, and
none of them changes a drawing.** **Frames updated:** all eighteen design frames (`A17-1` … `A17-18`)
and the proof frame `A17-0`, each gaining a **PASS FOUR PATCH** block naming, for that design, what was
ruled and what was written in; **`A17-0` additionally has one sentence of prose corrected** on the post
card panel, where "a design never re-orders the parts" now points at the card's DOM-order register.
**No section frame was redrawn, no panel row was added, removed, renamed or greyed, no value changed,
no default changed, nothing was renumbered or deleted, and no layout, type scale, colour pack or
spacing step moved.**

### What changed, and the rule that required it

1. **The post card's exceptions are written into the card** — *the card's exceptions belong in the
   card*. **A17 is where the card is defined** and A18, A19, A20, A21 and A27 inherit it whole, so its
   exceptions belong in its own definition rather than in the specs of the designs that make them.
   Two sets, both now in **The post card**: the **DOM-order register** — **A17·9 Big Type** (tag after
   the title, into the meta line), **A18·4 Dated** and **A18·13 Timeline** (date, tag, title, excerpt,
   author) and **A18·9 Big Type** (title, then tag), each with its reason — and the **one truncation
   exception**, **A18·3 Slim**, written into the promise itself: the title *wraps, never clamped, never
   truncated, with one exception*, whose clip is `nowrap` + ellipsis with the full string in the DOM, as
   the link's accessible name and as what is indexed, and no `title` attribute. **The register is
   closed:** a design not named in it may not depart, and a new departure is added there or nowhere.
   **Nothing about any design changes** — A17·9's A11y note now points at the register instead of
   raising a finding, and the component inventory's Post card row carries the same pointer. This closes
   A18's findings 5 and 6 and this document's finding 8.
2. **One control name means one set of values** — *the owner's ruling, 3 September 2026*. A new
   category-layer section states it: **the set is the list of value names**, and a design states what
   those names resolve to in its own geometry. **`order` is Newest first · Oldest first, and two is the
   whole set**, identical in all eighteen. **`thumbSize` is Small · Medium · Large**, resolved
   96 · 120 · 160 at 13 Thumb Side; a control that can also be switched *off* is a different control
   and takes a different name. **`rowDensity` has no subject in A17** — no design writes it, and the
   density rows that exist (10 Ledger's five, 17 Panel's Inset, the universal Vertical spacing) are
   named differently on purpose; checked so that A17 does not become another set under the name.
   **`ratio` / `cycle` / `thumbSize` stay three fields**, which is what the ruling asks for: the
   collision it forbids is one name carrying several sets. **What A17 gives up:** **10 Ledger may not
   coin the third `order` value** its A11y note wanted for a server-side sort, so **the sort gap keeps
   its absence and gains a reason**. **No control was renamed and no drawn value changed.** A18's five
   `rowDensity` ladders, its **Off**-bearing `thumbSize` set and its **Title A–Z** third `order` value
   are named here as the rows to reconcile **in A18's pass**, against the set declared here; this pass
   does not edit another category's designs.
3. **The excerpt floor is exclusive, and nothing here reads the other way** — *a control switched off
   by another is greyed, with the reason beside it*. The two tiers are now stated once, in **The
   disabled-control pattern**: **three lines needs a text column above 306 px**, so **at exactly 306
   three lines is refused and falls to two** (1 Three Up, 7 Contrast Band, 15 Filtered at Per row Four)
   and **below 306 no excerpt is drawn at all** (3 Four Up at 240 → Off; 4 Cards at 264, 6 Split Head at
   269, 17 Panel at 278–290 → the whole row greys). **The conflict pass three recorded is closed on the
   floor's side**, the earlier instruction's example having been corrected centrally; **the pass-three
   entry is left as written with a closing note above it**, and **no frame changed** — every greyed row
   was already drawn at the floor's reading.
4. **The pack's contrast colours and its tabular figures are COMPUTED** — *an answer that already
   existed*. Every Style Pack value is marked **COMPUTED** or **AUTHORED**; on-contrast text,
   accent-on-contrast, dark elevation, dark hover-surface and tabular figures are all **COMPUTED**.
   Written into the shared floor and into the three designs that were deriving values for themselves:
   **7 Contrast Band** reads the token and its `color-mix` rule now describes what the computed value
   does rather than how a section arrives at one, **15 Filtered's** active pill reads it, **16 Load
   More's** Solid button reads it, and **10 Ledger's** tabular figures are supplied rather than hoped
   for. **Findings 1 and 7 are answered**, and **no colour, contrast measurement or drawn value
   changes.**
5. **The main feed is designated, and the project file stores which section it is** — *an answer that
   already existed*. Written into the Data group. A design is told rather than working it out, which is
   what makes the empty state and the pagination select conditional and what makes 16 Load More's
   locked Source meaningful. **Finding 13 is answered.**
6. **A dependency is declared in the control's own definition and carries its reason** — *a control
   switched off by another is greyed, with the reason beside it*. Written into **The disabled-control
   pattern**: the panel, the checker and the compiler read one source, and **no A17 design hand-draws
   the relationship**. The eleven cases are unchanged; what changes is that they are declarations
   rather than eleven drawings that happen to agree.
7. **Hand-picked references keep the order they were dragged** — *ruled 2 September 2026*. The Data
   group already said drag order is drawn order; it now carries the ruling and its date, and the reason
   Order is greyed in that path rather than quietly ignored. **Finding 11 is answered.**
8. **A design may declare more than one behaviour module** — *an answer that already existed*. **No
   subject in A17:** sixteen designs declare none and two declare one each, `filter-strip` at
   15 Filtered and `load-more` at 16 Load More. Recorded so the category is not read as needing a
   ruling it never asked for.
9. **Three findings that had been closed elsewhere in this document were still printed as open** —
   housekeeping. 12 Bento's count of five, 11 Masonry's Columns Four and the `custom_excerpt`-only
   binding are struck in the **Still open** list with the dates they were closed. **Nothing was
   answered in the housekeeping.**
10. **Nothing was renumbered and no design was deleted.** Eighteen designs, 1 to 18.

### The five rules of this pass, checked design by design

| Rule (by name) | Where it lands in A17 |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Eleven cases, all drawn, none hidden** — the universal Order row, eight per-design narrowings and the three the width-floor ruling added. **Two things are added and neither is a greying:** the dependency is **declared in the control's own definition** with its reason, and the excerpt floor's two tiers are stated once and exclusively. **The rule's one exception is claimed nowhere in A17** — no control here is one this project can never offer, and the pinned-colour-scheme case has no subject in this category. **The conflict with P0·5's hiding of the main feed's pair stands, unresolved and unchanged.** |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **Unchanged, re-checked on all eighteen.** Eleven designs offer **With photograph** — 1, 2, 4, 5, 6, 11, 12, 15, 16, 17, 18 — and all eleven draw **one letter**, every byline coming from Ghost; the other seven refuse the value with the reason already at the control. **No two-initial avatar exists in A17 and none may be introduced.** A17 has no list the user types, so the two-initial form has no home here. |
| **The Remove button never greys out** | **No subject, and nothing to fix.** A17 authors no list: no Add creates a post, no Remove deletes one. The post picker at Source: Hand-picked has an ✕ on every row, no floor, and removing the last reference leaves the section unrendered on the site and outlined in the editor. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No row changed, in either direction** — and the ruling above reinforces it: Per row, Columns, Cycle, Arrangement, Thumbnail, Strip and Button are named sets with a drawn frame behind every value, and each of those names now owns exactly one set. **Count and 16 Load More's Batch count items and stay pickers.** |
| **A design may declare the width below which its script runs** | **None does**, unchanged and settled since pass three. Two modules, `filter-strip` and `load-more`, both run at every width, and both no-JavaScript lines already read at every width; 15 Filtered's below-767 scroll is native CSS overflow. |

### Open questions raised by this pass

1. **Does a differing *quantity* under a shared value name count as a second set?** The ruling says one
   name owns one set of values, and this document reads the set as **the list of value names**, with
   each design stating what they resolve to in its own geometry — the way Vertical spacing has always
   worked. On that reading **13 Thumb Side's Small · Medium · Large at 96 · 120 · 160 is compliant**,
   and so is A18·2's identical set at 96 · 144 · 200 in a row twice as wide. **On the stricter reading,
   in which the quantities are the set, one of the two must move or take a new name** — and moving
   13 Thumb Side to a full-width row's sizes would put a 200 px picture in a 636 px row, which is not a
   thumbnail. **Nothing was changed on this account.**
   **OPEN FOR THE OWNER**
2. **A18's three collisions are named here and reconciled there.** `rowDensity` with five quantity
   ladders, `thumbSize` with an **Off**-bearing set, and **Title A–Z** as a third `order` value at
   A18·14 Index. The ruling's own words — *some designs lose a value they had* — point at the outlier
   losing rather than at the shared set growing, but **which value goes is A18's decision on A18's
   designs**, and this pass was asked for A17. **No A18 file was edited.**
   **OPEN FOR THE OWNER**
3. **The pass-two conflict is unchanged by the dependency answer.** A control switched off by another
   is greyed and never hidden, and **A17's Data group hides the main feed's pair because P0·5 does**.
   Knowing *where* the dependency is declared does not decide whether P0·5 greys instead of hiding, and
   this pass may not redesign P0·5. **Still listed, still unresolved.**
   **OPEN FOR THE OWNER**

### Left alone deliberately

**The two repository-maintained pieces are untouched, as asked.** **No design total was written
anywhere** — not in this document, not on any of the nineteen frames, in any form; nothing here quotes
a library size. **P0's per-prop mark allowlist is not rewritten, softened or dropped.** Beyond those:
**the pass-three conflict entry is left as written**, with a closing note above it rather than an edit
through it, because its record of what was believed on 2 September is what makes the correction
legible; **the 1 September rulings keep their own dates**; **no A18, A19, A20, A21 or A27 file was
touched**, though this pass writes their inherited card's exceptions down; and **the greyed Excerpt
treatment on 4 Cards, 6 Split Head and 17 Panel stays exactly as drawn** — whole row, falling to Off,
with the 264 / 269 / 278–290 px reason at the control — which is now the floor's confirmed reading
rather than a held position.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16,
   17, 18** — eighteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present** at the head of this document, on its own line, and
   names **1 Three Up** and **4 Cards** — both of which exist in this category's roster of eighteen.
