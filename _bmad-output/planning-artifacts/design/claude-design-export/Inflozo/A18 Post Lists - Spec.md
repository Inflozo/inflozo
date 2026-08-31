# A18 Post Lists — written specification

15 designs · Paper pack · drawn 22 August 2026

**Controls-reconciliation patch — 25 August 2026.** The category was audited, design by design,
against the PRD's control vocabulary and Ghost's verified data surface, thinking like a user editing
their own site. This revision reuses the shared editor primitives from **P0 · Editor primitives** by
name — the **P0·1** inline text toolbar with its link popover, the **P0·2** icon slot and Icon
Picker, the **P0·3** item controls, the **P0·4** member-aware action editor, the **P0·5**
"Populate from…" data panel and the **P0·6** editor state switcher — and never redraws them.
Six rules now sit on every design: the universal trio outside each control list, the **Data group**
in place of the Posts block (Hand-picked in Source, **Count as a stepper**, the main feed's empty
state and its pagination select, `excerpt` as the excerpt's binding), **Tag Show · Hide** where the
tag eyebrow had no way off, the **"View all" link** target, inline-editable head strings against
Ghost-owned post content, and **no fixed English visitor-facing string**. What each design gained is
in a **Reconciled** paragraph at the foot of its entry, and the frame-by-frame list is in
**Reconciliation notes** at the end.

**Post lists patch — 28 August 2026.** The ten library-wide rules were applied to the category, and
three category-specific rulings landed with them: **the grouped list needs a small script** (Ghost's
templates cannot tell that the month changed between two posts), **the numbered list restarts at 01
on every page** (Ghost cannot continue a count across pages) and **"load more" is main-feed-only**
(removed from every other placement). The category's two hand-offs are deleted, 7 Contrast Band's
print rule no longer names another design, and 15 Load More's Batch size is a number rather than two
fixed buttons. **Nothing was renumbered.**

**[Free] designs:** 1 Rows · 3 Slim

*(Shortlisted, recommended and **confirmed by the owner on 28 August 2026**.)*

The frames are `A18-0 Category Proof.dc.html` and `A18-1` … `A18-15`. **Where this file and a
drawn panel disagree, the panel is the authority** — it is the thing that was designed; this is the
thing that was written down. Every invented decision is marked ⚑ here and on the frame.

---

## 0 · The category layer

### What A18 is

Fifteen arrangements of a post as a row. **The user does not author the set**: no repeater, no Add
that creates a post, no Remove that deletes one, no per-post styling anywhere in the category. The
section is handed a query, Ghost answers it, and the designs draw whatever comes back. **One
amendment from this pass:** at **Source: Hand-picked** the user *chooses and orders* posts through a
Ghost-aware post picker, storing references — **picking is not authoring**, and every refusal above
still holds.

**A17 is inherited whole.** The post card, the tag plate, the Data group, A6's focus ring, A1's
section head and meta row, A10's cell divisions and A8's split layout are used here without change.
What A18 adds is the row: **a grid divides a page, and a list has to decide what one post does with
a whole page width.**

### The four settlements (§8)

**1 · Density and separators.** **Row density is a second control beside the universal Vertical
spacing** ⚑ amended — a list has two spacings, the space around it and the space inside it, and the
per-design **Padding** row was the first of those under another name. It is gone from all fifteen
panels. Names are shared, quantities are not: **16 · 24 · 36** on an ordinary row, **44 · 56 · 72**
on 3 Slim, **20 · 28 · 40** on 9 Big Type and 13 Timeline, **12 · 16 · 24** on 14 Index, card
padding **16 · 24 · 32** on 8 Row Cards. Where a ladder is genuinely different it keeps a distinct
name: 8 Row Cards' card padding stays **Row density**, and 7 Contrast Band's **80 · 96 · 132** is
Vertical spacing's own resolution rather than a second row. **Separators are one vocabulary of
three — Off · Between rows · Boxed** — defaulting to Between rows in eleven designs. **Boxed is
never a default** ⚑: a list that closes itself top and bottom is a table, and A17·10 Ledger is where
a site should go for one. **Three designs have no Rule control** — 8 Row Cards (a plane),
13 Timeline (a rail), 12 Panel (a container, and only two Rule values). **The smallest readable row
is 44 px** ⚑, drawn by 3 Slim at Compact and by 14 Index without a date: A1's touch-target minimum,
because a row that is a link should not be smaller than a button. It breaks the 8 px grid and the
touch floor wins.

**2 · The thumbnail.** **Nine of the fifteen draw no image at all** and are by construction immune
to a missing one. **Three put it at the leading edge** — 2 Thumb Rows (96 · 144 · 200),
15 Load More (Off · 96 · 160), 10 Lead and List on its lead only. **One puts it at the trailing
edge, and only because it has a card to bound it** — 8 Row Cards (Off · 112 · 160). **Every list
thumbnail is sized rather than proportioned** ⚑, so it costs the same pixels at every width.
**⚑ Amended: the shape is a control now** — **Thumbnail shape Landscape 3:2 · Square 1:1** on
2 Thumb Rows, 8 Row Cards and 15 Load More, because a square thumb is the commonest list pattern on
the web and the fixed-size argument holds for both shapes. **The tag plate follows the shape.**
**No A18 design stacks its picture above its title at any width.**

**3 · Grouping.** **One design groups: 5 Grouped** — Month · Year · Tag · Nothing, **derived from
the data, never authored**. **⚑ Amended in this pass: the grouping needs a small script.** Ghost's
templates cannot tell that the month changed between two posts — no arithmetic, and no access to the
previous item inside a loop — so the design **declares `group-headings`** and **renders flat and
ungrouped without JavaScript**: every post present, in the set's order, **each row with its own date**, **no
group heading and no group date at all** and no group gap or empty space where one would have been —
the owner's ruling, 28 August 2026. That state is drawn on the frame and stated at the design's Group by row. The heading is **the eyebrow at one weight step up** (13 px, uppercase,
`.08em`, muted, 600), sitting **above its group with 40 px over and 14 under**, or hung left in a
200 px column. **Rules run inside a group and stop at its end.** **A row never repeats what its
heading says** ⚑ — under a month heading the date renders "12 Mar", under a tag heading the row's
own tag is dropped. **Untagged posts fall into a final group headed "Everything else"** ⚑, never
"Untagged" — and **⚑ amended: that heading is the authored field `otherGroupLabel`**, default kept,
≤ 26 characters, inline-editable, because no fixed English visitor-facing string ships. **Month and
year headings render through Ghost's `{{date}}` with the site's locale**, never English literals.
Two designs group without a heading — 4 Dated by a column, 13 Timeline by a rail — and both are
structural claims rather than settings of 5 Grouped.

**4 · Zero, one and many.** **Zero published → the section does not render**: no head, no empty
list, no placeholder, no sample post, and for 7 Contrast Band and 12 Panel the band and the panel go
with it. **⚑ Amended for one case:** at **Source: This route's posts** on a paginated template the
section is **the designated main feed** and renders **an authored empty state** — "Nothing here yet"
over "There are no posts on this page yet. Try the archive." — because **an empty tag archive must
render a page, not nothing**. Every other Source keeps the old rule. **Zero in the editor →** the
list's outline at three rows plus one line naming the query ("No posts tagged Reporting. This
section will not appear on the site.") ⚑. **One post → every design draws one row and none
apologises**, but they are not equally composed: 8 Row Cards and 9 Big Type are strong at one;
4 Dated and 2 Thumb Rows are fine; **3 Slim, 11 Numbered, 12 Panel, 13 Timeline and 14 Index are
weak** and each says so in its panel without switching design. **One item with a group heading keeps
its heading** — §8's named case: a month with one post in it is a fact about the site, and a grouped
list exists to show exactly that.

**⚑ Closed in this pass: Count is one stepper, 1–100, with per-design bounds.** The old ladder —
A18's 5 · 10 · 15 · 25 against A17's 3 · 6 · 9 · 12 — was the category's first finding, and a
stepper answers it rather than a second enum: **a list's count is chosen by how much page the site
wants to spend**, and four values could not say seven. **The per-design bounds are the truth and
1–100 is only the widest of them** — 3 Slim and 14 Index reach 30; 2 Thumb Rows, 6 Split Head,
8 Row Cards and 12 Panel stop at 15; 10 Lead and List starts at 2 and 15 Load More at 5; and
**9 Big Type carries no maximum below the category's**, because its standing warning does that work.
Locks are drawn disabled with their reason. **⚑ One design still changes what Count means:**
15 Load More draws Batch and treats Count as the total the reader can reach.

**Pagination.** No A18 design draws page numbers, a next link or a range — **A34 attaches below, on
the page ground, and the section boundary is the seam** ⚑. One exception: 15 Load More, and
**⚑ amended in this pass: that design is main-feed-only.** Its button walks Ghost's route
pagination, so it may only be placed as the route's own feed — `source` is locked at This route's
posts with the reason drawn, the other five values greyed beside it — and a site that wants a
thumbnail list elsewhere uses 2 Thumb Rows. **⚑ Amended:
on the main feed pagination is a control on the feed** — at Source: This route's posts the Data group
carries **A34's Pagination style** (Numbered · Newer and older · Load more · None) on that section's
own sidebar, and **15 Load More locks it at Load more**, because that design *is* the continuation
and two mechanisms on one feed is a bug. **`infinite-scroll` is refused category-wide.**

### The shared floor

- **The universal trio, outside every design's control list.** **Background role** (Background ·
  Surface · Contrast), **Vertical spacing** (Compact 64 · Comfortable 96 · Spacious 132; 80 at 834;
  64 at 390) and **Top divider** (None · Line · Fade). **Every design's old Padding row was Vertical
  spacing under another name and is gone.** 7 Contrast Band's 80 · 96 · 132 is kept as *this row's
  resolution*, not as a second row; **Background role is locked at Contrast** there, and **Top
  divider locked None**, each with the reason drawn. 12 Panel's 48 px inset stays **fixed and is not
  a control** ⚑ — the dividers stop at it, and a second ladder would move them.
- **The row.** Content width 1,296 at a 72 px page margin. **Text held to an 820 px measure; meta
  hung at the right in a 200 px column, right-aligned**; the space between them is never drawn.
  820 is A17's 780 head measure plus one 40 px step ⚑; 200 is the width of
  "26 February 2026 · 9 min read" at 13 px and is identical in every design that hangs one.
- **Type.** Title 22 heading font · 21 at 834 · 19 at 390. Excerpt 16/1.6 muted, clamped by line.
  Eyebrow 13 uppercase tracked. Meta 13. **Titles wrap and are never clipped — one exception,
  3 Slim**, which clips visually and keeps the whole string in the DOM.
