# A22 Newsletter / Subscribe — written specification

16 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation patch, 25 August 2026**

The frames are `A22-0 Category Proof.dc.html` and `A22-1` … `A22-16`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation patch (this document's current state).** The category was audited, design
by design, against the PRD's control vocabulary and Ghost's verified data surface, thinking like an
end user editing their own site. This round reuses the shared editor primitives designed in
**P0 · Editor primitives** and never redesigns them: **P0·1** the inline text toolbar and its
Ghost-aware link popover, **P0·2** the icon slot and Icon Picker, **P0·3** the item-list controls,
**P0·4** the member-aware action editor, **P0·5** the "Populate from…" data panel, **P0·6** the
editor state switcher. What each design gained is in a **Reconciled** paragraph at the foot of its
entry, and the frame-by-frame list is in **Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(2 Card in three packs, light and dark), the stress frame, the roster, the component inventory, the
four settlements in full, and — new in this pass — the category-wide reconciliation list. The shared
field list is repeated below because the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A29 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A22 is

**A section that asks a reader for an email address and hands it to Ghost.** It sits on a page
route — a home page, an about page, the foot of an article, a dedicated subscribe page — and it is
the only category in the library whose primary element is an input. That is what makes it different
from every category before it: **A22 is not showing content, it is taking it.**

Two neighbours own adjacent ground and A22 does not repeat them. **A3·4 Newsletter Band** is one
form row inside a footer, with no heading and no body copy — A22 owns the persuasion. **A6·6 Inline
Form** is a CTA banner whose actions have been replaced by a field — A22 owns the case where the
newsletter *is* the section rather than one ask among several. Both are named on the frames.

A22 inherits **A3·4's form row and its four states verbatim** — the visually-hidden label, the 46 px
field, the 46 px button 10 px away, the 13 px note beneath, the suppressed focus ring, the
no-red invalid, the reserved button width and the session-lived done state; **A17's content box and
padding ladder** (1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132); **A1's eyebrow and primary
button**; **A17·7's on-contrast derivation**; **A19·3's surface card**; **A26·3 and A27·4's surface
plane and their call that a full-width fill is a ground rather than a containment**; **A20·13's warm
scrim**; **A18·2's thumb row**; **A29·12's meta line**; **A8·1's single quote**; **A6·11's
`reasons[]` and its repeater**; and, from this pass, **A22·15's generated newsletter meta**, reused
as a badge in 10 and 12. **A22 adds ten components** — they are listed at the foot.

### The four settlements (§8 of the brief)

**1 · The form's states.** There are **seven, not four** ⚑ — A3·4's *empty, focus, invalid,
submitting, done*, plus **the signed-in subscriber** and **members off in Ghost**, which are states
of the same slot and are drawn on every design's states frame. **One geometry holds all of them** ⚑:
the form block is the same height in every state, so nothing below it moves when a reader submits.
**Two stated exceptions**, each on its own frame: **9 Slim Bar's invalid grows the strip by 22 px**
because there is no note to put the message in, and **14 Slide-in Card's done shrinks the card**
because nothing sits beneath it. **The seven are edited, not previewed** — P0·6's State pill in the
canvas chrome switches the selected section into a state and the copy is edited inline there; no
design carries a per-state control and none ever did.

**2 · The Ghost members handoff.** Every design posts to `/members/api/send-magic-link/` and **the
section cannot repoint it** ⚑ — the row is read-only in all sixteen panels. **The markup speaks
Ghost's own contract** ⚑ *(new in this pass)*: the `<form>` carries
`data-members-form="subscribe"`, the email field `data-members-email`, and the name field
`data-members-name` when *Ask for a name* is on. Ghost's members script drives loading, success and
error; **`member-form`'s only job is mapping those three onto the designed seven**. The native POST
is the no-JS floor and is unchanged. Ghost sends its own confirmation and answers an
already-subscribed address in the same slot. **With members disabled the substitution happens at the
server**, before the page is sent: the field goes, the button becomes a link to the subscribe page,
the placeholder and note are kept, and **the state holds with or without JavaScript** ⚑.
**Thirteen designs keep their head and substitute. Three do not:** 10 Choice and 15 Two Up hide
entirely — a chooser with nothing to write to is nothing ⚑ — and 14 Slide-in Card never renders,
because interrupting a reader to show them a link they did not ask for is worse than silence.

**3 · Sites with more than one newsletter.** **Two designs let the reader choose and fourteen do
not** ⚑. **10 Choice** draws one checkbox row per newsletter above a single field, which is the
answer for three or more. **15 Two Up** draws a card and a field per newsletter, which is the answer
for exactly two. The other fourteen post to the newsletter named in the shared source group,
defaulting to the site's own default, **and the sidebar names which one** ⚑. **Ghost's newsletter
order is the order** in both designs — no picker, no reorder, no per-newsletter styling ⚑. **Zero
newsletters is not reachable**: Ghost ships every site with one and it cannot be deleted ⚑.
**A paid-visibility newsletter is not subscribable by address** ⚑ *(new in this pass)*: where the
target letter's `visibility` is not `public`, the ask routes to **Portal signup**
(`#/portal/signup`), gated on `@site.paid_members_enabled`, and the letter carries a **Members**
badge. Collecting an address that cannot receive the letter is subscribing a reader into silence,
and that was the defect.

**4 · The already-subscribed signed-in member.** **The form is never drawn to them** ⚑ at the shared
control's default. In its place, at identical height: "You are subscribed", one line naming which
letter and where it lands, and **a link to `#/portal/account/newsletters`** ⚑ — Ghost's own
preferences panel, not a section-built one. The alternative value exists and is not the default:
*The form anyway*, for a publication that wants a second address captured. **14 Slide-in Card ignores
the control** ⚑ and never renders for a subscriber at either value. **This is not Member
visibility**: the signed-in row answers "what does a subscriber see", and Member visibility — added
to the source group by this pass — answers "who sees the section at all". Both are in the panel,
one under the other, and the panel says which is which.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The form row.** A3·4's, verbatim: visually-hidden `<label>Email address</label>`, field 46 px,
  button 46 px, 10 px between them, note 13 px directly beneath. **The row is centred as a unit, not
  element by element** ⚑. **Button width is reserved for "Subscribing…"** so the row does not twitch.
- **The stacked form.** **At ≤ 767 field and button take a row each at 48 px, 8 px apart, and the
  field's text goes 15 → 16 px so iOS does not zoom the page on focus** ⚑. This is A22's own
  geometry and is the same in all sixteen.
- **Field width.** *Narrow 320 · Medium 400 · Wide 480*, **stepping one named value down at 1,080 and
  below** — A3·4's rule. Two designs depart: 9 Slim Bar has no Wide value and takes a bespoke 260 at
  834 ⚑; 8 Big Type defaults to Wide ⚑.
- **The seam.** A22 draws its own vertical spacing: **64 · 96 · 132** at 1440, **80** at 834, **64**
  at 390 — A17's ladder, and **since this pass it is the universal Vertical spacing row rather than
  a per-design Padding row**. **4, 7 and 9 resolve 0** (the band and the strip carry their own) and
  **14 has none at all** (it is not in the flow) ⚑. A22 assumes page sections above and below it and
  **cannot know what they are** ⚑ — the same route-awareness gap A21 and A26–A29 each raised.
- **The measures.** A17's content box, unchanged. The head's measure is **720**; the blurb is clamped
  at **560** on the page, **600** on the band, **560** over an image, **620** on a plane, and **90
  characters** in 14's card ⚑.
- **The type.** Eyebrow 13 uppercase tracked .08em · section heading 40 · 34 · 28 by width, 34 on a
  plane and 24 under a quote ⚑ · blurb 17, 16 at 390 · field text 15, 16 at 390 · note 13 · **social
  proof 13** ⚑ · **76 and 96 in 8 Big Type, the category's only display ladder** ⚑.
- **One display moment.** 8 Big Type spends it on the heading and **therefore draws no blurb at any
  value** ⚑. 16 Quote spends it on the quote and holds its heading at 24. 7 Cover spends it on the
  photograph and has **no heading-size control at all** ⚑. No other design has type above 40.
- **Accent, once or twice.** The button, in fourteen designs. **Twice in 10 Choice** (the ticked
  checkbox and the button) and **twice in 15 Two Up** (one button a card) ⚑, both stated on their
  panels as the category's ceiling. **None at all in 4 Contrast Band and 7 Cover** ⚑, where the
  button takes the carried colour on A29·3's finding that accent measures 4.0:1 on the band.
  **Icons take a colour role, never a colour** — P0·2's popover offers Text · Muted · Accent, and
  On-accent is disabled off a band.
- **Targets.** Field and button are **46 px, or 48 stacked**; every other interactive element is
  **44 px** ⚑. **The whole row is the target in 10 Choice** ⚑. **14's close button is 32 px inside a
  44 px target** ⚑. An icon slot is a 44 px target in the editor and decoration on the site.
- **Headings.** **The section heading is an `h2`** ⚑ — A22 is never the route's head. **Three
  exceptions, each stated on its frame:** 9 Slim Bar has **no heading at all** and its `<form>` takes
  `aria-label="Subscribe to {site title}"` (A3·4's rule) ⚑; 15 Two Up's newsletter names are `h3`
  under the section's `h2`; 12 Issue Preview's issue titles are `h3` and **the label above them is a
  paragraph, not a heading** ⚑.
- **Invalid.** **No red anywhere** ⚑ — the seven roles contain no error colour. The message replaces
  the note at 13 px / 500 in `text`; the field border goes to 1.5 px `text`. **Checked on blur and on
  submit, never per keystroke** ⚑. On `contrast` and on an image the substitution is the carried
  colour, not the accent ⚑.
- **Focus.** **The library's 4 px accent ring is suppressed on the field** ⚑ — it would collide with
  a button 10 px away — and the field takes a 1.5 px accent border instead. A2·5's documented
  departure, repeated so every form in the library behaves identically. **The button keeps the ring.**
- **Done.** Field, button and note are replaced in place at identical height by the confirmation and
  a way back. **Session-lived** ⚑ — a reload shows the empty form, because Ghost's confirmation email
  is the record and the section is not one. **14 Slide-in Card auto-dismisses eight seconds after
  done** ⚑, the one timed behaviour in A22.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, shadows
  dropped and the hairline carrying every plane. **Cards and planes force Flat in dark** ⚑ (A29·4).
  **The field is always a step away from the plane it sits on** ⚑ — lighter in light, darker in
  dark. **White over an image stays white** ⚑ and the scrim deepens one step. **The contrast band
  gets lighter in dark**, not darker ⚑.
- **Print.** **The head, the note, the social-proof line and the issue titles print; the field, the
  button, the checkbox rows and the slide-in card do not** ⚑ — a printed page cannot be typed into.
  4, 7 and 9 print as 1 Inline Row's head on white with the note beneath.
- **Behaviour.** **All sixteen declare `member-form`.** **One declares a second module** — 14
  Slide-in Card's `slide-in-card` ⚑. **This pass coined nothing**: the Portal route is a link, and
  the badge, the meta line and the member count are template strings.
- **The context footer strip reads "Built with Inflozo"** ⚑ *(corrected in this pass)* — FR-J15
  applies to every frame it appears in, including low-opacity page chrome drawn only for context.
- **Refused category-wide, each with a reason:** a third-party provider field ⚑ (the endpoint is
  Ghost's and read-only) · a double-opt-in toggle ⚑ (Ghost owns the confirmation flow) · a GDPR
  consent checkbox ⚑ (A2·13 Consent owns it and a second one on the same page is worse than none) ·
  a success-page redirect ⚑ (the done state is in place, by settlement 1) · a per-state control of
  any kind · autoplay, hover lifts and hover reveals ⚑ (behaviours do not run while editing, and the
  resting state is the design). **One refusal is withdrawn by this pass**: the subscriber-count line,
  refused on the belief that Ghost exposes no member count. It does. See *Social proof*, below, and
  the corrected finding 7.

### The universal trio — outside every design's control list

Three rows every placeable section in the library carries, drawn **outside** the design's own list
and **not counted** toward it.

| Row | Values | A22's resolution |
|---|---|---|
| Background role | Background · Surface · Contrast | Resolved from the pack. **Locked, with the reason in the row**, on 4 (Contrast — the band is the design), 7 (Image — the photograph is the ground), and 5, 6, 10 (Surface — the plane *is* the ground; at Background 5 is 1 Inline Row) |
| Vertical spacing | Compact · Comfortable · Spacious | 64 · 96 · 132; 80 at 834, 64 at 390. **This is the retired per-design Padding row under its real name** — eleven designs had one and now have none |
| Top divider | None · Line · Fade | Drawn on the page ground above the section |

**What retired into it.** **Eleven Padding rows** (1, 2, 3, 5, 6, 8, 10, 11, 12, 13, 15) and **9 Slim
Bar's Ground row**, whose *Surface · Page* values were Background role's vocabulary under another
name — **Contrast is new on 9** ⚑ and derives every colour on the strip from the two contrast tokens
(A17·7), at which point the panel names 4.

**What kept its own name, because the ladder is genuinely different.** **Card padding** (2: 48 · 64 ·
88; 15: 24 · 32 · 44) · **Box padding** (13: 40 · 56 · 76) · **Band padding** (4: 48 · 72 · 104
inside the band) · **Strip padding** (9: 16 · 24 · 36 inside the strip) · **Height** (7: a floor, not
a crop). None of these is the space around the section, and calling them Vertical spacing would have
merged two ladders into one word.

**Where a universal row is locked.** 4 and 7: **Vertical spacing resolves 0 at Band edges: Full
bleed** and the band butts against its neighbours; at *Page margin* it resolves the ladder.
**Top divider disables at Full bleed** on both — there is no ground above the band to draw it on ⚑.
9: **Vertical spacing and Top divider are both locked** ⚑ — Strip padding is the spacing ladder and
*Rules* is the divider, and it draws the bottom edge too, which the universal row cannot. 14: **all
three are locked** ⚑, for one reason stated three times — the card is pinned to the viewport, not to
the page, so there is no ground behind it, no seam around it and nothing above it to divide.

### The controls every design shares — the Newsletter source group

**Six rows** since this pass, identical in all sixteen, **below** each design's own controls and
**not counted** toward the ceiling ⚑, one of them read-only.

| Field | Type | Values |
|---|---|---|
| `newsletterTarget` (Which newsletter) | enum req | Site default · Let the reader choose · A named newsletter. **Let the reader choose is disabled unless the site has more than one** ⚑, and forces 10 Choice or 15 Two Up |
| `nameField` (Ask for a name) | enum req | Off (default ⚑) · Optional · Required — writes Ghost's `name` on the member and `data-members-name` on the field; adds one field of the same height above the email |
| `signedInBehaviour` (A signed-in subscriber sees) | enum req | The subscribed line (default ⚑) · The form anyway. **14 Slide-in Card ignores this row** ⚑ |
| `memberVisibility` (Member visibility) | enum req | **New in this pass** ⚑. Everyone (default) · Logged out · Free members · Paid members. Scope **SECTION**, compiled server-side, nothing flashing client-side (P0·4's rule). At *Logged out* the subscribed line is unreachable by construction and the panel says so |
| *The form posts to* | read-only | Ghost members — `/members/api/send-magic-link/`; **not repointable** ⚑ |
| `membersOff` (When members are disabled) | enum req | Hide the section · Head without the form. **Defaults differ per design** ⚑ — *Head without the form* in thirteen, *Hide the section* in 10, 15 and 14 |

**Member visibility and `signedInBehaviour` are not the same row.** The PRD makes visibility
normative for a CTA-bearing category, and A22 is the category whose whole point is a call to action:
a publication that wants its paid readers left alone by the subscribe band can now say so without
hiding the section from everyone. `signedInBehaviour` stays because it answers a different question
and answers it in place, at the form's height.

### Social proof — the withdrawn refusal

**Ghost exposes a member count.** `{{total_members}}` and `{{total_paid_members}}` render
**pre-rounded strings**, which is exactly the shape a "Join N readers" line needs. The category's
refusal was written on a false fact and this pass withdraws it.

- **`socialProof`** — enum, *Off (default) · Member count*, offered on **1–8, 13 and 16**. One muted
  **13 px** line directly under the note.
- **`proofLine`** — text, opt, ≤ 60 characters, default **"Join {members} readers"**. The
  **template** is edited inline with P0·1, **around** the token; **the number itself is Ghost's and
  says "Edit in Ghost"** ⚑. `{members}` compiles to `{{total_members}}`; a paid-only publication
  writes `{paid}` for `{{total_paid_members}}`.
- **String only, never arithmetic** ⚑ — no thresholds, no "over", no rounding of our own. Ghost's
  string is what prints.
- **Auto-hidden when members are off** ⚑, with the whole form; the line is not drawn in the
  members-off substitution.
- **Not offered on 9, 10, 11, 12, 14, 15** ⚑ — 9 is a 93 px strip with no line to spare, 14 a 168 px
  card, and 10, 11, 12 and 15 already argue with rows, reasons, issues and cards. The patch named
  1–8, 13 and 16 and the panels follow it exactly.

### Editing — stated once here and per design below

**Every visible authored text is inline-editable on canvas** with the **P0·1** toolbar — bold ·
italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
noreferrer · sponsored**. That is `eyebrow`, `heading`, `blurb`, `placeholder`, `buttonLabel`,
`note`, `label` (9), `issuesLabel` and `archiveLabel` (12), each `reasons[]` line (11), `quote`,
`quoteAttrib` and `quoteDetail` (16), and `proofLine`'s template.

- **The note is the consent line, and it now takes the link mark** ⚑. "…you agree to our Privacy
  Policy" was unlinkable, which made the one sentence in the category with a legal job the only one
  that could not do it. The Link Picker's new-tab and rel toggles apply.
- **The five state strings are edited in the state that shows them** — `doneHeading`, `doneText`,
  `invalidText`, `subscribedText`, `manageLabel` — through **P0·6's** State pill (Empty · Invalid ·
  Done · Subscribed · Members off). Inline, in place, at the state's own geometry. **Never a sidebar
  preview row** ⚑, and no such row ever existed here.
- **The subscribe button takes an optional icon before or after its label** from the **P0·2** Icon
  Picker, with its size and colour-role popover; button icons are Small and inherit the label
  colour. **11 Reasons' lines take an icon slot each** at *Reason marks: Icons*.
- **Every URL field opens the Ghost-aware Link Picker**: the members-off subscribe target, 12's
  archive link. **Two targets are read-only**: the magic-link endpoint and
  `#/portal/account/newsletters`.
- **Ghost-owned content is never inline-editable** ⚑ — newsletter names, descriptions and
  visibility (9, 10, 15), post titles, dates, thumbnails and reading times (12), the member count,
  the generated meta line and the **Members** badge. Clicking one says **"Edit in Ghost"**, and where
  the string is generated rather than stored the pill says so.
- **Translation-catalog strings** ⚑, not fields: "Subscribing…", "Use a different address", the
  visually-hidden "Email address" label, the generated meta line's words ("Free", "Members",
  "weekly", "twice a month") and the **Members** badge. The rule the patch set — no fixed English
  visitor-facing string ships — is met either by a field with a default or by the catalogue, and this
  list says which for every string in the category.

### The roster

| # | Design | Tuple | Ctl | Module beyond `member-form` |
|---|---|---|---|---|
| 1 | Inline Row | `form · none · page · none · none · field and button in one centred row` | 6 | — |
| 2 | Card | `form · card · page · none · none · the ask on an inset card` | 6 | — |
| 3 | Split | `split · none · page · none · none · the form standing beside the head` | 6 | — |
| 4 | Contrast Band | `form · none · contrast · none · none · the ask on an inverted band` | 7 | — |
| 5 | Panel | `form · none · surface · none · none · the ask on a raised plane` | 5 | — |
| 6 | Image Split | `split · none · surface · none · left · a photograph holding one half` | 7 | — |
| 7 | Cover | `form · none · image · none · background · the ask over a cover photograph` | 8 | — |
| 8 | Big Type | `stack · none · transparent · none · none · the ask under display type` | 5 | — |
| 9 | Slim Bar | `bar · none · surface · none · none · one line, field inline` | 4 | — |
| 10 | Choice | `form · none · surface · few · none · one checkbox row per newsletter` | 6 | — |
| 11 | Reasons | `split · none · page · few · none · three reasons beside the field` | 5 | — |
| 12 | Issue Preview | `feed · none · page · many · left · three recent issues under the ask` | 5 | — |
| 13 | Boxed | `form · box · page · none · none · the ask in a hairline box` | 5 | — |
| 14 | Slide-in Card | `sticky · card · transparent · none · none · a corner card that arrives late` | 6 | `slide-in-card` ⚑ |
| 15 | Two Up | `grid-of-N · none · page · few · none · one card per newsletter` | 5 | — |
| 16 | Quote | `stack · none · page · one · none · a reader's line above the field` | 5 | — |

**Ctl counts a design's own rows only** — the universal trio and the six-row source group are outside
every list, and 11's repeater and 12's Data panel are not counted either. **The ceiling is the PRD's
≈15 visible controls**; the highest here is 8, so the lifted budget was never needed. **Quick
Controls stay three to four** per design and are named in each panel's header line.

### Tuple uniqueness — the honest statement

**All sixteen are distinct on the five closed slots.** **Archetype spreads the category** — seven
`form`, three `split`, two `stack`, and one each of `bar`, `feed`, `sticky` and `grid-of-N`.
**Ground separates the seven forms**: `page` (1, 2, 13), `contrast` (4), `surface` (5, 10), `image`
(7); **containment separates 1, 2 and 13 on the page ground** — `none`, `card`, `box`; **item-count
separates 5 from 10** on `surface` and **3 from 11** on `split`. **Containment is `none` in thirteen
of sixteen** ⚑ — 15 Two Up's cards are the *items'* geometry, not the section's, which is A21·2's
rule.

**Item-count names what the layout is built for, not what the control allows** ⚑. `none` on twelve
designs is literal: there is no repeating unit at all. `few` on 10, 11 and 15 says the arrangement is
designed for two to four; `many` on 12 says five or more; `one` on 16 says exactly one quote and
never a list.

**The locked Background roles make the ground claims real.** 4, 7, 5, 6 and 10 could otherwise be
tuned into each other's grounds by a universal row, which would have made the uniqueness check a
statement about defaults rather than designs. Locking with the reason shown is the price, and it is
recorded in the Reconciliation notes.

**What the check cannot promise.** 2 Card and 13 Boxed differ by a fill; 5 Panel and 2 Card by
whether the plane is inset. 3 Split and 11 Reasons are the same two columns with and without a list.
9 Slim Bar's *Background role: Background* value reaches 1 Inline Row's ground, at which point the
two differ by whether a heading is drawn. **Each panel names the others by number** ⚑ rather than
pretending the overlap is not there. Those distinctions are real and visible; they are not
machine-checkable.

### Repeating items — the whole category, in one place

**Three kinds of item appear in A22 and only one of them is authored.**

- **Ghost's newsletters** — 9 Slim Bar (the label only), 10 Choice, 15 Two Up. **No Add and no
  Remove** ⚑ — the Ghost-sourced list card, "From Ghost", read-only rows and the sentence P0·3
  prescribes. A newsletter appears because the publication created one in Ghost and disappears
  because it was archived. **Order is Ghost's own and is not selectable** ⚑. **Zero is not
  reachable.** One → 10 draws no rows and names 5 Panel; 15 draws one card and names 2 Card, neither
  switching ⚑. Two to four is what both are built for. Five or more → 15 names 10 Choice ⚑.
  Fields shown: `name` always, `description` when present, `visibility` in 15's generated meta line
  and — since this pass — **in 10's Members badge**.
- **Ghost's posts** — 12 Issue Preview alone, and since this pass **through the shared P0·5 panel**.
  **No Add and no Remove** ⚑ except at *Hand-picked*, where the picked list is a list of references
  with P0·3's controls (drag to reorder, ✕ never disabled, Add pre-filled with the next newest post)
  and **Count and Order disable, the list being both**. Three, four or six by the panel's Count.
  **0** → rule, label and rows absent, the ask standing alone as 1 Inline Row ⚑. **1** → one row at
  the grid's left, no stretch. **many** → wraps. Fields shown: `title` and `published_at` always,
  `feature_image` and `reading_time` when present, `visibility` in the Members badge; **a post with
  no feature image draws as Thumbnails: Hide for that row alone** ⚑.
- **`reasons[]`** — 11 Reasons alone, **the category's only authored list** ⚑, A6·11's field carried
  verbatim, and **its repeater is drawn in the panel for the first time by this pass**: 1–3 lines,
  ≤ 40 characters each, **drag to reorder**, **✕ to remove and never disabled**, **Add arrives
  carrying a fact and never a blank row** ⚑, and **Add disables at three with its reason readable**
  ("The column holds three reasons. Remove one to add another."). **Per-item content only** — at
  *Reason marks: Icons* each row also carries **one P0·2 icon slot**, and there is no per-line size,
  colour or emphasis. One reason is a supported state; removing the last leaves the column empty and
  the panel names 3 Split.

**Per-item styling does not exist**, by construction: every control writes a single value onto the
section and the stylesheet reads it. **An empty icon slot renders nothing on the live site** and the
line closes up to its text — no width is reserved, and the dashed placeholder exists only while the
section is selected in the editor.

### The shared field list

| Field | Type | Req | Limit | Used by | Notes |
|---|---|---|---|---|---|
| `eyebrow` | text | opt | 24 ch | 1–7, 10–13, 15 | **Stored and not drawn in 8, 9, 14, 16** ⚑ |
| `heading` | text | opt | 60 ch | all but 9 | **40 ch in 14** ⚑; 9 stores and never draws it |
| `blurb` | text | opt | 240 ch | 1–7, 10–12, 14, 15 | **90 ch in 14** ⚑; stored and not drawn in 8, 9, 16 |
| `placeholder` | text | opt | 28 ch | all 16 | Default "you@example.com" |
| `buttonLabel` | text | opt | 16 ch | all 16 | Default "Subscribe"; **takes an optional P0·2 icon before or after** ⚑ |
| `note` | text | opt | 90 ch | all but 9 | One line under the field; **the consent line, and it takes the link mark** ⚑; 9 stores and never draws it |
| `proofLine` | text | opt | 60 ch | 1–8, 13, 16 | **New** ⚑. Default "Join {members} readers"; `{members}` → `{{total_members}}`, `{paid}` → `{{total_paid_members}}`. Drawn only at `socialProof: Member count` |
| `doneHeading` | text | opt | 40 ch | all 16 | Default "Check your inbox" · edited in P0·6's Done state |
| `doneText` | text | opt | 120 ch | all 16 | **Names the address that was typed** ⚑ |
| `invalidText` | text | opt | 60 ch | all 16 | Default "That address doesn't look right." |
| `subscribedText` | text | opt | 90 ch | all 16 | The signed-in subscriber's line |
| `manageLabel` | text | opt | 24 ch | all 16 | Default "Manage your preferences"; its target is read-only |
| `label` | text | opt | 20 ch | 9 | The strip's inline label; **defaults to the newsletter name** ⚑ |
| `issuesLabel` | text | opt | 24 ch | 12 | Default "The last three issues" ⚑ |
| `archiveLabel` | text | opt | 20 ch | 12 | Default "The archive"; **its target follows the Data panel's filter** ⚑ |
| `reasons[]` | list 1–3 | opt | 40 ch each | 11 | **A6·11's field, carried verbatim** ⚑, each item `{ text, icon? }` — the icon an optional P0·2 slot drawn at *Reason marks: Icons* |
| `quote` | text | opt | 140 ch | 16 | **Authored — Ghost stores no testimonial** ⚑ |
| `quoteAttrib` · `quoteDetail` | text | opt | 40 · 30 ch | 16 | Joined with a middot; an absent detail drops it ⚑ |
| `image` | image | opt | — | 6, 7 | ≥ 1,440 px in 6, ≥ 2,400 px in 7; **required in 7** |
| `imageAlt` | text | opt | 120 ch | 6 | **Drawn as an alt in 6, stored and unused in 7** ⚑ |
| `imageFocus` | enum | opt | — | **6, 7** | Centre · Top · Bottom — **a control since this pass** ⚑, in the panel and in the Image Picker popover |
| `socialProof` | enum | req | — | 1–8, 13, 16 | Off (default) · Member count |
| `membersBadge` | enum | req | — | 10, 12 | Off · On (default On where any item is not public) — **generated, never typed** ⚑ |
| `memberVisibility` | enum | req | — | all 16 | Source group; Everyone · Logged out · Free · Paid |
| *members enabled* | Ghost | req | — | all 16 | A site setting; the section reacts, never sets it ⚑ |
| *the signed-in member* | Ghost | opt | — | all 16 | And which newsletters they already take |
| *`total_members` · `total_paid_members`* | Ghost | opt | — | 1–8, 13, 16 | **Pre-rounded strings** ⚑ — read, never computed |
| *newsletters* | Ghost | req | — | 9, 10, 15 | `name`, `description`, `visibility`, `id` |
| *posts* | Ghost | opt | — | 12 | `title`, `published_at`, `feature_image`, `reading_time`, `visibility`, `url` |
| *`@site.paid_members_enabled`* | Ghost | req | — | 10, 15 | Gates the Portal route on a paid-only letter ⚑ |
| *@site.title* | Ghost | req | — | 9 | The form's `aria-label` where no heading exists ⚑ |

**Twenty-four authored fields and eight things read from Ghost.** A design may use fewer — 9 Slim Bar
draws three — but **none needs a field the category does not have**, so switching between any two of
the sixteen preserves everything the user typed.

---

## The sixteen designs

Every entry carries all ten fields in the brief's order, then a **Reconciled** paragraph. Controls
are listed **in sidebar order** and are the design's own; **the universal trio and the six-row
Newsletter source group sit outside every list and are not counted**. **Field 9 is `member-form` in
all sixteen**; only departures from its standard degradation are restated per design.

---

### 1 · Inline Row

1. **Descriptor.** A centred eyebrow, heading and blurb with one form row beneath, on the page
   ground. The category default; nothing is raised, boxed or photographed.
2. **Tuple.** `form · none · page · none · none · field and button in one centred row`
   Containment `none` — the section sits in nothing. Item-count `none`: one field is not a repeating
   unit.
3. **Archetype.** form. **No departures** — row above 767, stacked below.
4. **Responsive.** **1440** content 1,296 on a 72 margin, head centred on 720, blurb clamped 560,
   field 400, row 46, note 13, spacing 96. **834** heading 34, field 320, spacing 80. **≤ 767**
   heading 28, field and button one row each at 48, 8 px apart, **field text 16** ⚑, spacing 64.
5. **Fields.** `eyebrow` · `heading` · `blurb` · `placeholder` · `buttonLabel` · `note` ·
   `proofLine` · `doneHeading` · `doneText` · `invalidText` · `subscribedText` · `manageLabel`. From
   Ghost: members on or off, the signed-in member and their subscriptions, `total_members`.
6. **Controls.** Alignment *Centred · Left* — Heading size *Regular · Large · Display* (**Display
   disabled at Field width: Wide** ⚑) — Field width *Narrow 320 · Medium 400 · Wide 480* — Below the
   field *Note · Nothing* — Blurb *Show · Hide* — **Social proof *Off · Member count*** ⚑. **Six.**
7. **Data.** Posts to Ghost's members endpoint with the contract attributes. **0** — no repeating
   unit; the count that matters is the newsletter count. **1 newsletter** is the design. **many** →
   posts to the site default and **the sidebar names it** ⚑, with 10 and 15 named as the designs that
   let a reader pick. **Members off** → the field is replaced by the button alone, linking to the
   subscribe page; placeholder and note kept, **the proof line dropped with the form** ⚑.
8. **Empty.** No eyebrow, blurb or note → each absent, the block closing up ⚑. **No heading is
   allowed** and the `<form>` then takes `aria-label="Subscribe to Orbit Weekly"`. Placeholder and
   button label fall back to defaults rather than rendering empty ⚑. **`socialProof: Member count`
   with members off draws nothing** — not a zero ⚑.
9. **Module.** `member-form`, edit-safe. **No-JS:** "The `<form>` posts natively to Ghost's members
   endpoint; Ghost's own server response replaces the designed sent state." Empty and invalid survive
   without script; submitting and the in-place done state are the JS path.
10. **A11y.** Heading **h2** ⚑. Visually-hidden label; `type`, `autocomplete`, `inputmode`,
    `required`; `aria-invalid` on error with focus held. **The note is both the `aria-describedby`
    target and the `aria-live="polite"` region** ⚑; **the proof line is outside it** ⚑ — a count is
    not an announcement. Light: heading 13.4:1, placeholder 5.1:1, button label 4.6:1, proof line
    5.1:1; dark 8.1:1.
    **Repeating items** — none.
    **Flagged ⚑** the centred row as a unit · Display disabled at Wide · the 22 px the note costs ·
    the `aria-live` note · session-lived done · the field as a step away from its plane in both modes
    · 16 px field text at 390 · posting to the site default when several newsletters exist.

**Reconciled.** Six controls of its own — **Social proof** ⚑ new, Padding retired into **Vertical
spacing**. The trio is outside the list; the source group gained **Member visibility** ⚑. The form
carries Ghost's contract attributes. **Two frames redrawn**: the states frame gained an eighth
swatch — the member-count line under the note — and the footer strip reads **"Built with Inflozo"**.
Editing: the head, button label and note inline with P0·1, the note now taking the link mark; the
five state strings through P0·6; the button taking a P0·2 icon.

---

### 2 · Card

1. **Descriptor.** The centred ask on an inset surface card, raised on the page ground. **The
   category's tokenisation proof.**
2. **Tuple.** `form · card · page · none · none · the ask on an inset card`
   **The category's only `card`** — an inset object with its own plane, A29·12's rule. 5 Panel's
   full-width fill is a ground and reads `surface`.
3. **Archetype.** form. **One departure** — card padding steps twice (64 · 44 · 28) rather than once ⚑.
4. **Responsive.** **1440** card 1,104 centred in the 1,296 box, padding 64, heading 40, blurb 560,
   field 400. **834** card 754 — the whole box — padding 44, heading 34, field 320. **≤ 767** card
   350, padding 28, heading 28, field and button a row each at 48.
5. **Fields.** As 1. No field is unique to this design.
6. **Controls.** Card padding *Compact 48 · Comfortable 64 · Spacious 88* — Card *Raised · Flat*
   (**dark forces Flat** ⚑) — Card width *Narrow 880 · Medium 1104 · Full 1296* — Field width —
   Alignment *Centred · Left* — **Social proof** ⚑. **Six.**
7. **Data.** As 1. **Members off** → the card renders and the field inside it is replaced ⚑; the card
   is the design and is not withdrawn.
8. **Empty.** No blurb → a shorter card, **nothing reserved** ⚑. No note → 22 px less. **Never an
   empty card**: with no heading, no blurb and no note the panel names 1 Inline Row ⚑.
9. **Module.** `member-form`. The card is a token substitution in CSS and declares nothing.
10. **A11y.** Heading **h2**. **The card is a `div` with no role and no label** ⚑. Light: heading
    14.0:1 on `surface`, blurb 5.3:1; dark 13.1:1.
    **Repeating items** — none.
    **Flagged ⚑** card as containment against 5 Panel's ground · dark forcing Flat · the double
    padding step · the field deepening in dark and lifting in light · Full width naming 5 Panel ·
    never an empty card.

**Reconciled.** Six of its own — **Social proof** ⚑ new; **Padding retired into Vertical spacing**
while **Card padding kept its name**, being a different ladder. Background role stays free: the card
is an inset object on the page ground and the plane is the Card control, not the role. Source group,
form contract, editing and the footer strip as category-wide.

---

### 3 · Split

1. **Descriptor.** Head in a standing left column, the form in the column beside it on a fixed 96 px
   gutter. The design for a publication with a paragraph to spend.
2. **Tuple.** `split · none · page · none · none · the form standing beside the head`
3. **Archetype.** split. **One departure** — collapses at **834** rather than 767 ⚑.
4. **Responsive.** **1440** 620 · 96 · 580, head at the column top (**not vertically centred** ⚑),
   heading 34, blurb 560, field 400, spacing 96. **834** stacked ⚑, head on 620, field 320. **≤ 767**
   stacked, field and button a row each at 48, heading 28.
5. **Fields.** As 1.
6. **Controls.** Split *Even · Wide head · Wide form* (620·580, 720·480, 520·680 **on a fixed 96 px
   gutter** ⚑) — Form side *Right · Left* — Field *In a row · Stacked* (**Stacked forced at Wide
   head** ⚑) — Heading size *Regular · Large* (**no Display value** ⚑) — Below the field *Note ·
   Nothing* — **Social proof** ⚑. **Six.**
7. **Data.** As 1. **Members off** → the right column holds the button-as-link and the head is
   untouched ⚑.
8. **Empty.** No blurb → the head is an eyebrow and a heading and **the form column does not move
   up** ⚑. No note → the form column loses 22 px.
9. **Module.** `member-form`.
10. **A11y.** Heading **h2**. **DOM order is head then form at every width and at either Form side**
    ⚑. Light: heading 13.4:1, blurb 5.1:1.
    **Repeating items** — none.
    **Flagged ⚑** the collapse at 834 · the head top-aligned by rule · the fixed 96 gutter · Stacked
    forced at Wide head · no Display heading value · grid placement rather than source order.

**Reconciled.** Six of its own — **Social proof** ⚑ new, sitting under the note in the form column,
not under the head. **Padding retired into Vertical spacing.** Background role moves the ground
behind **both** columns, never one ⚑. Source group, form contract, editing, footer strip.

---

### 4 · Contrast Band

1. **Descriptor.** A full-bleed inverted band carrying a centred head and one form row, with the
   button in the carried colour rather than the accent.
2. **Tuple.** `form · none · contrast · none · none · the ask on an inverted band`
   The band is a ground, not a box — A26·3, A27·4 and A29·3, followed.
3. **Archetype.** form. **One departure** — the section's own vertical spacing resolves 0 at every
   width at *Full bleed*, because the band carries it ⚑.
4. **Responsive.** **1440** band 1,440 wide, content 1,296 on a 72 margin, 72 inside, head centred on
   720, blurb 600, field 400. **834** 56 inside, field 320. **≤ 767** 40 inside, **full bleed forced**
   ⚑, field and button a row each at 48. **No collapse at any width.**
5. **Fields.** As 1.
6. **Controls.** Band padding *Compact 48 · Comfortable 72 · Spacious 104* (**inside the band** ⚑) —
   Alignment *Centred · Left* — Heading size *Regular · Large · Display* — Field width — Band edges
   *Full bleed · Page margin* — Blurb *Show · Hide* — **Social proof** ⚑. **Seven.**
7. **Data.** As 1. **Members off** → the band renders with the button-as-link in the carried colour ⚑.
8. **Empty.** No blurb → the band shortens, **no minimum height** ⚑. With neither heading nor blurb
   the band is a 46 px row inside its padding and the panel names 9 Slim Bar ⚑.
9. **Module.** `member-form`.
10. **A11y.** Heading **h2**. **The band is a section landmark, not a banner** ⚑. **Focus and invalid
    borders take the carried colour, not the accent** ⚑, and **so does the proof line** ⚑. Light band:
    heading and button label 13.4:1, **placeholder 4.9:1 at 15 px** ⚑ — the tightest ratio and the
    reason it is not taken below 62%.
    **Repeating items** — none.
    **Flagged ⚑** the carried-colour button · no accent anywhere · the 600 blurb measure · full bleed
    forced at 390 · the band lightening in dark · 9 Slim Bar named at the empty end.

**Reconciled.** Seven of its own — **Social proof** ⚑ new. **Background role is locked at Contrast**
⚑ with the reason in the row: at Background this is 1 Inline Row and at Surface it is 5 Panel, and
both exist. **Band padding keeps its name**; **Vertical spacing resolves 0 at Full bleed** and the
ladder returns at Page margin; **Top divider disables at Full bleed** — there is no ground above the
band to draw it on. Source group, form contract, editing, footer strip.

---

### 5 · Panel

1. **Descriptor.** The ask on a raised surface plane the full width of the content box, left-aligned,
   with internal padding fixed.
2. **Tuple.** `form · none · surface · none · none · the ask on a raised plane`
   The plane is a fill, not a containment (A29·4). Ground `surface` separates it from 1 Inline Row;
   containment `none` from 2 Card.
3. **Archetype.** form. **One departure** — it narrows rather than collapsing, and the heading ladder
   runs one step low ⚑.
4. **Responsive.** **1440** plane 1,296, padding 56 × 64, heading 34, blurb 620, field 400, spacing
   96. **834** plane 754, padding 44 × 40, heading 30, field 320. **≤ 767** plane 350, padding
   28 × 24, heading 26, field and button a row each at 48 ⚑.
5. **Fields.** As 1.
6. **Controls.** Plane *Raised · Flat* — Alignment *Left · Centred* — Field width — Blurb *Show ·
   Hide* — **Social proof** ⚑. **Five.** **Internal padding stays fixed at 56 × 64** ⚑ and is not a
   control; the space *around* the plane is Vertical spacing.
7. **Data.** As 1. **Members off** → the plane renders and holds the button-as-link ⚑.
8. **Empty.** No blurb → a shorter plane ⚑. **The plane renders whatever is inside it and is never
   drawn empty**; with no heading and no blurb the panel names 9 Slim Bar ⚑.
9. **Module.** `member-form`. The plane declares nothing.
10. **A11y.** Heading **h2**. **The plane is decorative: no role, no label** ⚑. Light: heading 14.0:1,
    blurb 5.3:1; dark 13.1:1.
    **Repeating items** — none.
    **Flagged ⚑** fixed internal padding · plane-is-a-ground · five controls rather than six · the low
    heading ladder · Left as the default alignment · the 620 blurb measure.

**Reconciled.** Five of its own — **Social proof** ⚑ new. **Background role is locked at Surface** ⚑:
the raised plane is this design's ground and its identity, and *Plane: Raised · Flat* is its
treatment, not its role. **Padding retired into Vertical spacing** (around the plane). Source group,
form contract, editing, footer strip.

---

### 6 · Image Split

1. **Descriptor.** A photograph holding one half of a surface plane and the ask the other, the
   picture bleeding to three of the plane's edges. **The only design in A22 with an authored image
   and a drawn alt.**
2. **Tuple.** `split · none · surface · none · left · a photograph holding one half`
3. **Archetype.** split. **Two departures** — two columns held at 834 ⚑, and the picture's height
   derives from the words rather than from a ratio ⚑.
4. **Responsive.** **1440** plane 1,296, picture 632 bleeding to three edges, words 616 padded 48,
   heading 34, field 340 stacked. **834** 366 · 388, picture pinned 4:3, words padded 32, heading 28.
   **≤ 767** picture above at 350 × 220, bleed forced, **Picture side ignored** ⚑, words padded 24.
5. **Fields.** As 1, plus `image` (≥ 1,440 px), `imageAlt` ⚑ and **`imageFocus`** ⚑.
6. **Controls.** Picture side *Left · Right* — Split *Even · Wide picture · Wide words* — Picture
   treatment *Bleed · Inset* — **Image focus *Centre · Top · Bottom*** ⚑ — Plane *Raised · Flat* —
   Field *Stacked · In a row* (**In a row disabled at Wide picture** ⚑) — **Social proof** ⚑.
   **Seven.**
7. **Data.** As 1. **No image authored → hands off to 5 Panel** ⚑, drawn in place, flagged in the
   editor, invisible on the site. **Members off** → the picture stays and the words half holds the
   button-as-link ⚑.
8. **Empty.** No blurb → the words column shortens and **the picture shortens with it** at 1440 ⚑.
   No alt → the editor asks and the picture publishes with `alt=""` rather than a guessed sentence ⚑.
9. **Module.** `member-form`. The picture is a CSS background on a real `{{img_url}}`, positioned
   from `imageFocus`.
10. **A11y.** Heading **h2**. **The picture carries a real alt, not an empty one** ⚑ — the opposite
    call from 7 Cover. **DOM order is words then picture at every width** ⚑; at ≤ 767 the picture is
    placed above the words by grid placement, so reading order and DOM order differ, which is stated.
    Light: heading 14.0:1, blurb 5.3:1.
    **Repeating items** — none.
    **Flagged ⚑** the bleed to three edges · height from the words · 4:3 pinned at 834 · the hand-off
    to 5 · the drawn alt · Stacked as the default field · reading order at 390.

**Reconciled.** Seven of its own — **Image focus** ⚑ new (rule 10: every image field carries a focus
and it is never a hidden field, so it is in the panel *and* in the Image Picker popover) and
**Social proof** ⚑ new. **Background role is locked at Surface** ⚑ — the plane is the ground the
picture bleeds into, three of its edges being the plane's own. **Padding retired into Vertical
spacing.** Source group, form contract, editing (the alt edits in the Image Picker), footer strip.

---

### 7 · Cover

1. **Descriptor.** A full-bleed photograph under a warm scrim carrying a centred head and form in
   white. **The only design in A22 where the field sits on an image.**
2. **Tuple.** `form · none · image · none · background · the ask over a cover photograph`
   **The category's only `image` ground and only `background` media.**
3. **Archetype.** form. **Two departures** — the section's own spacing resolves 0 at *Full bleed* ⚑,
   and **the band is taller at 390 than at 834** ⚑.
4. **Responsive.** **1440** band 1,440 wide, **460 minimum, not a crop** ⚑, 72 inside, head centred on
   720, blurb 560, field 400. **834** 420 minimum, 56 inside, field 320. **≤ 767** **520 minimum** ⚑,
   40 inside, full bleed forced, field and button a row each at 48. **Every stated height is a floor.**
5. **Fields.** As 1, plus `image` (**required here**, ≥ 2,400 px) and **`imageFocus`** — **a control
   since this pass** ⚑. `imageAlt` is kept and not drawn ⚑.
6. **Controls.** Height *Short · Standard · Tall* (**a minimum, not a crop** ⚑) — Scrim *Light ·
   Medium · Strong* (**Light disabled against light images**, checked on the bottom third ⚑) —
   **Image focus *Centre · Top · Bottom*** ⚑ — Content position *Centre · Bottom* — Field width —
   Band edges *Full bleed · Page margin* — Blurb *Show · Hide* — **Social proof** ⚑. **Eight.**
7. **Data.** As 1. **No image at any width → hands off to 4 Contrast Band** ⚑. **Members off** → the
   picture and the head render with the button-as-link in white ⚑.
8. **Empty.** No blurb → the band shortens toward its floor and stops there ⚑. **No background image →
   the hand-off is the empty state** ⚑.
9. **Module.** `member-form`. The image is a CSS background positioned from `imageFocus` and the
   scrim a gradient; neither is measured.
10. **A11y.** Heading **h2**. **The background image is decorative and takes an empty alt** ⚑.
    **Focus and invalid borders take white, not the accent** ⚑, and so does the proof line.
    Checked at Medium on the darkest and lightest thirds: heading 12.1:1, **placeholder 4.9:1 at
    15 px** ⚑.
    **Repeating items** — none.
    **Flagged ⚑** height as a floor · the taller band at 390 · literals rather than tokens over the
    picture · the hand-off to 4 · Light disabled by a bottom-third check · no heading-size control ·
    white staying white in dark.

**Reconciled.** Eight of its own — **Image focus promoted from a stored field to a control** ⚑ (a
field with no UI is unreachable, and on the one design where the picture *is* the ground that is a
real defect) and **Social proof** ⚑ new. **Background role is locked at Image** ⚑ with the reason
shown: with no image the section hands off to 4, which is the same ask on a role. **Vertical spacing
resolves 0 at Full bleed**, **Top divider disables there**, and **Height stays the band's own floor**.
Source group, form contract, editing, footer strip.

---

### 8 · Big Type

1. **Descriptor.** The heading at display scale on a 1,080 measure with a hairline under it and the
   form row beneath. No ground of its own and no blurb at any value.
2. **Tuple.** `stack · none · transparent · none · none · the ask under display type`
   `transparent` means the section has no ground of its own and shows what is beneath it.
3. **Archetype.** stack. **No departures.**
4. **Responsive.** **1440** measure 1,080, heading 76, rule 1 px, field 480, spacing 96. **834**
   measure 754, heading 52, field 320. **≤ 767** measure 350, heading 34, field and button a row each
   at 48. **The scale ladder is per width** ⚑ — Display 76 · 52 · 34, Huge 96 · 64 · 40.
5. **Fields.** `eyebrow` · `heading` · `placeholder` · `buttonLabel` · `note` · `proofLine` · the
   state fields. **`blurb` is stored and never drawn** ⚑.
6. **Controls.** Heading scale *Display · Huge* — Rule under the heading *Show · Hide* — Field width
   (**Wide is the default** ⚑) — Eyebrow *Show · Hide* (**hidden by default at Huge** ⚑) — **Social
   proof** ⚑. **Five.** **Vertical spacing: Compact is advised at Huge** ⚑.
7. **Data.** As 1. **Members off** → the heading and rule render with the button-as-link beneath ⚑.
8. **Empty.** No eyebrow → the heading rises to the spacing ⚑. **No heading is not a supported
   state** ⚑ — the display line is the design.
9. **Module.** `member-form`.
10. **A11y.** **76 px is a size, not a level** ⚑ — the same `h2` as everywhere in A22. **The rule is a
    `div`, not an `hr`** ⚑. Light: heading 13.4:1, placeholder 5.1:1, button label 4.6:1.
    **Repeating items** — none.
    **Flagged ⚑** no blurb at any value · the per-width scale ladder · Wide as the default field · the
    eyebrow hidden by default at Huge · the done heading at 22 rather than 76 · nothing auto-fitting ·
    the transparent ground.

**Reconciled.** Five of its own — **Social proof** ⚑ new, drawn under the note at 13 px so it never
competes with the display line. **Padding retired into Vertical spacing**, Compact still advised at
Huge. Background role stays free and the panel says what each value means for a transparent ground:
at Contrast the display line becomes 4's band with display type on it. **The frame's context footer
strip reads "Built with Inflozo"** ⚑ — it read "Published with Ghost", and FR-J15 applies to
low-opacity page chrome exactly as it does to a masthead. Source group, form contract, editing.

---

### 9 · Slim Bar

1. **Descriptor.** A full-bleed surface strip between hairlines carrying a label and one form row on
   a single line. **The smallest newsletter section in the library — 93 px including both rules.**
2. **Tuple.** `bar · none · surface · none · none · one line, field inline`
   `surface` is the ground its **Background role** can leave; at *Background* it reaches 1 Inline
   Row's ground and the panel names it ⚑.
3. **Archetype.** bar. **Two departures** — the section's own spacing resolves 0 ⚑, and **invalid
   grows the strip by 22 px** where every other design holds height ⚑.
4. **Responsive.** **1440** strip 1,440 wide, content 1,296 on a 72 margin, 24 inside, label 19,
   field 320, row 45, total 93. **834** 22 inside, label 17, **field 260** ⚑, line holds. **≤ 767** 20
   inside, **label above the form** ⚑, field and button a row each at 48.
5. **Fields.** `label` (opt, ≤ 20, **default the newsletter's name from Ghost** ⚑) · `placeholder` ·
   `buttonLabel` · `invalidText` · `doneHeading` · `subscribedText` · `manageLabel`. **`eyebrow`,
   `heading`, `blurb` and `note` are stored and never drawn** ⚑.
6. **Controls.** Strip padding *Compact 16 · Comfortable 24 · Spacious 36* (**inside the strip** ⚑) —
   Rules *Above and below · Below only · None* (**None raises the padding** ⚑) — Field width *Narrow
   320 · Medium 400* (**no Wide value** ⚑) — Label *Newsletter name · Custom*. **Four.**
7. **Data.** As 1, plus the newsletter's `name`. **Members off** → the strip holds the label and the
   button-as-link ⚑.
8. **Empty.** No label at *Custom* → falls back to the newsletter name ⚑. **The strip never renders
   empty**: its floor is a label and a field.
9. **Module.** `member-form`.
10. **A11y.** **No heading at all** ⚑ — the label is a `<p>` and the `<form>` carries
    `aria-label="Subscribe to the Friday edition"`, A3·4's rule. **At ≤ 767 DOM order is label then
    form**, matching reading order. Light: label 14.0:1, placeholder 5.3:1.
    **Repeating items** — none; the newsletter supplies only the label.
    **Flagged ⚑** invalid growing the strip · the bespoke 260 field at 834 · no Wide value · Rules:
    None raising the padding · the named overlap with 1 Inline Row · the label defaulting from Ghost ·
    no heading.

**Reconciled.** **Four of its own** — the fewest in the category — because **Ground retired into
Background role** ⚑, where the two values become the library's three and **Contrast is new**,
deriving the strip's colours from the two contrast tokens (A17·7) and naming 4. **Vertical spacing
and Top divider are locked** ⚑: Strip padding is the spacing ladder and *Rules* is the divider, and
*Rules* draws the bottom edge too, which the universal row cannot. **Social proof is not offered** ⚑
— the patch names 1–8, 13 and 16, and 93 px has no line to spare. Source group, form contract,
editing (the newsletter's own name says "Edit in Ghost"), footer strip.

---

### 10 · Choice

1. **Descriptor.** The site's newsletters as checkbox rows above one field. **The design for a
   publication that sends more than one letter.**
2. **Tuple.** `form · none · surface · few · none · one checkbox row per newsletter`
   Item-count `few` separates it from 5 Panel on otherwise identical closed slots.
3. **Archetype.** form. **One departure** — rows grow rather than truncate at 390 ⚑.
4. **Responsive.** **1440** plane 1,296, padding 48 × 56, rows 56 on a 720 measure, checkbox 20, name
   17, description 14, field 400. **834** plane 754, padding 36, rows hold. **≤ 767** plane 350,
   padding 24 × 22, **description wraps and the row grows** ⚑, field and button a row each at 48.
5. **Fields.** As 1, plus `membersBadge`. From Ghost, per newsletter: `name` (req), `description`
   (opt), `visibility`, `id`; and `@site.paid_members_enabled`.
6. **Controls.** Plane *Raised · Flat* — Row detail *Name and description · Name only* — **Members
   badge *Off · On*** ⚑ — Pre-ticked *All · The first · None* (**None enabled in this pass** ⚑) —
   Dividers *Hairline · None* — Field width. **Six.**
7. **Data.** `{{#get "newsletters"}}` ⚑ — **the whole set, in Ghost's own order, with no limit
   control**. **0** not reachable ⚑. **1** → the rows are not drawn and the panel names 5 Panel
   without switching ⚑. **many** → two to four is the design; five or more grows the plane and
   scrolls the page, never the section ⚑. **A letter whose `visibility` is not public draws the
   Members badge**, and **a ticked paid-only letter routes the button to Portal signup** ⚑ —
   `#/portal/signup`, gated on `@site.paid_members_enabled`; the field goes and the button-as-link
   takes its place, which is the substitution this category already owns. **With paid members off
   the ordinary form stays** and the badge is the only signal ⚑. **Members off** → **the whole design
   goes** ⚑, which is why this design defaults to *Hide the section*.
8. **Empty.** A newsletter with no description → **that row draws Name only** and falls to 44 px ⚑.
   **Never a placeholder row and never an empty checkbox list** ⚑. Every letter public → the badge
   row has nothing to draw and hides itself ⚑.
9. **Module.** `member-form`. **Without JS the checkboxes are real inputs in the same form and post
   with the address** ⚑ — this design loses nothing at all. The Portal route is a link and needs no
   module.
10. **A11y.** Heading **h2**; **the rows are a fieldset with a visually-hidden legend** ⚑. Each row is
    a real `<label>` wrapping the input, so **the whole 56 px row is the target** ⚑. **The badge is
    inside the label's accessible name** ⚑ — "Field Notes, Members" — so the tick does not promise
    something the reader cannot receive. Light: name 14.0:1, description 5.3:1, badge 5.3:1, ticked
    box 4.6:1; dark 8.1:1.
    **Repeating items** — Ghost's newsletters. **No Add, no Remove, no reorder, no per-row styling** ⚑.
    **Flagged ⚑** two accents in one section · rows growing at 390 · the fieldset legend · Ghost's
    order as the order · the 1-newsletter hand-off named but not taken · zero unreachable ·
    defaulting to Hide at members-off · the second error message sharing the live region.

**Reconciled.** Six of its own — **Members badge** ⚑ new (15's generated meta, reused on the row) and
**Pre-ticked: None enabled** ⚑, because a reader ticking their own boxes is a legitimate default set
and *All* is the consent anti-pattern this category's own notes worry about. **A ticked paid-only
letter routes to Portal signup** ⚑, gated on `@site.paid_members_enabled`. **Background role is
locked at Surface** ⚑ — the plane is the ground; the rows are what separate this from 5.
**Padding retired into Vertical spacing.** **Two frames redrawn**: the members-only row now carries
the badge, and the states frame gained a ticked-paid-letter state. Source group, form contract,
editing (names, descriptions and visibility say "Edit in Ghost"), footer strip.

---

### 11 · Reasons

1. **Descriptor.** Head and form in a standing left column with one to three authored reasons on
   hairlines beside them. **The only design in A22 with an authored list.**
2. **Tuple.** `split · none · page · few · none · three reasons beside the field`
3. **Archetype.** split. **Two departures** — collapses at 834 ⚑, and the collapse puts the form
   **above** the reasons rather than following grid order ⚑.
4. **Responsive.** **1440** 620 · 96 · 580, head at the column top, heading 34, field 400, reasons 17
   on hairlines. **834** stacked ⚑, order head → form → reasons. **≤ 767** stacked, reasons 16, field
   and button a row each at 48.
5. **Fields.** As 1, plus `reasons[]` (opt, 1–3, each `{ text ≤ 40, icon? }` ⚑).
6. **Controls.** Split *Even · Wide head · Wide reasons* — Reasons side *Right · Left* — Reason marks
   *Numbers · Rules only · **Icons*** ⚑ — Reason size *Regular · Large* — Below the field *Note ·
   Nothing*. **Five.** The Reasons repeater follows and is not counted.
7. **Data.** As 1; the reasons are authored, not read. **0 reasons** → the right column is empty and
   the panel names 3 Split without switching ⚑. **1** → one line, its mark and no rule above it ⚑.
   **many** → three is the ceiling; Add disables there with its reason readable.
8. **Empty.** **Never a blank reason row** ⚑ — Add produces a line carrying a fact. No blurb → the
   form rises in its column and the reasons do not move ⚑. **An empty icon slot renders nothing**
   and the line closes up to its text ⚑.
9. **Module.** `member-form`. The reasons are static markup.
10. **A11y.** Heading **h2**. **The reasons are a `<ul>`** ⚑; the numbers are CSS content and are not
    read out, and **an icon is `aria-hidden` decoration** ⚑ — the line's text carries the meaning.
    **DOM order is head, form, reasons at every width** ⚑. Light: reasons 13.4:1, marks 5.1:1.
    **Repeating items** — `reasons[]`, authored, with P0·3's controls: drag to reorder, ✕ never
    disabled, Add carrying content, 1–3, **no per-line styling** ⚑ beyond the item's own icon.
    **Flagged ⚑** carrying A6's authored list into a category briefed without one · the collapse at
    834 · form above reasons when stacked · Large unusable at three · the marks never taking accent.

**Reconciled.** Five of its own — **Reason marks gains Icons** ⚑, a third value where each line takes
**one P0·2 icon slot** (Picker on click; Size and Colour role in the popover; an empty slot renders
nothing) — **the category's "no icons at any value" ruling is withdrawn**. **The reasons repeater is
drawn in the panel for the first time** ⚑ with P0·3's controls. **Padding retired into Vertical
spacing.** **One frame redrawn**: a *Reason marks: Icons* example, three lines with their slots and
the third left empty to show what an empty slot draws. **Social proof is not offered** ⚑ — the
reasons are this design's proof. Source group, form contract, editing, footer strip.

---

### 12 · Issue Preview

1. **Descriptor.** The ask above a rule with the last three issues beneath it as thumbnail rows read
   from Ghost. **The only design in the category that shows what arrives.**
2. **Tuple.** `feed · none · page · many · left · three recent issues under the ask`
   **The category's only `feed` and only `many`.**
3. **Archetype.** feed. **One departure** — Issue layout is forced to Listed at 834 and below ⚑.
4. **Responsive.** **1440** ask on 720, rule, label row, three columns of 416 with 88 × 66
   thumbnails, titles 17 clamped two. **834** **Listed forced** ⚑, rows on hairlines, thumbnails
   80 × 60. **≤ 767** listed, thumbnails 72 × 54, titles 16, field and button a row each at 48.
5. **Fields.** As 1, plus `issuesLabel`, `archiveLabel` and `membersBadge`. From Ghost, per post:
   `title`, `published_at`, `feature_image` (opt), `reading_time` (opt), `visibility`, `url`.
6. **Controls.** Issue layout *Across · Listed* — Thumbnails *Show · Hide* — Issue meta *Date · Date
   and reading time · Off* — **Members badge *Off · On*** ⚑ — Archive link *Show · Hide*. **Five.**
   **The Data group is P0·5's panel** and is not counted.
7. **Data.** **The shared P0·5 "Populate from…" panel** ⚑ *(new in this pass, replacing this design's
   bespoke source)*: **Source** *Static (authored) · From posts* with **Static disabled** — Ghost has
   no newsletter-issue object, so there is nothing to author — then **Filter** *Latest · Featured ·
   **By tag** · By author · Hand-picked*, **Tag** (live-searched, name + count, single pick),
   **Count** *Three · Four · Six* and **Order** *Newest · Oldest*. **The default is By tag:
   `newsletter`** ⚑ — the real fix for the no-issue-object finding, because a publication that tags
   its letters can say which posts they are, and **Hand-picked curates the three best issues** with
   P0·3's row controls, Count and Order disabling there. **P0·5's meta chips are not drawn twice** ⚑
   — this design's *Issue meta* enum is the meta control. Drafts, scheduled posts and pages are
   excluded; **members-only posts are included and now badged** ⚑. **0** → rule, label and rows
   absent, the ask standing alone as 1 Inline Row ⚑. **1** → one row at the grid's left, no stretch ⚑.
   **many** → wraps at four and six. **Members off** → the issues stay and the field becomes the
   button-as-link ⚑.
8. **Empty.** A post with no feature image → **that row draws as Thumbnails: Hide** ⚑ and the rows
   around it are unchanged. **No placeholder row, no empty thumbnail, no "no issues yet" chip** ⚑.
   A tag with no posts → the rows, the label and the rule are absent together ⚑, and the Data group
   says so in the editor rather than the canvas drawing an empty band.
9. **Module.** `member-form`. The issue rows are server-rendered links; there is no `load-more` and no
   `infinite-scroll` here — the archive link is a real page.
10. **A11y.** Heading **h2**; **issue titles are `h3` inside their anchors** ⚑ and **the label above
    them is a paragraph, not a heading** ⚑. **The whole row is the anchor** ⚑. Thumbnails `alt=""` ⚑.
    **The Members badge is inside the anchor's accessible name** ⚑ — "…, 8 August 2026, Members".
    Light: title 13.4:1, date 5.1:1, badge 5.1:1.
    **Repeating items** — Ghost's posts, through P0·5. **No Add and no Remove except at Hand-picked**,
    where the picks are references, not copies ⚑.
    **Flagged ⚑** posts standing in for issues · Listed forced at 834 · the tag convention as the
    issue filter · the caption not being a heading · the per-post thumbnail fallback · no excerpt at
    any value.

**Reconciled.** Five of its own — **Members badge** ⚑ new, because members-only issues drew unbadged
and that promises a reader something they cannot open. **The bespoke source is replaced by the P0·5
Data panel** ⚑, and **How many issues left the design's own list** to become the panel's Count.
**The archive link follows the source** ⚑: the tag's archive at *By tag*, the author's at *By
author*, the post index otherwise — Ghost still has no newsletter archive route. **Padding retired
into Vertical spacing.** **One frame redrawn**: the members-only issue's meta line ends in
**Members**. Source group, form contract, editing (post content says "Edit in Ghost"), footer strip.

---

### 13 · Boxed

1. **Descriptor.** The centred ask inside a hairline box with no fill and no shadow, on the page
   ground.
2. **Tuple.** `form · box · page · none · none · the ask in a hairline box`
   **The category's only `box`** — an edge with no ground.
3. **Archetype.** form. **One departure** — box padding steps twice (56 · 40 · 26) ⚑.
4. **Responsive.** **1440** box 1,104 centred in the 1,296, padding 56, heading 40, blurb 560, field
   400. **834** box 754, padding 40, heading 34, field 320. **≤ 767** box 350, padding 26, heading 28,
   field and button a row each at 48.
5. **Fields.** As 1.
6. **Controls.** Box padding *Compact 40 · Comfortable 56 · Spacious 76* — Box width *Narrow 880 ·
   Medium 1104 · Full 1296* — Field width — Alignment *Centred · Left* — **Social proof** ⚑. **Five.**
7. **Data.** As 1. **Members off** → the box renders and holds the button-as-link ⚑.
8. **Empty.** No blurb → a shorter box ⚑. **Never an empty box**: the panel names 1 Inline Row ⚑.
9. **Module.** `member-form`. The box is a border.
10. **A11y.** Heading **h2**. **The box is a `div` with no role and no label** ⚑; **its hairline is
    1.4:1 and is decorative** ⚑, which is why no value thickens it. Light: heading 13.4:1, blurb
    5.1:1.
    **Repeating items** — none.
    **Flagged ⚑** box as a containment with no ground · **no fill value at all** (a filled box is 2
    Card) · the double padding step · the hairline never thickening · light and dark being
    structurally identical.

**Reconciled.** Five of its own — **Social proof** ⚑ new. **Padding retired into Vertical spacing**
while **Box padding kept its name**. Background role stays free: the box is an edge with no ground of
its own, so the role is the page behind it — and a filled box is 2 Card. Source group, form contract,
editing, footer strip.

---

### 14 · Slide-in Card

1. **Descriptor.** A 380 px card arriving in the page's bottom corner after a trigger, carrying a
   short ask and a stacked form. **The only design in A22 outside the document flow.**
2. **Tuple.** `sticky · card · transparent · none · none · a corner card that arrives late`
   **The category's only `sticky`.** Ground `transparent` — it shows the page beneath it.
3. **Archetype.** sticky. **One departure** — it narrows and stays in its corner rather than
   collapsing ⚑.
4. **Responsive.** **1440** card 380, 24 from the right and bottom, padding 22, heading 20, blurb 15,
   form stacked at 44. **834** card 360, offsets unchanged. **≤ 767** card 342, offsets 16, **Corner
   disabled** ⚑, **Wide disabled** ⚑.
5. **Fields.** As 1, with **`heading` capped at 40 rather than 60** ⚑ and **`blurb` at 90 rather than
   240** ⚑ — truncating at render is worse than capping at authoring.
6. **Controls.** Arrives *Halfway down the page · At the page foot · After twenty seconds* (**never
   on load** ⚑) — Corner *Bottom right · Bottom left* — Card width *Narrow 320 · Medium 380 · Wide
   440* — Card *Raised · Flat* — Blurb *Show · Hide* — Once dismissed *Not again this session · Not
   again for thirty days* (**where the memory lives is a finding** ⚑). **Six.**
7. **Data.** As 1. **Members off** → **the card does not render at all** ⚑. **A signed-in subscriber
   never sees it** ⚑, at either value of the shared control. **Member visibility applies as
   everywhere** — a publication that wants paid readers left alone sets it here rather than accepting
   a third ask on one page.
8. **Empty.** No blurb → the card falls to 168 px ⚑. **No heading is not supported** ⚑. No note → 20
   px less.
9. **Module.** **Two** ⚑ — `slide-in-card` and `member-form`, both edit-safe. **No-JS, quoted:**
   `slide-in-card` — "The card renders statically in the document flow near the page end rather than
   sliding in." `member-form` — "The `<form>` posts natively to Ghost's members endpoint; Ghost's own
   server response replaces the designed sent state." **Together: with script off this is an ordinary
   bordered card at the page foot with a working form in it** ⚑.
10. **A11y.** Heading **h2**. **It is not a dialog** ⚑ — no `role="dialog"`, no focus trap, no
    `aria-modal`; it does not block the page. A `<section aria-labelledby>` that becomes visible;
    **focus is not moved to it on arrival** ⚑ and it is announced with `aria-live="polite"` once. The
    close button is a real `<button aria-label="Close">` in a 44 px target ⚑. **Motion: 160 ms
    ease-out from the pinned corner; under reduced-motion it appears without translation** ⚑.
    **Repeating items** — none.
    **Flagged ⚑** two modules where the library declares one or none · the card outside the flow · the
    shortened field caps · never on load · the deepened light-only shadow · Corner disabled at 390 ·
    not-a-modal · the eight-second auto-dismiss · dismissal memory as an open registry question ·
    hiding entirely at members-off.

**Reconciled.** Six of its own, unchanged — no Padding row ever existed here. **All three universal
rows are locked** ⚑, for one reason stated three times: the card is pinned to the viewport, not the
page, so there is no ground behind it, no seam around it and nothing above it to divide. **This is
the only design in A22 where the whole trio is locked**, and it is recorded in the Reconciliation
notes rather than passed off as ordinary. **Social proof is not offered** ⚑ — a 168 px card spends
its lines on the ask. Source group (Member visibility included), form contract, editing, footer strip.

---

### 15 · Two Up

1. **Descriptor.** One card per newsletter, side by side, each with its own name, description and
   field. **Two independent forms in one section.**
2. **Tuple.** `grid-of-N · none · page · few · none · one card per newsletter`
   **The category's only `grid-of-N`.** Containment `none` — the cards are the *items'* geometry
   (A21·2's rule).
3. **Archetype.** grid-of-N. **One departure** — the ladder is two · two · one rather than three ·
   two · one ⚑.
4. **Responsive.** **1440** two cards of 636 on a 24 gutter, padding 32, name 26, description 15,
   field stacked at 46. **834** two of 365, padding 24, name 22. **≤ 767** one of 350, cards stacked
   on a 20 gap, **equal heights dropped** ⚑.
5. **Fields.** `eyebrow` · `heading` · `blurb` for the section; the form and state fields **shared
   across both cards** ⚑ — there is no per-card copy. From Ghost, per newsletter: `name`,
   `description`, `visibility`, `id`; and `@site.paid_members_enabled`.
6. **Controls.** Cards across *Two · Three · Auto* — Card padding *Compact 24 · Comfortable 32 ·
   Spacious 44* — Card *Raised · Flat* — Card meta *Show · Hide* (**generated, never typed** ⚑) —
   Description *Show · Hide*. **Five.**
7. **Data.** `{{#get "newsletters"}}` in Ghost's own order ⚑. **0** not reachable ⚑. **1** → one card
   at the grid's left, no stretch; the panel names 2 Card ⚑. **2** → the design. **3** → three of 416;
   **4** → two rows of two; **5 or more** → the panel names 10 Choice ⚑. **A paid-only letter's card
   loses its field and its button links to Portal signup** ⚑ — `#/portal/signup`, gated on
   `@site.paid_members_enabled`; **with paid members off the ordinary form stays** and the meta line
   is the only signal ⚑. **Members off** → **the whole section goes** ⚑.
8. **Empty.** A newsletter with no description → **that card draws Description: Hide** and the grid
   equalises heights anyway ⚑. **Never an empty card and never a placeholder card** ⚑. A paid card at
   the Portal route is **shorter by the field's height** and the grid equalises ⚑.
9. **Module.** `member-form`, declared once and binding both forms ⚑. With script off both post
   natively and independently; the Portal route is a link and needs no module.
10. **A11y.** Section heading **h2**; **each newsletter's name is an `h3`** ⚑. **Each card is its own
    `<form>` with its own visually-hidden label** ⚑ — except a paid card at the Portal route, which
    is a link and not a form ⚑. Focus order: heading → card one → card two.
    Light: name 14.0:1, description 5.3:1, meta 5.3:1.
    **Repeating items** — Ghost's newsletters. **No Add, no Remove, no reorder, no per-card styling** ⚑.
    **Flagged ⚑** two independent forms in one section · states being per card · the two · two · one
    ladder · equal heights dropped at 390 · the generated meta line · Ghost's order as the order ·
    two accents as the ceiling.

**Reconciled.** Five of its own — **Padding retired into Vertical spacing**, Card padding keeping its
name. **The paid-only card is redrawn as a Portal route** ⚑: the field goes, the button stays and
links to `#/portal/signup`, gated on `@site.paid_members_enabled`, because an address alone cannot
subscribe a reader to a paid letter and collecting one subscribes them into silence. **The generated
meta line is the badge** — 10 Choice now reuses it on its rows. Background role stays free: the cards
are the items' geometry, not the section's. **Four viewport frames redrawn** (the paid card in each).
Source group, form contract, editing, footer strip.

---

### 16 · Quote

1. **Descriptor.** One authored reader quote at 28 px above a rule, with a small heading and the form
   beneath it. **The only design in A22 that argues in somebody else's words.**
2. **Tuple.** `stack · none · page · one · none · a reader's line above the field`
   **The category's only `one`** — exactly one quote, never a list; a row of three is A8 Testimonials.
3. **Archetype.** stack. **No departures.**
4. **Responsive.** **1440** measure 780, quote 28, attribution 14, rule, heading 24, field 400,
   spacing 96. **834** measure 754, quote 24, heading 22, field 320. **≤ 767** measure 350, quote 21,
   heading 20, field and button a row each at 48. **The quote and the heading never cross** ⚑.
5. **Fields.** As 1, plus `quote` (opt, ≤ 140 ⚑), `quoteAttrib` (≤ 40) and `quoteDetail` (≤ 30) —
   **all three authored** ⚑. **`blurb` is stored and never drawn** ⚑.
6. **Controls.** Quote size *Regular · Large* (**Large drops the heading** ⚑) — Rule under the quote
   *Show · Hide* — Field width — Attribution *Name and detail · Name only* — **Social proof** ⚑.
   **Five.**
7. **Data.** As 1 — **the quote is authored and nothing about it is read from Ghost** ⚑. **Members
   off** → the quote, rule and heading render with the button-as-link ⚑.
8. **Empty.** No quote → **the design is 1 Inline Row with a smaller heading** and the panel names it
   without switching ⚑; the rule goes with the quote. No attribution → **the quote stands
   unattributed** ⚑, which the editor flags as weak rather than blocking. No detail → the middot goes ⚑.
9. **Module.** `member-form`. The quote is static markup.
10. **A11y.** **The quote is a `<blockquote>` with a `<cite>` in its attribution** ⚑ — not a heading,
    at any size. **The 24 px line under the rule is the `h2`** ⚑, stated so the build does not promote
    the quote. Light: quote 13.4:1, attribution 5.1:1.
    **Repeating items** — none. **One quote and no list** ⚑.
    **Flagged ⚑** the authored quote and its 140 cap · no quotation marks drawn · no portrait · the
    heading held below the quote at every width · Large dropping the heading · the blockquote never
    being a heading.

**Reconciled.** Five of its own — **Social proof** ⚑ new, and it sits **under the note, not under the
quote** ⚑: two pieces of proof in one column would compete, and the quote is the one this design
chose. **Padding retired into Vertical spacing.** Source group, form contract, editing (the quote,
its attribution and detail all inline), footer strip.

---

## Findings for the architect

1. **Ghost has no newsletter-issue object.** ⚑ 12 Issue Preview draws posts, and **a post that went
   out as a letter is indistinguishable in the API from one that did not** — there is no `sent_at`,
   no issue number and no way to filter to "things that were emailed". **This pass answers it as far
   as a theme can**: the P0·5 panel's default is *By tag: `newsletter`*, which turns the problem into
   a publishing convention the publication controls, and *Hand-picked* lets three issues be curated
   by hand. **Neither is a platform fix**, and every "recent issues" section in the library will
   have this problem until the API grows a send record.
2. **There is no newsletter archive route.** ⚑ Ghost has `/`, tag routes and author routes, and
   nothing that means "the letters". 12's archive link now **follows the Data panel's filter** — the
   tag archive at *By tag*, the author archive at *By author*, the post index otherwise — which is
   the closest true thing at each setting. A20 found the same gap for tags and A21 for authors;
   **this is the third category to hit it**.
3. **Dismissal memory is not in the registry.** ⚑ 14 Slide-in Card offers *Not again this session*
   and *Not again for thirty days*, and `slide-in-card`'s registry entry does not say whether it
   remembers a dismissal or where. `dismiss` is the closest module and belongs to A2's bar. **Named,
   not resolved, and this pass did not resolve it either.**
4. **One design declares two modules.** ⚑ 14 declares `slide-in-card` and `member-form`. Nothing in
   the registry forbids it and nothing in the brief anticipates it. **Both degrade independently** and
   the combined no-JS result is a real section, so the acceptance criterion is met twice over — but
   the build should know a design can carry two.
5. **The seven roles contain no error colour.** ⚑ Invalid is drawn in `text` at 500 weight with a
   1.5 px `text` border and **no red anywhere** — A3·4's call, now in sixteen designs. It works, and
   it is worth saying that **a form category built on a seven-role palette cannot signal an error by
   colour** and must do it by weight, border and position instead. If a role is ever added, this is
   the category that changes.
6. **The focus ring is suppressed on the field.** ⚑ A6's 4 px accent ring would collide with a button
   10 px away, so the field takes a 1.5 px accent border instead — A2·5's documented departure, now
   in sixteen more places. **It is a real reduction in focus visibility** and is flagged as one.
7. **Ghost does expose a member count — the earlier finding was wrong.** ⚑ `{{total_members}}` and
   `{{total_paid_members}}` render pre-rounded strings, and "Join 3,400 readers" is expressible after
   all. **The refusal is withdrawn** and *Social proof* is offered on ten designs. Two constraints
   remain and are real: **the string is pre-rounded and cannot be reformatted**, and **there is no
   arithmetic** — no thresholds, no "over", no per-newsletter counts. 16 Quote's authored sentence is
   still the category's other answer, and the two are not offered in the same column.
8. **Paid-visibility newsletters cannot be subscribed to by address.** ⚑ *(new)* A `visibility: paid`
   newsletter accepts no free member, so a form that takes an address for one is collecting silence.
   10 and 15 route to Portal signup, gated on `@site.paid_members_enabled` — but **there is no theme
   API for "which tier grants this newsletter"**, so the route is Portal's generic signup rather than
   a specific plan. **A site with paid letters and Stripe switched off is a real dead end**: the badge
   says Members and the ordinary form is all there is.

**Repeated from A21 and A26–A29 and still open:** a section cannot know what precedes it on the
route. It matters more here — **a page can carry a newsletter section, A3·4's footer band and
A22·14's slide-in card at once**, and nothing in the system stops a reader being asked three times on
one page. **Member visibility helps and does not solve it** — it hides a section from an audience,
not from its neighbours. No section can detect the others, so this is a route-level warning the
editor would have to raise.

---

## Component inventory

Cumulative. Reused components are listed with the category that set them.

| Component | What it is | First set |
|---|---|---|
| Eyebrow | 13 px uppercase tracked .08em in `text-muted` | A1·1 |
| Primary button · ghost action | Accent fill 14–15/600 at 44–46 px; carried-colour fill on a band | A1·1, A6·5 |
| Icon button | 32–44 px box at the pack radius, bare or outlined | A1·14 |
| Focus ring | 4 px accent ring; **suppressed on the field**, which takes a 1.5 px border | A6, A2·5 |
| Striped image plate | The placeholder and its mono crop caption | A1 |
| Content box and padding ladder | 1,296 on 72 · 754 on 40 · 350 on 20; 64 · 96 · 132 | A17 |
| On-contrast derivation | Every colour on a band from two `contrast` tokens | A17·7 |
| Surface card | Radius token, `md` shadow in light, hairline in dark | A19·3 |
| Surface plane | Surface + hairline + `md` shadow; flat in dark | A26·3, A27·4 |
| Warm scrim | Warm dark gradient, strongest at the foot, white over it | A20·13 |
| Thumb row | 88 × 66 at 4:3, title 17 clamped two, date 13 muted | A18·2 |
| Archive meta line | 14 px muted items separated by ·, absent items dropped with their separators | A29·12 |
| Single quote | 28 px heading-font line, no marks drawn, attribution beneath | A8·1 |
| Reasons list | 1–3 authored lines, ≤ 40 ch, with its repeater — **and, since A22, an optional icon slot per line** | A6·11 |
| Missing-image vocabulary | Reflow · Plate · Hand off | A19 |
| Universal trio | Background role · Vertical spacing · Top divider, outside every design's list | P0·8 (library-wide) |
| Inline text toolbar · Link popover | Five actions over any selection; Ghost-aware target picker with new-tab and rel | P0·1 |
| Icon slot · Icon Picker · Button icon | The only place an icon can exist; Tabler grid; before/after a button label | P0·2 |
| Authored item list · Ghost-sourced list card | Drag rows, overflow, Add-with-content, range line; "From Ghost" read-only rows | P0·3 |
| Populate-from panel | Source · Filter · Count · Order · meta chips, with tag/author/hand-picked states | P0·5 |
| State switcher | The State pill in the canvas chrome, beside View as | P0·6 |
| **The form row** | **Visually-hidden label, 46 px field, 46 px button 10 px apart, 13 px note under** | **A3·4 — carried verbatim** |
| **The seven form states** | **Empty · focus · invalid · submitting · done · subscribed · members-off, at one height** | **A22 — extending A3·4's four** |
| **The stacked form** | **Field and button 48 px each, 8 px apart, field text 16 — the ≤ 767 geometry** | **A22** |
| **The subscribed line** | **"You are subscribed" + a link to `#/portal/account/newsletters`, in the form's slot** | **A22** |
| **The button-as-link** | **The members-off substitution — and, since this pass, the paid-only Portal route** | **A22** |
| **Newsletter row** | **20 px checkbox, name 17, description 14 muted, the whole 56 px row a label** | **A22·10** |
| **Newsletter card** | **Generated meta line, name 26, description, its own stacked form** | **A22·15** |
| **Generated newsletter meta** | **"Free · weekly" / "Members · twice a month", read from visibility and cadence, never typed** | **A22·15** |
| **Members badge** | **The generated meta reduced to one word, in a row or a meta line, inside the accessible name** | **A22·10, A22·12 — new in this pass** |
| **Member-count proof line** | **One muted 13 px line, `{{total_members}}` pre-rounded, template edited around the number** | **A22 — new in this pass** |
| **The Newsletter source group** | **Six shared rows: Which newsletter · Ask for a name · Signed-in subscriber · Member visibility · Posts to (read-only) · Members disabled** | **A22 — new in this pass** |
| **Ghost's form contract** | **`data-members-form` · `data-members-email` · `data-members-name`, with the native POST as the floor** | **A22 — new in this pass** |

---

## Reconciliation notes

**Frames changed in this pass — seventeen, and every one of them.** `A22-0 Category Proof` (the
patch paragraph, the category-wide list, the `imageFocus` row in the field table, and the stress
frame's "Padding: Compact" now reading "Vertical spacing: Compact") and **all sixteen design frames**:
`A22-1 Inline Row` · `A22-2 Card` · `A22-3 Split` · `A22-4 Contrast Band` · `A22-5 Panel` ·
`A22-6 Image Split` · `A22-7 Cover` · `A22-8 Big Type` · `A22-9 Slim Bar` · `A22-10 Choice` ·
`A22-11 Reasons` · `A22-12 Issue Preview` · `A22-13 Boxed` · `A22-14 Slide-in Card` ·
`A22-15 Two Up` · `A22-16 Quote`. Every one gained the universal trio outside its list, the
`Member visibility` row inside the source group, an **EDITING · THE P0 PRIMITIVES** block, a
**BEHAVIOUR · GHOST'S FORM CONTRACT** block, a corrected control count in its header, footer and
spec card, and a **⚑ RECONCILED** card at the foot of its control panel.

**Section frames redrawn — five, and only where an item changed visible content.** `A22-1`'s states
frame gained the member-count swatch · `A22-10`'s rows gained the **Members** badge and its states
frame a ticked-paid-letter state · `A22-11`'s desktop frame gained the *Reason marks: Icons* example ·
`A22-12`'s meta line gained the badge · `A22-15`'s paid card lost its field to the Portal route, in
all four viewport frames. **Every frame's context footer strip changed one phrase** — "Published with
Ghost" to **"Built with Inflozo"**.

**Each panel's "What this panel settles" card was swept, not just its opening count.** Claims the pass
reversed are corrected in place and the reversed ones are kept as withdrawals: 11's cut "icon set" now
reads as withdrawn, 6 and 7's "focal point is a field, not a control" likewise, 1, 3 and 8's cut
"ground value" now reads "a ground value of its own" against the universal Background role, "the four
form states" reads seven with P0·6 named, 12's "no Add and no Remove" carries its Hand-picked
exception, and every card's enumeration of the source group now names **who sees the section at all**.
The cards are the panels' own prose, and the panel is the authority — leaving them stale would have
overridden this document.

Then, one line each, where this pass and the category's own earlier rulings disagreed:

- **The subscriber-count refusal is withdrawn.** The spec refused a count line on the finding that
  "Ghost exposes no member count to a theme". `{{total_members}}` and `{{total_paid_members}}` exist
  and render pre-rounded strings; finding 7 is rewritten rather than deleted, so the wrong reason
  stays visible next to the right one.
- **Social proof is offered on ten designs, not sixteen.** The patch named 1–8, 13 and 16 and the
  panels follow it exactly; 9, 10, 11, 12, 14 and 15 say in their own words why they have no line for
  it. That is the patch's list, not a judgement of ours.
- **"No icons at any value" is withdrawn on 11 Reasons.** The design was specified with icons refused
  outright; *Reason marks: Icons* now exists and each line carries one P0·2 slot. The old ruling's
  reason — that a mark should not compete with the line — survives as the default (Numbers).
- **"Pre-ticked: None disabled" is withdrawn on 10 Choice.** The value is enabled and *The first*
  remains the drawn default; the panel now names *All* as the consent anti-pattern rather than
  disabling the honest option.
- **`imageFocus` was "a field, not a control" and is now both.** 7 Cover's stored field is a panel row
  and an Image Picker popover row, and 6 Image Split gained the same. Rule 10 made the old ruling
  untenable: a field with no UI is unreachable.
- **12 Issue Preview's bespoke source is gone.** *How many issues* left the design's own control list
  for the P0·5 panel's Count, which drops the design's count from six controls to five. The panel's
  **meta chips are deliberately not drawn** because the design's *Issue meta* enum already is that
  control — the same call A17 and A18 made, recorded rather than repeated silently.
- **"Members-only posts included with no lock or badge" is withdrawn.** They are badged. No lock is
  drawn — the row still links to a post the reader may not be able to read, and that is Ghost's
  paywall to answer, not this section's.
- **Background role is locked on five designs.** 4 (Contrast) and 7 (Image) are the patch's own
  example. 5, 6 and 10 are ours: the plane in each *is* the ground, and leaving the role free would
  have let a universal row turn one design into another. The reason is shown in the row, and this is
  the largest invention in the pass.
- **The whole trio is locked on 14 Slide-in Card.** The patch says every placeable section carries the
  trio; 14 is placeable but not in the flow, so all three rows are locked with the reason rather than
  drawn as controls that would do nothing. Recorded as a departure, not presented as compliance.
- **9 Slim Bar keeps four controls, below the old 4–7 norm.** Retiring *Ground* into Background role
  took it from five to four, and nothing was invented to make the number look better.
- **Two spacing ladders keep separate names on five designs.** Card padding (2, 15), Box padding (13),
  Band padding (4), Strip padding (9) and Height (7) are not the space around a section, and merging
  them into Vertical spacing would have lost a real distinction. The patch permits exactly this and
  the panels say which ladder is which.
- **The paid-only route is Portal's generic signup.** There is no theme API for "which tier grants
  this newsletter", so a reader is sent to signup rather than to the plan that would deliver the
  letter. Named in finding 8 rather than papered over with a plan picker the platform cannot support.
- **A paid letter on a site with Stripe off is still a dead end.** The gate on
  `@site.paid_members_enabled` prevents a broken Portal link; it cannot make the letter deliverable.
  The badge says Members and the ordinary form is all there is.
- **No module was coined and no Preview control was removed.** A22 declares `member-form` in all
  sixteen and `slide-in-card` in 14; the Portal route is a link and the badge, meta line and count are
  template strings. There was no Preview row to delete — the category refused per-state controls at
  the outset, which is why P0·6's state pill needed no argument here.
