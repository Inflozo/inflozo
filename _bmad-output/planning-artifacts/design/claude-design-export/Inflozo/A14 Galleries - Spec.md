# A14 Galleries — written specification

15 designs · Paper pack · drawn 23 August 2026

The frames are `A14-0 Category Proof.dc.html` and `A14-1` … `A14-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(1 Grid in three packs, light and dark), the stress frame, the roster, the component inventory, the
findings and the four settlements in full. The shared field list is repeated below because the build
reads it.

**Design patch pass — 30 August 2026 (this document's current state).** The ten library-wide rules
were applied to all fifteen designs, and two of them changed something. **Gap names are "Tight ·
Normal · Loose":** eleven Gap rows are renamed and **no value changed** — 8 · 24 · 40 px, and 13
Contact Sheet's tighter 4 · 8 · 16 — which **reverses A14's own earlier amendment** that had the PRD
adopting Tight / Even / Airy. **No design ever turns into another design:** 1 Grid stops calling
itself "the arrangement six other designs resolve to at 390", and 6 Contrast Band no longer "prints
as 1 Grid on white" — on paper its fill is dropped and the arrangement is unchanged. **Ghost's
templates cannot count**, so every number in the category is stated as what it is: a stylesheet
counter in 12, 13 and 14, an authored label in 8 and 13, and one generated count in 15 Boxed — which
raises this pass's one open question, because a bound gallery cannot subtract the posts it skipped.
The remaining rules had no subject here, and each one is recorded, checked design by design, in
**Patch notes**. **Nothing was renumbered, no design was deleted, no section frame was redrawn, and
no visual language, type scale, colour pack or spacing step changed.**

**Design patch pass two — 1 September 2026.** One work-list item, and it reached three places. **The
disabled-control pattern now covers every case where one gallery control switches another off**: at
Lightbox: Off, **"In the lightbox only" is greyed with the reason beside it** and Captions falls to
the design's own under-the-frame value, in the eleven designs that offer the pair — 3 Mosaic and 9
Full Bleed already resolved it and the other nine were resolving it silently; **9 Full Bleed's
Gutter: None is greyed while its captions sit under each frame** rather than being forced off None by
the panel; and **the Lightbox row is greyed at Source: From posts in all fifteen**, where every bound frame links to its post and no bound frame ever honoured On — **withdrawn by pass three, below**. **7 Carousel and 8 Filmstrip keep their arrows on a laptop and a
tablet and declare 768 as the width they retire under, and both no-JavaScript lines read on both
sides of it** — owner-ruled, 1 September 2026. **13 Contact Sheet greys Captions from titles at Off in bound mode**, by the same ruling, so it stores no caption it cannot show — **withdrawn by pass three, below**. **Nothing was renumbered, renamed, redrawn or
deleted, no control was added or removed, no value changed, and no type scale, colour pack or spacing
step moved.** **Both open questions this pass raised were ruled by the owner on 1 September
2026 and are closed** — 13 Contact Sheet's captions in bound mode and the width the arrows retire
under — and **one conflict is listed rather than chosen**: a switched-off control is never hidden, and the Data group's hidings come
from P0·5 and P0·3, which this pass may not redesign.

**Design patch pass three — 2 September 2026.** One work-list item, and it takes something away
rather than adding it. **Bound mode does not link each picture to its post** — owner-ruled,
2 September 2026, closing the open question the last pass raised. A gallery whose every frame links
to a post resolves, for a visitor, to what a Post Grid resolves to, and two categories arriving at
one outcome is what the library's uniqueness rule exists to prevent. **A14 stays pictures-only**: the
per-frame post link is removed from bound mode wherever it was specified or drawn, and **the boundary
is stated once in the category layer — A14 shows images the owner chose, A17 shows posts.** Two
narrowings fall with it, because the link was the only reason either was ever written: **the Lightbox
row is live again at Source: From posts in all fifteen**, and **13 Contact Sheet's Captions from
titles is live again in bound mode**, its titles reachable in the overlay like everyone else's.
**Nothing was renumbered, renamed, redrawn or deleted, no control was added or removed, no value
changed, no type scale, colour pack or spacing step moved, and no design total is written anywhere.**

**[Free] designs:** 1 Grid · 14 Index

*(Shortlisted in this pass — 1 Grid, 14 Index, 12 Captioned Rows, 15 Boxed, 13 Contact Sheet: the
plainest designs, weighted towards the ones that do not need the customer to own good photography —
recommended as **a grid and a list**, and **ruled by the owner on 30 August 2026**. 1 Grid for a site
with pictures worth showing large, 14 Index for a site without: there the photograph is a 128 × 96
thumb and the captions carry the section, so a free site with weak photography still looks
deliberate. The pairs he refused: 1 Grid with 15 Boxed, two versions of the same even grid, which
leaves a free site with poor pictures nothing that flatters them; and 1 Grid with 12 Captioned Rows,
which is handsome at four photographs and a very long page at twenty.)*

**Controls-reconciliation patch (the pass before this one), 24 August 2026.** The category was
audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface,
thinking like an end user editing their own site. It reuses the shared editor primitives designed in
**P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot
and
Icon Picker, the P0·3 item list, the P0·5 "Populate from…" data panel, the P0·6 editor state
switcher —
and never redesigns them. **No layout was redrawn in this pass**: what changed is the control
panels,
the editing and data statements, one deleted control, one disabled value and one raised limit. The
category-wide list is on `A14-0` and the frame-by-frame list is in **Reconciliation notes** at the
foot.

**A14's founding fact is amended, once, by owner ruling** ⚑. It was drawn as the first category in
the
library with no query behind it; **Source: Authored · From posts** now ships on all fifteen panels.
**Authored stays the default and every frame's state**, and everything the category says about
authored galleries is unchanged.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; the finished categories are specified in root-level
`<ID> — Spec.md` files and this follows them.)*

---

## 0 · The category layer

### What A14 is

**A section that shows a set of photographs the author uploaded.** It is the first category in the
library **with no query behind it** ⚑ — nothing is read from Ghost's content API, every frame is
authored in the section, and the count is the length of the list rather than a number the user
picks. That single fact shapes the whole category: there is no Show ladder, the images block is the
one repeating unit, and every arrangement has to hold at whatever the author typed.

Three neighbours own adjacent ground and A14 does not repeat them. **A33 Koenig Card Treatments**
owns the gallery card inside `{{content}}` — a gallery authored in a post, laid out by Ghost's own
rules, which **none of A14's controls reach** ⚑. **A17 Post Grids** owns grids of posts, where the image is a post's feature image and the text is a title; A14's grids carry no titles and no links to posts. **The boundary, stated once and ruled by the owner on 2 September 2026: A14 shows images the owner chose, A17 shows posts** ⚑ — and it holds in both data modes, because a bound A14 frame reads a post's feature image and links to nothing. **A15 Video and Embeds** owns moving pictures. A14 owns still photographs the author chose.

A14 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20;
64 · 96 · 132); **A17's missing-image plate**; **A17·11's column masonry**; **A17·12's bento tile**;
**A17·7's on-contrast derivation**; **A19·15's carousel track, dots and arrows**; **A20·13's warm
scrim**; **A26·3 and A27·4's surface plane and their call that a full-width fill is a ground rather
than a containment**; **A9·5 and A16·1's two-column split and its 1,080 collapse**; **A9·15's ledger
row**; **A9·8's disabled-value convention**; **A3's repeater**; **A1's eyebrow, icon button and
striped plate**; **A6's focus ring**. **A14 adds ten components and nothing else** — they are listed
at the foot.

### The four settlements (§8 of the brief)

**1 · Grid, masonry and carousel — and what survives reduced motion.** **Four arrangements, and they
are four designs rather than four values** ⚑: the even grid (1, and the eight designs that vary its
ground, containment and media placement), the column masonry (2), the one-up track (7) and the
edge-running strip (8). A single "layout" control would make nine designs one, and the collapse
rules make it impossible anyway — a grid goes to one column at 390 and a strip never does.
**Masonry is `column-count` and measures nothing** ⚑ (A17·11's finding, carried verbatim); **the
carousel is a native `scroll-snap` track**. Both work with no JavaScript. **Everything survives
reduced motion because almost nothing moves**: there is **no autoplay at any value anywhere in
A14** ⚑, and under reduced-motion exactly two things change — **the carousel scrolls instantly
rather than smoothly**, and **the frame's 2 px hover lift is dropped while its underline stays** ⚑.

**2 · Mixed aspect ratios, and whether crops are enforced.** **Crops are enforced by default and
"As uploaded" is one value of the control** ⚑ — *Square 1:1 · Landscape 4:3 · Portrait 3:4 · As
uploaded*. An even grid of mixed ratios is a ragged grid, so the default protects the arrangement
and the fourth value gives the photographs back. **As uploaded is disabled in 3 Mosaic, 7 Carousel
and 9 Full Bleed** ⚑ — a fixed tile, slides that must share a height, and a wall-to-wall set that
would align nowhere — and **locked on in 2 Masonry**, which exists for it. A9·8's convention
throughout: shown, struck through, with the reason. **Where a photograph is cropped is content, so
the focal point is a field on the image and not a
control** ⚑ — and in this pass it takes the library's own name and values: **Image focus, Centre ·
Top · Bottom, on every image, reached from the Image Picker popover and never a hidden field** ⚑.
**The mono label on every plate names
the crop and the ratio it came from** — `03 · 4:3 ← 3:2` — so the cost is visible on the frame.

**3 · Captions: per image, per gallery, or none.** **Per image, and the gallery already has a
blurb** ⚑ — different fields, different jobs, and no design draws a second gallery-level caption.
`caption` is per item at **≤ 200 characters** ⚑ — raised from 80 in this pass; `blurb` is the
section's at ≤ 200; `credit` is the
photographer's line and sits under the set in all fifteen. **Four places a caption can be drawn**:
under the frame (1, 2, 4, 5, 6, 8, 15), inside it on a wash (11), beside it at body size (12), or in
the overlay only (3, 9, 13 by default). **Three designs have no Captions control at all** ⚑ — in 11,
12 and 14 the caption *is* the design. **Off never deletes a caption** ⚑: it means "not under the
frame", and the text stays in the item and in the overlay. **A caption is never `alt`** ⚑ —
separate fields; a frame with a caption and no alt gets `alt=""` with the caption doing the
describing in the flow.

**4 · The lightbox.** **One overlay for all fifteen designs** ⚑, drawn in full on 1 Grid and
referenced by number everywhere else. It is a `<dialog>`: **focus is trapped** while it is open —
Tab cycles close · previous · next · the caption's link — **Escape closes it and returns focus to
the frame that opened it** ⚑, and **← and → step and wrap** ⚑. **The caption is drawn inside the
overlay at every Captions value, including Off** ⚑, with a mono counter at the top left. **The
overlay requests the original file, not the cropped derivative** ⚑. **An image carrying its own link is never a lightbox trigger** ⚑ — the author's link wins. **A bound frame carries no link** ⚑ — owner ruling, 2 September 2026 — so **the overlay behaves at Source: From posts exactly as it does at Source: Authored**. The module is **`lightbox`, edit-safe:
no** ⚑.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The frame.** A `<figure>`: one plate at the section's crop, an optional `<figcaption>`, and
  **the whole cell is the link** — 416 × 312 at the default, far past any target minimum.
  **Hover lifts it 2 px and underlines the caption**, 160 ms ease-out; **focus draws A6's 4 px
  accent
  ring 3 px outside it** ⚑ (inset in 9 and 10, carried colour in 6 and 11); **reduced motion drops
  the lift and keeps the underline** ⚑.
- **The caption.** 14 px in `text-muted`, 10 px under its frame, wrapping to the frame's own width.
  **Two designs change its type role and say so**: 12 Captioned Rows sets it at 16 px in `text`,
  14 Index at 17 px in `text` ⚑ — there the caption is prose rather than meta.
- **The credit.** One 13 px line in `text-muted`, **under the set and never in the head** ⚑, in all
  fifteen designs. It belongs to the photographs, not to the essay.
- **The count.** **There is no Show ladder in A14** ⚑ — A17's 3 · 6 · 9 · 12 and A19's 1 · 2 · 3 · 5
  count a query, and there is no query here. **1–48 items**, the ceiling A14's own ⚑.
- **Never stretch.** **At one image the cell keeps its column width** ⚑ in every grid; a short last
  row is **left-aligned and short** ⚑. A photograph blown to fill a gap is a photograph the author
  did not choose to enlarge. The two exceptions are structural and named: 10 Lead and Grid's lead,
  and 12 Captioned Rows' single row.
- **The seam.** A14 draws its own padding: **64 · 96 · 132** at 1440, **80** at 834, **64** at 390 —
  A17's ladder. **6, 8 and 13 have no padding of their own** — the band and the strip carry it ⚑.
  **9 and 10 keep vertical padding and have no side padding at all** ⚑.
- **The collapse.** grid-of-N's ladder with **one category-wide departure: one column at 390 rather
  than two** ⚑ — a 167 px cell is a thumbnail of something the reader cannot see. **13 Contact Sheet
  reverses it** and keeps three columns at 390 ⚑; **8 Filmstrip never becomes a column** ⚑; **5 and
  12 collapse at 1,080 rather than 767** ⚑ (A16's number).
- **The type.** Eyebrow 13 uppercase tracked .08em · section heading 40 · 34 · 28 by width (34
  inside
  4 Panel and 5 Split Head) · blurb 17, 16 at 390 · caption 14 (15 at 390 in 11; 16 in 12; 17 in 14)
  · credit 13 · mono 10–12 for crop labels and numbers. **A14 has no display ladder and no Big Type
  design** ⚑ — the display moment is the photograph.
- **Accent, once or never.** The focus ring, in thirteen designs; the active dot in 7 Carousel.
  **None at all in 6 Contrast Band and 11 Overlay** ⚑, where the ring takes the carried colour —
  A29·3's finding that Paper's accent measures 4.0:1 on the band, and the same argument over an
  unknown photograph.
- **Imagery.** **A14 never dims, tints or filters a photograph** ⚑ — not for dark mode, not on a
  contrast band, not behind a caption. The ground changes; the pictures do not. **The wash in 11
  Overlay is a scrim over the image, not a change to it**, and it is identical in both modes.
- **Print.** Every design prints as drawn except three: **6 Contrast Band prints with its fill dropped — dark type on
  white, the arrangement and the captions unchanged, and it is still 6 Contrast Band** ⚑ (A17·7's
  derivation; the same holds in forced colours), **7 Carousel prints its frames stacked**, all of them, in authored order,
  and **8 Filmstrip does the same** ⚑.

### The universal trio

**All fifteen carry Background role, Vertical spacing and Top divider outside their own control
lists**, and **every design's Padding row is retired into Vertical spacing** ⚑ — the same three
values,
Compact · Comfortable · Spacious resolving 64 · 96 · 132 (80 at 834, 64 at 390), under the universal
name. **Five ladders keep their own names because they are genuinely different measures**: in 6
Contrast Band, 8 Filmstrip and 13 Contact Sheet **Vertical spacing resolves onto the band's or the
strip's inner padding** (their section padding is 0 at every value ⚑); **8's Frame height** is a
strip
height; **14's Row height** is a row ladder; **13's Gap** keeps its tighter 4 · 8 · 16; and the
plane's
40 px inset in 4 and the box's in 15 are on no ladder at all.

**Background role is locked in two designs, with the reason drawn in the row** ⚑ — **6 Contrast
Band**
at Contrast, because the inverted band is the design and this arrangement on the page ground is 1
Grid;
and **9 Full Bleed**, because its ground is `transparent`, the frames cover it wall to wall, and
what
shows under a short last row belongs to the section beneath. **In 4 Panel, 8 Filmstrip and 13
Contact
Sheet the plane, the strip and the band derive from the role** ⚑ — surface on Background, background
on
Surface, the band's own plane at Contrast — and one raise, never two. **The photographs are never
re-derived for a role** ⚑, in any design: the ground changes and the pictures do not.

**Top divider is the boundary above the section and never a mark inside it** ⚑ — 12 and 14's Rules,
15's box hairline and 6's and 13's band edges are different marks, and each panel says so. **A14
never
had a Preview control**, so P0·8's removal is a no-op here ⚑.

**The control budget.** Own controls per design after this pass: **five** in 1, 3, 6, 7, 8, 9, 11,
12,
13, 14; **four plus one locked row** in 2; **six** in 4, 5, 10, 15. Plus the universal trio and the
Data group in all fifteen — comfortably inside the PRD's ~15 ceiling. **Quick Controls, three per
design**: 1 Columns · Crop · Gap · 2 Columns · Gap · Captions · 3 Lead position · Crop · Gap ·
4 Columns · Crop · Head · 5 Head column · Columns · Crop · 6 Columns · Crop · Gap · 7 Controls ·
Crop · Peek · 8 Frame height · Gap · Arrows · 9 Columns · Gutter · Crop · 10 Lead height · Lead
width · Followers · 11 Columns · Crop · Caption wash · 12 Image side · Frame width · Crop ·
13 Columns · Numbering · Gap · 14 Thumb · Row height · Numbering · 15 Columns · Box label · Crop.

### The disabled-control pattern

**A control switched off by another is greyed, with the reason beside it** — P0's treatment, applied
without exception: the row is drawn, the switched-off value is struck through, the reason is one
sentence at the control rather than a tooltip, and **no row is ever left accepting a value it will
not honour**. **Nothing in A14 is hidden by another control** except the two hidings the Data group
inherits from the shared primitives, which are recorded as a conflict in Patch notes rather than
changed here.

**Design-level narrowings, drawn greyed since the reconciliation pass** ⚑: **As uploaded** disabled
in 3 Mosaic, 7 Carousel and 9 Full Bleed · **Crop locked at As uploaded** in 2 Masonry · **Background
role locked** in 6 Contrast Band and 9 Full Bleed · **Under each** disabled at Gutter: None in 9 ·
**Lightbox: Off** disabled in 13 Contact Sheet · 13's two Crop values.

**Switched off by another control, and stated as such by this pass** ⚑:

| Where | What greys | The reason drawn at the control |
|---|---|---|
| Lightbox: Off — 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15 | Captions' **In the lightbox only** | "Not available while the lightbox is off: the caption would be unreachable." Captions falls to **Under each** — **Under the frame** in 7 — and the value returns with the lightbox |
| Captions: Under each — 9 Full Bleed | Gutter's **None** | "Not available while captions sit under each frame: there is no space for the line to sit in." Replaces the silent forcing of Gutter off None ⚑ |

**The fallback is the category's own rule, not a new one** ⚑: **a caption is never unreachable**, the
rule 3 Mosaic and 9 Full Bleed were already applying. **11 Overlay, 12 Captioned Rows and 14 Index
have no Captions control**, so nothing there depends on the lightbox. **Two rows this table carried are withdrawn** ⚑ — the whole Lightbox row greyed at Source: From
posts in all fifteen, and 13 Contact Sheet's Captions from titles greyed at Off in bound mode. Both
were written because a bound frame linked to its post and opened it instead of the overlay;
**the owner's ruling of 2 September 2026 removes that link**, so neither control is switched off by
another any more and both are live in both data modes. **13 Contact Sheet's own Lightbox: Off stays
disabled** for its own standing reason — nothing is captioned on the page there, so with no overlay
the captions would be unreachable.

### Editing

**Every visible authored text is inline-editable on canvas with the shared P0·1 toolbar** — bold ·
italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
noreferrer · sponsored**. That is `eyebrow`, `heading`, `blurb`, `credit`, `moreLabel` **and every
`caption`, edited in the place it is drawn** ⚑ — under the frame in 1, 2, 4, 5, 6, 8, 15; on the
wash
inside the frame in 11, where **the three-line clamp is lifted while the caption has focus** ⚑;
beside
the frame in 12; in the row in 14; and **in the item row in 3, 9 and 13, where the caption lives in
the
overlay and the overlay is not an editing surface** ⚑. **Every URL field opens the Ghost-aware Link
Picker** — per-image `link` and `moreUrl` ⚑. **The See-all link in 8 and 13 takes an optional P0·2
icon before or after its label**, off by default, with the picker's size and colour-role popover ⚑.

**Nothing generated is editable** ⚑ — the row numbers in 12, 13 and 14, the counter and dots in 7,
and
15's generated count are renderings of position or length: there is nothing to click and nothing to
type. **At Source: From posts the caption is the post's title and Ghost-owned**: the toolbar is
replaced by the plain-text lock pill and clicking says "Edit in Ghost" ⚑.

### Data — galleries from posts

**Owner ruling, and the one amendment to the category's founding fact** ⚑. **Source: Authored · From
posts** ships on all fifteen panels as the Data group, drawn as **P0·5** with nothing redesigned.
**Authored is the default and every frame's state.** At From posts:

| Control | Values | Note |
|---|---|---|
| Filter | Latest · Featured · By tag · By author · Hand-picked | P0·5's five paths; Hand-picked hides Count and Order |
| Order | Newest · Oldest | P0·5's two |
| Count | stepper, ceiling = the design's drawn-for range | never above **A14's 48** ⚑ |
| Captions from titles | On · Off | On writes `caption` ← the post title; Off leaves them empty ⚑. **Live in all fifteen and in both data modes** — the 1 September greying in 13 Contact Sheet is withdrawn ⚑ |

**Mapping**: `image` ← the post's **feature image** · `caption` ← the post title at Captions from
titles: On · `alt` ← the image's own alt in Ghost, empty if it has none. **The frame does not link to its post** ⚑ — owner ruling, 2 September 2026: A14 shows images the owner chose and A17 Post Grids shows posts, so a bound frame is a picture and nothing else. **The lightbox behaves in bound mode exactly as it does at Source: Authored.** **Add, Remove and Reorder
are
hidden in bound mode** — P0·3's read-only card, one row per post ⚑. **A post with no feature image
is
skipped and the panel says how many were** ⚑. Crop's disabled values stay disabled in bound mode,
and
2 Masonry's lock still holds — bound frames keep their feature images' own ratios there.

### Visitor-facing strings

**No fixed English visitor-facing string ships** ⚑. A14's are all chrome, and all become **theme
translation-catalog strings**: the lightbox's close, previous and next labels and its counter; 7's
dot
labels ("Go to photograph 3 of 6"); 8's scrollable-row group name; and **15 Boxed's "photograph /
photographs"**, whose plural forms belong to the catalogue ⚑. **Everything a reader reads as content
is
an authored field** — including 8's and 13's See-all label, which was already authored, count and
all.
The editor's own drop-zone line is editor chrome and not a shipped string.

### Behaviour, and member awareness

**Behaviour comes only from the fixed registry, and A14 coins nothing** ⚑: `lightbox` in all
fifteen,
`carousel` beside it in 7 and 8. **No autoplay at any value anywhere in A14** — owner-ratified in
this
pass and stated on 7's and 8's frames so it stops being re-litigated. **No design carries Member
Visibility** ⚑ — a gallery bears no auth or subscribe action, so P0·4 has nothing to edit here, and
the See-all link in 8 and 13 is navigation rather than a CTA. That is a judgement, and it is
recorded
in Reconciliation notes rather than assumed.

### The roster

**Ctl** counts the design's own visible controls; **+3u** is the universal trio and **+D** the Data
group, both outside that list. **L** is a locked row.

| # | Design | What it is | Tuple | Ctl | Module |
|---|---|---|---|---|---|
| 1 | **Grid** · **[Free]** | Three even columns, one enforced crop, captions under. | `grid-of-N · none · page · many · top · one enforced crop across every cell` | 5+3u+D | `lightbox` |
| 2 | **Masonry** | Native ratios in balanced columns; nothing packs. | `grid-of-N · none · page · variable · top · native ratios in balanced columns` | 4+1L+3u+D | `lightbox` |
| 3 | **Mosaic** | The first image at 2 × 2 cells in a fixed tile. | `grid-of-N · none · page · many · inline · one lead cell at twice the size` | 5+3u+D | `lightbox` |
| 4 | **Panel** | The whole set on one raised surface plane. | `grid-of-N · none · surface · many · top · the whole set on one raised plane` | 6+3u+D | `lightbox` |
| 5 | **Split Head** | The head in a 380 column beside the set. | `split · none · page · many · right · head held beside the set` | 6+3u+D | `lightbox` |
| 6 | **Contrast Band** | 1 Grid on a full-bleed inverted band. | `grid-of-N · none · contrast · many · top · the set on an inverted band` | 5+3u+D | `lightbox` |
| 7 | **Carousel** | One frame at a time, neighbours peeking. | `carousel · none · page · many · inline · one frame at a time` | 5+3u+D | `carousel` + `lightbox` ⚑ |
| 8 | **Filmstrip** | One row at one height, running off the right edge. | `carousel · none · surface · variable · edge · a row that runs off the right edge` | 5+3u+D | `carousel` + `lightbox` ⚑ |
| 9 | **Full Bleed** | Edge to edge, hairline gutters, no margin. | `grid-of-N · none · transparent · many · full-bleed · no margin at any width` | 5+3u+D | `lightbox` |
| 10 | **Lead and Grid** | One bleeding lead frame over a contained row. | `grid-of-N · none · page · many · full-bleed · one lead frame across the page` | 6+3u+D | `lightbox` |
| 11 | **Overlay** | The caption inside the frame on a warm wash. | `grid-of-N · none · page · many · background · caption inside the frame` | 5+3u+D | `lightbox` |
| 12 | **Captioned Rows** | One frame a row, caption beside it, sides alternating. | `stack · none · page · few · left · caption beside every frame` | 5+3u+D | `lightbox` |
| 13 | **Contact Sheet** | The whole set as numbered squares on a band. | `grid-of-N · none · surface · many · inline · a dense numbered sheet` | 5+3u+D | `lightbox` |
| 14 | **Index** · **[Free]** | A ruled row per photograph, thumb at the right. | `table · none · page · many · right · a ruled row per photograph` | 5+3u+D | `lightbox` |
| 15 | **Boxed** | The set in a hairline box with a label on its edge. | `grid-of-N · box · page · many · top · the set in a hairline box` | 6+3u+D | `lightbox` |

### Tuple uniqueness — the honest statement

All fifteen are distinct on the five closed slots. **Archetype**: ten `grid-of-N`, two `carousel`,
one each of `split`, `stack` and `table` — a narrower spread than A16's, because a gallery is mostly
a grid and pretending otherwise would have produced five designs nobody would choose. **Ground does
the separating**: `page` (1, 2, 3, 5, 7, 10, 11, 12, 14, 15), `surface` (4, 8, 13), `contrast` (6),
`transparent` (9). **Media placement carries the rest** — `top`, `inline`, `background`,
`full-bleed`, `edge`, `left` and `right` all appear. **Containment is `none` in fourteen of
fifteen** ⚑: only 15 Boxed puts the section itself in a container, and **nothing in A14 draws a card
around a photograph** — a category decision, not an omission, because a card adds a border to
something that already has four edges.

**What the check cannot promise.** **4 Panel and 15 Boxed are the closest pair** — a fill and a
shadow apart — and the tuple separates them on containment and ground, but the judgement that a box
marks and a plane lifts is a designer's. **1 Grid and 6 Contrast Band are the same arrangement on
two grounds**, which is the rule working as intended. **9 Full Bleed at Columns: Six and 13 Contact
Sheet at Columns: Six are close in density** and separate on ground, margin and numbering. Each
panel names its neighbours by number ⚑ rather than pretending the overlap is not there.

### The content — the shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | all fifteen | Doubles as the box label in 15 ⚑ |
| `heading` | text | opt | 60 ch | all fifteen | Always the `h2`; absent is a supported state |
| `blurb` | text | opt | 200 ch | all fifteen | Clamped 560 on the page, 340 in 5 |
| `credit` | text | opt | 60 ch | all fifteen | Under the set, never in the head ⚑ |
| `moreLabel` · `moreUrl` | text + url | opt | 24 ch | 8, 13 | "See all 48" is authored ⚑; optional P0·2 icon ⚑ |
| `images[]` | list 1–48 | **req** | 48 ⚑ | all fifteen | The category's one repeating unit; authored, never queried |
| ↳ `image` | image | **req** | — | all fifteen | `img_url` derivatives in the grid, **the original in the overlay** ⚑ |
| ↳ `alt` | text | opt ⚑ | 120 ch | all fifteen | Not the caption; load-bearing in 9 and 13 |
| ↳ `caption` | text | opt | **200 ch** ⚑ | all fifteen | Never deleted by a control ⚑; raised from 80 in this pass |
| ↳ `focus` | enum | opt | — | all fifteen | **Image focus** Centre · Top · Bottom, from the Image Picker popover ⚑ |
| ↳ `link` | url | opt | — | all fifteen | An item's own link beats the lightbox ⚑ |
| *the position* | generated | — | — | 3, 10, 12, 13, 14, 15 | The lead; the row number; the count in 15's label ⚑ |
| *@site.title* | Ghost | req | — | any design with no heading | The set's `aria-label` where no heading is authored ⚑ |

**Six authored section fields, one authored list of five, and — at Source: Authored — nothing read
from Ghost but the site title.** No design needs a field the category does not have, so switching
between any two of the
fifteen preserves everything the user typed — including the captions a design does not draw. **The
one real cost was the 80-character caption limit, and this pass spends it** ⚑: `caption` is
**≤ 200** everywhere. The stated reason for 80 — that 11 Overlay must never truncate — was void,
since
11 already clamps at three lines with the full text in the overlay, and 12 Captioned Rows and 14
Index
are caption-led designs that were starved by it. **Switching design still preserves everything
typed**;
what changes is that 11 may now clamp a longer caption, which it was always going to do.

**Control-written values** (none of them per-item): `columns` · `crop` · `gap` · `captions` ·
`lightbox` · `leadPosition` · `leadHeight` · `leadWidth` · `headColumn` · `headPlacement` · `peek` ·
`carouselControls` · `arrows` · `frameHeight` · `gutter` · `scrim` · `imageSide` · `frameWidth` ·
`rules` · `numbering` · `thumb` · `rowHeight` · `boxLabel`. **`padding` is gone** ⚑ — it is the
universal `verticalSpacing`, which joins `backgroundRole` and `topDivider` outside every design's
list, and `source` · `captionsFromTitles` join them in the Data group. **Three designs need a value
that is a position rather than a style** — the lead in 3 and 10, the alternation in 12 — and all
three take it from the list order rather than from a picker ⚑.

### Repeating items — the whole category

**A14 has exactly one repeating unit** ⚑ — `images[] { image, focus?, alt?, caption?, link? }` — and
it
is authored. There is no second list anywhere in the category. **It is the P0·3 item list**, with
the
media picker as its Add: the shared controls, named once.

- **Add** sits at the foot of the images block and **opens the media picker, which takes several
  files at once** ⚑. New frames **land last, in the order they were chosen**, each carrying **the
  file's own name as a placeholder caption the author can accept or clear** ⚑ — never a blank shell,
  never "Untitled". **Add is disabled at 48** with the reason shown ⚑.
- **Remove** is on the row, **never disabled**, and undoable. **Removing to one is allowed in every
  design** ⚑, and so
  is removing the last: the section then does not render on the published page while the editor
  draws its drop zone ⚑. No design blocks removal — a gallery of one photograph is a legitimate
  thing to publish, and 10 and 12 are designed for it.
- **Reorder** is a drag on the row, and **order is meaningful in all fifteen** ⚑ — authored order is
  drawn order everywhere. It carries structural weight in five: **the first image is the lead in 3
  and 10**, **the numbers renumber in 12, 13 and 14**, **the side alternates in 12**, and **the
  column a frame lands in changes in 2**. The editor previews the move in those five ⚑.
- **Minimum and maximum: 1 and 48** ⚑. Above 48 the picker refuses the extra files and says how many
  it took ⚑. **What each design is drawn for**: 1, 2, 4, 6, 11, 15 → 3–12 · 3 → 6 (floor 3) · 5 →
  4–8 · 7 → 4–20 · 8 → 5–20 · 9 → 6, 9 or 12 · 10 → 4 or 7 · 12 → 2–4 · 13 → 9–48 · 14 → 6–48.
  **Outside its range a design still renders** ⚑ — the panel names a better one and nothing is
  disabled.
- **At zero the section does not render** ⚑ — no head, no empty grid, no sample photographs. In the
  editor it draws a full-width drop zone carrying "Drag photographs here, or choose from your
  library" ⚑, the one place in A14 where the editor and the published page differ.
- **At Source: From posts the list is P0·3's read-only card** ⚑ — no Add, no drag handles, no
  Remove,
  one row per post, and a skipped post (no feature image) counted in a note.
- **Inside an item the user edits content only** ⚑ — image, **Image focus** (Centre · Top · Bottom,
  from the Image Picker popover ⚑), alt, caption ≤ 200, link via the Link Picker. All three of those
  are optional: no caption draws no line in 1, keeps the wash in 11, keeps the column in 12, keeps
  the row height in 14; no alt gets `alt=""` and a warning dot in the editor ⚑; a link opens instead
  of the overlay ⚑. **No layout, spacing, alignment or emphasis is editable inside an item**, in any
  design, by construction.

---

## 1 · Grid

1. **Descriptor.** Six photographs in three even columns on the page ground, one enforced crop
   across every cell, each caption under its own frame. The category default. **Every A14 grid goes to one
   column at 390 and stays the design it is** ⚑ — nothing in this category becomes anything else.
2. **Structural descriptor.** `grid-of-N · none · page · many · top · one enforced crop across every
   cell`
   Containment `none` — the section sits in nothing; 15 Boxed is the same arrangement in a box.
3. **Archetype.** grid-of-N. **One departure** — the ladder's final step is one column at 390 rather
   than two ⚑.
4. **Responsive rule.** **1440** content 1,296 on a 72 margin; three columns, gap 24, cell
   416 × 312, caption 14, credit under the set; padding 96. **834** two columns, gap 20, cell
   367 × 275, heading 34, padding 80. **≤ 767** one column, gap 16, cell 350 × 263, heading 28,
   padding 64. **The crop is the same at all three widths** ⚑.
5. **Content fields.** `eyebrow` ≤ 24 · `heading` ≤ 60 · `blurb` ≤ 200 · `credit` ≤ 60 · `images[]`
   1–48 with `image` (req), `alt` ≤ 120, `caption` ≤ 200, `link`. All four section strings optional.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Gap | Tight · Normal · Loose |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Then, outside the list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Columns · Crop · Gap. **Editing** · eyebrow, heading, blurb and credit edit inline
   with the **P0·1** toolbar — bold · italic · underline · link, the popover carrying Open in new
   tab and rel nofollow · noreferrer · sponsored. **Every caption edits inline under its own
   frame**, in the place it is drawn, and holds **200 characters** ⚑. **Every URL field opens the
   Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** Nothing from Ghost's content API ⚑; `img_url` derivatives for the `srcset`, the
   original
   in the overlay ⚑. **0** → the section does not render; drop zone in the editor ⚑. **1** → one
   cell
   at column width, not stretched ⚑. **2–3** → one short row. **many** → wraps, last row
   left-aligned
   and short ⚑. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is
   the default and this section's every drawn state.** At From posts each frame ← **the post's
   feature image**, `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's
   alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**;
   **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no feature image is
   skipped and the panel says how many were** ⚑. Count's ceiling here is **12**, this design's
   drawn-for range.