- **Head** eyebrow · title on 620 · sub 17 · note 13 under the list · link 20 under the note.
  **Title ladder: Small 28 (9 Big Type) · Medium 34 (thirteen designs) · Large 40 (6 Split Head).**
  **Every head string edits inline** with the P0·1 toolbar; `linkLabel` and `linkUrl` stay a pair,
  and **the link's target is Matches the query · Custom**, the Link Picker setting the custom value.
- **The tag eyebrow is governed by Tag: Show · Hide** on the eleven designs that drew it with no way
  off — 1, 2, 4, 6, 7, 8, 10, 11, 12, 13, 15. Excepted: 3 Slim (Trailing governs it), 9 Big Type
  (the Meta enum carries it, after A17·9), 14 Index (Detail governs it), 5 Grouped (Group by governs
  it at Tag; the Month and Year gap is recorded in the Reconciliation notes).
- **The meta row** is the four-value enum everywhere it exists — None · Date only · Name and date ·
  Name, date and reading time. **A17's fifth value, With photograph, does not cross into A18** ⚑:
  `profile_image` is read by no design here, and a 24 px circle beside a hung date or a thumbnail is
  a second identifying object in one row. **12 Panel's fixed meta is withdrawn** and takes the enum.
- **Order is a rule, never a sequence:** Newest first · Oldest first, **disabled at Hand-picked**,
  where the drag order is the order. **⚑ 14 Index adds a third value, Title A–Z**, server-side
  `title asc`. **`shuffle` is declared nowhere** ⚑; three designs depend on a date order, and both
  date values are one.
- **Responsive floor.** **Nine designs hang something at the right edge at 1440 and all nine drop it
  under the title at 834**, into A17's meta row unchanged. **Reading time leaves the meta below 767
  in every design; the date never does.** Multi-column designs step down one rung per breakpoint and
  reach one column at 767.
- **The card.** A17's, verbatim: DOM order image → tag → title → excerpt → meta; the whole row is
  the link; no fill, border, shadow or radius; hover a 2 px accent underline at 160 ms; focus A6's
  ring on the whole row. **The excerpt binds `excerpt`** ⚑ — the custom excerpt where one is
  authored, Ghost's generated plaintext otherwise, clamped by line as designed; `custom_excerpt`-only
  survives where a design **frames** the excerpt, and **nothing in A18 frames one**. **Three
  departures, each flagged:** 4 Dated and 13 Timeline put the date first; 9 Big Type moves the tag
  into the meta, after A17·9.
