# A19 Featured and Spotlight — written specification

15 designs · Paper pack · drawn 22 August 2026

**Controls-reconciliation patch — 25 August 2026.** The category was audited, design by design,
against the PRD's control vocabulary and Ghost's verified data surface, thinking like a user editing
their own site. This revision reuses the shared editor primitives from **P0 · Editor primitives** by
name — the **P0·1** inline text toolbar with its link popover, the **P0·2** icon slot and Icon
Picker, the **P0·3** item controls, the **P0·4** member-aware action editor, the **P0·5**
"Populate from…" data panel and the **P0·6** editor state switcher — and never redraws them.
Seven things now hold across the category: the **universal trio outside every control list**, with
every per-design **Padding** row retired into Vertical spacing; the **Data group** in place of the
Posts block, carrying **Source: Hand-picked** and **Count as a 1–100 stepper**; **Tag: Show · Hide**
on the eleven designs that drew a tag with no way off; **`linkUrl` deleted from all fifteen
sidebars**; the excerpt bound to **`excerpt`** everywhere except 13 Quote; every authored string
inline-editable against Ghost-owned content that is not; and **no invented reader-visible string
left in the category**. What each design gained is in a **Reconciled** paragraph at the foot of its
entry, and the frame-by-frame list is in **Reconciliation notes** at the end.

The frames are `A19-0 Category Proof.dc.html` and `A19-1` … `A19-15`. **Where this file and a
drawn panel disagree, the panel is the authority** — it is the thing that was designed; this is the
thing that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's three additional artefacts are **on the proof frame, not here**: the tokenisation
proof (A19·1 in three packs, light and dark), the stress frame, and the roster. The shared field
list is repeated below as Block 2 because the build reads it.

---

## 0 · The category layer

### What A19 is

Fifteen arrangements of **one post — or of a few posts with one of them larger**. A17 divides a page
between posts and A18 gives one post a whole row; A19 asks what a section does when its subject is a
single piece of writing. **The user does not author the set**: no repeater, no Add, no Remove, no
drag handle. The section is handed a query, Ghost answers it, and the designs draw what comes back.

**A17 and A18 are inherited whole** — the post card, the tag plate, the Data group, A6's focus
ring, A1's head, meta row, avatar and icon button, A8's ratio ladder and split layout, A10's cell
divisions, A18's row and its separator vocabulary. **What A19 adds is scale**, and the two rules
scale forces: what a picture does when it is missing, and what a design does when the query returns
fewer posts than it was composed for.

### The four settlements (§8)

**1 · What “featured” reads from, and what happens when nothing is marked.** **It reads Ghost's own `featured` boolean** — the star in the post list — through the Data group's **Source: Featured only**, which is A19's default and is set for the user when the section is added. There is no A19 pin and no A19 star. **⚑ Amended by this pass: there is now a per-section picker.** **Source: Hand-picked** takes 1–5 posts through the Ghost-aware post picker, stores references and draws them in picked order. The old refusal — “the section cannot own a fact about a post that Ghost already owns” — **is overruled**, on two grounds: **which post THIS section spotlights is a fact about the section**, not about the post; and Ghost's `featured` star is **global**, so one hero and one featured grid cannot star independently today. **Picking is not authoring**, so every other refusal in the category stands: no Add that creates a post, no Remove that deletes one, no per-post styling. **The picker's ceiling is the design's Count maximum** — one post on the nine one-post designs, two on 10 Pair, three on 8 and 9, five on 11, 12 and 15. **⚑ When nothing is marked, A19 does not quietly substitute the latest post.** A section that says Featured over a post nobody chose is a section that lies, so **the default is to hide** — and because “hide” is occasionally the wrong answer for a home page that must not have a hole in it, **the choice is a fifth field in the Posts block: When nothing matches — Hide the section · Show the latest post.** It sits in the block rather than in a design's control list because it is a property of the query, and it is therefore identical in all fifteen and counts toward none of their totals.

**⚑ Ghost cannot order featured posts by hand** — which is why **Hand-picked is now the running order**: the picked order is the drawn order, and **Order is disabled while it is set**. At every query Source, order is a rule and never a sequence — **Newest first · Oldest first**. **The old advice is deleted from all five multi-post panels** ⚑: “tag the posts and use Oldest first” was what a panel writes when the feature is missing, and Hand-picked is the feature. **`shuffle` is refused category-wide**: a spotlight that changes on refresh is not a spotlight, and a reader who returns to find a different lead cannot tell whether the site changed or they misremembered.

**2 · One spotlight versus three, and the hierarchy between them.** **⚑ Amended: Count is the shared 1–100 stepper with per-design bounds**, closing the category's own first finding — A17 needed 3 · 6 · 9 · 12, A18 5 · 10 · 15 · 25 and A19 1 · 2 · 3 · 5, and a third enum was the wrong answer to a number. **A19's locked-row convention survives intact and is the right UI for it**: a locked Count is drawn disabled, with the reason and the design to switch to beneath. **Nine designs lock it at 1** and 10 Pair locks it at 2; **min 1 · max 3** on 8 Lead and Two and 9 Alternating, **max 8** on 11 Lead and Rail and 15 Carousel, **max 10** on 12 Picks. **4 and 6 are reachable at last** — the old 3 · 5 skipped them. **Where a design draws more than one, exactly one is the spotlight and the rest are followers** — the lead keeps the picture, the 34 px title, the excerpt and the call to action; a follower gets a 20 px title and a date. **Hierarchy is size, never decoration:** no design marks its lead with a chip, a fill, a border or a colour it does not give the others. **Two designs are deliberately flat and say so** — 10 Pair and 15 Carousel — and **no design has two display moments**.

**3 · A featured post with no image, which is the common case.** A17's tag plate exists for exactly this and **it does not scale to A19**: a plate at a spotlight's image box is a 636 × 424 striped rectangle, and at 2 Full Bleed's box it is a 1,440 × 620 one. **⚑ So the category answers per design, from a vocabulary of three, and every design names which one it uses in spec field 8.** **Reflow** — the image column is dropped and the text takes the full content width, becoming 6 Big Type's composition at its own title size; four designs — 1 Split, 5 Contrast Band, 8 Lead and Two and 9 Alternating. **Plate** — A17's tag plate at the image's box, **capped at 320 px tall in A19 whatever the ratio says**, carrying the primary tag at eyebrow size and `aria-hidden`; four designs — 3 Card, 10 Pair, 11 Lead and Rail and 15 Carousel — all of them ones where the picture holds a position rather than a proportion. **⚑ Amended once the fifteen were drawn: the 320 cap holds only where nothing has to align with the plate, which is 3 Card alone; in 10, 11 and 15 the plate takes the picture's box exactly**, because there the plate exists to keep two columns starting level and five slides at one height, and a capped plate would break the alignment it was drawn for. **Hand off** — the design cannot exist without a picture and says so in the panel, naming its replacement and switching nothing; three designs, 2 Full Bleed, 4 Poster and 7 Overlap. **Four designs draw no picture at any setting** — 6 Big Type, 12 Picks, 13 Quote and 14 Slim — so the question does not arise for them, and the vocabulary covers eleven. **Reflow is the default answer and the one a site hits most**, because the split designs are the ones most sites choose.

**4 · Zero, one and many, and whether the section hides itself.** **Zero → the section does not render**, unless the Data group's *When nothing matches* says otherwise: no head, no empty state, no sample post, and for 5 Contrast Band, 13 Quote and 14 Slim the band, the panel and the strip go with it. **Zero in the editor → the design's outline at one lead plus one line naming the cause**: “No posts are marked featured. Star a post in Ghost, or change Source.” ⚑ **One → every design draws one and none apologises.** The six multi-post designs each state what one looks like, and **a design short of posts drops its follower column entirely rather than leaving a hole**: 8 Lead and Two at one post is 1 Split's arrangement in this design's own type, 11 Lead and Rail is a lead with no rail, 12 Picks is a list numbered 01 and is weak, 15 Carousel is one slide with no dots and no arrows. **Many → the section takes exactly Count and never paginates.** There is no More link, no next arrow and no A34 attachment: **a spotlight that offers to show you the rest is a list**, and A18 is one click away in the Design picker with the query preserved.

**The count is the query's, not the design's — with one amendment.** No A19 design has a control that adds or removes a post; where a design's arrangement changes with the count — 8, 9, 11, 12, 15 — **Count drives it and the panel's count line reports what happened**: “5 posts are featured. 3 drawn.” **At Source: Hand-picked the picked list is the count** ⚑, the stepper is disabled and the line reads “3 picked. 3 drawn.” — the one place in A19 where a user sets the number by choosing the posts rather than by naming a figure.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The universal trio, outside every design's control list.** **Background role** (Background ·
  Surface · Contrast), **Vertical spacing** (Compact 64 · Comfortable 96 · Spacious 132; 80 at 834;
  64 at 390) and **Top divider** (None · Line · Fade). **Every per-design Padding row was Vertical
  spacing under another name and is gone from all thirteen panels that had one.** Genuinely
  different ladders keep their own names: **12 Picks' Row density** (the space inside a row),
  **14 Slim's Density** (the strip's height) and **2 Full Bleed's Height** (the section's height).
  **Five locks, each with its reason drawn**: Background role at Contrast on 5 Contrast Band, at the
  image ground on 2 Full Bleed, at Surface on 13 Quote and 14 Slim; Vertical spacing as no-effect on
  2 Full Bleed, where the picture meets the section's edges. **Top divider is locked None on four** —
  2 Full Bleed and 5 Contrast Band (the band's own edge is the divider) and 13 Quote and 14 Slim
  (the same, and 14's **Rule** already draws a hairline immediately above the strip). **⚑ Two
  designs keep a Rule control beside the universal Top divider** — 6 Big Type and 14 Slim — because
  one draws inside the section and the other above it; on 6 Big Type the panel warns when Rule Above
  meets Top divider Line rather than disabling either. **14 Slim gains a spacing control it never
  had** ⚑, resolving 32 · 48 · 64 — half the category's ladder, because a 64 px bar with 96 px of
  air around it is a bar pretending to be a section.
- **The spotlight.** A17's post card at display scale: DOM order image → tag → title → excerpt → meta → call to action, **the whole thing one `<a>` to the post**, no fill, no border, no shadow and no radius on the text side. **Hover is A17's: a 2 px accent underline on the title at 160 ms.** Focus is A6's ring on the whole box at a 4 px offset.

- **⚑ The call to action is a label on the post's own link, not a second link.** It is a `<span>` inside the card's `<a>`, drawn at 14/600 with a 2 px accent underline, and it takes its words from the section's `linkLabel`, defaulting to “Read the piece”. **⚑ Amended: `linkUrl` is deleted from the union and from all fifteen sidebars.** It was read by no A19 design, and **a visible URL field that nothing reads is a fake control** — the finding for the architect becomes a deletion rather than a note. `linkLabel` stays, because it labels a real link.
- **The excerpt binds `excerpt`** ⚑ — the custom excerpt where one is authored, Ghost's generated
  plaintext otherwise, clamped by line as each design draws it. **13 Quote is the single exception
  and keeps `custom_excerpt` required**, because it *frames* the excerpt: a generated fallback is
  the first fifty words of a piece with no ending, and set at 34 px as a pull quote it reads as a
  mistake. Its hand-off to 6 Big Type is unchanged.

- **Type.** Spotlight title **Small 28 · Medium 34 · Large 40** in the heading font, 30 at 834, 26 at 390; **6 Big Type has its own ladder at 52 · 64 · 72** and is the category's one display moment. Follower title 20, 19 at 390. **Excerpt 17/1.6 on a spotlight and 16 on a follower** — one step above A18's row, because one post can afford it — clamped by line at Off · One line · Two lines · Three lines. Eyebrow 13 uppercase tracked. Meta 13.

- **Measure.** Content 1,296 at a 72 px page margin; 754 at 40; 350 at 20. **Spotlight text is held to 560 beside a picture and 720 without one** ⚑ — narrower than A18's 820, because a 34 px title needs fewer characters a line than a 22 px one. Head measure 620, as A17 and A18.

- **Section spacing is the universal Vertical spacing** — Compact 64 · Comfortable 96 · Spacious 132; 80 at 834; 64 at 390. **5 Contrast Band resolves it 80 · 96 · 132** on its own ground, A17·7's rule, as *this row's resolution and not a second ladder*. **2 Full Bleed draws the row disabled**: the picture meets the section's edges, and Height is that design's ladder.

- **The head is content, not a control.** Eyebrow · title on 620 · sub 17 · note 13 · `linkLabel`; each drawn when authored, **each edited inline with the P0·1 toolbar** — bold · italic · underline · link, the link popover carrying Open in new tab and rel nofollow · noreferrer · sponsored. **⚑ The eyebrow defaults to the word “Featured” and no design draws a coloured chip, pill or badge** — the word is the badge, and a plate beside a spotlight is a second focal point competing with the one the section exists for.

- **Imagery.** A8's named ratio ladder unchanged — **Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5**, never computed. **A19 adds no ratio and proportions rather than sizes its pictures**, the opposite of A18's fixed thumbnails: a spotlight's picture is a fraction of the section and has to breathe with it. Radius 8 from the pack on every image except 2 Full Bleed's, which has none because it meets the section's edges.

- **Scrims.** One design puts text on a picture — 2 Full Bleed — and its scrim is **a bottom-up wash of the pack's contrast colour at 62% to transparent over the lower 60%** ⚑, never black and never full-height. 7 Overlap needs none: its text sits on a surface card, not on the photograph.

- **Accent, twice.** The call to action's underline and the focus ring. **Three designs spend a third and each discloses it**: 5 Contrast Band's lifted accent, 15 Carousel's active dot, 14 Slim's trailing arrow. **A tag, a numeral, a rule and a date are never accent.**

- **Dark.** A17's measured step, inherited without adjustment: ground `#171511`, surface `#211D17`, plate `#2A251E`, hairline `#332E27`. **A19 is the easiest of the three categories in dark and the hardest in one place** — 2 Full Bleed, where the scrim has to lift a photograph off a ground that is already dark.

- **Responsive floor.** Every side-by-side arrangement becomes one column at 834 with **the picture above the text, never below it** ⚑ — the reverse of A18, which never stacks a picture at all, and the reason is that a spotlight's picture is its identifier. **Reading time leaves the meta below 767 and the date never does** (A18's rule). Followers become a stacked list at 834 and keep their rules.

- **Structure.** `<section aria-labelledby>`; head title `<h2>`, post titles `<h3>`. **⚑ When no head is authored the spotlight's own title becomes the `<h2>` and followers step to `<h3>`**, so the section is never a heading level short. Dates are `<time datetime>`; plates and quote marks are `aria-hidden`.

- **Editing, and what is not editable.** Every authored text edits inline with **P0·1**;
  **Ghost-owned content never does** — clicking a post title, tag, author name or excerpt says
  **“Edit in Ghost”**. Every URL field that survives opens the Ghost-aware **Link Picker**.
  **Image focus belongs to the post** ⚑ — A19 authors no image, so rule 10's Centre · Top · Bottom
  sits on the post's `feature_image` in Ghost; the panels say so rather than drawing a field that
  writes nothing. **Rule 11's optional button icon reaches nothing** ⚑: the only button-shaped
  things in the category are 15 Carousel's A1·14 arrows, whose glyph is the design's, and a
  carousel whose arrows can be any icon stops looking like one. **Member visibility is offered
  nowhere** ⚑ — every action in A19 is a link to a post, and a spotlight that hides itself from a
  logged-out reader is A32's paywall wearing a section's clothes. **No Preview control existed in
  A19 to remove.**
- **Visitor-facing strings.** **A19 ships no fixed English string.** The head strings are authored
  fields with defaults (“Featured”, “Read the piece”). The two invented ones are closed here:
  **11 Lead and Rail's rail label becomes the authored `railLabel`** (default “More featured
  posts”, ≤ 26 characters, inline-editable) with a **Rail heading: Hidden · Shown** control, and
  **15 Carousel's three button strings become theme translation-catalog strings** — “Previous
  featured post”, “Next featured post”, “Show post 3 of 5”, the last with its two numbers as
  placeholders. **Editor-only text is not visitor-facing** and stays as drawn: the count line, the
  zero-state message and 13 Quote's hand-off notice never reach a reader.
