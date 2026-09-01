# A20 Tag Collections — written specification

15 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass applied 25 August
2026**

The frames are `A20-0 Category Proof.dc.html` and `A20-1` … `A20-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Design patch pass — 29 August 2026 (this document's current state).** Three rulings landed on this
category and two of them changed what is drawn. **Ghost's templates cannot look at the previous item
inside a loop**, so 7 Index's letter heads are cut in by a small script and its no-JavaScript state is a
flat alphabetical list. **Ghost returns at most 100 tags** and warns above that, so *Show* is a number
picker with that ceiling and the truncation stated. **A tag's own colour reaches a theme only on a
recent Ghost**, and the five designs that read it now say so in the panel. Alongside those, the ten
library-wide rules were applied to the category: **12 Panel's hand-off to 1 Chips is deleted** — no
design turns into another design — the hand-picked list's Remove never greys out, and item counts are
a number picker rather than a row of fixed buttons. **Nothing was renumbered.** Two questions the
reconciliation pass had left open were also ruled: **8 Big Type gains the all-topics link switch** and
**9 Rail gains the Counts row**, neither changing what is drawn. Every change is listed with the name
of the rule that required it in **Patch notes** at the end.

**[Free] designs:** 1 Chips · 14 Slim

*(Shortlisted in this pass — 1 Chips, 5 Split Head, 7 Index, 11 Ledger, 14 Slim: the plainest designs,
and the five that do not depend on the customer having good photography — and **ruled by the owner on
29 August 2026**: the category default and the quietest line in it. A free site gets a pill row it can
put anywhere and a one-line topic bar, neither of which needs a picture.)*

**What the reconciliation pass did.** The category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. It retired **Padding** into the universal **Vertical spacing** in all fifteen panels, added the
**universal trio** and the reconciled **Data group** outside every control list, gave `tagSource` a
fourth value — **Hand-picked** — with the shared item controls, defined the degradation this spec was
silent about, added **Tag colour** to the five designs with a fill or a plate to spend it on, put
every authored string on the shared inline toolbar against Ghost content that is never editable, and
removed one ornament. The shared editor primitives are **P0's** and are reused by name, never
redesigned: **P0·1** the inline text toolbar and its link popover, **P0·2** the icon slot and Icon
Picker, **P0·3** the item-list controls, **P0·4** the member-aware action editor (unused here, and
why is stated), **P0·5** the "Populate from…" data panel, **P0·6** the editor state switcher. What
each design gained is in a **Reconciled** paragraph at the foot of its entry, and the frame-by-frame
list is in **Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A20·2 in three packs, light and dark), the stress frame, the roster, the repeating-items table, the
component inventory, the seven findings in full and the category-wide reconciliation section.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A28 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A20 is

**Fifteen ways to draw a set the user does not own.** The author writes posts, Ghost derives the
tags, and the section shows some or all of them with a count and a way in. **No design in A20 styles
one tag differently from its neighbours** — a control writes one value onto the section and the
stylesheet reads it, so per-item styling is not expressible. The one place a single tag is drawn
differently is 10 Lead and Rest, where the section writes "the first item is the lead" once and the
stylesheet reads `:first-child`.

**The one Add in the category, and why it is not an exception to the rule.** Before this pass A20 had
no Add, no Remove and no reorder anywhere. It now has exactly one, in the Data group: at
`tagSource` = **Hand-picked** the author keeps a list of **references to Ghost's tags** ⚑ — the
references are authored, the tags are not. A renamed tag renames itself in the list; a deleted tag
drops out of it silently; nothing about the tag itself can be typed, styled or overridden. **Every
Ghost-sourced value in A20 still has no Add button.**

What the fifteen vary is arrangement: pills, tiles, cards, rows, columns, a table, a track, a box, a
band, a bar and a line. What they share is one field list, one Data group, one universal trio, one
pill, one plate and one set of answers to §8.

A20 inherits **A17's page grid, padding ladder, named ratio ladder, tag plate and contrast
derivation**; **A10's cell divisions**; **A8·6's split layout**; **A26·1's tag pill and A26·8's large
pill**; **A26·3 and A27·4's call that a plane is a ground rather than a containment**; **A25's 1,200
margin threshold**; **A1·14's 38-in-44 icon button**; **A6's focus ring and its rule for a control on
a band**; **A23's tag-chips repeater** as the precedent for the hand-picked list; A1's striped
placeholder. **A20 adds eight components and two panel groups** — listed on the proof frame — and
nothing else.

### The four settlements (§8 of the brief)

**1 · The tag card, and what is optional.** Ghost guarantees `name`, `slug` and `url`. Everything
else is optional and most sites leave it empty ⚑: `description` is written by perhaps one site in
five, `feature_image` by fewer, `accent_color` by fewer still, and `count.posts` is derived and costs
an `include` on the query ⚑. So A20 treats **name and count as the card**; `description` is an
enhancement three designs read (3, 4, 11), `feature_image` an enhancement four read (2, 4, 9, 13),
and `accent_color` an enhancement five designs read **only at Tag colour: Tag's own** (1, 2, 6, 9,
15). **Every design that reads an optional field states what it draws without it, and no design fails
when all of them are absent.**

**2 · Tags with no posts.** Ghost returns them; **A20 hides them by default** ⚑ via the Data group's
*Tags with no posts* field, because a chip that leads to an empty archive is a dead end the reader
pays for. **7 Index is the design that most wants them shown** — an index that omits a topic is
broken — and it still defaults to Hide. At Show they draw muted and still link ⚑.

**3 · Long names, and internal tags.** **Internal `#hash` tags are never drawn anywhere in A20** ⚑:
the query filters on `visibility:public`, so they are not fetched rather than hidden, and there is no
control to reveal them. **Long names are never clamped, never ellipsised and never auto-fitted** ⚑ —
they wrap, the row or cell grows, and the count holds the first baseline. The stress frame is 43
characters and is drawn at every width.

**4 · Zero, one, many, and where the links go.** **Zero public tags removes the section entirely** ⚑
in all fifteen; the editor draws a dashed placeholder naming why. **One tag is drawn as one tag** in
all fifteen — no widening, no centring, no stretching — and **no design in A20 hands off to another**
⚑ *amended 29 August 2026*: 12 Panel's hand-off to 1 Chips is deleted, so below four topics it draws
its box with the one column the set fills and its panel advises that 1 Chips reads better at that
count. Advice, never a switch. **Every tag name
links to that tag's Ghost archive** ⚑, which is **A29 Archive Headers'** page and is not yet
designed; the all-topics link points at a site tag index **Ghost does not provide** ⚑ (finding 1).

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The measures.** Content **1,296 on a 72 margin** at 1440, 754 on 40 at 834, 350 on 20 at 390 —
  A17's, unchanged. A10's divisions across 1,296 on a 24 gutter: 636 · 416 · 306 · 240 · 196.
  **Two designs compute their divisions inside their own container instead** ⚑ — 3 Cards inside its
  plane (1,200 → 384), 12 Panel inside its box (1,214 → 391).
- **Vertical spacing, and the ladders that are not it.** The section's own space above and below is
  the **universal Vertical spacing** control, resolving **64 · 96 · 132** at 1440, **80** at 834,
  **64** at 390. **14 Slim and 15 Filter Bar resolve their own shorter 40 · 64 · 96** ⚑ under the same
  name. **Four ladders are genuinely different and keep their own names** ⚑: 6 Contrast Band's band
  padding, fixed at 80 · 64 · 56 and not a control at all; 4 Rows' and 11 Ledger's **Density**, which
  is the row's internal padding; and 12 Panel's **Box inset**. **No design carries a Padding row any
  more** — it was Vertical spacing under another name.
- **The head.** One control, four values — **Label** 13 px uppercase tracked .08em · **Heading**
  34 px in the heading font · **Heading and intro** adding 17 px muted clamped to 560 · **None** —
  all reading one `headingText`, default **"What we cover"** ⚑. **Four designs have no Heading
  control:** 5 (the column is the head), 8 (the names are the display moment), 14 and 15 (a label
  only). At None the section takes `aria-label="Topics"`, which is a **translation-catalog string** ⚑.
- **The type.** Names 15 (pill, index, slim) · 17 (panel, ledger) · 19 (tile, row) · 22 (card) ·
  26–34 (overlay, lead) · 44–72 (8 Big Type). Counts 13, and 15 in 4 and 11. Eyebrows 13.
  **Nothing below 13, and nothing between 13 and 15** ⚑.
- **Accent, once at most — and tag colour, which is not accent.** Eleven designs spend their accent
  on the all-topics link; **15 spends it on the active chip, the category's only accent fill** ⚑;
  **6 spends none at all** ⚑, because a pack's accent is checked against `background` and not against
  `contrast` — A6's rule. **No name, count, rule, middot or letter head is ever accent.** **Tag
  colour: Tag's own is a separate mechanism** ⚑ — a tag's own `accent_color` as a fill or a plate
  tint, with a derived on-colour — and it never becomes the section's accent. **Tag's own needs a recent Ghost** ⚑ *29 August 2026* — a tag's colour reaches a theme only on a recent release, and **on an older Ghost every tag falls back to Theme**, silently and site-wide, with nothing drawn empty; the panel states the requirement. **On an older Ghost the row is greyed with the reason shown** — "Your Ghost version does not support topic colours" — and every tag takes the theme colour, so nobody sets a colour and wonders why nothing happened; **ruled by the owner on 29 August 2026**. **ARCHITECT: the version number itself is the product's to supply**, named once and not repeated per design.
- **Targets.** **Nothing the theme draws is under 44** ⚑. Pills 32-in-44 at Compact and 44 px boxes
  above it; chips 38-in-44; rows and lines on a 44 px minimum; tiles are the whole cell. **Hover
  fills bleed 8–12 px past the measure** ⚑; focus rings inset 2 px wherever the target meets a page
  margin or a container edge.
- **Imagery.** A17's named ratio ladder — **Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5**,
  never computed. **A missing picture draws A17's tag plate carrying the tag's own name** ⚑, clamped
  to three lines. **Below 96 px the plate carries A1's initial instead** ⚑ — a 64 px square cannot
  hold "Photography" at a size that reads — except in 13, where it draws on the hover surface with no
  scrim. **A tag image has no alt text in Ghost** ⚑: every picture is `alt=""` and the name carries
  the link. **A20 has no authored image field and therefore no Image focus** ⚑ — the pictures are
  Ghost's `feature_image`, which has no picker and no focal point; the crop stays centred, and a focus
  control here would be a fake one.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm
  shadows dropped and the hairline carrying every plane. **One thing is re-tuned rather than
  re-tokenised** ⚑ — 13 Overlay's scrim, at all three of its new strengths.
- **Print.** **A20 prints as names only** ⚑ — pictures, planes, boxes, bands, counts, descriptions
  and tag colours all drop, and the section prints as one line of topic names under its heading.
- **Behaviour.** **Three designs declare a module** ⚑ *amended 29 August 2026* — 9's `carousel`,
  15's `filter-strip`, and **7's `group-headings` at Group by: Initial** — all three from the fixed
  registry, all three quoted, all three fully usable without JS. The other twelve declare none.
  **No module name was coined in either pass**, so no frame carries *ARCHITECT: registry addition*.
- **Refused category-wide, each with a reason:** `marquee` on 14 ⚑ (a moving list of topics cannot be
  read) · `shuffle` anywhere ⚑ (a set whose order changes on reload cannot be proof-read) ·
  `load-more` and `infinite-scroll` (a tag set is finite and Show clamps it) · `reveal` ⚑ · a
  per-item override of anything ⚑ · **a sticky filter bar** ⚑ (no module covers it — finding 6) ·
  sortable column heads ⚑ (Order is the Data group's) · **Member Visibility** ⚑ (no CTA in the
  category — see below). **A tag's own `accent_color` is no longer on this list**: it is read at Tag
  colour, and that amendment is recorded in the Reconciliation notes.

