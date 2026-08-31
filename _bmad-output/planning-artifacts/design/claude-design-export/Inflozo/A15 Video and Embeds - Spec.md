# A15 Video and Embeds — written specification

15 designs · Paper pack · drawn 23 August 2026 · controls-reconciliation patch 24 August 2026 ·
**design patch pass 29 August 2026**

**Design patch pass — 29 August 2026 (this document's current state).** Three rulings landed on this
category and all three deleted drawn content. **There is nowhere to upload to** — Ghost's public
interface has no media library a theme can read, Inflozo is not permitted to put files on a customer's
Ghost, and Inflozo's own asset system handles images only — so **the Upload source is deleted from all
fifteen designs**, **the ambient-loop background-video option and the whole Playback row go with it**,
and **nothing reads a duration off a file**: the duration is typed by the author again, seeded from the
provider on paste where the provider supplies one. **Embeds are unaffected**: YouTube, Vimeo and the
audio providers keep every design, every facade, every click-to-load notice and their refusal to
autoplay, and **a pasted Ghost media URL still works** — it is first-party and renders the native
player. Three library rules also landed: **Gap is renamed Tight · Normal · Loose** in 7 Grid and 8 Lead
and Grid at the same 8 · 24 · 40 px, **five hand-off phrases are deleted** so that no design turns into
another, and **the two free designs were shortlisted and put to the owner**. **Nothing was renumbered.**
Every change is listed with the name of the rule or the platform fact that required it in **Patch
notes** at the end.

**[Free] designs:** 1 Player · 12 Embed Card

*(Shortlisted in this pass — 1 Player, 12 Embed Card, 14 Slim Bar, 3 Panel, 13 Thumb Rows — and
**confirmed by the owner on 29 August 2026**: the category default plus the one design that needs no
photography at all.)*

The frames are `A15-0 Category Proof.dc.html` and `A15-1` … `A15-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation patch (this document's current state), 24 August 2026.** The category was
audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface,
thinking like an end user editing their own site. It reuses the shared editor primitives designed in
**P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot
and Icon Picker, the P0·3 item list, the P0·4 member-aware action editor, the P0·5 "Populate from…"
data panel and the P0·6 editor state switcher — and **never redesigns them**. **No layout was
redrawn in this pass**: what changed is the control panels, the item list, the editing, behaviour and
data statements, one retired control row, one dropped rule, one new per-item field and one whole
branch of the category that was never specified — ~~the uploaded file~~, **deleted again in the design
patch pass of 29 August 2026**. The category-wide list is on
`A15-0 Category Proof` and the frame-by-frame list is in **Reconciliation notes** at the foot.

**One fact of the category is amended and stands** ⚑: **settlement 3's "never the provider's thumbnail"
is narrowed to "never fetched by the reader"** — the editor may fetch one on paste and re-host it.
~~The **Source: Upload** branch is now specified and is first-party~~ — **that branch is deleted in the
design patch pass of 29 August 2026**, and what survives of it is the pasted Ghost media URL, which is
first-party for the same reason and has no facade, no notice and a typed duration. Everything the
category says about embeds is unchanged.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(1 Player in three packs, light and dark), the stress frame, the roster, the component inventory,
the two findings, the four settlements in full and — new in this pass — the controls-reconciliation
block. The shared field list is repeated below because the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; the finished categories are specified in root-level
`<ID> - Spec.md` files and this follows them.)*

---

## 0 · The category layer

### What A15 is

**A section that plays a film, or holds an embed, that the author pasted a URL for.**
Like A14 it has **no query behind it** ⚑ — nothing is read from Ghost's content API, every item is
authored in the section, and the count is the length of the list. **Every item is a URL the author pasted** ⚑, and
**it is one of two kinds, derived from the URL itself and never set by a section value**:

- **Embed** — a recognised provider URL. Third-party, and the reason three of the four settlements
  exist: the facade, the notice, click-to-load, no autoplay at any value.
- **A media URL on the site's own Ghost** — a pasted address pointing at a file the customer already
  has. **First-party**, so it renders a native `<video controls playsinline preload="none" poster="…">`:
  **no consent notice, no facade**, **the no-JS state is the native player itself**, and **the duration
  is typed, because nothing can read it off a file** ⚑. One list may hold both kinds. **There is no
  upload anywhere in A15** ⚑ — no media library a theme can read, and no file Inflozo may put on a
  customer's Ghost.

Four neighbours own adjacent ground and A15 does not repeat them. **A4·10 Video Poster** owns the
hero with a film behind it and **opens A15's theatre** — its spec says "A15 owns the player inside
it", and this pass has drawn it. **A33 Koenig Card Treatments** owns the video and embed cards inside
`{{content}}`, laid out by Ghost's own rules, which **none of A15's controls reach** ⚑. **A14
Galleries** owns still photographs. **A25 Post Content Layouts** owns the page a transcript lives on.
**A32 Paywall** owns a members-only film — A15 carries no member ask of its own.

A15 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20;
64 · 96 · 132); **A17·7's on-contrast derivation**; **A14·11's warm scrim**; **A14's short-last-row
and never-stretch rules**; **A19·15's carousel track, dots and arrows**; **A5·12 and A9·5's tab strip
and tab semantics**; **A18·2's thumb row**; **A9·15's ledger row**; **A26·3 and A27·4's surface plane
and their call that a full-width fill is a ground rather than a containment**; **A16·1's 1,080
collapse**; **A9·8's disabled-value convention**; **A6's focus ring** with **A17·18's inset rule**;
**A2·1 and A16·9's bar**; **A3's repeater**, now the **P0·3 item list**; **A1's eyebrow, striped
plate and active-item underline**; and **A4·10's `videoDuration` field**, typed by hand and seeded where a provider supplies one.
**A15 adds thirteen components** — they are listed on the proof frame.

### The four settlements (§8 of the brief)

**1 · Poster frame versus autoplay-muted, and what plays on a phone.** **A poster frame, everywhere,
and no embed autoplays at any value in any design** ⚑. No autoplay control on an embed, no
muted-loop control, and **no hover preview** ⚑. **On a phone the film loads in the frame**,
`playsinline`, in the same reserved box ⚑; **A15 never asks for full screen**. **The one thing that
changes at 390 is the theatre** ⚑ — Plays: In a theatre falls back to In the frame — **and 14 Slim
Bar is the exception**, opening the theatre at every width because an 88 px row has no frame to fall
back to ⚑. **Amended for uploads on 24 Aug 2026 and withdrawn on 29 Aug 2026** ⚑: ~~on Source: Upload the Data
group carries Playback — Click to play · Ambient loop~~. **The Playback row is deleted with the upload
source** — the ambient loop had no source of files — so **the blanket refusal stands exactly as first
written**: no autoplay value, no muted-loop value and no hover preview anywhere in A15. **The poster is what the reader sees until they act, under reduced motion and with no JavaScript alike** ⚑.
**Embeds keep the blanket refusal** — the facade exists to prevent the request, and a request is what
an autoplaying embed is.

**2 · Holding the aspect ratio while the embed loads.** **The box is reserved in CSS before anything
loads** ⚑: every frame is an `aspect-ratio` box and the poster, the notice, the native player and the
provider's iframe all sit inside it at `inset: 0`. Nothing moves when a film is played. **There is no
"as the provider reports it" value** ⚑ — the ratio must be known before the request is made, and
asking is the request. **A film at another ratio letterboxes inside the box** ⚑. **One exception, and
it is a control value:** 12 Embed Card's **Audio bar** is a height — 160 px, 120 at 390 ⚑ — because an
audio player has no aspect.

**3 · A consent or click-to-load placeholder.** **Every third-party embed is click-to-load and there
is no value that turns it off** ⚑. **A first-party file — a media URL on the site's own Ghost — has neither notice nor facade** ⚑ — there is
no third party to warn about. **The poster is the author's image, and if there is none it is the
plate** ⚑. **Amended, 24 Aug 2026** ⚑: the rule was "never the provider's own thumbnail"; it is now
**"never fetched by the reader"**. The editor may fetch one on paste — **"Use provider thumbnail"
downloads the image and re-hosts it as the poster** — after which it is served first-party like any
other upload. **The privacy goal is the reader's browser, not the editor's**, and the facade still
prevents every third-party request a reader would otherwise make. **The notice is drawn on the frame
at the moment the reader acts** ⚑; **12 Embed Card moves it above the frame and has no Off value** ⚑.

**4 · Caption, credit and transcript.** **Three fields, three jobs** ⚑: `description` is the film's
own line, drawn in 13 and 15 and stored everywhere else; `credit` is the section's, under the set in
fourteen designs; `transcriptUrl` is per film. **A transcript is a link, never a panel** ⚑ — A15 does
not host transcript text, and **A25 owns the page it points at**. An `accordion` of transcript text
was considered and refused. **Where a design has no meta row the transcript travels into the
theatre** ⚑ — 6 Cover and 14 Slim Bar — and the panel says so. **Meta: Off never deletes the link** ⚑.
**The link's own words are authored** ⚑ — `transcriptLabel`, default "Transcript" — because
publications call it a text version, a full transcript or a script.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The frame.** A `<figure>` whose anchor wraps the poster; **the whole frame is the target** and
  **its accessible name is the film's title plus its duration** ⚑, never "Play". Hover grows the play
  control 2% and underlines the title, 160 ms ease-out; **focus draws A6's 4 px accent ring 3 px
  outside the frame** ⚑ (inset at a page edge, A17·18); **reduced motion drops the growth and keeps
  the underline** ⚑. **Where a film has no title the name falls back to the provider** ⚑ — see 7 Grid.
- **The play control.** 64 px on a single-film frame, **44 in a grid cell and at 390**, 88 at full
  bleed and on 6 Cover ⚑. **It is never the accent** ⚑ — a coloured fill over a photograph nobody has
  seen cannot be checked for contrast (A14·11's finding, in a new place). **It is not an icon slot** ⚑
  — A15's own component, its glyph not swappable. **The duration pill** is the carried colour on a 76%
  contrast wash, **identical in both modes** ⚑. **On a first-party media URL the browser draws its own
  controls inside the loaded player and the theme does not restyle them** ⚑.
- **The meta line.** 13 px in `text-muted`: duration · transcript, with the provider added at the
  values that name it. **The credit is one 13 px line under the set** ⚑, in fourteen designs.
- **The count.** **There is no Show ladder in A15** ⚑ — A17's 3 · 6 · 9 · 12 counts a query and there
  is none here. **1–24 items** ⚑. **Eight designs draw item 1 and keep the rest** ⚑.
- **The seam.** A15 draws its own padding: **64 · 96 · 132** at 1440, **80** at 834, **64** at 390 —
  and since this pass **that ladder is the universal Vertical spacing** ⚑, not a per-design row.
  **4 Contrast Band has no padding of its own** — Vertical spacing resolves onto the band's inner
  padding ⚑. **5 Full Bleed keeps vertical spacing and has no side padding at any width** ⚑. **6 Cover
  had no padding row at all and now has Vertical spacing** ⚑, which sets only the space above and
  below the picture.
- **The universal trio.** **Background role · Vertical spacing · Top divider, outside every design's
  own list** ⚑. Background role is **locked in three designs, with the reason shown in the row** ⚑ —
  4 Contrast Band (the inverted band is the design), 5 Full Bleed (the section paints no ground; the
  film is the only fill) and 6 Cover (the picture is the ground). **Top divider is None by default in
  all fifteen**, so no drawn frame changed.
- **The collapse.** Each archetype's own ladder, departures named per design. **2 Split and 10
  Playlist collapse at 1,080** ⚑ (A16·1's number). **Grids go to one column at 390 rather than two** ⚑
  (A14's step). **The aspect never changes with the width** ⚑.
- **The type.** Eyebrow 13 uppercase tracked .08em · heading 40 · 34 · 28 by width (34 in 3 Panel, 46
  on 6 Cover) · blurb 17, 16 at 390 · film title 17 in a cell, 24 in a row, 22 in a queue ·
  description 15 · meta and credit 13 · mono 10–12 for frame labels and timecodes. **A15 has no Big
  Type design** ⚑ — the display moment is the film.
- **Accent, once or never.** The focus ring in thirteen designs; the active dot in 9; the active
  underline in 15; the action in 2 and 14. **None at all in 4 Contrast Band and 6 Cover** ⚑, where the
  ring takes the carried colour with a 1 px dark outline (A29·3's 4.0:1 finding).
- **Imagery.** **A15 never dims, tints or filters a poster** ⚑ — not for dark mode, not on a band, not
  behind a caption. The ground changes; the pictures do not. **Every poster carries Image focus —
  Centre · Top · Bottom** ⚑, reached from the Image Picker popover and never a hidden field.
- **Print.** **Every design prints its poster, its title, its meta line and its URL** ⚑. **4 Contrast
  Band's band itself does not print** — its head, film, meta line and URL print on white (A17·7); **9 Carousel prints its slides stacked** in authored
  order; **15 Tabs prints every panel stacked with its label** ⚑.

### The roster

| # | Design | What it is | Tuple | Ctl | Module |
|---|---|---|---|---|---|
| 1 | **Player** | One film at 960, centred under its head. | `media frame · none · page · one · top · one film at the content width` | 5 | `video-facade` |
| 2 | **Split** | The film beside its text and a labelled action. | `split · none · page · one · right · a labelled play action beside the frame` | 5 | `video-facade` |
| 3 | **Panel** | The whole block on a raised surface plane. | `media frame · none · surface · one · top · the film on a raised plane` | 5 | `video-facade` |
| 4 | **Contrast Band** | 1 Player on a full-bleed inverted band. | `media frame · none · contrast · one · top · the film on an inverted band` | 5 | `video-facade` |
| 5 | **Full Bleed** | The film at the viewport's width, square-cornered. | `media frame · none · transparent · one · full-bleed · no margin at any width` | 5 | `video-facade` |
| 6 | **Cover** | The head on the poster, on a warm wash. | `overlay · none · image · one · background · the head on the poster` | 6 | `video-facade` |
| 7 | **Grid** | Six films in three even columns. | `grid-of-N · none · page · many · top · even posters in three columns` | 5 | `video-facade` |
| 8 | **Lead and Grid** | Item 1 at the content box, the rest in a row. | `grid-of-N · none · page · many · inline · one lead film above the row` | 5 | `video-facade` |
| 9 | **Carousel** | One film at a time, neighbours peeking. | `carousel · none · page · many · inline · one film at a time` | 5 | `carousel` + `video-facade` ⚑ |
| 10 | **Playlist** | A player and its queue on one plane. | `split · none · surface · many · left · a queue beside the player` | 5 | `tabs` + `video-facade` ⚑ |
| 11 | **Chapters** | A film and a timecoded contents list. | `table · none · page · many · top · timecoded rows under the player` | 5 | `video-facade` ⚑ |
| 12 | **Embed Card** | One embed in a box that names its provider. | `media frame · box · page · one · inline · a bordered embed naming its provider` | 5 | `video-facade` ⚑ |
| 13 | **Thumb Rows** | One film a row, poster left, description right. | `stack · none · page · few · left · a ruled row per film` | 5 | `video-facade` |
| 14 | **Slim Bar** | One 88 px line that opens the theatre. | `bar · none · surface · one · left · one line, the film summoned` | 4 | `video-facade` |
| 15 | **Tabs** | One shared frame behind a tab per film. | `media frame · none · page · variable · inline · a tab per film sharing one frame` | 5 | `tabs` + `video-facade` ⚑ |

**Two of the fifteen are free**, and the `**[Free] designs:**` line at the head of this document is the
merge's only input: **1 Player · 12 Embed Card**, the owner's own choice, confirmed on 29 August 2026.

**Ctl counts the design's own controls only.** Every one of the fifteen also carries the **universal
trio** (Background role · Vertical spacing · Top divider) and the **Data group** (Source,
with the seeding and provider statements), and 11 Chapters carries **two item blocks**. The PRD's
ceiling is ~15 visible controls per design; **A15's widest panel is six** ⚑. **Quick Controls are
three per design** and named on each panel's footer.

### Tuple uniqueness — the honest statement

All fifteen are distinct on the five closed slots. **Archetype**: six `media frame`, two `grid-of-N`,
two `split`, and one each of `overlay`, `carousel`, `table`, `stack` and `bar` — a wider spread than
A14's, because a film can be one thing large or many things small and both are real sections.
**Ground separates the six media frames**: `page` (1, 15), `surface` (3), `contrast` (4),
`transparent` (5), and `page` with `box` containment (12). **Containment is `none` in fourteen of
fifteen** ⚑ — only 12 Embed Card puts the section itself in a container.

**What the check cannot promise.** **1 Player and 3 Panel are a fill apart** and separate on ground —
the judgement that a plane lifts is a designer's. **7 Grid and 8 Lead and Grid share ground and count
class** and separate on media placement, which is the size of the lead. **10 Playlist and 15 Tabs both
swap one frame from a list** and separate on archetype, ground and count class; the difference that
matters is that a queue shows what is next and a tab strip shows what else there is. Each panel names
its neighbours by number ⚑.

### The content — the shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | all fifteen | Drawn in 14's meta line rather than above it ⚑ |
| `heading` | text | opt | 60 ch | all but 14 | 14 stores it and never draws it ⚑ |
| `blurb` | text | opt | 200 ch | all but 6, 14 | 6 and 14 store it and never draw it ⚑ |
| `credit` | text | opt | 60 ch | all but 14 | Under the set, never in the head ⚑ |
| `queueLabel` | text | opt | 20 ch | 10 | Default "In this series"; an `h3` ⚑ |
| `embedKind` · `embedLabel` | text | opt | 20 · 32 ch | 12 | Defaults derived from the URL ⚑ |
| `playLabel` | text | opt | 20 ch | 2 | **New this pass** ⚑ — default "Play"; the duration suffix is generated |
| `watchLabel` | text | opt | 20 ch | 14 | **New this pass** ⚑ — default "Watch"; suffix generated |
| `openLabel` | text | opt | 24 ch | 12 | **New this pass** ⚑ — default "Open on {provider}" |
| `transcriptLabel` | text | opt | 20 ch | all but 6, 14 | **New this pass** ⚑ — default "Transcript" |
| `videos[]` | list 1–24 | **req** | 24 ⚑ | all fifteen | The repeating unit; authored, never queried |
| ↳ `url` | url | **req** | — | all fifteen | **A pasted URL** ⚑ — a provider embed, or a media file already hosted on the site's own Ghost; the provider is derived from the URL. **No upload** ⚑ |
| ↳ `title` | text | opt | 70 ch | all fifteen | Names the anchor; **seeded from the provider on paste** ⚑ |
| ↳ `description` | text | opt | 160 ch | 1, 5, 13, 15 | **Drawn only in 13 and 15**; stored everywhere ⚑ |
| ↳ `poster` | image | opt | — | all fifteen | Carries **Image focus** (Centre · Top · Bottom) ⚑; may be the re-hosted provider thumbnail |
| ↳ `duration` | text | opt | 8 ch | all fifteen | **Typed by the author** ⚑, seeded from the provider on paste where the provider supplies one. **Nothing reads it off a file** ⚑ |
| ↳ `start` | text | opt | 8 ch | all fifteen | **New this pass** ⚑ — appended to the watch-page href and to the loaded player |
| ↳ `transcriptUrl` | url | opt | — | all fifteen | Settlement 4 — a link, never a panel ⚑ |
| ↳ `tabLabel` | text | opt | 26 ch | 15 | Drawn at Tab labels: Custom only ⚑ |
| `chapters[]` | list 1–24 | opt | 24 | 11 | **The second repeating unit** ⚑ — `time` ≤ 8, `label` ≤ 70, both required |
| *the position* | generated | — | — | 8, 10, 11, 15 | The lead; the row index; **"Film {n}"**, a catalog string ⚑ |
| *@site.title* | Ghost | req | — | any design with no heading | The section's `aria-label` where none is authored ⚑ |

**Ten authored section strings, one authored list of eight fields, one second list of two, and
nothing read from Ghost but the site title.** Switching between any two of the fifteen preserves
everything the author typed. **The one real cost is the 70-character title limit** ⚑ — 13 Thumb Rows
would carry 120 and is held to 70 so switching to 7 Grid never truncates a cell. **The second cost —
the typed duration — stands** ⚑: nothing can read a duration off a file and a provider does not always
supply one, so **10 Playlist's running total is absent when any film has none**, exactly as first drawn.

**Control-written values** (thirty-seven per-design, none of them per-item): `width` · `aspect` ·
`alignment` · `meta` · `plays` · `mediaSide` · `columns` · `action` · `head` · `bandEdges` ·
`caption` · `height` · `textPosition` · `scrim` · `playControl` · `gridColumns` · `gap` · `leadSize` ·
`peek` · `carouselControls` · `queueSide` · `queueHeight` · `numbering` · `chapterList` · `rules` ·
`timecodes` · `shape` · `label` · `notice` · `openLink` · `thumbSide` · `thumbSize` · `description` ·
`thumbnail` · `edges` · `tabLabels` · `tabAlignment`. **`padding` is retired** ⚑ into the universal
`verticalSpacing`; **`backgroundRole` · `verticalSpacing` · `topDivider` are universal**; and
**`playback` is deleted** ⚑ with the upload source it belonged to. **The only item-level value that is not content is
`tabLabel`** ⚑, and it is content.

### Editing — the P0 primitives, and the strings

**Every visible line edits inline on canvas** with the **P0·1** toolbar — bold · italic · underline ·
link, the link popover carrying **Open in new tab** and rel **nofollow · noreferrer · sponsored**:
eyebrow, heading, blurb, credit, film titles, descriptions, `queueLabel`, `embedKind` and
`embedLabel`, chapter labels, custom tab labels and the action labels. **A15 reads nothing from Ghost
but `@site.title`** ⚑, so **no line in A15 is Ghost-owned** and none shows the "Edit in Ghost" lock;
the site title is a fallback `aria-label`, not a field. **Every URL field opens the Ghost-aware Link
Picker** — `transcriptUrl` and per-item URLs included. **Buttons accept an optional icon** before or
after the label from the **P0·2** Icon Picker with its size / colour-role popover, **off by
default** ⚑; **the play control is not an icon slot**.

**No fixed English visitor-facing string ships** ⚑, and each is decided per string:

| String | Where | Decision |
|---|---|---|
| "Play" · "Watch" · "Open on {provider}" | 2, 14, 12 | **Authored fields** — `playLabel`, `watchLabel`, `openLabel`, with defaults |
| "Transcript" | every meta row | **Authored field** — `transcriptLabel`, default "Transcript" |
| The duration suffix on an action | 2, 14 | **Generated** — never typed, never authored |
| The notice sentence and its load action | every embed | **Catalog strings**, the provider interpolated |
| The theatre's close, its counter | all fifteen | **Catalog strings** |
| "Now playing" · the running-total prefix | 10 | **Catalog strings** |
| The dead-URL line | all fifteen | **Catalog string** |
| "Film on {provider}" | 7 (new) | **Catalog string**, the derived provider interpolated |
| "Film {n}" | 15 | **Catalog string**, the position interpolated |

### Repeating items — the whole category

**The videos block is the P0·3 item list** ⚑: **add arrives with content · remove is never disabled ·
drag reorders · per-item content only**. **Add is one paste field** ⚑ — a provider URL, or a
media URL already on the site's own Ghost — and the new film **lands last**, **carrying its URL as its
title until the author types one or the seeding fills it** ⚑; never a blank shell. **Remove is never
disabled** ⚑ — **changed in this pass**: the old rule disabled it at one film, which contradicted the
category's own zero state (a paste field at 0). **Removal may empty the list**; **at 0 the section
does not render on the published page** ⚑ and the editor draws that one paste field. **Drag reorders,
and authored order is drawn order in all fifteen** ⚑. **Order is meaningful in ten designs** — the
lead in 8, the running order in 9 and 10, the tab order in 15, and the drawn film in the eight
single-film designs; **it is reading order only in 7 and 13**, and those panels say so. **1–24** ⚑;
**at 24 Add is disabled** with the reason shown.

**Inside an item the author edits content only** ⚑ — URL, title, description, poster and its
Image focus, duration, start timecode, transcript link, and `tabLabel` in 15. **No layout, spacing,
alignment or emphasis** — every design control writes one value onto the section, so **"make film 3
bigger" is not expressible by construction**; where a set needs one film larger that is 8 Lead and
Grid, **and the lead is item 1, chosen by reordering** ⚑.

**`start`, new this pass** ⚑ — ≤ 8 characters, optional, per item. It is **appended to the watch-page
href and to the loaded player**: the mechanics 11 Chapters already uses for a chapter row. "Start at
1:32" is the commonest per-film ask in the category and it needed no new module.

**Empty optional fields.** No title → the sidebar row shows the URL, the cell is its
poster and meta alone, and **the anchor's accessible name falls back to "Film on {provider}"** ⚑
(**10 Playlist draws the URL instead** ⚑, because a queue row with no name cannot be chosen). No
poster → the plate, naming the provider. No duration → no pill and the meta row closes up. No
transcript → the link is absent, not disabled. No description → the row or caption closes up.

**11 Chapters carries the only second list** ⚑ — `chapters[]`, 1–24, `time` and `label` both required,
added rows landing last carrying "New chapter", **never sorted** ⚑, a backwards timecode published as
typed with a warning dot in the sidebar. **Its Remove is never disabled either**, and the list's
absence is a state the design draws (it becomes 1 Player).

### Data — no Ghost query, and two branches of media

**Nothing is read from Ghost's content API** ⚑: no Show ladder, no From posts branch, no filter. The
count is the length of the authored list; `@site.title` is the only Ghost value.

- **Source · per film — derived from the URL** ⚑, read-only in the panel and **never a section value**:
  a recognised provider is third-party and takes the facade, the notice and click-to-load; a media URL
  on the site's own Ghost is first-party and takes the native player. **The Upload value is deleted** ⚑
  — there is nowhere to upload to.
- **Playback is deleted** ⚑ — ~~Click to play · Ambient loop~~ — with the upload source: the ambient loop
  had no source of files, and the struck values in **14 Slim Bar** and at **12 Embed Card's Audio bar**
  go with the row. **Nothing autoplays anywhere in A15.**
- **Editor-side seeding on paste** ⚑: the editor fetches the **oEmbed title once**, and the **duration
  where the provider supplies one**, and seeds those fields; **"Use provider thumbnail" downloads the
  image and re-hosts it as the poster**. **Nothing reads a duration off a file** ⚑, so where no provider
  duration arrives the author types it. Both fields stay editable and a typed value wins.
- **Recognised providers, named** ⚑ — video: **YouTube · Vimeo**. Audio, for 12 Embed Card:
  **Soundcloud · Spotify · Apple Podcasts · Bandcamp · Mixcloud**. **An unrecognised URL takes 12
  Embed Card's link-out fallback in all fifteen designs** ⚑: the frame is drawn, the label reads the
  domain, and the frame is a link rather than an iframe — nothing goes in an iframe the theme cannot
  name.
- **Member Visibility is not offered in A15** ⚑. No design carries an auth or subscribe action; 2
  Split's and 14 Slim Bar's action rows are play triggers for content already on the page. **A
  members-only film is A32 Paywall's ground** and A7 owns the ask. Recorded rather than invented.

### Findings

1. **Seeking a loaded player is behaviour no module covers** ⚑ (11 Chapters). `video-facade` covers
   the swap from poster to player and stops there. The design avoids needing it: every chapter row is
   an `<a href>` to the canonical URL with the provider's time parameter, so with no script it
   navigates and with the module running the frame reloads at that start time. **The new per-item
   `start` field uses the same mechanics.** Flagged **ARCHITECT: registry addition** on the frame;
   closest module `video-facade`; **no module name is coined**.
2. **The registry has no facade for a non-video embed** ⚑ (12 Embed Card). It declares `video-facade`
   and reads the degradation as the embed's canonical page. Flagged **ARCHITECT: registry addition**;
   **a general `embed-facade` is the architect's call and A15 does not name one**.
3. **Withdrawn, 29 August 2026** ⚑ — ~~gating an ambient loop on `prefers-reduced-motion` is behaviour
   no module covers~~. **The ambient loop is deleted with the upload source**, so there is no behaviour
   left to gate and **the registry addition is withdrawn**. The number is kept rather than closed, so
   findings 4 and 5 are not renumbered. **Two registry gaps stand: findings 1 and 2.**
4. **`tabs` puts headings in its no-JS branch** ⚑ (10 Playlist, 15 Tabs). The registry's degradation
   is "All panels render stacked and visible, each preceded by its tab label as a heading" — headings
   neither design otherwise puts in the outline. **Settled once with A13's Walkthrough** and carried
   here rather than re-argued; both frames carry the **ARCHITECT: `tabs` registry ruling** flag until
   the ruling lands.
5. **Resolved: A4·10's `<button>` versus `<a href>` disagreement** ⚑. **The trigger compiles as the
   anchor** — an `<a href>` to the canonical watch page wrapping the poster — **and the module upgrades
   it in place**. This is the rule in all fifteen designs and in A4·10, which calls A15's theatre.
   **On a first-party media URL there is no trigger to upgrade**: the native player is the control.

**Refused, each with its home named:** `lightbox` (A14 and A33 — a still opens an image overlay, a
poster opens a player), `reveal` (decoration on a frame the reader is already looking for),
`load-more` and `infinite-scroll` (both count a query; A15's list is authored), `count-up` (no number),
`accordion` for transcript text (that is an article — A25).

---

## 1 · Player

1. **Descriptor.** One film at 960 centred under a centred head, the duration on the poster, one meta
   line under it. The category default and the frame every other design is built out of.
2. **Structural descriptor.** `media frame · none · page · one · top · one film at the content width`
   Containment `none`; 12 Embed Card is the same frame in a box. Count `one`: the list may hold 24 and
   this design draws the first ⚑.
3. **Archetype.** media frame. **One departure** — at 834 and below the Width value is ignored and the
   frame takes the content box ⚑.
4. **Responsive rule.** **1440** content 1,296 on a 72 margin; frame 960 × 540 centred, play 64, meta
   13, credit under; spacing 96. **834** frame 754 × 424, heading 34, spacing 80. **≤ 767** frame
   350 × 197, play 44 ⚑, heading 28, spacing 64, theatre falls back to in-frame ⚑. **The aspect is the
   same at all three widths** ⚑.
5. **Content fields.** `eyebrow` ≤ 24 · `heading` ≤ 60 · `blurb` ≤ 200 · `credit` ≤ 60 ·
   `transcriptLabel` ≤ 20 · `videos[]` 1–24, **this design drawing item 1**. Inside an item: URL or
   file (req), title ≤ 70, description ≤ 160, poster with its Image focus, duration ≤ 8, `start` ≤ 8,
   transcript link — everything but the URL optional ⚑.
6. **Controls.** Width *Content · Wide · Full* — Aspect *16:9 · 4:3 · 1:1 · 9:16* — Alignment *Left ·
   Centred* — Meta *Duration and transcript · Duration only · Off* — Plays *In the frame · In a
   theatre*. **Five.** Universal, outside the list: **Background role · Vertical spacing · Top
   divider**. Then the videos block and the Data group. **Quick: Width · Aspect · Plays.**
7. **Data.** Nothing from Ghost's content API ⚑; `img_url` derivatives for the poster's `srcset`; the
   provider derived from the URL ⚑. A **provider URL** draws the facade; **a media URL on the
   site's own Ghost** draws a native player ⚑. **0** → the section does not render; one paste field in the
   editor ⚑. **1** → as drawn. **many** → item 1 drawn, the rest kept ⚑; the panel names 7 Grid.
   **Above 24** Add is disabled with the reason shown.
8. **Empty state.** Absent strings close up; with all four gone the section is the frame alone ⚑. No
   poster → the plate, naming the provider and the film ⚑. No duration → no pill, meta closes up ⚑. No
   transcript → the link is absent, not disabled. **A dead or private URL** → the frame keeps its box
   and draws the plate with the dead-URL catalog line at 13 px ⚑. **Remove is never disabled**, and an
   emptied list leaves the editor's paste field ⚑.
9. **Behaviour module.** `video-facade`, **edit-safe: yes** — A4·10's call, carried ⚑. **No-JS,
   quoted:** "The poster is an `<a href>` to the video's canonical URL (YouTube/Vimeo watch page)."
   **The trigger compiles as that anchor and the module upgrades it in place** ⚑ — finding 5, resolved.
   **On a media URL from the site's own Ghost no module is declared at all** ⚑ and the no-JS state is the native player.
10. **Accessibility.** Heading `h2` ⚑. The frame is a `<figure>`; **the anchor's accessible name is the
    title plus the duration** ⚑ — "Two hours before the tide, 12 minutes 40" — and **the poster carries
    `alt=""` because the anchor is already named** ⚑. Ring 3 px outside the frame. Meta 5.4:1 / 5.6:1.
    In the theatre: `<dialog>`, focus trapped, Escape returns focus ⚑. **A native player's controls are
    the browser's and are not restyled** ⚑.
    **Flagged ⚑** click-to-load with no opt-out on an embed · no embed autoplay anywhere · the poster
    never fetched by the reader · the play control never the accent · the theatre's 390 fallback.

**The theatre** (drawn on this design, referenced by number everywhere else): a `<dialog>`; focus
trapped, Tab cycling close · player · transcript; **Escape closes it and returns focus to the frame
that opened it** ⚑; **the film is paused and the player destroyed on close** ⚑; the caption and meta
row drawn inside at every Meta value ⚑; **not used at 390** ⚑; **opened by A4·10** ⚑. Its close label
and counter are catalog strings.

---

## 2 · Split

1. **Descriptor.** The film in a 720 column with eyebrow, heading, description, a labelled play action
   and the meta line held in a 480 column beside it. Two columns above 1,080.
2. **Structural descriptor.** `split · none · page · one · right · a labelled play action beside the frame`
   Media `right` at the default; Media side: Left swaps it and the tuple is written for the default.
3. **Archetype.** split. **One departure** — the collapse is at 1,080 rather than 767 ⚑.
4. **Responsive rule.** **1440** 480 + 96 + 720, frame 720 × 405, action 44, spacing 96. **1080–768**
   stacked, **text first** ⚑, frame at the content box, spacing 80. **≤ 767** stacked at 350, action
   full width ⚑, heading 28, spacing 64.
5. **Content fields.** The section strings and `videos[]` item 1; **the section heading is the film's
   name here unless the author types both** ⚑. **`playLabel` ≤ 20, default "Play"** ⚑ — new this pass,
   inline-editable, **with the duration suffix generated**: "Play · 12:40" is a label plus a span,
   never one typed string. The action may carry an icon before or after the label, off by default.
6. **Controls.** Media side *Left · Right* — Columns *Even · Media-led* — Aspect — Action *Button ·
   Text link · None* — Meta. **Five.** Universal trio outside the list; then the videos block and the
   Data group. **Quick: Media side · Action · Aspect.**
7. **Data.** As 1 Player. **At Aspect 9:16** the frame is 405 wide inside its 720 column and
   **left-aligned within it, never stretched** ⚑.
8. **Empty state.** No description → the text column closes up ⚑. **No heading and no title** → the
   design is not offered in the picker ⚑. No duration → the action reads its label alone ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player. **The action is
   inside the same anchor**, so with no script it navigates exactly as the poster does ⚑. On a media URL from the
   site's own Ghost the action is the native player's own play control and no module is declared ⚑.
10. **Accessibility.** Heading `h2`. **Media side: Left is a DOM order swap, never `order`** ⚑. **The
    action and the poster control are one anchor drawn twice; only one is focusable** ⚑ (A6·2). Accent
    action 4.6:1 light, 7.1:1 dark.
    **Flagged ⚑** the 1,080 collapse · text first when stacked · one anchor drawn twice · no theatre on
    this design · 9:16 left-aligned in its column · the authored action label.

---

## 3 · Panel

1. **Descriptor.** Head, film, meta line and credit inside one surface plane with a hairline and the md
   shadow; the film at 960 within 40 px of plane padding.
2. **Structural descriptor.** `media frame · none · surface · one · top · the film on a raised plane`
   Ground `surface`, containment `none` — A26·3's rule that a full-width fill is a ground.
3. **Archetype.** media frame. No departures.
4. **Responsive rule.** **1440** plane 1,296 · padding 40 · frame 960 × 540 · heading 34 · spacing 96.
   **834** plane 754 · padding 32 · frame 690 × 388 · heading 30 · spacing 80. **≤ 767** plane 350 ·
   padding 20 · frame 310 × 174 · play 44 · heading 26 · spacing 64. **The plane never bleeds** ⚑.
5. **Content fields.** The section strings and `videos[]` item 1.
6. **Controls.** Head *Inside the plane · Above it* — Aspect — Alignment *Left · Centred* — Meta —
   Plays. **Five.** Universal trio outside the list — **Background role's Surface value is this
   design's state**, and the plane reads from the role rather than from a fill of its own ⚑. **Quick:
   Head · Aspect · Plays.**
7. **Data.** As 1 Player. At Head: Above it with no head authored, the plane holds the film alone and
   **is identical to this design with every string empty** ⚑ — stated rather than prevented.
8. **Empty state.** Absent strings close up inside the plane ⚑. **The plane is drawn even when only the
   film is left** ⚑. No poster → the plate on the plane's stripe ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player.
10. **Accessibility.** Heading `h2` at 34 px — **the size drops, the level does not** ⚑. The plane is a
    `<div>` with no role; **its hairline is decoration at 1.3:1**, stated rather than corrected ⚑.
    **Flagged ⚑** the plane as ground rather than containment · one raise never two · the shadow
    dropped in dark · the plane never bleeding · the plate on the plane's stripe.

---

## 4 · Contrast Band

1. **Descriptor.** 1 Player's arrangement on a full-bleed inverted band: head in the carried colour,
   film at 960, meta line at 72%.
2. **Structural descriptor.** `media frame · none · contrast · one · top · the film on an inverted band`
   Ground `contrast` is the whole difference from 1 Player.
3. **Archetype.** media frame. No departures.
4. **Responsive rule.** **1440** band full bleed, inner 1,296 on 72, frame 960 × 540, band padding 96.
   **834** inner 754 on 40, frame 690 × 388, 80. **≤ 767** inner 350 on 20, frame 310 × 174, play 44,
   64, **band always full bleed** ⚑.
5. **Content fields.** The section strings and `videos[]` item 1.
6. **Controls.** Band edges *Full bleed · Page margin* — Aspect — Alignment — Meta — Plays. **Five.**
   Universal trio outside the list: **Background role is locked at Contrast, with the reason in the
   row** ⚑ — the inverted band *is* this design; a Background value makes it 1 Player and a Surface
   value 3 Panel. **Vertical spacing resolves onto the band's inner padding** ⚑ rather than sitting
   beside it, and **Top divider is drawn above the band on the page ground, never inside it** ⚑.
   **Quick: Band edges · Aspect · Meta.**
7. **Data.** As 1 Player.
8. **Empty state.** Absent strings close up and **the band keeps its padding** ⚑. No poster → the
   inverted stripe ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player.
10. **Accessibility.** Heading `h2`. **No accent anywhere** ⚑ — Paper's accent is 4.0:1 on the band
    (A29·3) — so **the focus ring is the carried colour with a 1 px dark outline** ⚑. Carried text
    13.4:1; muted at 72% measures 5.1:1 ⚑. **Print: the band itself does not print** ⚑ — the head, the film, the meta line and the URL print on white, and it is still 4 Contrast Band (A17·7).
    **Flagged ⚑** no accent · the band carrying the section's spacing · full bleed forced at 390 · the
    band inverting again in dark mode · printing as itself on white · Background role locked.

---

## 5 · Full Bleed

1. **Descriptor.** The film at the viewport's full width, square-cornered, head above and meta beneath
   inside the page's margins. The only design that crosses the content box.
2. **Structural descriptor.** `media frame · none · transparent · one · full-bleed · no margin at any width`
   Ground `transparent` — the section paints no ground of its own; the film supplies the only fill.
3. **Archetype.** media frame. **One departure** — side padding 0 at every width ⚑.
4. **Responsive rule.** **1440** frame 1,440 × 810, play 88, head and meta on a 72 margin, spacing 96.
   **834** frame 834 × 469, play 64, margin 40, spacing 80. **≤ 767** frame 390 × 219, play 44, margin
   20, spacing 64. **Corners square at every width** ⚑.
5. **Content fields.** The section strings and `videos[]` item 1, `description` drawn as the caption.
6. **Controls.** Aspect *16:9 · 4:3* with **1:1 and 9:16 disabled** ⚑ (both taller than the viewport at
   1,440; A9·8's convention) — Head *Above the film · Below it · None* — Meta — Caption *Under the frame
   · Off* — Plays *In the frame*, **theatre disabled** ⚑. **Five.** Universal trio outside the list:
   **Background role is locked** ⚑ — the section paints no ground at all, so a role would draw a band
   behind a picture that already covers it; **Vertical spacing is vertical only** and **Top divider is
   drawn on the page's margin above the film, never across it** ⚑. **Quick: Aspect · Head · Caption.**
7. **Data.** As 1 Player. **many** → item 1 drawn, the rest kept ⚑; the panel names 8 Lead and Grid.
8. **Empty state.** Head: None with every string empty → the film alone, edge to edge ⚑. No poster →
   the plate at full width with its label at 13 px ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player.
10. **Accessibility.** Heading `h2`. The anchor is the whole 1,440 × 810 frame. **The focus ring is
    inset by 4 px rather than outside** ⚑ (A17·18) so it is never clipped by the viewport.
    **Flagged ⚑** side padding 0 · square corners · play at 88 · two disabled aspect values · the
    theatre disabled · nothing drawn over the film · Background role locked.

---

## 6 · Cover

1. **Descriptor.** The poster full bleed at 620 with eyebrow, heading and meta line on a warm wash at
   its foot and the play control at the centre. Opens the theatre.
2. **Structural descriptor.** `overlay · none · image · one · background · the head on the poster`
   Ground `image` — the picture is the section's ground rather than a thing sitting on it, which is
   what separates this from 5 Full Bleed.
3. **Archetype.** overlay. **One departure** — at ≤ 767 the text leaves the picture ⚑.
4. **Responsive rule.** **1440** poster 1,440 × 620, heading 46, play 88, wash over the lower 372.
   **834** poster 834 × 430, heading 34, wash 258. **≤ 767** poster 390 × 260, **no wash, no type on the
   picture** ⚑, heading 28 beneath, play 44.
5. **Content fields.** `eyebrow` · `heading` · `credit` and `videos[]` item 1. **`blurb` is stored and
   not drawn** ⚑.
6. **Controls.** Height *Short · Tall · Full screen* (**ignored at 390** ⚑) — Text position *Bottom
   left · Centred*, **never the top** ⚑ — Scrim *Soft · Standard* (**4.9:1 and 3.6:1, stated** ⚑) —
   Play control *Centred · Beside the head* — Meta — Plays **locked at In a theatre** ⚑. **Six** — the
   widest panel in A15. Universal trio outside the list: **Background role is locked at the poster** ⚑
   — the picture *is* the ground, which is what separates this design from 5 Full Bleed — and
   **Vertical spacing is new here** ⚑: this design had no padding row, and the row sets only the space
   above and below the picture while **Height still sizes the picture**. Top divider sits above the
   picture, never on it ⚑. **Quick: Height · Text position · Scrim.**
7. **Data.** As 1 Player. **The ambient loop that played under the wash is deleted** ⚑ — the poster is
   what sits under the wash, and the play control opens the theatre on the reader's action.
8. **Empty state.** **No poster → the pack's contrast band** ⚑, not the striped plate, with the head and
   play control unchanged on it (A4·4's flat panel). No heading → the play control alone ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player. **With no script
   the whole poster is the anchor**; the wash and the type are CSS ⚑.
10. **Accessibility.** Heading `h2` at 46 px. **The poster is an `<img>` inside the anchor, not a CSS
    background** ⚑ (A19·2), so it prints and is announced; the wash is a sibling `aria-hidden` span.
    **No accent anywhere** ⚑. Type on the wash 4.9:1 at Standard, **3.6:1 at Soft and stated** ⚑.
    **The transcript link lives in the theatre** ⚑ — this design has no meta row of its own.
    **Flagged ⚑** the text leaving the picture at 390 · the theatre locked on · the contrast-band
    fallback · no aspect control · no accent · the blurb stored and undrawn · Background role locked.

---

## 7 · Grid

1. **Descriptor.** Six films in three even columns, each poster above its title and meta line, one
   reserved ratio across every cell.
2. **Structural descriptor.** `grid-of-N · none · page · many · top · even posters in three columns`
   Media `top`: the poster sits above its own text. 8 Lead and Grid is `inline`.
3. **Archetype.** grid-of-N. **One departure** — one column at 390 rather than two ⚑.
4. **Responsive rule.** **1440** three columns, gap 24, frame 416 × 234, title 17, meta 13, play 44,
   spacing 96. **834** two columns, gap 20, frame 367 × 206, spacing 80. **≤ 767** one column, gap 16,
   frame 350 × 197, spacing 64.
5. **Content fields.** The section strings and `videos[]` 1–24, **all drawn**; `description` stored and
   not drawn ⚑.
6. **Controls.** Columns *Two · Three · Four* — Aspect — Gap *Tight · Normal · Loose* — Meta *Duration and
   transcript · Duration and provider · Off* — Plays. **Five.** Universal trio outside the list. **Quick:
   Columns · Aspect · Gap.**
7. **Data.** **1** → one cell at its column width, not stretched ⚑. **2–3** → one short row. **many** →
   wraps; **the last row is left-aligned and short** ⚑. **Designed for 3–12** ⚑.
8. **Empty state.** **A cell with no title is its poster and meta line alone** ⚑ — no "Untitled" is
   drawn. **Its anchor still needs a name, and takes "Film on {provider}"** ⚑ — new this pass, a catalog
   string with **the derived provider** interpolated, followed by the duration as everywhere else. **In
   a grid the title is the only text the anchor has**, which is why this design is where the fallback
   was needed. No poster → the plate. A dead URL keeps its cell and says so ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes. **One player at a time** ⚑ — starting a second
   destroys the first, a rule of the design rather than a second module.
10. **Accessibility.** Heading `h2`; a `<ul>` of `<li>`, each cell a `<figure>` with the title inside
    the anchor ⚑. **The 44 px play control is decoration**: the target is the whole cell ⚑. **No cell is
    an unnamed link** ⚑ — the provider fallback guarantees it.
    **Flagged ⚑** one column at 390 · the short last row · play at 44 in a cell · one player at a time ·
    nothing plays on hover · no Show ladder · the "Film on {provider}" fallback.

---

## 8 · Lead and Grid

1. **Descriptor.** Item 1 at the full content box with its title and meta line beneath, then the rest
   of the set in a row of three. Two frame sizes in one arrangement.
2. **Structural descriptor.** `grid-of-N · none · page · many · inline · one lead film above the row`
   Media `inline` — frames laid into one arrangement at two sizes.
3. **Archetype.** grid-of-N. **Two departures** — one column at 390, and **the lead loses its size
   there** ⚑ (A14·3's call, carried).
4. **Responsive rule.** **1440** lead 1,296 × 729, title 28 beside its meta, row of three 416 × 234,
   play 88 and 44. **834** lead 754 × 424, title 24, row of two 367 × 206, spacing 80. **≤ 767** one
   column at 350 × 197, all frames equal ⚑, play 44, spacing 64.
5. **Content fields.** The section strings and `videos[]` 1–24, all drawn. **The lead is item 1** ⚑.
6. **Controls.** Lead size *Full box · Two thirds* — Aspect — Gap — Meta — Plays. **Five.** Universal
   trio outside the list. **Quick: Lead size · Gap · Aspect.**
7. **Data.** **1** → the lead alone, no empty row ⚑. **2–3** → lead and a short row. **many** → rows of
   three continue and **the lead is never repeated** ⚑. **Designed for 4–10** ⚑.
8. **Empty state.** As 7 Grid, including the provider fallback for an untitled frame. **A lead with no
   poster draws the plate at 1,296 × 729** ⚑ — the largest plate in the library, and the reason its type
   stays at 13 px.
9. **Behaviour module.** `video-facade`, edit-safe: yes. One player at a time across the lead and the
   row ⚑.
10. **Accessibility.** Heading `h2`; one `<ul>` in authored order with the lead as its first `<li>` ⚑ —
    **the lead is not promoted in the heading structure**.
    **Flagged ⚑** the lead as item 1 · the lead at the content box rather than a bleed · the lead losing
    its size at 390 · no promote-on-play · rows of three above 10.

---

## 9 · Carousel

1. **Descriptor.** One film centred on a native scroll-snap track with both neighbours peeking, dots,
   arrows and a counter beneath.
2. **Structural descriptor.** `carousel · none · page · many · inline · one film at a time`
   The only `carousel` archetype in A15; A14·7 is its still-photograph sibling.
3. **Archetype.** carousel. **One departure** — the arrows are dropped at ≤ 767 ⚑.
4. **Responsive rule.** **1440** slide 960 × 540, peek 148, gap 20, play 64, dots + arrows + counter,
   spacing 96. **834** slide 630 × 354, peek 42, spacing 80. **≤ 767** slide 302 × 170, peek 12, gap 12,
   **dots and counter only** ⚑, play 44, spacing 64.
5. **Content fields.** The section strings and `videos[]` 1–24, each slide carrying `title`,
   `duration`, `start` and `transcriptUrl`.
6. **Controls.** Aspect — Peek *On · Off* — Controls *Dots · Arrows · Both* — Meta — Plays. **Five.**
   Universal trio outside the list. **Quick: Peek · Controls · Aspect.**
7. **Data.** **1** → one frame, no dots, arrows or counter ⚑. **2** → both reachable. **many** → the
   track runs to the end and **stops; it does not wrap** ⚑. **Designed for 3–12** ⚑.
8. **Empty state.** As 7 Grid. **A slide is never skipped for being incomplete** ⚑ — the counter would
   then disagree with the dots.
9. **Behaviour module.** `carousel` **and** `video-facade` ⚑. **carousel, edit-safe: yes.** **No-JS,
   quoted:** "The slide track is a native horizontally-scrollable `scroll-snap` strip — **fully
   usable**, only dots and arrow buttons are hidden." **Advancing the track destroys a loaded
   player** ⚑; **under reduced motion the track jumps rather than glides** ⚑. **With the ambient loop deleted there is
   nothing else on a slide to stop** ⚑.
10. **Accessibility.** Heading `h2`. The track is a `<ul>` with `scroll-snap-type:x mandatory`; the
    arrows are `<button>`s; **the dots are buttons labelled with the film's title** ⚑, never bare dots.
    Tabbing to a slide scrolls it into view ⚑; arrows disable at both ends with `aria-disabled`.
    **Flagged ⚑** advancing destroys a loaded player · no autoadvance · no loop of the track · arrows
    dropped at 390 · the active dot as the only accent · one slide per view.

---

## 10 · Playlist

1. **Descriptor.** A player and a queue on one surface plane: 800 × 450 beside a 400 px list of rows,
   the current film marked, the running total in the queue's head.
2. **Structural descriptor.** `split · none · surface · many · left · a queue beside the player`
   Media `left` at the default — the player is the media half.
3. **Archetype.** split. **One departure** — the collapse is at 1,080 rather than 767 ⚑.
4. **Responsive rule.** **1440** plane 1,296, padding 32, player 800 × 450, queue 400, rows 96 × 54,
   title 22. **1080–768** stacked, player first, queue full width beneath, padding 24. **≤ 767** plane
   350, padding 16, player 318 × 179, **thumbs 84 × 47 and four rows** ⚑.
5. **Content fields.** The section strings, `queueLabel` ≤ 20 (default "In this series") ⚑ and
   `videos[]` 1–24, all drawn as rows.
6. **Controls.** Queue side *Left · Right* — Queue height *Four rows · Six rows · All* — Aspect —
   Numbering *On · Off* — Meta. **Five.** Universal trio outside the list. **Quick: Queue side · Queue
   height · Numbering.**
7. **Data.** **1** → the queue is not drawn and the player keeps the plane on its own; **it is still
   10 Playlist** ⚑ and the panel names 3 Panel as the better arrangement. **2** → a queue of one other
   film. **many** → the queue scrolls inside the plane at Four and Six rows ⚑. **The running total is
   the sum of the durations and is absent if any film has none** ⚑ — durations are typed, and seeded
   from the provider on paste where the provider supplies one. **Designed for 3–12** ⚑.
8. **Empty state.** **A row with no title shows its URL** ⚑ — the one place in A15 a URL is drawn on the
   page. No poster → the plate at 96 × 54, **too small for text and drawn plain** ⚑.
9. **Behaviour module.** `tabs` **and** `video-facade` ⚑. **tabs, edit-safe: yes** — A9·5's call: first
   tab active on load, nothing remembered, nothing written while editing. **No-JS, quoted:** "All
   panels render stacked and visible, each preceded by its tab label as a heading." **A15 reads that
   as: every film renders stacked with its own poster, title and meta line** ⚑, in authored order.
   **ARCHITECT: `tabs` registry ruling** ⚑ — the heading branch is headings this design does not
   otherwise put in the outline; settled once with A13's Walkthrough and flagged on the frame.
10. **Accessibility.** Heading `h2`; `queueLabel` is an `h3` ⚑. The queue is a `<ul>` of `role="tab"`
    buttons with `aria-selected`, the player their one `role="tabpanel"`; **← and → move between rows,
    Home and End jump to the ends** ⚑. **The current row is marked by the hover surface and a bold
    title, never by colour alone** ⚑. "Now playing" is a catalog string ⚑.
    **Flagged ⚑** the 1,080 collapse · the queue under the player when stacked · first row current on
    load · no stored position · no autoadvance · the summed total · the `tabs` ruling flag.

---

## 11 · Chapters

1. **Descriptor.** One film at 960 with a ruled contents list beneath it: mono timecode at the left,
   chapter label at the right, each row a link that starts the film at that point.
2. **Structural descriptor.** `table · none · page · many · top · timecoded rows under the player`
   Count `many` counts the chapters, not the films. The only `table` archetype in A15.
3. **Archetype.** table. **One departure** — the timecode column does not narrow ⚑.
4. **Responsive rule.** **1440** frame 960 × 540 centred, rows 960, timecode column 52, label 16,
   spacing 96. **834** frame and rows 754, spacing 80. **≤ 767** frame and rows 350, label 15, play 44,
   spacing 64. **At Chapter list: Beside it the split collapses at 1,080** ⚑.
5. **Content fields.** The section strings, `videos[]` item 1, and `chapters[]` 1–24 with `time` ≤ 8 and
   `label` ≤ 70, **both required** ⚑. **The film's own `start` is independent of the chapter list** ⚑ —
   one sets where the film opens, the other lists where a reader can go.
6. **Controls.** Aspect — Chapter list *Under the film · Beside it* — Rules *Hairline · None* —
   Timecodes *Shown · Hidden* — Plays **locked at In the frame** ⚑. **Five.** Universal trio outside
   the list. Then the videos block **and the chapters block** ⚑, and the Data group. **Quick: Chapter
   list · Timecodes · Aspect.**
7. **Data.** **0 chapters** → the list and its head are not drawn ⚑; the film stands alone under the head and **it is still 11 Chapters**. **1** →
   one row. **many** → rows continue; **the list does not scroll and the section grows** ⚑. Films 2–24
   are kept, not drawn ⚑.
8. **Empty state.** **A chapter with a label and no time is not publishable** — both fields are required
   and the editor blocks the row rather than the section ⚑. **Remove is never disabled on either list**,
   and an emptied chapter list is the state this design draws as the film alone under its head ⚑ — still 11 Chapters. **The total beside the head
   is absent when the film has no duration** ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player. **Every chapter row
   is also that anchor**, with the provider's time parameter on it ⚑, so with no script the contents
   list works. **ARCHITECT: registry addition** ⚑ — **seeking a player already on the page is behaviour
   no module covers**; closest module `video-facade`; the design reloads the frame at the new start time
   instead and **no module name is coined**. **The new per-item `start` uses the same mechanics.**
10. **Accessibility.** Heading `h2`; "Chapters" is an `h3` ⚑. The list is an `<ol>` — **ordered, because
    the order is the film** ⚑ — of anchors named "**5 minutes 3 — Ana Reis on the bridge**" ⚑, the
    timecode spoken rather than spelled. **Each row is a 44 px target** ⚑.
    **Flagged ⚑** the fixed timecode column · rows never sorted · the seek registry addition · the
    locked Plays row · the total from the film rather than the chapters · the `<ol>`.

---

## 12 · Embed Card

1. **Descriptor.** One embed in a hairline box whose top edge names the kind and the provider, with the
   click-to-load notice above the frame and the description beneath it.
2. **Structural descriptor.** `media frame · box · page · one · inline · a bordered embed naming its provider`
   Containment `box` — **the only design in A15 where the section itself sits in one**.
3. **Archetype.** media frame. **One departure** — the audio bar's height changes at ≤ 767 ⚑.
4. **Responsive rule.** **1440** box 1,296, box padding 24, bar 160, label 13 uppercase, notice 13.
   **834** box 754, bar 160, spacing 80. **≤ 767** box 350, box padding 16, **bar 120** ⚑, label and open
   link stacked, spacing 64.
5. **Content fields.** The section strings, `embedKind` ≤ 20 and `embedLabel` ≤ 32 (defaults derived) ⚑,
   **`openLabel` ≤ 24, default "Open on {provider}"** ⚑ — new this pass, inline-editable and able to
   carry an icon after it — and `videos[]` item 1, **where an item may be any embed the provider list
   allows** ⚑.
6. **Controls.** Shape *16:9 · 4:3 · 1:1 · Audio bar* (**a height, not a ratio** ⚑) — Label *Kind and
   provider · Custom · Off* — Notice *Above the frame · On the frame*, **no Off** ⚑ — Open link *Shown ·
   Hidden* — Meta. **Five.** Universal trio outside the list — **the box's own 24 px inner padding is
   not Vertical spacing** ⚑ and has no control. **Quick: Shape · Label · Notice.**
7. **Data.** The provider is derived from the URL and the kind from the provider ⚑. **This design is the
   home of the recognised-provider list** ⚑ — video: YouTube · Vimeo; audio: **Soundcloud · Spotify ·
   Apple Podcasts · Bandcamp · Mixcloud** — and **its unrecognised-provider fallback is now the
   fallback in all fifteen designs**: the frame is drawn, the label reads the domain, and **the frame is
   a link rather than an embed** ⚑ — nothing is put in an iframe the theme cannot name. **The struck Ambient loop value goes with the deleted Playback row** ⚑.
8. **Empty state.** No description → the box closes up ⚑. No artwork on an audio embed → the bar is
   drawn with its title and provider, **which is the plate for this shape** ⚑. No URL → the design is
   not offered.
9. **Behaviour module.** `video-facade`, edit-safe: yes. **No-JS, quoted:** "The poster is an `<a href>`
   to the video's canonical URL (YouTube/Vimeo watch page)." **Read here as the embed's canonical
   page** ⚑. **ARCHITECT: registry addition** ⚑ — **the registry has no facade for a non-video embed**;
   a general `embed-facade` is the architect's call and **A15 does not name one**.
10. **Accessibility.** Heading `h2`; the label is a `<p>` and not a heading ⚑. **The notice is inside the
    same `<figure>` as the frame and is read before it** ⚑. **An iframe that does load carries a `title`
    naming the embed** ⚑. Notice 5.4:1.
    **Flagged ⚑** the audio bar as a height · the notice with no Off value · the unrecognised-provider
    fallback, now category-wide · the non-video facade registry addition · box rather than plane.

---

## 13 · Thumb Rows

1. **Descriptor.** One film a row: a 320 × 180 poster at the left, title, description and meta line at
   the right, a hairline between rows. **The only design that draws the description.**
2. **Structural descriptor.** `stack · none · page · few · left · a ruled row per film`
   Count `few` — written for two to six rows; 7 Grid is the `many` case on the same ground.
3. **Archetype.** stack. **One departure** — the row stacks and the poster takes the full width at
   ≤ 767 ⚑.
4. **Responsive rule.** **1440** thumb 320 × 180, gap 32, text 944, title 24, description 15, meta 13.
   **834** thumb 260 × 146, gap 24, text 470, title 21, spacing 80. **≤ 767** stacked, poster 350 × 197
   first, title 20, play 44, spacing 64, **the rule between rows kept** ⚑.
5. **Content fields.** The section strings and `videos[]` 1–24, all drawn, **with `description` drawn
   here and in 15 and nowhere else** ⚑.
6. **Controls.** Thumb side *Left · Right* — Thumb size *Small · Medium · Large* — Rules *Hairline ·
   None* — Description *Shown · Hidden* — Meta *Duration and transcript · Duration and provider · Off*.
   **Five.** Universal trio outside the list. **Quick: Thumb side · Thumb size · Description.**
7. **Data.** **1** → one row, no rule ⚑. **many** → rows continue; **nothing is paged** ⚑. **Designed for
   2–6** ⚑.
8. **Empty state.** No description → the row is title and meta ⚑. No title → the description alone,
   which reads badly and is stated rather than prevented; **the anchor still takes the provider
   fallback** ⚑. **The row never drops below the poster's height** ⚑ and the space is left empty.
9. **Behaviour module.** `video-facade`, edit-safe: yes. One player at a time across the rows ⚑.
10. **Accessibility.** Heading `h2`; the rows are a `<ul>` and **each title is inside its anchor rather
    than being a heading** ⚑ — six `h3`s would put the strand into the outline twice. **The poster and
    the title are one anchor**, so a row has one tab stop ⚑.
    **Flagged ⚑** the description drawn only here and in 15 · the poster first when stacked · one player
    at a time · the row never shorter than its poster · titles not headings.

---

## 14 · Slim Bar

1. **Descriptor.** One 88 px line on a surface plane: a 96 × 54 thumbnail, the title, a meta line and a
   watch action at the right. Opens the theatre at every width.
2. **Structural descriptor.** `bar · none · surface · one · left · one line, the film summoned`
   The only `bar` archetype in A15.
3. **Archetype.** bar. **One departure** — two rows at ≤ 767 ⚑.
4. **Responsive rule.** **1440** bar 1,296 × 88, thumb 96 × 54, title 17, meta 13, action 44 at the
   right. **834** bar 754 × 88, unchanged, spacing 80. **≤ 767** bar 350 in two rows, **action full
   width** ⚑, title 16, spacing 64.
5. **Content fields.** The section strings — **`heading` and `blurb` stored and not drawn** ⚑, the
   eyebrow drawn in the meta line — and `videos[]` item 1. **`watchLabel` ≤ 20, default "Watch"** ⚑ —
   new this pass, inline-editable, **the duration suffix still generated**, and the action may carry an
   icon.
6. **Controls.** Thumbnail *Shown · Hidden* — Action *Button · Text link* — Meta *Duration and provider ·
   Duration only · Off* — Edges *Content box · Full bleed*. **Four** ⚑ — there is no Aspect row (the
   thumbnail is 16:9 and nothing else) and no Plays row (the theatre, always). Universal trio outside
   the list — **the 88 px bar height is not Vertical spacing** ⚑ and has no control. **Quick: Thumbnail ·
   Action · Edges.**
7. **Data.** **1** → as drawn. **many** → item 1 drawn, the rest kept ⚑; the panel names 13 Thumb Rows.
   No duration → the action reads its label alone ⚑. **The struck Ambient loop value goes with the deleted Playback
   row** ⚑ — this design's film is summoned into the theatre rather than played in the bar.
8. **Empty state.** **No title → the section does not render** ⚑ — a bar with a thumbnail, a duration and
   no name is a button that says nothing. No poster → the thumbnail is the plate at 96 × 54, **drawn
   plain** ⚑.
9. **Behaviour module.** `video-facade`, edit-safe: yes; same quotation as 1 Player. **Here the anchor
   always opens the theatre** ⚑, and with no script it navigates to the watch page — **or, on an upload,
   to the file** ⚑.
10. **Accessibility.** **No heading is drawn** ⚑ — the section is a `<figure>` with an `aria-label` from
    the film's title, so it is announced without adding an `h2` halfway down an article ⚑. **The whole
    bar is the anchor** and the action inside it is drawn rather than focusable ⚑.
    **Flagged ⚑** four controls · no aspect row · the theatre at every width including 390 · no heading
    in the outline · the transcript link only in the theatre · two rows at 390.

---

## 15 · Tabs

1. **Descriptor.** A tab per film on a hairline strip above one shared frame, the active label
   underlined in accent, the active film's description and meta line beneath.
2. **Structural descriptor.** `media frame · none · page · variable · inline · a tab per film sharing one frame`
   Count `variable` — the only one in A15: written to hold whatever the author put in, the strip
   scrolling rather than the arrangement changing.
3. **Archetype.** media frame. **One departure** — the strip scrolls at ≤ 767 ⚑.
4. **Responsive rule.** **1440** tabs 15 px, gap 28, labels clipped at 26 characters, frame 960 × 540,
   caption 15, spacing 96. **834** frame 754 × 424, spacing 80. **≤ 767** tabs 14 px, gap 16, clip 18,
   **strip scrolls** ⚑, frame 350 × 197, play 44, spacing 64.
5. **Content fields.** The section strings, `videos[]` 2–24 all drawn, and `tabLabel` ≤ 26 per item ⚑ —
   drawn at Tab labels: Custom only, and inline-editable there.
6. **Controls.** Aspect (**one box for every tab** ⚑) — Tab labels *Film titles · Numbers · Custom* — Tab
   alignment *Left · Centred* — Caption *Description · Title · Off* — Meta. **Five.** Universal trio
   outside the list. **Quick: Tab labels · Tab alignment · Caption.**
7. **Data.** **1** → **the strip is not drawn and the one film takes the shared frame** ⚑ — still 15 Tabs, and the picker names 1 Player. **2–6** → as drawn. **7+**
   → **the strip scrolls horizontally at every width** ⚑. **Designed for 2–6** ⚑.
8. **Empty state.** A film with no title at Tab labels: Film titles → **its tab shows its position,
   "Film 3"** ⚑ — A15's one generated string, now **a catalog entry with the position interpolated**
   rather than fixed English. No description at Caption: Description → the line closes up ⚑.
9. **Behaviour module.** `tabs` **and** `video-facade` ⚑. **tabs, edit-safe: yes** (A9·5's call).
   **No-JS, quoted:** "All panels render stacked and visible, each preceded by its tab label as a
   heading." **Switching tabs destroys the loaded player** ⚑. **ARCHITECT: `tabs` registry ruling** ⚑ —
   the heading branch, settled once with A13's Walkthrough and flagged on the frame.
10. **Accessibility.** Heading `h2`. The strip is `role="tablist"` with one `role="tab"` per film and the
    frame as the single `role="tabpanel"` ⚑; **← and → move between tabs, Home and End jump to the
    ends** ⚑, and **the tab is activated on arrow, not on focus alone** ⚑ — nothing loads because focus
    passed over it. **The active state is weight, colour and the underline together** ⚑, never colour
    alone. **The strip never becomes a `<select>`** ⚑ (A5·12's finding, carried).
    **Flagged ⚑** the scrolling strip · never a select · clipped labels · "Film {n}" as the one generated
    string · switching destroys the player · the shared box across mixed ratios · the `tabs` ruling flag.

---

## Component inventory

New in A15 — **the reserved frame** (an `aspect-ratio` box holding poster, notice and player at
`inset: 0`, A15·1) · **the play target** (64 px surface circle with a text glyph; 44 in a cell and at
390, 88 at full bleed and on 6 Cover, A15·1) · **the duration pill** (carried colour on a 76% contrast
wash, A15·1) · **the meta row** (13 px: duration · provider · transcript ↗, A15·1) · **the notice**
(click-to-load wash naming the provider, A15·1) · **the theatre** (`<dialog>` player with counter,
close, caption and meta; **called by A4·10**, A15·1) · **the video card** (poster over title over meta,
A15·7) · **the embed label row** (kind · provider on the box edge, A15·12) · **the audio bar** (a 160 px
embed height rather than a ratio, A15·12) · **the native player branch** (a `<video controls playsinline
preload="none" poster>` in the same reserved box, its controls the browser's — **for a first-party media
URL**, A15·1).

Extended here — **the plate** (A1·1, now carrying the provider and the film's name) · **the queue row**
(A18·2, now 96 × 54 with a current state) · **the chapter row** (A9·15, now a 52 px mono timecode
column) · **the videos block** (A3's repeater, now the **P0·3** item list with one paste field, 1–24,
Image focus and a `start` timecode).

Carried verbatim — **tab strip** (A5·12, A1·1) · **carousel track, dots and arrows** (A19·15) ·
**surface plane** (A26·3, A27·4) · **warm scrim** (A14·11) · **content box and spacing ladder** (A17) ·
**on-contrast derivation** (A17·7) · **focus ring** (A6, with A17·18's inset) · **disabled value**
(A9·8) · **the 1,080 collapse** (A16·1) · **the bar** (A2·1, A16·9) · **eyebrow, logo lockup, nav row,
primary button** (A1) · **the P0 primitives** (P0·1, P0·2, P0·3).

---

## Reconciliation notes

**Superseded in part on 29 August 2026.** Items 1, 2, 3 and 4 below record the upload branch, its
ambient loop and its file-read duration. **All three are deleted in the design patch pass**, and the
**Patch notes** at the foot of this document are the later ruling. Everything else in this section
stands.

**Frames changed in this pass — sixteen, and no primary section frame among them.**

- `A15-0 Category Proof` — a **controls-reconciliation** section above the settlements (four tiles: the
  universal trio and the retired Padding row · the upload branch and its Playback row · editor-side
  seeding and what settlement 3 protects · items, strings and the two flags); the items tile's "at one
  film Remove is disabled" struck through with its replacement; the items caption now names the P0·3
  list.
- `A15-1 Player` · `A15-2 Split` · `A15-3 Panel` · `A15-4 Contrast Band` · `A15-5 Full Bleed` ·
  `A15-6 Cover` · `A15-7 Grid` · `A15-8 Lead and Grid` · `A15-9 Carousel` · `A15-10 Playlist` ·
  `A15-11 Chapters` · `A15-12 Embed Card` · `A15-13 Thumb Rows` · `A15-14 Slim Bar` · `A15-15 Tabs` —
  **all fifteen control-panel frames**: the Padding row retired into **Vertical spacing**; the
  **universal trio** drawn outside the list (Background role **locked in 4, 5 and 6** with the reason in
  the row; **Vertical spacing new on 6**); the videos block redrawn as the **P0·3** item list with the
  per-item field line, **Image focus**, the **`start`** timecode and **Remove never disabled**; new
  **EDITING**, **BEHAVIOUR** and **DATA** groups (Source · Playback, the seeding statement, the provider
  list, the Member-Visibility note); the **ARCHITECT** flags drawn — `tabs` registry ruling on 10 and 15,
  registry addition on 11 and 12, and the ambient-loop reduced-motion addition on all fifteen; the
  footer control count and Quick Controls restated; the panel's settles tile carrying a **Controls
  patch** banner; and **a new spec card, "Reconciled · 24 August 2026"**, on every design's spec section.
  7 Grid additionally carries **the unnamed-cell fallback** as its own panel group.
- **Second sitting, 24 August 2026 — the spec card, drawn.** The **"Reconciled · 24 Aug 2026 ·
  controls patch"** card this section claimed on every design's spec section **was outstanding on all
  fifteen frames**; it is now drawn on `A15-1` … `A15-15`, at the head of each spec section, in the
  library's wording (A13·1, A5·2, A4·10). Each card states the category's common patch — Padding
  retired into Vertical spacing and the trio outside the list, the P0·3 videos block with Remove never
  disabled, Image focus and `start`, the two media sources with the upload's native player and its
  Playback row, oEmbed seeding on paste, and Member Visibility's absence — then **that design's own
  delta**: the locked Background roles on 4, 5 and 6 and Vertical spacing's arrival on 6; the authored
  `playLabel`, `watchLabel` and `openLabel` on 2, 14 and 12; 7's "Film on {provider}"; 11's second item
  block and seek addition; 12's provider list; the struck Ambient values on 12 and 14; and the `tabs`
  ruling flag on 10 and 15. **No other frame content changed in this sitting**, and the design frames'
  own ten-field bodies still read as drawn on 23 August — where they say *Padding* the card above them
  says Vertical spacing, and **the card is the later ruling**.

**No section frame was redrawn, and that is a claim rather than an omission.** Nothing in this patch
changes a drawn mark at a drawn value: the trio ships at Background · Comfortable · None, every icon
slot is off by default, `start` and Image focus are fields, the authored action labels ship with the
words already drawn, and **Source: Upload draws the same reserved box with the browser's own controls
inside it instead of the facade** — a branch, not a new mark. If the build wants an upload-mode canvas
state drawn, it is a frame this pass did not draw.

**Where this patch and the category's existing rulings disagreed, one line each.**

1. **"Every item is third-party by default" versus the upload branch.** Both stand, differently: an
   embed is third-party and keeps every settlement; **an upload is first-party and has no facade, no
   notice and no typed duration**. The category's founding sentence is amended to name two kinds of
   item.
2. **Settlement 1's blanket "nothing autoplays at any value in any design" versus Playback: Ambient
   loop.** The refusal is narrowed to **embeds**, where it was always about the request. On an upload
   Ambient is offered, **muted, looped, `playsinline`**, with the poster standing in under reduced
   motion. **No hover preview was reinstated** and no embed gained an autoplay value.
3. **Settlement 3's "never the provider's own thumbnail" versus "Use provider thumbnail".** Narrowed to
   **"never fetched by the reader"**. The editor fetches once and re-hosts; the served poster is
   first-party. The facade's purpose — the reader's browser — is untouched.
4. **"The duration is typed by the author" (A4·10's field, carried verbatim) versus seeding.** Seeding
   wins and the field stays. It is **seeded on paste, read from the file on an upload, and editable
   either way**. 10 Playlist's stated caveat is amended rather than deleted: the total is still absent
   if any film has none.
5. **"At one film Remove is disabled with the reason shown" versus Remove never disabled.** The library
   rule wins. The old rule contradicted A15's own zero state — a paste field at 0 — and defended the
   author from an outcome the editor already draws. **Removal may empty the list.**
6. **Per-design Padding versus universal Vertical spacing.** The duplicate row is removed in fourteen
   designs (6 Cover had none and **gains** the row). In **4 Contrast Band** it **resolves onto the
   band's inner padding** rather than sitting beside it; **6 Cover's Height**, **12 Embed Card's box
   padding** and **14 Slim Bar's 88 px bar height** are genuinely different ladders and keep their own
   names — the last two as facts of the design with no control at all.
7. **"No Ground control" (4 Contrast Band, A4·9's line) versus the universal Background role.** Both
   hold: the row is **drawn and locked, with the reason shown**, rather than absent — the library's
   convention that a locked control states its reason where a missing one cannot. Same in 5 Full Bleed
   and 6 Cover.
8. **The category's "six controls" footers versus the PRD's ~15 ceiling.** The old norm is lifted:
   **five own controls in eleven designs, six in 6 Cover, four in 14 Slim Bar**, plus the trio and the
   Data group. Every "Six controls." line in a settles tile is restated as "of its own".
9. **"Nothing read from Ghost but the site title" versus the Data group.** Unchanged — **A15 still has
   no query**. The Data group here is about **media source**, not about posts: no Show ladder, no From
   posts branch, no filter. The panel says so in the group itself.
10. **Rule 9's Member Visibility versus A15's actions.** **It lands nowhere and is recorded rather than
    invented** ⚑ — no design carries an auth or subscribe action, and 2 Split's and 14 Slim Bar's
    action rows are play triggers for content already on the page. A members-only film is **A32
    Paywall's** ground; the note stands in every panel's Data group so the absence is a decision rather
    than an omission.
11. **Rule 7's "remove every Preview-type control" versus A15's panels.** **Nothing to remove** — the
    category never shipped one. Recorded so the audit is complete.
12. **A15's "one generated string" claim versus the new fallbacks.** Amended: **"Film {n}"** (15) and
    **"Film on {provider}"** (7, new) are both generated, and both are **catalog strings with a value
    interpolated** rather than fixed English. The duration suffix on an action is generated too.
13. **The finding count.** Three findings become **five**: the two registry gaps stand, **the ambient
    loop's reduced-motion gate** is added, **the `tabs` heading branch** is named as a finding rather
    than left inside two designs, and A4·10's resolved disagreement is kept as the record of a
    settlement. **No module name was coined in any of them.**
14. **`A15-0 Category Proof` predates this pass**, and where the pass edited it, it is current. The
    new reconciliation section, the struck "at one film Remove is disabled" rule and **the roster's CTL
    column — restated to 5 · 6 in 6 Cover · 4 in 14 Slim Bar, with the "own controls only" caveat under
    the table** — are this pass's. Its **settlement tiles** still read as drawn on 23 August; **where
    they disagree with this file, this file's Reconciliation notes are the later ruling** — and the
    panels are the drawing of it.


---

## Patch notes — video and embeds patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written here as an
**open question** and asked in plain words at the end.

**Frames changed — all sixteen:** `A15-0 Category Proof` and `A15-1` … `A15-15`. Every design frame carries a
dated **design patch pass** panel at the top saying what changed on it and why, and `A15-0` carries the
category's version of the same panel above the controls-reconciliation section, with the upload tile rewritten
as a deletion — its old values struck through and their replacements beside them. **No layout was redesigned,
no measure moved, no type size changed and no colour changed.**

### This category's own rulings

| What changed | Why |
|---|---|
| **The Upload source is deleted from all fifteen designs.** The Source row is no longer a two-value control: it is a **read-only, derived** row reading *A pasted URL*, and the panel says in plain words why there is no second value. Every mention of a file picker, of Ghost's media library and of "Add also takes a file" is rewritten: **Add is one paste field**. What survives is **a pasted media URL that already lives on the customer's own Ghost** — first-party, so it keeps the native `<video controls playsinline preload="none" poster>` with no facade and no notice, exactly as the 24 August pass drew it. | *(There is nowhere to upload to: Ghost's public interface has no media library a theme can read, Inflozo is not permitted to put files on a customer's Ghost, and Inflozo's own asset system handles images only.)* |
| **The ambient loop goes with it, and the whole Playback row with the loop.** *Click to play · Ambient loop* is deleted from every panel; the **struck** Ambient values on **12 Embed Card** (Audio bar) and **14 Slim Bar** go with the row they were struck in; **6 Cover's loop under the warm wash** is deleted and the poster is what sits under the wash; **9 Carousel's rule pausing a loop when its slide leaves view** is deleted, while *advancing the track destroys a loaded player* stands. **Nothing autoplays anywhere in A15 again**, which is settlement 1 as first written. | *(The ambient loop had no source of files.)* |
| **Nothing reads a duration off a file.** `duration` ≤ 8 is **typed by the author** again — A4·10's field, carried — and seeded from the provider on paste **where the provider supplies one**. The claim that the field is "no longer typed by hand" is withdrawn wherever it appears, and **10 Playlist's caveat stands as first drawn**: the running total is absent when any film has none. | *(Nothing can read the duration of a video file.)* |
| **The registry addition the loop needed is withdrawn.** Finding 3 — gating a muted loop on `prefers-reduced-motion` — is marked withdrawn rather than deleted, so **findings 4 and 5 keep their numbers**. **Two registry gaps stand:** seeking a loaded player (11 Chapters) and a facade for a non-video embed (12 Embed Card). **No module name was coined in either.** | *(If a design needs behaviour no module covers, mark it and never invent a name.)* |
| **Embeds are unaffected, and that is a check rather than an omission.** YouTube, Vimeo, Soundcloud, Spotify, Apple Podcasts, Bandcamp and Mixcloud keep every design, every facade, every click-to-load notice, the reserved aspect box and the blanket refusal to autoplay. The unrecognised-URL link-out is still the fallback in all fifteen. | *(Embeds are unaffected.)* |

### The library-wide rules

| Rule | What it did here |
|---|---|
| **The two free designs are the owner's choice — ask him** | Shortlisted the five plainest designs, and weighted the shortlist towards the ones that do not need good photography: **1 Player** (the category default — one film, one head, one meta line; nothing in it can be empty but the optional strings), **12 Embed Card** (a hairline box that names its provider, and at *Audio bar* it needs **no picture at all**), **14 Slim Bar** (one 88 px line whose thumbnail can be switched off entirely), **3 Panel** (the same stack on one raised plane) and **13 Thumb Rows** (ruled rows at a small poster size). **Recommended 1 Player · 12 Embed Card**, and the line is at the head of this document in the required shape, with a matching `[FREE]` badge on both roster rows of `A15-0`. **Ruled by the owner on 29 August 2026: 1 Player · 12 Embed Card.** |
| **No design ever turns into another design** | **Five hand-off phrases deleted.** **10 Playlist** — *at 1 the design is 3 Panel* becomes: the queue is not drawn, the player keeps the plane on its own, **it is still 10 Playlist**, and the panel *advises* 3 Panel. **11 Chapters** — *at 0 chapters the section is 1 Player* becomes: the list and its head are not drawn, the film stands alone under the head, **it is still 11 Chapters**. **15 Tabs** — *below 2 it is 1 Player* becomes: the strip is not drawn, the one film takes the shared frame, **it is still 15 Tabs**, and the picker *names* 1 Player. **7 Grid** — *a 416 poster blown to 1,296 is 1 Player* becomes advice in the panel. **4 Contrast Band** — *the band prints as 1 Player on white* becomes: the band itself does not print; the head, film, meta line and URL print on white and it is still 4 Contrast Band. **1 Player's** opening line no longer says six other designs resolve to it at 390. In every case the section **hides what does not apply** and the panel **advises**. |
| **Gap names are "Tight · Normal · Loose"** | **Two subjects, both renamed with their values unchanged:** **7 Grid's Gap** and **8 Lead and Grid's Gap** read **Tight · Normal · Loose** where they read Tight · Even · Airy, at the same **8 · 24 · 40 px**. No other gap vocabulary exists in the category — 13 Thumb Rows' *Thumb size* is a size, and 10 Playlist's *Queue height* is a height. |
| **Item counts are a number picker** | **No count row exists in A15** — there is no Show ladder, because there is no query; the count is the length of the authored list. **One row was examined and left alone: 10 Playlist's Queue height (Four rows · Six rows · All)**, which sets the height of a scrolling box rather than how many films the section holds. It was asked rather than guessed, and **the owner ruled on 29 August 2026 that the three named heights stay** (question 3). |
| **The Remove button never greys out** | **Two subjects, both already compliant and unchanged by this pass:** `videos[]` in all fifteen and `chapters[]` in 11 Chapters. ✕ is never disabled, never dimmed and never hidden; removal may empty either list; at 0 films the section does not render and the editor draws one paste field. It is **Add** that stops — at 24, with the reason shown. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fifteen. The swatch row is **Base**; **there is no "Inherit" value anywhere in A15**; no design renames a shared control. **Background role is locked in three** — 4 Contrast Band, 5 Full Bleed, 6 Cover — each with the reason drawn in the row. **5 Full Bleed's two disabled Aspect values** and **11 Chapters' and 6 Cover's locked Plays rows** keep their stated reasons. This pass **deleted** one row from all fifteen, Playback, with the reason drawn in its place. |
| **Slider labels** | **No subject.** A15 draws no slider: every control is a named-value row, a lock or a read-only row, and each title says what it affects — Width, Aspect, Meta, Plays, Gap, Queue height, Shape. |
| **Avatars with no photograph** | **No subject.** A15 renders no person and draws no initials: the credit line is a string, and no design reads an author or a member. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **No subject, recorded rather than invented.** No design in A15 carries an auth, subscribe or paid-tier action; 2 Split's and 14 Slim Bar's action rows are play triggers for content already on the page. A members-only film is **A32 Paywall's** ground and A7 owns the ask. The note stands in every panel's Data group so the absence is a decision. |
| **The no-JavaScript notice** | **No subject, and no claim to withdraw.** A15 contains no subscribe or sign-in form, so there is nothing for the notice to replace and no "works without JavaScript" promise was ever made about one. The per-design no-JavaScript line is in the table below. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted. |

### The no-JavaScript line, per design

Every design declares `video-facade`, whose degradation the registry states as: *"The poster is an `<a href>`
to the video's canonical URL (YouTube/Vimeo watch page)."* **The trigger compiles as that anchor and the module
upgrades it in place**, so with no script every design below navigates instead of playing in the page — and
**on a first-party media URL there is no facade at all: the native player is the no-JavaScript state**.

| # | Design | Declares | Without JavaScript |
|---|---|---|---|
| 1 | Player | `video-facade` | Head, frame, poster, duration pill and meta line render; the frame is an anchor to the watch page. **In a theatre falls back to the anchor** — there is no dialog. |
| 2 | Split | `video-facade` | Both columns render; **the action and the poster are one anchor**, so the labelled button navigates exactly as the frame does. |
| 3 | Panel | `video-facade` | The plane, its padding, the head and the meta line render; the frame navigates. |
| 4 | Contrast Band | `video-facade` | The band, its bleed and its derived colours render — **the design's whole argument survives**; the frame navigates. |
| 5 | Full Bleed | `video-facade` | The full-width frame renders at its reserved ratio and navigates; the inset focus ring is CSS. |
| 6 | Cover | `video-facade` | **The whole poster is the anchor** and the wash and the type over it are CSS. The theatre needs a script, so the anchor navigates instead. |
| 7 | Grid | `video-facade` | Every cell renders and every cell navigates; **no cell is an unnamed link** — the "Film on {provider}" fallback is server-rendered. |
| 8 | Lead and Grid | `video-facade` | The lead and the row render at their two sizes; each frame navigates. |
| 9 | Carousel | `carousel` + `video-facade` | **The track is fully usable** — a native `scroll-snap` strip — with dots, arrows and counter hidden. Each slide's frame navigates. |
| 10 | Playlist | `tabs` + `video-facade` | **Every film renders stacked** with its own poster, title and meta line, in authored order, each preceded by its label as a heading; each navigates. No current row, no swap. |
| 11 | Chapters | `video-facade` | **The contents list works**: every timecoded row is an anchor carrying the provider's time parameter, so the reader lands at 5:03 on the provider's page. |
| 12 | Embed Card | `video-facade` | The box, its label row, the notice above the frame and the open link all render as text; **the frame is a link to the embed's canonical page**, never an iframe. |
| 13 | Thumb Rows | `video-facade` | Every row renders, rules included; **poster and title are one anchor**, so a row is one tab stop and one destination. |
| 14 | Slim Bar | `video-facade` | The 88 px bar renders; **the whole bar is the anchor** and navigates to the watch page — or, on a first-party media URL, to the file. |
| 15 | Tabs | `tabs` + `video-facade` | **Every film renders stacked**, each preceded by its tab label as a heading; each frame navigates. The strip never becomes a `<select>`. |

**The `tabs` registry ruling still stands open** on 10 Playlist and 15 Tabs: its degradation puts headings in the
outline that neither design otherwise has. Settled once with A13's Walkthrough, flagged on both frames, and
unchanged by this pass.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen designs,
  no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required
  shape, and names **1 Player** and **12 Embed Card** — both of which exist in this category's roster. It is
  the owner's own choice, **confirmed on 29 August 2026** (question 1).

### Open questions

**QUESTION 1 — Which two designs a free site gets — ANSWERED: 1 Player · 12 Embed Card**

Every category gives two of its designs away, and which two is your call. The five plainest here — the ones a
real site could ship without looking unfinished — are **1 Player** (one film, centred, under a small head),
**12 Embed Card** (one embed inside a thin outlined box whose top edge names the provider, and which at its
audio setting needs no picture at all), **14 Slim Bar** (a single 88 px line with a small thumbnail that can be
switched off), **3 Panel** (the same arrangement as 1 Player on one raised panel) and **13 Thumb Rows** (one
film per ruled row, small picture at the left).

1. **1 Player · 12 Embed Card — the default, and the one that needs no photography. (RECOMMENDED — CHOSEN)**
   A free site gets the arrangement every publication expects for a single film, plus the one that works for a
   podcast or an audio interview with no picture at all. Costs nothing: neither needs a photograph, neither
   needs a list of films, and both work identically with or without JavaScript. What it gives up: no free
   design shows several films at once, so a site with a back catalogue has to place the section repeatedly.
   A visitor sees a poster with a play circle and "12:40 · Transcript" beneath it; or a thin outlined box
   reading "Podcast · Soundcloud" with the player inside it.
2. **1 Player · 13 Thumb Rows — the default, and one that holds a set.**
   The free set can then list six films on one page. Costs: every row wants a decent still, so a site without
   good pictures gets six striped placeholders, and the rows only look right between two and six films.
   A visitor sees a stack of ruled rows, each with a small poster at the left and a title and one line beside it.
3. **1 Player · 14 Slim Bar — the two smallest.**
   The quietest possible footprint: a film offered as a single line at the foot of an article. Costs: 14 Slim Bar
   draws no heading at all and hides the section's heading and blurb, which surprises editors who typed them,
   and its film always opens in the overlay player.
   A visitor sees one line: a 96 × 54 thumbnail, "Night crossing to Trafaria", "12:40", and a Watch button.

**QUESTION 2 — The total running time above the Playlist's queue — ANSWERED: kept as drawn**

The Playlist design prints a total — "6 films · 1 h 12 m" — above its list. It can only add up times the author
typed, because **nothing can read how long a film is**: a video file cannot be measured, and of the two video
services only one hands us a duration when a link is pasted. So on a typical YouTube playlist the author types
each time by hand, and if one is missing the total cannot be right.

1. **Keep it as drawn: the total appears only when every film has a time. (RECOMMENDED — CHOSEN)**
   Never wrong, and the author sees the total appear as soon as the list is complete, which is its own prompt to
   finish. Costs: a site that types no times never sees the total, and nothing on screen explains why.
   A visitor sees "6 films · 1 h 12 m", or just "6 films".
2. **Add up the ones that have times and say so — "6 films · 1 h 12 m or more".**
   Something useful always shows. Costs: a new phrase to write and translate, and a number that is honest but
   fuzzy where an editor expected an exact one.
   A visitor sees "6 films · 1 h 12 m or more".
3. **Delete the total and print the count alone.**
   Nothing can ever be wrong, and one field of typing disappears from the editor's job. Costs: the queue loses
   the one piece of information that tells a reader what they are committing to.
   A visitor sees "6 films".

**QUESTION 3 — How much of the Playlist's queue is visible — ANSWERED: the three named heights stay**

The Playlist offers **Four rows · Six rows · All** — how tall the scrolling list beside the player is. One
library rule says that anything counting items should be a number picker rather than a row of fixed buttons.
This row is a height, not a count: the number of films is however many the author pasted. So the rule may or may
not be meant to reach it.

1. **Leave it as three named heights, and record why. (RECOMMENDED — CHOSEN)**
   It behaves like the padding and spacing ladders, which are all named values, and three heights are enough:
   four rows fits beside a 450-tall player, six is the tallest that still reads as a list, All means no scrolling.
   Costs: someone reading the rule literally will flag it again later.
   The editor sees *Queue height: Four rows · Six rows · All*.
2. **Make it a number picker — rows visible, 2 to 12 — with a separate "Show all" switch.**
   Exactly literal about the rule, and an editor with three films can stop the queue from scrolling at all.
   Costs: two controls where there was one, on a panel that already carries five, and most values look identical.
   The editor sees *Rows visible: [ 4 ] ▲▼* and *Show all: on · off*.
3. **Delete the row: the queue always shows every film.**
   One control fewer, and nothing to explain. Costs: a twelve-film queue makes the section very tall on a laptop,
   and the design's own balance — player beside a short list — goes with it.
   The editor sees no row; a visitor scrolls the page instead of the queue.
