# A25 Post Content Layouts — written specification

12 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass, 25 August 2026** ·
**native-share pass, 25 August 2026**

The frames are `A25-0 Category Proof.dc.html` and `A25-1` … `A25-12`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation pass.** The whole category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. This revision applies that patch. It reuses the shared editor primitives designed in **P0 ·
Editor primitives** by name and never redesigns them: **P0·1** the inline text toolbar and its link
popover, **P0·2** the icon slot and Icon Picker (which supplies the one share mark's
icon, with its size and colour-role popover), **P0·3** the item-list controls (which in A25 apply to one *site
setting* and to no section), **P0·4** the member-aware action editor and **P0·5** the "Populate
from…" data panel, both of which land nowhere in A25 and are said so, and **P0·6** the editor state
switcher, which is how 7 Sticky Index's held column, the index disclosures, the copied confirmation
and the paywall cut are now seen while editing. What each design gained is in a **Reconciled**
paragraph at the foot of its entry, and the frame-by-frame list is in **Reconciliation notes** at the
end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A25·1 in three packs, light and dark), the stress frame, the fixture inventory, the roster and the
four settlements in full. The shared field list is repeated below because the build reads it.

---

## 0 · The category layer

### What A25 is

Twelve arrangements of **one article and whatever sits beside it** — an index, a share rail, a
caption in a margin, a number in a gutter. **It is the only category in the library whose content it
does not control**: the words, the pictures and the cards are the author's, written in Ghost, and the
design decides where they sit and what sits next to them.

**A25 owns no query and reads no post fields but four.** There is no Posts block, because the section
does not choose a post — it is on the post, and its content is `{{content}}` as Ghost renders it.
What A24 called the Post block has no equivalent here: **there is nothing to switch on or off,
because everything in the section is either the article or furniture the design draws.**

The category inherits its content model from **C Post Body**, which settled the six controls, the
style-guide fixture and the two furniture positions. A17's measure and page margin, A19's image
rules, A19·3's card, A24's padding ladder, A1·14's icon button and A6's focus ring are all
inherited whole — but **not A24·14's Links control, its copied confirmation or its site-wide
Share-destinations setting** ⚑: the controls pass adopted the setting, and the native-share pass gave
all three back to Ghost, whose own share modal does the work. **A25 adds one thing: the article's own furniture.** Everything else is
arrangement.

### The four settlements (§8 of the brief)

**1 · The style-guide fixture.** C4's article — *"The four hundred domains that refuse to move"*,
Orbit Weekly, Issue 118, by Rosa Menendez — **is the post drawn in every frame of every A25
design** ⚑. It carries one of each of the fifteen elements Ghost can put on a web page (the
inventory is on the proof). **The fixture is drawn at Comfortable 720**, which is A17's article
measure; C4 drew it at 880 inside a product canvas, and **that number is the canvas's, not the
theme's** ⚑.

**The body is set in the pack's body font; headings, quotes and the drop cap in its heading font** ⚑.
A24's frames drew their article sliver in the heading font and C4's fixture drew it in the body
font — **the fixture is the authority for the article, so A25 follows C4**, and A24's sliver should
be read as indicative. Recorded here rather than left for the build to find.

**2 · The table of contents, and what it does at 834 and 390.** **Off · Left · Right** in 1 Measured;
**Off · Left** in 4 Contrast Band, which has no right-hand furniture to swap with. **It needs 288 px
of margin — a 240 column on a 48 gutter — so it leaves the margin at 1,200, not at 834** ⚑, and
becomes **a closed `<details>` disclosure above the first block**: the same element at 1,199 and at
390. **It hides itself entirely below three headings** ⚑. **The measure never moves at any of these
thresholds** — the index lives in margin the text never used, so losing it to a width, a control or
a reader with no JavaScript changes the margin and not the line length.

**C.2's panel line said the index "hides itself on every post under 834"; C2b's frame drew it
collapsed at 390** ⚑. The drawn frame is the authority, **so A25 collapses rather than hides** and
the panel line is the thing that was wrong. It is the only contradiction the category found in its
inheritance, and it is a finding for the architect.

**3 · The share rail, and how it coexists with the index.** **Off · Rail · Under**, and **the rail
takes the margin the index does not.** When both want the same one — index Right and rail Rail —
**the mark stops standing alone and sits under the index with a hairline between them**,
which is C2b's drawn answer carried verbatim and is the same in every A25 design that offers both.
**Below 1,200 the rail is a row at the foot of the article, never at the head** ⚑: a reader who has
not read the piece has nothing to share. **9 Share Rail is the design where the rail has the page to
itself**, and it refuses the index so that it can.

**What the rail contains is not the theme's decision at all: it is Ghost's.** ⚑ Ghost ships a
**native share modal**, triggered by a link to `#/share` on any post or page — the reader clicks,
Ghost opens its own modal, and copy-link, email and the social platforms are there with the post's
title and URL already filled in. So **every share affordance in A25 is one mark**: a
`<a href="#/share">` icon, or icon and label, and nothing else. **The theme draws no platform
icons, keeps no destination list, reads no `post.url`, and declares no module** ⚑.

**This supersedes the earlier decision in this same pass**, which had adopted A24·14's site-wide
ordered Share-destinations setting for A25. That setting is no longer read here. **A24·14 and A26·9
still draw platform links and still read it** — a finding, because one theme cannot honestly offer
two different share experiences on one page. What each A25 design still owns is **where the mark
sits and whether it carries its words**; the destinations, their order, their names and the copy
confirmation are the platform's.

**4 · Drop cap, type scale, and the heading hierarchy.** **Drop cap: Off · Drop — three lines ·
Raised**, first paragraph only, **suppressed when the first block is not a paragraph** ⚑ — no
initial on a callout or an image, and no space reserved for one. **Type scale: Compact 17 ·
Comfortable 19 · Spacious 21**, headings stepping with it (h2 28/32/36, h3 21/24/26), **while
captions, index entries and numerals hold** ⚑ — furniture is scanned, prose is read.