- **Behaviour.** **One module in the category** — `carousel`, declared by 15 Carousel alone. **No
  registry addition is needed by this pass and no module name was coined.** `core` is assumed and never declared per design. **Fourteen designs are pixel-identical with JavaScript off** and the fifteenth loses only its dots and arrows. `reveal`, `shuffle`, `slide-in-card` and `count-up` were considered and refused.

- **Print.** Every design prints as drawn except two: **5 Contrast Band prints as 1 Split on white** (A17·7's rule) and **15 Carousel prints its slides stacked**, all of them, in query order.

### The content

**Six invented posts (Orbit Weekly)** — A17's and A18's first six in their original positions, so
the three categories are comparable. **Posts 1, 2, 3, 5 and 6 are marked `featured`**, which is five,
the ceiling of Hand-picked and the top of the old Show ladder, and lets every design be drawn at its designed count from one query.

| # | Post | Tag | Author | Date | Read | Picture | The case it carries |
|---|---|---|---|---|---|---|---|
| 1 | The night shift at the Port of Algeciras | Reporting | Marguerite Okonjo | 12 Mar 2026 | 9 min | yes | the spotlight in every frame |
| 2 | Why the new tram line stops four hundred metres short of the hospital | Transport | Daniel Reith | 9 Mar 2026 | 12 min | yes | the 69-character title |
| 3 | Rosa Ferreira on drawing machines that do not exist yet | Interview | Priya Raghunathan | 5 Mar 2026 | 7 min | **no** | settlement 3 — the missing picture |
| 4 | A short note on the Thursday letter | **none** | Marguerite Okonjo | 2 Mar 2026 | 2 min | no | not featured; why a plate can be empty |
| 5 | Six months of rain, measured by one gardener | Field notes | Naomi Alder | 26 Feb 2026 | 6 min | yes | author with no photograph |
| 6 | The last analogue switchboard in Lisbon | Reporting | Tomas Lindqvist | 22 Feb 2026 | 8 min | yes | **no excerpt** |

**The section's own fields, identical in every A19 frame unless a design says otherwise:**
`eyebrow` Featured · `title` What we would read first this month · `sub` One piece from the last
four weeks, chosen on a Monday. · `linkLabel` Read the piece. **Nine designs draw the eyebrow
alone**, because a section title above one post title is two headlines.

**⚑ Nothing in this list is real.** Orbit Weekly does not exist; the posts, dates and reading times
are invented.

### The roster

| # | Design | What it is for | Tuple | Count | No image |
|---|---|---|---|---|---|
| 1 | **Split** | The default. One post, text beside a picture. | `split · none · page · one · right · half-page image` | 1 | Reflow |
| 2 | **Full Bleed** | The picture is the section; text sits on it. | `media frame · none · image · one · full-bleed · text on the picture` | 1 | Hand off |
| 3 | **Card** | One post lifted onto a plane inside the page. | `split · card · surface · one · left · one post on a plane` | 1 | Plate |
| 4 | **Poster** | A tall crop in a narrow column; a magazine cover. | `media frame · none · page · one · top · portrait crop, centred column` | 1 | Hand off |
| 5 | **Contrast Band** | 1 Split inverted, to break a long page. | `split · none · contrast · one · right · inverted band` | 1 | Reflow |
| 6 | **Big Type** | The title is the whole design. No picture at any setting. | `stack · none · page · one · none · title at display size` | 1 | n/a |
| 7 | **Overlap** | A card sitting over the corner of a wide picture. | `media frame · card · page · one · background · card overlapping the image` | 1 | Hand off |
| 8 | **Lead and Two** | One spotlight with two text-only followers beside it. | `grid-of-N · none · page · few · left · lead outsized against two` | 2 · 3 | Reflow |
| 9 | **Alternating** | Two or three spotlights, each a full-width band, sides alternating. | `stack · none · page · few · left · alternating full-width bands` | 2 · 3 | Reflow |
| 10 | **Pair** | Two featured at equal weight, half a page each. | `split · none · page · few · top · two halves at equal weight` | 2 | Plate |
| 11 | **Lead and Rail** | A spotlight with the rest of the featured set as titles. | `split · none · page · variable · top · lead beside a titles rail` | 3 · 5 | Plate |
| 12 | **Picks** | Three or five, numbered, no pictures at all. | `feed · none · page · few · none · ordinal-led picks` | 3 · 5 | n/a |
| 13 | **Quote** | The excerpt set as a pull quote, the title as its attribution. | `stack · none · surface · one · none · excerpt at display size` | 1 | n/a |
| 14 | **Slim** | One line: the smallest spotlight in the library. | `bar · none · surface · one · none · one-line strip` | 1 | n/a |
| 15 | **Carousel** | The featured set one slide at a time; the category's one module. | `carousel · none · page · many · left · one slide at a time` | 3 · 5 | Plate |

**Count in the roster is the stepper's default; the bounds are per design** — locked at 1 on the
nine one-post designs and at 2 on 10 Pair; min 1 · max 3 on 8 and 9; max 8 on 11 and 15; max 10 on
12. **The picker at Source: Hand-picked takes up to the same maximum**, and never more than five.

### Tuple uniqueness — the honest statement

**Tuple uniqueness — the honest statement.** **All fifteen are distinct on the five closed slots**, which A17 managed for nine of eighteen and A18 for nine of fifteen. **The reason is not that A19 was designed more carefully; it is that a spotlight has more to vary.** A list has one column, one ground and no containment, so its designs collide on the slots and rest on the emphasis phrase. A19 spends grounds (page, surface, contrast, image), containment (a card twice) and media placement (six of the seven values) because the whole category is about where one post sits. **Where two designs come close it is 8 and 9** — both few, both leading with a picture — and they separate on archetype, which is a real difference: one is a grid that puts followers beside the lead, the other stacks bands down the page.
   **⚑ One overlap is worth naming rather than hiding: 10 Pair is the nearest thing in A19 to A17·2 Two Up.** Two posts, two halves, pictures on top. What separates them is scale and count — Pair's titles are 28, its excerpts are the spotlight's 17, both cells carry a call to action, and **Show is locked at 2** where A17·2 walks its own ladder. It is a finding for the architect rather than a defence: if the reconciliation pass decides that is not enough, Pair is the design to cut.

### The Data group

**P0·5 “Populate from…” configured for posts, identical in all fifteen, below each design's own
controls and counted toward no design's total.** Source (Latest posts · By tag · By author ·
**Featured only**, A19's default · This route's posts · **Hand-picked** ⚑ new) · Tag or author ·
**Hand-picked posts** — the Ghost-aware picker, shown at that Source only, taking the P0·3 item
controls: the picker arrives with a real post rather than a blank Add, remove is never disabled,
drag reorders, and there is no per-post styling ⚑ · **Count**, the 1–100 stepper with per-design
bounds, locked rows drawn disabled with their reason · Order (Newest first · Oldest first, disabled
at Hand-picked) · **When nothing matches (Hide the section · Show the latest post)** ⚑, default
Hide.

**No query Source shows a list at all**, and **no design has a per-post control**: a control writes
one value onto the section and every post reads it. **A picked post that is no longer published is
skipped**, and if none survive, *When nothing matches* applies — the same rule the query sources
use.

---

## The fifteen designs

Each entry gives the ten required fields; the floor above is not repeated. **Controls are listed in
sidebar order.**

---

### 1 · Split

1. **Descriptor.** One featured post as a two-column split: text on a 560 px measure at the left, its feature image on 636 at the right, the two centred against each other. The category's default and the design the rest of it hands off to.

2. **Structural descriptor.** `split · none · page · one · right · half-page image`
   Unique on the five closed slots. 5 Contrast Band shares all but ground, which is the pair A19-0 uses to show what the ground slot is for.

3. **Archetype.** split. No departures; **it supplies the category's default ladder** — two columns to one at 834 with the picture first, one column below.

4. **Responsive rule.** **1440** content 1,296; text 560, gap 100, image 636 × 424 at Landscape; title 34, excerpt 17 at two lines, meta 13, call to action 14. **1080** text 460, gap 72, image 504. **834** one column at 754, **picture above the text at both Media side values**, image height capped at 424 with a centred crop, title 30. **≤ 767** image full width at the set ratio, title 26, excerpt 16 **clamped to one line whatever the control says**, reading time drops from the meta, the date does not, the avatar stays.

5. **Content fields.** Section: five authored, all optional; `eyebrow` defaults to “Featured”, `linkLabel` to “Read the piece”; **`linkUrl` is deleted from the union** ⚑. Data group: all six, Hand-picked included. Post: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `primary_author.profile_image` at Meta With photograph, `reading_time`. Writes `mediaSide`, `ratio`, `titleSize`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Media side** Left · Right. **Ratio** Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5. **Title size** Small · Medium · Large. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time · With photograph. **Tag** Show · Hide. Six of its own, plus the universal trio and the Data group outside the list, in that sidebar order. **Quick: Media side, Ratio, Title size, Excerpt.**

7. **Data.** Ghost's `#get "posts"` at `filter: featured:true` by default, `limit: 1`. **Designed for exactly one post; Count is the stepper, locked at 1 and drawn disabled.** **0 → the section does not render**, unless *When nothing matches* is Show the latest post, in which case the query re-runs without the filter and the eyebrow still reads whatever is authored. **0 in the editor →** the outline plus “No posts are marked featured. Star a post in Ghost, or change Source.” **Many → the first by Order is drawn and the rest are not**; the count line reports both numbers. **Order** Newest first · Oldest first; `shuffle` is not declared here or anywhere in A19.

8. **Empty state.** **No feature image → Reflow**: the image column is removed, the text measure goes 560 → 720, the section is 268 px tall rather than 424, and **no plate is drawn**. No tag → the eyebrow line is the section's “Featured” alone; if that is also absent the title starts the block. No excerpt → nothing drawn, the block is shorter, the columns stay centred. No author photograph at Meta With photograph → A1·6's initials, as drawn in the primary frame. No section fields → the split starts at the top padding.

9. **Behaviour module.** **None**; `core` assumed and never declared per design. **No-JS: pixel-identical.** The split is a flex row, the hover underline is CSS, the whole box is an `<a>`. Edit-safe: nothing animates and the resting state is the only state. `reveal` was considered for the picture and refused — a spotlight that fades in is invisible in the editor and in a screenshot, and the section's whole purpose is to be seen immediately.

