# A33 Koenig Card Treatments — written specification

6 treatments · Paper pack · drawn 24 August 2026 · controls-reconciliation pass 25 August 2026 ·
**Koenig card treatments patch pass 28 August 2026** · **selector pass 1 September 2026** ·
**Koenig card treatments patch pass five 3 September 2026**

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
so A33 re-styles the shell only; **the toggle is a plain container with a heading and a button rather
than native disclosure markup** ⚑, so it needs Ghost's script to open; **email content never renders on the web at all** ⚑ and is drawn
dashed so a user can see that. **The public-preview cut leaves no element at all** ⚑ — Ghost emits only an invisible HTML comment
there, so there is nothing for a stylesheet to reach and **the marker component is deleted from this
category**; A32 renders the gate below the cut. **Blockquote and the code block are text formats rather than cards** and
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
| Card widths | read-only | The author's, per card — the treatment decides what each resolves to ⚑. **The classes are `.kg-width-wide` and `.kg-width-full`; regular carries no width class** on an image, gallery or embed figure ⚑ |
| Bookmark metadata | read-only | Title, description, icon, author, publisher, thumbnail all scraped (C.1) |
| Gallery rows | read-only | Ghost's own script computes the ratios; **no registry module covers it** ⚑ |
| Corners | read-only | From the pack's radius token, in every treatment ⚑ |

### The selectors — what A33 actually styles

**A33 ships a stylesheet and nothing else**, so the class name is the deliverable. Until the selector
pass of 1 September 2026 this specification named the fields to style and never named a single thing
to select. **The class is now beside every card in the shared field list above**, and the rules below
carry the rest. **Inside a post's body we own the stylesheet and nothing else** — not the markup, not
the ARIA attributes, not the text — so nothing here assumes markup A33 would have to emit.

**The width classes, which the Card widths row depends on.** `.kg-width-wide` and `.kg-width-full`
sit on the card's own element beside its card class — `figure.kg-card.kg-image-card.kg-width-wide`.
**Those two are the whole of the width contract**, and every treatment's resolution table is written
against them. **Regular carries no width class** on an image, gallery or embed figure: Ghost's
documentation states that a normal-width card has no extra class, so the regular rung is the card
class's own default and never a `.kg-width-regular` selector ⚑. **The signup card is the one
exception** — Ghost documents `kg-width-regular` on it — so the regular rung cannot be written as one
rule for both. **Two cards arrive with a width class already set** ⚑: Ghost ships `.kg-header-card`
with `kg-width-full`, and its own gallery example ships `.kg-gallery-card` with `kg-width-wide`. The
signup card additionally provides `.kg-content-wide` at full width and `.kg-layout-split` when it
carries an image.

**State hooks a stylesheet may read.** The toggle card exposes `data-kg-toggle-state="close"` or
`"open"` on `.kg-toggle-card`; **CSS can read it and only Ghost's script ever writes it**, which is
the mechanism behind the no-JavaScript line — the attribute stays at `close` and the card renders
closed. Ghost's own `.kg-audio-hide` and `.kg-video-hide` are the players' script-driven toggles and
are likewise readable and not writable.

**Where we are not certain, and it is said rather than guessed** ⚑. Verified against Ghost's theme
documentation: `.kg-card`, `.kg-image-card`/`.kg-image`, `.kg-gallery-card` with
`.kg-gallery-container`/`.kg-gallery-row`/`.kg-gallery-image`, `.kg-bookmark-card` and its eight
parts, `.kg-embed-card`, `.kg-callout-card`/`.kg-callout-emoji`/`.kg-callout-text`,
`.kg-toggle-card`/`.kg-toggle-heading`/`.kg-toggle-heading-text`/`.kg-toggle-card-icon`/`.kg-toggle-content`,
`.kg-button-card` with `.kg-align-left`/`.kg-align-center` and `a.kg-btn.kg-btn-accent`,
`.kg-file-card` and its parts, `.kg-audio-card` and its player parts, `.kg-video-card` and its player
parts, `.kg-header-card` with `kg-size-*` and `kg-style-*`, `.kg-signup-card` and its form parts,
`.kg-product-card`/`.kg-product-card-container`, `.kg-width-wide` and `.kg-width-full`.
**Confirmed against Ghost's own card renderers, 3 September 2026 — read from the code that emits the
classes, on both supported versions.** Four selectors that were flagged now carry rules of their own:
`.kg-cta-card` (the call-to-action card); `.kg-callout-card`; `.kg-product-card`, whose inner classes
are `kg-product-title`, `kg-product-image`, `kg-product-description-wrapper` and
`kg-product-button-wrapper`; and `.kg-header-card`, whose Ghost 6 shape is `kg-header-card-content`,
`-heading`, `-subheading`, `-subheading-wrapper`, `-text`, `-image`, plus `kg-header-button-wrapper`,
`kg-v2`, `kg-style-accent`, `kg-style-image`, `kg-layout-split`, `kg-size-large`, `kg-swapped`,
`kg-align-center` and `kg-content-wide`. **Each was checked against the code that emits it**, which is
what retires the flag.

**The email-content card's selector is deleted rather than corrected.** Its renderer returns an empty
container unless the render target is email, so **on the web it produces no element and no class at
all** — the rule matched nothing, ever, and there is nothing to correct it to. The card is still drawn
dashed in every roll, because an author can still insert it; what is gone is the selector.

**Still unverified, and still carrying no rule of its own**: the eight callout colour variants beyond
`.kg-callout-card-accent`, whose pattern is `.kg-callout-card-<colour>`. The confirmation names the
callout card, not its colour variant classes, so the variants stay marked rather than promoted on a
reading — recorded as **OPEN FOR THE OWNER** in Patch notes. **A wrong selector styles nothing and
fails silently**, which is the worst failure available here.

**The treatments target Ghost's current card renderer only — the owner's ruling, 3 September 2026, and
a stated limitation rather than an open question.** Ghost 5 ships both the current renderer and an
older one, because a Ghost 5 site can still hold posts written before the current editor, and
**header, file, product, video and embed cards emit different classes depending which renderer
produced the post** — most severely the header card, whose older markup carries almost none of the
structure the treatments style. In words a customer can be shown: **a post written before Ghost 5's
current editor keeps Ghost's own default card styling — readable, just not carrying the chosen
treatment.** **Why it went that way, recorded with the ruling**: a second selector set would roughly
double this category's stylesheet and its testing permanently, and the header card would need
genuinely different rules rather than a second selector, because the older markup lacks the structure
the treatments rely on. **Ghost 5 is end-of-life, so the affected posts are a shrinking set.**

**`.kg-nft-card` stays unstyled, deliberately — the owner's ruling, 3 September 2026.** Ghost still
ships the card and this category draws twenty cards without it; it keeps Ghost's default appearance.
**Recorded as a decision rather than a gap**, so no later pass raises it as an oversight.

**Two selector traps, named so a builder does not fall into them.** `.kg-file-card-caption` is the
file card's *description* and not a card caption — the Captions control must not reach it ⚑. And
`.kg-card` is present on every documented card beside its own class, but **only Space around cards is
written against it alone**; every other rule selects the specific card class, so a Ghost version that
omitted it would break one rule rather than all of them ⚑.

**The build fact that decides whether any of this lands.** Ghost injects its own `cards.min.css`
through `ghost_head` unless the theme's `package.json` excludes that card under `card_assets`. The
excludable set is audio, blockquote, bookmark, button, callout, file, gallery, header, nft, product,
toggle, video and signup. **A treatment's rules only take effect for cards on the exclusion list**;
for the rest, Ghost's default card CSS is still in the cascade. **And `card_assets` excludes a card's
*assets*, not its stylesheet alone** — Ghost's own wording is "styles and behaviour", and the two
bundles, `cards.min.css` and `cards.min.js`, come from the same per-card set. **A33 ships no
JavaScript**, so an exclusion that takes a script with it does not restyle a card, it stops the card
working ⚑.

**The ruling — the owner, 1 September 2026, after two earlier answers the same day.** **A33 replaces
Ghost's card CSS for every card it draws — the twelve excludable cards other than `nft` — and the
theme always re-includes Ghost's own `cards.min.js`, so no behaviour is lost.** One stylesheet owns
the look, Ghost keeps owning the behaviour, and there is no cascade to fight and no seam between a
treated card and an untouched one. **`nft` is ignored by the owner's instruction**: A33 draws no NFT
card, so it is not excluded, not drawn, and carries no open question — and since 3 September 2026 it is
a recorded decision that the card **stays unstyled and keeps Ghost's default appearance**, not an
oversight waiting on a later pass.

**The ruling is conditional on one test, and the fallback is written rather than left to a builder** ⚑.
The bundle Ghost serves at `/public/cards.min.js` may be built *from* the theme's `card_assets`
config, in which case re-including that URL by hand fetches the same filtered file and gains nothing.
**Check 3 in the developer handoff tests exactly that, and it is the first thing it does.**

- **If the served bundle is the full set** — exclude the twelve and re-include `cards.min.js` from the
  theme's own template. **This is the preferred outcome and the ruling as stated.** Two build
  requirements come with it: **the script tag is the theme package's, not A33's** — a treatment cannot
  reach outside the post body — and **the theme's documentation must name the path**, because it is
  Ghost's internal asset URL and a Ghost upgrade that moves or re-hashes it would stop the toggle
  opening with no error anywhere.
