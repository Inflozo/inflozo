# A33 Koenig Card Treatments — written specification

6 treatments · Paper pack · drawn 24 August 2026 · **controls-reconciliation pass 25 August 2026**

This file is the reconciled specification. The pass reused the P0 editor primitives by name and
redesigned none of them; every conflict it opened with an earlier A33 ruling is recorded, one line
each, in **Reconciliation notes** at the foot.

The frames are `A33-0 Category Proof.dc.html` and `A33-1` … `A33-6`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the four settlements in
full, the tokenisation proof (2 Card in three packs, light and dark), the stress frame, the roster,
the seven findings and the cumulative component inventory. The shared field list and the item rules
are repeated below because the build reads them.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A32 and A34 are specified in root-level `<ID> — Spec.md`
files and this follows them.)*

---

## 0 · The category layer

### What A33 is

**A33 is not a section.** It is the site-wide styling of the cards an author inserts into a post, and
it lives on the **Editor Cards screen (P0·7 · S14)**, the standalone surface that screen was designed
for: the **Treatment** picker and its six controls at the top, and **each card's own 4–7-control
panel below, with treatment-owned values read-only inside it** — C.1's pattern, kept ⚑. **The section
sidebar's Cards module reduces to the Treatment picker plus a link to that screen** ⚑, so a user meets
the treatment where they are working and edits cards where cards are edited. **A33's six treatments
are not the per-card surface and must never be conflated with it** — the treatments are the whole-set
style; the per-card panels are the exceptions on top.

**Six treatments, twenty cards each.** What separates them is **the plane under a card** and **what the
author's width class resolves to** — never colour, type or radius, which the Style Pack owns. Four of
the six differ in the plane (1 Plain, 2 Card, 3 Panel, 6 Contrast Band); two differ in width
(4 Wide, 5 Full Bleed).

**The fact to read first.** Ghost owns the markup and the width class; **A33 owns what they resolve
to** ⚑. A treatment is a stylesheet over `.kg-*` classes inside `{{content}}`. It adds no markup, and
**with no cards in a post it renders nothing at all** — no wrapper, no padding, no trace.

**The second fact.** A control writes **one value onto the site**, and every card of that type reads
it. "Make this callout wider" is not expressible, by construction. Inside a card the author edits
**content only** — text, image, link — never layout, spacing, alignment or emphasis.

A33 inherits **A25's article measure and body type** (720 at 1440, 754 at 834, 350 at 390; body
19/1.7); **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20); **A1·1's
primary button and eyebrow**; **A19's missing-image rule and its rule that no design filters, dims or
tints a photograph**; **A20·13's warm scrim**; **A17·7's on-contrast derivation**; **A6's 2 px focus
ring at a 4 px offset**; **the Editor Sidebar Kit's control shapes**; and **C.1's ownership matrix**,
which decides what a treatment is even allowed to touch. **A33 adds twelve components to the
vocabulary** (proof frame) **and nothing else.**

### The four settlements (§8 of the brief)

**1 · Every card Ghost can render.** **All twenty cards on ghost.org/help/cards are drawn in every
treatment**, in Ghost's own order: image, markdown, HTML, gallery, divider, bookmark, email content,
call to action, public preview, button, callout, GIF, toggle, audio, video, file, product, header,
embeds, signup. **Seven of the twenty are not the theme's to arrange, and the roll says so on each
one** ⚑: markdown carries no wrapper class and is A25's type verbatim; HTML is whatever the author
pasted; embeds are the provider's markup; gallery, toggle and audio ship Ghost's own CSS and script,
so A33 re-styles the shell only; **email content never renders on the web at all** ⚑ and is drawn
dashed so a user can see that. **The public-preview marker is A32's** — A33 owns the space above the
cut and nothing below it. **Blockquote and the code block are text formats rather than cards** and
belong to A25's measure ⚑.

**The call-to-action card renders on the web** ⚑ — Ghost lets the author show it on the site, in the
newsletter or both, so it is a themed card with a sponsor label, an image, a button, a background and
its own audience (public, free members, paid members).

**The line between a treatment and A25's measure (§8·4).** A25 owns the column, the paragraph
rhythm, the heading scale and the type of everything that is words on the page. **A33 owns the plane
under a card, the space around it, its caption and what its width class resolves to** ⚑. *A blockquote
is A25's. A callout is A33's.*

**2 · Captions, credits and dark mode.** The caption is **13.5 px in `text-muted`, at the measure by
default**, inside the `<figcaption>` of the card that owns it; three values everywhere — under-left,
under-centred, hidden — and **Hidden never touches `image.alt`** ⚑. **Ghost has no credit field** ⚑:
the credit is the caption's trailing `<em>` run, the convention editors already use, and the Credit
line control decides whether it sits inline or drops to a 13 px second line. **That is an invented
reading of an existing field and it is flagged in all six specs.** Dark is **re-tuned per card**:
**the warm shadows are dropped entirely rather than darkened** ⚑, surfaces lift one step, the callout
takes the dark hover token rather than a lightened copy of the light one, the placeholder stripes
change pair, and **the contrast band inverts the other way** — a light band in a dark article.

**3 · The relationship to C Post Body's card module — settled.** **One surface, one vocabulary** ⚑,
and the surface is now named: the **Editor Cards screen (S14)** hosts (a) the A33 Treatment picker,
one of the six active per project, with the treatment's own controls under it, and (b) **each card's
own 4–7-control panel, with treatment-owned values shown read-only in it** — the pattern C.1 drew,
kept verbatim. **The section sidebar's Cards module reduces to the Treatment picker and an "Open
Editor cards →" link** ⚑. **What the treatment claims, the per-card panel no longer offers** ⚑:
plane, padding, caption placement, width resolution and corners. Finding 7's twelve-controls-for-one-
callout question is closed by that split: the treatment writes the whole set, the card panel carries
only what is that card's own.