**The article carries no `h1` in any of the twelve** ⚑ — A24's header owns the page's only one — and
**Ghost's own `h2`, `h3` and `h4` keep the levels the author gave them**; no design promotes,
demotes or skips one. **Every heading takes an id from Ghost's own slug and `scroll-margin-top:
96px`** ⚑, the same 96 that 7 Sticky Index holds its column at, so a jumped-to heading is never
behind the furniture. **The anchor is a ⌗ at a 44 px target beside the heading, and the heading is
never itself a link** ⚑.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The measure.** Narrow 620 · Comfortable 720 · Wide 840 at 1440, centred in A17's 1,296 content
  box on a 72 px page margin ⚑ — about 62, 72 and 84 characters a line. 754 at 834, 350 at 390.
  **Two designs depart and both say so:** 3 Sheet's inset comes out of the measure at 834 and 390
  (690 and 310), and 5 Full Bleed holds its chosen measure at 834 rather than taking the page's.
- **The type.** Body 17 · 19 · 21 at 1.7; h2 28 · 32 · 36; h3 21 · 24 · 26; quotes at the h3 size in
  the heading font; captions 13; index entries 14–15; numerals 13. 18 and 28 at 834; 17 and 25 at
  390. **Nothing goes below 13 except 9 Share Rail's rotated label at 11 and 12 Numbered's decimals
  at 11** ⚑, and both are labels rather than prose.
- **The space above, and the universal Vertical spacing.** **The 64 px between the header and the
  first line is the article's own and is fixed at every width** — C Post Body owns it, A24 states it,
  **and no A25 design has a control that changes it** ⚑. So **the universal Vertical spacing row is
  drawn outside every design's list and is inert in all twelve** ⚑, greyed with its reason rather
  than hidden — the only category in the library where that is true of the whole set. **Only the four
  ladders that live inside an object of the design's own survive as their own rows, and each keeps a
  distinct name:** 3 Sheet's inset (64 · 96 · 132), 4 Contrast Band's band padding (the same ladder),
  11 Ruled's inset (40 · 56 · 72), 5 Full Bleed's space around media (48 · 72 · 96). **The other
  eight designs have no padding row at all.**
- **Cards are set once, site-wide.** Callouts, bookmarks, galleries, code and the rest carry their
  settings from the Cards module, and **no A25 design changes them** — C settled it, and every panel
  repeats the note. **One design overrules one Cards setting and flags it** ⚑: 3 Sheet decides what
  "wide" and "full" mean inside its own ground. **5 Full Bleed no longer does at its default**: its
  Breakout takes **Follow the card widths**, which reads Ghost's per-card width instead of
  overriding it — see finding 2.
- **Accent, twice at most and usually once:** A6's focus ring, and the current-entry marker in an
  index. **The callout's accent fill is the author's content, not the design's spend** ⚑. **No
  heading, numeral, index entry, caption or rule is ever accent** — 7, 8 and 12 each considered it
  and each refused, because a colour on every repetition marks nothing.
- **Dark.** A17's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm shadows
  dropped and the hairline carrying every plane. **Body text is `text` on `background` at 12.4:1,
  deliberately under the heading's 15.1:1** ⚑. **No design filters, dims, tints or borders a
  photograph in either mode** (A19's rule).
- **Responsive floor.** **Furniture leaves the margins at 1,200, not at 834** ⚑ — 288 px of margin
  decides it, not a breakpoint. Indexes become disclosures; rails become rows at the foot; margin
  notes return to their blocks; hanging headings return above their text; hanging numerals go above
  their headings. **Two designs do not collapse at all:** 4 Contrast Band's band and 8 Index Top's
  index, because neither was ever in a margin. Every element that leaves a width has a stated
  destination.
- **Targets 44 px at every width:** index entries, anchors, share buttons, disclosure rows. Share
  buttons are 38 px boxes in 44 px targets above 767 and 44 px boxes below.
- **Empty and the cut.** **An empty `{{content}}` renders nothing at all in all twelve** ⚑ — no
  ground, no box, no padding, no rules — and the editor draws one greyed line. **At the paywall cut
  every ground and box closes above the cut** and A32 draws its own; an index lists only the headings
  above it.
- **Sharing is Ghost's.** Every share affordance is one `<a href="#/share">` opening **Ghost's
  native share modal** ⚑. **No design declares the `share` module** — an anchor needs no
  JavaScript — **and none reads `post.url` or `post.title`**, because Ghost composes the share
  itself. **`copiedLabel` is deleted from the category** ⚑: copying the link is one of the things
  the modal does, and it announces its own result. **No-JS:** the anchor always renders; Ghost's
  modal is Ghost's own client-side flow, so with JavaScript off the link opens nothing — a platform
  limitation the theme cannot fill, and one no registry module is involved in either way.
- **Editing.** Every visible authored text is inline-editable on canvas with the shared **P0·1**
  toolbar — bold · italic · underline · link, the link popover carrying **Open in new tab** and rel
  **nofollow · noreferrer · sponsored**. **The three authored labels all edit inline**: `indexLabel`,
  `indexNote` and `shareLabel` ⚑ — they are read on the canvas, so they are edited there.
  **The article is Ghost's** ⚑ — paragraphs, headings, captions, quotes, lists and every card:
  clicking one selects the section and the sidebar says **"Edit in Ghost"**. **A25 has no authored
  URL field**, so the Ghost-aware Link Picker never opens in this category, and **no image field**,
  so the Image Picker and its Image focus land nowhere — the pictures are the author's and their
  widths are the Cards module's. **No fixed English visitor-facing string ships** ⚑: the three labels
  carry defaults, and the strings nobody authors are **theme translation-catalog strings** — the
  anchor's "Link to this section", the disclosure's heading count, and **8 Index Top's
  "{n} sections" and "min read"** ⚑ (A24 owns the authored
  `readingTimeSuffix`; two sections authoring the same words on one page would disagree).
- **Member Visibility lands nowhere in A25** ⚑, and that is a judgement rather than an omission:
  **nothing here is a CTA.** An index entry is navigation, an anchor is a bookmark, and a share link
  is not an offer. P0·4's member-aware action editor therefore never opens. Recorded in the
  Reconciliation notes.
- **No Preview control anywhere** — previewing belongs to the editor, and the category never had one
  to remove.
- **Behaviour comes only from the fixed module registry.** A25 spends three: `toc`, `scroll-spy` and
  `lightbox` — **`share` left the category with the destinations** ⚑, which takes 1 Measured from
  two modules to one, 7 Sticky Index from three to two, and 3 Sheet and 9 Share Rail to none.
  **No design here needs a module the registry does not have**, so nothing is marked ARCHITECT:
  registry addition.

### The four controls every design carries

**Measure**, **Type scale**, **Drop cap** and **Paragraph rhythm**, in that order, at the top of
every panel — **the category's quick controls, and after this pass there are four of them.**
Paragraph rhythm (Spaced · Indented) was 2 Plain's alone; **a user who wanted indented paragraphs and
a table of contents could not have both**, which is why it is promoted ⚑. What a design adds below
the quartet is its own argument. **Nine panels hold seven controls, one holds five (2 Plain), one holds six
(9 Share Rail, after the native-share pass deleted its Links row) and one holds eight (4 Contrast
Band)** — all well under the PRD's ≈15 ceiling, and none of the twelve counts the three universal
controls, which sit outside its list.

### The universal trio — outside every design's control list

| Control | Values | In A25 |
|---|---|---|
| Background role | Background · Surface · Contrast | live in ten · **locked in two** |
| Vertical spacing | Compact · Comfortable · Spacious | **inert in all twelve** ⚑ |
| Top divider | None · Line · Fade | live in all twelve, None by default |

**Background role is locked where the ground is the design** ⚑, with the reason shown: **3 Sheet** to
Surface (the sheet *is* the surface — A19·3's card at the content width) and **4 Contrast Band** to
Contrast (every colour in the band is derived from the two contrast tokens). In the other ten it is
live, and each panel says what it colours and what it does not: the index's hairline and current-entry
rule, the share mark's fill, the numerals and the margin notes are **derived from the role**, never
fixed, and **no glyph anywhere carries a brand colour** — there is no brand left in the section to
carry one.

**Vertical spacing is inert in all twelve** because the space above the article belongs to C Post
Body. **Top divider is the seam above the article**, under A24's header; at Line the hairline takes
the measure rather than the content width ⚑, and it is drawn **above** 3 Sheet's sheet, 4's band and
11 Ruled's box rather than inside them. **8 Index Top is the one exception in the library:** at Line
**the divider resolves into the index's own upper hairline rather than adding a second** ⚑.

### The roster

| # | Design | Tuple | With no headings | Controls | Modules |
|---|---|---|---|---|---|
| 1 | Measured | `article body · none · page · variable · inline · index and rail on opposite margins` | No index, empty margin | 7 | `toc` |
| 2 | Plain | `article body · none · page · none · inline · the measure alone` | Indifferent | 5 | — |
| 3 | Sheet | `article body · card · surface · none · edge · the article on a raised sheet` | Indifferent | 7 | — |
| 4 | Contrast Band | `article body · none · contrast · none · inline · inverted reading band` | No index, measure stays centred | 8 | `toc` |
| 5 | Full Bleed | `media frame · none · page · none · full-bleed · media escaping the measure` | Indifferent · hands off with no pictures | 7 | `lightbox` |
| 6 | Hanging Heads | `split · none · page · none · inline · headings hanging in the margin` | Hand off → 2 Plain | 7 | — |
| 7 | Sticky Index | `sticky · none · page · variable · inline · index that follows the reader` | No index, empty margin | 7 | `toc` `scroll-spy` |
| 8 | Index Top | `stack · none · page · variable · inline · index before the first line` | No index, no hairlines | 7 | `toc` |
| 9 | Share Rail | `edge rail · none · page · one · inline · share mark in the margin` | Indifferent | 6 | — |
| 10 | Marginalia | `edge rail · none · page · variable · right · captions in the margin` | Indifferent | 7 | — |
| 11 | Ruled | `article body · box · page · none · inline · hairline between every part` | Box around 2 Plain | 7 | — |
| 12 | Numbered | `article body · none · page · many · inline · numbered section breaks` | Hand off → 2 Plain | 7 | — |

**Control counts are after both passes** — each design's own rows, before the three universal
controls, none of which is counted. Every count rose by one for Paragraph rhythm except 2 Plain's,
which already had it; 4 Contrast Band's rose by two because it gains a share rail; and **9 Share
Rail's fell to six, because Links had nothing left to count once Ghost owned the destinations** ⚑ —
the only panel in the category that lost a control.

**All twelve are distinct on the five closed slots.** Archetype carries the category — article body
six times, edge rail twice, one each of split, sticky, stack and media frame — because **ground and
containment barely move**: ten `page`, one `surface`, one `contrast`; ten `none`, one `card`, one
`box`. **The count slot does the rest:** `variable` is an index built from the author's headings
(1, 4, 7, 8), `one` is 9's single share mark — **it was `few` until Ghost's native modal replaced the
two-to-four destination list, and A25 now spends no `few` at all** ⚑ — `many` is 12's sections, and
`none` is the five that repeat nothing. **Media placement is the quietest slot the library has drawn** — ten `inline`, one
`full-bleed`, one `edge`, one `right`: the pictures in a post body belong to the author, and only two
designs claim the right to move them.

**The closest pairs are 2 Plain against 12 Numbered** (identical but for the count slot, separated in
fact by whether the article is numbered) **and 1 Measured against 7 Sticky Index** (the same list in
the same column, separated by archetype because holding is the whole of the difference).

### Repeating items — the whole category, in one place

**There is no field in A25 that is an array the user authors.** ⚑ Checked against all twelve content
models. **Three things repeat and not one of them is authored in the sidebar:** the index (derived
from the post's headings), 12 Numbered's section numbers (CSS counters), and 10 Marginalia's notes
(the author's own captions and quotes). **The share destinations were the fourth until this pass;
they are Ghost's now and are not in the theme at all** ⚑.

So there is **no Add, no Remove, no reorder, no minimum or maximum item count and no per-item
editing anywhere in the category**, and **P0·3's shared item controls land nowhere in A25** ⚑. A user
who wants a different index writes a different heading; one who wants a note in the margin writes a
caption. **There is no ordered list left in play either** ⚑: the destinations live in Ghost's own
share modal, so nothing in A25 has an order the theme can set. **9 Share Rail's Links (Two · Three ·
Four) is deleted by this pass** — with one native share link there is nothing to count — which leaves
**no control in the category that even resembles an item list**.

**Inside an item there is nothing to edit** ⚑, because the items are not the section's: clicking a
paragraph, a caption or a heading on the canvas **selects the section**, and what the user edits
inline is the design's own labels — at most four, which is 8 Index Top's set. **What the user edits
in the article is in Ghost.** That is the category's whole architecture in one line, and it is why
every design's empty state is the same.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `indexLabel` | text | yes | 24 ch | 1, 4, 7, 8 · default "On this page" · inline-editable |
| `indexNote` | text | yes | 90 ch | 8 only · a line under the index head · no default ⚑ · inline-editable |
| `shareLabel` | text | yes | 24 ch | 1, 3, 4, 7, 8, 9 · default "Share this piece" · **the share link's own text and accessible name** · inline-editable |
| `{{content}}` | html | no | — | all twelve · the article itself |
| `post.reading_time` | integer | no | — | 8 only ⚑ |
| `post.access` | boolean | no | — | all twelve · where the paywall cut lands |
| headings, derived | derived | — | 3 minimum | 1, 4, 7, 8 index them · 12 numbers them · 6 hangs them |

**Three authored, three read, one derived — seven in all, and it shrank twice in one day** ⚑: the
controls pass widened it by a design, and the native-share pass deleted `copiedLabel`, `post.url`
and `post.title` outright. The section's content is `{{content}}`, which every design reads whole.
Switching between any two of the twelve is lossless: `indexLabel` survives dormant in the eight
designs with no index and `shareLabel` in the six with no share mark. **Nothing is set once for the
site any more** — A24·14's Share-destinations setting and its Mastodon instance are not read here,
because Ghost's modal owns the destinations. **Derived, never stored:** the index, 12's counters, the current entry, and the
section count in 8's head. **Catalog strings, not fields** ⚑: "Link to this section",
"{n} sections", "min read" — and **no share strings at all**, because Ghost's modal supplies the
platform names and the copy confirmation.

---

## 1 · The designs

### A25·1 — Measured

- **1 · Descriptor.** The article on a centred 720 measure with **the index in one margin and the share rail in the other**, both drawn in margin the measure already had, neither able to move the text. **The category default and the design a switch falls back to.**
- **2 · Structural descriptor.** `article body · none · page · variable · inline · index and rail on opposite margins`. Containment `none`: the article has no box. Count `variable`: the index is as long as the author's headings, and is the only repeating unit.
- **3 · Archetype.** article body. **One departure:** the ladder collapses side furniture at 834 and **this design collapses it at 1,200** ⚑, because 288 px of margin decides rather than a breakpoint.
- **4 · Responsive rule. 1440** margin 72, content 1,296, measure 720 centred, index 240 in the left margin on a 48 gap, share mark 38 at the inner edge of the right margin on the same gap. **1,200 and below** furniture leaves both margins: index → a closed `<details>` above the first block, rail → a row at the foot; **the measure is unchanged**. **834** margin 40, measure 754, body 18, h2 28. **≤ 767** margin 20, measure 350, body 17, h2 25, share buttons 44 px. Drop cap holds at every width ⚑.
- **5 · Content fields.** Read: `{{content}}` whole and `post.access` — **and no `post.url` or `post.title`, because Ghost's share modal supplies both** ⚑. Derived: the index, from the `h2`/`h3` in `{{content}}`, ids from Ghost's slugs ⚑. Authored: `indexLabel` and `shareLabel` — optional, 24 ch, with defaults, **both inline-editable**. Unread: `indexNote`.
- **6 · Controls, in sidebar order.** **Measure** Narrow 620 · Comfortable 720 · Wide 840. **Type scale** Compact 17 · Comfortable 19 · Spacious 21. **Drop cap** Off · Drop — three lines · Raised. **Paragraph rhythm** Spaced · Indented. **Table of contents** Off · Left · Right. **Share rail** Off · Rail · Under — **one mark linking to Ghost's share modal**, never a list of platforms ⚑. **Anchor links** Off · On hover · Always. Seven, and the universal trio outside them. **Cut:** index width, rail position, index depth.
- **7 · Data.** The route's `post` and `{{content}}` as Ghost renders it. Headings: **0, 1 or 2 → no index and an empty margin** ⚑; 3 → as drawn; **12+ → the index scrolls with the page**, since it is not sticky — an index that follows is 7 Sticky Index. **Sharing is one `<a href="#/share">` and Ghost's own modal does the rest** ⚑ — no destination list, no `post.url`, nothing for this design to choose but where the mark sits. **At the paywall cut the index lists only the headings above it** ⚑.
- **8 · Empty state.** Empty `{{content}}` → **nothing renders**: no margins, no furniture, no padding. Editor: "This post has no body yet. Write it in Ghost." No headings → no index, margin empty. Share rail Off → the right margin is empty and the measure holds. An empty `indexLabel` falls back rather than rendering an unlabelled list.
- **9 · Behaviour module.** **One: `toc`** — it declared two until the native-share pass ⚑. No-JS, quoted: `toc` — "No TOC renders. Because it is built from `{{content}}` client-side there is no server-side equivalent — the article itself is unaffected, which is why FR-G4 is still satisfied." **The share mark declares nothing**: `<a href="#/share">` is an ordinary anchor, and Ghost's modal is Ghost's own client-side flow. Edit-safe.
- **10 · Accessibility.** `<article>`, no `h1`; Ghost's heading levels unchanged. The index is `<nav aria-label>` holding an ordered list of in-page links, **after the article in the DOM and before it visually** ⚑. Anchors named "Link to this section" + the heading text; the heading is never the link. `scroll-margin-top: 96px` ⚑. **The share mark is one `<a href="#/share">` named by `shareLabel`** — 38/44 px, never a `<button>` and **never announced by the theme** ⚑: Ghost's modal owns its own focus and live region. Measured light: body 13.1:1, index inactive 5.4:1, captions 5.4:1, callout text on accent 4.6:1. Focus is A6's 4 px ring.
- **Repeating items.** One, derived: the index. No Add, Remove, reorder or per-entry control. Selecting the section gives `indexLabel` and `shareLabel`. **The article's blocks are edited in Ghost, never here** ⚑.
- **Reconciled.** **The trio becomes a quartet** — Paragraph rhythm joins it, so this design can set indented paragraphs and keep its index; seven controls. **The universal trio is drawn outside the list**, with Vertical spacing **inert** and its reason shown. **Sharing then became Ghost's native share modal** ⚑ — one `<a href="#/share">` in place of the tower, A24·14's setting no longer read, `copiedLabel`, `post.url` and `post.title` out of the field list, and the `share` module no longer declared. The two authored labels edit inline.
- **Flagged ⚑** — the 1,200 collapse; the measure never moving; the mark at the inner edge of its margin; the three-heading minimum with an empty margin rather than a placeholder; the index after the article in the DOM; `scroll-margin-top` at 96 for A24·13; one module where the design once declared two; the paywall cut truncating the index; the drop cap holding at 390; heading ids from Ghost's slugs; the dark body under the heading's ratio.

---

### A25·2 — Plain

- **1 · Descriptor.** The article on a centred measure and nothing else — no index, no rail, no ground of its own, no box. **The category's floor, drawn as a design.**
- **2 · Structural descriptor.** `article body · none · page · none · inline · the measure alone`. Count `none` is the whole of the difference from 1 Measured: the index is the only thing 1 repeats.
- **3 · Archetype.** article body. **No departure, and nothing to collapse.**
- **4 · Responsive rule. 1440** margin 72, measure 720 centred, body 19/1.7, h2 32, h3 24. **834** margin 40, measure 754, body 18, h2 28. **≤ 767** margin 20, measure 350, body 17, h2 25, images break to the screen edges with captions returning to the measure. Drop cap and Paragraph rhythm hold at every width ⚑.
- **5 · Content fields.** Read: `{{content}}`, `post.access`. **Authored: none** ⚑ — the only design in A25 with no authored field, and **the only section in the category where selecting it offers no text**. Unread: `indexLabel`, `indexNote`, `shareLabel`.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** Spaced · Indented · **Anchor links** Off · On hover · Always. **Five — still the shortest panel in A25, and four of the five are now the shared quartet** ⚑. **Cut:** a justified value, a small-caps opening, a paragraph spacing ladder.
- **7 · Data.** `{{content}}` and nothing else. **Headings: any number, including none** — the one design indifferent to them ⚑. **At the paywall cut the article simply stops**; no element spans the cut, **which makes it the safest of the twelve on a members post** ⚑.
- **8 · Empty state.** Empty `{{content}}` → nothing at all. Editor: one greyed line. **There is no second empty state, because there is nothing else that can be absent.**
- **9 · Behaviour module.** None; `core` assumed. **No-JS: pixel-identical.** Edit-safe. **The only design in A25 whose no-JS page and whose scripted page are the same document** ⚑.
- **10 · Accessibility.** `<article>`, no `h1`; `scroll-margin-top: 96px`; anchors at 44 px, the heading never the link. **The drop cap is a `::first-letter` rule, not a wrapped span** ⚑ — the paragraph reads and copies as one string. Indented is a `text-indent`, never a leading space. Measured light: body 13.1:1, headings 13.1:1, captions 5.4:1. Print: the measure becomes the page.
- **Repeating items.** **None, authored or derived** ⚑.
- **Reconciled.** **Paragraph rhythm is no longer this design's own** ⚑ — the pass promoted it into the shared quartet, so four of this panel's five rows are the category's and **the design's argument now rests on the count slot rather than on a control**. The universal trio is drawn outside the list, Vertical spacing **inert** with its reason; Background role matters more here than anywhere else in A25, because the ground is the only furniture this design has.
- **Flagged ⚑** — the empty margin as the design; the drop cap suppressed when the first block is not a paragraph; Indented's 1.6 em and its suppression after headings, images and callouts; Drop cap and Indented resolving in the drop cap's favour; five controls; no authored fields; `::first-letter`; this design being the fallback the index designs land on.

---

### A25·3 — Sheet

- **1 · Descriptor.** The article on a `surface` sheet at the full content width, **the measure unchanged inside it**, a symmetrical inset the section owns, images able to run to the sheet's edges with captions returning to the measure, and the share row inside the plane. **The category's one raised design.**
- **2 · Structural descriptor.** `article body · card · surface · none · edge · the article on a raised sheet`. **The only `card` in A25** — the section itself sits in it. Media `edge` is the sheet's edge, not the viewport's.
- **3 · Archetype.** article body. **One departure: the sheet is not drawn below 767** ⚑ and the section reverts to the page ground.
- **4 · Responsive rule. 1440** sheet 1,296 on the 72 margin, inset 64/96/132 symmetrical, measure 720 centred, images 720 or 1,296 clipped to the radius, share row above the lower inset. **834** sheet 754, inset 64 with 32 px horizontally, **measure inside 690** ⚑. **≤ 767** **no sheet**: ground reverts, measure 350, share row kept, images to the screen edges.
- **5 · Content fields.** Read: `{{content}}`, `post.access`. Authored: `shareLabel`, inline-editable — the share link's own text. Unread: `indexLabel`, `indexNote`.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Sheet inset** Compact 64 · Comfortable 96 · Spacious 132 · **Media in the sheet** In measure · To the edge · **Share rail** Off · Under — **one mark linking to Ghost's share modal** ⚑. Seven, and the universal trio outside them. **Cut:** a sheet edge value, a sheet width, a sheet radius.
- **7 · Data.** `{{content}}` whole; indifferent to headings. **An image marked wide or full takes the sheet's edge at To the edge and 720 at In measure** ⚑ — **this design overrules the Cards module's breakout setting**, and after this pass it is the only one that does at its default. **At the paywall cut the sheet closes above the cut** with its lower inset intact ⚑.
- **8 · Empty state.** Empty `{{content}}` → **nothing, and in particular no sheet** ⚑. Editor: the greyed line inside a dashed sheet outline. Share rail Off removes the row and its 24 px; the inset does not change.
- **9 · Behaviour module.** **None** ⚑ — `share` left with the destinations: the row at Share rail Under is one `<a href="#/share">` and Ghost's own modal does the rest. `core` assumed at both values. Edit-safe.
- **10 · Accessibility.** `<article>`, no `h1`; `scroll-margin-top: 96px`. **The sheet is a `div` with no role and no label** ⚑. An edge-wide image keeps its `<figure>`/`<figcaption>` pair. Measured light: body 13.4:1 on `surface`, captions 5.6:1, the sheet against the page 1.05:1 — decorative, carried by the shadow in light and the hairline in dark. Print: **the sheet is not printed; the article prints as 2 Plain** ⚑.
- **Repeating items.** None authored. Selecting the section gives `shareLabel`. The sheet is not separately selectable.
- **Reconciled.** Paragraph rhythm joins the quartet; seven controls. The universal trio sits outside the list with **Background role locked to Surface** — the sheet *is* the surface — and Vertical spacing **inert**; **Sheet inset keeps its own name** because it is padding inside an object rather than the space above the section, and Top divider is drawn above the sheet on the page ground. **Sharing then became Ghost's native share modal** ⚑ — the row is one `<a href="#/share">`, `copiedLabel`, `post.url` and `post.title` leave the field list, and the design declares no module at all.
- **Flagged ⚑** — the largest use of A19·3's card; the inset measured to the sheet's edge and symmetrical; captions returning to the measure; the 690 measure at 834; the sheet leaving below 767; no sheet when the body is empty; the sheet closing above the cut; overruling the Cards module; the hairline running behind the image in dark; the sheet omitted in print.

---

### A25·4 — Contrast Band

- **1 · Descriptor.** The article inside a full-bleed band of the pack's `contrast` colour, **every colour in it derived from the two contrast tokens**, the measure centred in the band, the index in band margin and — after this pass — **one share mark on a surface derived from the band itself**. **The category's one inverted reading surface.**
- **2 · Structural descriptor.** `article body · none · contrast · none · inline · inverted reading band`. **Containment `none` even at Band edges Inset** ⚑ — a band is a ground, not a box. Ground `contrast` is the slot doing the work.
- **3 · Archetype.** article body. **One departure: the band does not collapse at any width** ⚑.
- **4 · Responsive rule. 1440** band full bleed or 1,296 inset, padding 64/96/132 inside it, measure 720 centred, index 240 in band margin, **share row above the lower padding at Share rail Under**. **1,200 and below** the index collapses to a `<details>` **inside the band**. **834** padding 80, measure 754, body 18. **≤ 767** padding 64, measure 350, body 17; **at Band edges Inset the padding drops to 32** ⚑.
- **5 · Content fields.** Read: `{{content}}`, `post.access`. Derived: the index. Authored: `indexLabel`, and **`shareLabel` — new to this design in this pass** ⚑; both inline-editable. **Nothing else is read for the share mark**: Ghost's modal supplies the URL, the title and the platforms. Unread: `indexNote`.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Band padding** Compact 64 · Comfortable 96 · Spacious 132 · **Band edges** Full bleed · Inset to the content width · **Table of contents** Off · Left · **Share rail** Off · Under. **Eight — the largest panel in A25**, and the universal trio outside them. **Cut:** a band colour, dimmed images, a band height minimum, the Right index value.
- **7 · Data.** `{{content}}` whole. Headings: **0–2 → no index, and the measure stays centred** ⚑ rather than shifting. Code cards deepen to `#171511`, callouts keep the accent fill, **a photograph is untouched — no filter, no dim, no border** ⚑. **At Share rail Under the mark stands on a surface derived at 6% of the band's own text** ⚑ — `#302D26` on `#232019` — with the hairline at 18% and the glyph at the band's muted. **It is one link to Ghost's share modal**, so the band never has to draw a row of brand glyphs: one mark is all the on-band treatment it needs. At the paywall cut the band closes above it.
- **8 · Empty state.** Empty `{{content}}` → **no band at all** ⚑. Editor: the greyed line on the band's ground. No index → no column and no gap. Share rail Off is the default and removes the row and its hairline.
- **9 · Behaviour module.** **One: `toc`**, at Table of contents Left ⚑ — the share row is a plain `<a href="#/share">` and declares nothing. No-JS, quoted: `toc` — "No TOC renders. Because it is built from `{{content}}` client-side there is no server-side equivalent — the article itself is unaffected, which is why FR-G4 is still satisfied." **The band, its colours and its bleed are CSS and are unaffected** ⚑. Edit-safe.
- **10 · Accessibility.** `<article>`, no `h1`; the index is `<nav aria-label>`, after the article in the DOM. **Every ratio is measured against the band, never the page** ⚑: body 14.9:1 light band, 15.8:1 inverted; muted 8.1:1 and 6.1:1; **the accent lifts to the pack's other-mode accent on each band** — `#E0805A` at 6.4:1 on the dark band, `#D96C3F` at 4.6:1 on the light one ⚑. The share mark is one `<a href="#/share">` named by `shareLabel` — a 38 px box in a 44 px target on the derived surface, **never a `<button>` and never announced by the theme** ⚑ — and **the focus ring on the band takes the band's own text colour rather than accent** ⚑. **Selection colour re-derived on contrast** ⚑. Print: **the band is not printed** ⚑.
- **Repeating items.** One, derived: the index. Selecting the section gives `indexLabel` and `shareLabel`.
- **Reconciled.** **Share rail: Off · Under is added** ⚑, on **the derived on-band surface A26·4 worked out for its subscribe field** — 6% of the band's text, hairline at 18% — so this category's recorded refusal ("no share control until the packs supply an on-contrast surface token") is **withdrawn**: one category refusing what a later one solved is an inconsistency users meet the first time they put a band above a footer. Paragraph rhythm joins the quartet: eight controls, the largest panel in A25 and still under the cap. Background role **locked to Contrast**, Vertical spacing **inert**, Band padding keeping its own name. **The native-share pass then made the row one mark** ⚑ — Ghost's modal carries the platforms — which is why a band can afford a share control at all: one derived circle rather than four.
- **Flagged ⚑** — colours derived from the two contrast tokens; muted at 70%, hairlines at 18%; the accent lifting per band; the derived 6% share surface under one mark; the band never collapsing; inset padding dropping to 32 at 390; the stripe placeholder not inverting in dark; no band when the body is empty; the band omitted in print.

