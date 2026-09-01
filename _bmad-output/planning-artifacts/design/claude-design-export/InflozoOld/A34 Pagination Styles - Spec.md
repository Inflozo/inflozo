# A34 Pagination Styles — written specification

10 designs · Paper pack · drawn 23 August 2026 · controls reconciled 25 August 2026 · **design patch pass 29 August 2026**

**Design patch pass — 29 August 2026 (this document's current state).** Three rulings landed on this category and two of them deleted drawn content. **A theme's templates cannot count through a range of numbers**, so **Numbers All pages is deleted** from 1, 3 and 4 — and the seven-slot window survives precisely because every number in it is handed over by the route rather than worked out. **They cannot multiply either**, so **Post range leaves the Pager block** and Position line reads Off · Page count in all ten; 5 Counter, 8 Contrast Band, 10 Slim and 3 Bar each lost drawn content to that. **Ghost's admin has no posts-per-page field**, so the read-only door in every panel now points at INFLOZO's own theme settings. Three more values went the same way — 5 Counter's **Numerals Padded**, 9 Cards' **Content Direction, page and count**, and 7 Endless's **Stop after Never**, whose row of fixed buttons became a number picker. **Nothing was renumbered.**

**[Free] designs:** 2 Prev and Next · 9 Cards

*(Shortlisted in this pass and **confirmed by the owner on 29 August 2026**: the two designs that draw no page numbers at all — the quietest and the easiest to hit.)*

The frames are `A34-0 Category Proof.dc.html` and `A34-1` … `A34-10`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Reconciled 25 August 2026, the controls pass.** A34 is no longer a canvas object: the ten designs
are the values of a **Pagination style** Named Select on the designated main feed's sidebar; the
per-design **Padding** row is gone from all ten, being the feed's Vertical spacing under a second
name; and every visitor-facing string is a theme translation-catalog string rather than an authored
field. **Every drawn arrangement survives unchanged** — only the surface moved. What changed, and
where it contradicts something this file already ruled, is listed at the end under **Reconciliation
notes**.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A34·4 in three packs, light and dark), the attachment proof, the stress frame and the roster. The
shared field list is repeated below as Block 2 because the build reads it.

---

## 0 · The category layer

### What A34 is

Ten arrangements of the same four facts — **where you are, how much there is, the way forward, the
way back** — attached beneath a feed. A17 and A18 both end with the same sentence: no design in
either draws page numbers, a next link or a range; **A34 attaches below and the section boundary is
the seam.** This is that category, and it closes that seam.

**A34 owns no query, and it is the only collection category in the library that does not.** Every
other has a Posts block — Source, Tag/Author, Show, Order. A pager has none of them, because it does
not choose posts: **it reads the route's `pagination` object and draws what is already true.** That
single fact shapes everything. There is no repeater, no item list, no Show ladder, **no
posts-per-page control** (that is `posts_per_page`, set once for the site in **INFLOZO's own theme
settings** — Ghost's admin has no such field — stated in the panel as a read-only line that links
there, so the hunt ends at a door rather than a wall), and — after the reconciliation pass — **nothing a user authors at all**: the
five short strings are translation-catalog strings, edited once per language.

**A17, A18 and A19 are inherited whole:** A1's nav item, icon button and eyebrow, A1·2's 38/44 box
geometry, A1·5's pill, A1·14's icon-button variants, A6's focus ring, A17's content measure, page
margin, row gap, cell divisions, count line and load-more button, A17·7's on-contrast derivation and
raised Compact padding, A17·18's inset focus ring, A18·15's rules for focus after a batch and
against inert controls, A19·13's band discipline. **A34 adds no new geometry** — settlement 3 is
built entirely out of numbers A17 already had.

### The four settlements (§8)

**1 · Numbered pages, load more and infinite scroll, and which are honest about position.**
**Numbered pages are the honest ones, for one mechanical reason: the URL changes.** A reader on
`/page/6/` can bookmark it, send it, leave and come back. **Load more and infinite scroll cannot say
where a reader is** — after two loads there is no page they chose — so those two designs say what
they can say instead: **how much you have seen**, "24 of 132 posts", and never a page number; their
Position line block field is fixed Off. **Eight of the ten are link-based and declare no module.**
**1 Numbers is the category default** and is what a section falls back to when a design is switched.

**⚑ A34 declares `infinite-scroll` where A17 and A18 both refused it, and that is a difference
rather than a reversal.** Those categories refused it inside a feed that owns a query with a Show
value — auto-loading past Show makes the control a lie. **A34 owns no query,** so the mechanism has
the route's own pages to walk. **Two conditions make it acceptable and both are drawn:** it stops,
by default after four pages, handing the rest to 6 Load More's button; and **the numbered links are
in the markup on every render** — `.visually-hidden`, never `display:none` — so the no-JS branch,
the crawler and the screen-reader user all get real pages. **Both module designs carry a standing
warning in the panel**, above their controls.

**2 · First, last, current and disabled states, and a two-page feed.** **Current is A1·1's active
nav item unchanged:** `text` at 600 with a 2 px accent underline, `aria-current="page"`, **never a
link**. 4 Pill is the one exception (a filled inner pill; an underline against a container's edge
reads as a defect). **At the archive's ends the Pager block offers two answers and neither renders
an inert control: Hidden** — default in six designs — **reserves the slot's width so nothing else
moves**; **Dimmed** — default in the four designs with a ground or container — draws the spent side
as a `<span>` at the muted-border step. **There is no `disabled` attribute anywhere in A34**;
A18·15's rule is kept by making the thing not a control. **9 Cards is the single exception to the
no-movement rule** and says so: its surviving card takes the full measure, because 636 px of empty
ground beside a card is worse than a layout that changes.

**A two-page feed is drawn on every design** (the Transport tag, 19 posts) and **no design has a
special case for it** — the window simply never appears below seven pages. **One page renders
nothing at all, in all ten**; in the editor the design draws its outline greyed with one line naming
the cause.

**3 · How it attaches beneath A17 and A18 without inventing new spacing.** **Both gaps A34 can sit
in already exist in A17's floor and A34 adds no third.** The Pager block's **Attachment** field
picks between them. **Joined** — default in eight designs — renders the pager **inside the feed's
own container, 48 px below the last row: A17's row gap**, on the feed's page margin and content
measure, so the pager's elements line up with the grid's columns. **Separate** makes it its own
section on the page ground with **the feed's own bottom padding above it, 96 at Comfortable**.
**8 Contrast Band defaults to Separate** (a 1,440 px inverted band 48 px under a grid reads as a
fourth row). **No design carries a Padding control of its own** ⚑: the space below the pager is the
feed's **Vertical spacing** — Compact 64 · Comfortable 96 · Spacious 132 — and the space above is
Attachment's. Where a responsive rule below says "padding 80" or "padding 64" it is naming the feed's
Vertical spacing at that width, not a pager control.

