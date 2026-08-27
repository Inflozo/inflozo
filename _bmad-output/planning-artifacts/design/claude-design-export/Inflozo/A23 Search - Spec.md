# A23 Search — written specification

15 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass, 25 August 2026**

The frames are `A23-0 Category Proof.dc.html` and `A23-1` … `A23-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation pass.** The whole category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. This revision applies that patch. It reuses the shared editor primitives designed in **P0 ·
Editor primitives** by name and never redesigns them: **P0·1** the inline text toolbar and its link
popover, **P0·2** the icon slot and Icon Picker with its size/colour-role popover and button icons,
**P0·3** the item-list controls, **P0·4** the member-aware action editor (which lands nowhere in A23,
and why is stated), **P0·5** the "Populate from…" data panel, **P0·6** the editor state switcher.
What each design gained is in a **Reconciled** paragraph at the foot of its entry, and the
frame-by-frame list is in **Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(1 Field and Results in three packs, light and dark), the stress frame, the roster, the component
inventory, the pass summary and the findings in full. The shared field list is repeated below because
the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A22 and A24–A29 are specified in root-level
`<ID> — Spec.md` files and this follows them.)*

---

## 0 · The category layer

### What A23 is

**The surface a reader lands on when they want one thing out of an archive.** A field, and what
comes back. Thirteen designs draw results; **two hand the query to the search route and stop** —
9 Slim Bar and 12 Cover, using the handoff A1·11 established. One of them, **2 Overlay, is the panel
every search affordance in A1 Headers opens**, drawn once here so no header invents its own.

Three neighbours own adjacent ground and A23 does not repeat them. **A1·9 Search-Forward** is the
persistent field in a header — it opens this category's panel and owns none of it. **A4·15 Search**
is a hero with one field that never renders a result; A23 owns the results, the suggestions, the
recent queries and the keyboard model, which A4·15's spec says explicitly. **A17·15 Filtered** is a
tag strip over a post grid — a browse surface, not a query one. All three are named on the frames.

A23 inherits **A4·15's 52 px search field and its four states verbatim**; **A1·9's suggestion row,
five-row cap, 200 ms debounce, three-character minimum, recent-query store and two-step Escape**;
**A1·1's dropdown panel, eyebrow, nav-item active underline and primary button**; **A17's content
box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132); **A17·1's post card
and three-up grid**; **A17·7's on-contrast derivation**; **A17·15's tag pill**; **A17·16's
load-more button**; **A18·2's thumb row**, **A18·3's clipped-string rule** and **A18·15's batch
focus rules**; **A19·3's surface plane**; **A20·13's warm scrim**; **A29·3's accent-on-band
finding** and **A29·4's Flat-in-dark override**; **A5·5's split head**; **A12·10's directory
column**; **A6's focus ring** and **A17·18's inset variant**. **A23 adds eleven components and
nothing else** — they are listed at the foot.

### The four settlements (§8 of the brief)

**1 · The surface A1·9 opens, and its keyboard model.** **2 Overlay is that surface** ⚑, and every
search affordance in A1 opens it — A1·9's field, A1·2's drawer field, A1·14's ⌕ button. **One row,
two densities** ⚑: the *suggestion row* is A1·9's — title, then "section · author · date", and its
accessible name is those four things in that order — and the *result row* is that row with an
excerpt. 11 Thumb Rows adds the picture; nothing else differs. **Combobox semantics live in two
designs, not fifteen** ⚑: 2 Overlay and 3 Command Palette carry `aria-activedescendant`, arrows that
never move focus and Escape's two steps. **The other thirteen are documents** — their results are a
`<ul>`, their arrow keys are the browser's. Drawing a page of results as a listbox is the commonest
search-page accessibility defect, and it is refused here by name.

**2 · Empty query, no results, many results, and the count.** **Empty query is not an empty state**
— it is the recent-search state: the reader's own last three queries, then the site's **featured
posts**, then the field alone. **The reader's queries never leave their browser** ⚑. **"Most read"
was struck in the reconciliation pass** ⚑ — no view counts reach a theme or the Content API, so the
promise was one the platform cannot keep; the row now offers featured and latest. **5 Tag Chips
ignores all of it** ⚑ — its chips *are* the pre-query state, and it is the one design that ignores
the source group's "Before a query" row. **No matches is a content state, not an error**: no red, no
icon; the query, one line of why, the section chips, an archive link — **and the line names the
index** ⚑, which is whatever the source group's **Search in** row says it is. **The count line is the
announcement** ⚑: visible text and a visually-hidden `aria-live="polite"` region where results
replace in place, **and no live region where the query was a page navigation** (A34's rule). **The
count always names the true total, never the capped one** ⚑.

**3 · Filters — the design or a control?** **Three designs are the filter; twelve have none** ⚑.
5 Tag Chips draws the publication's own tags as an authored row; 13 Facet Rail draws Ghost's tags,
authors and years in a column; 15 Grouped splits the answer by object type. **One facet at a time,
and that is a platform limit rather than a simplification** ⚑ — a Ghost theme is given one taxonomy
route at a time, so "Reporting, by Ida Brandt, in 2026" has no URL. **Filters are `<a href>` links**,
so `filter-strip` — declared by 5 and 13 — is the module that needs JavaScript least. **Two counts,
two meanings** ⚑: 13's facet counts are the *archive's*, 15's group counts are the *query's*, and
both panels say which.

**4 · What is indexed, and what the spec promises.** **The floor is title, excerpt and slug; the body
is reachable if the author asks for it** ⚑. The reconciliation pass added **Search in: Titles and
excerpts (default) · Full content** to the source group. Ghost's own Sodo bundle cannot search a
body; **A23's index is client-side over the Content API, which can return `plaintext`** ⚑, so full
content is real here — at a cost in index size, which the panel states. Tags and authors are matched
on their names, not their descriptions, and only where the scope asks for them. **Pages are searched
by default** — a publication's About page is a legitimate answer. **The read-only "What is indexed"
row reports the Search in value rather than asserting a floor** ⚑, and `emptyText`'s default follows
it, which is why that sentence is an authored field and not a hard-coded string.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The field.** A4·15's, verbatim: **52 px at every width**, `surface` fill with the border token, a
  19 px `⌕` CSS glyph, 16 px text, a **32 px clear control inside a 44 px target**, visually-hidden
  `<label>`, `<input type="search" enterkeyhint="search">`. **9 Slim Bar takes 44 px** ⚑ — the
  category's one departure, because a 52 px field in a 72 px bar reads as a squeezed form.
- **Focus.** **The library's accent ring is suppressed on the field** and replaced by a 1.5 px accent
  border — A3·4's and A4·15's documented departure, repeated so every field in the library behaves
  identically. **On `contrast` and on an image the border is the carried colour, not the accent** ⚑.
- **Field widths.** *Narrow 400 · Medium 520 · Wide 640*, **stepping one named value down at 1,080
  and below and going full width at 390** ⚑. Three designs depart: 9 Slim Bar has no Wide value and a
  bespoke 320/400 pair; 12 Cover defaults to Wide and adds Full 720; 4 Split Head, 7 Panel and
  13 Facet Rail **have no field-width control at all** — the column decides it ⚑.
- **The rows.** A18's measures: **text held to 700 (820 where there is no thumb), meta on one line at
  13 px, row padding 16 · 24 · 36** by Result density. **Titles are the heading font at 21**, 19 at
  834 and 18 at 390. **Excerpt is one line, clamped, and is hidden below 767 in every design** ⚑.
- **The meta line.** **Result meta — Section, author, date · Section and date · Date · Off** — on
  1, 4, 6, 7, 11, 13, 14 and 15, added by this pass ⚑. 2 Overlay's *Row meta* and 10 Grid's *Meta*
  already governed it and keep their own names (10's gained an **Off** value). **Every value steps
  down to the date alone at ≤ 767** ⚑.
- **The match mark.** A `<mark>` at **16 % accent in light, 22 % in dark** ⚑, text underneath
  unchanged, **in the title and the excerpt and never in the meta** ⚑. **Match highlight (Marked ·
  Plain) is a row in the shared source group** — promoted out of 11 Thumb Rows by this pass ⚑ — and
  **at Plain the mark is absent from the DOM rather than untinted**. **The mark and the field's focus
  border are the section's two accent uses**, which is the ceiling.
- **The seam.** A17's ladder: **64 · 96 · 132** at 1440, **80** at 834, **64** at 390, now carried by
  the universal **Vertical spacing** control. **6 Contrast Band, 9 Slim Bar and 12 Cover resolve it to
  0** (the band, the strip and the cover carry their own) and **2 Overlay and 3 Command Palette do not
  have it at all** — they are not in the flow ⚑. A23 assumes page sections above and below it and
  **cannot know what they are** ⚑.
- **The type.** Eyebrow 13 uppercase tracked .08em · section heading 40 · 34 · 28 by width, **34 on a
  plane** and **44 on a cover** ⚑ · row title 21 · excerpt 15 · meta 13 · count line 15 · field text
  16 · **76 and 96 in 8 Big Type, the category's only display ladder** ⚑.
- **One display moment.** 8 Big Type spends it on the reader's query and **therefore draws no blurb
  at any value** ⚑. 12 Cover spends it on the photograph and holds its heading at 44. No other design
  has type above 40.
- **Accent, once or twice.** The mark and the focus border in eleven designs. **A third is refused**:
  14 Load More's Solid button **disables Match highlight** rather than allowing three ⚑ — the value
  now lives in the source group and the disable is stated in both places. **None at all in
  6 Contrast Band and 12 Cover** ⚑ — A29·3's finding that Paper's accent measures 4.0:1 on the band,
  and the impossibility of promising a contrast ratio over an unknown photograph; on the band the
  mark resolves to the carried colour.
- **Targets.** The field is 52 (44 in 9); **every other interactive element is 44** ⚑. Facet rows are
  32 px inside 44 px rows; chips are 36 inside 44; the whole row and the whole card are targets.
- **Headings.** **The section heading is an `h2`** ⚑ — A29 Archive Headers owns the route's `h1`.
  **Three departures, each stated on its frame:** 9 Slim Bar has **no heading at all** and its
  `<form>` takes `aria-label="Search {site title}"` (A3·4's rule); 8 Big Type's display line is a
  `<p>` with **a visually-hidden `h2` reading "Search results"** ⚑; 13 Facet Rail and 15 Grouped add
  `h3` group and facet labels under the section's `h2`.
- **No results, no red.** The seven roles contain no error colour, and **a query that finds nothing is
  not an error anyway** ⚑.
- **Searching.** **The previous list holds its height and dims one step; there are no skeleton rows
  and no spinner** ⚑. On `contrast` the dim is opacity, because there is no lighter token to move to.
- **Dark.** A27's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows dropped and
  the hairline carrying every plane. **Cards and planes force Flat in dark** ⚑ (A29·4). **The mark
  re-tunes to 22 %** ⚑. **Photographs are untouched** and image scrims deepen one step. **The field
  is a step away from what it sits on** — lighter on the page ground, **darker on a lifted plane**
  ⚑, which is A23's one departure from A22's rule and is stated in 7 Panel and 9 Slim Bar.
- **Print.** **The head, the query, the count line and the rows print; the field, the chips, the
  facet rail, the load-more button and the overlay do not** ⚑ — a printed page cannot be typed into.
  2 Overlay and 3 Command Palette print nothing at all.
- **No JavaScript, no results — in all fifteen** ⚑. **A Ghost template cannot read a query string and
  cannot search server-side**, so a GET to `/search/` lands on a page whose results are rendered by
  the same client module. **The floor is a server-rendered field and an archive link.** 5 Tag Chips'
  and 13 Facet Rail's link-based filters still work with everything off, and both say which half
  survives. **8 Big Type's "the route renders the submitted query" is struck**, and so is **15
  Grouped's "the route can render the groups server-side"** ⚑ — both unimplementable.
- **Behaviour.** **Five of the registry's thirty-one modules, and two designs declare none.**
  `search-overlay` in twelve · `command-palette` in 3 · `filter-strip` in 5 and 13 · `accordion` in
  13 (its 390 disclosure) · `load-more` in 14. **9 Slim Bar and 12 Cover declare nothing** ⚑.
- **Refused category-wide, each with a reason:** `infinite-scroll` ⚑ (A17 and A18's refusal, carried:
  auto-loading past a stated cap makes the control a lie) · `search-expand` ⚑ (every field here is
  persistent or inside a panel — a finding, below) · a relevance-sort control ⚑ (Ghost exposes no
  score to a theme) · a multi-facet filter ⚑ (no Ghost route expresses it) · a "search this section"
  scope ⚑ (a section cannot see its route) · a third-party search provider ⚑ (a platform decision) ·
  commands in the palette ⚑ (a public site's search must not be able to change the site) · a
  per-result control of any kind · hover reveals and autoplay ⚑ · **and a "Preview" control, which
  this category never had** — P0·8's rule lands here as nothing to remove.

### The universal trio — outside every design's control list

Three rows on every **placeable** section, drawn in the panel below the design's own list and **not
counted** ⚑.

| Row | Values | Notes |
|---|---|---|
| **Background role** | Background · Surface · Contrast | Moves the ground under the whole section — field, count line and rows together, never one of them ⚑. **Locked on 6 Contrast Band** (Contrast, the band *is* the design) **and 12 Cover** (Image), **with the reason shown in the row rather than the row hidden** ⚑. Defaults to Surface on 7 Panel and 9 Slim Bar |
| **Vertical spacing** | Compact · Comfortable · Spacious | Resolves 64 · 96 · 132; 80 at 834, 64 at 390. **This is the retired per-design Padding row under its real name** ⚑ — eleven of them. **Resolves 0** on 6 (at Full bleed), 9 and 12, whose own object carries the space |
| **Top divider** | None · Line · Fade | Drawn above the section on the page ground. **On 9 Slim Bar the strip's own top hairline coincides with it and only one rule is drawn** ⚑ |

**Genuinely different ladders keep their own names** ⚑: **6 Contrast Band's Band padding**
(64 · 88 · 120, the space *inside* the band) and **7 Panel's Plane padding** (32 · 48 · 64, the space
*inside* the plane). One is the space around an object and the other is inside it, so they are two
controls and not a duplicate.

**2 Overlay and 3 Command Palette carry no trio at all** ⚑ — they render nothing in the page flow, so
there is no ground to role, no space to set and no edge to divide. **ARCHITECT: editor-surface
ruling** — a panel is selected from a dedicated editor surface, listed with the header that opens it,
not placed in the page stack. Drawn as a note on both frames.

### The controls every design shares — the Search source group

**Seven rows where a design draws results, six where it does not**, identical in all fifteen
otherwise, **below** each design's own controls and **not counted** ⚑, one of them read-only.

| Field | Type | Values |
|---|---|---|
| `searchScope` (What it searches) | enum req | Posts · Posts and pages (default ⚑) · Posts, pages and tags · Everything, including authors. **It also decides how many groups 3 and 15 draw** ⚑ |
| `searchIn` (Search in) | enum req | **Titles and excerpts (default) · Full content** — new in this pass ⚑. A23's index is client-side over the Content API, which can fetch `plaintext`; **the panel states the index-size cost** (roughly 4–8 kB a post, so a 400-post archive fetches a few megabytes before the first query) |
| `beforeQuery` (Before a query) | enum req | **Recent searches, then featured (default) · Featured posts · Latest posts · Nothing** ⚑. **"Most read" is struck** — no view counts reach a theme. **5 Tag Chips ignores this row** ⚑ |
| `minChars` (Start searching after) | enum req | 2 · 3 (default ⚑) · 4 characters. A1·9's minimum, with its 200 ms debounce |
| `resultCap` (How many results) | enum req | 10 · 20 (default) · 50 · All matches. **The cap is the section's; the count line always names the true total** ⚑ |
| `matchMark` (Match highlight) | enum req | **Marked (default) · Plain** — promoted here from 11 Thumb Rows ⚑. **Disabled at 14 Load More's Button style: Solid**, with the reason shown. **Not drawn on 9 and 12**, which mark nothing |
| *What is indexed* | read-only | **Follows Search in** ⚑ — "Title, excerpt and slug", or "Title, excerpt, slug and body text". `emptyText`'s default follows the same value |

### The roster

**Ctl is each design's own controls**, outside the trio and the source group.

| # | Design | Tuple | Ctl | Modules |
|---|---|---|---|---|
| 1 | Field and Results | `form · none · page · many · none · field above a single result column` | 6 | `search-overlay` |
| 2 | Overlay | `overlay · card · transparent · many · none · a panel over the dimmed page` | 6 | `search-overlay` |
| 3 | Command Palette | `overlay · box · transparent · variable · none · grouped results under one field` | 6 | `command-palette` |
| 4 | Split Head | `split · none · page · many · none · head column beside the results` | 6 | `search-overlay` |
| 5 | Tag Chips | `form · none · page · few · none · authored tag chips under the field` | 5 | `search-overlay` · `filter-strip` |
| 6 | Contrast Band | `feed · none · contrast · many · none · field and results on an inverted band` | 7 | `search-overlay` |
| 7 | Panel | `feed · none · surface · many · none · the query surface on a raised plane` | 5 | `search-overlay` |
| 8 | Big Type | `stack · none · page · many · none · the query at display size` | 4 | `search-overlay` |
| 9 | Slim Bar | `bar · none · surface · none · none · one line, the query navigates away` | 5 | **none** |
| 10 | Grid | `grid-of-N · none · page · many · top · results as a card grid` | 5 | `search-overlay` |
| 11 | Thumb Rows | `feed · none · page · many · left · a thumbnail on each result row` | 5 | `search-overlay` |
| 12 | Cover | `form · none · image · none · background · the field over a cover photograph` | 6 | **none** |
| 13 | Facet Rail | `edge rail · none · page · many · none · facets pinned beside the results` | 6 | `search-overlay` · `filter-strip` · `accordion` |
| 14 | Load More | `feed · none · page · many · none · a button appends the next batch` | 5 | `search-overlay` · `load-more` |
| 15 | Grouped | `feed · none · page · variable · none · results grouped by what they are` | 6 | `search-overlay` |

### Tuple uniqueness — the honest statement

**All fifteen are distinct on the five closed slots.** **Archetype spreads the category** — five
`feed`, three `form`, two `overlay`, and one each of `split`, `stack`, `bar`, `grid-of-N` and
`edge rail`. **Ground separates the three forms**: `page` on 1 and 5, `image` on 12; **item-count
separates 1 from 5** (`many` against `few`). **Ground separates the five feeds** — `contrast` on 6,
`surface` on 7, `page` on 11, 14 and 15 — and **media and item-count separate those three**: `left`
on 11, `variable` on 15, and 14 the plain one. **Containment separates the two overlays**, `card`
against `box`.

**Containment is `none` in thirteen of fifteen** ⚑. 2 Overlay is `card` and 3 Command Palette is
`box` because in those two **the section itself is the panel** — the case the rule is for.
**10 Grid's cards are the items' geometry, not the section's**: A21·2's rule.

**Item-count names what the layout is built for, not what the control allows** ⚑. `none` on 9 and 12
is literal — no repeating unit and no results. **9's new `trailingTags[]` does not change it**: two
to three links in a fixed trailing group are not the layout's repeating unit, and that judgement is
recorded in the Reconciliation notes rather than resolved by editing the tuple ⚑. `few` on 5 says the
chip row is built for two to six; `many` on nine designs says five or more with one supported;
`variable` on 3 and 15 says the author sets the rows and the query decides how many groups.

**What the check cannot promise.** **1 Field and Results and 14 Load More are the same column**, with
and without a button at its foot — the tuple separates them on archetype and the emphasis phrase
carries the rest. **4 Split Head and 13 Facet Rail are both two columns**, and what differs is
whether the narrow one is prose or links. **2 Overlay and 3 Command Palette are the same panel**
until the groups appear. **7 Panel and 6 Contrast Band are the same feed on two grounds** — the case
the ground slot exists for, and the one place in this category where the machine check does real
work. **Each panel names the others by number** ⚑ rather than pretending the overlap is not there.

### Repeating items — the whole category, in one place

**Five kinds of item appear in A23 and two of them are authored.**

- **`tagChips[]`** — 5 Tag Chips, **the category's principal authored list** ⚑, and it takes the
  **P0·3 item controls** verbatim: drag to reorder · per-row overflow with Duplicate and Remove ·
  **Add arrives with content**, never a blank pill · the range line reading `2–6 · 5 used`.
  **2–6 tag references**, the publication's own order. **Add** sits under the last chip as a
  full-width "Add a tag" row and **arrives as the publication's next most-used tag, already filled
  in** ⚑, at the end of the order; **Add is disabled at six** and the row says why. **Remove** is an
  ✕ on the chip's own sidebar row and **is never disabled above the minimum**. **Order is meaningful
  and drag-reorderable** ⚑ — it is a priority list, which is the whole reason the field exists rather
  than reading Ghost's alphabetical order. **Minimum two**: removing to one draws one chip and the
  panel names 1 Field and Results; **zero chips renders the field alone, which is 1** ⚑. **Inside a
  chip the editable content is which tag, and nothing else** — the label is Ghost's, so **a renamed
  tag renames the chip and a deleted tag drops it silently** ⚑. Chip style and Chip counts apply to
  every chip at once.
- **`trailingTags[]`** — 9 Slim Bar, **new in this pass** ⚑. **2–3 tag references**, drawn only at
  **Trailing tags: Hand-picked**; at **Most posts** the three are Ghost's most-used, in Ghost's
  order. Same **P0·3** controls as the chips, same "Add arrives filled in" rule, same reference
  semantics. **Disabled entirely at Trailing: Nothing**, and the row says why.
- **Ghost's posts and pages** — the results, in thirteen designs. **No Add and no Remove** ⚑; order
  is the query's answer and is not selectable. P0·3's Ghost-sourced sentence applies: "Add and remove
  them in Ghost — this design chooses how many to show." **0** → the no-match block. **1** → one row,
  no stretch, count line reads "1 result" ⚑. **many** → to the source group's cap. Fields drawn:
  `title` and `published_at` always; `excerpt`, `feature_image`, `primary_tag`, `primary_author` and
  `reading_time` when present. **A post with no feature image draws as Thumbnails: Off for that row
  alone** ⚑ (A18·8); **a post with no excerpt closes up rather than reserving the line** ⚑.
- **Ghost's tags and authors** — 3, 5, 9, 13 and 15. **No Add and no Remove**; a tag appears because
  the publication made one. **Order is Ghost's own** except in 5, and in 9 at Hand-picked ⚑. **A tag
  row carries its post count and an author row does not** ⚑ — Ghost gives one cheaply and not the
  other. **A facet group with fewer than two rows is not drawn** ⚑ in 13: a group of one narrows
  nothing.
- **The reader's recent queries** — every design but 5, 9 and 12. **Local to the browser, never sent
  anywhere, three at most, newest first** ⚑. The reader can clear them; **the publication cannot see
  or seed them** ⚑. **Zero** → featured stands in; **featured empty too** → the field alone.

**Per-item styling does not exist**, by construction: every control writes a single value onto the
section and the stylesheet reads it. **"Make that result bigger" is not expressible**, and a design
that seems to need it is two designs.

### Editing — stated once here and per design below

- **Every visible authored text is inline-editable on canvas** with the **P0·1** toolbar — bold ·
  italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
  noreferrer · sponsored**. That is the eyebrow, heading, blurb, note, group and facet labels, the
  sort note, 9's label and every chip-adjacent string.
- **Ghost-owned content is never inline-editable** ⚑ — post titles, excerpts, tag names, author names
  and every count. **Clicking one says "Edit in Ghost".**
- **The strings that never show at rest** — `countLabel`, `emptyHeading`, `emptyText`,
  `emptyLinkLabel`, `recentLabel`, `suggestLabel`, `seeAllLabel`, `loadMoreLabel`, `exhaustedLabel`,
  `progressLabel` — **are edited in the state that draws them, through the P0·6 editor state
  switcher**: **No query · Results · No matches** ⚑, plus 14's loading and exhausted states. **Never a
  sidebar preview row.**
- **Every URL field opens the Ghost-aware Link Picker** — the archive link, the chips, 9's trailing
  links, the "See all" rows.
- **No fixed English visitor-facing string ships.** Each is an authored field with a default, except
  the ones named as **theme translation-catalog strings** ⚑: the keycap labels "move", "open",
  "close", the visually-hidden "Clear search" and the field's visually-hidden label.
- **Buttons take an optional icon before or after the label** from the **P0·2** Icon Picker, Small
  and label-coloured — which in A23 means 14 Load More's button and nothing else ⚑.
- **Every image field carries Image focus** (Centre · Top · Bottom), reachable from the Image Picker
  popover — which in A23 means 12 Cover's `image`, **now a control as well as a field** ⚑. The
  feature images in 10 and 11 are Ghost's, cropped per post in Ghost.
- **Member Visibility lands nowhere in A23** ⚑, and that is a judgement rather than an omission:
  **nothing here is a CTA.** A search field is a form, "Browse the archive" is navigation, and a
  load-more button is pagination. Recorded in the Reconciliation notes.

### The shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | 1, 4, 5, 6, 7, 8, 12 | Stored and not drawn in eight ⚑ |
| `heading` | text | opt | 60 ch | 1, 4, 5, 6, 7, 8, 12 | **8 draws it in the display slot only before a query** ⚑ |
| `blurb` | text | opt | 240 ch | 1, 4 | Stored and not drawn in thirteen ⚑; 4 Split Head is the design it exists for |
| `placeholder` | text | opt | 40 ch | all 15 | Default "Search 412 essays and interviews" with the live post count |
| `note` | text | opt | 90 ch | 1, 4, 6, 7, 12 | **The line naming what is indexed** ⚑ — its default follows Search in |
| `countLabel` | text | opt | 40 ch | all but 9, 12 | Default "{n} results for “{q}”"; **{q} truncated at 60 characters** ⚑ |
| `emptyHeading` | text | opt | 40 ch | all but 8, 9, 12 | Default "No matches for “{q}”" |
| `emptyText` | text | opt | 160 ch | all but 9, 12 | **Names the index** — the category's most load-bearing sentence ⚑; **its default follows Search in** |
| `emptyLinkLabel` | text | opt | 24 ch | all but 2, 3, 9, 12 | Default "Browse the archive" |
| `recentLabel` | text | opt | 24 ch | all but 5, 9, 12 | Default "Recent searches" |
| `suggestLabel` | text | opt | 24 ch | all but 5, 9, 12 | **Default "Featured"** ⚑ — "Most read this week" was struck; "Latest" at `beforeQuery: Latest posts` |
| `seeAllLabel` | text | opt | 24 ch | 2, 3, 15 | Default "See all {n} results" |
| `sortNote` | text | opt | 20 ch | 10 | Default "Newest first" |
| `label` | text | opt | 20 ch | 9 | The strip's inline label; default "Search" |
| `trailingTags[]` | list 2–3 | opt | tag refs | 9 | **New in this pass** ⚑ — drawn only at Trailing tags: Hand-picked; P0·3's controls |
| `shortcutHint` | text | opt | 12 ch | 3 | Default "⌘K"; **Ctrl+K is bound whatever it says** ⚑ |
| `postsLabel` · `pagesLabel` · `tagsLabel` · `authorsLabel` | text | opt | 20 ch each | 3, 15 | Default to the object name |
| `filterHeading` | text | opt | 24 ch | 13 | Default "Narrow by" |
| `sectionLabel` · `writerLabel` · `yearLabel` | text | opt | 20 ch each | 13 | The facet group labels |
| `loadMoreLabel` · `exhaustedLabel` · `progressLabel` | text | opt | 20 · 30 · 30 ch | 14 | "More results" · "That is all {n}" · "Showing {m} of {n}" |
| `tagChips[]` | list 2–6 | opt | tag refs | 5 | **The category's principal authored list** ⚑ |
| `image` | image | **req** | ≥ 2,400 px | 12 | **The one required field in A23** ⚑ |
| `imageAlt` | text | opt | 120 ch | 12 | An empty alt is a decorative cover and is allowed ⚑ |
| `imageFocus` | enum | opt | — | 12 | Centre · Top · Bottom — **a control in the sidebar and in the Image Picker popover** ⚑, changed in this pass |
| *posts and pages* | Ghost | req | — | all but 9, 12 | `title · excerpt · slug · plaintext (at Full content) · feature_image · primary_tag · primary_author · published_at · reading_time · url` |
| *tags* | Ghost | opt | — | 3, 5, 9, 13, 15 | `name · slug · count.posts` |
| *authors* | Ghost | opt | — | 3, 13, 15 | `name · slug` — **no post count** ⚑ |
| *post count* | Ghost | opt | — | all 15 | The placeholder's number |
| *@site.title* | Ghost | req | — | 9 | The form's `aria-label` where no heading exists ⚑ |

**Twenty-four authored fields and five things read from Ghost.** A design may draw three — 9 Slim
Bar draws a label, a placeholder and its tag links — but **none needs a field the category does not
have**, so switching between any two of the fifteen preserves everything the user typed. **The two
designs that render no results still store every result field** ⚑.

---

## The fifteen designs

Every entry carries all ten fields in the brief's order, then a **Reconciled** paragraph. Controls
are listed **in sidebar order**; the universal trio and the Search source group follow each list and
are not counted.

---

### 1 · Field and Results

1. **Descriptor.** A centred eyebrow, heading and blurb; one 52 px field beneath; the results in one
   column on the page ground, head, field and list sharing an 820 axis. The category default.
2. **Tuple.** `form · none · page · many · none · field above a single result column`
   Containment `none` — the section sits in nothing. Item-count `many`: built for five or more,
   holds at one.
3. **Archetype.** form. **No departures** — the field is the form, the list is its output, both
   stack at 767.
4. **Responsive.** **1440** content 1,296 on a 72 margin; head, field and list centred on 820; field
   520; row padding 24; spacing 96. **834** heading 34, list 754, field 520 held, spacing 80.
   **≤ 767** heading 28, field full width at 52, excerpt hidden, meta the date alone, row padding 18,
   spacing 64.
5. **Content fields.** `eyebrow` · `heading` · `blurb` · `placeholder` · `note` · `countLabel` ·
   `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` · `suggestLabel`. **No image
   field.**
6. **Controls.** Alignment (Centred · Left) · Field width (Narrow 400 · Medium 520 · Wide 640) ·
   Result density (Compact · Comfortable · Spacious) · Excerpt (Show · Hide) · **Result meta**
   (Section, author, date · Section and date · Date · Off) · Count line (Show · Hide). **Six**, plus
   the trio and the source group.
7. **Data.** Ghost posts and pages by scope. **0** → the no-match block. **1** → one row, no stretch.
   **many** → to the cap, the count naming the true total ⚑. Before a query: recent searches, then
   featured.
8. **Empty state.** Three empties, three answers. No query → recent, else featured, else the field
   alone. No matches → the block. No excerpt on a post → the row closes up ⚑.
9. **Module.** **`search-overlay`.** Edit-safe — it does not run in the editor. **No-JS, quoted: "The
   trigger is a real `<form action="/search/" method="get">`, so search submits as a normal page
   navigation."** — **and the route cannot render results either** ⚑: the floor is the field and the
   archive link.
10. **A11y.** `<form role="search">`, visually-hidden label, `<input type="search"
    enterkeyhint="search">`. Heading is an `h2` ⚑. **The list is a `<ul>` in the document, not a
    combobox** ⚑. Count line doubles as a polite live region and keeps it at Count line: Hide. Clear
    control "Clear search", 44 px. Muted meta 5.4:1.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Result meta** added; **Search in**
and **Match highlight** joined the source group; **"most read" became "featured"**; the no-JS state
redrawn as field and archive link. No Member Visibility (no CTA), no Preview control to remove.

---

### 2 · Overlay

1. **Descriptor.** A surface panel over the dimmed page holding the field as its first row and five
   suggestion rows beneath. **The surface every search affordance in A1 opens**, and the only A23
   design that is not in the page flow.
2. **Tuple.** `overlay · card · transparent · many · none · a panel over the dimmed page`
   Containment `card` — here the section *is* the card. Ground `transparent`: it shows the dimmed
   page beneath.
3. **Archetype.** overlay. **One departure — it does not become a full-screen sheet at 390** ⚑; it
   keeps the panel shape 16 px from the top, because it replaces a field that was at the top.
4. **Responsive.** **1440** panel 640, 72 from the top, five rows, footer keys. **834** unchanged.
   **≤ 767** panel = width − 40 at 16 from the top, keys hidden, row meta drops the author.
5. **Content fields.** `placeholder` · `countLabel` · `seeAllLabel` · `recentLabel` ·
   `suggestLabel` · `emptyHeading` · `emptyText`. **`eyebrow`, `heading`, `blurb` and `note` stored
   and not drawn** ⚑ — a panel has no head.
6. **Controls.** Panel width (Narrow 520 · Medium 640 · Wide 760) · Panel position (Top third ·
   Centred) · Rows shown (Five · Eight · Ten) · Thumbnails (Off · Small 40) · Row meta (Section and
   date · Section · Nothing) · Footer keys (Show · Hide). **Six**, plus the source group. **No
   universal trio** ⚑ — see below.
7. **Data.** Ghost posts and pages. **0** → the no-match block inside the panel, 132 px, chips but no
   archive link. **1** → the panel shrinks to one row ⚑. **many** → five, eight or ten, then the "See
   all N" row; **the panel never scrolls** ⚑.
8. **Empty state.** No query → recent searches, else featured, else the field alone in a 60 px panel.
   Under three characters → **featured is kept rather than cleared** ⚑. No feature image at
   Thumbnails: Small → that row draws without one.
9. **Module.** **`search-overlay`.** Edit-safe — the panel never opens in the editor. **No-JS,
   quoted: "The trigger is a real `<form action="/search/" method="get">`, so search submits as a
   normal page navigation."** — **the panel does not exist without JavaScript**, and the route it
   submits to serves a field and an archive link rather than results ⚑.
10. **A11y.** `role="dialog" aria-modal="true"`, focus trapped, Escape in A1·9's two steps. Field is
    `role="combobox"` with `aria-expanded`, `aria-controls`, `aria-activedescendant`; rows are
    `role="option"`; **focus never leaves the field on arrow keys** ⚑. **The page behind keeps its
    scroll and is not made inert** ⚑. A row's accessible name is title, section, author, date.

**Reconciled.** **No universal trio** ⚑ — this section is never placed on the canvas: **ARCHITECT,
editor-surface ruling**, drawn as a note on the frame. **Search in** and **Match highlight** joined
the source group; **"most read" became "featured"**; **Row meta stays its own** rather than taking the
new Result meta row; the no-JS tile now says the route serves no results. No Member Visibility, no
Preview control to remove.

---

### 3 · Command Palette

1. **Descriptor.** The overlay panel with its results grouped and labelled by object type — posts,
   pages, tags and authors — and a shortcut hint in the field. The only design showing more than one
   kind of result at once.
2. **Tuple.** `overlay · box · transparent · variable · none · grouped results under one field`
   Containment `box` — a hairline-bounded panel rather than 2 Overlay's raised card. Item-count
   `variable`.
3. **Archetype.** overlay. Departures as 2 Overlay: no bottom sheet at 390 ⚑, content-sized, never
   scrolls.
4. **Responsive.** **1440** palette 660, vertically centred, three rows per group, type marks and
   footer keys. **834** unchanged. **≤ 767** palette = width − 40 at 16 from the top, **keycap and
   footer keys hidden — there is no keyboard to hint at** ⚑, group labels and type marks kept.
5. **Content fields.** `placeholder` (default "Search or jump to") · `shortcutHint` ·
   `postsLabel` · `pagesLabel` · `tagsLabel` · `authorsLabel` · `countLabel` · `seeAllLabel` ·
   `emptyHeading` · `emptyText`. **`eyebrow`, `heading`, `blurb`, `note` stored and not drawn** ⚑.
6. **Controls.** Palette width (Medium 660 · Wide 780) · Shortcut hint (⌘K · / · Hidden) · Rows per
   group (Two · Three · Five) · Group labels (Show · Hide) · Row type marks (Show · Hide) · Footer
   keys (Show · Hide). **Six**, plus the source group. **No universal trio** ⚑, as 2 Overlay.
7. **Data.** Ghost posts, pages, tags and authors by scope. **0** → the no-match block, no labels.
   **1** → one group, one row; **the other labels are not drawn** ⚑. **many** → to the rows-per-group
   value, then "See all in {group}". **A tag row carries its post count; an author row does not** ⚑.
8. **Empty state.** No query → featured under one label. Under three characters → recent searches,
   **ungrouped** ⚑. **An empty group is absent, label and all** ⚑.
9. **Module.** **`command-palette`, alone** ⚑ — the panel behaviour is the same panel, and declaring
   `search-overlay` beside it would declare it twice. Edit-safe. **No-JS, quoted: "The ⌘K hint is
   hidden; the visible search trigger remains and behaves as above."** — the reader gets the header's
   form and the route's field and archive link, **with no list and no groups** ⚑.
10. **A11y.** `role="dialog" aria-modal="true"`; field is a combobox as 2 Overlay. **Each group is a
    `role="group"` with an `aria-label` and keeps it at Group labels: Hide** ⚑. **Arrow keys cross
    group boundaries** ⚑. Type marks are `aria-hidden` and the object type is in the row's
    accessible name instead ⚑. The shortcut is announced once, in the trigger's name.

**Reconciled.** **No universal trio** ⚑ — not a placed section, under 2 Overlay's **ARCHITECT
editor-surface ruling**. **Search in** and **Match highlight** joined the source group; the pre-query
group label is **"Featured"** rather than "Most read"; the no-JS tile now says the route serves no
list. No Member Visibility, no Preview control to remove.

---

### 4 · Split Head

1. **Descriptor.** The head in a 420 column and the field with its results in an 836 one, 40 apart.
   The head is fixed content that never reacts to the query.
2. **Tuple.** `split · none · page · many · none · head column beside the results`
3. **Archetype.** split. Side by side above 1023, stacked at 833. **One departure — the stack order
   is fixed to head-then-results at both Head position values** ⚑.
4. **Responsive.** **1440** 420 / 40 / 836; head measure 380; field the column's full width; excerpt
   to 700; spacing 96. **834** stacked, head on 620, list 754, spacing 80. **≤ 767** head on 350,
   excerpt hidden, meta the date, spacing 64. **Head sticks is ignored below 1024** ⚑.
5. **Content fields.** `eyebrow` · `heading` · `blurb` (the reason this design exists) · `note` ·
   `placeholder` · `countLabel` · `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` ·
   `suggestLabel`.
6. **Controls.** Head column (Third 420 · Half 628) · Head position (Left · Right) · Result density ·
   Excerpt · **Result meta** · Head sticks (Off · On). **Six**, plus the trio and the source group.
   **No Field width control — the column decides it** ⚑.
7. **Data.** As 1. **0** → the no-match block in the right column, **head untouched** ⚑. **1** → one
   row, columns unchanged. **many** → to the cap. **The head is authored, never queried.**
8. **Empty state.** No query → recent, else featured, in the right column. No blurb → the head is
   eyebrow and heading only and **the 420 grid column is kept** ⚑.
9. **Module.** **`search-overlay`.** **Head sticks declares nothing** ⚑ — `position:sticky` is CSS.
   Edit-safe. **No-JS, quoted: "The trigger is a real `<form action="/search/" method="get">`, so
   search submits as a normal page navigation."** — the head renders identically and **the right
   column is the field and the archive link, not a list** ⚑.
10. **A11y.** `<form role="search">` in the right column; `h2` in the left. **DOM order is head,
    form, results at every width** ⚑, which is why the stack order is fixed. At Head sticks: On the
    pinned column is not a landmark and does not trap focus.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Result meta** added; **Search in**
and **Match highlight** joined the source group; **"most read" became "featured"**; the no-JS state
redrawn as head, field and archive link with no results. No Member Visibility, no Preview control to
remove.

---

### 5 · Tag Chips

1. **Descriptor.** A centred field with two to six authored tag chips beneath it and the results
   below. The only design whose list of things is written by the publication.
2. **Tuple.** `form · none · page · few · none · authored tag chips under the field`
   Item-count `few` — the chip row is built for two to six; it is what separates this from 1.
3. **Archetype.** form. **One bespoke behaviour: the chip row scrolls horizontally at ≤ 767 instead
   of wrapping** ⚑ — CSS overflow, not the carousel module.
4. **Responsive.** **1440** field 520 centred, chips centred and wrapping, list on 820, spacing 96.
   **834** chips wrap to two rows, list 754, spacing 80. **≤ 767** field full width, **chips in one
   scrolling row with a 20 px bleed** ⚑, excerpt hidden, spacing 64.
5. **Content fields.** `tagChips[]` (**list 2–6, each a tag reference** ⚑) · `eyebrow` · `heading` ·
   `placeholder` · `note` · `countLabel` · `emptyHeading` · `emptyText` · `emptyLinkLabel`. **`blurb`
   stored and not drawn** ⚑ — the chips are the sentence.
6. **Controls.** Field width · Chips (Below the field · Above the field) · Chip style (Outlined ·
   Filled) · Chip counts (Show · Hide) · Tags (**the P0·3 item list**, 2–6, drag to reorder).
   **Five**, plus the trio, the chip list's own group and the source group.
7. **Data.** Chips are tag references: **a renamed tag renames the chip, a deleted tag drops it** ⚑.
   Results: **0** → the no-match block with the chips kept below it, **not drawn twice** ⚑. **1** →
   one row. **many** → to the cap; an active chip makes the count line read "42 posts in Reporting".
8. **Empty state.** **The chips are the empty state** ⚑ — no query draws field and chips and nothing
   else, and **the source group's "Before a query" row is ignored in this design alone** ⚑. Zero
   chips → the field alone, which is 1. One chip → drawn, and the panel names 1 as the better design.
9. **Module.** **`search-overlay`** for the field and **`filter-strip`** for the chips. Both
   edit-safe. **filter-strip, quoted: "Filters are `<a href>` links to Ghost routes and work
   perfectly — this module needs JS least of all."** **search-overlay, quoted: "The trigger is a real
   `<form action="/search/" method="get">`, so search submits as a normal page navigation."** — **so
   the chips work with JavaScript off and the query's results do not** ⚑.
10. **A11y.** `<form role="search">` then a `<nav aria-label="Sections">` of links — **they are
    navigation, not form controls, so no `aria-pressed`** ⚑. The active chip carries
    `aria-current="page"`. Accent on a chip is 4.6:1 against its derived label. Chips 36 px in 44 px
    rows; the scrolling row at 390 is keyboard-reachable in document order.

**Reconciled.** Padding retired into the trio's Vertical spacing; the Tags row is named as **the P0·3
item list**; **Search in** and **Match highlight** joined the source group and the ignored "Before a
query" row now reads **featured**; no Result meta row here. No Member Visibility, no Preview control
to remove.

---

### 6 · Contrast Band

1. **Descriptor.** The field, the count line and the results all on the inverted band, which carries
   the section's padding and butts against whatever is above and below it.
2. **Tuple.** `feed · none · contrast · many · none · field and results on an inverted band`
   Containment `none` ⚑ — a full-width fill is a ground, not a containment (A26·3, A27·4).
3. **Archetype.** feed. **One addition — the band's own padding scale, 64 · 88 · 120**, alongside the
   trio's Vertical spacing, which is the space *around* the band ⚑.
4. **Responsive.** **1440** band full bleed or inset at 1,296; band padding 88; column 820; field 520.
   **834** band padding 72, column 674. **≤ 767** band padding 56, **Inset overridden to Full bleed**
   ⚑, excerpt hidden, meta the date, **no radius**.
5. **Content fields.** `eyebrow` · `heading` · `placeholder` · `note` · `countLabel` ·
   `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` · `suggestLabel`. **`blurb` stored
   and not drawn** ⚑.
6. **Controls.** Band width (Full bleed · Inset) · Band padding (Compact 64 · Comfortable 88 ·
   Spacious 120) · Field width · Result density · Excerpt · **Result meta** · Row rules (Show · Hide
   — **at Hide the density rises one named step** ⚑). **Seven**, plus the trio — **Background role
   locked to Contrast, with the reason shown; Vertical spacing resolving 0 at Full bleed** — and the
   source group.
7. **Data.** As 1. **0** → the no-match block on the band, chips as hairline pills in the carried
   colour ⚑. **1** → one row and the band shrinks to it. **many** → to the cap.
8. **Empty state.** No query → recent, else featured, on the band. **No result at all still draws
   the band** ⚑ — a section that vanishes leaves two page sections touching.
9. **Module.** **`search-overlay`.** Edit-safe. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — the band, the
   field and the archive link render identically and **the results do not render at all** ⚑.
10. **A11y.** `<form role="search">`; `h2`. **Every colour is derived from the carried ink**, so
    contrast is a property of the pack's band pair and is checked once ⚑: muted at 72 % measures
    7.3:1 on Paper's band. **The accent is not used, so it is not measured here** ⚑ — A29·3's
    finding that Paper's accent is 4.0:1 on the band is why, and the source group's Match highlight
    resolves to the carried colour on this ground.

**Reconciled.** The trio sits outside the list with **Background role locked to Contrast** and
**Vertical spacing resolving 0 at Full bleed**; **Band padding kept its own name** — a different
ladder. **Result meta** added; **Search in** and **Match highlight** joined the source group, the mark
resolving to the carried colour here; **"most read" became "featured"**; the no-JS tile now draws field
and archive link only. No Member Visibility, no Preview control to remove.

---

### 7 · Panel

1. **Descriptor.** One raised surface plane holding the head, the field and the results, inset from
   the page ground and keeping its internal padding at every result count.
2. **Tuple.** `feed · none · surface · many · none · the query surface on a raised plane`
   Containment `none` ⚑ — the plane is a ground, not a box (A26·3, A27·4). Ground alone separates it
   from 6.
3. **Archetype.** feed. No departures.
4. **Responsive.** **1440** plane 1,296 or 1,080; internal padding 48; column 820; field 520; heading
   34; spacing 96. **834** internal 32, column 690, heading 30, spacing 80. **≤ 767** internal 20,
   heading 26, excerpt hidden, **radius and hairline kept** ⚑, spacing 64.
5. **Content fields.** `eyebrow` · `heading` · `placeholder` · `note` · `countLabel` ·
   `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` · `suggestLabel`. **`blurb` stored
   and not drawn** ⚑.
6. **Controls.** Plane width (Content 1296 · Inset 1080) · Plane padding (Compact 32 · Comfortable 48
   · Spacious 64) · Depth (Flat · Raised) · Excerpt · **Result meta**. **Five** — **no Field width
   and no Result density: the plane's column and its padding decide both** ⚑ — plus the trio
   (Background role defaulting to Surface) and the source group.
7. **Data.** As 1. **0** → the block inside the plane, padding unchanged. **1** → one row, **padding
   unchanged** ⚑. **many** → to the cap.
8. **Empty state.** No query → recent, else featured, inside the plane. **There is no state in which
   this design renders nothing** ⚑.
9. **Module.** **`search-overlay`.** Edit-safe. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — the plane,
   the field and the archive link render identically and **the results do not render at all** ⚑.
10. **A11y.** `<form role="search">` inside the plane; `h2`. **The plane is not a landmark and has no
    role — it is a ground** ⚑. A17·18's inset focus ring where the field meets the plane edge at 390.
    Field text 12.6:1 on the plane; muted meta 5.1:1. **Depth is forced Flat in dark** ⚑ (A29·4).

**Reconciled.** Padding retired into the trio's Vertical spacing and **Plane padding kept its own
name** ⚑ — different ladders. **Result meta** added; **Search in** and **Match highlight** joined the
source group; **"most read" became "featured"**; the no-JS tile now draws field and archive link only.
No Member Visibility, no Preview control to remove.

---

### 8 · Big Type

1. **Descriptor.** The reader's query set at 96 px as a paragraph, the field beneath, the results
   below. Before a query the same slot holds the section's heading, **and the substitution is the
   design**.
2. **Tuple.** `stack · none · page · many · none · the query at display size`
3. **Archetype.** stack. No departures; the blocks keep their order at every width.
4. **Responsive.** **1440** line 96, field 520, list on 820, spacing 96. **834** line 68, list 754,
   spacing 80. **≤ 767** line 44 with `word-break` ⚑, field full width, **excerpt never drawn**,
   spacing 64. **The length step-down — 96 → 76 → 56 past 12 and 22 characters — applies at all
   three widths** ⚑.
5. **Content fields.** `eyebrow` (default "Searching for") · `heading` (**drawn in the display slot
   only before a query** ⚑) · `placeholder` · `countLabel` · `emptyText` · `emptyLinkLabel` ·
   `recentLabel` · `suggestLabel`. **`blurb`, `note` and `emptyHeading` stored and not drawn** ⚑ —
   the last because the query is the heading.
6. **Controls.** Query size (Large 76 · Display 96) · Field position (Below the line · Above the
   line) · Result density · Count line (Show · Hide, **hidden by default in this design alone** ⚑).
   **Four** — **no excerpt, no alignment, and no Result meta row** ⚑ — plus the trio and the source
   group.
7. **Data.** As 1. **0** → the query at display size and one line of why, **no separate empty
   heading** ⚑. **1** → "1 result". **many** → to the cap. **The echoed query is escaped and capped
   at 60 characters** ⚑ — a build requirement, not a design note.
8. **Empty state.** No query → the heading in the display slot, field beneath, recent or featured
   below. **If the heading is empty too the display slot is not drawn and the field moves up** ⚑.
9. **Module.** **`search-overlay`.** Edit-safe — **in the editor the display line shows the heading**,
   because no query has been typed ⚑. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — and **the
   display line is then the heading, not the query** ⚑. **The earlier claim that the route renders the
   submitted query into the line is struck**: a Ghost template cannot read `?q=`.
10. **A11y.** `<form role="search">`; **a visually-hidden `h2` reading "Search results"** ⚑ and the
    display line as a `<p>` — a reader's query in the outline would change the outline on every
    keystroke. The count line remains a polite live region at Hide. Display text 13.1:1. **At 200 %
    zoom the line reflows to two lines rather than scrolling** ⚑.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Search in** and **Match
highlight** joined the source group; **"most read" became "featured"**; **the no-JS claim is struck**
⚑ — with JavaScript off the display line is the heading and no results render, redrawn on the states
frame. No Result meta row here; no Member Visibility, no Preview control to remove.

---

### 9 · Slim Bar

1. **Descriptor.** One 72 px line holding a label, a field and three tag links, **rendering no
   results of its own**. The query is a page navigation to the search route.
2. **Tuple.** `bar · none · surface · none · none · one line, the query navigates away`
   Item-count `none` — the trailing tags are a fixed two-to-three group, not the layout's repeating
   unit ⚑. **Trailing tags: Hand-picked makes that group authored**, which is recorded in the
   Reconciliation notes rather than changing the tuple.
3. **Archetype.** bar. **One departure — at ≤ 767 it becomes three stacked rows rather than a
   scrolling row** ⚑, because a field cannot be scrolled past.
4. **Responsive.** **1440** height 72, **field 400 at 44 px** ⚑, 28 px gaps, three links. **834**
   height 68, field 300, 20 px gaps. **≤ 767** three rows at 16 px padding, field 48 full width,
   links on their own row, **hairlines kept**.
5. **Content fields.** `label` (default "Search") · `placeholder` · `note` — **stored and not
   drawn** ⚑ · `trailingTags[]` (**list 2–3, tag references, new in this pass** ⚑, drawn only at
   Hand-picked). **Every result and empty-state field is stored and not drawn** ⚑, so a switch to any
   other design loses nothing.
6. **Controls.** Bar width (Full bleed · Content) · Field width (Narrow 320 · Medium 400 — **no Wide
   value** ⚑) · Label (Show · Hide) · Trailing (Tag links · Nothing) · **Trailing tags (Most posts ·
   Hand-picked)**. **Five**, plus the trio — **Background role is the retired Bar ground row**,
   **Vertical spacing resolves 0** — and the source group at **six rows: no Match highlight, because
   nothing here is marked** ⚑.
7. **Data.** Ghost tags for the trailing links; **nothing else** ⚑. At **Most posts** the three are
   Ghost's most-used in Ghost's order; at **Hand-picked** two to three authored references in the
   author's order ⚑. **0, 1 and many results are the destination route's** ⚑ — no count, no live
   region. Fewer than three tags → those that exist; none → the trailing group is absent and the
   field takes the room.
8. **Empty state.** **The resting state is the only state — an empty field is not an empty state** ⚑.
   No search route on the site → the design is not offered and the editor names the reason (A4·15).
9. **Module.** **none** ⚑ — with 12 Cover, one of two designs declaring nothing. A real `<form
   role="search" action="/search/" method="get">` needs no JavaScript, so **there is nothing to
   degrade and nothing to quote**. `search-expand` is deliberately not declared: the field is
   persistent, as in A1·9.
10. **A11y.** `<form role="search">` with a visually-hidden label; **at Label: Hide the form takes
    `aria-label="Search Orbit Weekly"`** ⚑ (A3·4). Tag links are a `<nav aria-label="Sections">`.
    **No heading at all** ⚑. Field 44 px; links in 44 px rows at 390. Muted label 5.4:1.

**Reconciled.** **Bar ground retired into the trio's Background role** ⚑ (Surface · Background ·
Contrast), **Vertical spacing resolves 0**, and the Top divider coincides with the strip's own
hairline. **Trailing tags** added — Most posts · Hand-picked, 2–3 refs on 5 Tag Chips' pattern with
P0·3's controls, adding `trailingTags[]` to the shared field list ⚑. **The source group draws six rows
here.** "Most read" became "featured" in the row this design never reads. No Member Visibility, no
Preview control to remove.

---

### 10 · Grid

1. **Descriptor.** A centred field above a three-column grid of result cards, each carrying its
   feature image at 3:2, its title and one meta line. The only design whose result is a card.
2. **Tuple.** `grid-of-N · none · page · many · top · results as a card grid`
   Containment `none` ⚑ — the cards are the items' geometry (A21·2). Media `top`.
3. **Archetype.** grid-of-N. No departures — A17's collapse, three to two to one.
4. **Responsive.** **1440** three columns at 405 on a 40 gap; image 3:2; title 21; field 520 centred;
   spacing 96. **834** two columns at 357, spacing 80. **≤ 767** one column, gap 24, title 19,
   excerpt hidden, meta the date, **images kept** ⚑, spacing 64.
5. **Content fields.** `placeholder` · `countLabel` · `sortNote` · `emptyHeading` · `emptyText` ·
   `emptyLinkLabel` · `recentLabel` · `suggestLabel`. **`eyebrow` and `heading` stored and not
   drawn** ⚑ — the field is the head.
6. **Controls.** Columns (Two · Three · Four — **Four disabled at Excerpt: Show** ⚑) · Image (3:2 ·
   4:3 · Off) · Excerpt (Show · Hide, off by default) · **Meta (Section, author, date · Section and
   date · Date · Off)** · Count line. **Five**, plus the trio and the source group. **Meta keeps its
   own name** — this design already governed it — **and gained an Off value** ⚑.
7. **Data.** Ghost posts and pages with `feature_image`, `primary_tag`, `primary_author`,
   `published_at`. **0** → the no-match block, no grid. **1** → **one card at column width, at the
   grid's left** ⚑. **many** → wraps to the cap. **A post with no feature image draws as a card
   without one** ⚑; a page never has one.
8. **Empty state.** No query → featured as three cards under an eyebrow ⚑ — **the one design whose
   pre-query state is the same shape as its result state**. No matches → the block.
9. **Module.** **`search-overlay`.** Edit-safe. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — and **the
   route renders no grid** ⚑: the field and the archive link are the floor.
10. **A11y.** `<form role="search">`; the grid is a `<ul>` of `<li>` with **the whole card as one
    link named by the title** ⚑. Images `alt=""` — decorative beside their own title (A17).
    Visually-hidden `h2`. Count line is a polite live region.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Meta gained an Off value** and
keeps its own name rather than taking the new Result meta row; **Search in** and **Match highlight**
joined the source group; **the pre-query eyebrow reads "Featured"** ⚑; the no-JS tile now draws field
and archive link only. No Member Visibility, no Preview control to remove.

---

### 11 · Thumb Rows

1. **Descriptor.** The field above a list of result rows, each with a 160 × 107 feature image at the
   left, title and excerpt beside it, meta beneath.
2. **Tuple.** `feed · none · page · many · left · a thumbnail on each result row`
   Media `left` is what separates it from 1 — same archetype, ground and containment.
3. **Archetype.** feed. No departures.
4. **Responsive.** **1440** column 1,000; thumb 160; text 700; row padding 24; field 520. **834**
   thumb 128, text 520, column 754. **≤ 767** thumb 88 **forced Left** ⚑, excerpt hidden, meta the
   date, row padding 16. **The thumb never goes below 88** ⚑.
5. **Content fields.** `placeholder` · `countLabel` · `emptyHeading` · `emptyText` ·
   `emptyLinkLabel` · `recentLabel` · `suggestLabel`. **`eyebrow`, `heading`, `blurb`, `note` stored
   and not drawn** ⚑.
6. **Controls.** Thumb size (Small 88 · Medium 128 · Large 160) · Thumb side (Left · Right) · Result
   density (**the thumb sets the row's minimum height, so Compact with a 160 thumb resolves to the
   thumb** ⚑) · Excerpt · **Result meta**. **Five**, plus the trio and the source group — **Match
   highlight now lives there, not here** ⚑.
7. **Data.** Ghost posts and pages with `feature_image`. **0** → the block. **1** → one row, thumb
   and measure unchanged ⚑. **many** → to the cap. **No feature image → that row draws as
   Thumbnails: Off for itself alone** ⚑, which is data, not styling.
8. **Empty state.** No query → featured as three rows with their thumbs, **unmarked** ⚑. No excerpt
   → title and meta close up. No image → as above.
9. **Module.** **`search-overlay`.** Edit-safe. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — and **the
   route renders no rows** ⚑.
10. **A11y.** Rows are a `<ul>` of `<li>`, **the whole row one link named by the title** ⚑. Thumbs
    `alt=""`. **The mark is a real `<mark>`, and at Plain it is absent from the DOM rather than
    untinted** ⚑. Visually-hidden `h2`; polite live region on the count.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Match highlight moved out of this
panel into the shared source group** ⚑, where all thirteen result-drawing designs read it; **Result
meta** added; **Search in** joined the source group; **the pre-query eyebrow reads "Featured"**; the
no-JS tile now draws field and archive link only. No Member Visibility, no Preview control to remove.

---

### 12 · Cover

1. **Descriptor.** A full-bleed cover photograph with a warm scrim, an eyebrow, a heading and one
   field over it. Renders no results; the query is a navigation.
2. **Tuple.** `form · none · image · none · background · the field over a cover photograph`
   The only design in A23 on `image`, and the only one with media `background`.
3. **Archetype.** form. **One departure — it hands off its result states to the search route** ⚑, as
   9 Slim Bar does (A1·11's pattern).
4. **Responsive.** **1440** cover 480, heading 44, field 560, scrim 45 %. **834** cover 440, heading
   36. **≤ 767** cover 420, heading 30, field full width, **scrim one step deeper** ⚑.
5. **Content fields.** `image` (**required** ⚑, ≥ 2,400 px) · `imageAlt` · `imageFocus` (**a control
   in the sidebar and in the Image Picker popover, changed in this pass** ⚑) · `eyebrow` · `heading` ·
   `placeholder` · `note`. **`blurb` and every result and empty-state field stored and not drawn** ⚑.
6. **Controls.** Height (Short 380 · Medium 480 · Tall 620) · Field width (Medium 480 · Wide 560 ·
   Full 720) · Scrim (Light 30 % · Medium 45 % · Deep 60 %) · Alignment (Centred · Left · Bottom
   left) · **Image focus (Centre · Top · Bottom)** · Note (Show · Hide). **Six**, plus the trio —
   **Background role locked to Image, Vertical spacing resolving 0** — and the source group at **six
   rows**.
7. **Data.** Nothing from Ghost but the placeholder's post count. **0, 1 and many results are the
   destination route's** ⚑. No search route → the design is not offered.
8. **Empty state.** **No image, no design** ⚑ — the one required image in the category, because the
   alternative is 1 Field and Results with extra padding. No eyebrow or note → the block closes up.
9. **Module.** **none** ⚑. A real GET form needs no JavaScript: **nothing to degrade, nothing to
   quote**. No parallax, no scrim animation, no `reveal`.
10. **A11y.** `<form role="search">`; `h2`. **The scrim is a real element, not an opacity on the
    image** ⚑, so text over it is measured against a known colour — white on Paper's ink at 45 %
    measures 7.1:1 at the worst pixel. `imageAlt` is drawn as the `alt`; **an empty alt is a
    decorative cover and is allowed** ⚑. **No accent anywhere** ⚑ — the focus border is white.

**Reconciled.** **Image focus promoted from a field to a control** ⚑, drawn in the sidebar and in the
Image Picker popover; the trio sits outside the list with **Background role locked to Image** and
**Vertical spacing resolving 0**; the source group draws **six rows — no Match highlight**; "most
read" became "featured" in the rows this design stores and never draws. No Member Visibility, no
Preview control to remove.

---

### 13 · Facet Rail

1. **Descriptor.** A 240 px column of sections, writers and optionally years beside the field and its
   results, **one facet active at a time**, each facet a link to a Ghost route.
2. **Tuple.** `edge rail · none · page · many · none · facets pinned beside the results`
   The category's only `edge rail`.
3. **Archetype.** edge rail. **Two departures: the excerpt leaves at 834 rather than 767** ⚑, and
   **the rail becomes a disclosure row rather than a scrolling strip at 390** ⚑.
4. **Responsive.** **1440** rail 240, gap 40, results 1,016, excerpt to 700. **834** rail 240,
   results 474, **excerpt hidden** ⚑. **≤ 767** rail → one 44 px `<details>` row above the results,
   results full width, meta the date.
5. **Content fields.** `filterHeading` (default "Narrow by") · `sectionLabel` · `writerLabel` ·
   `yearLabel` · `placeholder` · `countLabel` · `emptyHeading` · `emptyText` · `recentLabel` ·
   `suggestLabel`. **The facet rows are Ghost's tags, authors and dates — never an authored list** ⚑.
6. **Controls.** Rail side (Left · Right) · Rail width (Narrow 200 · Wide 240 — **Narrow truncates
   author names at 18 characters and says so** ⚑) · Facets (Sections · Sections and writers ·
   Sections, writers and years) · Facet counts (Show · Hide) · Excerpt · **Result meta**. **Six**,
   plus the trio and the source group.
7. **Data.** Ghost tags, authors and — where the site has the route — dates, with post counts.
   **0 facets** → the rail is not drawn and the design is 1, and the panel says so ⚑. **0 results** →
   the no-match line in the results column, **the rail and its counts unchanged** ⚑. **1** → one row.
   **many** → to the cap. **The facet counts are the archive's, not the query's** ⚑.
8. **Empty state.** No facet active → every count is the whole archive's and the results are the
   unfiltered query ⚑. **A facet group with fewer than two rows is not drawn** ⚑. No year route on
   the site → no year group, whatever the control says ⚑.
9. **Module.** **`search-overlay`**, **`filter-strip`** and **`accordion`** — **the only design in
   A23 with three** ⚑, each edit-safe. **filter-strip, quoted: "Filters are `<a href>` links to Ghost
   routes and work perfectly — this module needs JS least of all."** **accordion, quoted: "Native
   `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all."**
   **search-overlay, quoted: "The trigger is a real `<form action="/search/" method="get">`, so
   search submits as a normal page navigation."** — **the facets work with JavaScript off and the
   query's results do not** ⚑; the rail is the part of this design that survives.