- **If the bundle is filtered by the config** — **exclude the seven static cards** (bookmark, button,
  callout, file, header, product, blockquote), where nothing depends on a script and A33 already draws
  every state, and **leave toggle, gallery, audio, video and signup on Ghost's assets**, styling them
  by a deeper selector instead: `.gh-content .kg-toggle-card` beats `.kg-toggle-card` without removing
  anything. Excluding any of those five would leave a card that renders and does nothing — the
  toggle would never open, the gallery's rows would never compute, the players would never play and
  the signup form would never submit.

**What the ruling does not fix, either way.** The signup, call-to-action and header cards carry the
author's own **inline** styles, which no selector beats and only `!important` overrides ⚑. That is
already the recorded reason those three never take 6 Contrast Band, and it is unchanged.

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
- **This category controls no translatable strings at all** ⚑. Every visitor-facing word a card renders
  is either the author's content or a string inside Ghost's own renderer — the file card's size unit
  and download label, the players' transport labels, the toggle's expand label. **No theme can reach
  them**, so the earlier claim that A33 owned five catalog strings is deleted.
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
  member-aware action editor — **it would be a second switch that loses to Ghost's** ⚑. The Cards
  panel now carries the conditional note the rule that member buttons are conditional asks for:
  **Ghost's signup and call-to-action cards do not render when the connected site cannot accept
  sign-ups**, and **with JavaScript off the signup form does nothing** — Ghost's form carries no
  `action`; `data-members-form` tells Ghost's own script to handle the submit, and the loading,
  success and error classes are written by that script. The CSS in Ghost's theme documentation styles
  those states; it does not create them.
- **The no-JavaScript notice cannot be built here, and that is a stated conflict** ⚑. The rule asks
  every design containing a subscribe form to replace that form with a designed notice when JavaScript
  is unavailable. Inside a post body **A33 owns the stylesheet and not the markup**: the signup card is
  Ghost's element and a stylesheet cannot swap it for a notice. The panel says so in words; the notice
  itself belongs to Ghost's card, not to this category. **Reviewed with the owner on 28 August 2026**
  against Ghost's own theme documentation, and the reason is now stated precisely rather than as "the
  endpoint refuses a plain post": Ghost's members form has no `action` at all, `data-members-form`
  hands the submit event to Ghost's script, and that script is what writes the loading, success and
  error classes and fills `data-members-error`. CSS can only show or hide those messages. Recorded,
  not worked around.
- **Behaviour:** `accordion` and `core`, unchanged. The pass adds no behaviour, so it coins no module
  name and raises no registry addition.

### The two Ghost findings of 2026-08-31, and where they land here

**The feature-image caption renders differently on the two Ghost versions.** Ghost 6 quietly removes
`<em>` and `<strong>` from a feature-image caption while keeping links and `<b>`; Ghost 5 keeps
everything. **A33 renders no feature image**, so the finding has no direct subject here — but it
touches this category harder than any other, because **A33's credit convention is the caption's
trailing `<em>` run** ⚑. If the same stripping reaches a *card's* `<figcaption>`, the credit
disappears on Ghost 6 and the Credit line control governs nothing. **That was not tested and is not
guessed**: it is an open question below, and until it is answered the specification says plainly that
the credit convention rests on an `<em>` surviving Ghost's own caption rendering. **The owner asked
for the test on 1 September 2026**: it needs the same stored caption rendered on a Ghost 5 and a
Ghost 6 server, which is a build task rather than a design one, and the question stays open until it
is run.

**A comment count renders nothing at all without JavaScript.** **No A33 design reads a comment
count** — comments are A28's surface, not a Koenig card — so the finding has no subject in this
category. Recorded so the omission is not read as a miss.

### The roster

| # | Treatment | Tuple | Ctl | Modules |
|---|---|---|---|---|
| 1 | Plain **[Free]** | `article body · none · page · variable · inline · hairline rules only` | 6 | `accordion`, `core` |
| 2 | Card | `article body · card · surface · variable · inline · the raised panel` | 6 | `accordion`, `core` |
| 3 | Panel | `article body · box · surface · variable · inline · plane past the measure` | 6 | `accordion`, `core` |
| 4 | Wide **[Free]** | `media frame · none · page · variable · edge · media one rung wider` | 6 | `accordion`, `core` |
| 5 | Full Bleed | `media frame · none · page · variable · full-bleed · the viewport-edge bleed` | 6 | `accordion`, `core` |
| 6 | Contrast Band | `article body · box · contrast · variable · inline · the inverted card plane` | 6 | `accordion`, `core` |

**[Free] designs:** 1 Plain · 4 Wide

*The owner's choice, ruled 28 August 2026. A free site gets the category default and the treatment that
gives photographs a wider rung.*

**In A33 the tuple's containment and ground slots describe the card, not a section** ⚑ — A33 has no
section of its own. Read any other way, all six read `none · page` and the uniqueness check fails on
a technicality. Containment separates 1 from 2 and 3; ground separates 3 from 6; **media placement is
the only slot between 4 Wide and 5 Full Bleed**, and it is enough — one reaches the container's edge,
the other the window's.

**The module list is identical in all six**, which is the honest answer for a category that is a
stylesheet: `accordion` for the toggle card, `core` for everything else.

### The five rules of this pass, and what each resolves to here

Named, never numbered, and each carrying its landing in a category that is a stylesheet.

- **A control switched off by another is greyed, with the reason beside it.** **Two cases, both
  already drawn that way**: 5 Full Bleed's *Caption on a bleed* → Over the image, at the foot, and
  6 Contrast Band's *Action on the band* → The accent, re-checked. Each stays visible, stays
  unselectable, and **carries its failing ratio as a short sentence at the control** rather than a
  tooltip. Nothing was hidden and nothing was left accepting a value it would not honour. **The one
  exception in the rule — a control this project can never offer is not drawn at all — has no case
  here**; A33 offers no visitor dark-mode switch.
- **Avatars with no photograph show initials, and the two forms are not interchangeable.** **No
  subject.** A33 draws no avatar: the twenty cards have no author field, and the bookmark's icon is a
  scraped favicon rather than a person.
- **The Remove button never greys out.** **No subject in the sidebar.** A33's one repeating array is
  `gallery.images[]`, and its Remove lives on the canvas in Koenig, where it is **Ghost's control and
  not a theme's** ⚑. Removing the last image deletes the card, which is Ghost's behaviour; A33 states
  it and does not restyle it.
- **A count that picks between drawn layouts is a named set, not a number picker.** **Already true
  everywhere.** Every A33 control is an enum of named steps and the category holds **no number picker
  at all** — the numerals in *Compact 32 · Comfortable 48 · Spacious 64* are the named step's own
  label. Nothing was converted in either direction.
- **A design may declare the width below which its script runs.** **No design declares one, because
  A33 runs no script of its own** ⚑. Every script inside a post's body is Ghost's or the provider's.
  The category's width thresholds — no wide column below 1024, space 32 at ≤ 767 — are layout, not
  script, and the no-JavaScript lines already read at every width.

### The shared field list

The union every treatment draws from. **Every treatment draws all of it** ⚑ — a treatment cannot
decline a card the author inserted, so there is no field with nowhere to live and switching treatment
is always safe.

