# A32 Paywall / Content CTA — written specification

12 designs · Paper pack · drawn 24 August 2026 · **design patch pass, 29 August 2026**

**Reconciled 25 August 2026** against the PRD's control vocabulary and Ghost's verified data surface — see
*Reconciliation notes* at the end for what changed and why.

**Design patch pass — 29 August 2026 (this document's current state).** Three platform facts landed on
this category and two of them deleted drawn content. **A stylesheet cannot count lines**, so the fade's
"suppressed under two lines of visible text" rule is deleted: **the fade is a fixed height** — 96, 160 or
240 px of the page ground anchored to the end of the preview — and suppression after a heading, a figure, a
code block or an embed stays, because that is an element type CSS can see. **A template cannot count
either**, so **12 Meter's label is now one static line from `post.reading_time`** and **the proportional
fill is `reading-progress`'s**, drawn from the reader's scroll and hidden on a very short post; as drawn,
the label asked a template to count the words in the preview, which no template can do. **Ghost's signup
endpoint refuses a plain form submission** — tested against two live Ghost servers — so the "posts
natively" promise is withdrawn and **1 Fade and 6 Split Pitch draw P0·4's no-JavaScript notice in the
form's place**, the sent, error and loading states unchanged. With it, **every member button in the
category is marked conditional** and every Portal action carries the line: with JavaScript off, nothing
happens. **Two counts became number pickers** — 8 Ledger's Rows shown and 7 Tiers' Benefits per card — and
**the hand-off rule is withdrawn**: no design turns into another; a section hides what does not apply and
the panel may advise. **Nothing was renumbered.**

**[Free] designs:** 1 Fade · 5 Boxed

*(Shortlisted in this pass and **confirmed by the owner on 29 August 2026**: the category default plus the one
thin outlined box — neither needs a photograph, a price or a reading time, and both draw identically with
JavaScript switched off.)*

The frames are `A32-0 Category Proof.dc.html` and `A32-1` … `A32-12`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

The category's additional artefacts are **on the proof frame, not here**: the cut anatomised, the
tokenisation proof (2 Card in three packs, light and dark), the stress frame and its five hard cases,
the roster, the component inventory and the findings for the architect. The shared field list is
repeated below because the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A30 and A34 are specified in root-level `<ID> — Spec.md`
files and this follows them.)*

---

## 0 · The category layer

### What A32 is

**One element, four gates.** A32 renders mid-article, at the point a members-only post stops. Every
design draws four gates from one field list — **free signup** (a members post, a signed-out reader),
**paid** (a paid post, a signed-out reader), **upgrade** (a paid post, a signed-in free member) and
**specific tier** (a post sold to one named tier) ⚑. A publication picks a design and gets all four.

**The fact to read first.** Ghost sends the free preview and nothing below it. **The fade and the
blur are drawn over text the browser already has; the withheld text was never in the response** ⚑.
Every frame carries that line and no control in any design moves it. The corollary is stated in every
panel that offers a blur: **the truncation is the protection and the blur is a picture of one**.

**A reader with access never sees this section** ⚑ — Ghost sends the whole post and A32 does not
render. There is no unlocked state, no thank-you and no dismissed-forever state, and no design may
draw one.

A32 inherits **A25's article measure and body type** (620 · 720 · 840 at 1440, 754 at 834, 350 at
390; body 19/1.7, h2 32); **A17's content box and padding ladder** (1,296 on 72 · 754 on 40 · 350 on
20; 64 · 96 · 132, 80 at 834, 64 at 390); **A1's primary button, ghost action and eyebrow**;
**A16/A30's 46 px email field**; **A5·5's split head and A5·11's list treatments**; **A7·1's tier
card and A7·3's tier row, verbatim**; **A9·15's ledger row**; **A19·3's surface plane**; **A20·13's
warm scrim**; **A17·7's on-contrast derivation**; **A18·3's clipped-string rule**; **A29·5's hand-off rule, withdrawn in this category by the ruling that no design ever turns into
another** ⚑; **A30's Portal boundary**. **A32 adds eight components to the vocabulary** (proof frame)
**and nothing else.**

### The four settlements (§8 of the brief)

**1 · The cut.** The fade is a gradient of the page ground over the last visible block — **a fixed height of 96, 160 or 240 px, never over the gate and never over withheld text** ⚑, because there is no withheld text in
the page to cover. **The fade belongs to the last visible block, not to the section** ⚑, which is
what makes it a stylesheet rule — `p:last-child`, `ul:last-child`, `ol:last-child` — rather than a
script, and why **a heading, a figure, a code block or an embed gets no fade at all** ⚑. **Blur is
offered and is labelled as decoration** ⚑: 2.6 px on the last visible paragraph, whose words stay
selectable and stay in the page source.

**2 · Free signup versus paid upgrade.** Ghost picks the gate from `post.visibility` ⚑. Free signup —
"Keep reading with a free account" · "Sign up free". Paid — "The rest of this piece is for members" ·
"See membership". Upgrade — "This one is for paying members" · "Upgrade". Named tier — "This piece is
for Patron members" · "See Patron" ⚑. **All four sets are fields; those words are defaults.** **The
free gate is the only one a theme can complete itself** ⚑ — an email address and Ghost's members
endpoint — which is why the email-field control value exists only there and is greyed on the other
three with the reason shown. **No design states a price it was not given** ⚑: many tiers → "From $6 a
month", one tier → that price, **no tier → the price clause disappears** rather than defaulting to a
number ⚑.

**3 · The Portal hand-off, and the signed-in free member.** Every action opens Portal ⚑ —
`#/portal/signup` for the free and paid gates, `#/portal/signin` for the secondary link,
`#/portal/account/plans` for the upgrade. **A32 does not draw the `PORTAL ↗` tag** ⚑: A30's account
rows carry it because they look like settings, and these are calls to action. The destination is
annotated in mono on every frame, **outside the section**. **A signed-in free member on a paid post
gets the upgrade gate** ⚑ — no sign-in link, greeted by name where Ghost has one, pointed at the
plans panel. **On a members-only post the same reader has access and A32 does not render.**

**4 · A paragraph, a heading, an image — and A25's open contract.** After a paragraph the fade runs
at its control value. **After a heading the fade is suppressed and the space above the gate grows** ⚑
— 72 in the boxed and carded designs, 132 in 9 Big Type — so the heading is never read as the gate's
own title. **After an image the fade is suppressed absolutely** ⚑ (A19's rule that no design filters,
dims or tints a photograph); two designs advise another design at that landing (7 and 10) and
neither switches to it — advice in the panel, never a switch ⚑. **A25's finding 8 asked A32 to state what it expects to be handed.** It is three
things: the article's ground or box **closed above the cut**, the page ground **unchanged at the
seam**, and **the last visible block's element type reachable from CSS**. **The third is not settled**
⚑ — `:last-child` works only if Ghost's truncation leaves the last block as the article's last child.
A32 asks the build for a class on the article naming that type, and that is a finding, not a design.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The seam.** A32 draws its own top padding, measured **from the last visible block and not from the
  end of the fade** ⚑: **64 · 96 · 132** at 1440, **80** at 834, **64** at 390 — A17's ladder. **Two
  designs shift it and both say so:** 9 Big Type runs 96 · 116 · 132 and defaults to Spacious ⚑;
  12 Meter defaults to Compact ⚑. **4 Contrast Band, 10 Cover and 11 Sticky Bar's bar have no padding
  of their own** — the band, the cover and the bar carry it.
- **The fade.** Written from the ground token in every pack — `rgba(<ground>,0)` to `<ground>` ⚑ — and
  never from white. **It is a fixed height** ⚑ — 96, 160 or 240 px anchored to the end of the preview,
  whatever is above it — and **the old "suppressed under two lines of visible text" rule is deleted**,
  because a stylesheet cannot count lines and a one-line last paragraph would have faded to nothing.
  **Suppressed absolutely after a heading, a figure, a code block or an embed**, whatever the control says:
  that is an element type, which CSS can see. **At a one-sentence preview the panel advises Short 96 or
  None** ⚑ — advice, never a rule that fires by itself. **It is never wider
  than the article's measure**, even where the gate is wider (6, and 3 and 5 at their widest values) ⚑.
- **The measures.** The gate is the **article's measure** in 1, 2, 5, 11's twin and 12; **560 of copy**
  on a plane, a band or a cover (3, 4, 10); **the column's own width** where a column decides it (6);
  and **1,040** in 9 Big Type. **A measure never grows with its container** ⚑.
- **The type.** Eyebrow 13 uppercase tracked .08em · gate heading 34, 84 in 9 · sentence 17, 16 at 390
  · button 15/600 · secondary link 14, 16 in 9 · ledger name 17 and detail 14 · meter label 13.5 ·
  mono annotations 9.5–11. **Nothing below 13** ⚑. **The type ladder is never scaled by a control** ⚑
  — 9's Display size moves the heading and nothing else, and 9 says so in its own panel.
- **Accent, once per design.** **The primary button, and nothing else** — except 7 Tiers' marked-tier
  label, which is that design's second use and is a 12 px word rather than a fill ⚑. **4 Contrast Band
  and 10 Cover have no accent at all**: on the band the Paper accent measures 4.0:1 and on a 45 % scrim
  2.9:1, and in both the value is disabled with its ratio shown ⚑. **The meter is never accent** ⚑.
- **Targets.** The primary action, every secondary link, the period toggle and the bar's close button
  are **44 px or taller**; the close button is a 38 px box in a 44 px target ⚑. **The meter, the mono
  ordinals and the marked-tier label are not targets** and are excluded from focus order.
- **Responsive floor.** The article measure narrows with the page and the gate follows it (1, 2, 5, 12)
  · splits collapse at **833** (6) · grids stack at **767** (7) · **bands, covers, cards, boxes and
  planes do not collapse at all** (2, 3, 4, 5, 10) · **the sticky bar stacks its contents at 767 and
  stays pinned** (11). **At ≤ 767 the primary button goes full width in every design** ⚑ and the
  secondary line moves beneath it. Every element that leaves a width has a stated destination.
- **Dark.** A27's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm shadows dropped
  and the hairline carrying every plane; **card and plane depth forced to Flat** ⚑. **The fade is the
  dark ground** ⚑. **Body text sits at 12.4:1 and the gate's heading at 15.1:1** — A25's deliberate
  step, carried. Accent re-checked: `#171511` on `#E0805A` is 4.9:1. **4 Contrast Band inverts with
  the mode** and becomes the light band on a dark page ⚑.