8. **Empty state.** Absent strings close up; with all four gone the section is the grid alone, which
   is legitimate. **An empty caption draws nothing** — no rule, no reserved line, no "Untitled" ⚑. A
   failed image keeps its box at the crop ratio and draws the hover surface with its alt text at
   13 px ⚑ (A17's plate, verbatim).
9. **Behaviour module.** `lightbox`, **edit-safe: no** ⚑. **No-JS, quoted:** "Each thumbnail is an
   `<a href>` to the full-size image; clicking opens it as a normal page." A14 satisfies that by
   construction — the frame *is* that link before any script runs. **At Lightbox: Off the section
   declares no module and is pixel-identical with JavaScript off** ⚑.
10. **Accessibility.** Heading `h2` ⚑. The set is a `<ul>`; each frame a `<figure>` with its
    `<figcaption>` **inside it, never a sibling** ⚑. Focus order is authored order. The whole cell
    is
    the target. **The 4 px accent ring sits 3 px outside the frame** ⚑ so it is never lost against a
    dark photograph. Caption 5.4:1 light / 5.6:1 dark; heading 13.4:1.
    **Flagged ⚑** one column at 390 · the enforced crop · the short last row · no Show ladder · no
    autoplay anywhere in A14 · the credit under the set.
    **New in this pass ⚑** Padding retired into Vertical spacing · the universal trio · the caption
    at 200 · Image focus on every image · Source: From posts.

---

## 2 · Masonry

1. **Descriptor.** Three columns filled top to bottom with the list in order, every photograph at
   its
   uploaded ratio, captions under each frame. Nothing measures and nothing packs.
2. **Structural descriptor.** `grid-of-N · none · page · variable · top · native ratios in balanced
   columns`
   `variable` separates it from 1 Grid on the same ground and archetype: it is written to hold any
   count at all, including the tall-portrait set that breaks an even grid.
3. **Archetype.** grid-of-N. **One departure** — one column at 390, as 1 Grid. Cells share no
   height,
   so nothing aligns row-wise at any width.
4. **Responsive rule.** **1440** three columns of 416 on a 24 gap, heights the file's own; padding
   96. **834** two columns of 367, gap 20, padding 80 — **the column break moves with the content**
       ⚑.
   **≤ 767** one column of 350, gap 16, padding 64. **No crop at any width.**
5. **Content fields.** The same five as 1 Grid. **This design reads no field 1 Grid does not** ⚑ —
   what differs is the crop value it is fixed at.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Gap | Tight · Normal · Loose |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Crop | As uploaded (locked — 1 Grid named) |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Four**, plus the locked Crop row
   own controls. **Quick Controls**: Columns · Gap · Captions. **The locked Crop row survives where
   5 Split Head's locked Head behaviour did not** ⚑ — the test is whether the control exists
   elsewhere: Crop is live in fourteen siblings and its locked value here *is* the design, while a
   head behaviour nothing in A14 offers was a refusal wearing a control's clothes. **Editing** ·
   eyebrow, heading, blurb and credit edit inline with the **P0·1** toolbar — bold · italic ·
   underline · link, the popover carrying Open in new tab and rel nofollow · noreferrer ·
   sponsored. **Every caption edits inline under its own frame.** **Every URL field opens the
   Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → one column, one frame at 416 ⚑, the other columns absent rather than
   empty. **2** → two columns fill, the third stays empty ⚑. **many** → the browser balances by
   height and **the break point is not stable across widths** ⚑. **Data — Source: Authored · From
   posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this section's every drawn
   state.** At From posts each frame ← **the post's feature image**, `caption` ← the post title at
   **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's
   read-only card); **a post with no feature image is skipped and the panel says how many were** ⚑.
   Count's ceiling here is **12**, this design's drawn-for range. **Crop stays locked at As uploaded
   in bound mode** ⚑ — bound frames keep their feature images' own ratios, which is what this design
   is for.