| Card | Ghost class | Fields | Type | Optional | Limit and note |
|---|---|---|---|---|---|
| Image | `.kg-image-card` | `src` · `alt` · `caption` · `width` | file · text · rich text · enum | alt, caption | alt ≤ 125 chars · width is regular · wide · full, authored per card |
| Gallery | `.kg-gallery-card` | `images[]` · `caption` | file array · rich text | caption | 1–9 images, ordered · Ghost's script computes the row ratios · **Ghost sets the card's width itself** — its own markup ships `.kg-gallery-card` with `kg-width-wide` — **and A33 leaves it there by ruling, not by inability** ⚑ (owner, 1 September 2026) |
| Bookmark | `.kg-bookmark-card` | `url` → `title`, `description`, `icon`, `author`, `publisher`, `thumbnail` · `caption` | url → scraped · rich text | caption, and every scraped field | **the author owns the URL only** ⚑ |
| Callout | `.kg-callout-card` | `text` · `emoji` · `colour` | rich text · emoji · enum | emoji | nine colour values, Ghost's own palette ⚑ · text required |
| Toggle | `.kg-toggle-card` | `heading` · `content` | text · rich text | — | both required · Ghost supplies the chevron and its script · **the markup is a plain container with an `h4` and a `button`, not `details`/`summary`** ⚑ |
| Button | `.kg-button-card` | `label` · `url` · `align` | text · url · enum | — | label ≤ 40 · left or centre · the fill is the site accent |
| Embed | `.kg-embed-card` | `url` → `html` · `caption` | url → provider markup · rich text | caption | the markup is the third party's; A33 styles only the frame ⚑ · **Ghost sets the card's width itself and A33 leaves it there by ruling** ⚑ (owner, 1 September 2026) |
| Product | `.kg-product-card` | `title` · `description` · `image` · `rating` · `buttonLabel` + `buttonUrl` | text · rich text · file · int · text + url | image, rating, button pair | rating 1–5 · the button pair is both-or-neither · **Ghost renders the stars with no text equivalent and a theme cannot add one** ⚑ (a Ghost limitation) · **inner classes confirmed, 3 September 2026**: `kg-product-title`, `kg-product-image`, `kg-product-description-wrapper`, `kg-product-button-wrapper` |
| File | `.kg-file-card` | `file` · `title` · `description` → `name`, `size` | file · text · rich text → derived | description | name and size come from the upload, read-only |
| Header | `.kg-header-card` | `heading` · `subheading` · `buttonLabel` + `buttonUrl` · `size` · `style` · `backgroundImage` | text · text · text + url · enum · enum · file | subheading, button pair, image | **three sizes × four styles = twelve variants the theme owes** ⚑ (C.1) · **class confirmed on both versions, 3 September 2026**; Ghost 6's shape is `kg-header-card-content`, `-heading`, `-subheading`, `-subheading-wrapper`, `-text`, `-image`, plus `kg-header-button-wrapper`, `kg-v2`, `kg-style-accent`, `kg-style-image`, `kg-layout-split`, `kg-size-large`, `kg-swapped`, `kg-align-center`, `kg-content-wide` |
| Markdown | **none** | `md` | rich text | — | **no wrapper class** ⚑ · renders as ordinary headings, lists, links and images |
| HTML | **none** | `html` · `visibility` | author markup · enum | — | public · free members · paid members · **whatever the author pastes wins** ⚑ · **no wrapper element** ⚑ — the Rules control and the Contrast Band have no target here |
| Divider | `hr`, no class | position only | — | — | a bare `hr` · weight, width and space are the treatment's; **the optional centred glyph is an icon slot** (P0·2) on the divider card's own panel ⚑ |
| Email content | **none** | `greeting` · `fallback` · `text` | text · text · rich text | greeting, fallback | **never renders on the web** ⚑ — the renderer returns an empty container unless the render target is email, so on the web there is **no element and no class**, and **the `.kg-email-card` selector is deleted rather than corrected** (renderers, 3 September 2026) · `first_name` placeholder with the author's fallback |
| Call to action | `.kg-cta-card` | `text` · `image` · `sponsorLabel` · `buttonLabel` + `buttonUrl` · `background` · `visibility` · `showOn` | rich text · file · text · text + url · enum · enum · enum | image, sponsorLabel, button pair | **renders on the web, in the newsletter, or both** ⚑ · audience is public, free or paid · **class confirmed against both renderers, 3 September 2026** |
| Public preview | **no element** | position only | — | — | **no element at all** ⚑ · Ghost leaves only an invisible comment where it cuts the response · A32 renders the gate |
| GIF | `.kg-image-card` | the search and the pick | file | — | renders as an image card and follows those settings |
| Audio | `.kg-audio-card` | `file` · `title` · `thumbnail` | file · text · file | thumbnail | **Ghost ships the player and its script** ⚑ · A33 styles the shell and the progress accent |
| Video | `.kg-video-card` | `file` · `poster` · `loop` · `width` | file · file · bool · enum | poster, loop | three widths · Ghost ships the player · A33 styles the play button, scrim and bar |
| Signup | `.kg-signup-card` | `heading` · `subheading` · `disclaimer` · `buttonText` · `layout` · `background` · `label` | text · text · text · text · enum · colour or file · text | subheading, disclaimer, background, label | **the author's colours arrive as inline styles** ⚑ · shape and spacing only |
| Every card | `.kg-card` + `.kg-width-wide` · `.kg-width-full` | the treatment's own values | site-wide settings | — | space, captions, credit, plane, width resolution — one value each ⚑ |

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
   frame; a single hairline above and below the five cards that must read as one object — bookmark, toggle,
   audio, file, product — and a tinted plane on the callout and the call to action. The category default.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 48 · Spacious 64 |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Rules | Above and below · Below only · None — on bookmark, toggle, audio, file and product only |
   | Tinted cards | Tinted · Hairline box · None — governs the callout and the call to action |
   | Emoji | Shown · Hidden |

   **Selects.** *Rules* → `.kg-bookmark-card`, `.kg-toggle-card`, `.kg-audio-card`, `.kg-file-card`, `.kg-product-card`, and no others — **the HTML card is not on the list because it has no element** ⚑. *Tinted cards* → `.kg-callout-card` and its colour variant, plus the call-to-action card, whose class is unverified. *Emoji* → `.kg-callout-emoji`, hidden with `display:none` so the text takes the whole plane. *Captions* → `figcaption` inside `.kg-image-card`, `.kg-gallery-card`, `.kg-embed-card` and `.kg-video-card`; *Credit line* → its trailing `em`. *Space around cards* → the adjacent-sibling margin on `.kg-card`. The divider's glyph is a pseudo-element on a bare `hr`.

   Then the module's **Callout colours** mapping and the five read-only rows, not counted. **The
   Credit line's help text documents the convention** — "a caption's trailing italic segment
   renders as the credit" — and the treatment preview draws one example ⚑. **It now also states the
   cost, in the editor's own terms:** "a caption that ends in italics for any other reason — a film
   title, a ship's name — will read as a credit." **The owner accepted that on 1 September 2026**
   rather than dropping the control or waiting on a Ghost credit field. **The divider card's
   panel carries the centred glyph as an icon slot** (P0·2): Icon Picker on click, popover with
   swap · Size Small/Medium/Large · Colour role Text/Muted/Accent · Remove; empty is a dashed 20 px
   slot visible only while the card is selected, and at rest with no icon the divider is a bare
   rule ⚑.
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
   only state. **No-JS:** **the registry's quoted degradation for `accordion` does not hold here** ⚑ —
   Ghost's toggle card is a plain container with a heading and a button, not native disclosure markup,
   so **with JavaScript off it cannot open**. **The mechanism, now that the selectors are written:** the
   state is `data-kg-toggle-state` on `.kg-toggle-card`, which **CSS reads and only Ghost's script
   writes**, so the attribute stays at `close` and the closed state is the only state that renders.
   A33 still declares `accordion` as the nearest module and drops the quote; the mismatch is Finding 5. `core` — "Never runs; the `.js-enabled` class is never
   set, so all JS-conditional CSS stays in its no-JS branch." **Fourteen of the twenty cards are
   identical with JavaScript off.** **Six depend on a script, and every one of those scripts is
   Ghost's or the provider's, not A33's** ⚑ — the toggle's open and close, the gallery's row ratios,
   the audio and video players, the signup card's post and the embed's provider markup — and **the
   registry has no module for any of them**, so A33 declares `core` rather than inventing one. A
   finding, not a degradation A33 may quote.
10. **Accessibility.** `<figure>`/`<figcaption>` paired on image, gallery, embed. Bookmark: one `<a>`,
    one focus stop, thumbnail `aria-hidden`, title as the accessible name. Toggle: a plain `div` holding an `h4` and a `button` — **not disclosure markup** ⚑; the heading
    level is Ghost's, the button is the only focus stop, and no stylesheet can add the `aria-expanded`
    it lacks — **a Ghost limitation, recorded rather than fixed**. Button card: `<a>`
    at 48 px, 44 px minimum target. Product: **Ghost renders the rating as stars with no text equivalent and a theme cannot add
    one** — a Ghost limitation ⚑. File: the link
    names the file and its size. Header: `h2`, never promoted to `h1`. **The hairline carries no
    role**; the callout's emoji carries `aria-hidden`. Body 12.6:1, captions 5.4:1, tinted callout
    11.8:1. Focus order is document order.