---

### A25·5 — Full Bleed

- **1 · Descriptor.** A narrow text column with **the images, galleries and embeds in the body breaking out of the measure — by default to the width the author already chose on each card**, captions returning to the measure or to the right margin, and a symmetrical space ladder of the section's own around each break. **The category's picture essay.**
- **2 · Structural descriptor.** `media frame · none · page · none · full-bleed · media escaping the measure`. The only `media frame` and the only `full-bleed` in A25.
- **3 · Archetype.** media frame. **One departure: the measure does not become the page measure at 834** ⚑ — the gap between the column and the picture is the design.
- **4 · Responsive rule. 1440** margin 72, measure 620 by default, media to the card's own width or to both viewport edges with no radius, space 48/72/96, caption on the measure or 200 px in the right margin. **1,200 and below** **Caption In the margin resolves to Under** ⚑. **834** margin 40, **measure held**, space 56, body 18. **≤ 767** margin 20, measure 350, space 40, body 17.
- **5 · Content fields.** Read: `{{content}}` and specifically its `<figure>` elements **and the width each Koenig card carries**, `post.access`. Authored: none. Unread: the other six.
- **6 · Controls.** **Measure** (defaulting to **Narrow** ⚑) · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Breakout** **Follow the card widths** · Full bleed · Wide · **Caption** Under · In the margin · **Space around media** Compact 48 · Comfortable 72 · Spacious 96. Seven, and the universal trio outside them. **Cut:** a per-image override, a crop ratio, a first-image-only value.
- **7 · Data.** `{{content}}` whole. **Breakout Follow the card widths reads Ghost's own per-card width — normal, wide or full — and is the default** ⚑, so one post can hold a picture at the measure, one at the content width and one at the viewport; **Full bleed and Wide remain blanket overrides** that ignore it. **Images: 0 → the design is 2 Plain at Narrow and the panel says so** ⚑; many → every one breaks out. Galleries and video embeds behave identically; **a bookmark card and a callout never break out** ⚑. At the cut, a broken-out image keeps its space below it.
- **8 · Empty state.** Empty `{{content}}` → nothing. A body with no figures → the measure alone, no reserved space, no placeholder. Editor: "This design is for posts with pictures. Without them it is 2 Plain at Narrow."
- **9 · Behaviour module.** `lightbox`. No-JS, quoted: "Each thumbnail is an `<a href>` to the full-size image; clicking opens it as a normal page." Edit-safe. **Declared here and nowhere else in A25** ⚑ — an image at 1,440 is already at its useful size, so the module earns its place only where the original is larger than the viewport.
- **10 · Accessibility.** `<article>`, no `h1`; `scroll-margin-top: 96px`. Every broken-out image keeps its `<figure>`/`<figcaption>` pair, **including at Caption In the margin, where the caption is moved by grid placement** ⚑. **Alt text is the author's; the section never supplies one and never falls back to the caption** ⚑. The lightbox trigger is the image's own link at 44 px and returns focus on close. Measured light: body 13.1:1, captions 5.4:1. Print: **images print at the measure** ⚑.
- **Repeating items.** None authored. Breakout, Caption and Space each write one value onto the section; there is no per-image control.
- **Reconciled.** **Breakout gains Follow the card widths and takes it as the default** ⚑ — Ghost's Koenig cards carry a per-image width and the author has already chosen, so the honest default is to obey it. **This is the category's real Ghost hookup**, and it softens finding 2: at the default **the section no longer overrules the Cards module at all**, and the section-versus-Cards disagreement arises only when a user asks for it by name. Paragraph rhythm joins the quartet; the universal trio sits outside the list with Vertical spacing **inert** and Space around media keeping its own name.
- **Flagged ⚑** — Narrow as the default measure; Follow the card widths as the default breakout; no radius on full-bleed media at any pack; the space ladder not moving with Type scale; the measure held at 834; Caption In the margin resolving to Under; callouts and bookmarks never breaking out; the hand-off to 2 Plain; `lightbox` only where the original is larger than the viewport; alt never falling back to the caption; images printing at the measure.

