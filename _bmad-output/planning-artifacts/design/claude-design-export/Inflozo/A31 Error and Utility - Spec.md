# A31 Error and Utility — written specification

10 designs · Paper pack · drawn 24 August 2026 · **controls reconciled 25 August 2026**

The frames are `A31-0 Category Proof.dc.html` and `A31-1` … `A31-10`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the three pages anatomised,
the tokenisation proof (1 Centred in three packs, light and dark), the stress frame and its six hard
cases, the roster, the component inventory and the findings for the architect. The shared field list
and the item rules are repeated below because the build reads them.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A30, A32 and A34 are specified in root-level
`<ID> — Spec.md` files and this follows them.)*

---

## 0 · The category layer

### What A31 is

**Three pages, one field list.** A31 is not a section category: each design is a whole page, and
every design draws **all three pages** — the **404**, the **500** and the **private-site gate** —
from one shared copy set. A publication picks an arrangement once and gets a coherent set, which is
the only way a category of pages can behave like a category of sections.

**The fact to read first is what each page may touch.** The **404** may query Ghost freely. The
**500** may query nothing at all ⚑. The **gate** may query nothing the visitor is not yet entitled
to see ⚑. Every frame carries that line, and no control in any design moves it.

**Two designs cannot draw all three pages and hand off** — 8 Elsewhere and 9 Directory — and one
cannot draw the 500 — 7 Cover. All three render **1 Centred** with the page's own copy set and say so
on the frame. A1·11 and A29·5's hand-off rule, carried.

A31 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 96 · 80 ·
64); **A1's logo lockup, primary button, ghost action and eyebrow**; **A4·15 and A23's 52 px search
field**; **A16/A30's 46 px field geometry**; **A18·2's result row** and **A18·3's clipped-string
rule**; **A19·3's surface plane**; **A20·13's warm scrim**; **A17·7's on-contrast derivation**;
**A6's focus ring**; **A3·1's minimal line footer**; **A29·5's hand-off rule**. **A31 adds nine
components to the vocabulary** (proof frame) **and nothing else.**

### The four settlements (§8 of the brief)

**1 · What navigation each page keeps.** The **404 keeps everything** ⚑ — header, nav, search,
footer, and A1's member pill if the reader is signed in: a 404 is a page of a working site, and
stripping its chrome tells the reader otherwise. The **500 keeps the site title as text and one link
to `/`** ⚑ — nothing else, because navigation is data, the footer is navigation, search is a request
and the member state is a query. **The wordmark is drawn as text and not as `@site.logo`** ⚑: a logo
is a file URL from settings. The **gate keeps the lockup and nothing else** ⚑ — no nav, no search, no
post titles, no footer. Ghost would give it all of them; the category **refuses** them, because each
describes the site to a visitor who has not been admitted to it. Its one optional line is
`@site.description`, which Ghost's own private page shows.

**The gate renders Ghost's `{{input_password}}` helper** ⚑ — added in this pass, and the one build
line the category cannot leave implicit: a hand-built `<input>` with the wrong `name` never unlocks
the site. Styling comes through the helper's own `class` and `placeholder` params, which is what
`gatePlaceholder` feeds. The form is still the native POST to `/private/?r={{@path}}`.

**2 · The gate's form states.** Four, one geometry: **empty** (the state almost every visitor sees),
**focused**, **filled**, **wrong password**. **Wrong password is a fresh server render, not an inline
check** ⚑: Ghost re-renders `private.hbs` with its own error string, **the field comes back empty**
(Ghost does not echo a password) and **focus returns to it**. The message sits **above the label**, so
it is met before the input in reading order and in focus order. **There is no themed submitting
state** ⚑ — the form is a native POST to `/private/?r=`, so the browser owns the wait and the button
keeps its resting look; a spinner would need a module the registry does not have (closest:
`member-form`, which posts to the members endpoint and is the wrong one), and **that is a finding, not
a new module**. **The message is Ghost's string and never a field** ⚑, drawn in the text colour on the
plate under a hairline — **never in red**: no pack has an error token.

**3 · Whether search appears on a 404.** **Yes, and on by default** ⚑. It is A23's 52 px field,
verbatim, over **a real `<form action="/search/" method="get">`** ⚑, so it works with JavaScript off,
and it searches what A23's index carries: **title, excerpt and slug — body text is not indexed** ⚑.
**Never on a 500** ⚑ (the index is a request to the site that is failing) and **never on the gate** ⚑.
Every design carries the Show / Hide row and none of them offers it on the other two pages.

**4 · What a 500 can rely on rendering.** **Its own words, the site title as text, and one link to
`/`** ⚑. No `{{#get}}`, no navigation, no member state, no settings image, no search, no footer —
because a 500 may be the data layer failing and every query is a second chance to fail. **The ceiling
is lower still** ⚑: if the theme itself is what failed, Ghost serves its own built-in error page and
nothing designed here renders at all. A31 cannot design that page and does not pretend to; what it can
do is make the theme's own 500 depend on nothing.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The page fills the viewport.** `min-height: 100svh` minus the chrome, with the block **optically
  centred** at ≥ 768 and **top-aligned at 64 below it** ⚑ — a centred column on a short phone
  viewport with a keyboard open is a column nobody can see. **Two designs keep the block centred at
  390**: 6 Contrast Band and 10 Display, because on a band there is no page ground to align to ⚑.
- **Vertical padding.** A17's ladder — **96 · 80 · 64** — measured from the chrome, not from the
  frame edge. 8 Elsewhere and 9 Directory are **top-aligned at every width** ⚑ because a list under a
  message is a page that scrolls.
- **The measures.** Heading and sentence at **620** (1, 3, 4, 6, 7), **560** (2's left column, 5, 8,
  9), **520** (10's right column); rows at **820** (8) and **1,000** (9's two columns). **A measure
  never grows with its container** ⚑.
- **The type.** Chip mono 11.5 tracked · eyebrow 13 uppercase tracked .08em · heading **40 · 34 ·
  28** · sentence 17, 16 at 390 · button 15/600 · secondary link 14 · nav item 19 · row title 21 ·
  meta 13 · display numeral 156 · mono annotations 9.5–11. **Nothing below 13** ⚑. **The type ladder
  is never scaled by a control** ⚑ — 10 Display's Display size moves the numeral and nothing else.
- **Accent, once per design.** **The primary button, and nothing else.** **6 Contrast Band and 10
  Display have no accent at all**: Paper's `#D96C3F` measures 4.0:1 on the band and 2.1:1 on the
  inverted band in dark, so in both the Accent value **is drawn disabled with its ratio shown** ⚑ and
  the button carries the band's own ink.
- **Targets.** The primary action, every secondary and recovery link, every nav item and the gate's
  button are **44 px or taller** — nav items 56, dropping to 48 at 390 ⚑. **The chip, the display
  numeral, the mono annotations and the row arrows are not targets** and are out of focus order.
