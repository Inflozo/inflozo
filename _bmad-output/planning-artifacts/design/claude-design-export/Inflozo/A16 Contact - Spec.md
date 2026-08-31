# A16 Contact — written specification

15 designs · Paper pack · drawn 23 August 2026 · controls-reconciliation patch 24 August 2026 ·
**design patch pass 30 August 2026**

The frames are `A16-0 Category Proof.dc.html` and `A16-1` … `A16-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation patch (this document's current state), 24 August 2026.** The category was
audited, design by design, against the PRD's control vocabulary and Ghost's verified data surface,
thinking like an end user editing their own site. It reuses the shared editor primitives designed in
**P0 · Editor primitives** — the P0·1 inline text toolbar and its link popover, the P0·2 icon slot
and Icon Picker, the P0·3 item list, the P0·4 member-aware action editor, the P0·5 "Populate from…"
data panel and the P0·6 editor state switcher — and **never redesigns them**. **No section layout was
redrawn**: what changed is the fifteen control panels, the delivery group, the item lists, the
editing, behaviour and data statements, three retired rows, one retired enum, five new controls, two
new per-item fields and one new state. **Three facts of the category are amended, once each** ⚑ —
**the `mailto:` form post does not work and never did**, **there is no site address to fall back
to**, and **`member-form` is not merely misnamed but points at the wrong endpoint**. The
category-wide list is on `A16-0 Category Proof` and the frame-by-frame list is in **Reconciliation
notes** at the foot.


The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(3 Card in three packs, light and dark), the stress frame, the roster, the component inventory, the
findings and the four settlements in full. The shared field list is repeated below because the build
reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A29 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A16 is

**A section that gives a reader a way to reach the publication.** It sits on a page route — a
contact page, an about page, the foot of a home page — and it is the second category in the library
whose primary element is an input. It is the first whose submission **Ghost cannot receive**, and
that single fact shapes the whole category: the default destination, the delivery group, the failed
state and the existence of five designs that draw no form at all.

Two neighbours own adjacent ground and A16 does not repeat them. **A3·10 Contact Block** is four
labelled contact fields inside a footer — A16 owns the case where contact *is* the section, and it
carries A3·10's block verbatim rather than redrawing it. **A22 Newsletter** is the email-capture
form — A16 owns the message, not the subscription. **A9 FAQ** owns questions, and A16 refuses to
draw a second question list at any value; 14 Reasons names A9 as the section to place above A16
when a publication wants to reduce the mail rather than promise about it.

A16 inherits **A3·10's contact block and its fixed order**; **A3·1's social list, its picker and its
six-entry ceiling**; **A6·11's `reasons[]` and its repeater**; **A9·15's ledger row**; **A17's
content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132); **A17·7's
on-contrast derivation**; **A19·3's surface card**; **A26·3 and A27·4's surface plane and their call
that a full-width fill is a ground rather than a containment**; **A20·13's warm scrim**; **A19's
missing-image vocabulary**; **A2·5's suppressed focus ring on a field**; **A1's eyebrow, primary
button and icon button**. **A16 adds ten components and nothing else** — they are listed at the
foot.

### The four settlements (§8 of the brief)

**1 · The field set, and what is ever required.** Three fields are the core — name, email, message —
with subject and phone the two that may join them. **The set is a control with four values and never
a field builder** ⚑: *Email and message* · *Name, email, message* (default) · *Name, email, subject,
message* · *Name, email, phone, subject, message*. **Email and message are required at every value**
⚑. **Name is required when drawn** and can be made optional; **subject and phone are never required**
⚑. A per-field editor was refused ⚑ — it is a form builder, it is a different product, and it would
make every design's collapse rule, empty state and tab order unwritable.

**2 · Validation, submitting, success and error.** **Eight states, not four** ⚑ — empty, focus,
invalid, submitting, **sent**, **failed**, **no destination** and, added by the controls patch, **no
script** ⚑. The last three are A16's own: A22 needed none of them, because Ghost's endpoint is
Ghost's and cannot be misconfigured by a theme. **Checked on blur and on submit, never per
keystroke** ⚑. **The message sits under the field it belongs to, not in a banner** ⚑, and **the
first invalid field takes focus on submit** ⚑. **No red anywhere** — the seven roles contain no
error colour, so invalid is a 1.5 px `text` border and a 13 px / 500 line. **Sent replaces the form
in place and the section shrinks** ⚑ — A16's one departure from A22's hold-the-height rule, because a
five-field form is 520 px and its confirmation is 96, and reserving 424 px on every page that never
sends costs more than the reflow. **Failed keeps everything typed** ⚑ and offers the `mailto:` as
the way out. **No destination is editor-only and the section cannot publish** ⚑ — the patch withdrew
the promised fallback, because Ghost exposes no site address to a theme. **The four state strings —
`sentHeading`, `sentText`, `invalidText`, `failedText` — are written on canvas through the P0·6
editor state switcher** (Empty · Invalid · Sent · Failed), never in a sidebar and never behind a
Preview control ⚑. **No script is the eighth state**: at *An email address* with JavaScript off the
fields stay, a visible "Email us at hello@…" `mailto:` line sits under them, and **the submit button
is not rendered** ⚑ — a button that cannot post is worse than no button.


**3 · Can Ghost receive the submission? No.** **Ghost's theme layer has no form handler** ⚑ — no
route, no endpoint, no storage. `/members/api/send-magic-link/` accepts an email address and nothing
else, and comments belong to a post. So every A16 form goes either to **an email address** — the
default ⚑, because it needs nothing set up — or to **a form service** whose endpoint URL the user
pastes.

**The controls patch settles how the first of those actually works** ⚑. `<form method="post"
action="mailto:…">` **does not work**: browsers answer it with a blank draft, or with nothing at all.
So at *An email address* **the script composes a `mailto:` URL out of the fields and opens the
reader's mail app**, and **the no-script state is a visible "Email us at hello@…" line under the
fields with the submit button not rendered** ⚑ — never a form that looks posted and was not. At *A
form service* the native POST claim stands unchanged: a real `<form action method="post">`, and the
service's own page answers ⚑. Only submitting, the in-place sent state and the failed banner need
script on either path.

**The module named for this was wrong, and the patch says so plainly.** The ten form designs declared
`member-form`, which **posts to Ghost's members endpoint** — not a mail app and not a form service.
The category asks for **`contact-form`: ARCHITECT, registry addition** ⚑, and **coins no other
name**. **13 Directory needs none of it**, and the panels offer it as the fallback A16 always has.


**4 · The details beside the form, and 390.** **A3·10's contact block is carried, and the patch
makes it legible**: four rows in a fixed order — post, email, phone, replies — with **one toggle a
row** in place of a three-value enum ⚑, and still no Add, no Remove and no reorder. It is drawn in 1,
4, 6 and 12; **5 draws three of the four at its defaults, and its Replies toggle is what finally
draws `replyHours`** ⚑, which was stored and never rendered. **Each row carries an optional icon
slot** from the P0·2 Icon Picker — defaults mail · phone · pin · clock, **Hide by default** ⚑.
**Below 1,081 the details go beneath the form** ⚑ in every two-column design, **with two stated
exceptions**: **7 Map Split puts the map above** ⚑ — a map below a five-field form is a map nobody sees — and **14 Reasons puts its lines
above** ⚑, because a promise read after pressing send is not a promise. **A16's splits collapse at
1,080, not 767** ⚑, one breakpoint earlier than the archetype's ladder, because a form column below
480 px is a form nobody finishes and 754 cannot hold 480 plus a gutter plus a details column.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The labelled field.** 13 px / 500 label in `text`, 8 px above a 46 px field at the pack radius,
  1 px hairline border, 15 px text. **The label is `text`, not `text-muted`** ⚑ — a field label is
  not meta. **The field is always a step away from the plane it sits on** ⚑ — lighter in light,
  darker in dark. **20 px between one field and the next**, 16 px inside a paired row.
- **The message field.** The same label over a box of **96 · 144 · 216 px** — *Short 3 lines ·
  Medium 5 · Tall 8*. **The only field whose height is a control** ⚑.
- **The stacked form.** **At ≤ 767 every field is full width at 48 px, 16 px apart, the button goes
  full width, and the field text goes 15 → 16 px so iOS does not zoom the page on focus** ⚑ (A22's
  rule, carried verbatim). This is the same geometry in all ten form designs.
- **The seam.** A16 draws its own padding — **now the universal Vertical spacing row** ⚑: **64 · 96 ·
  132** at 1440, **80** at 834, **64** at 390 —
  A17's ladder. **5, 8, 9, 11 and 15 have no padding of their own** — the band, the ground, the
  strip and the image carry it ⚑. A16 assumes page sections above and below it and **cannot know
  what they are** ⚑ — the same route-awareness gap A21, A22 and A26–A29 each raised.
- **The measures.** A17's content box, unchanged. The head's measure is **720**; the blurb is
  clamped at **560** on the page and **520** over an image ⚑. **The form is 640 wherever it stands
  in a column of its own** and 560 where it is centred; **a form is never wider than 640** ⚑, at any
  container width, in any design.
- **The type.** Eyebrow 13 uppercase tracked .08em · section heading 40 · 34 · 28 by width · blurb
  17, 16 at 390 · field label 13 · field text 15, 16 at 390 · consent 13 · **64, 76 and 96 in 10 Big
  Type, the category's only display ladder** ⚑.
- **One display moment.** 10 Big Type spends it on the address and **therefore draws no heading at
  any value** ⚑. 15 Cover spends it on the photograph and fixes its field set at two ⚑. No other
  design has type above 40.
- **Accent, once or twice.** The button, in eight designs. **Twice in 11 Enquiry Types** (the
  selected radio and the button) ⚑, which is the category's ceiling and is stated on its panel.
  **None at all in 5 Contrast Band and 15 Cover** ⚑, where the button takes the carried colour on
  A29·3's finding that accent measures 4.0:1 on the band. **None in 6, 8, 9, 10 and 13**, which draw
  no action at all.
- **Targets.** Fields and buttons are **46 px, or 48 stacked**; every other interactive element is
  **44 px** ⚑. **The whole radio row is the target in 11** ⚑. **The whole location card is not a
  link in 8** ⚑ — only "Directions" is, so the address stays selectable.
- **Headings.** **The section heading is an `h2`** ⚑ — A16 is never the route's head. **Three
  exceptions, each stated on its frame:** **9 Slim Bar has no heading at all** and takes
  `<section aria-label="Contact">` ⚑; **10 Big Type has none at any value** ⚑, including at *Above
  the address: Heading*, which is a styled `<p>`; and **7 Map Split's location name and 8's card
  names are `h3`** under the section's `h2`.
- **Invalid.** **No red anywhere** ⚑. The message sits directly under its own field at 13 px / 500
  in `text`; the field border goes to 1.5 px `text`. **Checked on blur and on submit** ⚑. On
  `contrast` and over an image the substitution is the carried colour, not the accent ⚑.
- **Focus.** **The library's 4 px accent ring is suppressed on fields** ⚑ — A2·5's documented
  departure, repeated so every form in the library behaves identically — and the field takes a 1.5 px
  accent border instead. **The button keeps the ring.** On `contrast` and over an image, both take
  the carried colour.
- **Sent.** Fields, button and consent line are replaced in place by the confirmation, **and the
  section shrinks** ⚑ (settlement 2). **Session-lived** ⚑ — a reload shows the empty form.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows
  dropped and the hairline carrying every plane. **Cards and planes force Flat in dark** ⚑ (A29·4).
  **The field is always a step away from the plane it sits on** ⚑. **White over an image stays
  white** ⚑ and the scrim deepens one step. **The contrast band gets lighter in dark**, not darker ⚑.
  **Map images are re-generated for dark, never filtered** ⚑.
- **Print.** **The head, the contact rows, the addresses, the location cards, the directory table
  and the reasons print; the fields, the button, the radio rows and the map's link button do not** ⚑
  — a printed page cannot be typed into. 2, 3, 12 and 15 print as their head with the destination
  address beneath it in text ⚑.
- **The universal trio.** Every placeable section carries **Background role**, **Vertical spacing**
  (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade) **outside its own
  control list** ⚑. **A16's per-design Padding row was those same three values and is retired into
  Vertical spacing** in 1, 2, 3, 4, 6, 7, 10, 12, 13 and 14; **5's Band padding and 8's and 11's
  Ground padding resolve onto it** — the band's and the ground's inside padding — rather than sitting
  beside it; **Plane padding (4), Strip padding (9), Card width's inside padding (3) and Image height
  (15) are genuinely different ladders and keep their own names** ⚑. **Top divider is None by
  default**, so no drawn frame changes; **it is locked at None on 9 while *Rules* draws an upper
  rule** ⚑, because that is one line drawn twice. **Background role is locked, with the reason shown,
  on 5 Contrast Band (Contrast), 15 Cover (Image) and 10 Big Type (Transparent)** ⚑ — a ground that
  *is* the design cannot be a choice — and **9's and 11's own Ground rows became it**.
- **Editing.** **Every visible text is inline-editable with the P0·1 floating toolbar** — bold ·
  italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
  noreferrer · sponsored**. **The field labels and the placeholders are edited by clicking them on
  the canvas** ⚑ — no panel in A16 holds a label box, and at 2 Centred's *Labels: Hidden* the
  visually-hidden `<label>` is still the accessible name and still editable in place. **Every URL
  field opens the Ghost-aware Link Picker**, and **every button accepts an optional icon** before or
  after its label from the P0·2 Icon Picker with its size / colour-role popover, **off by default** ⚑.
  **Almost nothing in A16 is Ghost-owned** ⚑: the exceptions are **9 Slim Bar's label at *Site
  name***, which is `@site.title` and answers a click with "Edit in Ghost", and **any social row
  taken From Ghost**, whose URLs are read-only for the same reason.
- **Strings.** **No fixed English visitor-facing string ships** ⚑. Authored fields with defaults: the
  five field labels, the five placeholders, the button label, the consent line, the four form-state
  strings, `directionsLabel`, `columnLabels`, `socialsLabel` and `label`. **Theme
  translation-catalog strings**: "Sending…", "Send another message", the failed banner's first line,
  **"Email us at {address}"** and the honeypot's visually-hidden label.
- **Icons.** **Row icons** on 1, 4 and 5 and **Cell icons** on 6 — one slot a row or a cell, defaults
  mail · phone · pin · clock, **Hide by default** ⚑, the glyph `aria-hidden` and the label still the
  accessible text. **The socials row takes A3's fix**: glyphs from the Icon Picker's Social / Brands
  group (Tabler, per P0·2's library ruling), **never typed two-letter boxes**, displayed as **Icons ·
  Short labels · Full labels · Off**, with **Social accounts: From Ghost — version-gated, Facebook
  and X on Ghost 5.x, all nine platform fields on ≥ 6.36 — · Authored**; Ghost's rows are read-only
  and **do not count against the six** ⚑. **14 Reasons has no icon value at any setting** ⚑ —
  A6·11's call, carried.
- **Members.** **Member visibility** — Everyone · Logged out · Free members · Paid members — ships on
  the ten form designs, because the form is their call to action; **the five that draw no action do
  not carry it** ⚑, and that absence is recorded rather than invented. **No member detail is ever printed into the page** ⚑ — the *Prefill for
  members* row the controls patch added is **withdrawn, 30 August 2026**, and **the fields start
  empty for every reader**, signed in or out. An Inflozo theme never prints a member's own details
  into the page, so at *Logged out* there is no prefill left to suppress either.

- **Behaviour.** **Ten designs ask for `contact-form` — ARCHITECT: registry addition** ⚑. They
  declared `member-form`, which posts to Ghost's members endpoint and is the wrong module, not
  merely the wrong name; **no other module name is coined**, and the no-script state is designed on
  both delivery paths. **Five declare none**: 6, 8, 9, 10 and 13.

- **Refused category-wide, each with a reason:** a captcha ⚑ (a third-party script, and a contact
  form is not worth one — the section adds a honeypot and stops there) · an embedded map ⚑ (a
  third-party script, a consent banner and a layout shift; 7 draws a static image with a link) · a
  per-field editor ⚑ (settlement 1) · a file-upload field ⚑ (nothing in the stack can store a file,
  and a form service's upload limits are the service's business — **a finding, below**) · a
  question list ⚑ (A9 FAQ owns it) · a subscriber or member gate on the form ⚑ (A32 Paywall owns
  gating) · a success-page redirect as a section control ⚑ (it is the *After sending* row's second
  value and belongs to the delivery group) · autoplay, hover lifts and hover reveals ⚑ · **a Preview control** ⚑ — the patch's rule 7 asked
  for every one of them to go and **A16 never shipped one**, which is recorded so the audit is
  complete · **the P0·5 "Populate from…" panel** ⚑, because no design in the category reads a Ghost
  list and a data panel over nothing is a control that lies.

### The controls every form design shares — the Delivery group

Four rows and two captions, identical in all ten designs that draw a form, **below** each design's
own controls and **not counted toward its control budget** ⚑. **The five designs with no form do not
show the group at all** ⚑; the rows are kept on the section and return on switching.

| Field | Type | Values |
|---|---|---|
| `deliveryMode` (Where it goes) | enum req | An email address (**default** ⚑) · A form service. **Ghost cannot receive a form** ⚑. At *An email address* **the script composes a `mailto:` URL out of the fields**; **the no-script state is a visible "Email us at …" line and no submit button** ⚑. At *A form service* the native POST stands |
| `deliveryTarget` (The destination) | text req | The address, or the service's endpoint URL. **An Inflozo project setting, promotable to a Ghost Admin custom setting (text)** ⚑ — the owner changes it without a redeploy. **Validated per mode**: an email address, or an `https` URL. **Empty is editor-only and blocks publishing** ⚑ |
| `afterSending` | enum req | Show the message in place · The service's own page. **Disabled at *An email address*** ⚑ — the mail app is the response |
| `consentMode` (A consent line) | enum req | Off · A line of text (**default** ⚑) · A checkbox. **A checkbox everyone ticks is a worse record than a sentence everyone reads** |

**Two captions sit under the group, and neither is a row** ⚑. **Spam** — a hidden honeypot plus the
service's own guard, **no captcha at any value** ⚑; it was a read-only row, and a read-only row that
looks like a control is a control that lies. **Form-state copy** — `sentHeading`, `sentText`,
`invalidText` and `failedText` are written on canvas through the **P0·6 editor state switcher**,
never here.

**ARCHITECT: registry addition (`contact-form`)** ⚑ is drawn in the group on all ten panels, with
the reason: `member-form` posts to Ghost's members endpoint.

**11 Enquiry Types is the one design where the destination defers to a list** ⚑: each enquiry carries
its own address, and the group's single destination is the fallback for a type that has none. With
neither, that design is editor-only too.


### The roster

| # | Design | Tuple | Ctl | Module |
|---|---|---|---|---|
| 1 | Split | `split · none · page · none · none · form beside the details column` | 7 | `contact-form` ⚑ req. |
| 2 | Centred **[Free]** | `form · none · page · none · none · one centred form, no details` | 5 | `contact-form` ⚑ req. |
| 3 | Card | `form · card · page · none · none · the ask on an inset card` | 6 | `contact-form` ⚑ req. |
| 4 | Panel | `form · none · surface · none · none · the ask on a raised plane` | 8 | `contact-form` ⚑ req. |
| 5 | Contrast Band | `form · none · contrast · none · none · the ask on an inverted band` | 8 | `contact-form` ⚑ req. |
| 6 | Details Grid | `grid-of-N · none · page · few · none · detail blocks without a form` | 5 | none |
| 7 | Map Split | `split · none · surface · none · left · a map holding one half` | 6 | `contact-form` ⚑ req. |
| 8 | Locations | `grid-of-N · none · surface · few · top · one card per location` | 5 | none |
| 9 | Slim Bar **[Free]** | `bar · none · surface · none · none · one line, the address inline` | 5 | none |
| 10 | Big Type | `stack · none · transparent · none · none · the address at display scale` | 5 | none |
| 11 | Enquiry Types | `form · none · surface · few · none · one radio row per enquiry` | 4 | `contact-form` ⚑ req. |
| 12 | Boxed | `form · box · page · none · none · the ask in a hairline box` | 6 | `contact-form` ⚑ req. |
| 13 | Directory | `table · none · page · many · none · one row per enquiry address` | 4 | none |
| 14 | Reasons | `split · none · page · few · none · three reasons beside the form` | 5 | `contact-form` ⚑ req. |
| 15 | Cover | `form · none · image · none · background · the ask over a cover photograph` | 8 | `contact-form` ⚑ req. |

**[Free] designs:** 2 Centred · 9 Slim Bar

**CTL is own controls only**, and the old 4–7 norm is lifted to the PRD's ~15 ⚑: the universal
trio, the item list, the delivery group and the Data group all sit outside the count. **MODULE reads
`contact-form` on the ten form designs and it is a request, not a registry entry** ⚑ — the declared
`member-form` posts to Ghost's members endpoint. **The five that draw no form still declare none.**

### The no-JavaScript line, design by design

**Every design states what a visitor without JavaScript gets.** The ten form designs answer twice,
because the answer depends on where the form goes; the five that draw no form answer once, because
nothing they draw needs script at all.

| # | Design | With JavaScript unavailable |
|---|---|---|
| 1 | Split | *An email address*: the fields stay, **the designed notice takes the submit button's place** and its `mailto:` link works ⚑. *A form service*: the `<form action method="post">` posts natively; no notice |
| 2 | Centred | As 1. The notice is centred with the form and clamped to the form's 560 |
| 3 | Card | As 1, **the notice inside the card** above the consent line |
| 4 | Panel | As 1, **the notice on the plane**, a step away from it as the fields are |
| 5 | Contrast Band | As 1, **the notice in the carried colour, not the accent** ⚑ — 4.5:1 on the band |
| 6 | Details Grid | **Nothing needs script.** Four labelled values, the email a `mailto:` and the phone a `tel:` |
| 7 | Map Split | As 1. **The map is a static image and its Directions is an `<a>`**, so the half that is not the form is unaffected |
| 8 | Locations | **Nothing needs script.** Each card's Directions is an `<a>`; the addresses are selectable text |
| 9 | Slim Bar **[Free]** | **Nothing needs script.** The address is a `mailto:` and the phone a `tel:` on one line |
| 10 | Big Type | **Nothing needs script.** The address is a `mailto:` at display size |
| 11 | Enquiry Types | As 1, with one stated limit: **the notice offers the section's own destination, not the selected type's** ⚑ — a template cannot read a radio. The radios are real inputs and stay drawn |
| 12 | Boxed | As 1, **the notice inside the box** above the consent line |
| 13 | Directory | **Nothing needs script.** Every row's address is a `mailto:` |
| 14 | Reasons | As 1. **The reasons sit above the form** and are text, so they read either way |
| 15 | Cover | As 1, **the notice white on the scrim** at 8.4:1, above the consent line |

**The notice is one component, drawn once** — see the component inventory — and **the submit button
is not rendered at *An email address* without script** ⚑, because a button that cannot post is worse
than no button.

### Tuple uniqueness — the honest statement

**All fifteen are distinct on the five closed slots.** **Archetype spreads the category** — six
`form`, three `split`, two `grid-of-N`, and one each of `bar`, `stack` and `table`. **Containment
separates 2, 3 and 12** on the page ground — `none`, `card`, `box`. **Ground separates the six
forms**: `page` (2, 3, 12), `surface` (4, 11), `contrast` (5), `image` (15). **Item-count separates
1 from 14** on `split · page` and **4 from 11** on `form · surface`. **Containment is `none` in
thirteen of fifteen** ⚑ — 8 Locations' cards are the *items'* geometry, not the section's, which is
A21·2's rule.

**Item-count names what the layout is built for, not what the control allows** ⚑. `none` on nine
designs is literal: there is no repeating unit at all. `few` on 6, 8, 11 and 14 says the arrangement
is designed for two to four; `many` on 13 says five or more.

**What the check cannot promise.** 3 Card and 12 Boxed differ by a fill; 4 Panel and 3 Card by
whether the plane is inset; 6 Details Grid and 9 Slim Bar are the same four fields at two densities;
9's *Ground: Page* value reaches 6's ground, at which point the two differ by density alone. **Each
panel names the others by number** ⚑ rather than pretending the overlap is not there. Those
distinctions are real and visible; they are not machine-checkable.

### Repeating items — the whole category, in one place

**Four kinds of item appear in A16 and all four are authored** ⚑ — Ghost supplies none of them.

- **`socials[]`** — 1, 5, 6, 9, 10, 12. **A3's list, carried with A3's own fix** ⚑: glyphs come
  from the **Icon Picker's Social / Brands group** (Tabler, per P0·2), **never typed two-letter
  boxes**, and display is **Icons · Short labels · Full labels · Off** — Icons the default, **Full
  labels the default in 6 and 10** ⚑, where the row sits under labelled values. **Source is a row of
  its own**: **From Ghost — version-gated, Facebook and X on Ghost 5.x, all nine platform fields on
  ≥ 6.36, each read-only and linking to the setting that owns it — · Authored**, Authored being the
  drawn default; **Ghost's rows render regardless and do not count against the six** ⚑. On the
  authored list the P0·3 controls apply: **Add opens the platform picker and arrives with content**
  ⚑, never a blank row, and lands last; **Remove is never disabled** ⚑; **drag reorders and authored
  order is drawn order**; **0–6, Add disabled at six** with the reason shown ⚑ — six 44 px boxes on a
  6 px gap are 294 px of a 350 px measure. **Zero removes the row and its gap**, and in 6 and 10 the
  rule above it goes too ⚑. Inside an entry the user edits **the platform, the URL and the optional
  handle** and nothing else.

- **`locations[]`** — 7 (the first only), 8 (all). **New in A16** ⚑. Add is **seeded with a placeholder
  name and a placeholder address** and lands last ⚑ — **nothing is read from the site** ⚑, because no
  Ghost setting carries an address or a city; **Remove is never disabled** ⚑ —
  which retires the old "disabled at one in 8" rule, because the editor already draws the zero state;
  **reorder is meaningful in both** — in 8 it is reading order, and **in 7 the first entry is the one
  on the page** ⚑. **1–6, drawn for 2–3**; four or more wraps at the same card size rather than
  shrinking ⚑; **zero means 8 does not render** and 7 falls back to 4 Panel. Inside an item:
  **`name` req ≤ 40 · `address` req ≤ 120 · `hours` ≤ 80 · `phone` ≤ 40 · `email` ≤ 80 ·
  `mapImage` · `mapImageDark` · `mapUrl`**. **`phone` and `email` are new** ⚑ and draw as
  `tel:` and `mailto:` links under the address in 8 — **an empty field drops its line**, and 7
  stores them without drawing them. **`coords` is dropped** ⚑: the static map is **an image the
  owner uploads through the Image Picker**, with **Image focus (Centre · Top · Bottom) in the
  picker's popover**, because **Inflozo names no tile provider in v1** — nothing is generated and
  nothing is fetched while a reader is on the page. **`mapImageDark` is the optional second upload**
  ⚑; with none set the light image serves both modes and **the image is never filtered**. Hours and
  both maps are optional — no hours drops the line and its hairline; no map starts the card at its
  name ⚑.

- **`enquiries[]`** — 11 (2–4 as radios), 13 (1–12 as rows). **New in A16, and one list serving two
  designs** ⚑. Add is **seeded "New enquiry" with the section's default address** and lands last ⚑;
  **Remove is never disabled** ⚑ — retiring "disabled at two in 11", because at one type the row is
  simply not drawn and the form posts to the destination, which is 2 Centred and the panel names it;
  **drag reorders**, and **in 11 the first entry is the one selected on load** ⚑. **11 refuses a
  fifth and names 13** ⚑. Inside an item: **label, address, note** — the note optional, an entry
  without one leaving 13's cell empty at full row height ⚑ and 11's line beneath the row absent ⚑.
  **The label and the note are edited in place on the canvas** ⚑ — select a type and edit its row and
  its line in 11; click a cell and type in 13, where **the three column headers edit in place too**
  ⚑, since `columnLabels` is content and not chrome.

- **`reasons[]`** — 14 alone. **A6·11's field and repeater, carried verbatim** ⚑, now stated as the
  P0·3 item list: 1–3 lines, ≤ 40 characters, text only, **no icons at any value** ⚑ — the one
  repeating list in A16 with no icon slot — **Add arrives with content and is disabled at three** ⚑,
  **Remove is never disabled**, an emptied line removed on blur with an undo, **drag reorders and
  reordering renumbers** ⚑, and **each line edits in place in the column** ⚑. One reason is a
  supported state; removing the last leaves the column empty and **the panel names 1 Split** ⚑.


**The contact block is not a list** ⚑ — four fixed rows in a fixed order with no Add, no Remove and
no reorder. A3·10 made that call and A16 does not reopen it. **What the patch changed is how the rows
are chosen**: **one toggle a row — Post · Email · Phone · Replies — in 1, 4 and 5** ⚑, in place of
the old three-value enum, which could not say "phone but not post"; **all four off removes the block
and its gap**; **4 Panel keeps its two placements and loses its Off value**, which the toggles now
say; **12 Boxed keeps its three-value placement enum**, and that asymmetry is recorded in the
reconciliation notes rather than resolved by inventing a fourth control there. **Each row carries an
optional icon slot** from P0·2 — defaults mail · phone · pin · clock, **Hide by default** ⚑ — and
**6 Details Grid's cells carry the same slot under *Cell icons*** ⚑.


**Per-item styling does not exist**, by construction: every control writes a single value onto the
section and the stylesheet reads it, so "make card 3 bigger" is not expressible. **Inside an item
the user edits content only** — its text, its image, its link — never its layout, spacing, alignment
or emphasis.

### The shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | 1–8, 10–15 | **Stored and not drawn in 9** ⚑ |
| `heading` | text | opt | 60 ch | all but 9, 10 | **9 and 10 store it and never draw it** ⚑ |
| `blurb` | text | opt | 240 ch | 1–8, 11–15 | Clamped 560 on the page, 520 over an image ⚑ |
| `headingSmall` | text | opt | 30 ch | 10 | The *Heading* value's line; **not an `h2`** ⚑ |
| `nameLabel` … `messageLabel` | text ×5 | opt | 24 ch each | the 10 form designs | The five field labels; defaults supplied |
| `placeholder` set | text ×5 | opt | 32 ch each | the 10 form designs | One per field; defaults supplied |
| `buttonLabel` | text | opt | 18 ch | the 10 form designs | Default "Send message" |
| `consentText` | text | opt | 110 ch | the 10 form designs | The line, or the checkbox's label ⚑ |
| `sentHeading` | text | opt | 40 ch | the 10 form designs | Default "Message sent" |
| `sentText` | text | opt | 140 ch | the 10 form designs | **Names the address that was typed** ⚑ |
| `invalidText` | text | opt | 60 ch | the 10 form designs | **One per validated field** ⚑ |
| `failedText` | text | opt | 140 ch | the 10 form designs | Offers the `mailto:` as the way out ⚑ |
| `postal` | text | opt | 140 ch | 1, 4, 6, 12 | A3·10's contact block, verbatim |
| `email` | text | req in 9, 10 | 80 ch | 1, 4, 5, 6, 9, 10, 12 | **The one field two designs cannot live without** ⚑ |
| `phone` | text | opt | 40 ch | 1, 4, 5, 6, 9, 12 | Drawn as a `tel:` link |
| `replyHours` | text | opt | 140 ch | 1, 4, 6, 12 | **Not drawn on the band (5)** ⚑ |
| `socialsLabel` | text | opt | 20 ch | 6, 10 | Defaults "Elsewhere" and "Also on" ⚑ |
| `socials[]` · `socialsSource` · `socialsDisplay` | list 0–6 + enum ×2 | opt | A3's fields | 1, 5, 6, 9, 10, 12 | **A3's list and A3's fix** ⚑ — glyphs from the Icon Picker, source **From Ghost (version-gated) · Authored**, display **Icons · Short labels · Full labels · Off** |
| `locations[]` | list 1–6 | opt | see below | 7 (one), 8 (all) | **New in A16** ⚑ — `name` ≤ 40 req · `address` ≤ 120 req · `hours` ≤ 80 · **`phone` ≤ 40** · **`email` ≤ 80** · `mapImage` · **`mapImageDark`** · `mapUrl`. **`coords` dropped; maps are uploads** ⚑ |
| `enquiries[]` | list 1–12 | opt | see below | 11 (2–4), 13 (1–12) | **New in A16** ⚑ — `label` ≤ 28 req · `address` req · `note` ≤ 60 |
| `reasons[]` | list 1–3 | opt | 40 ch each | 14 | **A6·11's field, carried verbatim** ⚑ |
| `columnLabels` | text ×3 | opt | 20 ch each | 13 | The table's three header strings ⚑ |
| `label` | text | opt | 20 ch | 9 | The strip's label; **defaults to `@site.title`** ⚑ |
| `directionsLabel` | text | opt | 20 ch | 8 | Default "Directions" |
| `image` · `imageAlt` · `imageFocus` | image + text + enum | **req in 15** | 120 ch alt | 15 | **`imageFocus` is now a control as well as a field** ⚑ — Centre · Top · Bottom, in the panel and in the Image Picker's popover |
| `deliveryMode` · `afterSending` · `consentMode` | enum ×3 | req | — | the 10 form designs | The shared delivery group, **four rows since 30 August 2026** ⚑ — **`prefillMembers` is withdrawn**, because a theme never prints a member's own details into the page |
| **`deliveryTarget`** | project setting | req to publish | — | the 10 form designs | **Not section content** ⚑ — an Inflozo project setting, promotable to a Ghost Admin custom setting (text); validated per mode; **empty blocks publishing** |
| **`memberVisibility`** | enum | opt | — | the 10 form designs | Everyone (default) · Logged out · Free members · Paid members. **Absent on 6, 8, 9, 10, 13**, which draw no action ⚑ |
| **`contactRows`** | boolean ×4 | opt | — | 1, 4, 5 | Post · Email · Phone · Replies, one toggle a row ⚑. **`rowIcons`** (Show · Hide) and one icon slot a row travel with it |
| **`cellIcons`** | enum | opt | — | 6 | Show · Hide, with an icon slot a cell ⚑ |
| **`blurbShown`** | enum | opt | — | 1, 2, 3, 4, 5, 12, 14, 15 | Show · Hide. **New on 1, 3, 4, 5, 12 and 15** ⚑; 2 and 14 had it |
| **`addressShown`** | enum | opt | — | 10 | Email · Phone ⚑ — the same size ladder, the wrap rule moving from the `@` to a space |
| **`phoneShown`** | enum | opt | — | 9 | Show · Hide ⚑ — half of the retired *The strip carries* enum; the other half is `socialsDisplay` |
| **`directionsMode`** | enum | opt | — | 7, 8 | From address (default) · Custom URL · Off ⚑ — From address builds a maps-search URL out of the address |
| **`backgroundRole`** · **`verticalSpacing`** · **`topDivider`** | enum ×3 | req | — | all fifteen | The universal trio, outside every design's own list ⚑. Locked: role on 5, 10, 15; divider on 9 at *Rules: Above and below* |
| *@site.title* | Ghost | req | — | 9, and every form with no heading | The form's `aria-label` where no heading exists ⚑ |

**Thirty-seven fields, one project setting and one thing read from Ghost** — twenty-six authored
fields as drawn on 23 August, plus the eleven the controls patch added or promoted, `deliveryTarget`
as a project setting, and `@site.title`. A design may use far fewer — 10 Big Type draws five — but
**none needs a field the category does not have**, so switching between any two of the fifteen
preserves everything the user typed.
Type draws four — but **none needs a field the category does not have**, so switching between any two
of the fifteen preserves everything the user typed.

---

## The fifteen designs

Every entry carries all ten fields in the brief's order. Controls are listed **in sidebar order**;
**the universal trio, the item list, the Delivery group and the Data group follow each list and none
of them counts** ⚑. **Field 9 asks for `contact-form` in the ten form designs and names none in the
other five**; only departures from that module's degradation statement are restated per design.

**The degradation statement, quoted once and referred to by every form design.** `member-form`'s
reads: "The `<form>` posts natively to Ghost's members endpoint; Ghost's own server response
replaces the designed sent state." **A16 cannot use it** ⚑ — that endpoint is not where a message
goes — so the category asks for **`contact-form`** and states its own degradation: **at *A form
service* the `<form action method="post">` posts natively and the service's own page replaces the
designed sent state; at *An email address* the fields stay, a visible "Email us at …" `mailto:` line
sits under them, and the submit button is not rendered** ⚑. **Empty, focus and the browser's own
required-field messages survive with no script at all**; submitting, the in-place sent state and the
failed banner are the script path.

---

### 1 · Split

1. **Descriptor.** The head and the publication's own contact details in a 560 column at the left,
   the form in a 640 column at the right on a 96 px gutter. The category default; nothing is raised,
   boxed or photographed.
2. **Tuple.** `split · none · page · none · none · form beside the details column`
   Containment `none` — the section sits in nothing. Item-count `none`: the socials are a row inside
   the details column, not the section's repeating unit, and 14 Reasons is the `few` on this ground.
3. **Archetype.** split. **One departure** — it collapses at 1,080 rather than 767 ⚑, because two
   columns cannot hold a 480 px form at 834.
4. **Responsive.** **1440** content 1,296 on a 72 margin; 560 · 96 · 640; head measure 520, details
   460, form fields full-width in their column, name and phone paired only at *Fields: five*; padding
   96. **1080** one column, **form then details** ⚑, details as a wrapping row of 220 px blocks.
   **834** the same one column, padding 80, heading 34. **≤ 767** padding 64, heading 28, fields
   48 px, field text 16 ⚑, button full width, details as a stack.
5. **Fields.** `eyebrow` · `heading` · `blurb` · the five field labels · the placeholder set ·
   `buttonLabel` · `consentText` · `sentHeading` · `sentText` · `invalidText` · `failedText` · the
   four contact rows · `socials[]`. From Ghost: nothing but the site title, used as the form's
   `aria-label` where no heading is drawn.
6. **Controls — seven of its own.** Fields *Email and message · Name, email, message · Name, email,
   subject, message · Name, email, phone, subject, message* — Details column *Left · Right* — Message
   height *Short · Medium · Tall* — Blurb *Show · Hide* — Socials display *Icons · Short labels · Full
   labels · Off* — Contact rows *Post · Email · Phone · Replies*, **one toggle a row** — Row icons
   *Show · Hide*, **one icon slot a row**. Then the socials item list, Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is
   retired into Vertical spacing** ⚑ and **the three-value Contact-block enum is retired into the four
   toggles** ⚑. Quick Controls: Fields · Details column · Contact rows · Socials display.
7. **Data.** Nothing is read from Ghost. **0 socials** → row and gap removed ⚑. **1** → one 44 px
   box, not stretched. **many** → wraps at six, the ceiling. **All four contact rows empty** → block
   and gap removed and the left column is head and socials alone ⚑.
8. **Empty.** No eyebrow, blurb or contact row → each absent, the column closing up ⚑. **No heading
   is allowed** and the `<form>` then takes `aria-label="Contact Orbit Weekly"`. Placeholders and the
   button label fall back to defaults rather than rendering empty ⚑.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The ten form designs declared
   `member-form`, and it is not merely misnamed: **it posts to Ghost's members endpoint** ⚑. **No
   other module name is coined.** No-JS as quoted below: the native POST at *A form service*, and the
   visible `mailto:` line with no submit button at *An email address*.
10. **A11y.** Heading **h2** ⚑. Real `<label>` above every field; `autocomplete` on name, email and
    phone; `required` on email and message. **On submit the first invalid field takes focus** ⚑ and
    its message is its `aria-describedby`. **Focus ring suppressed on fields** ⚑, kept on the button.
    Light: heading 13.4:1, labels 13.4:1, placeholder 5.1:1, button label 4.6:1; dark 8.1:1.
    **Repeating items** — `socials[]` only: Add opens the platform picker and lands last, Remove is
    on the row and undoable, drag reorders, 0–6, designed for 3–4, zero removes the row and its gap.
    **Flagged ⚑** the 1,080 collapse · form-before-details below it · the fixed contact-block order ·
    sent shrinking the section · no alignment control · the `member-form` declaration.

**Editing.** The eyebrow, heading and blurb, **each contact row's label and its value**, **the five
field labels and the five placeholders — clicked on the canvas, not typed into a sidebar** ⚑, the
button label and the consent line. The four form-state strings are written in place through **P0·6**.
Every URL opens the **Link Picker**; the button takes an optional **P0·2** icon, off by default.
**Nothing is Ghost-owned here** unless the socials come From Ghost, whose URLs are read-only and
answer a click with "Edit in Ghost".

**Patched, 24 August 2026.** Contact rows and Row icons replace the enum (Data: **all four toggles
off removes the block and its gap**, which is the state that used to be *Off*); Socials display and
**Social accounts: From Ghost (version-gated) · Authored** carry A3's fix, so **the frames' two-letter
boxes become the neutral stroke placeholder** and the glyph is the Icon Picker's; Blurb arrives;
**Member visibility** ships; the delivery group is rebuilt around the `mailto:` honesty fix, the
project-setting destination and **the no-JavaScript notice**; **A11y** gains the no-script state — fields,
a visible `mailto:` line, no submit button — and the row icons are `aria-hidden` with the label
still the accessible text.

---

### 2 · Centred

1. **Descriptor.** A centred head on a 720 measure with the form beneath on 560, and no contact
   details at any value. The smallest complete form in A16.
2. **Tuple.** `form · none · page · none · none · one centred form, no details`
   Ground `page` and containment `none`: this is 3 Card without the card and 12 Boxed without the
   box, and those two slots are what say so.
3. **Archetype.** form. No departures — one column at every width.
4. **Responsive.** **1440** head centred on 720, blurb clamped 560, form 560, fields 46, message 144,
   padding 96. **834** heading 34, form 520, padding 80. **≤ 767** heading 28, form 350, fields 48
   and stacked, field text 16 ⚑, button full width, padding 64.
5. **Fields.** As 1 Split minus the contact rows and `socials[]`, which are **stored and never
   drawn** ⚑.
6. **Controls — five of its own.** Fields (the four-value set) — Labels *Above · Hidden* — Form width
   *Narrow 480 · Medium 560 · Wide 640* — Message height *Short · Medium · Tall* — Blurb *Show ·
   Hide*. Then Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is retired into Vertical spacing** ⚑. Quick Controls: Fields ·
   Form width · Message height.
7. **Data.** Nothing from Ghost. **There is no repeating unit, so 0, 1 and many do not arise** ⚑ —
   the counts that matter are the field count, which is a control, and the character counts on the
   authored strings.
8. **Empty.** No eyebrow → absent. No blurb → the same. **No heading** → the form takes
   `aria-label="Contact Orbit Weekly"` ⚑. All three empty → the form alone, centred, which is the
   floor of this design at 246 px.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths.
10. **A11y.** Heading **h2**. **At *Labels: Hidden* the `<label>` is still emitted, visually
    hidden** ⚑ — the placeholder is never the accessible name, and the panel says what the value
    costs. `required` on email and message; first invalid field takes focus. Focus ring suppressed on
    fields, kept on the button ⚑. Placeholder 5.1:1 light, 5.0:1 dark.
    **Repeating items** — none drawn. `socials[]` is kept intact and returns on switching ⚑.
    **Flagged ⚑** labels left-aligned under a centred head · *Labels: Hidden* and its cost · the head
    measure holding at 720 across all three form widths · the contact fields kept and never drawn.

**Editing.** The eyebrow, heading and blurb, the field labels and placeholders on the canvas, the
button label and the consent line; the four form-state strings through **P0·6**. **At *Labels:
Hidden* the visually-hidden `<label>` is still the accessible name and still editable in place** ⚑ —
which is the fix that matters most in this design.

**Patched, 24 August 2026.** No new own control beyond the Blurb row it already had: **this design
draws no socials, no contact rows and no icons**, so the category's social and per-row fixes land
elsewhere and its four stored lists are untouched. **Member visibility** ships with the form; the
delivery group is rebuilt (`mailto:` composed by script, the no-script line, the project-setting
destination, Spam as a caption); **A11y** gains the no-script state.

---

### 3 · Card

1. **Descriptor.** The form on an inset surface card raised off the page ground, with the head above
   it on the page. A19·3's card at A16's scale.
2. **Tuple.** `form · card · page · none · none · the ask on an inset card`
   Containment `card` is the whole distinction from 2 Centred and 12 Boxed.
3. **Archetype.** form. No departures.
4. **Responsive.** **1440** card 680 centred in 1,296, inside padding 40, section padding 96, head
   above on 720. **834** card 640, inside 40, padding 80. **≤ 767** card 350 — **the full content
   measure** ⚑ — inside 24, fields 48 and stacked, field text 16, button full width, padding 64.
5. **Fields.** As 2 Centred. The contact rows and `socials[]` are stored and never drawn ⚑.
6. **Controls — six of its own.** Fields — Card width *Narrow 560 · Medium 680 · Wide 800* (**the
   value sets the inside padding too: 32 · 40 · 48** ⚑ — a card ladder, not the section's seam) — Head
   *Above the card · On the card · None* — Message height — Depth *Raised · Flat* — Blurb *Show ·
   Hide*. Then Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is retired into Vertical spacing** ⚑, and **Background role is
   the ground under the card, never the card's own fill** ⚑. Quick Controls: Fields · Card width ·
   Head.
7. **Data.** Nothing from Ghost; no repeating unit.
8. **Empty.** At *Head: None* the card is the whole section and takes the form's `aria-label` ⚑.
   Everything else as 2 Centred. **A card with an empty form cannot happen** — the field set is a
   control with a floor of two.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths.
10. **A11y.** Heading **h2**, above the card or on it. **The card is not a landmark and takes no
    role** ⚑ — it is a fill and a shadow, and the `<form>` inside it is what gets named. Card border
    1.4:1 against the ground — a hairline, not an interactive boundary, so it is not held to 3:1 ⚑.
    **Repeating items** — none drawn; `socials[]` kept.
    **Flagged ⚑** card width setting inside padding · Flat forced in dark · the card taking the full
    measure at 390 · the field going darker than the card in dark.

**Editing.** The eyebrow, heading and blurb — above the card or on it — the field labels and
placeholders on the canvas, the button label and the consent line; the four form-state strings
through **P0·6**. At *Head: None* the card is the whole section and the `<form>` takes the site
title as its `aria-label`, which is not a field.

**Patched, 24 August 2026.** **Blurb: Show · Hide** arrives — six own controls. **Member visibility**
ships; the delivery group is rebuilt; **A11y** gains the no-script state, drawn inside the card. The
card's own hairline and its Flat-in-dark rule are untouched.

---

### 4 · Panel

1. **Descriptor.** A raised surface plane the full content width, carrying the four contact rows
   across its top and the form beneath a hairline. The details and the form as one object.
2. **Tuple.** `form · none · surface · none · none · the ask on a raised plane`
   Ground `surface` with containment `none`: A26·3's call that a full-width fill is a ground rather
   than a containment, carried verbatim. 3 Card is the inset version and is `card · page`.
3. **Archetype.** form. No departures.
4. **Responsive.** **1440** plane 1,296, inside 44, details four-across on 240, **form clamped 640**
   under a hairline ⚑, section padding 96. **834** plane 754, details two-across, **form takes the
   plane's inside width** ⚑, padding 80. **≤ 767** plane 350, inside 24, details one per row, fields
   48, field text 16, button full width, padding 64.
5. **Fields.** As 1 Split, minus `socials[]`, which is stored and never drawn ⚑. The four contact
   rows are section fields, not items: each may be left empty and takes its 12 px label with it ⚑.
6. **Controls — eight of its own.** Fields — Contact row *Across the top · Under the form* (**the
   old *Off* value is retired** ⚑ — all four toggles off says it) — Contact rows *Post · Email · Phone
   · Replies* — Row icons *Show · Hide* — Plane padding *Compact 32 · Comfortable 44 · Spacious 64*
   (**kept: a plane ladder, not the section's seam** ⚑) — Message height — Depth *Raised · Flat* —
   Blurb *Show · Hide*. Then Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is retired into Vertical spacing** ⚑, and
   **Background role is the plane's own fill** — at Contrast the panel names 5 Contrast Band. Quick
   Controls: Fields · Contact row · Contact rows · Plane padding.
7. **Data.** Nothing from Ghost. **0 filled contact rows** → the row and its hairline are removed and
   the plane holds the form alone ⚑, which the panel names as 3 Card at full width. **1** → one block
   at the plane's left, not stretched ⚑. **4** is the ceiling; the block is not a repeater.
8. **Empty.** As 2 Centred for the head. **All four rows empty at *Across the top*** → the plane
   starts at the form and keeps its inside padding; **no empty band is drawn** ⚑.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths.
10. **A11y.** Heading **h2** above the plane. **The contact row is a `<dl>`** ⚑ — label and value are
    a term and its definition, which is the one place in A16 where that is literally true. The plane
    is not a landmark.
    **Repeating items** — none. The contact block is four fixed fields with no Add, Remove or
    reorder ⚑; `socials[]` is kept.
    **Flagged ⚑** the 640 form clamp on a 1,296 plane · two padding controls · *Contact row: Off*
    naming 3 Card · the `<dl>` · the details row not changing state.

**Editing.** The eyebrow, heading and blurb, **the four contact rows' labels and values inside the
`<dl>`**, the field labels and placeholders on the canvas, the button label and the consent line;
the four form-state strings through **P0·6**.

**Patched, 24 August 2026.** The block gains **four per-row toggles** and an **optional icon a row**
(Hide by default, glyphs `aria-hidden`); **Contact row loses *Off***; **Blurb** arrives — eight own
controls. **Data**: none, one and four filled rows behave as drawn, and **all four toggled off is now
the *Off* state**. **Member visibility** ships; the delivery group is rebuilt; **A11y** gains the
no-script state and the `<dl>` is unchanged.

---

### 5 · Contrast Band

1. **Descriptor.** A full-bleed inverted band carrying the head and three contact rows at the left
   and the form at the right, with every colour derived from the two contrast tokens.
2. **Tuple.** `form · none · contrast · none · none · the ask on an inverted band`
   Ground `contrast` is the whole distinction from 4 Panel.
3. **Archetype.** form. **Two departures** — the section's own padding is 0 at every value ⚑, and the
   two-column arrangement needs 1,081 rather than 768 ⚑.
4. **Responsive.** **1440** band full bleed, inside 88 × 72, content 1,296, 520 · 96 · 640, three
   contact rows, socials as glyphs. **1080** one column; **Arrangement stops having an effect and the
   sidebar says so** ⚑. **834** inside 72 × 40, heading 34. **≤ 767** inside 56 × 20, heading 28,
   **Inset forced to full bleed** ⚑, fields 48, field text 16, button full width.
5. **Fields.** As 1 Split. **`replyHours` is drawn at last** ⚑ — the Replies toggle is what draws
   it, and it ships off, so the band shows three rows at its defaults and four when it is turned on.
6. **Controls — eight of its own.** Fields — Band width *Full bleed · Inset* — Arrangement *Head
   left, form right · Head above* — Message height — Socials display *Icons · Short labels · Full
   labels · Off* — Contact rows *Post · Email · Phone · Replies* (**the Replies toggle is what finally
   draws `replyHours`, and it ships off** ⚑) — Row icons *Show · Hide* — Blurb *Show · Hide*. Then
   the socials item list, Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Band padding is retired into Vertical spacing**, which
   resolves onto the band's own inside padding — 64 · 88 · 120 — because the section's padding is 0 at
   every value ⚑; **Background role is locked at Contrast with the reason shown** ⚑; **Top divider is
   None by default**, since a full-bleed band is its own edge. Quick Controls: Fields · Band width ·
   Arrangement · Contact rows.
7. **Data.** Nothing from Ghost. `socials[]` at **0** → row and gap removed; **1** → one box;
   **many** → wraps, six the ceiling. Contact rows as 4 Panel, three of the four drawn.
8. **Empty.** As 1 Split. **An empty left column is a real state** — head off, contact rows empty,
   socials off — and the band then centres the form on its 1,296 rather than leaving 616 px of band
   empty ⚑.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths.
10. **A11y.** Heading **h2**. **No `color-scheme` switch inside the band** ⚑ — A3·5's rule. Derived
    contrasts, light band: heading 13.4:1, muted 5.6:1, placeholder 4.9:1, button label 13.4:1. **The
    accent is refused at 4.0:1** ⚑; the focus ring on the band is the carried colour.
    **Repeating items** — `socials[]`: as 1 Split, 0–6, designed for 3–4.
    **Flagged ⚑** zero section padding · the 1,081 collapse · Arrangement inert below it · Inset
    forced to full bleed at 390 · three contact rows not four · the band lightening in dark.

**Editing.** The eyebrow, heading and blurb, the drawn contact rows' labels and values, the field
labels and placeholders on the canvas, the button label and the consent line — all on the band, in
the carried colour; the four form-state strings through **P0·6**, whose tiles are drawn on the band's
own ground.

**Patched, 24 August 2026.** Band padding retires into Vertical spacing; Background role locks;
**the contact block gains four toggles, and Replies ends the "stored and not drawn" state of
`replyHours`** ⚑ — **Fields** and **Data** are amended accordingly: three rows at the defaults,
four when Replies is on, and the band grows by one row rather than reflowing anything else. Socials
display and **Social accounts** carry A3's fix (the two-letter boxes become the neutral stroke
placeholder); **Blurb** arrives; **Member visibility** ships; the delivery group is rebuilt; **A11y**
gains the no-script state, whose `mailto:` line takes the carried colour and clears 4.5:1 on the
band.

---

### 6 · Details Grid

1. **Descriptor.** Four labelled detail cells across the content box divided by hairlines, with the
   social row beneath a rule. **No form at any value.**
2. **Tuple.** `grid-of-N · none · page · few · none · detail blocks without a form`
   Item-count `few`: the grid is built for two to four cells.
3. **Archetype.** grid-of-N. No departures — 4 → 2 → 1.
4. **Responsive.** **1440** four cells at 1fr on 32 px gutters with a hairline between each pair,
   values 17, padding 96. **834** two-across, one hairline, padding 80. **≤ 767** one per row,
   **hairlines become rules above** ⚑, values 16, padding 64.
5. **Fields.** The four contact rows, each ≤ 140 characters · `eyebrow` · `heading` · `blurb` ·
   `socialsLabel` (default "Elsewhere") · `socials[]`. **Every form field and every form string is
   stored and never drawn** ⚑.
6. **Controls — five of its own.** Columns *Auto · Two · Three · Four* — Head *Centred · Flush left ·
   None* — Socials display *Icons · Short labels · Full labels · Off* (**Full labels is the default
   here** ⚑) — Dividers *Hairlines · None* — Cell icons *Show · Hide*, **one icon slot a cell**. Then
   the socials item list, **the universal trio** and **the Data group** (Social accounts). **No
   delivery group** ⚑ and **no Member visibility** ⚑ — this design draws no form and no action.
   **Padding is retired into Vertical spacing** ⚑. Quick Controls: Columns · Head · Socials display.
7. **Data.** Nothing from Ghost. **0 filled contact rows** → the grid is removed and the section is
   head and socials ⚑; if socials are also off, the section does not render and the editor says so.
   **1** → one cell at the left, not stretched. **many** → four is the ceiling.
8. **Empty.** Each empty row removes its cell and its divider ⚑. No head → the grid alone. **No
   socials** → the row and the rule above it go together ⚑.
9. **Module.** **none.** ⚑ Text, links and no script. There is no degradation statement to quote
   because there is nothing that could fail: every link is a real `<a href>` — `mailto:`, `tel:` and
   the social URLs — and they work with JavaScript off, on, or blocked.
10. **A11y.** Heading **h2**. **The grid is a `<dl>`** ⚑. `mailto:` and `tel:` links carry their full
    value as text so they are readable when printed ⚑. Social links take `rel="me"`; **at *Socials
    display: Icons* the glyph is `aria-hidden` and the box carries a visually-hidden platform name** ⚑ —
    the two-letter box's rule, kept for the Icon Picker's glyph. Labels 5.4:1 light, 6.4:1
    dark; values 13.4:1 and 8.1:1.
    **Repeating items** — `socials[]`: 0–6, designed for 3–5, zero removes the row and its rule.
    **Flagged ⚑** Labels as the social default here · dividers between and never around · hairlines
    becoming rules at 390 · one cell not stretching · no delivery group · the `<dl>`.

**Editing.** The eyebrow, heading and blurb, **each cell's 12 px label and its value**, and **the
social row's own label** — `socialsLabel`, default "Elsewhere", which was a field with nowhere to
type it ⚑ and is now clicked on the canvas like everything else.

**Patched, 24 August 2026.** **Cell icons** arrives with an icon slot a cell (defaults mail · phone ·
pin · clock, Hide by default, the glyph `aria-hidden` and the label still the accessible text);
Socials display and **Social accounts: From Ghost (version-gated) · Authored** carry A3's fix, and
**Full labels is named as this design's default** rather than left implicit. **A11y**: at *Socials
display: Icons* the visually-hidden platform name still carries the accessible name, which is the old
two-letter box's rule kept for the glyph. **No module, no delivery group, no member row** — every
address here is already a real `mailto:` or `tel:` link, which is why the form panels name this
design as the fallback.

---

### 7 · Map Split

1. **Descriptor.** A static map holding one half of a surface plane and the address, hours and form
   holding the other. **The map is an image with a link, never an embed.**
2. **Tuple.** `split · none · surface · none · left · a map holding one half`
   Media placement `left` and ground `surface` together separate it from 1 Split.
3. **Archetype.** split. **Two departures** — it collapses at 1,080 like every A16 split ⚑, and **the
   media goes above rather than below** ⚑, which no other A16 design does.
4. **Responsive.** **1440** plane 1,296; map 560 square flush to the edge; right column 736 on 48
   padding holding name, address, hours, a hairline and the form. **1080** one column: **map above at
   16:9** ⚑, then address and hours, then the form. **834** map 300 tall, plane padding 40. **≤ 767**
   map 220 tall, padding 24, fields 48, field text 16, button full width.
5. **Fields.** `eyebrow` · `heading` · `blurb` · **one entry of `locations[]`** — `name` req ≤ 40 ·
   `address` req ≤ 120 · `hours` ≤ 80 · `mapImage` · **`mapImageDark`** · `mapUrl` — **`coords` dropped,
    the map an upload** ⚑ — plus `phone` and `email`, stored here and drawn in 8, and the form's fields and
   strings. **The first location is the one drawn** ⚑; further entries are kept and 8 Locations is
   named as the design that draws them all.
6. **Controls — six of its own.** Fields (**Message is fixed at Short here** ⚑) — Map side *Left ·
   Right* — Map height *Short 400 · Medium 560 · Tall 720* — Beside the map *Address and hours ·
   Address only · Off* — Depth *Raised · Flat* — Directions link *From address · Custom URL · Off*
   (**From address builds a maps-search URL out of the location's own address** ⚑). Then the location
   item list — **the first entry is the one drawn**, with **Map image** and the optional **Map image
   (dark)** from the Image Picker and **Image focus** in its popover — Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is
   retired into Vertical spacing** ⚑. Quick Controls: Fields · Map side · Beside the map.
7. **Data.** Nothing from Ghost. `locations[]` at **0** → the map half is removed and the plane holds
   the form at full width ⚑, which the panel names as 4 Panel. **1** is the design. **many** → the
   first is drawn, the rest kept, and **the sidebar names which one is on the page** ⚑.
8. **Empty.** No hours → the line goes and the block closes up. **No map image and no coordinates** →
   A19's **Reflow**: the map half is removed rather than drawn empty ⚑; the editor shows the striped
   Plate with its caption so the gap is visible while editing.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths. **The map declares no module** ⚑ — it is
   an `<img>` inside an `<a>`.
10. **A11y.** Heading **h2**; the location name is an **h3** ⚑. **The map image's alt names the
    place, not the picture** ⚑. The address is an `<address>` element. **Focus order is map link,
    address, form** in both arrangements, because *Map side: Right* reorders the DOM, not just the
    flex ⚑.
    **Repeating items** — `locations[]`: one drawn. Add lands last with a placeholder name and a placeholder address ⚑, never seeded from the site;
    Remove on the row; **reorder is meaningful** ⚑, because the first entry is the one on the page.
    **Flagged ⚑** the static-map settlement · map above at ≤ 1,080 · Message fixed at Short · both
    halves matching height · dark re-generating rather than filtering the image.

**Editing.** The eyebrow, heading and blurb, **the location's name and address and its hours line**,
the directions label, the field labels and placeholders on the canvas, the button label and the
consent line; the four form-state strings through **P0·6**. The map's alt names the place, not the
picture.

**Patched, 24 August 2026.** **Directions link** arrives, and **an empty `mapUrl` is no longer a
dead end**. **Fields and Data are amended**: **`coords` is dropped** ⚑ and **the static map is
settled as a user upload** through the Image Picker — Inflozo names no tile provider in v1, so nothing
is generated and nothing is fetched at render — with **`mapImageDark` as an optional second slot**
and **Image focus in the picker's popover, never a hidden field**. Items gain **`phone` and
`email`**, which 8 Locations draws and this design stores. **Empty**: no map image still takes
A19's **Reflow**, and *Directions link: From address* means the missing-URL case no longer exists.
**Member visibility** ships; the delivery group is rebuilt; **A11y** gains the no-script state.

---

### 8 · Locations

1. **Descriptor.** One card per location on a full-bleed surface ground — map thumb, name, address,
   hours, directions. The only design in A16 built for a list of places. **No form.**
2. **Tuple.** `grid-of-N · none · surface · few · top · one card per location`
   Containment `none`: the cards are the *items'* geometry, not the section's — A21·2's rule.
3. **Archetype.** grid-of-N. **One departure** — the section's own padding is 0 and the ground
   carries it ⚑.
4. **Responsive.** **1440** full-bleed surface, inside 96 × 72, three cards at 416 on 24 gutters,
   thumb 132 at 16:9. **834** inside 80 × 40, two-across, **the third wrapping at half width** ⚑.
   **≤ 767** inside 64 × 20, one per row, **thumb 150** ⚑, name 20.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `locations[]` (1–6) · `directionsLabel`. Every form
   field and `socials[]` are stored and not drawn ⚑.
6. **Controls — five of its own.** Columns *Auto · Two · Three* (**no Four value** ⚑) — Map thumbs
   *Show · Hide* — Hours *Show · Hide* — Head *Centred · Flush left · None* — Directions link *From
   address · Custom URL · Off* (**From address builds a maps-search URL out of each card's own
   address** ⚑). Then the locations item list, **the universal trio** and **the Data group**. **No
   delivery group** ⚑ and **no Member visibility** ⚑. **Ground padding is retired into Vertical
   spacing**, which resolves onto the ground's own inside padding — 64 · 96 · 132 inside the surface
   fill — because the section's padding is 0 at every value ⚑. Quick Controls: Columns · Map thumbs ·
   Directions link.
7. **Data.** Nothing from Ghost — **Ghost has no location object** ⚑, which is a finding. **0** → the
   section does not render and the editor says a location is needed ⚑. **1** → one card at 640 at the
   left, and the panel names 7 Map Split. **2–3** is the design. **4–6** wraps at the same card size ⚑.
8. **Empty.** No hours → line and hairline go together. **No map image** → A19's **Reflow**: the card
   starts at its name and the grid's rows re-fit ⚑. No directions URL → the link is not drawn ⚑.
9. **Module.** **none.** ⚑ Static images, text and real links. Nothing to degrade.
10. **A11y.** Heading **h2**; each location name an **h3** ⚑. The card is an `<article>` holding an
    `<address>`; **hours are a `<p>`, not a table** ⚑. **The whole card is not a link** ⚑ — only
    "Directions" is, so the address stays selectable and copyable. Thumb alt names the place.
    **Repeating items** — `locations[]`: Add arrives with content and lands last; **Remove is never
    disabled** ⚑ (patched — the old "disabled at one" rule is retired);
    drag reorders and order is reading order; **1–6, drawn for 2–3**; zero does not render.
    **Flagged ⚑** the inverted ground · zero section padding · no Four column value · the wrap at
    four · the 150 px thumb at 390 · ~~Remove disabled at one~~ (retired) · Ghost having no location
    object · the map settled as an upload and `coords` dropped.

**Editing.** The eyebrow, heading and blurb, **each card's name, address and hours**, **its new
phone and email lines**, and the directions label. Every URL opens the **Link Picker**; nothing here
is Ghost-owned, because **Ghost has no location object**.

**Patched, 24 August 2026.** **Fields**: items gain optional **`phone`** and **`email`**, drawn as
`tel:` and `mailto:` links under the address — **empty drops the line**, so the drawn cards are
unchanged until one is filled — and **`coords` is dropped** with the thumbs settled as **uploads
through the Image Picker** (Image focus in its popover, `mapImageDark` optional, never a filter).
**Directions link** arrives. **Items**: **Remove is never disabled** ⚑, retiring "disabled at one" —
the editor already draws the zero state and says a location is needed. **A11y**: the new lines sit
inside the card's `<address>` as real links, and **the whole card is still not a link** ⚑.

---

### 9 · Slim Bar

1. **Descriptor.** A full-bleed surface strip between hairlines carrying a label, one address and the
   social row on a single line. **No heading, no blurb, no form.**
2. **Tuple.** `bar · none · surface · none · none · one line, the address inline`
   Archetype `bar` is the category's only one. Ground `surface` is what its Ground control can leave,
   and the panel names 6 Details Grid when it does.
3. **Archetype.** bar. **Two departures** — the section's own padding is 0 ⚑, and it stacks at ≤ 767
   rather than compressing ⚑.
4. **Responsive.** **1440** strip full bleed, content 1,296 on a 72 margin, 24 inside, label 19,
   address 16, glyphs 44, total 94. **834** 24 inside, label 17, address 15, line holds. **≤ 767** 20
   inside, **three rows** ⚑ — label, address at 16, glyphs — total 190.
5. **Fields.** `label` (opt, ≤ 20, defaults to `@site.title`) ⚑ · `email` (**req — the whole
   design**) · `phone` · `socials[]`. **Everything else in the category is stored and not drawn** ⚑.
6. **Controls — five of its own.** Strip padding *Compact 16 · Comfortable 24 · Spacious 36*
   (**kept: a strip height is its own ladder** ⚑) — Rules *Above and below · Below only · None* (at
   None the padding rises one named step ⚑) — Phone *Show · Hide* — Socials display *Icons · Short
   labels · Full labels · Off* — Label *Site name · Custom*. Then the socials item list, **the
   universal trio** and **the Data group**. **No delivery group** ⚑ and **no Member visibility** ⚑.
   **The three-value *The strip carries* enum is retired** ⚑ — Phone and Socials display are
   independent rows, so **phone and socials together** is finally expressible and *Off* is where the
   old third value went. **The design's own Ground row became Background role** ⚑; **Vertical spacing
   is the seam above and below the strip — 0 · 24 · 48, drawn at Compact** ⚑; **Top divider is locked
   at None while *Rules* draws an upper rule** ⚑. Quick Controls: Strip padding · Rules · Socials
   display.
7. **Data.** `@site.title` for the label at its default. `socials[]` at **0** → the glyph row goes and
   **the label and address centre in the strip** ⚑. **1** → one box at the right. **many** → six is
   the ceiling.
8. **Empty.** **No email is the one thing this design cannot survive** ⚑ — the section does not
   render and the editor says an address is needed.
9. **Module.** **none.** ⚑ A label, two links and a row of links. Nothing to degrade.
10. **A11y.** **No heading at any level** ⚑ — a one-line strip with a heading would put an empty entry
    in the document outline. The strip is a `<section aria-label="Contact">` ⚑. The address is a
    `mailto:` carrying its full text. Glyph boxes have visually-hidden platform names ⚑. The
    separator is an `aria-hidden` rule, not a character. **The 44 px box is the target; the border is
    decoration** ⚑.
    **Repeating items** — `socials[]`: 0–6, **drawn whenever Socials display is not *Off*** ⚑ — the old
    "drawn only at *The strip carries: Email and socials*" clause went with the enum.
    **Flagged ⚑** zero section padding · the ≤ 767 stack · *Rules: None* raising the padding ·
    ~~three carries values and no fourth~~ (retired for Phone + Socials display) · centring when
    socials are off · the `aria-label` instead of a heading · Top divider locked against *Rules*.

**Editing.** The strip's label, the address and the number. **At *Label: Site name* the label is
`@site.title` — Ghost-owned, so it is not inline-editable and a click says "Edit in Ghost"** ⚑; at
*Custom* it is an authored field and edits in place. The socials' URLs are read-only at *Social
accounts: From Ghost*, for the same reason.

**Patched, 24 August 2026.** *The strip carries* retires into two rows; Ground becomes Background
role; Socials display carries A3's fix and **the two-letter boxes become the neutral stroke
placeholder**; Top divider locks against *Rules*. **Data**: the socials row is drawn whenever Socials
display is not *Off* — the old "drawn only at *The strip carries: Email and socials*" clause is gone
— and **zero socials still centres the label and address in the strip**. **A11y**: the glyph is
`aria-hidden` with the platform name visually hidden, which is the two-letter box's rule kept, and
the strip is still a `<section aria-label="Contact">` with no heading.

---

### 10 · Big Type

1. **Descriptor.** The address at display scale with one short line above it and the social row
   beneath. The category's single display moment, spent on the thing a reader copies. **No form.**
2. **Tuple.** `stack · none · transparent · none · none · the address at display scale`
   Ground `transparent`: the section paints no ground of its own and shows whatever is beneath it —
   the only design in A16 that does.
3. **Archetype.** stack. No departures — one column at every width.
4. **Responsive.** **1440** eyebrow 13, address 76 on a 1,180 measure, rule, social row as labels,
   padding 96. **834** address 46, padding 80. **≤ 767** address 30, social labels wrapping under
   "Also on", padding 64. **Three ladders, one per *Address size* value** ⚑: 64 → 40 → 28 · 76 → 46 →
   30 · 96 → 54 → 32.
5. **Fields.** `eyebrow` · `headingSmall` (the *Heading* value's line) ⚑ · `email` and `phone` (**one of the two is required — it is the whole
   design**, and *Address shown* picks which is drawn ⚑) · `socialsLabel` (default "Also on") ·
   `socials[]`. **Everything else is stored and not
   drawn** ⚑.
6. **Controls — five of its own.** Address size *Large 64 · Display 76 · Full 96* (**Full disabled
   above 24 characters, with the count shown** ⚑) — Alignment *Flush left · Centred* — Above the
   address *Eyebrow · Heading · Nothing* — Socials display *Icons · Short labels · Full labels · Off*
   (**Full labels is the default here** ⚑) — Address shown *Email · Phone* ⚑. Then the socials item
   list, **the universal trio** and **the Data group**. **No delivery group** ⚑ and **no Member
   visibility** ⚑. **Padding is retired into Vertical spacing** ⚑ and **Background role is locked at
   Transparent, with the reason shown** ⚑ — this is the one section in A16 that paints no ground of
   its own. Quick Controls: Address size · Address shown · Alignment.
7. **Data.** Nothing from Ghost. `socials[]` at **0** → row and rule removed together ⚑; **1** → one
   label; **many** → six the ceiling, wrapping to a second line at 390.
8. **Empty.** **No email → the section does not render** ⚑ and the editor says so. No eyebrow → the
   address starts the section. Social off → the rule goes too.
9. **Module.** **none.** ⚑ One `mailto:` link at 76 px and a row of links.
10. **A11y.** **No heading at any level, at any value** ⚑ — including *Above the address: Heading*,
    which is a styled `<p>`. The section is a `<section aria-label="Contact">` ⚑. **The address is
    the link and the link text is the address** — no "email us", so a screen reader announces the
    address itself. Address 13.4:1 light, 8.1:1 dark. **Nothing moves here in any state.**
    **Repeating items** — `socials[]`: 0–6, drawn for 3–5.
    **Flagged ⚑** spending the display moment on the address · no heading at any value · Full disabled
    above 24 characters · three size ladders · wrapping at the `@` rather than shrinking · the
    `transparent` ground.

**Editing.** The eyebrow, the small heading line, **the address itself at display scale**, and the
social row's label — `socialsLabel`, default "Also on". Nothing here is Ghost-owned unless the
socials come From Ghost.

**Patched, 24 August 2026.** **Address shown: Email · Phone** arrives — **the same 64 · 76 · 96
ladder either way**, the link changing from `mailto:` to `tel:`, and **the wrap rule moving from
"at the `@`" to "at a space"** ⚑, because a number has nothing to break on and a broken number is
worse than a smaller one. **Fields and Data are amended**: `phone` joins `email` as a drawn field
here, and **at *Phone* an empty number does not render**, exactly as an empty address does not.
Socials display carries A3's fix with **Full labels named as the default**; **Background role is
locked at Transparent**. **A11y**: the address is still the link and the link text is still the
address, at either value.

---

### 11 · Enquiry Types

1. **Descriptor.** A row of enquiry types above one form on a full-bleed surface ground. The choice
   sets the destination and the line beneath the row; the fields never change.
2. **Tuple.** `form · none · surface · few · none · one radio row per enquiry`
   Item-count `few` is the whole distinction from 4 Panel — same archetype, containment and ground.
3. **Archetype.** form. **Two departures** — the section's own padding is 0 and the ground carries it
   ⚑, and the type row stacks at ≤ 767 ⚑.
4. **Responsive.** **1440** full-bleed surface, inside 96 × 72, three types on one row at natural
   width, note beneath, hairline, form 640. **834** inside 80 × 40, row holds, form 560; **a fourth
   type wraps to a second row and is not compressed** ⚑. **≤ 767** inside 64 × 20, **one type per row
   at full width** ⚑, form 350, fields 48, field text 16, button full width.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `enquiries[]` (2–4) with `label` req ≤ 28 ·
   `address` req · `note` ≤ 60 — plus the form's fields and strings. `socials[]`, the contact rows
   and `locations[]` are stored and not drawn ⚑.
6. **Controls — four of its own.** Fields (**the chosen type is not one of them** ⚑) — Type row
   *Flush left · Centred · Full width* — Message height — The line beneath *Show · Hide*. Then the
   enquiry item list, Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Ground padding is retired into Vertical spacing**, which resolves
   onto the ground's own inside padding — 64 · 96 · 132 inside the full-bleed fill ⚑ — and **the
   design's own Ground row became Background role** ⚑. **In the delivery group the destination is the
   fallback**, because each type carries its own address; with neither, the section is editor-only.
   Quick Controls: Fields · Type row · The line beneath.
7. **Data.** Nothing from Ghost. `enquiries[]` at **0 or 1** → the row is not drawn and the form posts
   to the delivery group's single destination, **which is 2 Centred and the panel names it** ⚑.
   **2–4** is the design. **5 or more** → the field refuses a fifth and **names 13 Directory** ⚑.
8. **Empty.** A type with no note → the line beneath is empty for that type and **the space is not
   reserved** ⚑; choosing a type with a note grows the block by 21 px, which is the one reflow this
   design allows. A type with no address falls back to the delivery group's destination ⚑.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe — **and nothing for the radio row,
   which needs none** ⚑. **The type row is fully functional with no script at all**: it is a fieldset of
   radios and the checked one posts. **The closest module for a segmented control is `tabs`, and it
   is the wrong one** ⚑ — its degradation describes panels, and there are none here. That is a
   finding for the architect, not a licence to name a module.
10. **A11y.** Heading **h2**. The row is a `<fieldset>` with a visually-hidden `<legend>` ⚑ — arrow
    keys move between types, which is radio behaviour and is why this is not a tablist. **The note
    beneath is the fieldset's `aria-describedby` and an `aria-live="polite"` region** ⚑. Selected
    label 4.6:1 on the wash; **the 7% accent wash is decoration and the border carries the state** ⚑.
    The whole row is the 46 px target.
    **Repeating items** — `enquiries[]`: Add arrives with content and lands last; **Remove is never
    disabled** ⚑ (patched — "disabled at two" is retired);
    drag reorders and **the first is selected on load** ⚑; 2–4, drawn for three; zero renders no row.
    **Flagged ⚑** radios not tabs · accent twice · zero section padding · the stacked row at 390 · the
    per-type address overriding the delivery group · the unreserved note line · the registry gap.

**Editing.** The eyebrow, heading and blurb, **each type's label and the line beneath it — selected
on the canvas and edited in place** ⚑, the field labels and placeholders on the canvas, the button
label and the consent line; the four form-state strings through **P0·6**.

**Patched, 24 August 2026.** Ground padding and Ground both retire into the trio, leaving **four own
controls**. **Items**: **Remove is never disabled** ⚑, retiring "disabled at two" — at one type the
row is simply not drawn and the form posts to the destination, which is 2 Centred and the panel names
it — and **label and note edit in place**. The delivery group is rebuilt around the `mailto:` fix,
**and the composed address is the selected type's own** ⚑. **Module**: the form asks for
`contact-form`; **the radio row still declares nothing and needs nothing**, and `tabs` is still
the wrong module for a fieldset with no panels — a finding, not a licence. **Member visibility**
ships. **A11y** gains the no-script state; the fieldset, its hidden legend and its `aria-live` note
are unchanged.

---

### 12 · Boxed

1. **Descriptor.** The form inside a hairline box with no fill and no shadow, with the contact row
   and socials beneath it on the page under a full-width rule.
2. **Tuple.** `form · box · page · none · none · the ask in a hairline box`
   Containment `box` is the whole distinction from 2 Centred (`none`) and 3 Card (`card`).
3. **Archetype.** form. No departures.
4. **Responsive.** **1440** head centred on 720, box 680 with 40 inside, rule at 1,296, contact row
   four-across, socials as glyphs, padding 96. **834** box 640, contact row two-across, padding 80.
   **≤ 767** **head flush left** ⚑, box 350 with 22 inside, contact rows stacked, fields 48, field
   text 16, button full width, padding 64.
5. **Fields.** As 1 Split. `locations[]` and `enquiries[]` are stored and not drawn ⚑.
6. **Controls — six of its own.** Fields — Box width *Narrow 560 · Medium 680 · Wide 1,296* (**at
   Wide the fields stay 640** ⚑) — Contact row *Under the box · Inside the box · Off* (**kept as an
   enum, and the asymmetry with 1 and 4 is recorded rather than resolved by inventing a fourth control
   here** ⚑) — Message height — Socials display *Icons · Short labels · Full labels · Off* — Blurb
   *Show · Hide*. Then the socials item list, Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is retired into Vertical
   spacing** ⚑, and **Background role is the ground under the box, never a fill for it** ⚑. Quick
   Controls: Fields · Box width · Contact row.
7. **Data.** Nothing from Ghost. Contact rows: **0** → the row and its rule go and the box stands
   alone, which is 3 Card without a fill ⚑; **1** → one block at the left, not stretched; **4** is the
   ceiling. Socials 0–6 as everywhere.
8. **Empty.** **Head centred over an empty page below the box is the state to watch** ⚑ — with the
   contact rows empty and socials off the section is head plus box, and it holds. Nothing is
   substituted for what is missing.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths.
10. **A11y.** Heading **h2**; the contact row a `<dl>` ⚑. **The box takes no role and no label** — it
    is a border. Box hairline 1.4:1, which is decoration; **the field borders inside it are the ones
    held to 3:1** ⚑ and they clear it. **The nested failed banner takes `role="alert"` and focus moves
    to it** ⚑.
    **Repeating items** — `socials[]` only: 0–6, drawn for 3–4.
    **Flagged ⚑** the fields carrying the surface step rather than the box · Wide not widening the
    form · the rule running the box width at 390 · the head going flush left at 390 · the nested
    banner's full-strength border.

**Editing.** The eyebrow, heading and blurb, **the four contact rows' labels and values in the
`<dl>`**, the field labels and placeholders on the canvas, the button label and the consent line;
the four form-state strings through **P0·6**, the failed banner drawn nested inside the box.

**Patched, 24 August 2026.** Socials display and **Social accounts** carry A3's fix — **the
two-letter boxes become the neutral stroke placeholder** — and **Blurb** arrives: six own controls.
**Contact row keeps its three values**, including *Off*; 1 Split and 4 Panel took the per-row
toggles this pass named, and extending them here was refused as scope the patch did not ask for.
**Member visibility** ships; the delivery group is rebuilt; **A11y** gains the no-script state, whose
`mailto:` line sits inside the box above the consent line, and the nested failed banner keeps
`role="alert"`.

---

### 13 · Directory

1. **Descriptor.** One ruled row per address — what it is, what to use it for, where it goes — as a
   three-column table on the page ground. **No form.**
2. **Tuple.** `table · none · page · many · none · one row per enquiry address`
   Archetype `table` is the category's only one. Item-count `many`: built for five or more rows and
   holds down to two.
3. **Archetype.** table. **One departure** — at ≤ 767 the rows become stacked blocks and the header
   row is removed ⚑.
4. **Responsive.** **1440** header row at 12 px tracked; rows 220 · note · 320 with 20 above and
   below and a hairline under each; padding 96. **834** 150 · note · 260, row padding 16, padding 80.
   **≤ 767** **stacked blocks, no header row** ⚑, label 19, note 15, address a 32 px link, padding 64.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `enquiries[]` (1–12) · `columnLabels` (defaults
   "What it is", "Use it for", "Where it goes") ⚑. Everything else is stored and not drawn ⚑.
6. **Controls — four of its own.** Columns *Label and address · With the note* — Head *Centred ·
   Flush left · None* — Rules *Every row · Head and foot* — Row height *Compact 14 · Comfortable 20 ·
   Spacious 28* (A9·1's ladder). Then the enquiry item list, **the universal trio** and **the Data
   group**. **No delivery group** ⚑ and **no Member visibility** ⚑. **Padding is retired into Vertical
   spacing** ⚑. Quick Controls: Columns · Row height · Rules.
7. **Data.** Nothing from Ghost — **Ghost exposes no author emails to a theme** ⚑, so this table
   cannot be generated from the site's users and every row is authored. That is a finding. **0** → the
   section does not render ⚑. **1** → header removed, a labelled pair, 9 Slim Bar named. **2** → the
   table holds and 11 Enquiry Types is named. **3–12** is the design.
8. **Empty.** A row with no note → the cell is empty and **the row keeps its height** ⚑. At *Columns:
   Label and address* the notes are kept and not drawn ⚑. No head → the header row starts the section.
9. **Module.** **none.** ⚑ A table of `mailto:` links. Nothing to degrade — and this is the design
   that works when the reader has no mail client, no JavaScript and the form service is down, which is
   why the panels offer it as the fallback A16 always has.
10. **A11y.** Heading **h2**. **A real `<table>` with `<th scope="col">`** ⚑ — this is tabular data
    and the one place in A16 where that is true. At ≤ 767 **the same table is restyled with CSS, not
    rebuilt** ⚑; the header cells become visually hidden and stay in the accessibility tree.
    Addresses carry their own text. Header 5.4:1, labels 13.4:1, notes 5.4:1.
    **Repeating items** — `enquiries[]`: **shared with 11** ⚑. Add seeded, lands last; Remove on the
    row, never disabled; drag reorders; 1–12, drawn for 3–6; zero does not render.
    **Flagged ⚑** sharing 11's list · the 390 restyle · header removed at one row and at 390 · notes
    kept at two columns · Ghost exposing no author emails.

**Editing.** The eyebrow, heading and blurb, **the three column headers** — `columnLabels` is
content, not chrome ⚑ — and **every row's label, note and address: click a cell and type** ⚑, with
the P0·1 toolbar on the text and the Link Picker on the address.

**Patched, 24 August 2026.** **Items**: the list is the shared **P0·3** one — Add arrives with
content and lands last, **Remove is never disabled**, drag reorders — and **all three cells plus the
headers edit in place**, which is what a table of authored addresses needed and did not have. **No
module, no delivery group, no member row**: every cell is already a real `mailto:` link, and this
is the design that works with no mail client, no script and a form service that is down. **Ghost
exposes no author emails to a theme** ⚑ — the finding stands, and the table is authored row by row.
**A11y** is untouched: a real `<table>` with `<th scope="col">`, restyled rather than rebuilt at
390.

---

### 14 · Reasons

1. **Descriptor.** Head and form in a standing 640 column with one to three authored lines numbered
   and ruled in a 480 column beside them. A6·11's reasons list, carried verbatim.
2. **Tuple.** `split · none · page · few · none · three reasons beside the form`
   Item-count `few` is the whole distinction from 1 Split, which is `none` on the same four other
   slots.
3. **Archetype.** split. **Two departures** — it collapses at 1,080 ⚑, and **the second column goes
   above the form, not below it** ⚑.
4. **Responsive.** **1440** 640 · 96 · 480; head measure 560; reasons at 17 with 20 above and below
   on hairlines; padding 96. **1080** one column, **reasons above the form** ⚑. **834** padding 80,
   heading 34. **≤ 767** padding 64, heading 28, reasons 16 with 16 above and below, fields 48, field
   text 16, button full width.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `reasons[]` (1–3, ≤ 40 characters each, text only) ⚑
   · the form's fields and strings. The contact rows, `socials[]`, `locations[]` and `enquiries[]`
   are stored and not drawn ⚑.
6. **Controls — five of its own.** Fields — Reasons column *Right · Left* — Reasons *Numbered ·
   Ruled · Plain* (**no icon value at any setting** ⚑) — Message height — Blurb *Show · Hide*. Then
   the reasons item list, Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Padding is retired into Vertical spacing** ⚑. Quick Controls:
   Fields · Reasons column · Reasons.
7. **Data.** Nothing from Ghost. `reasons[]` at **0** → the column is not drawn and the form takes 640
   at the left with 656 empty, **which the panel names as 1 Split** ⚑. **1** → one row, ruled top and
   bottom, at the column's top — **a supported state, not a degraded one** ⚑. **2–3** is the design;
   **Add is disabled at three** ⚑.
8. **Empty.** As 2 Centred for the head. **A reason cannot be empty** — Add never produces a blank
   line and an emptied line is removed on blur with an undo ⚑, which is A6·11's behaviour carried
   verbatim.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths. **The reasons declare nothing** — they are
   three lines of text.
10. **A11y.** Heading **h2**. **The reasons are an `<ol>` at *Numbered* and a `<ul>` at *Ruled* and
    *Plain*** ⚑ — the numbers are meaningful order at one value and decoration at the others, and the
    markup says which. The generated numbers are `::before` content on the list marker, not typed
    text ⚑. **Focus order below 1,081 is head, reasons, form**, which matches the visual order because
    the DOM is reordered, not the flex ⚑.
    **Repeating items** — `reasons[]`: A6·11's repeater verbatim. Add disabled at three ⚑, never
    blank, lands last; Remove on the row, never disabled; drag reorders and **reordering renumbers**
    ⚑; 1–3, drawn for three.
    **Flagged ⚑** carrying A6·11's list rather than inventing one · reasons above the form below
    1,081 · the 1,080 collapse · no icon value · reordering renumbering · A9 FAQ named for questions.

**Editing.** The eyebrow, heading and blurb, **each reason line, edited in place in the column** ⚑,
the field labels and placeholders on the canvas, the button label and the consent line; the four
form-state strings through **P0·6**.

**Patched, 24 August 2026.** No new own control — **Blurb was already here** — so the change is the
list and the group: **A6·11's repeater is stated as the P0·3 item list** (Add arrives with content and
**is disabled at three** with the reason shown, **Remove is never disabled**, an emptied line removed
on blur with an undo, drag reordering renumbering), and **it stays the one repeating list in A16 with
no icon slot** ⚑. **Member visibility** ships; the delivery group is rebuilt; **A11y** gains the
no-script state and the `<ol>`/`<ul>` rule is unchanged.

---

### 15 · Cover

1. **Descriptor.** A full-bleed photograph under a warm scrim carrying a centred head and a two-field
   form in white. The category's one image moment.
2. **Tuple.** `form · none · image · none · background · the ask over a cover photograph`
   Ground `image` and media `background` are unique in A16; 7 Map Split is the only other design with
   media at all and its placement is `left`.
3. **Archetype.** form. **Two departures** — the section's own padding is 0 and the image carries it
   ⚑, and **the mobile image is taller than the tablet one** ⚑.
4. **Responsive.** **1440** image full bleed 700 tall, scrim Medium, head centred on 520, form 560,
   two fields at 46, message 96, padding 0. **834** image 660, form 520, heading 34. **≤ 767** **image
   720** ⚑, form 350, fields 48 and stacked, field text 16, button full width, heading 28.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `image` (**required — the design is the
   photograph**) · `imageAlt` · `imageFocus` (**Centre · Top · Bottom — now a control as well as a field** ⚑) ·
   the form's email and message strings. **Name, subject and phone are stored and never drawn** ⚑,
   along with the contact rows, `socials[]`, `locations[]` and `enquiries[]`.
6. **Controls — eight of its own.** Image height *Short 560 · Medium 700 · Tall 840* (**kept: the
   picture, not the seam** ⚑) — Fields **fixed at *Email and message*, shown disabled** ⚑ — Form
   position *Centred · Flush left* — Scrim *Light · Medium · Heavy* (**Light disabled against an image
   lighter than 60% mean luminance, with the measurement shown** ⚑) — Message height *Short · Medium*
   (**no Tall** ⚑) — Head *Show · Hide* — Image focus *Centre · Top · Bottom* ⚑ — Blurb *Show · Hide*
   (**disabled at *Head: Hide***). Then Then **the universal trio** — Background role · Vertical spacing · Top divider — the **Delivery
   group** and the **Data group**, none of which count toward the budget. **Background role is locked at Image, with the
   reason shown** ⚑; **Vertical spacing resolves onto the head-and-form block's inset inside the image
   — 64 · 96 · 132, clamped so the block stays out of the top quarter** ⚑. Quick Controls: Image
   height · Scrim · Form position · Image focus.
7. **Data.** Nothing from Ghost. No repeating unit. **No image** → A19's vocabulary: **Hand off** ⚑ —
   the section renders as 2 Centred on the page ground and **the sidebar says which design is on the
   page and why** ⚑, because a cover design with no cover is not a degraded cover, it is a different
   section.
8. **Empty.** No eyebrow or blurb → each absent. **Head: Hide** → the form alone over the image,
   centred, and the `<form>` takes `aria-label="Contact Orbit Weekly"` ⚑. **No `imageAlt`** → the
   image is decorative and takes `alt=""` ⚑, because the head above it already says what the section
   is.
9. **Module.** **`contact-form` — ARCHITECT: registry addition** ⚑, edit-safe. The declared `member-form` posts to Ghost's members endpoint and is the wrong module; the no-script state is designed on both delivery paths. **The scrim's one-step deepening at focus
   is CSS** ⚑ and respects reduced-motion by holding the deeper value rather than transitioning to it.
10. **A11y.** Heading **h2**. **Derived contrasts, measured under Medium scrim on the darkest quarter
    of the image**: heading 12.1:1, blurb 8.4:1, placeholder 4.8:1, button label 12.6:1, field border
    3.2:1 ⚑. **The accent is refused over an image at every scrim value** ⚑. Focus takes a 1.5 px
    white border and the scrim deepens; the button keeps the library ring in white. **Text is never
    placed over the top quarter of the image** ⚑, where the scrim is weakest.
    **Repeating items** — none drawn; all four lists kept.
    **Flagged ⚑** zero section padding · the taller mobile image · Fields fixed and shown disabled ·
    *Scrim: Light* self-disabling · `imageFocus` as a field · Hand off with no image · no dark-mode
    image variant · the top-quarter rule.

**Editing.** The eyebrow, heading and blurb, the two field labels and their placeholders on the
canvas, the button label and the consent line — all in white over the scrim; the four form-state
strings through **P0·6**. **The white button takes an optional P0·2 icon** before or after its label,
off by default ⚑.

**Patched, 24 August 2026.** **`imageFocus` is surfaced as a control** ⚑ — it was a field with no
UI at all — reachable from the panel and from the Image Picker's popover, with **Top named as the
value to watch**, since text never sits over the top quarter where the scrim is weakest. **Blurb**
arrives, disabled at *Head: Hide*. **Background role locks at Image**, with the reason shown —
a photograph is the design ⚑, and **with no image the design still renders as itself**: the scrim
becomes the ground and the panel advises 2 Centred rather than handing anything to it ⚑ — **Image height keeps its own name** and **Vertical spacing becomes the
block's inset inside the picture**. **Member visibility** ships; the delivery group is rebuilt;
**A11y** gains the no-script state, whose `mailto:` line is white on the scrim at 8.4:1 and sits
above the consent line. **There is still no dark-mode image variant** ⚑ — the scrim deepens instead.

---

## Findings for the architect

1. **Ghost cannot receive a form.** ⚑ Its theme layer has no handler, and
   `/members/api/send-magic-link/` takes an email and nothing else. Every A16 form posts to a
   `mailto:` or to a third-party endpoint the user pastes. **This is the largest finding in the
   category** and it shapes the delivery group, the default, and the failed state.
2. **The registry has no contact-form module — and `member-form` is not a near miss.** ⚑ **Amended
   by the controls patch.** The ten form designs declared it, flagged; the patch says plainly that it
   **posts to Ghost's members endpoint**, which is neither a mail app nor a form service, so a build
   reading it literally posts to the wrong place. **`contact-form` is requested and no other name is
   coined.** It owns one thing nothing in the registry covers: **composing a `mailto:` URL out of
   the fields at *An email address*** — and, when it does not run, **leaving the visible "Email us
   at …" `mailto:` line and no submit button** ⚑.
3. **The registry has no segmented-control module.** ⚑ 11 Enquiry Types looks like `tabs` and is a
   radio group, so it needs no module at all. **It costs nothing today**, but a segmented control
   that writes a form value is a common shape — enquiry type, subject, department — and the registry
   has no entry for it.
4. **Ghost has no location object.** ⚑ 8 Locations and 7 Map Split author every address. Nothing in
   Ghost's settings or content API carries a postal address, so there is no fallback and no generated
   content.
5. **Ghost exposes no author emails to a theme.** ⚑ 13 Directory cannot be generated from the site's
   users; every row is authored. An author directory with contact addresses is not buildable, and A21
   Author Showcases will meet the same wall.
6. **Spam is a service's problem and A16 has no service.** ⚑ The section adds a honeypot and nothing
   else — **no captcha at any value**, because a captcha is a third-party script. A publication that
   gets flooded needs a form service, and the panel says so.
7. **A16 cannot know what sits above or below it.** ⚑ The same route-awareness gap A21, A22 and
   A26–A29 each raised: the seam is A17's ladder, and a page that stacks 9 Slim Bar under A3·4's
   newsletter band gets two strips in a row with no way for either to know.

8. **There is no site address for a theme to fall back to.** ⚑ **New in the controls patch.** The
   original settlement promised one and Ghost does not expose it. `deliveryTarget` becomes an
   **Inflozo project setting, promotable to a Ghost Admin custom setting (text)** so an owner can
   change it without a redeploy — validated per mode, an email address or an `https` URL — and
   **until it is set the ten form designs are editor-only and the page cannot publish**. A publish
   gate driven by a section-level setting is new in the library and belongs to the architect.
9. **Inflozo names no map tile provider in v1.** ⚑ **New in the controls patch.** So the static map
   in 7 and 8 is **an image the owner uploads** through the Image Picker: nothing is generated and
   nothing is fetched while a reader is on the page. `coords` is dropped from the item, **Image
   focus** lives in the picker's popover, and the dark variant is **a second optional upload rather
   than a filter**. If a provider is ever named, the upload slot is where a generated image would
   land.

**One thing A16 wanted and refused to invent:** a **file-upload field** ⚑. Readers sending
corrections attach documents; nothing in the stack can store a file, and a form service's upload
limits are the service's business rather than the section's. It is refused category-wide with that
reason, and it is a finding rather than a control.

---

## Component inventory

Cumulative. Reused components are listed with the category that set them.

| Component | What it is | First set |
|---|---|---|
| Eyebrow | 13 px uppercase tracked .08em in `text-muted` | A1·1 |
| Primary button · ghost action | Accent fill 15/600 at 46 px; carried-colour fill on a band or an image | A1·1, A6·5 |
| Icon button | 44 px box at the pack radius, bare or outlined | A1·14 |
| Focus ring | 4 px accent ring; **suppressed on form fields**, which take a 1.5 px border | A2·5, A6 |
| Striped image plate | The placeholder and its mono crop caption | A1 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132 | A17 |
| On-contrast derivation | Every colour on a band from two `contrast` tokens | A17·7 |
| Surface card | Radius token, `md` shadow in light, hairline in dark | A19·3 |
| Surface plane | Surface + hairline + `md` shadow; flat in dark; a full-width fill is a ground | A26·3, A27·4 |
| Warm scrim | Warm dark gradient, strongest at the foot, white over it | A20·13 |
| Contact block | **Four fixed rows — post, email, phone, replies — 12 px labels, no repeater** | A3·10 — carried verbatim |
| Social list and its picker | 0–6 authored entries plus Ghost's read-only rows; **Icons · Short labels · Full labels · Off**, glyphs from the Icon Picker, Add opens a platform picker and never a blank row | A3·1, amended by A3's fix |
| Reasons list | 1–3 authored lines, ≤ 40 ch, text only, with its repeater | A6·11 |
| Ledger row | A ruled row with a label column and a value column | A9·15 |
| Repeater | Drag handle, remove, *Add …* at the foot, seeded not blank | A3 |
| Missing-image vocabulary | Reflow · Plate · Hand off | A19 |
| Disabled-value convention | A value that would fail is disabled with its measurement shown | A9·8, A29·3 |
| **The labelled field** | **13 px label in `text`, 8 px above a 46 px field at the pack radius; 48 and 16 px stacked** | **A16 — new** |
| **The message field** | **The same label over a 96 · 144 · 216 px box; the only field whose height is a control** | **A16 — new** |
| **The seven form states** | **Empty · focus · invalid · submitting · sent · failed · no destination** | **A16 — new, extending A22's seven for a form Ghost cannot receive** |
| **The failed banner** | **A `text`-bordered block above the first field keeping everything typed, offering the `mailto:`** | **A16 — new** |
| **The consent line** | **One 13 px line, or a 20 px checkbox in a 44 px row, under the button** | **A16 — new** |
| **The static map plate** | **A generated image inside a link, never an embed; re-generated for dark, never filtered** | **A16·7 — new** |
| **The location card** | **16:9 map thumb flush to the top, name `h3` 22, address, hours under a hairline, Directions** | **A16·8 — new** |
| **The enquiry radio row** | **A fieldset of 46 px radio rows that looks like tabs and is not one** | **A16·11 — new** |
| **The delivery group** | **Four shared rows — Where it goes · The destination · After sending · A consent line — with Spam and the form-state copy as captions beneath** | **A16 — new, rebuilt by the controls patch** |
| **The composed `mailto:`** | **The script builds the URL out of the fields; the `mailto:` link itself works with no script at all** | **A16 — new in the controls patch** |
| **The no-JavaScript notice** | **A hairline box in the submit button's place: one line saying the form needs JavaScript to send, the `mailto:` link beneath it, and no submit button** | **A16 — new in the design patch pass** |
| **The destination setting** | **A project setting, promotable to a Ghost Admin custom setting, that blocks publishing until it is set** | **A16 — new in the controls patch** |
| **The per-row contact toggles** | **One toggle a row over A3·10's fixed four, with an optional icon slot a row (mail · phone · pin · clock)** | **A16 — new in the controls patch** |
| **The directions link** | **From address · Custom URL · Off — From address builds a maps-search URL out of the address** | **A16·7, A16·8 — new in the controls patch** |
| The universal trio | Background role · Vertical spacing · Top divider, outside every design's own list; locked with the reason shown where a ground is the design | Library-wide |
| Inline text toolbar | Bold · italic · underline · link, the link popover carrying Open in new tab and rel nofollow / noreferrer / sponsored | P0·1 |
| Icon slot and Icon Picker | A slot a design declares, its size / colour-role popover, and the Social / Brands group A16's socials draw from | P0·2 |
| Item list controls | Add arrives with content · Remove never disabled · drag reorder · per-item content only | P0·3 |
| Editor state switcher | Empty · Invalid · Sent · Failed, edited in place on the canvas instead of a Preview control | P0·6 |
| **The stacked form** | **Fields 48 px, 16 px apart, field text 16, button full width — the ≤ 767 geometry** | **A22 — carried, A16 extends it to five fields** |

---

## Reconciliation notes

**Frames changed in this pass — sixteen.**

- `A16-0 Category Proof` — a new **controls-reconciliation** section above the settlements (four
  tiles: the universal trio and the retired rows · the `mailto:` settlement corrected · editing,
  strings and icons · items, members and the control budget); settlement 2's "Seven states" restated
  as **eight**; settlement 3's fallback sentence withdrawn; **the roster's CTL column restated to own
  controls only (4–8) and its MODULE column to `contact-form` ⚑ req.**, with a caption under the
  table; **findings 8 and 9 added and finding 2 rewritten**.
- `A16-1 Split` · `A16-2 Centred` · `A16-3 Card` · `A16-4 Panel` · `A16-5 Contrast Band` ·
  `A16-6 Details Grid` · `A16-7 Map Split` · `A16-8 Locations` · `A16-9 Slim Bar` ·
  `A16-10 Big Type` · `A16-11 Enquiry Types` · `A16-12 Boxed` · `A16-13 Directory` ·
  `A16-14 Reasons` · `A16-15 Cover` — **all fifteen control panels**: the **universal trio** drawn
  outside each list (Background role locked on 5, 10 and 15; Top divider locked on 9 against
  *Rules*); **Padding, Band padding, Ground padding and the two Ground rows retired into it**; the
  **delivery group rebuilt** on the ten form designs (the composed `mailto:`, the project-setting
  destination, Spam and the form-state copy as captions, and the
  **ARCHITECT: registry addition (`contact-form`)** callout); new **EDITING**, **BEHAVIOUR** and
  **DATA** groups on all fifteen (Member visibility on the ten; **Social accounts: From Ghost ·
  Authored** on 1, 5, 6, 9, 10 and 12); the item lists restated as **P0·3** with **Remove never
  disabled**; the footer control count and Quick Controls restated; the settles card carrying a
  **Controls patch** banner; and **a new "Reconciled · 24 Aug 2026" card at the head of every design's
  spec section**. Per design: per-row **Contact rows** and **Row icons** on 1, 4 and 5 · **Cell icons**
  on 6 · **Socials display** on 1, 5, 6, 9, 10, 12 · **Blurb** on 1, 3, 4, 5, 12, 15 · **Directions
  link** and the settled map upload on 7 and 8 · **phone and email** on the location items ·
  **Phone** and **Socials display** replacing *The strip carries* on 9 · **Address shown** on 10 ·
  in-place item editing on 11 and 13 · **Image focus** on 15.

**Three drawn marks changed, and nothing else was redrawn.** The two-letter social boxes in 1, 5, 9,
10 and 12 became **the neutral stroke placeholder A3's frames use** (the real glyph is the Icon
Picker's); the **no-destination** state tile now says the section cannot publish; and the ten form
designs' states frames gained **a no-script tile** — the fields, the visible "Email us at …" line and
the un-rendered button — which is why the category now owns **eight states, not seven**. Everything
else the patch added ships off or unchanged at its default: Row icons and Cell icons Hide, Top divider
None, the button icon slots empty, Blurb Show, Image focus Centre, Address shown Email, and the location `phone` and `email`
empty. **If the build wants a drawn phone line on a location card, or a drawn row icon, those are
frames this pass did not draw.**

**Where this patch and the category's existing rulings disagreed, one line each.**

1. **"`<form method="post" action="mailto:…">` posts natively with JavaScript off" versus the
   browser's actual behaviour.** The patch wins and the old claim is withdrawn: browsers answer that
   post with a blank draft or with nothing. **The script composes the `mailto:` URL; the no-script
   state is a visible line and no button.** The native-POST claim survives at *A form service* only.
2. **"`member-form`, the closest module" versus `contact-form`.** The patch wins outright: the
   declared module posts to Ghost's members endpoint, so it is not a near miss but the wrong
   destination. **`contact-form` is a request, drawn as ARCHITECT on every form panel**, and no
   other name is coined.
3. **"No destination is editor-only; the published page falls back to the site's own email" versus
   Ghost's surface.** The fallback did not exist. `deliveryTarget` becomes a **project setting,
   promotable to a Ghost Admin custom setting**, and **an unset destination blocks publishing**
   rather than silently mailing somewhere.
4. **Settlement 2's "seven states" versus the no-script rendering.** Both stand, differently:
   **eight states now**, the eighth being what the ten form designs render at *An email address* with
   script off. Nothing about empty, focus, invalid, submitting, sent, failed or no destination
   changed.
5. **Per-design Padding versus universal Vertical spacing.** The duplicate row goes in ten designs.
   **5's Band padding and 8's and 11's Ground padding resolve onto it** — same three values, one name
   — while **Plane padding (4), Strip padding (9), Card width's inside padding (3) and Image height
   (15) keep their own names** as genuinely different ladders. **On 9 and 15 Vertical spacing had to
   be given a meaning**: the seam above and below the strip (0 · 24 · 48, drawn at Compact) and the
   content block's inset inside the image.
6. **Per-design Ground rows versus the universal Background role.** 9's and 11's rows retire into it.
   **5, 10 and 15 lock it with the reason shown** — an inverted band, a transparent ground and a
   photograph are each the design — which is the library's convention that a locked control states
   its reason where a missing one cannot.
7. **The Contact-block enum versus per-row toggles.** The toggles win in **1, 4 and 5**, as the patch
   named. **4 loses its *Off* value**, which all four toggles off now says. **12 Boxed keeps its
   three-value placement enum and gains no toggles** — the patch did not name it, and inventing a
   fourth control there was refused: **the asymmetry is recorded here rather than resolved quietly**.
8. **"`replyHours` is stored and not drawn on the band" versus the Replies toggle.** The toggle wins
   and the field is drawable at last; **it ships off on 5**, so the three drawn rows stand and the
   band grows by one row when it is turned on.
9. **9 Slim Bar's "three carries values and no fourth" versus two independent rows.** The enum is
   retired. **Phone: Show · Hide** and **Socials display: Icons · Short labels · Full labels · Off**
   make *phone and socials together* expressible, and **Off is where the old third value went** — so
   the category's socials fix and the patch's toggle request land in one row rather than two.
10. **"Remove is disabled at one location / at two enquiry types" versus the shared item controls.**
    The library rule wins: **Removal may empty a list**, because the editor already draws the zero
    state — 8 does not render and says a location is needed; 11 stops drawing the row and posts to the
    destination. **Add is still disabled at a ceiling** (six socials, four enquiry types, three
    reasons), which is a limit and not a defence.
11. **"`imageFocus` is a field, not a control" (15) versus ground rule 10.** The rule wins: it is a
    control **and** a field, reachable from the panel and from the Image Picker's popover. Nothing
    about the top-quarter text rule changed — it is why **Top** is the value the panel warns about.
12. **"`coords`, and a generated static map" versus a named provider.** Since **no provider is
    named in v1**, the map is **an upload**: `coords` is dropped, the dark variant is a second
    optional slot, and "re-generated for dark, never filtered" is restated as **"uploaded for dark,
    never filtered"**.
13. **The 4–7 control norm versus the PRD's ~15.** Lifted. Own controls now run **four (11, 13) to
    eight (4, 5, 15)**, plus the trio, the item list, the delivery group and the Data group; **Quick
    Controls stay three to five** and are named on every panel footer.
14. **Rule 7's "remove every Preview-type control" versus A16's panels.** **Nothing to remove** — the
    category never shipped one. Recorded so the audit is complete; the four form-state strings were
    already meant to be edited in place, and now say so by naming **P0·6**.
15. **Rule 9's Member visibility versus A16's five formless designs.** It ships on the ten that draw a
    form and **is absent from 6, 8, 9, 10 and 13** ⚑, recorded rather than invented: they carry no
    action, and a members-only page is A32 Paywall's ground.
16. **Ground rule 4's "Ghost-owned content is never inline-editable" versus A16's data surface.** A16
    reads almost nothing from Ghost, so the rule lands in exactly two places: **9 Slim Bar's label at
    *Site name*** and **any social row taken From Ghost**. Both answer a click with **"Edit in
    Ghost"**; everything else in the category is authored and edits in place.
17. **"Twenty-six authored fields" versus the patched field list.** Restated: **thirty-seven fields,
    one project setting and one Ghost value**. Switching between any two designs still preserves
    everything typed, which was the point of the count rather than the number itself.

---

## Patch notes — design patch pass, 30 August 2026

Every change in this pass, with the **name** of the rule that required it. Where a ruling could not
be applied without inventing a decision, it is written here as an **open question** and asked at the
foot of the pass rather than guessed.

**Numbering.** Unchanged: **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15**. No gap
was created or closed, no number reused, nothing renumbered.

### What changed

1. **A theme never prints a member's own details into the page** — the delivery group's *Prefill for
   members* row is **deleted in all ten form designs**, and `prefillMembers` leaves the field list.
   **The fields start empty for every reader**, signed in or out. *Member visibility* loses its
   sentence about prefill never firing at *Logged out*: there is nothing left to fire. The group is
   now **four rows and two captions**. Frames: all ten form panels, the proof frame's delivery tile
   and its field table.
2. **The no-JavaScript notice** — at *An email address* the loose "Email us at …" line becomes **a
   small designed notice**: a hairline box in the submit button's place, one line saying the form
   needs JavaScript to send, the `mailto:` link beneath it, and the muted sentence that says what
   script adds. The submit button is still not rendered. **At *A form service* nothing changes** —
   that form posts natively and needs no notice. Frames: the no-script tile in all ten form designs.
3. **The no-JavaScript notice**, second half — **the sent, error and loading states are untouched.**
   Only the "works without JavaScript" promise around them was wrong, and it was already withdrawn
   by the controls patch. The `mailto:` link stays and **works with no script at all**; what script
   adds is the pre-filled draft, composed out of the fields.
4. **Some fields we drew do not exist** — a new location arrived **seeded with the site's own city**
   in 7 Map Split and 8 Locations. **No Ghost setting carries an address or a city**, so the seeding
   is withdrawn: Add still **arrives with content and never a blank card**, now **a placeholder name
   and a placeholder address**. Frames: 7's and 8's item lists, the proof frame's `locations[]`
   entry, and this document's repeating-items section.
5. **No design ever turns into another design** — one phrase survived the earlier passes and is
   deleted: **15 Cover's "a cover with no cover still hands off to 2 Centred"**. With no image the
   design renders as itself, the scrim becoming the ground, and **the panel advises 2 Centred**
   rather than handing it anything.
6. **The two free designs are the owner's choice** — **ruled by the owner on 30 August 2026: 2
   Centred and 9 Slim Bar.** One centred form and one line carrying the address: a free site can
   ship either without a photograph, a map or a list. The roster marks both and carries the line the
   merge reads.
7. **The no-JavaScript line, design by design** — a new table above the tuple statement states, for
   each of the fifteen, what a visitor without JavaScript gets. Nothing in it is new behaviour except
   the notice; the five formless designs are recorded as needing no script at all.

### The rules that land nowhere in A16, recorded rather than applied

- **Avatars with no photograph** — A16 draws no person at any value.
- **The Remove button never greys out** — already true in all four item lists since the controls
  patch retired the two "disabled at" rules. Add is still capped, which is a limit and not a defence.
- **Slider labels** — every scale row already names what it affects: Message height, Card width,
  Plane padding, Strip padding, Image height.
- **Gap names are Tight · Normal · Loose** — **A16 has no Gap row**, so there is nothing to rename.
- **Item counts are a number picker** — the four item lists carry their own numbers and ceilings;
  6 Details Grid's *Columns* divides one row into columns rather than counting marks, which is the
  split ruled on 30 August across the library.
- **A design may offer fewer choices on a shared control, and must say why** — re-checked on all
  fifteen: Background role locked with its reason on 5, 10 and 15; Top divider locked on 9 against
  *Rules*; *After sending* disabled at *An email address*. **The swatch row is called Base** —
  A16 has no swatch row — and **there is no Inherit choice anywhere in the category**.
- **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** — **A16 draws no
  sign-up button, no subscribe button and no Portal link.** *Member visibility* decides who sees the
  section, not what it posts.
- **Ghost's templates cannot count, add or remember** — nothing published by A16 is counted, added or
  remembered; there is no arithmetic in any of the fifteen.
- **CSS cannot see content** — the two reorders the category declares (7's map above the form, 14's
  lines above it) are **one document order at every width**, decided by the panel and not by the
  window.
- **Inside a blog post's body we own the stylesheet and nothing else** — A16 is a page section and
  never renders inside a post's body. A33 Koenig Card Treatments owns that ground.

### The three questions this pass raised, and the rulings — 30 August 2026

**1 · Which two designs are free. Ruled: 2 Centred and 9 Slim Bar.** One centred form and one line
with the address inline; neither depends on the customer having good photography, and one of the two
needs no form at all. Recorded in the roster as **`**[Free] designs:** 2 Centred · 9 Slim Bar`**,
which is the line the merge reads.

**2 · Whether the no-JavaScript notice replaces the fields or stands in the button's place. Ruled:
the fields stay and the notice takes the submit button's place.** As drawn in all ten form designs —
the reader sees the shape of what was asked for, with a working `mailto:` one line below it, and
nothing moves for a reader who does have script.

**3 · What the notice offers in 11 Enquiry Types. Ruled: the section's own destination.** A template
cannot read which radio a visitor picked, so the notice prints one address that always works and
whoever reads it forwards the odd message. The per-type addresses stay on the items and are used on
the script path.

**No open questions remain in this category.**