---

### A25·6 — Hanging Heads

- **1 · Descriptor.** The article on its measure with **every H2 — and optionally every H3 — moved into a 240 column in the left margin, top-aligned with the first line of the text it heads**. **The one design that makes structure visible without drawing a second list of it.**
- **2 · Structural descriptor.** `split · none · page · none · inline · headings hanging in the margin`. Archetype `split`: two columns of unequal standing. Count `none` — the headings are the author's, drawn where they already were.
- **3 · Archetype.** split. **One departure:** the archetype collapses a side column above the text, and **here each heading returns to the top of its own section** ⚑ — a stack of headings above the first paragraph would be an index, which is 8 Index Top.
- **4 · Responsive rule. 1440** heading column 180 or 240 hanging off the measure's left edge on a constant 48 gutter, measure 720 centred, section gap 56, paragraph gap 24, anchor under the hanging heading. **1,200 and below** **headings return above their text in the measure**; **an H3 set to hang keeps `text-muted`** ⚑. **834** measure 754, body 18, section gap 48. **≤ 767** measure 350, body 17, section gap 40.
- **5 · Content fields.** Read: `{{content}}` and specifically its `h2`/`h3`, **moved by grid placement and never taken out of the flow** ⚑; `post.access`. Authored: none.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Heading column** Compact 180 · Comfortable 240 · **Levels that hang** H2 only · H2 and H3 · **Anchor links** Off · On hover · Always. Seven, and the universal trio outside them. **Cut:** heading alignment in its column, a rule between column and text, a right-hand heading column.
- **7 · Data.** `{{content}}` whole. Headings: **0 → the design is 2 Plain and nothing is reserved** ⚑; 1 → one hanging heading; many → as drawn. **An H4 or deeper never hangs** ⚑. **At the paywall cut a hanging heading keeps its section; the cut never lands between a heading and its text** ⚑.
- **8 · Empty state.** Empty `{{content}}` → nothing. No headings → the measure alone with the left column collapsed; no empty column, no reserved 288. Editor: "This post has no headings. This design will read as 2 Plain."
- **9 · Behaviour module.** None; `core` assumed. **No-JS: pixel-identical** — the hanging column is CSS grid placement ⚑. Edit-safe. **The first of two A25 designs that rearrange the page with no module**, which is the category's argument that arrangement is not behaviour.
- **10 · Accessibility.** `<article>`, no `h1`; **heading levels and DOM order exactly as Ghost emitted them** ⚑, so a screen reader hears heading then text at every width. `scroll-margin-top: 96px`; a jumped-to anchor scrolls the whole row. The anchor is a 38 px box in a 44 px target under the heading. Measured light: headings 13.1:1, H3 in `text-muted` 5.4:1, body 13.1:1. Print: **headings return to the measure** ⚑.
- **Repeating items.** None authored. **A user who wants one heading treated differently writes a different heading level**, which is content.
- **Reconciled.** **Paragraph rhythm joins the quartet** — indented paragraphs under a hanging heading is the pairing this design was missing; seven controls. The universal trio outside the list, Vertical spacing **inert** with its reason, and **Top divider drawn at the measure so it never crosses the heading column** ⚑.
- **Flagged ⚑** — top alignment as the premise; the column changing where it begins and not where it ends; H3 hanging in `text-muted` and keeping it through the collapse; anchors under rather than beside the heading; H4 and deeper never hanging; no index control in a design whose margin is spent; the dark-weight finding at reading scale; the collapse destination being each heading's own section; headings returning to the measure in print.