10. **Accessibility.** `<section aria-labelledby>`. **With no section title authored the post's title is the `<h2>`; with one it is the `<h2>` and the post steps to `<h3>`** — A19's rule, drawn both ways in this file. One `<a>` wraps image and text; **the call to action is a `<span>` inside it, never a nested link**. DOM order image → tag → title → excerpt → meta → call to action at both Media side values, so the order heard does not change with the layout. `alt` from `feature_image_alt`, empty when absent — never the title. Date a `<time datetime>`; avatar `aria-hidden`. A6's ring on the whole box at 4 px. Contrast 15.46:1 title, 5.56:1 muted light; 15.64:1 and 6.89:1 dark.

**Reconciled.** Padding retired into **Vertical spacing**; **Tag: Show · Hide** added; **`linkUrl`** removed from the sidebar and the union; the Posts block became the **Data group** with **Hand-picked** in Source (ceiling one post here) and **Count as a 1–100 stepper** locked at 1, drawn disabled with its reason; the excerpt binds **`excerpt`** with Ghost's generated fallback. Nothing in the trio is locked. **This design's panel is still the category's reference**, and the three settlements it drew — the disabled Count row, the count line, the fifth query field — all survive the pass under new names.

---

### 2 · Full Bleed

1. **Descriptor.** One featured post whose feature image fills the section edge to edge, with the eyebrow, title, excerpt, meta and call to action set on the picture over a bottom-up scrim of the pack's contrast colour.

2. **Structural descriptor.** `media frame · none · image · one · full-bleed · text on the picture`
   The category's only `image` ground and its only full-bleed placement; unique on both.

3. **Archetype.** media frame. **One departure, and it is total:** the ladder separates overlaid text from its picture below 767 and this design never does, at any width, because the overlay is the design. Height replaces the ladder's stacking step.

4. **Responsive rule.** **1440** picture 1,440 × 620 at Tall; text inset 72 left, 64 bottom, measure 720; title 40, excerpt 17 one line, meta 13. **1080** height 560, inset 56, measure 640. **834** height 520, inset 40, measure 560, title 32. **≤ 767** height 460, inset 20 and 32, title 26, **excerpt dropped whatever the control says**, **scrim steps up one strength**, reading time drops. Height Short is 480 / 440 / 400 / 380 and Full screen is `100dvh` with a 560 floor at every width.

5. **Content fields.** Section: five authored, `linkUrl` deleted; `title` and `sub` **are not drawn by this design** and are the only fields in A19 a design refuses — a section head above a full-bleed picture would sit on the page above the section's own edge. Data group: all six, Hand-picked included. Post: `title`, `url`, `feature_image` **required** + `feature_image_alt`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. **No `primary_tag`** — the eyebrow is the section's. Writes `height`, `textPosition`, `scrim`, `titleSize`, `excerpt`, `meta`.

6. **Controls.** **Height** Short · Tall · Full screen. **Text position** Lower left · Lower centre · Centre. **Scrim** Soft · Medium · Strong, **a value disabled with its measured ratio when it fails on the set image**. **Title size** Small · Medium · Large. **Excerpt** Off · One line · Two lines. **Meta** None · Date only · Name and date · Name, date and reading time. Six of its own, plus the universal trio and the Data group. **No Ratio control** — the picture is cropped to the section, not fitted to a ratio — and **no Tag row**, since no `primary_tag` is read. **Universal: Background role locked at the image ground, Vertical spacing locked as no-effect, Top divider locked None**, each with its reason drawn. **Quick: Height, Text position, Scrim, Title size.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render**; with *When nothing matches* at Show the latest post, **the latest post is used only if it has a feature image**, and if it does not the section still does not render ⚑ — the one place in A19 where the fallback can itself fail, and the panel says so. **0 in the editor →** the outline at Tall plus the standard line. Many → the first by Order.

8. **Empty state.** **No feature image → hand off.** On the site: nothing renders. In the editor: the post's title, the reason, and two buttons — Switch to 1 Split, Keep this design — **and nothing switches itself**. No excerpt → not drawn, the block is 27 px shorter, the inset is unchanged. No author name → the date alone. **No `feature_image_alt` → the `alt` is empty and the picture is decorative**, because the title beside it already carries the meaning.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** The scrim is a gradient, the height is CSS, the crop is `object-fit: cover`. **Considered and refused: `reveal`** (a hero that fades in is a hero nobody photographs) and **`video-facade`** — a featured post's video is A15's business and a poster frame here would need a play affordance the section has no field for. **Parallax was considered and refused outright**: no module covers it, and inventing one is not this pass's licence.

10. **Accessibility.** The picture is a `<img>` inside the anchor, not a CSS background, so it prints and is announced; **the scrim is a sibling `<div aria-hidden>`**. Post title is the `<h2>` — this design never draws a section title, so the level never steps. **Every scrim value is measured against the image's mean luminance at the text box and a failing value is disabled with its ratio**, which is the project's rule 4 applied to a photograph rather than to a colour. A6's ring on the whole picture at a 4 px inset, drawn inside the section because there is no page margin to draw it in ⚑. Reduced motion is not a factor: nothing moves.

**Reconciled.** The trio ships outside the list with **Background role locked at the image ground** (the picture *is* the ground) and **Vertical spacing locked as no-effect** — **Height stays this design's own ladder and is not renamed**, since a section height is not a padding. **Top divider locked None.** **`linkUrl`** removed; the Data group carries **Hand-picked** with a warning on a pictureless pick — the one design whose fallback can itself fail — and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. **No Tag row**: this design reads no `primary_tag`.

---

### 3 · Card

1. **Descriptor.** One featured post on a surface or outlined plane inset 48 px from the content width, its picture held inside the card's 40 px padding at the left and the text at the right, the two centred against each other.

2. **Structural descriptor.** `split · card · surface · one · left · one post on a plane`
   The only `card` containment in A19 apart from 7 Overlap, which differs on ground, count-adjacent slots and media placement.

3. **Archetype.** split. **One departure:** the ladder narrows a split's columns before stacking them, and this stacks at 834 without narrowing, because the card's padding has already taken 80 px out of the content width.

4. **Responsive rule.** **1440** card 1,200 at a 48 inset, padding 40; image 480 × 320, gap 48, text 592; title 34. **1080** card 936 at a 36 inset, image 400, text 460. **834** **inset 0, card 754, padding 32, picture above the text at 690 wide**, title 30. **≤ 767** card at the content width, padding 20, title 26, excerpt clamped to one line, reading time dropped. **The card itself is never dropped** at any width.

5. **Content fields.** Section: the six; the head, when authored, **renders outside the card and suppresses the card's eyebrow**. Data group: all six, Hand-picked included. Post: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag` (eyebrow when no head, and the plate's word when there is no picture), `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. **No `profile_image`**. Writes `card`, `ratio`, `titleSize`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Card** Surface · Outline. **Ratio** Landscape 3:2 · Square 1:1 · Portrait 4:5 — **no Wide 16:9**, which at 480 wide is a 270 px letterbox inside a 400 px card. **Title size** Small · Medium · Large. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide. Six of its own, plus the universal trio and the Data group; **Vertical spacing is the space around the card**, which is what the old Padding row was. **Quick: Card, Ratio, Title size, Excerpt.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render and the card goes with it**; an empty card is a hole with a border around it. **0 in the editor →** the card's outline at its set ratio plus the standard line. **1 → the design's designed case.** Many → the first by Order; the count line reports both. **This design is the strongest in A19 at exactly one post** and the panel says so, because a container is a claim that what is inside it is complete.

8. **Empty state.** **No feature image → Plate**: A17's tag plate at the image box, `#F4F0E8` light and `#2A251E` dark, the primary tag centred at 13 px uppercase, `aria-hidden`, **capped at 320 px tall** so Portrait and Square fall back to Landscape's box. **Untagged and no picture → the plate is drawn empty**, never with the date or the author's name. No excerpt → the card is shorter and the picture sets its height. No tag and a head authored → no eyebrow line at all.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. **Considered and refused: A17·4's hover lift** — not a module, but the same argument: a transform on a section-sized plane is motion the reader did not ask for, and the category's hover state is the title underline.

10. **Accessibility.** The card is a `<div>` and the anchor is inside it, wrapping picture and text; **the card's own padding is not part of the link target**, so the ring sits inside the card at a 4 px offset and does not cross its edge. Head authored → head title `<h2>`, post `<h3>`; no head → post `<h2>`. Plate `aria-hidden` and its tag repeated in the eyebrow, so nothing is announced twice and nothing is lost. Contrast on surface 16.1:1 title, 5.8:1 muted light; 14.9:1 and 6.4:1 dark. **Outline in dark measures the same as Surface**, which is the argument for it.

**Reconciled.** Padding retired into **Vertical spacing** — it was already labelled “the space around the card”, which is the same ladder. **Tag: Show · Hide** added, and **at Tag Hide with no picture the plate is drawn empty rather than dropped** ⚑, because the card's geometry needs the box. **`linkUrl`** removed; the Data group carries **Hand-picked** (one post) and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. At Background role Surface the card takes its outline value, disclosed rather than disabled.

---

### 4 · Poster

1. **Descriptor.** One featured post in a narrow centred column: the feature image at the column's full width in a portrait crop, the eyebrow, title, excerpt, author photograph and call to action beneath it, centred.

2. **Structural descriptor.** `media frame · none · page · one · top · portrait crop, centred column`
   Unique on the closed slots; the only `top` placement at count `one` in the category.

3. **Archetype.** media frame. **No departures** — picture above text is already the ladder's terminal state, so the design is drawn in its collapsed form at every width and only the column's width changes.

4. **Responsive rule.** **1440** column 560 centred in 1,296; image 560 × 700 at Portrait; gap 28; title 34, excerpt 17, meta 13 with a 24 px avatar. **1080** unchanged at Narrow; Wide clamps to 936. **834** Narrow unchanged at 560 in 754; **Medium and Wide clamp to the content width and converge**, disclosed in the panel; title 30. **≤ 767** column is the content width, image 350 × 438, title 26, excerpt 16 clamped to one line, reading time dropped, avatar kept. **Alignment is ignored below 767** — a full-width column has nowhere to move to.

5. **Content fields.** Section: the six; **the eyebrow joins the post's tag with a middle dot** ⚑, either half falling away when absent. Data group: all six, Hand-picked included. Post: `title`, `url`, `feature_image` **required** + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author` including `profile_image`, `reading_time`. Writes `columnWidth`, `ratio`, `alignment`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Width** Narrow · Medium · Wide. **Ratio** Portrait 4:5 · Square 1:1 · Landscape 3:2. **Alignment** Centred · Flush left. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time · With photograph. **Tag** Show · Hide — at Hide the eyebrow is the section's word alone. Six of its own, plus the universal trio and the Data group. **No Title size** — the column is the variable and 34 is the only size that holds at all three widths. **Quick: Width, Ratio, Alignment, Meta.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render**; at Show the latest post **the fallback applies only if that post has a picture**, as in 2 Full Bleed. **0 in the editor →** the column's outline at the set ratio plus the standard line. Many → the first by Order.

8. **Empty state.** **No feature image → hand off to 1 Split**, offered in the editor with both buttons, absent on the site. No tag → the eyebrow is “Featured” alone. No excerpt → the block is 54 px shorter and the gap under the picture is unchanged. No author photograph → initials. **No author at all → the meta line is the date, and the avatar is not reserved**.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `lightbox` was considered — a poster-sized picture invites enlargement — **and refused: the picture is a link to the post, and a lightbox would make the largest target on the page go somewhere other than the piece it is advertising.**

10. **Accessibility.** One `<a>` around picture and text; DOM order image → eyebrow → title → excerpt → meta → call to action. Head authored → head `<h2>` above the column and the post steps to `<h3>`; otherwise the post's title is the `<h2>`. **The eyebrow's two halves are one string with the dot as text**, so it is read as one label rather than as two. Avatar `aria-hidden`, the name beside it carries the meaning. **Centred text is kept to the title, excerpt and meta and never applied to a run longer than three lines** — at Excerpt Three lines the panel warns rather than disabling. Contrast as 1 Split.

**Reconciled.** Padding retired into **Vertical spacing**; **Tag: Show · Hide** added, governing the tag half of the middle-dot eyebrow, the section's own word surviving alone at Hide; **`linkUrl`** removed; the Data group carries **Hand-picked** (one post, warned when it has no picture) and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. **Image focus is named as the post's** — a 4:5 crop is the most destructive in the category and the focal point is set in Ghost.

---

### 5 · Contrast Band

1. **Descriptor.** 1 Split's two-column arrangement on the pack's contrast ground, full bleed or inset to the content width, with every on-band value derived from the band's own two colours.

2. **Structural descriptor.** `split · none · contrast · one · right · inverted band`
   Differs from 1 Split on ground alone, which is exactly what the ground slot exists to record.

3. **Archetype.** split. No departures; it inherits 1 Split's ladder without change.

4. **Responsive rule.** As 1 Split at every width — **1440** 560 · 100 · 636 × 424; **834** one column, picture above; **≤ 767** title 26, excerpt clamped to one line, reading time dropped. **Two departures:** band padding is **80 at Compact and stays 80 at 834**, and **Band edge Inset is ignored below 767**, both disclosed in the panel.

5. **Content fields.** Identical to 1 Split's, minus `profile_image`: **Meta has no With photograph value here**, because a 24 px avatar on a dark band needs a derived ring to be visible and that is a fourth derivation for one small circle. Writes `band`, `mediaSide`, `ratio`, `titleSize`, `excerpt`, `meta`, `tag`. **`ratio` is written now** ⚑ — it was refused, and the refusal is overruled in this pass.

