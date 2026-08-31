# A24 Post Headers — written specification

16 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass, 25 August 2026** ·
**post headers patch, 28 August 2026**

**Post headers patch (28 August 2026).** Four rulings landed on this category and two of them touched
every design in it. **A byline never counts:** "Jane and 2 others" is now "Jane and others"
everywhere, because a template cannot subtract one from the author count. **An avatar with no
photograph draws one letter**, not two, because every person here is a Ghost author and Ghost gives a
theme a display name rather than a first and last name. **13 Sticky's condensed reading bar could not
work as drawn** — a stuck element holds only inside its own container, and this bar's container has
already scrolled away — so the bar is now script-revealed and pinned at the threshold, declares
`header-scroll` beside `reading-progress`, and **does not appear at all without JavaScript**. And
**the category's three hand-offs are deleted**: no design ever turns into another design, so 5 Full
Bleed and 9 Overlap hide the picture they cannot draw, 6 Edge to Edge reflows, and a panel may advise
a plainer design without switching to one. Two counts became number pickers, three gap ladders took
the standard gap words, and **nothing was renumbered.**

**[Free] designs:** 1 Centred · 2 Flush Left

*(Shortlisted, recommended and **confirmed by the owner on 28 August 2026**.)*

The frames are `A24-0 Category Proof.dc.html` and `A24-1` … `A24-16`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation pass.** The whole category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. This revision applies that patch. It reuses the shared editor primitives designed in **P0 ·
Editor primitives** by name and never redesigns them: **P0·1** the inline text toolbar and its link
popover, **P0·2** the icon slot and Icon Picker (which resolves 14 Share Row's brand glyphs and
otherwise never opens here), **P0·3** the item-list controls (which apply to one *site setting*, not
to any section), **P0·4** the member-aware action editor and **P0·5** the "Populate from…" data panel,
both of which land nowhere in A24 and are said so, and **P0·6** the editor state switcher, which is
how 13 Sticky's condensed bar is now designed. What each design gained is in a **Reconciled**
paragraph at the foot of its entry, and the frame-by-frame list is in **Reconciliation notes** at the
end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A24·1 in three packs, light and dark), the stress frame, the roster and the four settlements in
full. The shared field list is repeated below because the build reads it.

---

## 0 · The category layer

### What A24 is

Sixteen arrangements of six facts at the top of one piece of writing — **a tag, a title, a
standfirst, a byline, a date and, when there is one, a photograph.** The whole category is the
argument about their order and their scale.

**A24 owns no query, and it is the second category in the library that does not** (A34 was the
first). There is no Posts block — no Source, no Tag/Author, no Show, no Order — because the section
does not choose a post: **it is on the post, and it reads the route's `post` object.** What replaces
the Posts block is the **Post block**, four fields deciding which of the post's own facts the header
may draw.

**Unlike A34 it carries the page's one `<h1>`**, which is the constraint every design here is built
around. A17, A18, A19 and A34 are inherited whole: A1's nav item, eyebrow, avatar and meta row,
A1·2's 38/44 box, A6's focus ring, A8's named ratio ladder, A17's measure and page margin, A17·7's
on-contrast derivation, A19's missing-picture vocabulary and scrim rule, A19·3's card, A19·7's
overlap, A34's derived dark hover step. **A24 adds one thing: type at reading scale.** Everything
else is arrangement.

### The four settlements (§8 of the brief)

**1 · Title measure, and a 90-character title at every width.** The title measure is **820 at 1440**
⚑ — a hundred px wider than the article's 720, because 50 px type at 820 is about 46 characters a
line where 19 px body at 720 is 72. **The shared ladder is Small 40 · Medium 50 · Large 64**; 34 ·
42 · 52 at 834; 28 · 32 · 36 at 390 ⚑. **Two designs have their own ladders and no third may:**
10 Big Type at 72 · 88 · 104 across the full 1,296, and 15 Slim at 24 · 28 · 34. **In any column
narrower than 620 the shared ladder steps down one — 34 · 40 · 50** ⚑ — which is 3 Split, 7 Card,
9 Overlap and 16 Two Column; **the stepped ladder does not change when a design's own width control
changes** (9 and 16 both state it). The name a user picked never changes; what Medium means in a
476 column does.

**A title never truncates, at any size, at any width, in any design** ⚑ — it wraps and the section
grows. The drawn worst case is 91 characters. **The one exception is 13 Sticky's condensed bar,**
which truncates to one line at 15/600 and keeps the complete title as the link's accessible name;
it is allowed because the full title is 200 px above it in the same document.