---

### A25·7 — Sticky Index

- **1 · Descriptor.** An index in one margin that **holds at 96 px from the top of the viewport and marks the section the reader is in**, with the share buttons travelling on it. **The category's only element that leaves the document flow.**
- **2 · Structural descriptor.** `sticky · none · page · variable · inline · index that follows the reader`. Archetype `sticky` is the slot doing the work — 1's index and this one are the same list in the same column.
- **3 · Archetype.** sticky. **One departure:** the archetype assumes a bar across the top; here it is a column in a margin, so **it stops sticking below 1,200 rather than becoming a bar** ⚑ (A24·13 owns the bar).
- **4 · Responsive rule. 1440** index 240 in either margin on a 48 gap, held at 96 with a maximum height of the viewport less 192 and its own scroll beyond, measure 720 centred, share buttons under the index behind a hairline. **1,200 and below** the index stops holding and becomes a closed disclosure above the first block ⚑; the buttons become a row at the foot. **834** measure 754, body 18. **≤ 767** measure 350, body 17, open-index entries at 44 px targets, **closing when one is followed** ⚑.
- **5 · Content fields.** Read: `{{content}}`, `post.access` — **and no `post.url` or `post.title`, because Ghost's share modal supplies both** ⚑. Derived: the index, its numerals at Numbered, and **the current entry — the only value in A25 that is not in the markup at render time** ⚑. Authored: `indexLabel` and `shareLabel`, both inline-editable.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Index position** Left · Right · **Index style** Plain · Numbered · **Share rail** Off · With the index · Under — **one mark linking to Ghost's share modal** ⚑. Seven, and the universal trio outside them. **Cut:** a hold position, a sticky-off value, index depth, a progress meter, a back-to-top entry.
- **7 · Data.** `{{content}}` whole. Headings: 0–2 → no index, no column, no disclosure ⚑; **12+ → the index scrolls inside its own held column and keeps the current entry in view**. **At the paywall cut the index lists only the headings above it and stops holding at the cut** ⚑.
- **8 · Empty state.** Empty `{{content}}` → nothing. Fewer than three headings → no index, empty margin, measure unmoved. Editor: "This post has two headings. The index needs three." Share rail Off → the hairline goes with the buttons.
- **9 · Behaviour module.** **Two: `toc` and `scroll-spy`** — it was three, the largest declaration in the library, until the native-share pass took `share` out ⚑. No-JS, quoted in order: `toc` — "No TOC renders. Because it is built from `{{content}}` client-side there is no server-side equivalent — the article itself is unaffected, which is why FR-G4 is still satisfied." `scroll-spy` — "The sticky list renders with the first item marked current; no active-item tracking." **The first governs**: `scroll-spy`'s degradation assumes a server-rendered list and here there is none, **so with JavaScript off there is no index to mark** ⚑, and FR-G4 holds through `toc`'s own clause. Both edit-safe, and **the share mark declares nothing** — `<a href="#/share">` is an ordinary anchor.
- **10 · Accessibility.** `<article>`, no `h1`. The index is `<nav aria-label>` after the article in the DOM; **the current entry carries `aria-current="location"`** ⚑. `scroll-margin-top: 96px` matches the hold exactly. **The column is `position: sticky`, never `fixed`** ⚑, and does not hold at viewport heights under 560. The disclosure is a native `<details>`. Measured light: current entry 13.1:1, others 5.4:1. Print: **no index** ⚑.
- **Repeating items.** One, derived: the index. Index style writes one value onto the whole list.
- **Reconciled.** Paragraph rhythm joins the quartet; seven controls. The universal trio outside the list, Vertical spacing **inert**, and the held column's hairline **derived from Background role** rather than fixed ⚑. **Sharing then became Ghost's native share modal** ⚑ — the buttons that travelled on the index are one `<a href="#/share">`, the module count falls from three to two, and `copiedLabel`, `post.url` and `post.title` leave the field list. The two authored labels edit inline, and **P0·6's Simulate scroll is named as the editor state for the hold and the current entry** — which no panel had said, and this is the one A25 design that needs it.
- **Flagged ⚑** — the hold at 96 tied to `scroll-margin-top`; the current entry being the last heading past the hold line; the index scrolling inside itself and never truncating; left alignment at both positions; `sticky` rather than `fixed` and no hold under 560; two modules with `toc` governing, where the design once declared three; `aria-current="location"`; the index stopping at the cut; the disclosure closing when an entry is followed; no index in print.

---

### A25·8 — Index Top

- **1 · Descriptor.** A ruled index on the article's own measure, above the first line, **carrying the section count and the reading time**, its entries in one, two or three columns. **The only index in A25 inside the article rather than beside it, and the only one that survives at 390 intact.**
- **2 · Structural descriptor.** `stack · none · page · variable · inline · index before the first line`. Separated from 1 and 7 by archetype alone — all three draw the same derived list, and where it sits is the difference.
- **3 · Archetype.** stack. **One departure: the column count is forced to One below 767** ⚑ — the only control value a width overrides in the category.
- **4 · Responsive rule. 1440** index on the measure between two hairlines, 20 px internal padding, head at 11 px uppercase with the count and reading time at 13, entries at 15 in one to three columns filled down then across, 40 px to the first block. **834** unchanged but for the measure. **≤ 767** **columns forced to One** ⚑, padding 16, gap 28, entries on 44 px rows. **The index never becomes a disclosure at any width** ⚑.
- **5 · Content fields.** Read: `{{content}}`, **`post.reading_time` — the only design in A25 that reads it** ⚑, `post.access`. Derived: the index, the section count, the numerals. Authored: `indexLabel`, **`indexNote` — the only design that reads it** ⚑, and `shareLabel`; **all three inline-editable, and the first two are the reason that rule exists** ⚑.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Index columns** One · Two · Three · **Index style** Plain · Numbered · Ruled · **Share rail** Off · Under — **one mark linking to Ghost's share modal** ⚑. Seven, and the universal trio outside them. **Cut:** an open-by-default value, index depth, a per-design heading threshold. **Ruled constrains Index columns to One** ⚑ — the category's third pattern for an impossible combination, after disable-with-a-reason and absent-rather-than-offered.
- **7 · Data.** `{{content}}` whole. Headings: 0–2 → no index, no hairlines, no gap ⚑; **12+ → drawn whole and taller than the first paragraph**, which the design accepts. **Reading time comes from Ghost and is not recalculated**; on a page template the head carries the section count alone ⚑. At the cut, the index lists and counts only what is above it.
- **8 · Empty state.** Empty `{{content}}` → **nothing, no hairlines** ⚑. Fewer than three headings → no index. Editor: "This post has two headings. The index needs three." An empty `indexNote` renders nothing and leaves no gap; an empty `indexLabel` falls back.
- **9 · Behaviour module.** **`toc` alone** ⚑ — the share row at Under is a plain `<a href="#/share">` and declares nothing. No-JS, quoted: `toc` — "No TOC renders. Because it is built from `{{content}}` client-side there is no server-side equivalent — the article itself is unaffected, which is why FR-G4 is still satisfied." **With JavaScript off this design is 2 Plain with a share link that opens nothing, and it loses more than any other A25 design** ⚑.
- **10 · Accessibility.** `<article>`, no `h1`. The index is `<nav aria-label>` **before the article in the DOM as well as visually** ⚑ — the only A25 index where the two orders agree. Entries are 15 px links on 44 px rows at every width. **The head's reading time is plain text, not a `<time>`** ⚑, and its words — "{n} sections", "min read" — are catalog strings. Measured light: entries 13.1:1, head 5.4:1, hairlines 1.3:1 and decorative. Print: **the index prints** ⚑ — the only A25 furniture that does.
- **Repeating items.** One, derived: the index. Index columns and Index style each write one value onto the whole list. Selecting the section gives three fields — still the largest set in A25.
- **Reconciled.** **`indexNote` and `indexLabel` edit inline on canvas** ⚑ — the two strings a reader meets before the first line are edited where they are read rather than in a sidebar field — with `shareLabel`, the share link's own text, beside them. Paragraph rhythm joins the quartet; seven controls. The universal trio outside the list, Vertical spacing **inert**, and **Top divider Line resolving into the index's own upper hairline rather than drawing a second** ⚑. **Sharing then became Ghost's native share modal** ⚑: the row is one `<a href="#/share">`, and `copiedLabel`, `post.url` and `post.title` leave the field list. The section count and reading time stay Ghost's and are not editable.
- **Flagged ⚑** — the index inside the measure; reading time repeated from A24's meta; the index holding at 15 px against the type scale; Ruled forcing One column; columns forced to One below 767; never a disclosure; twelve entries drawn whole; the section count alone on a page template; no hairlines when empty; two hairlines rather than one in dark; the index printing.