- **Repeating items.** As the category layer: `gallery.images[]` only, managed on the canvas.
- **Flagged ⚑** — the tuple describing the card; the hairline pair as containment, on five named cards, the HTML card no longer among them; **the callout and the call to action keeping a
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
5. **Content fields.** The whole union. **The header card's fields are drawn without a panel** ⚑, and
   **the HTML card gets no panel either** ⚑ — Ghost emits no wrapper element for it, so there is
   nothing to put a panel on (the owner's ruling of 28 August 2026, closing Finding 8).
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 48 · Spacious 64 |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Panel | Hairline · Hairline and shadow · Fill only |
   | Panel padding | Compact 16 · Comfortable 24 · Spacious 32 |
   | Image in the panel | Inset · To the panel edge |

   **Selects.** *Panel* and *Panel padding* → every `.kg-card` **except `.kg-header-card`**, which already carries a surface, **and the HTML card**, which has no element ⚑. *Image in the panel* → `.kg-image-card .kg-image`; at To the panel edge the padding comes off the figure rather than being added to the image. **The panel is drawn on the card element Ghost already emits** — A33 adds no wrapper, so the panel and the `figure` are one box and the figure/caption pair survives.

   Then What Ghost owns.
7. **Data.** As 1 Plain.
8. **Empty state.** **The panel keeps its shape and padding whatever is absent** ⚑ — a missing field
   shortens the panel and never leaves a hole. No caption → the bottom padding closes the gap. No
   thumbnail → a panel of text. No product image → panel of text plus rating. **No cards → nothing,
   and in particular no empty panel** ⚑. **The header card gets no panel at any value, and neither does the HTML
   card** ⚑ — the first because it already has a surface, the second because it has no element.
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
   content box** ⚑, and **the HTML card takes no plane at all** ⚑ — Ghost emits no wrapper element for
   it, so it renders in the content column on the page ground (the owner's ruling of 28 August 2026,
   closing Finding 8).
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 56 · Spacious 72 — **this treatment's ladder, one step above 1 Plain's** |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Plane width | Measure 720 · Wide 1040 · Content 1296 |
   | Plane | Surface · Tinted · Hairline box |
   | Media on the plane | In measure · On the plane |

   **Selects.** *Plane* and *Plane width* → every `.kg-card` **except the HTML card** ⚑; `.kg-header-card` takes the plane's width rather than the content column. *Media on the plane* → `.kg-image-card`, `.kg-gallery-card`, `.kg-embed-card`, `.kg-video-card`. **The plane is the card element itself with padding**, not a wrapper — the same constraint that decides the HTML card.

   Then What Ghost owns.
7. **Data.** As 1 Plain.
8. **Empty state.** **The plane is only ever as tall as its content plus its padding** ⚑ — no minimum
   height, and a one-line callout on a 1,040 plane is allowed to be one line. No caption → no
   `<figcaption>`. No thumbnail → the bookmark's text takes the content column, not the plane. **No
   cards → nothing, and no plane** ⚑.
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, plus: **the plane is a `div` with no role** ⚑; **the content column
    keeps the 720 measure at 400 % zoom** — the reason it exists; the plane-to-ground step is 1.05:1
    in Paper light and **is never the only signal** (padding carries it); focus rings draw around the
    link, never the plane. **At ≤ 1023 the plane and the measure are the same width**, so the plane's
    extra width simply is not there — the treatment is unchanged and still 3 Panel ⚑, stated so nobody
    reports it as a bug.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — the plane width and the wide media rung sharing 1,040 on purpose; **space 56 as this
  treatment's default**; media staying in the measure by default; the header card taking the plane;
  **the 302 content column at 390**; the plane collapsing to the measure below 768; the cut
  plane-height and plane-alignment controls.

---

## 4 · Wide

1. **Descriptor.** An image, a GIF and a video render one rung wider than the width their author gave
   them — regular at the wide column's 1,040, wide and full at the content box's 1,296 — with the text
   at the measure and the caption aligned to the media. **A gallery and an embed keep the width Ghost
   fixes for them** ⚑ and do not step up (the owner's ruling of 28 August 2026).
2. **Structural descriptor.** `media frame · none · page · variable · edge · media one rung wider`
   Archetype `media frame` because **the media, not the column, sets this design's geometry** ⚑. Media
   placement `edge`: the card reaches the content box's edge but never the viewport's — **that is
   5 Full Bleed, and it is the only slot between them**.
3. **Archetype.** media frame. Ladder: the frame narrows to its container and the caption follows it.
   **One departure** — **below 1024 the step-up has nowhere to go** and every media card is the
   content box ⚑.
4. **Responsive rule.** **1440** text 720; image, GIF and video regular → 1,040, wide → 1,296, full → 1,296;
   **gallery and embed at Ghost's own widths, 1,040 and 720** ⚑; caption at the media's width; space 56. **834** text 754; **every media card 754** ⚑ — the content box, where the step-up has nowhere to go;
   caption 754.
   **≤ 767** everything 350, space 32, **caption alignment has no meaning**.
5. **Content fields.** The whole union. **`image.width` is read and then overruled** ⚑ — the one
   treatment that does not honour the authored value as given.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 56 · Spacious 72 |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Media steps up | One rung · Two rungs · Not at all |
   | What steps up | Images · **Images and video** (default) — two values, and the reason is Ghost's |
   | Caption alignment | To the measure · To the media |

   **Selects.** *Media steps up* and *What steps up* → `.kg-image-card` (the GIF card renders as one) and `.kg-video-card`; **not `.kg-gallery-card` and not `.kg-embed-card`**, the owner's ruling of 28 August 2026. **The step-up is written as an override of the width classes** — the rule re-points `.kg-width-wide` and `.kg-width-full` on those two card classes and gives the unclassed regular card the wide rung. *Caption alignment* → `figcaption` on the same two.

   Then What Ghost owns. **The panel says in one line: "Regular images render at the wide
   column."** ⚑ This is the one treatment that overrules the author's width class, and without the
   line it reads as a bug.
7. **Data.** As 1 Plain. **A post with no media cards has nothing for this treatment to
   step up** ⚑ — every card renders at the measure and nothing looks broken; 4 Wide is still the
   treatment in force and never becomes another design.
8. **Empty state.** **A media card with no caption sits wide with nothing tying it to the column** ⚑ —
   the known cost, and the reason Caption alignment: To the measure exists. No caption → no
   `<figcaption>`, space closes. One gallery image → one image at the width Ghost fixes for the gallery. No cards →
   nothing.
9. **Behaviour module.** As 1 Plain, verbatim.
10. **Accessibility.** As 1 Plain, plus: **at To the media the caption line runs 1,040 — about 130
    characters — past the 80-character guidance** ⚑, a named trade mitigated by a two-line maximum; To
    the measure is the accessible value and the panel says so. The figure/caption pair is unchanged.
    **At 400 % zoom the step-up disappears** with the wide column.
- **Repeating items.** As the category layer.
- **Flagged ⚑** — the treatment re-resolving the author's width class; **wide and full collapsing to
  one width**; only image, GIF and video stepping up — galleries and embeds keep Ghost's width, the bookmark's
  thumbnail is furniture and the product's photograph moves only with its copy card; the 1,040 caption line as a
  named accessibility trade; **no step-up below 1024**; the cut per-card width override.

---

## 5 · Full Bleed

1. **Descriptor.** A media card marked full takes the viewport's whole width and drops its corner
   radius; wide takes the content box; regular stays in the measure; the caption returns to the 720
   column beneath. Copy cards are 1 Plain's, unchanged, and **only image, GIF and video may
   bleed** ⚑ — **Ghost's own script arranges a gallery's rows from the images' ratios, and a wider card would let it
   re-arrange into rows nobody has drawn** — so neither a gallery nor an embed reaches the viewport
   edge. **The ruling is A33's, not a limit Ghost imposes** (owner, 1 September 2026): the width class
   is on the figure and could be reached.
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 56 · Spacious 72 |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Full resolves to | Content 1296 · Viewport edge |
   | Bleed applies to | **Images** (default) · Images and video — two values, and the reason is Ghost's |
   | Caption on a bleed | In the measure · Under, full width · Over the image, at the foot (**the last value disabled with its ratio shown where the carried colour fails AA on the scrim**) |

   **Selects.** *Full resolves to* and *Bleed applies to* → `.kg-image-card.kg-width-full` and `.kg-video-card.kg-width-full`. **The bleed is a rule on the width class, not on the card**, which is why a card the author did not mark full never bleeds. *Caption on a bleed* → `figcaption`, held at 720 however wide the figure is. **Galleries and embeds cannot bleed** — the owner's ruling — **even though Ghost's own gallery markup carries `kg-width-wide` and could be reached**, which makes the exclusion a policy rather than a technical bar; recorded as an open question below rather than reopened here ⚑.

   Then What Ghost owns.
7. **Data.** As 1 Plain. **An author who marks no card full sees no bleed at all** ⚑ — regular at
   the measure, wide at 1,296, and 5 Full Bleed still the treatment in force.
8. **Empty state.** **A bleed with no caption closes its space and the next paragraph follows at the
   spacing value** ⚑ — no empty band, no placeholder line. A gallery keeps the width Ghost fixes for it, at one image or at nine ⚑. No cards → nothing.
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
  only image, GIF and video bleeding — galleries and embeds keep Ghost's width — and the header card
  never; **no `lightbox` declared, with the reason**;
  the `100vw` scrollbar note; the sticky-header stacking note; the scrim value disabled on contrast;
  the cut scrim-strength and bleed-height controls.

---

## 6 · Contrast Band

1. **Descriptor.** Seven copy-bearing cards on the pack's inverted contrast colour at the wide column,
   carrying the carried text; the photograph cards — image, gallery, embed, video, GIF — left on the
   page ground untouched, and the three cards that carry the post author's own inline colours —
   signup, call to action, header — left exactly as the author set them, with the band running behind
   them.
2. **Structural descriptor.** `article body · box · contrast · variable · inline · the inverted card plane`
   Ground `contrast` is the only slot separating this from 3 Panel, and **ground is what earns a
   design its place** — the same plane on `surface` and on `contrast` are two treatments.
3. **Archetype.** article body. **Three departures**: the band becomes the content box at 834 and the
   measure at ≤ 767; the content column is 302 at 390; **eight of the twenty never take the band, and five have
   nothing the band could reach** ⚑.
4. **Responsive rule.** **1440** band 1,040 centred, content 720, padding 32, space 56; media 720 ·
   1,040 · 1,296 on the page ground. **834** band 754, content 690. **≤ 767** band 350, content 302,
   padding 24, space 32 ⚑.
5. **Content fields.** The whole union. **`image.caption` is always on the page ground** in this
   treatment, because media never takes the band ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Space around cards | Compact 32 · Comfortable 56 · Spacious 72 |
   | Captions | Under, left · Under, centred · Hidden |
   | Credit line | With the caption · Its own line · Hidden |
   | Band width | Measure 720 · Wide 1040 · Content 1296 |
   | Which cards invert | Callout only · **Every copy card** — two values |
   | Action on the band | The carried colour · The accent, re-checked (**the second value disabled in Paper with 3.4:1 shown**) |

   **Selects.** *Which cards invert* → the seven copy-bearing classes: `.kg-callout-card`, `.kg-toggle-card`, `.kg-bookmark-card`, `.kg-button-card`, `.kg-product-card`, `.kg-file-card`, `.kg-audio-card`. **Never on the list** ⚑: the five photograph cards; `.kg-signup-card`, the call-to-action card and `.kg-header-card`, which carry the author's own inline styles and would need `!important` to beat them; and the HTML card, which has no element. *Action on the band* → `a.kg-btn` inside `.kg-button-card`, the product card's action and `.kg-bookmark-container`.

   Then What Ghost owns.
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
- **Flagged ⚑** — **eight cards never inverting, at any control value — five photographs and three that carry the
  author's own inline colours**; **the HTML card leaving the band for want of a wrapper element**; the product card inverting
  while its photograph keeps its own plane; the band defaulting to 1,040 to share the wide media rung;
  **the accent disabled with its ratio rather than removed**; the focus ring re-derived on the band;
  the 302 content column at 390; the cut band-colour and per-card invert controls.

---

## Findings for the architect

Eleven; four added by this pass. In full on the proof frame.

**Housekeeping, 1 September 2026 — read item by item.** **This category has no "Open questions"
section**, and never had one: what it has is this findings list, so the housekeeping was applied here
instead, and the fact that the section named in the work list does not exist is recorded rather than
worked around. Nothing below was answered in the housekeeping.

- ~~**Finding 1 · the callout palette mapping.**~~ **Settled by the patch pass of 28 August 2026** —
  the mapping is a Cards-module control defaulting to Pack tokens.
- **Finding 2 · Ghost's gallery script has no registry module.** **OPEN FOR THE OWNER** — the registry
  still needs either an entry or a statement that the behaviour is Ghost's.
- **Finding 3 · C.1's per-card "corners".** **OPEN FOR THE OWNER** — A33 answers with the pack's radius
  token; C.1's matrix and per-card panels are still unamended.
- ~~**Finding 4 · a treatment and a section both re-resolving the width class.**~~ **Settled by the
  patch pass of 28 August 2026** — the section wins inside its own ground, the treatment everywhere
  else, and the precedence is a read-only help line.
- **Finding 5 · `accordion`'s degradation does not describe Ghost's toggle markup.** **OPEN FOR THE
  OWNER** — the honest no-JavaScript line is written here, but the registry entry is still wrong.
- **Finding 6 · A33 has no section, so its tuples describe the card.** Recorded, not a question. No
  decision outstanding.
- ~~**Finding 7 · twelve controls to style one callout.**~~ **Settled by the patch pass of
  28 August 2026** — treatment above, per-card panel below, on S14.
- ~~**Finding 8 · the HTML card's missing wrapper.**~~ **Settled by the owner, 28 August 2026** — no
  panel and no plane either; the card renders on the page ground in all six treatments.
- ~~**Finding 9 · the public-preview cut is a comment, not an element.**~~ **Settled by the patch pass
  of 28 August 2026** — the marker component is deleted.
- **Finding 10 · the product rating has no text equivalent.** Recorded as a **Ghost limitation**. No
  decision available to this project; nothing to open.
- ~~**Finding 11 · Ghost fixes the width of a gallery and of an embed.**~~ **Settled by the owner,
  28 August 2026** — they leave 5 Full Bleed's bleed and 4 Wide's step-up alike. *The selector pass
  has one thing to add to it, as an open question rather than a reopening — see below.*

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
5. **The toggle card is not native disclosure markup, and `accordion`'s degradation is false here.** ⚑
   Tested against Ghost: the card is a plain container with a heading and a button, so **with
   JavaScript off it cannot open**. A33 still declares `accordion` as the nearest module and drops the
   quoted degradation. The registry needs either a degradation that matches Ghost's markup or an entry
   saying the behaviour is Ghost's own.
6. **A33 has no section, so its tuples describe the card.** ⚑ The reconciliation pass should expect
   that; read otherwise, all six collapse to `none · page`.
7. **Six treatment controls plus a per-card panel's six means a user meets up to twelve controls to
   style one callout.** ⚑ **Closed by the pass**: the treatment writes the whole set and the per-card
   panel carries only what is that card's own, with everything the treatment claimed shown read-only
   in it. Both live on the Editor Cards screen (S14) — treatment above, card panel below — and the
   section sidebar's Cards module reduces to the Treatment picker and a link.
8. **The HTML card emits no wrapper element.** ⚑ Ghost renders the author's markup raw, so **the Rules
   control and the Contrast Band have nothing to target** and both drop it. The same fact raises a
   question this pass will not answer on its own: **can 2 Card's panel and 3 Panel's plane reach the
   HTML card either?** **Closed by the owner, 28 August 2026: they cannot.** The HTML card leaves
   2 Card's panel and 3 Panel's plane as well, and renders on the page ground in all six treatments.
9. **The public-preview cut is a comment, not an element.** ⚑ Ghost leaves only an invisible HTML
   comment where it cuts the response, so **the marker component is deleted from the inventory** and
   the card roll draws the absence rather than a label.
10. **Ghost gives the product card's rating no text equivalent.** ⚑ The stars are Ghost's markup and a
    theme cannot add the words. Recorded as a **Ghost limitation** rather than something A33 fixes: a
    screen-reader user hears no rating at all.
11. **Ghost sets the width of a gallery and of an embed, and A33 leaves it there.** ⚑ **Corrected
    1 September 2026:** the width arrives as a class on the figure and *is* reachable, so this is a
    ruling rather than a limitation. **The rule is unchanged and the printed reason is now the real
    one** — Ghost's script computes a gallery's rows from the images' ratios, and a wider card would
    let it re-arrange into rows nobody has drawn. **Neither can bleed** and 5 Full Bleed's value list
    stays at two. Whether the same fact removes them from
    4 Wide's step-up list is **closed by the owner, 28 August 2026: it does.** 4 Wide's *What steps up*
    drops to Images · Images and video.

---

## Open questions

**This section is new.** A33 had none before the selector pass; the five items below were raised by
writing the selectors down. **Four are now settled and one is a commissioned check with its outcomes
pre-written, so nothing in this category is waiting on a decision** — question 4's check came back on
3 September 2026 and settled every row but one, and question 2 is still waiting on a Ghost server,
which is a different thing and is named as such.

1. ~~**Which cards does A33 exclude in `card_assets`?**~~ **SETTLED BY THE OWNER, 1 September 2026.
   Three answers were given the same day and the third is the ruling**; all three are left visible,
   because a decision that moved twice in a day is one a reader should see move. **(i) All thirteen** —
   the treatment authoritative everywhere. **(ii) Only the cards A33 customises** — narrower, but it
   needed an invented boundary and `card_assets` is baked at theme build, so a list derived from what
   somebody edited cannot be computed there. **(iii) The ruling in force: replace the card CSS for all
   twelve — `nft` ignored — and always re-include Ghost's own `cards.min.js`**, so A33 owns the look
   and Ghost keeps the behaviour. **Conditional on one test with its fallback already written** — see
   *The selectors* and Check 3. Nothing about it is left to a builder's judgement.
2. **Does Ghost 6's caption stripping reach a card's `<figcaption>`?** The 2026-08-31 test covered the
   **feature-image** caption, where Ghost 6 removes `<em>` and `<strong>` and Ghost 5 does not.
   **A33's credit convention is the caption's trailing `<em>` run**, so if the same stripping applies
   inside a card, the credit disappears on one supported version and the Credit line control governs
   nothing there. Untested; nothing was changed on the strength of a guess. **The owner asked for the
   test on 1 September 2026.** It needs the same stored caption rendered on a Ghost 5 and a Ghost 6
   server — **not something a design pass can run**; whoever holds the staging sites owns it, and the
   answer decides whether the Credit line control ships.
   **OPEN — TEST COMMISSIONED, 1 September 2026**
3. ~~**Is the gallery-and-embed exclusion still the right call now that the class is known?**~~
   **SETTLED BY THE OWNER, 1 September 2026: the rule is kept and the reason is corrected.** Galleries
   and embeds still do not step up in 4 Wide and still do not bleed in 5 Full Bleed. **What changed is
   the sentence printed beside the control**: not "Ghost fixes their width and a theme may not override
   it" — the width class is on the figure and is reachable — but **"Ghost's script arranges a gallery's
   rows from the images' ratios, and a wider card would let it re-arrange into rows nobody has
   drawn."** No frame was redrawn and no value was added.
4. ~~**Two card classes are unverified and one card is undrawn.**~~ **CHECK RUN, 3 September 2026,
   AND SETTLED EXCEPT ONE ROW.** Read from Ghost's own card renderers on both supported versions:
   **`.kg-cta-card` confirmed**, **`.kg-callout-card` confirmed**, **`.kg-product-card` confirmed**
   with `kg-product-title`, `kg-product-image`, `kg-product-description-wrapper` and
   `kg-product-button-wrapper` inside it, and **`.kg-header-card` confirmed** with Ghost 6's shape
   written into the field list. **`.kg-email-card` does not exist**: the email card's renderer returns
   an empty container unless the render target is email, so on the web there is no element and no
   class — **the selector is deleted rather than corrected**. **`.kg-nft-card` is ruled by the owner
   to stay unstyled**, keeping Ghost's default appearance; that is a decision, not a gap.
   **What remains open is one row**: whether the confirmation of `.kg-callout-card` also covers the
   **eight non-accent colour variants** (pattern `.kg-callout-card-<colour>`). Nothing was promoted on
   a reading, so the variants stay marked and carry no rule alone.
   **OPEN FOR THE OWNER — the callout colour variants only, 3 September 2026**
5. ~~**Does the credit convention survive being written as a selector?**~~ **SETTLED BY THE OWNER,
   1 September 2026: the false positive is accepted, and the control says so.** `figcaption
   em:last-child` also matches an author's ordinary closing emphasis — a caption ending on an
   italicised film title renders as a credit. **The cost is small and visible** (grey text, second
   line, no data lost) and the alternative is a Ghost field this project cannot schedule. **The Credit
   line control's help text now states the rule in the editor's own terms**, so an author meets it
   before it surprises them.

---

## Component inventory — cumulative

**Established in A33 (eleven).** The public-preview marker is deleted: Ghost leaves no element there.

| Component | What it is | First from |
|---|---|---|
| Card plane vocabulary | The four grounds a Koenig card may sit on — none, panel, plane, band — and the rule that a treatment picks one for every card at once | A33·1–3, 6 |
| Caption and credit pair | 13.5 px caption in `text-muted` with the credit as the caption's trailing `<em>` run, inline or on its own 13 px line | A33·1 |
| Width resolution table | What Ghost's regular, wide and full resolve to, per treatment and per width | A33·1 |
| Bookmark card | One link: text column, publisher line with a 16 px icon, 168 px thumbnail right, thumbnail above at ≤ 767 | A33·1 |
| Toggle card | Ghost's container, `h4` heading and `button`, with a 44 px chevron target and a hairline divider between heading and body — **not disclosure markup** | A33·1 |
| File card | Title, description, mono `filename · size`, 44 px download glyph right | A33·1 |
| Product card | Image, title, description, five-star rating — **Ghost gives it no text equivalent** — one action | A33·1 |
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
inv preview deleted| GIF badge | The image card with a 9.5 px mono GIF badge inset 10 px from its top-left corner | A33·1 |
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
| Missing-image rule | A missing photograph reflows, plates or draws Ground; never a grey box and never a hand-off ⚑ *corrected 1 September 2026* | A19 |
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


---

## Patch notes — Koenig card treatments patch pass, 28 August 2026

Every change made in this pass, with the rule or the Ghost fact that required it. **No design was
renumbered.** The category's numbers are 1, 2, 3, 4, 5, 6 — unchanged, with no gaps and none closed.

### The toggle card, redrawn against Ghost's actual markup

- **Ghost's toggle is not native disclosure markup.** It is a plain container holding a heading and a
  button. All six frames redraw the card that way: the heading is an `h4` and the chevron is a
  44 px button, which is the only target and the only focus stop. The claim that the card *avoids
  heading levels* is **deleted** everywhere it appeared — the heading level is Ghost's and a
  stylesheet cannot change it.
- **The no-JavaScript line changed with it.** `accordion`'s quoted degradation ("native details —
  fully functional") is false here, so the quote is dropped and the honest line is written in its
  place: **with JavaScript off the toggle cannot open**. The counts move with it — **fourteen of the
  twenty cards are identical with JavaScript off, six depend on a script**, and every one of those
  scripts is Ghost's or the provider's. Finding 5 is rewritten around this.
- Required by: the Ghost fact that **inside a blog post's body we own the stylesheet and nothing else**.

### The public-preview marker, deleted

- Ghost leaves **only an invisible HTML comment** at the paywall cut. There is no element to style, so
  the drawn marker is gone from every frame and the **Public-preview marker component is deleted from
  the inventory** (established components: eleven, not twelve). The card roll keeps position 09 and
  draws the absence, so a user can see that nothing renders. The field-list row now reads *no element
  at all*.
- Required by: the same Ghost fact.

### The HTML card

- It **emits no wrapper element**, so it leaves the target list of **1 Plain's Rules control** (five
  cards now: bookmark, toggle, audio, file, product) and of **6 Contrast Band's inversion** (it is
  drawn on the page ground, with no band). Both control help texts say why. The card's own note on
  every frame now opens with *no wrapper element*.