10. **A11y.** The rail is a `<nav aria-label="Narrow by">` of `<ul>` groups, each with an `h3` under
    the section's `h2` ⚑. The active row carries `aria-current="page"`. **Counts are inside the
    link's accessible name** — "Reporting, 42 posts" ⚑. Rows 32 px in 44 px targets; the 390
    disclosure is a real `<summary>`. Active underline 6.9:1 in dark.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Result meta** added — the control
this design was missing, because a section facet and a section in the meta line say the same thing
twice; **Search in** and **Match highlight** joined the source group; **the pre-query eyebrow reads
"Featured"**; the no-JS tile now says the facets work and the query's results do not. No Member
Visibility, no Preview control to remove.

---

### 14 · Load More

1. **Descriptor.** The result list with A17·16's load-more button beneath it and a progress line
   above the button, appending a batch per press and resetting on a new query.
2. **Tuple.** `feed · none · page · many · none · a button appends the next batch`
3. **Archetype.** feed. **One addition — the button goes full width below 767** (A17·16).
4. **Responsive.** **1440** list on 820, row padding 24, button at its own width centred, progress
   above it. **834** unchanged but narrower. **≤ 767** **button full width at 45** ⚑, excerpt hidden,
   meta the date, row padding 18.
5. **Content fields.** `placeholder` · `countLabel` · `loadMoreLabel` · `exhaustedLabel` ·
   `progressLabel` · `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` ·
   `suggestLabel`. **`eyebrow`, `heading`, `blurb` stored and not drawn** ⚑.