- **Print.** **The preview prints and the gate does not** ⚑ — a printed paywall is an advertisement on
  paper. The fade is not printed either; the last visible paragraph prints at full strength ⚑.
- **Behaviour.** **Seven designs declare nothing beyond `core`**; 1 and 6 declare `member-form` at one
  control value, 7 declares `price-toggle`, 11 declares `dismiss` at one value, 12 declares
  `reading-progress`. **No design declares more than one.** Sticky uses `position: sticky` and declares
  nothing ⚑. **A32 is the least scripted category in the library so far** — **and not one of its actions works without
  JavaScript** ⚑: every action opens Ghost's Portal, which is JavaScript, and **1 Fade's and 6 Split Pitch's
  email field is replaced by P0·4's no-JavaScript notice** rather than posting to Ghost, whose signup
  endpoint refuses a plain form submission. **The sent, error and loading states are unchanged.**
- **Refused category-wide, each with a reason:** **an overlay or modal over the preview** ⚑ (there is
  nothing to cover, and it would trap a reader who wants to re-read what they did get) · **a blur over
  withheld text** ⚑ (it was never sent) · **"2 of 3 free articles this month"** ⚑ (Ghost has no
  metering, so the number would be invented) · **a countdown or a limited-time price** ⚑ (the
  registry's `countdown` is for a deadline a publication authored, not for pressure a theme
  manufactures) · **a card form** ⚑ (Stripe's, and PCI's) · **a member count or "join 4,000 readers"
  line** ⚑ (not queryable) · **a permanent dismissal** ⚑ (a paywall a reader can hide forever is a
  paywall a publication cannot use) · **an accent left border on a box** ⚑ · **a per-item control of
  any kind** ⚑ · **an inserted ellipsis where the preview ends mid-sentence** ⚑ (the fade is the
  punctuation; an inserted "…" is the theme writing in the author's voice).

### The three universal controls, and what they replaced

Every placeable section carries **Background role**, **Vertical spacing** (Compact · Comfortable · Spacious) and
**Top divider** (None · Line · Fade), **outside its own control list and outside the count** ⚑. A32's own
per-design "Padding" was those same three values under a second name, so **it is folded into Vertical spacing in
nine of the twelve** — 1, 2, 3, 5, 6, 7, 8, 9 and 12. **Three ladders survive under their own names because they
are genuinely different measurements**: 4's band-internal padding (48 · 72 · 104), 10's cover height and 11's bar
height. **9 Big Type's shifted ladder rides on Vertical spacing** (96 · 116 · 132) with its default at Spacious,
and **12 Meter's default stays Compact** — a design may move the default, not the name.

**Two designs lock Background role, with the reason shown** ⚑: 4 Contrast Band (an inverted band that can be set
to the page ground is 3 Panel with extra steps) and 10 Cover (a cover with no photograph draws its scrim colour as a flat ground, and the panel
advises 4 Contrast Band without switching to it ⚑). **A32's fade is not Top divider** — the divider sits above the section; the fade belongs to the last
visible block.

### Editing, inline and by gate

**The four gate copy sets are edited in place** through the **P0·6 editor state switcher** — "Gate: Free signup ·
Paid · Upgrade · Named tier" — in every one of the twelve panels ⚑. **Before this pass three of the four were
blind fields**: the editor could only see the copy for the gate the current post happened to be. The switcher
changes which set you are editing and never the design, and **the on-site gate stays Ghost's**: the source row
below it is read-only.

Everything visible edits inline with the **P0·1 floating toolbar** (bold · italic · underline · link, the link
popover carrying "Open in new tab" and rel nofollow / noreferrer / sponsored): `eyebrow`, `heading`, `blurb`,
`ctaLabel`, the sign-in line, `manageLinkLabel`, `legal`, every `benefits[]` line, `barLine`/`barSub` and
`meterLabel`. **Ghost-owned content is never inline-editable** ⚑ — a tier's name, price, description or benefits
answers "Edit in Ghost". **No design has a URL field**: every action is a fixed Portal destination, shown
read-only in the Data group so nobody hunts for one.

**`benefits[]` mechanics, specified once** and shared by 1, 2, 3, 4, 5, 6, 8 and 10: **Add a line arrives with
content** · **remove is never disabled, never dimmed and never hidden** ⚑ — **and there is no minimum to hit**: the
list may go to nought, at which point the design hides the list and its hairline and renders as itself · **drag to reorder** · per-item name (60 ch) and detail (90 ch) ·
**min 0, max 6** ⚑. It is the category's only authored repeater, which is why it is the only list with an Add
button — **7 Tiers' cards are Ghost's and correctly have none**. **The CTA takes an optional icon** before or
after its label from the **P0·2 Icon Picker**, with that picker's size and colour-role popover; 10 Cover's image
field carries **Image focus** (Centre · Top · Bottom) reachable from the Image Picker popover rather than hidden.

**Every visitor-facing string is a field with a default** ⚑ — eyebrow, heading, blurb, button label, sign-in
prompt and link, manage link, legal line, benefit names and details, bar line and sub, meter label. **The two
strings that are not authored are theme translation-catalog strings**: the close button's accessible label in
11 Sticky Bar and the meter's accessible name in 12 Meter, both of which a publication never sees in the editor.
**No fixed English visitor-facing string ships.**

### Prices, and the flag that guards them

**Prices render through Ghost's `{{price}}` helper** ⚑. Tier prices arrive in the **smallest currency unit**, so a
raw print of "From $6 a month" ships "From 600 a month". This applies to 1 Fade's price clause, 7 Tiers' cards
and tier note, and **every gate sentence in every design that states a price**.

**The paid and upgrade displays are gated on `@site.paid_members_enabled`** ⚑ — when it is false they fall back
to the free copy set. The earlier "0 paid tiers → hand off" branch treated the symptom; **the flag is the guard**,
and the tier count is now only a layout question.

### The controls every design shares — the Access source group

Five rows, identical in all twelve, **below** each design's own controls and **not counted toward the
brief's 4–7** ⚑, three of them read-only.

| Field | Type | Values |
|---|---|---|
| Which gate this is | read-only | From the post's visibility — `public` · `members` · `paid` · a named tier ⚑ |
| A signed-in free member on a paid post | select | The upgrade gate *(default)* · The same gate as a visitor ⚑ |
| Tiers | select | From Ghost, visible only *(default)* · From Ghost, all · Off — **no Add, no Remove** ⚑ |
| What is above the cut | read-only | Ghost's preview, unchanged — the section cannot lengthen, shorten or restore it ⚑ |
| Where every action goes | read-only | Ghost Portal — signup, sign-in, checkout, plan changes ⚑ |
| The button on this site | read-only | **Rendered only where the connected site can take it** ⚑ — not with self-signup switched off, not with no payment provider connected. Then the gate is its words and the sign-in line ⚑ |
| With JavaScript off | read-only | **The section draws and the action does nothing** ⚑ — Portal is JavaScript. In 1 and 6 the email field is replaced by P0·4's notice |
| Paid memberships enabled | read-only | From `@site.paid_members_enabled` — false falls the paid and upgrade gates back to the free copy ⚑ |
| Prices | read-only | Rendered through `{{price}}` — the smallest currency unit, never printed raw ⚑ |
| Where this gate's action goes | read-only | `#/portal/signup` · `#/portal/account/plans` on the upgrade · `#/portal/signin` on the sign-in line ⚑ |

**Member Visibility is deliberately absent** ⚑. The PRD asks CTA-bearing designs to carry Everyone / Logged out /
Free members / Paid members; **A32's four-gate model is the richer member-state model that subsumes it** —
`post.visibility` and `@member` already decide which of four gates renders, and **a reader with access never
sees the section at all**. A second, contradictable visibility control here would let a publication hide the
paywall from the only people who see it. Recorded in the reconciliation notes rather than silently dropped.

### The roster

| # | Design | Tuple | Ctl | Modules |
|---|---|---|---|---|
| 1 | Fade | `article body · none · page · none · none · the fade into the measure` | 6 | `core` · `member-form` at one value |
| 2 | Card | `stack · card · page · none · none · a raised card over the fade` | 6 | `core` |
| 3 | Panel | `stack · none · surface · none · none · the gate on one raised plane` | 6 | `core` |
| 4 | Contrast Band | `stack · none · contrast · none · none · an inverted full-bleed band` | 6 | `core` |
| 5 | Boxed | `stack · box · page · none · none · one hairline box in the measure` | 6 | `core` |
| 6 | Split Pitch | `split · none · page · none · none · the reason beside the action` | 6 | `core` · `member-form` at one value |
| 7 | Tiers | `grid-of-N · none · page · few · none · tier cards at the cut` | 6 | `price-toggle` |
| 8 | Ledger | `stack · none · page · many · none · what is included as ruled rows` | 6 | `core` |
| 9 | Big Type | `stack · none · page · none · none · the promise at display size` | 6 | `core` |
| 10 | Cover | `stack · none · image · none · background · the gate over a photograph` | 6 | `core` |
| 11 | Sticky Bar | `sticky · none · surface · none · none · a bar pinned to the foot` | 6 | `core` · `dismiss` at one value |
| 12 | Meter | `bar · none · page · none · none · a read meter above the gate` | 6 | `reading-progress` |

**Two of the twelve are free**, and the `**[Free] designs:**` line at the head of this document is the
merge's only input: **1 Fade · 5 Boxed**, the owner's own choice, confirmed on 29 August 2026.

**Ctl is each design's own count after reconciliation** — the universals, the Data group and the Access source
group sit outside it. The counts are 1: 8 · 2: 8 · 3: 8 · 4: 8 · 5: 7 · 6: 8 · 7: 7 · 8: 8 · 9: 8 · 10: 9 ·
11: 7 · 12: 7, all inside the PRD's ~15 ceiling. **Quick Controls stay three per design**: 1 Fade (Fade · Action
· Included list) · 2 Card (Card width · Card depth · Overlap) · 3 Panel (Plane width · Alignment · Included row) ·
4 Contrast Band (Band padding · Band edges · Included list) · 5 Boxed (Box width · Box rule · Action) · 6 Split
Pitch (Split · Action side · Action) · 7 Tiers (Tiers shown · Period · Mark a tier) · 8 Ledger (Row density ·
Detail line · Rows shown, a number picker) · 9 Big Type (Display size · Alignment · Sentence) · 10 Cover (Cover height · Scrim ·
Alignment) · 11 Sticky Bar (Bar height · At the cut · Dismissible) · 12 Meter (Meter style · Meter label ·
Meter width).

