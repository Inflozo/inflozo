# A30 Members Pages — written specification

13 designs · Paper pack · drawn 23 August 2026 · **controls reconciled 25 August 2026**

The frames are `A30-0 Category Proof.dc.html` and `A30-1` … `A30-13`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**The controls-reconciliation pass.** The category was audited design by design against the PRD's
control vocabulary and Ghost's verified data surface, thinking like a user editing their own site.
It reuses the shared editor primitives **by name**, never redesigning them: **P0·1** the inline text
toolbar and its Ghost-aware link popover, **P0·2** the icon slot and Icon Picker (and its button-icon
rules), **P0·3** the item-list controls and the Ghost-sourced list card, **P0·4** the member-aware
action editor — which lands nowhere in A30, and why is stated — **P0·5** the "Populate from…" data
panel, **P0·6** the editor state switcher. What each design gained is in a **Reconciled** paragraph
at the foot of its entry, and the frame-by-frame list is in **Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(3 Card in three packs, light and dark), the two stress frames, the roster, the component inventory,
the four settlements in full, and the reconciliation summary. The shared field list is repeated below
because the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A29 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A30 is

**Three routes, one design.** Every A30 design draws the signup page, the sign-in page and the
account page: a publication picks one design and gets all three, from one field list. That is the
category's shape, and it is why there are 13 designs rather than 39.

**The boundary, stated on every frame.** Signup and sign-in are themeable — Ghost pages on
`custom-signup.hbs` and `custom-signin.hbs` ⚑. The account page is themeable and **display-only**.
Everything that changes a subscription — checkout, plan changes, billing, card detail, email
changes, newsletter preferences — **is Ghost's Portal, is not themeable, and is not drawn** ⚑. The
theme draws the trigger; Portal draws the rest, over the page.

A30 inherits **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96
· 132, 80 at 834, 64 at 390); **A16's 46 px field**; **A1's primary button, ghost action, avatar
with its initials fallback, and eyebrow**; **A5·5's split head and A5·11's list treatments**;
**A7·1's tier card and A7·3's tier row, verbatim**; **A9·15's ledger row**; **A12·10's directory
column**; **A19·3's surface plane**; **A20·13's warm scrim**; **A17·7's on-contrast derivation**;
**A26·3 and A27·4's call that a full-width plane is a ground rather than a containment**; **A29·5's
hand-off rule**. **A30 adds eleven components to the vocabulary** (proof frame) **and nothing else** —
the eleventh is the one-time code panel added in this pass.

### The four settlements (§8 of the brief)

**1 · Which pages are themeable.** Themed: `/signup/`, `/signin/`, `/account/`. Portal's: Stripe
checkout, plan changes, billing, email changes, newsletter preferences, and Ghost's own floating
account button. **Every action on the account page that would write something is an outline button
with `PORTAL ↗` beside it**, in all thirteen designs ⚑.

**2 · The form states.** Seven at first draw, **eight after the reconciliation pass**: sign-in · sent
· **sent with one-time code entry** · expired · invalid · focus · already-signed-in ·
no-JavaScript. Sending is a ninth and is the button's label change alone ⚑. **Sent replaces the
field in place** with a panel carrying the address back and "Send another link" — never a disabled
field with a message under it. **Expired is read from the query string**
(`?action=signin&success=false`) and is therefore **JS-only** ⚑; without JavaScript the reader gets
the plain form, which is the same recovery in one step fewer. **Invalid is the browser first**
(`type="email"`), then Ghost's reply; **no theme-side domain checking** ⚑. **A signed-in member
never sees a signup form** ⚑. **Every one of the eight is reached in place through P0·6's state
switcher**, so its copy is edited where it shows ⚑.

**3 · The account page for free, paid and comped.** Paid: signed in as · plan and price · renews ·
payment · newsletters · member since. Free: the same list **without price, renewal or payment** —
four rows, and **the absent rows are absent, not empty** ⚑. Comped: plan reads "Member ·
complimentary" with **no billing hand-off at all** ⚑. **Cancelled-but-still-running is the fourth
member every account page meets** ⚑: "Renews" becomes "Ends", the action becomes Resume, access is
stated as full until the date — **and the Access row's label and value are now fields, not
literals** ⚑. **No card detail ever reaches a theme** ⚑, so "Payment · Managed by Stripe" is the
whole row, and **that sentence is a field too**.

**4 · The A1·14 assumption.** **Confirmed, with one qualification.** The tier name and the current
period's end date are readable ⚑. **The qualification: "renews" and "ends" are the same field** ⚑ —
`cancel_at_period_end` decides which word is true, and a theme that prints "Renews" unconditionally
lies to every cancelling member. Also readable: status, price, interval, newsletters, join date.
**Not readable:** card detail, invoices, Stripe state, and **the number of days left** ⚑.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The seam.** A30 is the whole page between A1's header and A3's footer and draws its own vertical
  spacing: **64 · 96 · 132** at 1440, **80** at 834, **64** at 390 ⚑ — A17's ladder, **and it is the
  universal Vertical spacing row, not a per-design Padding row** (this pass). **5 Contrast Band and
  6 Cover resolve it to 0** and carry their own internal ladder under its own name.
- **The measures.** The form is **420–480** on page grounds, **460** on a plane or a cover, and the
  **column's full width** where a column decides it (2, 7, 11). **The field is 46 px at every width
  in every design** ⚑ and goes full width at ≤ 767.
- **The type.** Eyebrow 13 uppercase tracked .08em · heading 32–44, 96 in 9 · blurb 17, 16 at 390 ·
  field label 13/500 · field value 15 · button 15/600 · row label 13.5 · row value 15–16 · note and
  legal 13 · mono annotations 9.5–11. **Nothing below 13** ⚑. **The type ladder is never scaled by a
  heading control** ⚑.
- **Accent, once per design.** **The primary button, and nothing else** — except 8 Tiers' marked-tier
  label, 11 Rail's 2 px active bar and 13 Steps' filled ordinal chips, each of which is that design's
  single accent use ⚑. **5 Contrast Band has no accent at all**: on the band it measures 4.0:1 and
  the value is disabled with its ratio shown ⚑, **and the icon slot's Accent colour role is disabled
  there for the same reason** (this pass).
- **Targets.** The button, every row action, rail rows and the period toggle are **44 px or taller**;
  row actions are 38 px inside a 44 px row ⚑. **Nothing interactive is under 44** ⚑. **Ordinal chips
  and status badges are not targets** and are excluded from focus order.