6. **Controls.** Batch size (Ten · Twenty) · Button style (Outline · Solid · Text — **Solid disables
   Match highlight in the source group** ⚑, two accent uses being the ceiling; **the button takes an
   optional P0·2 icon before or after its label**) · Progress (Count · Meter · Nothing) · Excerpt ·
   **Result meta**. **Five**, plus the trio and the source group.
7. **Data.** Ghost posts and pages. **0** → the block, **no button** ⚑. **1** → one row, no button.
   **Fewer than one batch** → no button at all ⚑. **many** → batches to the cap, then the exhausted
   label. **A new query resets to batch one** ⚑.
8. **Empty state.** No query → featured as three rows and **no button** ⚑ — featured is not a query
   and cannot be paged. Exhausted → the button is **replaced** by the exhausted label, **never left
   in place and disabled** ⚑ (A18·15).
9. **Module.** **`search-overlay`** and **`load-more`** ⚑, both edit-safe. **load-more, quoted:
   "Ghost's numbered `/page/2/` pagination links render instead (FR-G4, explicitly)."** **Those links
   are in the markup on every render**, visually hidden and **never `display:none`** ⚑, so the branch
   needs no detection — **and they page the archive, not the query** ⚑: with JavaScript off the
   reader gets the field, the archive link and Ghost's own pagination.