6. **Controls.** **Band edge** Full bleed · Inset. **Media side** Left · Right. **Ratio** Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 — **new in this pass** ⚑, the refusal overruled. **Title size** Small · Medium · Large. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide. Seven of its own, plus the universal trio and the Data group. **Universal: Background role locked at Contrast, Top divider locked None; Vertical spacing resolves 80 · 96 · 132 here** — this row's resolution, not a second ladder. **Quick: Band edge, Ratio, Title size, Excerpt.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render and the band goes with it** — the strongest case for the category's hide rule, since an empty band is a coloured stripe with nothing in it. **0 in the editor →** the band drawn at 30% opacity with the standard line on it ⚑, the one editor state in A19 that is not an outline, because an outline on a dark band is invisible. Many → the first by Order.

8. **Empty state.** **No feature image → Plate**, at the derived `#322F28` with the tag in the derived muted, capped at 320 px tall. **This design plates where 1 Split reflows** and the panel states the difference, because switching between the two is a one-click move and the behaviour changes under the user. No excerpt → the block is shorter, the columns stay centred. No tag and no picture → the plate is empty.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `mode-toggle` is **not** declared here and must not be: the band inverting with the page is CSS reading `prefers-color-scheme`, which FR-E4 says works with JavaScript off.

10. **Accessibility.** As 1 Split, plus the band's own numbers. **Light mode on `#232019`: title 15.9:1, derived muted 6.9:1, lifted accent 5.9:1.** **Dark mode on `#EDE7DA`: title 16.4:1, derived muted 5.4:1, accent 4.7:1.** **The focus ring uses the lifted accent on the band in both modes** and is the fourth derived value; it measures 5.9:1 light and 4.7:1 dark against the band, above the 3:1 a non-text indicator needs. Print: renders as 1 Split on white.

**Reconciled.** **Ratio added** with 1 Split's four values, its Landscape default and its Portrait-at-Title-Large warning. The old argument survives as advice rather than as a refusal: a band is a horizontal object, and 795 px of picture inside a stripe turns an interruption into a chapter — but **this design and 1 Split differ on ground alone, and a one-click switch must not silently discard a value the union already holds**. The plate follows the ratio at its 320 px cap. Padding retired into **Vertical spacing**, resolving 80 · 96 · 132 on this ground; **Background role locked at Contrast** and **Top divider locked None**, both with the reason drawn; **Tag: Show · Hide** added; **`linkUrl`** removed; the Data group carries **Hand-picked** and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. **A new states strip on the frame draws the band at Wide, Square and Portrait.**

---

### 6 · Big Type

1. **Descriptor.** One featured post as type alone: eyebrow, hairline, the title at 52–72 px on an 1,100 px measure, the excerpt at 20 on 720, meta and call to action. No image at any setting.

2. **Structural descriptor.** `stack · none · page · one · none · title at display size`
   Shares four slots with 13 Quote and separates on ground; the two are A19's pair of text-only spotlights.

3. **Archetype.** stack. No departures. **Its ladder is a type scale rather than a layout change**, which is the simplest collapse in the category.

4. **Responsive rule.** **1440** rule 1,296; title measure 1,100 at 52 / 64 / 72; excerpt 20 on 720; meta 13. **1080** title 44 / 52 / 58 on 936, excerpt on 660. **834** title 40 / 48 / 54 on 754, excerpt 19 on 620. **≤ 767** title 32 / 36 / 40 on the content width, excerpt 17 clamped to one line, reading time dropped. **Line height tightens as size grows** — 1.10 / 1.06 / 1.04 — at every width. At Alignment Centred both measures narrow by 200 and 100 respectively; the hairline never narrows.

5. **Content fields.** Section: the six; the eyebrow joins the post's tag with a middle dot as in 4 Poster. Data group: all six, Hand-picked included. Post: `title`, `url`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. **Reads no `feature_image` and no `profile_image`** — the shortest read list in A19. Writes `titleSize`, `alignment`, `rule`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Title size** Small 52 · Medium 64 · Large 72. **Alignment** Flush left · Centred. **Rule** Off · Above · Above and below — **the hairline inside the section**, distinct from the universal Top divider, which draws above it. **Excerpt** Off · One line · Two lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide. Six of its own, plus the universal trio and the Data group. **No image control of any kind**, which is the design. **Quick: Title size, Alignment, Rule, Excerpt.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render**; **at Show the latest post this design's fallback can never fail**, because it needs no picture — the only design in A19 of which that is true, and the panel says so as advice for sites that want a guaranteed section. **0 in the editor →** a rule and two grey title lines plus the standard message. Many → the first by Order.

8. **Empty state.** **No feature image is not a case** — nothing reads it. No tag → the eyebrow is “Featured” alone; both absent → no eyebrow line, and at Rule Above the hairline moves to the top of the block. No excerpt → the title sits directly above the meta with 22 px between them. No author → the date alone. **Everything this design can lose leaves it composed**, which is why seven other designs point at it.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. **Considered and refused: `typewriter`** — the registry has it and a 64 px title is exactly what it is for, and it is refused because **the title is a link to a post rather than a slogan**, and a link whose text is still arriving cannot be clicked. Named here rather than passed over silently, since it is the one design in A19 a reader might expect it on.

10. **Accessibility.** The post's title is the `<h2>` unless a section title is authored, in which case it steps to `<h3>` — and **the panel discourages authoring one here**, since a 34 px section title above a 64 px post title is the two-headline failure the category's head rule exists to prevent. The whole block is one `<a>`; the rule is a `border-top` on the block, not a separate element. **At 72 px the focus ring is drawn at a 6 px offset rather than 4** ⚑, because a 4 px ring against display type reads as an underline. Contrast 15.46:1 title, 5.56:1 muted light; 15.64:1 and 6.89:1 dark.

**Reconciled.** Padding retired into **Vertical spacing**; **Rule is kept as a distinct control** — it draws inside the section where Top divider draws above it — and **the panel warns when Rule Above meets Top divider Line** ⚑ rather than disabling either. **Tag: Show · Hide** added; **`linkUrl`** removed; the Data group carries **Hand-picked** and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. **This is the design a site should hand-pick into when its featured posts have no pictures** — it is the one whose fallback can never fail.

---

### 7 · Overlap

1. **Descriptor.** One featured post: a 16:9 picture at the content width or full bleed, with a 560 px surface card overlapping its lower edge by 64 px, inset 48 from the picture's left, right or centred.

2. **Structural descriptor.** `media frame · card · page · one · background · card overlapping the image`
   The only `background` media placement in A19 — the picture is behind the section's content rather than beside it.

3. **Archetype.** media frame. **One departure:** the ladder keeps overlaid content overlaid; this releases the overlap below 767 and stacks card under picture with a 16 px gap.

4. **Responsive rule.** **1440** picture 1,296 × 486; card 560, inset 48, overlap 64, padding 32; title 34. **1080** picture 936 × 527, card 520, inset 40. **834** picture 754 × 424, card 520, inset 32, padding 28, **excerpt dropped**, title 30. **≤ 767** **no overlap**: picture 350 × 197, card at the full content width 16 px below it, padding 20, title 26. **The overlap is 64 at every width it exists at.**

5. **Content fields.** Section: the six; **the head, when authored, sits above the picture** and suppresses the card's eyebrow, as in 3 Card. Data group: all six, Hand-picked included. Post: `title`, `url`, `feature_image` **required** + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. Writes `cardPosition`, `imageWidth`, `titleSize`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Card position** Lower left · Lower right · Centred. **Image width** Content · Full bleed. **Title size** Small · Medium · Large (disabled — 40 px overflows the card). **Excerpt** Off · One line · Two lines · Three lines, **drawn one line shorter**. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide. Six of its own, plus the universal trio and the Data group. **No Ratio control** (16:9 only) and **no overlap control** (64 only). **Quick: Card position, Image width, Excerpt, Meta.**

7. **Data.** As 1 Split: `featured:true`, `limit: 1`, **Count the stepper, locked at 1 and drawn disabled.** **0 → the section does not render.** At Show the latest post the fallback applies only if that post has a picture, as in 2 Full Bleed and 4 Poster. **0 in the editor →** the picture's outline with the card's outline over it, plus the standard line. Many → the first by Order.

8. **Empty state.** **No feature image → hand off to 3 Card**, offered with both buttons, absent on the site. No excerpt → the card is 27 px shorter and the overlap is unchanged. No tag → the card's eyebrow is “Featured” alone. **No `feature_image_alt` → empty `alt`**; the card carries the meaning.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** The overlap is a negative margin, not a transform, so it survives with JavaScript off and inside a print stylesheet. Edit-safe. **Considered and refused: `reveal` on the card** — a card that slides up over a picture is the most tempting animation in the category and the one that would most obviously not run while editing.

10. **Accessibility.** One `<a>` wrapping picture and card; **the card is inside the anchor, not a sibling**, so the whole composition is one target and there is no dead zone between them. DOM order image → eyebrow → title → excerpt → meta → call to action. **A6's ring is drawn around the union of picture and card** ⚑ — an L-shaped bounding box, rendered as the anchor's own outline at a 4 px offset, which the browser computes correctly because the card is a child rather than an overlay. Post title `<h2>`, or `<h3>` under an authored head. Contrast as 3 Card on surface.

**Reconciled.** Padding retired into **Vertical spacing**, the 64 px overlap still not a control; **Tag: Show · Hide** added on the card's eyebrow; **`linkUrl`** removed; the Data group carries **Hand-picked** (one post, warned when pictureless) and **Count as a stepper** locked at 1; the excerpt binds **`excerpt`**. **Image focus is the post's, and Top is the value most of these crops want** — the card covers the picture's lower corner. At Image width Full bleed the panel notes that a Top divider Line draws on the section above.

---

### 8 · Lead and Two

1. **Descriptor.** A spotlight on 848 with its picture at the leading edge and its text beside it, and two text-only followers stacked in a 424 px column at the right, separated by a hairline. Hierarchy by size alone: 34 against 20.

2. **Structural descriptor.** `grid-of-N · none · page · few · left · lead outsized against two`
   Separates from 9 Alternating on archetype and media placement, and from 11 Lead and Rail on count class and archetype.

3. **Archetype.** grid-of-N. **One departure:** the ladder steps a grid down one column per breakpoint; this goes from two unequal columns straight to one at 834, because a 424 column and an 848 column have no intermediate state.

4. **Responsive rule.** **1440** 848 · 24 · 424; lead 320 · 24 · 504, picture 320 × 213; lead title 34, follower 20. **1080** 636 · 24 · 300; lead picture drops to 240 wide. **834** one column: **lead as 1 Split stacked, picture above at 754 × 424; followers as full-width A18 rows, ruled above each, titles 21**; Divider Column rule falls back to Between followers. **≤ 767** lead title 26, follower titles 19, **follower eyebrows dropped**, reading time dropped everywhere.

5. **Content fields.** Section: the six. Data group: all six, **Count the stepper at min 1 · max 3**. Lead: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. Followers: `title`, `url`, `primary_tag`, `published_at`, `primary_author.name` — **no image and no excerpt, ever**. Writes `leadRatio`, `divider`, `titleSize`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Lead ratio** Landscape 3:2 · Square 1:1 · Wide 16:9. **Divider** Off · Between followers · Column rule. **Title size** Small · Medium · Large, **lead only**. **Excerpt** Off · One line · Two lines · Three lines, **lead only**. **Meta** None · Date only · Name and date · Name, date and reading time, **all three posts together**. **Tag** Show · Hide, all three together. Six of its own, plus the universal trio and the Data group. **No follower-image control** — that is the design. **Quick: Lead ratio, Divider, Excerpt, Meta.**

7. **Data.** `featured:true` at `limit: 2` or `3`. **Designed for 3; correct at 1, 2 and 3.** **0 → the section does not render.** **1 → the lead alone, keeping its 848**, the right-hand 448 left as page, and the panel advising 1 Split without switching. **2 → lead and one follower, no rule drawn.** **More featured than Show → the extras are not drawn** and the count line reports it. Order decides which post leads; there is no lead picker.

8. **Empty state.** **Lead without a picture → Reflow**: text to 720 inside the 848 column, followers unchanged, no plate. **Follower without a tag → the eyebrow line is not drawn and the entry is 21 px shorter**; entries are never equalised. Follower without an author at Meta Name and date → the date alone. No excerpt on the lead → the lead is shorter and the columns stay top-aligned. **Both followers untagged → the column is titles and dates, which is 11 Lead and Rail's rail at a larger size** and is noted rather than corrected.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `shuffle` is refused with the rest of the category — a rotating lead is the single most requested behaviour a featured section will get asked for, and A19-0 records the refusal and its reason.

10. **Accessibility.** **Three anchors, three focus stops, in DOM order lead → follower 1 → follower 2**, which matches the visual order at every width. The section is a `<div>` holding the lead and a `<ul>` of two `<li>` followers ⚑ — **the lead is not in the list**, because a list of three whose first item is four times the size of the others misdescribes the section. Head `<h2>`; all three post titles `<h3>`. Follower entries are 68 px and 89 px tall, above the 44 px touch floor. Contrast as 1 Split.

**Reconciled.** Padding retired into **Vertical spacing**; **Tag: Show · Hide** added, governing the lead's eyebrow and both followers' together; **`linkUrl`** removed; **Count is the stepper at min 1 · max 3** in place of the 2 · 3 enum — beyond three the section is a list, and A18 is one click away with the query preserved. **Hand-picked takes up to three posts and makes the lead choosable** ⚑, which is the one thing this design could not do: “Order decides which post leads; there is no lead picker” is now “Order decides, unless you pick”. The Oldest-first advisory is deleted. The excerpt binds **`excerpt`** on the lead.