All twelve are distinct on the five closed slots. **Containment separates 1, 2 and 5** — `none`,
`card`, `box`. **Ground separates 1, 3, 4 and 10** — `page`, `surface`, `contrast`, `image`.
**Archetype separates the four that share `none · page · none · none`** — 1 `article body`, 6 `split`,
9 `stack`, 12 `bar`. **Item-count separates 7 and 8** — `few` queried tiers against `many` authored
rows. **Media separates 10** alone, at `background`. **Containment is `none` in ten of twelve** ⚑:
7's cards are the *items'* geometry, not the section's (A21·2's rule).

**What the check cannot promise.** 9 and 1 differ on archetype and on nothing a machine can see —
what distinguishes them is scale ⚑. 3 and 11 are both `surface` grounds separated by archetype alone.
2 and 5 are one design in two containments: visible at rest, thin written down. Each design's panel
names the designs it is closest to, by number, and says which control value would turn it into its
neighbour.

### The shared field list

The union every design draws from. **The gate copy set — the first five fields — exists once per
gate** ⚑, so a post whose visibility changes from members to paid does not lose its wording.

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | all but 12 | Defaults "Members only" · "Free account" · "Patron members" ⚑. **Shown or hidden by its own control** — clearing the field cannot hide it, because every gate has a default ⚑ |
| `heading` | text | opt | 60 ch | all 12 | **Enforced at 60 in 9** ⚑, advisory elsewhere; 6 sets two lines at 40 |
| `blurb` | text | opt | 240 ch | all 12 | 11 draws it in the twin only ⚑; 9 hides it at Sentence = Hide |
| `ctaLabel` | text | opt | 24 ch | all 12 | Defaults "See membership" · "Sign up free" · "Upgrade" · "See Patron" |
| `signinPrompt` · `signinLinkLabel` | text | opt | 30 · 24 ch | all 12 | "Already a member?" · "Sign in". **Absent on the upgrade gate** ⚑ |
| `manageLinkLabel` | text | opt | 24 ch | all 12 | The upgrade gate's secondary; default "Manage your membership" ⚑ |
| `legal` | text | opt | 160 ch | 1, 6 | **Authored, never generated** ⚑; drawn only where there is an email field |
| `benefits[]` | list 0–6 | opt | name 60 ch · detail 90 ch | 1, 2, 3, 4, 5, 6, 8, 10 | **The category's only authored repeater** ⚑ — P0·3 item controls, Add arrives with content, remove never disabled, drag to reorder ⚑; **the detail is drawn only by 8** |
| `benefitsLabel` | text | opt | 24 ch | as `benefits[]` | Default "What a membership includes"; stored and not drawn by 4 and 8 ⚑ |
| `image` · `imageAlt` · `imageFocus` | image · text · enum | **req in 10** | ≥ 2,400 px · 120 ch · Centre / Top / Bottom | 10 | **No image → the cover draws its scrim colour as a flat ground at the same height** ⚑. **Focus is reachable from the Image Picker popover and shown in the panel** — never hidden ⚑ |
| `barLine` · `barSub` | text | opt | 60 · 60 ch | 11 | `barLine` defaults to the gate's heading, clipped to one line ⚑ |
| `meterLabel` | text | opt | 90 ch | 12 | **`{total}` is the only token** ⚑ — **`{read}` is deleted**, because it asked a template to count the preview; never a percentage numeral |
| `periodLabels` · `tierNote` | text | opt | 12 ch × 2 · 90 ch | 7 | "Monthly" · "Yearly"; the note is the price-and-cancellation line |
| *post.visibility* | Ghost | req | — | all 12 | `public · members · paid · tiers` — **this picks the gate** ⚑ |
| *post.access* | Ghost | req | — | all 12 | **`false` is the only value at which A32 renders** ⚑ |
| *@member* | Ghost | opt | — | all 12 | `name · status · subscriptions` — decides the upgrade gate; **most members have no name** ⚑ |
| *post.reading_time* | Ghost | opt | — | 12 | **The label's only source** ⚑ — a static line built from it; the proportional fill is the module's. **ARCHITECT — verify it is the whole post, not the preview** |
| *tiers* | Ghost | opt | — | 7 | `name · monthly_price · yearly_price · currency · description · benefits` — **read by all 12, drawn by 7** |
| *@site.title* | Ghost | req | — | all 12 | The heading's fallback and the gate's accessible name ⚑ |

Four fields are drawn by exactly one design each — the benefit detail (8), the bar's two lines (11),
the meter label (12), the period labels (7) — **and all four are stored by the other eleven** ⚑.

### Repeating items — tiers come from Ghost

Only 7 Tiers draws a repeated item, and the item is Ghost's, not the user's.