**4 · What a treatment may and may not do.** **May**: choose the plane, the space, the caption, the
credit, the emoji, and what regular, wide and full resolve to. **May not**: set a colour, a font, a
radius or a width in pixels; style one card of one post; crop, tint, filter or dim a photograph
(A19) ⚑; add markup to `{{content}}`; touch alt text; reach inside an embed's iframe; or invert an
image, a gallery or an embed at any control value ⚑.

### Each card is editable, and every edit is global

**Every card has its own panel** — C.1's, unchanged — reached by selecting the card on the canvas.
It carries only what is specific to that card (thumbnail side, chevron side, emoji size, player
thumbnail, signup layout); **what the treatment already decided appears in it read-only** ⚑, so a
user can see where a value came from instead of meeting two controls that disagree.

**Saving writes one value onto the site.** Every card of that type, in every post and every page,
reads it — **there is no per-post override and no per-card override** ⚑, by construction. That is
what makes a Koenig card a global component rather than a piece of per-post formatting, and it is
drawn per treatment in the *card panels* frame (image, callout, bookmark and signup selected, panels
open).

### The shared floor

Every treatment obeys these unless its own entry says otherwise.

- **The measure is A25's** and no A33 control changes it — 720 · 754 · 350.
- **Radius is the pack's token, everywhere, with one exception**: it is dropped at the viewport edge
  in 5 Full Bleed ⚑. **No treatment offers a corners control**, which is A33's answer to C.1's
  matrix listing "corners" for eleven cards ⚑.
- **Two shadows exist and cards may use one** — the warm `sm`. The `md` shadow is for overlays.
  **Both are dropped in dark mode** ⚑.
- **Space around a card is 32 · 48 · 64** (56 · 72 in the three treatments whose default is 56), named
  never numeric, and **32 at ≤ 767 whatever the control says** ⚑. **Two cards of the same type in a
  row keep one space between them, not two** ⚑.
- **Below 1024 there is no wide column** ⚑: wide and full resolve to the content box.
- **Media never crops.** The height is the author's file. The proof and design frames cap drawn image
  height at 520 so three frames fit one canvas, and say so ⚑.
- **Hover: one per card, and never a lift.** The bookmark's surface steps to the hover token; the
  button card's fill derives at 93 % brightness; nothing moves, scales or gains a shadow ⚑.
- **Focus: A6's 2 px accent ring at a 4 px offset**, drawn outside any radius, re-derived to the
  carried colour on contrast (A17·7).
- **Every mutating affordance is Ghost's.** A33 draws no dialog, no menu and no upload.

### The module's own controls

Above the read-only rows, the Cards module carries — once, site-wide, in every treatment:

- **Treatment** — the six, one active per project (the picker P0·7 puts above the per-card dropdown).
- **The treatment's own six controls**, per design below.
- **Callout colours** — **Pack tokens** (default) · Ghost's palette. **The mapping lives here, next to
  the treatment** ⚑: Ghost ships nine literal background colours and the pack ships seven roles. At
  Pack tokens the nine collapse onto the pack's planes and **the pack's vocabulary stays closed**; at
  Ghost's palette the nine literals render as authored. Seven editable rows in total — inside the
  ≈15-control ceiling with the whole of "What Ghost owns" on top.

Two read-only help lines sit on the same panel:

- **"Sections may resolve card widths differently inside their own ground."** The section wins inside
  its own ground, the treatment wins everywhere else ⚑ — the precedence Finding 4 named, now visible
  to the user rather than true but unwritten.
- **"Inline editing does not apply to cards."** Card content is authored in Ghost's editor, so
  clicking a card's text on the canvas says **"Edit in Ghost"** and the shared floating toolbar never
  appears on it ⚑. Stated in the panel so audits stop re-asking.

### The read-only rows — "What Ghost owns"

Five rows, identical in all six treatments, **below** the module's controls and **not counted
toward the six**.

| Row | State | Value and why |
|---|---|---|
| Which cards appear | read-only | Whatever the author inserted. **A33 has no item list** ⚑ |
| Card widths | read-only | The author's, per card — the treatment decides what each resolves to ⚑ |
| Bookmark metadata | read-only | Title, description, icon, author, publisher, thumbnail all scraped (C.1) |
| Gallery rows | read-only | Ghost's own script computes the ratios; **no registry module covers it** ⚑ |
| Corners | read-only | From the pack's radius token, in every treatment ⚑ |

### The reconciliation floor

What the pass's ground rules resolve to in a category that is a stylesheet, not a section.

- **The three universal controls do not apply.** **A33 places no section** ⚑, so there is no
  Background role, Vertical spacing or Top divider to carry. **Space around cards is not Vertical
  spacing** — it is the space between two cards inside someone else's section, on its own ladder, and
  keeps its distinct name. 3 Panel's *plane*, 2 Card's *panel padding* and the band's padding are
  card-internal ladders and likewise keep theirs.
- **No "Preview" control exists in A33 and none is added.** Previewing is the editor's: the Cards
  panel renders the treatment against C.4's style-guide fixture, which is a canvas, not a control ⚑.
- **Named values only**, everywhere: every A33 control is an enum of named steps. The numerals in
  *Compact 32 · Comfortable 48 · Spacious 64* are the named step's own label, drawn for the designer,
  and no field accepts px, hex or CSS.
- **Control budget.** Seven editable rows per treatment — six plus the callout mapping — against the
  ≈15 ceiling. **Quick Controls: Treatment · Space around cards · Captions.**
- **Inline editing: none, by construction** (above). **Every URL in a card is Ghost's field**, so the
  Ghost-aware Link Picker belongs to Ghost's editor here, not to a theme panel ⚑.
- **Visitor-facing strings the theme renders are translation-catalog strings**, not editable fields —
  there are five: the product card's rating text equivalent ("Rated 4 out of 5"), the file card's size
  unit and download label, the audio and video players' transport labels, the toggle's expand label,
  and the public-preview marker's label. **Every other string in a card is the author's content** ⚑.