- **Responsive floor.** Splits collapse at **833** (2, 10) · columns collapse at **767** (5, 9) ·
  **cards, boxes, planes and bands do not collapse at all** (3, 4, 5, 6, 7). **At ≤ 767 the primary
  button and the search field go full width in every design** ⚑ and the secondary line moves beneath.
  Every element that leaves a width has a stated destination.
- **Dark.** A27's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm shadows dropped
  and the hairline carrying every plane; **card and plane depth forced to Flat** ⚑. **The contrast
  band inverts with the mode** ⚑ and becomes the light band on a dark page (6, 10). **The scrim is the
  dark ink at the same percentage** (7) ⚑ — the photograph itself is never filtered, dimmed or tinted.
- **Print.** **These pages print as they render** and none of them prints its search field ⚑ — a
  printed error page is rare and a printed search box is useless. The gate's form does not print ⚑.
- **Behaviour.** **Nine of ten declare `core` and nothing else** ⚑ — and the no-JS statement is one
  line: **every design is pixel-identical with JavaScript off**. **The one stated exception is 9
  Directory at Nav children: From Ghost prefixes**, which declares `nav-transform` — **ARCHITECT:
  registry addition** ⚑, because no module in the registry transforms a navigation label. Per owner
  ruling **no no-JS accommodation is designed for it**: the flat raw-prefix list is the degradation. The header's `nav-drawer` at ≤ 767 on the 404 is **A1's**,
  not any A31 design's ⚑.