**4 · Announcing newly loaded items to assistive technology.** **Eight designs announce nothing — a
page navigation announces itself** and a live region would speak over the browser. **The two module
designs each carry one visually-hidden `aria-live="polite"` region reporting the count, not the
titles:** "12 more posts loaded. Showing 24 of 132." **A live region reciting twelve headlines is
worse than silence.** **Focus is where the two differ, and the difference is whether the reader
asked:** **6 Load More moves focus to the first new post's link** (A18·15's rule, unchanged, because
a button was pressed); **7 Endless does not move focus on an automatic load** ⚑. **7 Endless also
keeps a real `<button>` in the flow from the first render, visually hidden until it takes focus** —
the skip-link pattern — so a keyboard or switch user tabbing past the last post finds a control
rather than an infinite surface.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The page link.** A1·1's nav item at 15 px: muted at rest, `text` with a 2 px accent underline at
  160 ms on hover, `text` at 600 with the underline when current. **A 38 px box on a 44 px target**
  (A1·2's geometry); 40 inside a pill or band; 44 below 767. **8 Contrast Band sets it at 17** — the
  only size change in the category.
- **Tabular numerals everywhere** ⚑ so a row does not change width between page 9 and 10. A17·10
  named this as a pack requirement it could not state; **A34 is the category that depends on it.**
- **The ellipsis.** A `<span>` one step below muted — `#C4BEB3` light, `#4E4740` dark, both derived ⚑
  — `aria-hidden`, not focusable, **never a jump-to-page control.**
- **The window.** first · previous · current · next · last, ellipsis wherever that skips. **Seven
  slots maximum**, so an 80-page archive draws the same row as an 11-page one — and a 137-page one.
  Appears only above seven pages. **It is the only page-link row in the category, because it is the
  only one that can be built:** its five numbers are 1, `pagination.prev`, `.page`, `.next` and
  `.pages`, all handed over by the route, and the ellipsis is a comparison between two of them. **A
  row of one link per page would need the template to count through a range, which it cannot do** —
  which is why All pages was deleted from 1, 3 and 4 in the patch pass.
- **The directional link.** 15/600 with a 19 px glyph at a 10 px gap. **A glyph is never a link's
  only name** — at Labels Glyphs only each keeps visually-hidden text. `rel="prev"` / `rel="next"`
  always.
- **The position line.** 13 px muted, tabular: "Page 2 of 11". **Below 767 it moves into the row at
  15/600 in the six designs that drop their numerals.** **A range of posts — "Posts 13–24 of 132" —
  is not available:** it needs `(page−1)·limit+1`, and a template cannot multiply. The two module
  designs state "24 of 132 posts" instead, which their script counts.
- **Measure and margin.** A17's: content 1,296 on a 72 px page margin; 754 at 40; 350 at 20. **Every
  band is full bleed and every band's contents keep the page margin** (A17·7).
- **Vertical spacing is the feed's, not the pager's** — Compact 64 · Comfortable 96 · Spacious 132;
  80 at 834; 64 at 390; governing the space below only. Under 8 Contrast Band the feed's Compact is
  raised to 80 (A17·7). **10 Slim reads best at Compact and its panel advises it** ⚑ rather than
  setting a value it does not own. **Two ladders are genuinely different, keep their own names and
  stay per-design: 3 Bar's Height (a strip height) and 8 Contrast Band's Band height.**
- **Accent, twice at most and usually once:** the current page's underline and A6's focus ring.
  Three designs spend it differently and each says so — 6 Load More's Solid button, 4 Pill's
  hover-surface fill, 8 Contrast Band's underline disabled in dark. **2 Prev and Next and 10 Slim
  spend none at rest.** **No numeral is ever accent-filled.**
- **No heading, in any design** ⚑. `<nav aria-label="Pagination">`, no level, so the feed's h2/h3 is
  undisturbed. Page links in an `<ol>`; two links need no list.
- **Targets 44 px at every width, with no exception.** 6 Load More's optional jump row was drawn at
  26 px and is now the category's own page link — 15 px in a 38 px box on a 44 px target, 44 outright
  below 767 — so the floor A34 set for itself is unbroken.
- **Focus** is A6's ring at a 4 px offset, inset to −4 inside a pill or a scrolling band (A17·18).
  **On a contrast band it takes the band's own text colour**, not accent.
- **Dark.** A17's step inherited: ground `#171511`, surface `#211D17`, hairline `#332E27`. **Two
  things are re-decided rather than inverted: warm shadows are dropped** (near-black on near-black is
  nothing, so 4 Pill and 7 Endless rely on hairlines and lift) **and the hover-surface step is
  derived at `#2C2721`** ⚑, which three designs depend on and no pack records.
- **Below 767, six designs drop their page links** and the position line takes their job between two
  44 px chevrons. **Every element that leaves has a stated destination.** Nothing is exempt: the one
  setting that was, Numbers All pages, is deleted.
- **Print: links absent, position line kept**, in all ten. **5 Counter prints as itself**, worded, at
  22 pt with the site title; **8 Contrast Band prints its own numerals on white**, the band dropped (A17·7); **7 Endless
  prints nothing.**

### The Pager block

**Four fields, identical in all ten, under the Pagination style select and counted toward no
design's total.** It is A34's replacement for the Posts block. **Two read-only rows sit with them:
Pager wording**, which opens the theme's translation catalog where all twelve pager strings live,
and **Posts per page**, which states the current value — 12 — and **links to INFLOZO's theme
settings**, so the search for the one control that is not here ends at a door. **Ghost's admin has
no posts-per-page field**, which is what the patch pass corrected: the old link went nowhere.

| Field | Values | Default |
|---|---|---|
| Attachment | Joined · Separate | Joined (Separate in 8) |
| Labels | Newer and older · Previous and next · Glyphs only | Newer and older |
| At the ends | Hidden · Dimmed | Hidden (Dimmed in 3, 4, 5, 8, 10) |
| Position line | Off · Page count | Page count (Off in 5, 6, 7, 9) |

**A design may do five things to a block field and no more:** **narrow** its value set with the
removed value shown disabled and the reason; **set** its default with the reason in the panel (3 Bar:
At the ends Dimmed); **lock** it to one value, drawn greyed (4 Pill: Labels Glyphs only; 2 Prev and
Next: Position line, Off disabled so Page count is all that is left); **mark it inert** for the
design (5 Counter, 6 Load More and 7 Endless); **interpret** it (10 Slim draws only the first word of
each label). **Four of the five are drawn: narrowing has no example left in A34**, Position line
having two values after the patch pass. **A design may never
add a value**, and a design control may depend on a block field but never write one (9 Cards' Single
card reads At the ends).

### Repeating items

**There are none, and this was checked against all ten content models.** ⚑ **No field in A34 is an
array the user authors, and no design draws more than one of anything a user made.** The page links
belong to the route; the two directional links are fixed at two by every design that has them. So
**there is no Add, no Remove, no reorder, no minimum or maximum item count and no per-item editing
anywhere in this category**, and the brief's item-control section does not apply. **And a pager is not selected on the canvas at
all** — it is the value of a select on the feed's sidebar — **so it now authors nothing.** The five
strings — `navLabel`, `newerLabel`, `olderLabel`, `moreLabel`, `endLabel` — are catalog strings, so
there is no text field, no icon slot and nothing inline-editable anywhere in A34; clicking a pager
label in the editor opens the catalog rather than a caret.

### The content

**Orbit Weekly's archive: 132 posts, 12 a page, 11 pages, and every frame is drawn on page 2** — the
page where a pager has a live link in both directions and its position line is not a special case.
**12 a page is Ghost's `posts_per_page`.** **The two-page route is the Transport tag: 19 posts, 2
pages**, drawn on all ten. **The stress route is 1,644 posts over 137 pages**, used once.

**The feed above the pager is A17·1 Three Up**, showing its last row — posts 22, 23 and 24, which are
Orbit Weekly's second, third and fifth from A17's and A18's own six. **It is context, not content**;
the pager draws none of it, and it is in the frames because settlement 3 cannot be shown without it.
Its image crops are shortened to keep the frames readable and are labelled where that happens.

**⚑ Nothing here is real.** Orbit Weekly does not exist; the archive size, the tag, the page count
and the post counts are invented, and the reading of Ghost's `pagination` object is from its
documented shape rather than from a running site.

### The roster

| # | Design | What it is for | Tuple | Module | Ctl |
|---|---|---|---|---|---|
| 1 | **Numbers** | The default. First, last and the pages either side, in one click. | `nav · none · page · variable · none · windowed numbered links` | none | 4 |
| 2 | **Prev and Next** **[Free]** | Two links at the content edges. No numbers. | `nav · none · page · few · none · facing links at the margins` | none | 4 |
| 3 | **Bar** | A surface strip holding all three facts at once. | `bar · none · surface · variable · none · full-width strip` | none | 4 |
| 4 | **Pill** | The pager as one raised object. Short archives. | `nav · pill · page · variable · none · one floating pill` | none | 4 |
| 5 | **Counter** | Position at display size. The category's one moment. | `stack · none · page · few · none · position at display size` | none | 5 |
| 6 | **Load More** | A button that grows the feed. A17·16's, third use. | `feed · none · page · one · none · one button appends a batch` | `load-more` | 4 |
| 7 | **Endless** | Auto-load with a pinned status, and a hard stop. | `sticky · pill · transparent · none · none · auto-load with a pinned status` | `infinite-scroll` | 4 |
| 8 | **Contrast Band** | The same strip inverted, to end a page. | `bar · none · contrast · variable · none · inverted band` | none | 4 |
| 9 | **Cards** **[Free]** | Two large targets, one each way. | `split · none · page · few · none · two half-width cards` | none | 4 |
| 10 | **Slim** | One line. The quietest way to end a feed. | `bar · none · page · few · none · one right-aligned line` | none | 4 |

### Tuple uniqueness — the honest statement

**All ten are distinct on the five closed slots** — A17 managed nine of eighteen, A18 nine of
fifteen, A19 fifteen of fifteen. **A34 does it with the smallest vocabulary of the four:** five
archetypes, two containments, four grounds, four counts, and a single media value — `none`, in all
ten, because **no pager in this library shows a picture.**

**The count slot needed an interpretation, stated once for the whole category** ⚑. The gloss says
`variable` means the author decides how many; **nobody authors a page link.** A34 reads the slot as
*the number of interactive page references the design draws*: `variable` where that follows the
archive (1, 3, 4, 8), `few` where it is the two directions (2, 5, 9, 10), `one` for a single button
(6), `none` where the reader presses nothing in the intended path (7). **Under the literal gloss all
ten would be `none` and the slot would carry no information**, which is worse than an interpretation
that is written down.

**Where two designs come closest it is 3 Bar and 8 Contrast Band** — identical on four slots,
separated by ground alone, which is exactly the case the brief calls legitimate. **The next closest
is 2 Prev and Next against 9 Cards and 10 Slim:** three designs drawing the same two links,
separated by archetype — bare at the margins, in two cards, in one slim row. That is a real
difference in arrangement, but it is the group a reconciliation pass should look at first. **If one
of the ten has to go it is 10 Slim** — it is 2 Prev and Next at Link size Small with a position line
— and the reason to keep it is that every category in this library has a Slim and users reach for
it.

---

## 1 · Numbers

1. **Descriptor.** A centred cluster of page links on the page ground, windowed to seven slots with
   an ellipsis where it skips, the current page marked by weight and a 2 px accent underline, a
   directional link at each end and a position line beneath. **The plainest form of the window, and
   the category's default.**
2. **Tuple.** `nav · none · page · variable · none · windowed numbered links`
3. **Archetype.** nav. **One departure, the category's largest:** below 767 the page links are
   dropped rather than wrapped or scrolled, and the position line moves into the row to replace them.
   Nothing is exempt from it: All pages is deleted.
4. **Responsive.** **1440** cluster centred on 1,296, margin 72, boxes 38 on an 8 gap, chevrons with
   labels 24 from the numbers, position line 16 below, hairline at the content width, 96 beneath ·
   **1080** unchanged · **834** margin 40, **chevron labels drop to glyphs**, padding 80 · **≤ 767**
   page links dropped, chevrons become 44 px outlined icon buttons at the margins, **the position
   line moves into the row at 15/600 and Position line Off is overridden** ⚑, padding 64. **The
   137-page route draws the identical row at every width.**
5. **Strings and data.** `navLabel`, `newerLabel`, `olderLabel`. Read-only: the six `pagination` values. In the
   union, unread: `moreLabel`, `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Chevrons | Off · Glyph only · Glyph and label |
   | Alignment | Left · Centre |
   | Separator | None · Hairline above |
   | Density | Compact 4 · Comfortable 8 |

   Four. **Cut: Jump to page** — a form inside a nav; Padding, which was the feed's Vertical
   spacing under a second name; and **Numbers**, deleted in the patch pass — its All pages value
   cannot be built and its other value is the design itself.
7. **Data.** Ghost's `pagination` object on any paginated route. Destinations `/page/N/`, page 1 at the
   route root and **never `/page/1/`** ⚑. **0 → no route, no section. 1 page → does not render**
   whatever the item count. **Many → the window bounds the row at seven slots however deep the
   archive**, and needs no arithmetic to do it: 1, `.prev`, `.page`, `.next`, `.pages`. Two pages →
   two numerals, no ellipsis.
8. **Empty.** **One page → nothing on the site**; in the editor the outline greyed plus "This archive
   has one page, so the pager will not appear on the site." **First page: the newer slot is Hidden by
   default and keeps its width**; at Dimmed it is a `<span>` at the muted-border step, **never an
   `<a>` and never a disabled `<button>`**. Last page mirrors it. No label authored → the block's
   Labels value supplies it; no link ever renders unlabelled.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical** — every element is an `<a>` or a
   `<span>` and the links are what Ghost's own routes serve. Edit-safe.
10. **A11y.** `<nav aria-label="Pagination">` holding an `<ol>` in page order. **No heading.**
    `<span aria-current="page">` for the current page. `rel="prev"`/`"next"`; at Glyphs only each
    keeps visually-hidden text. Ellipsis `aria-hidden`, not focusable. Targets 44 at every width.
    A6's ring at 4 px on the box. **No live region — a page navigation announces itself.** Muted
    numerals 5.4:1, current page 13.1:1. Print: links absent, position line kept.
    **Flagged ⚑** tabular numerals as an unstated pack requirement · the ellipsis refused as a
    control · its derived dark `#4E4740` · numerals dropped below 767 with the position line as
    destination · Position line Off overridden there · no `/page/1/` · no heading level · the
    category having no Posts block. **Deleted in the patch pass:** Numbers All pages, and Post range
    from the block.

## 2 · Prev and Next

1. **Descriptor.** Two directional links at the ends of the content measure, each with the
   destination's page number beneath, the position line centred between them, a hairline above. **No
   page links, and the only A34 design that reaches the content edges.**
2. **Tuple.** `nav · none · page · few · none · facing links at the margins`
3. **Archetype.** nav. **One departure:** below 767 the two links stack into full-width rows, the
   position line moves above them, and **the reserved empty slot is abandoned** — at an archive end
   the absent row is removed.
4. **Responsive.** **1440** links on the 1,296 edges, label 20/700 heading font, sublabel 13, chevron
   26 outside the label, position line centred at 13, hairline above, 96 beneath · **1080** unchanged
   · **834** chevron 24, margin 40, padding 80 · **≤ 767** two stacked 60 px rows split by a
   hairline, newer first, **both chevrons to the left** ⚑, label 19, position line above the pair,
   absent side removed, padding 64.
5. **Strings and data.** `navLabel`, `newerLabel`, `olderLabel` — **spent harder here than anywhere**, the two
   words being the whole composition. Read-only: the six `pagination` values. Unread: `moreLabel`,
   `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Link size | Small 15 body · Medium 20 heading · Large 28 heading |
   | Sublabel | Off · Page number |
   | Chevrons | Off · Beside the label · At the outer edge |
   | Rule | None · Above · Above and below |

   Four. **The panel states that Link size changes the typeface** — body at Small, heading at
   Medium and Large — so a divergent-font pack does not read the jump as a defect. **Position line
   Off is disabled and shown disabled, which after the patch pass leaves Page count as the field's
   only value here.** **Cut: a page-numbers toggle**, which would have made this design 1 Numbers.
7. **Data.** `pagination.prev`/`.next` for destinations, `.page`/`.pages` for the sublabels and
   centre. **0 → nothing. 1 page → does not render. 2 pages → the design's best case.** **Many →
   unchanged, and the reader still moves one page at a time**, which the panel names with 1 Numbers
   as the alternative. **The sublabel is not arithmetic and never was:** `pagination.prev` and `.next` are page numbers the
   route hands over, which is why this line survived a pass that deleted every value a template had
   to work out.
8. **Empty.** One page → nothing; greyed outline and cause in the editor. **First page, Hidden: the
   slot keeps its width above 767 and is removed below it. Dimmed: label and chevron to the
   muted-border step and the sublabel becomes "No older posts" / "No newer posts"** — the only dimmed
   slot in A34 that says why, a `<span>` throughout. Sublabel Off shortens the row by 19 px.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical.** Edit-safe.
10. **A11y.** `<nav aria-label="Pagination">`, no heading, no list — **two links do not need an
    `<ol>`** and DOM order is newer then older at every width, matching page order ⚑.
    `rel="prev"`/`"next"`. **The accessible name is label plus sublabel** — "Newer posts, page 1" —
    so the two are never announced identically. Position line is a plain `<p>`, not a live region.
    Chevrons `aria-hidden`. Target is the whole link block, 60 px stacked, 44 minimum inline. A6's
    ring on the block including its chevron; **hover underlines the label only** ⚑. Label 13.4:1,
    sublabel 5.7:1. Print: links absent, position line kept.
    **Flagged ⚑** heading font at Medium and Large, body font at Small — the one control in A34 that
    changes a typeface · the sublabel read straight from the route rather than counted, with a date range still named as a finding · the
    reserved slot above 767 and removed below · both chevrons left when stacked · Position line Off
    disabled, and the rule that a design narrows but never extends a block field · hover on the label
    alone.

## 3 · Bar

1. **Descriptor.** A full-bleed `surface` strip between two hairlines, 72 px tall, holding the
   position line, the windowed page links and the older-posts link in three zones on the feed's own
   page margin. **The only A34 design that shows all three at once.**
2. **Tuple.** `bar · none · surface · variable · none · full-width strip` — containment `none`: the
   band is the section's ground, not a box it sits in.
3. **Archetype.** bar. **One departure.** A bar's ladder sheds outer zones as it narrows; **this one
   grows, 72 → 88 at 834**, to stack the position line under the numerals. The scrolling middle zone
   is gone with All pages, which was the only value that needed it.
4. **Responsive.** **1440** band 72, contents on the 72 margin, **outer zones fixed 260** ⚑ (not
   `1fr`, so the cluster never drifts as the position line's width changes), numerals centred on the
   band, 96 beneath · **1080** zones 220 · **834** **band 88, two zones** — numerals with the position
   line beneath on the left, direction link right; margin 40; padding 80 · **≤ 767** band 64, page
   links dropped, 44 px outlined chevrons at the margins with the page count between, band stays full
   bleed, padding 64. **Edge Inset at ≤ 767 becomes full
   bleed** — a 350 px band with margins either side is a card without a radius.
5. **Strings and data.** `navLabel`, `newerLabel`, `olderLabel`. Read-only: the six `pagination` values.
   Unread: `moreLabel`, `endLabel`. **Identical to 8 Contrast Band's, which is what makes switching
   between them lossless.**
6. **Controls.**

   | Control | Values |
   |---|---|
   | Layout | Three zones · Numbers centred · Direction at the ends |
   | Height | Compact 56 · Comfortable 72 · Spacious 96 |
   | Edge | Full bleed · Inset |
   | Rules | Both · Top only |

   Four, **Numbers** having been deleted in the patch pass. **Height is a strip height — a
   genuinely different ladder — and keeps its own name.** **At the ends defaults to Dimmed** ⚑.
   **Cut:** Alignment (the zones are the alignment) and a totals toggle (the block's Position
   line).
7. **Data.** The route's `pagination`. **0 → nothing. 1 page → does not render, band included.**
   **2 pages → the design's weakest case** (two numerals and a link in a 1,296 strip); the panel
   names 10 Slim. **Many → as drawn**; the band's height never changes with the archive and the outer
   zones are sized for the longest label the catalog can hold rather than for the archive's depth.
8. **Empty.** One page → nothing. **At the ends dims rather than hides** — an empty zone in a band is
   visible whether or not anything is in it. **At Layout Three zones on page 1 there is nothing to
   dim**, since the left zone holds the position line and the newer link exists only at Direction at
   the ends; that asymmetry is stated rather than smoothed ⚑. Position line Off leaves the left zone
   empty and the numerals stay centred on the band.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical**, the scrolling zone included (native
   `overflow-x`). Edit-safe. **`marquee` was considered for the old All pages value and refused:** a pager that moves on its own is
   unusable, and the module's own no-JS branch is the static scrollable strip this design already
   has.
10. **A11y.** `<nav aria-label="Pagination">` with an `<ol>`; no heading. **DOM order is position line
    → page links → direction link**, matching left-to-right at 1440 and top-to-bottom at 834 ⚑.
    `aria-current`, `rel`, ellipsis `aria-hidden`. **Focus rings are A6's at +4**: with All pages gone nothing in the band overflows,
    so nothing clips a ring. Targets 44; the
    56 px Compact band still holds one with 6 px either side. Muted on surface 5.1:1, current page
    12.6:1. Print: the band prints as a hairline rule with the position line.
    **Flagged ⚑** fixed 260 outer zones · Edge Inset staying square against the radius token · the
    band growing at 834 · At the ends defaulting to Dimmed · the missing newer link at Three zones on page 1 · Rules having no None.

## 4 · Pill

1. **Descriptor.** The windowed page links and two chevrons inside one contents-width surface pill
   with a hairline and a warm md shadow, centred on the page ground, position line beneath. **The
   current page is a filled inner pill rather than an underline — the only A34 design that changes
   that marker.**
2. **Tuple.** `nav · pill · page · variable · none · one floating pill` — the category's only `pill`
   containment; **containment is the whole difference from 1 Numbers.**
3. **Archetype.** nav. **One departure.** Below 767 the pill goes **full-width rather than
   contents-width** and its numerals leave for the position line. The internal scroll is gone with
   All pages, which was the only value that needed it.
4. **Responsive.** **1440** pill 56 tall, radius 28, inner boxes 40 on a 4 gap, 8 inner padding,
   centred; position line 14 below; 96 beneath · **1080 and 834** identical, the object does not
   scale with the measure · **≤ 767** pill full-width at 350, chevrons at the inner edges at 44, page
   count between at 15/600, the line below removed, padding 64.
5. **Strings and data.** `navLabel`. **`newerLabel` and `olderLabel` are authored and never drawn** — Labels is
   locked to Glyphs only, so both become the chevrons' visually-hidden text ⚑. Read-only: the six
   `pagination` values. Unread: `moreLabel`, `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Contents | Numbers and chevrons · Numbers only · Position and chevrons |
   | Elevation | Hairline · Shadow · Hairline and shadow |
   | Size | Compact 48 · Comfortable 56 |
   | Alignment | Left · Centre |

   Four, **Numbers** having been deleted in the patch pass. **Labels locked; At the ends defaults
   to Dimmed.** **Cut: Sticky** — 7 Endless owns pinned things.
7. **Data.** The route's `pagination`. **0 → nothing. 1 page → does not render, pill included.**
   **2 pages → the best case at 172 px wide**, the one place it beats 3 Bar. **Many → the pill grows
   with the window to a 340 px ceiling and stops**, and nothing can push it past that any more.
8. **Empty.** One page → nothing. **At the ends Dimmed by default** — a pill missing a chevron at one
   end is a lopsided shape; the glyph stays as a `<span>` at the muted-border step. **At Hidden the
   pill contracts by 44 px and stays centred**, the one case where this design's own geometry changes
   at an archive end, allowed because a contents-width object disturbs no layout. Contents Position
   and chevrons ignores Position line, the position being inside the pill.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical**, internal scroll included. Edit-safe.
   **A hover lift was drawn and cut:** the pill is not a button.
10. **A11y.** `<nav aria-label="Pagination">` with an `<ol>`; no heading. **The pill is a container,
    not a control** — no role, no `tabindex`, no label of its own. `aria-current="page"` on the filled
    numeral, and **the fill is not the only signal**: weight and contrast carry it for a reader who
    cannot see the 1.3:1 step ⚑. Chevrons always keep visually-hidden text. **Focus is A6's ring
    inset to −4 and rounded to the inner box** (A17·18). Targets 44 by overlap at both Sizes. Muted
    5.4:1; current page 13.1:1 light, 12.1:1 dark. Print: pill absent, position line kept.
    **Flagged ⚑** radius as height/2 from A1·5 rather than the pack token · the filled inner pill and
    the accent fill refused · the derived dark fill `#2C2721` · **the shadow dropped in dark, the one
    control value in A34 that resolves by mode** · Labels locked · the pill contracting at Hidden.

## 5 · Counter

1. **Descriptor.** The current page and the total as one 52 px group in the heading font, three tones
   deep, with a 38 px icon button either side and nothing beneath it. **A34's only display moment
   and its only design whose subject is position rather than navigation.**
2. **Tuple.** `stack · none · page · few · none · position at display size` — the category's only
   `stack`; shares four slots with 2 Prev and Next and separates on archetype.
3. **Archetype.** stack. **No departure** — it narrows and re-sizes, nothing reorders. Arrows Outside
   resolving to Below below 767 is a value resolving, not a re-order.
4. **Responsive.** **1440** counter 52, arrows 38 at a 32 gap either side, hairline above with **40
   beneath it rather than 24** ⚑, position line 14 under the group, 96 below · **1080** counter 48 ·
   **834** counter 44, arrow gap 24, margin 40, padding 80 · **≤ 767** **Arrows Outside resolves to
   Below**, the pair becomes two half-measure 44 px buttons at a 12 gap, counter 34 — **or 26 at Numerals Worded** ⚑ — padding 64. **Counter size Large
   at ≤ 767 resolves to 44.**
5. **Strings and data.** `navLabel`; `newerLabel` and `olderLabel` authored, never drawn (Labels locked to
   glyphs). Read-only: the six `pagination` values, `.page` and `.pages` being the composition.
   **Also reads the site title, in print only** ⚑ — the only A34 design that reads outside
   `pagination`. Unread: `moreLabel`, `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Counter size | Small 34 · Medium 52 · Large 72 |
   | Numerals | Plain 2 / 11 · Worded Page 2 of 11 |
   | Arrows | Outside the counter · Below the counter (**no Off**) |
   | Arrow style | Bare · Outlined · Filled (A1·14's three; **Filled in `contrast`, never accent**) |
   | Rule | None · Hairline above |

   Five. **Labels locked; Position line fixed Off — the counter is the position line; At the ends
   defaults to Dimmed.**
7. **Data.** `.page` and `.pages` for the counter, `.prev`/`.next` for the arrows. Nothing else is read: the range this design used to carry beneath it needed `.limit` and `.total` multiplied, which a template cannot do. **0 → nothing. 1 page → does not render** — the rule bites hardest here, "1 / 1"
   at 52 px being a striking way to say nothing. **2 pages → "1 / 2", no adjustment needed.**
   **Many → the numerals grow by a glyph at 100 pages and the group re-centres**; the tabular figures hold the group's width, which is what the deleted padding was for.
8. **Empty.** One page → nothing on the site; **in the editor the counter greyed at "1 / 1" with the
   cause beneath** — the clearest editor state in the category, because the reason is legible in the
   design. **At the ends Dimmed: the spent arrow keeps its box and both its glyph and its border dim
   — the only place A34 dims two tokens at once** ⚑. At Hidden the counter shifts 70 px off centre
   and the panel says so.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`count-up` was the
   obvious module and is refused** ⚑: a page number that counts up from zero is a number pretending
   to be an achievement.
10. **A11y.** `<nav aria-label="Pagination">`, no heading, two links. **The counter is a `<p>` that
    reads "Page 2 of 11" whatever Numerals is set to** ⚑ — the drawn "2 / 11" is spans with the slash
    `aria-hidden` and a visually-hidden "of" between, so nobody hears "zero two slash eleven". Arrows
    are `<a rel="prev">`/`rel="next"` with visually-hidden names, 38 px boxes on 44 px targets. A6's
    ring at 4 px; **hover underlines the glyph, there being no label to underline.** Current page
    13.6:1 light, 14.2:1 dark; the three-tone read is 7.1× between steps in light and 2.3× in dark,
    a pack finding at Counter size Small ⚑. **Print: the counter prints, worded, at 22 pt with the site title beside it** — the one A34 design whose printed form is itself.
    **Flagged ⚑** three-tone numerals with the slash in `border` · 40 below the rule · Arrows with no Off · Filled in `contrast` · Worded's pack-dependent width and its own step at 390 · Large resolving at ≤ 767 · two tokens dimmed at once · the spoken counter differing from the drawn one · the site title in print · `count-up` refused. **Deleted in the patch pass:** Numerals Padded, and the post-range line beneath the counter — Position line is now fixed Off here.

## 6 · Load More

1. **Descriptor.** A17·16's centred button under the feed, appending one Ghost page per press, with a
   count line and a 320 px hairline meter beneath and the route's numbered links present in the
   markup at all times. **The only A34 design that grows the feed rather than replacing it.**
2. **Tuple.** `feed · none · page · one · none · one button appends a batch` — the category's only
   `feed`.
3. **Archetype.** feed. **One departure, inherited:** the control goes full-width below 767 (A17·16's
   own rule). Above that width the design does not respond at all.
4. **Responsive.** **1440** button 45 tall on a 24 radius, contents-width, centred; count 16 below;
   meter 320 × 2; 96 beneath · **1080 and 834** identical but for the margin; padding 80 · **≤ 767**
   button full-width at 350 and 48 tall, **meter widens to the measure**, Alignment ignored, jump-row boxes at 44, wrapping, padding 64. **No element leaves at any width** — this and 5 Counter are
   the only A34 designs that drop nothing.
5. **Strings and data.** `navLabel`; **`moreLabel`** (32 chars, default "Load more posts" — the union's only
   field this design alone needs, and the reason it is in the union); **`endLabel`** (48 chars,
   default "That's all {total} posts."); `newerLabel`/`olderLabel` read **by the hidden numbered links
   only**. Read-only: the six `pagination` values, `.limit` being the batch and `.total` driving the
   count and meter.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Button style | Outline · Solid · Text |
   | Progress | Off · Count line · Count and meter |
   | Page links | Hidden · Shown below |
   | Alignment | Left · Centre |

   Four. **Position line fixed Off, At the ends not applicable, Labels routed to the hidden
   links.** **No Batch** ⚑. **Cut: auto-load on scroll** (that is 7 Endless) and a position-memory
   toggle (needs storage the theme does not have).
7. **Data.** First page server-rendered; each press fetches the next `/page/N/` against the same query
   and appends. **Designed for 24–144 posts across two to eleven presses.** **0 → nothing. 1 page →
   no button**; at Progress Count line the count alone renders, "12 of 12 posts"; at Off nothing.
   **Many → the button walks the whole archive**, unlike A18·15's, which stopped at Show — **because
   A34 has no Show** ⚑, and a pager that stops halfway through a route is a dead end. **The batch is
   always `posts_per_page`**, so the button and the numbered links in the same markup can never
   disagree.
8. **Empty.** **Nothing left to load → the button is replaced by `endLabel` in the button's own
   position at the button's own height**, so the page does not jump (A17·16's rule verbatim); the
   meter fills and stays. **It does not grey out and remain.** **A failed fetch returns the button to
   rest and adds "Those posts didn't load. Try again."** ⚑ — A34's addition, since neither A17 nor
   A18 drew a failure. **That line, `endLabel` and "Loading" all render from the catalog**, `endLabel`
   keeping its `{total}` placeholder, and **the retry is the same real button returning to rest,
   never a second control.** In the editor the module does not run: resting button, server-value count,
   first-page meter.
9. **Module.** **`load-more`.** **No-JS degradation, quoted: "Ghost's numbered `/page/2/` pagination
   links render instead (FR-G4, explicitly)."** Those links are in the markup on every render —
   `.visually-hidden` at Page links Hidden, **never `display:none`** ⚑ — so the branch is automatic
   and the archive stays crawlable. **The button, count and meter are absent in that branch, not
   inert.** **Edit-safe: the module does not run while editing.** Reduced motion: the loading dots
   hold still and the label carries the state; the meter changes width without a transition.
10. **A11y.** `<nav aria-label="Pagination">` holding a real `<button>` plus the hidden `<ol>`.
    **A visually-hidden `aria-live="polite"` region announces the count and not the titles**; **focus
    moves to the first new post's link** (A18·15). `aria-busy` on the feed while loading; the button
    keeps its width and its name becomes "Loading". The meter is `aria-hidden`, its own count line
    saying the same thing ⚑. Button 45 px; **the jump row is the category's own page link — 15 px in a
    38 px box on a 44 px target, 44 outright below 767 — so A34 has no sub-44 target left.** Outline border 13.1:1 light, 14.9:1 dark; Solid 4.8:1 light,
    5.4:1 dark. Print: nothing.
    **Flagged ⚑** the meter in `text-muted` and `aria-hidden` beside its own count · no Batch · the
    button walking the whole archive · numbered links always in the markup · the standing panel
    warning · three block fields inert · the failure line as a catalog string · the jump row raised to the category's 38/44 box · **the
    anchor-instead-of-button finding, recorded and not acted on** (A17·16 and A18·15 are drawn with a
    `<button>`; a component does not change in its third category).

## 7 · Endless

1. **Descriptor.** An invisible sentinel that fetches the next page as the reader nears the end of the
   feed, a 44 px surface pill pinned to the bottom of the viewport carrying the count and a Back to
   top link, a focus-revealed button in the flow, and a hard stop after four pages, past which the pill retires and a button takes the flow. **The only A34 design with nothing in the page's flow at rest.**
2. **Tuple.** `sticky · pill · transparent · none · none · auto-load with a pinned status` — the
   category's only `sticky`, only `transparent` and only `none` count. **The count is `none` because
   the reader presses nothing in the intended path**; the focus-revealed button is a stated
   accessibility route, not the design's unit ⚑.
3. **Archetype.** sticky. **One departure:** at the stop the pill unpins, the sentinel retires and this design's own button takes the flow. **It does not become another design** — the button is the library's load-more control, as every design uses shared components.
4. **Responsive.** **1440** pill contents-width, 44 tall, radius 22, centred, 24 above the viewport's
   foot; nothing in the flow; at the stop a 45 px contents-width button with the count beneath ·
   **1080 and 834** identical · **≤ 767** pill takes the measure, **16 from the bottom plus
   `env(safe-area-inset-bottom)`** ⚑, count shortens to "24 of 132", Back to top becomes "Top", and
   at the stop the button is full-width at 48 with **a 32 px gap above rather than 48** ⚑.
5. **Strings and data.** `navLabel`; **`moreLabel`** (default "Load older posts" here against 6's "Load more
   posts" — **the same field with a different default** ⚑); `endLabel`; `newerLabel`/`olderLabel` read
   by the hidden links only. Read-only: the six `pagination` values. **The only design that spends
   all five authored fields**, four of them invisibly.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Trigger | One screen early · At the last row |
   | Status | Pinned pill · Inline line · Off |
   | Stop after | **a number picker, 2–8 pages, default 4**, capped at 8 with the reason shown |
   | Back to top | Off · In the pill (disabled with its reason at Status Off) |

   Four, and **all four block fields inert** ⚑; the space under the stop's button is the feed's
   Vertical spacing. **Cut:** a threshold slider, a resume toggle.
7. **Data.** First page server-rendered; the sentinel fetches `/page/N/` against the route's query and
   appends. **Designed for archives of 48 posts and up** — below four pages the stop never fires and
   the design is 6 Load More with extra machinery, which the panel says. **0 → nothing. 1 page →
   nothing renders, not even the pill.** **2 pages → one automatic load and then the end**; the count
   is clamped to the total. **Many → four automatic pages by default, then the button, then Ghost's own pages behind it.**
8. **Empty.** One page → nothing. **Archive exhausted → the pill unpins and is replaced in the flow by
   `endLabel`**, so the reader gets an ending rather than a pill that stops changing. **A failed fetch
   shows the stop's button with "Those posts didn't load. Try again."** **In the editor the module does
   not run at all** — the resting frame is the feed with the pill at its server-known count.
9. **Module.** **`infinite-scroll`.** **No-JS degradation, quoted: "Same — numbered pagination links
   render (FR-G4, explicitly)."** Those links are in the markup on every render, visually hidden, as
   in 6 Load More; pill, sentinel and revealed button are absent in that branch. **Edit-safe.**
   Reduced motion: no smooth scroll on Back to top, no fade on the pill, static loading dots.
   **A17 and A18 refused this module and A34 declares it** — the difference being that those sections
   own a Show value and this one owns no query ⚑.
10. **A11y.** `<nav aria-label="Pagination">` holding the hidden `<ol>`, a real `<button>` **visually
    hidden until focused — the skip-link pattern** ⚑ — and the pill. **A visually-hidden
    `aria-live="polite"` region announces each load and the stop.** **Focus never moves on an
    automatic load** (A18·15's rule departed from deliberately) **and does move to the first new post
    after the button is pressed.** The pill is not the live region and is `aria-hidden`; Back to top
    inside it is a real focusable `<a href="#top">` with a 32 px inner target on a 44 px pill.
    `aria-busy` on the feed while fetching. Count line 6.1:1 dark, Back to top 14.9:1. **Print:
    nothing — the only A34 design with no printed form**, having no position to state.
    **Flagged ⚑** the module declared where A17 and A18 refused it · the four-page stop and the button that follows it · the focus-revealed button · no focus move on auto-load · the standing three-line
    warning · all four block fields inert · **the pill's two-step dark lift, `#2C2721` fill and
    `#3D372F` hairline, outside the seven roles** — a floating overlay needs a token the pack does not
    have · the safe-area inset · the 32 px gap at the stop · `moreLabel`'s different default.

## 8 · Contrast Band

1. **Descriptor.** A full-bleed band of the pack's `contrast` colour, 120 px tall, carrying the
   windowed page links at 17 px and the position line beneath, both in colours derived from the band
   rather than the palette. **The category's only inverted ground.**
2. **Tuple.** `bar · none · contrast · variable · none · inverted band` — identical to 3 Bar on four
   slots, **separated by ground alone**, which is exactly the case the brief names.
3. **Archetype.** bar. **Two departures.** The band's height is fixed at every width except at
   Contents Direction and position below 767, **where it takes 20 px of padding instead of a height**;
   and Alignment Split to the edges **changes another control** rather than failing.
4. **Responsive.** **1440** band full bleed 120 tall, contents on the 72 margin, numerals 17 in 40 px
   boxes on a 10 gap, position line 14 below, **96 above and 96 below** · **1080** band 112 · **834**
   band 104, margin 40, padding 80 · **≤ 767** band 88, page links dropped and the page count into
   the row at 17/600, chevrons 44 px boxes **bordered in the derived 10% step** ⚑, padding 64.
   **Contents Direction and position at ≤ 767** stacks into two 44 px rows with a derived hairline
   between and the band sizes to its contents.
5. **Strings and data.** `navLabel`, `newerLabel`, `olderLabel`. Read-only: the six `pagination` values.
   Unread: `moreLabel`, `endLabel`. **3 Bar's field list exactly.**
6. **Controls.**

   | Control | Values |
   |---|---|
   | Band height | Compact 96 · Comfortable 120 · Spacious 160 |
   | Contents | Numbers · Numbers and position · Direction and position |
   | Current page | Accent underline · Weight only (**Accent underline disabled in dark with its ratio shown**) |
   | Alignment | Centre · Split to the edges |

   Four. **Band height is band-internal and keeps its own name; the space below the band is the
   feed's Vertical spacing, whose Compact is raised to 80 under it (A17·7).** **The band is drawn
   in the pack's `contrast` colour whatever the feed's Background role is, and the panel says so**
   ⚑. **Attachment defaults to Separate and At the ends to Dimmed.** **Cut:** an Edge control, and
   a Numbers pair — which could not have been built in any case.
7. **Data.** The route's `pagination`. **0 → nothing. 1 page → nothing renders, band included** — an
   empty inverted band is a stripe across a page for no reason. **2 pages → weaker than 3 Bar's**;
   the panel names 2 Prev and Next. **Many → unchanged.** **The position line carries one value at every band height** — "Page 11 of 11" — the second half of the pair having been a range of posts, deleted in the patch pass ⚑.
8. **Empty.** One page → nothing. In the editor: the band at 30% opacity with the cause **beneath it,
   not inside it — an editor notice on a contrast band would need a fourth derived colour** ⚑. **At
   the ends Dimmed** uses the derived 60% muted; at Contents Numbers and position **there is no
   direction link to dim**, so the archive's ends change only the numerals.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`mode-toggle` touches
   this design from a distance:** its `prefers-color-scheme` branch decides whether the accent
   underline is available, and since that branch is pure CSS (FR-E4) the disabled value resolves
   without JavaScript.
10. **A11y.** `<nav aria-label="Pagination">` with an `<ol>`; no heading. **Measured on the band: muted
    numerals 5.9:1 light and 5.4:1 dark; current page 15.9:1 and 14.6:1; the accent underline 4.79:1
    and 2.31:1 — the last of which is why it is disabled in dark.** **The current page is never
    marked by colour alone**: weight and contrast carry it in both modes. **Focus is A6's ring in the
    band's own text colour, not accent** ⚑, which inherits the same problem. Targets 44. **Print:
    prints as 1 Numbers on white** (A17·7).
    **Flagged ⚑** numerals at 17 on an inverted ground · Attachment defaulting to Separate · both
    position values at 120 and above · Alignment changing Contents · the band sizing to its contents
    when stacked · chevron borders in the derived 10% step · the focus ring in the band's text colour
    · **the accent underline disabled in dark at a measured 2.31:1 — the first control value in the
    library disabled by a measurement rather than a judgement, and a pack finding: the
    accent-on-contrast ratio is a pack property the project does not record, and three categories
    have now derived dark accents by hand.**

## 9 · Cards

1. **Descriptor.** Two mirrored surface cards at A17's 636 px cell width, 112 px tall, each carrying a
   13 px direction eyebrow over the destination's page number at 20 px in the heading font, with the
   arrows at the pair's outer edges. **The category's largest targets and its only contained items.**
2. **Tuple.** `split · none · page · few · none · two half-width cards` — **containment `none`: the
   cards are the items' geometry, not the section's.** The category's only `split`.
3. **Archetype.** split. **Two departures.** Below 767 it stacks and **abandons the mirror** — both
   cards read left to right. And at an archive end, at Single card Full width, **the surviving card
   takes the whole measure**: the one A34 design whose layout depends on the reader's position.
4. **Responsive.** **1440** two 636 cards on a 24 gutter, 112 tall, inner padding 28, arrow 22 at the
   outer edges, eyebrow 13, page 20 · **1080** two 456, inner padding 24 · **834** two 365 — A17's Two
   division at that width — inner padding 20, height and type unchanged, padding 80 · **≤ 767**
   stacked at the full measure, 88 tall, **12 px gap rather than 24**, both arrows left, page 19,
   **Single card has no effect**, padding 64.
5. **Strings and data.** `navLabel`; `newerLabel` and `olderLabel` — **drawn as the eyebrow, the one place in
   A34 the labels are set in uppercase**, so a label past about 20 characters wraps and the panel says
   so. Read-only: the six `pagination` values; and nothing else: the optional count line is deleted, `.limit` and `.total` needing multiplying. Unread:
   `moreLabel`, `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Card style | Hairline · Filled · Filled with a hairline |
   | Content | Direction only · Direction and page |
   | Single card | Full width · Half width (**greyed with its reason when At the ends is Dimmed**) |
   | Height | Compact 88 · Comfortable 112 · Spacious 144 |

   Four. **Height is the card's, not the section's.** **Position line defaults to Off.** **Cut:** a
   shadow option, an image slot.
7. **Data.** `.prev`/`.next` for the destinations, `.page` for their numbers, `.limit`/`.total` for the
   optional count. **0 → nothing. 1 page → nothing renders. 2 pages → one card on every page**, the
   design at its simplest and, at Content Direction only, its best. **Many → two cards on every
   interior page.** **The count line was arithmetic — `limit`, or `total − (pages−1)·limit` on the last page — and is deleted for exactly that reason** ⚑; it was never a lookahead either.
8. **Empty.** One page → nothing. **First and last page at Hidden: the absent card is removed and the
   survivor takes the full measure (Full width) or holds its column (Half width)** — the one A34
   design that re-lays out at an archive end, stated as the deliberate exception it is. **At Dimmed
   both cards stay**, the spent one a step down in fill, border and text, its page replaced by "No
   older posts" / "No newer posts", and **it is a `<div>`, not an `<a>`.** Content Direction only
   collapses the card's composition to one line rather than leaving the second row empty.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **The whole card is inside
   the `<a>`**, as A17's post card is, so there is no nested-link problem and no JavaScript making a
   card clickable.
10. **A11y.** `<nav aria-label="Pagination">`, no heading, two links, DOM order newer then older at
    every width. **Each card's accessible name is its eyebrow plus its page** — "Newer posts, page 1"
    — with the count inside the same name when drawn. `rel="prev"`/`"next"`; arrows `aria-hidden`.
    **The target is the whole card, 636 × 112 or 350 × 88** — the largest in A34 by an order of
    magnitude. A6's ring on the card at 4 px; **hover spends two signals, the hover-surface fill and
    the page label's accent underline** ⚑, earned by the card being a surface. Eyebrow 5.4:1, page
    label 13.1:1. Print: cards absent, and with Position line Off by default **this design can print
    nothing at all**; the panel's line is "Set Position line to Page count if this archive is
    printed."
    **Flagged ⚑** A1's eyebrow spent on a direction · the survivor taking the full measure · Single
    card depending on a block field · the mirror abandoned and the 12 px stacked gap · the count line deleted as arithmetic, its lookahead still a finding · two hover signals · uppercase labels wrapping past 20 characters · Filled without a
    hairline named as the value to avoid in dark · the derived `#2C2721` hover step, now depended on
    by three A34 designs · **A26 Post Footers reuses this card** — its previous-post /
    next-post pair is this design with the post title where the page number sits. Adopted in this
    pass rather than recorded, and carried to the A26 patch as a requirement, so no second component
    is drawn.

## 10 · Slim

1. **Descriptor.** A single 44 px row under a hairline: the position line at 13 px left, "Newer" and
   "Older" at 15/600 with their chevrons right, divided by a 14 px vertical hairline. **The smallest
   pager in the library and the only A34 design whose arrangement is identical at every width.**
2. **Tuple.** `bar · none · page · few · none · one right-aligned line` — a bar with no ground, which
   is what proves the archetype is a shape rather than a surface.
3. **Archetype.** bar. **No departure, at any width or on any combination of its controls** ⚑ — the one exception was Position line Post range below 767, which stacked into two rows, and that value left the category in the patch pass. Identical from 1440 to 390.
4. **Responsive.** **1440** row 44 tall, hairline above with 14 beneath, position line 13 left, links
   15/600 right at a 20 gap and an 8 px word-to-glyph gap, 64 below · **1080 and 834** identical;
   margin 40 at 834 · **≤ 767** **identical but for the gaps, 20 → 14 and 8 → 6**; type, height,
   targets and order unchanged; margin 20; padding 64, already the default. **And after the patch pass there is no exception at all** ⚑.
5. **Strings and data.** `navLabel`; `newerLabel` and `olderLabel` — **drawn as their first word only, with the
   full value kept as the link's accessible name** ⚑. A first word past about 12 characters widens the
   row and the panel says so. Read-only: the six `pagination` values. Unread: `moreLabel`,
   `endLabel`.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Contents | Position and direction · Direction only (**no position-only value**) |
   | Alignment | Split · Right · Left |
   | Direction | Words · Words and chevrons · Chevrons only |
   | Rule | Hairline above · None |

   Four. **The panel advises the feed's Vertical spacing at Compact** ⚑ — it is the only design
   that wants it, and it no longer owns a value to set. **Cut: a Numbers pair**, which would have
   made this 1 Numbers at Separator None.
7. **Data.** `.prev`/`.next` for the links, `.page` and `.pages` for the position line. **0 → nothing. 1 page → does not render.** **2 pages → the design's best case in the
   category**: at two pages every other A34 design is overbuilt. **Many → unchanged, and unchanged is
   the point** — a hundred-page archive draws the identical row.
8. **Empty.** One page → nothing; greyed row and cause in the editor. **At the ends Dimmed by
   default** — hiding one of two words either side of a vertical rule leaves a rule dividing one thing
   from nothing — the spent link a `<span>` at the muted-border step, keeping its glyph. **At Hidden
   the rule goes with the link.** Contents Direction only removes the position line and **the row is
   never shorter than 44 px whatever is in it**, because the height is the target.
9. **Module.** **None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **The least machinery of
   any design in the library** — two anchors, one paragraph, two hairlines — and the frame a new Style
   Pack should be checked against first.
10. **A11y.** `<nav aria-label="Pagination">`, no heading, two links, DOM order position line → newer →
    older at every width, **including the stacked exception, where the visual order changes and the
    DOM order does not** ⚑. **Each link's accessible name is the full label — "Newer posts" — not the
    drawn word.** `rel="prev"`/`"next"`; both hairlines and both glyphs `aria-hidden`. **Targets are
    the row's full 44 px height** and, at Direction Chevrons only, 38 px boxes inside it. A6's ring at
    4 px on the word-and-glyph pair; **hover underlines the pair including the glyph** ⚑, unlike 2
    Prev and Next, because at this size the word and its arrow are one object. Links 13.1:1, position
    line 5.4:1. Print: links absent, position line kept — **the design whose printed form is closest
    to its screen form.**
    **Flagged ⚑** the panel advising Compact vertical spacing rather than setting it · the vertical
    hairline instead of a middle dot ·
    labels drawn as their first word · no position-only value · the Post-range stacking exception deleted with the value that triggered it · hover covering the glyph · the row never shorter than 44 px.

---

## Block 1 · Component inventory

Cumulative. Every component this category established or reused, one line each.

| Component | What it is | First from |
|---|---|---|
| **Nav item** | 15 px, muted resting, `text` + 2 px accent underline active; A34's page link unchanged | A1 (A1·1) |
| **Icon button** | 38 px box, 8 px radius, bare / outlined / filled; A34's chevrons and 5 Counter's arrows | A1 (A1·14) |
| **38/44 box** | A 38 px visible control on a 44 px target | A1 (A1·2) |
| **Floating pill** | Surface fill, hairline, md shadow, radius at half the height; 4 Pill and 7 Endless's status | A1 (A1·5) |
| **Eyebrow** | 13 px uppercase `.08em` muted; 9 Cards spends it on a direction | A1 |
| **Focus ring** | 2 px accent ring at a 4 px offset on the whole interactive box | A6 |
| **Inset focus ring** | The same ring at `outline-offset: -4px` where the element meets a container edge | A17 (A17·18) |
| **Load-more button** | Outline / Solid / Text at 24 px radius, 45 px tall, centred, full-width below 767; resting, loading, exhausted | A17 (16) |
| **Editor count line** | "N posts match. M drawn." plus the design's own advice; A34's public sibling is "24 of 132 posts" | A17 |
| **On-contrast derivation** | `color-mix` toward the band's own text: muted 60% · hairline 10% · plate 7% | A17 (7) |
| **Cell divisions** | Two 636 · Three 416 · Four 306 · Five 240 · Six 196 on a 24 gutter across 1,296 | A10, via A17 |
| **Striped image placeholder** | 45° two-tone stripe with a mono caption naming the crop; frames only | A1 |
| **Standing panel warning** | A permanent three-line statement of a design's cost, above its controls, in surface with a hairline — **new in A34** (6, 7) | **A34** |
| **Pager block** | Attachment · Labels · At the ends · Position line, plus the read-only Pager wording and Posts per page rows; replaces the Posts block — **new in A34** | **A34** |
| **Named Select surface** | A category whose designs are the values of one select on another section's sidebar, the chosen value's controls beneath it — **new in A34** | **A34** |
| **Catalog string** | A visitor-facing string edited once per language in the theme's translation catalog, never a section field — **new in A34** | **A34** |
| **Setting door** | A read-only line stating a setting's current value and linking to where it is changed — for `posts_per_page` that is INFLOZO's theme settings, Ghost's admin having no such field — **new in A34** | **A34** |
| **Page-link row** | Windowed first · previous · current · next · last with an ellipsis, seven slots maximum, tabular numerals; **every number read from the route, none of them counted** — **new in A34** | **A34** (1) |
| **Position line** | 13 px muted tabular "Page 2 of 11", read from `pagination` — **new in A34** | **A34** |
| **Ellipsis span** | One step below muted, `aria-hidden`, never a control — **new in A34** | **A34** (1) |
| **Hairline progress meter** | 320 × 2 px, `border` track with a `text-muted` fill, `aria-hidden` beside its own count — **new in A34** | **A34** (6) |
| **Pinned status pill** | A1·5's pill fixed 24 above the viewport foot, carrying a count and Back to top — **new in A34** | **A34** (7) |
| **Focus-revealed control** | A real `<button>` in the flow, visually hidden until focused; the skip-link pattern — **new in A34** | **A34** (7) |
| **Reserved end slot** | An absent directional link keeps its width so nothing else moves — **new in A34** | **A34** |
| **Dimmed end slot** | The spent side as a `<span>` at the muted-border step; never a disabled control — **new in A34** | **A34** |

## Block 2 · Shared field list

The union of every content field A34's ten designs need. **Nothing authored: five catalog strings and
six read values, eleven in all — the smallest field list in the library, and the only one with no
authored field at all.** Switching between any two of the ten is lossless: nine of
the eleven are read by every design, and the other two belong to the two module designs, whose
defaults fill them.

| Field | Type | Optional | Limit | Default | Read by |
|---|---|---|---|---|---|
| `navLabel` | catalog | yes | 40 chars | "Pagination" | all ten — never visible, the `<nav>`'s accessible name |
| `newerLabel` | catalog | yes | 24 chars | from Labels | all ten; drawn by 1, 2, 3, 8, 9, 10 and, first word only, by 10 |
| `olderLabel` | catalog | yes | 24 chars | from Labels | all ten; same |
| `moreLabel` | catalog | yes | 32 chars | "Load more posts" (6) · "Load older posts" (7) | 6, 7 |
| `endLabel` | catalog | yes | 48 chars | "That's all {total} posts." | 6, 7 |
| `pagination.page` | integer | — | — | route | all ten |
| `pagination.pages` | integer | — | — | route | all ten |
| `pagination.total` | integer | — | — | route | 6, 7 — the two designs whose script can count |
| `pagination.limit` | integer | — | — | route | 6, 7 — the batch, and it is always `posts_per_page` |
| `pagination.next` | integer or null | — | — | route | all ten |
| `pagination.prev` | integer or null | — | — | route | all ten |

**The rest of the visitor-facing strings are catalog strings too, and none of them is a section
field:** the position lines "Page {page} of {pages}" and "{seen} of {total} posts"; the dimmed-end strings "No older posts" and "No newer posts"; the failure line "Those
posts didn't load. Try again."; "Loading"; and 7 Endless's "Back to top" with its ≤ 767 form "Top".
**Twelve strings, one set per language, and no fixed English string ships** — the thirteenth was the post range, deleted in the patch pass. The per-design
rendering rules apply to the catalog value rather than to an author's input: 9 Cards still sets its
two in uppercase and still warns past about twenty characters, 10 Slim still draws the first word
only and warns past about twelve.

**Derived, never stored — and after the patch pass almost nothing is:** the post range and 9 Cards'
destination post count are both deleted, being multiplications; the destination page numbers were
never derived at all, `pagination.prev` and `.next` being numbers the route hands over. **The only
arithmetic left in A34 is the two module designs' seen-count, and JavaScript does it.** **5 Counter
also reads the site title, in print only.**

**No field in this list is an array, and none of it is authored in the panel.** ⚑ A34 has no
repeating item a user authors, so there is no Add, no Remove, no reorder, no item minimum or maximum
and no per-item content editing anywhere in the category; and with the five strings in the catalog,
the section's own panel holds controls and read-only lines only.

## Findings for the architect

1. **Tabular numerals are a pack requirement A34 depends on and cannot state.** A17·10 raised it;
   this category cannot work without it.
2. **The hover-surface step is not recorded in dark for any pack.** Three A34 designs depend on the
   derived `#2C2721` (4 Pill, 7 Endless, 9 Cards).
3. **A floating overlay needs a token no pack has.** 7 Endless's pill lifts two steps in dark and its
   hairline with it — `#2C2721` on `#3D372F` — which is outside the seven roles.
4. **The accent-on-contrast ratio is a pack property, per pack and per mode, twenty-four
   measurements.** Paper's dark contrast fails at 2.31:1, which disables a control value in 8
   Contrast Band. Three categories have now derived dark accents by hand.
5. **A pill's radius is height/2 in every pack, from A1·5.** In Ink, whose radius token is 6, the
   pager's 28 is a visible inconsistency. This argues for a pack-level pill rule.
6. **A date range on a directional link needs a lookahead query Ghost does not give a pager.** 2 Prev
   and Next and 9 Cards both wanted it. 2 Prev and Next draws the route's own page number instead; 9
   Cards drew a post count and no longer draws anything, the count having been a multiplication.
7. **The load-more control could be an `<a href="/page/N/">` the module intercepts**, giving the
   registry's no-JS outcome with one element instead of two. Not adopted: A17·16 and A18·15 are drawn
   with a `<button>`.
8. **A 137-page archive is not a pagination problem, and the library no longer has an answer to it.**
   No A34 design reaches page 68 in one action; the jump-to-page field was cut, and the window cannot
   be widened — one link per page cannot be built. **The Search category was deleted and its number
   retired**, so there is nothing to point a reader or a picker at. **Open finding, and the only one
   in A34 with no owner.**
9. **A26 Post Footers reuses 9 Cards' card** for its previous-post / next-post pair, with the post
   title where the page number sits. Adopted in this pass and carried to the A26 patch; the finding
   is now a requirement rather than a suggestion.
10. **`posts_per_page` is the field users will look for in this panel and cannot change here.** The
    Pager block states its value read-only **and links to INFLOZO's own theme settings**, which is
    where it lives: **Ghost's admin has no posts-per-page field at all**, so the link this document
    used to specify went nowhere. Corrected in the patch pass on all ten panels.
11. **The translation catalog needs placeholder support and a pager set.** `{page}`, `{pages}`,
    `{seen}` and `{total}` are spent by A34's twelve strings — `{from}` and `{to}` went with the post
    range. A catalog that stores flat text cannot render this category.
12. **A design can now only advise a vertical spacing, not set one.** 10 Slim wants Compact and 8
    Contrast Band wants Compact raised to 80; both controls belong to the feed, and the editor has no
    mechanism for a value a section recommends.
13. **A Named Select whose values carry their own control sets needs editor support.** Ten panels
    appear under one field on another section's sidebar. Nothing else in the library does this yet.
14. **Three template limits deleted three control values in this category, and the same limits will
    bite elsewhere: a template cannot count through a range of numbers, cannot multiply, and cannot
    pad a number.** All pages, Post range and Numerals Padded each failed on one of them. **Anything
    in the library that draws a count, a range, a percentage or a padded figure needs the same test.**
15. **The window needs one comparison between two numbers** — is the previous page more than 2, is
    the next page less than the last — to decide whether an ellipsis appears. **Comparison is not
    arithmetic and the theme layer has it**; recorded here because the window's whole viability rests
    on the distinction.

---

## Reconciliation notes

**Frames changed in this pass.** **A34-0 Category Proof** — a new "Reconciliation pass" section
stating the eight moves. **A34-1 … A34-10, all ten control-panel frames** — the panel now opens with
the feed's section box (Background role · Vertical spacing · Top divider, marked inherited) and the
**Pagination style** select; the per-design **Padding** row is gone; **Pager wording** and **Posts
per page** read-only rows are added, the second linking to Ghost Admin. **A34-2 Prev and Next** — the
panel states that Link size changes the typeface. **A34-6 Load More** — the jump row redrawn at the
category's 38/44 box, and the failure line, "Loading" and `endLabel` marked as catalog strings.
**A34-9 Cards** — the A26 reuse recorded on the frame. **No section frame's arrangement changed
except 6 Load More's jump row**; every other drawn state, responsive rule and dark frame is
untouched.

**One line each, including where this pass overrules something this spec already ruled.**

1. **The surface moved.** The spec said "Selecting a pager on the canvas gives the user five text
   fields"; a pager is not on the canvas. The ten designs are the values of a **Pagination style**
   Named Select on the designated main feed's sidebar, the pager renders attached below the feed, and
   nothing about A34 is placed, dragged or shuffled. Switching design still falls back to 1 Numbers.
2. **The universal three are the feed's and the pager inherits them.** This overrules "Each design's
   Padding control governs the space below the pager only": that ladder was Vertical spacing under a
   second name, so the row is gone from all ten and the counts fall to **five** (1, 3, 4, 5) and
   **four** (2, 6, 7, 8, 9, 10) — far under the PRD's ~15 ceiling, and no design gained a control in
   this pass.
3. **Two ladders survive as distinct, by name.** 3 Bar's **Height** is a strip height and 8 Contrast
   Band's **Band height** is band-internal; neither is the section's spacing. 9 Cards' **Height** is
   the card's.
4. **Background role is the feed's, so no A34 design locks it** — the case the ground rules describe
   resolves differently here. 8 Contrast Band's band is drawn in the pack's `contrast` colour
   whatever the feed's Background role is, and the panel states that rather than greying a control
   the pager does not have.
5. **The five labels became catalog strings**, which overrules Block 2's "five authored" line and the
   per-design field lists: `navLabel`, `newerLabel`, `olderLabel`, `moreLabel` and `endLabel` are
   edited once per language, not five text fields per pager. The character limits and the two
   defaults for `moreLabel` (6's "Load more posts", 7's "Load older posts") now apply to the catalog
   value.
6. **The other eight strings joined them:** the three position lines with their `{page}`/`{pages}`,
   `{from}`/`{to}`/`{total}` and `{seen}`/`{total}` placeholders, "No older posts" / "No newer
   posts", the failure line, "Loading", and 7 Endless's "Back to top" / "Top". `endLabel` keeps
   `{total}`. Thirteen strings in all; **no fixed English visitor-facing string ships.**
7. **Per-design rendering rules survive the move.** 9 Cards still uppercases its two labels and still
   warns past about twenty characters; 10 Slim still draws the first word only, keeps the full value
   as the accessible name, and still warns past about twelve.
8. **A34 authors nothing at all**, which is the honest end of this spec's own "there are no repeating
   items" finding: no text field, no icon slot, no repeater, nothing inline-editable. Category-wide
   item 5 is followed literally — no icon slots, no repeaters and no inline-editable pager text were
   added, and none remain.
9. **`posts_per_page` ends at a door.** The Pager block's read-only line links to Ghost Admin →
   Settings → Posts per page. The field is still not editable in the section, but the hunt for it
   finishes somewhere.
10. **6 Load More's jump row is raised to 38/44**, overruling the flagged "the one sub-44 target in
    A34" and the A11y line that shipped it at 26 px. The **Shown below** value stays: the
    visually-hidden numbered links serve no-JS and crawlers either way, but a drawn secondary route
    that cannot be tapped is worse than no route, and a floor with an exception in it is not a floor.
    Its failure line and `endLabel` render from the catalog; the retry is the same real button
    returning to rest.
11. **2 Prev and Next states its typeface change.** Link size Small is the body font, Medium and
    Large the heading font — previously flagged only in this file, now said in the panel so a
    divergent-font pack does not read it as a defect.
12. **9 Cards' card is A26's card.** Finding 9 is promoted from a suggestion to a requirement and
    carried to the A26 patch: the previous-post / next-post pair reuses this card with the post title
    where the page number sits, rather than a second component being drawn.
13. **Ground rules that do not bite here, and why.** No "Preview" control existed in any A34 panel,
    so none was removed. **Member Visibility is not added:** a pager has no action to gate — it draws
    the route it is on, and hiding it from a member state would hide the archive's own navigation, so
    the member-aware action editor has nothing to edit. No image field exists, so Image focus does
    not apply. Buttons take no optional icon: 6 Load More's button and 5 Counter's arrows are the
    only button-shaped things in the category, and an icon on either would duplicate the glyph that
    is already the control's name. Behaviour still comes only from the registry — `load-more` and
    `infinite-scroll`, both existing entries — so **no ARCHITECT registry addition is needed by this
    category.**
14. **Unchanged by this pass:** every arrangement, every responsive rule, every empty and dimmed-end
    state, the four settlements, the Pager block's four fields, both module declarations with their
    standing panel warnings, the eleven-field data union, and all ten tuples.

---

## Patch notes — pagination styles patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered. Where a ruling could not be applied without inventing a decision, it is
written here as an **open question** and asked in plain words at the end.

**Frames changed — all eleven:** `A34-0 Category Proof` and `A34-1` … `A34-10`. Every one of the ten
design frames carries a dated **patch pass** panel at the top stating what changed in that design.

### This category's own rulings

| What changed | Why, and where |
|---|---|
| **Numbers All pages is deleted, and the seven-slot window is the only page-link row A34 draws.** A theme's templates cannot count through a range of numbers, so a row of one link per page cannot be built at any archive size. **The window can be built, and that is the whole reason it survives:** first is 1, last is `pagination.pages`, the two neighbours are `pagination.prev` and `pagination.next`, the middle one is `pagination.page` — five numbers the route hands over, no sum anywhere, and an ellipsis decided by comparing two of them. The **Numbers** control is gone from **1 Numbers, 3 Bar and 4 Pill**, each of which now has **four** controls of its own; with it go 3 Bar's scrolling middle zone, 4 Pill's internal scroll, and every "All pages is exempt" clause in the responsive rules. The 137-page stress route is redrawn as the same seven slots. | *(The templates cannot count, add or remember.)* |
| **Post range leaves the Pager block: Position line is Off · Page count in all ten.** "Posts 13–24 of 132" needs `(page−1)·limit+1` — a multiplication. **Only the two designs that carry a script can count**, and their "24 of 132 posts" is the module's own progress line rather than this field. Four designs lost drawn content: **5 Counter's** line beneath the counter (Position line now fixed Off — the counter *is* the position line), **8 Contrast Band's** second half at 120 px and above, **10 Slim's** stacked phone exception, **3 Bar's** tablet resolution rule. Every frame that drew a range now draws "Page 2 of 11". | *(The templates cannot count, add or remember.)* |
| **Posts per page is INFLOZO's theme setting, not Ghost's.** Ghost's admin has no posts-per-page field, so the read-only door in all ten panels pointed at a page that does not exist. It now links to INFLOZO's theme settings, and the door still closes the hunt. 6 Load More's "no Batch control" line, which named Ghost's settings as the source, is corrected with it. | *(Some fields we drew do not exist.)* |
| **5 Counter's Numerals Padded is deleted — "2 / 11", not "02 / 11".** A theme cannot pad a number to a fixed width. What the padding bought is already free: the figures are tabular, so the group holds its width between page 9 and page 10. Numerals reads **Plain · Worded**. | *(The templates cannot count, add or remember.)* |
| **9 Cards' Content value "Direction, page and count" is deleted.** The count was `limit`, or `total − (pages−1)·limit` on the last page. Content reads **Direction only · Direction and page**, and the card's third line is gone from the frames. | *(The templates cannot count, add or remember.)* |
| **The Search category cannot be pointed at, because it no longer exists.** The stress frame and finding 8 both ended "Search is the answer to a 137-page archive". That category was deleted and its number retired, so the sentence named nothing. It is now an open finding with no owner: a 137-page archive needs a route a pager cannot provide, and the library does not currently have one. | *(No design ever turns into another design — and the deleted category.)* |

### The library-wide rules

| Rule | What it did here |
|---|---|
| **Item counts are a number picker** | **One subject: 7 Endless's Stop after**, drawn as three fixed buttons — 2 pages · 4 pages · Never. It is now **a number picker, 2 to 8 pages, default 4**, capped at 8 with the reason drawn: past eight automatic pages a reader is further from the footer than any button can bring them back. **Never is deleted** — a count is a number, and a stop that never fires is the failure this design exists to prevent. Nothing else in A34 is a count: the page links belong to the route and the two directional links are fixed at two. |
| **No design ever turns into another design** | **Two phrases deleted.** **7 Endless's** stop was written as handing the rest of the archive "to 6 Load More's button"; at the stop it draws **its own button in its own flow** — the library's load-more control, as every design uses shared components — and the hand-off framing is gone from the descriptor, the archetype note and the flagged list. **8 Contrast Band** "prints as 1 Numbers on white" becomes "prints its own numerals on white, the band dropped". The **Hand-off** row leaves this category's component inventory: nothing in A34 spends it now. What remains is advice — 3 Bar naming 10 Slim at two pages, 2 Prev and Next naming 1 Numbers for a deep archive — and advice is not a switch. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all ten. **There is no "Inherit" value anywhere in A34**, and no colour swatch row — the ground is the feed's. Every constraint on a Pager block field is drawn with its reason: 3 Bar sets a default, 2 Prev and Next and 4 Pill lock, 5 Counter and both module designs mark inert, 10 Slim interprets. **Narrowing now has no example in A34**, Position line having two values; the rule is unchanged and the example moved. **No design added a value to a shared field, and none renamed one.** |
| **The two free designs are the owner's choice — ask him** | Shortlisted the five plainest, photography-independent designs — **1 Numbers · 2 Prev and Next · 10 Slim · 3 Bar · 9 Cards** — and recommended 1 Numbers · 2 Prev and Next. **The owner chose 2 Prev and Next · 9 Cards** on 29 August 2026 — the two designs that draw no page numbers at all, the quietest and the largest targets — and neither needs a script. **The line is recorded at the head of this document and badged on the roster in `A34-0`. Closed.** |
| **Avatars with no photograph** | **No subject.** A34 renders no person: no author, no member, no initials, no `profile_image` read anywhere in ten designs. |
| **The remove button never greys out** | **No subject.** Nothing in A34 is an authored repeating list — no repeater, no Add, no Remove, no minimum — and after the reconciliation the category authors nothing at all. |
| **Slider labels** | **No subject.** A34 draws no slider. Every control is a named-value row, a lock, or — since this pass — one number picker, and each title says what it affects: Height, Band height, Counter size, Card style, Stop after. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** No Tight/Even/Airy or Tight/Standard/Wide vocabulary exists anywhere in A34. 1 Numbers' **Density** is a two-step ladder in the standard padding words — Compact · Comfortable — and it moves the gap between boxes without changing the box, the type or the 44 px target. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** A pager has no member action: no subscribe button, no paid tier, no Portal link. Member Visibility is not added either — hiding a pager from a member state would hide the archive's own navigation. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A34 contains no subscribe or sign-in form, so there is nothing for a notice to replace, and no design ever claimed something could be subscribed to without JavaScript. Every design's no-JavaScript line is listed below. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10.** Ten designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted. |

### The no-JavaScript line, per design

| # | Design | Module | Without JavaScript |
|---|---|---|---|
| 1 | Numbers | none | **Pixel-identical.** Every element is an `<a>` or a `<span>` and the destinations are Ghost's own `/page/N/` routes. |
| 2 | Prev and Next | none | **Pixel-identical.** Two links, a position line, a hairline. |
| 3 | Bar | none | **Pixel-identical.** The band, its zones and its hairlines are CSS. |
| 4 | Pill | none | **Pixel-identical.** The pill is a container, not a control. |
| 5 | Counter | none | **Pixel-identical.** The counter is a paragraph and the arrows are links. |
| 6 | Load More | `load-more` | Quoted from the registry: "Ghost's numbered `/page/2/` pagination links render instead (FR-G4, explicitly)." Those links — the seven-slot window — are in the markup on every render, `.visually-hidden` at Page links Hidden, **never `display:none`**. The button, the count and the meter are absent in that branch, not inert. |
| 7 | Endless | `infinite-scroll` | Quoted from the registry: "Same — numbered pagination links render (FR-G4, explicitly)." The same window, in the markup on every render. Pill, sentinel and focus-revealed button are absent, not inert. |
| 8 | Contrast Band | none | **Pixel-identical.** The band's colour and its derived steps are CSS; the accent underline's dark disablement is a `prefers-color-scheme` branch, so it resolves without script. |
| 9 | Cards | none | **Pixel-identical.** The whole card is inside its `<a>`. |
| 10 | Slim | none | **Pixel-identical.** Two anchors, one paragraph, two hairlines — the least machinery in the library. |

### Open questions

**Both questions this pass raised have been answered by the owner, and nothing is left open.**

1. **Which two designs a free site gets** — **answered: 2 Prev and Next · 9 Cards.** Recorded at the
   head of this document and badged on the roster in `A34-0`.
2. **What sits under 5 Counter's numerals now that the post range cannot be drawn** — **answered:
   nothing.** The counter is the whole design: it states the position at 52 px, and a second line
   beneath it would either repeat that or describe the archive instead of the reader's place in it.
   Position line stays fixed Off there, and no value was added to a shared field.
   **Nothing else in this pass required a decision nobody had made.**
3. **No registry addition was needed.** A34 still declares exactly `load-more` and `infinite-scroll`,
   both existing entries, and **no module name was coined anywhere in this category.**

### What this pass supersedes in the earlier notes

- **Reconciliation note 9** — "`posts_per_page` ends at a door … links to Ghost Admin → Settings →
  Posts per page" — is superseded: the door is INFLOZO's theme settings, Ghost having no such field.
- **The Pager block's four values** are unchanged in number; **Position line has two of them**, not
  three.
- **The control counts fall again**, and no design gained a control: **1, 2, 3, 4, 6, 7, 8, 9 and 10
  carry four of their own; 5 Counter carries five.**
- **Unchanged by this pass:** every arrangement, every colour, every type size, every spacing step,
  both module declarations with their standing panel warnings, the four settlements, the eleven-field
  data union, all ten tuples, and all ten numbers.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10** — ten designs, no gap
  created or closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the
  required shape, and names **2 Prev and Next** and **9 Cards** — both of which exist in this
  category's roster. It is the owner's own choice, confirmed on 29 August 2026.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** ten designs, numbered **1–10**.