- **Closed by the owner, 28 August 2026:** they cannot reach it either. **The HTML card now renders on
  the page ground in all six treatments** — no panel in 2 Card, no plane in 3 Panel, no rule in
  1 Plain, no band in 6 Contrast Band. In 3 Panel it sits in the content column (720 · 690 · 302)
  rather than on the 1,040 plane. All five placements in each of those two frames were redrawn.

### Galleries and embeds lose the bleed

- **5 Full Bleed** now offers **Images (default) · Images and video** — two values, with the reason on
  the control: Ghost fixes the width of a gallery and of an embed and a theme may not override it. The
  descriptor changes from *the five media cards* to **image, GIF and video**.
- Fewer choices on a control, with the reason stated, is what the rule that **a design may offer fewer
  choices on a shared control, and must say why** requires. The control is not renamed and no value is
  added.
- **The default carries down rather than sideways.** The old default was *Images and galleries*;
  galleries can no longer bleed, so the surviving part of that default is **Images**.
- **Closed by the owner, 28 August 2026:** the same fact removes them from **4 Wide** as well. *What
  steps up* drops to **Images · Images and video** (default Images and video, being everything that
  can move), the frame's tally paragraph is recounted to *three cards move and seventeen do not*, and
  the help text names the two exclusions: the bookmark's thumbnail, which is furniture, and the
  product card's photograph, which moves only with its copy card.