- **Refused category-wide, each with a reason:** **a drawn illustration** ⚑ (not re-skinnable by
  tokens, and the user cannot author one — 7 Cover's photograph is the tokenisable answer) · **a soft
  404 that renders the archive below the message** ⚑ (a page that looks like it worked, and it cannot
  exist on a 500) · **an automatic redirect after a few seconds** ⚑ (no module, and it takes the
  decision from the reader) · **"did you mean …?" from the URL** ⚑ (Ghost offers no fuzzy match) ·
  **search-as-you-type** ⚑ (the index is a network request; A23 owns live search) · **a member
  greeting on the gate** ⚑ · **a themed 503 or maintenance page** ⚑ (Ghost's is not themable) · **red
  as an error colour** ⚑ · **a retry timer or attempt counter** ⚑ · **a per-item control of any
  kind** ⚑.

### The three universal controls — outside every design's list

Added in the reconciliation pass. **Every placeable section carries these three and none of them counts
toward the design's own list** ⚑, on the same values everywhere.

| Row | Values | What it resolves to here |
|---|---|---|
| Background role | Background · Surface · Contrast | The ground under the whole page — chip, heading, sentence, field and button re-derive on it. **At Contrast a page-ground design does not become 6 Contrast Band** ⚑: 6 is full bleed, carries its own internal padding and has no accent. **Locked in four designs** — 5 Panel to Surface, 6 and 10 to Contrast, 7 Cover to Image — **with the reason shown on the row** ⚑ |
| Vertical spacing | Compact 64 · Comfortable 96 · Spacious 132 | A17's ladder above and below the block at 1440; **80 at 834 and 64 at 390 whatever it says** ⚑, measured from the chrome and not the frame edge. **This is the row a design would otherwise call Padding** ⚑ |
| Top divider | None · Line · Fade | Above the block, default None ⚑ — on the 404 A1's header draws that edge already, and on the 500 and the gate there is no chrome to divide from. **On a band it draws in the band's carried ink at 20 %** (6, 10); **over a photograph it defaults to None** (7) |

**4 Boxed keeps a Padding row under a different name** ⚑: its ladder is the *box's* internal padding, a
different measurement from the page's vertical rhythm, so the row is renamed **Box padding** and stays
in the design's own list. No other design had a Padding row to remove.

### The editor state switcher — P0·6

**The three copy sets are edited in place** ⚑, through P0·6's state switcher above the canvas: *Page:
404 · 500 · Gate*, and *Gate state: Empty · Wrong password*. Until this pass **two of the three sets
were blind sidebar fields** — a publication wrote the 500 and the gate without seeing either. The
switcher is an editor affordance and **not a control**: on the live site the status code and the
template decide, which is what the read-only source row below says. **The wrong-password message is
not editable in either state** ⚑ — it is Ghost's string.

### The Content group — the authored strings

Every visible text in A31 is **editable inline on canvas with the shared P0·1 toolbar** — bold ·
italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
noreferrer · sponsored**: `heading`, `blurb`, `eyebrow`, `primaryLabel`, `secondaryLabel`,
`links[].label`, `linksLabel`, `searchPlaceholder`, `postsLabel`, `directoryLabel`,
`gateDisplayWord` and the gate's four field strings. **Every URL field opens the Ghost-aware Link
Picker** — `primaryUrl`, `secondaryUrl`, `links[].url`. **The primary button takes an optional icon**
from the Icon Picker, before or after the label, on P0·2's button-icon rules (always Small, always the
label's colour, its Size and Colour rows hidden) ⚑.

**Ghost-owned content is never inline-editable** ⚑ — the status code, Ghost's wrong-password string,
post titles and excerpts, navigation labels and `@site.title` all answer **"Edit in Ghost"** or show
P0·1's lock pill. **`links[]` is the P0·3 authored list** with drag reorder, per-row Remove that is
never disabled, and an Add that arrives with content; **the post rows and the nav items are Ghost's
and carry no Add** ⚑.

**No fixed English visitor-facing string ships** ⚑. Every literal the frames drew is now a field with
a default, with **two exceptions that are theme translation-catalog strings**: `search.label` and
`search.submit`, the 404 field's accessible name and its submit word — system words for a control,
not the publication's words. **Ghost's wrong-password string is neither** — it is Ghost's, and no
control changes it.

**There is no Preview control in any A31 panel** ⚑ and there never was one to remove: previewing is
the editor's job, and the three pages are P0·6's switcher.

### The controls every design shares — the Page source group

Five rows, identical in all ten, **below** each design's own controls and **not counted toward the
brief's 4–7** ⚑, all five read-only.

| Field | Type | Value |
|---|---|---|
| Which page this is | read-only | From the status code — `error.hbs` at a 404, the same file at a 500, `private.hbs` at `/private/` ⚑ |
| What a 500 may ask Ghost for | read-only | Nothing — no `{{#get}}`, no navigation, no member state, no settings image ⚑ |
| Navigation on this page | read-only | Full on the 404 · title and one link on the 500 · none on the gate ⚑ |
| Where the gate posts | read-only | Ghost's `/private/` — the wrong-password message is Ghost's string ⚑ |
| What search reaches | read-only | Title, excerpt and slug (A23's index); **the 404 only** ⚑ |

### The roster

| # | Design | Tuple | Ctl | Modules | Hand-offs |
|---|---|---|---|---|---|
| 1 | Centred | `stack · none · page · none · none · the centred column` | 7 | `core` | — |
| 2 | Split Reason | `split · none · page · none · none · the reason beside the action` | 7 | `core` | — |
| 3 | Card | `stack · card · page · none · none · a raised card on the page ground` | 7 | `core` | — |
| 4 | Boxed | `stack · box · page · none · none · one hairline box in the measure` | 6 | `core` | — |
| 5 | Panel | `stack · none · surface · none · none · one raised plane across the box` | 7 | `core` | — |
| 6 | Contrast Band | `stack · none · contrast · none · none · an inverted full-bleed band` | 7 | `core` | — |
| 7 | Cover | `stack · none · image · none · background · the block over a photograph` | 7 | `core` | 500 → 1 · no image → 6 |
| 8 | Elsewhere | `feed · none · page · many · none · recent posts under the message` | 7 | `core` | 500 → 1 · gate → 1 |
| 9 | Directory | `nav · none · page · many · none · the site's own navigation as the page` | 8 | `core` + `nav-transform` ⚑ | 500 → 1 · gate → 1 · no nav → 1 |
| 10 | Display | `split · none · contrast · none · none · the code at display size` | 7 | `core` | — |

All ten are distinct on the five closed slots. **Containment separates 1, 3 and 4** — `none`, `card`,
`box`. **Ground separates 1, 5, 6 and 7** — `page`, `surface`, `contrast`, `image`. **Archetype
separates 1, 2, 8 and 9** — `stack`, `split`, `feed`, `nav`. **10 Display is the only one that needs
two slots** ⚑: `split` against 6, `contrast` against 2. **Media placement separates 7 alone**, at
`background`. **Containment is `none` in eight of ten** ⚑ — the recovery links, the post rows and the
nav items are the items' own geometry or none at all, never the section's.

**What the check cannot promise.** 3 and 4 are one design in two containments, a fill and a shadow
apart — visible at rest, thin written down. 8 and 9 reach the same five slots but for archetype, and
what actually distinguishes them is the **source** of their items — posts against navigation — which
no machine reads. 1 and 3 differ on one slot and on nothing else a machine can see. **Each design's
panel names the designs it is closest to, by number, and says which control value would take it
there.**

### The shared field list

The union every design draws from. **The copy set — the first six fields — exists once per page** ⚑
(404, 500, gate), so a publication that turns privacy on for a week does not write the gate from
scratch and then lose it.

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `code` | text | opt | 4 ch | all 10 | **Ghost's status code overwrites it on the error pages** ⚑; the field exists for the gate, which has none |
| `eyebrow` | text | opt | 24 ch | all 10 | Defaults "Not found" · "Our end" · "Private" ⚑. **Because the default is per page, clearing the field cannot hide it — every design now carries Eyebrow (Show · Hide)** ⚑ |
| `heading` | text | **has a default** | 60 ch advisory | all 10 | **Never clipped in any design** ⚑ — it wraps |
| `blurb` | text | opt | 240 ch | all 10 | One sentence; the stack closes up without it |
| `primaryLabel` · `primaryUrl` | text · url | opt | 30 ch | all 10 | Default "Go to the home page" → `/`. **Forced to `/` on the 500** ⚑; clipped at 30, whole string in the DOM |
| `secondaryLabel` · `secondaryUrl` | text · url | opt | 30 ch | all 10 | A text link, never a second button ⚑. **On the 500 it is an authored mailto** ⚑ |
| `links[]` | list 0–6 | opt | label 40 ch · url | 1, 2, 3, 4, 5, 6, 7, 10 | **The category's only authored repeater** ⚑. **Dropped on the 500, absent on the gate** ⚑; 8 and 9 store it |
| `linksLabel` | text | opt | 24 ch | as `links[]` | Default "Try one of these"; **the accessible name of 5's nav landmark** ⚑ |
| `searchPlaceholder` | text | opt | 60 ch | all 10, 404 only | Default "Search 412 essays and interviews" — A23's, with A23's count ⚑ |
| `image` · `imageAlt` · `imageFocus` | image · text · enum | **req in 7** | ≥ 2,400 px · 120 ch · 9 positions | 7 | **No image → 7 renders 6** ⚑. Focus is a field, not a control ⚑ — **and it sits in the Image Picker's popover rather than a hidden field** (Centre · Top · Bottom). Not drawn on the 500 at all |
| `postsLabel` | text | opt | 24 ch | 8 | Default "Recently on Orbit Weekly"; stored by the other nine ⚑ |
| `directoryLabel` | text | opt | 24 ch | 9 | Default "Everything the site does have"; the nav landmark's accessible name ⚑ |
| `gateDisplayWord` | text | opt | 16 ch | 10 | Default "Private" ⚑ — **invented**: there is no status code at `/private/` |
| `gateFieldLabel` | text | opt | 24 ch | all 10, gate only | Default "Password" ⚑ — **new in this pass**: drawn on every gate frame and absent from the field list |
| `gateCtaLabel` | text | opt | 24 ch | all 10, gate only | Default "Enter" ⚑ — **new in this pass**; the frames drew "Continue" and now draw the default |
| `gatePlaceholder` | text | opt | 40 ch | all 10, gate only | **Empty by default** ⚑ — passed to `{{input_password}}` as its placeholder param, so empty ships no placeholder attribute |
| `gateHelp` | text | opt | 120 ch | all 10, gate only | Default as drawn ⚑ — **new in this pass**: "Ask whoever sent you the link…" was a fixed English literal under the button |
| *statusCode · message* | Ghost | req | — | all 10 | The chip's text; **a code that is neither 404 nor 500 falls back to the 500's copy set** ⚑. **Variable names to be verified** ⚑ |
| *@site.title · @site.description* | Ghost | req | — | all 10 | The wordmark, **drawn as text on the 500** ⚑; the description is the gate's one optional line |
| *navigation* | Ghost | opt | — | 9 · the header on the 404 | **Label and URL only** ⚑. **Never queried on the 500 or the gate** ⚑ |
| *posts* | Ghost | opt | — | 8 | `{{#get "posts" limit=5}}`, **on the 404 only** ⚑ |
| *{{error}}* | Ghost | opt | — | all 10, gate only | **The wrong-password string, and it is Ghost's** ⚑ — not a field, and no control changes its words |

Four fields are drawn by exactly one design each — the image group (7), `postsLabel` (8),
`directoryLabel` (9), `gateDisplayWord` (10) — **and all four are stored by the other nine** ⚑.

### Repeating items — `links[]`, and only `links[]`

**One authored repeater in the whole category**: `links[]`, the recovery list, drawn by eight of the
ten. **8 Elsewhere's post rows and 9 Directory's nav items are Ghost's objects** — queried, not
authored — and neither gets an Add, a Remove or a reorder in the sidebar ⚑; posts are edited in Ghost
and navigation in Ghost's navigation settings.

- **Add an item** sits at the foot of the list — "+ Add a link". **A new item arrives with content,
  never as an empty shell** ⚑: label "The archive index", URL `/archive/`. **It lands last**, because
  the list is a reading order and a new item's place is the author's decision.
- **Remove** is a row action. **Removing the last one is allowed** — the minimum is zero — and at zero
  **the list, its label and its hairline leave together** ⚑ and the design closes up. No placeholder
  row, nothing reserved.
- **Reorder** is a drag on the sidebar rows, and **order is meaningful** ⚑: first is the destination
  the publication most wants a lost reader to take. 4 and 5 read top to bottom; 1, 3, 6, 7 and 10
  read left to right, then down.
- **Minimum 0, maximum 6, designed for 2–4** ⚑. At **1** the row does not stretch. At **5–6** the
  wrapping rows go to two or three lines and 5's column simply gets taller. **Above 6 Add is disabled
  with the reason shown** — a recovery list longer than six is a navigation menu, **and that is 9
  Directory**.
- **At zero items** the section renders heading, sentence and one button — the category floor.
- **Inside an item the user edits content only** ⚑: **the label and the URL, and nothing else.** No
  per-item size, weight, colour, ordinal or emphasis. Selecting a link on the canvas opens those two
  fields and closes. **Both are required** — a link with no destination is not a link — and **4 Boxed
  is the only design that draws the URL as text** ⚑ (dropped below 767).
- **Design controls apply to every item at once** ⚑. "Make the third link bigger" is not expressible:
  a control writes one value onto the section and the stylesheet reads it. A list where one item needs
  to be louder is a list with a first item, and the fix is order.

---

## 1 · Centred

1. **Descriptor.** One column optically centred in the viewport — code chip, heading, sentence, search
   field, primary action beside a text link, and the authored recovery list under a hairline. No box,
   plane or band. The category default.
2. **Structural descriptor.** `stack · none · page · none · none · the centred column` — containment
   `none` and ground `page` are what 3, 4, 5 and 6 each change exactly one of. **The recovery links
   are not items**: one authored list drawn as a row, so item-count stays `none` ⚑.
3. **Archetype.** stack. Two departures: **at ≤ 767 the block top-aligns instead of centring** ⚑, and
   the action row stacks.
4. **Responsive rule.** **1440** measure 620 in the 1,296 box on a 72 margin, heading 40, field 520,
   action row horizontal, block centred in the viewport. **834** measure 560, heading 34, field 460.
   **≤ 767** measure 350, heading 28, **top-aligned at 64** ⚑, field and button full width, link
   beneath, links a wrapping row.
5. **Content fields.** `code` · `eyebrow` · `heading` · `blurb` · `primaryLabel` · `secondaryLabel` ·
   `links[]` · `linksLabel` · `searchPlaceholder` — **and the first six again for each of the three
   pages** ⚑. `image` stored, not drawn.
6. **Controls.** Alignment (Centred · Flush left) · Measure (Narrow 520 · Standard 620 · Wide 720) ·
   Code (Chip · Plain · Eyebrow · Hidden) · Search on the 404 (Show · Hide) · Recovery links (Show ·
   Hide) · Height (Fill the viewport · Content height). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** The 404 may query freely; **the 500 queries nothing** ⚑; the gate queries title and
   description only ⚑. **0 links** → list and hairline leave. **1** → the row holds. **many** → it
   wraps at the measure and never scrolls.
8. **Empty state.** No blurb → the stack closes up. No links → hairline and label go together ⚑. No
   code → the heading rises. **The heading has a default in all three sets** ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑ — the copy is
   server-rendered, the field is a real GET form. **Edit-safe:** nothing to suppress.
10. **Accessibility.** **The heading is the page's `h1`** ⚑. Focus order: skip link, header, field,
    primary, secondary, recovery links. The chip is decorative text, not a target. Muted 5.4:1, accent
    button 4.7:1 ⚑. **The document title names the code** — "Not found · Orbit Weekly" ⚑.

**Reconciled ⚑** Seven controls — **Eyebrow (Show · Hide)** joins the six, because the eyebrow's per-page default meant clearing it could not hide it. The universal trio sits outside the list with **Background role free**; this design never had a Padding row to fold in. **The three copy sets are edited in place through P0·6** rather than as blind sidebar fields, and **the gate's four strings — label, button, placeholder, helper line — are fields for the first time**, over Ghost's `{{input_password}}` helper.

**Flagged ⚑** The three copy sets are invented — Ghost supplies a status code and a message string,
not words a publication would want. Centring on the viewport rather than the document is this design's
decision. 620 and the 520 field width are A31's own numbers.

---

## 2 · Split Reason

1. **Descriptor.** Code, heading and sentence in the left column of the content box; search field,
   primary action and recovery list in the right. Top-aligned, on an 80 px gap, with an optional
   hairline between.
2. **Structural descriptor.** `split · none · page · none · none · the reason beside the action` —
   archetype is what separates it from 1, otherwise the same five slots ⚑.
3. **Archetype.** split. Two columns above 833, stacked below, left column first. No departures.
4. **Responsive rule.** **1440** 560 · 656 on an 80 gap, heading 40, field 460, top-aligned. **834**
   340 · 356 on a 56 gap, heading 34. **≤ 833** one column, **left column first** ⚑, 32 between them,
   heading 28, field and button full width, **the divider dropped** ⚑.
5. **Content fields.** As the union, less `image`. **The widest user of the list** ⚑.
6. **Controls.** Split (Even · Text-heavy · Action-heavy) · Gap (Tight 48 · Standard 80 · Wide 112) ·
   Divider (None · Hairline between) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide)
   · Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **At 0 links the right column is field and button and does not stretch** ⚑; at many
   it grows with the page and never scrolls internally.
8. **Empty state.** No sentence → the left column is chip and heading and **the columns stay
   top-aligned** ⚑. No links → hairline and label leave. An empty right column cannot happen.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Heading is the `h1`; **the two columns are one `main` in source order** ⚑, so
    stacked order and focus order are the same list. The divider is CSS on the wrapper.

**Reconciled ⚑** Seven controls with Eyebrow added. As **the widest user of `links[]`**, this design is the clearest case of P0·3's item controls: drag reorder, Add arriving with content, Remove never disabled. The trio sits outside the list with Background role free — at Contrast **both columns re-derive together**, which is what keeps this design 2 and not 10.

**Flagged ⚑** The 560 · 656 default split and top-aligning the columns rather than centring them to
each other are invented. Dropping the divider in the collapse rather than rotating it is this design's
call.

---

## 3 · Card

1. **Descriptor.** The stack inside one surface card centred on the page ground — pack radius + 4, one
   hairline, the warm md shadow, 720 wide with 40 of padding.
2. **Structural descriptor.** `stack · card · page · none · none · a raised card on the page ground` —
   **containment `card` is the section's own geometry** ⚑; ground stays `page` because the page ground
   is what the card sits on and is visible around it.
3. **Archetype.** stack. One departure: **the card keeps its containment at every width** ⚑.
4. **Responsive rule.** **1440** card 720, padding 40, measure 640, field 480. **834** card 640,
   padding 40. **≤ 767** card 350 on the 20 margin, padding 24, heading 28, field and button full
   width, top-aligned. **The radius is the pack's at every width** ⚑.
5. **Content fields.** As the union, less `image` (stored).
6. **Controls.** Card width (Narrow 560 · Standard 720 · Wide 880) · Depth (Raised · Flat) · Alignment
   (Centred · Flush left) · Code (Chip · Plain · Hidden) · Search on the 404 (Show · Hide) · Recovery
   links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. The card renders at every data state, **including the 500 where nothing is
   queried** ⚑.
8. **Empty state.** Missing fields close the stack; **the card does not shrink below 320 of content
   height** ⚑, so a heading and a button alone is still a card and not a strip.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** The card is a `div`, **not a `section` with a label — it has no accessible name
    to give** ⚑. **The focus ring's offset is filled with the surface token** ⚑. Surface-on-page is a
    1.3:1 step, **which is why the hairline is not optional** ⚑.

**Reconciled ⚑** Seven controls with Eyebrow added. **Background role moves the page ground the card sits on and never the card's own surface** ⚑ — the distinction 3 exists to make; at Surface the hairline carries the whole edge, because surface-on-surface is no step at all. Depth stays this design's own row.

**Flagged ⚑** 720 · 40 and the 640 inner-measure cap are invented. Keeping the card at 390 rather than
dissolving it is this design's decision and the one most likely to be argued with.

---

## 4 · Boxed

1. **Descriptor.** One hairline box at 720 in the content box — no fill, no shadow — with the authored
   recovery links as ruled rows inside it, label left and URL in mono right.
2. **Structural descriptor.** `stack · box · page · none · none · one hairline box in the measure` —
   **`box` against 3's `card`** is the whole structural distinction ⚑: a box is a border, a card is a
   raised surface. Item-count stays `none`; the ruled rows are one authored list ⚑.
3. **Archetype.** stack. One departure: **the box keeps its border at every width** ⚑.
4. **Responsive rule.** **1440** box 720, padding 36, rows 48, URL shown, field 460. **834** box 640,
   padding 36. **≤ 767** box 350, padding 22, **rows 44 and the URL dropped** ⚑, field and button full
   width, top-aligned.
5. **Content fields.** As the union, less `image`. **The only design that draws `links[].url` as
   text** ⚑.
6. **Controls.** Box width (Narrow 560 · Standard 720 · Wide 880) · **Box padding** (Compact 24 ·
   Comfortable 36 · Spacious 52) ⚑ · Recovery links (Ruled rows · Plain list · Hide) · Code (Plain ·
   Chip · Hidden) · Search on the 404 (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group. **Six now — Eyebrow joins the five** ⚑.
7. **Data.** As 1. **At 0 links the box loses its rows and internal hairlines** ⚑; at 6 it grows and
   **never scrolls internally** ⚑.
8. **Empty state.** A row with an empty `url` draws the label and reserves nothing ⚑. No links → no
   rows. The box itself has no empty state.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Rows are `a` elements filling the row, **44 px minimum at every width** ⚑; the
    mono URL is inside the same link. **The URL is not `aria-hidden`** ⚑ — a reader who cannot see it
    is the reader most likely to want it.

**Reconciled ⚑** Six controls: Eyebrow joins the five, and **"Padding inside" is renamed Box padding** ⚑. It is a box-internal ladder rather than the section's vertical rhythm, so it survives the duplicate-row rule under a distinct name while **Vertical spacing** in the trio owns the page's own 96 · 80 · 64. The ruled rows are still the only place `links[].url` draws as text, and P0·3 governs the list.

**Flagged ⚑** Showing the URL is invented and is the distinguishing decision. Five controls rather
than six is a deliberate departure from the working norm. The 48 → 44 row ladder is A31's own.

---

## 5 · Panel

1. **Descriptor.** One raised surface plane across the content box: message and action left, the
   recovery links in a right column behind a hairline. The page ground shows above and below, not
   around.
2. **Structural descriptor.** `stack · none · surface · none · none · one raised plane across the box`
   — **ground `surface` is the distinction** ⚑; containment is `none` because **the plane is the
   section's ground, not a box it sits in** ⚑.
3. **Archetype.** stack. One departure: the right column moves beneath the button at 767 ⚑.
4. **Responsive rule.** **1440** plane 1,296, padding 56, measure 620, link column 300 behind a
   hairline, gap 48. **834** plane 754, padding 40, measure 480, column 210, gap 32. **≤ 767** plane
   350, padding 24, **column under the button behind a horizontal hairline** ⚑, field and button full
   width.
5. **Content fields.** As the union, less `image`. **The only design that draws the links as a second
   column** ⚑.
6. **Controls.** Panel height (Content · Fill the viewport) · Depth (Raised · Flat) · Block position
   (Flush left · Centred) · Recovery links (Beside the text · Under the text · Hide) · Code (Chip ·
   Plain · Hidden) · Search on the 404 (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **At 0 links the column and its hairline leave and the left side keeps its
   measure** ⚑; at 6 the column grows and the plane grows with it.
8. **Empty state.** No sentence → the stack closes. No links → no column. On the 500 there is no
   column by rule ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Heading is the `h1`. **The link column is a `nav` with an accessible name from
    `linksLabel`** ⚑ — the only nav landmark A31 draws, and **absent on the 500 and the gate**.
    Surface-on-page 1.3:1, so the hairline is not optional ⚑.

**Reconciled ⚑** Seven controls with Eyebrow added. **Background role is locked to Surface with the reason shown** ⚑ — the raised plane is this design's ground and its identity, and a role that moved it would leave 1 Centred with a shadow. Vertical spacing owns the page rhythm; Panel height stays this design's own row, and `linksLabel` still names the nav landmark.

**Flagged ⚑** The 300 px link column and its hairline are invented. Offering Panel height = Fill while
advising against it is a judgement. Naming the column a nav landmark should be checked by the build.

---

## 6 · Contrast Band

1. **Descriptor.** The page as one inverted full-bleed band at viewport height, the block centred on
   it, every value derived from the band's carried ink. No accent, no plane, no shadow.
2. **Structural descriptor.** `stack · none · contrast · none · none · an inverted full-bleed band` —
   **containment is `none`** ⚑: the band is a ground, not a box.
3. **Archetype.** stack. One departure: **the block stays centred at ≤ 767** ⚑, because on a band
   there is no page ground to align against.
4. **Responsive rule.** **1440** full bleed, padding 96 · 72, measure 620, field 520. **834** padding
   80 · 40, measure 560, field 460. **≤ 767** padding 56 · 20, measure 350, **block still centred** ⚑,
   field and button full width. **The band never collapses, narrows or gains a margin** ⚑.
5. **Content fields.** As the union, less `image` — **an image behind a band is 7 Cover** ⚑.
6. **Controls.** Band height (Fill the viewport · Content height) · Alignment (Centred · Flush left) ·
   Button (Carried colour · Outline · ~~Accent~~ disabled, 4.0:1) · Code (Chip · Plain · Hidden) ·
   Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **This design's 500 loses nothing but the list** ⚑ — no image, no plane, no query,
   which makes it the safest of the ten on a 500.
8. **Empty state.** As 1.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** **Every derived value re-checked on the band** ⚑: carried ink 13.6:1, muted at
    72 % 6.9:1, the 20 % hairline 1.7:1, the button's inverted pair 13.6:1. **The accent is not used
    because it does not pass** ⚑. The focus ring is carried ink, not accent.

**Reconciled ⚑** Seven controls with Eyebrow added. **Background role is locked to Contrast** ⚑ with the reason on the row — the inverted band is the design, and it inverts with the mode rather than with a role. **Top divider draws in the band's carried ink at 20 %** rather than the pack's hairline, and Vertical spacing is the band's internal padding ladder.

**Flagged ⚑** The band inverting with the mode is A32's rule, carried. The 4.0:1 and 2.1:1 accent
measurements are this pack's. Keeping the block centred at 390 is this design's departure from the
category floor.

---

## 7 · Cover

1. **Descriptor.** A photograph filling the page under a flat 45 % warm scrim, the block centred on it
   in derived carried values. **Hands off to 1 Centred at a 500** ⚑.
2. **Structural descriptor.** `stack · none · image · none · background · the block over a photograph`
   — the only `image` ground and the only `background` media placement in A31 ⚑.
3. **Archetype.** stack. Departures: **the crop changes ratio at 767** ⚑, and **the design does not
   render on a 500 — it hands off** ⚑.
4. **Responsive rule.** **1440** full-bleed 16:9 at viewport height, padding 72, measure 620, scrim
   45 %. **834** 16:9, padding 48, measure 560. **≤ 767** **4:5 crop** ⚑, padding 24, measure 350,
   block centred, field and button full width. **The scrim never changes with width** ⚑.
5. **Content fields.** The union plus `image` · `imageAlt` · `imageFocus` — **required here, drawn
   nowhere else** ⚑. **No image → the design renders 6 Contrast Band** ⚑.
6. **Controls.** Scrim (Light 30 · Standard 45 · Heavy 60) · Alignment (Centred · Flush left · Bottom
   left) · Image height (Fill the viewport · Fixed 640) · Code (Chip · Plain · Hidden) · Search on the
   404 (Show · Hide) · Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** **404**: an uploaded file on the section, drawn directly. **500**: hand-off to 1 ⚑ — no
   file, no query, no settings value. **Gate**: the image draws; it leaks nothing about the site's
   contents ⚑.
8. **Empty state.** **No image is the one empty state that changes the design** ⚑ — hand-off to 6
   rather than an empty grey plate. **No alt text is an editor warning, not a blocked save** ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. The image is a plain
   `img` with `loading="eager"` ⚑ — an error page's picture is above the fold by definition.
10. **Accessibility.** Derived values re-checked on the scrim: carried ink 8.9:1 at the crop's
    lightest area ⚑, muted at 80 % 6.4:1. **The focus ring's offset carries a 40 % ink scrim** because
    there is no ground behind it ⚑ — A31's one departure from A6. `imageAlt` is required when the
    picture carries meaning; **empty `alt` is correct when it is decoration** ⚑.

**Reconciled ⚑** Seven controls with Eyebrow added. **Background role is locked to Image** ⚑ — the photograph is the ground, and with no image the design hands off to 6 rather than falling back to a role. **Image focus now sits in the Image Picker's popover** ⚑: the "focus is a field, not a control" ruling stands, the unreachable part of it does not. Top divider defaults to None over a picture.

**Flagged ⚑** The 4:5 mobile crop, the 45 % default and both hand-off targets are invented here. The
ring's 40 % ink offset is A31's one departure from A6. Whether a 500 may safely reference an uploaded
file is the finding behind the hand-off.

---

## 8 · Elsewhere

1. **Descriptor.** The message at 620 with an optional search field, a hairline, then five recent
   posts as A18's ruled rows at 820. **Hands off to the message alone on a 500 and on the gate** ⚑.
2. **Structural descriptor.** `feed · none · page · many · none · recent posts under the message` —
   archetype and item-count together are the claim ⚑; containment `none` even at Thumbnails =
   Standard.
3. **Archetype.** feed. Departures: **three rows and no excerpt below 767** ⚑, and **no list at all on
   a 500 or the gate** ⚑.
4. **Responsive rule.** **1440** message 620, rows 820, five rows, one excerpt line, density 22, title
   21. **834** message 560, rows 674, five rows. **≤ 767** message 350, rows 350, **three rows, no
   excerpt** ⚑, title 18, density 18, field and button full width. **Top-aligned at every width** ⚑.
5. **Content fields.** The union less `image` and less `links[]` — **stored, not drawn** ⚑: the rows
   are the recovery. Adds `postsLabel`.
6. **Controls.** How many posts (3 · 5 · 8) · Row (Title only · Title and meta · Title, meta and
   excerpt) · **Posts** (Most recent · Featured · By tag (tag picker) · By author (author
   picker) · Hand-picked) ⚑ · Thumbnails (None · Small 96 · Standard 128) · Code (Chip · Plain · Hidden) ·
   Search on the 404 (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** `{{#get "posts" limit="5" order="published_at desc"}}` **on the 404 only** ⚑. **The
   source is the library's standard set** ⚑ — Most recent · Featured · By tag (tag picker) · By author
   (author picker) · Hand-picked — set through P0·5's "Populate from…" panel, with Count still *How
   many posts* (3 · 5 · 8). **A 404 has no tag context, but a tag or author the publication chose is a
   plain fixed-count query** ⚑. **No list here shows an Add** — the rows are Ghost's. **0
   posts** → label and hairline leave with the list ⚑. **1** → one row, no stretch. **many** → capped
   at the control's value. **No query at all on the 500 or the gate** ⚑.
8. **Empty state.** **The list is absent, never empty** ⚑. No excerpt → the row closes up. No feature
   image at Thumbnails = Standard → **the row draws without one and reserves nothing** ⚑ (A18's rule).
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **It does not declare
   `load-more`** ⚑ — an error page with pagination is an archive page wearing an apology.
10. **Accessibility.** Heading is the `h1`; **the list is a `ul` of links named by `postsLabel`** ⚑.
    Each row is one link containing title, excerpt and meta — A18's decision, carried. Meta 5.4:1.

**Reconciled ⚑** Seven controls with Eyebrow added, and **the disabled "Most recent in the same tag" value is gone** ⚑. **Posts** now reads Most recent · Featured · By tag · By author · Hand-picked on the library's standard sources, with the tag and author pickers beside it and Count still *How many posts*. `links[]` stays stored and undrawn, so P0·3's controls never open here; the post rows are Ghost's and carry no Add.

**Flagged ⚑** Two measures (620 and 820), dropping to three rows below 767 and defaulting thumbnails
off are invented. The disabled "same tag" value is this design's finding stated as a control. Whether
a 404 may safely query at all is flagged for the architect.

---

## 9 · Directory

1. **Descriptor.** The message at 560, then Ghost's own navigation at page scale in two ruled columns
   at 19 px. A 404 answered with a map. **Hands off to 1 Centred on the 500 and on the gate** ⚑.
2. **Structural descriptor.** `nav · none · page · many · none · the site's own navigation as the page`
   — archetype `nav` is literal. It shares `many` with 8 and differs on archetype and on source:
   **Ghost's nav, not Ghost's posts** ⚑.
3. **Archetype.** nav. Departures: **three columns only above 1,200** ⚑, and **two hand-offs** ⚑.
4. **Responsive rule.** **1440** message 560, two columns at 1,000 total on a 48 gap, items 56, labels
   19. **834** two columns on a 32 gap, items 56, labels 18. **≤ 767** one column in source order,
   items 48, labels 17, field and button full width, top-aligned.
5. **Content fields.** The union less `image` and less `links[]` — **stored, not drawn** ⚑. Adds
   `directoryLabel`.
6. **Controls.** Columns (One · Two · Three) · Item size (Standard 17 · Large 19 · Display 24) · Which
   navigation (Primary · Primary and secondary) · Rules (Hairline per item · None) · **Nav children** (Flat · From Ghost prefixes) ⚑ · Code (Chip ·
   Plain · Hidden) · Search on the 404 (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** `{{navigation}}` — **label and URL only** ⚑. **0 items** → hand-off to 1 ⚑. **1–3** → one
   column whatever Columns says ⚑. **many** → columns fill down then across. **No query on the 500 or
   the gate** ⚑.
8. **Empty state.** **An empty navigation is a hand-off, not an empty state** ⚑. A very long label
   wraps to two lines inside its row and the row grows; **it is never clipped** ⚑ — a truncated
   section name is a wrong section name.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. The header's own
   `nav-drawer` at ≤ 767 is A1's, not this section's ⚑.
10. **Accessibility.** **The directory is a `nav` landmark with an accessible name** ⚑ — the second
    nav on the page after the header's, which is why the name matters. Items are `a` elements filling
    their row, 48 px minimum ⚑. **The arrow is `aria-hidden`** ⚑.

**Reconciled ⚑** Eight controls: Eyebrow and **Nav children (Flat · From Ghost prefixes)** join the six. **The nav-prefix collision is now stated** ⚑ — where a site encodes hierarchy with `+` / `-` / `|` label prefixes, **at Flat the markers render literally, here and in the 404's header**, and at From Ghost prefixes this design declares `nav-transform`: **ARCHITECT: registry addition**. The category's zero-JS claim gains that one stated exception, and **per owner ruling no no-JS accommodation is designed** — the flat raw-prefix list is the degradation. **The verify on whether Ghost exposes secondary navigation to an error template stays visible on the frame** ⚑.

**Flagged ⚑** Refusing to draw navigation on the gate is a design decision rather than a technical
limit, and is the category's most arguable line. The 1,000 px two-column block, the 56 → 48 item
ladder and the 1,200 px threshold are invented. Whether Ghost exposes a secondary navigation list to
an error template is flagged for the architect.

---

## 10 · Display

1. **Descriptor.** The status code at 156 px in the heading font in the left column of an inverted
   full-bleed band; message, search field, action and recovery list in the right. The category's one
   display moment.
2. **Structural descriptor.** `split · none · contrast · none · none · the code at display size` —
   **ground separates it from 2, archetype from 6** ⚑. The only design in A31 whose uniqueness needs
   two slots.
3. **Archetype.** split. Two columns above 833, stacked below with **the numeral first** ⚑. One
   departure: the block stays centred on the band at ≤ 767, as 6 does ⚑.
4. **Responsive rule.** **1440** band full bleed, padding 96 · 72, columns 38 · 62 on a 72 gap,
   numeral 156, heading 40, field 440. **834** padding 80 · 40, columns 34 · 66 on a 48 gap, numeral
   104, heading 34. **≤ 767** stacked, **numeral 68 first** ⚑, padding 56 · 20, heading 28, field and
   button full width.
5. **Content fields.** The union less `image`. **`code` is the field this design is built on** ⚑. Adds
   `gateDisplayWord` (default "Private") ⚑.
6. **Controls.** Display size (Large 120 · Standard 156 · Huge 200) · Split (Code 38 / 62 · Even) ·
   The gate's display slot (The word Private · The site title · Nothing) · Band height (Fill the
   viewport · Content height) · Search on the 404 (Show · Hide) · Recovery links (Show · Hide). Then
   the page source group.
7. **Data.** `statusCode` on the error pages ⚑ — **the numeral is Ghost's, not the author's**. Nothing
   is queried. On the gate the slot is the authored word.
8. **Empty state.** **No code cannot happen on an error page** ⚑. **On the gate an empty display word
   renders nothing and the right column takes the full width** ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** **The numeral is `aria-hidden` and the heading carries the meaning** ⚑ — "404"
    read aloud before the sentence is noise, and the document title already names the code. It is
    decorative type, not a heading, and not in the focus order. Derived values as 6; **the accent is
    disabled at 4.0:1** ⚑.

**Reconciled ⚑** Seven controls with Eyebrow added. **`gateDisplayWord` edits inline on canvas** ⚑ — it was a sidebar field for a word drawn at 156 px. **Background role is locked to Contrast** with the reason shown, as 6, and Top divider draws in the band's carried ink.

**Flagged ⚑** The word Private in the gate's display slot is invented and marked as such in the panel.
The 38 · 62 split, the 156 · 104 · 68 ladder and the 2.4 × relationship to the heading are A31's own.
Marking the numeral `aria-hidden` is a judgement: it is the only design where the page's largest
element is not read out.

---

## Component inventory — cumulative

**New in A31 (nine).** Utility page frame — a page whose block is optically centred between header and
footer at ≥ 768 and top-aligned at 64 below it (1). Status code chip — mono 11.5 tracked in a hairline
pill at the pack radius, from Ghost's own status and message (1). Display code — a tabular numeral at
156 in the heading font, `aria-hidden` (10). Password field, 46 px — A16's geometry with an 8-dot
value at .18em tracking (1). Server error plate — Ghost's message in the text colour on the plate
under a 1.5 px hairline, above the label, never red (1). Recovery link list — an authored list three
ways: wrapping row, arrowed list, ruled rows with the URL in mono (1, 4, 5). Directory list — Ghost's
navigation at page scale, 56 px rows, heading font at 19 (9). Hand-off annotation — a mono line naming
the design that renders instead, and why (7, 8, 9). Page boundary strip — the mono line naming the
template, what the page may query and what navigation it keeps (0).

**Carried forward (fifteen).** Search field 52 px (A4·15 · A23) · result row (A18·2 · A23) · primary
button (A1·1) · outline/ghost action (A1·1) · logo lockup (A1·1) · nav drawer (A1·2, the header's) ·
focus ring (A6 · A17·18) · surface plane (A19·3 · A29·4) · warm scrim (A20·13) · on-contrast
derivation (A17·7) · content box and padding ladder (A17) · clipped-string rule (A18·3) · hand-off
rule (A1·11, A1·15 · A29·5) · image placeholder plate (A1) · minimal line footer (A3·1).

## Findings for the architect

1. **The error-context variable names must be verified** ⚑ — A31 assumes `statusCode` and `message`
   are available to `error.hbs`. Whether the build ships one `error.hbs` with a match on the code or a
   separate `error-404.hbs` is the build's call; the designs are identical either way and **the copy
   set is what differs**.
2. **Whether an error template may run `{{#get}}` at all is the category's largest open question** ⚑.
   8 and 9 query on the 404 and refuse to on the 500. **If the answer is no, both hand off on all
   three pages** and A31 loses two of ten.
3. **The `/search/` route is A23's assumption, inherited** ⚑. With no search collection in
   `routes.yaml` the no-JS path returns **a 404 from a 404**. A31 asks that the field render only when
   the route exists — a build condition, not a control.
4. **What `private.hbs` receives needs confirming** ⚑ — the error string certainly, `@site.title` and
   `@site.description` almost certainly, and whether the `?r=` redirect parameter is required for the
   visitor to land where they were going.
5. **A themed submitting state on the gate would need a module the registry does not have** ⚑; the
   closest is `member-form`, which is the wrong endpoint. **No design requires it.**
6. **Ghost's maintenance and 503 pages are not themable** ⚑ — A31 does not cover them and no design
   should be asked to.
7. **Whether `@member` is available to `error.hbs`** decides one detail of the 404's header ⚑ — A1's
   signed-in pill. A small wrong rather than a broken page.
8. **A31 declares no behaviour module at all** ⚑ — `core` in all ten. It is the first category in the
   library with nothing to degrade.

---

## Reconciliation notes

**Frames changed in this pass — all ten, plus this file.** `A31-1 Centred` · `A31-2 Split Reason` ·
`A31-3 Card` · `A31-4 Boxed` · `A31-5 Panel` · `A31-6 Contrast Band` · `A31-7 Cover` ·
`A31-8 Elsewhere` · `A31-9 Directory` · `A31-10 Display`. Every one of the ten took the same four
panel additions — the Eyebrow row, the P0·6 editor-state group, the Content group and the universal
trio — plus the editing group and a recut caption, count and Quick set. **Only the gate renders
changed visibly**: the button now draws its default "Enter" instead of the literal "Continue", and the
form annotation names Ghost's `{{input_password}}` helper. **No layout was redesigned.**

**Where this pass and the drawn spec disagreed, both readings are recorded here.**

1. **The gate button's default: "Continue" drawn, "Enter" specified.** The frames drew "Continue" and
   the field did not exist; the patch names "Enter". **Resolved to "Enter"** and the frames redrawn,
   because the field is new and the patch is the later ruling. A publication that wants "Continue"
   types it, which is the whole point of the field existing.
2. **4 Boxed's "Padding inside" against the duplicate-row rule.** The rule removes a per-design
   Padding whose values are Vertical spacing's. **Kept, renamed Box padding** ⚑ — the box's internal
   padding and the page's vertical rhythm are two different measurements on one page, and the rule's
   own escape (genuinely different ladders keep a distinct name) covers it. **Recorded rather than
   silently kept.**
3. **Background role is locked in four designs, not one.** The rule locks a design whose ground is its
   identity. **5 Panel (Surface), 6 Contrast Band (Contrast), 7 Cover (Image) and 10 Display
   (Contrast)** are locked with the reason on the row; **3 Card is not** — its role moves the page
   ground the card sits on, which is the distinction 3 exists to make.
4. **Member Visibility lands nowhere in A31** ⚑ — a judgement, not an omission. Rule 9 asks for it on
   CTA-bearing designs; **none of the three pages is a page a publication shows one audience and hides
   from another**: a 404 is a wrong URL, a 500 is a failure, and the gate is the absence of a member
   state. The 404's signed-in pill is A1's header, not any A31 design's, and **P0·4's member-aware
   action editor never opens here**.
5. **`gateHelp` is a fourth gate field, beyond the three the patch names.** The same audit found the
   helper line under the button ("Ask whoever sent you the link…") shipping as a fixed English
   literal. **Added** under rule 5 rather than left out because the item did not list it.
6. **Two translation-catalog strings, not zero.** `search.label` and `search.submit` are the 404
   field's accessible name and submit word — system words for a control, so catalog strings rather
   than authored fields. **Ghost's wrong-password string stays neither**: it is Ghost's, and the
   category's "it is never a field" ruling is untouched.
7. **The category's zero-JS claim now has one stated exception.** 9 Directory at *Nav children: From
   Ghost prefixes* declares `nav-transform`, marked **ARCHITECT: registry addition** ⚑ on the frame
   and in §0. The claim is restated as **nine of ten declare `core` and nothing else**. Per owner
   ruling **no no-JS accommodation is designed** — the flat raw-prefix list is the degradation, and at
   *Flat* the `+` / `-` / `|` markers render literally here and in the 404's header.
8. **8 Elsewhere's disabled control became a data source.** "Most recent in the same tag" is gone;
   **Posts** reads Most recent · Featured · By tag · By author · Hand-picked, through P0·5's
   "Populate from…" panel. The finding it stated — **a 404 has no tag context** — is still true and is
   now written in the Data row rather than drawn as a disabled value ⚑.
9. **Control counts, recut.** 1–3, 5–8 and 10 carry **seven**; **4 Boxed six**; **9 Directory eight**.
   All are inside the PRD's ~15 ceiling, and the universal trio, the Content group, the P0·6 state
   group and the page source group are **counted nowhere**. **Quick Controls, named for the first
   time** ⚑, three per design: 1 Alignment · Measure · Code · 2 Split · Divider · Code · 3 Card width ·
   Depth · Code · 4 Box width · Recovery links · Code · 5 Recovery links · Depth · Block position ·
   6 Band height · Alignment · Button · 7 Scrim · Alignment · Image height · 8 How many posts · Row ·
   Posts · 9 Columns · Item size · Which navigation · 10 Display size · Split · The gate's display
   slot.
10. **Nothing was removed as a "Preview" control** ⚑ — no A31 panel had one. The three pages were
    always reached from the editor rather than a sidebar row; what changed is that **the switcher is
    now named as P0·6's and the copy is edited in place**.
11. **The open verifies stay open, and stay visible.** Whether Ghost exposes a **secondary
    navigation** list to an error template (9, on the frame); whether an error template may run
    `{{#get}}` at all (8 and 9); the error-context variable names; and what `private.hbs` receives.
    **None of them is settled by this pass**, and none of them is hidden in this file.