---

### A25·9 — Share Rail

- **1 · Descriptor.** **One share mark in one margin** at the article's first line — a link to **Ghost's native share modal** — with **no index at any setting** and the opposite margin left empty. **The category's only design whose furniture is not a list of headings.**
- **2 · Structural descriptor.** `edge rail · none · page · one · inline · share mark in the margin`. Count `one` ⚑ — **it was `few`, two to four, while the rail held a destination list; Ghost's native modal reduced it to a single unit**, so A25 now spends no `few` at all.
- **3 · Archetype.** edge rail. **One departure:** the ladder puts a rail above the content when it collapses; **this one goes to the foot** ⚑.
- **4 · Responsive rule. 1440** mark 38 px at the inner edge of either margin, 48 from the text, at the first line, static; `shareLabel` beside it at Share style Icon and label, and **no rotated label at either value** ⚑ — it named a group of destinations that no longer exists. **1,200 and below** the mark becomes a row at the foot. **834** measure 754, body 18. **≤ 767** measure 350, **the visible box grows from 38 to 44** ⚑.
- **5 · Content fields.** Read: `{{content}}`, `post.access` — **and neither `post.url` nor `post.title` any more** ⚑, because Ghost's `#/share` modal supplies both. Authored: `shareLabel` (optional, 24 ch, default "Share this piece") — **the mark's own text and accessible name**, inline-editable. **Deleted:** `copiedLabel` ⚑. Unread: `indexLabel`, `indexNote`.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Rail position** Left · Right · **Share style** Icon · Icon and label. **Six, and the universal trio outside them — the only panel in A25 that lost a control in this pass** ⚑, because Links had nothing left to count. **Cut:** a sticky value, share counts, share-a-selection, a destination picker.
- **7 · Data.** `{{content}}` for the article, and nothing else: **the mark is `<a href="#/share">` and Ghost builds the share flow itself** ⚑ — copy link, email and the social platforms, with the post's title and URL already filled in — **so the theme composes no destination URLs and reads no `post.url`**. **The destinations, their order and their names are Ghost's** ⚑; a site that wants a different set changes it in Ghost, not in a theme setting, **which retires A24·14's Share-destinations setting as far as A25 is concerned** — a finding, because A24·14 and A26·9 still read it. **The rail draws on posts and pages alike** ⚑: `#/share` works on any post or page, so the old rule — no rail where there is no `post.url` — could never have fired. **It is absent only on non-post contexts**, where there is no article to share. At the paywall cut the mark stays at the first line above the cut.
- **8 · Empty state.** Empty `{{content}}` → nothing, mark included. **There is no count and no empty-list case left** ⚑ — the old floor of two and the Copy-link-alone fallback went with the destination list, and a design that draws one link cannot be empty while the article exists. An empty `shareLabel` falls back rather than drawing an unnamed mark.
- **9 · Behaviour module.** **None** ⚑ — **and this is the design that used to be the reason `share` was in the category at all.** The mark is one `<a href="#/share">` and Ghost's native modal carries the platforms, the email option and the copy confirmation. **No-JS:** the anchor renders and Ghost's modal — Ghost's own client-side flow — does not open; a platform limitation the theme cannot fill. Edit-safe: nothing runs while editing, and Ghost's modal never opens on the canvas.
- **10 · Accessibility.** `<article>`, no `h1`. The rail is an `<aside aria-label>` taking `shareLabel`'s text, **after the article in the DOM** ⚑. **The mark is one `<a href="#/share">` named by `shareLabel`** — never a `<button>`, **and the theme announces nothing** ⚑: Ghost's modal owns its own focus trap, its own labels and its own live region, which is the accessibility case for using it. 38 px boxes in 44 px targets above 767 and 44 px below. Measured light: the glyph 5.4:1, the label 5.4:1. Print: **no mark** ⚑.
- **Repeating items.** **None at all after this pass** ⚑ — the design that came closest to a repeating item in A25 no longer has one: one mark, no list, no count. Selecting the section gives `shareLabel`, and nothing else.
- **Reconciled.** The controls pass re-based the destinations on A24·14's site-wide setting and corrected the page rule; **the native-share pass then took the destinations out of the theme altogether** ⚑, and this is where that costs and buys the most. The tower of two to four platform buttons becomes **one mark linking to `#/share`**; **Links is deleted** (six controls, the only panel in A25 to lose one), Rail labels becomes **Share style** Icon · Icon and label, the rotated 11 px label goes, and the count slot falls from `few` to `one`. `copiedLabel`, `post.url` and `post.title` leave the field list and **the `share` module is no longer declared**. **A24·14's setting, adopted earlier in the same pass, is superseded by the platform** — recorded as a finding rather than reversed in silence.
- **Flagged ⚑** — the rail static rather than sticky; the rotated label withdrawn with the destinations; the empty opposite margin as the design; the mark going to the foot on collapse; 44 px boxes below 767; the count slot at `one`; the rail drawing on pages as well as posts, the old no-URL rule withdrawn; `copiedLabel` deleted with the copy confirmation; Ghost's modal opening nothing with JavaScript off; no mark in print.

---

### A25·10 — Marginalia

- **1 · Descriptor.** The article on its measure with **figure captions — and optionally pull quotes — placed in a 240 column in one margin, beside the block they belong to**, and a caption over about 140 characters returning under its picture. **The category's one design that moves the author's own elements.**
- **2 · Structural descriptor.** `edge rail · none · page · variable · right · captions in the margin`. Media `right` names where the commentary sits; the pictures stay on the measure. Separated from 9, the other `edge rail`, on count and media both.
- **3 · Archetype.** edge rail. **One departure: the rail is not one element but one per row** ⚑, so it collapses per block rather than as a column.
- **4 · Responsive rule. 1440** margin column 240 in either margin on a 48 gap, notes top-aligned with their block, right-aligned at Left and left-aligned at Right, captions 13, margin quotes 19 with a 2 px accent rule above. **1,200 and below** every note returns to its DOM position. **834** measure 754, body 18. **≤ 767** measure 350, body 17.
- **5 · Content fields.** Read: `{{content}}` and specifically its `<figcaption>` and `<blockquote>` elements, `post.access`. Authored: none — `indexLabel`, `indexNote` and `shareLabel` sit dormant.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Margin column** Left · Right · **What moves out** Captions · Captions and quotes · **Anchor links** Off · On hover · Always. Seven, and the universal trio outside them. **Cut:** a column width, both margins at once, a caption size, a user-set threshold.
- **7 · Data.** `{{content}}` whole. Captions: **0 → the margin is empty and the measure does not move** ⚑; many → one note per figure. **Notes clip to their rows** ⚑. At Captions and quotes every `<blockquote>` moves, **including one inside a list** — the one case where a note and its context part company, drawn on the proof's stress frame. At the cut, a note stays with its block.
- **8 · Empty state.** Empty `{{content}}` → nothing. No captions and no quotes → **the design is 2 Plain with an empty margin and no reserved column** ⚑. Editor: "Nothing in this post moves to the margin yet. Captions and quotes do." A figure with no caption leaves its cell empty and the picture does not widen.
- **9 · Behaviour module.** None; `core` assumed. **No-JS: pixel-identical** ⚑ — placement is CSS grid and the 140-character rule is resolved by the stylesheet. **The second A25 design that rearranges the page with no module.** Edit-safe.
- **10 · Accessibility.** `<article>`, no `h1`. **Nothing is moved in the DOM** ⚑: a `<figcaption>` stays inside its `<figure>`, a `<blockquote>` stays where the author put it, so reading order is authoring order at every width and both values. **Right-aligned captions at Margin column Left are `text-align` only**, never a reversed DOM order. Measured light: margin captions 5.4:1, margin quotes 13.1:1. Print: **notes return to the flow** ⚑.
- **Repeating items.** None authored by the section. **A user who wants one caption in the margin and one beneath writes a shorter caption**, which is content.
- **Reconciled.** **Paragraph rhythm joins the quartet** — indented paragraphs beside margin notes is a real pairing this design could not have; seven controls. The universal trio outside the list, Vertical spacing **inert** with its reason, and **the note column taking the same ground as the measure at every Background role** ⚑ — a tinted margin would turn the author's captions into a sidebar.
- **Flagged ⚑** — CSS grid placement rather than a marginalia card; the 140-character return threshold, stated rather than offered; right-aligned captions at Margin column Left; the quote's accent rule moving from left to top; captions holding at 13 px; notes clipping to their rows; a caption-less figure leaving an empty cell; Ghost having no footnote or aside primitive; notes returning to the flow in print.

---

### A25·11 — Ruled

- **1 · Descriptor.** The article inside a hairline box that **hugs the measure rather than the content width**, with a rule above every heading or between every block, and an inset that is the same value in both directions. **The category's one design drawn entirely in `border`.**
- **2 · Structural descriptor.** `article body · box · page · none · inline · hairline between every part`. Containment `box`: a border rather than a plane — **exactly the distinction between `box` and 3 Sheet's `card`**.
- **3 · Archetype.** article body. **One departure: the box is kept at every width** ⚑ where 3 Sheet's plane leaves below 767, and at Frame Rules only the horizontal inset is dropped.
- **4 · Responsive rule. 1440** box 720 plus a 40/56/72 inset each side — 800, 832 or 864 — at the pack's radius, centred; a hairline above every heading or between every block, **always the full inner width**. **834** box at 754, inset 40, **measure inside 674** ⚑. **≤ 767** box kept, inset 20, **measure 310**; **at Frame Rules only the measure is 350** ⚑.
- **5 · Content fields.** Read: `{{content}}`, `post.access`. Authored: none.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Rules** Between sections · Every block · **Frame** Hairline box · Rules only · **Inset** Compact 40 · Comfortable 56 · Spacious 72. Seven, and the universal trio outside them. **Cut:** a rule weight, a rule colour, a fill, a paragraphs-only value.
- **7 · Data.** `{{content}}` whole. Headings: **0 → at Between sections there are no rules and the design is a box around 2 Plain** ⚑. **Rules suppress themselves above the five Ghost cards that draw their own edge** — callout, code, bookmark, table, toggle ⚑ — **and above the first block**. At the cut the box closes above it.
- **8 · Empty state.** Empty `{{content}}` → **nothing, no box** ⚑. One block → the box around one paragraph and no rules, which is composed rather than broken.
- **9 · Behaviour module.** None; `core` assumed. **No-JS: pixel-identical** — every line is a CSS border ⚑. Edit-safe. The third A25 design that is the same document either way.
- **10 · Accessibility.** `<article>`, no `h1`; `scroll-margin-top: 96px`. **The box and every rule are `border` declarations on elements that already exist** ⚑ — **no `<hr>` is inserted anywhere**, so a screen reader hears the article and not forty separators. **The author's own `<hr>` — Ghost's divider card — is drawn at the same weight and is announced.** Measured light: body 13.1:1, hairlines 1.3:1 and decorative. Print: **the box prints** ⚑ — the only A25 container that does.
- **Repeating items.** None authored. Rules, Frame and Inset each write one value onto the section.
- **Reconciled.** Paragraph rhythm joins the quartet; seven controls. The universal trio outside the list, Vertical spacing **inert**, **Inset keeping its own name** because it is the box's padding rather than the space above the section, and **Top divider drawn above the box rather than inside it** ⚑ — the box's own top border is not that row. **The box takes no fill at any Background role** ⚑, which is exactly what separates it from 3 Sheet's card.
- **Flagged ⚑** — the box hugging the measure; rules always the full inner width; suppression above the five self-edged cards and above the first block; the 674 measure at 834 and 310 at 390; the box kept at 390; Rules only dropping the horizontal inset; no `<hr>` inserted; the author's divider still announced; no box when empty; the box printing.