**2 · The meta row.** A1·6's row unchanged: a 24 px circle, initials fallback, "Name · date" at
13 px in `text-muted`, with reading time as a third term from `reading_time`. A24 adds an **avatar
step — Off · Small 24 · Medium 36 · Large 44**, which after this pass is **a Post block row in all
sixteen** ⚑ (it was defined here and drawn in no panel, so nobody could set it) — and **the co-author case: two authors join with
"and", three or more draw the first name and "and others"** ⚑ — **no number, because a template cannot
subtract one from the author count** — avatars overlapping at −8 px to a maximum of three. **The
fallback circle is filled with `border` and carries one `text` letter, never accent** ⚑: every person
in A24 is a Ghost author, and **Ghost gives a theme a display name rather than a first and last name,
so two initials were never available**. **Below 767 reading time leaves the meta** (A18's rule), **except in 11 Dateline and
12 Rail, where it is the subject.** Two designs move off 24/13 and both say so: 10 Big Type steps up
to 36/15, 15 Slim drops the avatar entirely.

**3 · Feature image placement, and A1·4 Overlay.** Eight of the nine media values are spent:
**bottom (1, 12, 16) · none (2, 8, 10, 11, 13, 14, 15) · right (3) · top (4) · full-bleed (5) ·
edge (6) · left (7) · background (9)**; only `inline` is unused. **Two designs put the header on the
photograph and both carry a precondition line in the panel: "Pair with A1·4 Overlay."** ⚑ A post
with no feature image is ordinary, and **the vocabulary is now Reflow · Plate · Hide, the hand-off
having been deleted from the category** ⚑: **Reflow** in six (1, 3, 4, **6**, 12, 16), **Plate** in one
(7 Card), **Hide** in two (5 Full Bleed, 9 Overlap) — the section hides the picture and the scrim it
cannot draw and renders the rest of itself, 5 keeping its band on the pack's own ground with the
words in the page's own text colour, 9 keeping its card on the page ground with no plate. **A panel
may advise a plainer design and may never switch to one.** Seven designs draw no picture at any
setting.

**4 · The eyebrow, and a post with no tags.** A1's eyebrow verbatim — 13 px uppercase at .08em in
`text-muted` — a real `<a>` to the tag archive, going to `text` with a 2 px accent underline on
hover. **No design draws a filled chip, pill or badge** ⚑; A20 Tag Collections owns the tag plate.
**No tags → the eyebrow slot is removed and nothing takes its place** ⚑ — not "Uncategorised", not a
promoted date, not a reserved gap. **At All tags a design draws at most three**, in Ghost's order,
dot-separated; a fourth is dropped silently and **no design draws a "+2" counter** ⚑. **Ghost has no
series primitive** ⚑: a series is a tag, and a real one needs internal tags plus a route — a finding
for the architect. **Two designs move the tag out of the eyebrow slot and both state it:**
11 Dateline at Cells 4 (into the fourth cell) and 15 Slim (the meta line's first term).

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The title is the page's `<h1>` and the only one on the page** ⚑. Heading font, 700,
  line-height 1.1, letter-spacing −.02em, `text-wrap: balance` up to three lines and `pretty`
  beyond. The section is a `<header>`; nothing else in it is a heading. **Two designs re-tune the
  pair and both flag it:** 10 Big Type at 1.04/−.025em, 15 Slim at 1.25/−.015em.
- **The standfirst.** `custom_excerpt` falling back to the generated excerpt, at **19/1.55 in
  `text-muted` on a 720 measure** ⚑. Clamped by line at Two · Three · Full; never clamped below two.
  **Twelve designs draw it; four mark it inert** — 10, 11, 13, 15.
- **Measure and margin.** A17's: content 1,296 on a 72 px page margin; 754 at 40; 350 at 20. Title
  820, standfirst 720, article 720; at 834 and below all three become the page measure. Every band
  and edge picture is full bleed and **its contents keep the page margin** (A17·7).
- **Vertical spacing** — the universal control, not a per-design one. Compact 64 · Comfortable 96 ·
  Spacious 132; 80 at 834; 64 at 390. **It governs the space above the header only** ⚑. **The space
  between the header and the article is the article's own, fixed at 64 at every width**, and C Post
  Body owns it. **Every design's "Padding" row is retired into it** — same names, same ladder — with
  two ladder resolutions and one inert row: **8 Contrast Band resolves 0 · 64 · 96**, so Compact is
  the old Flush value and no fourth value is invented ⚑; **15 Slim resolves 48 · 64 · 96**, and 40 at
  390 ⚑; **5 Full Bleed's row is inert with its reason** — the picture meets the nav, Height is its
  ladder. **The ladders that survive as their own rows are the ones inside an object:** 7 Card's Card
  padding, 8's Band height, 13's Bar height, 4's Gap to the words, 6's Gap to the picture.
- **Imagery.** A8's named ratio ladder, never computed: **Landscape 3:2 · Wide 16:9 · Square 1:1 ·
  Portrait 4:5**, plus **Panorama 21:9 in 4 Image Top and 6 Edge to Edge only** ⚑. Radius 8 from the
  pack on every picture except the three that meet the viewport. **Picture crops are shortened in
  the frames to keep them readable and every shortened crop is labelled.**
- **Scrims.** A19's rule verbatim, and only 5 Full Bleed spends it: a bottom-up wash of the pack's
  contrast colour to transparent over the lower 60%, Soft 45% · Medium 62% · Strong 78% ⚑, never
  black and never full height. **9 Overlap needs none** — its text is on a surface card.
- **Accent, twice at most and usually once:** the tag link's hover underline and A6's focus ring.
  **Three designs spend a third and each says so:** 13 Sticky's progress meter, 14 Share Row's
  copied-link confirmation, 9 Overlap's card hairline in dark. **A date, a reading time, a byline, a
  rule and a numeral are never accent, and no title is ever accent-coloured.**
- **Dark.** A17's step: ground `#171511`, surface `#211D17`, plate `#2A251E`, hairline `#332E27`,
  A34's derived hover step `#2C2721`. **Warm shadows are dropped in dark** and the hairline carries
  the card in 7 and 9. **A title at 88 px in dark shows a weight the pack does not have in light**
  ⚑ — drawn on 10 Big Type's dark frame, and the category's strongest pack finding.
- **Responsive floor.** Every side-by-side arrangement becomes one column at 834 with **the picture
  above the text, never below it** (A19's rule) — **with two stated exceptions: 7 Card keeps the
  picture inside the card, and 12 Rail turns its rail into a row above the title.** **16 Two Column
  is not a third exception: the rule does not reach it**, because its picture was never beside the
  text. Every element that leaves a width has a stated destination.
- **Targets 44 px at every width.** The tag link, the byline link and the share links all take a
  44 px target with a 38 px visible box where a box is drawn (A1·2). **There is no sub-44 target
  anywhere in A24.**
- **Focus** is A6's ring at a 4 px offset, inset to −4 where an element meets a container edge
  (A17·18). **On the contrast band and on the picture the ring takes the band's own text colour**,
  not accent.
- **Behaviour: fourteen of the sixteen declare nothing** and are pixel-identical with JavaScript
  off. **13 Sticky declares `reading-progress` for its meter and `header-scroll` for its bar** ⚑ —
  the bar is script-revealed and pinned at the threshold, and **with JavaScript off it does not appear
  at all**, because a stuck element cannot hold once the header containing it has scrolled away —
  **and 14 Share Row declares `share`. No module name was invented; both of 13's are in the registry.** Four modules were
  considered and refused with their homes named: `lightbox` (A14, A33), `video-facade` (A15), `toc`
  (A25), `typewriter` (a title that types itself is the page's `h1`).
- **Print.** Every design prints as drawn with the title at 26 pt, the byline and date kept and
  links absent, **with four exceptions, and none of them is another design** ⚑: **5 Full Bleed prints its
  photograph at the page's own margin with its credit line, and its words below it on white in its own
  order and scale**; **8 Contrast Band prints its contents on white without the band's ground**
  (A17·7); **13 Sticky's bar and meter and 14's share row print nothing**; and **15 Slim prints its
  title at 18 pt**.
- **A page can switch the whole section off.** ⚑ A24 compiles to `page.hbs` as well as `post.hbs`,
  and Ghost's `@page.show_title_and_feature_image` suppresses the `<h1>` and the picture. A header
  whose entire content is a title and a picture therefore **does not render at all** when a page's
  toggle is off — Ghost's own semantics, stated on all sixteen panels because no design stated it.
- **Editing.** Every visible authored text is inline-editable on canvas with the shared **P0·1**
  toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel
  **nofollow · noreferrer · sponsored**. **Ghost-owned content is never inline-editable** — the post
  title, the excerpt, the tag and author names, and the caption: clicking one says **"Edit in Ghost"**.
  **A24 has no authored URL field**, so the Ghost-aware Link Picker never opens here, and **no icon
  slot**, so P0·2 opens only to resolve 14 Share Row's fixed brand glyphs. **No fixed English
  visitor-facing string ships:** the authored strings carry defaults (`readingTimeSuffix`,
  `bylinePrefix`, `shareLabel`, `copiedLabel`, and 11 Dateline's four cell labels), and **the
  derived joins are theme translation-catalog strings** ⚑ — "and", "and others", 14's "Email" and
  "Copy link", and its "Share on {destination}" accessible-name pattern.
- **Member Visibility lands nowhere in A24** ⚑, and that is a judgement rather than an omission:
  **nothing here is a CTA.** A tag link is navigation, a byline is attribution, and the category's one
  button copies a link. Recorded in the Reconciliation notes.
- **Refused category-wide, each with a reason:** a members-only badge (A32 owns access); a comment
  count (A28); a share row in any design but 14 (A26 owns below the article). **The refusal of an
  "Updated 14 March" line is withdrawn by this pass** — see the Meta enum below.

### The Post block — seven fields, identical in all sixteen

| Field | Values | Default |
|---|---|---|
| Tag line | Primary tag · All tags · Off | Primary tag |
| Meta | Author and date · Author, date and reading time · **Author, updated date and reading time** · **Author only** · Date only · Off | Author, date and reading time |
| Standfirst | From the excerpt · Off | From the excerpt |
| Feature image | From the post · Off | From the post |
| **Avatar** | Off · Small 24 · Medium 36 · Large 44 | Small 24 · Medium 36 in 10 Big Type |
| **Image focus** | Centre · Top · Bottom | Centre |
| **Caption** | From Ghost · Hide | From Ghost |

**Three rows are new and two Meta values are new.** **Avatar** is settlement 2's own step, which had
no panel until this pass ⚑. **Image focus** withdraws the category's refusal of a focal point ⚑ — it
sits in the block rather than in an Image Picker popover because A24 has no image field of its own,
Ghost owning the picture; it is a crop hint the theme applies and is never written back to the file.
**Caption** binds Ghost's per-post `feature_image_caption` and replaces the deleted authored
`post.feature_image_caption`. **Meta's two new values:** **Author only**, for the evergreen site that keeps bylines
and hides dates, and **Author, updated date and reading time**, which reads `post.updated_at` and
draws it **only when it is more than a day after publication** ⚑ — the owner's ruling, and the same
threshold A26·14 Ledger uses, so the two categories agree. Ghost stamps `updated_at` on every save,
including a typo fix; the day-gap is the theme layer's convention and is flagged as one.

**Avatar, Image focus and Caption take the same five verbs as the original four.** Avatar is **inert**
in 15 Slim (the one design that draws no avatar), **set** to Medium in 10 Big Type, and **capped** at
24 inside 13 Sticky's bar whatever the row says ⚑. Image focus and Caption are **absent** in the six
designs that never draw a picture, **greyed** in 8 Contrast Band until its picture is turned on, and
live in the ten that draw one — except that **7 Card takes Image focus and no Caption**: a caption
inside a card has no edge to sit under.

**A design may do five things to a block field and no more, and every case is drawn.**

- **Narrow** it — **11 Dateline removes Meta Off**, the removed value struck through with its
  reason, never hidden.
- **Set** its default — **8 Contrast Band sets Feature image Off**, and states where the picture
  goes if it is turned back on.
- **Lock** it — **5 Full Bleed and 9 Overlap** lock Feature image to From the post, greyed, with
  **what the design hides when a post has none** named beside it.
- **Mark it inert** — the block's most-used deviation. **Feature image inert in six** (2, 10, 11,
  13, 14, 15); **Standfirst inert in four** (10, 11, 13, 15). An inert field is drawn greyed with
  "Not used here" and its reason, **never hidden**, and its line says the content is kept.
- **Interpret** it — **12 Rail** reads Meta's four values as the rail's line count.

**A design may never add a value, and a design control may depend on a block field but never write
one:** 4 Image Top's, 12 Rail's and 16 Two Column's Ratio controls grey out at Feature image Off.
**16 Two Column is the only design that touches no block field at all.**

### The roster

| # | Design | Tuple | No picture | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Centred | `stack · none · page · one · bottom · centred column` | Reflow | 5 | — |
| 2 | Flush Left | `stack · none · page · one · none · left on the article measure` | n/a | 4 | — |
| 3 | Split | `split · none · page · one · right · text beside a half-page picture` | Reflow | 5 | — |
| 4 | Image Top | `media frame · none · page · one · top · picture before the words` | Reflow | 4 | — |
| 5 | Full Bleed | `media frame · none · image · one · full-bleed · text on the picture` | Hide picture | 5 | — |
| 6 | Edge to Edge | `media frame · none · page · one · edge · picture to the viewport edges` | Reflow | 4 | — |
| 7 | Card | `split · card · surface · one · left · the header on a plane` | Plate | 5 | — |
| 8 | Contrast Band | `stack · none · contrast · one · none · inverted band` | n/a | 4 | — |
| 9 | Overlap | `media frame · card · page · one · background · card overlapping the picture` | Hide picture | 5 | — |
| 10 | Big Type | `stack · none · page · none · none · title at display size` | n/a | 4 | — |
| 11 | Dateline | `table · none · page · few · none · facts in labelled cells` | n/a | 5 | — |
| 12 | Rail | `edge rail · none · page · one · bottom · meta in a side rail` | Reflow | 5 | — |
| 13 | Sticky | `sticky · none · page · one · none · condensed bar on scroll` | n/a | 4 | `reading-progress` + `header-scroll` |
| 14 | Share Row | `stack · none · page · few · none · share row beneath the meta` | n/a | 5 | `share` |
| 15 | Slim | `bar · none · page · one · none · one line above the article` | n/a | 4 | — |
| 16 | Two Column | `split · none · page · one · bottom · title against its own standfirst` | Reflow | 5 | — |

**Control counts are after this pass** — each design's own rows, before the three universal controls
and the Post block's seven, none of which is counted. Every count fell by one but 5 Full Bleed's,
which had no Padding row to retire, and 12 Rail's and 11 Dateline's, which lose Padding and are
five. **All sixteen are distinct on the five closed slots.** Media placement carries the category — eight
of nine values spent. Ground barely moves: thirteen `page`, one `image`, one `surface`, one
`contrast`. **The count slot needed an interpretation and it is stated once for the whole
category** ⚑: it counts **the repeating units the design lays out**, so `one` is a single composed
block (thirteen designs), `few` is 11 Dateline's cells and 14 Share Row's links, and `none` is
10 Big Type. `variable` is unused, because nothing in a post header follows an authored array.
**The closest pairs are 2 Flush Left against 15 Slim** (separated by archetype and scale) **and
1 Centred against 16 Two Column** (separated by archetype).

### Repeating items — the whole category, in one place

**There is no field in A24 that is an array the user authors.** ⚑ Checked against all sixteen
content models. The five authored fields are short strings. **Two Ghost-owned arrays behave like
items and neither is authored here:** `post.tags` and `post.authors`. So there is **no Add, no
Remove, no reorder, no minimum or maximum item count and no per-item editing anywhere in the
category** — and **every design states its behaviour at those two arrays' ends**: 0, 1, 3 and 4+
tags, and 1, 2, 3+ authors. **Two designs come closest to an item list and both are single-value
controls written onto the section:** 11 Dateline's Cells (Two · Three · Four) and 14 Share Row's
Links (Two · Three · Four). Neither can be reordered or extended. **14's cost — "a site that shares
to LinkedIn cannot" — is paid off by this pass, and not by a section repeater:** the destinations
become **one site-wide ordered Share-destinations setting** (X · Facebook · LinkedIn · Bluesky ·
Mastodon · Threads · WhatsApp · Reddit · Email · Copy link), which the owner orders and enables once
with **P0·3's controls inside the setting**, and Links draws the first N enabled. **A site setting is
not a section item list** ⚑, so the category still has no Add, no Remove and no reorder anywhere —
and A24·14, A25·9 and A26·9, which fixed three different lists, now read one. **ARCHITECT: site
setting.** **Selecting a header on the canvas gives the user text
fields only** — at most three, and four of the five authored fields are labels rather than content.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `shareLabel` | text | yes | 24 ch | 14 only · default "Share this piece" |
| `copiedLabel` | text | yes | 24 ch | 14 only · default "Link copied" · falls back rather than empty |
| `bylinePrefix` | text | yes | 16 ch | 11, 12 · default "Written by" |
| `readingTimeSuffix` | text | yes | 16 ch | all sixteen · default "min read" |
| `filedLabel` | text | yes | 16 ch | 11 only · default "Filed under" — **new** ⚑ |
| `publishedLabel` | text | yes | 16 ch | 11 only · default follows Meta, "Published" / "Updated" — **new** ⚑ |
| `readingTimeLabel` | text | yes | 16 ch | 11 only · default "Reading time" — **new** ⚑ |
| `post.title` | text | no | — | all sixteen · the page's `h1` |
| `post.custom_excerpt` | text | yes | — | 1–9, 12, 14, 16 · falls back to the generated excerpt |
| `post.feature_image` | image | yes | — | 1, 3, 4, 5, 6, 7, 9, 12, 16 |
| `post.feature_image_alt` | text | yes | — | the same nine · empty alt when absent, never the title ⚑ |
| `post.feature_image_caption` | html | yes | — | 1, 3, 4, 6, 9, 12, 16 as a caption · 5 as a credit line · 8 when turned on — **new** ⚑ |
| `post.tags[]` | array | yes | 3 drawn | all sixteen · Ghost's order, never authored here |
| `post.authors[]` | array | no | 3 avatars | all sixteen but 10 at Meta Date only |
| `post.published_at` | date | no | — | all sixteen · `<time datetime>`, long form |
| `post.updated_at` | date | no | — | all sixteen at Meta *Author, updated date and reading time* · past a day's gap — **new** ⚑ |
| `post.reading_time` | integer | no | — | all sixteen at the Meta value that draws it |
| `post.url` | text | no | — | 14 only · the share destination |

**Seven authored, eleven read, eighteen in all — and every authored field is a label rather than
content.** Switching between any two of the sixteen is lossless: nine of the read fields are read by
every design; `shareLabel` and `copiedLabel` belong to 14 alone, 11's four cell labels to 11 alone,
and all of them carry defaults. **`post.feature_image_caption` is deleted from the library** ⚑ — it was a
section-level authored field on a template that renders every post, so one caption would have
repeated under every photograph on the site; **Ghost's per-post `feature_image_caption` replaces it**,
rendered as HTML so the credit link a photographer needs survives. **Two values are neither authored
nor read but set once for the site:** the **Share destinations** list and its **Mastodon instance**,
which is why they are not in this table. **Derived, never stored:** the initials in an avatar's
fallback; the date's long form. **Catalog strings, not fields** ⚑: "and", "and others", "Email",
"Copy link", "Share on {destination}".

---

## 1 · The designs

### A24·1 — Centred

- **1 · Descriptor.** Tag, title, standfirst and byline centred on one axis at three narrowing measures — 820, 720, 720 — with the feature image beneath at the full content width. **The category default, the design a switch falls back to, and the only one that changes nothing in the Post block.**

- **2 · Structural descriptor.** `stack · none · page · one · bottom · centred column`
  Containment `none`: the section has no box; the picture's radius is the picture's. Separates from 16 Two Column on archetype (one axis against two columns) and from 4 Image Top on media placement alone — **above the words and below them are two designs, and this slot is what says so.**

- **3 · Archetype.** stack. **No departure.** It narrows and re-sizes; nothing reorders, nothing moves column, and the DOM order is the reading order at every width.

- **4 · Responsive rule. 1440** margin 72, title 50 on 820, standfirst 19 on 720, meta 13, picture 1,296 at 16:9, gaps 24/20/24/40, padding 96 above, 64 to the article. **1080** unchanged but for the margin. **834** margin 40, **title and standfirst both take the 754 measure**, title 42, standfirst 18, padding 80. **≤ 767** margin 20, title 32, standfirst 17, gaps 20/16/20/32, **reading time leaves the meta** (A18's rule) and is not drawn elsewhere, padding 64. **Alignment never changes with width** ⚑.

- **5 · Content fields.** Read from the post: `title`, `custom_excerpt`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Read as HTML: `post.feature_image_caption`. Authored: `readingTimeSuffix` (text, optional, 16 chars, default "min read"). **In the union, unread:** `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Alignment | Left · Centre |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Standfirst lines | Two · Three · Full |
  | Image ratio | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 |
  | Rule | None · Above the tag · Below the meta |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four, **all at their defaults and none narrowed, set, locked, ignored or
  interpreted. Cut:** title colour, an eyebrow chip, an updated-date toggle, caption position.
- **7 · Data.** The route's `post`, on any post or page template. **There is no zero case** — no post, no route, no section — which is the one respect in which A24 is easier than every collection category. **Tags: 0 → no eyebrow; 1 → as drawn; 3 → three at All tags, dot-separated; 4+ → the first three in Ghost's order and the rest dropped, with no counter** ⚑. **Authors: 1 → as drawn; 2 → two overlapping avatars and "and"; 3+ → three avatars and "Name and others"**, each name its own link. On a page with no author, Meta resolves to Date only.

- **8 · Empty state. No picture → Reflow:** the picture's box and its 40 px gap are both removed and nothing replaces them — **no plate, no placeholder, no striped rectangle on a live page.** No standfirst → its 20 px goes with it. No tag → the eyebrow slot is removed, not filled. **All four absent leaves a title and a byline, and that is still this design**, drawn in the stress frame. **In the editor an absent picture draws the box greyed with "This post has no feature image. Add one in Ghost, or set Feature image to Off."** — the only place a placeholder appears anywhere in A24.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical** — every element is text, an `<img>` or an `<a>`, and the two links go to routes Ghost already serves. **Edit-safe.** `reveal` was considered and refused: a title that fades in is a title that is not there when the page paints, and it is the page's `h1`.

- **10 · Accessibility.** `<header>` holding **the page's one `<h1>`**; nothing else in the section is a heading. DOM order tag → title → standfirst → byline → picture, matching the visual order at every width. The tag is an `<a>` to its archive and each author name an `<a>` to theirs, both on 44 px targets; the date is `<time datetime>` and the reading time plain text. **The avatar is `alt=""`** ⚑ — the name is beside it — and the picture takes `feature_image_alt`, **falling back to an empty alt and never to the title.** A6's ring at 4 px. Title 13.1:1, standfirst 5.4:1, eyebrow 5.4:1. Print: as drawn at 26 pt, picture kept, links absent.

- **Repeating items.** None authored. The two Ghost arrays are covered in field 7; **there is no Add, no Remove, no reorder and no per-item control**, and selecting the header on the canvas gives the user `post.feature_image_caption` and `readingTimeSuffix` and nothing else.


- **Reconciled.** Field 6's **Padding** row is struck and is the universal **Vertical spacing** (64 · 96 · 132), leaving **five controls**. Field 5's `imageCaption` is replaced by Ghost's `post.feature_image_caption`, drawn as HTML — the credit inside the drawn caption becomes a real link to the photographer — and governed by **Caption: From Ghost · Hide**; field 8's caption sentence and field 10's `figcaption` follow it. The Post block gains **Avatar** (Off · Small 24 · Medium 36 · Large 44 — settlement 2's step, which no panel carried ⚑) and **Image focus** (Centre · Top · Bottom, the category's focal-point refusal withdrawn ⚑), and **Meta** gains **Author only** and **Author, updated date and reading time**. Field 7 gains one line: **on a page with "Show title and feature image" off, the section does not render.** `readingTimeSuffix` edits inline with P0·1; the joins in field 7 are catalog strings. **Nothing was removed as a Preview control — A24 never had one — and Member Visibility is not added.**
- **Flagged ⚑** — the 820 title measure and its ladder; the avatar filled with `border` rather than accent, against the calibration reference; three tags capped with no counter; the two-author join and "and others"; 16:9 as the default ratio; Alignment never switching by width; the picture's alt never falling back to the title; the editor's greyed picture box as A24's only placeholder.

---

### A24·2 — Flush Left

- **1 · Descriptor.** Tag, title, byline and standfirst left-aligned on the article's own 720 measure between two hairlines, with the byline between the title and the standfirst. **The only design whose header measure is the body measure, and one of seven that draw no picture.**

- **2 · Structural descriptor.** `stack · none · page · one · none · left on the article measure`
  Separates from 8 Contrast Band on ground alone, from 15 Slim on archetype and scale, and from 10 Big Type on the count slot — **this design's header is one composed block; Big Type's is a title with nothing beside it.**

- **3 · Archetype.** stack. **One departure, and it is content-driven rather than width-driven:** at Meta placement Above the title with three tags at ≤ 767, the tags leave the folded byline row and take their own line above it.

- **4 · Responsive rule. 1440** margin 72, everything on 720, title 50, standfirst 19, byline 13 between them, hairlines at the measure, gaps 20/20/24/20, padding 96 above and the article's 64 below. **1080** unchanged. **834** margin 40, measure 754, title 42, standfirst 18, padding 80. **≤ 767** margin 20, measure 350, title 32, standfirst 17, gaps 16, reading time leaves the meta, padding 64. **No element changes column or order at any width.**

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix`. **Not read, and the design says so in the panel:** `feature_image`, `feature_image_alt`, `post.feature_image_caption`. **In the union, unread:** `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Title size | Small 40 · Medium 50 · Large 64 (on 720) |
  | Standfirst lines | Two · Three · Full |
  | Meta placement | Above the title · Below the title |
  | Rule | None · Above · Below · Above and below |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Feature image inert**. **Cut: Alignment** (it would make this
  1 Centred) and **a drop cap** (the article's, not the header's).
- **7 · Data.** The route's `post`. **No zero case. Tags: 0 → no eyebrow, and at Meta above the title the byline row simply starts with the author; 1 → as drawn; 3 → dot-separated at All tags; 4+ → three drawn, the rest dropped, no counter. Authors: 1 → as drawn; 2 → overlapping avatars and "and"; 3+ → "Name and others". The picture is not read at any setting**, so a post with one and a post without one produce the same header.

- **8 · Empty state. No picture is not an empty state here — it is the design.** No standfirst → the lower hairline moves up to 20 under the byline. No tag → the eyebrow is removed. **Title and byline alone between two rules is the floor**, and it is composed. **In the editor nothing is greyed and no placeholder appears**: this is the one design in A24 with no editor-only state at all, because it has no absent element to explain.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. Four text elements, two hairlines and two links.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order is tag → title → byline → standfirst at both Meta placement values** ⚑ — at Above the title the byline is drawn first and read third, because the title is the thing a screen-reader user is looking for and the byline is a caption on it. Tag and author names are `<a>`s on 44 px targets; date is `<time datetime>`; hairlines are CSS borders and announce nothing. A6's ring at 4 px. Title 13.1:1, standfirst 5.4:1, eyebrow 5.4:1. Print: as drawn at 26 pt with both rules kept, links absent.

- **Repeating items.** None authored. Tags and authors behave as in field 7. **Selecting the header gives the user one field** — `readingTimeSuffix` — which is the fewest in the category.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **four controls**, the fewest in A24. The Post block gains **Avatar**, and **Meta** gains **Author only** and **Author, updated date and reading time**; at Meta placement Above the title the updated date sits in the caption line under the title. **Image focus and Caption are not added:** both travel with the picture, and the inert Feature image row says so. `imageCaption` is deleted from the library; what this design does not read is Ghost's `post.feature_image_caption`. Field 7 gains the page rule. Background role's three values are drawn with what each becomes — Surface is 7 Card without the card, Contrast is 8 Contrast Band — rather than left for a user to discover ⚑.
- **Flagged ⚑** — the byline between title and standfirst; the header measure being the article's rather than 820; Feature image inert and drawn greyed rather than hidden; **C Post Body's own picture behaviour named as an open question rather than assumed**; the tag folding into the byline row at Meta above the title, and wrapping out of it at three tags below 767; the DOM order holding when the visual order changes.

---

### A24·3 — Split

- **1 · Descriptor.** The header's text in a 756 column with its type held to 560, the feature image in a 476 column beside it on a 64 gutter, the two cross-centred, the caption under the picture. **The only A24 design in which the title and the photograph are side by side, and the only one with a genuine tablet arrangement.**

- **2 · Structural descriptor.** `split · none · page · one · right · text beside a half-page picture`
  Separates from 7 Card on containment and ground, from 16 Two Column on media placement — **a picture in the second column against a standfirst in it** — and from 1 Centred on archetype.

- **3 · Archetype.** split. **No departure from the ladder** — two columns at 1440 and 834, one column below 767, picture first. **Two value resolutions rather than departures:** Portrait and Square both render 3:2 below 767, and the title ladder steps down in any column under 620.

- **4 · Responsive rule. 1440** 756 + 64 + 476 on the 1,296 measure, text held to 560, title 40, standfirst 19, caption 13 at a 12 gap, cross-centred, padding 96, the article's 64 measured from the taller column. **1080** 560 + 64 + 352. **834 434 + 40 + 280, title 34, standfirst 17**, credit line drops to one line, padding 80. **≤ 767** one column, **picture first at 3:2**, then tag, title 32, standfirst, byline; reading time leaves; padding 64.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `post.feature_image_caption` (optional, 90 chars — **the one authored string that can change this section's height**), `readingTimeSuffix`. Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Split | Seven and five · Half · Five and seven |
  | Image side | Left · Right |
  | Image ratio | Landscape 3:2 · Square 1:1 · Portrait 4:5 — **Wide 16:9 not offered** |
  | Title size | Small 34 · Medium 40 · Large 50 |
  | Vertical alignment | Top · Centre |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four, all live; **Image side and Image ratio grey out when Feature image
  is Off. Cut:** caption placement, image shape, a gutter control.
- **7 · Data.** The route's `post`. **No zero case.** Tags 0 / 1 / 3 / 4+ and authors 1 / 2 / 3+ exactly as 1 Centred. **The picture is the one field whose absence changes the arrangement**, and it does so by dropping a column rather than by leaving one empty.

- **8 · Empty state. No picture → Reflow, and the text keeps its 560 measure rather than spreading to 1,296** ⚑ — so the header narrows into the left half of the page and does not become a different design. That is deliberate: a user who adds a photograph an hour later gets the same type at the same size beside it. **No caption → the picture ends its column** and the section's height comes from the picture alone. No standfirst → its 20 px goes with it and the byline rises. **In the editor an absent picture draws the 476 column greyed with the cause and the words "the header will narrow on the site".**

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`lightbox` was considered and refused**: a feature image that opens full-size is a gallery behaviour, A14 and A33 own it, and a header whose picture is a control is a header with two focal points.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order is tag → title → standfirst → byline → figure at both Image side values** ⚑ — the swap is grid order, so a screen-reader user hears the same header whichever side the picture is drawn on, and at ≤ 767 the visual order puts the picture first while the DOM order does not change. The picture is a `<figure>` with the caption as its `<figcaption>`; `alt` from `feature_image_alt`, empty when absent, **never the caption and never the title** ⚑. A6's ring at 4 px. Title 13.1:1, standfirst 5.4:1, credit 4.6:1 light and 4.8:1 dark. Print: as drawn, picture kept, caption kept, links absent.

- **Repeating items.** None authored; tags and authors as in field 7. Selecting the header gives `post.feature_image_caption` and `readingTimeSuffix`. **Selecting the picture on the canvas opens Ghost's own feature-image field**, not a section field — the picture is the post's.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **five controls**. `imageCaption` is replaced by Ghost's `post.feature_image_caption` (HTML, credit link kept) with **Caption: From Ghost · Hide**, and **field 5's claim that an authored string can change this section's height is superseded** — the caption is the post's, and so is the height it produces. **Image focus** joins the Post block and is the row this design needed most: Portrait 4:5 in a 476 column is the tightest crop in the category. **Avatar** and the two new **Meta** values join as category-wide. Field 6's dependency now greys **four** rows at Feature image Off — Image side, Image ratio, Image focus, Caption. Field 7 gains the page rule.
- **Flagged ⚑** — the 560 text measure inside a 756 column; the narrow-column title step, stated here for the whole category; Wide 16:9 withheld; Portrait and Square resolving to 3:2 below 767; the reflow keeping 560; the article's 64 measured from the taller column; DOM order fixed across Image side and across the stack; the derived credit tone `#7C7466`; no scrim or filter on the picture in dark.

---

### A24·4 — Image Top

- **1 · Descriptor.** The feature image at the content width first, then tag, title, standfirst and byline beneath it on 1 Centred's measures, with the caption moved to the foot of the header under a hairline. **One of two designs offering Panorama 21:9, and the only one whose caption is not adjacent to its picture.**

- **2 · Structural descriptor.** `media frame · none · page · one · top · picture before the words`
  Separates from 1 Centred on archetype and media placement, and from 6 Edge to Edge on media placement alone — **inside the measure against across the viewport**, which is a real difference in what the page's edges mean.

- **3 · Archetype.** media frame. **No departure.** The picture is already first, so the collapse is measure and type only and nothing reorders at any width.

- **4 · Responsive rule. 1440** picture 1,296 on the 72 margin at the chosen ratio, gap 40, then the text on 820/720 centred, caption at the foot under a hairline, padding 96 above and the article's 64 below. **1080** unchanged but for the margin. **834** picture 754, **gap ladder steps down to 24 · 32 · 44**, title 42, padding 80. **≤ 767** picture 350, **gap 16 · 24 · 32**, **Panorama renders 16:9**, title 32, reading time leaves the meta, padding 64.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `post.feature_image_caption`, `readingTimeSuffix`. Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Image ratio | Landscape 3:2 · Wide 16:9 · Panorama 21:9 |
  | Gap to the words | Tight 32 · Normal 40 · Loose 56 |
  | Alignment | Left · Centre |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four, all live; **Image ratio and Gap to the words grey out together when
  Feature image is Off. Cut:** a pixel image height, caption position, Portrait 4:5.
- **7 · Data.** The route's `post`. **No zero case.** Tags and authors behave as in 1 Centred at 0, 1, 3, 4+ and 1, 2, 3+. **Ghost crops the feature image from the centre at every named ratio** and A24 does not offer a focal point ⚑ — a crop control belongs to the image, not to the section, and Ghost owns the image.

- **8 · Empty state. No picture → Reflow.** The picture's box and the gap under it are dropped, **nothing replaces them**, and the words keep this design's own arrangement — **at Alignment Centre they resemble 1 Centred without becoming it** ⚑. The panel says the post has no feature image and may advise 1 Centred; **it never announces a switch.** No caption → the foot hairline goes with it. No standfirst, no tag → their gaps go with them. **In the editor the picture's absence draws the box greyed with the cause and the sentence about 1 Centred.**

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. `lightbox` refused, as in 3 Split.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order is figure → tag → title → standfirst → byline, and the `<figcaption>` stays inside the `<figure>` while being drawn at the foot** ⚑ — the association is structural, and a screen-reader user hears the caption with the picture rather than after the byline. **A picture before an `h1` means the first thing in the document is an image**, so `alt` matters more here than anywhere else in A24: it takes `feature_image_alt`, falls back to empty, and **never to the title**, which would announce the headline twice. A6's ring at 4 px. Title 13.1:1, caption 5.4:1. Print: as drawn, picture kept.

- **Repeating items.** None authored; tags and authors as in field 7. Selecting the header gives `post.feature_image_caption` and `readingTimeSuffix`.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **four controls** — with **Gap to the words** kept as a genuinely different ladder, inside the header rather than around it. `imageCaption` becomes Ghost's `post.feature_image_caption` with **Caption: From Ghost · Hide**; field 10's rule that the `figcaption` stays inside the `figure` while drawing at the foot is unchanged. **Image focus** joins the Post block and **field 7's sentence that A24 offers no focal point is struck** ⚑ — Panorama 21:9 is exactly the crop that needed one. **Avatar** and the two new **Meta** values join as category-wide; the Feature image Off dependency now greys four rows. New in field 10: **a Line top divider above a picture-first design reads as the picture's own edge** ⚑, and the panel says so. Field 7 gains the page rule.
- **Flagged ⚑** — the caption moved to the foot; Panorama 21:9 as a fifth named ratio in two designs only; Panorama resolving to 16:9 below 767; the gap ladder stepping by width while its name holds; Portrait withheld; no focal-point control; the empty state resembling 1 Centred at Alignment Centre without becoming it; nothing added to soften a photograph in dark.

---

### A24·5 — Full Bleed

- **1 · Descriptor.** The feature image full bleed at a named height, the tag, title and byline on it in the contrast colour's text under a bottom-up scrim, the standfirst withheld. **The category's only design with text on a photograph, its only image ground, and its only design with a stated precondition.**

- **2 · Structural descriptor.** `media frame · none · image · one · full-bleed · text on the picture`
  The category's only `image` ground and only `full-bleed` placement. Separates from 9 Overlap, which puts the same photograph behind a card rather than under type.

- **3 · Archetype.** media frame. **One departure:** at ≤ 767 **Text position resolves to Bottom left whatever it is set to**, and Title size Large and Display both resolve to 34.

- **4 · Responsive rule. 1440** full-bleed picture at 480/620/760, text block on the 72 margin 48 from the foot, measure 620 or 820, title 64, tag and byline 13, scrim over the lower 60%, no padding, the article's 64 below. **1080** unchanged. **834 heights 400 · 520 · 620**, margin 40, measure 560, title 46, 32 from the foot, padding 80 below → still the article's 64. **≤ 767 heights 320 · 400 · 480**, margin 20, title 34, 20 from the foot, reading time leaves, **scrim height is 60% or the text block + 24, whichever is taller.**

- **5 · Content fields.** Read: `title`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix`. **Not drawn:** `custom_excerpt` (inert, returns on a design switch). ~~And `imageCaption`, withheld because a credit on a picture already carrying a headline is the fourth thing in the same rectangle, with A26 named as its home.~~ **Struck by this pass** ⚑: **Ghost's `post.feature_image_caption` is read, as a credit line below the picture** — on the page ground rather than in the rectangle — and A26·14 draws the same field rather than being promised it.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Height | Compact 480 · Comfortable 620 · Spacious 760 |
  | Text position | Bottom left · Bottom centred · Centred |
  | Scrim | Soft 45 · Medium 62 · Strong 78 |
  | Title size | Medium 50 · Large 64 · Display 76 |
  | Text measure | Narrow 620 · Wide 820 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | **No control at all on this design** (A19·2's rule) |
  | Top divider (universal) | None · Line · Fade |

  Five, and **no Padding control at all** (A19·2's rule). Block: **Feature image locked**,
  **Standfirst inert**, Tag line and Meta live. **Cut:** a darken toggle, a focal point, parallax.
- **7 · Data.** The route's `post`. **No zero case.** Tags and authors as elsewhere, drawn in the contrast text at 82%. **A picture is the one thing this design cannot do without**, and the panel says so before the post proves it.

- **8 · Empty state. No picture → Hide** ⚑ — **the hand-off to 1 Centred is deleted by this pass**, because no design ever turns into another design. The picture and the scrim are not drawn; **the band keeps its Height, its Text position and its Title size on the pack's own ground**, and **the words take the page's own text colour** ⚑, since contrast text on a pale ground cannot be read. The standfirst stays inert, as it is in this design at every setting. **Scrim greys with "Needs a feature image".** The picker still reads Full Bleed, nothing is re-set and nothing is switched, and **the panel may advise 1 Centred for a site whose posts rarely carry a picture — advice, never a switch.** **In the editor the state is drawn as it will render**, not as an error state.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical** — the scrim is a CSS gradient and the picture is an `<img>`. Edit-safe. `reveal` and `video-facade` both refused: the first hides the page's `h1`, the second belongs to A15 Video and Embeds, which owns a poster that plays.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`, DOM order tag → title → byline, the picture a CSS background on the section with **the same photograph also present as a visually-hidden `<img>` carrying `feature_image_alt`** ⚑ — otherwise a decorative background would silently drop the alt text the author wrote. Empty alt when absent. **Contrast is measured on the scrimmed crop, not on the token:** title 11.8:1, tag and byline 6.4:1 at Medium; **Soft on a pale photograph is the one combination that can fail, and the panel says so** rather than the section computing an image's luminance ⚑. **Focus is A6's ring in the contrast text colour, not accent.** Print: **the section prints as itself** — the photograph at the page's own margin with the credit line under it, the scrim not printed, and the words below it on white in this design's own order and scale, title 26 pt. **The old "prints as 1 Centred on white" is deleted.**

- **Repeating items.** None authored. Tags and authors as in field 7. Selecting the header gives `readingTimeSuffix` alone.


- **Reconciled.** Field 5's withheld caption is replaced by a **credit line from Ghost's `post.feature_image_caption`**, drawn below the picture on the page ground at the page margin, 14 px under it, governed by **Credit line: From Ghost · Hide** — **the promise that A26 would carry the photographer's credit is withdrawn** ⚑, because A26 had no such row until its own patch added one from the same field; the two are now consistent. Field 4 gains it: the article's 64 is measured from the credit line where there is one, from the picture where there is not — 6 Edge to Edge's rule. The universal trio arrives with **Background role locked to Image** and **Vertical spacing inert**, both drawn with their reasons: this design has no padding, which is why it never had a Padding row to retire, and Height is its ladder. The Post block gains **Avatar** and **Image focus** — **field 6's cut "focal-point control" is withdrawn** ⚑, a 480-tall crop across 1,440 being nearly 3:1 — and **Meta** gains **Author only** and **Author, updated date and reading time**. Field 7 gains the page rule. **A Line or Fade top divider draws across the top of the photograph** and the panel says so ⚑.
- **Flagged ⚑** — the A1·4 Overlay precondition and its standing panel line; the standfirst withheld; the caption withheld and A26 named; Display 76; on-image text at 100% and 82%; the scrim's computed height rule; Text position and Title size resolving at ≤ 767; **the dark scrim derived at `#090806`, outside the seven roles**; the visually-hidden image carrying the alt; contrast stated as advice rather than computed.

---

### A24·6 — Edge to Edge

- **1 · Descriptor.** Tag, title, standfirst and byline on the page margin, then the feature image breaking the measure and running to both viewport edges with no radius, with the caption returning to the margin beneath it. **The only design in A24 whose picture leaves the grid while its type does not.**

- **2 · Structural descriptor.** `media frame · none · page · one · edge · picture to the viewport edges`
  The category's only `edge` placement. Separates from 4 Image Top on media placement and from 5 Full Bleed on ground — **the type is on the page here and on the picture there.**

- **3 · Archetype.** media frame. **No departure**, and the noteworthy part is that **the break survives every width**: the picture is full bleed at 1440, 834 and 390 alike.

- **4 · Responsive rule. 1440** text on the 1,296 measure at the 72 margin, title 50 on 820, standfirst 19 on 720, gap 40, picture 1,440 at the chosen ratio, caption on the margin 16 below, padding 96 above, the article's 64 below the caption. **1080** unchanged but for the margin. **834** margin 40, title 42, gap 32, picture 834. **≤ 767** margin 20, title 32, gap 24, picture 390, **Panorama holds rather than resolving** ⚑, reading time leaves, padding 64. **Where there is no caption the article's 64 is measured from the picture's edge.**

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `post.feature_image_caption`, `readingTimeSuffix`. Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Image ratio | Landscape 3:2 · Wide 16:9 · Panorama 21:9 |
  | Gap to the picture | Tight 32 · Normal 40 · Loose 56 |
  | Alignment | Left · Centre |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Feature image locked. Cut:** an inset value at wide viewports
  — **a page-level maximum belongs to the page, and the finding goes to the architect.**
- **7 · Data.** The route's `post`. **No zero case.** Tags and authors as in 1 Centred. **The picture is the only field whose absence changes the design, and its absence is answered by dropping it** — the design is still this design.

- **8 · Empty state. No picture → Reflow** ⚑ — **the hand-off to 2 Flush Left is deleted by this pass**: the picture, its caption and the gap above them are dropped, **nothing replaces them**, and the words keep this design's own arrangement, order and measure on the page margin, the article's 64 measured from the byline. **Image ratio, Gap to the picture, Image focus and Caption grey with "Needs a feature image".** The picker still reads Edge to Edge, nothing is switched, and the panel may advise 2 Flush Left — advice, never a switch. **No caption → the picture ends the section** and the article's gap is measured from its edge. No standfirst or tag → their gaps go with them. **In the editor the reflowed state is drawn as it will render.**

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **The full-bleed break is a CSS technique, not a script** — the picture is a child of a full-width wrapper and the margin is on the text — so nothing about this design depends on measurement at runtime.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`; DOM order tag → title → standfirst → byline → figure, matching the visual order at every width. The picture is a `<figure>` with its `<figcaption>`; `alt` from `feature_image_alt`, empty when absent, never the title. **A full-bleed picture is the one element in A24 that can exceed a zoomed viewport's width**, and it does not scroll horizontally: **at 400% zoom it is still the viewport's width and the crop tightens** ⚑. A6's ring at 4 px. Title 13.1:1, caption 5.4:1, credit 4.6:1. Print: as drawn, **the picture printed at the page's own margin rather than bled** ⚑ — a printer's bleed is not a browser's.

- **Repeating items.** None authored; tags and authors as in field 7. Selecting the header gives `post.feature_image_caption` and `readingTimeSuffix`.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **four controls** — **Gap to the picture** kept. `imageCaption` becomes Ghost's `post.feature_image_caption` with **Caption: From Ghost · Hide**; field 4's rule that the article's 64 is measured from the caption or the picture is unchanged. **Image focus** joins the Post block — a viewport-wide 21:9 crop is the widest thing A24 draws — with **Avatar** and the two new **Meta** values. New in field 10: **the top divider draws at the page margin, never across the viewport** ⚑, and **Background role takes the type's ground, not the picture's** ⚑ — the photograph bleeds past it either way. Field 7 gains the page rule.
- **Flagged ⚑** — the caption returning to the margin while the picture does not; no radius as a consequence rather than an exception; Panorama holding at 390 where 4 Image Top resolves it; the break becoming nearly invisible at 390 and the panel saying so; the article's gap measured from the caption or the picture depending on which exists; print at the page margin; the wide-viewport maximum named as a page-level finding.

---

### A24·7 — Card

- **1 · Descriptor.** The header inside one surface card at the content width: the picture filling a 476 column, cover-cropped to whatever height the words produce, and the tag, title, standfirst and byline in the other at 40 px of card padding. **A19·3's card reused verbatim with one change — it is not a link — and the only A24 design on a `surface` ground.**

- **2 · Structural descriptor.** `split · card · surface · one · left · the header on a plane`
  Containment `card`: the section itself sits in one, which is the case the brief says the value is for. Separates from 3 Split on containment, ground and media side, and from 9 Overlap on ground and media placement.

- **3 · Archetype.** split. **Two departures, both stated in the floor as exceptions:** below 767 the picture stacks **inside** the card rather than above the section, and **the plate is dropped rather than stacked** when there is no picture at that width.

- **4 · Responsive rule. 1440** card 1,296 on the 72 margin, radius 8, picture 380/476/560 filling its column, card padding 28/40/56, title 40, standfirst 18, byline 13, padding 96 above, the article's 64 measured from the card's edge. **1080** card 936, picture 300/380/440. **834** card 754, **picture 240/300/360, card padding 20/28/40**, title 34, padding 80. **≤ 767** card 350, **picture stacks inside the card at 16:9 full width**, card padding 16/20/28, title 30, reading time leaves, padding 64.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image` + `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix`. **Not drawn:** `post.feature_image_caption` ⚑ — **a caption inside a card has no edge to sit under and outside it belongs to nothing**; the panel names 3 Split as the design that carries one.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Card style | Hairline · Filled · Filled with a hairline |
  | Image side | Left · Right |
  | Picture width | Narrow 380 · Comfortable 476 · Wide 560 |
  | Title size | Small 34 · Medium 40 · Large 50 |
  | Card padding | Compact 28 · Comfortable 40 · Spacious 56 (a genuinely different ladder, kept) |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four, all live. **Cut:** a radius control, a shadow strength, an image
  ratio.
- **7 · Data.** The route's `post`. **No zero case.** Tags and authors as in 1 Centred. **The card's height is set by the words at every setting** — a two-line title with no standfirst gives a 220 px card, a four-line title with three lines of standfirst gives 420 — **and the picture re-crops rather than letterboxing.**

- **8 · Empty state. No picture → Plate** — A17's tag plate at the picture's box exactly, uncapped, carrying the primary tag at eyebrow size and `aria-hidden`, because the tag is already in the words beside it. **With no tag either, the plate is the flat plate tone and carries nothing. Below 767 the plate is dropped**, its justification being an alignment that no longer exists. No standfirst → the card shortens. **In the editor the plate is what renders**, with a line naming the cause — **the one design in A24 whose editor state and live state are the same thing.**

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **The card is not a link and carries no click target** ⚑ — A19·3's is, because there the card is about another post; here the reader is already on it, and a header that navigates to itself is a trap.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`; the card is a `<div>` with no role, no `tabindex` and no label of its own. DOM order tag → title → standfirst → byline → image at both Image side values. **The plate is `aria-hidden` and never announced. Focus rings inside the card are inset to −4** (A17·18) where a link meets the card padding. Targets 44. Title 12.9:1 on surface light and 12.6:1 dark; standfirst 5.1:1 and 5.6:1. Print: **the card prints as its contents on white with the hairline kept and the fill dropped** ⚑.

- **Repeating items.** None authored; tags and authors as in field 7. Selecting the header gives `readingTimeSuffix`; selecting the picture opens Ghost's own feature-image field.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **five controls** — and **Card padding** is kept as a genuinely different ladder, each row now naming the other so the two are not read as one. **No Caption row is added, and the shared field list is corrected instead:** the list said this design read `imageCaption` and **the design never drew a caption** ⚑ — a caption inside a card has no edge to sit under and outside it belongs to nothing. **Image focus** joins the Post block and earns more here than anywhere: this picture has no ratio, filling its column at whatever height the words produce, so every title rewrite re-crops the photograph. **Avatar** and the two new **Meta** values join as category-wide. **Background role offers Background · Surface only** — Contrast is refused with its reason, a contrast card being 8 Contrast Band with a radius ⚑ — and **a top divider above a card reads as a mistake**, so None is the default with the reason shown. Field 7 gains the page rule.
- **Flagged ⚑** — the picture with no ratio, filling its column; the card's height set by the type; two spacing controls in one panel; the caption withheld; the plate uncapped and then dropped below 767; the card deliberately not a link where A19·3's is; the article's 64 measured from the card's edge; the fill dropped in print.

---

### A24·8 — Contrast Band

- **1 · Descriptor.** The tag, title, standfirst and byline left-aligned inside a full-bleed band of the pack's `contrast` colour, 400 px minimum, flush under the nav, every colour in it derived from the band's own text. **The category's only inverted ground and its only zero padding value.**

- **2 · Structural descriptor.** `stack · none · contrast · one · none · inverted band`
  Containment `none`: the band is the section's ground, not a box it sits in — A34·3's reading, unchanged. **Separates from 2 Flush Left on ground alone**, which is the brief's own example of a legitimate pair.

- **3 · Archetype.** stack. **One departure: at ≤ 767 Edge Inset resolves to Full bleed** — a 350 px inverted rectangle with page either side is a card, and this design is not one.

- **4 · Responsive rule. 1440** band full bleed, 320/400/480 minimum, contents on the 72 margin and the 820/720 measures, title 50, derived muted, padding Flush by default, the article's 64 from the band's lower edge. **1080** unchanged. **834 band 280/340/400**, contents on the 40 margin, title 42, standfirst 18. **≤ 767 band 240/300/360**, margin 20, title 32, reading time leaves, **Edge Inset resolves to Full bleed. The band's height is a minimum at every width and grows with its contents.**

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `tags[]`, `authors[]`, `published_at`, `reading_time`; `feature_image` + `feature_image_alt` and `post.feature_image_caption` **only when the user turns Feature image back on**, and then below the band. Authored: `readingTimeSuffix`, `post.feature_image_caption` (conditional). Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Band height | Compact 320 · Comfortable 400 · Spacious 480 |
  | Alignment | Left · Centre |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Edge | Full bleed · Inset |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | this design's ladder, **0 · 64 · 96** — Compact is the retired Flush value and is the default |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Feature image set to Off. Cut:** a band colour, an accent
  underline on the title (2.31:1 in dark, A34·8's measurement).
- **7 · Data.** The route's `post`. **No zero case.** Tags and authors as in 1 Centred, drawn in the derived muted. **Turning Feature image on adds a picture below the band** at the content measure with 20 px above it, its radius and its caption; the band's height does not change.

- **8 · Empty state. No picture is the default state, not an empty one.** No standfirst → the band keeps its minimum height and the type centres in it. No tag → the eyebrow is removed. **In the editor an empty band is never drawn** — there is always a title — and **the one editor-only line this design carries sits beneath the band rather than inside it** ⚑, because a notice on a contrast ground would need a fourth derived colour (A34·8's finding, inherited).

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`mode-toggle` touches this design from a distance**, as it does A34·8: the band's two colour pairs are chosen by `prefers-color-scheme`, which is pure CSS (FR-E4), so **the inversion happens with JavaScript off.**

- **10 · Accessibility.** `<header>` with the page's one `<h1>`; DOM order tag → title → standfirst → byline. **Measured on the band, both modes:** title 15.2:1 light and 14.9:1 dark; standfirst and eyebrow 5.3:1 and 4.9:1; avatar initials 8.1:1 and 9.4:1. **Focus is A6's ring in the band's own text colour, not accent** — the same inheritance A34·8 recorded, and for the same measured reason. **The tag link's hover underline is also the band's text colour rather than accent** ⚑, which makes this the one design in A24 that spends no accent at all in either mode. Print: **the band's ground is not printed and the section prints as itself** — its contents on white, in the same arrangement, order and measure, title 26 pt (A17·7). **The old "prints as 1 Centred on white" is deleted:** a design that loses its ground in print is still this design.

- **Repeating items.** None authored; tags and authors as in field 7. Selecting the header gives `readingTimeSuffix`, and `post.feature_image_caption` only while a picture is showing.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing**, and **this design's ladder resolves 0 · 64 · 96** ⚑ — **Compact is the retired Flush value**, it is the default, and no fourth value is invented; **Band height** stays as the band-internal ladder. **Four controls.** **Background role is locked to Contrast** with the reason shown, the band being the design; **Top divider greys at Compact**, a band flush under the nav having no seam to draw one in ⚑. The Post block gains **Avatar**, plus **Image focus** and **Caption: From Ghost · Hide** — both greyed until Feature image is turned back on — and `imageCaption` is replaced by Ghost's `post.feature_image_caption` in fields 5, 7 and Repeating items. **Meta** gains **Author only** and **Author, updated date and reading time**, drawn in the band's derived muted. Field 7 gains the page rule.
- **Flagged ⚑** — Feature image set rather than locked, with the picture's destination drawn; the Flush padding value and its resolution at Edge Inset; Compact staying 64 where A17·7 raised it, with the reason; the band's height as a minimum; both derived tones in both modes; the editor notice below the band; hover and focus in the band's text colour, spending no accent; Edge Inset resolving at ≤ 767; the picture's own 20 px gap.

---

### A24·9 — Overlap

- **1 · Descriptor.** A photograph at the content measure, 520 tall, with a 700-wide surface card inset 40 from its left edge and riding 80 px over its lower edge; the eyebrow, title, standfirst and byline are all inside the card, and the caption sits beneath it. **The only design in A24 whose picture is the ground its text sits over, and the only one that needs no scrim to do it.**

- **2 · Structural descriptor.** `media frame · card · page · one · background · card overlapping the picture`
  Containment `card`: the section's own contents are in a card, unlike the item-level cards the floor warns about. Ground `page` because the picture is an object on the page at the measure, not the section's ground; **media `background` because the card is over it.** Separates from 7 Card on media and ground, and from 5 Full Bleed on containment.

- **3 · Archetype.** media frame. **One departure: at ≤ 767 Overlap resolves to 0** and the card meets the picture's lower edge, both radii squaring off on that line — the archetype's ladder would keep the overlap and there is not enough width for it.

- **4 · Responsive rule. 1440** picture 1,296 × 420/520/620 on the 72 margin, card 620/700/800 inset 40, overlap 48/80/120, title 34/40/50, caption below the card, the article's 64 from the caption. **1080** unchanged, picture 936. **834** picture 754 × 320/380/440, card 560/640/700 inset 28, overlap 32/56/80, title 34, standfirst 18. **≤ 767 overlap 0**, picture 350 × 180 minimum, card on the full 350 measure with 24 padding, title 28, reading time leaves, caption below the card at 12 px above it.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image`, `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `post.feature_image_caption` (optional, 90 ch), `readingTimeSuffix`. Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Picture height | Compact 420 · Comfortable 520 · Spacious 620 |
  | Card width | Narrow 620 · Comfortable 700 · Wide 800 |
  | Overlap | Slight 48 · Comfortable 80 · Deep 120 |
  | Alignment | Left · Centre |
  | Title size | Small 34 · Medium 40 · Large 50 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four with **Feature image locked to From the post. Cut:** a card-style
  control (7 Card's, unavailable here — the card always needs its edge), a shadow control, a ratio
  control (Picture height governs the crop).
- **7 · Data.** The route's `post`. **No zero case** — a post header has one post. **Tags:** 0 removes the eyebrow and the card closes by 24; 1 draws it; 3 draws three dot-separated; 4+ draws the first three silently. **Authors:** 1 as drawn; 2 join with "and", avatars overlapping at −8 with a 2 px ring in the card's own surface colour; 3+ draw the first name and "and others" with three avatars. **The picture is the design's ground, and its absence is answered by hiding it — the card renders without it.**

- **8 · Empty state. No picture → Hide** ⚑ — **the hand-off to 7 Card is deleted by this pass**: the picture is not drawn and **no plate, placeholder or striped rectangle replaces it**, while **the card stays at its Card width on the page ground at the page margin**, keeping its padding, its hairline and its shadow, and the article's 64 is measured from the card. **Picture height and Overlap grey with "Needs a feature image"**; Card width, Alignment and Title size still govern. The Design picker still reads Overlap, nothing is switched, and the panel may advise 7 Card — advice, never a switch. No standfirst → the card closes by 20 and keeps its padding. No tag → the eyebrow is removed. **No caption → nothing renders and the article's 64 is measured from the card** ⚑, which is the only case where the header's last element changes identity.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical** — the overlap is a negative margin and the card is a div. Edit-safe. **`lightbox` was considered and refused**, as it is category-wide: A14 and A33 own the picture that opens, and a header photograph that opens a viewer puts a reader somewhere other than the piece they came to read.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`; DOM order picture → tag → title → standfirst → byline → caption, which is also the visual order. **The picture is a `<figure>` and the caption its `<figcaption>` even though the card sits between them in the flow** ⚑ — the card is a sibling inside the figure, positioned by margin, so the caption keeps its association. `feature_image_alt` or an empty alt, never the title. **Measured on the card:** light title 13.8:1, standfirst 5.4:1; dark title 12.6:1, standfirst 5.6:1. **Focus is A6's ring at −4 inset for the tag link** (A17·18) because it sits near the card's edge. Print: prints as drawn, picture and card in flow, title 26 pt.

- **Repeating items.** None authored. `tags[]` and `authors[]` are Ghost's and behave as in field 7. Selecting the header gives `post.feature_image_caption` and `readingTimeSuffix`; both may be left empty. **Nothing inside the card is separately selectable** — the card is the section's own geometry, not an item.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **five controls**. `imageCaption` becomes Ghost's `post.feature_image_caption` with **Caption: From Ghost · Hide**; field 8's caption rule and field 10's figure/figcaption association across the card are unchanged. **Image focus** joins the Post block and matters unusually much here — the card sits over the picture's lower left, so a centre crop can put the subject behind it ⚑ — with **Avatar** and the two new **Meta** values. **Background role moves the ground behind the picture and around the card; the card itself stays surface at every value** ⚑. Feature image stays locked, and **the hand-off to 7 Card is deleted** — the card renders on the page ground and the panel may advise 7 Card. Field 7 gains the page rule.
- **Flagged ⚑** — the stepped title ladder holding at every Card width; the caption's position below the card and its effect on the article's gap; Overlap resolving to 0 at ≤ 767 and the squared radii there; the accent hairline in dark and its measured reason; the A1·4 Overlay precondition; the picture crops shortened in these frames; the figure/figcaption association across the card.

---

### A24·10 — Big Type

- **1 · Descriptor.** The title at 88 px across the full 1,296 content measure with an eyebrow above it and a byline at 36/15 below, closed by a hairline. **No standfirst and no picture at any setting** — the category's one display moment, its own title ladder, and the only design that takes the content measure rather than the 820 title measure.

- **2 · Structural descriptor.** `stack · none · page · none · none · title at display size`
  Count `none` under the category's stated interpretation: a title, a byline and a rule, and nothing in it repeats. **It is the only `none` in A24**, and it is what separates it from 2 Flush Left and 15 Slim, which share its other four slots.

- **3 · Archetype.** stack. **No departures** — a stack narrows to a stack. Its own ladder is a scale rule, not a collapse rule.

- **4 · Responsive rule. 1440** title 72/88/104 on 1,296, leading 1.04, tracking −.025em, byline avatar 36 with 15 px text, rule full measure. **1080** title 64/76/88 on 936. **834** title 52/60/68 on 754, byline unchanged at 36/15. **≤ 767** title 34/40/46 on 350, **byline returns to the floor's 24/13**, reading time leaves. **Alignment, Meta position and Rule are unchanged at every width.**

- **5 · Content fields.** Read: `title`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix`. **Unread, and this is the shortest read list in the category:** `custom_excerpt`, `feature_image`, `feature_image_alt`, `post.feature_image_caption`, `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`. **All of them survive dormant and every one is drawn by some other design.**

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Title size | Small 72 · Medium 88 · Large 104 |
  | Alignment | Left · Centre |
  | Meta position | Above the title · Below the title |
  | Rule | None · Above the title · Below the meta |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Standfirst and Feature image both inert. Cut:** a weight
  control, a title colour, an avatar-size control (set to Medium by the design, not chosen).
- **7 · Data.** The route's `post`. **No zero case. Tags:** 0 removes the eyebrow and the title moves up 24; 3 dot-separated on one line at 13 px; 4+ draws three. **Authors:** 1 as drawn; 2 join with "and" with two 36 px avatars overlapping at −12 ⚑ (the floor's −8 is for 24 px circles and does not scale); 3+ the first name and "and others". **At Meta Date only the avatar leaves with the name** and the row is a single 15 px date.

- **8 · Empty state. Not applicable to the picture or the standfirst — neither is ever drawn**, at any setting, so there is no absence to answer for. No tag → the eyebrow is removed and nothing replaces it. **At Meta Off the byline row is removed and the rule stays** ⚑, which leaves a title, a hairline and the article; that is the minimum this design can draw and it is still a composition.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`typewriter` was considered and refused here specifically**, as the floor records: it is the one design in the library where a typed title would be tempting, and the title is the page's `h1` — a heading that assembles itself is a heading a reader waits for and a crawler reads twice.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order follows the visual order at both Meta positions** — tag, byline, title at Above; tag, title, byline at Below — **so the control changes the markup and not just the CSS** ⚑. The rule is `aria-hidden`. **Measured:** light title 13.8:1, byline 5.4:1 at 15 px, eyebrow 5.4:1; dark title 15.1:1 at weight 600, byline 6.2:1. Focus is A6's ring at 4 px on the tag and byline links. **Print: as drawn, title 26 pt** — the ladder does not survive print and no design's does.

- **Repeating items.** None authored. `tags[]` and `authors[]` as in field 7. **Selecting the header gives one field, `readingTimeSuffix`** — the smallest editable surface in A24, and the design is the argument for why that is acceptable: everything else on the frame is the post's own.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **four controls** — and the design's own **Meta** row is renamed **Meta position** ⚑, ending the collision with the block field of the same name that field 4 had already avoided. **Field 6's cut "avatar-size control" is withdrawn:** the Post block's **Avatar** row carries it at **Medium 36** by default, matching the 36/15 byline, and steps to Small 24 below 767 with the rest of the row. **Meta** gains **Author only** and **Author, updated date and reading time** — at 36/15 an updated line is legible where it is marginal elsewhere. **No Caption and no Image focus row:** both travel with the picture, and Feature image is inert. `imageCaption` is deleted from the library. **At Background role Contrast this design is 8 Contrast Band at display size** ⚑, which the panel says rather than refusing the value. Field 7 gains the page rule.
- **Flagged ⚑** — the design's own title ladder at all four widths; leading 1.04 and tracking −.025em; the byline's step to 36/15 and its return to 24/13 below 767; the two-avatar overlap at −12; the rule's two colours by position; the standfirst refused with the reason and the excerpt kept; the dark-mode weight step at 600 and the pack finding behind it; the eyebrow travelling with the meta at Meta Above.

---

### A24·11 — Dateline

- **1 · Descriptor.** The title on the 820 measure with the byline broken into four equal labelled cells on the full 1,296 below it, hairlines above, below and between. **The category's only table, its only design where the meta is the composition, and the only one that narrows a Post block field.** No standfirst, no picture at any setting.

- **2 · Structural descriptor.** `table · none · page · few · none · facts in labelled cells`
  Count `few`: the cell is the repeating unit and there are two, three or four of them — one of the two designs in A24 that reach `few`, and it rests on the category's stated interpretation of the slot. **Archetype alone separates it from 14 Share Row**, which shares its other four slots.

- **3 · Archetype.** table. **Two departures: at 834 four cells become two by two** rather than four narrow columns, and **at Cells 3 the third cell takes the whole second row**; **at ≤ 767 every setting collapses to Labels Inline's stacked rows**, which is the archetype's own ladder arriving early. **The archetype names the collapse, not the markup** — the cells are a `<dl>`.

- **4 · Responsive rule. 1440** title 50 on 820, four cells on 1,296 at 324 each, label 13 px uppercase muted above a 15 px value, cell padding 20/24, rules on the content measure. **1080** cells on 936 at 234 each; unchanged otherwise. **834** title 42, **cells two by two** on 754, an inner vertical and a horizontal between rows. **≤ 767** title 32, **cells become full-width rows** — label in a fixed 120 column, value beside it, hairline under each — **reading time stays**, the avatar returns.

- **5 · Content fields.** Read: `title`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `bylinePrefix` (optional, 16 ch, default "Written by" — **one of two designs that read it**), `readingTimeSuffix` (default "min read", drawn as the cell's value). Unread: `custom_excerpt`, `feature_image`, `feature_image_alt`, `post.feature_image_caption`, `shareLabel`, `copiedLabel`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Cells | **a number picker, 2 to 4, default 4** — the + is greyed at four with the reason visible |
  | Cell position | Above the title · Below the title |
  | Labels | Above the value · Inline |
  | Rules | Full · Between cells · None |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four: **Meta narrowed (Off removed, struck through with its reason)**,
  Standfirst and Feature image inert. **Cut:** per-cell labels, cell order, a fifth cell.
- **7 · Data.** The route's `post`. **No zero case. Tags:** at Cells 4 the tag fills the fourth cell and the eyebrow is removed; 3 tags draw dot-separated inside that cell and it grows in height; 4+ draw three; **0 removes the fourth cell entirely and the remaining three redivide the measure.** At Cells 2 and Three the eyebrow returns above the title and behaves as it does everywhere else. **Authors:** 1 as drawn with a 24 px avatar; 2 join with "and" and **the avatar leaves** ⚑ (two overlapping circles plus two names in a 324 cell wraps to three lines); 3+ the first name and "and others". **The avatar also leaves at Cells 2 and Three**, where the cells are wider but the value is a name in a half-width box.

- **8 · Empty state. A cell with no value is never drawn** ⚑ — it is removed and the row redivides. That is the design's whole empty-state rule and it applies to every cell: no tag removes Filed under; a post with no reading time (Ghost always supplies one) would remove Reading time. **At Cells 2 with no tag the row is two cells and the header still reads.** The picture and the standfirst are never drawn, so their absence is not a case. **In the editor a post with no author** — which Ghost does not permit — **would draw the row with Written by absent and one line naming it.**

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. The cells are a grid and the hairlines are borders; nothing here has a state.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **The cells are one `<dl>` of `<dt>`/`<dd>` pairs**, so a screen reader reads "Written by, Marguerite Okonjo" and not four unlabelled fragments; **not a `<table>`**, because there is no second row to relate a cell to. The date is a `<time datetime>`. DOM order follows Cell position. **Measured:** light value 13.8:1, label 5.4:1; dark value 15.1:1, label 6.2:1; hairlines are decorative at 1.5:1 and are borders, not content. **The author and tag values are links at a 44 px target**; the date and reading time are not links anywhere in A24. Print: as drawn with the rules kept, title 26 pt.

- **Repeating items. None authored — and this is the design where that is least obvious**, because the cells look like an item list. **They are not:** Cells is a single value written onto the section, the four cells are fixed facts in a fixed order, and there is no Add, Remove or reorder. `tags[]` and `authors[]` are Ghost's, as in field 7. Selecting the header gives `bylinePrefix` and `readingTimeSuffix`; both may be left empty, and an empty `bylinePrefix` draws the cell with no label ⚑ — the only labelless cell the design allows, because the user asked for it.


- **Reconciled.** **Field 5 gains three authored strings** ⚑ — `filedLabel` "Filed under", `publishedLabel` "Published", `readingTimeLabel` "Reading time", 16 characters each, joining `bylinePrefix`: **the cell labels were fixed English on a visitor-facing page** and are now fields, inline-edited on the cell, an empty one drawing a labelless cell exactly as `bylinePrefix` already did. **`publishedLabel`'s default follows the Meta value** ⚑ — "Updated" at Author, updated date and reading time, because a cell reading "Published" over an updated date is a lie the user has to notice. **Padding** is struck for the universal **Vertical spacing** — **five controls**; cell padding is the table's own and was never a control. **Meta keeps Off struck through** and gains the two new values: **Author only** removes the Published and Reading time cells and the row redivides, by this design's own empty-cell rule. The Post block gains **Avatar**, which does not alter this design's three avatar departures. **No Caption and no Image focus row** — Feature image is inert, and the panel still names 4 Image Top for a dateline with a picture. Field 7 gains the page rule.
- **Flagged ⚑** — cells on 1,296 against a title on 820; the tag moving into the fourth cell at Cells 4 and the eyebrow leaving; the label using A1's eyebrow treatment with the value louder than the label; the avatar's three departures (present at Four, absent at Two and Three, absent with two authors, back below 767); Labels Inline taking the 720 measure; Cells 3's full-width second row at 834; reading time staying below 767; a valueless cell being removed rather than drawn empty; the `<dl>` against the `table` archetype name; an empty `bylinePrefix` drawing a labelless cell.

---

### A24·12 — Rail

- **1 · Descriptor.** A 240 px rail on the left holding the tag, the byline, the date and the reading time one to a line at 15 px, a vertical hairline, a 72 px gap, then the title on 820 and the standfirst on 720 in a 984 column with the photograph beneath them at the column's full width. **The category's one edge rail, and the one design that reads a Post block field as a line count.**

- **2 · Structural descriptor.** `edge rail · none · page · one · bottom · meta in a side rail`
  Archetype is the distinguishing slot: it shares `page · one · bottom` with 1 Centred and 16 Two Column and is neither a stack nor a split — **the rail is a fixed column beside a fluid one**, which is what an edge rail is.

- **3 · Archetype.** edge rail. **One departure, and it is the floor's stated exception: at 834 the rail becomes a row above the title** rather than dropping beneath the content, its lines joined by dots at 15 px with the prefix kept, and its hairline turning horizontal beneath it.

- **4 · Responsive rule. 1440** rail 180/240/300 with a 72 gap, column 1,044/984/924, title 40/50/64 on 820, standfirst on 720, picture at the column width with the chosen ratio, caption beneath, hairline as tall as the rail. **1080** rail unchanged, column 624/564/504 — **the title's measure becomes the column** ⚑ and the stepped ladder does not apply, so a Large title is 64 on 504 and wraps more. **834 rail becomes a row**, everything on the 754 measure, title 42, standfirst 18. **≤ 767** the row wraps after the byline, **reading time stays**, title 32, picture 350.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image`, `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `bylinePrefix` (optional, 16 ch, default "Written by"), `post.feature_image_caption` (optional, 90 ch), `readingTimeSuffix`. **Three authored fields is the most any A24 design reads.** Unread: `shareLabel`, `copiedLabel`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Rail side | Left · Right |
  | Rail width | Narrow 180 · Comfortable 240 · Wide 300 |
  | Rail rule | Hairline · None |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Picture ratio | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four, **Meta reinterpreted as the rail's line count. Cut:** rail
  alignment, a sticky rail, a rail ground (a filled rail is 7 Card's business).
- **7 · Data.** The route's `post`. **No zero case. Tags:** the rail's first line; 0 removes it and the rail's remaining lines move up 18; 3 wrap inside the rail's width, dot-separated, up to four lines at Narrow 180; 4+ draw three. **Authors:** 1 as drawn; 2 join with "and" on up to three lines at Narrow with the avatars overlapping at −8; 3+ the first name and "and others". **Meta's four values set the rail's lines** — three, two, one, or the tag alone. **Meta Off with Tag line Off removes the rail and the column takes the full 1,296** ⚑, the only case where a design's own geometry is decided by two block fields together.

- **8 · Empty state. No picture → Reflow**, A19's first answer: the picture's box and its 40 px gap are dropped, **the rail and the column keep their widths**, and the article's 64 is measured from the standfirst. No standfirst → the column closes by 24. No caption → nothing renders. **Picture ratio greys out at Feature image Off** with "Needs a feature image". **In the editor a rail emptied by both block fields draws its outline greyed with one line naming the two values**, then renders nothing on the site.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. **`scroll-spy` was considered and refused**: it is the module a sticky rail would need, its home is a table of contents in A25, and this rail ends where the header ends.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order is rail then column at both Rail side values** ⚑ — Right moves the rail with CSS order and not in the markup — **so a screen reader always hears the facts before the title.** That is the one place this design's reading order is decided rather than inherited, and it follows the printed dateline it is named after. The rail is a `<dl>` when `bylinePrefix` is present and a plain list of lines when it is not; the date is a `<time datetime>`; the picture is a `<figure>` with its caption. **Measured:** light title 13.8:1, rail value 13.8:1, prefix and eyebrow 5.4:1; dark 15.1:1, 15.1:1, 6.2:1. Tag and author links at 44 px targets. Print: as drawn, rail kept, title 26 pt.

- **Repeating items.** None authored. **The rail's lines are not an item list** — they are fixed facts whose count comes from a block field — so there is no Add, Remove or reorder. `tags[]` and `authors[]` are Ghost's, as in field 7. Selecting the header gives `bylinePrefix`, `post.feature_image_caption` and `readingTimeSuffix`; all three may be left empty. **An empty `bylinePrefix` draws the name with no label above it** and the rail keeps its spacing.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **five controls**. `imageCaption` becomes Ghost's `post.feature_image_caption` with **Caption: From Ghost · Hide**, so **field 5's "three authored fields is the most any A24 design reads" is superseded** — it draws two, `bylinePrefix` and `readingTimeSuffix`. **Meta's interpretation is extended to six values, not broken:** Author only is one rail line, the byline; **Author, updated date and reading time** is three, the date line reading `updated_at` past a day's gap; Author and date is two, Date only is one, and **Meta Off with Tag line Off still removes the rail**. The Post block gains **Avatar** and **Image focus**, and the Feature image Off dependency now greys three rows — Picture ratio, Image focus, Caption. **Background role takes rail and column together** ⚑, which does not reopen the refused rail-ground control. Field 7 gains the page rule.
- **Flagged ⚑** — the rail's values at 15 px in `text` rather than 13 px muted; the picture starting at the column's edge and leaving the rail's width empty; Meta Off keeping the tag, and the two-field interaction that removes the rail; the title's measure becoming the column at 1080; the rail becoming a dotted row at 834 in its own type sizes; reading time staying below 767; DOM order fixed at both Rail side values; the pale-on-dark weight effect left unadjusted.

---

### A24·13 — Sticky

- **1 · Descriptor.** The tag, title and byline left-aligned on the 820 measure, plus a full-bleed 56 px bar that **a script reveals and pins at the top of the viewport** once the resting title has scrolled out of view, carrying the title truncated to one line at 15/600, the reading time, and a 2 px accent progress meter. **The category's only sticky design, its only truncation, and one of only two that declare a module.**

- **2 · Structural descriptor.** `sticky · none · page · one · none · condensed bar on scroll`
  Archetype is the distinguishing slot; the other four are shared with 2 Flush Left, 10 Big Type, 14 Share Row and 15 Slim. **It is the only `sticky` in A24**, and the emphasis phrase names the bar rather than the header, because the header at rest is deliberately ordinary.

- **3 · Archetype.** sticky. **Two departures: Bar height Compact 48 resolves to 56 below 767** (a 48 px bar cannot hold a 44 px target with its padding), and **Bar edge None is disabled in dark** with its reason shown. The archetype's ladder otherwise applies unchanged: the bar is full bleed at every width and its contents keep the page margin.

- **4 · Responsive rule. 1440** resting title 40/50/64 on 820, bar 48/56/64 full bleed with contents on the 72 margin, bar title 15/600 truncated at about 62 characters, reading time right-aligned at 13. **1080** unchanged. **834** resting title 34/42/52, bar unchanged, about 34 characters. **≤ 767** resting title 28/32/36, **bar 56 whatever the setting**, about 26 characters, **reading time leaves the bar and the meta row, the meter stays**, the avatar leaves the bar at Title, meter and byline.

- **5 · Content fields.** Read: `title`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix`. Unread: `custom_excerpt`, `feature_image`, `feature_image_alt`, `post.feature_image_caption`, `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`. **The bar draws no field the resting header does not already draw.**

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Bar height | Compact 48 · Comfortable 56 · Spacious 64 |
  | Bar contents | Title · Title and meter · Title, meter and byline |
  | Bar edge | Hairline · Shadow · None |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Standfirst and Feature image inert. Cut:** bar position,
  meter colour, a back-to-top glyph, a share button in the bar (14's).
- **7 · Data.** The route's `post`. **No zero case. Tags:** the resting header only — 0 removes the eyebrow, 3 draw dot-separated, 4+ draw three; **the bar never draws a tag** at any count. **Authors:** resting row as the floor; in the bar at Title, meter and byline **only the avatar is drawn, never the name** ⚑ — one avatar for one author, two overlapping at −8 for two, three for three or more, and no "and others" because there is no name to attach it to. **The meter's value is the only thing in A24 that is not in the markup at render.**

- **8 · Empty state.** Neither the picture nor the standfirst is ever drawn, so neither has one. No tag → the eyebrow is removed. **At Meta Off the bar loses its byline and its reading time and is a title and a meter**; at Meta Off with Bar contents Title the bar is a single truncated line, which is the design's minimum and still a control. **In the editor the bar is not drawn at all** — behaviours do not run while editing — **and the panel's warning is the only place the user meets it before publishing** ⚑, which is a gap the picker should close rather than this design.

- **9 · Behaviour module. Declares `reading-progress` for the meter and `header-scroll` for the bar** ⚑ — **new in this pass, and the correction the pass exists for.** The bar was drawn as `position: sticky` and **cannot work that way on any site**: a stuck element holds only inside its own container's box, and this bar's container — the header — has already left the screen at the moment the bar is wanted. **The bar is therefore script-revealed and pinned at the threshold**, which is still the resting title's lower edge. **No module name was invented; both are in the registry.** **Edit-safe:** neither module runs in the editor and the resting header is complete without them. **No-JS, and the registry's line now reads literally:** "The bar is hidden entirely (it is decorative)." **With JavaScript off the whole bar is absent** — the condensed bar, its title link, the reading time, the meter and its track — **and nothing is reserved for any of them**; the resting header is unchanged. Reduced motion: the bar appears without its slide, at the same threshold.

- **10 · Accessibility.** `<header>` with the page's one `<h1>` in the resting header. **The bar carries no heading level** and is not a landmark; it is a `<div>` holding an `<a href="#top">` whose accessible name is the **complete, untruncated title** — the visible text is clipped by CSS, never by the string. **The meter is `aria-hidden` and is not a progressbar role** ⚑: a reader's scroll position is not a task's progress, and announcing it would speak over the article. **Focus order is unchanged by the bar** — the module inserts it at the header's end in the DOM, so tabbing goes nav, header links, bar link, article. **Measured:** bar title 13.8:1 light and 15.1:1 dark; meter 3.1:1 and 4.4:1 against its track as non-text. Print: **the bar and the meter print nothing**; the resting header prints as drawn at 26 pt.

- **Repeating items.** None authored. `tags[]` and `authors[]` as in field 7. Selecting the header gives `readingTimeSuffix`, which the bar draws as well as the meta row, so **one authored string appears twice on the page** — the only place in A24 where that happens.


- **Reconciled.** **Field 8's "in the editor the bar is not drawn at all" is superseded, and with it the tenth finding:** the condensed bar is designed through **P0·6's Simulate scroll** entry — the **State** pill in the canvas chrome, the post-threshold bar rendered in place with the article dimmed as editor chrome, the threshold staying this design's own and not editable there. **No sidebar Preview control was added and none existed to remove** ⚑: previewing belongs to the editor. **Padding** is struck for the universal **Vertical spacing** — **four controls** — with **Bar height** kept as the bar's own ladder and **the bar staying on `background` at every Background role value** ⚑, a surface bar over a background page reading as a floating card. The Post block gains **Avatar**, **capped at 24 inside the bar** whatever the row says ⚑ — a 44 px disc does not fit a 56 px bar — and **Meta** gains **Author only** and **Author, updated date and reading time**, neither of which the bar draws. `imageCaption` is deleted from the library. Field 7 gains the page rule.
- **Flagged ⚑** — nothing reserved in the flow for the bar; the bar's threshold being the resting title's lower edge; the one truncation, with the full title kept as the accessible name; the bar's title linking to the top; Bar height fixed at 56 below 767 and Compact resolving there; Bar edge None disabled in dark and Shadow resolving to Hairline; the bar on `background` rather than `surface`; the avatar without the name in the bar; the meter `aria-hidden` rather than a progressbar; the registry mapping for no-JS; the editor never showing the bar.

---

### A24·14 — Share Row

- **1 · Descriptor.** The tag, title, standfirst and byline left-aligned on the 820 and 720 measures, closed by a hairline at 820, with a labelled row of two to four sharing destinations beneath it at 15/600 in `text`. **The only design in A24 with a control a reader can press, and the only one with two authored labels of its own.**

- **2 · Structural descriptor.** `stack · none · page · few · none · share row beneath the meta`
  Count `few`: the link is the repeating unit, two to four of them, under the category's stated interpretation. **Archetype alone separates it from 11 Dateline**; the emphasis phrase is the row's position, which is the design's whole argument. **The proof records it as the design to cut first if one must go**, and the reason to keep it is that A26 owns below and this owns above.

- **3 · Archetype.** stack. **One departure: below 767 the label takes its own line and the links wrap beneath it**; the row wraps and never scrolls at any width.

- **4 · Responsive rule. 1440** title 40/50/64 on 820, standfirst 720, hairline 820, row on one line — label at 13 muted, links 15/600 at 24 px gaps on 44 px targets. **1080** unchanged. **834** title 34/42/52, hairline and everything on the 754 measure, row still one line. **≤ 767** title 28/32/36, reading time leaves the meta, **label on its own line, links wrap under it to two lines at Links 4**, gaps and targets unchanged.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `tags[]`, `authors[]`, `published_at`, `reading_time`, **`post.url` — the only design that reads it.** Authored: `shareLabel` (optional, 24 ch, default "Share this piece"), `copiedLabel` (optional, 24 ch, default "Link copied"), `readingTimeSuffix`. Unread: `feature_image`, `feature_image_alt`, `post.feature_image_caption`, `bylinePrefix`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Links | **a number picker, 2 to 4, default 4** — drawing the first N of the site's enabled share destinations, in the site's own order; the + is greyed at four with the reason visible |
  | Link style | Words · Words and glyphs |
  | Alignment | Left · Centre |
  | Divider | Hairline above · None |
  | Title size | Small 40 · Medium 50 · Large 64 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then a Content group holding the two labels, then the block's four with **Feature image
  inert. Cut:** a per-platform picker, a "Share on" prefix, a row position, a share count.
- **7 · Data.** The route's `post`, plus `post.url` and `post.title` as the share payload — **the title is sent unshortened and the row sends no excerpt** ⚑. **No zero case. Tags:** as the floor. **Authors:** as the floor; the row does not name them. **The link count is the design's own value and not data**, so there is no 0, 1 or many case for it: **the row is two to four links and cannot be fewer** except with JavaScript off, where Copy link is hidden.

- **8 · Empty state.** No picture is the permanent state. No standfirst → the header closes by 20. No tag → the eyebrow is removed. **At Meta Off the hairline and the row move up under the standfirst** and the row is the header's last element either way. **An empty `shareLabel` draws the row starting with its first link**, keeping the hairline; **an empty `copiedLabel` falls back to "Link copied" rather than confirming nothing** ⚑ — the only authored field in A24 that cannot be genuinely empty, because it is a state and not a label.

- **9 · Behaviour module. Declares `share`. Edit-safe:** the links are inert in the editor and the row is drawn at rest. **No-JS, quoted from the registry:** "Share links are real `<a href="https://…">` URLs and work normally; only the copy-link button is hidden." **At Links 2 that leaves Email alone** ⚑, which is why **Email is present in all three values** — the row is never empty without JavaScript at any setting. Reduced motion: the copied state's 160 ms colour transition is dropped and the word changes at once.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **The row is a `<ul>` whose label is `shareLabel` via `aria-labelledby`**, not a heading; three items are links and **Copy link is a `<button>`**. Each link's accessible name includes its destination — "Share on Bluesky" — so a screen reader is not read four bare platform names. **The copied state is announced by one visually-hidden `aria-live="polite"` region**; focus stays on the button and the button's name does not change. Focus is A6's ring at 4 px. **Measured:** links 13.8:1 light and 15.1:1 dark; label 5.4:1 and 6.2:1; **the copied word 3.6:1 light and 7.4:1 dark, with the light value failing AA and passing on the stated grounds that the colour is not the message.** Print: **the share row prints nothing**; the rest prints as drawn at 26 pt.

- **Repeating items. None authored — and this is the design that came closest to having one.** The row's links repeat, but the set is fixed, the order is fixed, and **the count comes from one design control written onto the section** — a number picker, 2 to 4 — so there is no Add, no Remove and no reorder here; **the list itself is the site-wide Share-destinations setting**, where the shared item-list controls apply and **Remove stays visible and clickable at the floor** with its reason. **Order is meaningful and is not the user's:** the two account-free destinations are last, Copy link last of all. Selecting the header gives `shareLabel`, `copiedLabel` and `readingTimeSuffix` — three text fields, no per-link editing, and **no link's own text is editable**: a destination named something other than its destination is a broken link that looks fine.


- **Reconciled.** **Field 6's Links values are re-based on one site-wide ordered Share-destinations setting** ⚑ — X · Facebook · LinkedIn · Bluesky · Mastodon · Threads · WhatsApp · Reddit · Email · Copy link, which the owner orders and enables once with P0·3's controls **in the setting, never in this panel**, **Two · Three · Four drawing the first N enabled**. It ships with all ten present and four enabled in the order this design drew, so nothing moves on a site that never opens it — and **the cost this design admitted, "a site that shares to LinkedIn cannot", is paid off**. **Three earlier rulings are superseded rather than deleted:** the fixed list, the "order is meaningful and is not the user's" argument, and the rule that Email must be present in all three values. The no-JS floor is restated instead: **every destination but Copy link is a real `<a href>`, so the row survives with JavaScript off unless Copy link is the only enabled destination** — which the setting allows and the panel warns about. **Glyphs are fixed per-platform brand icons** from P0·2's Social / Brands group — Tabler `brand-bluesky`, `brand-mastodon`, `mail`, `link` — **resolved by destination, never editable slots** ⚑, which answers the flagged "glyphs drawn as boxes pending a pack icon set"; **Copy link, the category's one button, takes no P0·2 button icon** for the same reason. **The Mastodon instance becomes a site setting**, editable, defaulting to `mastodon.social` ⚑. **"Email" and "Copy link" become translation-catalog strings**, as is the "Share on {destination}" accessible-name pattern. `shareLabel` and `copiedLabel` stay authored and edit inline with P0·1. **Padding** is struck for the universal **Vertical spacing** — **five controls**, the site setting and the block not counted; the Post block gains **Avatar** and the two new **Meta** values. Field 7 gains the page rule. **ARCHITECT: site setting.**
- **Flagged ⚑** — links as words in `text` with no brand colour; the hairline at the title's 820 rather than the row's width; Copy link being a button among links; Mastodon's instance problem and the `mastodon.social` default; the copied word in accent at 3.6:1 light with its justification; the box holding the wider string so nothing reflows; glyphs drawn as boxes pending a pack icon set; Email present in all three values because of the no-JS degradation; `copiedLabel` falling back rather than being empty; the live region; Links as a count rather than a picker, and the LinkedIn case it costs.

---

### A24·15 — Slim

- **1 · Descriptor.** The title at 28 px on the article's own 720 measure with the meta line — tag, date, reading time — baseline-aligned at its right, and a hairline under both. **44 px tall at its default.** No standfirst, no picture, no avatar, and the only design in A24 with both its own title ladder and its own padding ladder.

- **2 · Structural descriptor.** `bar · none · page · one · none · one line above the article`
  **The category's one `bar`.** It shares its other four slots with 2 Flush Left, 10 Big Type, 13 Sticky and 14 Share Row, and the proof names it and 2 Flush Left as the closest pair in A24 — separated by archetype and by scale, 28 px against 50.

- **3 · Archetype.** bar. **One departure: below 767 Layout's one-line value resolves to Meta beneath the title**, and the author's name returns with it. **Measure has no effect at 834 and below**, where both values are the page measure; the control stays enabled.

- **4 · Responsive rule. 1440** title 24/28/34 at 1.25 leading and −.015em, meta 13 px muted baseline-aligned, measure 720 or 1,296, rule on the header's measure, padding 48/64/96 above. **1080** unchanged; Measure Content is 936. **834** title 22/26/30, padding 48 flat, both Measure values are 754. **≤ 767** title 20/22/26, **padding 40** — below the floor's 64, this design only — **one line resolves to meta beneath**, reading time leaves, the name returns.

- **5 · Content fields.** Read: `title`, `tags[]`, `authors[]`, `published_at`, `reading_time`. Authored: `readingTimeSuffix` — **drawn as "min" rather than "min read" at Layout one line** ⚑, which is the one place in A24 an authored string is shortened by a design; at Meta beneath it is drawn whole. Unread: `custom_excerpt`, `feature_image`, `feature_image_alt`, `post.feature_image_caption`, `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Title size | Small 24 · Medium 28 · Large 34 |
  | Layout | Title and meta on one line · Meta beneath the title |
  | Rule | Above · Below · None |
  | Measure | Article 720 · Content 1,296 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 48 · Comfortable 64 · Spacious 96 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Five, then the block's four with **Standfirst and Feature image inert. Cut:** alignment, an
  avatar step, a date format, a fourth title size.
- **7 · Data.** The route's `post`. **No zero case. Tags: the meta line's first term, not a slot above the title** — 0 starts the line at the next term, 1 as drawn, **3 draws only the primary tag at Layout one line** ⚑ (three tags plus a date plus a reading time is a 300 px meta column against a 28 px title) and all three at Meta beneath; 4+ draws three there. **Authors:** the name is absent at Layout one line with Measure Article and present in every other combination; **2 authors join with "and"**; 3+ draw the first name and "and others". **No avatar at any count** — the one design in A24 that draws none.

- **8 · Empty state.** Neither the picture nor the standfirst is drawn, so neither has one. No tag → the meta line starts at the next term. **At Meta Off the line is the tag alone, right-aligned**; with Tag line Off as well, **the header is a title and a rule** ⚑ — 30 px tall, and still a header, which is the smallest thing A24 renders. **In the editor that state draws one line naming the two values**, because a user who has switched from another design may not know where their meta went.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. Nothing here has a state, a threshold or a transition.

- **10 · Accessibility.** `<header>` with the page's one `<h1>` at 28 px — **a heading's level is not its size, and this is the design that proves the theme means it**. DOM order is title then meta at both layouts, so the one-line arrangement is a flex row and not a reordering. The date is a `<time datetime>`; the tag is a link at a 44 px target, **which is 31 px taller than the 13 px line it sits in** and is met with padding rather than with a visible box. Focus is A6's ring at 4 px. **Measured:** title 13.8:1 light and 15.1:1 dark; meta 5.4:1 and 6.2:1; rule decorative. Print: as drawn, **title at 18 pt rather than the category's 26** ⚑ — printing a slim header at 26 pt would make it the largest thing on the page.

- **Repeating items.** None authored. `tags[]` and `authors[]` as in field 7. **Selecting the header gives one field, `readingTimeSuffix`**, and it may be left empty — the line then reads "Reporting · 12 March 2026 · 9", which is the one case where an empty authored field produces something a user probably did not intend, and the panel's placeholder says so.


- **Reconciled.** **An empty `readingTimeSuffix` now falls back to its default** ⚑ — the Repeating-items line that ended "Reporting · 12 March 2026 · 9" is struck: a bare numeral was the one case where an empty authored field produced something no user intended, and `copiedLabel` already fell back the same way in 14 Share Row. The shortening to "min" at Layout one line is unchanged, that being the design's own rule rather than a fallback. **Padding** is struck for the universal **Vertical spacing** — **four controls** — **carrying this design's own ladder inside it**: 48 · 64 · 96, 48 flat at 834, 40 at 390, the one Vertical spacing in A24 that goes below the floor's minimum. The Post block draws **Avatar inert with its reason** — the only design in A24 that draws no avatar at any count — rather than leaving it out, and **Meta** gains **Author only** and **Author, updated date and reading time**. `imageCaption` is deleted from the library. **At Background role Surface a 44 px header on a plane is a bar**, which is what this design is ⚑. Field 7 gains the page rule.
- **Flagged ⚑** — its own title ladder and its own padding ladder, at all four widths; padding 40 below 767, under the floor's minimum; leading 1.25 and tracking −.015em; the tag as the meta line's first term rather than an eyebrow; the shortened meta at Layout one line — no avatar, no name at Measure Article, "min" for "min read"; the primary tag only at that layout; baseline alignment so a growing title does not move the meta; one line resolving below 767 and the name returning; the title-and-rule minimum state; print at 18 pt.

---

### A24·16 — Two Column

- **1 · Descriptor.** The eyebrow and title in a 612 left column, the standfirst and byline in a 612 right column with a hairline between them, **the two columns bottom-aligned so the standfirst sits on the title's last line**, and the photograph beneath both at the full 1,296 with its caption. **The only design in A24 that touches no Post block field.**

- **2 · Structural descriptor.** `split · none · page · one · bottom · title against its own standfirst`
  Containment `none`: two columns are an arrangement, not a box. **Shares `page · one · bottom` with 1 Centred and 12 Rail and is separated from both by archetype** — the proof names 1 Centred as its closest neighbour and archetype as the whole of the difference.

- **3 · Archetype.** split. **One departure, and it is a clarification rather than an exception:** the floor's rule that a collapsing side-by-side arrangement puts the picture above the text **does not apply here, because the picture was never in a column** — it stays beneath the stacked text at every width. **This design is not a third exception to that rule**; 7 Card and 12 Rail remain the only two.

- **4 · Responsive rule. 1440** columns 612/612, 744/480 or 480/744 with a 48/72/96 gap taken from the columns, bottom-aligned, hairline on the gap's centre line, title 34/40/50, standfirst 19 capped at 720, picture 1,296 at the chosen ratio, caption beneath. **1080** columns 432/432 at Even; **Text-led's standfirst column is 528 and takes it whole. 834 one column** — title, standfirst, byline, picture, caption — **the rule leaves with the columns**, title 34, standfirst 18. **≤ 767** the same, title 28, reading time leaves, picture 350.

- **5 · Content fields.** Read: `title`, `custom_excerpt`, `feature_image`, `feature_image_alt`, `tags[]`, `authors[]`, `published_at`, `reading_time` — **all eight of the post's fields the category reads.** Authored: `post.feature_image_caption` (optional, 90 ch), `readingTimeSuffix`. Unread: `shareLabel`, `copiedLabel`, `bylinePrefix`, `post.url`.

- **6 · Controls, in sidebar order.**

  | Control | Values |
  |---|---|
  | Column split | Even 6/6 · Title-led 7/5 · Text-led 5/7 |
  | Column gap | Tight 48 · Normal 72 · Loose 96 |
  | Rule | Hairline between · None |
  | Title size | Small 34 · Medium 40 · Large 50 |
  | Picture ratio | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact 64 · Comfortable 96 · Spacious 132 (the retired Padding row, under the universal name) |
  | Top divider (universal) | None · Line · Fade |

  Six, then the block's four, **all live at their defaults. Cut:** 8/4 and 4/8 splits, vertical
  alignment, a picture width.
- **7 · Data.** The route's `post`. **No zero case. Tags:** top of the left column; 0 removes the eyebrow and the title moves up 24; 3 dot-separated, wrapping inside the column; 4+ draw three. **Authors:** foot of the right column; 1 as drawn; 2 join with "and" with avatars overlapping at −8 and a 2 px ring in the page colour; 3+ the first name and "and others". **Picture ratio greys out at Feature image Off**, the same dependency 4 Image Top and 12 Rail carry.

- **8 · Empty state. No picture → Reflow:** the picture's box and its 40 px gap are dropped, the columns keep their widths, and the article's 64 is measured from the taller column. **No standfirst → the right column is a byline alone**, bottom-aligned on the title's last line; the panel warns and names 2 Flush Left, and **the column is not removed and the split does not change** ⚑ — a design that silently became one column when an excerpt was missing would be two designs wearing one name. No tag → the eyebrow is removed. No caption → nothing renders and the gap to the article is measured from the picture. **At Meta Off and Standfirst Off together the right column is empty and the rule is removed with it**, leaving a title alone on a 612 column; the editor draws one line naming both values.

- **9 · Behaviour module. None; `core` assumed. No-JS: pixel-identical.** Edit-safe. Two grid columns, a border and a figure.

- **10 · Accessibility.** `<header>` with the page's one `<h1>`. **DOM order is tag → title → standfirst → byline → figure at every width and every split**, so the visual two-column arrangement is a grid over source order and Text-led 5/7 does not reverse anything. The rule is a border and is `aria-hidden`; the picture is a `<figure>` with `<figcaption>`; `feature_image_alt` or an empty alt, never the title. **Measured:** light title 13.8:1, standfirst 5.4:1 at 19 px, meta 5.4:1; dark 15.1:1 and 6.2:1. Tag and author links at 44 px targets; focus is A6's ring at 4 px. Print: as drawn, **the columns collapse to one** and the title is 26 pt.

- **Repeating items.** None authored. `tags[]` and `authors[]` are Ghost's, as in field 7. Selecting the header gives `post.feature_image_caption` and `readingTimeSuffix`; both may be left empty, and an empty caption leaves the picture with nothing beneath it. **Neither column is separately selectable** — they are the section's own geometry, and the two of them hold five elements that the user edits in Ghost.


- **Reconciled.** **Padding** is struck for the universal **Vertical spacing** — **five controls** — and **the claim that this design touches no Post block field is superseded** ⚑: it now carries **Avatar**, **Image focus** and **Caption: From Ghost · Hide**, and **Meta** gains **Author only** and **Author, updated date and reading time**. `imageCaption` is replaced by Ghost's `post.feature_image_caption`, drawn as HTML beneath the picture at the full 1,296, with field 8's "no caption → nothing renders" rule unchanged. **Image focus** matters here on arithmetic: a 1,296-wide crop at Portrait 4:5 is 1,620 tall. The Feature image Off dependency now greys three rows. **The top divider is horizontal and this design's own Rule is vertical**, so the two never meet ⚑. Field 7 gains the page rule.
- **Flagged ⚑** — bottom alignment as the design's premise; the stepped ladder holding at every Column split; the standfirst's 720 cap leaving 24 px at Text-led 5/7; the gap taken from the columns rather than the margin; the rule on the gap's centre line and leaving at 834; the picture beneath both columns and the floor's picture rule not reaching it; the right column kept when the standfirst is absent; the empty-column state at two block fields off; the panel touching no block field, which is the category's only case.

---

## 2 · Component inventory

Every reusable component this category established or reused, cumulative.

| Component | What it is | First from |
|---|---|---|
| Logo lockup | 26 px accent rounded-square mark + wordmark, 10 px gap | A1·1 |
| Nav item | 15 px, muted resting, `text` + 2 px accent underline active | A1·1 |
| Eyebrow | 13 px uppercase at .08em in `text-muted`, a real `<a>` to the tag archive | A1·1 |
| Primary button | accent fill, 14 px/600, padding 9×17, radius token | A1·1 |
| Icon button | 38 px box on a 44 px target, 8 px radius | A1·14, A1·2 |
| Avatar + meta row | 24 px circle, initials fallback, "Name · date" at 13 px | A1·6, A1·7 |
| Focus ring | 4 px offset, −4 inset at a container edge | A6, A17·18 |
| Named ratio ladder | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 | A8 |
| Measure and page margin | 1,296/72 · 754/40 · 350/20 | A17 |
| On-contrast derivation | muted = band mixed 60% to its own text; fill = the 10% step | A17·7 |
| Tag plate | striped/filled plate at a missing picture's box exactly | A17 |
| Missing-picture vocabulary | Reflow · Plate · **Hide** — A24's own third answer, replacing A19's Hand off | A19, **A24** |
| Scrim | bottom-up contrast wash over the lower 60%, three strengths | A19 |
| Surface card | radius token, hairline, `md` shadow, dropped for a hairline in dark | A19·3, A24·7 |
| Overlap card | a card riding a picture's lower edge on a negative margin | A19·7, A24·9 |
| Derived dark hover step | `#2C2721` | A34 |
| Module warning line | a standing line above the controls of any design that declares a module | A34 |
| Struck-through removed value | how a narrowed block field is drawn | **A24·11** |
| Inert block field row | greyed, "Not used here", its reason, and the promise that content is kept | **A24** (2, 10, 11, 13, 14, 15) |
| Labelled cell row | `<dl>` of 13 px uppercase label over a 15 px value, hairlines, equal columns | **A24·11** — A26 should reuse it |
| Fact rail | a fixed 180/240/300 column of 15 px facts with a vertical hairline | **A24·12** |
| Condensed sticky bar | 56 px, `background`, hairline, one-line 15/600 title linking to the top | **A24·13** |
| Progress meter | 2 px accent on a `border` track, `aria-hidden` | **A24·13** |
| Word share row | 15/600 links in `text`, no brand colour, 44 px targets, copied state in accent | **A24·14** |
| Slim header bar | 28 px title with a baseline-aligned meta line and a hairline | **A24·15** |
| Bottom-aligned two-column head | title against its own standfirst, hairline on the gap's centre line | **A24·16** |
| Image credit line | one 12 px muted line under a picture, from `feature_image_caption`, on the page ground at the margin | **A24·5** — A26·14 draws the same field as a row |
| Editable cell label | a 16-character authored label over a Ghost-owned value, empty drawing a labelless cell | **A24·11** |
| Share-destinations setting | one site-wide ordered, enabled list of ten destinations + a Mastodon instance | **A24·14** — A25·9 and A26·9 read it |
| Inert universal row | a universal control drawn greyed with its reason where a design cannot use it | **A24·5** (Vertical spacing), **A24·15** (Avatar) |
| Locked ground row | Background role locked with the reason shown, where the ground is the design | **A24·5**, **A24·8** |

---

## 3 · Findings for the architect

1. **A pack must supply its title tracking and leading with its heading font.** The tokenisation
   proof needs −.02em/1.1 for Georgia and −.03em/1.08 for both derived faces. Sixteen designs drawn
   against one font's metrics is the largest tokenisation risk in the library so far.
2. **A pack must also supply a dark-mode weight step above 72 px.** 10 Big Type draws Georgia at 700
   in light and 600 in dark; it is the only place in A24 where light and dark carry different
   values, and it is a token, not a section decision.
3. **Eleven of the twelve packs have no recorded heading font.** A24 is the first category where
   that is load-bearing rather than cosmetic.
4. **Ghost has no series primitive.** The eyebrow is a tag; a real series needs an internal tag
   convention plus a route, and A20 Tag Collections should own the decision.
5. **A1·4 Overlay is a precondition and the editor cannot enforce it.** 5 and 9 both state the
   pairing in the panel; the picker should carry section-to-section dependencies.
6. **The avatar's initials fill has no token.** A24 uses `border` with `text` initials in every
   pack; A12 and A21 will both want a real one.
7. **A26 Post Footers should reuse 11 Dateline's cells**, and **A29 Archive Headers should reuse
   1 Centred wholesale** — an archive header is that design with a tag name instead of a title.
8. **The updated-date line is owned here now.** ⚑ The category's refusal is withdrawn: Meta's
   **Author, updated date and reading time** reads `post.updated_at` and draws it past a day's gap,
   the same threshold A26·14 Ledger uses. **Ghost stamps `updated_at` on every save, including a typo
   fix** — the day-gap is the theme layer's convention, and either Ghost needs a real revision flag or
   this stays one.
9. **A behaviour a design needs and the registry does not cover:** still none, and **no module name
   was coined in this pass** ⚑. 14 Share Row's platform list, the closest call before, is answered by
   a site setting rather than by a module or a section repeater.
10. **The editor now shows 13 Sticky's bar**, through P0·6's Simulate scroll entry. This finding is
    closed by the primitive rather than by the design, and **no Preview control was added anywhere in
    A24** — there was none to remove.
11. **A page can render this section as nothing.** ⚑ `@page.show_title_and_feature_image` suppresses
    the `<h1>` and the picture, which is all A24 draws. **The picker should say so before a user
    places a header on a page**, rather than the panel saying it afterwards.
12. **Share destinations are a site setting and the platform has nowhere to put one.** ⚑ **ARCHITECT:
    site setting** — one ordered, enabled list of ten destinations plus a Mastodon instance, read by
    A24·14, A25·9 and A26·9. Three categories were fixing three different lists; a section field
    cannot fix that and a module is the wrong shape.
13. **A focal point is a section control after all.** ⚑ The category refused it — the crop belongs to
    the image — and the refusal is withdrawn: only the section knows it is cropping a 1,440-wide 21:9
    strip or filling a 476 column with no ratio at all. **Ghost still owns the image**, so Image focus
    is a crop hint the theme applies and is never written back to the file. The same ruling A23·12
    reached, and for the same reason.
14. **The avatar step had no home for a whole category.** ⚑ Settlement 2 defined Off · Small 24 ·
    Medium 36 · Large 44 and no panel drew it. **A settlement that names a control is not a control**,
    and the review that catches it should run before a category is called done.

---

## 4 · Reconciliation notes

**Frames changed in this pass — seventeen, and every one of them.** `A24-0 Category Proof` (a new
RECONCILED block, settlement 2's avatar line, the roster's Ctl column, the Post block rewritten from
four fields to seven, the shared field list rewritten from fourteen rows to eighteen, and the findings
grown from eight to fourteen) · **all sixteen control-panel frames** — `A24-1 Centred`, `A24-2 Flush
Left`, `A24-3 Split`, `A24-4 Image Top`, `A24-5 Full Bleed`, `A24-6 Edge to Edge`, `A24-7 Card`,
`A24-8 Contrast Band`, `A24-9 Overlap`, `A24-10 Big Type`, `A24-11 Dateline`, `A24-12 Rail`, `A24-13
Sticky`, `A24-14 Share Row`, `A24-15 Slim`, `A24-16 Two Column` — each losing its Padding row, gaining
the universal trio outside its list, an Editing block, a Data block and a RECONCILED card, and each
gaining a **Reconciled** paragraph on its spec card.

**Two section frames were redrawn, and only two**, because only two items changed what a section
draws at rest: **`A24-5 Full Bleed`'s desktop-light and dark frames**, which gain the credit line
below the picture, and **`A24-14 Share Row`'s states frame**, whose glyph row is relabelled as fixed
brand icons and whose Links row now reads the site setting. **No other primary frame changed** — the
caption designs draw the same words they drew before, now from Ghost's field rather than the
section's.

One line per conflict, judgement or open question this pass raised.

- **`imageCaption` against the eight designs the field list named.** The list said 1, 3, 4, 6, 7, 9,
  12 and 16 read it; **7 Card never drew a caption** and its own entry said so. **The list was wrong
  and the list is corrected** — 7 gets Image focus and no Caption row. The eight become seven plus
  5 Full Bleed's credit line and 8 Contrast Band's conditional one.
- **3 Split's "the one authored string that can change this section's height".** Struck. The caption
  is Ghost's now, so **the height it produces is the post's too** — which is the honest arrangement,
  and the panel says it rather than pretending the number is the user's.
- **5 Full Bleed's withheld credit against A26 "owning" it.** The old entry withheld the caption and
  named A26 as the photographer's home; **A26 had no such row**. The credit line lands here, from the
  same field A26's own patch now draws as the Ledger credit row. **Both categories draw
  `feature_image_caption`, and neither claims the other will.**
- **Padding against Vertical spacing.** Fifteen per-design Padding rows were the universal control
  under another name and are retired. **8 Contrast Band's four-value ladder resolves to 0 · 64 · 96**
  ⚑ — Compact *is* the old Flush, default, and no fourth value is invented — and **15 Slim's own
  ladder resolves 48 · 64 · 96 inside the universal row**. **5 Full Bleed's row is inert** with its
  reason. The ladders that survive as their own rows are the ones **inside** an object: Card padding,
  Band height, Bar height, Gap to the words, Gap to the picture.
- **Image focus against "A24 does not offer a focal point".** The category ruled the crop belonged to
  the image, not the section. **The control wins** — the same ruling A23·12 reached — because only the
  section knows it is cropping a 1,440-wide 21:9 strip or filling a 476 column at 4:5. **It is drawn
  in the Post block rather than in an Image Picker popover** ⚑: A24 has no image field of its own, so
  there is no popover to reach it from, and the ground rule's "reachable from the picker" cannot be
  met literally here.
- **The updated line against the category-wide refusal.** The floor refused "an Updated 14 March line
  (A26 owns a revision note)"; the owner's ruling withdraws it, and Meta carries it. **The day-gap
  threshold is invented** ⚑ and A26's finding 8 still stands: Ghost stamps `updated_at` on every
  save, so either the platform grows a revision flag or the theme layer keeps a convention.
- **The avatar step against the panels.** Settlement 2 defined Off · Small 24 · Medium 36 · Large 44
  and **no design's panel carried it**, so nobody could set it. It is a Post block row in all sixteen
  now — **inert in 15 Slim**, **set to Medium in 10 Big Type** (whose cut "avatar-size control" is
  withdrawn), **capped at 24 inside 13 Sticky's bar** whatever the row says.
- **The Meta enum against 11 Dateline's narrowing and 12 Rail's interpretation.** Both hold: **11
  keeps Off struck through** and gains the two new values, **12 reads six line counts instead of
  four**, and Meta Off with Tag line Off still removes its rail.
- **11 Dateline's cell labels against "four of the five authored fields are labels".** The three
  remaining fixed English strings become fields, so **all seven authored fields in A24 are now
  labels** and no fixed visitor-facing string ships. **`publishedLabel`'s default follows the Meta
  value** ⚑ — a default that follows a control is new in the library, and the alternative was a cell
  reading "Published" over an updated date.
- **14 Share Row's fixed list against one site-wide setting.** The list, the order argument ("the
  account-free destinations last, Copy link last of all") and the rule that **Email must be present
  in all three values** are all superseded: the destinations are the owner's, ordered once. **The
  no-JS floor is restated in their place** — every destination but Copy link is a real `<a href>`, and
  the only empty case is a site that enables Copy link alone, which the panel warns about. **ARCHITECT:
  site setting**, marked on the frame: the platform has no home for an ordered, enabled list read by
  three categories.
- **14's glyphs against "pending a pack icon set".** Answered: **fixed per-platform brand icons from
  P0·2's Social / Brands group** (Tabler `brand-bluesky`, `brand-mastodon`, `mail`, `link`), resolved
  by destination and **never editable slots**. The frames' boxes stay as placement references, which
  is what P0·2 specifies. **Copy link, the category's one button, takes no P0·2 button icon** for the
  same reason — the ground rule's optional button icon has nothing to attach to in A24.
- **13 Sticky's bar against the sidebar.** The bar is designed through **P0·6's Simulate scroll**
  entry, not a Preview control. **No Preview control was removed from any A24 panel because there was
  never one** — P0·8's first rule is satisfied trivially here, and the category's tenth finding is
  closed by the primitive.
- **15 Slim's empty `readingTimeSuffix`.** The line read "… · 9". **It falls back to its default
  now**, the way `copiedLabel` already did in 14 — one rule for both, and the placeholder no longer
  warns about a state the theme can prevent.
- **16 Two Column's "the only design that touches no block field".** Superseded: it touches three.
  **A24 no longer has a design that leaves the block alone** — 1 Centred is the closest, and its four
  original fields are still at their defaults.
- **10 Big Type's "Meta" against the block's Meta.** The design control is renamed **Meta position**
  ⚑ — two rows of the same name in one panel was a collision, and field 4 had already used the longer
  name.
- **Member Visibility, P0·4 and P0·5 against the ground rules.** All three **land nowhere in A24**,
  and that is a judgement rather than an omission: **nothing here is a CTA** (a tag link is
  navigation, a byline is attribution, the one button copies a link), there is no auth or subscribe
  action to edit, and the section has no query to populate. Recorded rather than added.
- **Two universal controls disabled by other values.** **7 Card refuses Contrast on Background role**
  (a contrast card is 8 Contrast Band with a radius) and **8 Contrast Band greys Top divider at
  Compact** (a flush band has no seam). ⚑ Both are new in the library — a universal control narrowed
  by a design, and one narrowed by another universal control's value — and both are drawn with the
  reason rather than hidden.
- **13 Sticky's bar against Background role.** The bar stays on `background` at every value ⚑: it
  sits over the article, not over the header, and a surface bar on a background page reads as a
  floating card. The role moves the resting header only.
- **Print, and the one thing it gained.** Unchanged everywhere but 5 Full Bleed, which prints as
  1 Centred on white (A17·7) **with the credit line printed under the picture** — a photographer's
  credit is exactly the kind of thing print should keep.
- **Control counts.** Every design's footer now reads *N controls + the universal trio*, and the
  roster's Ctl column is after-pass. Fourteen designs lost their Padding row; **5 Full Bleed had none
  to lose**. The highest count in A24 is five, against the lifted ceiling of about fifteen — **this
  category was never near it**, and the pass added rows to the block and the trio rather than to any
  design's own list.

---

## 5 · Patch notes — post headers patch, 28 August 2026

Every change below carries the **name** of the rule that required it. Rules are named and never
numbered: the letter-and-number labels elsewhere in this project are filing codes and say nothing
about what a rule requires.

**Frames updated — all seventeen.** `A24-0 Category Proof` (the roster's No-picture column, the
missing-picture vocabulary, the print exceptions, the behaviour paragraph, settlement 2's avatar line,
and a **[Free]** badge on 1 Centred and 2 Flush Left) and every design frame `A24-1` … `A24-16`, each
of which gained a **POST HEADERS PATCH** card stating in one line each what changed on that frame and
which rule required it.

**Redrawn beyond captions — four frames.** `A24-5 Full Bleed`'s no-picture state (the band on the
pack's own ground with the words in the page's own text colour, where it drew 1 Centred's centred
arrangement) · `A24-6 Edge to Edge`'s no-picture state (this design's own left-aligned words with the
picture, its caption and its gap dropped, where it drew 2 Flush Left's hairlines and byline order) ·
`A24-9 Overlap`'s two no-picture states (the card alone at its Card width on the page ground, where
they drew 7 Card's plate) · `A24-13 Sticky`'s no-JavaScript state (no bar and no meter, where it drew
a working bar). Two control rows were redrawn in place — **11 Dateline's Cells** and **14 Share Row's
Links**, both as number pickers — and three gap ladders took the standard gap words. **Nothing else
moved:** no layout, type scale, colour pack, spacing value or drawn state changed anywhere else in the
category.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **A byline never counts** | **"Jane and 2 others" becomes "Jane and others", in all sixteen designs and everywhere in this document.** A template has no arithmetic and no way to subtract one from the author count, so the number could only have been hard-coded or wrong. The join stays a translation-catalog string; the avatars, their overlap and their three-avatar maximum are unchanged. **13 Sticky never carried the phrase** — its bar draws avatars and no name. |
| **Avatars with no photograph** | **Every fallback circle in A24 draws one letter** — "Marguerite Okonjo" shows M — because **every person in the category is a Ghost author** and Ghost hands a theme a display name, not a first name and a last name. Fifteen frames' drawn avatars were corrected (MO → M, PR → P, NA → N, TL → T, RF → R); **15 Slim has no subject**, being the one design that draws no avatar. The circle's fill (`border`), its letter colour (`text`), its four sizes and its overlap are untouched. |
| **The condensed reading bar** | **13 Sticky's bar cannot work as it was drawn, and the drawing is corrected rather than excused.** A stuck element holds only inside its own container's box; this bar's container is the header, which **has already left the screen** at the moment the bar is wanted — on every site, at every width. The bar is now **script-revealed and pinned at the threshold** (still the resting title's lower edge), and it **declares `header-scroll` for the reveal beside `reading-progress` for the meter**. **No module name was invented** — both are in the registry. **Without JavaScript the whole bar is absent**: the condensed bar, its title link, its reading time, the meter and its track, with nothing reserved for any of them in the flow. The resting header is complete and unchanged, and the frame's no-JavaScript state now draws exactly that. The earlier reading — "the bar is CSS and survives; only the meter is hidden" — is **withdrawn as untrue**. |
| **No design ever turns into another design** | **Three hand-offs deleted, and the category's missing-picture vocabulary rewritten to Reflow · Plate · Hide.** **5 Full Bleed** no longer renders 1 Centred: without a photograph it **hides the picture and the scrim** and draws the rest of itself — the band at its Height, the words at their Text position and Title size, **in the page's own text colour** ⚑, because contrast text on a pale ground cannot be read — with Scrim greyed and its reason shown. **6 Edge to Edge** no longer renders 2 Flush Left: it **reflows**, dropping the picture, its caption and the gap above them, the words keeping this design's own arrangement, order and measure. **9 Overlap** no longer renders 7 Card: the picture is not drawn, **no plate replaces it**, and the card stays at its Card width on the page ground with its padding, hairline and shadow, Picture height and Overlap greyed. **4 Image Top's "the result is 1 Centred exactly" is deleted** — at Alignment Centre the reflowed header *resembles* 1 Centred without becoming it. **Print followed the same rule:** 5 prints its photograph at the page's own margin with its credit and its words below on white, and **8 Contrast Band prints its contents on white without the band's ground**; neither "prints as 1 Centred" any more. Every remaining cross-reference in the category was checked and is **advice** — a panel may say another design reads better at this content, and may never switch to it. |
| **Item counts are a number picker** | **Two subjects, both converted.** **11 Dateline's Cells** and **14 Share Row's Links** are **steppers, 2 to 4, default 4**, where both drew Two · Three · Four; **the + is greyed at four with the reason visible** — a fifth cell falls under 260 px on the content measure and its label wraps; a fifth link takes the row onto a second line at 1440, and the design is one row. Every reference in the frames and this document now reads Cells 4 / Links 2 rather than Cells Four / Links Two. **Nothing else in A24 counts anything** — there is no repeating authored array in the category. |
| **Gap names are "Tight · Normal · Loose"** | **Three subjects, all renamed with their values unchanged:** **4 Image Top's Gap to the words** and **6 Edge to Edge's Gap to the picture** now read **Tight 32 · Normal 40 · Loose 56**, and **16 Two Column's Column gap** reads **Tight 48 · Normal 72 · Loose 96**. The rows keep their own titles, which say what each gap affects. **Vertical spacing keeps Compact · Comfortable · Spacious** — it is padding, not a gap — as do 7 Card's Card padding, 8's Band height and 13's Bar height, which are ladders inside an object. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all sixteen. The swatch row is **Base**; **there is no "Inherit" value anywhere in A24**; no shared control is renamed or given a value it lacks elsewhere; and every narrowing shows its reason — 5 Full Bleed's Background role locked to Image and Vertical spacing inert, 8 Contrast Band's Background role locked to Contrast and its Top divider greyed at Compact, 7 Card refusing Contrast, 11 Dateline's Meta with Off struck through, and the five inert Post block rows. **New this pass:** the greyed rows the deleted hand-offs left behind — 5's Scrim, 6's four picture rows, 9's Picture height and Overlap — each drawn greyed with "Needs a feature image" rather than hidden. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs that need no photography — **1 Centred · 2 Flush Left · 15 Slim · 11 Dateline · 16 Two Column** — and **recommended 1 Centred and 2 Flush Left**; badged **[Free]** on the proof frame's roster and written in §0 as the line the merge reads: **`**[Free] designs:** 1 Centred · 2 Flush Left`**. **The owner confirmed both on 28 August 2026**, and the proof frame's roster badges read **[Free] — confirmed**. |
| **The Remove button never greys out** | **No subject in any section, and one place it could bite.** Nothing in A24 is an authored repeating list: there is no repeater, no Add and no Remove anywhere in the sixteen — `post.tags` and `post.authors` are Ghost's. The one list in the category's orbit is the **site-wide Share-destinations setting**, which uses the shared item-list controls, where **Remove stays visible and clickable at the floor and says why it cannot go lower**. 14 Share Row only counts into that list. |
| **Slider labels** | **No subject.** A24 draws no slider. Every control is a named-value row or a number picker whose title says what it affects — Title size, Bar height, Card padding, Rail width, Column split — and whose values reuse the standard words. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject.** Nothing in A24 asks the reader for anything: a tag is navigation, a byline is attribution, and the category's one button copies a link. There is no subscribe button, no paid tier and no Portal link, so there is nothing to make conditional — and Member Visibility is offered nowhere, which §0 records as a judgement rather than an omission. |
| **The no-JavaScript notice** | **No subject, and no form to replace** — A24 contains no subscribe or sign-in field, so the notice has nothing to stand in for and the category never promised a form worked. **The per-design line is restated on every frame instead:** **fourteen designs are pixel-identical with JavaScript off**; **13 Sticky's bar and meter are absent entirely** (the corrected claim above); and **14 Share Row keeps every destination but Copy link**, which is hidden, since each is a real `<a href>` — with the single empty case, a site that enables Copy link alone, warned about in the panel. The sent, error and loading states elsewhere in the library are untouched. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16.** Sixteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Open questions for the architect — where a ruling could not be applied without inventing a decision

1. **`header-scroll` has no written contract for a bar that is not the navigation.** The registry names
   the module; it does not say whether the module may reveal and pin an element that is not the site
   header, nor where in the DOM it inserts it. This pass assumed it reveals the bar at the threshold
   this design names, pins it to the viewport, and leaves it at the header's end in the DOM so focus
   order is unchanged. If the module may only transform a nav bar, **the bar needs a registry
   addition** and the no-JavaScript state — no bar at all — is correct either way.
2. **Two modules on one design.** 13 Sticky now declares two, which the library has done once before
   (a hero declaring a form and a countdown). Nothing in the ground rules forbids it; nothing states
   it either. Recorded rather than decided.
3. **The words on 5 Full Bleed's picture-less band take the page's own text colour.** ⚑ Invented here
   out of necessity: the design's text colour is the contrast pack's, which is invisible on a pale
   ground. The alternative — keeping the contrast colours and putting the band on the contrast ground
   — would make the design read as 8 Contrast Band, which the rule against one design becoming
   another forbids just as firmly.
4. **The caps on the two new number pickers are the drawn maxima, 4 and 4.** Their reasons are drawn
   (a fifth cell's label wraps; a fifth link takes a second line), but **neither cap was ruled on** —
   they are the counts the frames were designed at. If either should go higher, the row and the
   responsive rule both need redrawing.
5. **Settled by the owner, 28 August 2026: advice is one grey line under the design picker.** Not on
   the canvas, and not over the section — **directly below the control it belongs to**. What remains
   for the architect is mechanical: the panel needs that line as a real element, and every category
   that deleted a hand-off will use it.
6. **Carried forward, unchanged by this pass:** the 820 title measure and its ladders, the avatar
   letter's missing fill token, A1·4 Overlay as an unenforceable precondition, the day-gap threshold
   on the updated date, the Share-destinations site setting, Image focus as a crop hint Ghost never
   sees, and `@page.show_title_and_feature_image` rendering the whole section as nothing.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** —
   sixteen designs, no gap and no renumbering in this category.
2. **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Centred** and
   **2 Flush Left** — both of which exist in this category's roster, and both **confirmed by the owner
   on 28 August 2026**.

### Questions for the owner — asked at the end, after everything that did not depend on an answer

**QUESTION 1 — Which two post headers are free?**

Every category gives two designs away. For post headers the shortlist is the five that need no
photography and cannot look unfinished on a plain site:

- **1 Centred** — the default. Everything on one axis; when a post has no picture the space simply closes.
- **2 Flush Left** — the same facts on the article's own measure. Never draws a picture at all.
- **15 Slim** — one line above the article. The quietest possible opening.
- **11 Dateline** — the byline as labelled cells. A newspaper's answer, and no picture at any setting.
- **16 Two Column** — the title against its own standfirst. Two columns of type, nothing photographic.

1. **1 Centred and 2 Flush Left. (RECOMMENDED)**
   One is the category default that every switch falls back to, the other never draws a picture at
   all, so a free customer with no photographs still has a finished-looking piece. **Costs:** the
   free tier is two quiet, centred-or-left headers, so free sites will look alike.
   *A visitor sees:* a centred title with a byline under it, or the same facts flush left.
2. **1 Centred and 15 Slim.**
   Gives the free tier a real choice of scale — a full opening or a single line above the article.
   **Costs:** 15 Slim is 28 px type; a customer who wants a header that announces the piece has to pay
   for it, and support will hear about it.
   *A visitor sees:* a full centred header, or a one-line title with the date at its right.
3. **2 Flush Left and 11 Dateline.**
   The most editorial pair, and neither ever wants a photograph. **Costs:** the default design, 1
   Centred, is then paid — and it is the one every other design's switch falls back to, so a free
   customer switching designs can land on something they cannot keep.
   *A visitor sees:* a left-aligned header, or a title over four labelled cells of by, date, reading
   time and filed under.

**QUESTION 2 — What should the sticky reading bar do for a visitor with JavaScript switched off?**

The bar that follows you down a long piece cannot be done without a small script — the tested reason
is that the browser can only pin something inside the box it lives in, and the header the bar belongs
to has scrolled away by then. So on the rare visit with scripting off, something has to give.

1. **No bar at all; the header simply scrolls away like every other design's. (RECOMMENDED)**
   Nothing is drawn, nothing is reserved, and the piece reads normally. **Costs:** the design's one
   distinguishing feature is invisible to that visitor.
   *A visitor sees:* an ordinary title, then the article — indistinguishable from the plain design.
2. **A plain bar with the title, always visible at the top of the page, with no progress meter.**
   Keeps something of the idea. **Costs:** it is a second title above the piece for every such
   visitor, and it takes 56 px off a phone screen permanently.
   *A visitor sees:* the title twice — once as the header, once in a strip that never moves.
3. **The bar is drawn as part of the header and simply does not follow.**
   Cheapest to build. **Costs:** a bar that looks like it should follow and does not reads as broken
   rather than as a choice.
   *A visitor sees:* a strip under the title that scrolls out of view with it.

**QUESTION 3 — Where should a panel put its advice, now that no design turns into another?**

Four designs used to say "without a picture this renders as design 1". That is gone: a placed design
is the design that renders. What is left is genuinely useful advice — "on a site with few
photographs, 1 Centred reads better" — and the editor has nowhere to say it.

1. **One line under the design picker, in the sidebar. (RECOMMENDED)**
   The advice sits next to the thing it is about, and the customer reads it while choosing.
   **Costs:** a new element in the panel that every category will then want.
   *An editor sees:* under "Full Bleed", a grey line: "This post has no feature image. 1 Centred reads
   better on a site whose posts often have none."
2. **On the canvas, over the section, only while it is selected.**
   Impossible to miss. **Costs:** it covers the design being judged, and it will be read as an error.
   *An editor sees:* a tinted note across the top of the header while it is selected.
3. **Nowhere — say it in the help documentation instead.**
   No new element anywhere. **Costs:** nobody reads documentation while editing, and the four designs
   lose the only thing they could honestly say about a missing photograph.
   *An editor sees:* nothing.

### The owner's answers — 28 August 2026

1. **The two free designs are 1 Centred and 2 Flush Left.** Confirmed; §0's line names them and the
   proof frame's roster badges read **[Free] — confirmed**.
2. **With JavaScript off the sticky bar is removed.** Confirmed, which is what this pass drew: on
   13 Sticky the condensed bar, its title link, its reading time, the meter and its track are all
   absent, **nothing is reserved for any of them**, and the article starts at the top under a header
   that simply scrolled away. The frame's mobile no-JavaScript state draws exactly that.
3. **Advice is one grey line under the design picker, in the sidebar — never on the canvas.** Recorded
   on the four designs that used to hand off (4 Image Top, 5 Full Bleed, 6 Edge to Edge, 9 Overlap):
   the line sits **directly below the control it belongs to**, says what the post is missing and which
   plainer design reads better, and switches nothing. No canvas note, no overlay, no tinted banner.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** sixteen designs, numbered **1–16**.