---

### 9 · Alternating

1. **Descriptor.** Two or three spotlights stacked as full-width bands, 672 picture and 560 text with a 64 px gutter, vertically centred against each other, the picture's side swapping on every band. No ranking: every band is the same size.

2. **Structural descriptor.** `stack · none · page · few · left · alternating full-width bands`
   Separates from 8 Lead and Two on archetype — a stack of equals against a grid with a lead — and from 10 Pair on archetype and media placement.

3. **Archetype.** stack. **One departure:** the ladder narrows a stack in place; this one also drops its alternation at 1080 and puts every picture above its text, because two 336 px halves is a thumbnail beside a paragraph.

4. **Responsive rule.** **1440** 672 · 64 · 560 across 1,296; band gap 96; title 34, excerpt 17. **1080** 528 · 48 · 456; title 34 held. **834** one column, picture above text at 754 wide, text measure 620, title 30, band gap 40 **and a hairline between bands whatever Divider says**; Starts is greyed with “No effect below 1080”. **≤ 767** picture 350 wide, title 26, excerpt 16, band gap 32, reading time dropped; eyebrows kept.

5. **Content fields.** Section: `eyebrow`, `title`, `sub`, `note`, `linkLabel` — all optional; **`linkUrl` deleted from the union** ⚑. Data group: `source` (Hand-picked included), `filterValue`, `pickedPosts`, `count` **the stepper at min 1 · max 3**, `order`, `fallback`. Per band: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. **No `profile_image`** — a face beside a 672 px photograph is a second picture. Writes `ratio`, `mediaSide`, `divider`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Ratio** Landscape 3:2 · Wide 16:9 · Square 1:1. **Starts** Picture left · Picture right. **Divider** Off · Between bands. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide, every band together. Six of its own, plus the universal trio and the Data group; **the 96 between bands is still not exposed** ⚑. **⚑ No Title size**, fixed at 34; **⚑ no Portrait 4:5**, the one rung of A8's ladder A19 drops. **Quick: Ratio, Starts, Excerpt, Meta.**

7. **Data.** `featured:true` at `limit: 2` or `3`, ordered by `published_at`. **Designed for 3; correct at 2.** **0 → the section does not render** unless `fallback` is Show the latest post, which draws one band. **1 → one band, drawn at full size**, and the panel says “1 post is featured. This design is composed for 2 or 3 — 1 Split draws one post better” and switches nothing. **More featured than Show → the extras are not drawn** and the count line reports it. **Order is selectable from Newest first · Oldest first only**; no hand-ordering exists on `featured`, and there is no Add or Remove anywhere in the panel.

8. **Empty state.** **Band without a picture → Reflow**: text to 720 at the band's leading edge whichever side its turn was, no plate, the alternation of the remaining bands unchanged. **Band without an excerpt → 41 px shorter, nothing equalised**; the picture still sets the height. **Band without a tag → the eyebrow line is not drawn** and the text block starts at the title. No author at Meta Name and date → the date alone. **Every band missing its picture → three reflowed bands**, which is a stack of headlines and is noted rather than corrected; 12 Picks is the design for that content.

9. **Behaviour module.** **None**; `core` assumed and never declared per design. **No-JS: pixel-identical** — the section is markup, tokens and a media query. Edit-safe, since nothing runs. `reveal` was considered for the bands and refused with the category.

10. **Accessibility.** `<section aria-labelledby>` holding an `<ul>` of two or three `<li>` bands — **a list is right here where it was wrong in 8**, because the bands are equals. Head `<h2>`, band titles `<h3>`; with no head authored the first band's title becomes the `<h2>` and the rest stay `<h3>`. **One anchor a band, three focus stops, DOM order matching reading order at every width** — the swap is `flex-direction: row-reverse` on even bands, never a reordered DOM. Dates are `<time datetime>`. Focus is A6's ring on the whole band at a 4 px offset; hover is the title's 2 px accent underline at 160 ms.

- **Flagged ⚑** — the 672 · 64 · 560 division; centring rather than top-aligning; a reflowed band starting at the leading edge; no Title size; no Portrait 4:5; the hairline drawn at 834 whatever Divider says; Starts greyed rather than hidden below 1080; Padding not touching the 96 between bands.


**Reconciled.** Padding retired into **Vertical spacing**, the 96 between bands still unexposed; **Tag: Show · Hide** added, every band together; **`linkUrl`** removed; **Count is the stepper at min 1 · max 3** in place of the 2 · 3 enum; **Hand-picked takes up to three and gives the stack a running order** ⚑ — “no hand-ordering exists on `featured`” was true of the query and is no longer true of the section. The Oldest-first advisory is deleted; the excerpt binds **`excerpt`**.

---

### 10 · Pair

1. **Descriptor.** Two featured posts as equal 636 px halves with a 24 px gutter, picture on top of each, titles from 28, both cells carrying the call to action. No lead, no ranking, and the count fixed at two.

2. **Structural descriptor.** `split · none · page · few · top · two halves at equal weight`
   Separates from 1 Split and 5 Contrast Band on count class and ground, from 11 Lead and Rail on count class and emphasis, and from 9 Alternating on archetype and media placement.

3. **Archetype.** split. **No departure** — the ladder takes a split to one column at 834 and this design does exactly that. It is the plainest collapse in the category.

4. **Responsive rule.** **1440** 636 · 24 · 636 across 1,296; picture 636 × 358 at 16:9; title 28, excerpt 17 two lines. **1080** 480 · 24 · 480; title 28 held; excerpt clamps a line earlier. **834** one column, both cells full width at 754, **a horizontal hairline between them whatever Divider says**, Column rule falling back to it; title 28, gap 40. **≤ 767** picture 350 wide, title 26, excerpt 16, gap 32, reading time dropped. **Plates survive every width.**

5. **Content fields.** Section: `eyebrow`, `title`, `sub`, `note`, `linkLabel`, all optional; **`linkUrl` deleted from the union** ⚑. Data group: `source` (Hand-picked included), `filterValue`, `pickedPosts`, `count` **the stepper, locked at 2**, `order`, `fallback`. Per cell: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. No `profile_image`. Writes `ratio`, `titleSize`, `excerpt`, `meta`, `divider`, `tag`.

6. **Controls.** **Ratio** Wide 16:9 · Landscape 3:2 · Square 1:1 · Portrait 4:5. **Title size** Small 28 · Medium 34 · Large 40, both cells together. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Divider** Off · Column rule. **Tag** Show · Hide, both cells together. Six of its own, plus the universal trio and the Data group. **Count is present, greyed and locked at 2** ⚑ — drawn rather than hidden, with the reason and the design to switch to. **Quick: Ratio, Title size, Excerpt, Divider.**

7. **Data.** `featured:true` at `limit: 2`. **Designed for exactly 2.** **0 → the section does not render** unless `fallback` is Show the latest post, which draws one cell. **1 → the left cell alone at 636, the right half left as page**, the panel advising 1 Split and switching nothing. **More than 2 featured → the first two in query order are drawn** and the count line reports “5 posts are featured. 2 drawn.” **Order is selectable from Newest first · Oldest first and decides left and right**; there is no swap control, no lead picker, and no Add or Remove.

8. **Empty state.** **Cell without a picture → Plate**, A17's: hover-surface fill at the picture's exact ratio, the post's tag centred in 13 px muted capitals, `aria-hidden`. **Untagged and pictureless → the plate is empty**, never filled with a glyph or the publication name. Cell without an excerpt → shorter cell, no equalisation, the picture and the title's first line still aligned. No author at Meta Name and date → the date alone. **Both cells pictureless → two plates**, which is honest and ugly, and the panel suggests 12 Picks.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe.

10. **Accessibility.** `<section aria-labelledby>` holding a `<ul>` of two `<li>` cells — equals, so a list. Head `<h2>`, both titles `<h3>`; with no head authored the first cell's title becomes the `<h2>`. **Two anchors, two focus stops, left then right**, matching DOM order at every width. The call to action is a `<span>` inside each anchor, so **two cells with two actions are still two tab stops.** Dates `<time datetime>`. Focus is A6's ring on the whole cell at a 4 px offset; hover is the title's 2 px accent underline at 160 ms. Contrast as 1 Split.

- **Flagged ⚑** — Title size starting at Small 28 rather than the category's Medium 34; plate rather than reflow, and the rule that side-by-side designs plate; the locked Show row drawn and disabled; the plate surviving to 390; the hairline at 834 whatever Divider says.


**Reconciled.** Padding retired into **Vertical spacing**; **Tag: Show · Hide** added, both cells together; **`linkUrl`** removed; **the locked Show row became the locked Count stepper** — same convention, one control, and the component named in Block 1 is unchanged in everything but its name. **Hand-picked takes exactly two and is the only way to say which post is on the left** ⚑: “Order decides left and right; there is no swap control” now has an alternative that is not a swap control either. The excerpt binds **`excerpt`**.

---

### 11 · Lead and Rail

1. **Descriptor.** A spotlight on 848 with its picture above its text, and every other post the query returned as a ruled rail of 18 px titles in the 424 beside it. The rail carries no pictures and no excerpts; it grows and shrinks with the count while the lead stays the same size.

2. **Structural descriptor.** `split · none · page · variable · top · lead beside a titles rail`
   The only `variable` in A19. Separates from 8 Lead and Two on archetype, count class and media placement, and from 10 Pair on count class and emphasis.

3. **Archetype.** split. **One departure:** the ladder collapses a split to one column at 834 and this design does that, but the rail does not become a stack of the same thing — **it becomes A18's dated rows with the date to the right of the title**, which is a different row from the column entry it was.

4. **Responsive rule.** **1440** 848 · 24 · 424 (Narrow: 928 · 24 · 344); lead picture 848 × 477 at 16:9, lead text held to 720, lead title 34; rail titles 18, entries 48/68/89 px by Rail detail. **1080** 636 · 24 · 300, rail titles 17. **834** one column: lead full width at 754 with the picture above, **rail as full-width ruled rows, titles 19, date to the right of the title**, Rail width greyed with “No effect below 1080”. **≤ 767** lead title 26, rail titles 18, **date returns beneath the title**, reading time dropped, all rail entries kept.

5. **Content fields.** Section: the six, **`linkUrl` deleted from the union** ⚑. Data group: all six, **`count` the stepper at min 1 · max 8**. Lead: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. Rail: `title`, `url`, `published_at`, `primary_tag` — **never `feature_image`, never `custom_excerpt`, never an author**. Writes `ratio`, `columnWidth`, `railDetail`, `railHeading`, `excerpt`, `meta`; reads the authored `railLabel`.

6. **Controls.** **Ratio** Wide 16:9 · Landscape 3:2 · Square 1:1. **Rail width** Narrow · Standard. **Rail detail** Title only · Title and date · Title, date and tag. **Rail heading** Hidden · Shown — **new in this pass** ⚑, drawing the authored `railLabel` above the rail at eyebrow size. **Excerpt** Off · One line · Two lines · Three lines, lead only. **Meta** None · Date only · Name and date · Name, date and reading time, lead only. Six of its own, plus the universal trio and the Data group. **No rail-side control** — the rail is always right. **Quick: Ratio, Rail detail, Rail heading, Excerpt.**

7. **Data.** `featured:true` at `limit: 3` or `5`. **Designed for 5; correct at 3, 2 and 1.** **0 → the section does not render** unless `fallback` is Show the latest post, which draws the lead with no rail. **1 → the lead alone at 848, no rail, the right 424 left as page**; the panel advises 1 Split and switches nothing. **2 → a rail of one entry with no rules**, which is the design at its thinnest and still composed. **More featured than Show → the extras are not drawn**, the count line reports it, and there is no “more” link. Order selectable from Newest first · Oldest first; **the first post in that order leads and the rest fill the rail in the same order**. No Add, no Remove, no lead picker.

8. **Empty state.** **Lead without a picture → Plate**, A17's, at the ratio's exact size, tag centred in muted capitals, `aria-hidden`; never a reflow, because the rail is beside it. **Lead without an excerpt → shorter lead, rail unchanged.** **Rail entry without a tag at Title, date and tag → no eyebrow line, entry 21 px shorter, nothing equalised.** Rail entry titles are never clamped or truncated, at any width. No head authored → the lead's title becomes the `<h2>`.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `load-more` was considered for the rail and refused: the rail is bounded by `count`, not paginated, and a featured set is not an archive.

10. **Accessibility.** `<section aria-labelledby>`; the lead is a `<div>` and the rail a `<ul>` — **the lead is not in the list**, as in 8. Head `<h2>`, lead title `<h3>`, rail titles `<h3>` — **the rail is smaller, not lower in the outline.** **⚑ Closed in this pass: the rail's name is the authored field `railLabel`** — default “More featured posts”, ≤ 26 characters, inline-editable. At **Rail heading Hidden**, the category's default, it is spent on the `<ul>`'s `aria-label` and nothing is drawn; at **Shown** it is drawn above the rail at eyebrow size and the `aria-label` is dropped, because a visible heading names the list. Emptying the field at Shown hides the heading and restores the default on the label, so **the rail is never nameless**. Five anchors at Show 5, DOM order lead → rail top to bottom. Dates `<time datetime>`. Focus A6's ring at 4 px offset; hover the 2 px accent underline at 160 ms.