### The Contrast Band's inversion list

- **Signup, call to action and header leave it.** They carry the post author's own inline colours,
  which a theme may not override. All six placements of each are redrawn: **the band runs behind them
  and their surface stays as the author set it**, with a note saying so. The third value, *Copy cards
  and the header*, is therefore gone — **Callout only · Every copy card**, two values, reason stated.
- The help line names **seven** card types instead of ten (callout, toggle, bookmark, button, product,
  file, audio) and says why signup, the call to action, the header and the HTML card are not on it.
- The tally paragraph is recounted: **seven take the band, eight never do, five have nothing the band
  could reach.**
- Required by: the Ghost fact about the author's inline colours, and the rule that **a design may offer
  fewer choices on a shared control, and must say why**.

### Translatable strings

- **The claim that this category controls any translatable strings is deleted.** The five strings it
  named live inside Ghost's own renderer, and no theme can reach them.

### The product card's rating

- Recorded as a **Ghost limitation**: Ghost renders the stars with **no text equivalent** and a theme
  cannot add one. The invented "4 out of 5" text is gone from all six frames and from the accessibility
  notes; the inventory row and the field list say the same. Finding 10.

### Applying the library-wide rules to this category

- **The two free designs are the owner's choice — ask him.** Asked, and answered on 28 August 2026:
  the line **[Free] designs:** 1 Plain · 4 Wide is present in the roster, on its own line, in the
  required shape. The shortlist put to him was 1 Plain, 2 Card, 3 Panel and 4 Wide.
- **No design ever turns into another design.** Five phrases were deleted: *Not at all makes this
  treatment 1 Plain*, *a post with no media cards renders as 1 Plain*, *at 834 this treatment is
  1 Plain*, *at Content 1296 this treatment is 1 Plain*, *an author who marks no card full sees
  1 Plain*, and *at ≤ 1023 the treatment reads as 2 Card without a shadow*. Each now says what the
  treatment renders when the thing it is for is absent — the treatment stays in force and the effect
  is simply not there.
- **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript.** All six control
  panels carry the note: Ghost's signup and call-to-action cards do not render when the connected site
  cannot accept sign-ups, and with JavaScript off the signup form cannot submit.
- **The no-JavaScript notice.** **CONFLICT, recorded not resolved** ⚑, and the reason restated after
  the owner's challenge of 28 August 2026. Ghost's members form carries **no `action`**: the
  `data-members-form` attribute hands the submit event to Ghost's own script, and that script writes
  the `loading`, `success` and `error` classes and fills `data-members-error`. **The CSS in Ghost's
  theme documentation styles those states; it does not create them** — so with JavaScript off,
  pressing Subscribe does nothing at all. The rule asks for a designed notice in place of the form;
  inside a post body A33 owns the stylesheet and not the markup and cannot replace Ghost's card with
  anything. The panel states the fact in words; the notice itself has to belong to Ghost's card or to
  a category that places its own markup.
- **Avatars, the Remove button, slider labels, gap names, item counts, the "Base" swatch row and
  "Inherit"** — none appear in this category. A33 has no repeating list with a minimum, no slider, no
  gap control, no item count, no colour swatch row and no Inherit value. Checked, nothing to change.
- **No behaviour module was coined.** The category still declares `accordion` and `core`, so there is
  no *ARCHITECT: registry addition* here — only the corrected note that `accordion`'s degradation does
  not describe Ghost's markup.

### What did not change

The visual language, type scale, colour packs and spacing system; the article measure and the width
ladders; the sent, error and loading states on member forms; the six control counts (seven rows
including the callout mapping); every design not named above; and **the numbering**.

### Confirmations

The four questions this pass raised were put to the owner and all four are answered: the free designs
are **1 Plain · 4 Wide**; galleries and embeds leave **4 Wide's** step-up list as well as the bleed;
the HTML card leaves **2 Card's panel** and **3 Panel's plane**; and the no-JavaScript notice stays a
recorded conflict, with its reason corrected against Ghost's own documentation.

- **Design numbering is unchanged:** 1 Plain · 2 Card · 3 Panel · 4 Wide · 5 Full Bleed · 6 Contrast
  Band. Six designs, numbers 1–6, nothing renumbered, no gap closed or created.
- **The `**[Free] designs:**` line is present**, on its own line in the roster, in the required shape,
  and names two designs that exist: **1 Plain** and **4 Wide** — the owner's choice.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** six treatments, numbered **1–6**.

---

## Patch notes — selector pass, 1 September 2026

Every change this pass made, with the rule **name** or the Ghost fact that required it. **No design
was renumbered, no frame was redesigned, and no control gained, lost or renamed a value.**

### The category's selectors — the one item on the work list

- **The class name is now beside every card in the shared field list.** A new *Ghost class* column
  carries `.kg-image-card`, `.kg-gallery-card`, `.kg-bookmark-card`, `.kg-callout-card`,
  `.kg-toggle-card`, `.kg-button-card`, `.kg-embed-card`, `.kg-product-card`, `.kg-file-card`,
  `.kg-header-card`, `.kg-audio-card`, `.kg-video-card`, `.kg-signup-card`, and **none** for
  markdown, HTML and the public-preview cut, and a bare `hr` for the divider. **The GIF card is the
  image card's class**, which is why it follows every image rule.
