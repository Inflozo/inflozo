# A21 Author Showcases — written specification

15 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass applied 25 August
2026**

The frames are `A21-0 Category Proof.dc.html` and `A21-1` … `A21-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**What the reconciliation pass did.** The category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. It **corrected the category's founding social fact** — Ghost ≥ 6.36 stores nine handles and a
website, not two — and redrew 6 Founder's social row on it; gave `authorSource` a second value,
**Hand-picked**, with the shared item controls; **blessed the role workaround** as an authored
override keyed by author slug; retired every **Padding** row into the universal **Vertical spacing**
and 15 Slim's **Ground** row into the universal **Background role**; put the **universal trio** and
the reconciled **Data group** outside every control list; added **Member Visibility** to the five
CTA-bearing designs; gave 6 Founder an **Action label** choice and 14 Image Band an **Image focus**;
and put every authored string on the shared inline toolbar against Ghost content that is never
editable. The shared editor primitives are **P0's** and are reused by name, never redesigned:
**P0·1** the inline text toolbar and its link popover, **P0·2** the icon slot and Icon Picker, **P0·3**
the item-list controls, **P0·4** the member-aware action editor, **P0·5** the "Populate from…" data
panel, **P0·6** the editor state switcher. What each design gained is in a **Reconciled** paragraph at
the foot of its entry, and the frame-by-frame list is in **Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(2 Cards in three packs, light and dark), the stress frame, the roster, the component inventory, the
four settlements in full and the category-wide reconciliation section.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A29 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A21 is

**A section that shows the people who write the publication.** It sits on a page route — an about
page, a home page, the foot of an article — never as the head of a route, which is what separates it
from A29 Archive Headers. Its items are **Ghost's authors**: the user does not write them, cannot add
them and cannot remove them. **After this pass the user can choose which of them appear** — by
reference, in an order they set — and that is the only thing about an author a section can author.

A21 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 ·
132); **A1's eyebrow, primary button, ghost action, avatar and initials fallback**; **A19·3's surface
card and A19's missing-image vocabulary**; **A20·7's index line and A20·13's warm scrim**; **A20's
hand-picked references** as the precedent for `authorPicks[]`; **A25's 240 · 48 · 1,008 rail
division**; **A26·3 and A27·4's call that a full-width fill is a ground rather than a containment**;
**A26·11's portrait at picture scale**; **A29·12's meta line and A29·1's zero notice**; **A12's
Ghost-mode Role field**, whose mechanism the role override copies. **A21 adds ten components and
nothing else** — they are listed at the foot.

### The four settlements (§8 of the brief)

**1 · The writer block.** Portrait, name, post count, two clamped lines of bio, and a link to that
writer's archive. Established in **1 Grid** and reused verbatim in 2, 3, 4, 7, 12 and 13. **Social
links are drawn in 6 Founder always, and in 1 Grid, 2 Cards, 12 Carousel and 13's lead at *Social
links: On*** ⚑. **Ghost ≥ 6.36 stores nine handles and a website** — `facebook`, `twitter` (X),
`linkedin`, `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram`, `website` — and the
"two networks" fact this category was drawn on was 5.x (finding 7, corrected). Most authors still fill
in none, which is why the row is **Off by default** and why **an absent handle drops with nothing
reserved**.

**2 · A single-author site against a masthead of twelve.** **6 Founder is built for exactly one**:
portrait at picture scale, the full bio, a meta line, one accent action. At many it draws **the first
writer in the chosen order and says so in the panel** ⚑ — and after this pass **the chosen order can
be a hand-picked list of one** ⚑, which is the honest answer to a founder page on a multi-author site.
It still never picks the site owner, because Ghost has no editorial order (finding 8, amended).
**7 Panel, 10 Directory and 11 Rail are built for twelve** and hold their arrangement down to one. The
other eleven degrade to one without changing arrangement, and **1, 2, 4 and 10 suggest 6 Founder in
the panel without switching to it** ⚑ — **the user's chosen design is never silently changed**, which
is A29·5's rule.

**3 · Writers with no bio and no picture.** **Absence is the normal case, not an empty state** ⚑.
No picture → A1·6's initials on `hover`; **14% white on the contrast band and 18% white over an
image** ⚑, because `hover` is a page-ground token and vanishes on either. No bio → the lines go and
the block closes up; **nothing is reserved anywhere in A21**, and the social row obeys the same rule
handle by handle. **11 Rail draws no portraits at all** and is the design for a publication with no
photographs on file; **9 Big Type's Portraits: Hide** is the same answer at display scale.

**4 · Zero, one and many, and the link out.** Every design states all three. **Zero is reachable** —
a site whose only posts are drafts returns no authors — and the shared Data group offers *Head and
notice* or *Hide the section* ⚑. **Hiding is offered here and was refused in A29** ⚑: an archive route
with a hidden head is a blank page, but A21 is never the only section on its route. **Every writer
links to their A29 archive** through Ghost's `{{url}}`, and **the section cannot repoint it** ⚑ —
re-pointing it would break the active state on the archive it lands on.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The seam.** The section's own space above and below is the **universal Vertical spacing** control,
  resolving **64 · 96 · 132** at 1440, **80** at 834, **64** at 390 ⚑ — A17's ladder. **No design
  carries a Padding row any more**: it was Vertical spacing under another name. **5, 14 and 15 lock
  Vertical spacing at 0** ⚑ — a full-bleed band or strip butts the sections above and below it — and
  the ladder that moves anything there is the band's own (*Band padding*, *Height*, *Strip padding*).
  **8 Faces' 32 · 48 · 72 is renamed *Bar padding*** ⚑ and kept, because it is a different measure.
  A21 assumes page sections above and below it and **cannot know what they are** ⚑ — the same
  route-awareness gap A26 to A29 each raised.
- **The measures.** A17's content box, unchanged. The head's measure is **720**; the blurb is clamped
  at **620** on the page, **640** on the band, **560** over an image and **400** in 4 Split Head's
  column ⚑.
- **The type.** Eyebrow 13 uppercase tracked .08em · section heading 40 · 34 · 28 by width, and 30 in
  7 Panel ⚑ · blurb 17, 16 at 390 · bio 15 · writer names 16–21 in the block designs, 24 in 11 Rail,
  32 in 13's lead, 40 in 6 Founder, **56 · 72 · 88 in 9 Big Type, the category's only display
  ladder** ⚑ · counts 13, 14 in a meta line, 15 at a row's right edge · **role 13 where it is drawn**
  ⚑. **Nothing below 13, and nothing between 13 and 15** ⚑.
- **One display moment.** 9 Big Type spends it on the names and therefore **draws no section
  heading** ⚑. No other design has type above 40.
- **Accent, three times in fifteen.** **6 Founder's button, 4 Split Head's action link and 11 Rail's
  action link** ⚑. **No name, count, eyebrow, rule, portrait ring, dot or social icon is ever
  accent** — 12 Carousel's active dot is `text` ⚑, and a social icon takes its colour role from the
  Icon Picker popover, defaulting to `text-muted` ⚑ — and **5 Contrast Band has no action at all**, on
  A29·3's finding that accent measures 4.0:1 on the band at 14 px.
- **Targets.** Every interactive element is **44 px** ⚑, **social icon slots included: 32 in 44** ⚑.
  **The whole row is the target in 7 Panel and 11 Rail**; **3 Rows has two anchors per row** (the name
  and the link) and the row itself is not a link ⚑; **2 Cards' card is not one big link** ⚑, so a
  reader can select a bio without navigating.
- **Headings.** **The section heading is an `h2` and writer names are `h3`** ⚑ — A21 is never the
  route's head, unlike A29. Three exceptions, each stated on its frame: **6 Founder's name is the
  `h2`**, **9 Big Type's names are `h2`**, and **8 Faces and 15 Slim have no heading at all** ⚑ — a
  credit line is a sentence with links in it, and the build must not add one.
- **Portrait alt text.** **Decorative with an empty alt at avatar scale; alt naming the writer at
  picture scale** ⚑ — the boundary is 120 px, so 6 Founder, 12 Carousel and 13's lead carry alt and
  everything else does not. A26·11 made the same split and it is restated so the build does not unify
  them. **A social icon is a link with an accessible name** ⚑ — the network's name, from the catalog,
  never the glyph alone.
- **Responsive floor.** Grids run **three · two · one**; **4 Split Head collapses at 834** ⚑ and **6
  Founder at 767 with the portrait forced to 240 at 834** (A26·11's rule); **11 Rail's margin
  furniture leaves at 1,200** (A25's); **bands and strips do not collapse at all** (5, 14, 15); **bars
  stack rather than compress at 767** (8, 15). Every element that leaves a width has a stated
  destination.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows
  dropped and the hairline carrying every plane. **Cards and planes force Flat in dark** ⚑ (A29·4's
  rule). **White over an image stays white** ⚑ and the scrim deepens one step.
- **Print.** **The names, counts, roles and bios print; portraits, social rows, strips, carousels and
  the image band do not** ⚑. 5, 14 and 15 print as 3 Rows on white; 12 prints its cards as a list.
- **Behaviour.** **One design declares a module** — 12 Carousel's `carousel`. **The other fourteen
  declare none and are pixel-identical with JavaScript off.** **This pass coined no module name**, so
  no frame carries *ARCHITECT: registry addition*: Hand-picked, the role override, Member Visibility
  and the social row are all server-side, in the template.
- **Refused category-wide, each with a reason:** a latest-post column ⚑ (one query per writer —
  finding 2) · a sortable table header ⚑ (no module sorts — finding 4) · an author's post list (A17
  and A18 own it) · a follow or contact form (A16, A22) · per-item styling of any kind (a control
  writes one value onto the section) · autoplay on the carousel ⚑ · hover lifts and reveals ⚑
  (behaviours do not run while editing, and the resting state is the design) · a sticky rail ⚑ (no
  module covers it) · **a Preview control** — the check was run against all fifteen panels and none
  existed. **Two refusals are withdrawn by this pass**: the social row (refused on a 5.x fact) and the
  role or job title (refused as a platform gap, now an authored override) — both recorded in the
  Reconciliation notes.

### The universal trio — outside every design's control list

Three controls every placeable section in the library carries. **They are not counted toward any
design's control count** and they sit below its own list, above the Data group.

| Control | Values | Notes |
|---|---|---|
| **Background role** | Background · Surface · Contrast | Resolved from the pack. **Locked at Contrast in 5** ⚑ and **locked to the photograph in 14** ⚑, each with the reason shown in place of the values. **15 Slim's retired *Ground* row is this control** ⚑ — Surface is the strip, Background is 8 Faces without portraits, and Contrast is newly reachable |
| **Vertical spacing** | Compact · Comfortable · Spacious | 64 · 96 · 132; 80 at 834, 64 at 390. **This is the retired Padding row under its real name.** **Locked at 0 in 5, 14 and 15** ⚑ |
| **Top divider** | None · Line · Fade | Drawn above the section on the page ground; **above the band in 5 and 14, never inside it** ⚑. **Disabled in 8 and 15** ⚑, where *Rules* already draws that hairline |

**Two designs lock their ground, and only two.** 5 Contrast Band is an inverted band — at Background
it is 1 Grid, which the Design picker already offers. 14 Image Band's ground is the photograph, and
with no image the section hands off to 5, taking the role with it. **7 Panel and 2 Cards do not
lock**: there the plane and the cards are the items' or the design's own geometry, and Background role
is the ground behind them. **9 Big Type's Background role is newly meaningful** ⚑ — the design draws
no ground of its own, so the ground it sits on is now stated rather than assumed.

**The ladders that are not Vertical spacing** ⚑, each kept under its own name because it measures
something else: 5's **Band padding** (48 · 72 · 104 inside the band), 8's **Bar padding** (32 · 48 ·
72), 15's **Strip padding** (16 · 24 · 36 inside the strip), 10's **Row height**, 14's **Height**
(a minimum, not a crop), and 7's plane inset, **fixed at 44 × 48 and not a control at all**.

### The Data group — the reconciled Writers block

Eight rows plus one conditional list, identical in all fifteen, **below** each design's own controls
and the universal trio, and **not counted** toward any design's control count ⚑. It is **P0·5's
"Populate from…" panel configured for authors**.

| Field | Type | Values |
|---|---|---|
| `authorSource` (Writers) | enum req | All writers · **Hand-picked** ⚑ → `{{#get "authors" include="count.posts"}}` |
| `authorPicks[]` | list opt | **Shown at Hand-picked only.** 1–12 author references ⚑ |
| `authorLimit` (How many) | enum req | Three · Six · Twelve · All — the query limit. **Defaults differ per design** ⚑ (Three in 2 and 9, One in 6, Four in 15, Eight in 7 and 13, Twelve in 10, 11 and 12). **Disabled at Hand-picked** ⚑ |
| `authorOrder` (Order) | enum req | Most posts (`order="count.posts desc"`) · Name A–Z (`"name asc"`) · Newest account (`"created_at desc"` ⚑). **Defaults to Name A–Z in 10** ⚑. **Disabled at Hand-picked** ⚑ |
| `bioSource` (Bio) | enum req | From Ghost · Off — **locked to Off in 5, 7, 8, 9, 10, 11, 14 and 15** ⚑, with the reason shown; the field is still stored |
| `roleSource` (Role) | enum req | **Off (default ⚑) · Authored per writer** — an override keyed by author slug ⚑ |
| *Each writer links to* | read-only | Their author archive — Ghost's `{{url}}`, **the A29 route; not repointable** ⚑ |
| `emptyBehaviour` (When there are no writers) | enum req | Head and notice (default ⚑) · Hide the section |

**Hand-picked, in full.** ⚑ A list of **references** to Ghost's authors, with the shared **P0·3 item
controls**: drag to reorder, **✕ to remove and never disabled**, and **Add arrives pre-filled with the
next most-published writer, never blank**. **1–12 references**; the section stores references and
never copies, so **a renamed author renames itself here and a deleted author drops out silently**, and
nothing about the author — name, bio, count, picture — can be typed or overridden. **Picked order is
drawn order**, which is why *Order* disables; the list is the count, which is why *How many* disables.
A20's hand-picked tags are the exact precedent. **It is the one fix for three real complaints** ⚑:
**a founder page on a multi-author site** (6 draws the first reference and says so), **13's lead being
whoever the sort surfaced** (the first reference leads), and **8 Faces and 15 Slim not choosing which
names are written out** (the references are the names). **Ghost-sourced lists still have no Add
anywhere in A21** — the writers themselves are not authored, only the choice of them is.

**The role override, in full.** ⚑ **Ghost authors have no role field** — no job title, no desk
(finding 5). The workaround publications actually use is the first clause of the bio, and this pass
blesses a better one: at *Role: Authored per writer* the section keeps **one short string per author,
keyed by author slug** — **A12's Ghost-mode Role field, the same mechanism** — inline-editable, 40
characters, empty by default. A slug that no longer exists drops its override silently. **It is drawn
in 1, 2, 3, 4, 6, 10, 12 and 13** (under the name, or in 6's and 13's meta line, and under the name in
10's writer cell, where the *Where* column stays the location) and **stored and not drawn in 5, 7, 8,
9, 11, 14 and 15**, each with the reason on its frame. **It is never a Ghost field and never claims to
be**: the panel says so, and the value is the section's.

**The social surface, corrected.** ⚑ Ghost ≥ 6.36 stores **nine handles and a website**;
**version-gated** below 6.36 to Facebook, X and the website. **The author's own fields are read, never
`social_url`** ⚑ — that helper falls back to the site's Facebook and X, which would print the
publication's accounts under a writer who filled in neither. **There is no loop over the handles** ⚑:
the theme checks nine fields and draws what is filled, and an absent handle reserves nothing.

**Internal accounts have no control** ⚑ — `{{#get "authors"}}` returns only authors with a published
post (finding 1), and nothing in the panel can reveal a staff account without one.

### Editing, and every visitor-facing string

- **Every authored text edits inline on canvas** with the **P0·1** toolbar — bold · italic ·
  underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer ·
  sponsored**. The authored strings are `eyebrow`, `heading`, `blurb`, 11's `railLine`, `actionLabel`,
  `linkLabel`, `emptyText`, **10's three column labels** ⚑ and **the role overrides** ⚑.
- **Ghost-owned content is never inline-editable** ⚑: **author names, bios, post counts, locations,
  websites and social handles**. Clicking one says **"Edit in Ghost"**.
- **Every URL field opens the Ghost-aware Link Picker** — `actionUrl` in 4, 6 and 11, `linkUrl` in 8
  and 15, the latter **defaulting to the product's authors-index route once that route decision
  lands** ⚑ and authored until then (finding 3, amended). **Every button and link takes an optional
  icon before or after its label** from **P0·2**, with its size and colour-role popover ⚑, and **the
  social row is nine icon slots and a website** from the same picker's brand set.
- **`backgroundImage` (14) carries Image focus — Centre · Top · Bottom** ⚑, in the control list **and**
  in the Image Picker popover; never a hidden field.
- **No fixed English visitor-facing string ships.** Authored strings have editable defaults. The
  strings that are announced or assembled rather than typed become **theme translation-catalog
  strings** ⚑: **the assembled credit sentence** in 8 and 15 (*"Written by A, B, C and N others"* —
  the remainder is a plural rule, not a typed string), **the generated count lines** in 7 and 11
  (*"12 writers" · "1 writer" · "No writers yet"*), **6's generated action label** (*"Read all N
  posts"*, with its number placeholder), **12's arrow labels** (*"Previous writers"*, *"Next
  writers"*) and the strip's region label, **the social links' accessible names**, and the
  `aria-label="Writers"` a design takes when its heading is empty.
- **The editor's own sentences are not theme strings** ⚑: the zero-writer placeholder, the "suggests
  6 Founder" note and 14's hand-off notice are product UI and stay with the product.
- **Member Visibility on the five CTA-bearing designs** ⚑ — **4 Split Head's, 6 Founder's and 11
  Rail's action, and 8 Faces' and 15 Slim's masthead link** — *Everyone · Logged out · Free members ·
  Paid members*, with **P0·4's member-aware action editor** editing the destination. **The value
  governs the action alone**: heads, rosters, faces and credit sentences are shown to everyone.
  **"Write for us" aimed at logged-out readers is the ordinary case.** The other ten designs carry no
  action and therefore no visibility row.

### The roster

**Ctl is controls of its own**, after this pass; the trio and the Data group are outside it.

| # | Design | Tuple | When the roster is thin | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Grid | `grid-of-N · none · page · many · top · portraits over names in three columns` | One 416 column, no stretch; suggests 6 | 6 | — |
| 2 | Cards | `grid-of-N · none · page · few · left · each writer on a raised card` | One card, no span; never an empty card | 6 | — |
| 3 | Rows | `stack · none · page · many · left · a hairline row for each writer` | One row keeping both hairlines | 5 | — |
| 4 | Split Head | `split · none · page · many · top · the roster beside a standing head` | The notice takes the roster column | 6 | — |
| 5 | Contrast Band | `grid-of-N · none · contrast · many · top · the roster on an inverted band` | Band shortens; no minimum height | 6 | — |
| 6 | Founder | `split · card · page · one · right · one writer at portrait scale` | Built for one; no card at zero | 6 | — |
| 7 | Panel | `grid-of-N · none · surface · many · left · the roster on a raised plane` | The plane renders and holds the notice | 5 | — |
| 8 | Faces | `bar · none · page · many · left · overlapping portraits in one line` | One face, one name, reads as a byline | 7 | — |
| 9 | Big Type | `stack · none · transparent · few · inline · names at display scale, portraits inline` | One name at 72, which is the design | 5 | — |
| 10 | Directory | `table · none · page · many · left · a ruled table of writers and counts` | Header and one row; no table at zero | 5 | — |
| 11 | Rail | `edge rail · none · page · many · none · the label in the margin, names in the body` | The rail reads "No writers yet" | 6 | — |
| 12 | Carousel | `carousel · none · page · many · top · a snap strip of writer cards` | Controls absent when nothing scrolls | 6 | `carousel` |
| 13 | Lead and Rest | `feed · none · page · many · left · one writer at size, the rest listed` | The lead alone, no rule, no list | 6 | — |
| 14 | Image Band | `grid-of-N · none · image · many · background · the roster over a cover image` | No image → hands off to 5 | 7 | — |
| 15 | Slim | `bar · none · surface · many · none · one line of credits` | A one-name sentence | 5 | — |

**Eighty-eight controls of their own across fifteen designs**, four to seven each, every one inside the
PRD's ~15 ceiling; the trio and the Data group are shared and uncounted. **Quick Controls are three to
five per design** and are named in each entry.

### Tuple uniqueness — the honest statement

**All fifteen are distinct on the five closed slots.** **Archetype spreads the category** — five
`grid-of-N`, two `stack`, two `split`, two `bar`, and one each of `table`, `edge rail`, `carousel`
and `feed`. **Ground separates the five grids**: `page` (1, 2), `contrast` (5), `surface` (7),
`image` (14); **media and item-count separate 1 from 2**. **Containment is `none` in fourteen of
fifteen** ⚑ — a card grid is `none · page`, because the cards are the *items'* geometry and not the
section's. **6 Founder is the one `card`**: an inset object with its own plane, A29·12's rule
followed.

**Item-count names what the layout is built for, not what the control allows** ⚑. Every design in
A21 takes its items from the same query with the same limit control; `few` on 2 and 9 says the
arrangement is designed for two to four, and `many` says five or more.

**What the check cannot promise.** 1 Grid and 2 Cards differ by a plane and the portrait's position;
8 Faces and 15 Slim differ by a ground and six portraits — and **15's Background role: Background
reaches 8's ground**, at which point the two designs differ by whether portraits are drawn. **Both
panels name the other design by number** ⚑ rather than pretending the overlap is not there; the
retirement of 15's *Ground* row into the universal control does not change that, it only puts the
value under its real name. 3 Rows and 7 Panel are a row list on two grounds. Those distinctions are
real and visible; they are not machine-checkable.

### Repeating items — the whole category, in one place

**The items are Ghost's authors. The choice of them is authored, and that is new** ⚑.

- **Add and Remove.** **The one list with an Add is `authorPicks[]`** ⚑, and it adds a **reference**,
  not an author: the shared P0·3 controls, Add pre-filled with the next most-published writer, ✕ never
  disabled, drag to reorder. **No Ghost-sourced list in A21 shows an Add button** — a writer appears
  because they published; they disappear because their posts did.
- **How many, and what each design is built for.** The limit is *Three · Six · Twelve · All* with a
  per-design default, disabled at Hand-picked. Built for one: 6. For two to four: 2, 9. For five to
  eight: 1, 4, 13. For eight to twelve: 3, 5, 7, 8, 10, 11, 12, 14, 15.
- **Fewer than expected.** Stated per design below; the four states drawn on every frame are **twelve,
  one, no-bio-and-no-picture, and zero**. **No design draws an empty container, a placeholder card or
  a "no writers yet" chip** ⚑ — 10 Directory's em dash in the *Where* column is **the category's only
  placeholder**, drawn because a table column keeps its shape.
- **Order.** Three Ghost sorts, or the picked order ⚑. **Order still decides which writer leads 13,
  which four names 15 writes out and which three 8 writes out — unless the list does** ⚑.
- **Which fields each item shows.** Name and archive URL in all fifteen; portrait in thirteen; count
  in fifteen; bio in seven; role in eight, at *Role: Authored per writer*; location and website in
  three; social handles in five, and only in 6 by default. **A missing optional field closes its own
  space and takes its separators with it** ⚑.
- **Per-item styling does not exist**, by construction: every control writes a single value onto the
  section and the stylesheet reads it. **A role override and a hand-picked reference are content, not
  style** ⚑ — that is why they are allowed and a per-writer colour is not.

### The shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | 1–6, 9, 10, 12–14 | Defaults per design: "The masthead", "Written by" (6), "Contributors" (11) ⚑ |
| `heading` | text | opt | 60 ch | 1–5, 7, 10, 12–14 | **Stored and not drawn in 8, 9, 11, 15** ⚑ |
| `blurb` | text | opt | 240 ch | 1–6, 9, 10, 12–14 | Clamped 620 · 640 · 560 · 400 by ground ⚑ |
| `railLine` | text | opt | 90 ch | 11 | The rail's one sentence ⚑ |
| `actionLabel` | text | opt | 20 ch | 4, 6, 11 | Default "Write for us"; **generated from the count in 6, or authored at *Action label: Custom*** ⚑. Takes an optional icon slot |
| `actionUrl` | url | opt | — | 4, 6, 11 | The Link Picker; defaults to the author archive in 6 ⚑ |
| `linkLabel` | text | opt | 24 ch | 8, 15 | Default "The full masthead" ⚑ |
| `linkUrl` | url | opt | — | 8, 15 | The Link Picker, **defaulting to the authors-index route once that route decision lands** ⚑; Ghost itself has no authors index (finding 3) |
| `colWriter` · `colWhere` · `colPosts` | text | opt | 16 ch | 10 | **The table's column labels, newly authored fields** ⚑ — defaults "Writer", "Where", "Posts" |
| `backgroundImage` | image | opt | — | 14 | **An upload, not a Ghost field** ⚑; with none, 14 hands off to 5 |
| `imageFocus` | enum | opt | — | 14 | **Centre · Top · Bottom** ⚑, also in the Image Picker popover |
| `authorPicks[]` | list | opt | 1–12 | all 15 | **Author references** ⚑, P0·3 controls; the first leads in 6 and 13 |
| `roleOverride` | text | opt | 40 ch | 1–4, 6, 10, 12, 13 | **Authored, keyed by author slug** ⚑; A12's mechanism |
| `emptyText` | text | opt | 120 ch | all 15 | Default "No writers to show yet…" ⚑ |
| *name* | Ghost | req | — | all 15 | |
| *profile_image* | Ghost | opt | — | all but 11, 15 | Initials fallback, A1·6's |
| *bio* | Ghost | opt | — | 1, 2, 3, 4, 6, 12, 13 | Locked Off in the other eight — **stored, not drawn** ⚑ |
| *count.posts* | Ghost | req | — | all 15 | **Not `pagination.total`** — the two can disagree ⚑ (finding 6) |
| *url* | Ghost | req | — | all 15 | The A29 archive route; **not repointable** ⚑ |
| *location, website* | Ghost | opt | — | 6, 10, 13 | Usually empty; dropped with their separators ⚑ |
| *the nine handles, website* | Ghost | opt | — | 6; 1, 2, 12, 13 at On | **Nine handles and a website on ≥ 6.36** ⚑ — read from the author, never the sitewide fallback (finding 7, corrected) |
| *pagination.total* | Ghost | req | — | 7, 8, 15 | The writer count and the "and N others" remainder ⚑ |
| *@site.title* | Ghost | req | — | 15 | The sentence names the publication and reads it ⚑ |

**Fourteen authored fields and nine read from Ghost**, after the pass. A design may use fewer — 15
Slim draws three — but **none needs a field the category does not have**, so switching between any two
of the fifteen preserves everything the user typed, **including the hand-picked list and the role
overrides** ⚑.

---

## The fifteen designs

Every entry carries all ten fields in the brief's order. Controls are listed **in sidebar order** and
are the design's own; the universal trio and the Data group follow each list and are not counted.
Each entry ends with **Reconciled**, naming what this pass changed.

---

### 1 · Grid

1. **Descriptor.** Portraits over names in an N-column grid on the page ground, each writer with a
   count, two bio lines and an archive link. The category default and the arrangement the other
   fourteen depart from.
2. **Tuple.** `grid-of-N · none · page · many · top · portraits over names in three columns`
   Containment `none` — the section sits in nothing, and the writers are not carded.
3. **Archetype.** grid-of-N. **No departures** — three · two · one.
4. **Responsive.** **1440** three columns of 416 on a 24 gutter, 48 row gap, portrait 96, name 21,
   bio 15 clamped two, Vertical spacing 96. **834** two of 365, portrait 80, heading 34, 80.
   **≤ 767** one of 350, **portrait 72 at every size value** ⚑, name 20, heading 28, 64.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `emptyText` · `roleOverride` · `authorPicks[]`. From
   Ghost: name, `profile_image`, `bio`, `count.posts`, `url`, and **at *Social links: On* the nine
   handles and the website** ⚑.
6. **Controls.** Columns *Two · Three · Four* (**Four disabled below six writers** ⚑) — Portrait
   *Circle · Rounded square* — Portrait size *Compact · Comfortable · Spacious* — Bio *Show · Hide* —
   Post count *Under the name · Beside the name · Off* — **Social links *Off · On*** ⚑. **Six.**
   Quick: Columns, Portrait size, Bio, Post count.
7. **Data.** `{{#get "authors" include="count.posts" limit=6 order="count.posts desc"}}` ⚑, or the
   picked references. **0** → head and notice, or nothing at *Hide the section*. **1** → one 416
   column, left, no stretch; the panel **suggests 6 Founder without switching** ⚑. **many** → wraps to
   as many rows as the limit needs.
8. **Empty.** No picture → initials on `hover`. No bio → the lines go and the link rises; nothing is
   reserved ⚑. **No handles → no social row, and no space kept for it** ⚑. No writers → the notice
   under the head.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2** ⚑, names **h3** inside the anchor. Portraits decorative, empty alt ⚑;
    **each social link carries the network's name** ⚑. Focus order heading → name → role → social →
    link → next writer. Light: name 13.4:1, bio 5.1:1, social glyph 5.1:1 ⚑.
    **Repeating items** — designed for 6 and 12, correct at 2–12; **no Add on the writers, one on the
    references** ⚑.
    **Flagged ⚑** the h2 call · empty alt · Four disabled below six · the 72 px portrait floor at 390
    · `count.posts` against A29's `pagination.total` · the suggestion that is not a switch · the
    social row's icon-slot targets at 32-in-44.
    **Reconciled.** Padding retired into **Vertical spacing**; the trio and the Data group sit outside
    the six. **Social links is new** and the old refusal is withdrawn — "Ghost stores two networks" was
    5.x. **Hand-picked** joins the Writers source with the P0·3 controls, **Role** arrives as an
    authored override keyed by author slug, and the four authored strings take the P0·1 toolbar while
    names, bios and counts say "Edit in Ghost".

---

### 2 · Cards

1. **Descriptor.** One raised surface card per writer, portrait left of the name, bio clamped at
   three lines and the link on a common foot. **The category's tokenisation proof.**
2. **Tuple.** `grid-of-N · none · page · few · left · each writer on a raised card`
   **Containment `none`, not `card`** — the cards are the items' geometry ⚑.
3. **Archetype.** grid-of-N. **One departure** — card padding steps to 22 at 390 ⚑.
4. **Responsive.** **1440** three of 416, padding 28, portrait 64, name 19, equal heights, Vertical
   spacing 96. **834** two of 365, the third wraps. **≤ 767** one of 350, **card padding 22** ⚑,
   portrait 56.
5. **Fields.** As 1, plus the social handles at *On*.
6. **Controls.** Columns *Two · Three · Four* — Card *Raised · Flat* (**dark forces Flat** ⚑) —
   Portrait *Circle · Rounded square* — Bio *Show · Hide* — Link line *Show · Hide* (hidden, the name
   is still the link ⚑) — **Social links *Off · On*** ⚑. **Six.** Quick: Columns, Card, Bio, Social
   links.
7. **Data.** As 1, **How many defaulting to Three** ⚑. **0** → notice on the page ground, **no empty
   card** ⚑. **1** → one 416 card, no span ⚑. **many** → wraps; above six the panel suggests 1 Grid.
8. **Empty.** No bio → a short card that still matches its row ⚑. No picture → initials. No handles →
   the row is absent and the link line rises ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2**, names **h3**. **The card is a `div` with no role and no label** ⚑; the
    card is not one big link ⚑. Social links are anchors with accessible names, inside the card and
    before the link line. Light: name 14.0:1 on `surface`, bio 5.3:1.
    **Repeating items** — designed for 3–4, one row; correct at 2–6.
    **Flagged ⚑** How many defaulting to Three · dark forcing Flat · card padding at 390 ·
    equal-height rows · no empty card at zero · no hover lift · the social row inside the card's
    padding.
    **Reconciled.** Padding retired into **Vertical spacing**; the trio and the Data group sit outside
    the six. **Social links is new.** Hand-picked and Role join the Writers block, and the corrected
    social surface — nine handles and a website, read from the author and never from the sitewide
    fallback ⚑ — is stated in the panel.

---

### 3 · Rows

1. **Descriptor.** A hairline-separated row per writer: portrait left, name and bio in the middle,
   count and archive link held at the right edge.
2. **Tuple.** `stack · none · page · many · left · a hairline row for each writer`
3. **Archetype.** stack. **One departure** — the right column relocates under the name at ≤ 767
   rather than dropping ⚑.
4. **Responsive.** **1440** rows on the 1,296 box, portrait 64, name 21, bio clamped two on 620,
   count 15 and link 14 right, 24 row padding. **834** unchanged, bio takes the remaining 466.
   **≤ 767** portrait 48 ⚑, name 19, count and link under the bio on one line, row padding 20.
5. **Fields.** As 1, minus the social handles; plus `roleOverride`.
6. **Controls.** Heading *Show · Hide* — Portrait size *Compact · Comfortable · Spacious* — Bio *Two
   lines · One line · Off* (**Off is the twelve-writer setting** ⚑) — Right column *Count and link ·
   Count only · Off* — Divider *Hairline · None* (**None raises row padding to 32** ⚑). **Five.**
   Quick: Bio, Right column, Divider, Portrait size.
7. **Data.** As 1. **0** → head and notice, **no rules drawn** ⚑. **1** → one row keeping both
   hairlines ⚑. **many** → the design's best state; twelve is 1,344 px at two bio lines.
8. **Empty.** No bio → the row falls to 88 ⚑. No picture → initials at the same 64. No role → the
   name keeps its own line and nothing shifts ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2**, names **h3**. **The row is not a link** ⚑ — two anchors per row, both
    44 px. DOM order matches reading order. Light: name 13.4:1, bio, role and count 5.1:1.
    **Repeating items** — designed for 6–12, correct at 1–12.
    **Flagged ⚑** the row borrowed from A18·2 · Divider writing two values · Bio: Off named as the
    twelve setting · both hairlines at one writer · the 48 px floor at 390 · the right column
    relocating.
    **Reconciled.** Padding retired into **Vertical spacing**; Divider stays, being the row's hairline
    rather than the section's. Hand-picked and Role join the Writers block. **No Social links row
    here** ⚑ — the patch named 1, 2, 12 and 13, and this design's right edge already carries the count
    and the link; recorded rather than assumed.

---

### 4 · Split Head

1. **Descriptor.** Heading, blurb and one action in a standing 400 px left column; the roster as a
   two-column grid in the 808 beside it.
2. **Tuple.** `split · none · page · many · top · the roster beside a standing head`
3. **Archetype.** split. **One departure** — collapses at **834** rather than 767 ⚑.
4. **Responsive.** **1440** 400 · 88 · 808, head at the column top (**not vertically centred** ⚑),
   roster two of 392, portrait 72, name 19. **834** stacked, roster two of 365. **≤ 767** stacked,
   roster one of 350, portrait 64, heading 28.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `actionLabel` (default "Write for us" ⚑, with an
   optional icon slot) · `actionUrl` (Link Picker) · `emptyText` · `roleOverride` · `authorPicks[]`.
   From Ghost as 1.
6. **Controls.** Split *Even · Wide head · Wide roster* (400·808, 520·688, 320·888 on a fixed 88
   gutter ⚑) — Roster columns *Two · Three* (**Three drops the bio** ⚑) — Portrait size — Bio *Show ·
   Hide* — Action *Button · Link · Off* (**default Link** ⚑) — **Member visibility *Everyone · Logged
   out · Free members · Paid members*** ⚑. **Six.** Quick: Split, Roster columns, Bio, Action.
7. **Data.** As 1, plus the authored action. **0** → the notice takes the roster column, head and
   action unchanged ⚑. **1** → one 392 item in an 808 column; the panel suggests 6 Founder ⚑.
   **many** → six rows at twelve.
8. **Empty.** No blurb → the head is an eyebrow, a heading and an action, and **the roster does not
   move up** ⚑. At *Member visibility* hiding the action, **the head keeps its measure and the roster
   does not widen** ⚑.
9. **Module.** None. **No-JS: pixel-identical.** Member state is Ghost's server-side `@member`, not a
   module ⚑.
10. **A11y.** Heading **h2**, names **h3**. **DOM order is head then roster at every width** ⚑.
    Light: name 13.4:1, action link 4.8:1 ⚑.
    **Repeating items** — designed for 6–12, correct at 4–12, weak at 1 and the panel says so.
    **Flagged ⚑** the fixed 88 gutter · head not vertically centred · collapse at 834 · Three columns
    dropping the bio · Link as the default · the "Write for us" label · no sticky head · the action
    alone obeying member visibility.
    **Reconciled.** Padding retired into **Vertical spacing**. **Member visibility** is new — "Write
    for us" aimed at logged-out readers is the ordinary case, and the action alone obeys it. The action
    takes an optional icon, its URL opens the Link Picker and its destination is edited with **P0·4**;
    Hand-picked and Role join the Writers block.

---

### 5 · Contrast Band

1. **Descriptor.** A full-bleed inverted band carrying the head and one row of portraits with names
   and counts.
2. **Tuple.** `grid-of-N · none · contrast · many · top · the roster on an inverted band`
   The band is a ground, not a box — A26·3, A27·4 and A29·3, followed.
3. **Archetype.** grid-of-N. **One departure** — the section's own vertical space is 0 at every
   width because the band carries it ⚑, which is why **Vertical spacing is locked** ⚑.
4. **Responsive.** **1440** band 1,440 wide, content 1,296 on a 72 margin, 72 inside, six of 196,
   portrait 72, name 17, heading 40. **834** 56 inside, three of 235. **≤ 767** 40 inside, **two of
   165** ⚑, portrait 64. **No collapse at any width.**
5. **Fields.** `eyebrow` · `heading` · `blurb` · `emptyText` · `authorPicks[]`. From Ghost: name,
   `profile_image`, `count.posts`, `url`. **`bio` and `roleOverride` are stored and never drawn** ⚑.
6. **Controls.** Band padding *Compact · Comfortable · Spacious* (48 · 72 · 104 **inside the band** ⚑)
   — Alignment *Left · Centre* — Heading size *Regular · Large · Display* — Portraits across *Four ·
   Six · Eight* (**Eight drops the count** ⚑) — Post count *Show · Hide* — Blurb *Show · Hide*.
   **Six.** Quick: Portraits across, Heading size, Alignment, Blurb. **Background role locked at
   Contrast and Vertical spacing at 0** ⚑, each with the reason shown; Data group with **Bio locked to
   Off** ⚑.
7. **Data.** As 1. **0** → the band shortens to head and notice, **no minimum height** ⚑. **1** → one
   column at the band's left, not centred ⚑. **many** → wraps to a second row above six.
8. **Empty.** No picture → initials on a **14% white plate in light, 10% black in dark** ⚑ — the one
   place in A21 where a colour is not a token, because `hover` disappears on `contrast`.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2**, names **h3**. **The band is a section landmark, not a banner** ⚑ —
    `banner` is A1's. Light: heading and name 13.4:1, **count 4.9:1 at 13 px** ⚑, the tightest ratio
    in the design.
    **Repeating items** — designed for 6 and 12, correct at 2–12; bio never drawn at any value.
    **Flagged ⚑** the locked ground and the locked spacing · the band's own ladder · two across at 390
    · the non-token initials plate · Bio locked Off · Eight dropping the count · no action, on A29·3's
    ratio finding.
    **Reconciled.** **Background role locked at Contrast** ⚑ — the inverted band is the design's
    identity — and **Vertical spacing locked at 0** ⚑, because a full-bleed band butts its neighbours.
    **Band padding keeps its name**: it is the band's inside. Top divider draws above the band, never
    within it. Hand-picked joins the Writers source; Bio stays locked Off and Role is stored, not
    drawn.

---

### 6 · Founder

1. **Descriptor.** One writer on an inset card: portrait at picture scale bleeding to the card's
   right edge, name at 40, the full bio, a meta line, **a social row** and one accent action. **The
   design for the single-author site.**
2. **Tuple.** `split · card · page · one · right · one writer at portrait scale`
   **The category's only `card` and only `one`.**
3. **Archetype.** split. **One departure** — two columns held at 834 with the portrait forced to 240
   ⚑, collapsing only below 767 (A26·11's rule).
4. **Responsive.** **1440** card 1,104 centred in the 1,296 box, portrait 380 × 475, words padded 48,
   name 40, bio clamped six, **social row of 32 px slots under the meta line** ⚑. **834** card 754,
   portrait 240 × 300 ⚑, words padded 36, name 32. **≤ 767** portrait 350 × 438 above the words
   **with the ratio held** ⚑, words padded 24, name 28, Portrait side ignored, **the social row wraps
   rather than scrolls** ⚑.
5. **Fields.** `eyebrow` (default "Written by" ⚑) · `actionLabel` (**generated from the count, or
   authored at *Action label: Custom*** ⚑) · `actionUrl` · `emptyText` · `roleOverride` ·
   `authorPicks[]`. From Ghost: name, `profile_image`, `bio`, `count.posts`, `location`, `website`,
   **the nine handles** ⚑, `url`. **The category's widest field use.**
6. **Controls.** Portrait side *Left · Right* — Portrait ratio *Portrait 4:5 · Square 1:1* (A8's
   ladder minus its landscape values ⚑) — Card *Raised · Flat* (**dark forces Flat** ⚑) — Action
   *Button · Link · Off* — **Action label *Generated · Custom*** ⚑ — **Member visibility** ⚑.
   **Six.** Quick: Portrait side, Portrait ratio, Action, Action label. Data group with **How many
   defaulting to One** ⚑.
7. **Data.** `{{#get "authors" include="count.posts" limit=1}}` ⚑. **0** → no card, notice on the
   page ground ⚑. **1** → the design. **many** → **the first in the chosen order is drawn and the
   panel suggests 1 Grid** ⚑; at Hand-picked **the first reference is the writer drawn** ⚑, which is
   how a founder page survives on a multi-author site. It never picks the owner or a "featured" flag,
   because Ghost has neither.
8. **Empty.** No photograph → the initials plate at the portrait crop ⚑. No bio → **the portrait
   holds the card height** ⚑. No location or website → dropped with their separators ⚑. **No handles →
   no social row** ⚑; on a site below 6.36 the row is Facebook, X and the website at most.
9. **Module.** None. **No-JS: pixel-identical.** The action is an ordinary link to the archive.
10. **A11y.** **The name is the `h2`** ⚑ — the section's only heading. **The portrait carries alt
    text naming the writer** ⚑, the opposite call from 1 Grid's avatar. **DOM order is words then
    picture at either side value** ⚑. **Each social slot is a link with the network's name** ⚑, 32 in
    44, in the order Ghost stores them. Light: name 13.4:1, button ink 4.8:1; dark 8.1:1 ⚑.
    **Repeating items** — designed for exactly one; order, or the first reference, decides which one.
    **Flagged ⚑** the 1,104 inset · the portrait bleeding to three edges · the generated action label
    and its Custom value · the plate at the portrait crop · the portrait holding the height · 240 at
    834 · the ratio held at 390 · alt text where 1 Grid has none · drawing the first at many · the
    social row's slot order.
    **Reconciled.** Padding retired into **Vertical spacing**. **The social row is redrawn** ⚑ as icon
    slots for every filled-in handle — nine networks and the website, version-gated below 6.36, read
    from the author and never from `social_url`'s sitewide fallback. **Action label: Generated ·
    Custom** ⚑ lets a founder write "Read my essays" instead of the count line, and **Member
    visibility** ⚑ governs the action alone. At Hand-picked **the first reference is the writer
    drawn** ⚑, and **Role is drawn in the meta line** — the "Editor-in-Chief" workaround, blessed
    rather than pretended away.

---

### 7 · Panel

1. **Descriptor.** The whole roster on one raised surface plane in two columns of hairline rows, with
   a writer-count line at the plane's right edge.
2. **Tuple.** `grid-of-N · none · surface · many · left · the roster on a raised plane`
   `surface` is the ground — the plane is a fill, not a containment (A29·4).
3. **Archetype.** grid-of-N. **One departure** — it narrows rather than collapsing; two columns are
   held at 834.
4. **Responsive.** **1440** plane 1,296, padding 44 × 48, two of 580 on a 40 gutter, portrait 48,
   name 17, row 76. **834** plane 754, padding 36 × 40, two of 337. **≤ 767** plane 350, padding 28 ×
   24, one column, **portrait 40** ⚑, row 68.
5. **Fields.** `eyebrow` · `heading` · `emptyText` · `authorPicks[]`. **No `blurb`** — the plane's
   head is one line ⚑. From Ghost: name, `profile_image`, `count.posts`, `url`,
   `pagination.total`. **`bio` and `roleOverride` stored, not drawn** ⚑.
6. **Controls.** Plane *Raised · Flat* — Columns *One · Two* — Portraits *Show · Hide* (hidden, the
   row falls to 52 ⚑) — Post count *Show · Hide* — Writer count *Show · Hide*. **Five.** Quick:
   Columns, Portraits, Post count, Plane. **The plane's inside is fixed at 44 × 48 and is not a
   control** ⚑. Data group with **Bio locked to Off** ⚑.
7. **Data.** As 1, plus `pagination.total`. **0** → **the plane renders and holds the notice**; the
   count line is hidden ⚑. **1** → one row, left column, **right column empty and staying empty** ⚑.
   **many** → twelve is six rows a column.
8. **Empty.** No picture → initials at 48, **row height unchanged** ⚑ — the portrait sets it. At *How
   many: All* the count line drops its "of" ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2**, names **h3**. **The whole row is the anchor** ⚑, so the → needs no
    label. **The plane is decorative: no role, no label** ⚑. Light: name 14.0:1, count 5.3:1.
    **Repeating items** — designed for 8–12, correct at 1–12. The list **reads left to right and then
    down** ⚑.
    **Flagged ⚑** the fixed internal padding, now stated as not-a-control · plane-is-a-ground ·
    reading order · portraits setting the row height · the count line's "of" · the plane rendering at
    zero · the empty right column at one.
    **Reconciled.** **Padding is gone** — it was the section's outer space under another name, and the
    plane's fixed 44 × 48 inside was never a control. Hand-picked joins the Writers source; Bio stays
    locked Off, Role is stored and not drawn, and **the writer-count line becomes a
    translation-catalog string** ⚑ rather than English in a template.

---

### 8 · Faces

1. **Descriptor.** A one-line credits bar between hairlines: overlapping portraits, an assembled
   "Written by" sentence with up to three linked names, and a masthead link at the right.
2. **Tuple.** `bar · none · page · many · left · overlapping portraits in one line`
3. **Archetype.** bar. **One departure** — it stacks into three rows at ≤ 767 instead of compressing
   ⚑.
4. **Responsive.** **1440** one row on the 1,296 box, portraits 48 overlapping −14 with a 3 px ring
   in the `background` token ⚑, sentence 17, link right, Bar padding 48. **834** gap 20, bar padding
   22. **≤ 767** three stacked rows, **five faces at 40** ⚑, sentence 16.
5. **Fields.** `linkLabel` (default "The full masthead" ⚑) · `linkUrl` (**the Link Picker,
   defaulting to the authors-index route once that route decision lands** ⚑) · `emptyText` ·
   `authorPicks[]`. **No heading and no blurb** ⚑ — both stored. From Ghost: name, `profile_image`,
   `url`, `pagination.total`. **`bio` and `roleOverride` stored, not drawn** ⚑.
6. **Controls.** **Bar padding** *Compact · Comfortable · Spacious* (**32 · 48 · 72, the bar's own
   ladder** ⚑) — Faces shown *Four · Six · Eight · Off* — Portrait size *Compact · Comfortable ·
   Spacious* (overlap scales −11 · −14 · −18 ⚑) — Names in the line *Three · All · None* — Link *Show ·
   Hide* — Rules *Above and below · None* (**None raises the padding** ⚑) — **Member visibility** ⚑.
   **Seven.** Quick: Faces shown, Names in the line, Link, Rules. **Top divider is disabled** where
   Rules draws that hairline ⚑. Data group with **Bio locked to Off** ⚑.
7. **Data.** As 1, plus `pagination.total` for the remainder ⚑. **0** → the rules stay and the notice
   takes the line ⚑. **1** → one face, one name, **no remainder clause — it reads as a byline** ⚑.
   **many** → faces to the limit, the rest counted. **At Hand-picked the references are the names
   written out** ⚑.
8. **Empty.** No picture → initials in the stack. **The sentence never renders "and 0 others" and
   never truncates with an ellipsis** ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** **No heading at all** ⚑ — the names are inline links inside a sentence, not headings,
    which is the correct structure for a credit line and is stated so the build does not add one.
    Portraits decorative, empty alt. Light: sentence 5.1:1, names and link 13.4:1.
    **Repeating items** — designed for 6–12, correct at 1–12; **order, or the picked list, decides
    which three names are written out** ⚑.
    **Flagged ⚑** the bar's own ladder under its new name · the assembled sentence · the remainder from
    `pagination.total` · five faces at 390 · the ground-token ring · the masthead URL's pending
    default · no heading · Rules writing two values · Top divider disabled · the named overlap with 15
    Slim.
    **Reconciled.** Padding is renamed **Bar padding** ⚑ — 32 · 48 · 72 is genuinely the bar's ladder,
    not the section's — and **Top divider is disabled** against Rules. **Member visibility** ⚑ governs
    the masthead link alone. **Hand-picked now decides which names are written out** ⚑, which the sort
    used to; `linkUrl` opens the Link Picker and **defaults to the authors-index route once that
    decision lands** ⚑, and the link takes an optional icon.

---

### 9 · Big Type

1. **Descriptor.** Names at display scale on ruled lines, each with a leading portrait and a trailing
   post count. No ground of its own.
2. **Tuple.** `stack · none · transparent · few · inline · names at display scale, portraits inline`
   **The category's only `transparent` and only `inline`.**
3. **Archetype.** stack. **No departures.**
4. **Responsive.** **1440** names 72, portrait 44, count 17 on the name's baseline ⚑, row padding 18,
   rule above each row. **834** names 56, portrait 36. **≤ 767** names 36, portrait 28, count 14.
   **The ladder is per width**: Large is 72 · 56 · 36, Display 88 · 68 · 40 ⚑.
5. **Fields.** `eyebrow` · `blurb` · `emptyText` · `authorPicks[]`. **No `heading`** ⚑ — stored,
   never drawn. From Ghost: name, `profile_image`, `count.posts`, `url`. **`bio` and
   `roleOverride` stored, not drawn** ⚑.
6. **Controls.** Name size *Regular · Large · Display* — Portraits *Show · Hide* — Post count
   *Trailing · Under the name · Off* — Head *Eyebrow and blurb · Eyebrow only · Off* — Rules *Above
   each row · None*. **Five.** Quick: Name size, Portraits, Post count, Head. Data group with **How
   many defaulting to Three** ⚑ and **Bio locked to Off** ⚑.
7. **Data.** As 1. **0** → eyebrow, blurb and notice, no rules ⚑. **1** → one name at 72, which is
   the design working ⚑. **many** → grows; above six the panel suggests 3 Rows.
8. **Empty.** **Nothing auto-fits** ⚑ — a 37-character name wraps to two lines and the section grows;
   the panel names Name size as the fix. No picture → initials at 44.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** **No section heading; each name is an `h2`** ⚑ — the only design in A21 where names are
    h2, stated so the build does not add a heading above them. Portraits decorative, empty alt.
    Light: name 13.4:1, count 5.1:1.
    **Repeating items** — designed for 2–4, correct at 1–6.
    **Flagged ⚑** no heading by design · names as h2 · the display ladder per width · the count on the
    baseline · nothing auto-fitting · How many defaulting to Three · Rules writing two values · the
    transparent ground, now named by Background role.
    **Reconciled.** Padding retired into **Vertical spacing**. **Background role is newly meaningful
    here** ⚑ — the design draws no ground of its own, so the ground it sits on is stated rather than
    assumed. Hand-picked joins the Writers source; Bio stays locked Off and Role is stored, not drawn.

---

### 10 · Directory

1. **Descriptor.** A ruled table of writers: portrait and name, location, and a right-aligned tabular
   post count, under authored column labels.
2. **Tuple.** `table · none · page · many · left · a ruled table of writers and counts`
   **The category's only `table`.**
3. **Archetype.** table. **One departure** — *Where* relocates under the name rather than dropping ⚑.
4. **Responsive.** **1440** columns 1fr · 260 · 120, rows 64, portrait 32, name 17, count 15 right and
   tabular. **834** two columns, **Where under the name at 13** ⚑. **≤ 767** two columns, count column
   84, portrait 28, rows 56.
5. **Fields.** `eyebrow` · `heading` · `blurb` · **`colWriter` · `colWhere` · `colPosts`** ⚑ ·
   `emptyText` · `roleOverride` · `authorPicks[]`. From Ghost: name, `profile_image`, `location`,
   `count.posts`, `url`.
6. **Controls.** Columns *Writer and posts · Writer, where and posts* — Portrait *Show · Hide* — Row
   height *Compact · Comfortable · Spacious* (**Compact disabled while Portrait is Show** ⚑) — Header
   row *Show · Hide* — Group by letter *Off · On* (**disabled unless Order is Name A–Z, and at
   Hand-picked** ⚑). **Five.** Quick: Columns, Portrait, Row height, Group by letter. Data group with
   **Order defaulting to Name A–Z** ⚑ and **Bio locked to Off** ⚑.
7. **Data.** As 1, plus `location`. **0** → head and notice, **no header row** ⚑. **1** → header and
   one row ⚑. **many** → the design's best state.
8. **Empty.** No location → **an em dash in the cell** ⚑, **the category's only placeholder**, drawn
   because a table column keeps its shape. A zero count is drawn as `0`, not hidden ⚑. No role → the
   name keeps its cell height ⚑.
9. **Module.** None. **No-JS: pixel-identical** — the header is not sortable, so nothing is lost ⚑.
10. **A11y.** Heading **h2**. **A real `<table>` with `<th scope="col">`** ⚑ — *Header row: Hide*
    hides it visually and keeps it for assistive technology, which is why the value is not "Off".
    Names are links inside cells, not headings ⚑. Light: name 13.4:1, labels 5.1:1.
    **Repeating items** — designed for 8–12, correct at 1–12.
    **Flagged ⚑** the em-dash placeholder · Where relocating · Compact disabled with portraits · Group
    by letter requiring an order and disabling at Hand-picked · Order defaulting to alphabetical · the
    visually-hidden header · no sortable columns · the role under the name rather than in a column.
    **Reconciled.** Padding retired into **Vertical spacing**; Row height keeps its name, being the
    row's inside. **The three column labels become authored fields** ⚑ with defaults, so no fixed
    English string ships in the header row. Hand-picked joins the Writers source and disables Order and
    Group by letter with it; **Role is drawn under the name** and the *Where* column stays the location.

---

### 11 · Rail

1. **Descriptor.** A 240 px margin rail carrying the label, the writer count and one action; the
   writers as names and counts in two ruled columns beside it. **No portraits.**
2. **Tuple.** `edge rail · none · page · many · none · the label in the margin, names in the body`
   **The category's only `edge rail`**; one of two designs that draw no image at all.
3. **Archetype.** edge rail. **No departures** — A25's ladder, leaving at 1,200.
4. **Responsive.** **1440** 240 · 48 · 1,008, two columns of 480, names 24, counts 14. **1,200 and
   below** the rail stacks above ⚑. **834** two of 353, **name size held at 24** ⚑. **≤ 767** one of
   350, names 20.
5. **Fields.** `eyebrow` (default "Contributors" ⚑) · `railLine` ⚑ · `actionLabel` (with an optional
   icon slot) · `actionUrl` (Link Picker) · `emptyText` · `authorPicks[]`. **No `heading` and no
   `blurb`** ⚑. From Ghost: name, `count.posts`, `url`. **`bio` and `roleOverride` stored, not
   drawn** ⚑.
6. **Controls.** Rail contents *Count only · Count and line · Count, line and action* ⚑ — Name size
   *Regular · Large · Display* — Columns *One · Two* — Post count *Show · Hide* — Rules *Hairline ·
   None* — **Member visibility** ⚑. **Six.** Quick: Rail contents, Name size, Columns, Post count.
   Data group with **Bio locked to Off** ⚑.
7. **Data.** As 1, **without `profile_image`** ⚑. **0** → the rail reads "No writers yet" and the body
   is the notice ⚑. **1** → "1 writer", one row ⚑. **many** → twelve is six rows a column.
8. **Empty.** **No photograph anywhere means nothing to be empty** — that is the design ⚑. The count
   line is **generated and pluralised, never a bare number** ⚑, and it is a catalog string.
9. **Module.** None. **No-JS: pixel-identical.** **The rail is not sticky and declares nothing** ⚑ —
   the registry's only scroll module is `header-scroll`, which is A1's (finding, shared with A29·14),
   and **this pass coined nothing** ⚑.
10. **A11y.** **The rail's count line is the `h2`** ⚑ — unusual, and stated so the build does not add
    a second heading. Names are **h3** inside anchors and **the whole 52 px row is the target** ⚑.
    Light: name 13.4:1, count 5.1:1, action 4.8:1.
    **Repeating items** — designed for 8–12, correct at 1–12; fields are name, count and URL **and no
    others**.
    **Flagged ⚑** the rail from A25 · no portraits at all · the generated count line as a catalog
    string · the count line as the h2 · the rail not repeating the page heading · no sticky rail ·
    Rules writing two values · the action alone obeying member visibility.
    **Reconciled.** Padding retired into **Vertical spacing**. **Member visibility** ⚑ governs the
    rail's action alone. The action takes an optional icon and its URL opens the Link Picker, with
    **P0·4** editing the destination; **the generated count line is a translation-catalog string** ⚑.
    Hand-picked joins the Writers source. **Still no sticky rail** ⚑ — no module covers it and none was
    coined.

---

### 12 · Carousel

1. **Descriptor.** A horizontally scrolling strip of writer cards with a 4:5 portrait, bleeding past
   the right margin, with arrows at the head and dots beneath.
2. **Tuple.** `carousel · none · page · many · top · a snap strip of writer cards`
   **The category's only `carousel`.**
3. **Archetype.** carousel. **One departure** — arrows drop at ≤ 767 while the dots stay ⚑.
4. **Responsive.** **1440** cards 280 × 350 on a 24 gutter, the strip starting on the content box and
   **bleeding to the viewport edge** ⚑, arrows 44 at the head. **834** unchanged, three visible.
   **≤ 767** **cards 260** ⚑, arrows dropped, dots kept.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `emptyText` · `roleOverride` · `authorPicks[]`.
   From Ghost as 1, with `bio` and, at *Social links: On*, the nine handles and the website ⚑.
6. **Controls.** Card width *Compact · Comfortable · Spacious* — Portrait ratio *Portrait 4:5 · Square
   1:1* — Bio *Show · Hide* — Strip controls *Arrows and dots · Arrows only · Dots only · None* — Edge
   *Bleed · Contained* — **Social links *Off · On*** ⚑. **Six.** Quick: Card width, Portrait ratio,
   Bio, Strip controls. Data group with **How many defaulting to Twelve** ⚑.
7. **Data.** As 1. **0** → head and notice, no strip ⚑. **1** → one card at the left, arrows and dots
   absent ⚑. **many** → the design. **Arrows and dots render only when the strip overflows** ⚑, decided
   server-side from the item count and card width, **not by the module at runtime** ⚑. **At Hand-picked
   the first card is the first reference** ⚑.
8. **Empty.** No photograph → the plate carries initials at the card crop ⚑. No bio → a shorter card;
   **heights match because the portrait sets them** ⚑. **A social row wraps to a second line above five
   handles on a 280 px card and the card grows with it** ⚑ — heights still match, because every card
   takes the tallest.
9. **Module.** `carousel`. **Edit-safe: it does not run in the editor** ⚑. **No-JS, quoted from the
   registry: "The slide track is a native horizontally-scrollable `scroll-snap` strip — fully usable,
   only dots and arrow buttons are hidden."**
10. **A11y.** Heading **h2**, names **h3**. **The strip is a labelled region with an `aria-label`
    naming the section** ⚑; cards are in DOM order, so keyboard users reach every writer with or
    without the arrows. Arrows carry `aria-label` "Previous writers" / "Next writers" ⚑, **both
    catalog strings**. **The card portrait carries alt text naming the writer** ⚑ — picture scale is
    content. Light: name 13.4:1.
    **Repeating items** — designed for 8–12, correct at 4–12; **order, or the first reference, is what
    the first card shows** ⚑.
    **Flagged ⚑** the bleed to the viewport edge · controls rendering only on overflow, server-side ·
    the active dot being `text` rather than accent · arrows dropping at 767 · the 260 px card floor ·
    no autoplay · the aria-label · the social row wrapping on a narrow card.
    **Reconciled.** Padding retired into **Vertical spacing**; **Social links** ⚑ is new. At Hand-picked
    **the first card is the first reference** ⚑ rather than whatever the sort surfaced, and Role is
    drawn under the name. The arrow labels become catalog strings; the module is still `carousel` and
    none was coined.

---

### 13 · Lead and Rest

1. **Descriptor.** One writer at size with portrait, bio, meta and link, then a rule, then the rest as
   a three-column list of names and counts.
2. **Tuple.** `feed · none · page · many · left · one writer at size, the rest listed`
   **The category's only `feed`** — one stream, two sizes of item.
3. **Archetype.** feed. **One departure** — the lead and the list collapse on different ladders ⚑.
4. **Responsive.** **1440** lead portrait 120 with a 28 gutter, name 32, bio clamped three on 640;
   list three of 416 with 40 px items. **834** lead portrait 96, list two of 365. **≤ 767** lead
   portrait above the name at 80, name 26, list one of 350, portraits 36.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `emptyText` · `roleOverride` · `authorPicks[]`.
   From Ghost: name, `profile_image`, `bio`, `count.posts`, `location`, `website`, `url`, and **at
   *Social links: On* the lead's nine handles and website** ⚑.
6. **Controls.** Lead portrait *Compact · Comfortable · Spacious* — Lead bio *Two lines · Three lines ·
   Full* — Lead meta *Show · Hide* — List columns *Two · Three* — List counts *Show · Hide* — **Social
   links *Off · On*, the lead's bio only** ⚑. **Six.** Quick: Lead portrait, Lead bio, List columns,
   List counts. Data group with **How many defaulting to Eight** ⚑.
7. **Data.** As 1. **0** → head and notice, no rule ⚑. **1** → **the lead alone, no rule and no
   list** ⚑ — the design's strongest small state, which is why it does not suggest 6 Founder. **2** →
   a lead and one list item, **columns not reflowed to fill** ⚑. **many** → the design. **Order decides
   who leads, and at Hand-picked the first reference does** ⚑.
8. **Empty.** Lead with no bio → the meta line rises ⚑. No location or website → dropped with their
   separators. No picture → initials at 120. No handles → no social row under the lead ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** Heading **h2**; **the lead's name and every list name are `h3`** ⚑ — the lead is larger
    but not more important in the outline. **The rule is a `<div>`, not an `<hr>`** ⚑ — it separates
    two views of one list. The lead portrait carries alt text at 120 ⚑. Light: lead name 13.4:1, list
    count 5.1:1.
    **Repeating items** — designed for 6–12, correct at 1–12; **order, or the first reference, chooses
    the lead** ⚑.
    **Flagged ⚑** the lead borrowed from 6 without its card · the first reference choosing the lead ·
    the rule as a div · lead and list on different ladders · columns not reflowing at two · the social
    row on the lead only.
    **Reconciled.** Padding retired into **Vertical spacing**; **Social links** ⚑ is new on the lead,
    and the list draws none — a row of icons in a 40 px item would compete with the names. **At
    Hand-picked the first reference leads** ⚑, which is the featured-writer picker this design refused,
    arriving as a source rather than as a second control; **Role is drawn in the lead's meta line**.

---

### 14 · Image Band

1. **Descriptor.** A full-bleed authored photograph carrying a warm scrim, the head in white and a row
   of portraits with names and counts along the foot.
2. **Tuple.** `grid-of-N · none · image · many · background · the roster over a cover image`
   **The category's only `image` ground and only `background` media.**
3. **Archetype.** grid-of-N. **Two departures** — the section's own space is 0 ⚑ (**Vertical spacing
   locked**), and **the band is taller at 390 than at 834** ⚑.
4. **Responsive.** **1440** band 1,440 wide, **460 minimum, not a crop** ⚑, 72 inside, head top, six
   portraits of 196 at the foot, portrait 64; at twelve the band grows to 542. **834** 420 minimum,
   56 inside, three of 235. **≤ 767** **540 minimum** ⚑, 40 inside, two of 165, portrait 56.
   **Every stated height is a floor: the band grows with its content and the scrim grows with it** ⚑.
5. **Fields.** `eyebrow` · `heading` · `blurb` · **`backgroundImage` — an authored upload, the
   category's only image field** ⚑ · **`imageFocus`** ⚑ · `emptyText` · `authorPicks[]`. From Ghost:
   name, `profile_image`, `count.posts`, `url`. **`bio` and `roleOverride` stored, not drawn** ⚑.
6. **Controls.** Height *Short · Standard · Tall* (**a minimum, not a crop** ⚑) — Scrim *Light ·
   Medium · Strong* (**Light disabled against light images**, checked on the bottom third ⚑ — A29·5's
   test) — **Image focus *Centre · Top · Bottom*** ⚑ — Head position *Top · Bottom* (**never both at
   the foot** ⚑) — Portraits across *Four · Six · Eight* — Post count *Show · Hide* — Blurb *Show ·
   Hide*. **Seven.** Quick: Height, Scrim, Image focus, Portraits across. **Background role is locked —
   the photograph is the ground — and Vertical spacing at 0** ⚑. Data group with **Bio locked to Off**
   ⚑.
7. **Data.** As 1. **0** → the band, the head and the notice ⚑. **1** → one portrait at the foot's
   left. **many** → wraps and **the band grows past its minimum; nothing is ever cropped** ⚑. **No
   image at any width → hands off to 5 Contrast Band** ⚑, drawn in place, flagged in the editor,
   invisible on the site. **The only hand-off in A21.**
8. **Empty.** No photograph on a writer → initials on an **18% white plate** ⚑, no ring. **No
   background image → the hand-off is the empty state** ⚑.
9. **Module.** None. **No-JS: pixel-identical** — the image is a CSS background on a real
   `{{img_url}}` ⚑, the scrim is a gradient, and **Image focus resolves to `background-position`** ⚑.
10. **A11y.** Heading **h2**, names **h3**. **The background image is decorative and takes an empty
    alt** ⚑. Checked at Medium on the darkest and lightest thirds of the sample crop: heading and
    names 12.1:1, **counts 4.9:1 at 13 px** ⚑ — the reason Light disables itself.
    **Repeating items** — designed for 6 and 12, correct at 1–12; bio never drawn.
    **Flagged ⚑** the authored background image · the locked ground and spacing · the taller band at
    390 · literals rather than tokens over the image · the 18% initials plate · Light disabled by a
    bottom-third check · the hand-off to 5 · height as a minimum · **Image focus as three named values
    rather than a point** ⚑.
    **Reconciled.** **Image focus** ⚑ closes the "no focal point" flag: A22 Cover and A23 Cover both
    carry it, and the band is taller at 390 than at 834, which is exactly where a centred crop cut
    heads off. It is reachable from the Image Picker popover as well as from the control list.
    **Background role is locked** — the photograph is the ground — and **Vertical spacing at 0** ⚑;
    Height keeps its name as a floor. Hand-picked joins the Writers source; the hand-off to 5 with no
    image is unchanged.

---

### 15 · Slim

1. **Descriptor.** A full-bleed surface strip carrying one assembled sentence of credits and a
   masthead link. **The smallest author showcase in the library — 73 px including both hairlines.**
2. **Tuple.** `bar · none · surface · many · none · one line of credits`
   `surface` separates it from 8 Faces on `page`; media `none` — it draws no image of any kind.
3. **Archetype.** bar. **Two departures** — the section's own space is 0 because the strip carries it
   ⚑ (**Vertical spacing locked**), and the link relocates under the sentence at ≤ 767 ⚑.
4. **Responsive.** **1440** strip 1,440 wide, content 1,296 on a 72 margin, 24 inside, sentence 16,
   link right. **834** 40 margin, sentence 15. **≤ 767** 20 margin, 20 inside, **link under the
   sentence on a 32 px row** ⚑.
5. **Fields.** `linkLabel` ⚑ · `linkUrl` (**the Link Picker, defaulting to the authors-index route
   once that route decision lands** ⚑) · `emptyText` · `authorPicks[]`. **No eyebrow, heading or
   blurb** ⚑ — all stored, none drawn. From Ghost: name, `url`, `pagination.total`, **`@site.title`**
   ⚑. **`bio` and `roleOverride` stored, not drawn** ⚑.
6. **Controls.** Strip padding *Compact · Comfortable · Spacious* (16 · 24 · 36 **inside the strip**
   ⚑) — Names in the line *Two · Four · All* — Link *Show · Hide* — Rules *Above and below · Below
   only · None* — **Member visibility** ⚑. **Five.** Quick: Names in the line, Link, Rules, Strip
   padding. **The old *Ground* row is retired into Background role** ⚑ — Surface is the strip, **at
   Background it is 8 Faces without the portraits, and the panel says so** ⚑, and Contrast is newly
   reachable, deriving its ink from A17·7's two contrast tokens. **Vertical spacing locked at 0** and
   **Top divider disabled** against Rules ⚑. Data group with **How many defaulting to Four** ⚑ and
   **Bio locked to Off** ⚑.
7. **Data.** As 1, minus `profile_image` and `bio`, plus `pagination.total` and the site title ⚑.
   **0** → the strip stays and the notice takes the line ⚑. **1** → a one-name sentence with no
   remainder ⚑. **many** → four named, the rest counted. **At Hand-picked the references are the names
   written out** ⚑.
8. **Empty.** **Never "and 0 others", never an ellipsis** ⚑. A renamed publication updates the
   sentence, because the title is read rather than typed ⚑.
9. **Module.** None. **No-JS: pixel-identical.**
10. **A11y.** **No heading** ⚑ — as 8 Faces. The strip is a `<p>` inside a section landmark ⚑. Light:
    sentence 5.3:1 on `surface`, names and link 14.0:1; **on Contrast the same ratios are derived from
    the two contrast tokens** ⚑.
    **Repeating items** — designed for four named of any total, correct at 1–12 named; **order, or the
    picked list, decides which four are written out** ⚑.
    **Flagged ⚑** the locked spacing and the strip's own ladder · the assembled sentence and the site
    title read from Ghost · the remainder from `pagination.total` · no heading · the masthead URL's
    pending default · the named overlap with 8 Faces · the link relocating at 767 · **Contrast newly
    reachable** ⚑.
    **Reconciled.** **Ground is retired into Background role** ⚑ — it was the universal control under
    another name — and Contrast becomes reachable as a consequence. **Vertical spacing locked at 0**,
    **Top divider disabled** against Rules, and Strip padding keeps its name. **Member visibility** ⚑
    governs the masthead link alone, `linkUrl` opens the Link Picker, and **Hand-picked decides which
    names are written out** ⚑.

---

## Findings for the architect

1. **Ghost returns only authors who have published.** `{{#get "authors"}}` excludes staff accounts
   with no published post ⚑, so **a masthead cannot show a new hire until their first piece ships**,
   and cannot show an editor who commissions rather than writes. Every design inherits this, and
   **Hand-picked does not escape it** ⚑ — an author with no published post cannot be referenced either.
2. **There is no per-author latest post.** Drawing "their most recent piece" beside each name needs a
   `{{#get "posts"}}` inside the author loop — **one query per writer** ⚑. No design draws it; 10
   Directory's cut column is the visible consequence.
3. **There is no authors index route — and this is now a product decision, not a gap.** Ghost has
   `/author/:slug/` and nothing above it, so **8 Faces' and 15 Slim's "The full masthead" link is
   authored** ⚑ — but after this pass it **opens the Link Picker and will default to the product's
   authors-index route once that route decision lands** ⚑. A20 found the same gap for tags. **The
   default is pending, not invented**, and the frames say so.
4. **Nothing in the registry sorts a table.** 10 Directory's header row is labels, not controls ⚑ —
   the closest module is `filter-strip`, which navigates rather than sorts. A sortable masthead is a
   registry change, **and this pass did not make one**.
5. **Ghost authors have no role — so the role is authored.** No job title, no desk, no "Editor" ⚑.
   A12 About and Team draws roles because its people are authored; A21's are Ghost users. **This pass
   blesses the workaround**: an authored `roleOverride` **keyed by author slug**, A12's Ghost-mode
   mechanism, drawn in eight designs and stored in seven. **It is section content and never claims to
   be a Ghost field** ⚑, and a platform role field would replace it rather than compete with it.
6. **`count.posts` and `pagination.total` can disagree.** A21 draws `count.posts`; A29 draws the
   archive's own total ⚑. On a site with members-only posts a reader can see "68 posts" on a card and
   a shorter archive behind it. Raised as A29 finding 4 and unchanged.
7. **Ghost stores nine social handles and a website — corrected.** `facebook`, `twitter` (X),
   `linkedin`, `threads`, `bluesky`, `mastodon`, `tiktok`, `youtube`, `instagram` and `website`
   on **Ghost ≥ 6.36** ⚑. The two-network fact this category was drawn on was 5.x. Three consequences
   for the build: **the row is version-gated** ⚑ — below 6.36 only Facebook, X and the website exist;
   **there is no loop over the handles** ⚑, so a theme checks nine fields and draws what is filled; and
   **the author's own fields must be read rather than `social_url`** ⚑, which falls back to the site's
   Facebook and X and would print the publication's accounts under a writer who filled in neither.
   **6 Founder draws the row always; 1, 2, 12 and 13 draw it at *Social links: On*.**
8. **There is no editorial order for authors — and Hand-picked is the answer, not a picker.** The
   three sorts are the whole sort vocabulary ⚑, so **"featured writer" is still not a flag**. What the
   section can do is **keep its own ordered list of references** ⚑: 13's lead is the first reference,
   6 draws the first reference, 8 and 15 write out the references. **No author ID is hard-coded into a
   section** — a reference is by slug, renames follow, deletions drop.

**Repeated from A29 and still open:** there is no sticky module for anything but the site header
(11 Rail), and a section cannot know what precedes it on the route. **This pass coined no module
name**, so neither is closed here.

---

## Component inventory

Cumulative. Reused components are listed with the category that set them.

| Component | What it is | First set |
|---|---|---|
| Eyebrow | 13 px uppercase tracked .08em in `text-muted` | A1·1 |
| Primary button · ghost action | Accent fill 14/600 at 44 px; muted 14 px text link | A1·1 |
| Avatar + initials fallback | Circle at 120 · 96 · 72 · 64 · 48 · 40 · 32, heading-font initials on `hover` | A1·6 |
| Striped image plate | The placeholder and its mono crop caption | A1 |
| Icon button | 32–44 px box at the pack radius, bare or outlined | A1·14 |
| Focus ring | 4 px accent ring on every interactive element | A6 |
| Named ratio ladder | Portrait 4:5 · Square 1:1 — the two A21 uses | A8 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132 | A17 |
| On-contrast derivation | Every colour in a band from two `contrast` tokens | A17·7 |
| Surface card | Radius token, md shadow in light, hairline in dark | A19·3 |
| Missing-image vocabulary | Reflow · Plate · Hand off | A19 |
| Index line | Name 15–17 and count 13 tabular over a hairline | A20·7 |
| Warm scrim | Warm dark gradient, strongest at the foot, fading through 34%; white over it | A20·13 |
| Hand-picked reference list | 1–12 references to Ghost objects with the P0·3 item controls | A20 |
| Rail division | 240 · 48 · 1,008, leaving at 1,200 | A25 |
| Surface plane | Surface + hairline + md shadow; flat in dark | A26·3, A27·4 |
| Portrait at picture scale | A photograph with alt text, not an avatar; plate at the same crop when absent | A26·11 |
| Archive meta line | 14 px muted items separated by ·, absent items dropped with their separators | A29·12 |
| Zero notice | 17 px muted line under the head, clamped at 560 | A29·1 |
| Icon slot + Icon Picker | A declared slot, brand set included, with its size and colour-role popover | P0·2 |
| **Writer block** | **Portrait, name, count, two clamped bio lines, an optional role, an optional social row, archive link** | **A21·1 — new** |
| **Writer row** | **Portrait 64, name and bio, count and link on the right edge, 112 px** | **A21·3 — new** |
| **Overlapping portrait stack** | **Circles at −14 with a 3 px ring in the `background` token** | **A21·8 — new** |
| **Assembled credit sentence** | **"Written by A, B, C and N others" — names linked, remainder counted, never truncated; a catalog string** | **A21·8 — new** |
| **Generated count line** | **"12 writers" · "1 writer" · "No writers yet", pluralised, never a bare number; a catalog string** | **A21·11 — new** |
| **Directory row** | **Portrait and name, a meta column, a right-aligned tabular count under authored `th` labels** | **A21·10 — new** |
| **Author social row** | **Every filled-in handle of the nine, plus the website, as 32-in-44 icon slots from P0·2's brand set; absent handles drop** | **A21·6 — new** |
| **Hand-picked writer list** | **1–12 author references with the P0·3 controls; the first leads in 6 and 13** | **A21 — new** |
| **Role override** | **An authored role per writer keyed by author slug — A12's mechanism, because Ghost has no role field** | **A21 — new** |
| **Writers Data group** | **Writers (All writers · Hand-picked) · the picked list · How many · Order · Bio · Role · Links to (read-only) · When empty** | **A21 — new** |

---

## Reconciliation notes

**Frames changed in this pass — sixteen, and every one of them.**

- **`A21-0 Category Proof`** — settlement 1 (the corrected social fact and the four designs that now
  draw a row), the shared field list (four new authored fields, the socials row's *Used by*, the
  `linkUrl` note), finding 7 rewritten, the component inventory (three new components, the source
  group renamed to the Data group), the roster's control counts, and a new **controls-reconciliation
  section** listing this pass in eight points.
- **All fifteen control-panel frames** — the universal trio and the Data group drawn outside each
  list, an **Editing** block naming the P0 primitives, a **Reconciled** block under the panel, the
  strip line and the footer count rewritten, Padding rows removed or renamed, and each design's new
  rows added.
- **Five section frames redrawn** — **6 Founder**, whose social row is now icon slots for every filled
  handle in all four of its states; and new state frames on **1 Grid**, **2 Cards**, **12 Carousel**
  and **13 Lead and Rest** (*Social links: On*, the sub-6.36 version gate, and the no-handles case) and
  on **14 Image Band** (*Image focus* at Centre, Top and Bottom).
- **All fifteen spec cards** — item 5 where a field list changed, item 6 wholesale, and a
  **Reconciled** paragraph at the foot.
- **`a21-kit.js`, the category's authoring kit** — `socialRow` rewritten ⚑: it encoded the 5.x
  two-network fact and could only draw an "X" and an "f" as text glyphs. It now takes the author's
  filled handles in Ghost's order, emits **P0·2 brand icon slots at 32-in-44** with the network's name
  as the accessible name, drops absent handles, and carries a `legacy` flag for sites below 6.36.
  Anything regenerated through the kit now draws what this spec says.

**Where this pass contradicted something the category had already ruled, and what was decided.**

- **"Ghost stores two social networks" (settlement 1, finding 7, and 1 Grid's cut list) was wrong, not
  merely narrow.** The nine-handle surface arrived in 6.36. The old refusal in 1 Grid's panel — "a
  social row (Ghost stores two networks and most authors fill in neither)" — **is withdrawn and the row
  is drawn**; the second half of that sentence still holds, which is why the control defaults to Off.
- **A role or job title was refused category-wide** ("Ghost has no such field"). **The refusal stands
  for Ghost data and is withdrawn for section content**: `roleOverride` is authored, keyed by slug, and
  the panel says which it is. Drawn in 1, 2, 3, 4, 6, 10, 12, 13; stored and not drawn in 5, 7, 8, 9,
  11, 14, 15.
- **"A featured-writer picker" was refused** (no editorial order in Ghost). **Hand-picked is not that
  picker**: it is a source, it stores references rather than IDs, and it is the only place an order can
  be authored. 13's lead and 6's single writer follow from the list rather than from a second control.
- **The Writers source group was "five rows, one of them read-only".** It is now the **Data group**
  with eight rows and a conditional list. The count changed; the rule that none of it is counted toward
  a design's controls did not.
- **Vertical spacing on 5, 14 and 15 is locked at 0** ⚑ — **an invented ruling**, and the sharpest one
  in this pass. The category had said those three "have no padding of their own"; a universal control
  that resolves to nothing is worse than a locked one with a reason, so it is locked and the reason is
  shown. If the platform later gives a full-bleed band outer space, this is the row to unlock.
- **15 Slim's *Ground* row is retired into Background role** ⚑ — **not named by the patch**, decided
  here, because two ground controls in one panel is exactly the duplication rule 3 exists to remove.
  The consequence is that **Contrast becomes reachable on 15**, which the category had never drawn;
  its ink derives from A17·7 and the ratios are stated, but **no frame draws 15 on Contrast yet** —
  open.
- **3 Rows, 4 Split Head and 7 Panel reuse the writer block and did not get a Social links row.** The
  patch named 1, 2, 12 and 13. **Recorded rather than resolved**: 3's right edge and 4's narrow column
  are the stated reasons, 7's 76 px row is the other, and if the row is wanted there it is one value on
  an existing control, not a new design.
- **8 Faces' and 15 Slim's masthead link now has a pending default** ⚑ — the authors-index route. Until
  the product's route decision lands the field is authored, and the frames say so rather than shipping a
  URL that does not exist.
- **10 Directory's *Where* column stays the location**, and the role is drawn under the name. A role
  column would need a third data column and 834 already relocates the second one. **Open, and named.**
- **No Preview control existed in A21** — the check was run against all fifteen panels, and the removal
  rule found nothing to remove.
- **No module name was coined.** `carousel` on 12 is still the category's only module; Hand-picked, the
  role override, Member Visibility and the social row are template work. **No frame carries
  *ARCHITECT: registry addition*.** The two registry questions A21 raised — a sticky rail (11) and a
  sortable directory (10) — are unchanged and still open.