10. **A11y.** A real `<button>` in a `<nav aria-label="Pagination">` beside the hidden `<ol>` of page
    links. **A visually-hidden `aria-live="polite"` region announces the count and not the titles**
    ⚑ — "Four more results loaded. Showing 8 of 12." **Focus moves to the first new result's link**
    (A18·15). `aria-busy` on the list while loading; the button keeps its width and its name becomes
    "Loading". The meter is `aria-hidden`.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Result meta** added; **Search in**
and **Match highlight** joined the source group, **Solid still disabling the mark** with the reason
stated in both panels; the button gained **an optional P0·2 icon**; **"most read" became "featured"**;
the no-JS tile now says Ghost's numbered links page the archive rather than the query. No Member
Visibility, no Preview control to remove.

---

### 15 · Grouped

1. **Descriptor.** The results split into labelled groups by object type — posts, pages, tags and
   writers — each a short list under a 22 px heading with its count, in one page column.
2. **Tuple.** `feed · none · page · variable · none · results grouped by what they are`
   Item-count `variable` — the author sets rows per group and the query decides how many groups.
3. **Archetype.** feed. **One departure — the group gap is a quantity of its own and steps at 767**
   ⚑.
4. **Responsive.** **1440** column 820, group gap 44, label 22 over a hairline, three rows a group at
   20 padding. **834** unchanged but narrower. **≤ 767** group gap 30, label 19, excerpt hidden, meta
   the date, row padding 14. **The groups never become tabs** ⚑.