- **Responsive floor.** Splits collapse at **833** (2) · **held at 834** (7, 11) · bands, covers,
  cards, boxes and planes **do not collapse at all** (3, 4, 5, 6, 10, 13) · **every account row set
  becomes stacked label-value-action pairs at ≤ 767** ⚑. Every element that leaves a width has a
  stated destination, or is stated to have none (12's row detail).
- **Dark.** A27's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows dropped and
  the hairline carrying every plane; **card and plane depth forced to Flat** ⚑. **The field lifts in
  light and deepens in dark** — one step from its container in both, in whichever direction is
  available ⚑. Accent re-checked: `#171511` on `#E0805A` is 4.9:1.
- **Print.** **The account page prints; the signup and sign-in pages do not** ⚑ — a printed form is
  a form nobody can fill in, and a printed membership summary is a receipt. Portal buttons print as
  their labels without the `PORTAL ↗` tag.
- **Behaviour.** **Eleven designs declare `member-form` alone**; 8 Tiers adds `price-toggle`; 11 Rail
  adds `scroll-spy`. **No design declares more than two.** Sticky rails use `position: sticky` and
  declare nothing ⚑. **One-time code entry needs a `member-form` registry extension and an endpoint
  to verify against — marked ARCHITECT on every frame, and no module name was invented** ⚑.
- **Refused category-wide, each with a reason:** a password field ⚑ (Ghost has no passwords) · a
  social sign-in button ⚑ (not a Ghost feature) · a card form ⚑ (Stripe's, and PCI's) · an invoice
  list ⚑ (not exposed to themes) · a "days left" counter ⚑ (arithmetic on a date the theme did not
  compute) · a member count or "join 4,000 readers" line ⚑ (not queryable, and inventing it is
  inventing a statistic) · a cancel button ⚑ (Portal's, and a theme that offers one loses the
  publication money by accident) · a per-item control of any kind ⚑ · **a Preview control** — the
  category never had one, and previewing is P0·6's and View as's ⚑.

### The universal trio — outside every design's own control list

Three rows on every placeable section, not counted toward any design's total.

| Row | Values | A30's reading |
|---|---|---|
| **Background role** | Background · Surface · Contrast | **The old per-design Padding row's neighbour, and the pass's one contested row.** Free on the nine page-ground designs; **Surface disabled on 3 Card** (the card's own plane is one step above the ground and would vanish) ⚑; **locked on 4 Panel and 13 Steps at Background** (the plane is the design's ground) ⚑; **locked on 5 at Contrast** and **on 6 at Image** (the band and the photograph *are* those designs) ⚑ |
| **Vertical spacing** | Compact · Comfortable · Spacious | **This is the row twelve designs called Padding** ⚑ — 64 · 96 · 132; 80 at 834, 64 at 390. **Resolves to 0 on 5 and 6**, which carry their own ladder as **Band padding** and **Cover height** |
| **Top divider** | None · Line · Fade | Default **None** in all thirteen ⚑ — A30 is the whole page under A1's header. **Locked at None on 5 and 6**: a rule above a full-bleed band or photograph is a second edge on the same line ⚑ |

### The Data group — the Membership source, recut

Seven rows, identical in all thirteen (nine in 6 and 7, which add the image pair), **below** each
design's own controls and **not counted** ⚑; three of them read-only.

| Field | Type | Values |
|---|---|---|
| *Which page this is* | read-only | Signup · Sign-in · Account — **the template decides; the section reports it** ⚑ |
| *Form wiring* | read-only | `data-members-form="signup"` / `"signin"`, and `data-members-signout` on the sign-out button — **new in this pass** ⚑. Ghost writes `loading`, `success` and `error` onto the form element: **those are the sending, sent and invalid states** ⚑ |
| `tiersSource` | enum req | From Ghost, visible only (default) · From Ghost, all · Off — **the user cannot add or remove a tier** ⚑ |
| `tierOrder` | enum req | Ghost's own (default) · Price low–high · Price high–low — **8 and 13 only; new in this pass, and A32's row** ⚑ |
| `afterSend` | enum req | Sent panel in place (default ⚑) · Portal takes over |
| `oneTimeCode` | enum req | Off (default) · On — **new in this pass** ⚑. **ARCHITECT: `member-form` registry extension + an endpoint to verify the code** |
| `signedInBehaviour` | enum req | Membership summary (default) · Send them to the account page — **never the signup form** ⚑. **This is the category's member-state model**, and the reason no design carries a Member visibility row |
| `image` · `imageFocus` | image · enum | **6 and 7 only.** Focus is Centre · Top · Bottom, **reachable from the Image Picker's popover** ⚑ |
| *Everything that changes a subscription* | read-only | Ghost Portal — **the category's boundary; no control moves it** ⚑ |

### The roster

| # | Design | Tuple | Ctl | Modules |
|---|---|---|---|---|
| 1 | Centred | `form · none · page · none · none · one centred column` | 9 | `member-form` |
| 2 | Split Pitch | `split · none · page · none · none · the case beside the form` | 10 | `member-form` |
| 3 | Card | `form · card · page · none · none · a raised card holding the form` | 9 | `member-form` |
| 4 | Panel | `form · none · surface · none · none · the page on one raised plane` | 10 | `member-form` |
| 5 | Contrast Band | `form · none · contrast · none · none · the page as an inverted band` | 11 | `member-form` |
| 6 | Cover | `form · none · image · none · background · the form over a photograph` | 10 | `member-form` |
| 7 | Image Split | `split · none · page · none · edge · a picture column to the page edge` | 10 | `member-form` |
| 8 | Tiers | `grid-of-N · none · page · few · none · tier cards above the form` | 10 | `member-form` · `price-toggle` |
| 9 | Big Type | `stack · none · page · none · none · the promise at display size` | 8 | `member-form` |
| 10 | Boxed | `form · box · page · none · none · one hairline box on the ground` | 9 | `member-form` |
| 11 | Rail | `edge rail · none · page · few · none · a pinned rail beside the page` | 9 | `member-form` · `scroll-spy` |
| 12 | Ledger | `stack · none · page · many · none · what is included as ruled rows` | 6 | `member-form` |
| 13 | Steps | `stack · none · surface · few · none · the signup as numbered steps` | 10 | `member-form` |

All thirteen are distinct on the five closed slots. Containment separates 1, 3 and 10; ground
separates 1, 4 and 5; media separates 6 and 7; item-count and archetype separate 8, 11, 12 and 13.
**Containment is `none` in ten of thirteen** — 8's tier cards and 13's tier boxes are the *items'*
geometry, not the section's ⚑. **The counts are each design's own controls**: the trio and the Data
group sit outside them, and the ceiling is the PRD's ~15.

### The shared field list

The union every design draws from. A design may draw six of these; **none needs a field the category
does not have**, so switching between any two designs preserves everything the user typed.

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | all but 12 | Default "Membership" ⚑ — **and a default is why Eyebrow: Show · Hide exists** |
| `heading` | text | opt | 60 ch | all 13 | **9 caps it at 60 in the editor** ⚑; 2 draws two lines at 44 **and has a real default** |
| `blurb` | text | opt | 240 ch | all 13 | 12 draws it as the price sentence beside the form ⚑ |
| `emailLabel` | text | opt | 24 ch | all 13 | Default "Your email" |
| `placeholder` | text | opt | 40 ch | all 13 | Default "you@example.com" |
| `ctaLabel` | text | opt | 24 ch | all 13 | Default "Continue" ⚑ — not "Subscribe": a paid tier continues in Portal. **Takes the optional icon** |
| `note` | text | opt | 90 ch | all but 8, 12 | Default as drawn — **and the reason for Note line: Show · Hide** |
| `legal` | text | opt | 160 ch | all 13 | **Authored, never generated** ⚑. **No default, so clearing it hides it** and it needs no Show row |
| `signinPrompt` · `signinLinkLabel` | text | opt | 30 · 24 ch | all 13 | "Already a member?" · "Sign in" |
| `signupPrompt` · `signupLinkLabel` | text | opt | 30 · 24 ch | all 13 | "New here?" · "Start a membership" — **the /signin/ mirror the Sign-in link row also governs** |
| `signinHeading` · `signinBlurb` · `signinCta` | text | opt | 60 · 240 · 24 ch | all 13 | The sign-in route's head; CTA default "Send the link" |
| `sentHeading` · `sentText` · `sentAgainLabel` | text | opt | 40 · 200 · 24 ch | all 13 | **`{email}` and `{hours}` are the only tokens** ⚑ |
| `codeLabel` · `codeCta` | text | opt | 60 · 24 ch | all 13 | **New in this pass** ⚑ — the one-time code panel; defaults "Or paste the code from the email" · "Sign in" |
| `expiredHeading` · `expiredText` | text | opt | 40 · 200 ch | all 13 | JS-only state ⚑ |
| `invalidText` | text | opt | 90 ch | all 13 | Default "That address doesn't look right." |
| `signedInText` · `signedInCtaLabel` | text | opt | 120 · 24 ch | all 13 | **New in this pass** ⚑ — both were fixed English in the already-signed-in panel |
| `paymentText` | text | opt | 60 ch | all 13 | **New in this pass** ⚑ — default "Managed by Stripe"; it was a template literal |
| `accessLabel` · `accessText` | text | opt | 24 · 60 ch | all 13 | **New in this pass** ⚑ — the cancelled member's row; **the seventh row label** |
| `benefits[]` | list 0–6 | opt | name 60 ch · detail 90 ch | 1–5, 7, 10, 11, 12 | **The category's only authored list** ⚑, **and the P0·3 item controls govern it** — Add arrives with content, Remove never disabled, drag reorder, per-item content only. **The detail is drawn only by 12** |
| `benefitsLabel` | text | opt | 24 ch | as `benefits[]` | Default "What a membership includes"; "Included" in 10 ⚑ |
| `image` · `imageAlt` · `imageFocus` | image · text · enum | **req in 6** | ≥ 2,400 px · 120 ch · — | 6, 7 | Required in 6, optional in 7 ⚑; **focus is a field, reachable from the Image Picker's popover** ⚑ |
| `accountHeading` · `accountBlurb` | text | opt | 60 · 240 ch | all 13 | 2 is the design they exist for |
| `rowLabels` (seven) | text | opt | 24 ch each | all 13 | Signed in as · Plan · Renews · Payment · Newsletters · Member since · **Access** ⚑ |
| `endsLabel` | text | opt | 24 ch | all 13 | Default "Ends" — **used when `cancel_at_period_end` is true** ⚑ |
| `signOutLabel` · `portalNote` | text | opt | 24 · 200 ch | all 13 | The note explaining that plan and billing open Portal |
| `tierNote` · `freeRowHeading` · `freeRowText` · `freeCtaLabel` | text | opt | 90 · 40 · 120 · 24 ch | 8 | The free row beneath the cards |
| `periodLabels` | text | opt | 12 ch × 2 | 8 | "Monthly" · "Yearly" |
| `railLabels` (four) | text | opt | 24 ch each | 11 | **Labels only; the rows are fixed** ⚑, and their targets are Portal's named panels |
| `stepLabels` (three) · `stepThreeText` | text | opt | 40 ch each · 160 ch | 13 | Defaults as drawn ⚑ |
| *catalog strings* | theme catalog | — | — | all 13 | **New in this pass** ⚑ — `members.status_member` · `members.status_free` · `members.status_comped` · `members.sending`. **Not authored fields**: system words for a state Ghost reports |
| *@member* | Ghost | req | — | all 13 on /account/ | `email · name · status · created_at · subscriptions · newsletters` |
| *subscription* | Ghost | opt | — | all 13 on /account/ | `tier.name · price · interval · current_period_end · cancel_at_period_end` ⚑ |
| *tiers* | Ghost | opt | — | 8, 13 | `name · monthly_price · yearly_price · currency · description · benefits` — **prices are in the smallest currency unit and render through `{{price}}`** ⚑ |
| *@site.title* | Ghost | req | — | all 13 | The heading's fallback and the form's accessible name ⚑ |

### Repeating items — two lists, and only one of them is the user's

**The authored list is `benefits[]`**, and it is **P0·3's authored list** in the nine designs that
draw it: drag to reorder, per-row overflow with Duplicate and Remove, **Add arrives with content
rather than an empty shell**, **Remove is never disabled**, the range line reads `0–6 · 4 used`, and
**Add disables at six with the reason in a sentence** ⚑. Per-item editing is content only — a name
(60) and a detail (90), inline — and **no per-item layout control exists**, by construction.

**The Ghost list is tiers**, drawn only by **8 Tiers** and **13 Steps**, and it is **P0·3's
Ghost-sourced card**: no Add, no Remove, no drag, a "From Ghost" mark, and the sentence saying tiers
are edited in Ghost.

- **How many, and what the layout is for.** 8 is drawn for **two to three** tiers as cards; **four or
  more become hairline rows at every width** ⚑ — there is no 4-up. 13 draws **two** (free and the
  lowest paid) or **all** by control.
- **Fewer than expected.** **0 paid tiers** (Stripe unconnected) → cards, toggle and step 01 all go;
  8 renders 1 Centred's column and 13 renders two steps, renumbered ⚑. **1 paid tier** → two cards
  centred, **not stretched** ⚑.
- **Order.** **Ghost's own by default, and now selectable** — Price low–high · Price high–low, the
  same row A32 carries ⚑. The two price values sort on **the period being shown**.
- **Where the buttons go.** **Portal tier deep links** — `signup/{tierId}/monthly` and
  `signup/{tierId}/yearly` in 8, `signup/{tierId}` in 13 ⚑ — and **`price-toggle` swaps the hrefs as
  well as the prices**. The free row's CTA is plain `signup`.
- **Fields drawn per tier.** Name, price for the chosen period, description, up to three benefits,
  the button. **A tier with no description draws none and the card closes up; a tier with no benefits
  puts the button under the price** ⚑ — the card is shorter than its neighbours, never padded to
  match.
- **Controls apply to every tier at once.** Marked tier, Benefits per card, Card treatment, Order and
  List marker each write one value onto the section ⚑.

---

## 1 · Centred

1. **Descriptor.** One centred column on the page ground carrying eyebrow, heading, blurb, the email
   field and an included list under a hairline; the same column, widened to 640, carries the account
   rows. The category default.
2. **Structural descriptor.** `form · none · page · none · none · one centred column` — containment
   `none` (the field's border is the field's, not the section's); item-count `none` (the included
   list is authored prose, not a repeating unit ⚑); ground `page`, which separates it from 4 and 5.
3. **Archetype.** form. No departures.
4. **Responsive rule.** **1440** column 480 centred in the 1,296 box, heading 40, field 46, spacing
   96; account column 640 with 168 px row labels. **834** column 440, heading 34, spacing 80; account
   560. **≤ 767** column = frame − 40, heading 28, field and button full width at 46, spacing 64,
   **account rows stacked** ⚑.
5. **Content fields.** `eyebrow` · `heading` · `blurb` · `emailLabel` · `placeholder` · `ctaLabel` ·
   `note` · `legal` · `signinPrompt`+`signinLinkLabel` · `benefits[]` · `benefitsLabel` · the seven
   `rowLabels` · `endsLabel` · `paymentText` · `accessLabel`+`accessText` · `signOutLabel` ·
   `portalNote` · `signedInText`+`signedInCtaLabel` · `codeLabel`+`codeCta` · the sign-in and
   magic-link strings. **No image is drawn**; the field is stored ⚑.
6. **Controls.** Column width (Narrow 380 · Medium 480 · Wide 560) · Fields (Email only · Name and
   email) · Included list (Show · Hide) · Legal line (Show · Hide) · Sign-in link (Show · Hide) ·
   **Eyebrow (Show · Hide)** · **Note line (Show · Hide)** · **List marker (Tick · Custom icon)** ·
   **CTA icon (None · Before · After)**. **Nine**, plus the P0·3 `benefits[]` list. Then the
   universal trio and the Data group, neither counted.
7. **Data.** `@member` on /account/. `#get "tiers"` read and not drawn ⚑. 0, 1 and many tiers are the
   same page here. Signed out on /account/ → Ghost redirects before the theme renders ⚑.
8. **Empty state.** No blurb → the stack closes up. No benefits → hairline and list both go. Free →
   no price or renewal row; comped → no billing row. **No "Untitled member" fallback**: a member with
   no name shows the email in the name slot and no avatar initial ⚑.
9. **Behaviour module.** `member-form`. **Edit-safe:** nothing posts while the section is edited, and
   **every state is reached in place through P0·6** rather than only drawn. **No-JS, quoted:** "The
   `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the
   designed sent state."
10. **Accessibility.** The heading is the page's `h1` ⚑. `<form data-members-form="signup">` with a
    real `<label for>`, `type="email"`, `autocomplete="email"`, `inputmode="email"`. Focus order:
    field, button, sign-in link, list. **The sent panel is an `aria-live="polite"` region** ⚑; the
    invalid line is `aria-describedby` on the field. Muted on ground 5.4:1; accent button 4.7:1.

**Reconciled.** Padding retired into **Vertical spacing** — same ladder, one row. **Eyebrow, Note
line, List marker and CTA icon arrive** ⚑; the sign-in row now names its /signin/ mirror.
`benefits[]` is named as the P0·3 list at 0–6. The source group is recut as **the Data group**, with
the form attributes and **One-time code entry** in it; four literals become fields and four become
catalog strings.

**Flagged ⚑** The 24-hour expiry and "works once" wording are asserted from Ghost's member auth
behaviour — verify the interval before build. The status badge vocabulary is invented, and is now a
catalog string rather than a template literal. "Continue" rather than "Subscribe" is a judgement.

---

## 2 · Split Pitch

1. **Descriptor.** The case for membership in a 700 column with a numbered included list, and the
   form alone in a 520 column beside it. The left column is authored and never reacts to data.
2. **Structural descriptor.** `split · none · page · none · none · the case beside the form` —
   archetype `split` because the arrangement, not the field, is the design; media `none`, which is
   what separates it from 7.
3. **Archetype.** split. One departure: **the included list moves below the form at ≤ 767** ⚑.
4. **Responsive rule.** **1440** 700 / 76 / 520; case measure 620; form the column's full width;
   spacing 96; account 420 / 40 / 836. **834** stacked, case measure 620, heading 36, spacing 80.
   **≤ 767** heading 28, form full width, **list below the form** ⚑, spacing 64, account rows stacked.
5. **Content fields.** As 1. **`heading` has a real default here** — `{{@site.title}}` in the
   category's own fallback sentence ⚑ — and runs to two lines at 44 px; `benefits[]` is drawn at 0–6
   and the numbered treatment is designed for four.
6. **Controls.** Case column (Wide 700 · Half 636) · Form side (Right · Left) · Included list
   (Numbered rows · Ticks · Hide) · Fields · Legal line · **Sign-in link** · **Eyebrow** · **Note
   line** · **List marker** (at Ticks) · **CTA icon**. **Ten**, plus the P0·3 list.
7. **Data.** As 1. **The case column is authored, never queried**, so no data state can empty it ⚑.
8. **Empty state.** No benefits → the list goes and **the 700 grid column is kept** ⚑. No blurb →
   heading then list. Both columns empty is not reachable; the heading's default is the site title
   in a sentence ⚑.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** `h1` in the case column, `<form>` in the other; **DOM order is case then form
    at both Form side values** ⚑. The numbered list is a real `<ol>` and **the mono numerals are
    `aria-hidden`** ⚑.

**Reconciled.** **The case-column heading gets a real default** ⚑ — it was fixture text, so a fresh
section was lorem-shaped. Padding retired into **Vertical spacing**; **Eyebrow, Note line, Sign-in
link, List marker and CTA icon** arrive; `benefits[]` named as the P0·3 list; Data group recut.

**Flagged ⚑** The 76 px gap is this design's own (A5·5 uses 40) because a form needs more separation
from prose than a heading does.

---

## 3 · Card

1. **Descriptor.** The whole page inside one centred surface card at the pack radius + 4 with a warm
   shadow, holding head, field and a three-line included list; the card widens to 760 for the account
   rows.
2. **Structural descriptor.** `form · card · page · none · none · a raised card holding the form` —
   containment `card` (the section itself sits in one); ground `page`, because the card's own surface
   is not the section's ground ⚑.
3. **Archetype.** form. One departure: **the card does not go edge-to-edge at any width** ⚑.
4. **Responsive rule.** **1440** card 560, inner 40, heading 32, account card 760. **834** card 520,
   inner 36, account 640. **≤ 767** card = frame − 40, inner 22, heading 26, **shadow kept**, account
   rows stacked inside the card ⚑.
5. **Content fields.** As 1. `benefits[]` is drawn at **three lines**; a fourth is stored and not
   drawn ⚑, and **P0·3's partial-display line says so** — "4 items · 3 shown in this design".
6. **Controls.** Card width (Narrow 480 · Medium 560 · Wide 680) · Card depth (Raised · Flat) ·
   Included list (Inside the card · Below the card · Hide) · Fields · Sign-in link (Inside the card ·
   Below the card · **Hide** ⚑) · **Eyebrow** · **Note line** · **List marker** · **CTA icon**.
   **Nine**, plus the P0·3 list. **Background role is offered with Surface disabled** ⚑.
7. **Data.** As 1. **The card's height is its content at every member type** ⚑ — four rows for a free
   member, six for a paid one, no minimum height.
8. **Empty state.** No benefits at Inside the card → hairline and list go. **An empty card is not
   reachable**: the form is always in it ⚑.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** The card is a plain `<div>` — **not a region, not a dialog** ⚑ — containing the
    `h1` and the form. **The card's hairline is not a focus indicator**: the field's 1.5 px accent
    border and the button's 2 px offset ring are ⚑, both drawn against the surface.

**Reconciled.** **Sign-in link gains Hide** ⚑ — it was a placement control with no off, and one of
the nine untoggleable lines. Padding retired into **Vertical spacing**, and **Surface is disabled in
Background role** with the card-on-surface reason shown. **Eyebrow, Note line, List marker and CTA
icon** arrive; `benefits[]` is the P0·3 list with its partial-display line.

**Flagged ⚑** "Account card = signup card + 200" is invented arithmetic. Forcing Flat in dark is
carried from A19·3 rather than re-derived.

---

## 4 · Panel

1. **Descriptor.** One raised plane the width of the content box carrying a centred 460 form and a
   four-column included row under a hairline. The same components as 1 with the ground changed.
2. **Structural descriptor.** `form · none · surface · none · none · the page on one raised plane` —
   **a full-width plane is a ground, not a containment** (A26·3, A27·4) ⚑, which is the whole
   distinction from 3.
3. **Archetype.** form. No departures.
4. **Responsive rule.** **1440** plane 1,296, inner 56, form 460, benefits four up, spacing 96.
   **834** plane 754, inner 40, form 430, benefits two up, spacing 80. **≤ 767** plane 350, inner 20,
   form full width, benefits stacked, spacing 64.
5. **Content fields.** As 1. **`benefits[]` is the field this design leans on** — four lines is what
   the row is designed for; three draws three columns left-aligned; none hides the row and its
   hairline ⚑.
6. **Controls.** Plane width (Content box 1,296 · Held 1,040) · Plane depth (Raised · Flat) ·
   Included row (Four up · Two up · Hide) · Fields · Legal line · **Sign-in link** · **Eyebrow** ·
   **Note line** · **List marker** · **CTA icon**. **Ten**, plus the P0·3 list. **Background role is
   locked at Background** ⚑.
7. **Data.** As 1; on /account/ **the label column widens to 200** ⚑.
8. **Empty state.** No benefits → hairline and row go. **The plane is never hidden** ⚑ — it is the
   ground, and a section with no ground is 1 Centred.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** The plane is a `<div>`, not a landmark ⚑. `h1`, form, then the included row as
    a `<ul>` with mono ordinals `aria-hidden`. **Focus rings are drawn against the surface**, where
    the accent measures 4.4:1 — the reason the ring is 2 px rather than 1.5 ⚑.

**Reconciled.** Padding retired into **Vertical spacing**, and **Background role locked at
Background** ⚑ with the plane-is-the-ground reason in the row: at Surface the plane and the page are
one tone and the design is 1 Centred with extra padding. **Sign-in link, Eyebrow, Note line, List
marker and CTA icon** arrive; `benefits[]` named as the P0·3 list.

**Flagged ⚑** "Held 1,040" is an invented second plane width. The 200 px account label column is this
design's own and is not shared with 1's 168.

---

## 5 · Contrast Band

1. **Descriptor.** The whole page on one full-bleed inverted band carrying its own padding, form
   centred on 480, included list under a 20 % hairline. **The only design in A30 with no accent on
   it.**
2. **Structural descriptor.** `form · none · contrast · none · none · the page as an inverted band` —
   ground `contrast`; containment `none`.
3. **Archetype.** form. One departure: **the section has no vertical spacing of its own at any
   width** ⚑ — the universal row resolves to 0 and **Band padding** is the ladder.
4. **Responsive rule.** **1440** band full bleed, inner 96, column 480, heading 40. **834** inner 80,
   column 440, heading 34. **≤ 767** inner 64, column = frame − 40, heading 28, field and button full
   width. **Band width: Content box resolves to full bleed below 1,440** ⚑.
5. **Content fields.** As 1, and nothing more — **the band adds no field** ⚑.
6. **Controls.** Band padding (Compact · Comfortable · Spacious — **kept: it is the band's own
   ladder** ⚑) · Band width (Full bleed · Content box) · Alignment (Centred · Left) · Button (Carried
   fill · Outline · ~~Accent~~ — **disabled at 4.0:1** ⚑) · Included list (Show · Hide) · Fields ·
   **Sign-in link** · **Eyebrow** · **Note line** · **List marker** · **CTA icon**. **Eleven**, plus
   the P0·3 list — the category's highest count. **All three universal rows are locked** ⚑.
7. **Data.** As 1. **The band renders identically for every member type** and only its height changes.
8. **Empty state.** No benefits → hairline and list go. **The band is never hidden** ⚑.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** **Every contrast pair on the band was measured** ⚑: carried on band 13.4:1,
    muted 72 % 7.1:1, the 8 % field plate's placeholder 4.9:1, the carried-fill button 13.4:1, **and
    the accent 4.0:1, which is why it is disabled** — **in the Button row and in the icon slot's
    colour popover alike** ⚑. The focus ring is the carried colour ⚑, never the accent.
    
**Reconciled.** **Band padding keeps its name** ⚑ — it is the band's internal ladder, not the
section's — and the universal **Vertical spacing** is locked at 0 beside it with that reason shown.
**Background role locked at Contrast, Top divider at None** ⚑. **Sign-in link, Eyebrow, Note line,
List marker and CTA icon** arrive, and **the icon's Accent role is disabled at 4.0:1** like the
button's — P0·2's rule met for the first time in the library.

**Flagged ⚑** The 4.0:1 figure is Paper's; **each pack re-checks its own accent on its own band** and
a pack whose accent passes may enable the value — a build-time derivation. "Band width: Content box"
is invented.

---

## 6 · Cover

1. **Descriptor.** The form over a full-bleed photograph under a warm scrim, every colour derived
   from the carried white. On /account/ the photograph becomes a 200 px band above rows on the page
   ground.
2. **Structural descriptor.** `form · none · image · none · background · the form over a photograph`
   — ground `image` and media `background`, which separates it from 7's picture column.
3. **Archetype.** form. Two departures: **no section spacing** (the cover carries it) and **a
   different arrangement on /account/** ⚑ — a route change, not a width change.
4. **Responsive rule.** **1440** cover full bleed at 620 min, inner 96, form 460, heading 40, account
   band 200. **834** inner 80, form 430. **≤ 767** cover 560 min, inner 64, form full width, heading
   28, account band 150 ⚑.
5. **Content fields.** As 1, plus `image` **req** ≥ 2,400 px · `imageAlt` opt 120 ch (**an empty alt
   is a decorative cover and is allowed** ⚑) · `imageFocus` enum opt, **a field, reachable from the
   Image Picker's popover** ⚑. **The one required field in A30.** `benefits[]` is stored and not
   drawn, so **P0·3 never opens here** ⚑.
6. **Controls.** Cover height (Compact 480 · Comfortable 620 · Tall 760) · Scrim (Light 30 · Medium
   45 · Heavy 60 — **the verify-against-a-real-photograph flag is in the row** ⚑) · Alignment
   (Centred · Left) · Fields · Legal line · Account band (Picture band 200 · No picture) ·
   **Sign-in link** · **Eyebrow** · **Note line** · **CTA icon**. **Ten.** **All three universal
   rows are locked** ⚑, and Image and Image focus sit in the Data group.
7. **Data.** As 1. **The image is authored, never queried** ⚑ — there is no post feature image to
   fall back to on a members page, which is why the field is required.
8. **Empty state.** **No image → the design hands off to 1 Centred** ⚑, drawn in place, flagged in the
   editor, invisible on the site. **The user's chosen design is never silently changed** ⚑.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** `h1` over the scrim at 45 % measures 8.9:1 against the placeholder's lightest
    band ⚑; the 80 % muted line 6.4:1. **The scrim is a real element, not a filter** ⚑. Focus ring is
    the carried white.

**Reconciled.** **The scrim values keep their verify-against-a-real-photograph flag** ⚑ — on the
frame and now in the row itself. **All three universal rows are locked**, each with its reason shown:
Background role at Image, Vertical spacing at 0 (Cover height is the ladder), Top divider at None.
**Sign-in link, Eyebrow, Note line and CTA icon** arrive, and **Image focus joins the Data group** as
an Image Picker popover row rather than a hidden field ⚑.

**Flagged ⚑** The 2,400 px minimum is invented. **The three scrim values are still checked against
the striped placeholder rather than a real photograph — re-check all three before build.** The 200 px
account band is invented.

---

## 7 · Image Split

1. **Descriptor.** The form and a three-line list in a 560 column on the page ground, with a
   photograph filling everything right of the 40 px gap to the viewport edge. No text sits on the
   picture.
2. **Structural descriptor.** `split · none · page · none · edge · a picture column to the page edge`
   — media `edge`; ground `page`, which is why the form needs no derived colours ⚑.
3. **Archetype.** split. Two departures: **the split is held at 834** ⚑ and **the picture is absent
   on /account/** ⚑.
4. **Responsive rule.** **1440** margin 72 + text 560 + gap 40 + picture 768, picture height = the
   column's, spacing 96. **834** margin 40 + text 400 + gap 32 + picture 362, spacing 80. **≤ 767**
   picture on top, full bleed, 200 tall at 16:9; form on 350; **included list hidden** ⚑; spacing 64.
5. **Content fields.** As 1, plus `image` **opt** ≥ 1,600 px · `imageAlt` · `imageFocus`. **Optional
   here and required in 6** — the same field, two obligations ⚑.
6. **Controls.** Picture side (Right · Left) · Text column (Narrow 480 · Medium 560 · Wide 640) ·
   Picture crop (Fill the column · Sixteen by nine) · Included list (Show · Hide) · Fields ·
   **Sign-in link** · **Eyebrow** · **Note line** · **List marker** · **CTA icon**. **Ten**, plus the
   P0·3 list. Image and Image focus are in the Data group.
7. **Data.** As 1. **No picture → the text column takes the content box** and the page is 2 without
   its case column ⚑; no hand-off, because the design still reads.
8. **Empty state.** No image → as above, flagged without changing the design ⚑. On /account/ the
   picture is absent **by rule**, which is not an empty state ⚑.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** `h1` in the text column; the picture is a sibling `<img>` with authored alt or
    `alt=""`. **DOM order is text then picture at both Picture side values** ⚑; at ≤ 767 the
    picture's visual position above the form is CSS order, not document order ⚑.

**Reconciled.** Padding retired into **Vertical spacing**. **Sign-in link, Eyebrow, Note line, List
marker and CTA icon** arrive; `benefits[]` is the P0·3 list; **Image focus joins the Data group**
beside the Image row ⚑ rather than living as a hidden field.

**Flagged ⚑** Holding the split at 834, against the archetype's ladder. Dropping the picture on
/account/. The 1,600 px minimum.

---

## 8 · Tiers

1. **Descriptor.** Ghost's tiers as three cards with a monthly-yearly toggle above them and the free
   option as an email row beneath a hairline. **The only design in A30 that draws tier data.**
2. **Structural descriptor.** `grid-of-N · none · page · few · none · tier cards above the form` —
   item-count `few` (two to three; rows at four ⚑); containment `none`, because **the cards are the
   items' geometry, not the section's** (A21·2) ⚑.
3. **Archetype.** grid-of-N. One departure: **3 → rows, never 3 → 2** ⚑ at 833.
4. **Responsive rule.** **1440** three 400 cards with 48 gaps, toggle centred above, free row inline
   at 460, spacing 96. **834** cards become hairline rows at 20 px, blurb on one line, spacing 80.
   **≤ 767** rows at 16 px, blurb wraps, price above the button, free row stacked, spacing 64.
5. **Content fields.** As 1, plus `tierNote` · `freeRowHeading` · `freeRowText` · `freeCtaLabel` ·
   `periodLabels`. **No `note` field** — this design draws none. **Tier names, prices, descriptions
   and benefits are Ghost's and are not fields** ⚑.
6. **Controls.** Period toggle (Monthly and yearly · Monthly only · Yearly only) · Card treatment
   (Raised · Flat · Hairline rows) · Marked tier (Middle · Highest · None) · Benefits per card (Two ·
   Three · All) · Free row (Show · Hide) · **Order (Ghost's own · Price low–high · Price high–low)**
   · **Sign-in link** · **Eyebrow** · **List marker** · **CTA icon**. **Ten**, and **no Note line
   row**.
7. **Data.** `#get "tiers"`. **0** → cards and toggle go; the page is 1 Centred's column ⚑. **1** →
   two cards centred, not stretched ⚑. **2–3** → as drawn. **4 or more** → rows at every width ⚑.
   **Order is Ghost's by default and is selectable** ⚑. **The card buttons are Portal tier deep
   links** — `signup/{tierId}/monthly` and `/yearly` — **and `price-toggle` swaps the hrefs as well
   as the prices** ⚑; the free row's CTA is plain `signup`. **Prices render through Ghost's
   `{{price}}` helper** ⚑: `monthly_price` and `yearly_price` are in the smallest currency unit, so a
   raw print shows "600" for $6 — including in the no-JS state, where both prices render side by
   side. A tier with no description or no benefits draws a shorter card, never a padded one ⚑.
8. **Empty state.** No tiers → as above. No benefits on a tier → button under the price. **No
   "contact us" card and no placeholder tier** ⚑. On /account/ a comped member's cards carry no
   buttons ⚑.
9. **Behaviour module.** `member-form` **and** `price-toggle` — **the only design in A30 with two** ⚑.
   Both edit-safe; the toggle's resting state is Monthly. **price-toggle, quoted:** "Both monthly and
   yearly prices render side by side, each labelled — no toggle control shown." **member-form,
   quoted:** "The `<form>` posts natively to Ghost's members endpoint; Ghost's own server response
   replaces the designed sent state."
10. **Accessibility.** `h1` above the toggle; **each card's name is an `h2` and the card is not a
    link** ⚑ — the button is. The toggle is a `role="radiogroup"` of two radios, **not a switch** ⚑.
    Prices are inside the card's accessible name. At ≤ 833 **the whole row is not the target, the
    button is** ⚑.

**Reconciled.** **The card buttons are wired** ⚑ — Portal tier deep links, `price-toggle` swapping
hrefs as well as prices, the free row to plain `signup`, and **prices through `{{price}}`** because
the raw fields are in the smallest currency unit. **Order arrives** ⚑ and matches A32's row.
**Eyebrow, Sign-in link, List marker and CTA icon** arrive; Padding retires into **Vertical
spacing**; the tier cards are named as **P0·3's Ghost-sourced list** with no Add.

**Flagged ⚑** "Most read" as the mark's wording. The 3-then-rows threshold. **Whether Ghost exposes a
tier's benefit list to a theme in the shape drawn here needs verifying before build.**

---

## 9 · Big Type

1. **Descriptor.** One authored sentence at 96 px with an inline field row beneath it and the blurb
   under a hairline. On /account/ the same treatment applied to the member's own name at 72 px.
2. **Structural descriptor.** `stack · none · page · none · none · the promise at display size` —
   archetype `stack`, because the sentence is the design and the field is under it.
3. **Archetype.** stack. One departure: **the inline field row becomes stacked at ≤ 767** ⚑.
4. **Responsive rule.** **1440** heading 96 on a 1,000 measure, inline row 560, blurb 820, spacing 96;
   account name 72 on a 900 column. **834** heading 60 on 700, row 520, spacing 80; name 52. **≤ 767**
   heading 40 on 350, **form stacked**, blurb 16, spacing 64; name 34 with the badge below it ⚑.
5. **Content fields.** As 1, with `heading` **capped at 60 characters in the editor** ⚑.
   `benefits[]` is **stored and not drawn** ⚑, so **P0·3 never opens here**.
6. **Controls.** Heading size (Large 76 · Display 96 · Huge 132) · Alignment (Left · Centred) · Form
   (Inline row · Stacked) · Blurb (Below the field · Hide) · Sign-in link · **Eyebrow** · **Note
   line** · **CTA icon**. **Eight.**
7. **Data.** As 1. **The account name is `@member.name`** and **a member with no name gets their
   email at 72 px** ⚑ — drawn in the stress frame, because it is the state that breaks this design.
8. **Empty state.** No heading → the site title with "membership" appended at the same size ⚑. No
   blurb → the hairline goes with it.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** The sentence is the `h1` ⚑. **At 96 px the field label is still 13 px** — the
    type ladder is not scaled by the heading control ⚑. **At 40 px and below the heading is not a
    focus target** and never receives one. **P0·1's marks work inside the heading** and bold renders
    the pack's heavier heading weight, never faux-bold.

**Reconciled.** Padding retired into **Vertical spacing**. **Eyebrow, Note line and CTA icon**
arrive, and the sign-in row names its /signin/ mirror. No list controls — `benefits[]` is stored and
not drawn — and **at 96 px the state panels still hold the 13 px ladder** ⚑.

**Flagged ⚑** The 60-character cap. The 72 px account name. The dark-mode weight judgement is a call,
not a measurement.

---

## 10 · Boxed

1. **Descriptor.** The whole page inside one hairline box at the pack radius with internal rules
   dividing head, form and included list. No fill, no shadow — the quietest containment in the
   category.
2. **Structural descriptor.** `form · box · page · none · none · one hairline box on the ground` —
   containment `box`, against 3's raised `card` and 4's `surface` ground ⚑.
3. **Archetype.** form. One departure: **the box does not go edge-to-edge at any width** ⚑.
4. **Responsive rule.** **1440** box 720, inner 40, heading 34, form 420, account box 880. **834** box
   600, account 674. **≤ 767** box 350, inner 20, heading 26, form full width, account rows stacked,
   **rules kept** ⚑.
5. **Content fields.** As 1. `benefitsLabel` defaults to "Included" here ⚑ — the compartment is short
   and the longer label wraps.
6. **Controls.** Box width (Held 720 · Wide 960 · Content box 1,296) · Internal rules (Show · Hide) ·
   Included list (Third compartment · Hide) · Fields · Sign-in link · **Eyebrow** · **Note line** ·
   **List marker** · **CTA icon**. **Nine**, plus the P0·3 list. **Background role is offered in
   full** ⚑ — the box has no fill, so the role shows through it.
7. **Data.** As 1. **At every member type the box keeps its width and loses compartments** ⚑.
8. **Empty state.** No benefits → the third compartment and its rule go. **The box with only a form
   in it is still a composition** ⚑ — with 4, one of the two designs whose zero states look finished.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** The box is a `<div>`, not a region or a fieldset ⚑ — the compartments are
    visual and the form is one form. **The internal rules carry no role** ⚑. Focus ring is inset by
    4 px where it meets the box edge (A6) ⚑.

**Reconciled.** Padding retired into **Vertical spacing**. **Eyebrow, Note line, List marker and CTA
icon** arrive and the sign-in row names its mirror; `benefits[]` is the P0·3 list. **Background role
is offered in full** — the box has no fill, which is what distinguishes this design from 3 Card.

**Flagged ⚑** "Account box = box + 160, capped at the content box". The default benefits label change.

---

## 11 · Rail

1. **Descriptor.** A 240 px rail beside a content column: the membership's own sections with the
   current one marked on /account/, and the included list on /signup/. **The only design in A30 that
   draws navigation.**
2. **Structural descriptor.** `edge rail · none · page · few · none · a pinned rail beside the page` —
   item-count `few` (three to six; absent at none ⚑); containment `none`, which keeps the rail from
   reading as a sidebar card.
3. **Archetype.** edge rail. One departure: **held at 834** ⚑; the collapse is at 767, to a wrapped
   pill row.
4. **Responsive rule.** **1440** rail 240 + gap 48 + content 1,008; rail sticks at 96; form 480;
   spacing 96. **834** rail 200 + gap 32 + content 522; spacing 80. **≤ 767** **rail is a wrapped pill
   row above the content** ⚑, sticking ignored, spacing 64.
5. **Content fields.** As 1, plus `railLabels` 4 × 24 ch on /account/ ⚑. `benefits[]` is what the
   /signup/ rail draws — **the same field is a tick list in 1, a numbered list in 2, a four-up row in
   4 and a rail here**.
6. **Controls.** Rail side (Left · Right) · Rail width (Narrow 200 · Medium 240) · Rail sticks (On ·
   Off) · Rail marks (Show · Hide) · Fields · **Sign-in link** · **Eyebrow** · **Note line** · **CTA
   icon**. **Nine**, plus the P0·3 list, which is the /signup/ rail. **No List marker** — the rail
   draws rows, not ticks.
7. **Data.** `@member` as 1. **The /account/ rail's rows are fixed and not data** ⚑ except Billing,
   which is absent on a comped membership ⚑. **The rows open Portal's named panels** —
   `account/plans`, `account/newsletters`, `account/profile` ⚑ — **which exist.** **0 benefits** on
   /signup/ → no rail. **1** → a rail with one row, drawn rather than suppressed. **6** → the cap; a
   seventh is stored and not drawn ⚑.
8. **Empty state.** No benefits → the rail is absent on /signup/ and the design is 1 Centred
   left-aligned ⚑. **The /account/ rail is never empty.**
9. **Behaviour module.** `member-form` and `scroll-spy` ⚑. Both edit-safe; **Rail sticks declares
   nothing** — `position:sticky` is CSS. **scroll-spy, quoted:** "The sticky list renders with the
   first item marked current; no active-item tracking." **member-form, quoted:** "The `<form>` posts
   natively to Ghost's members endpoint; Ghost's own server response replaces the designed sent
   state."
10. **Accessibility.** The rail is a `<nav aria-label="Your membership">` on /account/ and a plain
    `<ul>` on /signup/ ⚑ — a list of benefits is not navigation. The current row carries
    `aria-current="true"` and keeps it at Rail marks: Hide ⚑. **The whole row is the target** ⚑.
    **Portal rows announce that they leave**: the accessible name ends "opens in Ghost's Portal" ⚑.

**Reconciled.** **The rail's rows are wired** ⚑ — `account/plans`, `account/newsletters`,
`account/profile`, Portal's named panels, **which exist**: the spec's open question is answered and
the two rows that assumed it no longer assume. Padding retired into **Vertical spacing**; **Sign-in
link, Eyebrow, Note line and CTA icon** arrive; the /signup/ rail is named as the P0·3 list.

**Flagged ⚑** The four /account/ rail rows and their order. The 2 px left accent bar as the vertical
form of A1·1's underline.

---

## 12 · Ledger

1. **Descriptor.** Six authored ruled rows across the content box — mono ordinal, name, one muted
   line — with a price sentence and the form on a hairline at the foot. **The only A30 design built
   for five or more included lines.**
2. **Structural descriptor.** `stack · none · page · many · none · what is included as ruled rows` —
   item-count `many`, which separates it from 1's `none` and 8's `few`; the rules are the items' own
   edges ⚑.
3. **Archetype.** stack. One departure: **the row detail is hidden at ≤ 767 with no destination** ⚑.
4. **Responsive rule.** **1440** six rows across 1,296, ordinal 26, name 420, detail fills the rest,
   row padding 18, foot 520 / 48 / 460, spacing 96. **834** name 300, detail kept, spacing 80. **≤
   767** detail hidden, name auto, ordinals kept, foot stacked, spacing 64.
5. **Content fields.** As 1 **minus `eyebrow` and `note`, neither of which this design draws** ⚑,
   with `benefits[]` extended: **each line is a name (60 ch) and an optional detail (90 ch)** ⚑, 0–6
   lines. **The detail is stored by every other design and drawn only here** ⚑.
6. **Controls.** Row density (Compact · Comfortable · Spacious) · Ordinals (Numerals · Rules only) ·
   Row detail (One line · Name only) · Form position (At the foot · At the head) · **Sign-in link** ·
   **CTA icon**. **Six**, plus the P0·3 list at **0–6** ⚑. **No Eyebrow or Note line row** — this
   design draws neither.
7. **Data.** As 1; tiers read and not drawn. **The rows are authored, not queried** ⚑. On /account/
   the rows are `@member`'s and the label column widens to 240.
8. **Empty state.** **0 lines** → rows and foot hairline go; the page is a heading, a blurb and a
   field ⚑, and the panel names 1 Centred. **1–2** → drawn, with an editor note that the arrangement
   wants four or more ⚑. **A line with no detail** → the name alone at 44 px.
9. **Behaviour module.** `member-form`, as 1, same quoted degradation.
10. **Accessibility.** `h1`, then the rows as an `<ol>` where Ordinals is Numerals and a `<ul>` where
    it is Rules only ⚑ — the list type follows the meaning. **Mono ordinals are `aria-hidden`** ⚑.
    Row hairlines are decorative and carry no `role="separator"`.

**Reconciled.** **The item list becomes 0–6** ⚑ — the control said two minimum while the empty state
already described nought, which was the design contradicting itself — and it is named as the P0·3
list with the **detail (90)** field it alone draws. Padding retired into **Vertical spacing**;
**Sign-in link and CTA icon** arrive. **No Eyebrow or Note line row**: this design draws neither, and
the panel says so rather than showing a control that governs nothing.

**Flagged ⚑** The six fixture lines and their details. The price sentence beside the form is the
blurb field reused. The "wants four or more" editor note.

---

## 13 · Steps

1. **Descriptor.** Three numbered steps on one raised plane — choose a tier, enter an address, open
   the link — with all three visible at rest. On /account/ the same numbering carries the member's
   three facts.
2. **Structural descriptor.** `stack · none · surface · few · none · the signup as numbered steps` —
   item-count `few` (three, or two by control); ground `surface` with containment `none` (4's call,
   carried) ⚑.
3. **Archetype.** stack. No departures at width; **one at state** — the filled ordinal moves from 02
   to 03 when the link is sent ⚑.
4. **Responsive rule.** **1440** plane 1,040 centred, inner 48, ordinals 34, step 01 two cards side by
   side, form 460, spacing 96. **834** plane 754, inner 36, **tier cards become rows** ⚑, spacing 80.
   **≤ 767** plane 350, inner 20, ordinals 28, head left-aligned, form full width, spacing 64.
5. **Content fields.** As 1, plus `stepLabels` 3 × 40 ch · `stepThreeText` opt 160 ch. **`benefits[]`
   is stored and not drawn** ⚑ — the steps are the page's structure — so **P0·3's authored list never
   opens here**.
6. **Controls.** Plane width (Held 1,040 · Content box 1,296 · Narrow 720) · Step numbers (Numerals ·
   Dots · Hide) · Step one (Two tiers · Every tier · Hide) · Step three (Show · Hide) · Fields ·
   **Order** · **Sign-in link** · **Eyebrow** · **Note line** · **CTA icon**. **Ten.** **Background
   role is locked at Background** ⚑.
7. **Data.** `#get "tiers"` for step 01 — **two tiers means free and the lowest paid one** ⚑, which
   now reads the Order row; Every tier draws them all. **Step 01's tier links are Portal tier deep
   links** (`signup/{tierId}`) ⚑, the same targets as 8 Tiers' card buttons, **and prices render
   through `{{price}}`**. **0 paid tiers** → step 01 absent, the page renumbers to two steps ⚑.
   **1** → free and that one. **4 or more** → rows at every width ⚑. `@member` on /account/ as 1.
8. **Empty state.** No tiers → two steps, as above. **A comped or free member's /account/ has two
   facts, not three** ⚑ and the numbering closes up.
9. **Behaviour module.** `member-form`, **and no second module** ⚑. Edit-safe. **No-JS, quoted:** "The
   `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the
   designed sent state." **A stepped flow would need behaviour the registry does not cover** ⚑ — the
   closest module is `tabs`, whose no-JS rendering ("All panels render stacked and visible, each
   preceded by its tab label as a heading") is what this design already is at rest, which is why the
   steps are typography and declare nothing.
10. **Accessibility.** `h1` in the plane's head, then **an `<ol>` of three `<li>`** ⚑ — the numbering
    is the list's and the ordinal chips are `aria-hidden`. Step 02 contains the whole form; **steps
    are not fieldsets and carry no `aria-current`** ⚑. The tier choice in step 01 is **two links, not
    radios** ⚑, because choosing one navigates to Portal.

**Reconciled.** **Step 01's tier links are wired** ⚑ — `signup/{tierId}`, the same Portal deep links
as 8 Tiers, with prices through `{{price}}`. **Order arrives** and matches 8 and A32 ⚑. **Background
role locked at Background** with the plane-is-the-ground reason. **Sign-in link, Eyebrow, Note line
and CTA icon** arrive; Padding retires into **Vertical spacing**.

**Flagged ⚑** The three step labels and step three's text. Moving the filled ordinal on sent. "Two
tiers = free plus the lowest paid". **The absence of a stepped-flow module is a finding for the
architect.**

---

## Component inventory

Eleven new, eighteen carried forward. Full descriptions are on the proof frame.

**New in A30:** email field 46 px (1) · magic-link sent panel (1) · **one-time code panel (1, this
pass)** · link-expired panel (1) · signed-in summary (1) · account row with its Portal hand-off (1) ·
Portal hand-off tag (1) · status badge (1) · boundary strip (0) · period toggle (8) · step ordinal
chip (13).

**Carried:** tier card and tier row (A7) · tick list (A5·11) · numbered rows (A9·15) · directory
column (A12·10) · split head (A5·5) · surface plane (A19·3) · warm scrim (A20·13) · on-contrast
derivation (A17·7) · primary button, ghost action, avatar with initials, eyebrow (A1) · focus ring
(A6) · content box and padding ladder (A17) · clipped-string rule (A18·3) · image placeholder plate
(A1) · hand-off rule (A1·11, A29·5).

**Reused by name from P0, never redesigned:** the inline text toolbar and its link popover (P0·1) ·
the icon slot, Icon Picker and button-icon rules (P0·2) · the authored item list, the Ghost-sourced
list card and the partial-display line (P0·3) · the state switcher (P0·6).

## Findings for the architect

Ten, two of them new in this pass. In full on the proof frame.

1. **A themed members page is a Ghost page on a custom template, not a route** ⚑ — the generator has
   to create the pages and set Portal's links, or Portal intercepts them.
2. The **24-hour magic-link expiry** and "works once" are asserted from Ghost's member auth behaviour
   ⚑; both appear in reader-facing copy, which is why they are fields.
3. **"Renews" and "Ends" are one date and two words** ⚑ — confirm a theme can read
   `cancel_at_period_end`, or all thirteen designs drop the word.
4. **Portal can be opened at a named panel** (`account/plans`, `account/newsletters`,
   `account/profile`) and **11 Rail is wired to all three** — **answered in this pass**. The
   remaining dependency is product: Portal must be configured not to intercept the themed pages.
5. **A tier's benefit list may not be exposed to themes** in the shape 8 Tiers draws ⚑.
6. **There is no stepped-flow module in the registry** ⚑ — 13 Steps draws its steps as typography and
   names `tabs` as the closest. Not a request for a new module.
7. **Comped and cancelled can be true at once** ⚑ — drawn in the account stress frame.
8. **Most members have no name** ⚑ — every design puts the email in the name slot and draws no
   initial; 9 Big Type sets it at 72 px.
9. **One-time code sign-in needs a `member-form` registry extension and an endpoint** ⚑ — **new.**
   The panel is drawn in all thirteen designs at One-time code entry: On, marked **ARCHITECT**, and
   no module name was invented. No-JS is the field's absence, with the emailed link still working.
10. **Tier prices are in the smallest currency unit** ⚑ — **new.** `monthly_price` returns 600 for
    $6, so 8 and 13 render through `{{price}}`. Any theme in this library that prints a raw price is
    wrong by a factor of a hundred.

A30 uses **three of the registry's thirty-one modules** — `member-form`, `price-toggle`, `scroll-spy`
— with eleven of the thirteen designs declaring one, **and one pending extension to `member-form`**.

---

## Reconciliation notes

**Frames changed in this pass — fourteen, and every one of them.** `A30-0 Category Proof` (roster
control counts, two new findings, finding 4 rewritten as answered, and a new reconciliation section)
and **all thirteen design frames**: `A30-1 Centred`, `A30-2 Split Pitch`, `A30-3 Card`, `A30-4
Panel`, `A30-5 Contrast Band`, `A30-6 Cover`, `A30-7 Image Split`, `A30-8 Tiers`, `A30-9 Big Type`,
`A30-10 Boxed`, `A30-11 Rail`, `A30-12 Ledger`, `A30-13 Steps`. In every one: the control panel
rebuilt (Padding retired, new rows, the universal trio, the Data group, the Content group, the
Editing group), the drawn spec card's Controls row rewritten with a **Reconciled** line at its foot,
**an eighth state tile drawn** (the sent panel with one-time code entry), and the sign-out
annotation replaced with the real attribute. Section frames were otherwise redrawn only where an item
changed visible content: **8 Tiers** and **13 Steps** gained the tier deep-link and `{{price}}`
annotations, **11 Rail** the Portal named-panel annotation, **6 Cover** the scrim re-check flag.

Then, one line each, where this pass and the category's earlier rulings met:

- **The universal Background role overlaps A30's `ground` slot.** The tuple's ground describes the
  design's drawn identity; the role is the pack's ground token. Where a role would turn one design
  into another the design keeps its own arrangement — **1 Centred at Contrast is not 5 Contrast
  Band**, because 5 is full-bleed and carries its own internal padding, which no role gives a
  page-ground design. Locked on 5 and 6, locked at Background on 4 and 13, Surface disabled on 3.
- **"A per-design Padding with those same values IS Vertical spacing" removed twelve rows and kept
  two.** 5's **Band padding** and 6's **Cover height** are band-internal and cover-internal ladders
  and keep their own names; in both designs the universal row is locked with "Resolves to 0" and the
  reason shown.
- **Top divider is locked at None on 5 and 6** — the only two places in the category where a
  universal row is turned off rather than defaulted. A rule above a full-bleed band or photograph is
  a second edge on the same line.
- **Member Visibility lands nowhere in A30**, and P0·4's member-aware action editor never opens.
  Rule 9 defers to "a richer member-state model", and the Data group's `signedInBehaviour` is it: the
  route decides what a member sees, so a section-level audience row would hide a page from readers
  Ghost has already sorted. Recorded rather than resolved by adding a row.
- **`imageFocus` stays a field and stops being unreachable.** The spec's "a field, not a control" ⚑
  stands; rule 10's "never a hidden field" is met by drawing it in the Data group as the Image
  Picker's popover row. 6 Cover's frame tile that asserted the old, half-wrong version is amended.
- **12 Ledger's item list was 2–6 and its empty state described nought lines.** The category's 0–6
  wins; the "wants four or more" editor note at one or two lines stays.
- **8 Tiers' and 13 Steps' Order row contradicts "Order is Ghost's and is not selectable" ⚑.** A32
  Paywall already had the row, and two categories drawing the same tiers under two rules is the
  defect. Ghost's own is the default, which is what the old ruling described.
- **One-time code entry is a category row, not thirteen design rows.** The patch asks for it on the
  sent panel; the sent panel is in all thirteen, so it lands in the Data group where it is identical
  everywhere — and the panel itself is drawn as the eighth state in every design.
- **"Buttons accept an optional icon" became one row, not a slot per button.** A30's only button
  that is not a Portal hand-off or a Ghost-driven tier CTA is the primary one, so **CTA icon** is the
  row; P0·2's button-icon rules govern it, and the Portal hand-off buttons take no icon because
  `PORTAL ↗` is already their trailing mark.
- **The list marker is whole-list, including inside 8 Tiers' cards**, whose benefits are Ghost's. A
  per-card marker would be the per-item control the category refuses.
- **Four fixed English literals became fields; four became catalog strings.** Fields:
  `paymentText`, `accessLabel` + `accessText`, `signedInText` + `signedInCtaLabel`, `codeLabel` +
  `codeCta`. Catalog: the three status words and "Sending…", because they are words for a state
  Ghost reports rather than the publication's pitch. **`rowLabels` is seven now, not six.**
- **No Preview control was removed anywhere in A30** — the category never had one. Previewing is
  P0·6's switcher and View as, and the eight states are now genuinely reachable through it, which
  retires the spec's own "the states are drawn rather than reached".
- **2 Split Pitch's heading default is a token, not a sentence.** `{{@site.title}}` in the
  category's fallback shape, so a fresh section reads as a heading rather than as fixture copy — and
  it matches the empty-state rule the other twelve designs already used.
- **The sign-out "verify the attribute" flag is resolved, not carried.** `data-members-signout` is
  Ghost's only sign-out mechanism; `signOutLabel` exists as a field and is wired to that button.

— End of specification —