- **Flagged ⚑** — plate rather than reflow on the lead; the rail top-aligned and never stretched; Rail width as two values only; Show at 3 · 5 with no 4 — **closed in this pass**: Count is a stepper, min 1 · max 8; the date moving to the right of the title at 834 and back beneath it at 390; the invented `aria-label`; no “more” link.


**Reconciled.** Padding retired into **Vertical spacing**; **the invented rail `aria-label` became the authored `railLabel`** with **Rail heading: Hidden · Shown**, Hidden by default so nothing drawn changes; **`linkUrl`** removed; **Count is the stepper at min 1 · max 8**, which finally reaches 4 — the old 3 · 5 with no 4 was the flagged gap — and caps where the rail passes the height of the lead at Rail detail's tallest value. **Hand-picked takes up to five, the first pick leading and the rest filling the rail in picked order.** The excerpt binds **`excerpt`** on the lead. **No Tag row was added here**: the eleven named in the pass exclude this design, Rail detail governs the rail, and **the lead's own tag eyebrow still has no control** — recorded in the Reconciliation notes rather than resolved by inventing a twelfth row.

---

### 12 · Picks

1. **Descriptor.** Three or five featured posts as a ruled numbered feed: a zero-padded ordinal in a 96 px left column at the muted token, the tag, title and one line of excerpt on 720, the meta right-aligned to the content edge. No pictures at any setting and no call to action on a row.

2. **Structural descriptor.** `feed · none · page · few · none · ordinal-led picks`
   The only `feed` in A19. Separates from 6 Big Type and 13 Quote on archetype and count class, and from 14 Slim on archetype, ground and count class.

3. **Archetype.** feed. **One departure:** the ladder keeps a feed's row structure at every width; this one dissolves its left column below 767 and puts the ordinal above the title, because a 64 px column on a 350 px row costs the title a fifth of its measure.

4. **Responsive rule.** **1440** 96 · 32 · 720 with the meta right-aligned to 1,296; numeral 40, title 28, excerpt 17 one line, rows 28 px padded. **1080** numeral column 72, **meta moves under the excerpt**, **Numeral Large caps to 34**. **834** as 1080; title 24, text block flexes to the row. **≤ 767** **no left column — ordinal above the title at 24**, title 22, excerpt 16, eyebrow dropped, reading time dropped, rows 18 px padded.

5. **Content fields.** Section: the six, **`linkUrl` deleted from the union** ⚑ and **`linkLabel` unread as well** ⚑ — the one design in A19 that draws no call to action, so the label has nothing to label. Data group: all six, **`count` the stepper at min 1 · max 10**. Per pick: `title`, `url`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. **`feature_image` is never read**, which is unique in the category. Writes `numeralSize`, `rowDensity`, `divider`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Numeral size** Small · Medium · Large (28/40/56 in a 64/96/128 column). **Row density** Compact · Comfortable · Spacious — the space inside a row, kept distinct from the universal Vertical spacing. **Divider** Off · Between picks. **Excerpt** Off · One line · Two lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide. Six of its own, plus the universal trio and the Data group. **No Ratio, no Title size** — the first because there is no picture, the second because Numeral size is this design's scale. **Quick: Numeral size, Row density, Divider, Excerpt.**

7. **Data.** `featured:true` at `limit: 3` or `5`. **Designed for 5; correct at 3, 2 and 1** — nothing about a row changes with the count. **0 → the section does not render** unless `fallback` is Show the latest post, which draws one pick numbered 01. **1 → one row, still numbered 01, not promoted**; the panel advises 6 Big Type or 14 Slim and switches nothing. **More featured than Show → the extras are not drawn** and the count line reports it. **At a query Source the numerals are positions in the order and not a ranking**, and the panel says which; **at Source: Hand-picked the picked order *is* the ranking** ⚑ and the panel says that instead. **The old advisory line under Order is deleted** — it existed because the feature was missing. No Add, no Remove.

8. **Empty state.** **Pick with no excerpt → the row is 27 px shorter** and nothing is padded or equalised. **Pick with no tag → no eyebrow line**, the row starts at the title, 21 px shorter. No author at Meta Name and date → the date alone. **A pick has no picture to miss, so the category's plate and reflow rules do not apply here at all** — the reason this design is the panel's recommendation when a site's featured posts have no images. Head absent → the first pick's title is the `<h2>` and the rest stay `<h3>`.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `count-up` was considered for the numerals and refused — a counting ordinal implies a score, and the ordinals are positions.

10. **Accessibility.** `<section aria-labelledby>` holding an `<ol>` — **the only ordered list in A19**, and it is correct here because the order is the content. `list-style: none` with **the drawn numeral `aria-hidden`**, so the position is announced once rather than twice. Head `<h2>`, pick titles `<h3>`. One anchor a row wrapping the whole row, five focus stops, DOM order matching visual order at every width. Rows are 96–124 px tall, above the 44 px floor. Dates `<time datetime>`. Focus A6's ring at 4 px offset; hover the title's 2 px accent underline at 160 ms. **Muted 40 px numeral on the page ground is 6.4:1 in light and 8.1:1 in dark**, above AA at any size.

- **Flagged ⚑** — zero-padded two-digit ordinals; the ordinal as query position with the fixed advisory line under Order; no call to action, leaving `linkLabel` unread; Excerpt capped at Two lines; Numeral Large capped to 34 below 1080; the left column dissolving at 767; the eyebrow dropped at 390.


**Reconciled.** Padding retired into **Vertical spacing**, **Row density kept** as the row's own ladder; **Tag: Show · Hide** added; **`linkUrl`** removed, and `linkLabel` stays unread here; **Count is the stepper at min 1 · max 10** — ten is where a shortlist becomes a list. **Hand-picked makes the ordinals an honest editorial ranking** ⚑, which is the largest single change this pass makes to any A19 design: 01, 02, 03 stop being positions in a date sort. **The tag-and-Oldest-first advisory is deleted** and the panel now names which of the two orders is on screen. The excerpt binds **`excerpt`**.

---

### 13 · Quote

1. **Descriptor.** One featured post's excerpt set at 34 px in the heading font at regular weight on a full-width surface band, with a quote mark above it, and the post's title at 20 px beneath as the attribution with a 24 px author avatar and the date. The writing is the headline.

2. **Structural descriptor.** `stack · none · surface · one · none · excerpt at display size`
   Separates from 6 Big Type on ground and emphasis — same archetype, same count, same absence of media, and the ground and the device are what make them two designs.

3. **Archetype.** stack. **No departure** — it narrows and re-sizes, and nothing reorders at any width.

4. **Responsive rule.** **1440** band edge to edge, 96 px padding, quote 34/1.34 on 920 (780 when Centred), glyph 64, attribution 20, avatar 24. **1080** measure 820, quote 32. **834** measure 620, quote 28, glyph 48, attribution 19, band padding 80/40. **≤ 767** quote 24, attribution 18, band padding 64/20, **Quote mark Glyph resolves to Off while Rule stays**, reading time not drawn at any width. Avatar stays 24 everywhere.

5. **Content fields.** Section: `eyebrow` (drawn only in the hand-off state), `linkLabel`; `title`, `sub` and `note` are in the union and **this design draws none of them** ⚑ — a section headline above a pull quote is two voices; **`linkUrl` deleted from the union** ⚑. Data group: all six, **`count` the stepper, locked at 1**. From the post: **`custom_excerpt` — required, not optional, here alone**, `title`, `url`, `published_at`, `primary_author.name` + `profile_image`. **No `feature_image` and no `primary_tag`**. Writes `quoteSize`, `quoteMark`, `alignment`, `attribution`, `authorPhoto`.

6. **Controls.** **Quote size** Small 28 · Medium 34 · Large 40. **Quote mark** Off · Glyph · Rule. **Alignment** Left · Centred. **Attribution** Title only · Title and author · Title, author and date. **Author photo** Hidden · Shown. Five of its own, plus the universal trio and the Data group. **No Excerpt control** — the excerpt renders whole, never clamped — and **no Tag row**, since no `primary_tag` is read. **Count greyed and locked at 1.** **Universal: Background role locked at Surface, Top divider locked None**, each with its reason; Vertical spacing is the band's own padding. **Quick: Quote size, Quote mark, Alignment, Attribution.**

7. **Data.** `featured:true` at `limit: 1`. **0 → the section does not render** unless `fallback` is Show the latest post. **1 → the design as drawn.** **Many → the first in query order is drawn and the count line reports “5 posts are featured. 1 drawn.”** Order selectable from Newest first · Oldest first and it is the only thing that decides which post appears; no picker, no Add, no Remove. **⚑ The post that Order lands on may be the one without an excerpt**, which is how a site meets the hand-off without changing anything — the spec's most likely real-world path and the reason the hand-off exists rather than an error.

8. **Empty state.** **No `custom_excerpt` → hand-off**: the band and its padding stay, and the title is drawn at the quote's display size in the arrangement of 6 Big Type, with the eyebrow above it. **An editor-only notice** names the missing field, offers the fix and names 6 Big Type; **nothing is switched and the notice never reaches the site.** No author photograph → initials, A1·6's fallback. No author at all at Attribution Title, author and date → the date alone on that line. **A very long excerpt renders whole and the band grows**; the panel suggests Quote size Small rather than truncating.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical.** Edit-safe. `typewriter` was considered for the quote and refused: a sentence that types itself out is a decoration on someone else's writing, and the resting state is the design.

10. **Accessibility.** `<section aria-labelledby>` holding one `<a>` that wraps a `<blockquote>` and its attribution — **one anchor, one focus stop.** The title is the `<h2>` and `aria-labelledby` points at it, so the section is named by the post it features even though the heading sits below the quote. The quote mark is `aria-hidden`; the avatar is a decorative image with an empty `alt`, since the name is beside it. Date is `<time datetime>`. Focus is A6's ring on the whole block at a 4 px offset; hover underlines the attribution title, not the quote ⚑ — 34 px of underlined serif is unreadable. Quote at 34 regular measures 13.2:1 in light and 14.9:1 in dark.

- **Flagged ⚑** — the heading font at regular weight, the only place in A19; the 920 measure against the category's 720; the glyph in the border token rather than muted; the hand-off to 6 Big Type and its editor-only notice; head fields present in the union and drawn by nothing here; Author photo as a control; Glyph resolving to Off below 767; hover on the attribution rather than the quote.


**Reconciled.** Padding retired into **Vertical spacing** as the band's own padding; **Background role locked at Surface** (the band is the design, and 6 Big Type is the page-ground version of the same idea) and **Top divider locked None** (the band's edge is the divider); **`linkUrl`** removed; the locked Show row became **the locked Count stepper**; **Hand-picked** takes one post and **warns when it carries no custom excerpt**. **`custom_excerpt` stays required here** — the category's new excerpt rule explicitly excepts the design that *frames* an excerpt, because Ghost's generated plaintext is the first fifty words of a piece with no ending and reads as a mistake at 34 px — and **the hand-off to 6 Big Type is untouched**. Five controls, the shortest list in A19.

---

### 14 · Slim

1. **Descriptor.** One featured post on a single 64 px line of surface running the section's full width: label and 20 px title at the left, date and an accent arrow at the right, the whole strip one link. The smallest spotlight in the library.

2. **Structural descriptor.** `bar · none · surface · one · none · one-line strip`
   The only `bar` in A19. Separates from 13 Quote on archetype and emphasis, and from every other design on archetype alone.

3. **Archetype.** bar. **One departure:** the ladder keeps a bar on one line and moves its trailing element into a menu; this one has no menu to move anything into, so **below 767 it becomes a two-line block and drops the arrow**.

4. **Responsive rule.** **1440** 64 px tall, content at the 72 px page margin, title 20, label and date 13, arrow 16. **1080** unchanged; title 20. **834** still one line, title 19, side padding 40. **≤ 767** **two-line block**: label and detail on line one, title 19 beneath, 16 px vertical padding, **arrow not drawn**, block 78 px tall and taller with a long title. **Any width** a title too long for its line wraps and the bar grows; nothing is ever truncated.

5. **Content fields.** Section: `eyebrow` (drawn at Label Eyebrow); `title`, `sub`, `note` and `linkLabel` **all unread** ⚑, and `linkUrl` is deleted from the union — the bar has no room for a head and no room for a labelled action. From the post: `title`, `url`, `primary_tag` (at Label Post tag), `published_at` or `reading_time` (at Detail). **No image, no excerpt, no author** — the leanest read in the category. Data group: all six, **`count` fixed at 1**. Writes `rowDensity`, `label`, `detail`, `alignment`, `rule`, `trailing`.

6. **Controls.** **Density** Compact 48 · Comfortable 64 · Spacious 80 — **the strip's height, and now only that**. **Label** Off · Eyebrow · Post tag. **Detail** Title only · Title and date · Title and reading time. **Alignment** Left · Centred (Centred does not draw the detail). **Rule** Off · Above · Above and below — the strip's own hairline, distinct from the universal Top divider, which is locked None here. **Trailing** Off · Arrow. Six of its own, plus the universal trio and the Data group. **Vertical spacing is new to this design** ⚑ and resolves 32 · 48 · 64 around the strip; **Count greyed and locked at 1**; **no Tag row**, because Label governs the tag. **Quick: Density, Label, Detail, Trailing.**

7. **Data.** `featured:true` at `limit: 1`. **0 → the section does not render** unless `fallback` is Show the latest post — **the fallback matters more here than anywhere**, since a 64 px bar that vanishes leaves a page that still reads, which is why a site can safely leave it on. **1 → the design as drawn.** **Many → the first in query order**, the count line reporting “5 posts are featured. 1 drawn.” Order selectable from Newest first · Oldest first and it is the only thing deciding which post appears. No Add, no Remove, no picker.