- **A new section, "The selectors — what A33 actually styles",** sits in the category layer: the width
  classes, the state hooks a stylesheet may read, the two selector traps, and the `card_assets` build
  fact. **Every treatment's Controls table is followed by a *Selects* line** naming exactly what that
  treatment's own controls reach.
- **The width classes the Card widths row depends on are named:** `.kg-width-wide` and
  `.kg-width-full`, with **regular carrying no width class** on an image, gallery or embed figure and
  `.kg-width-regular` documented on the **signup card only**. The read-only row itself now says so.
- **Where we are not certain, the specification says so rather than guessing** — the call-to-action
  and email-content classes, the eight non-accent callout variants, the product card's inner classes
  and Ghost 6's header card are each marked unverified and none carries a rule alone. Required by the
  work list's own instruction that **a wrong selector silently styles nothing**.
- Required throughout by the standing fact that **inside a blog post's body we own the stylesheet and
  nothing else** — not the markup, not the ARIA attributes, not the text. **Nothing added here assumes
  markup A33 would have to emit.**

### The five rules of this pass

- **A control switched off by another is greyed, with the reason beside it** — **two cases, both
  already drawn that way** (5 Full Bleed's caption-over-the-image, 6 Contrast Band's accent action).
  Each keeps its failing ratio as a sentence at the control. Nothing was hidden; nothing was left
  accepting a value it would not honour. **No change was needed and none was made.**
- **Avatars with no photograph show initials** — **no subject.** A33 draws no avatar.
- **The Remove button never greys out** — **no subject in the sidebar.** The gallery's Remove is
  Ghost's, on the canvas.
- **A count that picks between drawn layouts is a named set, not a number picker** — **already true
  everywhere**; A33 holds no number picker at all. Nothing converted in either direction.
- **A design may declare the width below which its script runs** — **no design declares one**, because
  A33 runs no script of its own. Recorded in the new rules block so the absence is not read as a miss.

### The two Ghost findings of 2026-08-31

- **The feature-image caption.** A33 renders no feature image, so there is no direct subject — but the
  category's **credit convention is a caption's trailing `<em>` run**, so the finding is written into
  the specification as a stated version risk and into the frames on the Credit line control.
  **Whether the stripping reaches a card's `<figcaption>` is untested and is Open question 2, not a
  decision.**
- **The comment count.** **No subject** — no A33 design reads one. Recorded so the omission is not
  read as a miss.

### Housekeeping — the "Open questions" section

- **This category has no "Open questions" section and never had one.** The work list assumes one. The
  housekeeping was applied to the nearest list that exists, **Findings for the architect**: all eleven
  are now marked item by item — six struck through with who settled them, **three carrying OPEN FOR
  THE OWNER on their own line** (findings 2, 3 and 5), and two recorded as facts with no decision
  outstanding. **Nothing was answered in the housekeeping.**
- **A new "Open questions" section was then created** for the five questions the selector work raised.
  Each carries **OPEN FOR THE OWNER** on its own line. None is answered here.

### Frames

- **All six treatment frames gain a *selectors* section** — this treatment's controls and what they
  select, the width classes with this treatment's own resolution, and the unverified list.
- **The width-resolution labels now carry the class**: *REGULAR · NO WIDTH CLASS ON THE FIGURE*,
  *WIDE · .kg-width-wide*, *FULL · .kg-width-full*. The Card widths read-only row names them too.
- **The category proof gains a *selector list* section** — all twenty cards, their card class, their
  inner classes and state hooks, and a source column marking each row verified or **UNVERIFIED ⚑**.
- **Nothing else on any frame was touched**: no card was redrawn, no panel changed a control, no
  number moved.

### Left alone deliberately, and why

- **`_build/a33*.js` was not run and not edited.** The generators predate the 28 August patch pass —
  they still build seven findings, a twelve-item inventory, a public-preview marker and a
  `details`/`summary` toggle. **Re-exporting from them would revert that pass**, so every change above
  was made in the `.dc.html` files directly. The generators are now stale by two passes and that is
  recorded rather than fixed.
- **The proof frame's shared-field-list table predates the 28 August pass on two rows** (the gallery's
  fixed width, the public-preview row still reading *marker*). It was **left as it is**: correcting it
  is not on this work list, and the specification's own rule is that where the file and a drawn panel
  disagree the panel is the authority.
- **No printed count of the library's designs was added or changed.** The counts this document holds —
  six treatments, twenty cards, fifty-nine fields — are this category's own roster and inventory, not
  product copy, and none of them is a total of the library.
- **P0's per-prop mark allowlist is not referenced or altered here.**

### Confirmations

- **Design numbering is unchanged:** **1 Plain · 2 Card · 3 Panel · 4 Wide · 5 Full Bleed ·
  6 Contrast Band.** Six treatments, numbers 1–6, no gap opened or closed, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line in the roster, in the required shape,
  and names two treatments that exist: **1 Plain** and **4 Wide**.

### Developer handoff — the three checks this pass could not run, and what to do with each answer

**These are tasks, not questions.** Each one needs a running Ghost or Ghost's own source, neither of
which a design pass can reach. **Run the check, then edit this specification and the frames as the
outcome dictates** — the edits are named per outcome so nobody has to interpret them.

**The standing rules for every one of these edits.** Do not renumber a design. Do not remove a ⚑ flag
without the evidence that retires it. Keep the **`**[Free] designs:**`** line as it stands. Add a
dated bullet to **Patch notes** naming the check and what it changed. **If an answer contradicts a
ruling recorded here, write the conflict down rather than choosing** — that is the house rule this
whole document is built on.

**CHECK 1 · Does Ghost 6 strip `<em>` from a *card's* caption?** (Open question 2.)
Store one image card whose caption ends in an italic run — "The fence at Kwajalein. *Ida Brandt for
Orbit Weekly*" — on a **Ghost 5** site and a **Ghost 6** site, same stored text, same theme. View the
published post's HTML on both and record whether the `<em>` survives inside the card's
`<figcaption>`.
- **If it survives on both:** retire Open question 2 as settled, strike it through with the date and
  the version pair tested, and delete the version-risk sentence from *The two Ghost findings of
  2026-08-31*. The Credit line control is unchanged.
- **If Ghost 6 strips it:** the **Credit line control governs nothing on Ghost 6**. Do not delete the
  control and do not invent a replacement field. Write the version gate into the control's Values cell
  in all six Controls tables — the pattern the library already uses for a version-gated row — and add
  the sentence to each frame's Credit line help text. **Then raise it as a new open question**: whether
  the credit convention survives as a feature at all, which is the owner's call and not the build's.

**CHECK 2 · Confirm the five unverified selectors, and one card we never drew.** **RUN, 3 September
2026 — this check is closed except for one row**, and what came back is applied in *The selectors*,
the shared field list, the proof frame's selector list and all six treatment frames.
- **Confirmed against the renderers on both supported versions:** `.kg-cta-card`, `.kg-callout-card`,
  `.kg-product-card` (inner: `kg-product-title`, `kg-product-image`,
  `kg-product-description-wrapper`, `kg-product-button-wrapper`) and `.kg-header-card` (Ghost 6's
  shape as listed in the field list). The unverified marks are dropped and each carries a rule.
- **`.kg-email-card` does not exist and the fix was deletion, not correction** — the renderer emits an
  empty container off the email target, so nothing on the web ever carried the class.
- **`.kg-nft-card`:** ruled by the owner to stay unstyled and keep Ghost's default appearance. Do not
  draw one, and do not raise it again as a gap.
- **Still to confirm, and the only thing left of this check:** the **eight non-accent callout colour
  variants** (pattern `.kg-callout-card-<colour>`). **Where confirmed:** drop the unverified mark from
  that row of the field list and the proof's selector list; **where wrong:** correct the pattern in
  both, in each treatment's *Selects* line, and add the correction to Patch notes.
- **Ghost 5's second renderer is not part of this check any more**: the owner ruled on 3 September
  2026 that the treatments target the current renderer only, and it is written into *The selectors* as
  a stated limitation.

**CHECK 3 · Does an exclusion take Ghost's card JavaScript with it?** (Open question 1's condition —
**do this one first**, because the ruling's branch depends on it and nothing else in the handoff does.)

**The test, and it is ten minutes.** On a test site, exclude one script-driven card —
`"card_assets": {"exclude": ["toggle"]}` — then add Ghost's own bundle back by hand in the theme's
template: `<script src="/public/cards.min.js"></script>`. Publish a post with a toggle card and
**click it**.
- **The toggle opens** → the served bundle is the full set and **the preferred branch is live**:
  exclude the twelve cards (`nft` ignored) and keep the hand-written script tag. Then do two things
  the ruling names: **record the exact asset path and its version hash** in the theme's documentation
  under a heading a buyer will find after a Ghost upgrade, and **confirm the same test on every
  supported Ghost version**, since the path is Ghost's internal one and is not a public contract.
- **The toggle does not open** → the bundle is filtered by the config and **the fallback branch is
  live**: exclude only bookmark, button, callout, file, header, product and blockquote; leave toggle,
  gallery, audio, video and signup on Ghost's assets and style them with a deeper selector.
  **Confirm each of the five still works after the theme's CSS lands**, and where a Ghost default
  cannot be beaten by specificity alone, **report it rather than reaching for `!important`**.

**Either way, write the resulting list into this specification** as a table in *The selectors*, strike
the branch that lost, and add a dated bullet to Patch notes naming the Ghost versions tested. **Do not
add or remove a card from the list on judgement** — the two branches are exhaustive and the test picks
between them.