- **Two exceptions to "no plane":** 8 Row Cards (per-post plane, and A17·4's hover lift) and
  12 Panel (one plane for the section). **Both lose their shadow in dark and are measurably weaker
  there.**
- **Dark.** Ground deepens, surfaces lift one step, plate `#2A251E`, hairlines `#332E27` — A17's
  measured symmetric step (9.1 points below the light ground, 9.8 above the dark one). **A18 is the
  harder test:** 14 Index draws eighteen hairlines on one screen, 3 Slim ten at 44 px apart.
- **Accent** is spent twice a section — hover underline and focus ring. **Two designs spend a third,
  both as controls:** 7 Contrast Band's lifted accent, 15 Load More's Solid button. **A tag, a
  numeral and a timeline marker are never accent.**
- **Behaviour.** **Two modules in the category** ⚑ amended — `group-headings` (5 Grouped, new in
  this pass) and `load-more` (15 Load More); `core` assumed, never declared per design. On the
  main feed the **Pagination style** row may call `load-more` — the registry's, never a new name.
  **No A18 design loses a post without JavaScript**, **thirteen are pixel-identical with it off**,
  and the two that are not say so on their frames: 5 Grouped renders flat and ungrouped, 15 Load
  More renders Ghost's numbered `/page/2/` links in place of its button. **No registry addition is
  needed and no module name was invented**; `infinite-scroll` stays refused category-wide.
- **Structure.** `<section aria-labelledby>` → `<h2>`; `<ul>` of `<li>`; **each title an `<h3>`**;
  dates `<time datetime>`; plate `aria-hidden`. **Two departures:** 11 Numbered is an `<ol>` — the
  only one in the library — and 5 Grouped makes each heading an `<h3>` and steps its titles to
  `<h4>`.
- **Print.** Every design prints as drawn except two, and neither becomes another design ⚑ amended:
  **7 Contrast Band prints on white without its band** — same rows, same measure, same rules, so it
  loses its ground rather than its identity — and **15 Load More prints the rows it had loaded**.
- **Editing.** Every authored text edits inline with **P0·1**; **Ghost-owned content never does** —
  a post title, tag, author name or excerpt says **"Edit in Ghost"**. Every URL field opens the
  Ghost-aware **Link Picker**. **No Preview control exists in A18** and there never was one to
  remove. **Member visibility is offered nowhere** ⚑ — every action here is navigation. **Image focus
  has nothing to attach to** ⚑ — A18 authors no image, and a thumbnail's focal point belongs to the
  post, in Ghost. **Rule 11's optional button icon reaches one design**, 15 Load More.

### The content

**Fifteen invented posts (Orbit Weekly)** — A17's twelve unchanged and in their original positions,
plus three ⚑ (13 The tunnel under the Rua da Prata, reopened · 14 A winter of birdsong, recorded
from one balcony · 15 Who pays for the light on the Cais do Sodré), because a list draws more posts
than a grid. **The four hard cases stay in positions 2, 3, 4 and 5 in every design:** post 2's
69-character title, post 3's missing feature image, post 4's missing tag and excerpt, post 5's
author without a photograph. **Post 9's excerpt and the name "Claire Boivin" are invented here** ⚑
and should be reconciled if A17's roster is completed. **No A18 design draws `featured`.**
**One content departure:** 11 Numbered's head reads "Seven pieces to read before the rest" over the
eyebrow "Start here", because a numbered list needs its head to say what the numbering means.

### Tuple uniqueness — the honest statement

**Six of the fifteen do not distinguish themselves on the five closed slots.** 1 Rows, 3 Slim,
4 Dated, 11 Numbered, 13 Timeline and 14 Index all read `feed · none · page · many · none` and rest
entirely on the emphasis phrase, which no machine reads. **That is a larger share than A17's nine of
eighteen, and the reason is structural:** a list has one column, one ground and no containment to
vary, so the slots that separate grids have nothing to say here. **The nine structurally unique**
are 2 (left), 5 (variable), 6 (split), 7 (contrast), 8 (right), 9 (few), 10 (top), 12 (card ·
surface) and 15 (variable · left).

### The Data group — what replaces a repeater

**P0·5 "Populate from…" configured for posts**, identical in all fifteen, below each design's own
controls, **not counted toward the brief's control budget** ⚑:

| Field | Type | Values |
|---|---|---|
| `source` | enum req | Latest posts · By tag · By author · Featured only · This route's posts · **Hand-picked** |
| `filterValue` | ref opt | a tag or an author; read at By tag / By author |
| `postRefs` | ref[] opt | read at Hand-picked; the Ghost post picker's references, **drag order = drawn order** |
| `count` | int req | **a stepper, 1–100**, with per-design minimum, maximum and step |
| `order` | enum req | Newest first · Oldest first; **Title A–Z at 14 Index**; disabled at Hand-picked |
| `paginationStyle` | enum opt | main feed only: Numbered · Newer and older · Load more · None (A34's) |
| `emptyHeading` `emptyBody` | text opt | main feed only; authored, with defaults |

**⚑ Amended in this pass, one design only.** At **15 Load More** `source` is **locked at This
route's posts** — the design is main-feed-only — and `count` is **not read at all** there, because
the route's own pagination is the total. That ends the one place in either category where a shared
field meant something different in one design.

**Hand-picked, added in this pass.** Search-and-pick, drag to order, references stored — never
copies. ⚑ **This overrules A18-0's flat "no picker anywhere in the category":** picking is not
authoring. **The refusals stand:** no Add that creates a post, no Remove that deletes one, no
per-post styling — design controls write one value onto the section and every row reads it.

**Count is one stepper**, per settlement 4 above. **Two designs reach into this block:** 11 Numbered
adds the advice "For a fixed set, use a tag and Oldest first"; 15 Load More locks `source` at This
route's posts and does not read `count` at all ⚑ amended, the route's pagination being the total.

**Member visibility is not offered anywhere in A18** ⚑ — the only actions in the category are
navigation (the rows, the head link, 15's button), and a list that hid itself from members would hide
the site's writing rather than a call to action. `visibility` is read and never drawn (A32's).

---

## The fifteen designs

Each entry gives the ten required fields. Fields shared with the floor above are not repeated;
**only departures are stated.** Each entry ends with what this pass changed.

---

### 1 · Rows

1. **Descriptor.** Full-width rows on a hairline, text held to an 820 px measure at the left and a
   200 px meta column hung at the right; no image at any setting. The category's default.
2. **Tuple.** `feed · none · page · many · none · hairline-ruled rows`
3. **Archetype.** feed. No departures; **it supplies the category's default ladder.**
4. **Responsive.** 1440 text 820, gap 276, meta 200 · 1080 text 700 · 834 one column at 754, **meta
   under the title, Meta position overridden and disclosed** · ≤ 767 title 19, reading time dropped.
5. **Fields.** Section six; query the Data group's; post `title`, `url`, `published_at`,
   `primary_tag`, `excerpt`, `primary_author.name`, `reading_time`. **No image, no `profile_image`.**
6. **Controls.** Rule Off · Between rows · Boxed — Row density Compact · Comfortable · Spacious —
   Excerpt Off · One line · Two lines — Meta None · Date only · Name and date · Name, date and
   reading time — Meta position Right column · Under title — Tag Show · Hide — "View all" link
   Matches the query · Custom. **Seven**, plus the universal trio and the Data group, both outside.
7. **Data.** Designed for 5, 10, 15; **correct at 1–25**, and the stepper's bounds say so. 1 → one
   row; **at Rule Between rows no rule is drawn at all**, since a rule between one row and nothing
   is not a separator. **Receives more hand-offs than any other A18 design** (from 2 and 10).
8. **Empty.** **No image case exists.** No tag, or Tag Hide → title moves up, row 21 px shorter.
   No excerpt → shorter row, mixed rows ordinary. No author → date alone on the second line.
9. **Module.** None; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `load-more` considered
   and not declared — 15 Load More owns it.
10. **A11y.** Floor as written. **Meta position is a layout, not a re-order**, so both values sound
    identical. **At Row density Compact A6's ring overlaps the rule by 2 px — accepted.**
    Contrast 15.46:1 / 5.56:1 light, 15.64:1 / 6.89:1 dark.

**Reconciled — 25 August 2026.** *Controls, seven:* the five it had plus **Tag** and the **"View
all" link**; Padding retired into Vertical spacing. *Data:* the Data group, Hand-picked, a 1–25
stepper, `excerpt`, the main feed's empty state and Pagination style. *Universal:* nothing locked.

---

### 2 · Thumb Rows

1. **Descriptor.** 1 Rows with a fixed-size thumbnail at the leading edge, the text measure paying
   for it and the meta still hung.
2. **Tuple.** `feed · none · page · many · left · lead thumbnail row`
3. **Archetype.** feed. **One departure:** the ladder sheds decorative media below 767 and this
   keeps its picture, because it is a fixed 96 px rather than a fraction of the row.
4. **Responsive.** 1440 thumb 144 × 96 (144 square at Thumbnail shape Square), gap 24, text 652,
   meta 200 · 834 meta under title, thumb holds 144, text 590 · ≤ 767 thumb 96, title 18, **excerpt
   hidden whatever the control says**. **The picture never leaves the leading edge and never stacks.**
5. **Fields.** As 1 Rows plus `feature_image` + `feature_image_alt`. **⚑ Writes `thumbSize` with
   values 96 · 144 · 200** — same field name as A17·13, different enum — **and `thumbShape`** ⚑ new.
6. **Controls.** Thumbnail Small · Medium · Large — **Thumbnail shape Landscape · Square** — Rule —
   Row density — Excerpt — Meta — Tag — "View all" link. **Eight.** **No image ratio beyond the
   shape, no thumbnail side** (a picture at the right of a full-width row is at the far side of the
   page from its title).
7. **Data.** Designed for 5 and 10; correct at 1–15. 1 → composed, no hand-off.
8. **Empty.** No image on a post → **A17's tag plate at the thumbnail's box, in the set shape**, tag
   centred at 12 px. **No image on any post → the thumbnail column is not drawn and the text takes the
   width back**, silently on the site, disclosed in the panel; **the design stays Thumb Rows** ⚑
   amended, and the panel may advise 1 Rows without switching to it. **⚑ The every-post threshold is flagged again** — five plates among six is worse
   than none, and the rule cannot see the difference.
9. **Module.** None. **No-JS: pixel-identical** (`loading="lazy"` is HTML). `lightbox` refused.
10. **A11y.** A17's DOM order exact, and the visual order matches it. Plate `aria-hidden`. Row never
    below 96 px tall.

**Reconciled.** *Controls, eight:* **Thumbnail shape** (Landscape 3:2 · Square 1:1, both fixed-size,
the plate following the shape), **Tag** and the **"View all" link** join the five; Padding retired.
*Data:* the Data group, a 1–15 stepper, `excerpt`. *Editing:* **the thumbnail is the post's
`feature_image`**, so Image focus has nothing to attach to.

---

### 3 · Slim

1. **Descriptor.** One post per line — title left, one trailing fact right, 44 px a row at Compact.
   The category's density floor.
2. **Tuple.** `feed · none · page · many · none · single-line rows`
3. **Archetype.** feed. **One departure:** Columns Two is **switched off** at 834 rather than
   narrowed.
4. **Responsive.** 1440 one column at 1,296 or two at 636/24; row 44, title 19, trailing 13 flush
   right, shrink-to-fit · 834 one column, title 18 · ≤ 767 title 17, **date abbreviates to "12 Mar"
   with the full ISO in `datetime`**. **The row height never changes at any width** — the only
   design in A18 that can say so.
5. **Fields.** Section six; query the Data group's; post `title`, `url`, and **exactly one** of
   `published_at` · `primary_tag` · `reading_time`. **No image, author or excerpt at any setting** —
   the shortest field list in the category with 14 Index.
6. **Controls.** Columns One · Two — Row density Compact · Comfortable · Spacious (44 · 56 · 72) —
   Title size Small · Medium (17 · 19) — Trailing Date · Tag · Reading time · Nothing — Rule —
   "View all" link. **Six.** **No Excerpt, no Meta** — there is no second line for either. **No Tag
   row** — Trailing already governs the tag, and two controls that both hide it is a control that
   lies.
7. **Data.** Designed for 10, 15, 25; **correct at 1–30, the widest bounds in A18**. 1 → one 44 px
   line under a 34 px heading, **the weakest single-post case**; the panel suggests 9 Big Type.
8. **Empty.** **Trailing Tag on an untagged post → the slot is empty and the title keeps the width**;
   no dash, no placeholder. Date and reading time are guaranteed by Ghost, so **a tag is the only
   gap this design can show.**
9. **Module.** None. **No-JS: pixel-identical** — the truncation is CSS. `filter-strip` considered
   and not declared.
10. **A11y. ⚑ The only design in the library that truncates a title.** The clip is
    `white-space: nowrap` + `text-overflow: ellipsis`; **the full string stays in the DOM**, is the
    link's accessible name and is what is indexed. **No `title` attribute is added.** A6's ring
    overlaps the rules at 44 px — accepted. **44 px is exactly A1's touch minimum and Row density
    cannot go below it.**

**Reconciled.** *Controls, six:* the **"View all" link** joins the five; Padding retired. **No Tag
row, with the reason at the control.** *Data:* the Data group and a **1–30 stepper** — the widest in
A18. *Universal:* Row density keeps its name, 44 · 56 · 72 being the row and not the section.

---

### 4 · Dated

1. **Descriptor.** A fixed date column at the leading edge with each post hung beside it, the
   author's name moved under the excerpt and the right of the row left empty.
2. **Tuple.** `feed · none · page · many · none · leading date column`
3. **Archetype.** feed. **One departure:** the hung column holds to ≤ 767 rather than collapsing at
   834, because the date is the row's subject rather than its footnote.
4. **Responsive.** 1440 column 160 at Full, gap 40, text 820, 276 empty right; date 15 · 834 column
   120 and **the format renders one step shorter than the set value, returning above 1080** ⚑ ·
   ≤ 767 **the column collapses and the date becomes the row's first line at 14 px, above the tag.**
5. **Fields.** As 1 Rows; `published_at` **required by construction**. **⚑ Writes `dateStyle` and
   `author` where others write `meta`**; `meta` is preserved and `author` derived from it on the
   first switch in (Name and date → Name; Name, date and reading time → Name and reading time).
6. **Controls.** Date style Full · Short · Day and month — Rule — Row density — Excerpt —
   Author Off · Name · Name and reading time — Tag — "View all" link. **Seven.**
7. **Data.** Designed for 5, 10, 15; correct at 1–25. **Both order values are date orders, so the
   column can never be out of sequence**; the panel names Oldest first as the intent and does not
   force it. 1 → a date and a title is a complete statement, **the strongest single-post case among
   the image-less designs.**
8. **Empty.** **The date is never missing.** No tag, or Tag Hide → title moves up, date stays level
   with the title's first line. **⚑ A future `published_at` never appears** — Ghost does not return
   scheduled posts to a public query.
9. **Module.** None. **No-JS: pixel-identical.** **Nothing in the registry sorts client-side**, so a
   reader cannot reverse the order — A17·10's gap, unchanged.
10. **A11y. ⚑ DOM order departs from the card: date, tag, title, excerpt, author** — the visual and
    reading orders agree, and the card's promise that a design switch never changes what a screen
    reader hears is broken here, deliberately, in one place. **The column's width is computed** (the
    longest rendered date + 24, floored at 96) — the one measured-rather-than-named dimension in
    A18, for localisation ⚑.

**Reconciled.** *Controls, seven:* **Tag** and the **"View all" link** join the five; Padding
retired. *Data:* the Data group, a 1–25 stepper, `excerpt`, and the Order row carrying the
date-order note.

---

### 5 · Grouped

1. **Descriptor.** Rows cut into derived groups by month, year or tag, each under an eyebrow-sized
   heading above or hung left, rules running inside a group and stopping at its end.
2. **Tuple.** `feed · none · page · variable · none · month group headings`
3. **Archetype.** feed. **One departure:** the archetype has no notion of a group, so the 40/14
   spacing is bespoke and stated here.
4. **Responsive.** 1440 heading 13/600 tracked above, or a 200 px column at Heading Left · 834
   **Heading Left overridden to Above**, meta under the title, group gap holds 40 · ≤ 767 group gap
   32, heading holds 13 px.
5. **Fields.** As 1 Rows minus the excerpt. `published_at` is the grouping key at Month and Year,
   `primary_tag` at Tag. **Writes `groupBy`, `headingPosition` and `otherGroupLabel`** ⚑ new.
6. **Controls.** Group by Month · Year · Tag · Nothing — Heading position Above · Left —
   **"Everything else" label** (`otherGroupLabel`, shown at Group by Tag) — Rule — Row density —
   Meta — "View all" link. **Seven.** **No Excerpt** ⚑: an excerpt adds 26 px a row and pushes the
   headings so far apart that the grouping stops being visible, which is the reason to choose this
   design. **No Tag row** — Group by governs the row eyebrow at Tag. **The Group by row carries the
   no-JavaScript line** ⚑: "Grouping needs JavaScript. Without it this list draws flat — each row with
   its own date, no headings and no extra space."
7. **Data.** **Show cuts posts, never groups**, so the last group is often partial. Designed for
   10–25 across 2–6 groups; correct at 1–25. **The count line reports three numbers** — "9 posts
   match. 9 drawn in 2 groups." — and warns "Grouping reads best with 3 or more posts a group." ⚑
   1 → **one heading over one row, drawn; §8's named case.** At Group by Tag, groups are ordered by
   each group's newest post ⚑, never alphabetically.
8. **Empty.** No tag at Group by Tag → **the authored `otherGroupLabel`, default "Everything
   else"** ⚑. **A row never repeats its heading:** Month → "12 Mar", Year → "12 March", Tag → full
   date and no row eyebrow.
9. **Module.** **`group-headings`** ⚑ new in this pass — Ghost cannot tell that the month changed
   between two posts, so the headings are cut in by the browser from each row's `<time datetime>`
   or its tag. **No-JS: the list renders flat and ungrouped** — every post present, in the set's
   order, **each row carrying its own date exactly as the design draws it**, **no group heading and
   no group date**, no group gaps and no empty space where one would have been. One consequence,
   stated rather than corrected: a set spanning more than one year shows no year anywhere. **No post is lost.** Edit-safe: the editor runs the module, so the canvas shows the
   grouped list.
   **`accordion` considered and refused** on design grounds despite a perfect degradation; **sticky
   headings refused** (they need no module and a section is not a scrolling pane).
10. **A11y.** **⚑ The outline is correct in both states:** server-side each title is an `<h3>`
    under the section's `<h2>`, which is what a flat list should announce, and **the module inserts
    each heading as an `<h3>` and re-levels the titles it groups to `<h4>`** as it goes.
    **⚑ Each heading is an `<h3>` and each post title steps to `<h4>`** — the only place in
    A17 or A18 where a post title is not an `<h3>`, and it means switching designs changes the
    document outline. One `<ul>` per group.

**Reconciled.** *Controls, seven:* the authored **"Everything else" label** and the **"View all"
link** join the five; Padding retired. *Strings:* **"Everything else" is no longer a literal** — it
is `otherGroupLabel`, default kept, ≤ 26 ch, inline-editable — and **the month and year headings
render through Ghost's `{{date}}` in the site's locale**, confirmed in this pass. *Data:* the Data
group and a 1–25 stepper. **No Tag row:** recorded as a conflict, not closed.

---

### 6 · Split Head

1. **Descriptor.** The section head in a 416 px column beside an 856 px list, its title one step
   larger than anywhere else in A18, the note and link inside the head column.
2. **Tuple.** `split · none · page · many · none · head beside the list`
3. **Archetype.** split. No departures — A8·6's geometry via A17·6.
4. **Responsive.** 1440 head 416 / gutter 24 / list 856; inside the list text 620, gap 36, meta 200;
   head title 40 · 1080 head 306, list 650 · 834 **head stacks above at 560, title 34, note and link
   move below the list** · ≤ 767 title 26. **Head side ignored below 834.**
5. **Fields.** As 1 Rows; **the title is effectively required.** Writes `headSide`.
6. **Controls.** Head side Left · Right — Rule — Row density — Excerpt — Meta — Tag — "View all"
   link. **Seven.** **No head-width control** — its narrow value would turn this design into 1 Rows.
7. **Data.** Designed for 5 and 10; correct at 1–15. 0 → the section does not render, head included,
   unless it is the designated main feed. 1 → 856 px of list holding one row; the panel suggests A19
   and does not switch.
8. **Empty.** **Head None → an empty 416 px column; the design does not hand off**, and the picker's
   note says "This design needs a title. Without one, try Rows." ⚑ A hand-off is for a design that
   cannot exist; this one can exist, badly.
9. **Module.** None. **No-JS: pixel-identical.** Sticky head refused, as in A8·6 and A17·6.
10. **A11y.** Head Right is a `grid-column` move, so the head is first in the DOM at both values.
    Focus order head link → rows.

**Reconciled.** *Controls, seven:* **Tag** and the **"View all" link** join the five; Padding
retired. *Data:* the Data group, a 1–15 stepper, `excerpt`.

---

### 7 · Contrast Band

1. **Descriptor.** 1 Rows' arrangement on the pack's contrast ground, full width or inset, with
   muted and hairline derived from the band's own text at 60% and 10%.
2. **Tuple.** `feed · none · contrast · many · none · inverted band`
3. **Archetype.** feed. No departures in the rows; **one addition — the band's own padding scale**,
   which is now Vertical spacing's resolution here rather than a control of its own.
4. **Responsive.** 1440 band full-bleed or inset at 1,296 with the pack radius; content margin 72 at
   Full width, 48 at Inset · 834 band padding 80, meta under the title · ≤ 767 band padding 64,
   **Inset overridden to Full width**, margin 20.
5. **Fields.** Identical to 1 Rows. **Writes `band` and nothing else of its own** — the smallest
   field difference between any two designs in A18, which is the point: this design is a ground.
6. **Controls.** Band Full width · Inset — Rule — Row density — Excerpt — Meta — Tag — "View all"
   link. **Seven.** No band colour, no meta position. **Vertical spacing resolves 80 · 96 · 132 on
   the band**; **Background role ships locked at Contrast** and **Top divider locked None**, each
   with its reason drawn.
7. **Data.** Designed for 5 and 10; correct at 1–25. **0 → the band goes with the section.**
   1 → a lot of ground for one post; the panel suggests Vertical spacing Compact. **A34 attaches
   below the band, on the page ground** ⚑.
8. **Empty.** As 1 Rows. At Rule Off a title-only row is a line of type in a lot of space —
   legitimate at Spacious, and not warned.
9. **Module.** None. **No-JS: pixel-identical.** **Print: on white, without the band** ⚑ amended —
   the same rows, the same measure, the same rules. A17·7's behaviour, kept; its old phrasing as a
   design switch, withdrawn. **The design stays Contrast Band: it loses its ground, not its
   identity.**
10. **A11y.** Measured on the band, light: title 15.87:1, muted `#A5A29D` 5.32:1. Dark (the band
    inverts to `#EDE7DA`): 15.42:1 and `#6C6961` 5.61:1. **⚑ The accent needs a pack-level answer:**
    the light band takes the dark accent at 5.73:1; the dark band takes the light accent at 4.42:1
    and **only clears AA as large text**, drawn as a 14 px semibold underline. **Fourth independent
    derivation of `on-contrast` in the library.**

**Reconciled.** *Controls, seven:* **Tag** and the **"View all" link** join the five. *Universal:*
**Background role locked at Contrast**, **Top divider locked None**, and the band's 80 · 96 · 132 is
**Vertical spacing's resolution here, not a second Padding row** — the old "Padding at 80 · 96 · 132"
ruling is withdrawn and replaced by that. *Data:* the Data group, a 1–25 stepper, `excerpt`.

---

### 8 · Row Cards

1. **Descriptor.** One post per full-width card — surface or ground, hairline, pack radius, 16 px
   apart, no rules — with a thumbnail at the trailing edge and the meta under the excerpt.
2. **Tuple.** `feed · none · page · many · right · per-row plane`
   *(containment is `none`: the cards are the items' geometry, not the section's)*
3. **Archetype.** feed. **One departure:** the separator is a plane, so Rule does not appear and the
   16 px gap is fixed rather than density-driven.
4. **Responsive.** 1440 card 1,296, padding 24, gap 16, thumb 160 × 107 trailing (160 square at
   Square), excerpt held to 760 · 834 thumb 128 — **no hang to collapse, so nothing else moves** ·
   ≤ 767 padding 16, gap 12, thumb 88, excerpt hidden, meta reduced to the date.
5. **Fields.** As 2 Thumb Rows. **Writes `card`, a third `thumbSize` value set (Off · 112 · 160) ⚑
   and `thumbShape`.**
6. **Controls.** Card Surface · Ground — Thumbnail Off · Small · Medium — **Thumbnail shape
   Landscape · Square** — Row density (card padding 16 · 24 · 32) — Excerpt — Meta — Tag — "View
   all" link. **Eight.** **No Rule** — the only A18 design without it. **Row density keeps its name**
   as the card's internal padding: a genuinely different ladder.
7. **Data.** Designed for 5 and 10; correct at 1–15 (a card is 24% taller than a bare row).
   1 → **the best single-post case in A18.**
8. **Empty.** Plate at the thumbnail's box, in the set shape. **No image on any post → draws at
   Thumbnail Off and does not hand off**, unlike 2 Thumb Rows, because the card is the design and the
   picture is a passenger. **Cards are not equalised** — a stack has no row to equalise.
9. **Module.** None. **No-JS: pixel-identical** — the hover lift is a CSS transition and respects
   `prefers-reduced-motion` by keeping the end state. Edit-safe: the lift does not run while editing.
10. **A11y.** The card is the `<a>`. **⚑ DOM order is A17's and the visual order puts the image
    last**; `alt=""` in practice, the same trade A17·13 recorded. **A6's ring has the 16 px gap to
    live in — the most comfortable in A18.** Contrast on the card 16.25:1 / 5.85:1; dark
    14.56:1 / 6.41:1. **⚑ In dark the shadow and the lift are dropped and the surface step alone
    carries the plane.**

**Reconciled.** *Controls, eight:* **Thumbnail shape**, **Tag** and the **"View all" link** join the
five; Padding retired into Vertical spacing while **Row density keeps its own name** as card padding.
*Data:* the Data group, a 1–15 stepper, `excerpt`. *Universal:* Background role is the ground behind
the cards and is not locked; where it meets Card Surface the panel says the two converge.

---

### 9 · Big Type

1. **Descriptor.** Three to five posts as display-size titles on an 1,100 px measure with one quiet
   meta line each, the section head stepped down to Small so the posts can be the display moment.
2. **Tuple.** `feed · none · page · few · none · display-size titles`
3. **Archetype.** feed. **One departure:** the title ladder steps 48 · 38 · 28 rather than
   22 · 21 · 19.
4. **Responsive.** 1440 title 48 on 1,100 (900 at Centred), meta 14, row padding 28, head 28 ·
   1080 title 44 · 834 title 38, head 26 · ≤ 767 title 28, head 21. **Huge draws 64 · 58 · 48 · 32**
   so the two values never converge.
5. **Fields.** Section six (**sub offered, not recommended**); query the Data group's; post `title`,
   `url`, `published_at`, `primary_tag` **drawn in the meta line**, `primary_author.name` at Meta's
   fourth. **Never reads `excerpt`, `feature_image` or `reading_time`.**
6. **Controls.** Title size Display · Huge — Alignment Left · Centred — Rule — Row density
   (20 · 28 · 40) — Meta None · Date only · Tag and date · Name, tag and date — "View all" link.
   **Six.** **No Excerpt** — the title is the excerpt, at four times the size. **No Tag row** — the
   tag lives inside the Meta enum here, A17·9's exception.
7. **Data.** Designed for 3–5; correct at 1–6, legible to 10. **The count line carries the
   category's only standing warning** — "Display titles read best at five or fewer", three at Huge —
   **and the stepper carries no maximum below the category's.** 1 → **the strongest single-post case
   in A18.**
8. **Empty.** No tag at Meta Tag and date → **the date stands alone with no separator dot.**
   **No image or excerpt case exists** — with 3 Slim, one of two designs that cannot be damaged by a
   thin post. Its exposure is the opposite: a very long title at 48 px is three lines, and it wraps.
9. **Module.** None. **No-JS: pixel-identical.** `reveal` and `typewriter` both considered and
   refused.
10. **A11y.** The `<h2>` is visually the smallest heading on the page and structurally still the
    parent. **⚑ DOM order departs from the card — title then tag** — the second exception across the
    two categories, after A17·9's identical move.

**Reconciled.** *Controls, six:* the **"View all" link** joins the five; Padding retired. **No Tag
row:** the Meta enum is where this design's tag is governed. *Data:* the Data group and a stepper
whose **maximum is advisory rather than hard** — recorded as a conflict with the per-design-bounds
rule.

---

### 10 · Lead and List

1. **Descriptor.** The query's first post drawn large with the section's only picture, at two thirds
   of the content width, above the remaining posts as ruled lines at full width.
2. **Tuple.** `feed · none · page · many · top · lead post above the list`
   *(⚑ at Lead layout Image beside the slot would read `left`; the tuple records the default)*
3. **Archetype.** feed. **One departure:** two repeating units, a lead and a follower; the ladder is
   applied to the followers.
4. **Responsive.** 1440 lead 864 wide, image 16:9 at 864 × 486, title 34, excerpt 17 on 780;
   followers full 1,296; 40 px between them · 834 **the lead takes the full 754 and Image beside
   stacks to the same arrangement**, lead title 30 · ≤ 767 lead image 197 tall, lead title 24,
   follower titles 19.
5. **Fields.** Lead: as 2 Thumb Rows plus the excerpt. Followers: minus image and excerpt.
   **`featured` read, stored, never drawn** ⚑ — the lead is a position, so the site controls it by
   controlling the order. Writes `leadLayout`, `leadRatio`, `followerStyle`.
6. **Controls.** Lead layout Image above · Image beside — Lead image Wide · Landscape — Followers
   Rows · Slim lines — Rule — Meta — Tag — "View all" link. **Seven.** **No Row density** (Followers
   already sets the row's shape); **no followers-count control** (it is Count minus one).
7. **Data.** Designed for 5 and 10; correct at 2–15, and to 25 at Followers Slim lines — **the
   stepper's minimum is 2 and its maximum follows Followers**. **The count line splits its number** —
   "5 drawn — 1 lead, 4 followers." 1 → the lead alone, no rules; the panel suggests a featured
   section.
8. **Empty.** **No image on the lead → the lead draws without a picture at a 780 measure**, rather
   than an 864 × 486 plate — **the one place in A18 where the plate is refused outright.** No image
   on any post → **the lead simply has none and the followers are unchanged** ⚑ amended; the design
   stays Lead and List and the panel may advise 1 Rows.
9. **Module.** None. **No-JS: pixel-identical.** `lightbox` not declared.
10. **A11y. ⚑ The lead sits outside the `<ul>`, as its own `<article>`.** Both the lead's and the
    followers' titles are `<h3>` — **the size difference is visual and the outline is flat**, the
    opposite choice to 5 Grouped's and right for the same reason.

**Reconciled.** *Controls, seven:* **Tag** — one value governing the lead's eyebrow and the
followers' alike — and the **"View all" link** join the five; Padding retired. *Data:* the Data
group, a 2–15 stepper (25 at Slim lines), `excerpt` on the lead.

---

### 11 · Numbered

1. **Descriptor.** Ruled rows with a tabular numeral in a fixed leading column at the title's size
   in the muted colour; the library's only ordered list.
2. **Tuple.** `feed · none · page · many · none · leading ordinal`
3. **Archetype.** feed. **One departure:** the leading column does not collapse below 767 — the
   numeral is the design.
4. **Responsive.** 1440 column 64, gap 24, text 820, date column 140 right-aligned; numeral 22 ·
   834 column 48, **the date leaves its column for the meta under the title** · ≤ 767 column 36,
   numeral and title 19.
5. **Fields.** As 1 Rows. **The numeral is not a field** — it is the row's index, computed at render
   and stored nowhere. Writes `numberStyle`.
6. **Controls.** Number style Zero-padded · Plain — Rule — Row density — Excerpt — Meta — Tag —
   "View all" link. **Seven.** **No number size** (it is tied to the title's), **no accent numeral**
   ⚑, no thumbnail.
7. **Data.** Designed for 5, 7, 10; correct at 1–25, **and two digits cover the whole range.**
   **The numeral counts the drawn list from the top, always** — not the archive, not the query
   before Count cut it — and **⚑ it restarts at 01 on every page**: Ghost cannot continue a count
   across pages, so on `/page/2/` the first row is 01 again. Stated in the panel, on the Order
   row's advice line and here. **At Newest first a post's number changes as the site publishes**, and the
   Order row carries the advice "For a fixed set, use a tag and Oldest first." 1 → a list numbered
   01, **which has lost its point**; the panel says so.
8. **Empty.** **The numeral is never missing** — one fewer failure mode than any other design here.
   **⚑ The numeral aligns to the title, not the row**, so an untagged post's numeral sits 21 px
   higher than its neighbours'. Correct: the numeral labels the title.
9. **Module.** None. **No-JS: pixel-identical** — the numerals are rendered into the markup,
   **not by a CSS counter** ⚑. `count-up` considered and refused.
10. **A11y. ⚑ The list is an `<ol>`, the only one in A17 or A18**, and **the drawn numeral is
    `aria-hidden`** because the list type already announces the position. **Tabular figures are a
    requirement, not a preference** — the second design after A17·10 to need them, and now recorded
    as a pack requirement.

**Reconciled.** *Controls, seven:* **Tag** and the **"View all" link** join the five; Padding
retired. *Data:* the Data group, a 1–25 stepper, `excerpt`, and the fixed-set advice moved onto the
Order row, where the value it warns about lives.

---

### 12 · Panel

1. **Descriptor.** The whole list inside one surface panel at a 48 px inset, dividers stopping at
   the panel's padding, the panel's edge closing the list; the head optionally moved outside.
2. **Tuple.** `feed · card · surface · many · none · list inside one panel`
   *(⚑ at Panel Outline the ground arguably reads `transparent`; the tuple records the default)*
3. **Archetype.** feed. **One departure:** rules stop at the inset, and Rule loses its Boxed value.
4. **Responsive.** 1440 panel 1,296, inset 48, list 1,200, text 760, meta 200 · 834 inset 32, meta
   under the title · ≤ 767 inset 20, head 23, excerpt hidden. **The panel keeps its edge at every
   width and never goes full-bleed** — deliberately the opposite of 7 Contrast Band.
5. **Fields.** As 1 Rows. **Writes `panelEdge` and `headPosition`, both shared with A17·17 by name
   and value set** — the cleanest cross-category field reuse in either category — **and `meta`**,
   which it did not before.
6. **Controls.** Panel Fill · Outline — Head Inside · Outside — Rule Off · Between rows
   *(no Boxed — **absent rather than disabled** ⚑)* — Row density — Excerpt — **Meta** None · Date
   only · Name and date · Name, date and reading time — Tag — "View all" link. **Eight.** **The
   fixed meta is withdrawn** ⚑: at the third value the meta wraps at a 760 measure, which the note
   discloses rather than the control forbidding. **Vertical spacing sits around the panel; the 48 px
   inset stays fixed and is not a control.**
7. **Data.** Designed for 5 and 10; correct at 1–15. **0 → the panel goes with the section**; an
   empty panel is the one empty state that would look deliberate — unless this is the main feed, and
   then the empty state renders inside the panel. 1 → **about 70% empty plane**, matching A17·17's
   measurement; the panel suggests Panel Outline. **A34 attaches below the panel, never inside it** ⚑.
8. **Empty.** As 1 Rows. **⚑ A hover fill would have to derive from the panel rather than the page**
   and Paper has no step above `#FFFFFF`, so **there is no hover fill in any pack** — a hover that
   existed in some packs and not others would not be a design.
9. **Module.** None. **No-JS: pixel-identical.** `accordion` considered and refused.
10. **A11y. ⚑ The panel is a `<div>` with no role** — A17·17's ruling, reused. At Head Outside the
    `<h2>` sits outside the panel in the DOM as well as visually. Contrast 16.25:1 / 5.85:1 light,
    14.56:1 / 6.41:1 dark. **⚑ In dark the panel's border and the row dividers converge on one
    token** where light has two.

**Reconciled.** *Controls, eight:* **Meta** (new — the fixed meta had a measurement, not a reason),
**Tag** and the **"View all" link** join the five; Padding retired into Vertical spacing, around the
panel. **The 48 px inset stays fixed** — a deliberate divergence from A17·17, which keeps Inset as a
separate ladder. *Data:* the Data group, a 1–15 stepper, `excerpt`.

---

### 13 · Timeline

1. **Descriptor.** A vertical hairline with a marker at every post, dates right-aligned into it and
   titles beside it; the rail is the separator and there is no rule.
2. **Tuple.** `feed · none · page · many · none · vertical rail markers`
3. **Archetype.** feed. **Two departures:** the separator is a rail, and **the rail's ends are cut
   to the first and last markers** — a line running past either end would imply posts outside the
   drawn set.
4. **Responsive.** 1440 date 120 right-aligned, gap 20, rail 12 (1 px line, 11 px marker), gap 8,
   text to 820; gap between posts 28 · 834 date column 96, format one step shorter · ≤ 767 **the
   column goes, the date joins the meta whatever Date says, and the rail moves to the page margin.**
   **Rail and marker are the same size at all four widths.**
5. **Fields.** As 4 Dated. Writes `marker` and `datePosition`; **shares `author` with 4 Dated.**
6. **Controls.** Marker Dot · Ring · None — Date On the rail · In the meta — Row density
   (20 · 28 · 40 between posts) — Excerpt — Author — Tag — "View all" link. **Seven.** **No Rule, no
   Meta, no accent marker** ⚑.
7. **Data.** Designed for 5, 10, 15; correct at 2–25, and the stepper allows 1 with the design's
   advice. 1 → **one marker and no line**, because the rail runs between the first and last markers
   and with one post they are the same point; the panel suggests 4 Dated. 2 → the lowest count the
   design earns.
8. **Empty.** The date is never missing. No tag, or Tag Hide → title moves up **and the marker moves
   with it** (the marker aligns to the title). **⚑ The rail's spacing is typographic, not
   proportional to the interval** — a set spanning years draws an evenly spaced rail over uneven
   time, and nothing says so; a proportional rail was refused because a six-month gap would draw a
   metre of empty line.
9. **Module.** None. **No-JS: pixel-identical.** `scroll-spy` and `reveal` considered and refused.
10. **A11y.** Rail and markers `aria-hidden`. **⚑ DOM order is date, tag, title, excerpt, author** —
    4 Dated's departure, for the same reason. **A6's ring wraps the text and the date and stops
    short of the rail**, which is shared between rows.

**Reconciled.** *Controls, seven:* **Tag** and the **"View all" link** join the five; Padding
retired. *Data:* the Data group, a 1–25 stepper with the two-post advice, `excerpt`, and the Order
row carrying the date-order note.

---

### 14 · Index

1. **Descriptor.** Titles at the category's smallest size flowed down two, three or four columns
   with one optional fact each; the densest design in the library.
2. **Tuple.** `feed · none · page · many · none · titles-only columns`
   *(**not** `grid-of-N`: the columns are a flow and the reading order runs down them)*
3. **Archetype.** feed. **One departure:** the ladder applies to the column count, not the row.
4. **Responsive.** 1440 Two 636 · Three 416 · Four 306 on a 24 gutter; entry padding 12 at Compact;
   title 17, date 13 · 1080 Four becomes three · 834 **three and four both become two at 365** ·
   ≤ 767 one column. **The entry is identical at all four widths; only the column count changes.**
5. **Fields.** Section six; query the Data group's; post `title`, `url`, and one of `published_at`
   or `primary_tag`. **Reads no image, author, excerpt or reading time.** Writes `columns`, `detail`,
   `titleSize`; **shares `titleSize`'s Small · Medium (17 · 19) with 3 Slim.**
6. **Controls.** Columns Two · Three · Four — Detail Title only · Title and date · Title and tag —
   Title size Small · Medium *(**Medium unavailable at Columns Four, reason shown** — the only
   disabled value in A18)* — Rule — Row density (12 · 16 · 24) — "View all" link. **Six.** **No
   reading-order control** ⚑: across-then-down would make the DOM and visual orders disagree. **No
   Tag row** — Detail governs the one fact an entry carries.
7. **Data.** Designed for 15 and 25; **the stepper reaches 30**, and below four posts the panel
   suggests Columns Two. **Columns are balanced by count, not height** — 15 across three is 5·5·5,
   across four is 4·4·4·3, and the count line reports the division. 1 → **one title beside two empty
   columns, the worst single-post case in A18.** **⚑ Order gains a third value here, Title A–Z**, a
   server-side `title asc` — never a client sort.
8. **Empty.** At Detail Title and tag an untagged post draws its title alone and its entry is 21 px
   shorter; **entries are not equalised.** At Title and date nothing can be missing.
9. **Module.** None. **No-JS: pixel-identical** — and **Title A–Z is server-side, so it needs none.**
   `filter-strip` considered and refused (A17·15 owns it); `shuffle` refused.
10. **A11y. ⚑ One `<ul>` for the whole index, flowed into columns by CSS** — not one list per
    column — so the announced order and the read order are the same. **At Compact an entry is 62 px
    with a date and 44 px without**, meeting the touch floor. **Titles are never clipped here**,
    unlike 3 Slim's. **Title A–Z changes the announced order because it changes the rendered order**,
    which is the point of it.

**Reconciled.** *Controls, six:* the **"View all" link** joins the five; Padding retired. **No Tag
row:** Detail governs it. *Data:* the Data group, a 1–30 stepper, and **Order's third value,
Title A–Z** ⚑ — which closes the category's standing finding that `order` has no alphabetical value,
without coining a module.

---

### 15 · Load More

1. **Descriptor.** A thumbnail list drawn one batch at a time with a centred button below it that
   appends the next batch in place; **the only design in the category that appends content**, and one of its two that declare a module.
2. **Tuple.** `feed · none · page · variable · left · batch appended in place`
3. **Archetype.** feed. **One departure:** the set grows, and the button carries its own rule —
   auto-width and centred above 767, full width below.
4. **Responsive.** 1440 thumb 96 × 64 (96 square at Square), text to 760, meta 200; button 45 px
   tall, centred, 44 px below the last rule; count line under it · 834 meta under the title · ≤ 767
   thumb 80, **button full width**. **⚑ At Thumbnail Medium the phone draws 96, so the two settings
   converge below 767.**
5. **Fields.** As 2 Thumb Rows. **⚑ Amended: `source` is locked at This route's posts and `count` is
   not read at all** — the route's own pagination is the total. Writes
   `batchSize` and `buttonStyle` *(both shared with A17·16)*, `thumbSize`, `thumbShape` and
   **`buttonLabel`** ⚑ new.
6. **Controls.** **Batch size a stepper, 3–25, default 10** ⚑ amended — an item count is a number
   the site types, never two fixed buttons; it is the route's page size, and only the theme can set
   that number because Ghost's admin has no posts-per-page setting (recorded for the architect) —
   Button Outline · Solid · Text — **Button label**
   (`buttonLabel`, ≤ 24 ch, with an optional icon) — Thumbnail Off · Small · Medium — **Thumbnail
   shape Landscape · Square** — Rule — **Row density** — **Excerpt** — Meta — Tag — "View all" link.
   **Eleven.** **Row density and Excerpt are restored** ⚑ — their removal was 4–7-norm arithmetic,
   and every sibling has them.
7. **Data.** **⚑ Amended: the design is main-feed-only and `count` is not read at all.** Its
   Source is locked at This route's posts with the reason drawn, the other five values greyed, and
   **Ghost's route pagination is the total** while Batch size is the page the button walks. The old
   reinterpretation of `count` as a reachable total is withdrawn, which closes the category's
   first open finding. **One page's worth or fewer → no button is drawn** and the count line reads "All 5 posts
   shown". **There is no longer an archive-route exception** ⚑ amended: the design can only be
   placed on the route whose posts it draws, so the route's pagination and the button are one
   mechanism rather than two. **Pagination style is locked at Load more**, as before. 0 in the editor → three outlined rows **and the button
   in its resting state**, the only editor empty state in A18 that includes a control.
8. **Empty.** Plate at the thumbnail's box, in the set shape. **No image on any post → draws at
   Thumbnail Off rather than handing off** — the button, not the picture, is the design.
   **Exhausted → the button is replaced by the count line "All 15 posts shown"**, now **a theme
   translation-catalogue string** ⚑, and the section ends there.
9. **Module.** **`load-more`.** **No-JS degradation, quoted from the registry: "Ghost's numbered
   `/page/2/` pagination links render instead (FR-G4, explicitly)."** The first batch is
   server-rendered and complete; only the button is replaced. **Edit-safe: the module does not run
   while editing**, so the editor shows the resting state. **`infinite-scroll` refused.**
10. **A11y.** **The button is a real `<button>` and is not rendered at all without JavaScript**, so
    there is never an inert control. **Focus moves to the first new row after a batch arrives**, and
    the count line is an `aria-live="polite"` region. Button 45 px tall, full width below 767.
    **Solid's derived on-accent label measures 4.9:1** ⚑ — the fifth independent derivation of a
    colour the packs should supply. **An icon on the button is decorative and `aria-hidden`**; the
    accessible name is `buttonLabel`.

**Reconciled.** *Controls, eleven:* **Row density** and **Excerpt** restored, **Button label**
authored with an optional icon, **Thumbnail shape**, **Tag** and the **"View all" link** added;
Padding retired. *Strings:* `buttonLabel` authored with the default "Load more"; **the count and
exhausted lines are catalogue strings**, not English literals — the old "no authored strings in this
design's own furniture" ruling is overruled. *Data:* the Data group and **Pagination style locked at
Load more**. **⚑ Superseded by the post lists patch:** the design is main-feed-only, so `source` is
locked, `count` is not read, and Batch size is a 3–25 stepper rather than a reachable-total ladder.

---

## Block 1 · Component inventory

Cumulative. **Established in A18** unless another category is named.

| Component | What it is | First from |
|---|---|---|
| **List row** | Text held to an 820 measure with the meta hung right in a 200 column; A17's card fields in a full-width row | **A18** (1) |
| **Row density** | A second padding control inside the list, named Compact · Comfortable · Spacious with per-design quantities | **A18** (1) |
| **Separator vocabulary** | Off · Between rows · Boxed; one separator per design, Boxed never a default | **A18** (1) |
| **44 px row floor** | The smallest row that reads, set by A1's touch minimum rather than by the 8 px grid | **A18** (3) |
| **Single-line clipped title** | `nowrap` + ellipsis with the full string in the DOM — the library's one truncation | **A18** (3) |
| **Leading date column** | A fixed, format-sized date column at the row's head, with the author moved under the excerpt | **A18** (4) |
| **Group heading** | The eyebrow at 600 weight, 40 above / 14 below, above its group or hung in a 200 column | **A18** (5) |
| **Authored terminal-group label** | `otherGroupLabel` — the untagged group's heading as an authored field with a kept default, never a literal | **A18** (5) |
| **Thumbnail shape** | Landscape 3:2 · Square 1:1 on a fixed-size list thumbnail, the tag plate following the shape | **A18** (2, 8, 15) |
| **Inset divider** | A row rule that stops at its container's padding rather than its edge | **A18** (12) |
| **Timeline rail** | A 1 px hairline cut to the first and last markers, with an 11 px muted marker per post | **A18** (13) |
| **Leading ordinal** | A tabular numeral at the title's size in the muted colour, inside an `<ol>`, `aria-hidden` | **A18** (11) |
| **Titles-only index** | One `<ul>` flowed into 2–4 columns, read down then across | **A18** (14) |
| **Alphabetical order value** | `Title A–Z` — a third server-side `order` value, never a client sort | **A18** (14) |
| **Post card** | Image, tag, title, excerpt, meta in fixed DOM order; whole card one `<a>`; heading-font title | A17 |
| **Tag plate** | Missing-image substitute at the image's box, carrying the primary tag, `aria-hidden` | A17 |
| **Data group** | Source · Tag/Author · Hand-picked · Count · Order (+ the main feed's pagination and empty-state fields); P0·5 configured for posts | A17 |
| **Post picker** | Ghost-aware search-and-pick list storing post references; drag order is drawn order; no blank Add, remove never disabled | A17 |
| **Count stepper** | One numeric stepper, 1–100, with per-design bounds and locks drawn disabled with their reason | A17 |
| **Feed empty state** | Authored heading and body drawn by the designated main feed when its route has no posts | A17 |
| **Universal trio** | Background role · Vertical spacing · Top divider, outside every design's own control list | A17 |
| **Load-more button** | Outline / Solid / Text, 45 px, 24 px radius, centred, full-width below 767; three states; authored label with an optional icon | A17 (16) |
| **On-contrast derivation** | `color-mix` toward the band's own text: muted 60% · hairline 10% · plate 7% | A17 (7) |
| **Editor count line** | "N posts match. M drawn." plus the design's own advice | A17 |
| **Section head** | Eyebrow · title · sub · note · link; all optional, link as a pair, target Matches the query · Custom | A1 |
| **Meta row** | Name · date · reading time at 13 px muted | A1 (A1·6) |
| **Focus ring** | 2 px accent ring at 4 px offset on the whole interactive box | A6 |
| **Split layout** | Head column beside a content column, `grid-column` move rather than `order` | A8 (A8·6) |
| **Panel** | A surface or outline container at a 48 px inset, with Head Inside · Outside | A17 (17) |
| **Cell divisions** | Two 636 · Three 416 · Four 306 on a 24 gutter across 1,296 | A10 |
| **Named ratio ladder** | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5, never computed | A8 (A8·8) |
| **Striped image placeholder** | 45° two-tone stripe with a mono caption; frames only, never shipped | A1 |
| **Short-last-row rule** | Orphan keeps its width and sits at the left; never rebalanced | A12 |
| **Inline text toolbar** | Bold · italic · underline · link, the link popover carrying Open in new tab and rel nofollow / noreferrer / sponsored | P0 (P0·1) |
| **Icon slot and Icon Picker** | The optional icon before or after a button's label, with its size and colour-role popover | P0 (P0·2) |

## Block 2 · Shared field list

**Twenty-four**, counted as the schema counts them.

**Authored on the section — six.** All optional. `eyebrow` text ≤ 26 · `title` text ≤ 104 ·
`sub` text ≤ 178 · `note` text ≤ 120 · `linkLabel` text ≤ 24 · `linkUrl` url. **The link pair is a
pair**, and its target is `linkTarget` (Matches the query · Custom). **There is no `image` field on
an A18 section.** **Every one of these edits inline** with P0·1.

**The Data group — eight.** `source` enum req (six values, **Hand-picked** among them) ·
`filterValue` ref opt · **`postRefs` ref[] opt** · `count` int req (**a stepper, 1–100, per-design
bounds**) · `order` enum req (**three values at 14 Index**) · **`paginationStyle` enum opt** and
**`emptyHeading` / `emptyBody` text opt**, main feed only.

**Read from each post — ten, three optional.** `title` req · `url` req · `published_at` req ·
`reading_time` req · `feature_image` + `feature_image_alt` opt · `primary_tag` opt ·
**`excerpt` opt** ⚑ (the custom excerpt where authored, Ghost's generated plaintext otherwise) ·
`primary_author` req (name req, `profile_image` opt) · `featured` stored and **drawn by no A18
design** · `visibility` read and never drawn.
**⚑ `profile_image` is read by no A18 design either** — a 24 px avatar in a hung meta column or
under a title is a second identifying object beside a thumbnail or a date, which is also why **A17's
fifth Meta value, With photograph, does not cross into A18**. It stays in the union because A17 and
A21 use it, and the union is what makes switching safe.

**Per-design fields — twenty-six.** `rule` · `rowDensity` · `excerpt` · `meta` · `tag` are shared by
most; `thumbSize` · `thumbShape` · `titleSize` · `author` · `columns` by two or three each; and
`metaPosition` · `dateStyle` · `groupBy` · `headingPosition` · `otherGroupLabel` · `headSide` ·
`band` · `card` · `alignment` · `leadLayout` · `leadRatio` · `followerStyle` · `numberStyle` ·
`panelEdge` · `headPosition` · `marker` · `datePosition` · `detail` · `trailing` · `batchSize` ·
`buttonStyle` · `buttonLabel` by one each. **`padding` is gone from all fifteen**, retired into the
universal Vertical spacing.

**Why the union is short.** Nothing here is authored except the six head fields and two per-design
strings, so **"content preserved across a design switch" means the query is preserved** — and the
query is what the user owns.

---

## Findings for the architect

### Closed by the controls-reconciliation pass

- **1 · `count`'s values are per-category.** Closed. Count is one stepper, 1–100, with per-design
  bounds; the two ladders were two guesses at the same number.
- **8 · `order` has no alphabetical value.** Closed. **Title A–Z** is a third server-side `order`
  value, drawn at 14 Index, the one design in the library that wants an alphabet.
- **A18 had no authored strings and shipped English ones.** Closed. `otherGroupLabel` and
  `buttonLabel` are authored with kept defaults, and 15 Load More's count and exhausted lines are
  catalogue strings. **A18 previously shipped no catalog string at all.**
- **The main feed's zero state.** Closed as in A17: it renders an authored empty state and carries
  A34's Pagination style on its own sidebar, with 15 Load More locking that select.
- **12 Panel's fixed meta.** Closed by removal of the fixture: the standard enum ships with Name and
  date as its default and the wrap at the third value is disclosed.

### Still open

1. **Closed by the post lists patch.** 15 Load More no longer reinterprets `count`: the design is
   main-feed-only, the route's pagination is the total, and `count` is not read there. **The field
   means the same thing in all fifteen designs.** What replaces it is a smaller question, below:
   Batch size is the route's page size, and only the theme can write that number.
2. **A control name is not a field.** `rowDensity` carries five different value sets across A18,
   `thumbSize` three, and now `order` carries three values in one design and two in fourteen. This
   generalises A17's "one image field or three?".
3. **A pack-level `on-contrast`, `on-contrast-accent` and `on-accent`.** Five designs across the two
   categories derive one independently. **The strongest finding, restated.**
4. **Tabular figures are a pack requirement**, needed by A17·10 and A18·11 and statable nowhere.
5. **The post card's DOM order now has four exceptions** — A17·9, A18·4, A18·9, A18·13 — and they
   should be written into the card rather than left in four design specs.
6. **The card's "never truncated" promise has one exception**, A18·3, and the same applies.
7. **No module covers a client-side sort** (A17·10, A18·4) — the same gap, named twice, and
   deliberately not closed by 14 Index's server-side value.
8. **Two designs are measurably weaker in dark** — 8 Row Cards and 12 Panel — because the shadow is
   dropped and Paper's surface step is modest. A pack-level dark elevation would fix both.
9. **The main feed needs to be *designated*.** "This route's posts on a paginated template" is a
   template fact, not a section setting; the builder has to tell the section which it is, or the
   empty state and the pagination select cannot be shown conditionally. **A17's finding, unchanged
   and now load-bearing in two categories.**
10. **`postRefs` needs an ordering contract in the schema.** Drag order is drawn order in the
    editor; the template must be handed the references *in that order* rather than re-sorting them
    by `published_at`. Ghost's `#get` helper does not preserve an arbitrary order for free — and
    **11 Numbered draws an ordinal over whatever order it is handed**, so a silent re-sort would
    renumber the list.

---

## Reconciliation notes

**Frames changed in this pass — sixteen.** `A18-0 Category Proof` and **all fifteen control-panel
frames**: `A18-1 Rows`, `A18-2 Thumb Rows`, `A18-3 Slim`, `A18-4 Dated`, `A18-5 Grouped`,
`A18-6 Split Head`, `A18-7 Contrast Band`, `A18-8 Row Cards`, `A18-9 Big Type`,
`A18-10 Lead and List`, `A18-11 Numbered`, `A18-12 Panel`, `A18-13 Timeline`, `A18-14 Index`,
`A18-15 Load More`.

**What changed on A18-0.** Settlement 1 amended (Row density sits beside the universal Vertical
spacing, and the per-design Padding row is gone), settlement 2 amended (Thumbnail shape),
settlement 3 amended (`otherGroupLabel`, and the `{{date}}` locale confirmation), settlement 4
amended (the main feed's empty state, the Count stepper closing the ladder finding, and Pagination
style as a control on the feed); the Posts block redrawn as **the Data group** with Hand-picked, the
post picker, the Count stepper and the main-feed sub-block; the shared field list updated to
twenty-four; the per-design field paragraph updated with the five new fields and the retired one; and
one new card, **the six rules this pass put on every design**.

**What changed on all fifteen panels.** The **Padding** row retired into the universal **Vertical
spacing**, drawn outside the design's list with **Background role** and **Top divider**. The Posts
summary replaced by the full **Data group** (P0·5 "Populate from…" configured for posts) with
Hand-picked, the post picker, a per-design **Count stepper**, the Order row and the main-feed
sub-block. Three new groups added under it — **EDITING · the P0 primitives**, **BEHAVIOUR · from the
fixed registry**, **DATA · Ghost's surface, and what A18 refuses** — and a **⚑ RECONCILED** card
added to every spec frame. **No Preview control existed to remove** anywhere in A18.

**Frame-by-frame.** **Tag Show · Hide** added on **1, 2, 4, 6, 7, 8, 10, 11, 12, 13, 15**;
**excepted with a stated reason on 3** (Trailing governs it), **9** (the Meta enum, after A17·9),
**14** (Detail governs it) and **5** (Group by governs it at Tag). **"View all" link** (Matches the
query · Custom) added on all fifteen. **Thumbnail shape** added on **2, 8, 15**. Per design: **5**
gained the authored **"Everything else" label** and the `{{date}}` locale confirmation; **7** had
Background role **locked at Contrast**, Top divider **locked None**, and its 80 · 96 · 132 kept as
Vertical spacing's resolution; **8** kept **Row density** as its card-padding ladder; **9** got a
stepper whose maximum is advisory; **12** gained the standard **Meta** enum and lost its fixture;
**14** gained **Title A–Z** on Order; **15** gained **Thumbnail shape**, an authored **Button label**
with an optional icon, **Row density** and **Excerpt** restored, catalogue strings, a stepper on the
reachable total (**since superseded** — see the post lists patch), and **Pagination style locked at
Load more**.

**Primary section frames redrawn: none.** Every item in this pass changed a control, a rule, a
binding or a string rather than a drawing: the new controls all ship at the value the frames already
drew — Tag Show, Thumbnail shape Landscape, Excerpt Off on 15 Load More, Meta Name and date on
12 Panel, `otherGroupLabel` at its kept default. **Two frames were re-labelled** rather than redrawn:
**7 Contrast Band's** padding caption now reads *Vertical spacing 80 · 96 · 132*, and **15 Load
More's** exhausted-state caption names the count line as a catalogue string.

### Where this pass overruled the category's own rulings

- **"The user does not author the set: no repeater, no Add, no Remove, no drag handle anywhere in the
  category."** Amended. A picker that stores references and orders them by drag is not a repeater,
  and picking is not authoring. Every other refusal stands.
- **"Zero published → the section does not render."** Amended for the designated main feed only.
- **"A34 attaches below, and the section boundary is the seam."** Amended: on the main feed
  Pagination style is a control in the Data group, and **15 Load More locks it**.
- **"Row density is a second control beside the section's Padding."** Amended: beside the universal
  **Vertical spacing**, and the per-design Padding row is gone from all fifteen.
- **"7 Contrast Band's Padding at 80 · 96 · 132."** Withdrawn as a row, kept as Vertical spacing's
  resolution — A17·7's treatment.
- **"Every list thumbnail is Landscape 3:2."** Overruled: the shape is a control on the three designs
  that draw a thumbnail, and the plate follows it.
- **"Untagged posts fall into a group headed 'Everything else'."** Kept as the default, overruled as a
  literal: it is `otherGroupLabel`, authored.
- **"No Meta control: fixed at Name and date, the only fixed meta in A18" (12 Panel).** Overruled — a
  measurement is not a reason, and the wrap is disclosed instead.
- **"No Row density and no Excerpt — the module's two controls took their places" (15 Load More).**
  Overruled: that was 4–7-norm arithmetic, and both are restored.
- **"The excerpt binds `custom_excerpt`."** Overruled for every A18 design: it binds `excerpt` with
  Ghost's generated fallback, because **nothing in A18 frames an excerpt** and a site that never
  authors one would otherwise get bare lists in eleven designs.
- **"The Show ladder is 5 · 10 · 15 · 25."** Overruled by the stepper.

### Conflicts recorded rather than resolved

- **The patch lists eleven designs for Tag Show · Hide and 5 Grouped is not one of them.** At Group
  by Month, Year or Nothing its rows still draw a tag eyebrow with no way off. The item's list was
  followed; the honest reading is that 5 Grouped has the same gap as the eleven, and closing it would
  give the design two controls that both hide the tag. **Recorded here for the architect to pick.**
- **Rule 2 asks for per-design minima, maxima and locks on Count; 9 Big Type has no honest maximum.**
  The category's own ruling — "the count line carries the warning and does not cap Show" — survives,
  so its stepper is bounded only by the category's ceiling. The bound is advisory there and hard
  everywhere else.
- **The patch asks only that `linkUrl` open the Link Picker with a "Matches the query" auto target;
  the panels draw a counted control called "View all" link.** The values and the behaviour are the
  patch's; the row and its name are A17's, so a user switching between the two categories finds the
  same control in the same place.
- **A17's fifth Meta value, With photograph, is not added in A18.** The patch does not ask for it and
  the category refuses `profile_image` with a drawn reason. Recorded because the two categories'
  Meta enums now differ by one value.
- **Rule 9 asks for Member visibility on CTA-bearing designs. A18 ships none.** Every action in the
  category is navigation — a row, a head link, a load-more button — and a list that hid itself from
  logged-out readers would hide the site's writing rather than an offer. Recorded rather than added
  as fifteen rows nobody should use.
- **Rule 10 asks for Image focus on every image field. A18 authors no image.** The four designs that
  draw a picture draw the post's `feature_image` at a named box; the focal point belongs to the post,
  in Ghost.
- **Rule 11's button icon reaches one design.** Only 15 Load More has a button. The head link is text
  with an accent underline, and an icon on it would make it look like one.
- **12 Panel's 48 px inset is not a control, where A17·17 keeps Inset as a ladder.** Here the row
  dividers stop at the inset, so a second ladder would move the dividers rather than the padding. A
  deliberate divergence between two designs that share `panelEdge` and `headPosition` by name.
- **The count stepper's ceiling is 100 and no A18 design is honest past 30.** The per-design bounds
  are the truth; 1–100 is only the widest of them.
- **No module name was coined.** 14 Index's alphabetical order is server-side, and the client-sort gap
  stays named and unowned. `infinite-scroll` stays refused category-wide.

---

## Patch notes — post lists patch, 28 August 2026

Every change below carries the **name** of the rule that required it. Rules are named and never
numbered: the letter-and-number labels elsewhere in this project are filing codes and say nothing
about what a rule requires.

**Frames updated — all sixteen.** `A18-0 Category Proof` (the roster gains a **[Free]** badge on
1 Rows and 3 Slim and a header note saying the pick is awaiting confirmation; settlement 3 amended
for the grouping script; the Count settlement's "one design changes what Show means" replaced by its
closure; the behaviour paragraph now names two modules and thirteen — not fourteen — pixel-identical
designs) and every design frame `A18-1` … `A18-15`, each of which gained a **POST LISTS PATCH**
card stating in one line each what changed on that frame and which rule required it.

**Redrawn beyond captions: one frame.** `A18-5 Grouped` gains a new drawn state — **the grouped
list beside the flat, ungrouped list it renders without JavaScript**, at a 620 px crop each, with
the reason and the outline note under them. Nothing else moved: no layout, type scale, colour pack,
spacing value or drawn state was changed anywhere in the category. Two controls were redrawn in
place: **15 Load More's Batch size** as a stepper where it drew Five · Ten, and **its Source row**
as a locked value with the reason beside it.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **No design ever turns into another design** | **Three deletions.** **2 Thumb Rows** no longer draws 1 Rows when no post in the set has a picture: the section **hides what does not apply** — the thumbnail column is not drawn and 168 px goes back to the sentence — and the panel may say that 1 Rows is the same arrangement without the column. **10 Lead and List** no longer draws 1 Rows either: the lead simply has no picture and the followers are unchanged. **7 Contrast Band** no longer "prints as 1 Rows on white": the band is not printed and the rows print on white at the same measure with the same rules, so the design loses its ground rather than its identity. Every remaining cross-reference in the category was checked and is advice — 3 Slim naming 9 Big Type at one post, 6 Split Head's "this design needs a title", 12 Panel suggesting Panel Outline, 13 Timeline naming 4 Dated, 14 Index advising Columns Two, 1 Rows naming 7 Contrast Band at Background role Contrast. Advice, never a switch. |
| **The grouped list needs a small script** | **5 Grouped declares `group-headings`**, the registry's — Ghost's templates cannot tell that the month changed between two posts, because there is no arithmetic in a template and no access to the previous item inside a loop. The module reads each row's `<time datetime>`, or its tag at Group by Tag, and cuts a heading in wherever the value changes. **Without JavaScript the list renders flat and ungrouped:** every post present, in the set's order, **each row with its own date as drawn**, **no group heading and no group date at all**, and no group gap or empty space where a heading would have been — **the owner's ruling of 28 August 2026**, in preference to promoting the dates to their full format. That state is **drawn on the frame** and stated at the Group by row. The outline is correct in both: server-side each title is an `<h3>` under the section's `<h2>`, and the module re-levels the titles it groups to `<h4>` as it inserts each `<h3>` heading. **No module name was invented.** |
| **The numbered list restarts on every page** | **11 Numbered** now says so: Ghost cannot continue a count across pages, so on `/page/2/` the first row is 01 again. Written on the behaviour line, on the Order row's advice line and in this document. The existing advice — "for a fixed set, use a tag and Oldest first" — is where a site avoids ever having a second page, and it did not need changing. |
| **Load more is main-feed-only** | **15 Load More is removed from every other placement.** Its `source` is **locked at This route's posts** with the reason drawn and the other five values greyed beside it, because the button walks Ghost's route pagination; a site that wants a thumbnail list somewhere else uses 2 Thumb Rows. Two consequences: the old **archive-route exception is gone** (the section can no longer behave one way on one route and another elsewhere), and **`count` is not read there at all**, which ends the one place in either category where a shared field meant something different in one design. |
| **Item counts are a number picker** | **15 Load More's Batch size becomes a stepper — 3–25, default 10** — where it drew Five · Ten. Count was already a stepper everywhere, with per-design bounds drawn disabled and their reasons visible. **Two rows were checked and left as named values:** 3 Slim's **Columns One · Two** and 14 Index's **Columns Two · Three · Four** are layout choices — each value is a drawn column width, checked against a long title — not a number of posts. Recorded rather than decided, as A12's identical row was. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fifteen. The swatch row is **Base**; **there is no "Inherit" value anywhere in A18**; no shared control is renamed or given a value it lacks elsewhere; and every narrowing shows its reason — 7 Contrast Band's Background role locked at Contrast and Top divider locked None, 12 Panel's Rule without Boxed (absent, with the reason, rather than disabled), 14 Index's Title size Medium unavailable at Columns Four, 8 Row Cards without a Rule row, 3 Slim without Excerpt, Meta or Tag, 5 Grouped without Excerpt or Tag, 9 Big Type without Excerpt or Tag, 13 Timeline without Rule or Meta, and now **15 Load More's locked Source**. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest, picture-independent designs — **1 Rows · 3 Slim · 4 Dated · 11 Numbered · 14 Index** — and recommended **1 Rows and 3 Slim**, and **the owner confirmed both on 28 August 2026**. Badged **[Free] — confirmed** on the proof frame's roster and written in §0 as the line the merge reads: **`**[Free] designs:** 1 Rows · 3 Slim`**. |
| **Avatars with no photograph** | **No subject.** A18 draws no person: `profile_image` is read by no design in the category, no initials block exists anywhere in the fifteen, and A17's fifth Meta value — With photograph — deliberately does not cross into A18. Recorded so the absence is a decision rather than an oversight. |
| **The Remove button never greys out** | **No subject, and nothing to fix.** Nothing in A18 is authored as a repeating list: there is no repeater, no Add that creates a post and no Remove that deletes one. The post picker at Source: Hand-picked has no minimum — remove is visible and clickable at every count, and removing the last reference empties the set. |
| **Slider labels** | **No subject.** A18 draws no slider. Every control is a named-value row whose title says what it affects — Rule, Row density, Excerpt, Meta, Thumbnail, Date style, Marker — and whose values reuse the standard words. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A18 has no gap control. **Row density is padding**, not a gap — it sets the space inside a row, and Compact · Comfortable · Spacious are the standard padding words; 8 Row Cards' 16 px gap between cards is fixed and is not a control. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** Every action in A18 is navigation: the row, the head link, and 15 Load More's button. There is no subscribe button, no paid tier and no Portal link in the category, so there is nothing to make conditional. Member visibility is offered nowhere, and that refusal is recorded in §0. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A18 contains no subscribe or sign-in form, so there is nothing for the notice to replace, and the category never promised a form worked without JavaScript. The per-design no-JavaScript line is restated on every frame instead: **thirteen designs are pixel-identical with script off**, **5 Grouped** renders flat and ungrouped, and **15 Load More** renders Ghost's numbered `/page/2/` links in place of its button. No post is lost in either. The sent, error and loading states elsewhere in the library are untouched. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Open questions for the architect — where a ruling could not be applied without inventing a decision

1. **Settled by the owner, 28 August 2026: Batch size is the theme's `posts_per_page`.** It lives
   in the theme's `package.json`, Ghost's admin has no such setting, and **it is site-wide rather
   than per section** — one number for every paginated list. The control stays a number picker and
   **the row discloses that changing it changes every paginated list on the site**. What remains for
   the architect is mechanical: a section control writing a theme-package value needs a path.
2. **`group-headings` has no written contract.** The registry names the module; it does not say
   whether the module may re-level a heading. This pass assumed it inserts each group heading as an
   `<h3>` and steps the titles it groups to `<h4>`, because that is the only arrangement whose
   outline is correct both with the script and without it. If the module may not touch heading
   levels, the flat state is still correct and the grouped state announces two `<h3>` peers.
3. **Column counts: layout or item count?** 3 Slim's Columns and 14 Index's Columns are drawn
   widths, so the number-picker rule was read as not applying. The same reading was recorded in the
   About and Team category and is still unresolved across the library; it should be settled once,
   not per category.
4. **Carried forward, unchanged by this pass:** the pack-level `on-contrast` / `on-accent`
   derivation (five independent derivations now), tabular figures as a pack requirement, the post
   card's four DOM-order exceptions, the single truncation exception, the missing client-side sort,
   dark elevation for 8 Row Cards and 12 Panel, the main feed needing to be *designated*, and
   `postRefs` needing an ordering contract.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
   fifteen designs, no gap and no renumbering in this category.
2. **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Rows** and
   **3 Slim** — both of which exist in this category's roster, and both **confirmed by the owner on
   28 August 2026**.

### The owner's answers — 28 August 2026

1. **The two free designs are 1 Rows and 3 Slim.** Confirmed; §0's line names them and the roster
   badges read **[Free] — confirmed**.
2. **The grouped list without JavaScript shows no group dates at all** — no headings, no heading
   dates and no extra space. Each row simply carries its own date, as the design already draws it.
   The alternative of promoting those dates to their full format was declined.
3. **Batch size is the theme's `posts_per_page`**, in `package.json`, site-wide, and not a Ghost
   admin setting. Recorded on the frame, in design 15's entry and in the architect's list above.

**No questions remain open in this category.**