- **Icon slots: one.** The divider's centred glyph (item 2). **Button-card icons are declined with a
  reason** ⚑ — Ghost's button card has a label and a URL and no icon field, and A33 may not add markup
  to `{{content}}`. Every other glyph in the twenty cards is Ghost's own chrome and correctly out of
  reach.
- **Image focus does not apply.** **Media never crops in A33**, so a focus point has nothing to do;
  the image is Ghost's field and Ghost's picker owns it ⚑.
- **Repeating items:** one authored array, `gallery.images[]`, managed on the canvas in Koenig — **no
  sidebar Add, ever**, because the images belong to the post rather than to the theme.
- **Member awareness:** the call-to-action, HTML and signup cards carry **Ghost's own audience field**
  (public · free members · paid members) on the card. A33 adds no Member Visibility control and no
  member-aware action editor — **it would be a second switch that loses to Ghost's** ⚑.
- **Behaviour:** `accordion` and `core`, unchanged. The pass adds no behaviour, so it coins no module
  name and raises no registry addition.

### The roster

| # | Treatment | Tuple | Ctl | Modules |
|---|---|---|---|---|
| 1 | Plain | `article body · none · page · variable · inline · hairline rules only` | 6 | `accordion`, `core` |
| 2 | Card | `article body · card · surface · variable · inline · the raised panel` | 6 | `accordion`, `core` |
| 3 | Panel | `article body · box · surface · variable · inline · plane past the measure` | 6 | `accordion`, `core` |
| 4 | Wide | `media frame · none · page · variable · edge · media one rung wider` | 6 | `accordion`, `core` |
| 5 | Full Bleed | `media frame · none · page · variable · full-bleed · the viewport-edge bleed` | 6 | `accordion`, `core` |
| 6 | Contrast Band | `article body · box · contrast · variable · inline · the inverted card plane` | 6 | `accordion`, `core` |

**In A33 the tuple's containment and ground slots describe the card, not a section** ⚑ — A33 has no
section of its own. Read any other way, all six read `none · page` and the uniqueness check fails on
a technicality. Containment separates 1 from 2 and 3; ground separates 3 from 6; **media placement is
the only slot between 4 Wide and 5 Full Bleed**, and it is enough — one reaches the container's edge,
the other the window's.

**The module list is identical in all six**, which is the honest answer for a category that is a
stylesheet: `accordion` for the toggle card, `core` for everything else.

### The shared field list

The union every treatment draws from. **Every treatment draws all of it** ⚑ — a treatment cannot
decline a card the author inserted, so there is no field with nowhere to live and switching treatment
is always safe.

| Card | Fields | Type | Optional | Limit and note |
|---|---|---|---|---|
| Image | `src` · `alt` · `caption` · `width` | file · text · rich text · enum | alt, caption | alt ≤ 125 chars · width is regular · wide · full, authored per card |
| Gallery | `images[]` · `caption` | file array · rich text | caption | 1–9 images, ordered · Ghost's script computes the row ratios |
| Bookmark | `url` → `title`, `description`, `icon`, `author`, `publisher`, `thumbnail` · `caption` | url → scraped · rich text | caption, and every scraped field | **the author owns the URL only** ⚑ |
| Callout | `text` · `emoji` · `colour` | rich text · emoji · enum | emoji | nine colour values, Ghost's own palette ⚑ · text required |
| Toggle | `heading` · `content` | text · rich text | — | both required · Ghost supplies the chevron and its script |
| Button | `label` · `url` · `align` | text · url · enum | — | label ≤ 40 · left or centre · the fill is the site accent |
| Embed | `url` → `html` · `caption` | url → provider markup · rich text | caption | the markup is the third party's; A33 styles only the frame ⚑ |
| Product | `title` · `description` · `image` · `rating` · `buttonLabel` + `buttonUrl` | text · rich text · file · int · text + url | image, rating, button pair | rating 1–5 · the button pair is both-or-neither |
| File | `file` · `title` · `description` → `name`, `size` | file · text · rich text → derived | description | name and size come from the upload, read-only |
| Header | `heading` · `subheading` · `buttonLabel` + `buttonUrl` · `size` · `style` · `backgroundImage` | text · text · text + url · enum · enum · file | subheading, button pair, image | **three sizes × four styles = twelve variants the theme owes** ⚑ (C.1) |
| Markdown | `md` | rich text | — | **no wrapper class** ⚑ · renders as ordinary headings, lists, links and images |
| HTML | `html` · `visibility` | author markup · enum | — | public · free members · paid members · **whatever the author pastes wins** ⚑ |
| Divider | position only | — | — | a bare `hr` · weight, width and space are the treatment's; **the optional centred glyph is an icon slot** (P0·2) on the divider card's own panel ⚑ |
| Email content | `greeting` · `fallback` · `text` | text · text · rich text | greeting, fallback | **never renders on the web** ⚑ · `first_name` placeholder with the author's fallback |
| Call to action | `text` · `image` · `sponsorLabel` · `buttonLabel` + `buttonUrl` · `background` · `visibility` · `showOn` | rich text · file · text · text + url · enum · enum · enum | image, sponsorLabel, button pair | **renders on the web, in the newsletter, or both** ⚑ · audience is public, free or paid |
| Public preview | position only | marker | — | **not a card on the web** ⚑ · Ghost cuts the response here and A32 renders the gate |
| GIF | the search and the pick | file | — | renders as an image card and follows those settings |
| Audio | `file` · `title` · `thumbnail` | file · text · file | thumbnail | **Ghost ships the player and its script** ⚑ · A33 styles the shell and the progress accent |
| Video | `file` · `poster` · `loop` · `width` | file · file · bool · enum | poster, loop | three widths · Ghost ships the player · A33 styles the play button, scrim and bar |
| Signup | `heading` · `subheading` · `disclaimer` · `buttonText` · `layout` · `background` · `label` | text · text · text · text · enum · colour or file · text | subheading, disclaimer, background, label | **the author's colours arrive as inline styles** ⚑ · shape and spacing only |
| Every card | the treatment's own values | site-wide settings | — | space, captions, credit, plane, width resolution — one value each ⚑ |