---

### A25·12 — Numbered

- **1 · Descriptor.** Every H2 — and optionally every H3 — **numbered from the article's own heading order**, the numeral hanging in a 72 px column left of the measure or sitting above the heading inside it. **The category's one design that generates content, and it does it with CSS counters and no module.**
- **2 · Structural descriptor.** `article body · none · page · many · inline · numbered section breaks`. Count `many` — **the only `many` in A25** — and it is what separates this from 2 Plain, whose closed slots are otherwise identical.
- **3 · Archetype.** article body. **One departure: the hanging numeral column resolves to Above the heading below 1,200** ⚑ rather than collapsing to nothing, because the numbering is the design.
- **4 · Responsive rule. 1440** numeral column 72 px, 32 px gutter, hanging 104 left of the measure, right-aligned, mono 13 px in `text-muted`, zero-padded to two digits; section gap 44. **1,200 and below** In the margin resolves to Above the heading, numeral 12 px with a 6 px gap. **834** measure 754, body 18, section gap 40. **≤ 767** measure 350, body 17, **numerals 12 px and decimals 11** ⚑, section gap 34.
- **5 · Content fields.** Read: `{{content}}` and specifically its heading order, `post.access`. **Generated: the numerals** ⚑ — not stored, not authored, not in the source, not copied with a heading. Authored: none.
- **6 · Controls.** **Measure** · **Type scale** · **Drop cap** · **Paragraph rhythm** · **Numbering** H2 only · H2 and H3 · **Number position** In the margin · Above the heading · **Anchor links** Off · On hover · Always. Seven, and the universal trio outside them. **Cut:** a starting number, a numeral style, numbered paragraphs, an index.
- **7 · Data.** `{{content}}` whole. Headings: **0 → no numerals and the design is 2 Plain** ⚑; 1 → a lone 01; many → zero-padded to two digits and right-aligned so the column never moves; **past 99 the padding stops and the numeral grows into the gutter**, which holds to 999. **An H3 before any H2 takes 00.1** ⚑. **At the paywall cut the numbering stops at the cut and the counter is recomputed on the unlocked page rather than continued** ⚑.
- **8 · Empty state.** Empty `{{content}}` → nothing. No headings → the measure alone, **no numeral column reserved** ⚑. Editor: "This post has no headings. There is nothing to number." A single heading renders 01 and the panel does not warn — one numbered section is a legitimate post.
- **9 · Behaviour module.** None; `core` assumed. **No-JS: pixel-identical** ⚑ — CSS counters are a stylesheet feature, **so the numbering survives with JavaScript off**, which distinguishes this design from every index in the category. The fourth A25 design that is the same document either way. Edit-safe.
- **10 · Accessibility.** `<article>`, no `h1`; `scroll-margin-top: 96px`. **The numerals are `::before` content and are `aria-hidden` by being generated** ⚑ — a screen reader announces "Who is actually paying", not "01 Who is actually paying", and a reader who copies the heading copies the heading. **The anchor is inline with the heading and the numeral is never the link** ⚑. Measured light: numerals 5.4:1, headings 13.1:1. **Accent is spent once, on the focus ring.** Print: **numerals print, above their headings** ⚑.
- **Repeating items.** One, generated: the numbered sections. **The user cannot add, remove, reorder or edit a numeral** — they write a heading and a number appears.
- **Reconciled.** Paragraph rhythm joins the quartet; seven controls. The universal trio outside the list, Vertical spacing **inert**, and the numerals keeping `text-muted` at every Background role. **This is the design the category now recommends for a site that must work with JavaScript off** ⚑ — CSS counters need no script where the four indexes lose theirs — and finding 6 is corrected to say so.
- **Flagged ⚑** — CSS counters rather than a script or authored numbers; the 72 px column and 32 px gutter; zero padding and right alignment; numerals in the mono face and in `text-muted`, never accent; 00.1 for an orphan H3; the margin resolving to Above below 1,200; 11 px decimals at 390; the counter recomputed across a paywall cut; numerals not copying with a heading; numerals printing.

---

## 2 · Component inventory

Every reusable component this category established or reused, cumulative.

| Component | What it is | First from |
|---|---|---|
| Logo lockup · nav item · dropdown panel | 26 px accent mark + wordmark; 15 px nav; 248 px panel | A1·1 |
| Primary button · ghost action · drawer | accent fill 14/600; muted bar text; 64 px close row | A1·1, A1·2 |
| Icon button | 38 px box, bare / outlined / filled, 44 px target | A1·14 |
| Avatar + meta row | 24 px circle, initials fallback, "Name · date" at 13 px | A1·6 |
| Focus ring | 4 px accent ring on every interactive element | A6 |
| Named ratio ladder | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 | A8 |
| Measure and page margin | content 1,296 on 72; 754 on 40; 350 on 20 | A17 |
| On-contrast derivation | every colour in a band derived from two `contrast` tokens | A17·7 |
| Surface card | radius token, md shadow in light, hairline in dark | A19·3 |
| Missing-image vocabulary | Reflow · Plate · Hand off | A19 |
| Padding ladder | Compact 64 · Comfortable 96 · Spacious 132, named never numeric | A24 |
| ~~Links control~~ | Two · Three · Four — **retired in A25 by Ghost's native share modal** ⚑ | A24·14 |
| ~~Copied confirmation~~ | accent fill + label for 1.6 s — **gone from A25: Ghost's modal announces its own** ⚑ | A24·14 |
| Share-destinations setting | one site-wide ordered, enabled list of ten destinations + a Mastodon instance | A24·14 — **not read by A25 any more; Ghost's native modal replaced it** ⚑ |
| Inert universal row | a universal control drawn greyed with its reason where a design cannot use it | A24·5 — **A25 draws it in all twelve** |
| Locked ground row | Background role locked with the reason shown, where the ground is the design | A24·5 — **A25·3, A25·4** |
| Post-content control quartet | Measure · Type scale · Drop cap · **Paragraph rhythm**, first in every A25 panel | C.2 → **A25·1** |
| Cards note | "Cards are set once, site-wide", in every A25 panel | C.2 → **A25·1** |
| **Article type scale** | body 17/19/21 at 1.7, h2 28/32/36, h3 21/24/26, captions 13 | **A25·1** |
| **Drop cap** | three-line `::first-letter` initial in the heading font, first paragraph only | **A25·1** |
| **Index (table of contents)** | 240 column, 11 px uppercase label, 2 px accent current rule, `aria-current="location"` | **A25·1** |
| **Index disclosure** | closed `<details>` row at 44 px with the heading count at its right | C2b → **A25·1** |
| **Share mark** | one `<a href="#/share">` icon button at the margin's inner edge, optionally with its label | **A25·9** |
| **Share row** | label left, one mark right, above a hairline; the foot-of-article form | C2b → **A25·1** |
| **On-band share mark** | one share mark on a surface derived at 6% of a band's own text | A26·4 → **A25·4** |
| **Card-width breakout** | Follow the card widths — the section obeying Ghost's per-card normal / wide / full | **A25·5** |
| **Anchor link** | ⌗ in a 38 px box at a 44 px target beside a heading; never the heading itself | **A25·1** |
| **Article sheet** | `surface` plane at the content width, symmetrical inset, media to its edge | **A25·3** |
| **Reading band** | full-bleed `contrast` ground carrying a derived palette and its own index | **A25·4** |
| **Full-bleed figure** | viewport-wide image, no radius, caption returning to the measure | **A25·5** |
| **Hanging heading column** | 180/240 column left of the measure, top-aligned with its text | **A25·6** |
| **Boxed index** | hairline-bounded index on the measure, one to three columns, count + reading time | **A25·8** |
| **Margin note column** | 240 column for captions and quotes, with a 140-character return rule | **A25·10** |
| **Article box** | hairline box hugging the measure, rules at the full inner width | **A25·11** |
| **Numeral column** | 72 px mono counter column, zero-padded, right-aligned | **A25·12** |

---

## 3 · Findings for the architect

1. **A pack must supply its drop-cap ratio with its heading font.** Three lines is a section
   instruction; what three lines *is* in pixels is a pack property, and Georgia, Bricolage and Inter
   give three different answers. With A24's finding about title tracking and leading, this makes a
   pack **a set of type metrics with a palette attached** rather than a palette.
2. **A section-level layout and a site-level card setting can disagree — and this pass narrows it to
   one design.** 3 Sheet still overrules the Cards module's "wide and full break out to" value inside
   its own ground. **5 Full Bleed no longer does at its default:** Breakout's new **Follow the card
   widths** reads Ghost's per-card width instead. A25's answer is that the section wins for the width
   of its own ground, and the product needs to say so where the user can see it, because the Cards
   panel states a rule one design still breaks.
3. **`scroll-spy`'s registered degradation assumes a server-rendered list, and with `toc` there is
   none.** 7 Sticky Index declares both. FR-G4 still holds through `toc`'s clause, but the registry's
   wording for `scroll-spy` should say which case it describes.