5. **Content fields.** `postsLabel` · `pagesLabel` · `tagsLabel` · `authorsLabel` · `placeholder` ·
   `countLabel` · `seeAllLabel` · `emptyHeading` · `emptyText` · `emptyLinkLabel` · `recentLabel` ·
   `suggestLabel`. **`eyebrow`, `heading`, `blurb` stored and not drawn** ⚑.
6. **Controls.** Group order (Posts first · Most matches first — **neither is relevance** ⚑) · Group
   labels (Heading · Eyebrow — **both are real `h3`s** ⚑) · Rows per group (Three · Five — **a
   tags-and-writers group is capped at four whatever the value** ⚑) · Excerpt (**never in a tag
   row** ⚑) · **Result meta** (post and page rows only; **a tag row is a name and a count and takes
   no meta** ⚑) · Group counts (Show · Hide — **these are the query's counts, not the archive's** ⚑).
   **Six**, plus the trio and the source group.
7. **Data.** Ghost posts, pages, tags and authors by scope. **0** → the block, no labels ⚑. **1** →
   one group, one row, other labels absent ⚑. **many** → three or five a group, then "See all in
   {group}". **A tag row carries its post count; an author row does not** ⚑.
8. **Empty state.** No query → one group, "Featured", three rows ⚑ — **grouping featured posts by
   object type would be a fiction**. An empty group is absent, label and all. A site with no pages
   and no public tags reduces this to one group — drawn, and the panel names 1 as the better design ⚑.