**Fifty-nine authored fields and eight scraped or derived ones.**

### Repeating items — the gallery card's images

**One authored array in the whole category: `gallery.images[]`** ⚑.

- **Add.** In Koenig's gallery card on the canvas, **not in this sidebar** — the images belong to the
  post. Add is a multi-file media picker; a newly added image lands **at the end of the order** and
  arrives with its own file, no caption of its own (the caption belongs to the card) and no alt.
- **Remove.** Per image, on the canvas. **At one image the card renders as a single image at the
  card's width** — Ghost's own behaviour, not a treatment rule. **Removing the last image deletes the
  card**, which is Ghost's behaviour too ⚑.
- **Reorder.** Drag on the canvas. **Order is meaningful** — Ghost's script computes each row from the
  order, so moving an image changes the rows.
- **Minimum 1, maximum 9** (Ghost's limit). Designed for 2–9; at 1 it is an image card in all but
  class; **above 9 is not reachable** ⚑.
- **At zero items the card does not exist**, so the section renders nothing for it. That is the same
  empty state as a post with no cards: **nothing at all**.
- **Editable inside an item:** the image file, and nothing else. **Alt is Ghost's field on the image
  card, not the gallery's** ⚑ — a gallery image has no alt in Koenig, which is a Ghost limitation and
  is flagged rather than worked around.
- **No control in A33 styles one image, one card or one post.** A gutter value applies to every
  gallery on the site; a caption value applies to every caption. **If a design seemed to need
  per-item styling it would be two treatments**, and that is how 4 Wide and 5 Full Bleed exist.

---

## 1 · Plain

1. **Descriptor.** Every card on the page ground at the article's measure, with no plane and no
   frame; a single hairline above and below the six cards that must read as one object — HTML, bookmark,
   toggle, audio, file, product — and a tinted plane on the callout and the call to action. The category default.
2. **Structural descriptor.** `article body · none · page · variable · inline · hairline rules only`
   Containment `none` and ground `page` are what 2 Card, 3 Panel and 6 Contrast Band each change
   exactly one of. **In A33 both slots describe the card** ⚑.
3. **Archetype.** article body. Ladder: the measure narrows with the page and nothing rearranges.
   **Two departures** — space steps to 32 at ≤ 767, and the bookmark's thumbnail moves above its text
   at ≤ 767 ⚑.
4. **Responsive rule.** **1440** measure 720 in the 1,296 box on a 72 margin; wide 1,040, full 1,296;
   space 48; caption 13.5 at the measure. **834** measure 754; **wide and full both 754** ⚑; space 48.
   **≤ 767** measure 350 on a 20 margin, every width 350, **space 32**, bookmark thumbnail above its
   text, gallery one column (Ghost's collapse).
5. **Content fields.** The whole union. Ignored at their default values: nothing — 1 Plain is the only
   treatment that draws every field in its default state.
6. **Controls, in sidebar order.** **Space around cards** Compact 32 · Comfortable 48 · Spacious 64.
   **Captions** Under, left · Under, centred · Hidden. **Credit line** With the caption · Its own
   line · Hidden. **Rules** Above and below · Below only · None —
   on HTML, bookmark, toggle, audio, file and product only ⚑. **Tinted cards** Tinted · Hairline
   box · None — governs the callout and the call to action ⚑. **Emoji** Shown · Hidden. Then the
   module's **Callout colours** mapping and the five read-only rows, not counted. **The Credit line's
   help text documents the convention** — "a caption's trailing italic segment renders as the credit" —
   and the treatment preview draws one example ⚑. **The divider card's panel carries the centred glyph
   as an icon slot** (P0·2): Icon Picker on click, popover with swap · Size Small/Medium/Large ·
   Colour role Text/Muted/Accent · Remove; empty is a dashed 20 px slot visible only while the card is
   selected, and at rest with no icon the divider is a bare rule ⚑.
7. **Data.** `{{content}}` as Ghost renders it; A33 adds no markup ⚑. **0 cards → nothing renders**,
   no wrapper and no padding. **1** → it takes its own space. **Many** → the space value repeated, and
   two cards of the same type in a row keep one space, not two ⚑. Renders on pages, and above a
   paywall cut inside A32's preview.
8. **Empty state.** No caption → no `<figcaption>`, the space closes ⚑. No credit → one line. **No
   scraped thumbnail → the bookmark's text takes the full width and no grey box appears** ⚑ (A19). One
   gallery image → one image. No product image → title, description, rating, button. No emoji → text
   takes the full plane. **No cards → nothing**; in the editor the Cards panel previews the treatment
   against C.4's style-guide fixture rather than an empty canvas ⚑.
9. **Behaviour module.** `accordion` (toggle) and `core`. **Edit-safe:** yes — the resting state is the
   only state. **No-JS, quoted:** `accordion` — "Native `<details>` — fully functional,
   keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the
   server-rendered `open` attribute." `core` — "Never runs; the `.js-enabled` class is never set, so
   all JS-conditional CSS stays in its no-JS branch." **Fifteen of the twenty cards are identical with JS off.** **Five depend on scripts that are
   Ghost's, not A33's** ⚑ — the gallery's row ratios, the audio and video players, the signup card's
   post and the embed's provider markup — and **the registry has no module for any of them**, so A33
   declares `core` rather than inventing one. A finding, not a degradation A33 may quote.
10. **Accessibility.** `<figure>`/`<figcaption>` paired on image, gallery, embed. Bookmark: one `<a>`,
    one focus stop, thumbnail `aria-hidden`, title as the accessible name. Toggle:
    `<details>`/`<summary>`, **the heading inside is a `div`, never an h-level** ⚑. Button card: `<a>`
    at 48 px, 44 px minimum target. Product: **the rating is text as well as stars**. File: the link
    names the file and its size. Header: `h2`, never promoted to `h1`. **The hairline carries no
    role**; the callout's emoji carries `aria-hidden`. Body 12.6:1, captions 5.4:1, tinted callout
    11.8:1. Focus order is document order.
- **Repeating items.** As the category layer: `gallery.images[]` only, managed on the canvas.
- **Flagged ⚑** — the tuple describing the card; the hairline pair as containment, on six named cards; **the callout and the call to action keeping a
  plane in a treatment called Plain**; the radius token answering C.1's per-card corners;
  space 32 at ≤ 767 overriding the control; the bookmark thumbnail moving above its text; **Ghost's
  gallery script having no module**; the credit being the caption's trailing `<em>` run.

---

## 2 · Card

1. **Descriptor.** Every card on a surface panel at the article's measure — hairline, pack radius,
   warm sm shadow, 24 px padding — with the media inset inside the panel and the caption in the panel
   with it.
2. **Structural descriptor.** `article body · card · surface · variable · inline · the raised panel`
   Containment `card` and ground `surface` are the two slots this changes from 1 Plain, and they are
   the whole design. **3 Panel shares the surface and changes the containment; 6 Contrast Band shares
   the containment and changes the ground** ⚑.
3. **Archetype.** article body. **Three departures**: space 32 and panel padding 16 at ≤ 767, and the
   bookmark's thumbnail above its text at ≤ 767 ⚑.
4. **Responsive rule.** **1440** panel 720 / media 672; wide panel 1,040 / media 992; full panel
   1,296 / media 1,248; padding 24; space 48; **the caption sits inside the panel** ⚑. **834** panel
   754 / media 706; wide and full both 754. **≤ 767** panel 350 / media 318, **padding 16**, space 32,
   radius unchanged, **shadow kept** ⚑.
5. **Content fields.** The whole union. **The header card's fields are drawn without a panel** ⚑.
6. **Controls, in sidebar order.** **Space around cards** 32 · 48 · 64. **Captions** Under, left ·
   Under, centred · Hidden. **Credit line** With the caption · Its own line · Hidden. **Panel**
   Hairline · Hairline and shadow · Fill only. **Panel padding** Compact 16 · Comfortable 24 ·
   Spacious 32. **Image in the panel** Inset · To the panel edge. Then What Ghost owns.
7. **Data.** As 1 Plain.
8. **Empty state.** **The panel keeps its shape and padding whatever is absent** ⚑ — a missing field
   shortens the panel and never leaves a hole. No caption → the bottom padding closes the gap. No
   thumbnail → a panel of text. No product image → panel of text plus rating. **No cards → nothing,
   and in particular no empty panel** ⚑. **The header card gets no panel at any value.**
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, with two changes: **the panel is a `div` with no role and no
    label** ⚑, and **the panel sits inside the `<figure>`** so the figure/caption pair and the
    image → caption reading order are preserved. Focus rings draw outside the panel radius at a 4 px
    offset. Body on `surface` 13.4:1, captions 5.7:1.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — the panel taking the authored width while the media gives up 48; **no panel around
  the header card**; padding 16 at ≤ 767 overriding the control; the shadow kept at 390 and dropped in
  dark; the panel inside the figure; **Fill only existing for the packs rather than for taste**; the
  cut shadow-depth control.

---

## 3 · Panel

1. **Descriptor.** The card's ground runs past the article measure to the wide column — 1,040 at
   1440 — with the card's content held at 720 inside it and the media staying in the measure by
   default.
2. **Structural descriptor.** `article body · box · surface · variable · inline · plane past the measure`
   Containment `box` rather than `card`: **there is no border and no shadow, only a plane** ⚑, and it
   is wider than the thing it contains — which is what separates this from 2 Card, the only other
   surface-ground treatment.
3. **Archetype.** article body. **Three departures**: the plane becomes the content box at 834 and the
   measure at ≤ 767, and **the content column is 302 at 390 — narrower than A25's 350** ⚑.
4. **Responsive rule.** **1440** plane 1,040 centred, content 720 inside it, padding 32, space 56;
   media 720 · 1,040 · 1,296 on the page ground. **834** plane 754 (= the content box), content 690,
   padding 32. **≤ 767** **plane 350 (= the measure)**, content 302, padding 24, space 32 ⚑.
5. **Content fields.** The whole union. **The header card takes the plane's width rather than the
   content box** ⚑.
6. **Controls, in sidebar order.** **Space around cards** Compact 32 · Comfortable 56 · Spacious 72 —
   **this treatment's ladder, one step above 1 Plain's** ⚑. **Captions** Under, left · Under, centred ·
   Hidden. **Credit line** With the caption · Its own line · Hidden. **Plane width** Measure 720 ·
   Wide 1040 · Content 1296. **Plane** Surface · Tinted · Hairline box. **Media on the plane** In
   measure · On the plane. Then What Ghost owns.
7. **Data.** As 1 Plain.
8. **Empty state.** **The plane is only ever as tall as its content plus its padding** ⚑ — no minimum
   height, and a one-line callout on a 1,040 plane is allowed to be one line. No caption → no
   `<figcaption>`. No thumbnail → the bookmark's text takes the content column, not the plane. **No
   cards → nothing, and no plane** ⚑.
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, plus: **the plane is a `div` with no role** ⚑; **the content column
    keeps the 720 measure at 400 % zoom** — the reason it exists; the plane-to-ground step is 1.05:1
    in Paper light and **is never the only signal** (padding carries it); focus rings draw around the
    link, never the plane. **At ≤ 1023 the plane and the measure are the same width** and the
    treatment reads as 2 Card without a shadow — stated so nobody reports it as a bug ⚑.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — the plane width and the wide media rung sharing 1,040 on purpose; **space 56 as this
  treatment's default**; media staying in the measure by default; the header card taking the plane;
  **the 302 content column at 390**; the plane collapsing to the measure below 768; the cut
  plane-height and plane-alignment controls.

---

## 4 · Wide

1. **Descriptor.** Every media card renders one rung wider than the width its author gave it —
   regular at the wide column's 1,040, wide and full at the content box's 1,296 — with the text at
   the measure and the caption aligned to the media.
2. **Structural descriptor.** `media frame · none · page · variable · edge · media one rung wider`
   Archetype `media frame` because **the media, not the column, sets this design's geometry** ⚑. Media
   placement `edge`: the card reaches the content box's edge but never the viewport's — **that is
   5 Full Bleed, and it is the only slot between them**.
3. **Archetype.** media frame. Ladder: the frame narrows to its container and the caption follows it.
   **One departure** — **below 1024 the step-up has nowhere to go** and every media card is the
   content box ⚑.
4. **Responsive rule.** **1440** text 720; media regular → 1,040, wide → 1,296, full → 1,296; caption
   at the media's width; space 56. **834** text 754; **every media card 754** ⚑; caption 754.
   **≤ 767** everything 350, space 32, **caption alignment has no meaning**.
5. **Content fields.** The whole union. **`image.width` is read and then overruled** ⚑ — the one
   treatment that does not honour the authored value as given.
6. **Controls, in sidebar order.** **Space around cards** 32 · 56 · 72. **Captions** Under, left ·
   Under, centred · Hidden. **Credit line** With the caption · Its own line · Hidden. **Media steps
   up** One rung · Two rungs · Not at all. **What steps up** Images · Images and galleries · Every
   media card. **Caption alignment** To the measure · To the media. Then What Ghost owns. **The panel
   says in one line: "Regular images render at the wide column."** ⚑ This is the one treatment that
   overrules the author's width class, and without the line it reads as a bug.
7. **Data.** As 1 Plain. **A post with no media cards renders as 1 Plain** ⚑ — nothing in this
   treatment applies and nothing looks broken.
8. **Empty state.** **A media card with no caption sits wide with nothing tying it to the column** ⚑ —
   the known cost, and the reason Caption alignment: To the measure exists. No caption → no
   `<figcaption>`, space closes. One gallery image → one image at the stepped-up width. No cards →
   nothing.
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, plus: **at To the media the caption line runs 1,040 — about 130
    characters — past the 80-character guidance** ⚑, a named trade mitigated by a two-line maximum; To
    the measure is the accessible value and the panel says so. The figure/caption pair is unchanged.
    **At 400 % zoom the step-up disappears** with the wide column.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — the treatment re-resolving the author's width class; **wide and full collapsing to
  one width**; the bookmark's thumbnail excluded from "every media card"; the 1,040 caption line as a
  named accessibility trade; **no step-up below 1024**; the cut per-card width override.

---

## 5 · Full Bleed

1. **Descriptor.** A media card marked full takes the viewport's whole width and drops its corner
   radius; wide takes the content box; regular stays in the measure; the caption returns to the 720
   column beneath. Copy cards are 1 Plain's, unchanged, and **only the five media cards — image, gallery, embed, video, GIF — may bleed** ⚑.
2. **Structural descriptor.** `media frame · none · page · variable · full-bleed · the viewport-edge bleed`
   Media placement `full-bleed` is the only slot separating this from 4 Wide, and it is the right one:
   **4 Wide reaches the container's edge, this reaches the window's** ⚑.
3. **Archetype.** media frame. **Two departures**: the bleed is the viewport at every width including
   390, and **wide skips the 1,040 rung** ⚑.
4. **Responsive rule.** **1440** regular 720, wide 1,296, **full 1,440 with no radius and no
   margin**; caption 720 left-aligned to the measure; space 56. **834** regular and wide both 754,
   full 834, caption 690. **≤ 767** regular and wide 350, **full 390**, caption 350 on the 20 margin,
   space 32.
5. **Content fields.** The whole union. `image.width` is honoured and **full is re-pointed at the
   viewport** ⚑.
6. **Controls, in sidebar order.** **Space around cards** 32 · 56 · 72. **Captions** Under, left ·
   Under, centred · Hidden. **Credit line** With the caption · Its own line · Hidden. **Full resolves
   to** Content 1296 · Viewport edge. **Bleed applies to** Images · Images and galleries · Every media
   card. **Caption on a bleed** In the measure · Under, full width · Over the image, at the foot —
   **the last value disabled with its ratio shown where the carried colour fails AA on the scrim** ⚑.
   Then What Ghost owns.
7. **Data.** As 1 Plain. **An author who marks no card full sees 1 Plain with a 1,296 wide rung** ⚑.
8. **Empty state.** **A bleed with no caption closes its space and the next paragraph follows at the
   spacing value** ⚑ — no empty band, no placeholder line. A gallery with one image bleeds as one
   image. No cards → nothing.
9. **Behaviour module.** As 1 Plain, verbatim. **This treatment deliberately declares no
   `lightbox`** ⚑ — the registry's degradation is "Each thumbnail is an `<a href>` to the full-size
   image", and Ghost's image card is not a link unless the author made one, so declaring it would
   promise markup the page does not have.
10. **Accessibility.** As 1 Plain, plus: **the figure keeps its caption at 720 however wide the image
    is**; **no horizontal scroll at any width** — `100vw` with the scrollbar gutter accounted for ⚑;
    **a bleeding card scrolls beneath A1's sticky bar, never over it** ⚑; **Caption over the image
    renders on A20·13's warm scrim and is disabled with its ratio shown where the carried colour fails
    AA**.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — **the radius token not applied at the viewport edge**; wide skipping the 1,040 rung;
  only media cards bleeding, and the header card never; **no `lightbox` declared, with the reason**;
  the `100vw` scrollbar note; the sticky-header stacking note; the scrim value disabled on contrast;
  the cut scrim-strength and bleed-height controls.

---

## 6 · Contrast Band

1. **Descriptor.** The copy-bearing cards on the pack's inverted contrast colour at the wide column,
   carrying the carried text; the photograph cards — image, gallery, embed — left on the page ground
   untouched.
2. **Structural descriptor.** `article body · box · contrast · variable · inline · the inverted card plane`
   Ground `contrast` is the only slot separating this from 3 Panel, and **ground is what earns a
   design its place** — the same plane on `surface` and on `contrast` are two treatments.
3. **Archetype.** article body. **Three departures**: the band becomes the content box at 834 and the
   measure at ≤ 767; the content column is 302 at 390; **five of the twenty cards never take the
   band** ⚑.
4. **Responsive rule.** **1440** band 1,040 centred, content 720, padding 32, space 56; media 720 ·
   1,040 · 1,296 on the page ground. **834** band 754, content 690. **≤ 767** band 350, content 302,
   padding 24, space 32 ⚑.
5. **Content fields.** The whole union. **`image.caption` is always on the page ground** in this
   treatment, because media never takes the band ⚑.
6. **Controls, in sidebar order.** **Space around cards** 32 · 56 · 72. **Captions** Under, left ·
   Under, centred · Hidden. **Credit line** With the caption · Its own line · Hidden. **Band width**
   Measure 720 · Wide 1040 · Content 1296. **Which cards invert** Callout only · **Every copy card** ·
   Copy cards and the header — **the ten card types move to the help line** ("callout, toggle,
   bookmark, button, product, file, call to action, audio, HTML and signup"), so the value label stays
   a value ⚑. **Action on the band** The carried colour · The accent, re-checked —
   **the second value disabled in Paper with 3.4:1 shown** ⚑. Then What Ghost owns.
7. **Data.** As 1 Plain. **A post whose only cards are images renders with no band at all** ⚑ — the
   treatment is invisible, which is correct rather than broken.
8. **Empty state.** As 1 Plain, plus: **a bookmark with no scraped thumbnail takes the whole content
   column on the band and the 168 px is not held open** ⚑. No cards → nothing.
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, plus every derivation stated: **carried on contrast 14.8:1 light
    and 14.1:1 dark**, the muted derivation 8.2:1 and 7.9:1, **the accent 3.4:1 and 3.6:1 — failing,
    disabled, shown** ⚑. **The focus ring on the band is 2 px of the carried colour, not the
    accent** ⚑. The band is a `div` with no role. **No photograph ever sits on the band**, so there is
    no scrim and no contrast question for the five media cards.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — **five cards never inverting, at any control value**; the product card inverting
  while its photograph keeps its own plane; the band defaulting to 1,040 to share the wide media rung;
  **the accent disabled with its ratio rather than removed**; the focus ring re-derived on the band;
  the 302 content column at 390; the cut band-colour and per-card invert controls.

---

## Findings for the architect

Seven; five new. In full on the proof frame.

1. **Ghost's callout palette is nine literal colours and the pack ships seven roles.** ⚑ No mapping
   keeps both. **Closed by the pass**: the mapping is a Cards-module control, site-wide, next to the
   treatment, defaulting to Pack tokens. Not a Style Pack setting — the pack ships the roles, the
   module decides what Ghost's literals do with them.
2. **Ghost's gallery card ships its own row-ratio script and the registry has no module for it.** ⚑
   FR-G7 is closed. A33 declares `core`. Second occurrence of a Ghost-owned script with no registry
   entry — the toggle card is the first.
3. **C.1's ownership matrix lists "corners" as a per-card setting for eleven cards; A33 answers with
   the pack's radius token and offers no control.** ⚑ Still open with C.1, and now visible: corners
   appears in every card panel's read-only **"From the {treatment} treatment"** block on S14, so a
   user sees where the value came from instead of meeting two controls that disagree. C.1's matrix and
   per-card panels should still be amended.
4. **A treatment re-resolves the author's width class, and so does a section.** ⚑ A25·3 and A25·5
   overrule the Cards module for their own ground; A33·4 and A33·5 do it site-wide. A33's answer: the
   section wins inside its own ground, the treatment wins everywhere else. **Closed by the pass**: it
   is now a read-only help line on the Cards panel — "Sections may resolve card widths differently
   inside their own ground."
5. **The toggle card's open/close script is Ghost's, not the theme's.** ⚑ `accordion`'s degradation is
   true of Ghost's markup, but the module the build compiles has nothing to do here.
6. **A33 has no section, so its tuples describe the card.** ⚑ The reconciliation pass should expect
   that; read otherwise, all six collapse to `none · page`.
7. **Six treatment controls plus a per-card panel's six means a user meets up to twelve controls to
   style one callout.** ⚑ **Closed by the pass**: the treatment writes the whole set and the per-card
   panel carries only what is that card's own, with everything the treatment claimed shown read-only
   in it. Both live on the Editor Cards screen (S14) — treatment above, card panel below — and the
   section sidebar's Cards module reduces to the Treatment picker and a link.

---

## Component inventory — cumulative

**Established in A33 (twelve).**

| Component | What it is | First from |
|---|---|---|
| Card plane vocabulary | The four grounds a Koenig card may sit on — none, panel, plane, band — and the rule that a treatment picks one for every card at once | A33·1–3, 6 |
| Caption and credit pair | 13.5 px caption in `text-muted` with the credit as the caption's trailing `<em>` run, inline or on its own 13 px line | A33·1 |
| Width resolution table | What Ghost's regular, wide and full resolve to, per treatment and per width | A33·1 |
| Bookmark card | One link: text column, publisher line with a 16 px icon, 168 px thumbnail right, thumbnail above at ≤ 767 | A33·1 |
| Toggle card | Native `details`/`summary` with a 24 px chevron and a hairline divider | A33·1 |
| File card | Title, description, mono `filename · size`, 44 px download glyph right | A33·1 |
| Product card | Image, title, description, five-star rating with its text equivalent, one action | A33·1 |
| Koenig header card | Three sizes (232 · 312 · 400 min-height), centred heading, subheading, action on a plane | A33·1 |
| Embed frame | A provider iframe in an aspect box: the theme owns frame, radius and caption, nothing inside | A33·1 |
| Gallery row | Up to three plates per row at Ghost's computed ratios with one gutter token | A33·1 |
| Markdown pass-through | The one card with no wrapper class: A25's type verbatim, and no A33 control reaches it | A33·1 |
| HTML card frame | The author's markup with a visibility chip, and the theme owning only the space around it | A33·1 |
| Divider | A bare `hr`: weight, width, the space around it, and **an optional centred glyph in a P0·2 icon slot** (CSS pseudo-element, `aria-hidden`) | A33·1 |
| Reduced Cards module | Treatment picker + "Open Editor cards →" in the section sidebar; the treatment's controls live on S14 | A33 reconciliation |
| Card-panel treatment block | The read-only "From the {treatment} treatment" rows inside a per-card panel | P0·7 → A33 |
| Email-content stub | A dashed outline at 42 % opacity saying, on the frame, that nothing renders on the web | A33·1 |
| Call-to-action card | Sponsor eyebrow, copy, image and one action, with its audience named on the frame | A33·1 |
| Public-preview marker | A ruled label where Ghost cuts the response; A32 renders what comes after | A33·1 |
| GIF badge | The image card with a 9.5 px mono GIF badge inset 10 px from its top-left corner | A33·1 |
| Audio player shell | 64 px thumbnail, title and sub, 44 px round play, 4 px progress with the accent, mono times, 1× | A33·1 |
| Video player shell | Poster with a 64 px round play and a 34 px control bar inset 12 px, over the pack's radius | A33·1 |
| Signup card | Copy column beside a 360 px field-and-button stack, on a plane the author colours inline | A33·1 |
| The bleed rule | The radius token is dropped at the viewport edge and nowhere else | A33·5 |
| On-band card derivation | Action becomes the carried colour, focus ring 2 px carried, divider carried at 20 % | A17·7 → A33·6 |

**Reused verbatim (ten).**

| Component | What it is | First from |
|---|---|---|
| Primary button | Accent fill, 14–15 px/600, radius token | A1·1 |
| Striped image plate | The placeholder with a mono crop caption, one stripe pair per mode | A4 → A19 |
| Warm scrim | The one scrim over a photograph, contrast-checked; used only by 5 Full Bleed's caption-over value | A20·13 |
| Focus ring | 2 px accent at a 4 px offset, re-derived to carried on contrast | A6 → A17·7 |
| Missing-image rule | A missing photograph reflows or hands off; never a grey box | A19 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; named values, never numeric in a control | A17 |
| Article measure and body type | 720 · 754 · 350; body 19/1.7 | A25 |
| Site bar and footer neighbour | The chrome every frame is drawn inside, at low opacity | A1·1, A3·1 |
| Sidebar control kit | Segmented row, select, picker, help line, disabled value with its ratio | Editor Sidebar Kit |
| Tile and spec card | The 634 / 652 / 1,288 canvas furniture these frames are annotated with | A23 |
| Icon slot + Icon Picker | The only place an icon may exist; Tabler grid, chips, recent row, size / colour-role popover | P0·2 |
| Editor Cards screen | The standalone surface hosting the treatment picker and every card's own panel | P0·7 (S14) |
| Reset to Ghost default | Per-card reset with its confirm; "Posts keep their content." | P0·7 (S14) |

---

## Reconciliation notes

**Frames changed in this pass.** `A33-1 Plain` (control panel; **new frame** — the divider's icon
slot, filled, empty and at rest, with the divider card's panel) · `A33-2 Card` (control panel) ·
`A33-3 Panel` (control panel) · `A33-4 Wide` (control panel + the wide-column line) ·
`A33-5 Full Bleed` (control panel) · `A33-6 Contrast Band` (control panel). In all six the panel
now names its surface (Editor cards · S14), carries the Callout colours mapping next to the treatment
rather than among the read-only rows, documents the credit convention on the Credit line control, and
states the width-precedence and no-inline-editing help lines. **No section frame changed**: nothing in
this pass alters what a card looks like on the page.

**Where the pass overruled an earlier A33 ruling.**

1. **Surface.** A33 said "the same surface as C Post Body's card module, per-card panels underneath".
   The pass names that surface the **Editor Cards screen (S14)** and reduces the section sidebar's
   Cards module to the Treatment picker plus a link. The pass wins; Finding 7 closes with it.
2. **Callout colours.** A33 drew the mapping inside "What Ghost owns" (six read-only rows, one of them
   editable). The pass moves it up beside the treatment as a module control; the read-only group is
   **five rows**. The pass wins; Finding 1 closes with it.
3. **Divider glyph.** A33's inventory read "an optional centred glyph". The pass makes it a **P0·2 icon
   slot** with the Icon Picker and its size / colour-role popover. The pass wins. It remains a CSS
   pseudo-element — A33 still adds no markup to `{{content}}`.
4. **Credit convention.** A33 flagged the trailing-`<em>` reading as invented and left it implicit.
   The owner's ruling keeps the convention and makes it **visible**: help text on the Credit line
   control, one example in the treatment preview. Both hold; nothing is redesigned.
5. **Corners.** C.1's matrix still lists corners per card; A33 still answers with the pack's radius
   token and offers no control. **Unresolved with C.1**, now merely visible — corners shows in every
   card panel's read-only treatment block. Finding 3 stays open.
6. **Universal controls.** The pass's rule 3 requires Background role, Vertical spacing and Top
   divider on every placeable section. **A33 places nothing**, so it carries none, and *Space around
   cards* is not a renamed Vertical spacing. Recorded rather than complied with.
7. **Image focus (rule 10) and button icons (rule 11) are declined with reasons** — media never crops
   here, and Ghost's button card has no icon field A33 could fill without writing markup. Both are the
   pass's rules yielding to Ghost's data surface, not to taste.
8. **Ghost-owned scripts.** The gallery's row ratios, the two players, the signup post and the embeds
   are Ghost's scripts with no registry module. The pass coins none: A33 still declares `accordion`
   and `core`, and Finding 2 stays open. **No "ARCHITECT: registry addition" is raised** — this pass
   adds no behaviour.
9. **Control count.** The roster still reads 6 per treatment (the treatment's own). The module's
   seventh row, Callout colours, is site-wide and counted once, not six times.