### Owner's rulings of 1 September 2026, applied

All five open questions were put to the owner the day they were raised.

- **Question 1 · `card_assets`** — three answers the same day, **and the third is the ruling: replace
  Ghost's card CSS for all twelve excludable cards (`nft` ignored by instruction) and always
  re-include Ghost's own `cards.min.js`.** A33 owns the look; Ghost keeps the behaviour; there is no
  seam and no derived list. **Conditional on Check 3's bundle test, whose fallback — seven excluded,
  five layered — is written out rather than left open**, and **the invented boundary the second answer
  needed is deleted**, since the test is observable and the branches are exhaustive. Applied in the
  specification and on all six treatment frames and the proof.
- **Question 2 · the Ghost 6 caption stripping** — **test it.** Commissioned, not answered here: it
  needs the same stored caption on a Ghost 5 and a Ghost 6 server, which no design pass can run.
  Marked **OPEN — TEST COMMISSIONED**.
- **Question 3 · galleries and embeds** — **keep the rule, correct the reason.** Applied: the exclusion
  is unchanged in 4 Wide and 5 Full Bleed; the printed reason is now Ghost's row-ratio script rather
  than a width a theme "may not override". Finding 11, the field list's gallery and embed rows and
  5 Full Bleed's descriptor were corrected to match. **No frame was redrawn.**
- **Question 4 · the unverified classes** — **check against a live server and Ghost's own source.**
  Commissioned. Neither a Ghost server nor github.com is reachable from this environment, so the
  unverified rows stay marked and nothing was filled in on a guess. Marked **OPEN — CHECK
  COMMISSIONED**.
- **Question 5 · the credit false positive** — **accepted.** The Credit line control's help text now
  states it in the editor's own terms, in the specification and on all six treatment panels.

Required by: the rule that **where a ruling cannot be applied without inventing a decision, it is
written as an open question rather than guessed** — which is why questions 2 and 4 are recorded as
commissioned checks rather than closed.
- **Question 1, second ruling, same day.** Recorded as superseding rather than replacing: the first
  answer stays visible in Open question 1 with the revision beside it, because a ruling that changed
  within a day is exactly the kind a reader needs to see twice.
- **Question 1, third and final ruling, same day.** Applied in full. **The two-branch form is
  deliberate**: the branch is chosen by a ten-minute observable test rather than by a builder's reading
  of a specification, which is the only way a conditional ruling can be handed over without becoming an
  open question again.
- **Checked and left alone: `C Post Body`.** Its line that Ghost ships CSS for thirteen of the
  twenty-two cards is still true — the ruling changes what *this theme* excludes, not what Ghost
  ships — so C.1 was not edited. Recorded so nobody hunts for a change that should not exist.

---

## Patch notes — pass five, 3 September 2026

Every change this pass made, with the rule **name** or the Ghost fact that required it. **No design
was renumbered, no frame was redesigned, and no control gained, lost or renamed a value.**

### The selectors

- **Four selectors drop their unverified mark, and each now records what it was checked against** —
  `.kg-cta-card`, `.kg-callout-card`, `.kg-product-card` (inner: `kg-product-title`,
  `kg-product-image`, `kg-product-description-wrapper`, `kg-product-button-wrapper`) and
  `.kg-header-card` (Ghost 6's shape written out in full in the shared field list). Read from Ghost's
  own card renderers on both supported versions. Required by **"do not remove a ⚑ flag without the
  evidence that retires it"**, which is also why each row names the renderers rather than the
  documentation.
- **The `.kg-email-card` selector is deleted rather than corrected.** The email card's renderer
  returns an empty container unless the render target is email, so on the web it produces no element
  and no class — the rule matched nothing, ever. Required by **"a wrong selector styles nothing and
  fails silently"**: a selector that can never match is that failure in its purest form. **The card is
  still drawn dashed in every roll**; the field list's Ghost class cell now reads **none**, and the
  proof frame's selector row reads *no element*.
- **The treatments target Ghost's current card renderer only, written as a stated limitation in
  customer-facing words** — "a post written before Ghost 5's current editor keeps Ghost's own default
  card styling: readable, just not carrying the chosen treatment." The reason is recorded beside it: a
  second selector set would roughly double this category's stylesheet and its testing permanently, and
  the header card would need genuinely different rules rather than a second selector, because the
  older markup lacks the structure the treatments rely on; Ghost 5 is end-of-life, so the affected
  posts are a shrinking set. Required by the owner's ruling of 3 September 2026 and by
  **"where a ruling can be applied, it is applied rather than left as a question."**
- **`.kg-nft-card` is recorded as a decision, not a gap** — it stays unstyled and keeps Ghost's default
  appearance. Written into *The selectors*, the `card_assets` ruling paragraph and the proof frame's
  selector list, so no later pass raises it as an oversight.
- **Open question 4 and developer-handoff Check 2 are marked run and closed except one row**; the
  Open questions preamble now reads four settled, one commissioned.

### The rest of the specification

- **The roster is unchanged** — six treatments, the same tuples, the same six controls each, the same
  `accordion` + `core` module list, and the **[Free]** pair untouched. No extra item was added to this
  category: the work list names none.
- **The control lists are unchanged.** Nothing this pass touched is a control: the selectors are the
  stylesheet's, not the panel's. 1 Plain's *Tinted cards* **Selects** line no longer calls the
  call-to-action class unverified, which is a wording consequence of the confirmation and not a change
  of value.
- **The data fields changed in two cells only** — email content's Ghost class (now **none**) and the
  call-to-action's (now unflagged) — plus the product and header notes carrying their confirmed inner
  classes. **Fifty-nine authored fields and eight scraped or derived ones**, unchanged.
- **The no-JavaScript line is unchanged in all six designs**, and so is the behaviour each design
  declares (`accordion`, `core`). Nothing on this work list touches a script, a state hook or a
  degradation: the toggle still cannot open with JavaScript off, for the reason already written.

### Frames

- **All six treatment frames**: the *where we are not certain* panel is rewritten as confirmed /
  deleted / still open, gains the current-renderer-only limitation and the NFT decision, and the
  *no class at all* line now names the email card. Each frame gains a **pass five patch** block naming
  what changed, the rule that required it, what was left alone and why.
- **The category proof**: the selector list's email row becomes *no element*, the call-to-action,
  product and header rows are marked confirmed with their source, the callout row splits into
  *card confirmed / variants unverified*, the "Not A33's" row records the NFT ruling, and the frame
  gains the same pass five patch block.
- **Nothing else on any frame was touched**: no card was redrawn, no panel changed a control, no
  number moved.

### Left alone deliberately, and why

- **`_build/a33*.js` was neither run nor edited.** The generators predate two passes; re-exporting
  from them would revert both. Every change above was made in the `.dc.html` files directly. Recorded
  rather than fixed, as in the previous pass.
- **No design total appears in any copy this pass authored** — not a stale one, not a corrected one.
  The counts in this document (six treatments, twenty cards, fifty-nine fields) are this category's own
  roster and inventory, not a library total.
- **P0's per-prop mark allowlist and the marketing and app screens' wording were not touched**; they
  are maintained outside this project and no project copy of them was assumed.
- **The proof frame's shared-field-list table still predates the 28 August pass on two rows** (the
  gallery's fixed width, the public-preview row reading *marker*). Left as found: correcting it is not
  on this work list, and where the file and a drawn panel disagree the panel is the authority.

### Open for the owner

- **OPEN FOR THE OWNER · the eight callout colour variants.** *What I needed to know:* whether
  confirming `kg-callout-card` also confirms the variant classes `.kg-callout-card-<colour>` beyond
  the documented `.kg-callout-card-accent`, since those — not the card class — are what this
  specification had marked unverified. *What I did instead:* left the variant row marked and carrying
  no rule of its own, and recorded the card class as confirmed. Required by
  **"where a ruling cannot be applied without inventing a decision, it is written as an open question
  rather than guessed."**
- **OPEN FOR THE OWNER · the count of unverified selectors.** *What I needed to know:* which sixth
  selector the work list means; this specification carries **five** unverified items (call to action,
  email content, the callout colour variants, the product card's inner classes, Ghost 6's header
  card), and the work list says six. *What I did instead:* applied the work list to the five that
  exist and changed nothing else.
- **OPEN FOR THE OWNER · Ghost 6's header card and the twelve-variant table.** *What I needed to
  know:* whether the confirmed Ghost 6 class set — which names `kg-size-large`, `kg-style-accent` and
  `kg-style-image` but not the whole `kg-size-small|medium` / `kg-style-dark|light` family — still
  supports C.1's "three sizes × four styles = twelve variants the theme owes." *What I did instead:*
  recorded the confirmed class list beside that line and left the twelve-variant claim exactly as
  found.
- **OPEN FOR THE OWNER · Image focus.** *What I needed to know:* whether this category is expected to
  cite P0·9. The pass preamble says A33 still holds a private copy of the control; **it holds no copy
  and no control** — the category declines Image focus with a reason (media never crops here, and the
  image is Ghost's field), and it writes out no values, so there was nothing to converge under
  **"one control name means one set of values."** *What I did instead:* left the declination as found,
  in both the reconciliation floor and rule 7 of the findings.

### Confirmations

- **Design numbering is unchanged:** **1 Plain · 2 Card · 3 Panel · 4 Wide · 5 Full Bleed ·
  6 Contrast Band.** Six treatments, numbers 1–6, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line in the roster, in the required shape,
  and names two treatments that exist: **1 Plain** and **4 Wide**.