### The universal trio — outside every design's control list

Three controls every placeable section in the library carries. **They are not counted toward any
design's control count** and they sit below its own list, above the Data group.

| Control | Values | Notes |
|---|---|---|
| **Background role** | Background · Surface · Contrast | Resolved from the pack. **Locked at Contrast in 6** ⚑ and **at Background in 14** ⚑, with the reason shown in place of the values |
| **Vertical spacing** | Compact · Comfortable · Spacious | 64 · 96 · 132; **40 · 64 · 96 in 14 and 15** ⚑. **This is the retired Padding row under its real name** |
| **Top divider** | None · Line · Fade | Drawn above the section on the page ground. **Disabled in 14** where Rules already draws that hairline ⚑; drawn **above** the band in 6, never inside it ⚑ |

**Two designs lock their ground, and only two.** ⚑ *Reasons rewritten 29 August 2026 — a locked value
states its own reason and never names what the section would "become".* 6 Contrast Band's inverted
band **is** the design, so Background has nothing to invert; if a plain pill row on the page ground is
wanted, the panel names **1 Chips as the design to place**. 14 Slim is the category's only
`transparent` ground, and on a surface or a contrast ground its two rules stop reading as rules; the
panel names **15 Filter Bar as the design to place** for a bar on a surface. Both are advice. **3 Cards, 11 Ledger and 15 Filter Bar do not lock**: in
those three the plane, the plane and the bar are the design's own control (*Plane*, *Plane*, *Bar*),
and Background role is the ground behind it. **13 Overlay does not lock either** ⚑ — the pictures are
the tiles' own ground, not the section's.

### The Data group — the reconciled Tags block

Five fields plus one conditional list, identical in all fifteen, **below** each design's own controls
and the universal trio, and **not counted** toward any design's control count ⚑. It is **P0·5's
"Populate from…" panel configured for tags**.

| Field | Type | Values |
|---|---|---|
| `tagSource` | enum req | All tags · This post's tags · This author's tags · **Hand-picked** ⚑ → `{{#get "tags" filter="visibility:public"}}` |
| `tagPicks[]` | list opt | **Shown at Hand-picked only.** 1–12 tag references ⚑ |
| `tagCount` | number req | **A number picker, 1–100** ⚑ *29 August 2026* → `limit`; per-design maxima below. **A count, never a chosen set.** **Ghost returns at most 100 tags** and warns above it, so the panel states the cap and the truncation ⚑. Disabled at Hand-picked ⚑ |
| `tagOrder` | enum req | Most posts first · Fewest first · A–Z · Ghost's order ⚑ · **forced to A–Z and disabled in 7** ⚑ · disabled at Hand-picked ⚑ |
| `showEmptyTags` | enum req | Hide (default ⚑) · Show — tags whose `count.posts` is 0 |

**Hand-picked, in full.** ⚑ A list of **references** to Ghost's tags, with the shared **P0·3 item
controls**: drag to reorder, **✕ to remove and never disabled — at one reference it stays visible and
clickable and says why it cannot go lower: "a hand-picked list needs at least one topic"** ⚑
*29 August 2026* — and **Add arrives pre-filled with the next most-used tag, never blank**. **1–12 references**; the section stores references and never
copies, so **a renamed tag renames itself here and a deleted tag drops out silently**. **Picked order
is drawn order**, which is why *Order* disables; the list is the count, which is why *Show* disables.
A23's tag-chips repeater is the exact precedent. Per design: **10 Lead and Rest leads with the first
reference** ⚑ — the featured-tag picker that design refused, arriving as a source rather than as a
second control — **12 Panel draws its own box below four references** ⚑ *amended 29 August 2026 — the hand-off to 1 Chips is deleted and the panel advises it instead*, and **7 Index keeps
A–Z even here** ⚑.

**The degradation, which this spec was silent about.** ⚑ **`tagSource` = This post's tags on a route
that has no post, and This author's tags off an author route, fall back to All tags**, and the panel
says so in place of an empty state: *"This page has no post, so all topics are shown."* Nothing
renders empty and no section disappears for a routing reason. The fallback is server-side, in the
same `{{#get}}`.

**Show, in full.** ⚑ *29 August 2026.* It is **a number picker** — item counts are a number picker,
never a row of fixed buttons — and it clamps the query's `limit`, so the tag past the count is not
fetched rather than hidden. **100 is Ghost's own ceiling**: asking for every tag trips Ghost's warning
and silently returns 100 anyway, so the picker stops at 100 and the panel states both the cap and the
truncation instead of promising "all". **Each design caps its own maximum, with the reason drawn beside
the greyed numbers**: 40 in 1, 6, 11 and 12 · 30 in 5 · 20 in 2, 4, 9, 14 and 15 · 14 in 8 and 10 ·
12 in 3 · **6 in 13**, whose default is 4 · **100 in 7**, the design built for the whole set. The old
Four · Six · Eight · Twelve · All row is retired, and **the "All" value is retired with it** ⚑ — it
promised something Ghost does not do.

**Internal `#hash` tags have no control** ⚑ — they are excluded by the filter and cannot be shown.

### Editing, and every visitor-facing string

- **Every authored text edits inline on canvas** with the **P0·1** toolbar — bold · italic ·
  underline · link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer ·
  sponsored**. The authored strings are `eyebrowText`, `headingText`, `introText`, `linkLabel`, 10's
  `leadLabel`, 11's `colTopic` / `colCovers` / `colPosts`, 15's `allChipLabel` and 14's label.
- **Ghost-owned content is never inline-editable** ⚑: **tag names, counts and descriptions**. Clicking
  one says **"Edit in Ghost"**.
- **Every URL field opens the Ghost-aware Link Picker**, and **the all-topics link takes an optional
  icon before or after its label** from **P0·2**, with its size and colour-role popover ⚑.
- **No fixed English visitor-facing string ships.** Authored strings have editable defaults. The
  strings that are announced rather than designed become **theme translation-catalog strings** ⚑:
  9's **"Previous topics"** and **"Next topics"**, and the `aria-label="Topics"` that 1, 8 and 14 take
  at Heading None or Label Off, with 15's `<nav aria-label="Topics">`.
- **The editor's own sentences are not theme strings** ⚑: the zero-tag placeholder and 12's hand-off
  notice are product UI and stay with the product.
- **No Preview control existed to remove** — the check was run against all fifteen panels.
- **No Member Visibility anywhere in A20** ⚑, and this is a judgement rather than an omission: rule 9
  attaches it to CTA-bearing designs, and **the all-topics link is navigation, not a call to action**
  — A14 made the same call for its See-all link. **P0·4's member-aware action editor is therefore
  unused in this category.**

### The roster

| # | Design | Tuple | When the content is thin | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Chips **[Free]** | `grid-of-N · none · page · many · none · a wrapping row of pills` | One pill; nothing else changes | 6 | — |
| 2 | Tiles | `grid-of-N · none · page · many · top · a four-up tile grid, picture over name` | Plate for a missing picture; short last row left-aligned | 6 | — |
| 3 | Cards | `grid-of-N · none · surface · many · none · hairline cards on a raised plane` | Card keeps the row height; plane keeps full width | 6 | — |
| 4 | Rows | `feed · none · page · many · left · ruled rows with a square thumbnail` | One row between two hairlines | 5 | — |
| 5 | Split Head | `split · none · page · many · none · the head standing in a left column` | Second column not drawn and not widened | 4 | — |
| 6 | Contrast Band | `grid-of-N · none · contrast · many · none · an inverted band of pills` | A full-height band for one pill ⚑ | 6 | — |
| 7 | Index | `table · none · page · many · none · an alphabetical index in balanced columns` | One letter, one name, three empty columns | 4 | `group-headings` ⚑ |
| 8 | Big Type | `stack · none · page · many · none · tag names set at display size` | One ruled line at full display size | 5 ⚑ | — |
| 9 | Rail | `carousel · none · page · many · top · a scroll-snap strip of picture tiles` | Arrows disable, dots undrawn, tiles left-align | 6 ⚑ | `carousel` |
| 10 | Lead and Rest | `split · none · page · many · left · one topic at picture size, the rest listed` | Lead alone in its 624 column; right column undrawn | 5 | — |
| 11 | Ledger | `table · none · surface · many · none · counts aligned in a right-hand column` | One row, column head kept | 4 | — |
| 12 | Panel | `grid-of-N · box · page · many · none · the whole set in one hairline box` | One column inside the box; box, head and link kept ⚑ | 4 | — |
| 13 | Overlay | `grid-of-N · none · page · few · background · names set over their own pictures` | Cells divide the full width by the count | 5 | — |
| 14 | Slim **[Free]** | `bar · none · transparent · many · none · one rule-bounded line of names` | One name, no separator, rules unchanged | 5 | — |
| 15 | Filter Bar | `nav · none · surface · many · none · the set as a chip bar with one active` | All plus one chip, drawn | 5 | `filter-strip` |

**Ctl counts controls the design owns.** The universal trio and the Data group are on top of every
one of them, and neither is counted. The largest own list is six and the smallest four, against the
PRD's ceiling of about fifteen.

### Tuple uniqueness — the honest statement

**All fifteen are distinct on the five closed slots.** Archetype carries seven values (grid-of-N ×6,
split ×2, table ×2, feed, stack, carousel, bar, nav); containment separates 12 alone; ground
separates 3, 6, 11, 14 and 15; media separates 2, 4, 9, 10 and 13; and 13 is the category's only
`few`. The four grid-of-N designs on `page` with `many` items — 1, 2, 12, 13 — are separated by
media and containment rather than by their emphasis phrases.

**What the check cannot promise.** 1 Chips and 6 Contrast Band are the same arrangement on two
grounds, which the brief names explicitly as two designs; 3 Cards and 12 Panel are a plane and a box
around comparable content; 5 and 10 share an archetype and differ on what stands in the left column.
Those are judgements, and they are stated rather than hidden behind a phrase.

### Repeating items

**Ghost owns every tag; the author may own the shortlist.** *Show* clamps the query's `limit`, so at
the three Ghost-sourced values the thirteenth tag is not fetched rather than hidden ⚑. **Order is
selectable from four values** and applies to every design at once. At **Hand-picked** the list is
both the set and the order, and both those controls disable. **Zero removes the section in all
fifteen** ⚑. **No design has a per-item control of any kind** — no per-tag colour override, no
per-tag ratio, no per-tag label. Per-design counts, thin-content behaviour and the fields each design
draws are the roster and the repeating-items table on the proof frame.

---

## The fifteen designs

### A20·1 — Chips

- **1 · Descriptor.** The whole public tag set as one wrapping row of hairline pills under a head,
  with the count inside each pill. The category default.
