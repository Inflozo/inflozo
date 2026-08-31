# A31 Error and Utility — written specification

10 designs · Paper pack · drawn 24 August 2026 · controls reconciled 25 August 2026 · **design patch pass 30 August 2026**

The frames are `A31-0 Category Proof.dc.html` and `A31-1` … `A31-10`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the three pages anatomised,
the tokenisation proof (1 Centred in three packs, light and dark), the stress frame and its six hard
cases, the roster, the component inventory and the findings for the architect. The shared field list
and the item rules are repeated below because the build reads them.

**The design patch pass, 30 August 2026.** Three rulings landed on this category and one of them reaches every
design in it. **This category's own drawn search form is struck** — the 404 renders the site header, so the search
a reader uses there is the Headers category's Search control, and there is no search page for a form of A31's own
to submit to; the field, every design's *Search on the 404* row, the `searchPlaceholder` field, the two
translation-catalog words and the read-only *What search reaches* row all go with it. **The private-site gate no
longer draws a form destination** — Ghost supplies it, and a drawn one breaks Ghost's own behaviour of returning
the visitor to the page they asked for. **No design ever turns into another design**: the category's three
hand-offs are retired, and 7 Cover, 8 Elsewhere and 9 Directory now **hide** what a page cannot give them and
still render as themselves, with the panel free to advise and never to switch. Two more library-wide rules bite —
**item counts are a number picker** (8 Elsewhere's *How many posts*) and **gap names are "Tight · Normal · Loose"**
(2 Split Reason's *Gap*). Every change is listed with the name of the rule that required it in **Patch notes** at
the end. **All ten designs are kept and nothing is renumbered.**

**[Free] designs:** 1 Centred · 4 Boxed

*(Shortlisted in this pass — 1 Centred, 4 Boxed, 2 Split Reason, 3 Card: the plainest designs, none of which needs
the customer to have good photography — recommended as 1 Centred · 4 Boxed and **confirmed by the owner on
30 August 2026**: the plain default, and the one design that shows a link's destination.)*

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

**Three designs have material one or two of the three pages cannot give them** — 8 Elsewhere, 9 Directory and
7 Cover. **Each hides what is missing and still renders as itself** ⚑, with the page’s own copy set, and says so on
the frame. **The hand-offs this category used to declare are retired in the patch pass**: no design ever turns into
another design.

A31 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 96 · 80 ·
64); **A1's logo lockup, primary button, ghost action and eyebrow**; **A16/A30's 46 px field geometry**; **A18·2's post row** and **A18·3's clipped-string rule**; **A19·3's surface plane**; **A20·13's warm scrim**; **A17·7's on-contrast derivation**;
**A6's focus ring**; **A3·1's minimal line footer**. **A29·5's hand-off rule is no longer inherited** ⚑ — it is retired here by the rule that no design ever turns into another. **A31 adds nine
components to the vocabulary** (proof frame) **and nothing else.**

### What Ghost permits an error template to do — read 30 August 2026

Ghost's own documentation for the error context settles four things this category had been guessing at, and one of
them is a constraint no design can control.

- **The templates are separate files.** `error-404.hbs` for a 404, `error-4xx.hbs` / `error-5xx.hbs` for the
  classes, `error.hbs` as the catch-all — and Ghost's built-in error page when the theme provides none. **A31 needs
  at least two: `error-404.hbs` and `error.hbs`** ⚑. The reconciliation pass left "one file with a match on the
  code, or two files" to the build; **Ghost has answered it: two.**
- **The variables are confirmed** ⚑: `{{statusCode}}`, `{{message}}`, and `{{errorDetails}}` with `{{rule}}`,
  `{{ref}}` and `{{message}}` inside it. The category's first finding is closed.
- **An error template should use no theme helpers beyond `{{asset}}`, and should not extend the default
  template** — because a helper inside an error page can itself fail and produce a misleading error. **The one
  exception Ghost names is `error-404.hbs`, which is permitted helpers** ⚑. That is why **the 404 may keep the
  whole site chrome** and 8 Elsewhere and 9 Directory may query on it — and why **the 500 may keep almost
  nothing**, which is what this category already drew.
- **`errorDetails` is developer output and A31 does not draw it** ⚑ — Ghost's own default page prints theme
  errors for the person building the theme; a reader on a live site would see an empty section, and a reader on a
  broken one would see a stack trace. **Refused category-wide**, with the reason stated.

**Ruled by the owner on 30 August 2026, and it settles the category's build shape.**

- **Two templates, following Ghost's own recommendation** ⚑: `error-404.hbs` for the 404, which Ghost permits helpers
  in, and `error.hbs` for every other code. **The 404 therefore keeps the whole site chrome** and §8·1's first
  settlement stands unchanged — header, nav, footer, and A1's member pill.
- **`error.hbs` uses no theme helper, no partial and no context.** Its stylesheet arrives through `{{asset}}`, and
  **`{{statusCode}}` and `{{message}}` are the only dynamic values on the page** ⚑.
- **Every word on the 500 is hard-coded into the template** ⚑ — heading, sentence, button label, mailto address, and
  **the wordmark too: it is typed text, not `@site.title`** ⚑. A publication still writes all of it in the editor;
  the build bakes it in as literal text rather than reading it back through settings. **A publication may also add
  its own extra lines, hard-coded the same way** ⚑.
- **Both pages keep their own copy set**, because they are two files ⚑ — the reason the one-set compromise this
  ruling first implied is not needed. **A code that is neither 404 nor 500 renders `error.hbs`** with the 500's set,
  and reads correctly because Ghost's own `{{statusCode}}` and `{{message}}` name the failure.
- **A31 queries Ghost for nothing, on any page** ⚑. The 404 *may* query — helpers are permitted there — and **the
  owner ruled that it does not**: 8 Elsewhere's rows and 9 Directory's items are **hand-written by the publication
  and hard-coded**, like the recovery list. See *Repeating items* below and each design's entry.
- **What this withdraws.** `nav-transform` and its **ARCHITECT: registry addition** are withdrawn ⚑ — with the
  navigation authored there are no Ghost label prefixes to transform. **A31 declares `core` in all ten designs
  again, and all ten are pixel-identical with JavaScript off.**

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
`gatePlaceholder` feeds. The form is still a native POST to Ghost's own `/private/` route — and **the theme draws no `action` attribute at all** ⚑, new in the patch pass: Ghost supplies the destination and the return path, and a drawn one breaks its own behaviour of returning the visitor to the page they asked for.

**2 · The gate's form states.** Four, one geometry: **empty** (the state almost every visitor sees),
**focused**, **filled**, **wrong password**. **Wrong password is a fresh server render, not an inline
check** ⚑: Ghost re-renders `private.hbs` with its own error string, **the field comes back empty**
(Ghost does not echo a password) and **focus returns to it**. The message sits **above the label**, so
it is met before the input in reading order and in focus order. **There is no themed submitting
state** ⚑ — the form is a native POST to Ghost's own `/private/` route, with no drawn destination, so the browser owns the wait and the button
keeps its resting look; a spinner would need a module the registry does not have (closest:
`member-form`, which posts to the members endpoint and is the wrong one), and **that is a finding, not
a new module**. **The message is Ghost's string and never a field** ⚑, drawn in the text colour on the
plate under a hairline — **never in red**: no pack has an error token.

**3 · Whether search appears on a 404. Settled again in the patch pass: A31 draws no search form of its own** ⚑.
The 404 renders the site header, and the search a reader uses there is **the Headers category's Search control**, on
the header the publication already chose — A31 drew a second field, in the page, and two search fields on one page
is one too many. **There is also nowhere for A31's field to post to** ⚑: the search page it assumed belonged to a
category that has since been deleted, so its form would submit to a route that may not exist — a 404 answered with
a 404, the worst outcome this category can produce. **Nothing is drawn in its place**: the block closes up, and the
recovery list is what a lost reader now has. Never on a 500 and never on the gate, as before ⚑ — neither has any
chrome to carry it.

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
  **cards, boxes, planes and bands do not collapse at all** (3, 4, 5, 6, 7). **At ≤ 767 the primary button goes full width in every design, and so does the gate's field** ⚑ and the secondary line moves beneath.
  Every element that leaves a width has a stated destination.
- **Dark.** A27's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm shadows dropped
  and the hairline carrying every plane; **card and plane depth forced to Flat** ⚑. **The contrast
  band inverts with the mode** ⚑ and becomes the light band on a dark page (6, 10). **The scrim is the
  dark ink at the same percentage** (7) ⚑ — the photograph itself is never filtered, dimmed or tinted.
- **Print.** **These pages print as they render** ⚑. The gate's form does not print ⚑.
- **Behaviour.** **All ten declare `core` and nothing else** ⚑ — and the no-JS statement is one line: **every design is pixel-identical with JavaScript off**. **`nav-transform` and its registry addition are withdrawn** ⚑ 30 August 2026: with 9 Directory's items authored there are no Ghost label prefixes to transform. The header's `nav-drawer` at ≤ 767 on the 404 is **A1's**, not any A31 design's ⚑.
- **Refused category-wide, each with a reason:** **a drawn illustration** ⚑ (not re-skinnable by
  tokens, and the user cannot author one — 7 Cover's photograph is the tokenisable answer) · **a soft
  404 that renders the archive below the message** ⚑ (a page that looks like it worked, and it cannot
  exist on a 500) · **an automatic redirect after a few seconds** ⚑ (no module, and it takes the
  decision from the reader) · **"did you mean …?" from the URL** ⚑ (Ghost offers no fuzzy match) ·
  **a search form of the category's own** ⚑ (struck in the patch pass — the 404's header carries the site's search) · **a member
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
`links[].label`, `linksLabel`, `postsLabel`, `directoryLabel`,
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
a default, and after the patch pass **there are no exceptions** ⚑: the two translation-catalog strings A31 carried —
`search.label` and `search.submit`, the struck field's accessible name and submit word — went with the field.
**Ghost's wrong-password string is not a field either** — it is Ghost's, and no control changes it.

**There is no Preview control in any A31 panel** ⚑ and there never was one to remove: previewing is
the editor's job, and the three pages are P0·6's switcher.

### The controls every design shares — the Page source group

**Four rows** ⚑, identical in all ten, **below** each design's own controls and **not counted toward the brief's
4–7** ⚑, all four read-only. *What search reaches* was the fifth and is struck with the search field.

| Field | Type | Value |
|---|---|---|
| Which page this is | read-only | From the status code — **`error-404.hbs` at a 404, `error.hbs` (or `error-5xx.hbs`) at a 500** ⚑, `private.hbs` at `/private/`. Two files, not one: Ghost permits helpers in the 404 template only |
| What a 500 may ask Ghost for | read-only | Nothing — no `{{#get}}`, no navigation, no member state, no settings image ⚑ |
| Navigation on this page | read-only | Full on the 404 · title and one link on the 500 · none on the gate ⚑ |
| Where the gate posts | read-only | Ghost's `/private/`, **with no `action` attribute drawn** ⚑ — Ghost supplies the destination and the return path; the wrong-password message is Ghost's string |
### The roster

| # | Design | Tuple | Ctl | Modules | What the page hides |
|---|---|---|---|---|---|
| 1 | Centred | `stack · none · page · none · none · the centred column` | 6 | `core` | — |
| 2 | Split Reason | `split · none · page · none · none · the reason beside the action` | 6 | `core` | — |
| 3 | Card | `stack · card · page · none · none · a raised card on the page ground` | 6 | `core` | — |
| 4 | Boxed | `stack · box · page · none · none · one hairline box in the measure` | 5 | `core` | — |
| 5 | Panel | `stack · none · surface · none · none · one raised plane across the box` | 6 | `core` | — |
| 6 | Contrast Band | `stack · none · contrast · none · none · an inverted full-bleed band` | 6 | `core` | — |
| 7 | Cover | `stack · none · image · none · background · the block over a photograph` | 6 | `core` | 500 · no image → the picture |
| 8 | Elsewhere | `feed · none · page · many · none · recent posts under the message` | 4 | `core` | 500 · gate → the post list |
| 9 | Directory | `nav · none · page · many · none · the site’s own navigation as the page` | 5 | `core` | 500 · gate · no nav → the directory |
| 10 | Display | `split · none · contrast · none · none · the code at display size` | 6 | `core` | — |

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
| `image` · `imageAlt` · `imageFocus` | image · text · enum | **req in 7** | ≥ 2,400 px · 120 ch · 9 positions | 7 | **No image → the picture and the scrim hide and the block draws on the page ground** ⚑. Focus is a field, not a control ⚑ — **and it sits in the Image Picker's popover rather than a hidden field** (Centre · Top · Bottom). Not drawn on the 500 at all |
| `postsLabel` | text | opt | 24 ch | 8 | Default "Recently on Orbit Weekly"; stored by the other nine ⚑ |
| `directoryLabel` | text | opt | 24 ch | 9 | Default "Everything the site does have"; the nav landmark's accessible name ⚑ |
| `gateDisplayWord` | text | opt | 16 ch | 10 | Default "Private" ⚑ — **invented**: there is no status code at `/private/` |
| `gateFieldLabel` | text | opt | 24 ch | all 10, gate only | Default "Password" ⚑ — **new in this pass**: drawn on every gate frame and absent from the field list |
| `gateCtaLabel` | text | opt | 24 ch | all 10, gate only | Default "Enter" ⚑ — **new in this pass**; the frames drew "Continue" and now draw the default |
| `gatePlaceholder` | text | opt | 40 ch | all 10, gate only | **Empty by default** ⚑ — passed to `{{input_password}}` as its placeholder param, so empty ships no placeholder attribute |
| `gateHelp` | text | opt | 120 ch | all 10, gate only | Default as drawn ⚑ — **new in this pass**: "Ask whoever sent you the link…" was a fixed English literal under the button |
| *statusCode · message* | Ghost | req | — | all 10 | The chip's text; **a code that is neither 404 nor 500 falls back to the 500's copy set** ⚑. **Variable names to be verified** ⚑ |
| *errorDetails* | Ghost | opt | — | none ⚑ | `rule` · `ref` · `message`. **Developer output; A31 draws it on no page** ⚑ — a live reader would see an empty section, a reader on a broken theme a stack trace |
| *@site.title · @site.description* | Ghost | req | — | the 404 and the gate | The 404's header lockup and the gate's optional line. **Not used on the 500** ⚑ — its wordmark is typed text hard-coded in the template, because `error.hbs` has no context |
| *navigation* | Ghost | opt | — | the header on the 404 only | **A1's, not A31's** ⚑ — the 404's header draws it because `error-404.hbs` permits helpers. **No A31 design queries it** ⚑ |
| `posts[]` | list 1–8 | opt | title 80 ch · url · note 120 ch · meta 24 ch · image | 8 | **Authored and hard-coded** ⚑ 30 Aug 2026 — was `{{#get "posts"}}`. Add, Remove and reorder on P0·3 |
| `directory[]` | list 1–24 | opt | label 40 ch · url | 9 | **Authored and hard-coded** ⚑ 30 Aug 2026 — was `{{navigation}}`. Add, Remove and reorder on P0·3 |
| *{{error}}* | Ghost | opt | — | all 10, gate only | **The wrong-password string, and it is Ghost's** ⚑ — not a field, and no control changes its words |

Four fields are drawn by exactly one design each — the image group (7), `postsLabel` (8),
`directoryLabel` (9), `gateDisplayWord` (10) — **and all four are stored by the other nine** ⚑.

### Repeating items — three authored lists

**Three authored repeaters after the 30 August ruling** ⚑, all three on P0·3 and all three hard-coded into the
template by the build: `links[]`, the recovery list, drawn by eight of the ten · `posts[]`, 8 Elsewhere's rows ·
`directory[]`, 9 Directory's items. **Nothing in A31 is a Ghost object any more** ⚑ — where the frames said "these
are Ghost's and carry no Add", **every list now carries Add, Remove and drag reorder**, and Remove is never
disabled at any count. **The cost is stated on both designs**: a hand-written list goes stale on its own, and a
renamed or deleted page leaves a dead link until somebody edits it. **The panel says so on the list** ⚑.

- `posts[]` — **1–8 rows, designed for 5** ⚑. Per row: title, address, an optional one-line note where the excerpt
  drew, an optional meta word where the date drew, and an optional image for Thumbnails. **All content, no per-item
  controls** ⚑.
- `directory[]` — **1–24 items** ⚑, label and address only, drawn in 9's columns. Above 24 Add is disabled with the
  reason shown: a directory longer than that is a sitemap.

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

1. **Descriptor.** One column optically centred in the viewport — code chip, heading, sentence, primary action beside a text link, and the authored recovery list under a hairline. No box,
   plane or band. The category default.
2. **Structural descriptor.** `stack · none · page · none · none · the centred column` — containment
   `none` and ground `page` are what 3, 4, 5 and 6 each change exactly one of. **The recovery links
   are not items**: one authored list drawn as a row, so item-count stays `none` ⚑.
3. **Archetype.** stack. Two departures: **at ≤ 767 the block top-aligns instead of centring** ⚑, and
   the action row stacks.
4. **Responsive rule.** **1440** measure 620 in the 1,296 box on a 72 margin, heading 40,
   action row horizontal, block centred in the viewport. **834** measure 560, heading 34.
   **≤ 767** measure 350, heading 28, **top-aligned at 64** ⚑, the button full width, link
   beneath, links a wrapping row.
5. **Content fields.** `code` · `eyebrow` · `heading` · `blurb` · `primaryLabel` · `secondaryLabel` ·
   `links[]` · `linksLabel` — **and the first six again for each of the three pages** ⚑. `image` stored, not drawn.
6. **Controls.** Alignment (Centred · Flush left) · Measure (Narrow 520 · Standard 620 · Wide 720) ·
   Code (Chip · Plain · Eyebrow · Hidden) · Recovery links (Show ·
   Hide) · Height (Fill the viewport · Content height). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** The 404 may query freely; **the 500 queries nothing** ⚑; the gate queries title and
   description only ⚑. **0 links** → list and hairline leave. **1** → the row holds. **many** → it
   wraps at the measure and never scrolls.
8. **Empty state.** No blurb → the stack closes up. No links → hairline and label go together ⚑. No
   code → the heading rises. **The heading has a default in all three sets** ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑ — the copy is
   server-rendered and the gate is a native POST. **Edit-safe:** nothing to suppress.
10. **Accessibility.** **The heading is the page's `h1`** ⚑. Focus order: skip link, header, primary, secondary, recovery links. The chip is decorative text, not a target. Muted 5.4:1, accent
    button 4.7:1 ⚑. **The document title names the code** — "Not found · Orbit Weekly" ⚑.

**Reconciled ⚑** Seven controls — **Eyebrow (Show · Hide)** joins the six, because the eyebrow's per-page default meant clearing it could not hide it. The universal trio sits outside the list with **Background role free**; this design never had a Padding row to fold in. **The three copy sets are edited in place through P0·6** rather than as blind sidebar fields, and **the gate's four strings — label, button, placeholder, helper line — are fields for the first time**, over Ghost's `{{input_password}}` helper.

**Patched ⚑ 30 August 2026** Six controls: the *Search on the 404* row is struck with the drawn field, and the block between the sentence and the action row closes up. The gate's form draws no destination. **Recommended as one of the two free designs** (question 1).

**Flagged ⚑** The three copy sets are invented — Ghost supplies a status code and a message string,
not words a publication would want. Centring on the viewport rather than the document is this design's
decision. 620 and the 520 field width are A31's own numbers.

---

## 2 · Split Reason

1. **Descriptor.** Code, heading and sentence in the left column of the content box; primary action and recovery list in the right. Top-aligned, on an 80 px gap, with an optional
   hairline between.
2. **Structural descriptor.** `split · none · page · none · none · the reason beside the action` —
   archetype is what separates it from 1, otherwise the same five slots ⚑.
3. **Archetype.** split. Two columns above 833, stacked below, left column first. No departures.
4. **Responsive rule.** **1440** 560 · 656 on an 80 gap, heading 40, top-aligned. **834**
   340 · 356 on a 56 gap, heading 34. **≤ 833** one column, **left column first** ⚑, 32 between them,
   heading 28, the button full width, **the divider dropped** ⚑.
5. **Content fields.** As the union, less `image`. **The widest user of the list** ⚑.
6. **Controls.** Split (Even · Text-heavy · Action-heavy) · Gap (Tight 48 · Normal 80 · Loose 112) ·
   Divider (None · Hairline between) · Code (Chip · Plain · Hidden)
   · Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **At 0 links the right column is field and button and does not stretch** ⚑; at many
   it grows with the page and never scrolls internally.
8. **Empty state.** No sentence → the left column is chip and heading and **the columns stay
   top-aligned** ⚑. No links → hairline and label leave. An empty right column cannot happen.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Heading is the `h1`; **the two columns are one `main` in source order** ⚑, so
    stacked order and focus order are the same list. The divider is CSS on the wrapper.

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. As **the widest user of `links[]`**, this design is the clearest case of P0·3's item controls: drag reorder, Add arriving with content, Remove never disabled. The trio sits outside the list with Background role free — at Contrast **both columns re-derive together**, which is what keeps this design 2 and not 10.

**Patched ⚑ 30 August 2026** Six controls, and **Gap now reads Tight · Normal · Loose** with its values untouched — 48 · 80 · 112. The right column is the action and the recovery list; the field that used to head it is struck.

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
4. **Responsive rule.** **1440** card 720, padding 40, measure 640. **834** card 640,
   padding 40. **≤ 767** card 350 on the 20 margin, padding 24, heading 28, field and button full
   width, top-aligned. **The radius is the pack's at every width** ⚑.
5. **Content fields.** As the union, less `image` (stored).
6. **Controls.** Card width (Narrow 560 · Standard 720 · Wide 880) · Depth (Raised · Flat) · Alignment
   (Centred · Flush left) · Code (Chip · Plain · Hidden) · Recovery
   links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. The card renders at every data state, **including the 500 where nothing is
   queried** ⚑.
8. **Empty state.** Missing fields close the stack; **the card does not shrink below 320 of content
   height** ⚑, so a heading and a button alone is still a card and not a strip.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** The card is a `div`, **not a `section` with a label — it has no accessible name
    to give** ⚑. **The focus ring's offset is filled with the surface token** ⚑. Surface-on-page is a
    1.3:1 step, **which is why the hairline is not optional** ⚑.

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. **Background role moves the page ground the card sits on and never the card's own surface** ⚑ — the distinction 3 exists to make; at Surface the hairline carries the whole edge, because surface-on-surface is no step at all. Depth stays this design's own row.

**Patched ⚑ 30 August 2026** Six controls. The card no longer has a field to size inside it, so at Narrow it simply narrows; nothing else in the design moved.

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
4. **Responsive rule.** **1440** box 720, padding 36, rows 48, URL shown. **834** box 640,
   padding 36. **≤ 767** box 350, padding 22, **rows 44 and the URL dropped** ⚑, field and button full
   width, top-aligned.
5. **Content fields.** As the union, less `image`. **The only design that draws `links[].url` as
   text** ⚑.
6. **Controls.** Box width (Narrow 560 · Standard 720 · Wide 880) · **Box padding** (Compact 24 ·
   Comfortable 36 · Spacious 52) ⚑ · Recovery links (Ruled rows · Plain list · Hide) · Code (Plain ·
   Chip · Hidden). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group. **Five now — Eyebrow joined the five and the search row is struck** ⚑.
7. **Data.** As 1. **At 0 links the box loses its rows and internal hairlines** ⚑; at 6 it grows and
   **never scrolls internally** ⚑.
8. **Empty state.** A row with an empty `url` draws the label and reserves nothing ⚑. No links → no
   rows. The box itself has no empty state.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Rows are `a` elements filling the row, **44 px minimum at every width** ⚑; the
    mono URL is inside the same link. **The URL is not `aria-hidden`** ⚑ — a reader who cannot see it
    is the reader most likely to want it.

**Reconciled ⚑** Five controls now: Eyebrow joined the five, the search row is struck in the patch pass, and **"Padding inside" is renamed Box padding** ⚑. It is a box-internal ladder rather than the section's vertical rhythm, so it survives the duplicate-row rule under a distinct name while **Vertical spacing** in the trio owns the page's own 96 · 80 · 64. The ruled rows are still the only place `links[].url` draws as text, and P0·3 governs the list.

**Patched ⚑ 30 August 2026** Five controls — the fewest in the category. **Box padding keeps its name** for the reason recorded in the reconciliation notes, and the ruled rows are untouched. **Recommended as the second of the two free designs** (question 1): its rows show a destination and it needs no photography.

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
   Plain · Hidden). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **At 0 links the column and its hairline leave and the left side keeps its
   measure** ⚑; at 6 the column grows and the plane grows with it.
8. **Empty state.** No sentence → the stack closes. No links → no column. On the 500 there is no
   column by rule ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** Heading is the `h1`. **The link column is a `nav` with an accessible name from
    `linksLabel`** ⚑ — the only nav landmark A31 draws, and **absent on the 500 and the gate**.
    Surface-on-page 1.3:1, so the hairline is not optional ⚑.

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. **Background role is locked to Surface with the reason shown** ⚑ — the raised plane is this design's ground and its identity, and a role that moved it would leave 1 Centred with a shadow. Vertical spacing owns the page rhythm; Panel height stays this design's own row, and `linksLabel` still names the nav landmark.

**Patched ⚑ 30 August 2026** Six controls. The left side is message and action; the link column, its hairline and the nav landmark are untouched.

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
4. **Responsive rule.** **1440** full bleed, padding 96 · 72, measure 620. **834** padding
   80 · 40, measure 560. **≤ 767** padding 56 · 20, measure 350, **block still centred** ⚑,
   the button full width. **The band never collapses, narrows or gains a margin** ⚑.
5. **Content fields.** As the union, less `image` — **an image behind a band is 7 Cover** ⚑.
6. **Controls.** Band height (Fill the viewport · Content height) · Alignment (Centred · Flush left) ·
   Button (Carried colour · Outline · ~~Accent~~ disabled, 4.0:1) · Code (Chip · Plain · Hidden) ·
   Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** As 1. **This design's 500 loses nothing but the list** ⚑ — no image, no plane, no query,
   which makes it the safest of the ten on a 500.
8. **Empty state.** As 1.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **Edit-safe.**
10. **Accessibility.** **Every derived value re-checked on the band** ⚑: carried ink 13.6:1, muted at
    72 % 6.9:1, the 20 % hairline 1.7:1, the button's inverted pair 13.6:1. **The accent is not used
    because it does not pass** ⚑. The focus ring is carried ink, not accent.

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. **Background role is locked to Contrast** ⚑ with the reason on the row — the inverted band is the design, and it inverts with the mode rather than with a role. **Top divider draws in the band's carried ink at 20 %** rather than the pack's hairline, and Vertical spacing is the band's internal padding ladder.

**Patched ⚑ 30 August 2026** Six controls. The band, its derived values and the disabled accent are untouched.

**Flagged ⚑** The band inverting with the mode is A32's rule, carried. The 4.0:1 and 2.1:1 accent
measurements are this pack's. Keeping the block centred at 390 is this design's departure from the
category floor.

---

## 7 · Cover

1. **Descriptor.** A photograph filling the page under a flat 45 % warm scrim, the block centred on it
   in derived carried values. **At a 500 the photograph and the scrim hide and the block draws on the page ground** ⚑.
2. **Structural descriptor.** `stack · none · image · none · background · the block over a photograph`
   — the only `image` ground and the only `background` media placement in A31 ⚑.
3. **Archetype.** stack. Departures: **the crop changes ratio at 767** ⚑, and **on a 500 the photograph hides while the design still renders** ⚑.
4. **Responsive rule.** **1440** full-bleed 16:9 at viewport height, padding 72, measure 620, scrim
   45 %. **834** 16:9, padding 48, measure 560. **≤ 767** **4:5 crop** ⚑, padding 24, measure 350,
   block centred, the button full width. **The scrim never changes with width** ⚑.
5. **Content fields.** The union plus `image` · `imageAlt` · `imageFocus` — **required here, drawn
   nowhere else** ⚑. **No image → the photograph and the scrim hide** ⚑.
6. **Controls.** Scrim (Light 30 · Standard 45 · Heavy 60) · Alignment (Centred · Flush left · Bottom
   left) · Image height (Fill the viewport · Fixed 640) · Code (Chip · Plain · Hidden) · Recovery links (Show · Hide). Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** **404**: an uploaded file on the section, drawn directly. **500**: the photograph hides ⚑ — no file, no query, no settings value, and the block draws on the page ground. **Gate**: the image draws; it leaks nothing about the site's
   contents ⚑.
8. **Empty state.** **No image is the one empty state that changes what the page looks like** ⚑ — the photograph and the scrim hide and the block draws on the page ground, rather than an empty grey plate. **The design does not become 6 Contrast Band**; the panel may advise it ⚑. **No alt text is an editor warning, not a blocked save** ⚑.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. The image is a plain
   `img` with `loading="eager"` ⚑ — an error page's picture is above the fold by definition.
10. **Accessibility.** Derived values re-checked on the scrim: carried ink 8.9:1 at the crop's
    lightest area ⚑, muted at 80 % 6.4:1. **The focus ring's offset carries a 40 % ink scrim** because
    there is no ground behind it ⚑ — A31's one departure from A6. `imageAlt` is required when the
    picture carries meaning; **empty `alt` is correct when it is decoration** ⚑.

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. **Background role is locked to Image** ⚑ — the photograph is the ground, and with no image the photograph and the scrim simply hide rather than the design falling back to a role or becoming another design ⚑. **Image focus now sits in the Image Picker's popover** ⚑: the "focus is a field, not a control" ruling stands, the unreachable part of it does not. Top divider defaults to None over a picture.

**Patched ⚑ 30 August 2026** Six controls, and **the two hand-offs are retired**: at a 500, and with no image at all, the photograph and the scrim hide and the design draws its own block on the page ground. The panel may advise 6 Contrast Band and never switches to it. **Open question 2**: whether that page should instead sit on a flat plate in the scrim's own ink.

**Flagged ⚑** The 4:5 mobile crop, the 45 % default and hiding the photograph rather than naming another design are invented here. The
ring's 40 % ink offset is A31's one departure from A6. Whether a 500 may safely reference an uploaded file is the finding behind hiding the photograph.

---

## 8 · Elsewhere

1. **Descriptor.** The message at 620, a hairline, then five destinations as A18’s ruled rows at 820 — **authored by the publication and hard-coded** ⚑ 30 Aug 2026, where they were Ghost’s recent posts. **On a 500 and on the gate the list, its label and its hairline hide and the message stands alone** ⚑.
2. **Structural descriptor.** `feed · none · page · many · none · recent posts under the message` —
   archetype and item-count together are the claim ⚑; containment `none` even at Thumbnails =
   Standard.
3. **Archetype.** feed. Departures: **three rows and no excerpt below 767** ⚑, and **no list at all on a 500 or the gate — it hides, and the design still renders as itself** ⚑.
4. **Responsive rule.** **1440** message 620, rows 820, five rows, one excerpt line, density 22, title
   21. **834** message 560, rows 674, five rows. **≤ 767** message 350, rows 350, **three rows, no
   excerpt** ⚑, title 18, density 18, the button full width. **Top-aligned at every width** ⚑.
5. **Content fields.** The union less `image` and less `links[]` — **stored, not drawn** ⚑: the rows are the recovery. Adds `postsLabel` and **`posts[]`, the authored row list** ⚑.
6. **Controls.** Row (Title only · Title and meta · Title, meta and note) · Thumbnails (None · Small 96 · Standard 128) · Code (Chip · Plain · Hidden). **Four with Eyebrow** ⚑ — *How many posts* and *Posts* are struck on 30 August 2026: with the rows authored, the count is the number of rows and there is no source to choose. Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** **None — nothing is queried on any of the three pages** ⚑ 30 Aug 2026. `posts[]` is authored and hard-coded, so **P0·5's "Populate from…" panel never opens here** and **the list carries Add, Remove and drag reorder** like the recovery list. **0 rows** → label and hairline leave with the list ⚑. **1** → one row, no stretch. **8** → the cap, with the reason on Add. **The cost is on the panel** ⚑: a hand-written list goes stale on its own. **The list is absent on the 500 and the gate** ⚑ — on the 500 because `error.hbs` carries only the message, and on the gate because titles are what a private site withholds.
8. **Empty state.** **The list is absent, never empty** ⚑. No excerpt → the row closes up. No image on a row at Thumbnails = Standard → **the row draws without one and reserves nothing** ⚑ (A18’s rule).
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. **It does not declare
   `load-more`** ⚑ — an error page with pagination is an archive page wearing an apology.
10. **Accessibility.** Heading is the `h1`; **the list is a `ul` of links named by `postsLabel`** ⚑. Each row is one link containing title, note and meta — A18’s decision, carried. Meta 5.4:1.

**Reconciled ⚑** Four controls after the 30 August ruling — Eyebrow added, the search row struck, and **How many posts and Posts struck with the query** ⚑. **Posts** now reads Most recent · Featured · By tag · By author · Hand-picked on the library's standard sources, with the tag and author pickers beside it and Count still *How many posts*, now a number picker ⚑. `links[]` stays stored and undrawn, so P0·3's controls never open here; the post rows are Ghost's and carry no Add.

**Patched ⚑ 30 August 2026** Six controls, **How many posts is now a number picker — 1–8, default 5** ⚑, and **the two hand-offs are retired**: on a 500 and on the gate the list, its label and its hairline hide and the message stands alone at this design's own 620.

**Flagged ⚑** That a hand-written list is worth its staleness is the owner's ruling, not this design's judgement. Two measures (620 and 820), dropping to three rows below 767 and defaulting thumbnails
off are invented. The disabled "same tag" value is this design's finding stated as a control. Whether
a 404 may safely query at all is flagged for the architect.

---

## 9 · Directory

1. **Descriptor.** The message at 560, then the site’s sections at page scale in two ruled columns at 19 px — **authored by the publication and hard-coded** ⚑ 30 Aug 2026, where they were Ghost’s own navigation. A 404 answered with a map. **On the 500 and on the gate the directory hides and the message stands** ⚑.
2. **Structural descriptor.** `nav · none · page · many · none · the site’s own navigation as the page` — archetype `nav` is literal. It shares `many` with 8 and differs on archetype and on source: **a written map of the site, not a list of destinations to read** ⚑. Both lists are authored after the 30 August ruling, and **what still separates them is what the list is for** ⚑.
3. **Archetype.** nav. Departures: **three columns only above 1,200** ⚑, and **two pages with no directory to draw** ⚑.
4. **Responsive rule.** **1440** message 560, two columns at 1,000 total on a 48 gap, items 56, labels
   19. **834** two columns on a 32 gap, items 56, labels 18. **≤ 767** one column in source order,
   items 48, labels 17, the button full width, top-aligned.
5. **Content fields.** The union less `image` and less `links[]` — **stored, not drawn** ⚑. Adds `directoryLabel` and **`directory[]`, the authored item list** ⚑.
6. **Controls.** Columns (One · Two · Three) · Item size (Standard 17 · Large 19 · Display 24) · Rules (Hairline per item · None) · Code (Chip · Plain · Hidden). **Five with Eyebrow** ⚑ — *Which navigation* and *Nav children* are struck on 30 August 2026 with the query: there is no Ghost navigation to pick a set from and no label prefix to transform. Then **Eyebrow (Show · Hide)** ⚑, the universal trio, the Content group and the page source group.
7. **Data.** **None — nothing is queried** ⚑ 30 Aug 2026. `directory[]` is authored and hard-coded, label and address only, **with Add, Remove and drag reorder** on P0·3. **0 items** → the directory, its label and its rules hide ⚑ and the design draws message and action alone; the panel may advise that 1 Centred suits a site with no map to draw. **1–3** → one column whatever Columns says ⚑. **many** → columns fill down then across, capped at 24. **The list is absent on the 500 and the gate** ⚑ — the 500 carries only the message, and a map describes a site the gate's visitor has not been admitted to. **The cost is on the panel**: a hand-written map goes stale on its own ⚑.
8. **Empty state.** **An empty list hides the directory rather than turning this design into another** ⚑. A very long label wraps to two lines inside its row and the row grows; **it is never clipped** ⚑ — a truncated section name is a wrong section name.
9. **Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑ — **`nav-transform` is withdrawn** ⚑ 30 Aug 2026 with the navigation query that needed it. The header’s own `nav-drawer` at ≤ 767 is A1’s, not this section’s ⚑.
10. **Accessibility.** **The directory is a `nav` landmark with an accessible name** ⚑ — the second nav on the 404 after the header’s, which is why the name matters. Items are `a` elements filling
    their row, 48 px minimum ⚑. **The arrow is `aria-hidden`** ⚑.

**Reconciled ⚑** Five controls after the 30 August ruling — Eyebrow added, the search row struck, and **Which navigation and Nav children struck with the query** ⚑. **What the two struck rows used to say, kept because it is why they existed:** where a site encodes hierarchy with
`+` / `-` / `|` label prefixes, *Nav children: Flat* rendered the markers literally and *From Ghost prefixes* declared
`nav-transform` as an **ARCHITECT: registry addition**. **With the items authored there are no Ghost labels to read, so
both rows and the registry request are withdrawn** ⚑ 30 August 2026 — and **the open verify about whether Ghost exposes
a secondary navigation list to an error template is closed with them**.

**Patched ⚑ 30 August 2026** Five controls, and **the three hand-offs are retired**: on a 500, on the gate and on a
site with no items the directory's columns hide and the message stands at this design's own 560. **Which navigation
and Nav children are struck with the query**, and **`nav-transform` and the category's one registry request are
withdrawn with them** ⚑ — this design declares `core` like the other nine.

**Flagged ⚑** That a hand-written map is worth its staleness is the owner's ruling, not this design's judgement. Refusing to draw the map on the gate is a design decision rather than a technical limit, and is the category’s most arguable line. The 1,000 px two-column block, the 56 → 48 item
ladder and the 1,200 px threshold are invented. Whether Ghost exposes a secondary navigation list to
an error template is flagged for the architect.

---

## 10 · Display

1. **Descriptor.** The status code at 156 px in the heading font in the left column of an inverted
   full-bleed band; message, action and recovery list in the right. The category's one
   display moment.
2. **Structural descriptor.** `split · none · contrast · none · none · the code at display size` —
   **ground separates it from 2, archetype from 6** ⚑. The only design in A31 whose uniqueness needs
   two slots.
3. **Archetype.** split. Two columns above 833, stacked below with **the numeral first** ⚑. One
   departure: the block stays centred on the band at ≤ 767, as 6 does ⚑.
4. **Responsive rule.** **1440** band full bleed, padding 96 · 72, columns 38 · 62 on a 72 gap,
   numeral 156, heading 40. **834** padding 80 · 40, columns 34 · 66 on a 48 gap, numeral
   104, heading 34. **≤ 767** stacked, **numeral 68 first** ⚑, padding 56 · 20, heading 28, field and
   button full width.
5. **Content fields.** The union less `image`. **`code` is the field this design is built on** ⚑. Adds
   `gateDisplayWord` (default "Private") ⚑.
6. **Controls.** Display size (Large 120 · Standard 156 · Huge 200) · Split (Code 38 / 62 · Even) ·
   The gate's display slot (The word Private · The site title · Nothing) · Band height (Fill the
   viewport · Content height) · Recovery links (Show · Hide). Then
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

**Reconciled ⚑** Six controls now, with Eyebrow added and the search row struck. **`gateDisplayWord` edits inline on canvas** ⚑ — it was a sidebar field for a word drawn at 156 px. **Background role is locked to Contrast** with the reason shown, as 6, and Top divider draws in the band's carried ink.

**Patched ⚑ 30 August 2026** Six controls. The right column is message, action and recovery list; the numeral, the band and the gate's display slot are untouched.

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
navigation at page scale, 56 px rows, heading font at 19 (9). Hidden-material annotation ⚑ — a mono line naming what a page has no material for and why; **the design still renders as itself** (7, 8, 9). Renamed in the patch pass, when the hand-offs were retired. Page boundary strip — the mono line naming the
template, what the page may query and what navigation it keeps (0).

**Carried forward (thirteen)** ⚑ — the 52 px search field and the hand-off rule are struck in the patch pass. Post row (A18·2) · primary button (A1·1) · outline/ghost action (A1·1) · logo lockup (A1·1) · nav drawer (A1·2, the header's) ·
focus ring (A6 · A17·18) · surface plane (A19·3 · A29·4) · warm scrim (A20·13) · on-contrast
derivation (A17·7) · content box and padding ladder (A17) · clipped-string rule (A18·3) · image placeholder plate (A1) · minimal line footer (A3·1).

## Findings for the architect

1. ~~The error-context variable names must be verified.~~ **Closed, 30 August 2026** ⚑ — Ghost's error context gives `statusCode`, `message` and `errorDetails`, and **the file question is answered too: two templates, `error-404.hbs` and `error.hbs`**, because Ghost permits theme helpers in the 404 template only. The designs are identical either way and **the copy set is what differs**.
2. ~~Whether an error template may run `{{#get}}` at all.~~ **Closed twice over, 30 August 2026** ⚑ — Ghost permits helpers, and therefore a query, **in `error-404.hbs` only**; and **the owner then ruled that A31 queries nothing at all**, on any page. 8 Elsewhere's rows and 9 Directory's items are authored and hard-coded. **No finding in this category depends on a query any more.**
3. **The search finding is closed rather than open** ⚑. A31 draws no search form, so there is no route for the build to make conditional. The search a reader uses on a 404 is the header’s own control, and whatever it needs is the Headers category’s question.
4. **What `private.hbs` receives needs confirming** ⚑ — the error string certainly, `@site.title` and
   `@site.description` almost certainly, and how it carries the visitor back to the page they asked for — **the theme no longer draws that part of the form** ⚑, so the answer changes nothing in these designs.
5. **`nav-transform` is withdrawn** ⚑ 30 August 2026 — the registry addition A31 asked for existed only to transform Ghost's navigation labels, and 9 Directory no longer reads them. **A31 asks the registry for nothing.**
6. **A themed submitting state on the gate would need a module the registry does not have** ⚑; the
   closest is `member-form`, which is the wrong endpoint. **No design requires it.**
7. **Ghost's maintenance and 503 pages are not themable** ⚑ — A31 does not cover them and no design
   should be asked to.
8. **Whether `@member` is available to `error-404.hbs`** decides one detail of the 404's header ⚑ — A1's
   signed-in pill. A small wrong rather than a broken page.
9. **A31 declares `core` in all ten** ⚑ — with the search form struck and every list authored, there is nothing in the category that could degrade. It is the first category in the library with nothing to suppress.

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
7. ~~The category's zero-JS claim now has one stated exception.~~ **Reversed by the 30 August ruling.** The
   reconciliation pass gave 9 Directory a *Nav children* row and a `nav-transform` **ARCHITECT: registry
   addition**; with the directory authored there is no Ghost label to transform, so **both are withdrawn and
   the claim returns to all ten declaring `core` and nothing else** ⚑. Label prefixes in the 404's header are
   A1's problem, not A31's.
8. **8 Elsewhere's disabled control became a data source.** "Most recent in the same tag" is gone;
   **Posts** reads Most recent · Featured · By tag · By author · Hand-picked, through P0·5's
   "Populate from…" panel. The finding it stated — **a 404 has no tag context** — is still true and is
   now written in the Data row rather than drawn as a disabled value ⚑.
9. **Control counts, recut** — and recut again by the 30 August rulings, which is the count that stands: **1, 2, 3, 5, 6, 7 and 10 carry six · 4 Boxed five · 8 Elsewhere four · 9 Directory five**.
   All are inside the PRD's ~15 ceiling, and the universal trio, the Content group, the P0·6 state
   group and the page source group are **counted nowhere**. **Quick Controls, named for the first
   time** ⚑, three per design: 1 Alignment · Measure · Code · 2 Split · Divider · Code · 3 Card width ·
   Depth · Code · 4 Box width · Recovery links · Code · 5 Recovery links · Depth · Block position ·
   6 Band height · Alignment · Button · 7 Scrim · Alignment · Image height · 8 Row · Thumbnails · Code · 9 Columns · Item size · Rules · 10 Display size · Split · The gate's display
   slot.
10. **Nothing was removed as a "Preview" control** ⚑ — no A31 panel had one. The three pages were
    always reached from the editor rather than a sidebar row; what changed is that **the switcher is
    now named as P0·6's and the copy is edited in place**.
11. ~~The open verifies stay open, and stay visible.~~ **All but one are closed by the 30 August pass** ⚑. The
    error-context variable names are confirmed (`statusCode`, `message`, `errorDetails`); whether an error
    template may run `{{#get}}` is answered twice over — helpers in `error-404.hbs` only, and **A31 queries
    nothing at all**; and the secondary-navigation verify goes with the navigation query. **What `private.hbs`
    receives is the one verify still open**, and it is the architect's.

---

## Patch notes — the design patch pass, 30 August 2026

Every change made in this pass, with **the name of the rule that required it**. Where a ruling could not be
applied without inventing a decision, it is written as an **open question** below rather than guessed.

| What changed | The rule or ruling that required it |
|---|---|
| **This category's own drawn search form is struck** — the 52 px field and its annotation in all ten designs, in the six pack proofs and in the stress frame; each design's *Search on the 404* row; the `searchPlaceholder` field; the `search.label` and `search.submit` catalog words; the read-only *What search reaches* row; the component-inventory entry, now marked struck | **This category's own work list.** The 404 renders the site header, so the search a reader uses there is the Headers category's Search control — and there is no search page for a form of A31's own to submit to |
| **The private-site gate draws no form destination** — no `action` attribute anywhere on any frame, in the page-source row, or in §8·2. Ghost supplies the destination and the return path | **This category's own work list.** A drawn destination breaks Ghost's own behaviour of returning the visitor to the page they asked for |
| **The category's three hand-offs are retired.** 7 Cover at a 500 and with no image hides the photograph and the scrim and draws its own block on the page ground · 8 Elsewhere on a 500 and the gate hides the list, its label and its hairline · 9 Directory on a 500, the gate and a site with no navigation hides its columns. All three still render as themselves; the panel may advise and never switches. The roster column now reads **what the page hides**, the frame annotations are recut, the *hand-off annotation* component is renamed *hidden-material annotation*, and the inherited *hand-off rule* is marked retired | **No design ever turns into another design** |
| **8 Elsewhere's *How many posts* became a number picker, 1–8, default 5** where it drew three fixed buttons — and **the owner's authored-list ruling superseded it the same day**: with the rows hand-written the count is the number of rows, and **the cap of eight now lives on the list's Add row, with the reason shown**. **9 Directory's *Columns* is not an item count** and stays a named-value row — it picks a layout, not how many things are shown | **Item counts are a number picker** |
| **2 Split Reason's *Gap* is renamed Tight · Normal · Loose**, values untouched (48 · 80 · 112). It is the only gap row in the category | **Gap names are "Tight · Normal · Loose"** |
| **The `**[Free] designs:**` line is added at the head of this document** with a four-design shortlist, a recommendation of **1 Centred · 4 Boxed**, and the question put to the owner below | **The two free designs are the owner's choice** |
| **Re-checked, nothing to change.** The colour swatch row is **Base**; **there is no "Inherit" value anywhere in A31**; no design renames a shared control; and the four designs that lock *Background role* — 5 Panel, 6 Contrast Band, 7 Cover, 10 Display — show the reason on the row | **A design may offer fewer choices on a shared control, and must say why** |
| **No subject.** A31 prints no person, author or member on any of its three pages, so no initials are drawn anywhere | **Avatars with no photograph** |
| **Three lists, all compliant.** `links[]`, `posts[]` and `directory[]` each have a minimum of **zero**: Remove is always available and never dimmed, and removing the last item takes the list, its label and its hairline with it. **Both new lists draw an Add row and a per-row overflow with Remove** ⚑ — the rows and the items stopped being Ghost's on 30 August 2026 | **The Remove button never greys out** |
| **No subject.** A31 draws no slider; every control is a named-value row or a number picker whose title says what it affects | **Slider labels** |
| **No subject inside A31.** None of the three pages carries a subscribe, sign-up or paid-tier button of its own; the Subscribe pill on the 404 belongs to the header, and its conditions are the Headers category's. The member-aware action editor never opens here | **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** |
| **No subject.** A31 contains no subscribe and no sign-in form, so there is no form for the notice to replace. **The gate's password form is a native POST and works with JavaScript off**, and its four states — empty, focused, filled, wrong password — are untouched | **The no-JavaScript notice** |
| **Ghost's own error-context rules are recorded** ⚑ — two templates rather than one (`error-404.hbs` and `error.hbs`); the variables confirmed (`statusCode`, `message`, `errorDetails`); **no theme helpers and no extending the default template outside the 404**; `errorDetails` refused category-wide as developer output. Every 404 and 500 boundary strip now names its own file and the helper rule | **Ghost itself**, read 30 August 2026 — it closed findings 1 and 2, and raised owner question 3, which he ruled the same day |
| **Housekeeping, recorded rather than silently fixed.** The proof frame's roster carried the control counts from before the reconciliation pass; **it now matches this document on one canonical line**: 1, 2, 3, 5, 6, 7 and 10 carry six · 4 Boxed five · 8 Elsewhere four · 9 Directory five | — |
| **The build shape is ruled, 30 August 2026** ⚑ — **two templates following Ghost's own recommendation**: `error-404.hbs`, which Ghost permits helpers in, so **the 404 keeps its whole chrome and §8·1 stands**; and `error.hbs` for every other code, which uses **no helper, no partial and no context** — `{{asset}}` for the stylesheet, `{{statusCode}}` and `{{message}}` the only dynamic values, **every other word hard-coded, the wordmark included**. A publication still writes all of it in the editor and may add its own extra lines the same way | **The owner, 30 August 2026**, on Ghost's error-context guidance |
| **A31 queries Ghost for nothing** ⚑ — **8 Elsewhere's rows and 9 Directory's items are now authored lists**, hand-written by the publication and hard-coded, with Add, Remove and drag reorder on P0·3. Struck with the queries: 8's *How many posts* and *Posts*, 9's *Which navigation* and *Nav children*. **`nav-transform` and the category's one ARCHITECT: registry addition are withdrawn**, and all ten designs declare `core` and are pixel-identical without JavaScript. **The staleness is drawn on the panel**: a hand-written list needs editing when a page is renamed or removed | **The owner, 30 August 2026** — and, downstream of it, **the Remove button never greys out**, which now governs three lists rather than one |

**Open questions.** None are left in this category. All three were put to the owner and all three were ruled on
30 August 2026; the reasoning behind each is kept because it is the reason the design is built the way it is.

1. ~~Which two designs are free.~~ **Ruled: 1 Centred · 4 Boxed.** Shortlisted as the four plainest, none needing
   the customer to have good photography — 1 Centred, 4 Boxed, 2 Split Reason, 3 Card — and the owner chose the
   category default and the one design that shows a link's destination.
2. ~~7 Cover's 500, and 7 Cover with no photograph.~~ **Ruled: hide the picture and the scrim, and draw the block on
   the page ground** — as drawn on the frame, and the smallest change that keeps the design itself. The alternative
   considered was a flat plate in the scrim's own ink, which would have kept the design's dark cast and its derived
   values; it is recorded here and not built.
3. ~~Whether a 500 may carry the publication's own words.~~ **Ruled: it carries them, hard-coded into `error.hbs` by
   the build.** Ghost asks that an error template outside the 404 use no theme helper and not extend the default
   template, and A31's 500 draws an authored heading, sentence, button label and mailto address — so the choice was
   between compiling those words in, shipping fixed words the publication cannot edit, and letting Ghost's own page
   render. **The owner took the first.** The ten 500 frames stand as drawn, and their words are compiled in rather
   than read back through settings.

**Confirmations.**

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10** — ten designs, no gap created or
  closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required
  shape, and names **1 Centred** and **4 Boxed** — both of which exist in this category's roster, and both
  **confirmed by the owner on 30 August 2026**.

— End of specification —