4. **C.2's panel line and C2b's frame disagree about the index below 834.** The line says it hides;
   the frame draws it collapsed. A25 follows the frame; the line needs correcting in C.
5. **Ghost has no footnote, aside or marginalia primitive.** 10 Marginalia moves captions and quotes
   because they are the only two elements the content model can produce that belong in a margin.
   True marginalia needs a card — a content-model decision, not a layout one.
6. **Four designs lose their index with JavaScript off, and no theme-layer fix exists.** ⚑ 1, 4, 7
   and 8 build their index from `{{content}}` in the browser, and each loses it through the `toc`
   module's own registry clause. **The earlier claim that "a server-side heading pass in the theme
   layer would let the four indexes do the same" is withdrawn as wrong:** a Ghost theme cannot add
   helpers, and `{{content}}` is opaque at render time — the theme receives rendered HTML it cannot
   parse in Handlebars. A server-side heading pass is therefore **a Ghost core change, not a theme
   one**. **What the category can honestly recommend today is 12 Numbered**, whose CSS counters make
   an article's structure visible with no script at all, and it is the design to reach for on a site
   that must work with JavaScript off.
7. **A26 Post Footers should own the space below the article** the way C Post Body owns the 64 above
   it, and should reuse 9 Share Rail's mark rather than drawing a second one — a post with 1
   Measured's rail Under and A26's own share row would show two share affordances in eighty pixels.
   **Ghost's native modal makes the duplication cheaper to fix and more obvious when it happens:**
   both would now be links to the same `#/share`.
8. **The paywall cut needs a documented contract with every section that draws a ground.** Three A25
   designs close their ground above it by rule; A32 should state what it expects to be handed,
   because the alternative is each section guessing.
9. **Ghost took sharing native, and two other categories are still holding a theme-side share
   list.** ⚑ **ARCHITECT: retire the setting.** A25 now uses `<a href="#/share">` in all six designs
   that share, which deletes its destination list, its `copiedLabel`, its `post.url` reads, its
   `share` module declarations and — three days after adopting it — its use of A24·14's site-wide
   Share-destinations setting. **A24·14 and A26·9 still draw platform links and still read that
   setting.** Unless they follow, one theme will offer two different share experiences on one page,
   and the owner will configure a list that only half the sections obey.
10. **The universal Vertical spacing is inert in an entire category, and the platform should be able
    to say so once.** ⚑ Twelve panels each draw a greyed row with the same sentence, because the space
    above the article belongs to C Post Body. A category-level statement — "this section's outer
    spacing is owned elsewhere" — would replace twelve repetitions of it.

---

## Reconciliation notes

**Frames changed in this pass — thirteen, and every one of them.** `A25-0 Category Proof`, `A25-1 Measured`, `A25-2 Plain`,
`A25-3 Sheet`, `A25-4 Contrast Band`, `A25-5 Full Bleed`, `A25-6 Hanging Heads`, `A25-7 Sticky
Index`, `A25-8 Index Top`, `A25-9 Share Rail`, `A25-10 Marginalia`, `A25-11 Ruled` and
`A25-12 Numbered`. **All twelve control panels** gained the shared **Paragraph rhythm** row, the
**universal trio outside the list** (Background role, Vertical spacing drawn inert with its reason,
Top divider), an **EDITING · THE P0 PRIMITIVES** block, a **DATA** block, and an updated control
count. **Section frames were redrawn only where visible content changed:** the share clusters in
`A25-1`, `A25-3`, `A25-7`, `A25-8` and `A25-9` (new destinations and new glyphs), a **new state on
`A25-4`** (the share row on the derived on-band surface), and a **new state on `A25-5`** (the three
Ghost card widths at Follow the card widths). `A25-9`'s link ladder, labelled rail and mobile list
were redrawn destination by destination and its panel gained the read-only site-setting row. **Every
design's spec card carries a new Reconciled paragraph.** On `A25-0 Category Proof` the roster's control
counts and 4 Contrast Band's module cell, the shared floor (four new rules: the quartet, the universal
trio, editing, and the destinations as a site setting), the shared field list's read-by column, the
repeating-items block and findings 2, 6, 9 and 10 were all rewritten; **the tokenisation proof, the
fixture inventory and the stress frame are untouched**, because nothing in this pass changes what the
article itself looks like.

**Item by item.**

- **Category-wide 1 — the three visible authored labels edit inline.** `indexLabel`, `indexNote` and
  `shareLabel` now edit on canvas with P0·1, and `copiedLabel` with them; stated on all twelve panels
  and in the shared floor.
- **Category-wide 2 — one site-wide ordered Share-destinations setting.** A25's fixed list (Bluesky ·
  LinkedIn · Email · Copy link) was **withdrawn** in favour of A24·14's setting — **and the
  native-share pass later that day superseded that too**; see the native-share section below.
- **Category-wide 3 — Paragraph rhythm promoted.** The trio is a quartet in all twelve; panels go to
  seven (eight on 4 Contrast Band, five on 2 Plain), well under the ≈15 cap.
- **Category-wide 4 — finding 6 corrected.** The claim of a theme-layer server-side heading pass is
  withdrawn as factually wrong; the four indexes lose their list through the `toc` module's registry
  clause, and 12 Numbered is the design recommended for a no-JS site.
- **Per design 1 — 4 Contrast Band gains Share rail: Off · Under** on A26·4's derived on-band surface;
  the earlier refusal is withdrawn, and the design declares `share` at that value.
- **Per design 2 — 5 Full Bleed gains Breakout: Follow the card widths**, and it is the default; Full
  bleed and Wide remain blanket overrides.
- **Per design 3 — 8 Index Top's `indexNote` and `indexLabel` edit inline**, which is why the shared
  rule exists: they sit at the top of the reader's path.
- **Per design 4 — 9 Share Rail's page rule corrected.** The rail draws on posts and pages alike; the
  old "no rail without `post.url`" clause could never have fired and is withdrawn.

**Conflicts recorded rather than resolved silently.**

- **Three conflicts recorded in the controls pass are now moot, and are kept here as history.** The
  disagreement about whether Links counted the *first* or the *last* N of the shipped order; the
  withdrawal of "Copy link is always last and always present" as an A25 law; and A25·9's Copy-link-alone
  fallback for a site that had enabled nothing. **Ghost's native share modal ends all three** — there
  is no count, no order and no list in the theme — and what survives of them is finding 9, which is
  now about A24·14 and A26·9 rather than about A25.
- **Vertical spacing is inert in all twelve** rather than replacing a per-design Padding row: A25 had
  no Padding row to retire, because C Post Body owns the space above the article. The three internal
  ladders (3 Sheet's inset, 4's band padding, 11's inset) and 5's space around media **keep their own
  names** under the pass's own rule, and each panel says why. Recorded as finding 10.
- **Top divider collides with 8 Index Top's own upper hairline.** Rather than draw two lines or drop
  the universal row, **Line resolves into the index's existing hairline** ⚑ — the first time in the
  library a universal control resolves into a design's furniture, and a precedent the platform should
  either bless or forbid.
- **Member Visibility and P0·4 land nowhere in A25**, and P0·5 lands nowhere because the category owns
  no query. Both are judgements, stated on every panel: an index entry is navigation and a share link
  is not an offer.
- **Image focus lands nowhere in A25.** Ground rule 10 asks every image field to carry it; **A25 has
  no image field** — the pictures are Ghost's and their widths are the Cards module's — so the rule is
  satisfied by absence, and 5 Full Bleed's new Breakout is the closest thing the category has to an
  image control.
- **The frames no longer draw brand glyphs at all.** The controls pass drew Bluesky and Mastodon as
  monograms because the frames could not claim to be brand artwork; the native-share pass removed the
  question — there is one share glyph, from P0·2's Icon Picker, and Ghost's modal draws the platforms.

---

## Native-share pass — 25 August 2026

Ghost ships a **native share modal**: a link to `#/share` on any post or page opens it, and it
carries copy-link, email and the social platforms with the post's title and URL already filled in.
No theme UI and no theme JavaScript are required. **A25 adopts it in all six designs that share**, and
the frames were redrawn accordingly.

**Frames changed — nine.** `A25-0 Category Proof` (roster modules and 9's tuple and count, the shared
floor, the field list, the repeating-items block, findings), `A25-1 Measured`, `A25-3 Sheet`,
`A25-4 Contrast Band`, `A25-7 Sticky Index`, `A25-8 Index Top` and `A25-9 Share Rail` (drawn
affordances, panels and spec cards), and `A25-2 Plain`, `A25-5 Full Bleed`, `A25-6 Hanging Heads`,
`A25-10 Marginalia`, `A25-11 Ruled`, `A25-12 Numbered` for the shared EDITING and DATA blocks and
their dormant-field lists. `A25-9`'s states section was rebuilt from scratch: the link ladder is gone,
Share style Icon · Icon and label replaces Rail labels, and rest · hover · focus replaces the copied
confirmation.

**What changed, in one list.**

- **Every share affordance is one mark** — `<a href="#/share">`, an icon or an icon and its label.
  No platform icons, no rows of buttons, no towers of two to four.
- **The `share` module leaves the category.** 1 Measured goes from two modules to one, 7 Sticky Index
  from three to two, 3 Sheet and 9 Share Rail to none. A25 now spends `toc`, `scroll-spy` and
  `lightbox`.
- **`copiedLabel` is deleted; `post.url` and `post.title` are no longer read.** The field list falls
  from ten entries to seven, and the copy confirmation, its accent fill and its `aria-live` region
  are Ghost's.
- **9 Share Rail loses Links** — six controls, the only panel in the category to lose one — **gains
  Share style** (Icon · Icon and label), **loses the rotated 11 px label**, and **its count slot falls
  from `few` to `one`**, which leaves A25 spending no `few` at all.
- **A24·14's site-wide Share-destinations setting is not read by A25 any more**, three days after this
  same pass adopted it. Recorded as finding 9 rather than reversed in silence: **A24·14 and A26·9
  still read it**, and until they follow, one theme offers two share experiences.
- **The share catalog strings are gone** — "Share on {destination}", "Email", "Copy link" — because
  Ghost's modal supplies the platform names.
- **The no-JS statement is honest and worse than before** ⚑: the anchor always renders, and Ghost's
  modal is Ghost's own client-side flow, so with JavaScript off the link opens nothing. No registry
  module is involved either way, and the theme cannot fill the gap.
- **The accessibility case improves:** one `<a>` named by `shareLabel`, never a `<button>`, and
  **the theme announces nothing** — Ghost's modal owns its focus trap, its labels and its live region.