8. **Empty state.** As 1 Grid; a failed image keeps its **native** box, which the theme knows from
   Ghost's stored image dimensions ⚑.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **The columns need
   no
   module** — `column-count` is CSS, so the masonry is pixel-identical with JavaScript off ⚑.
10. **Accessibility.** Heading `h2`. One `<ul>` in authored order; **visual order is column-major
    and
    DOM order is not** ⚑ — accepted, as A17·11 accepted it, and the honest cost of not cropping.
    **Flagged ⚑** the locked Crop row · column-major reading order · the ragged foot · the moving
    break point · no measured packing and no module for one.
    **New in this pass ⚑** Padding retired into Vertical spacing · the universal trio · the caption
    at 200 · Image focus · Source: From posts · the locked row justified against the fake-control
    test.

---

## 3 · Mosaic

1. **Descriptor.** A fixed tile: the first image at 2 × 2 cells, two cells stacked beside it, three
   in a row beneath. The lead is the list's first frame and no control changes that.
2. **Structural descriptor.** `grid-of-N · none · page · many · inline · one lead cell at twice the
   size`
   Media `inline` — the frames are laid into one tile rather than each sitting above its own
   caption.
3. **Archetype.** grid-of-N. **Two departures** — the tile dissolves at 1,080 rather than narrowing
   ⚑,
   and **at 390 the lead loses its size entirely** ⚑.
4. **Responsive rule.** **1440** lead 856 × 648, cells 416 × 312, gap 24. **1080–834** lead at the
   full box (754 × 566 at 834), the rest two-up at 367 × 275, gap 20 ⚑. **≤ 767** one column at
   350 × 263, **the lead the same size as every other frame** ⚑, order unchanged.
5. **Content fields.** The category's five. Designed for 6; **3 is the floor at which the tile is
   still a tile** ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Lead position | Left · Right |
   | Crop | Square · Landscape · Portrait (As uploaded disabled) |
   | Gap | Tight · Normal · Loose |
   | Captions | In the lightbox only · Under each · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Lead position · Crop · Gap. **At Lightbox: Off, "In the lightbox only" is greyed with the reason beside it and Captions falls to Under each** ⚑
   — 9 Full Bleed already resolves the same pair that way, and the rule behind it is the
   category's: **a caption is never unreachable**. "In the lightbox only" with no lightbox would
   make it so. **Editing** · eyebrow, heading, blurb and credit edit inline with the **P0·1**
   toolbar — bold · italic · underline · link, the popover carrying Open in new tab and rel
   nofollow · noreferrer · sponsored. **Every caption edits inline where the value draws it** —
   under its frame at Under each, and **in the item row when captions live in the overlay** ⚑, the
   overlay not being an editing surface. **Every URL field opens the Ghost-aware Link Picker**,
   per-image `link` included.