8. **Empty state.** **No tag at Label Post tag → the section's eyebrow is drawn instead** ⚑, and if that is empty too the label is not drawn and the title starts at the margin. **No date is impossible** — `published_at` is required by Ghost. **A post with no picture, no excerpt and no author changes nothing**, because the bar reads none of them: **this is the design that survives the thinnest content in the category**, and the panel recommends it for a site whose featured posts are bare. A very long title wraps and the bar grows.

9. **Behaviour module.** **None**; `core` assumed. **No-JS: pixel-identical** — the arrow's 4 px hover shift is a CSS transition on the anchor and needs no script. Edit-safe. **`dismiss` was considered and refused** ⚑: a closable featured bar is A2's announcement bar wearing this design's clothes, and a section that a reader can delete is a different contract. Named here so the architect can see it was asked.

10. **Accessibility.** `<section aria-labelledby>` holding one `<a>` that fills the strip — **one focus stop, 64 px tall, 48 px at Compact**, both above the 44 px floor; at 390 the block is 78 px or more. The title is the `<h2>`, since no head is authored in this design. Label and detail are plain text inside the anchor and are read after the title. **The arrow is `aria-hidden` and decorative**, at 3.4:1 in light and 6.2:1 in dark — above the 3:1 graphical floor, below text contrast, and never the only signal. Date is `<time datetime>`. Focus is A6's ring on the strip at a 4 px offset, inset at 1440 so it is not clipped by the section's edge ⚑. Title at 20/700 measures 13.6:1 in light, 15.6:1 in dark.

- **Flagged ⚑** — Rule as a tokenisation control; Density instead of Padding; Label Post tag falling back to the eyebrow; Centred dropping the detail; the arrow dropped below 767 and the strip becoming two lines; head fields unread; the inset focus ring; `dismiss` refused; two bars on one page drawing the same post without a warning.


**Reconciled.** **Vertical spacing is new here** and resolves 32 · 48 · 64 around the strip, so **Density is the strip's height alone** rather than the height and the section's space at once — a genuinely different ladder keeping its own name, which is what rule 3 asks for. **Background role locked at Surface**, **Top divider locked None** because Rule already draws a hairline immediately above the strip and two hairlines 1 px apart is the failure the lock prevents. **`linkUrl`** removed from a union this design never read; the locked Show row became **the locked Count stepper**; **Hand-picked answers the two-bars-one-post finding** ⚑ — two Slim bars on a page drew the same post and nothing warned; now each can be told which piece it carries. **No Tag row**: Label has governed the tag since the design was drawn. **The trailing arrow stays a glyph, not an icon slot** ⚑.

---

### 15 · Carousel

1. **Descriptor.** Three or five featured posts as full-width spotlights on a snapping track, one visible at a time: picture 768 at the left, text 480 at the right, a widening dot row beneath and A1·14's outlined arrows beside the head. Paged on demand, never automatically.

2. **Structural descriptor.** `carousel · none · page · many · left · one slide at a time`
   The only `carousel` and the only `many` in A19. Separates from 1 Split on archetype and count class, and from 9 Alternating on archetype, count class and containment of time rather than space.

3. **Archetype.** carousel. **One departure:** the ladder keeps arrows at every width and moves them over the media on touch; this design **drops them below 1080 and resolves Navigation Arrows to Dots**, because an arrow drawn over a photograph is the one place A19 would put a control on an image.

4. **Responsive rule.** **1440** slide 768 · 48 · 480; picture 768 × 512 at 3:2; title 34; arrows beside the head; dots 24/8 × 4 under the slide. **1080** 576 · 48 · 360, title 30. **834** one column, picture above text at 754, title 30, **arrows not drawn**, dots kept, swipe and keyboard page the track. **≤ 767** picture 350, title 26, excerpt 16, reading time dropped, dots kept with 44 px targets. **Every width shows exactly one slide**; the track never becomes two-up.

5. **Content fields.** Section: the six, **`linkUrl` deleted from the union** ⚑. Data group: all six, **`count` the stepper at min 1 · max 8**. Per slide: `title`, `url`, `feature_image` + `feature_image_alt`, `primary_tag`, `custom_excerpt`, `published_at`, `primary_author.name`, `reading_time`. No `profile_image`. Writes `ratio`, `navigation`, `titleSize`, `excerpt`, `meta`, `tag`.

6. **Controls.** **Ratio** Landscape 3:2 · Wide 16:9 · Square 1:1. **Navigation** Dots · Arrows · Dots and arrows. **Title size** Small 28 · Medium 34 · Large 40. **Excerpt** Off · One line · Two lines · Three lines. **Meta** None · Date only · Name and date · Name, date and reading time. **Tag** Show · Hide, every slide together. Six of its own, plus the universal trio and the Data group. **No Autoplay, no Interval, no Loop** ⚑ — refused, **owner-ratified in the reconciliation pass**, with the reasons kept in the panel and here. **Quick: Ratio, Navigation, Title size, Excerpt.**

7. **Data.** `featured:true` at `limit: 3` or `5`. **Designed for 5; correct at 3 and 2.** **0 → the section does not render** unless `fallback` is Show the latest post, which draws one still slide. **1 → a still spotlight: no track, no dots, no arrows, and the module is not declared for that render** ⚑; the panel says “Nothing to page through — 1 Split draws one post better” and switches nothing. **2 → two dots and both arrows**, one disabled at each end. **More featured than Show → the extras are not drawn** and the count line reports it. Order selectable from Newest first · Oldest first; **it is the slide order, and the first slide is always the one at rest.** No Add, no Remove, no per-slide anything.

8. **Empty state.** **Slide without a picture → Plate**, A17's, at the ratio's exact size with the tag centred, `aria-hidden` — **never a reflow, because slides must be the same height or the section changes size as the reader pages.** Untagged and pictureless → an empty plate. Slide without an excerpt → shorter text column, the picture still setting the slide's height, nothing equalised. No author at Meta Name and date → the date alone. **All slides pictureless → a track of plates**, which is worse than 12 Picks at the same content and the panel says so.

9. **Behaviour module.** **`carousel`**, the only module declared in A19. **Edit-safe: no** ⚑ — the module does not run in the editor, and the resting state is what the editor draws and what every frame here shows. **No-JS, quoted from the registry: “The slide track is a native horizontally-scrollable `scroll-snap` strip — fully usable, only dots and arrow buttons are hidden.”** Nothing is added to that claim. Under reduced-motion, paging jumps rather than scrolls; the snap positions are unchanged.