- **2 · Structural descriptor.** `grid-of-N · none · page · many · none · a wrapping row of pills` —
  containment `none` (the pills are the item's geometry), media `none`.
- **3 · Archetype.** grid-of-N. **No departures** — a wrapping row reflows on its own.
- **4 · Responsive.** 1440 content 1,296, head left with the link on its baseline, 36 to the pills,
  pills 15/44 on a 10 gap · 834 content 754, head row held · ≤ 767 content 350, heading 28, head
  stacks and the link moves under the intro ⚑; pills unchanged.
- **5 · Fields.** `eyebrowText` ⚑ · `headingText` ⚑ · `introText` · `linkLabel` ⚑ · `linkUrl` ⚑, all
  five inline-editable, the URL on the Link Picker and the label taking an optional icon. Read:
  `name`, `url`, `count.posts`, and `accent_color` at Tag colour: Tag's own ⚑. Not read:
  `description`, `feature_image`.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Tag size | Compact 13 · Comfortable 15 · Spacious 17 |
  | Counts | Off · Number · Posts |
  | Alignment | Left · Centre |
  | All topics link | Off · On |
  | Tag colour | Theme · Tag's own |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Six.** Quick: Tag size, Counts, Alignment, All topics link. **Cut:** pill shape, a hash
  prefix, which tags (the Data group's).
- **7 · Data.** `{{#get "tags" filter="visibility:public" include="count.posts" limit=12
  order="count.posts desc"}}`. Designed for 6–18; correct at 1–40. **0 → no section** ⚑ · **1 → one
  pill**, no hand-off · many → Show clamps the query, not the CSS. At Hand-picked the list is the set.
- **8 · Empty state.** No `introText` → heading-only head, gap held. No `linkUrl` → no link even at
  On ⚑. No `accent_color` on a tag at Tag's own → that pill falls back to Theme ⚑; **on a Ghost too
  old to expose a tag's colour, every pill falls back to Theme** ⚑ *29 August 2026*. No tags → no
  section.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical** — every pill is an `<a href>`.
- **10 · A11y.** `<section aria-labelledby>`; `<ul>` of `<li><a>` in query order; the count is inside
  the link text ("Cities, 19 posts") ⚑. Focus order head → pills → link. A6's ring. At Tag's own the
  pill's on-colour is derived, not chosen ⚑.
- **Flagged ⚑** — the default heading string · the count inside the pill · the all-topics route · the
  link moving under the intro at 390 · hiding empty tags · the derived on-colour.

**Reconciled.** Padding retired into **Vertical spacing** outside the list; **Tag colour Theme ·
Tag's own** added; **Hand-picked** joins `tagSource` and the off-route fallback is stated; the
all-topics link opens the Link Picker and takes an optional icon. Six controls of its own.

**Patched, 29 August 2026.** **Tag colour: Tag's own now states its Ghost version requirement** and
falls back to Theme on an older release — *a tag's own colour needs a recent Ghost*. **The Background
role row no longer says the section "turns into 6 Contrast Band"**: at Contrast it stays 1 Chips and
takes the on-contrast colours, and 6 is named as advice — *no design ever turns into another design*.
**Show is a number picker, 1–40**, with Ghost's 100-tag cap and its truncation stated. Nothing this
design draws changed.

---

### A20·2 — Tiles

- **1 · Descriptor.** A four-up grid of picture tiles, one per topic, name and count under the
  picture.
- **2 · Structural descriptor.** `grid-of-N · none · page · many · top · a four-up tile grid, picture
  over name` — media `top` is what separates it from 1.
- **3 · Archetype.** grid-of-N. **One departure:** two columns at ≤ 767 rather than one ⚑ — a tag
  tile has no excerpt, meta or author, so at 165 it is a picture and one word, which reads.
- **4 · Responsive.** 1440 four 306 cells, 24 gutter both ways, image 3:2, name 19, count 13 · 834
  three 235 · ≤ 767 two 165, image 110, name 17 ⚑. Per row stops applying below 834.
- **5 · Fields.** Head four, inline-editable. Read: `name`, `url`, `count.posts`, `feature_image` opt,
  `accent_color` at Tag colour ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Per row | Three · Four · Five |
  | Image ratio | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 |
  | Counts | Off · Number · Posts |
  | All topics link | Off · On |
  | Tag colour | Theme · Tag's own |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Six.** Quick: Per row, Image ratio, Counts. **Cut:** a per-tag ratio, a hover zoom, a card
  plane, **an Image focus** ⚑.
- **7 · Data.** Designed for 4, 8, 12; correct at 1–20. **0 → no section** · **1 → one cell-width
  tile, left-aligned, not stretched** ⚑ · a count that is not a multiple of the columns leaves a
  short last row, left-aligned ⚑.
- **8 · Empty state.** No `feature_image` → **A17's tag plate** at the cell ratio carrying the tag
  name at 17, hover surface, `aria-hidden` ⚑; **at Tag colour: Tag's own the plate takes the tag's
  colour as a tint** ⚑, with a derived on-colour, and falls back to the hover surface where no colour
  is set. No count → the name sits alone and the cell shortens.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.**
- **10 · A11y.** `<ul>`/`<li>`, the whole tile one `<a>`, name an `<h3>`, count in the link text.
  `<img alt="">` — **Ghost has no alt field for a tag image** ⚑. Plate `aria-hidden`. Ring at 4 px.
- **Flagged ⚑** — the plate carrying the tag name · the plate tint · two across at 390 · no image alt
  · the short last row · a single tile not stretching · no focal point and no Image focus.

**Reconciled.** Padding retired into **Vertical spacing**; **Tag colour** added and spent on the
plate tint ⚑; **Hand-picked** joins `tagSource`; the link opens the Link Picker and takes an icon.
**Image focus is not added** ⚑ — there is no authored image field in A20. Six controls of its own.

**Patched, 29 August 2026.** **Tag colour: Tag's own states its Ghost version requirement**, and on an
older release every plate falls back to the hover surface in the theme's own colours. **Show is a
number picker, 1–20**, with Ghost's 100-tag cap stated. Nothing this design draws changed.

---

### A20·3 — Cards

- **1 · Descriptor.** The tag set on one raised surface plane, each topic a hairline card with name,
  count and description.
- **2 · Structural descriptor.** `grid-of-N · none · surface · many · none · hairline cards on a
  raised plane` — ground `surface`; containment still `none`, A26·3's call held.
- **3 · Archetype.** grid-of-N. **No departures.**
- **4 · Responsive.** 1440 plane 1,296 inset 48, three 384 cards, name 22, min height 150 · 834 inset
  32, two 333 · ≤ 767 inset 24, one 302, name 20, min height released ⚑.
- **5 · Fields.** Head four, inline-editable; `linkLabel` and `linkUrl` are read at All topics link:
  On. Read: `name`, `url`, `count.posts`, `description` opt 300 ch.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Per row | Two · Three · Four |
  | Descriptions | Off · Two lines · Full |
  | Plane | Surface · Hairline |
  | Counts | Off · Number · Posts |
  | All topics link | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Six.** Quick: Per row, Descriptions, Plane. **Cut:** a card image, a card shadow, a per-card
  colour.
- **7 · Data.** Designed for 3, 6, 9; correct at 1–12. **0 → no section, plane included** ⚑ · **1 →
  one card at cell width, the plane keeping the full content width** ⚑.
- **8 · Empty state.** No `description` → name and count only; **the card keeps the row's height and
  the space falls at its foot** ⚑ (A17·4's rule). No `linkUrl` at On → no link drawn.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.**
- **10 · A11y.** `<h2>` inside the plane; `<ul>`/`<li>`; each card one `<a>` with an `<h3>`. **The
  description is inside the link** ⚑ — Two lines answers it. Ring at 3 px, inside the plane.
- **Flagged ⚑** — the plane as ground · divisions computed inside the plane · the 150 minimum · Two
  lines clamping · the plane never going full-bleed · the link defaulting Off.

**Reconciled.** Padding retired into **Vertical spacing**; **All topics link Off · On** added ⚑ — the
spec had cut it, and cutting it stranded the `linkLabel` and `linkUrl` a user typed in a neighbouring
design; **Off is the default**, so nothing drawn changes. Background role is the ground behind the
plane, and *Plane* still governs the plane. **Hand-picked** joins `tagSource`. Six controls of its
own.

---

### A20·4 — Rows

- **1 · Descriptor.** A ruled feed of full-width rows: square thumbnail, name, description,
  right-aligned count.
- **2 · Structural descriptor.** `feed · none · page · many · left · ruled rows with a square
  thumbnail`.
- **3 · Archetype.** feed. **One departure at ≤ 767:** the count leaves the right edge and stacks
  under the description ⚑.
- **4 · Responsive.** 1440 rows 1,296, thumb 64, name 19, description one line, count right · 834
  rows 754, thumb 56 · ≤ 767 rows 350, thumb 48, count under the description ⚑.
- **5 · Fields.** Head four, inline-editable. Read: `name`, `url`, `count.posts`, `description`
  opt, `feature_image` opt — **the only design in A20 that reads both optional Ghost fields** ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Thumbnails | Off · On |
  | Descriptions | Off · On |
  | Density | Compact 10 · Comfortable 18 · Spacious 26 |
  | Counts | Off · Number · Posts |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Five.** Quick: Thumbnails, Descriptions, Density. **Cut:** a per-row sort, a divider style, an
  alignment, a thumbnail shape, **the chevron** ⚑, an Image focus.
- **7 · Data.** Designed for 4–10; correct at 1–20. **0 → no section** · **1 → one row between two
  hairlines**, no hand-off ⚑. Beyond 20 the panel suggests 7 Index.
- **8 · Empty state.** No `description` → name and count only, name centred against the thumb, **no
  padding inserted** ⚑. No `feature_image` → the tag plate at 64 square **carrying A1's initial at
  19** ⚑. Thumbnails Off → the name starts at the margin.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.**
- **10 · A11y.** `<ul>`/`<li>`, each row one `<a>` containing `<h3>`, description, count in DOM
  order. Ring inset 2 px. **The `aria-hidden` chevron is gone with the ornament** ⚑.
- **Flagged ⚑** — the hover bleed · the count stacking at 390 · tabular figures as an unstated pack
  requirement · Density as the row ladder.

**Reconciled.** **The decorative chevron is removed at every width** ⚑ — no control governed it, it
dropped at 390 anyway, and it is the same ornament class the owner killed in A1's Side Rail; the
count now ends the row and the accessibility line loses a clause. Padding retired into **Vertical
spacing**; **Density keeps its name** as the row's own ladder. **Hand-picked** joins `tagSource`; the
link opens the Link Picker and takes an icon. Five controls of its own.

---

### A20·5 — Split Head

- **1 · Descriptor.** Head in a fixed left column, the tag set as ruled name-and-count lists in two
  columns beside it.
- **2 · Structural descriptor.** `split · none · page · many · none · the head standing in a left
  column` — 10 is the other split and differs on media.
- **3 · Archetype.** split. **One departure:** it collapses at the **1,200 margin threshold** rather
  than at 834 ⚑ (A25's).
- **4 · Responsive.** 1440 head 320, gutter 48, two 444 columns on a 40 inner gutter, lines 17/44 ·
  < 1200 head above at full width, intro clamped 620 · 834 two 357 · ≤ 767 one 350.
- **5 · Fields.** Head four, inline-editable; `introText` is effectively required ⚑. Read: `name`,
  `url`, `count.posts`.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Head width | Narrow 264 · Standard 320 · Wide 384 |
  | List columns | One · Two · Three |
  | Counts | Off · Number · Posts |
  | All topics link | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Four.** Quick: Head width, List columns, Counts. **Cut:** a Heading control ⚑, a divider
  style, a head alignment, descriptions, **a second ground for the head column** ⚑.
- **7 · Data.** Designed for 8–18; correct at 1–30. **0 → no section** · **1–3 → one column, the
  second not drawn and not widened** ⚑ · the list fills column one first, down then across ⚑.
- **8 · Empty state.** No `introText` → the head column carries the heading and link only and keeps
  its width.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical** — a `grid-column` move, A8·6's.
- **10 · A11y.** **One `<ul>` spanning both drawn columns** ⚑ — "list, 12 items" once. Down-then-
  across matches DOM order. `<h2>` in the head column, `<h3>` per topic. Ring inset 2 px.
- **Flagged ⚑** — the 1,200 threshold · the second column not widening · no Heading control · the
  link under the introduction · `introText` effectively required · uncombined control interactions.

**Reconciled.** Padding retired into **Vertical spacing**, which leaves **four controls of its own** —
the smallest list in A20 by content, not by trimming. **Hand-picked** joins `tagSource`; the link
opens the Link Picker and takes an icon; the introduction, still effectively required, edits inline.

---

### A20·6 — Contrast Band

- **1 · Descriptor.** The wrapping pill row and its head on an inverted full-bleed band.
- **2 · Structural descriptor.** `grid-of-N · none · contrast · many · none · an inverted band of
  pills` — identical to 1 on four slots and different on `ground`, which the brief names as the case
  that earns a second design.
- **3 · Archetype.** grid-of-N. **No departures** — a band has no columns to lose.
- **4 · Responsive.** 1440 band full-bleed, band padding 80, content 1,296 · 834 band padding 64 ·
  ≤ 767 band padding 56, head stacks, link under the heading ⚑, bleed kept.
- **5 · Fields.** Head four, inline-editable, all in `onContrast`; `linkLabel`/`linkUrl` effectively
  required ⚑. Read: `name`, `url`, `count.posts`, `accent_color` at Tag colour ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Tag size | Compact 13 · Comfortable 15 · Spacious 17 |
  | Counts | Off · Number · Posts |
  | Band edges | Full bleed · Inset |
  | All topics link | Off · On |
  | Tag colour | Theme · Tag's own |
  | Background role (universal) | **Contrast (locked)** — the inverted band is the design; the panel names 1 Chips as the design to place for a plain pill row |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade (drawn **above** the band, never inside it) |

  **Six.** Quick: Tag size, Counts, Band edges. **Cut:** a band colour ⚑, an accent on the band,
  an alignment.
- **7 · Data.** Designed for 8–18; correct at 1–40. **0 → the band goes with the section** ⚑ ·
  **1 → a full-height band carrying one pill** ⚑, which the panel calls out.
- **8 · Empty state.** No `introText` → heading-only, band height unchanged. No `linkUrl` → the link
  is not drawn, **and now there is also a switch for it** ⚑. No `accent_color` at Tag's own → that
  pill falls back to Theme.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.**
- **10 · A11y.** **The band is a colour, not a landmark** ⚑. `onContrast` on `contrast` is 12.6:1 in
  Paper light and the muted count 4.6:1 ⚑; **contrast is checked against `contrast`, not
  `background`** — and **Tag colour: Tag's own is checked the same way** ⚑, with its on-colour derived
  against the tag's fill. Focus ring is `onContrast`, never accent ⚑; hover inverts the pill's fill.
- **Flagged ⚑** — fixed band padding as its own name · the locked ground · the underlined link instead
  of accent · the inverted hover · the `onContrast` ring · the dark band being light · tag colour on a
  contrast ground.

**Reconciled.** **All topics link Off · On** added ⚑ — the link was always drawn here with no
control, which is a piece of the section a user cannot turn off; **On is the default**, so the band
is unchanged. **Tag colour** added, checked against `contrast` ⚑. Padding retired into **Vertical
spacing**; **Background role is locked at Contrast** with the reason shown; **the band's fixed
80 · 64 · 56 keeps its own name**; Top divider draws above the band, never inside it. Six controls of
its own.

**Patched, 29 August 2026.** **The lock reason is rewritten**: it read "at Background it is 1 Chips".
The inverted band **is** the design, so Background has nothing to invert, and 1 Chips is named as the
design to place instead — *no design ever turns into another design*. **Tag colour: Tag's own states
its Ghost version requirement.** **Show is a number picker, 1–40.** Nothing this design draws changed.

---

### A20·7 — Index

- **1 · Descriptor.** The whole public tag set alphabetically in balanced columns, grouped under
  letter heads.
- **2 · Structural descriptor.** `table · none · page · many · none · an alphabetical index in
  balanced columns` — `many` is a requirement here rather than a description.
- **3 · Archetype.** table. **One departure:** two columns at ≤ 767 rather than one ⚑ — an index is
  scanned rather than read.
- **4 · Responsive.** 1440 four columns of 306, letter eyebrow over a hairline, lines 15/30, count
  13 · 834 three of 235 · ≤ 767 two of 165, **type unchanged** ⚑.
- **5 · Fields.** Eyebrow, heading and intro, inline-editable. **The letter heads are derived from the
  names and are not authored strings** ⚑. **No all-topics link.** Read: `name`, `url`, `count.posts`.
  **No optional Ghost field is read**, which is why it is correct at forty tags.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Columns | Three · Four · Five |
  | Group by | Initial · Nothing |
  | Counts | Off · Number · Posts |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Four.** Quick: Columns, Group by, Counts. **Cut:** sortable columns, a letter jump-bar, an
  all-topics link. **At Group by: Initial the design declares `group-headings`** ⚑ *29 August
  2026*, and the row says so; at Nothing no module is declared.
- **7 · Data.** `order="name asc"` with `limit` from the Data group's *Show*, **a number picker whose
  ceiling here is 100** ⚑ *29 August 2026* — `limit="all"` trips Ghost's own warning and silently
  returns 100 anyway, so the panel states the cap and the truncation rather than promising every tag.
  **Order is forced to A–Z and disabled at every source, Hand-picked included** ⚑ — the only override
  in the category. Designed for 12–60; correct at 1–100. **0 → no section** · **1 → one letter, one name, three empty columns** ⚑ · **tags with 0
  posts draw muted at Show** ⚑.
- **8 · Empty state.** A letter with no tags is not drawn — there is no empty-letter slot ⚑.
- **9 · Module.** **`group-headings`** ⚑ *29 August 2026, from the registry* — **at Group by: Initial
  only**; at Nothing none is declared and `core` is assumed. Ghost's templates cannot tell that the
  first letter changed between two tags — no arithmetic, and no access to the previous item inside a
  loop — so the letter heads are cut in by the browser from each name's first character. **Edit-safe:
  yes.** **No-JS: the index renders flat and ungrouped** — every name present, alphabetical, in the
  same CSS multi-column layout, **no letter heads, no hairlines above them and no gap where a group
  would have been**. The counts and the links are untouched, so the flat state is a complete index
  rather than a degraded one.
- **10 · A11y.** **One `<ul>` per letter group, each preceded by an `<h3>` carrying the letter** ⚑
  once the module has run; **server-side, without it, one `<ul>` of every name in alphabetical order**
  ⚑ *29 August 2026* — correct in both states, with the letters as the only difference. CSS columns
  preserve DOM order. Counts read "19 posts" even when drawn as a bare number ⚑.
- **Flagged ⚑** — the forced A–Z, now including Hand-picked · **the grouping needing a script and its
  flat no-JavaScript state** ⚑ · **the 100-tag cap and its silent truncation** ⚑ · muted empty tags ·
  two columns at 390 · type not shrinking · the letter as an `<h3>` · the bleeding hover fill · no
  empty-letter slot.

**Reconciled.** Padding retired into **Vertical spacing** — **four controls of its own**.
**Hand-picked** joins `tagSource`, and **Order remains forced to A–Z** there too ⚑: an index that is
not alphabetical is not an index. Empty tags at Show still draw muted.

**Patched, 29 August 2026.** **Group by: Initial declares `group-headings`** and renders flat and
ungrouped without JavaScript — *grouping needs a small script*. **Show is a number picker, 1–100**,
with Ghost's cap and its silent truncation stated in the panel — *item counts are a number picker*.
The frame gained the flat no-JavaScript state; nothing else it draws changed.

---

### A20·8 — Big Type

- **1 · Descriptor.** Tag names set at display size, one per ruled line, with a small count at the
  line's end.
- **2 · Structural descriptor.** `stack · none · page · many · none · tag names set at display size`
  — the only `stack` in A20; nothing collapses, only a type ladder steps.
- **3 · Archetype.** stack. **No departures.**
- **4 · Responsive.** 1440 names 56, rows 18 padded, count 15, closing rule · 834 names 40 · ≤ 767
  names 30, count 13, **the all-topics link dropped** ⚑.
- **5 · Fields.** `eyebrowText` ⚑ and `linkLabel`/`linkUrl`, inline-editable, the URL on the Link
  Picker and the label taking an optional icon. **No `headingText` and no `introText`** ⚑ — both are
  kept, unread, for the design the user switches to next. Read: `name`, `url`, `count.posts`.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Type size | Compact 44 · Comfortable 56 · Spacious 72 |
  | Label | Off · On |
  | Counts | Off · Number · Posts |
  | Rules | Off · On |
  | All topics link | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Five.** Quick: Type size, Counts, Rules. **Cut:** alignment, a heading, a per-line size, an
  auto-fit ⚑.
- **7 · Data.** Designed for 4–10; correct at 1–14. **0 → no section** · **1 → one ruled line at full
  display size** ⚑ · above 10 the section is taller than a screen and the panel suggests 7 ⚑.
- **8 · Empty state.** **A tag name is never absent in Ghost, so this design has no missing-field
  case** ⚑. Counts Off removes the right-hand column rather than leaving a gap. **No `linkUrl` → no
  link even at On** ⚑ — and **the switch now exists** ⚑ *29 August 2026*.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.** `typewriter` considered and
  refused ⚑ — a list of seven typed names is six waits.
- **10 · A11y.** `<ul>`/`<li>`, each line one `<a>` with an `<h3>`. **At Label On the 13 px eyebrow
  is the section's `<h2>`** ⚑; at Off the section takes the catalogue string `aria-label="Topics"`.
  Hover underlines the name only.
- **Flagged ⚑** — no heading field · the link dropping at 390 · **the link's new switch, On by default** ⚑ *29 August 2026* · named
  sizes with no auto-fit · the eyebrow acting as the `<h2>` · Rules Off changing the gap.

**Reconciled.** Padding retired into **Vertical spacing**. **Hand-picked** joins `tagSource`; the link
opens the Link Picker and takes an icon.

**Patched, 29 August 2026.** **All topics link Off · On added, On by default** — the owner closed the
reconciliation pass's open question, so this design owns **five controls** and nothing drawn changes.
**Show is a number picker, 1–14**, with Ghost's 100-tag cap stated, and **the hand-picked ✕ never greys
out**.

---

### A20·9 — Rail

- **1 · Descriptor.** The tag set as picture tiles on a horizontal scroll-snap track that bleeds off
  the right page edge.
- **2 · Structural descriptor.** `carousel · none · page · many · top · a scroll-snap strip of picture
  tiles` — the same cell as 2 Tiles on a track, which is the archetype slot's job to say.
- **3 · Archetype.** carousel. **No departures** — the track is horizontal at every width.
- **4 · Responsive.** 1440 track starts on the 72 margin, **unpadded right** ⚑, 306 cells on a 24
  gutter, arrows top-right, dots below · 834 306 cells, arrows held · ≤ 767 264 cells, **arrows
  dropped** ⚑, dots held.
- **5 · Fields.** Eyebrow, heading and intro, inline-editable. **The arrows' labels are theme
  translation-catalog strings** ⚑, not authored fields. Read: `name`, `url`, `count.posts`,
  `feature_image` opt, `accent_color` at Tag colour ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Cell width | Compact 240 · Comfortable 306 · Spacious 416 |
  | Image ratio | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 |
  | Controls | Arrows · Dots · Both |
  | Tag colour | Theme · Tag's own |
  | Counts | Off · Number · Posts |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Six.** Quick: Cell width, Image ratio, Controls. **Cut:** autoplay ⚑, loop, an interval, a
  peek amount, an Image focus ⚑.
- **7 · Data.** Designed for 6–14; correct at 1–20. **0 → no section** · **1 → one tile, no arrows,
  no dots** ⚑ · **when the fetched set fits the track, arrows disable and dots are not drawn** ⚑ —
  the design does not become a grid. At Hand-picked **picked order is track order**, which is the one
  place in A20 where a curated left-to-right order is worth having.
- **8 · Empty state.** No `feature_image` → A17's tag plate at the cell ratio ⚑, tinted at Tag's own.
- **9 · Module.** **`carousel`**, from the registry. **Edit-safe: no** — handlers are inert while
  editing and the resting state is the designed frame ⚑. **No-JS, quoted:** "The slide track is a
  native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots and arrow buttons
  are hidden."
- **10 · A11y.** `<ul>`/`<li>` in query order; the track is a focusable scroll container with
  `tabindex="0"` ⚑; tabbing to a tile scrolls it into view. Arrows are `<button>`s with `aria-label`
  "Previous topics" / "Next topics" — **catalogue strings** ⚑ — and take `disabled` at the ends ⚑.
  Dots `aria-hidden`.
- **Flagged ⚑** — the unpadded right edge · disabled rather than hidden arrows · arrows dropping at
  390 · dots as indicator only · the focusable track · the fits-the-track state · no autoplay · **the new Counts row** ⚑ *29 August 2026*.

**Reconciled.** Padding retired into **Vertical spacing**; **Tag colour** added and spent on the
plate ⚑; **Hand-picked** joins `tagSource`; the arrow labels become **translation-catalog strings**
⚑. Five controls of its own. **The panel still shows no Counts row** while the shared field list says
this design reads `count.posts` ⚑ — recorded in the Reconciliation notes, not resolved quietly.

**Patched, 29 August 2026.** **Counts Off · Number · Posts added at Number** — the owner closed the
reconciliation pass's open question, so the panel and the shared field list agree and this design owns
**six controls**. **Tag colour: Tag's own states its Ghost version requirement** and greys out on an
older Ghost. **Show is a number picker, 1–20.** Nothing this design draws changed.

---

### A20·10 — Lead and Rest

- **1 · Descriptor.** The first topic drawn at picture size beside the remaining topics as ruled
  name-and-count lines.
- **2 · Structural descriptor.** `split · none · page · many · left · one topic at picture size, the
  rest listed` — media `left` separates it from 5.
- **3 · Archetype.** split. **One departure:** it collapses at the 1,200 margin threshold ⚑.
- **4 · Responsive.** 1440 two 624 columns on a **48 gutter** ⚑, lead picture 3:2, name 34,
  description 17 clamped 480; lines 19/44 · < 1200 lead above at full width · 834 picture 754 × 471,
  name 30 · ≤ 767 picture 350 × 219, name 26.
- **5 · Fields.** Head four plus `leadLabel` opt 24 ch, all inline-editable. **`leadLabel`'s default
  is derived from `tagOrder`** ⚑ — "Most published" at Most posts first, "First alphabetically" at
  A–Z, "Featured" at Ghost's order, **and blank at Fewest first and at Hand-picked**, where no honest
  phrase exists. Read: `name`, `url`, `count.posts`; lead only: `description` opt, `feature_image` opt.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Lead side | Left · Right |
  | Lead ratio | Landscape · Square · Portrait (**Wide disabled with its reason shown**) |
  | Lead label | Off · On |
  | Counts | Off · Number · Posts |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Five.** Quick: Lead side, Lead ratio, Lead label. **Cut:** a second lead, a lead excerpt
  length, an Image focus ⚑, **a featured-tag control** — which Hand-picked now answers as a source
  ⚑.
- **7 · Data.** **The lead is the first item of the ordered set** ⚑, and **at Hand-picked that is the
  first reference**, which the panel says under the list. Designed for 5–10; correct at 1–14. **0 →
  no section** · **1 → the lead alone keeping its 624 column, picture not widened** ⚑ · 2 → a lead
  and one ruled line.
- **8 · Empty state.** Lead with no picture → the tag plate at full lead size, name at 22 ⚑. Lead
  with no description → the count moves up under the name, nothing padded ⚑. **Lead label On at an
  order with no honest phrase → the label is blank and its row is not drawn** ⚑.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical** — a `grid-column` move and
  `:first-child`.
- **10 · A11y.** **One `<ul>` with the lead as its first `<li>`** ⚑ — one list of seven. The lead
  label is inside the lead's link before its name: "Most published, Reporting, 42 posts" ⚑. Lead side
  never changes DOM order.
- **Flagged ⚑** — the 48 gutter · the derived lead-label default · Wide disabled · the plate at lead
  size · the count moving up · the 1,200 threshold · Lead side inert at one column.

**Reconciled.** **`leadLabel`'s lying default is fixed** ⚑ — it now derives from `tagOrder` and is
blank where no phrase is honest; it was a fixed "Most published" that was wrong at three of the four
orders. **Hand-picked** joins `tagSource` and **its first reference leads** — the featured-tag picker
this design refused, arriving as a source rather than as a control. Padding retired into **Vertical
spacing**. Five controls of its own.

---

### A20·11 — Ledger

- **1 · Descriptor.** The tag set as an aligned three-column table — name, description, count — on a
  raised plane.
- **2 · Structural descriptor.** `table · none · surface · many · none · counts aligned in a
  right-hand column` — ground separates it from 7; archetype, ground and media separate it from 4.
- **3 · Archetype.** table. **One departure at ≤ 767:** the columns are abandoned and each row
  becomes a two-line block ⚑.
- **4 · Responsive.** 1440 plane inset 40, columns 300 · flex · 64, rows 15 padded on a 44 minimum ·
  834 inset 28, name column 200 · ≤ 767 inset 20, no columns, name 17 and count on line one,
  description on line two, **column head dropped** ⚑.
- **5 · Fields.** Head four plus `colTopic`, `colCovers`, `colPosts` ⚑ (defaults "Topic", "What it
  covers", "Posts"), **all seven inline-editable — the three column labels in place at the head of
  their column** ⚑. Read: `name`, `url`, `count.posts`, `description` opt.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Column head | Off · On |
  | Descriptions | Off · One line · Full |
  | Density | Compact 10 · Comfortable 15 · Spacious 22 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Four.** Quick: Column head, Descriptions, Density. **Cut:** sortable columns ⚑, a fourth
  column, zebra striping, column widths, an all-topics link.
- **7 · Data.** Designed for 5–20; correct at 1–40. **0 → no section, plane included** · **1 → a
  one-row table that keeps its column head** ⚑.
- **8 · Empty state.** No `description` → an empty middle column, **the row keeps its 44 px
  minimum** ⚑. All descriptions absent → the panel suggests Descriptions Off, which moves the count
  left to meet the name ⚑.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical** — a CSS grid, not a `<table>`.
- **10 · A11y.** **Not a `<table>`:** a `<ul>` of `<li>` where each row is one `<a>` ⚑. The column
  head is a visually-aligned row marked `aria-hidden` ⚑ — **so editing a column label changes what is
  seen and not what is announced**; its information repeats inside each link, from Ghost.
  **Tabular figures are required and are a pack property A20 cannot set** ⚑.
- **Flagged ⚑** — the three column-head strings and their inline editing · the head above the plane ·
  Descriptions Off moving the count · no sorting · dropping the columns at 390 · not being a
  `<table>` · tabular figures.

**Reconciled.** Padding retired into **Vertical spacing**; **Density keeps its name** as the row
ladder. **`colTopic`, `colCovers` and `colPosts` edit inline** ⚑ with the P0·1 toolbar — they were
authored strings with no stated editor. **Hand-picked** joins `tagSource`. Four controls of its own;
sorting is still refused.

---

### A20·12 — Panel

- **1 · Descriptor.** Head and the whole tag set inside one hairline box, topics as ruled lines in
  columns.
- **2 · Structural descriptor.** `grid-of-N · box · page · many · none · the whole set in one
  hairline box` — **the only `box` containment in A20**.
- **3 · Archetype.** grid-of-N. **No departures** — three → two → one inside the box.
- **4 · Responsive.** 1440 box 1,296 inset 40, head over a rule, three 391 columns on a 32 gutter,
  lines 17/44 · 834 inset 32, two 313 · ≤ 767 inset 24, one 300, head stacked, rule kept.
- **5 · Fields.** Head four, inline-editable, all inside the box. Read: `name`, `url`, `count.posts`.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Box inset | Compact 28 · Comfortable 40 · Spacious 56 |
  | Columns | Two · Three · Four |
  | Counts | Off · Number · Posts |
  | All topics link | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Four.** Quick: Box inset, Columns, Counts. **Cut:** a box fill ⚑, a box shadow ⚑, a border
  weight, a corner radius, and **the hand-off itself** ⚑ *29 August 2026* — deleted, not turned
  into a control.
- **7 · Data.** Designed for 8–24; **correct at 1–40** ⚑ *29 August 2026*. **0 → no section** ·
  **1–3 → the box is drawn with the one column the set fills**, head, link, hairline and spacing
  unchanged, and **the panel advises that 1 Chips reads better at that count** ⚑ — at Hand-picked too ·
  **a part-filled last column is left empty, never balanced** ⚑.
- **8 · Empty state.** Head strings absent → the rule sits at the top of the box. Fewer than four
  tags, or fewer than four references → **the box keeps its hairline, head and link and draws one
  column**. The editor advises: "Three topics here — 1 Chips reads better at this count." —
  **product UI, not a theme string** ⚑, and **advice rather than a switch** ⚑ *29 August 2026*.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.** **Nothing in this design is
  conditional on the returned count any more** ⚑ *29 August 2026* — the deleted hand-off was its one
  server-side branch; what is left is a column count the stylesheet resolves.
- **10 · A11y.** One `<ul>` spanning all drawn columns, down then across ⚑. `<h2>` inside the box,
  `<h3>` per topic. **The box is not a landmark and takes no role** ⚑. Ring inset 2 px.
- **Flagged ⚑** — **the deleted hand-off and the advisory that replaced it** ⚑ *29 August 2026* · no
  fill or shadow · columns never balanced · the part-filled column · the box hairline's 1.4:1 in dark ·
  the box taking no role.

**Reconciled.** Padding retired into **Vertical spacing**; **Box inset keeps its name** as the box's
own ladder. **Hand-picked** joins `tagSource`. Four controls of its own.

**Patched, 29 August 2026.** **The hand-off to 1 Chips is deleted** — *no design ever turns into
another design*. Below four topics the box hides the columns it cannot fill and the panel advises;
the advisory is product UI and is not a control. **Show is a number picker, 1–40.** The states frame
lost its hand-off panel and gained a three-topics-in-the-box panel.

---

### A20·13 — Overlay

- **1 · Descriptor.** A few topics as full-picture tiles with the name and count set over a warm
  scrim.
- **2 · Structural descriptor.** `grid-of-N · none · page · few · background · names set over their
  own pictures` — media `background` and count `few`, both unique in A20.
- **3 · Archetype.** grid-of-N. **One departure:** the cells divide the full width by the returned
  count rather than by a column setting ⚑ — two tags make two 636 cells.
- **4 · Responsive.** 1440 three 416 × 340 cells, name 26 · 834 two 365 × 300 · ≤ 767 one 350 × 220,
  name 24 ⚑ — **shorter, not just narrower**.
- **5 · Fields.** Eyebrow, heading and intro, inline-editable. **No all-topics link.** Read: `name`,
  `url`, `count.posts`, `feature_image` opt.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Heading | Label · Heading · Heading and intro · None |
  | Tile height | Compact 260 · Comfortable 340 · Spacious 440 |
  | Name size | Compact 22 · Comfortable 26 · Spacious 32 |
  | Counts | Off · Number · Posts |
  | Scrim | Light · Medium · Strong |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 |
  | Top divider (universal) | None · Line · Fade |

  **Five.** Quick: Tile height, Name size, Scrim. **Cut:** a ratio ⚑, a focal point and an Image
  focus ⚑, a per-tile height, a hover zoom.
- **7 · Data.** **Show is expected at Four or fewer** ⚑. Designed for 2–4; correct at 1–6. **0 → no
  section** · **1 → one tile at the full 1,296 width** ⚑ · **5 → three and two, the second row at
  636** ⚑. Hand-picked is the closest this design has to choosing which two or three it shows.
- **8 · Empty state.** No `feature_image` → the tile draws on the hover surface with **no scrim** and
  the name in the pack's text colour ⚑ — not A17's plate, which would carry the name twice. **Scrim
  is inert on that tile and its control shows why** ⚑.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.**
- **10 · A11y.** `<ul>`/`<li>`, each tile one `<a>` with an `<h3>`; picture as a CSS background with
  `alt=""` ⚑. **White over the scrim's lower third is 4.9:1 at Medium against the darkest picture
  tested and cannot be guaranteed against every image** ⚑ — finding 5 stands. **Light is disabled
  when the picture's bottom third is light, with the measured ratio shown** ⚑; Strong is the answer
  for a bright picture. Ring outside the picture at 4 px.
- **Flagged ⚑** — a fixed height rather than a ratio · cells dividing by count · the scrim's three
  strengths and the disabled Light · the no-picture tile losing its scrim · the dark scrim re-tune ·
  unguaranteeable contrast · no alt and no Image focus.

**Reconciled.** **Scrim Light · Medium · Strong** added ⚑ — the spec had cut it, A21 and A22 both
have it, and it is this design's only mitigation for its own contrast finding; **Medium is the
default and every frame draws it**, and **Light disables against a pale bottom third** with the ratio
shown. Padding retired into **Vertical spacing**; Background role stays free, because the ground here
is what the tiles sit on and not what they are. **Hand-picked** joins `tagSource`. Five controls of
its own.

---

### A20·14 — Slim

- **1 · Descriptor.** One ruled line carrying a label, the topic names separated by a middot, and the
  all-topics link.
- **2 · Structural descriptor.** `bar · none · transparent · many · none · one rule-bounded line of
  names` — **the only `transparent` ground in A20**, and now a locked one.
- **3 · Archetype.** bar. **One departure at ≤ 767:** the bar becomes a three-part stack rather than
  scrolling horizontally ⚑.
- **4 · Responsive.** 1440 one 56 px row between hairlines, names 15 with border-coloured separators,
  link at the end · 834 the same, wrapping to two lines at nine names · ≤ 767 label above, names
  wrapping, link under ⚑, rules held.
- **5 · Fields.** `eyebrowText` opt, default "Topics" ⚑, and `linkLabel`/`linkUrl`, all
  inline-editable, the URL on the Link Picker and the label taking an optional icon. **Reads neither
  `headingText` nor `introText`** ⚑. Read: `name`, `url`, **and `count.posts` at Counts Number** ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Label | Off · On |
  | Rules | Above and below · Above only · Below only · None |
  | All topics link | Off · On |
  | Counts | Off · Number |
  | Separator | Middot · Slash · Icon |
  | Background role (universal) | **Background (locked)** — the category's only `transparent` ground; the panel names 15 Filter Bar as the design to place for a bar on a surface |
  | Vertical spacing (universal) | Compact 40 · Comfortable 64 · Spacious 96 |
  | Top divider (universal) | **Disabled** where Rules already draws that hairline |

  **Five.** Quick: Label, Separator, All topics link. **Cut:** tag size, alignment, a clamp ⚑,
  Counts: Posts (a spelled-out count on a one-line bar is the reason this design exists) ⚑.
- **7 · Data.** `{{#get "tags" filter="visibility:public" limit=9}}`, **plus
  `include="count.posts"` at Counts Number** ⚑. Designed for 6–10; correct at 1–20. **0 → no section,
  rules included** · **1 → one name, no separator** ⚑ · **many → the line wraps and is not clamped**
  ⚑.
- **8 · Empty state.** No label → names start at the margin. No link → names run to the right edge.
  Both off → an unlabelled line of names between two rules. **No icon chosen at Separator: Icon → the
  middot, not a gap** ⚑.
- **9 · Module.** **None; `core` assumed. No-JS: pixel-identical.** **`marquee` considered and
  refused** ⚑ — its no-JS state is this design already.
- **10 · A11y.** `<ul>` of inline `<li>`; **the separators are CSS `::before` content and never in the
  DOM** ⚑, at all three values. **The 44 px target is the full row height** ⚑. At Label Off,
  the catalogue string `aria-label="Topics"`. At Counts Number the figure is inside the link and reads
  "19 posts" ⚑.
- **Flagged ⚑** — the locked ground · its shorter spacing ladder · the default label · the
  border-coloured separator at all three values · wrapping without a clamp · the stack at 390 · the
  icon separator's smallest size · `marquee` refused.

**Reconciled.** **Counts Off · Number** added ⚑ — this was the one design in A20 with no count at
all, and the `include="count.posts"` query shape was already paid for by the other fourteen; **Off is
the default**, so the drawn line is unchanged. **Separator Middot · Slash · Icon** added ⚑, with the
icon from the P0·2 slot — the separator control the owner asked for on A2's Ticker, in the design that
needs it. Padding retired into **Vertical spacing**, carrying this design's **40 · 64 · 96** ladder;
**Background role locked at Background**; **Top divider disabled where Rules already draws that
hairline** ⚑. **Hand-picked** joins `tagSource`. Five controls of its own — and `count.posts` now
reaches all fifteen designs, so "the only design that does not read it" is retired ⚑.

**Patched, 29 August 2026.** **The lock reason is rewritten**: it read "on a surface it is 15's chip
bar". The two rules **are** the design, and **15 Filter Bar is named as the design to place** for a bar
on a surface — *no design ever turns into another design*. **Show is a number picker, 1–20.** Nothing
this design draws changed.

---

### A20·15 — Filter Bar

- **1 · Descriptor.** The tag set as a chip bar on a raised surface, the current archive filled in
  accent, with an All chip at its head.
- **2 · Structural descriptor.** `nav · none · surface · many · none · the set as a chip bar with one
  active` — the only `nav` in A20.
- **3 · Archetype.** nav. **One departure at ≤ 767:** the bar scrolls horizontally rather than
  wrapping ⚑.
- **4 · Responsive.** 1440 bar 1,296 inset 14, label, chips 38-in-44 on an 8 gap, wrapping · 834 chips
  wrap to two rows · ≤ 767 one scrolling row ⚑, **label dropped** ⚑, active chip scrolled into view.
- **5 · Fields.** `eyebrowText` opt, default "Filter" ⚑, and `allChipLabel` opt 16 ch, default "All"
  ⚑, **both inline-editable**. **No heading, no intro, no all-topics link** ⚑. Read: `name`, `url`,
  `count.posts`, `accent_color` at Tag colour ⚑; from the route, the current tag slug ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Label | Off · On |
  | All chip | Off · On |
  | Counts | Off · Number |
  | Bar | Surface · Hairline |
  | Tag colour | Theme · Tag's own |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 40 · Comfortable 64 · Spacious 96 |
  | Top divider (universal) | None · Line · Fade |

  **Five.** Quick: Label, All chip, Counts. **Cut:** sticky ⚑, a chip shape, a multi-select, a
  clear-filter control, **an accent for the active chip** — the accent is the active mark and is
  not a choice ⚑.
- **7 · Data.** Same query plus `{{#match}}` on the current route ⚑. Designed for 5–12; correct at
  1–20. **0 → no section** · **1 → All plus one chip, drawn** ⚑ · many → the bar scrolls; nothing is
  clamped or hidden behind a "more". At Hand-picked the shortlist is the bar and **the active mark
  still comes from the route** ⚑.
- **8 · Empty state.** No current tag archive → **All is the active chip** ⚑. At All chip Off on a
  home page, no chip is active. A zero-post tag is excluded by the Data group's default, **so a chip
  never leads to an empty archive** ⚑. At Tag's own, **the active chip keeps the accent** ⚑ and the
  rest take their own colour.
- **9 · Module.** **`filter-strip`**, from the registry. **Edit-safe: yes.** **No-JS, quoted:**
  "Filters are `<a href>` links to Ghost routes and **work perfectly** — this module needs JS least
  of all." **The active mark is server-rendered** ⚑; only the scroll-into-view is lost.
- **10 · A11y.** `<nav aria-label="Topics">` — a catalogue string — with a `<ul>` of `<a>`; **the
  active chip carries `aria-current="page"`** ⚑ and is a link, not a button. The scrolling row at 390
  is a focusable container ⚑. **`onAccent` on `accent` is 3.4:1 in Paper light**, which clears AA only
  as large text — hence **15 px at 600** ⚑, with the ratio shown in the panel; **at Tag's own the
  chip's on-colour is derived per tag** ⚑ and the same 15/600 floor applies.
- **Flagged ⚑** — its shorter spacing ladder · the two default strings · no heading · the
  route-driven active state · counts never on the active chip · tag colour never taking the active
  chip · sticky cut as a finding · the 390 scroll · the 3.4:1 ratio and its mitigation.

**Reconciled.** Padding retired into **Vertical spacing**, carrying the **40 · 64 · 96** ladder;
Background role is the ground behind the bar and *Bar* still governs the bar. **Tag colour** added,
with **the active chip keeping the accent** ⚑ — a route's own colour and the current-page mark cannot
both be the fill. **Hand-picked** joins `tagSource`; the label and `allChipLabel` edit inline. Five
controls of its own; **the sticky remains a registry gap** ⚑.

**Patched, 29 August 2026.** **Tag colour: Tag's own states its Ghost version requirement**; on an
older Ghost every chip is Theme and the active chip keeps the accent, which is what it does anyway.
**Show is a number picker, 1–20.** Nothing this design draws changed.

---

## Component inventory

Cumulative: what A20 established, and what it reused verbatim.

| Component | What it is | First from |
|---|---|---|
| **Tag pill, counted** | A26·1's hairline pill carrying the tag name and its post count in muted; 13/15/17 in a 32-in-44 or 44 px box; optionally filled with the tag's own colour | **A20·1** |
| **Tag tile** | Picture at a named ratio, name 19 in the heading font, count 13 under it; the whole tile one link | **A20·2** |
| **Tag plate** | A17's missing-image substitute, re-pointed to carry *the tag's own name* centred on the hover surface and clamped to three lines; below 96 px, A1's initial instead; tinted at Tag colour: Tag's own; `aria-hidden` | A17, re-pointed in **A20·2** |
| **Tag row** | Square thumbnail, name, description and right-aligned count on a 44 px minimum — **no chevron after this pass** | **A20·4** |
| **Ruled name line** | Name left, count right, hairline under, 44 px minimum — the list unit in 5, 10 and 12 | **A20·5** |
| **Letter head** | 13 px tracked initial over a hairline, opening an alphabetical group | **A20·7** |
| **Overlay tile** | Picture at a fixed height under a warm scrim at one of three strengths, name and count in white over its foot | **A20·13** |
| **Chip bar** | 38-in-44 chips on a raised surface bar, the current route's chip filled in accent with `aria-current` | **A20·15** |
| **Data group** | Tags · Hand-picked list · Show · Order · Tags with no posts — P0·5 configured for tags, identical in all fifteen, not counted | **A20** |
| **Tag colour derivation** | A tag's `accent_color` as a fill or plate tint with an on-colour derived from it, falling back to Theme per tag | **A20** (A17's derivation) |
| Universal trio | Background role · Vertical spacing · Top divider, outside every design's list | library-wide |
| Inline text toolbar · Link Picker | Bold · italic · underline · link, the popover carrying Open in new tab and rel values | **P0·1** |
| Icon slot · Icon Picker | Optional icon before or after a label, with its size and colour-role popover | **P0·2** |
| Item-list controls | Drag reorder, ✕ never disabled, Add pre-filled and never blank | **P0·3** |
| Section head | Eyebrow, heading, intro and an optional right-hand link; four named values | A5 (A5·5), extended here |
| Named ratio ladder | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5, never computed | A8 (A8·8) |
| Cell divisions | Two 636 · Three 416 · Four 306 · Five 240 · Six 196 on a 24 gutter across 1,296 | A10 |
| Split layout | Head column beside a content column, a `grid-column` move rather than an `order` swap | A8 (A8·6) |
| Raised plane | Surface fill, hairline, `md` shadow in light, no shadow in dark; a ground, not a containment | A26·3 / A27·4 |
| Icon button | 38 px box at the pack radius in a 44 px target — 9 Rail's arrows | A1·14 |
| Focus ring | 2 px accent, 2–4 px offset, inset where it meets a margin or a container edge | A6 |
| Striped image placeholder | 45° two-tone stripe with a mono caption; frames only, never shipped | A1 |
| Margin threshold | Side furniture leaves at 1,200 rather than at a breakpoint — 5 and 10 | A25 |

---

## Shared field list

The union of everything A20's fifteen designs need. This is the contract that makes design-switching
safe.

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrowText` | text | opt | 24 ch | 1–13 as the eyebrow; 14, 15 as the label | Defaults "Browse", "Topics" (14), "Filter" (15) ⚑; inline-editable |
| `headingText` | text | opt | 40 ch | 1–7, 9–13 | Default "What we cover" ⚑; kept unread by 8, 14, 15 |
| `introText` | text | opt | 220 ch | 1, 2, 3, 5, 6, 7, 9, 10, 12, 13 | Clamped 560 at 1440; 280 in 5's head column |
| `linkLabel` | text | opt | 24 ch | 1, 2, 3, 5, 6, 8, 12, 14 | Default "All topics" ⚑; takes an optional P0·2 icon |
| `linkUrl` | url | opt | — | same eight | **Ghost has no all-tags route** ⚑ — finding 1. Opens the Link Picker |
| `allTopicsLink` | enum | req | — | 1, 2, 3, 5, 6, **8** ⚑, 12, 14 | Off · On. **New in 3 (Off) and 6 (On)**, and **in 8 (On)** ⚑ *29 Aug, the owner's ruling* — no design now draws the link without a switch |
| `leadLabel` | text | opt | 24 ch | 10 | **Default derived from `tagOrder`** ⚑; blank at Fewest first and at Hand-picked |
| `colTopic` · `colCovers` · `colPosts` | text | opt | 20 ch | 11 | Defaults "Topic", "What it covers", "Posts" ⚑; inline-editable in place |
| `allChipLabel` | text | opt | 16 ch | 15 | Default "All" ⚑ |
| `backgroundRole` | enum | req | — | all fifteen | **Universal** ⚑. Background · Surface · Contrast; locked at Contrast in 6, at Background in 14 |
| `verticalSpacing` | enum | req | — | all fifteen | **Universal** ⚑. 64 · 96 · 132; **40 · 64 · 96 in 14 and 15**. **Replaces `padding`** |
| `topDivider` | enum | req | — | all fifteen | **Universal** ⚑. None · Line · Fade; disabled in 14 where Rules draws that hairline |
| `headingKind` | enum | req | — | 1, 2, 3, 4, 6, 7, 9, 10, 11, 12, 13 | Label · Heading · Heading and intro · None |
| `counts` | enum | req | — | all fifteen | Off · Number · Posts; **14 has Off · Number** ⚑; 15 has no Posts value; **9's panel gains the row** ⚑ *29 Aug, the owner's ruling* — every design now draws the control it reads |
| `tagColour` | enum | req | — | 1, 2, 6, 9, 15 | Theme (default) · Tag's own — the fill in 1, 6, 15; the plate tint in 2, 9. **Tag's own needs a recent Ghost** ⚑ *29 Aug*; on older releases the row is **greyed with the reason shown** and every tag takes the theme colour |
| `scrim` | enum | req | — | 13 | **New** ⚑. Light · Medium (default) · Strong; Light disabled against a pale bottom third |
| `separator` | enum | req | — | 14 | **New** ⚑. Middot (default) · Slash · Icon (P0·2 slot); always CSS `::before` |
| `tagSource` | enum | req | — | all fifteen | *Data group.* All tags · This post's · This author's · **Hand-picked** ⚑; **off-route the middle two fall back to All tags** ⚑ |
| `tagPicks[]` | list | opt | 1–12 | all fifteen | *Data group.* **New** ⚑. Tag references with the P0·3 item controls; Add pre-filled with the next most-used tag; **✕ stays live at one reference and says why it cannot go lower** ⚑ *29 Aug* |
| `tagCount` | number | req | 1–100 | all fifteen | *Data group.* **A number picker** ⚑ *29 Aug* → `limit`; **Ghost's ceiling is 100 and it truncates silently above it**, stated in the panel; per-design maxima greyed with their reason; disabled at Hand-picked |
| `tagOrder` | enum | req | — | all fifteen | *Data group.* Most posts · Fewest · A–Z · Ghost's; **forced A–Z in 7** ⚑; disabled at Hand-picked |
| `showEmptyTags` | enum | req | — | all fifteen | *Data group.* Hide (default ⚑) · Show |
| `name` | Ghost | req | — | all fifteen | Never clamped, ellipsised or auto-fitted ⚑; never inline-editable ⚑ |
| `url` | Ghost | req | — | all fifteen | The tag archive — **A29's page** ⚑ |
| `count.posts` | Ghost | opt | — | all fifteen | Needs `include="count.posts"`; dropped at Counts Off ⚑ |
| `description` | Ghost | opt | 300 ch | 3, 4, 11 | Absent on most sites ⚑; every reader states its absence |
| `feature_image` | Ghost | opt | — | 2, 4, 9, 13 | Absent → the tag plate (13: hover surface, no scrim) ⚑. **No alt, no focal point, no Image focus** ⚑ |
| `accent_color` | Ghost | opt | — | 1, 2, 6, 9, 15 | **Read at Tag colour: Tag's own** ⚑, with a derived on-colour; **the "never read" rule is amended**. **Only on a recent Ghost** ⚑ *29 Aug* — older releases do not expose it, the control greys out with the reason, and every tag takes the theme colour |
| `visibility` | Ghost | req | — | the query only | `filter="visibility:public"` — internal `#hash` tags never fetched ⚑ |

Per-design enums that are not shared — *Per row*, *Image ratio*, *Density*, *List columns*,
*Columns*, *Group by*, *Type size*, *Tile height*, *Name size*, *Cell width*, *Lead side*, *Lead
ratio*, *Lead label*, *Box inset*, *Head width*, *Rules*, *Plane*, *Bar*, *Band edges*, *Alignment*,
*Tag size*, *Thumbnails*, *Descriptions*, *Column head*, *Label*, *All chip*, *Controls*, *Scrim*,
*Separator* — are stored with the section and ignored by designs that do not read them, which is what
makes switching lossless. **The strings a switch can strand are `headingText` and `introText` in 8,
14 and 15, and `leadLabel` outside 10** ⚑. They are kept, not deleted, and reappear on switching
back. **`linkLabel` and `linkUrl` are no longer strandable in 3**, which is why that design gained
the toggle.

---

## Findings for the architect

1. **Ghost has no canonical all-tags route.** Eight designs draw an "All topics" link at a page the
   theme must invent. A26 raised it as its finding 5; A20 is the second category to meet it. **The
   product should decide the route once**, and `linkUrl` should then default to it ⚑. The Link Picker
   makes the field honest but cannot invent the page.
2. **A tag image has no alt text, and no focal point.** Ghost gives `feature_image` and neither
   `feature_image_alt` nor a focus. Designs 2, 9 and 13 draw pictures at up to 636 × 424 with
   `alt=""`, and **rule 10's Image focus has nothing to attach to in this category** ⚑. Correct, and
   a loss.
3. **Tabular figures are a pack requirement A20 cannot state.** 4 and 11 align counts in a column;
   **the third time the library has needed it** (A17·10, A26·14) and there is still no pack token ⚑.
4. **`count.posts` is not free, and now fifteen designs can ask for it.** It requires an `include`
   per query, so **A20 compiles two query shapes** decided by the Counts control ⚑ — and 14 joined
   them in this pass. Confirm Ghost caches the aggregate before a 200-tag site puts 7 Index on its
   home page.
5. **Contrast over a photograph cannot be guaranteed.** 13's white-on-scrim is 4.9:1 at Medium
   against the darkest picture tested and not against a bright one. **The Scrim control is the
   mitigation and Strong is its answer; it is still not a solution** ⚑, and Light is disabled where
   the measurement fails.
6. **A sticky filter bar has no module.** 15 wants to follow the reader and cannot; the closest entry
   is `header-scroll`, which belongs to A1's site header. **The sticky was cut rather than renamed**
   ⚑ — a registry decision, not a design one.
7. **A20 links into A29 Archive Headers, which is not yet drawn.** Every name in all fifteen designs
   links to a tag archive. **A20 assumes that page exists, is public, and repeats the tag's name** ⚑;
   if A29 decides otherwise, the counts drawn here and there must agree.
8. **A tag's colour is now read, and Ghost does not validate it.** ⚑ `accent_color` is a free hex a
   site owner types. A20 derives its on-colour rather than trusting a pair, but **a near-page-coloured
   tag will produce an invisible chip edge**, and there is no place in Ghost to warn about it. The
   product should decide whether the editor validates tag colours or the theme silently floors them.

9. **Ghost's tag ceiling is 100, and it does not say so out loud.** ⚑ *29 August 2026.* Asking for
   every tag trips Ghost's own warning and silently returns 100, so the theme cannot promise "all
   topics" and 7 Index — the design that means all of them — is the one that meets it. **The section
   states the cap and the truncation**; what it cannot do is tell a 130-topic site which 30 are
   missing. The product should decide whether the editor warns a site that has more tags than the
   ceiling.
10. **The minimum Ghost release for a tag's own colour is unpinned.** ⚑ *29 August 2026.* Five designs
   read a tag's `accent_color`, which reaches a theme only on a recent Ghost; the fallback is designed
   (every tag takes the theme colour, silently) but **the version number is a product fact this
   document cannot invent**. **Ruled on 29 August 2026: the control is greyed on an older site
   with the reason shown**, and every tag takes the theme colour. What remains is mechanical — the
   product must know the site's Ghost version and hold the minimum release as one value.

**Three things A20 settled that the next tag-bearing category should reuse rather than re-decide:**
the tag plate carrying the tag's own name ⚑, hiding zero-post tags by default ⚑, and **Hand-picked as
a list of references rather than a copy** ⚑.

---

## Reconciliation notes

**Superseded in part on 29 August 2026.** This section records the reconciliation pass. Where it and
the **Patch notes** below disagree — the module count, 12 Panel's hand-off, the *Show* row, a tag's
colour — **the Patch notes are the later ruling**. Everything else here stands.

**Frames changed in this pass — sixteen, and every one of them.** `A20-0 Category Proof` (the
roster's control counts re-counted, the shared field list re-cut with seven new rows and six
rewritten, and a category-wide reconciliation section added) and **all fifteen design frames**:
`A20-1 Chips`, `A20-2 Tiles`, `A20-3 Cards`, `A20-4 Rows`, `A20-5 Split Head`, `A20-6 Contrast
Band`, `A20-7 Index`, `A20-8 Big Type`, `A20-9 Rail`, `A20-10 Lead and Rest`, `A20-11 Ledger`,
`A20-12 Panel`, `A20-13 Overlay`, `A20-14 Slim`, `A20-15 Filter Bar` — each one's control panel
rebuilt (Padding retired, the universal trio and the Data group added outside the list, an Editing
block naming the P0 primitives, the header counts and Quick Controls restated) and a **Reconciled**
strip added at the foot of the controls frame and at the foot of the written spec card.

**Three section frames were redrawn, and only where an item changed what is visible.** **4 Rows** —
the decorative chevron removed from the desktop, states, responsive and dark frames, and from the
accessibility line. **13 Overlay** — a three-scrim state strip added, with the disabled Light case
against a pale picture and its ratio. **14 Slim** — a Counts-at-Number line and the three separators
added to the states frame. **The other twelve draw exactly what they drew before**: every other item
in this pass is a control, a data value or an editing affordance, none of which changes a resting
state.

**Where this pass and the category's earlier rulings disagree, one line each.**

- **"`accent_color` is never read anywhere in A20" is amended, not kept.** The old spec refused it
  category-wide as a per-item styling problem; the patch requires **Tag colour** on the designs with
  a fill or a plate. It is now read in **1, 2, 6, 9 and 15 only, at Tag's own only**, with A17's
  derived on-colour — and the refusal stands everywhere else, because **no design has a per-tag
  override**.
- **"No Add, no Remove, no reorder anywhere in A20" is amended.** Hand-picked adds all three — for
  **references to tags**, never for tags. Ghost-sourced values keep no Add.
- **3 Cards' "Cut: an all-topics link" is reversed**, because the cut stranded a neighbour's label and
  URL. The control is added and **defaults Off**, so nothing drawn changes.
- **6 Contrast Band's "the link is drawn even though it has no control" is fixed** with the switch,
  **On by default**, so nothing drawn changes.
- **13 Overlay's "Cut: a scrim strength" is reversed.** The fixed scrim was the stated mitigation for
  finding 5; a mitigation the reader cannot adjust is not one. Medium is the old fixed value.
- **14 Slim's "no counts at all" and "Cut: a separator style" are both reversed**, on the owner's
  instruction and A2's Ticker precedent. Both default to what was drawn.
- **14 Slim's and 15 Filter Bar's own 40 · 64 · 96 padding ladder is not a separate control any
  more** — it is Vertical spacing resolving different values, which is what the rule asks for.
- **6's band padding, 4's and 11's Density and 12's Box inset are kept as their own names**, because
  each is a container's internal ladder rather than the section's outer space.
- **10's `leadLabel` default was documented as "wrong at Order A–Z and not corrected".** It is now
  corrected: derived per order, and blank where no phrase is honest.
- **`marquee` on 14 stays refused** even though the design now has a separator control — a moving list
  of topics still cannot be read.

**Two things this pass found and did not fix — both closed by the owner on 29 August 2026.** The
rulings are in the Patch notes: 8 gains the switch, On by default; 9 gains the Counts row, at Number.

- **8 Big Type draws the all-topics link with no control** ⚑ — the same fault the patch named in 6.
  The patch named 3 and 6 only, so the switch was not added uninstructed; 8 has the Link Picker and
  the icon slot, and needs a one-line owner decision.
- **9 Rail's panel has no Counts row** ⚑ while the shared field list says `counts` is read by all but
  14 — now by all fifteen. Either the row is added to 9 or the field list excludes it; both are
  one-line decisions, and inventing a control in a design whose tiles already draw a count is the
  kind of quiet fix this pass exists to avoid.

**Three things the ground rules asked for that this category does not need, each with its reason.**
**No Preview control** existed in any of the fifteen panels. **No Member Visibility**: A20 has no CTA
— the all-topics link is navigation, which is the call A14 made for its See-all link — so **P0·4 is
unused here**. **No Image focus**: A20 has no authored image field, only Ghost's `feature_image`,
so there is nothing for a focus to attach to; it stays finding 2. **No module was coined**: the
sticky filter bar remains finding 6, and no frame carries *ARCHITECT: registry addition*.

---

## Patch notes — tag collections patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named and never numbered: the codes are filing labels and mean nothing outside this project.

| Rule or fact | What changed in A20 |
|---|---|
| **Grouping needs a small script** | **7 Index declares `group-headings`**, the registry's module, at *Group by: Initial*. Ghost's templates cannot tell that the first letter changed between two tags — there is no arithmetic in a template and no way to look at the previous item inside a loop — so the letter heads are cut in by the browser from each name's first character. **Its no-JavaScript state is a flat, ungrouped alphabetical list**: every name present, in the same columns, on the same 15/30 line, with no letter heads, no hairlines above them and no gap where a group would have been. Counts and links are untouched, so the flat state is a complete index rather than a degraded one; that state is drawn on the frame. At *Group by: Nothing* nothing is needed and nothing is declared. **The category now names three modules and coined none.** |
| **The tag count is capped at 100** | The Data group's *Show* **states Ghost's ceiling and its truncation** in all fifteen panels: asking for every tag trips Ghost's own warning and silently returns 100 anyway, so the theme promises 100 rather than "all". **The "All" value is retired** — it named something Ghost does not do. 7 Index, the design that means all of them, is the design that meets the cap, and its query note says so. |
| **Item counts are a number picker** | *Show* is **a number picker**, 1 to the design's own maximum, where it drew Four · Six · Eight · Twelve · All. **Each design caps its own maximum with the reason drawn beside the greyed numbers**: 40 in 1, 6, 11 and 12 · 30 in 5 · 20 in 2, 4, 9, 14 and 15 · 14 in 8 and 10 · 12 in 3 · **6 in 13 Overlay**, whose default is 4 because a full-picture tile is expensive · **100 in 7 Index**. Nothing else about the row changed: it is still a count and never a chosen set, and it is still disabled at Hand-picked. |
| **A tag's own colour needs a recent Ghost** | *Tag colour: Tag's own* in **1, 2, 6, 9 and 15** now states the version requirement in the panel, and **on an older Ghost every tag falls back to Theme** — silently, site-wide, with nothing drawn empty and no layout change. **Ruled by the owner on 29 August 2026: on an older site the row is greyed with the reason shown** — "Your Ghost version does not support topic colours" — so nobody sets a colour in Ghost and wonders why the page did not change, and every tag takes the theme colour. **ARCHITECT: the version number itself is the product's to supply**, held as one value and named once rather than repeated per design; that is what remains of finding 10. |
| **No design ever turns into another design** | **One deletion and three rewrites.** **12 Panel's hand-off to 1 Chips is deleted.** Below four topics it now draws its own box — hairline, head, link and inset unchanged — and **hides what does not apply**, collapsing three columns to the one the set fills; **the panel advises** "Three topics here — 1 Chips reads better at this count", which is product UI and not a control. Its states frame lost the hand-off panel and gained a three-topics-in-the-box panel; its data line moves from *correct at 4–40* to **1–40**. Three locked or shared rows named another design as what the section becomes and now state their own reason instead: **1 Chips'** Background role (at Contrast it stays 1 Chips on the on-contrast colours), **6 Contrast Band's** lock (the band is the design; 1 Chips is named as the design to place) and **14 Slim's** lock (the rules are the design; 15 Filter Bar is named for a bar on a surface). **A20 now has no hand-off anywhere.** |
| **The Remove button never greys out** | The hand-picked list's **✕ stays visible and clickable at one reference**, and clicking it explains why it cannot go lower — "a hand-picked list needs at least one topic". Never dimmed, never hidden, in all fifteen panels. This is the category's only repeating list; every other value in A20 is Ghost's and has no Add or Remove at all. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs, none of which depends on the customer having good photography — **1 Chips · 5 Split Head · 7 Index · 11 Ledger · 14 Slim** — and recommended two. **The owner chose 1 Chips · 14 Slim on 29 August 2026** — the category default and the quietest line in it: a pill row that can go anywhere, and a one-line topic bar. Neither needs a picture, a description or a colour. The line is at the head of this document and the badge is on the roster. |
| **Avatars with no photograph** | **No subject.** A20 draws no person: no `profile_image`, no initials block. The one initial in the category is the tag plate's below 96 px, which is a **tag's** name reduced to its first letter — one letter, from Ghost, which is what the rule asks for anyway. |
| **Slider labels · gap names** | **No subject.** A20 draws no slider and no gap control. Every control is a named-value row or a number picker whose title says what it affects — Tag size, Per row, Density, Box inset, Tile height, Name size, Cell width, Head width, Columns, Show — and the three shared values are Compact · Comfortable · Spacious throughout. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fifteen panels. The swatch row is **Base**; **there is no "Inherit" value anywhere in A20**; no design renames a shared control or adds a value to one. Three offer fewer, each with the reason drawn in place of the values: **Background role locked at Contrast in 6** and **at Background in 14**, and **Order forced to A–Z in 7**. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** A20 bears no call to action: no subscribe button, no paid tier, no Portal link, no member form. The all-topics link is navigation — the call A14 made for its See-all link — so **P0·4 stays unused here** and there is nothing to make conditional. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A20 contains no subscribe or sign-in form, so there is nothing for the notice to replace. The per-design no-JavaScript line was already honest in fourteen of the fifteen and is now honest in all fifteen: **7 Index gained a real one** with this pass. |
| **Two carried-over questions, closed by the owner** | Both were recorded as open by the reconciliation pass and neither was fixed uninstructed; **the owner ruled on 29 August 2026**. **8 Big Type gains the All topics link switch, On by default** — no design in A20 now draws that link without a control — taking it from four controls to **five**. **9 Rail gains the Counts row at Number**, the control its tiles already drew, taking it from five to **six** and making the panel and the shared field list agree. **Neither changes what is drawn.** |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, nothing renumbered, no gap created or closed, no number reused, nothing deleted. |

**Frames updated — all sixteen.** `A20-0 Category Proof` (the roster's thin-content and module
columns, the **[Free]** line, the third module in the behaviour floor, the *Show* paragraph, the tag
colour note, and a patch table) and every design frame (the number-picker *Show* with its own cap, the
✕ that never greys out, and a patch table naming the rules). **Three frames changed what is drawn:**
**7 Index** gained the flat no-JavaScript state and declares `group-headings`; **12 Panel** lost its
hand-off state and gained the three-topics-in-the-box state; the proof frame gained the [Free] line and
the patch table. **The visual language, type scale, colour packs and spacing system are untouched**, and
no design not named in this pass was changed.

**The four open questions are closed.** All four were put to the owner and **all four were ruled on
29 August 2026**: the free pair is **1 Chips · 14 Slim**; a tag's own colour **greys out with the reason
shown on an older Ghost**; **8 Big Type gains the all-topics link switch**, On by default; **9 Rail gains
the Counts row** at Number. **One item remains, and it is the architect's rather than the owner's:** the
minimum Ghost release for a tag's colour is a product fact this document does not invent — finding 10.

---

## Confirmation

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the
  required shape, and names **1 Chips** and **14 Slim** — both of which exist in this category's
  roster. It is **the owner's own choice, ruled on 29 August 2026**.

---

## The owner's rulings — 29 August 2026

All four questions this pass raised were put to the owner and all four were answered. Recorded here in
his words' effect, and applied throughout this document and the frames.

1. **The two free designs are 1 Chips and 14 Slim.** The category default and the quietest line in it: a
   pill row that sits anywhere, and one line of topic names between two hairlines. Neither needs a
   picture, a description or a topic colour, so a free site can ship both on day one. 5 Split Head, 7
   Index and 11 Ledger were the rest of the shortlist and stay paid.
2. **"Use the topic's own colour" names a minimum Ghost version, and greys out below it with the reason
   shown.** An editor on an older site reads why the control is unavailable instead of setting colours
   in Ghost and watching nothing happen; every tag takes the theme colour there. **The version number
   itself is the one thing still outstanding, and it is the architect's**: the product must hold the
   minimum release as a single value and know the site's Ghost version. Finding 10.
3. **8 Big Type gains the All topics link switch, On by default.** Nothing drawn changes today, and the
   design goes from four controls to five. No design in A20 now draws that link without a control.
4. **9 Rail gains the Counts row, at Number.** The tiles already drew the count; now the panel has the
   switch, the shared field list and the panel agree, and the design goes from five controls to six.

**Nothing else was decided here.** Where this pass could not apply a ruling without inventing a decision
it is written as a finding, not as a fact.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** fifteen designs, numbered **1–15**.