7. **Data.** As 1 Grid. **1** → the lead alone at 856 × 648 ⚑. **2** → lead plus one cell, **the
   second cell empty, never stretched** ⚑. **3–5** → the tile fills in order, bottom row short.
   **7+** → rows of three continue beneath ⚑ and **the lead is never repeated**. **Data — Source:
   Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this section's
   every drawn state.** At From posts each frame ← **the post's feature image**, `caption` ← the
   post title at **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are
   hidden** (P0·3's read-only card); **a post with no feature image is skipped and the panel says
   how many were** ⚑. Count's ceiling here is **12**, this design's drawn-for range. The lead is
   **the first post the filter returns** ⚑; Crop's As uploaded stays disabled.
8. **Empty state.** As 1 Grid. The lead's caption is not special ⚑ — the same 14 px line on an
   856 measure.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid.
10. **Accessibility.** Heading `h2`. One `<ul>` placed by explicit grid coordinates, so **DOM order
    and visual order agree at every count** ⚑ — Lead position: Right is a `grid-column` swap, never
    `order`. **The lead is not promoted in the heading structure** ⚑.
    **Flagged ⚑** the fixed tile · As uploaded disabled · Gap changing the lead's size · the 1,080
    dissolve · the lead losing its size at 390 · captions defaulting to the lightbox.
    **New in this pass ⚑** Captions resolving to Under each at Lightbox: Off · Padding retired into
    Vertical spacing · the universal trio · the caption at 200 · Image focus · Source: From posts.

---

## 4 · Panel

1. **Descriptor.** The head, the set and the credit inside one surface plane with a hairline and the
   pack's md shadow; three columns within the plane's 40 px padding. Nothing inside is raised again.
2. **Structural descriptor.** `grid-of-N · none · surface · many · top · the whole set on one raised
   plane`
   Ground `surface`, containment `none` — A26·3's rule that a full-width fill is a ground.
3. **Archetype.** grid-of-N. No departures beyond the category's one-column-at-390 step.
4. **Responsive rule.** **1440** plane 1,296 · padding 40 · three columns 389 × 292 · heading 34 ·
   section padding 96. **834** plane 754 · padding 32 · two columns 351 × 263 · heading 30 · padding
   80. **≤ 767** plane 350 · padding 20 · one column 310 × 233 · heading 26 · padding 64. **The
       plane
   never goes edge to edge** ⚑.
5. **Content fields.** The category's five, all drawn.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Head | Inside the plane · Above it |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Gap | Tight · Normal · Loose |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Six** own controls. **Quick
   Controls**: Columns · Crop · Head. **Gap *Tight · Normal · Loose* is added in this pass** ⚑ — 8
   · 24 · 40 between the frames inside the plane. Seven siblings had it and this one did not, and
   the same grid with and without a gap control is an inconsistency users hit. **The plane's 40 px
   inset is not this and is on no ladder** ⚑. **The plane derives from Background role** — surface
   on Background, background on Surface, the band's own plane at Contrast. **Editing** · eyebrow,
   heading, blurb and credit edit inline with the **P0·1** toolbar — bold · italic · underline ·
   link, the popover carrying Open in new tab and rel nofollow · noreferrer · sponsored. **Every
   caption edits inline under its own frame inside the plane.** **Every URL field opens the
   Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → the plane holds its full width with one 389 px frame in it ⚑.
   **many** → wraps inside the padding. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner
   ruling. **Authored is the default and this section's every drawn state.** At From posts each
   frame ← **the post's feature image**, `caption` ← the post title at **Captions from titles: On**,
   `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no
   feature image is skipped and the panel says how many were** ⚑. Count's ceiling here is **12**,
   this design's drawn-for range.
8. **Empty state.** With every string empty the plane holds frames alone ⚑, which is legitimate and
   identical to Head: Above it with no head authored.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid.
10. **Accessibility.** Heading `h2` at 34 px — **the size drops, the level does not** ⚑. The plane
    is
    a `<div>` and carries no role. **Its hairline is decoration and measures 1.3:1**, stated rather
    than corrected ⚑. Caption 5.4:1 on surface in both modes.
    **Flagged ⚑** the plane as ground rather than containment · one raise never two · no card around
    a photograph · the plane keeping its edges at 390 · the heading at 34.
    **New in this pass ⚑** Gap added · Padding retired into Vertical spacing · the plane deriving
    from Background role · the caption at 200 · Image focus · Source: From posts.

---

## 5 · Split Head

1. **Descriptor.** The head, blurb and credit in a 380 column beside a 868 column holding the set
   two-up, on a 48 px gutter. Fewer, larger frames read alongside their context.
2. **Structural descriptor.** `split · none · page · many · right · head held beside the set`
   The only `split` in A14. At Head column: Right the slot still reads `right` ⚑ — the tuple
   describes the default and the mirror is a control.
3. **Archetype.** split. **One departure** — collapses at 1,080 rather than 767 ⚑.
4. **Responsive rule.** **1440** 380 · 48 · 868; head measure 340, heading 34; frames 410 × 308 on a
   24 gap; credit in the head column; padding 96. **1080** one column, order **head · set · credit**
   ⚑.
   **834** heading 34, frames 367 × 275 two-up, padding 80. **≤ 767** heading 28, one column at
   350 × 263, gap 16, padding 64.
5. **Content fields.** The category's five. **The blurb is drawn at its full 200 characters here**
   ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Head column | Left · Right |
   | Columns | Two · Three |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Gap | Tight · Normal · Loose |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Six** own controls. **Quick
   Controls**: Head column · Columns · Crop. **Gap *Tight · Normal · Loose* is added in this pass**
   ⚑ — 8 · 24 · 40 inside the 868 column; **the 48 px gutter between head and set is not this** ⚑
   and holds at every value. **The fake “Head behaviour, locked at Static” row is deleted** ⚑ — a
   control with one permanently locked value is a refusal wearing a control's clothes — and **the
   no-sticky refusal is panel copy now**, in the words item 9 already uses. **Editing** · eyebrow,
   heading, blurb and credit edit inline with the **P0·1** toolbar — bold · italic · underline ·
   link, the popover carrying Open in new tab and rel nofollow · noreferrer · sponsored. **Every
   caption edits inline under its own frame in the 868 column.** **Every URL field opens the
   Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → one 410 frame and **458 px of empty right margin** ⚑; the panel
   names
   1 Grid. **many** → wraps inside the 868 column. **Data — Source: Authored · From posts** ⚑,
   **P0·5**, owner ruling. **Authored is the default and this section's every drawn state.** At From
   posts each frame ← **the post's feature image**, `caption` ← the post title at **Captions from
   titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's read-only card);
   **a post with no feature image is skipped and the panel says how many were** ⚑. Count's ceiling
   here is **8**, this design's drawn-for range.
8. **Empty state.** **With no heading and no blurb the head column is the credit alone** ⚑ and the
   design still holds — collapsing when the head empties would move the photographs when a user
   deletes a sentence ⚑.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑. **The head does not stick and no module is
   declared for it** ⚑ — a sticky head would make this a `sticky` archetype, which A14 has no design
   in; `scroll-spy` is the nearest and it tracks a list. A finding, not a new module.
10. **Accessibility.** Heading `h2` at 34. **The head column comes first in the DOM at both Head
    column values** ⚑ — Right is a `flex-direction` swap, never `order`.
    **Flagged ⚑** the 1,080 collapse · the credit changing parent · no head-width control · sticky
    refused in panel copy, the locked row deleted · Columns: Four withheld · the empty right margin
    at one image.
    **New in this pass ⚑** Gap added · the fake Head behaviour row deleted, its refusal moved to
    panel copy · Padding retired into Vertical spacing · the caption at 200 · Image focus · Source:
    From posts.

---

## 6 · Contrast Band

1. **Descriptor.** 1 Grid's three columns standing on a full-bleed inverted band that carries the
   section's padding. The ground is the whole of the difference.
2. **Structural descriptor.** `grid-of-N · none · contrast · many · top · the set on an inverted
   band`
3. **Archetype.** grid-of-N. No departures beyond the one-column-at-390 step. The band bleeds at
   every width.
4. **Responsive rule.** **1440** band full width, inner padding 96 vertical · 72 horizontal, content
   1,296, three columns 416 × 312. **834** 80 · 40, content 754, two columns 367 × 275. **≤ 767**
   64 · 20, content 350, one column 350 × 263. **Section padding is 0 at every width** ⚑.
5. **Content fields.** The category's five.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Gap | Tight · Normal · Loose |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Background role (universal) | Contrast (locked — the inverted band is this design's whole identity; the row names 1 Grid) |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (resolving onto the band's inner padding, the section's own being 0 at every value) |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Columns · Crop · Gap. **Background role is locked at Contrast, with the reason shown
   in the row** ⚑ — the inverted band is this design's whole identity and this arrangement on the
   page ground is 1 Grid, which the row names. **Vertical spacing resolves onto the band's inner
   padding**, the section's own being 0 at every value ⚑. **Editing** · eyebrow, heading, blurb and
   credit edit inline with the **P0·1** toolbar — bold · italic · underline · link, the popover
   carrying Open in new tab and rel nofollow · noreferrer · sponsored. **Every caption edits inline
   under its own frame on the band.** **Every URL field opens the Ghost-aware Link Picker**,
   per-image `link` included.
7. **Data.** As 1 Grid. **1–2** → the band holds its full width ⚑ and the editor names 1 Grid.
   **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and
   this section's every drawn state.** At From posts each frame ← **the post's feature image**,
   `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's alt in Ghost;
   **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and
   Reorder are hidden** (P0·3's read-only card); **a post with no feature image is skipped and the
   panel says how many were** ⚑. Count's ceiling here is **12**, this design's drawn-for range. The
   band is unchanged in bound mode; only where the pictures come from changes.
8. **Empty state.** As 1 Grid, with one addition: **a failed image draws the band's own plane**
   (carried colour at 6%) rather than the page's hover surface ⚑.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **The overlay is not
   re-derived for the band** ⚑ — it is dark in both modes and in all twelve packs.
10. **Accessibility.** Heading `h2`. Every colour derived from two tokens; **the focus ring is the
    carried colour, not the accent** ⚑ (A29·3: Paper's accent is 4.0:1 on `#232019`). Text 13.1:1,
    caption 5.9:1 light / 6.1:1 dark.
    **Flagged ⚑** the band carrying the padding · bleeding at 390 · no accent anywhere · the overlay
    not re-deriving · photographs never tinted · **the light band in dark mode**.
    **New in this pass ⚑** Background role locked at Contrast with the reason shown · Vertical
    spacing resolving onto the band · the caption at 200 · Image focus · Source: From posts.

---

## 7 · Carousel

1. **Descriptor.** One frame at a time on a snapping track at 968 × 726, the previous and next
   peeking 140 px at the margins, dots and a counter beneath, arrows beside the head.
2. **Structural descriptor.** `carousel · none · page · many · inline · one frame at a time`
   The containment is of time rather than space — A19·15's phrase, and the reason slot two is
   `none`.
3. **Archetype.** carousel. **One departure** — arrows are never moved over the media ⚑. **They are
   drawn at 1440, 1080 and 834** — **owner-ruled, 1 September 2026: the arrows are not dropped on a
   laptop or a tablet** ⚑, reversing this design's earlier "dropped below 1,080". **Below 768 Controls
   resolves to Dots**, where a 302 px track leaves no room for a button beside it.
4. **Responsive rule.** **1440** 140 · 24 · 968 · 24 · 140; arrows beside the head; dots 24/8 and
   the
   counter under the track; credit at the right. **834** 60 · 20 · 594 · 20 · 60; arrows under the
   track. **1080** the 1440 arrangement with the arrows still beside the head — **the controls do not change between 1440 and 834** ⚑, and no separate frame is drawn at that width. **≤ 767** 12 · 12 · 302 · 12 · 12; dots only; credit last. **One-up at every width** ⚑, and **arrows at every width above 768** ⚑.
5. **Content fields.** The category's five. **Designed for 4–20** ⚑ — the only design that does not
   get taller as the list grows.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Controls | Dots · Arrows · Dots and arrows |
   | Crop | Square · Landscape · Portrait (As uploaded disabled) |
   | Peek | On · Off |
   | Captions | Under the frame · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under the frame) |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Controls · Crop · Peek. **The no-autoplay settlement is owner-ratified and stated on
   the frame** ⚑ so it stops being re-litigated: a gallery that moves on its own takes the reading
   decision away from the reader, the registry's `carousel` entry offers no autoplay, and reduced
   motion would switch it off anyway. **Editing** · eyebrow, heading, blurb and credit edit inline
   with the **P0·1** toolbar — bold · italic · underline · link, the popover carrying Open in new
   tab and rel nofollow · noreferrer · sponsored. **Every caption edits inline on the reserved line
   under the frame**, and **the track does not move while a caption is being edited** ⚑. Dots and
   the counter are chrome and are not editable ⚑. **Every URL field opens the Ghost-aware Link
   Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → **no track, no dots, no counter, no arrows** ⚑; one frame at the
   full
   1,296. **2** → one peek, two dots, still snapping. **many** → the track scrolls and **the
   section's height never changes** ⚑. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner
   ruling. **Authored is the default and this section's every drawn state.** At From posts each
   frame ← **the post's feature image**, `caption` ← the post title at **Captions from titles: On**,
   `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no
   feature image is skipped and the panel says how many were** ⚑. Count's ceiling here is **20**,
   this design's drawn-for range. Crop's As uploaded stays disabled in bound mode — slides must
   share a height whatever the source.
8. **Empty state.** **A caption left empty leaves its reserved line blank** ⚑ — the one place in A14
   where an empty caption reserves space, because the alternative is a section that changes height
   as
   the reader steps.
9. **Behaviour module.** **Two modules** ⚑ — `carousel` (**edit-safe: no** ⚑) and `lightbox`.
   **No-JS, quoted:** "The slide track is a native horizontally-scrollable `scroll-snap` strip —
   **fully usable**, only dots and arrow buttons are hidden." And: "Each thumbnail is an `<a href>`
   to the full-size image; clicking opens it as a normal page."
   **This design declares a width: the arrows retire under 768** ⚑ — **owner-ruled, 1 September
   2026** — so the no-JavaScript state is stated on both sides of it. **At 768 and above** JavaScript
   off removes the arrows and the dots and nothing else: the track is a native snap strip, one frame
   at a time, every photograph present and reachable by scroll, drag and Tab, every caption on its
   reserved line. **Below 768** the arrows are drawn at no script state, so the dots are all that
   goes and the track is otherwise identical.
10. **Accessibility.** Heading `h2`. The track is a `<ul>` and **no slide is hidden from the
    accessibility tree at any position** ⚑ (A19·15, verbatim). Dots are `<button>`s reading "Go to
    photograph 3 of 6"; the counter is `aria-hidden`. **Arrow keys move the track only when a track
    element has focus** ⚑. Peeking frames are dimmed but not `aria-hidden` ⚑.
    **Flagged ⚑** the peek and its 55% · arrows kept at 1440, 1080 and 834, retiring under 768 ⚑ · As uploaded disabled · the
    reserved caption line · no autoplay · two modules declared.
    **New in this pass ⚑** the arrows kept on laptop and tablet, owner-ruled, and 768 declared as the
    width · no autoplay owner-ratified and stated on the frame · Padding retired into
    Vertical spacing · the universal trio · the caption at 200 · Image focus · Source: From posts.

---

## 8 · Filmstrip

1. **Descriptor.** One horizontally scrolling row on a full-width surface strip: every frame at one
   shared height and its own native width, starting at the page margin and running off the right
   edge.
2. **Structural descriptor.** `carousel · none · surface · variable · edge · a row that runs off the
   right edge`
   The only `edge` in A14.
3. **Archetype.** carousel. **One departure** — it never becomes a stack ⚑, at any width.
4. **Responsive rule.** **1440** strip padding 96 · 0, left margin 72, height 320, gap 16, arrows at
   the foot, See-all beside the head. **834** padding 80, left margin 40, height 280, **arrows kept at the
   foot** ⚑ — **owner-ruled, 1 September 2026**, reversing "arrows replaced by See-all" — with See-all
   under the strip. **≤ 767** padding 64, left margin 20, height 220, gap 12, no arrows, See-all under
   the
   strip. **Right margin 0 at every width** ⚑.
5. **Content fields.** The category's five plus `moreLabel` ≤ 24 and `moreUrl`, both optional ⚑.
   **The count in "See all 48" is authored** ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Frame height | Short 240 · Medium 320 · Tall 420 |
   | Gap | Tight · Normal · Loose |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Arrows | On · Off |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (resolving onto the strip's inner padding, the section's own being 0) |
   | Top divider (universal) | None · Line · Fade |

   Then the images block and the two See-all fields. **Outside the design's list**: the universal
   trio — Background role · Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None
   · Line · Fade* — **the images item list (P0·3)** and **the Data group**. **The Padding row is
   retired into Vertical spacing** ⚑, the same three values under the universal name. **Five** own
   controls. **Quick Controls**: Frame height · Gap · Arrows. **Vertical spacing resolves onto the
   strip's inner padding** (the section's own is 0 ⚑) and **Frame height keeps its own name** — a
   strip height is a genuinely different ladder. **No autoplay at any value** ⚑, owner-ratified.
   **Editing** · eyebrow, heading, blurb and credit edit inline with the **P0·1** toolbar — bold ·
   italic · underline · link, the popover carrying Open in new tab and rel nofollow · noreferrer ·
   sponsored. **Every caption edits inline under its own frame in the strip**, and **the strip does
   not scroll while a caption is being edited** ⚑. **`moreLabel` edits inline, `moreUrl` opens the
   Link Picker, and the See-all link takes an optional P0·2 icon** before or after its label, off
   by default ⚑. **Every URL field opens the Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1–2** → frames sit at the left at their own widths, **not centred and not
   stretched** ⚑; arrows hidden. **many** → the row overflows and scrolls; **the section's height
   never changes with the count** ⚑. **No `moreUrl`** → the link is absent and the head keeps its
   full measure ⚑. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is
   the default and this section's every drawn state.** At From posts each frame ← **the post's
   feature image**, `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's
   alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**;
   **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no feature image is
   skipped and the panel says how many were** ⚑. Count's ceiling here is **20**, this design's
   drawn-for range. **See all is still authored** ⚑ — nothing counts the archive, in either mode.
8. **Empty state.** As 1 Grid. **A failed image keeps its native width at the strip's height** ⚑ —
   the row must not reflow around a hole.
9. **Behaviour module.** **Two modules** ⚑ — `carousel` and `lightbox`, as 7. **No-JS, quoted:**
   "The
   slide track is a native horizontally-scrollable `scroll-snap` strip — **fully usable**, only dots
   and arrow buttons are hidden." **Snap is `proximity` rather than `mandatory`** ⚑ so a reader can
   stop between frames. **This design declares a width: the arrows retire under 768** ⚑ —
   **owner-ruled, 1 September 2026**, which closes the open question this pass raised. **At 768 and
   above** JavaScript off removes the two arrows and the two edge fades and nothing else: the row is a
   native proximity-snap strip, keyboard-scrollable, every frame present at its own width. **Below
   768** the arrows are drawn at no script state and See-all already sits under the strip, so
   JavaScript off changes nothing a reader can see.
10. **Accessibility.** Heading `h2`. The row is a `<ul>` with `tabindex="0"` on the scroll container
    so a keyboard can scroll it ⚑, labelled "Photographs, scrollable row". Arrows are `aria-hidden`
    when the row does not overflow ⚑. Caption 5.4:1 on surface.
    **Flagged ⚑** no right margin · never becomes a column · arrows kept at 1440, 1080 and 834, retiring under 768 ⚑ · Frame height as the one size control ·
    proximity snap · the authored See-all count · two modules.
    **New in this pass ⚑** the arrows kept on laptop and tablet, owner-ruled, and 768 declared as the
    width · Vertical spacing onto the strip, Frame height keeping its name · the
    See-all icon slot · the caption at 200 · Image focus · Source: From posts.

---

## 9 · Full Bleed

1. **Descriptor.** The set edge to edge with a 1 px hairline gutter and no side margins; the head
   and
   the credit alone keep the page's measure. Captions live in the lightbox.
2. **Structural descriptor.** `grid-of-N · none · transparent · many · full-bleed · no margin at any
   width`
   Ground `transparent` — the section has no ground of its own; the frames cover it and what is
   beneath shows only where the set is short.
3. **Archetype.** grid-of-N. **One departure** — side padding is 0 at every width and the final step
   is one full-screen column ⚑.
4. **Responsive rule.** **1440** three columns 479 × 359, gutter 1; head and credit on the 72
   margin;
   vertical padding 96. **834** two columns 376 × 282, head on 40, padding 80. **≤ 767** one column
   at
   the full screen width, head on 20, padding 64.
5. **Content fields.** The category's five. **Designed for 6, 9 or 12** ⚑ — a multiple of the column
   count — and the panel says so rather than enforcing it.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Three · Four · Six |
   | Crop | Square · Landscape · Portrait (As uploaded disabled) |
   | Gutter | None · Hairline · Even (None greys while Captions is Under each, with the reason beside it) |
   | Captions | In the lightbox only · Under each · Off (Under each greys at Gutter: None; In the lightbox only greys at Lightbox: Off and Captions falls to Under each — each with the reason beside it) |
   | Lightbox | On · Off |
   | Background role (universal) | Locked, with the reason shown in the row — the ground is `transparent` and the frames cover it wall to wall |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (vertical only; side padding is 0 at every value, which is the design) |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Columns · Gutter · Crop. **Background role is locked, with the reason shown in the
   row** ⚑ — the ground is `transparent`, the frames cover it wall to wall, and what shows under a
   short last row belongs to the section beneath, which A14 cannot know. **Vertical spacing is
   vertical only**; side padding is 0 at every value, which is the design. **Editing** · eyebrow,
   heading, blurb and credit edit inline with the **P0·1** toolbar — bold · italic · underline ·
   link, the popover carrying Open in new tab and rel nofollow · noreferrer · sponsored. **Every
   caption edits inline in the item row** ⚑ — this design draws captions in the overlay by default
   and the overlay is not an editing surface. **Every URL field opens the Ghost-aware Link
   Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → one frame at one third of the screen, at the left ⚑. **many** →
   wraps; **a short last row shows the ground and nothing stretches** ⚑. **Data — Source: Authored ·
   From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this section's every drawn
   state.** At From posts each frame ← **the post's feature image**, `caption` ← the post title at
   **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's
   read-only card); **a post with no feature image is skipped and the panel says how many were** ⚑.
   Count's ceiling here is **12**, this design's drawn-for range.
8. **Empty state.** As 1 Grid, with one difference: **a failed image is very visible here** because
   there is no margin around it, so the plate draws its alt text at 15 px rather than 13 ⚑ — the one
   size change in the missing-image vocabulary.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **At Lightbox: Off
   the captions have nowhere to go** ⚑ so **"In the lightbox only" is greyed with the reason
   beside it** and Captions falls to Under each; **Gutter: None then greys with its own reason**
   rather than being forced off None silently ⚑. What was one panel changing two values at once is
   now one resolution and one greyed value, each saying at the control what it is doing.
10. **Accessibility.** Heading `h2`. **With captions in the overlay the accessible name of each
    frame
    is its `alt`** ⚑ — load-bearing here in a way it is not in 1 Grid. **The focus ring is inset by
    3 px rather than outside** ⚑, the one design where it is, because an outside ring at the
    viewport
    edge is clipped; it carries a 1 px carried-colour outline because **its contrast against an
    unknown photograph is not guaranteed** ⚑.
    **Flagged ⚑** zero side margin · **the radius token suspended at the screen edge** · As uploaded
    disabled · Under each disabled at Gutter: None · the inset ring and its unguaranteed contrast ·
    the ground-dependence at `transparent`.
    **New in this pass ⚑** Background role locked with the reason shown · Vertical spacing
    vertical-only · the caption at 200 · Image focus · Source: From posts.

---

## 10 · Lead and Grid

1. **Descriptor.** The first image across the full width of the page at a set height, its caption on
   the page margin beneath it, and the rest of the set in a contained three-up row below.
2. **Structural descriptor.** `grid-of-N · none · page · many · full-bleed · one lead frame across
   the page`
   9 Full Bleed is the same placement on `transparent`; there everything bleeds, here one frame
   does.
3. **Archetype.** grid-of-N. **One departure** — the lead sits outside the content box at every
   width
   while the followers stay inside it ⚑.
4. **Responsive rule.** **1440** lead 1,440 × 640 (Medium), caption on the 72 margin clamped to 640;
   followers 416 × 312 three-up on 1,296; padding 96. **834** lead 834 × 460; followers 367 × 275
   two-up; padding 80. **≤ 767** lead 390 × 292; followers 350 × 263 one-up; padding 64.
5. **Content fields.** The category's five. **Designed for 4 or 7** ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Lead height | Short 480 · Medium 640 · Tall 760 |
   | Lead width | Full bleed · Contained |
   | Followers | Three · Four |
   | Captions | Under each · Lead only · In the lightbox only (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Gap | Tight · Normal · Loose (between the followers only) |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Six** own controls. **Quick
   Controls**: Lead height · Lead width · Followers. **Gap *Tight · Normal · Loose* is added in
   this pass** ⚑, **between the followers only** — the lead bleeds and has no gutter to give, and
   the 44 px between lead and row is the design's own. **Editing** · eyebrow, heading, blurb and
   credit edit inline with the **P0·1** toolbar — bold · italic · underline · link, the popover
   carrying Open in new tab and rel nofollow · noreferrer · sponsored. **The lead's caption edits
   inline on the page margin beneath it and every follower's under its own frame.** **Every URL
   field opens the Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → the lead alone with its caption ⚑, a legitimate section. **2–3** →
   lead plus a short row, nothing stretched. **many** → followers wrap; **the lead is never
   repeated** ⚑. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is
   the default and this section's every drawn state.** At From posts each frame ← **the post's
   feature image**, `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's
   alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**;
   **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no feature image is
   skipped and the panel says how many were** ⚑. Count's ceiling here is **7**, this design's
   drawn-for range. The lead is **the first post the filter returns** ⚑ — Order decides which
   photograph takes the full width.
8. **Empty state.** **The lead's caption is the one caption this design will not silently lose** ⚑ —
   at In the lightbox only it moves to the overlay; at Off it is still in the overlay.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **The lead is the
   first item in the overlay's order** ⚑, so ← from it wraps to the last follower.
10. **Accessibility.** Heading `h2`. **The lead is a `<figure>` inside the same `<ul>` as the
    followers** ⚑ — one list, authored order, no promotion. Focus ring inset on the lead (9's rule)
    and outside on the followers ⚑. Caption 5.4:1.
    **Flagged ⚑** two measures in one section · lead height as a value not a ratio · radius
    suspended
    on the bleeding lead · Captions: Lead only · the lead never repeated.
    **New in this pass ⚑** Gap added for the follower row · Padding retired into Vertical spacing ·
    the caption at 200 · Image focus · Source: From posts.

---

## 11 · Overlay

1. **Descriptor.** Three columns of frames with each caption inside its own frame, on a warm wash
   over
   the lower 60%. No text sits outside a photograph except the head and the credit.
2. **Structural descriptor.** `grid-of-N · none · page · many · background · caption inside the
   frame`
   Media `background` — the photograph is the ground the caption sits on, which is the only slot
   separating this from 1 Grid and the reason it is a design rather than a Captions value.
3. **Archetype.** grid-of-N. No departures beyond the one-column-at-390 step.
4. **Responsive rule.** **1440** three columns 416 × 312, caption 14 px inset 16, clamp 3 lines,
   padding 96. **834** two columns 367 × 275, padding 80. **≤ 767** one column 350 × 263, **caption
   15 px** ⚑, padding 64. **At Columns: Four the clamp is 2 lines** ⚑.
5. **Content fields.** The category's five. **The caption is load-bearing here** ⚑ and the editor
   asks for one when a frame is added.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Crop | Square · Landscape · Portrait · As uploaded (As uploaded live) |
   | Gap | Tight · Normal · Loose |
   | Caption wash | Soft · Standard |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Columns · Crop · Caption wash. **The caption now holds 200 characters** ⚑ — this
   design was the stated reason for the 80-character limit, and it never needed to be: it clamps at
   three lines and the full text is in the overlay, at 80 characters or at 200. **Editing** ·
   eyebrow, heading, blurb and credit edit inline with the **P0·1** toolbar — bold · italic ·
   underline · link, the popover carrying Open in new tab and rel nofollow · noreferrer ·
   sponsored. **Every caption edits inline on the wash, inside its own frame** ⚑, and **the
   three-line clamp is lifted while the caption has focus** so the author can see what they are
   typing ⚑. **Every URL field opens the Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **A frame with no caption keeps its wash** ⚑ so the set stays even — the
   opposite of 1 Grid's rule, for the same reason: whichever choice keeps the arrangement regular.
   **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and
   this section's every drawn state.** At From posts each frame ← **the post's feature image**,
   `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's alt in Ghost;
   **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and
   Reorder are hidden** (P0·3's read-only card); **a post with no feature image is skipped and the
   panel says how many were** ⚑. Count's ceiling here is **12**, this design's drawn-for range.
8. **Empty state.** **An empty caption draws the wash and nothing on it** ⚑ — never "Untitled",
   never
   a removed wash. **A caption over 3 lines is clamped with an ellipsis and the full text is in the
   overlay** ⚑ — the only truncation of authored text in A14. A failed image draws the plate with
   its
   alt text **and the wash is dropped** ⚑.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **With JavaScript
   off
   a clamped caption is still clamped and the full text is not reachable** ⚑ — the one place in A14
   where no-JS loses something a reader might want. Flagged.
10. **Accessibility.** Heading `h2`. The `<figcaption>` is positioned over the image ⚑ — **a real
    caption in the DOM, not a decorative label**. Caption 4.9:1 at Standard and **3.6:1 at Soft,
    which fails AA and is stated on the panel rather than disabled** ⚑ — the author can judge their
    own photographs and the theme cannot. Focus ring is the carried colour with a 1 px dark outline
    ⚑.
    **Flagged ⚑** the wash kept on an empty caption · the three-line clamp · Soft failing AA and
    offered anyway · no accent · no Captions control · the wash identical in dark.
    **New in this pass ⚑** the caption at 200 (this design was the reason for 80) · the clamp lifted
    while editing · Padding retired into Vertical spacing · Image focus · Source: From posts.

---

## 12 · Captioned Rows

1. **Descriptor.** One photograph per row at 848 with its caption in a 400 column beside it, sides
   alternating down the page, a hairline between rows. Two to four frames.
2. **Structural descriptor.** `stack · none · page · few · left · caption beside every frame`
   The only `stack` and the only `few` in A14.
3. **Archetype.** stack. **One departure** — the row collapses at 1,080 rather than 767 ⚑.
4. **Responsive rule.** **1440** 848 · 48 · 400; frame 848 × 636; caption 16 px in `text`; number in
   mono above it; 56 px between rows with a hairline; padding 96. **1080 and below** one column,
   frame at the full box, caption under it, **alternation gone** ⚑. **834** frame 754 × 566, measure
   560, padding 80. **≤ 767** frame 350 × 263, caption 15 px, padding 64.
5. **Content fields.** The category's five. **The caption limit is 80 characters as everywhere** ⚑ —
   this design would carry 200 comfortably and is held to the category's limit so that switching
   design never truncates. A real cost of the shared list, stated rather than solved.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Image side | Left · Right · Alternating |
   | Frame width | Half · Two thirds |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Rules | Between rows · Off |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Image side · Frame width · Crop. **The caption holds 200 characters** ⚑ — raised
   from 80 in this pass. This design and 14 Index are the two the limit starved, and the row was
   always drawn for prose. **Editing** · eyebrow, heading, blurb and credit edit inline with the
   **P0·1** toolbar — bold · italic · underline · link, the popover carrying Open in new tab and
   rel nofollow · noreferrer · sponsored. **Every caption edits inline in its column beside the
   frame**, at 16 px in `text`. **Every URL field opens the Ghost-aware Link Picker**, per-image
   `link` included.
7. **Data.** As 1 Grid. **1** → one row, **a legitimate section** ⚑. **2–4** → the design as drawn.
   **5+** → it keeps going and the panel names 1 Grid ⚑; nothing is disabled. **Data — Source:
   Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this section's
   every drawn state.** At From posts each frame ← **the post's feature image**, `caption` ← the
   post title at **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are
   hidden** (P0·3's read-only card); **a post with no feature image is skipped and the panel says
   how many were** ⚑. Count's ceiling here is **4**, this design's drawn-for range. Two to four
   posts is the drawn-for range; above it the panel names 1 Grid and nothing is disabled.
8. **Empty state.** **A row whose caption is empty is still a row** ⚑ — the column stays and draws
   the
   number alone. A failed image leaves the caption column unaffected ⚑, which is the argument for
   two
   columns rather than a caption under a frame.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid.
10. **Accessibility.** Heading `h2`. Rows are `<li>` in one `<ul>`, each a `<figure>` with its
    `<figcaption>` ⚑; **the flip is `flex-direction`, never `order`** ⚑, so DOM and visual order
    agree
    everywhere. The number is `aria-hidden` ⚑. Caption 13.4:1.
    **Flagged ⚑** the 1,080 collapse · caption as `text` at 16 px · the generated number · the
    80-character limit inherited from the shared list · no Captions control.
    **New in this pass ⚑** the caption at 200 · Padding retired into Vertical spacing · Rules
    distinguished from Top divider · Image focus · Source: From posts.

---

## 13 · Contact Sheet

1. **Descriptor.** The whole set as square thumbnails in six columns on a full-width surface band,
   each numbered from its position, nothing captioned on the page.
2. **Structural descriptor.** `grid-of-N · none · surface · many · inline · a dense numbered sheet`
   4 Panel is the same ground with media `top`; here the frames carry no text of their own at all.
3. **Archetype.** grid-of-N. **One departure** — **it keeps three columns at 390** ⚑ where every
   other
   A14 grid goes to one.
4. **Responsive rule.** **1440** band full width, inner padding 96 · 72, six columns 209 × 209, gap
   8,
   numbers 11 px mono. **834** four columns at 179, padding 80 · 40. **≤ 767** three columns at 111,
   padding 64 · 20 ⚑. **Twelve frames at every width** — content parity holds inside the design ⚑.
5. **Content fields.** The category's five plus `moreLabel` and `moreUrl` ⚑. **Captions are stored
   and
   never drawn on the page** ⚑ — they appear in the overlay. **This design draws twelve photographs
   where every other draws six** ⚑, the one stated departure from content parity across the
   category:
   a contact sheet at six frames is a grid at six frames.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Four · Six · Eight |
   | Crop | Square · Landscape (two values only) |
   | Numbering | On · Off |
   | Gap | Tight 4 · Normal 8 · Loose 16 (a tighter ladder) |
   | Lightbox | On, with ~~Off~~ disabled and the reason shown |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (resolving onto the band's inner padding) |
   | Top divider (universal) | None · Line · Fade |

   Then the images block and the two See-all fields. **Outside the design's list**: the universal
   trio — Background role · Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None
   · Line · Fade* — **the images item list (P0·3)** and **the Data group**. **The Padding row is
   retired into Vertical spacing** ⚑, the same three values under the universal name. **Five** own
   controls. **Quick Controls**: Columns · Numbering · Gap. **Lightbox: Off is disabled, shown
   struck through with the reason** ⚑ (A9·8's convention) — **nothing is captioned on the page in
   this design, so with no overlay the captions would be unreachable**, and A14's rule is that Off
   means “not under the frame”, never “thrown away”. The frame is still a plain `<a>` to the file
   with JavaScript off: it is the caption, not the photograph, that Off would lose. Of the two
   resolutions offered — force the lightbox on, or draw captions under each square — **this
   design's identity is an uncaptioned sheet**, so the lightbox is forced and the refusal is
   stated. **Vertical spacing resolves onto the band's inner padding** and **Gap keeps its tighter
   4 · 8 · 16 ladder**. **Editing** · eyebrow, heading, blurb and credit edit inline with the
   **P0·1** toolbar — bold · italic · underline · link, the popover carrying Open in new tab and
   rel nofollow · noreferrer · sponsored. **Every caption edits inline in the item row** ⚑ —
   nothing is captioned on the page here. The number is never editable ⚑. **`moreLabel` edits
   inline, `moreUrl` opens the Link Picker, and the See-all link takes an optional P0·2 icon** ⚑.
   **Every URL field opens the Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1–4** → the band holds its width and the sheet is short ⚑; the editor
   names
   1 Grid. **many** → wraps to the 48 ceiling ⚑ — eight rows and 1,736 px at six columns. **Data —
   Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this
   section's every drawn state.** At From posts each frame ← **the post's feature image**, `caption`
   ← the post title at **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are
   hidden** (P0·3's read-only card); **a post with no feature image is skipped and the panel says
   how many were** ⚑. Count's ceiling here is **48**, this design's drawn-for range. **Captions from titles is live in this design in both data modes** ⚑. The greying written on 1 September 2026 rested on a bound frame opening its post instead of the overlay; **the owner's ruling of 2 September 2026 removes that link**, so a bound title is reachable in the overlay here exactly as it is everywhere else. **Lightbox: Off stays disabled** for this design's own reason — nothing is captioned on the page.
8. **Empty state.** **Nothing here can be empty except the head** ⚑. A failed image draws the
   hover-surface plate **with its number still beneath it** ⚑, so the numbering never skips.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **This is the design
   that needs the overlay most** ⚑ — with no captions on the page, no-JS leaves twelve links to
   full-size photographs and no text at all. That is the registry's stated degradation and A14
   accepts it, but **it is the weakest no-JS result in the category** and is flagged as such.
10. **Accessibility.** Heading `h2`. **Each frame's accessible name is its `alt`** ⚑ and nothing
    else
    describes it. The number is `aria-hidden` ⚑. **The whole square is the target at every width** ⚑
    —
    111 px at 390. Numbers 5.4:1 on surface.
    **Flagged ⚑** twelve frames rather than six · three columns at 390 · two Crop values · the
    tighter
    Gap ladder · the generated number · the weakest no-JS result in A14.
    **New in this pass ⚑** Lightbox: Off disabled with the reason shown · Vertical spacing onto the
    band, Gap keeping its own ladder · the See-all icon slot · the caption at 200 · Image focus ·
    Source: From posts.

---

## 14 · Index

1. **Descriptor.** The set as a ruled list: a mono number, the caption at 17 px in `text`, and a
   128 × 96 thumb at the right of each row, hairlines between.
2. **Structural descriptor.** `table · none · page · many · right · a ruled row per photograph`
   The only `table` and the only media `right` in A14 — the one design where the photograph is
   subordinate to its caption, and the tuple says so in two slots.
3. **Archetype.** table. **One departure** — the row never becomes a stacked card at any width ⚑.
4. **Responsive rule.** **1440** number 40 · caption flexible · thumb 128 × 96 · gap 24 · row 80 px
   ·
   hairline between rows. **834** thumb 104 × 78, gap 20. **≤ 767** number 32, thumb 72 × 54, gap
   12,
   caption 15 px, row 64 px ⚑.
5. **Content fields.** The category's five. **The caption is required in practice** ⚑ — a row
   without
   one is legible but empty — and the editor says so rather than enforcing it. **A date column was
   considered and refused** ⚑: nothing in the item carries a date, and inventing one would add a
   fourth field to every item in the category for one design.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Thumb | Small 88 · Medium 128 · Off |
   | Row height | Compact · Comfortable |
   | Rules | Between rows · Ends only |
   | Numbering | On · Off |
   | Lightbox | On · Off |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Five** own controls. **Quick
   Controls**: Thumb · Row height · Numbering. **The caption holds 200 characters** ⚑ — raised from
   80, and this is the design the limit starved most: a ruled index of 80-character captions is a
   list of fragments. **Row height keeps its own name** — a row ladder is not a section ladder.
   **Editing** · eyebrow, heading, blurb and credit edit inline with the **P0·1** toolbar — bold ·
   italic · underline · link, the popover carrying Open in new tab and rel nofollow · noreferrer ·
   sponsored. **Every caption edits inline in its row**, at 17 px in `text` — this is the
   caption-led design and the row is the editing surface. The number is never editable ⚑. **Every
   URL field opens the Ghost-aware Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → one row between two hairlines ⚑. **many** → the list runs to the 48
   ceiling; **there is no pagination and no `load-more`** ⚑ — the module exists and a 48-row list
   does
   not need it. **Data — Source: Authored · From posts** ⚑, **P0·5**, owner ruling. **Authored is
   the default and this section's every drawn state.** At From posts each frame ← **the post's
   feature image**, `caption` ← the post title at **Captions from titles: On**, `alt` ← the image's
   alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**;
   **Add, Remove and Reorder are hidden** (P0·3's read-only card); **a post with no feature image is
   skipped and the panel says how many were** ⚑. Count's ceiling here is **48**, this design's
   drawn-for range. Bound rows read **the post title into the caption** at 17 px, which is what this
   design already draws ⚑ — the closest fit in the category.
8. **Empty state.** **A row with no caption keeps its full height with an empty text cell** ⚑ —
   A16·13's rule, carried verbatim. At Thumb: Off such a row is a number alone, which the editor
   flags
   on the item.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid. **With JavaScript
   off
   this is the strongest design in A14** ⚑ — a numbered list of captions, each a link to a full-size
   photograph, which is a perfectly good archive index.
10. **Accessibility.** Heading `h2`. **It is a `<ul>`, not a `<table>`** ⚑ — the archetype is named
    table because of how it collapses, not because the markup is tabular; there are no column or row
    headers, so a real table would be a worse structure. **The whole row is the link and the
    target**
    ⚑ — 80 px tall — and **the thumb is `aria-hidden` inside it** ⚑ so the row announces once.
    Caption
    13.4:1; number 5.4:1.
    **Flagged ⚑** no date column · no sortable header (**the registry has no sort module**;
    `shuffle`
    randomises) · the row never stacking · `<ul>` rather than `<table>` · the thumb never the target
    ·
    no pagination.
    **New in this pass ⚑** the caption at 200 · Padding retired into Vertical spacing, Row height
    keeping its name · Rules distinguished from Top divider · Image focus · Source: From posts.

---

## 15 · Boxed

1. **Descriptor.** Three columns inside a 1 px box at the pack radius with no fill, a mono label
   breaking the top edge, on the page ground. 4 Panel without the lift.
2. **Structural descriptor.** `grid-of-N · box · page · many · top · the set in a hairline box`
   The only `box` in A14, and the slot exists for exactly this: the section itself sits in a
   container, which is not true of any other design here.
3. **Archetype.** grid-of-N. No departures beyond the one-column-at-390 step.
4. **Responsive rule.** **1440** box 1,296 · inset 40 · three columns 389 × 292 · label on the top
   edge · padding 96. **834** box 754 · inset 32 · two columns 351 × 263 · padding 80. **≤ 767** box
   350 · inset 20 · one column 310 × 233 · **label truncated, never wrapped** ⚑ · padding 64.
5. **Content fields.** The category's five. **The eyebrow does double duty** ⚑ — the box label at
   two
   of the three Box label values, the head's eyebrow at the third.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Columns | Two · Three · Four |
   | Crop | Square · Landscape · Portrait · As uploaded |
   | Box label | Off · The eyebrow · The eyebrow and the count |
   | Captions | Under each · In the lightbox only · Off (In the lightbox only greys at Lightbox: Off, with the reason beside it, and Captions falls to Under each) |
   | Lightbox | On · Off |
   | Gap | Tight · Normal · Loose |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then the images block. **Outside the design's list**: the universal trio — Background role ·
   Vertical spacing *Compact · Comfortable · Spacious* · Top divider *None · Line · Fade* — **the
   images item list (P0·3)** and **the Data group**. **The Padding row is retired into Vertical
   spacing** ⚑, the same three values under the universal name. **Six** own controls. **Quick
   Controls**: Columns · Box label · Crop. **Gap *Tight · Normal · Loose* is added in this pass** ⚑
   — 8 · 24 · 40 inside the box's 40 px inset, which is itself on no ladder ⚑. **The box's hairline
   takes Background role's hairline value and the box has no fill at any role** ⚑ — which is what
   separates it from 4 Panel. **Editing** · eyebrow, heading, blurb and credit edit inline with the
   **P0·1** toolbar — bold · italic · underline · link, the popover carrying Open in new tab and
   rel nofollow · noreferrer · sponsored. **Every caption edits inline under its own frame inside
   the box.** The box label is a rendering of the eyebrow and the generated count: **the eyebrow is
   edited in the head and the count is never editable** ⚑. **Every URL field opens the Ghost-aware
   Link Picker**, per-image `link` included.
7. **Data.** As 1 Grid. **1** → the box holds its full width with one 389 px frame, **and the label
   reads "1 photograph"** ⚑. **many** → wraps inside the inset. **Data — Source: Authored · From
   posts** ⚑, **P0·5**, owner ruling. **Authored is the default and this section's every drawn
   state.** At From posts each frame ← **the post's feature image**, `caption` ← the post title at
   **Captions from titles: On**, `alt` ← the image's alt in Ghost; **the frame does not link to its post** ⚑ — A14 shows images, A17 shows posts — and **the lightbox behaves as it does at Source: Authored**; **Add, Remove and Reorder are hidden** (P0·3's
   read-only card); **a post with no feature image is skipped and the panel says how many were** ⚑.
   Count's ceiling here is **12**, this design's drawn-for range. **The generated count is drawn only
   at Source: Authored** ⚑ — owner ruling, 30 August 2026. A bound gallery skips a post with no
   feature image and **Ghost's templates cannot subtract the skipped ones from the length**, so at
   Source: From posts **the box label draws the eyebrow alone and no count**, and the panel says why.
   Authored is the default and every drawn state, where the count is exact, singular included.
8. **Empty state.** No eyebrow with a Box label value that needs one → **the label draws the count
   alone** ⚑; with Box label: Off and no eyebrow the box is unlabelled, which is legitimate.
9. **Behaviour module.** `lightbox`, edit-safe: no ⚑; same quotation as 1 Grid.
10. **Accessibility.** Heading `h2`. **The box is a `<div>` and the label is not a `<legend>`** ⚑ —
    a
    real `<fieldset>` implies a form, so the label is a `<p>` and the set's `<ul>` takes
    `aria-labelledby` pointing at it ⚑. The count is inside the label's text, so a screen reader
    hears
    "Photo essay, 6 photographs". Label 5.4:1; hairline 1.3:1 and decorative ⚑.
    **Flagged ⚑** the label breaking the hairline · **the generated count and its singular** · the
    label truncating at 390 · the closeness to 4 Panel, stated by number.
    **New in this pass ⚑** Gap added · Padding retired into Vertical spacing · the hairline deriving
    from Background role · the caption at 200 · Image focus · Source: From posts.

---

## Component inventory — cumulative

**Carried forward, verbatim**

| Component | What it is | First set |
|---|---|---|
| Eyebrow | 13 px uppercase tracked .08em in `text-muted` | A1·1 |
| Icon button | 44 px box at the pack radius — the carousel arrows | A1·14 |
| Focus ring | 4 px accent ring, 3 px outside the frame; inset in 9 and 10, carried colour in 6 and 11 | A6, A2·5 |
| Striped image plate | The placeholder and its mono crop caption | A1 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132 | A17 |
| On-contrast derivation | Every colour on a band from two `contrast` tokens | A17·7 |
| Surface plane | Surface + hairline + md shadow; flat in dark; a full-width fill is a ground | A26·3, A27·4 |
| Warm scrim | Warm contrast wash, strongest at the foot, carried colour over it | A20·13 |
| Missing-image plate | Hover surface at the crop ratio carrying the alt text | A17 |
| Bento tile | One cell at 2 × 2 among cells of one size | A17·12 |
| Column masonry | `column-count`; nothing measures, nothing packs | A17·11 |
| Carousel track, dots and arrows | Snapping track, widening active dot, 44 px arrows beside the head | A19·15 |
| Two-column split | 380 · 48 · 868, collapsing at 1,080 | A9·5, A16·1 |
| Ledger row | A ruled row with a label column and a value column | A9·15 |
| Repeater | Drag handle, remove, *Add …* at the foot, seeded not blank | A3 |
| Disabled-value convention | A value that would erase the design is shown struck through with the reason | A9·8, A29·3 |

**New in A14**

| Component | What it is | First set |
|---|---|---|
| **The frame** | A `figure`: one plate at the section's crop, one optional `figcaption`, the whole cell a link | **A14 — new** |
| **The frame's four states** | Resting · hover (2 px lift + underlined caption) · focus (ring) · reduced motion (no lift, underline kept) | **A14 — new** |
| **The crop rule** | Square · Landscape · Portrait · As uploaded, written onto the section; the focal point is a field, not a control | **A14 — new** |
| **The caption, in four places** | Under the frame · inside it on a wash · beside it at body size · in the overlay. Off never deletes it | **A14 — new** |
| **The lightbox overlay** | A `dialog`: trapped focus, Escape returns focus, ← → wrap, counter, caption, the original file | **A14 — new** |
| **The images block** | A repeater with thumbnails whose Add is a multi-file media picker; 1–48; drag reorders | **A14 — new** |
| **The edge-running strip** | A row with a left margin and no right margin, one shared height, native widths | **A14·8 — new** |
| **The numbered thumbnail** | A square plate with its position in mono beneath, at 209 px or smaller | **A14·13 — new** |
| **The box legend** | A mono label breaking the top hairline of a box, optionally carrying the generated count | **A14·15 — new** |
| **The generated count** | "6 photographs" from the list length, with its singular — the only number A14 generates | **A14·15 — new** |

---

## Findings for the architect

1. **A14 is the first category with no query behind it.** ⚑ No Show ladder; the count is the length
   of the authored list; the images block is a new control shape — a repeater whose Add is a
   multi-file media picker. A15 and A33 will meet the same shape.
2. **Ghost's own gallery card is a different thing from an A14 section.** ⚑ A Koenig gallery inside
   `{{content}}` is authored in the post and **none of A14's controls reach it**. A33 owns that
   surface. A user who sets Crop: Square here and then adds a gallery card to a post will expect the
   two to match. **This needs a product answer, not a design one.**
3. **The registry has no module for measured masonry, and none is needed.** ⚑ 2 Masonry is
   `column-count` and runs with no script. A true packed masonry is not buildable from the registry;
   the nearest entries are `reveal` and `shuffle` and neither is it. Recorded so nobody later
   specifies packing and assumes a module exists.
4. **Two designs declare two modules each.** ⚑ 7 and 8 declare `carousel` *and* `lightbox`. Nothing
   in FR-G7 forbids it and nothing permits it explicitly; no section in A1–A13 needed two. Both
   degradations are quoted in full and they compose cleanly.
5. **`alt` is required for the design to work and cannot be enforced.** ⚑ In 9 and 13 the frame
   carries no visible text, so `alt` is the accessible name and nothing else is. The editor shows a
   warning dot and never blocks publishing — the right call for a publication tool, and it means the
   accessibility of two designs depends on a field the theme cannot require.
6. **The overlay needs the original file and Ghost does not guarantee a middle size.** ⚑ The grid
   uses `img_url` derivatives; the lightbox asks for the original, which can be several megabytes.
   There is no "large but not original" derivative to fall back on. A build decision: accept it, or
   add a size and accept the loss of detail.
7. **A14 cannot know what sits above or below it.** ⚑ The same route-awareness gap A16, A21, A22 and
   A26–A29 raised. **9 Full Bleed makes it acute**: its ground is `transparent`, so what shows
   through where the last row is short belongs to whatever section is beneath.
8. **There is no sort module, and 14 Index is where it would be wanted.** ⚑ `shuffle` randomises,
   which is the opposite. Refused rather than invented.
9. **The category's founding fact is amended, and the product should know it.** ⚑ A14 was drawn as
   the
   first category with no query behind it; **Source: From posts** now binds frames to feature images
   by
   owner ruling. **Ruled by the owner on 2 September 2026: A14 shows images the owner chose, A17 shows posts.** A
   bound gallery reads posts and links to none of them, so the two categories no longer resolve to
   the same thing for a visitor. The boundary is written once in the category layer.
10. **A bound frame is not a link, and that is what keeps A14 off A17's ground.** ⚑ Owner ruling,
   2 September 2026, replacing this finding's earlier form. The overlay therefore behaves the same
   in both data modes, and the difference the earlier finding recorded — captions reachable in the
   overlay when authored and only as page text when bound — no longer exists. What a builder should
   carry: **bound mode changes where the pictures come from and nothing else.**
11. **The 80-character caption limit was set by the weakest case and starved the strongest.** ⚑ It
   existed so 11 Overlay would never truncate — a design that truncates by construction, at three
   lines. Raised to 200. Recorded as a pattern to watch: **a shared-list limit set by one design's
   worst case penalises the designs that lead with the field.**
12. **Image focus needs somewhere to live.** ⚑ Settlement 2 made the focal point content rather than
    a
   control, and this pass gives it the library's three values. **Ghost stores no focal point on an
   image**, so focus is theme-side, per item, and **a photograph reused in another section carries
   no
   focus with it.** A build decision, not a design one.
13. **A locked control and a locked value are not the same thing.** ⚑ 5 Split Head's "Head
    behaviour,
   locked at Static" is deleted as a refusal wearing a control's clothes; 2 Masonry's "Crop, locked
   at
   As uploaded" survives. The test this pass used: **the row stays only if the control is live
   elsewhere in the category and the locked value is this design's identity.** Worth adopting
   library-wide, or overruling once and for all.


---

## Reconciliation notes

**Frames changed in this pass.** **Sixteen frames, and no primary section frame among them.**

- `A14-0 Category Proof` — a controls-reconciliation block above the settlements; settlement 3's
  caption
  limit and the field table's `caption` cell now read **200**.
- `A14-1 Grid` · `A14-2 Masonry` · `A14-3 Mosaic` · `A14-4 Panel` · `A14-5 Split Head` ·
  `A14-6 Contrast Band` · `A14-7 Carousel` · `A14-8 Filmstrip` · `A14-9 Full Bleed` ·
  `A14-10 Lead and Grid` · `A14-11 Overlay` · `A14-12 Captioned Rows` · `A14-13 Contact Sheet` ·
  `A14-14 Index` · `A14-15 Boxed` — **all fifteen control-panel frames**: the Padding row retired
  into
  **Vertical spacing**, the universal trio drawn outside the list (locked in 6 and 9, with the
  reason in
  the row), **Gap** added in 4, 5, 10 and 15, the images block redrawn as the **P0·3** item list
  with the
  200-character caption and **Image focus**, new **Editing**, **Behaviour** and **Data** blocks, the
  footer control count and Quick Controls restated, and each design's drawn spec card updated. 5
  lost the
  **Head behaviour** row; 13's **Lightbox: Off** is struck through with its reason; 3's **Captions**
  row
  states the Lightbox: Off resolution; 7's frame states the ratified no-autoplay refusal.

**No section frame was redrawn, and that is a claim rather than an omission.** Nothing in this patch
changes a drawn mark: no ornament was removed, no icon added to a visible element (8's and 13's
See-all
icon is optional and off by default), nothing moved. **Source: From posts adds no drawn state
either** —
a bound section is pixel-identical to an authored one; what differs is where the pictures come from,
and nothing else — **a bound frame carries no link and the lightbox opens on it exactly as it does
when the pictures are authored** (owner ruling, 2 September 2026). **Behaviour, not a mark.**
If the
build wants a bound-mode canvas state, it is a frame this pass did not draw.

**Where this patch and the existing spec disagreed, one line each.**

1. **"The first category with no query behind it" versus Source: From posts.** The owner ruling wins
   and
   the founding fact is amended in one sentence at the head. Everything the category says about
   authored
   galleries stands, and **Authored is still the default in all fifteen.**
2. **Caption ≤ 80 (settlement 3, defended twice) versus ≤ 200.** 200 wins. The old reason — 11
   Overlay
   must never truncate — was void: 11 clamps at three lines and keeps the full text in the overlay
   at any
   limit. Settlement 3's other rulings are untouched.
3. **"The focal point is a field, not a control" versus Image focus.** Both hold. It stays a
   per-image
   field; it now has the library's name and three values (Centre · Top · Bottom) and is reached from
   the
   Image Picker popover, never hidden. **No section-level crop-position control was added.**
4. **Per-design Padding versus universal Vertical spacing.** The duplicate row is removed
   everywhere. In
   6, 8 and 13 **Vertical spacing resolves onto the band's or the strip's inner padding** rather
   than
   sitting beside it; 8's Frame height, 14's Row height and 13's tighter Gap keep their own names as
   genuinely different ladders.
5. **Tight · Normal · Loose versus Tight · Normal · Loose — reversed by the design patch pass.** This
   entry read that the PRD was amended in A14's favour. **The library-wide ruling of 30 August 2026
   goes the other way and wins**, and the same rename has already been made in the Video and Embeds
   category. **Eleven Gap rows now read Tight · Normal · Loose and no value changed** (8 · 24 · 40;
   13 Contact Sheet keeps its tighter 4 · 8 · 16). The four designs that gained the row in the
   previous pass keep it.
6. **5 Split Head's "Head behaviour, locked at Static" versus the no-fake-controls rule.** The row
   is
   deleted; **the no-sticky refusal moves into panel copy**, in the words item 9 already used. The
   argument is unchanged: a sticky head would make this a `sticky` archetype A14 has no design in.
7. **2 Masonry's "Crop, locked at As uploaded" versus the same rule.** The row survives, with the
   test
   stated on the frame: Crop is live in fourteen siblings and its locked value here is the design's
   identity. Finding 13 asks the owner to ratify or overrule that test library-wide.
8. **13 Contact Sheet's "nothing captioned on the page" versus "a caption is never unreachable".**
   The
   identity wins and **Lightbox: Off is disabled** with the reason shown (A9·8's convention) rather
   than
   captions being drawn under the squares. The frame is still a plain `<a>` to the file with
   JavaScript
   off — it is the caption, not the photograph, that Off would have lost.
9. **3 Mosaic's Captions default of "In the lightbox only" versus Lightbox: Off.** It resolves to
   **Under
   each**, carrying 9 Full Bleed's rule verbatim rather than inventing a second one.
10. **Member Visibility (the pass's ground rule) versus A14 having no action.** **Not added, in any
   design** ⚑ — a gallery bears no auth or subscribe action, so P0·4 has nothing to edit, and 8's
   and
   13's See-all is navigation rather than a CTA. Recorded as a judgement so it can be overruled in
   one
   place.
11. **The 4–7 control norm versus the added rows.** 4, 5, 10 and 15 now carry six own controls; ten
    carry
   five; 2 carries four plus a locked row. The universal trio and the Data group sit outside those
   counts
   and every design stays inside the PRD's ~15 ceiling. **Quick Controls stay three per design.**
12. **"No fixed English visitor-facing string" versus 15 Boxed's generated count.** The count is
   generated, not authored, so it becomes a **translation-catalog string with plural forms** rather
   than an
   editable field — as do the lightbox's controls, 7's dot labels and 8's group name. **8's and 13's
   See-all label was already authored** and stays so, count and all.
13. **Print, responsive and accessibility rulings.** Unchanged, in all fifteen — including the three
    print
   departures (6, 7, 8) and the two collapse departures (5, 12). The only accessibility text this
   pass
   touches is 5's flag, which no longer describes a locked row.
14. **The registry.** **No module was coined and none was needed** ⚑: `lightbox` everywhere,
    `carousel`
   beside it in 7 and 8. No **ARCHITECT: registry addition** is written on any A14 frame. **A14
   never had
   a Preview control**, so P0·8's removal is a no-op here.

---

## Patch notes — galleries patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered: the letter-and-number codes elsewhere in this project are filing labels and
mean nothing outside it.

**Frames changed — sixteen, and every one of them.** `A14-0 Category Proof` gains a **DESIGN PATCH
PASS** section: the numbering line, the free-designs shortlist with one line on each candidate and
the recommendation, the gap rename with the eleven designs it touched, the two deleted hand-off
sentences, the removal floor, the counting mechanism behind every number in the category, the member
position, the no-JavaScript position design by design, and the eight rules with no subject here. Its
roster marks designs **1** and **14** *[Free] rec.*, and its controls-patch block no longer claims
Tight / Even / Airy was adopted library-wide. **All fifteen design frames** gain a **DESIGN PATCH
PASS** block naming, for that design: that it is still the number it was, what its Gap row now
reads, what it draws instead of switching and what its panel advises, that Remove never greys out,
where its count comes from, that it carries no member ask, what a visitor gets with JavaScript off,
and — where it has one — how its number is produced. **No section frame was restyled, no arrangement
moved, and no type scale, colour pack or spacing step changed.**

### What changed, and the rule that required it

1. **Eleven Gap rows renamed, and not one value changed** — *gap names are "Tight · Normal · Loose"*.
   1, 2, 3, 4, 5, 6, 8, 10, 11 and 15 read **Tight · Normal · Loose** at 8 · 24 · 40 px; **13 Contact
   Sheet** reads **Tight 4 · Normal 8 · Loose 16** and keeps its tighter numbers, which are a
   different measure rather than a different vocabulary. 7 Carousel, 9 Full Bleed, 12 Captioned Rows
   and 14 Index draw no gap row at all.
2. **A14's own amendment is reversed** — *gap names are "Tight · Normal · Loose"*. Amendment 5 of the
   previous pass recorded the PRD being amended **towards** Tight / Even / Airy, "owner-ruled". The
   library-wide ruling of 30 August 2026 goes the other way and wins; the Video and Embeds category
   made the same rename before this one, so A14 was the document out of step. **This is the one place
   this pass overrides something the spec already said**, and it is recorded here rather than done
   quietly.
3. **Two hand-off sentences deleted, and there was no third** — *no design ever turns into another
   design*. **1 Grid** no longer describes itself as "the arrangement six other designs resolve to at
   390": every A14 grid goes to one column at 390 and stays the design it is. **6 Contrast Band** no
   longer "prints as 1 Grid on white": on paper the band's fill is dropped, the type prints dark on
   white, **the arrangement and the captions are unchanged and the design is still 6 Contrast Band**.
   7 Carousel's and 8 Filmstrip's stacked print states were already their own and are untouched.
4. **What the designs do instead was already right, and is now stated per frame** — *no design ever
   turns into another design*. Nothing in A14 switched: a short last row stays short and
   left-aligned, a single photograph keeps its column width, 8 Filmstrip never becomes a column, 12's
   row never becomes a card, 5's head moves above its own set at 1,080 and the section stays 5 Split
   Head. **7 Carousel and 8 Filmstrip hide their arrows, dots and fades when the track already fits**
   — the rule's own example, a measurement made by the `carousel` module. Every mention of another
   design in a panel is **advice** ("at this count, 1 Grid reads better"), which the rule permits.
5. **Every number in the category is named as a mechanism** — *Ghost's templates cannot count, add,
   or remember*. The row numbers in **12, 13 and 14** are a **stylesheet counter** rendering
   position: no arithmetic, no authored number field, no look back at the previous item, and **no "3
   of 6" anywhere in A14**. **8's and 13's "See all 48" is authored in full**, count and all. **15
   Boxed's label is the one number A14 generates** — the list's length read straight out, a count and
   never a sum, with its singular and plural forms from the theme's translation catalogue.
6. **15 Boxed's count is drawn only when the photographs are added by hand** — *Ghost's templates
   cannot count, add, or remember*, **ruled by the owner on 30 August 2026**. At Source: From posts a
   post with no feature image is skipped and the template cannot subtract the skipped ones from the
   length, so the label would read high by however many were skipped. **In bound mode the label draws
   the eyebrow alone and no count**, with the reason in the panel; at Source: Authored — the default
   and every drawn state — the count is exact, singular included. The alternatives he refused:
   dropping the count everywhere, which loses it from the one design where it reads well, and
   accepting a number that is occasionally wrong.
7. **9 Full Bleed's Gutter row keeps its values** — *gap names are "Tight · Normal · Loose"*,
   **ruled by the owner on 30 August 2026**. **None · Hairline · Even** measures gutter widths rather
   than the three-step spacing ladder the ruling renames, and "an even gutter" means something
   specific there. Left as drawn, and recorded so it is not re-litigated: the retired word survives
   in A14 in exactly one place, on a row that is not a gap ladder.
8. **Nothing was renumbered and no design was deleted.** Fifteen designs, 1 to 15, no gap created or
   closed, no number reused.

### Rules and facts that were already satisfied, checked design by design

| Rule or fact | Where it lands in A14 |
|---|---|
| **The Remove button never greys out** | **Already satisfied, and confirmed on all fifteen.** The images list has **no floor**: ✕ sits on every row, never dimmed and never hidden; **removing to one photograph is allowed in every design**, and so is removing the last, after which the section does not render on the published page while the editor keeps its drop zone. There is no wall, so there is no explanation to write. The only limit is **Add, disabled at 48** with the reason shown. In bound mode the list is P0·3's read-only card and there is no Remove to dim. |
| **Item counts are a number picker** | **No row changed, and none should.** A14 has **no Show ladder** — the count is the length of the authored list, edited in the images repeater, and P0·5's stepper caps it at each design's drawn-for range in bound mode. **Columns, Followers and Gutter count columns and widths across the page rather than items** and stay rows of named values — the reading the owner ruled on in the Testimonials category. |
| **Avatars with no photograph** | **No subject.** A14 draws no person and no initials block in any of the fifteen; `profile_image` is read nowhere. The item is a photograph, and a missing one draws the plate carrying its alt text. |
| **Slider labels** | **No subject to fix.** Every scale row names what it affects and reuses the standard words: **Vertical spacing** and **Gap** read the shared ladders; **Frame height** Short 240 · Medium 320 · Tall 420; **Row height** Compact · Comfortable; **Thumb** Small 88 · Medium 128 · Off; **Frame width** Half · Two thirds; **Lead height**, **Lead width** and **Peek** the same way. No invented three-word vocabulary anywhere in the category. |
| **A design may offer fewer choices on a shared control, and must say why** | **Re-checked on all fifteen.** **There is no "Inherit" value anywhere in A14** and none had to be removed; the swatch row is **Base**; **no design renames a shared control or adds a choice to one**. Every narrowing is drawn greyed with its reason visible: 2 Masonry's Crop locked at As uploaded, As uploaded disabled in 3, 7 and 9, Background role locked in 6 and 9, Under each disabled at Gutter: None in 9, Lightbox: Off disabled in 13, and 13's two Crop values. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject in any of the fifteen.** A gallery bears no sign-up, subscribe or paid-tier button and opens no Ghost pop-up; **8's and 13's See-all is navigation, not a CTA**. **Member Visibility is not added anywhere** — a judgement, recorded so it can be overruled in one place rather than fifteen. |
| **The no-JavaScript notice** | **No subject, and no promise to withdraw.** A14 holds no subscribe field and no sign-in field, so there is nothing for a notice to replace, and nothing in this document ever said a reader could subscribe without JavaScript. **The per-design line stands and is restated on every frame:** eleven designs are pixel-identical; **7 Carousel** is a native snap track with every frame present, minus its arrows and dots; **8 Filmstrip** the same, minus two arrows and two fades; **13 Contact Sheet** is twelve links to full-size photographs and no caption text on the page — the weakest result in the category, flagged as such; **14 Index** is the strongest, a numbered list of captions each linking to a full-size photograph. **No A14 design loses a photograph, a caption, a credit or a link with JavaScript off.** |
| **CSS cannot see content** | **Checked, and nothing had to be withdrawn.** 2 Masonry is `column-count` and **measures nothing**; 11 Overlay clamps its caption at three lines **without knowing how long any caption is**, and the full text stays in the item and in the overlay; 15 Boxed's label truncates at 390 and never wraps; **the hiding of 7's and 8's arrows is a browser measurement made by the module**, not a stylesheet reading the list. **No A14 rule depends on a character count, and no design reorders the DOM at a breakpoint** — 12's alternation is `flex-direction`, never `order`. |
| **Some fields we drew do not exist** | **Already satisfied.** Bound mode reads a post's **feature image**, its **title** and the image's own **alt**, and nothing else: no member join date, no member newsletter list, no cadence, no site address and **no posts-per-page setting** — Count is the section's own stepper. `focus` is theme-side, because **Ghost stores no focal point on an image**, and that is recorded as a build decision rather than a drawn one. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere in A14.** These are placeable page sections whose markup, ARIA attributes and words this project owns end to end. **Ghost's own gallery card inside a post is A33's surface** and none of A14's controls reach it — the finding is unchanged and repeated on the proof frame. |
| **The two free designs are the owner's choice** | Shortlisted the five plainest designs, weighted towards the ones that do not need good photography — **1 Grid · 14 Index · 12 Captioned Rows · 15 Boxed · 13 Contact Sheet** — with one line each on the proof frame, and **recommended 1 Grid and 14 Index**. **Put to the owner in this pass; the line at the head of this document carries the recommendation until he rules.** |

### Open questions

**All three questions this pass raised were ruled by the owner on 30 August 2026 and are closed** —
the free designs, 15 Boxed's count in bound mode, and 9 Full Bleed's Gutter values. They are recorded
in **The owner's rulings** at the foot of this document.

**Housekeeping, pass two, 1 September 2026.** The five items carried in one line below are now
marked one by one, because a list where everything looks open is a list nobody reads. Nothing was
answered here.

1. ~~The overlay needs the original file and Ghost guarantees no middle size.~~ **Settled inside this
   document** — settlement 4 of the category layer, drawn in full on `A14-0`: the overlay requests
   the original file, and the cost is stated rather than avoided. A recorded cost, not a question.
2. ~~`alt` is load-bearing in 9 and 13 and cannot be required.~~ **Settled by the
   controls-reconciliation pass of 24 August 2026**, recorded in the shared field list: `alt` stays
   optional, a frame without one gets `alt=""`, and the editor draws a warning dot on that item.
3. **There is no sort module, and 14 Index is where one would be wanted.**
   **OPEN FOR THE OWNER**
4. ~~A bound gallery is A17 Post Grids without the titles.~~ **Closed by the owner, 2 September
   2026: A14 shows images the owner chose, A17 shows posts.** The per-frame post link is removed
   from bound mode, the boundary is stated once in the category layer, and the two categories no
   longer resolve to one outcome for a visitor.
5. **The locked-control test in finding 13 is still waiting to be ratified or overruled
   library-wide.**
   **OPEN FOR THE OWNER**
6. ~~13 Contact Sheet's captions in bound mode have nowhere to go.~~ **Closed by the owner,
   1 September 2026**, and **superseded on 2 September 2026**: the greying rested on a bound frame
   opening its post instead of the overlay, and bound mode no longer links to the post — so a bound
   title is reachable in the overlay and **Captions from titles is live here in both data modes**.
7. ~~8 Filmstrip names no width for its arrows' retirement.~~ **Closed by the owner, 1 September
   2026: the arrows stay on a laptop and a tablet and retire under 768**, in 8 and in 7 alike, and
   both no-JavaScript lines now read on both sides of that width.
8. **The conflict pass two will not choose:** a switched-off control is never hidden, and the Data
   group hides two sets of controls because P0·5 and P0·3 do — see Patch notes.
   **OPEN FOR THE OWNER**

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
   fifteen designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in
   the required shape, and names **1 Grid** and **14 Index** — both of which exist in this category's
   roster. It is **the owner's own choice, ruled on 30 August 2026**.

### The owner's rulings — 30 August 2026

1. **The free designs are 1 Grid and 14 Index** — *the two free designs are the owner's choice*. A
   grid and a list: one for a site with photographs worth showing large, one for a site without,
   where the photograph is a small thumb and the captions carry the section.
2. **15 Boxed draws its count only when the photographs are added by hand** — *Ghost's templates
   cannot count, add, or remember*. In bound mode the box label is the eyebrow alone; the count is
   never wrong rather than occasionally wrong.
3. **9 Full Bleed's Gutter keeps None · Hairline · Even** — *gap names are "Tight · Normal · Loose"*.
   It measures gutter widths, not the spacing ladder, and "an even gutter" is the right word there.

— End of specification —

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** fifteen designs, numbered **1–15**.

---

## Patch notes — pass two, 1 September 2026

Every change carries the **name** of the rule that required it. **Frames updated:** all fifteen
design frames (`A14-1` … `A14-15`) and the proof frame `A14-0`, each gaining a **PASS TWO PATCH**
block naming, for that design, what changed and the rule behind it; **`A14-0`, `A14-3` and `A14-9`
also gain the greyed rows drawn** in P0's treatment. **Nothing was renumbered, renamed, redrawn or
deleted; no control was added or removed; no value changed; no layout, type scale, colour pack or
spacing step moved.**

### What changed, and the rule that required it

1. **"In the lightbox only" greys at Lightbox: Off in eleven designs** — *a control switched off by
   another is greyed, with the reason beside it*. 1, 2, 3, 4, 5, 6, 7, 8, 9, 10 and 15 offer both a
   Lightbox switch and a caption placement that lives in the overlay. **3 Mosaic and 9 Full Bleed
   already resolved the pair to Under each; the other nine were resolving it silently**, which is the
   half of the rule that says a control may not sit accepting a value it will not honour. The value
   is now drawn struck through with the reason at the control — "Not available while the lightbox is
   off: the caption would be unreachable" — and Captions falls to **Under each**, or **Under the
   frame** in 7, which is that design's own value. **No new value, no new control, no changed
   default.** The fallback is the category's existing rule — *a caption is never unreachable* — not a
   new decision.
2. **9 Full Bleed's Gutter: None greys instead of being forced** — *a control switched off by another
   is greyed, with the reason beside it*. The panel used to change two values at once: at Lightbox:
   Off it resolved Captions to Under each and then forced Gutter off None. Now the resolution stays
   and **Gutter: None is greyed with its own sentence** — "Not available while captions sit under each
   frame: there is no space for the line to sit in." **Under each stays greyed at Gutter: None**, as
   it was: the pair reads both ways, and each direction says what it is doing.
3. **The Lightbox row greys at Source: From posts in all fifteen** — *a control switched off by
   another is greyed, with the reason beside it*. Bound mode already suppressed the overlay on every
   frame, because an author's link beats the lightbox and a bound frame links to its post; the row
   nevertheless kept accepting **On**. It is now greyed with the reason beside it, in every panel. **Greyed, not hidden**, and not left
   accepting a value nothing honours. **Withdrawn by pass three, 2 September 2026** — the link this
   rested on is removed, and the row is live at both sources.
4. **7 Carousel and 8 Filmstrip keep their arrows on a laptop and a tablet, and both declare 768** —
   *a design may declare the width below which its script runs*, **owner-ruled, 1 September 2026**.
   **This is the one place these two designs changed rather than being restated.** 7's "arrows dropped
   below 1,080" is withdrawn — it also contradicted 7's own responsive rule, which had arrows under
   the track at 834 — and 8's "arrows replaced by See-all at 834" is withdrawn with it: **both draw
   arrows at 1440, 1080 and 834, and retire them under 768**, where a 302 px track and a 220 px strip
   leave no room for a button. Both no-JavaScript lines now read on both sides of 768. Nothing else
   moved: no control, no value, no layout, no See-all behaviour — 8 keeps See-all under the strip at
   834, beside its arrows rather than instead of them.
5. **13 Contact Sheet greys Captions from titles at Off in bound mode** — *a control switched off by
   another is greyed, with the reason beside it*, **owner-ruled, 1 September 2026**, closing the open
   question this pass raised. Nothing is captioned on the page in this design and a bound frame opens
   its post rather than the overlay, so a post title would be stored and never read. The control is drawn, greyed at Off, with the sentence at the control; **the other fourteen designs
   keep it live**. Refused: captions under each square in bound mode, which is a different design,
   and keeping titles nobody can read. **Withdrawn by pass three, 2 September 2026** — with no post
   link on a bound frame the title is reachable in the overlay, and the control is live here too.
6. **Open questions marked item by item** — housekeeping. Two items were settled elsewhere in this
   document and are struck through with who settled them; six are live and each carries **OPEN FOR
   THE OWNER** on its own line. **Nothing was answered in the housekeeping.**
7. **Nothing was renumbered and no design was deleted.** Fifteen designs, 1 to 15.

### Rules and facts checked, design by design

| Rule or fact (by name) | Where it lands in A14 |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **The pass's whole subject.** Every case is listed in **The disabled-control pattern** in the category layer: six narrowings already drawn greyed with their reasons, and the three this pass adds. **The rule's one exception is claimed nowhere in A14** — no control here is one the project can never offer, so nothing is left undrawn. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **No subject.** A14 draws no person and no initials block; `profile_image` is read nowhere. A missing photograph draws the plate carrying its alt text. |
| **The Remove button never greys out** | **Already satisfied, confirmed on all fifteen.** The images list has no floor; ✕ is on every row, never dimmed, never hidden; removing to one is allowed and so is removing the last. **Add, at the ceiling, is the one disabled control**, with the reason shown. In bound mode the list is P0·3's read-only card and there is no Remove to dim. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No row changed, and none should.** Columns, Crop, Gap, Gutter, Frame height, Row height, Thumb, Followers and the rest are named values with a drawn frame behind each; the only stepper in any A14 panel is P0·5's **Count**, which counts items. Nothing was converted in either direction. |
| **A design may declare the width below which its script runs** | **Two designs declare one, and both read on both sides of it: 7 Carousel and 8 Filmstrip, "the arrows retire under 768"** — owner-ruled, 1 September 2026. The other thirteen run `lightbox` at every width and are pixel-identical with JavaScript off. |
| **Ghost's templates cannot count, add, or remember** | **Unchanged by this pass, and re-checked.** The row numbers in 12, 13 and 14 are a stylesheet counter; 8's and 13's See-all label is authored in full; **15 Boxed's count draws only at Source: Authored**, by the owner's ruling of 30 August 2026. No arithmetic was introduced. |
| **CSS cannot see content** | **Re-checked, nothing withdrawn.** The greying added here is editor state, not stylesheet logic: the panel knows the value of another control, which is not a measurement of content. 11 Overlay still clamps at three lines without reading a caption's length. |
| **Some fields we drew do not exist** | **Unchanged.** Bound mode reads a post's feature image, its title and the image's own alt, and nothing else. `focus` stays theme-side because Ghost stores no focal point. |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere in A14.** These are placeable sections whose markup and words this project owns; Ghost's own gallery card inside a post is A33's surface. |
| **The feature-image caption renders differently on the two Ghost versions** | **No subject, and worth one line for a builder.** No A14 design draws a feature image's caption: in bound mode the frame takes the post's **feature image**, its **title** as `caption` and the image's own **alt** — none of them the caption field the two Ghost versions disagree about. **The difference cannot reach this category.** |
| **A comment count renders nothing at all without JavaScript** | **No subject.** A14 reads no comment count, ships no comment noun in its translation catalogue, and puts no accessible label on a number. |
| **The two free designs are the owner's choice** | **Unchanged: 1 Grid and 14 Index**, ruled on 30 August 2026, both present in the roster. |

### The conflict this pass will not choose

**Rule A says a control switched off by another is greyed and never hidden. A14's Data group hides
two sets of controls, and it hides them because the shared primitives do.** **P0·5 hides Count and
Order at Filter: Hand-picked.** **Bound mode hides Add, Remove and Reorder** behind P0·3's read-only
card. Both hidings are caused by another control, so the rule reaches them; neither can be greyed
without redesigning P0·5 and P0·3, which this pass is instructed not to do. **Listed here rather than
resolved**, and no A14 panel was changed on account of it.

### Open questions raised by this pass

**Both were ruled by the owner on 1 September 2026 and are closed.** They are recorded in **The
owner's rulings** below. One item remains, and it is the conflict rather than a question:

1. **The Data group's hidings**, above — P0·5 and P0·3 hide controls that Rule A would grey.
   **OPEN FOR THE OWNER.**

### The owner's rulings — 1 September 2026

1. **13 Contact Sheet turns Captions from titles off in bound mode**, greyed with the reason beside
   it — *a control switched off by another is greyed, with the reason beside it*. The design keeps
   its uncaptioned sheet and stores nothing a reader cannot reach. **Superseded by the owner's
   ruling of 2 September 2026**, which removes the bound frame's post link and makes the title
   reachable in the overlay.
2. **7 Carousel and 8 Filmstrip keep their arrows on a laptop and a tablet, and retire them under
   768** — *a design may declare the width below which its script runs*. One width for both scrolling
   designs, and both no-JavaScript lines read on both sides of it.

### Left alone deliberately

**Two things were edited outside this environment and are untouched here.** **No printed design total
was reintroduced** anywhere in this document or on any A14 frame — nothing in the category quotes a
library size, and the count-agnostic copy stands. **P0's per-prop mark allowlist is not rewritten,
softened or dropped**: the default inline marks, a field's right to narrow that set, and a
disallowed mark being **absent** from the toolbar rather than greyed, all stand as written. **One
thing was left because it is deliberate**: 9 Full Bleed's **Gutter: None · Hairline · Even** keeps
the retired word "Even" by the owner's ruling of 30 August 2026, and nothing in this pass touches it.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
   fifteen designs, nothing renumbered, no number reused, no gap created or closed. **The only
   drawn changes in the whole pass are 7's and 8's arrows on laptop and tablet, both owner-ruled.**
2. **The `**[Free] designs:**` line is present**, at the head of this document, and names **1 Grid**
   and **14 Index** — both of which exist in this category's roster.

---

## Patch notes — pass three, 2 September 2026

Every change carries the **name** of the rule or ruling that required it. **One work-list item**, and
it removes something rather than adding it. **Frames updated:** all fifteen design frames (`A14-1` …
`A14-15`) and the proof frame `A14-0`, each gaining a **PASS THREE PATCH** block; `A14-0`, `A14-3`
and `A14-9` lose the greyed Lightbox row pass two drew, and `A14-13` draws its **Captions from
titles** row live. **Nothing was renumbered, renamed, redrawn or deleted; no control was added or
removed; no value changed; no layout, type scale, colour pack or spacing step moved.**

### What changed, and the rule that required it

1. **Bound mode does not link each picture to its post** — *the owner's ruling of 2 September 2026*,
   closing the open question pass two raised. A gallery whose every frame links to a post resolves,
   for a visitor, to what a Post Grid resolves to, and two categories arriving at one outcome is what
   the library's uniqueness rule exists to prevent. **A14 stays pictures-only.** At **Source: From
   posts** a frame still takes the post's **feature image**, its **title** as `caption` at Captions
   from titles: On, and the image's own **alt** — and links to nothing. The link is removed from the
   category layer's lightbox settlement, from the Data group's mapping, and from all fifteen designs'
   **Data** field.
2. **The boundary is stated once in the category layer** — *the same ruling*. **A14 shows images the
   owner chose; A17 Post Grids shows posts.** It sits in the neighbours paragraph, beside the
   sentence that already said A14's grids carry no titles and no links to posts, and it is referenced
   rather than restated per design. It holds in both data modes.
3. **The Lightbox row is live again at Source: From posts, in all fifteen** — *a control switched off
   by another is greyed, with the reason beside it*. Pass two greyed the row and the only reason
   written at the control was that every bound frame linked to its post and opened it instead of the
   overlay. **With the link gone, nothing switches the row off**, and leaving it greyed would mean
   inventing a second reason the owner has not given. The row's line in every control table reads
   **On · Off** again, the two drawn greyed rows on `A14-0`, `A14-3` and `A14-9` are removed rather
   than restated, and pass two's item 3 is tagged **withdrawn** where it stands rather than rewritten.
4. **13 Contact Sheet's Captions from titles is live again in bound mode** — *a control switched off
   by another is greyed, with the reason beside it*, **superseding the owner's ruling of 1 September
   2026**. That ruling rested on one fact: nothing is captioned on the page in this design, and a
   bound frame opened its post rather than the overlay, so a stored title could never be read. **The
   overlay now opens on a bound frame**, so the title is reachable exactly where this design's
   captions have always been reachable. **This design's own Lightbox: Off stays disabled**, for its
   own standing reason — nothing is captioned on the page — and that row is untouched.
5. **The findings and the open questions are brought into line.** Finding 9's "consequence worth
   deciding" is answered with the ruling; finding 10, *a bound frame is a link, so the lightbox never
   opens on it*, is replaced by its opposite; open question 4 is **closed**; open question 6, closed
   on 1 September, is marked **superseded**. The reconciliation note that a bound section differs by
   "each frame links to its post" now reads that it differs by **where the pictures come from and
   nothing else**.
6. **Nothing was renumbered and no design was deleted.** Fifteen designs, 1 to 15.

### Rules and facts checked, design by design

| Rule or fact (by name) | Where it lands in A14 |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Two cases removed, none added.** What remains is the pair the category always had: **In the lightbox only** greyed at Lightbox: Off in the eleven designs that offer both, and **9 Full Bleed's Gutter: None** greyed while its captions sit under each frame. Both keep their sentences at the control. **The rule's one exception is claimed nowhere in A14** — no control here is one this project can never offer. |
| **The Remove button never greys out** | **Unchanged, re-checked on all fifteen.** ✕ is on every row, never dimmed, never hidden; **Add at the ceiling is the one disabled control**. In bound mode the list is still P0·3's read-only card and there is no Remove to dim. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No row changed, in either direction.** Columns, Crop, Gap, Gutter, Frame height, Row height, Thumb and Followers stay named sets with a drawn frame behind each value; P0·5's **Count** stays a stepper, because it counts items. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **No subject.** A14 draws no person and no initials block; a missing photograph draws the plate carrying its alt text. |
| **A design may declare the width below which its script runs** | **Unchanged.** 7 Carousel and 8 Filmstrip declare **768** for their arrows, owner-ruled 1 September 2026, and both no-JavaScript lines read on both sides of it. The other thirteen run `lightbox` at every width. **The no-JavaScript lines are unaffected by this pass** — the frame was already an `<a href>` to the full-size image before any script ran, and it still is. |
| **Ghost's templates cannot count, add, or remember** | **Unchanged.** **15 Boxed's generated count still draws only at Source: Authored**, by the owner's ruling of 30 August 2026: a bound gallery skips a post with no feature image and the templates cannot subtract the skipped ones. Removing the post link does not give them arithmetic. |
| **CSS cannot see content** | **Unchanged.** Nothing added here measures a caption, a line count or a length. |
| **Some fields we drew do not exist** | **Unchanged, and one field fewer is read.** Bound mode reads a post's feature image, its title and the image's own alt. **The post's URL is no longer read at all.** |
| **Inside a blog post's body we own the stylesheet and nothing else** | **Applies nowhere in A14.** Ghost's own gallery card inside a post is A33's surface. |
| **The feature-image caption renders differently on the two Ghost versions** | **No subject.** No A14 design draws a feature image's caption. |
| **A comment count renders nothing at all without JavaScript** | **No subject.** A14 reads no comment count. |
| **The two free designs are the owner's choice** | **Unchanged: 1 Grid and 14 Index**, ruled 30 August 2026, both present in the roster. |

### Open questions raised by this pass

**None.** The ruling was applied without inventing a decision: the two narrowings that fell were
each written with the post link as their only stated reason, and both were removed rather than
re-argued. **Nothing was left greyed with a reason that is no longer true, and no new reason was
written on the owner's behalf.**

**Carried forward, unchanged and unanswered by this pass** — three items, each **OPEN FOR THE
OWNER**: the missing sort module that 14 Index would want; the locked-control test in finding 13,
still to be ratified or overruled library-wide; and the conflict pass two would not choose, where
P0·5 and P0·3 **hide** controls that Rule A would have greyed. **This pass touched none of them.**

### Left alone deliberately

**Two things are maintained outside this environment and are untouched here.** **No design total was
written anywhere** — not in this document, not on any A14 frame, in any form, and none was inherited
into the new copy. **P0's per-prop mark allowlist is not rewritten, softened or dropped.**

**Left as written, and said so rather than tidied:** pass two's dated **Patch notes** and the dated
patch blocks on the frames are **records of what that pass did**, so the two items this pass reverses
are **tagged "Withdrawn by pass three"** where they stand rather than edited into agreement. A reader
of either block sees what was decided, and when it stopped being true.

**Also left:** 9 Full Bleed's **Gutter: None · Hairline · Even** keeps the retired word "Even" by the
owner's ruling of 30 August 2026, and **15 Boxed's count in bound mode** stays as ruled on 30 August
2026 — the eyebrow alone, no number.

### The owner's ruling — 2 September 2026

1. **Bound mode does not link each picture to its post** — *A14 shows images the owner chose, A17
   shows posts*. A bound gallery reads posts for their feature images and links to none of them, so
   the two categories do not resolve to one outcome for a visitor. **A14 stays pictures-only.**

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
   fifteen designs, nothing renumbered, no number reused, no gap created or closed.
2. **The `**[Free] designs:**` line is present**, at the head of this document, and names **1 Grid**
   and **14 Index** — both of which exist in this category's roster.