10. **Accessibility.** `<section aria-labelledby>`; the track is a `<ul>` of slides, **none of them hidden from the accessibility tree at any position** — every slide is reachable by scrolling and by tab, so nothing is `aria-hidden` and no focus is trapped. Head `<h2>`, slide titles `<h3>`. Arrows and dots are real `<button>`s outside the track, 44 px targets, the active dot carrying `aria-current`; **⚑ Closed in this pass: their three labels — “Previous featured post”, “Next featured post”, “Show post 3 of 5” — are theme translation-catalog strings**, the last with its two numbers as placeholders. **They are not authored fields**: a site that translates its theme translates them, and three sections that renamed them independently would say three different things about the same control. This is the other half of 11 Lead and Rail's finding, answered differently because the string names a control rather than a list. Focus order: head → arrows → slides in DOM order → dots. Focus A6's ring at 4 px offset; **focusing a slide scrolls it into position rather than leaving focus off-screen.** Dates `<time datetime>`. **Print: the slides print stacked, all of them, in query order** (the floor's rule).

- **Flagged ⚑** — the 768 · 48 · 480 division; the widening dot as the position marker and A19's third accent; no autoplay, no loop, no interval; arrows dropped and Arrows resolving to Dots below 1080; the module not declared at one post; the invented button labels; plate rather than reflow, with the height argument; edit-safe declared as no.


**Reconciled.** Padding retired into **Vertical spacing**, the dot row's 24 px still inside it and not a control; **Tag: Show · Hide** added, every slide together; **`linkUrl`** removed; **Count is the stepper at min 1 · max 8** — eight is where the dot row stops being a position and starts being a scrollbar — with 1 still drawing a still spotlight and not declaring the module. **Hand-picked takes up to five in picked order and is the slide order**, the first pick at rest, which is the running order a carousel obviously needs. **The three invented button labels become translation-catalog strings.** **Autoplay, Interval and Loop stay refused, owner-ratified**, reasons unchanged on the frame. The excerpt binds **`excerpt`**; the arrows stay A1·14 icon buttons whose glyph is the design's, so rule 11's Icon Picker does not reach them.

---

## Block 1 · Component inventory

Cumulative. **Established in A19** unless another category is named; the number in brackets is the
design it was set in.

| Component | What it is | First from |
|---|---|---|
| **Spotlight** | A17's post card at display scale: image → tag → title → excerpt → meta → call to action, the whole thing one `<a>`, no fill, border, shadow or radius on the text side | **A19** (1) |
| **Call-to-action label** | A `<span>` inside the post's own link at 14/600 with a 2 px accent underline, worded by `linkLabel` — a label, never a second link | **A19** (1) |
| **Reflow** | The missing-picture answer for a block alone on its line: text to a 720 measure in place, no plate, no reserved space | **A19** (1) |
| **Plate-or-reflow rule** | Side-by-side and paged designs plate so columns start level and slides keep one height; stacked and full-width designs reflow | **A19** (10) |
| **Follower entry** | A 20 px title with meta in a 424 column, ruled between, carrying no picture and no excerpt at any setting | **A19** (8) |
| **Titles rail** | 18 px ruled entries at Title · Title and date · Title, date and tag; no pictures, no excerpts, absorbs the count | **A19** (11) |
| **Alternating band** | A 672 · 64 · 560 picture-and-text band, vertically centred, the side swapping by `row-reverse` and never by DOM order | **A19** (9) |
| **Zero-padded ordinal** | A two-digit numeral in a 64/96/128 column at the muted token, `aria-hidden` inside an `<ol>` | **A19** (12) |
| **Pull quote** | The heading font at **regular** weight on a 920 measure, with Quote mark Off · Glyph · Rule, the glyph in the border token | **A19** (13) |
| **Design hand-off + editor notice** | A design that cannot render a post draws a named sibling's arrangement on its own ground, and says so in an editor-only notice that never reaches the site | **A19** (13) |
| **Slim bar** | A 48/64/80 strip of surface: label and title left, detail and arrow right, the whole strip one link | **A19** (14) |
| **Widening dot** | 4 px position bars, active 24 px in accent, position carried by width as well as colour | **A19** (15) |
| **Locked count row** | A Count stepper drawn, greyed, labelled "fixed by this design", with the design to switch to named beneath | **A19** (10) |
| **Advisory thinning** | When the query returns less than a design is composed for, the panel names a better design and switches nothing; the layout never becomes another design | **A19** (8) |
| **Post card** | Image, tag, title, excerpt, meta in fixed DOM order; whole card one `<a>` | A17 |
| **Tag plate** | Missing-image substitute at the image's exact box, carrying the primary tag, `aria-hidden`, empty when untagged | A17 |
| **Data group** | P0·5 “Populate from…” configured for posts: Source · Tag or author · Hand-picked posts · Count · Order · When nothing matches — the query panel that replaces a repeater | A17, as the Posts block |
| **Hand-picked post picker** | The Ghost-aware picker at Source: Hand-picked — 1–5 references, drag-ordered, P0·3's item controls, no blank Add, a per-design ceiling | **A19** (1), this pass |
| **Count stepper** | One 1–100 stepper with per-design min and max, replacing three per-category enums; a locked one is drawn disabled with its reason | **A19** (1), this pass |
| **Universal trio** | Background role · Vertical spacing · Top divider, outside every design's control list, locked with the reason shown where a design's ground or height is its identity | A1, spent here on five locks |
| **Rail heading** | An authored ≤ 26-character list label, drawn at eyebrow size or spent on the list's `aria-label` — the fix for an invented `aria-label` | **A19** (11), this pass |
| **Translation-catalog string** | A reader-visible string that names a control rather than content: theme-translated, never an authored field | **A19** (15), this pass |
| **Editor count line** | "N posts are featured. M drawn." plus the design's own advice | A17 |
| **On-contrast derivation** | `color-mix` toward the band's own text: muted 60% · hairline 10% · plate 7% | A17 (7) |
| **Dated row** | A row with its date hung at the right edge — reused by 11's rail at 834 and 12's meta at 1440 | A18 (4) |
| **Row density** | A second padding control inside a list, named Compact · Comfortable · Spacious with per-design quantities | A18 (1) |
| **Separator vocabulary** | Off · Between rows · Boxed, one separator per design; A19 spends Off · Between bands/followers/picks · Column rule | A18 (1) |
| **44 px row floor** | The smallest row that reads, set by A1's touch minimum rather than the 8 px grid | A18 (3) |
| **Section head** | Eyebrow · title · sub · note · link; all optional | A1 |
| **Meta row** | Name · date · reading time at 13 px muted | A1 (6) |
| **Avatar + initials fallback** | A 24 px circle with initials when `profile_image` is absent — spent in A19 by 1, 4 and 13 | A1 (6) |
| **Icon button** | 38 px box, 8 px radius, bare / outlined / filled, 44 px hit area — A19·15's arrows | A1 (14) |
| **Focus ring** | 2 px accent ring at a 4 px offset on the whole interactive box | A6 |
| **Split layout** | Head column beside a content column, `grid-column` move rather than `order` | A8 (6) |
| **Named ratio ladder** | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5, never computed | A8 (8) |
| **Cell divisions** | Two 636 · Three 416 · Four 306 on a 24 gutter across 1,296 | A10 |
| **Striped image placeholder** | 45° two-tone stripe with a mono caption; frames only, never shipped | A1 |
| **Short-last-row rule** | Orphan keeps its width and sits at the left; never rebalanced | A12 |

## Block 2 · Shared field list

**Twenty-one fields**, counted as the schema counts them: six authored, five query, ten read.

**Authored on the section — six.** All optional. `eyebrow` text ≤ 26, defaults to "Featured" ·
`title` text ≤ 104 · `sub` text ≤ 178 · `note` text ≤ 120 · `linkLabel` text ≤ 24, defaults to
"Read the piece" · **`railLabel` text ≤ 26, defaults to "More featured posts"** ⚑ new, read by
11 Lead and Rail alone. **⚑ `linkUrl` is deleted**: it was read by no design in the category, and a
URL field nothing reads is a fake control — `linkLabel` labels the post's own link and stays. **The
count is unchanged at six because one field left as another arrived.** **There is no `image` field
on an A19 section** — every picture is a post's.

**The query — seven, in the Data group.** `source` enum req (Latest posts · By tag · By author ·
**Featured only**, A19's default · This route's posts · **Hand-picked** ⚑ new) · `filterValue` ref
opt · **`pickedPosts` ref[] opt, 1–5, order significant** ⚑ new · **`count` int req, the 1–100
stepper with per-design bounds** ⚑ · `order` enum req (Newest first · Oldest first, disabled at
Hand-picked) · **`fallback` enum req (Hide the section · Show the latest post)** ⚑, default Hide.

**Read from each post — ten, three optional.** `title` req · `url` req · `published_at` req ·
`reading_time` req · `feature_image` + `feature_image_alt` opt · `primary_tag` opt ·
`custom_excerpt` opt (**required by 13 Quote alone, which hands off without it**) ·
`primary_author` req (name req, `profile_image` opt) · `featured` read as the query in fourteen
designs and **drawn by none** · `visibility` read, never drawn. **⚑ `profile_image` is finally
spent**: 1 Split, 4 Poster and 13 Quote draw A1's 24 px avatar, and post 5's author has none, so
initials are drawn.

**Per-design fields — twenty-seven written; `padding` is gone from all of them.** `titleSize` · `excerpt` · `meta` · **`tag`** (eleven designs) are shared by most;
`ratio` · `mediaSide` · `alignment` · `divider` by several; and `height` · `textPosition` ·
`scrim` · `card` · `cardPosition` · `imageWidth` · `columnWidth` · `railDetail` · `numeralSize` ·
`rowDensity` · `quoteMark` · `attribution` · `authorPhoto` · `label` · `detail` · `rule` ·
`trailing` · `carouselControls` · `quoteSize` · **`railHeading`** by one or two each. **`padding` is written by nothing**: it was the universal Vertical spacing under another name.

**⚑ Amended once the fifteen were drawn.** The proof's field-list frame counted nineteen and named
`perView` and `carouselControls` for 15 Carousel. `carouselControls` is written and carries
Dots · Arrows · Dots and arrows; **`perView` is written by no design** — the track is one-up at
every width. **Three names are additions from 13 Quote and 14 Slim** — `quoteSize`, `authorPhoto`
and `label`.

**Why the union is short and what "content preserved" means here.** Nothing is authored except the
six head fields, so **switching design preserves the query — and the query is the whole of what an
A19 user owns.** The one switch that could lose something is into 13 Quote from a design that drew
no excerpt, and it loses nothing: the field was always there and the new design simply reads it.

---

## Findings for the architect

**Five of the twelve are closed by this pass and are kept here with their answers**, because a
finding that vanishes looks like a finding nobody read.

1. **Closed — `count` is one stepper, not a third enum.** A17 needed 3 · 6 · 9 · 12, A18 5 · 10 · 15
   · 25 and A19 1 · 2 · 3 · 5. **The field is a 1–100 integer with per-design min, max and step**,
   and the bounds are the truth. **What the build still owes: somewhere to declare per-design
   bounds on a shared field**, plus the lock and its reason string.
2. **Open — `fallback` belongs to the Data group, not to A19.** Every category that queries Ghost
   has the same zero-item question; A19 is simply the first where the answer is visible.
3. **Closed — the head's link pair was not a pair, so `linkUrl` is deleted.** `linkLabel` labels
   the post's own link and stays. A category-wide deletion of a field the schema still carries for
   A17 and A18: **the union is per category, and this is the proof.**
4. **Closed — the two invented strings, answered two different ways.** 11 Lead and Rail's rail label
   is now the authored `railLabel`, because it names *content the section owns*; 15 Carousel's
   arrow and dot labels are **theme translation-catalog strings**, because they name *a control*.
   **The rule this establishes: a reader-visible string that names content is authored; one that
   names a control is translated.** The build needs both mechanisms.
5. **Closed — Ghost cannot rank featured posts, so the section can.** `pickedPosts` is an ordered
   reference list, and 12 Picks' ordinals are an honest editorial ranking at that Source. **What the
   build still owes: a resolution rule for a picked post that is unpublished or deleted** — the spec
   says skip it and fall through to *When nothing matches*, and that must be one rule, not fifteen.
6. **Open — a pack-level `on-contrast`, `on-contrast-accent` and `on-accent`.** Restated from A17
   and A18; 5 Contrast Band derives them independently for the third time, and now derives them at
   four ratios rather than one.
7. **Open, narrowed — “this design cannot render this post” still needs a general mechanism.**
   13 Quote makes an optional field required and hands off to 6 Big Type with an editor-only notice;
   2 Full Bleed, 4 Poster and 7 Overlap do the same for a missing picture. **This pass narrows it at
   one end only**: at Source: Hand-picked the picker warns *before* the post is chosen. The hand-off
   itself is still per design.
8. **Open — 14 Slim's Rule exists because of a pack risk, not a design choice.** A pack-level
   “surface needs a hairline against background” flag would remove a control from the section. **The
   universal Top divider makes this worse, not better**: the two are locked apart on that design to
   stop a site drawing two hairlines 1 px apart.
9. **Open — `carousel` is edit-safe: no.** The editor shows only the resting slide. The host may
   want a preview-play affordance for module-bearing sections generally; **no Preview control belongs
   in a sidebar**, which is why none was added.
10. **Open, narrowed — two 14 Slim bars on one page.** At a query Source they still draw the same
    post and nothing warns. **Hand-picked lets a site give each bar its own piece**, which is the
    practical fix; the editor still has no cross-section awareness of queries.
11. **Open — print rules live per design and nowhere central.** 5 Contrast Band prints as 1 Split,
    15 Carousel prints its slides stacked. Three categories in, this should be a field.
12. **Open, and larger after this pass — per-design field names are a consequence of the designs.**
    `padding` is written by nothing now; `tag` is written by eleven designs and `railHeading` by one;
    `perView` was anticipated and is still unwritten. **The per-design field list should be generated
    from the designs rather than declared ahead of them.**
13. **New — cross-field dependencies need a vocabulary.** Order is disabled at Hand-picked; the
    picker's ceiling is Count's maximum; Count is disabled at Hand-picked because the list is the
    count; Scrim disables a failing value against a measured image. **Four different kinds of
    dependency in one category, all drawn by hand.**
14. **New — the universal trio needs a lock with a reason string.** Five locks in A19, each drawn
    with the sentence that explains it. **A lock without a reason reads as a bug**, and the reason is
    per design, so it cannot live in the trio's own definition.

---

## Reconciliation notes

**Frames changed in this pass — sixteen, and every one of them.** `A19-0 Category Proof` (settlement
1 amended for Hand-picked, settlement 2 amended for the Count stepper, the field list updated, a new
eight-item **⚑ RECONCILED** grid at the foot) and **all fifteen design frames**: `A19-1 Split`,
`A19-2 Full Bleed`, `A19-3 Card`, `A19-4 Poster`, `A19-5 Contrast Band`, `A19-6 Big Type`,
`A19-7 Overlap`, `A19-8 Lead and Two`, `A19-9 Alternating`, `A19-10 Pair`, `A19-11 Lead and Rail`,
`A19-12 Picks`, `A19-13 Quote`, `A19-14 Slim`, `A19-15 Carousel`. Each one lost its **Padding** row
(thirteen had one), gained the **universal trio** and the **Data group** outside its own list, gained
**Editing**, **Behaviour** and **Data** blocks under the sidebar, gained a **⚑ RECONCILED** footer
strip, and had its spec card's Controls field rewritten and a **Reconciled** paragraph added.

**Two section frames were redrawn, and only two, because only two items change visible content.**
`A19-5 Contrast Band` gains a **RATIO ON THE BAND** strip drawing the band at Wide 16:9, Square 1:1
and Portrait 4:5. `A19-11 Lead and Rail` gains a **RAIL HEADING** strip drawing the rail at Hidden
and Shown. **Nothing else was redrawn**: Tag: Show · Hide draws an eyebrow the frames already show,
Hand-picked and the Count stepper are sidebar objects, `linkUrl` was never visible, and the excerpt
binding changes where a string comes from and not how it looks.

**Where this pass overruled something this category had already settled — one line each.**

- **Settlement 1 said the section cannot own a fact about a post. It can, and it now does.** The
  overruling argument is the one the pass gave: **which post THIS section spotlights is a fact about
  the section**, and `featured` is a *global* star, so a hero and a featured grid cannot both use it
  independently. Everything else in settlement 1 stands, including the refusal of an A19 star.
- **“No repeater, no Add, no Remove, no drag handle in the category” now has an exception.** The
  Hand-picked list has all three affordances. **Picking is not authoring** is the distinction the
  category keeps: the picker cannot create a post, remove cannot delete one, and no per-post control
  exists anywhere.
- **Settlement 2's Show ladder was a per-category enum and is now a stepper.** The ladder's real
  content — nine designs at one post, 10 Pair at two, the arrangements composed for 3 and 5 —
  survives as per-design bounds and locked rows. **A19's locked-row convention was ratified rather
  than replaced.**
- **The category-wide list said 11 Lead and Rail's rail label should become a catalog string; the
  per-design item said it should become the authored `railLabel`. The per-design item wins.** The
  string names *the section's own list of posts*, which is content, and a site with two Lead and Rail
  sections will want two different labels. **The catalog rule therefore applies to 15 Carousel's
  three button strings alone**, which name a control.
- **5 Contrast Band's “No Ratio, refused and stated” is overruled** and survives as advice: the
  default is Landscape 3:2 and Portrait warns at Title Large. The overruling reason is the pair —
  this design and 1 Split differ on ground alone, **and a one-click switch must not silently discard
  a value the union already holds**.
- **12 Picks' fixed advisory line under Order is deleted, not reworded.** It existed to apologise for
  a missing feature. The panel now states which of two truths is on screen: “picked order is the
  ranking” at Hand-picked, “numerals are positions in the query order” everywhere else.
- **15 Carousel's refusal of Autoplay, Interval and Loop is owner-ratified**, so the reasons stay on
  the frame rather than being softened into advice. This is the one place the pass looked at a
  refusal and left it exactly as drawn.
- **14 Slim had no spacing control and now has two ladders instead of one.** Density was doing the
  work of a strip height *and* a section spacing; **Density keeps the height and Vertical spacing
  takes the space around it**, resolving 32 · 48 · 64 rather than the category's 64 · 96 · 132,
  because a bar with 96 px of air around it is a bar pretending to be a section. **That halved
  ladder is invented** ⚑.
- **Two designs keep a Rule control beside the universal Top divider.** 6 Big Type and 14 Slim draw
  a hairline *inside* the section; Top divider draws *above* it. **6 Big Type warns rather than
  disabling** when both are on; **14 Slim locks Top divider at None**, because its Rule is 1 px away
  from where the divider would land. The asymmetry is deliberate and is recorded rather than
  resolved.
- **The eleven Tag rows exclude 11 Lead and Rail, and that leaves one honest gap.** Rail detail
  governs the rail's tag; **the lead's own tag eyebrow still has no control**. The pass named eleven
  designs and this is not one of them, so no twelfth row was invented — the gap is recorded here for
  the next pass to close, and it is the only design in A19 that draws `primary_tag` with no way off.
- **The excerpt rule has one exception and it is the design that frames one.** Everything binds
  `excerpt` with Ghost's generated fallback; **13 Quote keeps `custom_excerpt` required** and its
  hand-off to 6 Big Type. A17 and A18 reached the same conclusion by the same test, and A19 is the
  first category where the test finds a design.
- **Rule 10 (Image focus) and rule 11 (button icons) reach nothing in A19, and both are stated
  rather than skipped.** A19 authors no image — every picture is a post's, and its focal point is set
  in Ghost — and the category has no label-bearing button; 15 Carousel's arrows are A1·14 icon
  buttons whose glyph belongs to the design.
- **Rule 9 (Member visibility) is offered nowhere.** Every action in A19 is a link to a post. A
  spotlight that hides itself from a logged-out reader is A32's paywall wearing a section's clothes,
  and A32 is the category for it.
- **Rule 7 (remove Preview controls) had nothing to remove.** No A19 panel ever carried one.
- **Rule 6 (the module registry) is untouched.** One module, `carousel`; `shuffle` stays refused
  category-wide; **no registry addition and no coined module name**.