9. **Module.** **`search-overlay`.** Edit-safe. **No-JS, quoted: "The trigger is a real `<form
   action="/search/" method="get">`, so search submits as a normal page navigation."** — and **the
   claim that the route can render the groups server-side is struck** ⚑: Ghost has no server-side
   search and cannot read `?q=`, so with JavaScript off there are no groups and no rows, only the
   field and the archive link.
10. **A11y.** **Each group label is a real `h3` under the section's `h2`** ⚑ and stays one at Group
    labels: Eyebrow. Rows are a `<ul>` per group. **A tag row's accessible name is "Reporting, tag,
    42 posts"** ⚑ so its type is spoken, not inferred from a glyph. Count line is a polite live
    region; group counts are inside the heading's text.

**Reconciled.** Padding retired into the trio's Vertical spacing; **Result meta** added (post and page
rows only); **Search in** and **Match highlight** joined the source group; **the pre-query group label
reads "Featured"** ⚑; **the server-side grouping claim is struck** ⚑ and the no-JS tile redrawn as
field and archive link. No Member Visibility, no Preview control to remove.

---

## Component inventory — cumulative

**Eleven new in A23.**

| Component | What it is | First from |
|---|---|---|
| Result row | Title, one-line excerpt, "section · author · date" meta, on A18's 700 measure | **A23** (1) |
| Suggestion row | The result row without its excerpt — 44 px, title plus meta; A1·9's row | **A23** (2) |
| Match mark | A `<mark>` at 16 % accent in light, 22 % in dark; the text underneath unchanged | **A23** (1) |
| Count line | "12 results for “orbital”" — visible text and a polite live region in one element | **A23** (1) |
| No-match block | The query as a heading, one line naming the index, section chips, an archive link | **A23** (1) |
| Recent-query row | 44 px, ↺ glyph, the reader's own string; never leaves the browser | **A23** (1) |
| Search panel | A 640 surface panel whose first row is the field — "the panel is the field's border" | **A23** (2) |
| Keycap and key-hint row | 20 px mono caps in a hairline box; ↑↓ move · ↵ open · esc close | **A23** (2) |
| Group label | A 22 px heading-font label with its count over a hairline; a real `h3` | **A23** (15) |
| Facet row | 32 px, label and count, active as A1·1's 2 px accent underline | **A23** (13) |
| Progress line and meter | "Showing 8 of 12" and a 2 px rule filling to the same proportion | **A23** (14) |

**Nineteen carried forward, verbatim** — the search field (A4·15), tag pill (A17·15), load-more
button (A17·16), post card (A17·1), thumb row (A18·2), on-contrast derivation (A17·7), warm scrim
(A20·13), surface plane (A19·3 · A29·4), dropdown panel (A1·1), focus ring (A6 · A17·18), icon button
(A1·14), eyebrow (A1·1), nav item and active underline (A1·1), logo lockup (A1·1), directory column
(A12·10), split head (A5·5), content box and padding ladder (A17), clipped-string rule (A18·3) and
batch focus rules (A18·15 · A34). **Plus the P0 primitives, reused by name and never redrawn**:
the inline text toolbar and link popover (P0·1), the icon slot, Icon Picker and button icon (P0·2),
the authored item list and Ghost-sourced list card (P0·3), the editor state switcher (P0·6).

---

## Findings for the architect — eleven after the reconciliation pass

1. **What the index carries is a build decision, and this pass made it a control.** **Search in:
   Titles and excerpts (default) · Full content** ⚑ — the client-side index can fetch `plaintext`
   from the Content API. **Every empty state's wording follows the value**, which is why the wording
   is an authored field. **Verify the fetch budget on a large archive before build** ⚑.
2. **No view counts reach a theme at all** ⚑ — which is why **"Most read" was struck** from the
   pre-query row and replaced by featured and latest. If the platform ever exposes counts, the row
   gains a value and nothing else changes.
3. **There is no server-side search in a Ghost theme.** A template cannot read `?q=`, so **the no-JS
   floor across all fifteen is a field and an archive link** ⚑. 8 Big Type's and 15 Grouped's
   server-side claims were struck. **Ghost's numbered `/page/2/` links page the archive, not the
   query.**
4. **Two facets at once has no Ghost route.** 13 Facet Rail is single-select by construction. The
   closest module is `filter-strip`, which it declares; multi-facet filtering needs a query the
   platform does not expose to a theme.
5. **There is no year archive route by default.** 13's year facet needs a collection in
   `routes.yaml`; at the default Facets value no year rows are drawn and the editor names the reason.
6. **No cross-type relevance score exists.** 15 Grouped's order is an arrangement — Posts first, or
   Most matches first — and "best match" is deliberately not offered.
7. **A section cannot scope a query to the route it sits on.** 9 Slim Bar wanted "search this
   section" and cannot have it. **Five categories have now reported this route-awareness gap** —
   A21, A22, A26–A29 and A23 ⚑.
8. **2 Overlay and 3 Command Palette render nothing in the page flow**, and therefore carry **no
   universal trio**. **ARCHITECT: editor-surface ruling** ⚑ — the editor needs a surface that lists a
   panel with the header that opens it rather than in the page stack. A product decision, drawn as a
   note on both frames.
9. **Ghost gives a tag's post count cheaply and an author's not at all.** 3 and 15 draw one and not
   the other; it looks like an inconsistency on the frame and is a data limit.
10. **8 Big Type echoes reader input at 96 px** — the only place in the library rendering a reader's
    string at display size. **Escape it, and cap the echo at 60 characters**: a build requirement.
11. **`search-expand` is in the registry and A23 declares it nowhere.** Every field here is
    persistent or inside a panel. It belongs to A1's header affordances; **if no category claims it
    the registry has an unused entry** ⚑.

**None of these is a request for a new behaviour module.** The registry is closed and A23 uses five
of its thirty-one — `search-overlay`, `command-palette`, `filter-strip`, `accordion`, `load-more` —
with **two designs declaring none at all**. The two **ARCHITECT** marks in this category are an
editor-surface ruling (8, above) and nothing else: **no module name was coined** ⚑.

---

## Reconciliation notes

**Frames changed in this pass — sixteen, and every one of them.** `A23-0 Category Proof` (a new
RECONCILED block, settlements 2 and 4 rewritten, the roster's Ctl column, the field list's
`suggestLabel`, `imageFocus` and new `trailingTags[]` rows, and the findings rewritten from nine to
eleven) · **all fifteen control-panel frames** (`A23-1 Field and Results`, `A23-2 Overlay`, `A23-3
Command Palette`, `A23-4 Split Head`, `A23-5 Tag Chips`, `A23-6 Contrast Band`, `A23-7 Panel`, `A23-8
Big Type`, `A23-9 Slim Bar`, `A23-10 Grid`, `A23-11 Thumb Rows`, `A23-12 Cover`, `A23-13 Facet Rail`,
`A23-14 Load More`, `A23-15 Grouped`) · and **the states frame of every design that draws results**,
where the no-JS tile was redrawn. **No primary section frame changed**, because no item above changed
what a section draws at rest — the exceptions are the pre-query tiles of 3, 10, 11, 13, 14 and 15,
whose "Most read this week" label became "Featured", and 8 Big Type's and 15 Grouped's no-JS tiles,
which lost their rendered results.

One line per conflict, judgement or open question this pass raised.

- **"Most read" against the settled pre-query state.** §8's settlement 2 said "the site's three most
  read". **Struck**: no view counts reach a theme or the Content API. The row is now Recent searches,
  then featured (default) · Featured posts · Latest posts · Nothing, and `suggestLabel` defaults to
  "Featured" or "Latest" by value.
- **"The body of an article is not searched, and no theme-side design can change that" against Search
  in.** That sentence is true of Ghost's own Sodo bundle and **false for A23**, whose index is
  client-side over the Content API. The settlement is amended rather than deleted: the *default* is
  titles and excerpts, **Full content** is available, and the read-only row reports the value.
- **The no-JS story.** Eleven frames implied the route renders results. **Ghost cannot search
  server-side or read a query string**, so all fifteen now state the same floor: field and archive
  link server-rendered, results only with JavaScript. **8 Big Type's "the route renders the submitted
  query" and 15 Grouped's "the route can render the groups server-side" are struck** — both
  unimplementable.
- **Padding against Vertical spacing.** Eleven per-design Padding rows were the universal control
  under another name and are retired. **6 Contrast Band's Band padding and 7 Panel's Plane padding
  are kept** as genuinely different ladders (inside an object, not around it), and both rows now say
  so. **9 Slim Bar's Bar ground was Background role** and is retired into it, gaining a Contrast
  value it did not have.
- **The trio against two designs that are not placed.** 2 Overlay and 3 Command Palette get **no
  trio**. The patch asked for the editor-surface note on 2 Overlay only; **3 Command Palette is the
  same case and carries the same note**, marked **ARCHITECT: editor-surface ruling** on both frames
  rather than silently treating the two differently.
- **Result meta against the designs that already had it.** Added to 1, 4, 6, 7, 11, 13, 14, 15 as the
  patch specifies. **2 Overlay's Row meta and 10 Grid's Meta keep their own names** — a panel row and
  a card have their own meta grammar — **and 10's gained an Off value** so the two vocabularies match.
  **5 Tag Chips and 8 Big Type were not given the row**: in 5 the chips and the count line are the
  second signal, and in 8 a 96 px line above the rows is.
- **Match highlight's promotion.** Moved out of 11 Thumb Rows into the source group for all thirteen
  result-drawing designs. **14 Load More's Solid button still disables it**, and the disable is now
  stated in two places — the button's row and the source group's row — because the value and the
  reason no longer live in the same panel.
- **9 Slim Bar's trailing tags against its `none` item-count.** "Three tag links" was drawn with
  nothing saying which three. **Trailing tags: Most posts (default) · Hand-picked** adds
  `trailingTags[]` (2–3 tag refs, 5 Tag Chips' pattern, P0·3's controls) — **an authored list in a
  design whose tuple says `none`**. The tuple is unchanged: a fixed two-to-three trailing group is not
  the layout's repeating unit. **Recorded here rather than resolved by editing the tuple.**
- **12 Cover's Image focus against "a field, not a control".** The category ruled focal point a field,
  after A22·7. The ground rules require Image focus on every image field, reachable from the picker.
  **The control wins**: it is drawn in the sidebar *and* in the Image Picker popover, both writing one
  value, and the earlier ruling is superseded here rather than in silence.
- **Member Visibility lands nowhere.** A judgement, not an omission: **nothing in A23 is a CTA** — the
  field is a form, "Browse the archive" is navigation, the chips and facets are links, and the
  load-more button is pagination. **No design carries the row.** If the owner reads a search section
  as CTA-bearing, the row belongs on 1, 4, 6, 7 and 12 and nowhere else.
- **No Preview control existed to remove.** P0·8's first rule finds nothing in this category; stated
  so the audit is answerable rather than silent.
- **Control counts moved, and the ceiling did not bind.** 6 Contrast Band is the widest at **seven of
  its own**; 8 Big Type the narrowest at **four**. Every design sits far below the PRD's ≈15 visible
  controls plus the trio and the source group, so **no design needed a Quick Controls trim** — the
  3–5 highest-impact rows are named in each panel's caption.
- **Two strings became translation-catalog entries rather than fields** ⚑: the keycap labels "move ·
  open · close" in 2 and 3, and the visually-hidden "Clear search". Everything else visitor-facing is
  an authored field with a default, per ground rule 5.

— End of specification —