- **How many, and what it is designed for.** Two cards at 636 in the 1,296 box. **1 → one card centred
  at 636** and Mark a tier is greyed ⚑. **2–3 → cards.** **4+ → A7·3's tier rows, never a 4-up** ⚑
  (A30·8's rule, carried). **0 paid tiers → the cards, the period toggle and the tier note are hidden and the design draws
  its head, sentence and action with the free copy** ⚑ and the editor says so — **never another design**;
  the panel may advise 1 Fade.
- **Order is selectable from a closed list** — Ghost's own order · Price, low to high · Price, high to
  low — **and never dragged** ⚑: dragging implies a stored position per tier, and a tier added in Ghost
  tomorrow would have no position.
- **Fields shown per card:** name, **price for the chosen period through `{{price}}`** ⚑, description, up to three
  benefits — **tiers do expose benefits to themes, so the card builds as drawn and the earlier hedge is dropped**
  ⚑ — and the button. **Each button is a Portal tier deep link**: `#/portal/signup/{tierId}/monthly` or
  `/yearly`, **following the period toggle — `price-toggle` swaps the hrefs as well as the prices** ⚑. **The free
  card at "All, including free" goes to plain `#/portal/signup`** ⚑. **A tier with no description closes up and reserves nothing** ⚑; **a tier with no benefits is
  name, price, button** ⚑; **a tier with no yearly price disables the Yearly cell with the reason
  shown** ⚑.
- **No Add and no Remove**, and **no per-card control of any kind** ⚑. Mark a tier picks a rule ("the
  most expensive"), not a card. 8 Ledger's rows are the section's own `benefits[]` and **are** a real
  repeater — that is the difference between `few` and `many` here.

---

## 1 · Fade

1. **Descriptor.** The last visible paragraph fades into the page ground and the gate continues in the
   article's own measure — eyebrow, heading, sentence, button, sign-in line — with no box, plane or
   rule of its own. The category default.
2. **Structural descriptor.** `article body · none · page · none · none · the fade into the measure` —
   archetype `article body` because the gate takes the article's measure and its collapse, not a
   section's ⚑; containment `none` and ground `page` are what 2, 5, 3 and 4 each change exactly one of.
3. **Archetype.** article body. The measure narrows with the page and nothing rearranges. One
   departure: **the fade steps to 120 at ≤ 767** ⚑.
4. **Responsive rule.** **1440** measure 720 centred in the 1,296 box on a 72 margin, heading 34, fade
   160, padding 96. **834** measure 754, heading 30, fade 160, padding 80. **≤ 767** measure 350,
   heading 25, fade 120, **button full width and the sign-in line beneath it** ⚑, padding 64.
5. **Content fields.** `eyebrow` · `heading` · `blurb` · `ctaLabel` · `signinPrompt`+`signinLinkLabel`
   · `manageLinkLabel` · `legal` · `benefits[]` · `benefitsLabel` — **and the first five again for each
   of the four gates** ⚑. **No image is drawn**; the field is stored ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Fade | None · Short 96 · Standard 160 · Deep 240 |
   | Blur the last block | Off · On |
   | Action | Button · Button and email field · Text link |
   | Included list | Show · Hide |
   | Included list items | the P0·3 item controls |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **Padding is gone** — it was Vertical
   spacing under a second name.
7. **Data.** `post.visibility` decides the gate; `post.access` decides whether the section renders at
   all ⚑. The preview is Ghost's and the section cannot change it. Tiers read and **not drawn**.
   **0 tiers** → the price clause leaves the sentence and the button reads "See membership" ⚑. **1** →
   that tier's price. **many** → the lowest paid price, prefixed "From".
8. **Empty state.** No blurb → the stack closes up. No benefits → the hairline goes with the list ⚑.
   No eyebrow → the heading rises 12 px and nothing is reserved. **The heading has a default** ⚑,
   because a paywall with no heading is a button with no reason.
9. **Behaviour module.** **At Action = Button or Text link, none; `core` assumed. The section is drawn
   identically with JavaScript off** ⚑ — server-rendered HTML, a gradient, `:last-child` selectors — **and
   the action is dead**, because it opens Ghost's Portal and Portal is JavaScript ⚑. **The button does not
   render at all where the connected site cannot take it** ⚑ — self-signup off, or no payment provider
   connected — and then the gate is its words and the sign-in line. **At Button and email field it declares
   `member-form`** ⚑. **No-JS:** Ghost's signup endpoint refuses a plain form submission, so **the form is
   replaced by P0·4's no-JavaScript notice at the form row's own height** ⚑ — *"Signing up needs JavaScript
   — turn it on to subscribe."*, plain text and not an alert, no field and no button, the legal line kept
   beneath. **The sent, error and loading states are unchanged** — Ghost's own script applies them.
   **Edit-safe:** the resting state is the only state.
10. **Accessibility.** The gate's heading is an `h2`, not an `h1` ⚑ — A24's post header owns the page's
    only one, and the gate sits inside `<article>`. **The fade is a decorative `<div aria-hidden>`** ⚑.
    Focus order: the last visible link in the article, the primary action, the secondary line. Muted on
    the page ground 5.4:1; accent button 4.7:1 ⚑.

**Flagged ⚑** The 160 px default fade is A32's own number. Suppressing the fade after a heading, an
image, a code block and an embed is this category's invention, stated as a `:last-child` rule rather
than a script. The four-gate copy set is invented — Ghost supplies the visibility, not the words.

---

## 2 · Card

1. **Descriptor.** The gate inside one centred surface card at the article's measure, at the pack's
   radius + 4 with the md warm shadow, standing in front of the article's fade. 1's stack in a
   containment.
2. **Structural descriptor.** `stack · card · page · none · none · a raised card over the fade` —
   containment `card` (the section itself sits in one); ground `page`, because the card is *on* the
   page ground and the card's own surface is not the section's ground ⚑. That is the whole distinction
   from 3.
3. **Archetype.** stack. One departure: **the card does not go edge-to-edge at any width** ⚑.
4. **Responsive rule.** **1440** card 720 centred, inner 32, heading 34, fade 160, gap above 72.
   **834** card 754, inner 32, heading 30, gap 64. **≤ 767** card 350, inner 22, heading 25, fade 120,
   **button full width, shadow kept** ⚑, gap 52.
5. **Content fields.** As 1. `benefits[]` is drawn at **three lines** and a fourth is stored and not
   drawn ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Card width | Narrow 560 · The measure 720 · Content box 1,040 |
   | Card depth | Raised · Flat |
   | Overlap | Sits below the fade · Rises into it by 40 |
   | Fade | None · Short 96 · Standard 160 |
   | Included list | Inside the card · Hide |
   | Included list items | the P0·3 item controls |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group.
7. **Data.** As 1. **The card's height is its content in every gate** ⚑ — the upgrade gate is four
   elements tall and the paid gate seven, and neither is padded to match. Tiers read, not drawn.
8. **Empty state.** No benefits → the hairline goes with the list and the card ends at the sign-in row.
   **An empty card is not reachable** ⚑. No eyebrow → the card's first line is the heading.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1, and **the card is a plain `<div>` — not a region, not a dialog, not
    `aria-modal`** ⚑: it is a paywall, not a blocker, and the page above it is a page the reader may
    keep reading. The ring is drawn against the card's surface, where the accent measures 4.4:1 —
    checked, and the reason the ring is 2 px rather than 1.5 ⚑.

**Flagged ⚑** The 40 px overlap is invented. Refusing Deep 240 behind a raised card is a judgement
made here. Forcing Flat in dark is carried from A19·3. **Overlap is refused after a heading and after
an image** — the card would be overlapping nothing, or a photograph.

---

## 3 · Panel

1. **Descriptor.** One raised plane the width of the content box carrying the gate centred on a 560
   measure and a three-column included row under a hairline. 1's components with the section's ground
   changed.
2. **Structural descriptor.** `stack · none · surface · none · none · the gate on one raised plane` —
   containment `none` and ground `surface`, because **a full-width plane is a ground, not a
   containment** (A26·3 and A27·4's call ⚑). Item-count `none`: the included row is authored prose.
3. **Archetype.** stack. No departures; the plane narrows with the content box and the included row
   follows the grid ladder.
4. **Responsive rule.** **1440** plane 1,296 on a 72 margin, inner 56, copy 560, row three up, padding
   96. **834** plane 754, inner 40, copy 520, row three up, padding 80. **≤ 767** plane 350, inner 20,
   copy 310, **row stacked** ⚑, fade 120, padding 64.
5. **Content fields.** As 1. `benefits[]` is the field this design leans on — **three authored lines is
   what the row is designed for**, two draws two columns left-aligned, none hides the row and its
   hairline ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Plane width | Content box 1,296 · Held 1,040 · The measure 720 |
   | Plane depth | Raised · Flat |
   | Alignment | Centred · Left to the measure |
   | Included row | Three up · Hide |
   | Included list items | the P0·3 item controls |
   | Fade | None · Short 96 · Standard 160 · Deep 240 |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group.
7. **Data.** As 1. **The plane is never hidden** ⚑ — it is the ground, and a section with no ground is
   1. Tiers read, not drawn; 0, 1 and many are the same plane.
8. **Empty state.** No benefits → hairline and row both go and the plane shortens to the copy. No blurb
   → heading then button. **On the upgrade gate the row is suppressed by rule** ⚑, not by the control, and **the plane renders as itself**: the panel may advise 1 Fade for a site that mostly meets signed-in free members and never switches to it ⚑.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1. **The plane is a `<div>` and not a landmark** ⚑. The included row is a
    `<ul>` with the mono ordinals `aria-hidden`. Focus rings are drawn against the surface, where the
    accent measures 4.4:1 ⚑.

**Flagged ⚑** "Held 1,040" is an invented second plane width, carried from A30·4. The mono ordinals on
the included row are this design's own. **No ground value:** a Page value would make it 1 and a
Contrast value would make it 4 — two designs that differ by one control value are one design.

---

## 4 · Contrast Band

1. **Descriptor.** The gate as a full-bleed inverted band carrying the copy centred on 560 and a
   three-line included list, with every colour on the band derived from the band's carried colour. The
   category's one accent-free design besides 10.
2. **Structural descriptor.** `stack · none · contrast · none · none · an inverted full-bleed band` —
   ground `contrast` is the design; containment `none`, and **at Band edges = Inset it is still a
   ground rather than a card** because it has no hairline and no shadow ⚑.
3. **Archetype.** stack. One departure: **the band does not collapse at any width** ⚑ and Band edges is
   forced to Full bleed at ≤ 767.
4. **Responsive rule.** **1440** full bleed, inner 72, copy 560, page padding above 96. **834** full
   bleed, inner 56, copy 520, padding 80. **≤ 767** **full bleed forced** ⚑, inner 48, copy 310, button
   full width, fade 120, padding 64.
5. **Content fields.** As 1. `benefitsLabel` is **stored and not drawn** ⚑ — a section heading above
   three lines on a band is one hierarchy level too many.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Band padding | Compact 48 · Comfortable 72 · Spacious 104 — **a band-internal ladder, so it keeps its own name** |
   | Band edges | Full bleed · Inset to the content box |
   | Alignment | Centred · Left to the measure |
   | Included list | Show · Hide |
   | Included list items | the P0·3 item controls |
   | Fade | None · Short 96 · Standard 160 |
   | Sign-in link | Show · Hide |
   | Eyebrow | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | **Locked to Contrast**, with the reason shown |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **Background role is locked to Contrast,
   with the reason shown** ⚑.
7. **Data.** As 1. Tiers read, not drawn.
8. **Empty state.** No benefits → the 20 % hairline goes with the list. No blurb → heading then button,
   and **the band's padding is unchanged** ⚑ — a band that shrinks to fit its shortest gate reads as a
   different band on every post.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1. **The focus ring on the band is the carried colour, not the accent** ⚑ —
    15.9:1 against 4.0:1. Muted text on the band is the carried colour at 72 %, which measures 8.9:1 ⚑.
    The band is a `<div>`, not a landmark.

**Flagged ⚑** The 48 · 72 · 104 padding ladder is this design's own and is not A17's. **"Fade into the
band" was drawn and refused** — a gradient that ends in the band colour makes the band look like a
shadow of the article, and at Inset it would end in a colour the band does not have at that
x-position. The contrast ratios are computed from the Paper tokens and hold for Paper only; **every
pack re-checks them**. A17·7's on-contrast derivation (muted 72 % · hairline 20 % · plate 8 %) is
carried, not re-derived.

---

## 5 · Boxed

1. **Descriptor.** One hairline box at the article's measure with no fill and no shadow, holding the
   gate at 28 px of padding. Containment without a plane.
2. **Structural descriptor.** `stack · box · page · none · none · one hairline box in the measure` —
   containment `box`, a hairline with the page ground running through it, which is what separates it
   from 2's `card` ⚑; ground `page`, because the box has no ground of its own.
3. **Archetype.** stack. One departure: **the box does not go edge-to-edge at any width** ⚑.
4. **Responsive rule.** **1440** box 720, inner 28, copy 560, heading 34, fade 160, padding 96. **834**
   box 754, inner 28, heading 30, padding 80. **≤ 767** box 350, inner 20, heading 25, **button full
   width**, fade 120, padding 64. **At ≤ 767 the copy sits 40 px from the frame edge — 20 more than the
   article above it** ⚑, and at Box rule = Top and bottom only that inset disappears and the copy lines
   up with the article again — **the two values are now the whole control** ⚑.
5. **Content fields.** As 1. No field added, none dropped; `benefits[]` draws three ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Box width | Narrow 560 · The measure 720 · Content box 1,296 |
   | Box rule | All round · Top and bottom only |
   | Fade | None · Short 96 · Standard 160 · Deep 240 |
   | Included list | Show · Hide |
   | Included list items | the P0·3 item controls |
   | Action | Button · Text link |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **Left edge only is dropped** ⚑ — a lone
   left rule is the ornament class the owner killed in A1's Side Rail.
7. **Data.** As 1. Tiers read, not drawn.
8. **Empty state.** No benefits → the inner hairline goes with the list. **An empty box is not
   reachable** ⚑. At Top and bottom only with no benefits the box is two rules around four lines,
   which is the design at its smallest and is still coherent ⚑.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1. The box is a plain `<div>` ⚑; its rules are borders and carry no meaning a screen
    reader needs. **The box's hairline never thickens on
    hover or focus** ⚑ — it is containment, not state.

**Flagged ⚑** The 28 px inner padding is A32's own. **Left edge only is dropped in this pass** — a lone left rule
is the ornament class the owner killed in A1's Side Rail, and All round against Top and bottom still tells the
design apart. An accent left border on a box remains the library's most-refused pattern. **Top and bottom only is refused after an image** — three rules in a row is a
table. **No fill value:** a filled box is 2 without its shadow, and a design that is another design
minus one property is not a design.

---

## 6 · Split Pitch

1. **Descriptor.** The reason for membership in a 700 column with numbered included rows and the action
   alone in a 520 column beside it, across the full content box — a gate wider than the article it
   interrupts.
2. **Structural descriptor.** `split · none · page · none · none · the reason beside the action` —
   archetype `split` because the arrangement, not the copy, is the design; media `none`, which is what
   separates it from 10 ⚑.
3. **Archetype.** split. Side by side above 1023, stacked at 833. One departure: **the included list
   sits below the action at every stacked width** ⚑.
4. **Responsive rule.** **1440** 700 / 76 / 520 in the 1,296 box; reason measure 620; heading 40; **fade
   160 at 720 wide, not at the gate's 1,296** ⚑; padding 96. **834** stacked, reason measure 620,
   heading 32, padding 80. **≤ 767** heading 25, **field and button stacked** ⚑, list under the action,
   fade 120, padding 64.
5. **Content fields.** As 1, plus nothing. `heading`'s limit is the difference — **60 characters here
   rather than 40**, because the column takes two lines at 40 px ⚑. `benefits[]` is drawn at four in the
   numbered treatment.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Split | Wide left 700 · Even 636 |
   | Action side | Right · Left |
   | Included list | Numbered rows · Ticks · Hide |
   | Included list items | the P0·3 item controls |
   | Action | Button · Button and email field |
   | Fade | None · Short 96 · Standard 160 · Deep 240 |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group.
7. **Data.** As 1. **The reason column is authored and never queried**, so no data state can empty it ⚑.
   Tiers read, not drawn; 0, 1 or many changes nothing here.
8. **Empty state.** No benefits → the list goes and the reason column ends at the sentence; **the 700
   grid column is kept** ⚑. **Both columns empty is not reachable**: the action is the action and the
   heading has a default ⚑.
9. **Behaviour module.** **At Action = Button, none; `core` assumed — the section is drawn identically
   with JavaScript off and its action is dead** ⚑, Portal being JavaScript, and **the button does not render
   at all where the connected site cannot take it** ⚑. **At Button and email field it declares
   `member-form`** ⚑. **No-JS:** the form is replaced by **P0·4's no-JavaScript notice at the form row's own
   height** ⚑ — *"Signing up needs JavaScript — turn it on to subscribe."*, no field and no button, the legal
   line kept beneath — because Ghost's signup endpoint refuses a plain form submission. **The sent, error and
   loading states are unchanged.** Edit-safe.
10. **Accessibility.** As 1. **DOM order is reason then action at both Action side values** ⚑, which is
    why the stack order is fixed. The numbered list is a real `<ol>` and the mono ordinals are
    `aria-hidden` ⚑. The field has a real `<label>`, `type="email"` and `autocomplete="email"`.

**Flagged ⚑** The 76 px gap is carried from A30·2 rather than A5·5's 40. **A gate wider than its
article is this design's claim and is not a library rule.** **The fade is 720 wide where the gate is
1,296** — drawn, checked and kept, because the gradient belongs to the paragraph it covers. **No
field-width control**, and **no vertical rule between the columns** (a hairline down the middle reads
as a table).

---

## 7 · Tiers

1. **Descriptor.** A short centred head, the monthly-yearly toggle, and the publication's paid tiers as
   A7·1 cards side by side at the cut. The only A32 design that repeats an item.
2. **Structural descriptor.** `grid-of-N · none · page · few · none · tier cards at the cut` —
   item-count `few` (two to four tiers); **containment `none`**, because the cards are the *items'*
   geometry, not the section's ⚑ (A21·2's rule).
3. **Archetype.** grid-of-N. 2-up above 767, stacked below. One departure: **the marked tier is drawn
   first when stacked** ⚑.
4. **Responsive rule.** **1440** two cards at 636 in the 1,296 box, head 34 centred, toggle 44, padding
   96. **834** two cards at 367, head 30. **≤ 767** cards stacked full width, **marked tier first** ⚑,
   head 25, buttons full width, fade 120, padding 64. **Padding is forced to Spacious after a
   heading** ⚑.
5. **Content fields.** As 1, plus `periodLabels` (2 × 12 ch) and `tierNote` (opt 90 ch — the price and
   cancellation line under the cards). `benefits[]` is **stored and not drawn** ⚑: the benefits on the
   cards are the tiers' own, from Ghost.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Tiers shown | The lowest paid · The two lowest paid · All paid tiers · All, including free |
   | Order | Ghost's own · Price, low to high · Price, high to low |
   | Period | Toggle · Monthly only · Yearly only |
   | Benefits per card | **a number picker, 0–6, default 3**, capped at six with the reason drawn |
   | Mark a tier | None · Most popular |
   | Eyebrow | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **No Add and no item controls** ⚑ — the
   cards are Ghost's. **No Sign-in link**: the cards are the action, and a sign-in line under four
   buttons is a fifth decision.
7. **Data.** `#get "tiers"` filtered to paid, plus `post.visibility` and `@member`. **0 paid tiers → the cards and the toggle are hidden and the design draws its head, sentence and action
   with the free copy** ⚑, and the editor says so — never another design. **1** → one card centred at 636
   and Mark a tier greyed ⚑. **2–3** → as drawn. **4+** → A7·3's tier rows, never a 4-up ⚑. A tier with
   no description closes up; a tier with no benefits is name, price, button ⚑.
8. **Empty state.** No heading → the tiers carry the section and the toggle rises 12 px. **No paid tier
   is the empty state that matters** ⚑, and the design renders as itself with its cards hidden rather than
   becoming 1 Fade. **Prices are never
   invented**: no yearly price disables the Yearly cell with the reason shown ⚑.
9. **Behaviour module.** `price-toggle`. **No-JS, quoted:** "Both monthly and yearly prices render side
   by side, each labelled — no toggle control shown." Edit-safe.
10. **Accessibility.** As 1. **The toggle is two radio inputs with a visible group label** ⚑, not a
    switch and not two buttons. Each card is a `<li>` with the tier name as an `h3`; **the card is not a
    link** ⚑ and only its button is a target. "Most popular" is real text inside the card's heading
    area, not a `::before` ⚑.

**Flagged ⚑** The four-tier row rule is carried from A30·8. "Your plan" on the upgrade gate is invented
here. **Whether a tier's benefit list is exposed to themes in the shape this card draws is A30's open
finding, restated** — if it is not, Benefits per card becomes a no-op and the card is name, price,
description, button. **After an image the panel recommends 1 and does not force it.**

---

## 8 · Ledger

1. **Descriptor.** What a membership includes as six ruled rows across the content box — mono ordinal,
   name, one line of detail — with the heading and the action above them. Argument by enumeration.
2. **Structural descriptor.** `stack · none · page · many · none · what is included as ruled rows` —
   item-count `many` (five or more), and **the rows are authored**, which is what separates this from
   7's `few` queried cards ⚑. Containment `none`: hairlines are not a box.
3. **Archetype.** stack. One departure: **the action moves from beside the heading to under the rows at
   1023** ⚑.
4. **Responsive rule.** **1440** rows across 1,296 at 460 / flexible, ordinals 22, action beside the
   heading, padding 96. **834** rows at 330 / flexible, **action under the rows** ⚑, head 30. **≤ 767**
   **each row is two lines** — ordinal and name, detail indented 34 ⚑ — action under the rows, fade 120,
   padding 64. **Row density holds its value at every width and the rows grow taller rather than
   tighter** ⚑.
5. **Content fields.** As 1, and `benefits[]` is the field this design is built on: 0–6 items of name 60
   ch and detail 90 ch, and **the detail is drawn only here** ⚑. `benefitsLabel` is stored and not drawn
   ⚑; the heading is the label.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Row density | Compact 12 · Comfortable 16 · Spacious 20 — **a row-internal ladder** |
   | Detail line | Show · Hide |
   | Ordinals | Mono numerals · None |
   | Action position | Beside the heading · Under the rows |
   | Rows shown | **a number picker, 1–6, default 6**, the + drawn greyed with its reason at the cap |
   | Rows | the P0·3 item controls |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group.
7. **Data.** As 1. **The rows are authored, not queried** ⚑. **0 rows → the rows and their hairlines are hidden and the design draws its heading, sentence and action** ⚑ — never another design. **1** → one
   row between two hairlines, drawn and coherent. **7+** → the cap in Rows shown applies and nothing is
   truncated mid-row ⚑. A row with no detail closes to 40 px and its neighbours do not ⚑.
8. **Empty state.** No benefits → the rows and their hairlines are hidden and the design renders as itself. No detail on any row → Detail line resolves to Hide and
   the design is an index ⚑. No heading → the rows carry the section and the action stays beside where
   the heading was, never centred ⚑.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1. The rows are an `<ol>` and the mono ordinals are `aria-hidden` ⚑. **The
    detail is in the same `<li>` as its name, not a `<dd>`**: it is a clause, not a definition ⚑. No row
    is focusable and no row is a link.

**Flagged ⚑** The six fixture rows are invented content. **Marking rows the member already has is cut** ⚑ —
string-matching authored rows against a tier's benefits is guesswork, and a wrong tick on a paywall is worse than
no tick. **The upgrade gate shows the rows unmarked.** **Never struck through and never dimmed**: struck text on a list of things
somebody is paying for reads as a cancellation. **After an image the design forces Detail line = Show**
so the rows read as prose rather than as a table.

---

## 9 · Big Type

1. **Descriptor.** The gate's heading at display size across a 1,040 measure with one 18 px line under
   it and the button beneath — no list, no containment, no ground of its own. The category's one display
   moment.
2. **Structural descriptor.** `stack · none · page · none · none · the promise at display size` — every
   closed slot matches 1's except the archetype, and **what actually distinguishes them is scale, which
   no machine reads** ⚑. The emphasis phrase carries it.
3. **Archetype.** stack. One departure: **the padding ladder is shifted one step up** ⚑ — 96 · 116 · 132
   rather than 64 · 96 · 132.
4. **Responsive rule.** **1440** heading 84 on a 1,040 measure, sentence 18 on 560, fade 240, padding
   132. **834** heading 52 on 700, padding 96. **≤ 767** heading 34 on 350, **button full width**, fade
   120, padding 72. **The heading steps 84 → 52 → 34** ⚑; the sentence and button hold their sizes.
5. **Content fields.** As 1, and `heading`'s limit is the difference: **60 characters, enforced in the
   editor** ⚑ — the only enforced limit in A32, because at 84 px an over-long heading does not wrap
   badly, it wraps into the button. `benefits[]` and `benefitsLabel` are stored and not drawn ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Display size | Large 64 · Larger 84 · Largest 104 |
   | Alignment | Left · Centred |
   | Sentence | Show · Hide |
   | Action | Button · Text link |
   | Fade | None · Short 96 · Standard 160 · Deep 240 |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | **96 · 116 · 132, default Spacious** — this design's shifted ladder rides on the universal row |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **This design's shifted ladder rides on
   Vertical spacing** — 96 · 116 · 132, default Spacious ⚑.
7. **Data.** As 1. Tiers read, not drawn; **the paid gate's price clause is in the sentence and
   disappears with it** ⚑ — at Sentence = Hide the design never states a price, which the panel says
   plainly.
8. **Empty state.** No sentence → heading and button, and **the gap between them stays 30** rather than
   closing to 20 ⚑. No eyebrow → the heading is the first thing in the section. **No heading is not
   reachable.**
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. Edit-safe.
10. **Accessibility.** As 1. **The display heading is still an `h2`** ⚑ — its size is a style, not a
    level. At Action = Text link the link is 16 px and its 44 px target is padding, not line-height ⚑.

**Flagged ⚑** The 1,040 measure at 84 px is A32's own. The shifted padding ladder is invented for this
design. **Two defaults differ from the category's — padding Spacious and fade Deep — and the panel says
so.** **Dark-mode optical weight is left unadjusted**: the library carries no optical-size adjustment
and inventing one here would be one design's private rule. Flagged, and left.

---

## 10 · Cover

1. **Descriptor.** A full-bleed cover 520 tall carrying a warm flat scrim, with the gate centred on it
   and every colour derived from the carried light. The only A32 design with an image, and the only one
   where it is required.
2. **Structural descriptor.** `stack · none · image · none · background · the gate over a photograph` —
   ground `image` and media `background`: the photograph is the ground, which separates this from every
   other design in the category ⚑. Containment `none`: a full-bleed cover is a ground.
3. **Archetype.** stack. One departure: **the cover does not collapse at any width** ⚑ and Cover edges
   is forced to Full bleed at ≤ 767.
4. **Responsive rule.** **1440** full bleed, cover 520, copy 560 centred, scrim 45 %, page padding above
   96. **834** cover 460, copy 520, padding 80. **≤ 767** **full bleed forced**, cover 420, copy 310,
   button full width, fade 120, padding 64 ⚑. **The 420 floor is a floor, not a step** ⚑.
5. **Content fields.** As 1, plus `image` (**required** ⚑, ≥ 2,400 px), `imageAlt` (opt 120 ch) and
   `imageFocus` (enum, nine positions — **a field, not a control** ⚑). `benefits[]` is drawn only at
   Included list = Show ⚑.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Cover height | Compact 420 · Comfortable 520 · Spacious 640 — **the cover's own measurement** |
   | Scrim | 30 % · 45 % · 60 % |
   | Cover edges | Full bleed · Inset to the content box |
   | Alignment | Centred · Left to the measure |
   | Included list | Show · Hide, default Hide |
   | Included list items | the P0·3 item controls |
   | Fade | None · Short 96 · Standard 160 |
   | Image focus | Centre · Top · Bottom |
   | Eyebrow | Show · Hide |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | **Locked to Image**, with the reason shown |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **Background role is locked to Image, with
   the reason shown** ⚑.
7. **Data.** As 1. **No image → the cover draws its scrim colour as a flat ground at the same height** ⚑ and the gate sits on it exactly as drawn, stated in the editor; **the panel advises 4 Contrast Band and never switches to it**. **An image
   narrower than 1,600 px → the editor warns and the cover still renders** ⚑; a warning a publication
   can act on beats a section that refuses to draw. Tiers read, not drawn.
8. **Empty state.** No image → the cover's own scrim colour as a flat ground, at the same height ⚑. No blurb → heading then button, centred, and **the cover
   keeps its height** ⚑. No benefits at Show → the control resolves to Hide and nothing is reserved ⚑.
9. **Behaviour module.** None; `core` assumed. **No-JS: the section is drawn identically and its action is dead** ⚑ — Portal is JavaScript, and the button does not render at all where the connected site cannot take it ⚑. **The image is a real
   `<img>` with `loading="lazy"`** ⚑ — not a CSS background — so it is in the document and has an alt
   attribute. Edit-safe.
10. **Accessibility.** As 1. **The scrim is a sibling `<div aria-hidden>`, not an overlay on the `<img>`**
    ⚑. **Focus is the carried light at 2 px, not the accent** — 2.9:1 measured and refused ⚑. Text on the
    cover measures 8.1:1 at 45 % over a mid-tone image; **30 % is disabled where it would fall below
    4.5:1** ⚑.

**Flagged ⚑** The 420 px height floor is invented. The 8.1:1 measurement assumes a mid-tone photograph
— **a real light image needs the higher scrim and the editor cannot know that**, which is why 30 % is a
value and not the default. The 52 % dark scrim is invented. **The image is not filtered, dimmed or
tinted in either mode** (A19's rule): the scrim is a layer over it, not a treatment of it. **After an
image the panel recommends 1 and does not force it** — two photographs 96 px apart.

---

## 11 · Sticky Bar

1. **Descriptor.** A 76 px surface bar pinned to the foot of the viewport carrying one line and one
   button, with an in-flow twin of the same line and button at the cut. The quietest gate in the
   category.
2. **Structural descriptor.** `sticky · none · surface · none · none · a bar pinned to the foot` —
   archetype `sticky`, the only one in A32 ⚑. Ground `surface` matches 3's and the archetype is what
   separates them.
3. **Archetype.** sticky. Pinned at every width, stacking its contents at 767. One departure: **the
   secondary link is dropped at 390** ⚑, its destination being the twin.
4. **Responsive rule.** **1440** bar 76 full bleed, line 16 and sub 13.5, button 46; twin at the measure
   with a 28 px heading, twin padding 72. **834** bar 76 unchanged, twin heading 26, padding 64. **≤ 767**
   **bar 132, stacked, button full width, secondary link gone** ⚑, twin heading 23, fade 120, padding 52.
   **At Held to the content box the bar becomes full bleed at ≤ 767** ⚑.
5. **Content fields.** As 1, plus `barLine` (opt 60 ch — defaults to the gate's heading ⚑) and `barSub`
   (opt 60 ch). `blurb` is **drawn only in the twin** ⚑ and never in the bar.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Bar height | Compact 64 · Comfortable 76 · Spacious 88 — **strip height, not section spacing** |
   | Bar ground | Surface · Contrast |
   | Bar width | Full bleed · Held to the content box |
   | At the cut | The twin, in flow · Nothing |
   | Dismissible | No · Yes |
   | Sign-in link | Show · Hide — the row formerly called "Secondary link", renamed rather than duplicated |
   | Eyebrow | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group.
7. **Data.** As 1. **A long tier name in the bar clips and keeps the whole string in the DOM** ⚑ —
   A18·3's rule. Tiers read, not drawn.
8. **Empty state.** No `barLine` → the gate's heading fills it, clipped to one line ⚑. At the cut =
   Nothing → the article stops and the bar is the only offer; **the panel names this the weakest
   configuration in A32** ⚑ rather than hiding it. No secondary link → the button sits alone at the bar's
   right.
9. **Behaviour module.** **At Dismissible = No, none; `core` assumed — `position: sticky` is CSS and
   declares nothing** ⚑. **At Dismissible = Yes it declares `dismiss`. No-JS, quoted:** "The bar renders
   and stays; the close button is hidden rather than rendered inert." **Dismissal is session-scoped** ⚑.
   Edit-safe: **while editing the bar is drawn in flow at the foot of the section**, not pinned to the
   editor viewport ⚑.
10. **Accessibility.** As 1. **The bar and the twin carry the same two links, so the same destination
    would appear twice in the tab order** ⚑ — the bar is `aria-hidden` when the twin is drawn and the twin
    is the accessible copy ⚑. The close button has a real label and is 38 px in a 44 px target ⚑.

**Flagged ⚑** The 64 · 76 · 88 ladder departs from A2's 48 · 56 · 68, because A2's bar carries one line
and this one carries a line and a button. **The upward shadow (`0 -4px 16px`) is A32's own and is the
only inverted shadow in the library**, and it is dropped in dark. Session-scoped dismissal is a product
assumption. **ARCHITECT — accessibility review: hiding the bar from assistive technology when the twin
is present is a judgement, not a standard.** The flag is carried on the frame, in the panel and here; the bar and
the twin carry the same two destinations, and `aria-hidden` on the bar is the only way drawn that keeps them out
of the tab order twice. **It ships only once an accessibility review agrees.** **The bar never carries an email field** — a 46 px field in a 76 px bar leaves 15
px of padding.

---

## 12 · Meter

1. **Descriptor.** A 4 px meter across the measure showing how much of the post the preview was, its
   label in words, and the gate beneath it. The only A32 design that states a quantity, and the only one
   with no eyebrow.
2. **Structural descriptor.** `bar · none · page · none · none · a read meter above the gate` —
   archetype `bar`, because the meter is the arrangement and the gate hangs off it; containment `none`,
   ground `page`, and the archetype is what separates this from 1 and 9 ⚑.
3. **Archetype.** bar. Full width of its container at every width, contents wrapping rather than
   rearranging. No departures.
4. **Responsive rule.** **1440** meter 720 at 4 px, label 13.5, heading 30, fade 96, padding 64. **834**
   meter 754, heading 28, padding 56. **≤ 767** meter 350, **label two lines, not abbreviated** ⚑,
   heading 24, button full width, fade 120, padding 48.
5. **Content fields.** As 1, minus `eyebrow` (**stored and not drawn** ⚑) and plus `meterLabel` (opt 90
   ch, with `{read}` and `{total}` as its only tokens ⚑). `benefits[]` stored, not drawn.
6. **Controls.**

   | Control | Values |
   |---|---|
   | Meter style | Rule · Segments |
   | Meter label | **Reading time, in words · Hide** |
   | Meter width | The measure 720 · Content box 1,296 |
   | Action | Button · Text link |
   | Fade | None · Short 96 · Standard 160 · Deep 240 (**default Short 96**) |
   | Sign-in link | Show · Hide |
   | Button icon | None · Before label · After label |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (**this design keeps its Compact default**) |
   | Top divider (universal) | None · Line · Fade |

   Then, **outside this design's count**: the universals (Background role · Vertical spacing · Top
   divider), the Data group and the Access source group. **Vertical spacing keeps this design's
   Compact default** ⚑, and **there is no Eyebrow control because there is no eyebrow** — the one
   design in A32 without one.
7. **Data.** `post.reading_time` and nothing else ⚑ — **the label is a static line built from it**, which is
   why the words are in the HTML before any script runs, and **the proportional fill is `reading-progress`'s**,
   drawn from the reader's scroll through the preview and **hidden on a very short post** ⚑. **As drawn the
   label asked a template to count the preview's words, and no template can count** — that claim is deleted. **No `reading_time` → the meter and its line are hidden and the design renders as itself without them** ⚑
   — never another design. **A preview longer than the reading time** (a short post cut late)
   → **the module clamps the fill at 90 % and never at 100** ⚑: a full meter at a paywall says the reader has
   finished. **Above 20 minutes the module draws Rule rather than Segments** ⚑ — forty-one segments is a hairline, and it is the module's decision, not a template's.
8. **Empty state.** No label → the meter alone, and **the design still works** ⚑. No reading time → no
   meter. **No heading is not reachable.**
9. **Behaviour module.** `reading-progress`. **No-JS, quoted:** "The bar is hidden entirely (it is
   decorative)." **The static line stays** ⚑ — it is built from `post.reading_time` and needs no script — and
   **the fill goes with the module**, as it does on a very short post. **The button opens Portal, so with
   JavaScript off nothing happens** ⚑. Edit-safe.
10. **Accessibility.** As 1. **The meter is a `<div role="img">` with the label as its accessible name**
    ⚑ — not a `<progress>`, which announces a percentage, and not `aria-hidden`, because the reading is
    content. **It is not focusable** ⚑. At Meter label = Hide the accessible name is still present and is
    the only place it appears ⚑.

**Flagged ⚑** **ARCHITECT — verify before build: whether `post.reading_time` is computed on the whole post or on
the truncated preview.** Carried on the frame and in the panel as well as here. The whole design depends on it:
**if the value is the preview's, the label states the wrong number and the design is unbuildable as drawn.** The 90 % clamp is invented and is the module's. The 20-minute fall-back is invented and is the module's. **The preview's word count is gone from the design entirely** — a template cannot count words, so the label is the reading time and the fill is the script's. **The
label is words and never a percentage numeral**: a percentage invites the reader to argue with
arithmetic a theme should not be doing on a number it did not compute. **Three defaults differ from the
category's — padding Compact, fade Short, no eyebrow — and the panel says so.** This is A32's one
finding-shaped design.


---

## Reconciliation notes

**Frames changed in this pass:** all twelve control-panel frames — `A32-1 Fade`, `A32-2 Card`, `A32-3 Panel`,
`A32-4 Contrast Band`, `A32-5 Boxed`, `A32-6 Split Pitch`, `A32-7 Tiers`, `A32-8 Ledger`, `A32-9 Big Type`,
`A32-10 Cover`, `A32-11 Sticky Bar` and `A32-12 Meter`. **5 Boxed is the only design whose visible content
changed** (the Box rule control loses a value, and its panel and spec prose follow). The section frames of the
other eleven are untouched: every other item in this pass adds editor surface, not drawn ornament. **No layout was
redesigned.**

**What each panel gained**, in order: the P0·6 gate switcher · the content group (Eyebrow, Sign-in link where
due, the P0·3 item list where the design draws `benefits[]`, the P0·2 button icon slot, 10's Image focus) · the
three universals outside the count · the Data group (paid-memberships flag, `{{price}}`, the read-only Portal
destinations). **11 Sticky Bar's a11y flag and 12 Meter's `reading_time` flag are now drawn on their panels** as
architect flags rather than living only in this file.

One line each, where this pass and the existing spec disagreed:

- **Padding versus Vertical spacing.** The spec gave nine designs a "Padding" control with the universal values.
  **The universal wins; the nine per-design rows are gone.** 4's band padding, 10's cover height, 11's bar height
  and 8's row density are genuinely different measurements and keep their own names.
- **9 Big Type's shifted ladder.** The spec made 96 · 116 · 132 a private control. **It is now the universal
  Vertical spacing carrying this design's ladder and its Spacious default** — a design may move a default, not
  fork a control.
- **12 Meter's Compact default** survives the fold, for the same reason.
- **Member Visibility.** The PRD asks every CTA-bearing design to carry it. **A32 does not**, because
  `post.visibility` + `@member` is the richer member-state model the rule exempts, and a second visibility
  control here could hide the paywall from precisely the readers who see it.
- **The eyebrow.** The spec said clearing the field hides it. **It cannot** — every gate has a default, so the
  field is never empty. **A Show · Hide control is the only way out**, and 12 Meter stays without one by design.
- **The sign-in line.** The spec gave it a control in 1 and 4 only. **Added to 2, 3, 5, 6, 8, 9, 10 and 12.**
  **11 already had the row under the name "Secondary link" — renamed, not duplicated.** 7 Tiers has none: its
  cards are the action.
- **Prices.** The spec printed "From $6 a month" as a literal. **Every price now renders through `{{price}}`** —
  the raw field is in the smallest currency unit and would ship "From 600 a month".
- **The paid-tier branch.** The spec's "0 paid tiers → hand off" **is withdrawn in the design patch pass** — the cards, the toggle
  and the tier note are hidden and the design renders as itself — and **the guard on the paid and upgrade copy
  is `@site.paid_members_enabled`**, which is the fact the branch was standing in for.
- **7 Tiers' benefits hedge.** The spec restated A30's open finding. **Withdrawn** — tiers expose benefits to
  themes, and the card builds as drawn. **Card buttons are Portal tier deep links** and `price-toggle` swaps
  hrefs as well as prices; the free card goes to plain signup.
- **8 Ledger's upgrade marking.** The spec flagged it as invented. **It is cut, not flagged** — the upgrade gate
  shows the rows unmarked.
- **5 Boxed's third box rule.** The spec argued for keeping Left edge only in the text colour. **Dropped** — the
  ornament class the owner killed in A1's Side Rail; the two remaining values still tell the design apart.
- **CTA destinations.** The spec put them in mono on the frames only. **They are now read-only rows in every
  panel**, so nobody looks for a URL field that does not exist.
- **"Preview" controls.** None existed in A32; nothing was removed. Recorded so the audit item is answered.
- **Registry additions.** **None needed.** Every behaviour in this pass is `core`, `member-form`,
  `price-toggle`, `dismiss` or `reading-progress` — already in the registry. `price-toggle` swapping hrefs
  alongside prices is within what the module does; **if the build finds otherwise, that is a registry question and
  the no-JS state (both periods rendered, each labelled with its own link) is already specified.**
- **Control counts.** Design-own counts run 7–9, inside the PRD's ~15. **Quick Controls are three per design**,
  listed in §0.
- **Two flags stay open and are now on the frames.** 11 Sticky Bar's `aria-hidden` twin needs an accessibility
  review; 12 Meter needs `post.reading_time` verified against the whole post rather than the preview, **and is
  unbuildable as drawn if the value is the preview's.**


---

## Patch notes — paywall patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written here as an
**open question** and asked in plain words at the end.

**Frames changed — all thirteen:** `A32-0 Category Proof` and `A32-1` … `A32-12`. Every design frame carries
a dated **patch pass** panel at the top saying what changed in that design, and `A32-0` carries the category's
version of the same panel above the settlements. **1 Fade and 6 Split Pitch each gained one drawn frame** — the
form beside the no-JavaScript notice that replaces it. **No layout was redesigned, no measure moved and no
colour changed.**

**The shared "what does not change" block was patched in all twelve frames**, where it still promised a
section identical with JavaScript off and named 12 Meter's *label* as the scripted part. It now says the
section is drawn identically **and every action in it is dead**, names 1 Fade's and 6 Split Pitch's notice
and 11 Sticky Bar's hidden close button, and states that **12 Meter's static line survives and its fill
does not**. **The generator these frames were built from (`_build/a32page.js`) was patched with them** — its
`member-form` degradation string, its `reading-progress` string, its no-JavaScript boilerplate and its
shared no-JS line — so a rebuild cannot revert this pass.

### This category's own rulings

| What changed | Why, and where |
|---|---|
| **The fade at the cut is a fixed height, and "suppressed under two lines of visible text" is deleted.** A stylesheet cannot count the lines in a paragraph, so the rule could never have fired — and had it fired it would have been wrong: a one-line last paragraph would have faded to nothing. **The fade is now stated as what it is** — 96, 160 or 240 px of the page ground **anchored to the end of the preview**, whatever is above it. **Suppression after a heading, a figure, a code block or an embed survives untouched**, because that is an element type and CSS can see it. The deletion lands in five places: the shared floor, the cut settlement, `A32-0`'s one-sentence stress case (its mono caption, its answer and the hard-case note) and every Fade control note in the twelve panels, each of which now reads *a fixed height, anchored to the end of the preview — never a count of lines*. **At a one-sentence preview the panel advises Short 96 or None** ⚑ — advice a publication acts on, never a rule that fires by itself. | *(CSS cannot see content.)* |
| **12 Meter is two things now: a static line and a scripted fill.** As drawn, the label asked a template to count the words in the preview and compare them with the reading time. **No template can count.** So **the words are one static line built from `post.reading_time` alone** — "This piece is a 12 minute read" — in the HTML before any script runs, and **the proportional fill is `reading-progress`'s**, drawn from the reader's scroll through the preview, **hidden on a very short post** and hidden entirely with JavaScript off, where the line remains. Consequences, all applied: **`{read}` is deleted from `meterLabel` and `{total}` is the only token**; **Meter label loses "Share of the piece, in words"** and reads *Reading time, in words · Hide*; **the 90 % clamp and the 20-minute fall-back to Rule are the module's decisions, not a template's**; **the field list names `post.reading_time` as the label's only source**; and the design's own no-JavaScript line is rewritten. **The architect flag stays and is now the whole risk:** if `reading_time` is computed on the truncated preview rather than the whole post, the line states the wrong number and the design is unbuildable as drawn. | *(Ghost's templates cannot count, add or remember.)* |

### The library-wide rules

| Rule | What it did here |
|---|---|
| **The two free designs are the owner's choice — ask him** | Shortlisted the five plainest designs, none of which needs photography: **1 Fade** (the category default — the article stops and the words continue in its own measure, and nothing in it can be empty), **5 Boxed** (one hairline box, no fill and no shadow, the smallest thing here that still looks finished), **2 Card** (the same stack in a raised card), **3 Panel** (one plane the width of the content box) and **8 Ledger** (what a membership includes, as ruled rows — the only free-able design that carries an argument). Recommended **1 Fade · 5 Boxed**, and **the owner chose exactly that on 29 August 2026**. The line is at the head of this document in the required shape. **Closed.** |
| **No design ever turns into another design** | **Four hand-offs deleted and one inherited rule withdrawn.** **7 Tiers** no longer draws 1 Fade's stack on the free-signup gate or at 0 paid tiers: it **hides the cards, the period toggle and the tier note and renders its own head, sentence and action** with the free copy. **8 Ledger** at 0 rows **hides the rows and their hairlines** and draws its heading, sentence and action. **10 Cover** with no photograph **draws its scrim colour as a flat ground at the same height** ⚑ and the gate sits on it exactly as drawn. **12 Meter** with no reading time **hides the meter and its line** and renders as itself. In every case **the panel may advise the neighbouring design and never switches to it**, and 3 Panel's "that is the hand-off rule, used deliberately" is replaced by advice. On `A32-0` the inherited **Hand-off rule** row now reads *withdrawn in this pass*. **The two "recommends another design after an image" notes (7 and 10) were already advice and stay advice.** |
| **Item counts are a number picker** | **Two subjects, both converted.** **8 Ledger's Rows shown** drew *Four · Six · All authored*; it is now **a number picker, 1–6, default 6**, capped at six **because the authored list itself stops at six**, with the **+ drawn greyed and the reason visible at the cap**. **7 Tiers' Benefits per card** drew *None · Three · All*; it is now **a number picker, 0–6, default 3**, capped at six with the reason drawn — past six a card stands taller than the tier beside it, and a tier with fewer benefits shows what it has. **Tiers shown stays a named list, on the owner's ruling of 29 August 2026**: it names *which* tiers Ghost should hand over rather than how many rows to draw, and rewriting it as a number would need a second row for the free tier. **Recorded as the one place in A32 where the number-picker rule is deliberately not applied**, with the reason. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all twelve. The swatch row is **Base**; **there is no "Inherit" value anywhere in A32**; **Background role is locked in two** — 4 Contrast Band to Contrast, 10 Cover to Image — each with its reason drawn; **12 Meter carries no Eyebrow row** because it draws no eyebrow, and says so. **No design renamed a shared control or added a value to one**, and this pass added none. **One control lost a value in this pass and says why**: 12 Meter's Meter label, because a share of the piece needs a word count nobody can produce. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A32 has no gap control. The five ladders that survive are each a padding or a height inside an object of the design's own — 4's band padding, 8's row density, 10's cover height, 11's bar height, 9's shifted vertical spacing — and each keeps its own name in the standard padding words. |
| **Slider labels** | **No subject.** A32 draws no slider. Every control is a named-value row, a read-only row or — now — a number picker, and each title says what it affects. |
| **Avatars with no photograph** | **No subject.** A32 renders no person: no author, no member avatar and no initials block in twelve designs. A member's **name** is greeted on the upgrade gate where Ghost has one, and most members have none, which the spec already says. |
| **The Remove button never greys out** | **One subject: `benefits[]`, the category's only authored repeater** (1, 2, 3, 4, 5, 6, 8, 10). Already compliant and now stated in full: **Remove is never disabled, never dimmed and never hidden**, and **there is no minimum to hit** — the list may go to nought, at which point the design hides the list and its hairline and renders as itself. **The maximum is six** and *Add* is what stops there, with the reason shown. **7 Tiers correctly has neither Add nor Remove**: its cards are Ghost's objects, not the user's rows. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **The rule with the widest reach here — every design bears an action.** Two facts are now read-only rows in all twelve panels and mono lines on every drawn gate: the button **does not render at all where the connected site cannot take it** (self-signup switched off, or no payment provider connected), and where it does render it opens Ghost's own sign-up window, so **with JavaScript off, nothing happens**. **Ten claims of a pixel-identical unscripted section were qualified rather than deleted** — the section *is* drawn identically; it is the action that is dead — and **7 Tiers' card buttons and 11 Sticky Bar's two actions carry the same line**. **A gate with no button at all draws its words and the sign-in line** — *"Already a member? Sign in"* — **ruled by the owner on 29 August 2026** ⚑, and stated in every panel beside the conditional-render row. |
| **The no-JavaScript notice** | **Two subjects: 1 Fade and 6 Split Pitch**, the only designs with a form. **The "posts natively to Ghost's members endpoint" quote is withdrawn from both** — Ghost's signup endpoint refuses a plain form submission, so a scriptless field would take an address and lose it. **Each replaces the form with the shared no-JavaScript notice at the form row's own height** — *"Signing up needs JavaScript — turn it on to subscribe."*, plain text and not an alert, no field and no button, the legal line kept beneath — **and both frames now draw it beside the form it replaces**. **The sent, error and loading states are unchanged**: they are Ghost's own script, and they work. **The sign-in line is a link and not a form** in every design; it renders either way and opens nothing with JavaScript off. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12.** Twelve designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted. |

### The no-JavaScript line, per design

| # | Design | Behaviour declared | Without JavaScript |
|---|---|---|---|
| 1 | Fade | `core` · `member-form` at Button and email field | The section is drawn identically — server-rendered gate, a gradient for the fade. **The button opens nothing.** At Button and email field **the notice replaces the form**. |
| 2 | Card | `core` | Card, shadow, overlap and fade identical. **The button opens nothing.** |
| 3 | Panel | `core` | The plane and its included row identical. **The button opens nothing.** |
| 4 | Contrast Band | `core` | The band, its derived colours and its bleed identical — **the design's whole argument survives**. **The button opens nothing.** |
| 5 | Boxed | `core` | Box, rules and inset identical. **The button opens nothing.** |
| 6 | Split Pitch | `core` · `member-form` at Button and email field | Both columns, the numbered rows and the stack order identical. At Button and email field **the notice replaces the form**; the button opens nothing. |
| 7 | Tiers | `price-toggle` | **Both monthly and yearly prices render side by side, each labelled**, each with its own Portal link — no toggle control shown. Cards, prices, descriptions and the marked tier are server-rendered. **The card buttons open nothing.** |
| 8 | Ledger | `core` | Rows, ordinals, hairlines and row density identical. **The action opens nothing.** |
| 9 | Big Type | `core` | The display heading and its measure identical. **The action opens nothing.** |
| 10 | Cover | `core` | Photograph, scrim, height and copy identical — the image is a real `<img>`. **The button opens nothing.** |
| 11 | Sticky Bar | `core` · `dismiss` at Dismissible = Yes | **The bar renders and stays pinned** — `position: sticky` is CSS — and **the close button is hidden rather than rendered inert**. The twin is drawn as usual. **Both actions open nothing.** |
| 12 | Meter | `reading-progress` | **The static reading-time line renders** — it needs no script — and **the meter's track and fill are hidden entirely**, as they are on a very short post. **The button opens nothing.** |

### Open questions

**QUESTION 1 — Which two designs a free site gets — ANSWERED: 1 Fade · 5 Boxed**

Every category gives two of its designs away and which two is your call. Of these twelve, the plainest that
would not look unfinished on a real site, and that need no photography, are **1 Fade** (the article stops and
the offer continues in the same column — nothing in it can be empty), **5 Boxed** (one thin outlined box, no
fill and no shadow), **2 Card** (the same words in a raised card), **3 Panel** (the words on one wide raised
plane) and **8 Ledger** (what a membership includes, as ruled rows).

1. **1 Fade · 5 Boxed — the default and the outline. (RECOMMENDED)**
   A free site gets the arrangement most publications expect, plus one with a visible container, so the two do
   not read as the same design twice. It costs nothing: neither needs a photograph, a tier, a reading time or a
   list, and both are drawn identically with JavaScript switched off. What it gives up: no free design carries a
   list of what a membership includes, so the reason to pay has to live in the sentence.
   A visitor sees the piece stop and fade, then a short offer with one button in the same column as the text.
2. **1 Fade · 8 Ledger — the quietest and the most persuasive.**
   The free set can then make a case: up to six ruled lines saying what a membership includes. Costs: the
   customer has to write those lines, and with none written the design is a heading and a button — coherent,
   but it depends on the customer doing work.
   A visitor sees the offer, then a ruled list: *Every issue in full · The full archive · Reader questions*.
3. **1 Fade · 2 Card — the default and the card.**
   The most familiar pair, and what most themes ship. Costs: 2 Card is 1 Fade in a container, so a free customer
   effectively sees one idea twice, and the paid set looks more different than it is.
   A visitor sees the same words, in a white card standing over the faded text.

**QUESTION 2 — How the editor picks which membership tiers appear — ANSWERED: left as a named list**

The tier design has a row called **Tiers shown**, offering *the lowest paid · the two lowest paid · all paid
tiers · all, including free*. The library rule that a count should be typed as a number rather than picked from
fixed buttons may apply to it, and may not: the row names **which** tiers Ghost should hand over, not how many
rows to draw. Rewriting it as a number would need a second row for whether the free tier is included.

1. **Leave it as it is — a short named list. (RECOMMENDED)**
   It is a choice of source rather than a count, and it reads plainly: *the two lowest paid*. Costs: it looks
   like a count to anybody skim-reading the panel, and one line in the audit will say the rule was not applied
   here. The editor sees one row and picks a phrase.
2. **Two rows: a number for how many tiers, and a yes-or-no for the free tier.**
   Literal about the rule. Costs: the design gains a control (seven becomes eight), and the number is capped by
   something the editor cannot see — a site with two paid tiers cannot show three, so the picker has to grey
   itself and give the reason. The editor sees *Tiers shown: 2* and *Include the free tier: No*.
3. **A number alone, and the free tier never shows.**
   The simplest panel. Costs: a publication that wants its free tier beside its paid ones loses that, and it is
   the one arrangement that tells a reader what "free" actually gets them.

**QUESTION 3 — What the gate shows on a site that can offer nothing to click — ANSWERED: the words and the sign-in line**

A membership button only works if the connected site can take it: self-signup has to be switched on, and a paid
button needs a payment provider connected. On a site where neither is true — somebody trying a theme out, or a
publication that adds members by hand — the paywall still renders, because the post is still gated. This pass
draws it as the words with no button. What should a visitor see?

1. **The words and the sign-in line, with no button. (RECOMMENDED)**
   The reader is told the piece is for members, and can sign in if they already are one. Costs: a reader with no
   account is told what they cannot have and given nothing to do about it. The visitor sees the eyebrow, the
   heading, the sentence, and *Already a member? Sign in*.
2. **The whole paywall section does not render at all.**
   The article simply stops. Costs: the reader gets no explanation for why the piece ends mid-sentence, which
   reads as a broken page rather than a members-only one.
3. **The button stays and does nothing.**
   The design is never seen in an unfamiliar state. Costs: the worst outcome for a visitor — a call to action
   that swallows a click — and it is the thing this pass exists to remove.

**Answered on 29 August 2026 — all three as recommended.** **Question 1: 1 Fade · 5 Boxed**, recorded in the
line at the head of this document and badged on the roster. **Question 2: Tiers shown stays one short named
list** — it picks which tiers, not how many — and that is the single place in A32 where the number-picker rule
is deliberately not applied, with the reason recorded. **Question 3: the words and the sign-in line, with no
button**, on a site where sign-up is switched off and no payment provider is connected. **All three are closed
and no question in this category is open.**

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12** — twelve designs, no gap
  created or closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required
  shape, and names **1 Fade** and **5 Boxed** — both of which exist in this category's roster. It is the owner's
  own choice, confirmed on 29 August 2026.
- **No registry module was invented.** A32 declares `core`, `member-form`, `price-toggle`, `dismiss` and
  `reading-progress` — all existing entries — and the meter's scripted fill is what `reading-progress` already
  does. **Nothing was named that the registry does not have.**

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** twelve designs, numbered **1–12**.
