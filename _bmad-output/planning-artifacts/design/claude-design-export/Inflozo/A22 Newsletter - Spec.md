# A22 Newsletter / Subscribe — written specification

16 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation patch, 25 August 2026** ·
**newsletter patch, 28 August 2026** · **declarations standardised, 31 August 2026** ·
**pass two, 1 September 2026**

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

**Newsletter patch (28 August 2026).** Four claims in this category were wrong about what Ghost can do, and
all four are corrected here and on all seventeen frames. **A subscribe form cannot work without
JavaScript** — Ghost's signup endpoint refuses a plain form submission, so every design replaces the form
with the designed no-JavaScript notice and the "posts natively" floor is withdrawn. **A theme is never told
which newsletters a member has** — "You are subscribed" becomes **"Signed in"**. **A newsletter has no
cadence field** — the generated meta line's "weekly" and "twice a month" are deleted, and what is left is
**one word — "Members" — drawn only where `visibility` is `paid`** ⚑ *(the owner's ruling, 28 August
2026)*; a letter any member receives carries no word at all. **"Not public" is not the same as paid** — the Members badge is drawn only
where a newsletter's `visibility` is `paid`, and 10 Choice's tick-to-swap Portal field is replaced by a
static members link. Every subscribe ask also carries its two conditional lines: it does not render where
the connected site cannot support it, and a button that opens Ghost's own sign-up pop-up does nothing with
JavaScript off. **Nothing was renumbered.**

**Pass two (this document's current state), 1 September 2026.** Five rules were added library-wide and read
against all sixteen designs; **three of them changed something here.** *A control switched off by another is
greyed, with the reason beside it* found **five rows that went on accepting a value the design would not
honour** — 3 Split's Field at *Wide head*, 9 Slim Bar's custom label at *Label: Newsletter name*, 10 Choice's
Members badge and 15 Two Up's Card meta on a site with no paid letter, and 16 Quote's heading at *Quote size:
Large* — and each is now drawn greyed with its reason at the control and its fallback named. The work list's
own item, *a feed with nothing in it shows its designed empty state*, is written into **12 Issue Preview**,
which reverses two of that design's rulings: the rows, label and rule used to go absent together, and the
explanation used to sit in the editor only. **It is never hidden and never back-filled with whatever is
newest** ⚑, and two further rows grey there because of it — Archive link and the Data group's *When nothing
matches*. *The Remove button never greys out* and *a count that picks between drawn layouts is a named set*
found their subjects already compliant; *avatars with no photograph show initials* has **no subject at all**
— A22 renders no person; *a design may declare the width below which its script runs* found **no design
declaring one**. **Neither Ghost finding of 31 August reaches this category**: no design reads a
feature-image caption and none reads a comment count. The **Open questions** housekeeping is in
**Patch notes — pass two** at the end. **Nothing was renumbered, no control was added, removed or renamed,
and no value, default, layout, type scale, colour pack or spacing step changed.**

**[Free] designs:** 1 Inline Row · 13 Boxed

*(Shortlisted, recommended and **confirmed by the owner on 28 August 2026**.)*

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
`data-members-name` when *Ask for a name* is on. **And the newsletter is chosen in the markup too** ⚑
*(newsletter patch, checked against Ghost's own theme documentation on 28 August 2026)*:
`data-members-newsletter` on an input, **its value the newsletter's `name`, not its `id`** — hidden where
the section posts to one letter (1–9, 11–14, 16), a **checkbox per letter in 10 Choice**, one hidden input
per card in 15 Two Up. Ghost's documented `{{#get "newsletters"}}` loop is exactly 10 Choice's arrangement,
so the design was right and the contract was written short. **Errors surface in a child element carrying
`data-members-error`** ⚑, which is the invalid state's own slot. Ghost's members script drives loading,
success and error; **`member-form`'s only job is mapping those three onto the designed seven**. **There is no no-JavaScript floor** ⚑
*(corrected in the newsletter patch)*: tested against both live Ghost servers, the magic-link endpoint
**refuses a plain form submission**, so a scriptless field would take an address and lose it. Every design
therefore **replaces the form with P0·4's no-JavaScript notice** at the form row's own height — *"Signing up
needs JavaScript — turn it on to subscribe."*, the note kept beneath it, no field and no button — and the
notice is **plain text, not an alert** ⚑. **The sent, error and loading states are untouched.** **The ask is
also conditional on the connected site** ⚑: it does not render with self-signup switched off or members
disabled, a paid ask needs a payment provider connected, and **any button that opens Ghost's own sign-up
pop-up does nothing with JavaScript off**. Ghost sends its own confirmation and answers an
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
**A paid newsletter is not subscribable by address** ⚑: where the target letter's `visibility` is
`paid`, the ask is a **link to Ghost's sign-up** (`#/portal/signup`), gated on
`@site.paid_members_enabled`, and the letter carries a **Members** badge. Collecting an address that cannot
receive the letter is subscribing a reader into silence, and that was the defect. **The condition is
`paid`, not "not public"** ⚑ *(corrected in the newsletter patch)* — Ghost gives a newsletter no
`public` value, so the old condition badged nearly every letter and told a reader nothing. **In 10 Choice
a paid letter carries no checkbox at all** ⚑ *(corrected)*: the row draws the badge and a **static** members
link, rendered at the server, so nothing swaps when a reader ticks anything and no behaviour is needed for
it. **In 15 Two Up the paid card's form is a link for the same reason**, also server-rendered. **The link
opens Ghost's own sign-up pop-up: with JavaScript off, nothing happens** ⚑, and it does not render where the
site has self-signup off or no payment provider connected.

**4 · The already-subscribed signed-in member.** **The form is never drawn to them** ⚑ at the shared
control's default. In its place, at identical height: **"Signed in"** ⚑ *(corrected in the newsletter
patch — the line read "You are subscribed" and named which letter and where it lands, and **Ghost does not
tell a theme which newsletters a member has**, so no design can say it)*, the signed-in address beneath it,
and **a link to `#/portal/account/newsletters`** ⚑ — Ghost's own
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
  the badge, the meta line and the member count are template strings. **The newsletter patch coined nothing
  either** — the no-JavaScript notice is P0·4's, drawn markup with no behaviour, and **every design with a
  form draws it in place of the form** ⚑, the sent, error and loading states unchanged.
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
  visually-hidden "Email address" label, the generated meta line's one word ("Members" —
  **"Free", "weekly" and "twice a month" are all deleted** ⚑, the line being drawn only on a paid letter),
  the no-JavaScript notice's sentence and the **Members** badge. The rule the patch set — no fixed English
  visitor-facing string ships — is met either by a field with a default or by the catalogue, and this
  list says which for every string in the category.

### The roster

| # | Design | Tuple | Ctl | Module beyond `member-form` |
|---|---|---|---|---|
| 1 | Inline Row **[Free]** | `form · none · page · none · none · field and button in one centred row` | 6 | — |
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
| 13 | Boxed **[Free]** | `form · box · page · none · none · the ask in a hairline box` | 5 | — |
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
  and in 10's Members badge — **both only where that value is `paid`** ⚑, and **the cadence half of the
  meta line is deleted**, Ghost's newsletters carrying no cadence field.
- **Ghost's posts** — 12 Issue Preview alone, and since this pass **through the shared P0·5 panel**.
  **No Add and no Remove** ⚑ except at *Hand-picked*, where the picked list is a list of references
  with P0·3's controls (drag to reorder, ✕ never disabled, Add pre-filled with the next newest post)
  and **Count and Order disable, the list being both**. Three, four or six by the panel's Count.
  **0** → **the designed empty state** ⚑ *(pass two)*: the label and the rule hold and two fixed lines stand
  where the rows were — never hidden, and never back-filled with the newest posts. **1** → one row at
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
| `subscribedText` | text | opt | 90 ch | all 16 | **The signed-in line** ⚑ — default "Signed in"; it names the signed-in address and **claims no subscription**, Ghost not telling a theme which letters a member takes |
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
| `membersBadge` | enum | req | — | 10, 12 | Off · On — **generated, never typed** ⚑. **10: only where a newsletter's `visibility` is `paid`** ⚑ *(corrected)*. **12: where a post's `visibility` is not `public`** — a real gate on a post, and unchanged |
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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Alignment | Centred · Left |
   | Heading size | Regular · Large · Display (**Display disabled at Field width: Wide**) |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Below the field | Note · Nothing |
   | Blurb | Show · Hide |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Six.**
7. **Data.** Posts to Ghost's members endpoint with the contract attributes. **0** — no repeating
   unit; the count that matters is the newsletter count. **1 newsletter** is the design. **many** →
   posts to the site default and **the sidebar names it** ⚑, with 10 and 15 named as the designs that
   let a reader pick. **Members off** → the field is replaced by the button alone, linking to the
   subscribe page; placeholder and note kept, **the proof line dropped with the form** ⚑.
8. **Empty.** No eyebrow, blurb or note → each absent, the block closing up ⚑. **No heading is
   allowed** and the `<form>` then takes `aria-label="Subscribe to Orbit Weekly"`. Placeholder and
   button label fall back to defaults rather than rendering empty ⚑. **`socialProof: Member count`
   with members off draws nothing** — not a zero ⚑.
9. **Module.** `member-form`, edit-safe. **The registry's "posts natively to Ghost's members endpoint"
   line is withdrawn** ⚑ *(newsletter patch)* — Ghost's signup endpoint refuses a plain form submission, so
   a scriptless field would take an address and lose it. Nothing of the form survives without script.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is the category's reference drawing** — Heading size: **Display** greyed at Field width: Wide, struck, with the reason at the control and Large named as the fallback. Drawn this way since the reconciliation patch, so **the rule changed nothing here**, and the other four rows are independent of one another. No other rule of the pass has a subject: this design renders no person, owns no list, counts nothing, declares no script width and reads neither a caption nor a comment count.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Card padding | Compact 48 · Comfortable 64 · Spacious 88 |
   | Card | Raised · Flat (**dark forces Flat**) |
   | Card width | Narrow 880 · Medium 1104 · Full 1296 |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Alignment | Centred · Left |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Six.**
7. **Data.** As 1. **Members off** → the card renders and the field inside it is replaced ⚑; the card
   is the design and is not withdrawn.
8. **Empty.** No blurb → a shorter card, **nothing reserved** ⚑. No note → 22 px less. **Never an
   empty card**: with no heading, no blurb and no note the panel names 1 Inline Row ⚑.
9. **Module.** `member-form`. The card is a token substitution in CSS and declares nothing.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no case of its own.** The five rows are independent; the only cross-row behaviour is **dark forcing Flat**, which is a mode honoured in light and already disclosed in the row, not one control switching another off. Nothing else in the pass has a subject here.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Split | Even · Wide head · Wide form (620·580, 720·480, 520·680 **on a fixed 96 px gutter**) |
   | Form side | Right · Left |
   | Field | In a row · Stacked; **In a row is greyed at Split: Wide head** — a 720 px head leaves 480 for the form and the row will not hold — with the reason at the control and Stacked named as the fallback ⚑ *(changed in pass two: the row used to accept the value)* |
   | Heading size | Regular · Large (**no Display value**) |
   | Below the field | Note · Nothing |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Six.**
7. **Data.** As 1. **Members off** → the right column holds the button-as-link and the head is
   untouched ⚑.
8. **Empty.** No blurb → the head is an eyebrow and a heading and **the form column does not move
   up** ⚑. No note → the form column loses 22 px.
9. **Module.** `member-form`.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
10. **A11y.** Heading **h2**. **DOM order is head then form at every width and at either Form side**
    ⚑. Light: heading 13.4:1, blurb 5.1:1.
    **Repeating items** — none.
    **Flagged ⚑** the collapse at 834 · the head top-aligned by rule · the fixed 96 gutter · Stacked
    forced at Wide head · no Display heading value · grid placement rather than source order.

**Reconciled.** Six of its own — **Social proof** ⚑ new, sitting under the note in the form column,
not under the head. **Padding retired into Vertical spacing.** Background role moves the ground
behind **both** columns, never one ⚑. Source group, form contract, editing, footer strip.

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is a change.** *Stacked forced at Wide head* left the Field row going on accepting **In a row** while the design drew Stacked; the value is now struck with the reason at the control and Stacked named as the fallback ⚑. **Heading size' absent Display value stays a narrowing with its reason**, not a switch.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Band padding | Compact 48 · Comfortable 72 · Spacious 104 (**inside the band**) |
   | Alignment | Centred · Left |
   | Heading size | Regular · Large · Display |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Band edges | Full bleed · Page margin |
   | Blurb | Show · Hide |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Seven.**
7. **Data.** As 1. **Members off** → the band renders with the button-as-link in the carried colour ⚑.
8. **Empty.** No blurb → the band shortens, **no minimum height** ⚑. With neither heading nor blurb
   the band is a 46 px row inside its padding and the panel names 9 Slim Bar ⚑.
9. **Module.** `member-form`.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one switch and two locks, all three drawn.** Top divider's **Line** and **Fade** grey at *Band edges: Full bleed*, with the reason at the control. **Background role's Contrast lock and Vertical spacing resolving 0** stay locks — the rule's neighbouring case, greyed with a reason rather than hidden.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Plane | Raised · Flat |
   | Alignment | Left · Centred |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Blurb | Show · Hide |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.** **Internal padding stays fixed at 56 × 64** ⚑ and is not a control; the space *around*
   the plane is Vertical spacing.
7. **Data.** As 1. **Members off** → the plane renders and holds the button-as-link ⚑.
8. **Empty.** No blurb → a shorter plane ⚑. **The plane renders whatever is inside it and is never
   drawn empty**; with no heading and no blurb the panel names 9 Slim Bar ⚑.
9. **Module.** `member-form`. The plane declares nothing.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
10. **A11y.** Heading **h2**. **The plane is decorative: no role, no label** ⚑. Light: heading 14.0:1,
    blurb 5.3:1; dark 13.1:1.
    **Repeating items** — none.
    **Flagged ⚑** fixed internal padding · plane-is-a-ground · five controls rather than six · the low
    heading ladder · Left as the default alignment · the 620 blurb measure.

**Reconciled.** Five of its own — **Social proof** ⚑ new. **Background role is locked at Surface** ⚑:
the raised plane is this design's ground and its identity, and *Plane: Raised · Flat* is its
treatment, not its role. **Padding retired into Vertical spacing** (around the plane). Source group,
form contract, editing, footer strip.

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no case of its own.** One lock — Background role at Surface, greyed with its reason — and no row accepting a value this design ignores. The plane's fixed internal padding is **an absence, not a disablement**, and is left as it was.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Picture side | Left · Right |
   | Split | Even · Wide picture · Wide words |
   | Picture treatment | Bleed · Inset |
   | Image focus | Centre · Top · Bottom |
   | Plane | Raised · Flat |
   | Field | Stacked · In a row; **In a row is greyed at Split: Wide picture** — the words take 388 and the row will not hold — with the reason at the control and Stacked named as the fallback |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Seven.**
7. **Data.** As 1. **No image authored → hands off to 5 Panel** ⚑, drawn in place, flagged in the
   editor, invisible on the site. **Members off** → the picture stays and the words half holds the
   button-as-link ⚑.
8. **Empty.** No blurb → the words column shortens and **the picture shortens with it** at 1440 ⚑.
   No alt → the editor asks and the picture publishes with `alt=""` rather than a guessed sentence ⚑.
9. **Module.** `member-form`. The picture is a CSS background on a real `{{img_url}}`, positioned
   from `imageFocus`.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, already drawn and now reasoned at the control** — Field: **In a row** greys at *Split: Wide picture*. **Picture side being ignored below 767 is a width, not a control**, and stays ungreyed. **The hand-off to 5 Panel is untouched** — no rule in this pass names hand-offs, and a deliberate sentence reverted silently is worse than one left standing.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Height | Short · Standard · Tall (**a minimum, not a crop**) |
   | Scrim | Light · Medium · Strong; **Light is greyed against a light picture**, measured on the bottom third where the form sits, with Medium named as the lightest value that passes. **The measurement runs in the editor when the picture is chosen, not on the site** ⚑ *(stated in pass two — CSS cannot see content)* |
   | Image focus | Centre · Top · Bottom |
   | Content position | Centre · Bottom |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Band edges | Full bleed · Page margin |
   | Blurb | Show · Hide |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Eight.**
7. **Data.** As 1. **No image at any width → hands off to 4 Contrast Band** ⚑. **Members off** → the
   picture and the head render with the button-as-link in white ⚑.
8. **Empty.** No blurb → the band shortens toward its floor and stops there ⚑. **No background image →
   the hand-off is the empty state** ⚑.
9. **Module.** `member-form`. The image is a CSS background positioned from `imageFocus` and the
   scrim a gradient; neither is measured.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **two cases.** Scrim: **Light** greys against a light picture, measured on the bottom third where the form sits — and **the measurement runs in the editor when the picture is chosen, not on the site** ⚑, because CSS cannot see content. **Top divider** greys at *Full bleed*, as on 4. **The hand-off to 4 is untouched**, for the reason given on 6.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Heading scale | Display · Huge |
   | Rule under the heading | Show · Hide |
   | Field width | Narrow 320 · Medium 400 · Wide 480 (**Wide is the default**) |
   | Eyebrow | Show · Hide (**hidden by default at Huge**) |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious (**Compact advised at Huge**) |
   | Top divider (universal) | None · Line · Fade |

   **Five.** **Vertical spacing: Compact is advised at Huge** ⚑.
7. **Data.** As 1. **Members off** → the heading and rule render with the button-as-link beneath ⚑.
8. **Empty.** No eyebrow → the heading rises to the spacing ⚑. **No heading is not a supported
   state** ⚑ — the display line is the design.
9. **Module.** `member-form`.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no case of its own, and one deliberately not made.** **Vertical spacing: Compact at Huge stays an advisory** — both values are honoured, so a warning is the honest shape and greying would refuse a legitimate choice. *Eyebrow hidden by default at Huge* is a default, not a switch.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Strip padding | Compact 16 · Comfortable 24 · Spacious 36 (**inside the strip**) |
   | Rules | Above and below · Below only · None (**None raises the padding**) |
   | Field width | Narrow 320 · Medium 400 (**no Wide value**) |
   | Label | Newsletter name · Custom. **The custom-label text row is greyed at Newsletter name** — the strip draws the letter's own name from Ghost — with the authored text kept and *Custom* named as the way to reach it ⚑ *(changed in pass two)* |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Four.**
7. **Data.** As 1, plus the newsletter's `name`. **Members off** → the strip holds the label and the
   button-as-link ⚑.
8. **Empty.** No label at *Custom* → falls back to the newsletter name ⚑. **The strip never renders
   empty**: its floor is a label and a field.
9. **Module.** `member-form`.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is a change.** The **custom-label text row greys at *Label: Newsletter name***, where authored text was stored and never drawn, with the reason at the control, the text kept, and *Custom* named as the way to reach it ⚑. **The absent Wide field value and the two locked universal rows** stay a narrowing and two locks, each with its reason drawn.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Plane | Raised · Flat |
   | Row detail | Name and description · Name only |
   | Members badge | Off · On; **greyed where no newsletter on the site's `visibility` is `paid`** — the badge would have nothing to draw — and it returns with the first paid letter ⚑ *(changed in pass two)* |
   | Pre-ticked | All · The first · None (**None enabled in this pass**) |
   | Dividers | Hairline · None |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Six.**
7. **Data.** `{{#get "newsletters"}}` ⚑ — **the whole set, in Ghost's own order, with no limit
   control**. **0** not reachable ⚑. **1** → the rows are not drawn and the panel names 5 Panel
   without switching ⚑. **many** → two to four is the design; five or more grows the plane and
   scrolls the page, never the section ⚑. **A letter whose `visibility` is `paid` draws the
   Members badge** ⚑ *(corrected in the newsletter patch — the condition was "not public", and Ghost gives a
   newsletter no `public` value, so nearly every letter was badged)*, **and that letter carries no checkbox
   at all** ⚑ *(corrected)*: the row draws the badge and a **static** link to `#/portal/signup`, gated on
   `@site.paid_members_enabled`, rendered at the server. **Nothing swaps when a reader ticks anything** —
   the old design swapped the field for the link on tick, which needed behaviour the category does not
   declare and left a scriptless reader with a tick that did nothing. **With paid members off the ordinary
   form stays** and the badge is the only signal ⚑. **The link opens Ghost's own sign-up pop-up: with
   JavaScript off, nothing happens** ⚑. **Members off** → **the whole design
   goes** ⚑, which is why this design defaults to *Hide the section*.
8. **Empty.** A newsletter with no description → **that row draws Name only** and falls to 44 px ⚑.
   **Never a placeholder row and never an empty checkbox list** ⚑. No paid letter → the badge has nothing to draw and hides
   itself ⚑, and every row is an ordinary checkbox.
9. **Module.** `member-form`. **"Without JS the checkboxes still post with the address" is withdrawn** ⚑
   *(newsletter patch)* — the endpoint refuses a plain submission, so the field and the checkbox rows are
   both replaced by the notice; this design loses what every other design loses. **The members link on a
   paid row is static markup** and needs no module, but **it opens Ghost's own sign-up pop-up, which needs
   JavaScript** ⚑.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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
and *All* is the consent anti-pattern this category's own notes worry about. **A paid letter carries no
checkbox and a static members link** ⚑ *(newsletter patch, replacing the tick-to-swap Portal field)*, gated
on `@site.paid_members_enabled`, and **the badge is drawn only where `visibility` is `paid`** ⚑. **Background role is
locked at Surface** ⚑ — the plane is the ground; the rows are what separate this from 5.
**Padding retired into Vertical spacing.** **Two frames redrawn**: the members-only row now carries
the badge, and the states frame gained a ticked-paid-letter state. Source group, form contract,
editing (names, descriptions and visibility say "Edit in Ghost"), footer strip.

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is a change.** **Members badge: On greys where no newsletter on the site is `paid`** ⚑ — since the badge became paid-only the value rendered nothing at all — and a newsletter's visibility is a site-level fact, so the row can be read before the page is drawn. **Pre-ticked: None stays enabled** and **Background role stays locked at Surface**, both with their reasons visible. *A feed with nothing in it shows its designed empty state*: **no subject** — Ghost ships every site one newsletter and it cannot be deleted, so the list is never empty.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Split | Even · Wide head · Wide reasons |
   | Reasons side | Right · Left |
   | Reason marks | Numbers · Rules only · **Icons** |
   | Reason size | Regular · Large |
   | Below the field | Note · Nothing |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.** The Reasons repeater follows and is not counted.
7. **Data.** As 1; the reasons are authored, not read. **0 reasons** → the right column is empty and
   the panel names 3 Split without switching ⚑. **1** → one line, its mark and no rule above it ⚑.
   **many** → three is the ceiling; Add disables there with its reason readable.
8. **Empty.** **Never a blank reason row** ⚑ — Add produces a line carrying a fact. No blurb → the
   form rises in its column and the reasons do not move ⚑. **An empty icon slot renders nothing**
   and the line closes up to its text ⚑.
9. **Module.** `member-form`. The reasons are static markup.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no case of its own, and one deliberately not made** — the per-line icon slots appear at *Reason marks: Icons* and nowhere else, and **a mode's own controls were never switched off**, so they are revealed rather than greyed and the reason is said once at Reason marks. *The Remove button never greys out*: **the category's one subject, and it was already compliant** — ✕ is live on every row, and at one line it produces the floor and the reason as one sentence under the list. *A feed with nothing in it shows its designed empty state*: **not a feed** — the reasons are authored and the floor is one line.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Issue layout | Across · Listed |
   | Thumbnails | Show · Hide |
   | Issue meta | Date · Date and reading time · Off |
   | Members badge | Off · On. **Not greyed on an all-public site** ⚑ — this badge reads a *post's* visibility, which changes request by request, where 10 Choice's reads a site-level fact *(stated in pass two)* |
   | Archive link | Show · Hide; **greyed while the feed is empty** — there is nothing in the archive to link to — returning with the first issue ⚑ *(new in pass two)* |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.** **The Data group is P0·5's panel** and is not counted.
7. **Data.** **The shared P0·5 "Populate from…" panel** ⚑ *(new in this pass, replacing this design's
   bespoke source)*: **Source** *Static (authored) · From posts* with **Static disabled** — Ghost has
   no newsletter-issue object, so there is nothing to author — then **Filter** *Latest · Featured ·
   **By tag** · By author · Hand-picked*, **Tag** (live-searched, name + count, single pick),
   **Count** *Three · Four · Six* and **Order** *Newest · Oldest*. **The default is By tag:
   `newsletter`** ⚑ — the real fix for the no-issue-object finding, because a publication that tags
   its letters can say which posts they are, and **Hand-picked curates the three best issues** with
   P0·3's row controls, Count and Order disabling there. **P0·5's meta chips are not drawn twice** ⚑
   — this design's *Issue meta* enum is the meta control. Drafts, scheduled posts and pages are
   excluded; **members-only posts are included and now badged** ⚑. **0** → **the designed empty state** ⚑
   *(written in pass two, reversing "rule, label and rows absent")*: the label and the rule hold, two fixed
   lines stand where the rows were at one row's height, and **the feed is never back-filled with the newest
   posts** — the Data group's *When nothing matches* greys its back-fill value here ⚑.
   **1** → one row at the grid's left, no stretch ⚑.
   **many** → wraps at four and six. **Members off** → the issues stay and the field becomes the
   button-as-link ⚑.
8. **Empty.** A post with no feature image → **that row draws as Thumbnails: Hide** ⚑ and the rows
   around it are unchanged. **No placeholder row and no empty thumbnail** ⚑ — a row stands for a post
   that exists. **A feed with nothing in it draws its designed empty state** ⚑ *(written in pass two,
   and it reverses two rulings in this entry)*: the **label and the rule hold**, and where the rows were
   there is one line reading **"No issues yet"** at 20 px in the heading face and one beneath it reading
   **"The first letter will appear here once it has gone out."** at 15 px muted, the pair occupying
   **one row's height** — 96 px at 1440, the listed row's own height at 834 and 390 — so a page that had
   three issues and now has none does not jump. **It is never hidden**, on the site as much as on canvas:
   a reader can tell an empty archive from a broken page, and an editor can see the section they placed.
   **It is never back-filled with whatever is newest** ⚑ — the Data group's *When nothing matches* greys
   its back-fill value here, because a "recent issues" list quietly showing the three newest posts is a
   lie about what went out. **The archive link is not drawn while the feed is empty** and its row greys
   with that reason ⚑. **Both lines are fixed strings in the translation catalogue** ⚑ — no new content
   field and no new control; whether a publication may author them is an **open question**, not a
   decision made here. **What is withdrawn:** the old text made the rows, the label and the rule *absent
   together* and put the explanation in the editor's Data group rather than on the page, and it refused a
   "no issues yet" chip. **That refusal survives in its own scope** — no chip beside populated rows — and
   is withdrawn for the empty feed.
9. **Module.** `member-form`. The issue rows are server-rendered links; there is no `load-more` and no
   `infinite-scroll` here — the archive link is a real page.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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
**Members**. **This badge is on a post, not a newsletter** ⚑ *(newsletter patch)*: a post's `visibility`
does have a `public` value, so "not public" is a real gate here and the condition is unchanged — only
10 Choice's newsletter badge was wrong, and the two are no longer described as one rule. Source group, form contract, editing (post content says "Edit in Ghost"), footer strip.

**Patched · pass two, 1 September 2026.** *A feed with nothing in it shows its designed empty state*: **written here, and it reverses two of this entry's rulings** — §7's absent rule, label and rows, and §8's editor-only notice. The label and the rule hold, two fixed lines stand at one row's height, the state renders on the site as much as on canvas, and **the feed is never back-filled with the newest posts** ⚑. *A control switched off by another is greyed, with the reason beside it*: **two new greyed rows follow from it** — **Archive link** while the feed is empty, and the Data group's ***When nothing matches*** on its back-fill value ⚑ — while **Source: Static** keeps the greying it always had. **The Members badge is deliberately not greyed** ⚑: it badges posts, whose visibility changes request by request. *A count that picks between drawn layouts is a named set, not a number picker*: **Count is left exactly as drawn** and the reading is recorded as **open for the owner** rather than settled here. **Two things were not invented**: the empty state's strings are fixed and translated rather than authored, and Count is not converted in either direction.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Box padding | Compact 40 · Comfortable 56 · Spacious 76 |
   | Box width | Narrow 880 · Medium 1104 · Full 1296 |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Alignment | Centred · Left |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.**
7. **Data.** As 1. **Members off** → the box renders and holds the button-as-link ⚑.
8. **Empty.** No blurb → a shorter box ⚑. **Never an empty box**: the panel names 1 Inline Row ⚑.
9. **Module.** `member-form`. The box is a border.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no case of its own.** No lock, no narrowing and no row accepting a value this design ignores — and the hairline still thickens at no value.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Arrives | Halfway down the page · At the page foot · After twenty seconds (**never on load**) |
   | Corner | Bottom right · Bottom left |
   | Card width | Narrow 320 · Medium 380 · Wide 440 |
   | Card | Raised · Flat |
   | Blurb | Show · Hide |
   | Once dismissed | Not again this session · Not again for thirty days. **Both are kept and both are stored in a first-party cookie** ⚑ *(the owner's ruling, 1 September 2026)* — thirty days as a cookie with a thirty-day expiry, the session value as a **session cookie** that dies with the browser. **One name, one flag, no personal data and no third party**, and because a cookie is sent with the request the section reads it **server-side**: a dismissed card is **not rendered at all** ⚑ |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Six.**
7. **Data.** As 1. **Members off** → **the card does not render at all** ⚑. **A signed-in subscriber
   never sees it** ⚑, at either value of the shared control. **Member visibility applies as
   everywhere** — a publication that wants paid readers left alone sets it here rather than accepting
   a third ask on one page.
8. **Empty.** No blurb → the card falls to 168 px ⚑. **No heading is not supported** ⚑. No note → 20
   px less.
9. **Module.** **Two** ⚑ — `slide-in-card` and `member-form`, both edit-safe. **No-JS, quoted:**
   `slide-in-card` — "The card renders statically in the document flow near the page end rather than
   sliding in." `member-form` — **its registry line is withdrawn** ⚑; the endpoint refuses a plain
   form submission and the notice replaces the form. **Together: with script off the card renders statically
   at the page foot and carries the no-JavaScript notice where the form would be** ⚑ *(corrected in the
   newsletter patch — it said "with a working form in it", and there is no working form without script)*.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **no switch, three locks, and two width resolutions left ungreyed.** The **whole universal trio is locked** with its reason drawn, which is the rule's neighbouring case rather than the rule itself. **Corner and Card width: Wide resolve at ≤ 767 and are not greyed** — a width is not a control. *A design may declare the width below which its script runs*: **the one design in A22 that could, and it does not** — `slide-in-card` runs at 390 as at 1440, the card narrowing to 342 and staying in its corner, so there is no boundary to name and **its no-JavaScript line already describes both ends**: the card renders statically at the page foot, in the flow, with P0·4's notice where the form would be.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Cards across | Two · Three · Auto |
   | Card padding | Compact 24 · Comfortable 32 · Spacious 44 |
   | Card | Raised · Flat |
   | Card meta | Show · Hide (**generated, never typed**); **Show is greyed where no newsletter on the site's `visibility` is `paid`** — since the cadence half was deleted the line is one word drawn only on a paid letter, so it had nothing to draw ⚑ *(changed in pass two)* |
   | Description | Show · Hide |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.**
7. **Data.** `{{#get "newsletters"}}` in Ghost's own order ⚑. **0** not reachable ⚑. **1** → one card
   at the grid's left, no stretch; the panel names 2 Card ⚑. **2** → the design. **3** → three of 416;
   **4** → two rows of two; **5 or more** → the panel names 10 Choice ⚑. **A paid-only letter's card
   loses its field and its button links to Portal signup** ⚑ — `#/portal/signup`, gated on
   `@site.paid_members_enabled`; **with paid members off the ordinary form stays** and the meta line
   is the only signal ⚑. **Members off** → **the whole section goes** ⚑.
8. **Empty.** A newsletter with no description → **that card draws Description: Hide** and the grid
   equalises heights anyway ⚑. **Never an empty card and never a placeholder card** ⚑. A paid card at
   the Portal route is **shorter by the field's height** and the grid equalises ⚑.
9. **Module.** `member-form`, declared once and binding both forms ⚑. **"With script off both post
   natively and independently" is withdrawn** ⚑ *(newsletter patch)* — neither can, so **each card draws the
   notice in its own form's place**, independently, at the card's own height. The paid card's members link is
   static markup and needs no module; **it opens Ghost's sign-up, which needs JavaScript** ⚑.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is a change** — the twin of 10 Choice's. **Card meta: Show greys where no newsletter on the site is `paid`** ⚑: with the cadence half of the generated line deleted, the line is one word drawn only on a paid letter, and the value rendered nothing. **Card: Raised is overridden in dark** — a mode, not a switch. *A count that picks between drawn layouts is a named set*: **Cards across stays a named set**, every value having a drawn frame. *A feed with nothing in it*: **not a feed** — zero newsletters is unreachable.

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
6. **Controls.**

   | Control | Values |
   |---|---|
   | Quote size | Regular · Large. **At Large the heading row is greyed** — the quote takes the column and the line under the rule is dropped — **the authored text kept, not deleted** ⚑ *(changed in pass two: the field was stored and silently undrawn)* |
   | Rule under the quote | Show · Hide |
   | Field width | Narrow 320 · Medium 400 · Wide 480 |
   | Attribution | Name and detail · Name only |
   | Social proof | Off · Member count |
   | Background role (universal) | Background · Surface · Contrast |
   | Vertical spacing (universal) | Compact · Comfortable · Spacious |
   | Top divider (universal) | None · Line · Fade |

   **Five.**
7. **Data.** As 1 — **the quote is authored and nothing about it is read from Ghost** ⚑. **Members
   off** → the quote, rule and heading render with the button-as-link ⚑.
8. **Empty.** No quote → **the design is 1 Inline Row with a smaller heading** and the panel names it
   without switching ⚑; the rule goes with the quote. No attribution → **the quote stands
   unattributed** ⚑, which the editor flags as weak rather than blocking. No detail → the middot goes ⚑.
9. **Module.** `member-form`. The quote is static markup.
   **No-JS** ⚑ — the form is replaced by **P0·4's notice** at the form row's own height, no field and no
   button: *"Signing up needs JavaScript — turn it on to subscribe."*, the note kept beneath. **Sent, error
   and loading are untouched**, and the members-off substitution is a server one and holds either way.
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

**Patched · pass two, 1 September 2026.** *A control switched off by another is greyed, with the reason beside it*: **one case, and it is a change.** At ***Quote size: Large*** **the heading row greys**, where the authored line was stored and silently undrawn, **with the text kept rather than deleted** ⚑ — the rule's *never left accepting a value it will not honour*, applied to a content field rather than to a control. *Avatars with no photograph show initials*: **no subject, and the one place it might have had one is named** — the attribution draws **no portrait at any value**.

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
3. ~~**Dismissal memory is not in the registry.**~~ **SETTLED BY THE OWNER, 1 SEPTEMBER 2026: a
   first-party cookie, and both values keep it.** *Not again for thirty days* writes a cookie with a
   thirty-day expiry; *Not again this session* writes a **session cookie** that dies with the browser
   rather than resting on whatever the module remembers. **One name, one flag, no personal data, no third
   party**, and the section reads it **server-side**, so a dismissed card is **not rendered at all** ⚑ —
   the only reading that also holds with JavaScript off. `slide-in-card`'s registry entry still needs the
   sentence written into it, which is a registry job. *The original finding, for the record:*
   14 Slide-in Card offers *Not again this session*
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
   10 and 15 link to Portal signup, gated on `@site.paid_members_enabled` — but **there is no theme
   API for "which tier grants this newsletter"**, so the link is Portal's generic signup rather than
   a specific plan, **and it needs JavaScript to open**. **Corrected in the newsletter patch:** the badge
   condition is `paid` rather than "not public" — Ghost gives a newsletter no `public` value, so the old
   condition badged nearly every letter — and 10's field no longer swaps for the link on a tick; a paid
   letter simply has no checkbox. **A site with paid letters and Stripe switched off is a real dead end**: the badge
   says Members and the ordinary form is all there is.

9. **A subscribe form cannot work without JavaScript, and this category is nothing but forms.** ⚑ *(new in
   the newsletter patch)* Ghost's signup endpoint refuses a plain form submission — tested against both live
   servers — so the registry's `member-form` line, quoted in all sixteen designs, was wrong about the one
   thing it promised. Every design now draws **P0·4's notice** in the form's place. **Two consequences worth
   naming**: the whole category has a hard script dependency, which no other content category has, and
   `member-form`'s registry entry needs rewriting for every category that quotes it — **A2·5, A3·4, A30
   and A32 quote the same withdrawn sentence**. That is a registry correction, not a section one.
10. **Ghost tells a theme nothing about a member's newsletters, and a newsletter has no cadence.** ⚑ *(new
   in the newsletter patch)* Two fields the category drew do not exist. The subscribed line could not know
   which letter a reader takes, so it is now **"Signed in"** and names only the address. The generated meta
   line could not know "weekly" or "twice a month", so it is **one word read from `visibility`**. **What is
   lost is real**: a publication that sends a weekly and a monthly letter cannot say so in a generated
   line, and must write it into the newsletter's own description in Ghost, which is authored text the
   section renders verbatim.

11. **A subscribe form cannot take a payment, and Ghost's documentation says so plainly.** **The fourth
   option it opens up is refused — the owner, 1 September 2026:** a section will **not** carry a tier-ID
   field and a real Portal checkout. A paid letter keeps **the generic sign-up link**, so there is nothing
   for a publication to paste and nothing to paste wrongly. The platform gap stands; the design question
   is closed. ⚑ *(new in the
   newsletter patch, checked against Ghost's theme documentation on 28 August 2026)* A `data-members-form`
   submission **creates a free member and sends a magic link** — nothing in it asks for money, whatever
   letter the reader ticked. Payment is a **separate Portal checkout**: `data-portal="signup/TIER_ID/monthly"`
   or `/yearly`, which needs **Stripe connected**, needs **JavaScript**, and needs a **tier ID the
   publication copies out of Ghost Admin**. **Two consequences for this category.** A reader who ticks a paid
   letter and submits an address is not asked to pay and does not receive the letter — the silence finding 8
   describes, now confirmed rather than inferred. And a section *could* carry a real checkout button, but only
   if the editor pastes a tier ID, because **Ghost gives a theme no mapping from a newsletter to the tier that
   grants it** — the same gap finding 8 names, now with a price on it: that missing mapping is the only thing
   between a paid letter and a working checkout.

12. **CSS cannot see content, and one control in this category depends on seeing it.** ⚑ *(new in pass two)*
   7 Cover greys **Scrim: Light** against a light picture, measured on the bottom third where the form
   sits. **Nothing in a stylesheet or a Ghost template can make that measurement** — so it is made
   **in the editor, when the picture is chosen**, and stored with the image. **Two consequences.** A
   picture replaced outside the section — swapped in Ghost, or served differently by an image
   processor — is not re-measured, so a stored *Medium* can outlive the reason for it. And **the site
   never re-checks**: the value the editor stored is the value that renders. The same limit is why
   nothing in A22 reacts to a caption's length or a paragraph's line count, and why no design reorders
   its DOM at a breakpoint.
13. ~~**A control can be switched off by the site rather than by another control.**~~ **SETTLED BY THE
   OWNER, 1 SEPTEMBER 2026: the rule's wording is widened** to *a control switched off **by another
   control or by the connected site** is greyed, with the reason beside it* — one shared sentence rather
   than eight per-category readings. The four A22 rows below are its first subjects and **nothing they
   draw changes**. Recorded for the shared control definition. ⚑ *(raised in pass two)*
   Four rows in A22 grey on a fact about the connected Ghost site, not on a sibling row: *Let the
   reader choose* unless the site has more than one newsletter, 10 Choice's Members badge and 15 Two
   Up's Card meta unless some letter is `paid`, and 12 Issue Preview's Archive link while its feed is
   empty. **The rule's shape fits them exactly** — greyed, reason at the control, fallback named —
   **but its wording says "by another control"**, and a build that reads the rule literally will not
   know where to put the condition. Named as a wording question for the shared control definition, not
   answered here.

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
| Missing-image vocabulary | Reflow · Plate · Ground ⚑ *corrected 1 September 2026 — A19 deleted Hand off and Ground replaced it; A24 adds Hide* | A19 |
| Universal trio | Background role · Vertical spacing · Top divider, outside every design's list | P0·8 (library-wide) |
| Inline text toolbar · Link popover | Five actions over any selection; Ghost-aware target picker with new-tab and rel | P0·1 |
| Icon slot · Icon Picker · Button icon | The only place an icon can exist; Tabler grid; before/after a button label | P0·2 |
| Authored item list · Ghost-sourced list card | Drag rows, overflow, Add-with-content, range line; "From Ghost" read-only rows | P0·3 |
| Populate-from panel | Source · Filter · Count · Order · meta chips, with tag/author/hand-picked states | P0·5 |
| State switcher | The State pill in the canvas chrome, beside View as | P0·6 |
| **The form row** | **Visually-hidden label, 46 px field, 46 px button 10 px apart, 13 px note under** | **A3·4 — carried verbatim** |
| **The seven form states** | **Empty · focus · invalid · submitting · done · subscribed · members-off, at one height** | **A22 — extending A3·4's four** |
| **The stacked form** | **Field and button 48 px each, 8 px apart, field text 16 — the ≤ 767 geometry** | **A22** |
| **The signed-in line** | **"Signed in" + the member's address + a link to `#/portal/account/newsletters`, in the form's slot** | **A22 — corrected in the newsletter patch** |
| **The button-as-link** | **The members-off substitution, and the paid letter's static members link — both rendered at the server** | **A22** |
| **The no-JavaScript form notice** | **P0·4's notice at the form row's own height: one sentence, the note beneath, no field and no button** | **P0·4 — drawn in all sixteen by the newsletter patch** |
| **Newsletter row** | **20 px checkbox, name 17, description 14 muted, the whole 56 px row a label** | **A22·10** |
| **Newsletter card** | **Generated meta line, name 26, description, its own stacked form** | **A22·15** |
| **Generated newsletter meta** | **One word read from `visibility` — "Members", drawn only where that value is `paid`; nothing on any other letter, the card closing up. Never typed, and the cadence half is deleted** ⚑ | **A22·15 — corrected in the newsletter patch** |
| **Members badge** | **The generated meta reduced to one word, in a row or a meta line, inside the accessible name — on a newsletter only where `visibility` is `paid`** ⚑ | **A22·10, A22·12** |
| **Member-count proof line** | **One muted 13 px line, `{{total_members}}` pre-rounded, template edited around the number** | **A22 — new in this pass** |
| **The Newsletter source group** | **Six shared rows: Which newsletter · Ask for a name · Signed-in subscriber · Member visibility · Posts to (read-only) · Members disabled** | **A22 — new in this pass** |
| **Ghost's form contract** | **`data-members-form` · `data-members-email` · `data-members-name` — and **no native-POST floor**: the endpoint refuses a plain submission** ⚑ | **A22 — corrected in the newsletter patch** |

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

---

## Patch notes — newsletter patch, 28 August 2026

Every change carries the **name** of the rule that required it. Rules are named, never numbered: the
letter-and-number labels elsewhere in this project are filing codes and say nothing about what a rule
requires.

**Frames updated — all seventeen.** `A22-0 Category Proof` (a new **newsletter patch** table, the patch
paragraph, the roster's two [Free] marks, settlements 2, 3 and 4, finding 4 and two component-inventory
rows) and every design frame `A22-1` … `A22-16`, each of which gained **a drawn NO JAVASCRIPT state**
beside its members-off state, a corrected **SIGNED IN** state, a corrected behaviour block, a corrected
no-JS line in its written-spec card, and a **newsletter patch** line in its ⚑ RECONCILED card. **Redrawn
beyond captions:** `A22-10 Choice`'s ticked-paid-letter state, now a paid row with no checkbox and a static
members link; `A22-15 Two Up`'s generated meta line, now one word in all fifteen places it is drawn.
**Nothing else moved** — no layout, type scale, colour pack or spacing value changed.

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **The no-JavaScript notice** | **The "posts natively, works without JavaScript" claim is withdrawn in all sixteen.** Ghost's signup endpoint refuses a plain form submission, so the form is replaced by **P0·4's notice** at the form row's own height — one sentence, the note beneath, no field and no button — and a **NO JAVASCRIPT** state is drawn on every design's states frame. **The sent, error and loading states are untouched.** Three designs lose a specific claim with it: **10 Choice's** "the checkboxes are real inputs and post with the address — this design loses nothing at all", **14 Slide-in Card's** "an ordinary bordered card at the page foot with a working form in it", and **15 Two Up's** "with script off both post natively and independently". The category now has a hard script dependency; finding 9 records it, including that the same withdrawn registry sentence is quoted in A2, A3, A30 and A32. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | Every subscribe ask in the category carries two panel lines: it **does not render** where the connected site has self-signup switched off, members disabled, or — for a paid ask — no payment provider connected; and any button that opens **Ghost's own sign-up pop-up does nothing with JavaScript off**. That covers 10 Choice's and 15 Two Up's members links, the members-off button-as-link where it points at Portal, and any button an editor re-points. |
| **The cadence line goes** | Ghost's newsletters carry **no cadence field**, so half of "Free · weekly" could never be generated. The **generated newsletter meta is now one word read from `visibility` — "Members", drawn only where that value is `paid`** ⚑ — in 15 Two Up's card meta and 10 Choice's badge; **a letter any member receives carries no word at all** (the owner's ruling, 28 August 2026), and the card closes up rather than reserving the line. "Free", "weekly" and "twice a month" all leave the translation catalogue. A newsletter's own **description** is authored in Ghost and is untouched, so a publication that wants to say "twice a month" still can, in its own words. |
| **The Members badge is paid-only** | The condition was "`visibility` is not `public`". **Ghost gives a newsletter no `public` value**, so that badged nearly every letter and told a reader nothing. It is now drawn **only where `visibility` is `paid`**, in 10 Choice's rows and 15 Two Up's meta line. **12 Issue Preview badges posts, not newsletters** — a post's `visibility` does have a `public` value, so "not public" is a real gate there and that badge is unchanged; the two are no longer described as one rule. |
| **"You are subscribed" becomes "Signed in"** | **Ghost does not tell a theme which newsletters a member has**, so no design can claim a subscription. The line reads **"Signed in"**, names the signed-in address, and links to Ghost's own preferences panel. The state, its geometry, its height and the control that governs it are unchanged. `subscribedText` keeps its name and cap and its default changes. |
| **No design ever turns into another design** | Nothing in this patch introduced a hand-off, and the paid-letter correction removed a state change that behaved like one: **10 Choice's field no longer swaps for a Portal link when a reader ticks a paid letter.** A paid letter has **no checkbox**; its row draws the badge and a **static** members link, rendered at the server, always present. |
| **The two free designs are the owner's choice** | Shortlisted the plainest, photography-free designs — **1 Inline Row · 13 Boxed · 2 Card · 5 Panel · 9 Slim Bar** — recommended **1 Inline Row and 13 Boxed**, and **the owner confirmed that pair on 28 August 2026**. Marked in the roster and on the proof frame. The line the merge reads is in §0: **`**[Free] designs:** 1 Inline Row · 13 Boxed`**. |
| **Avatars with no photograph** | **No subject in this category.** A22 renders no person: no author, no member avatar, no initials anywhere in sixteen designs. |
| **The Remove button never greys out** | **One subject: 11 Reasons' authored list**, whose floor is one line. Unchanged by this patch and already compliant — ✕ is never disabled, and *Add* disables at three with its reason readable. The Ghost-sourced lists in 9, 10, 15 and 12 have no Add and no Remove at all. |
| **Slider labels** | **No subject.** A22 draws no slider; every control is a named-value row whose title says what it affects. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A22 has no gap control, and no Tight/Even/Airy or Tight/Standard/Wide exists here to replace. |
| **Item counts are a number picker** | **One subject, and it is not this category's control:** 12 Issue Preview's *Count* lives in the shared populate-from panel (Three · Four · Six). Recorded as an inherited row rather than corrected here, so the shared panel is not forked by one category. |
| **A design may offer fewer choices on a shared control, and must say why** | Unchanged by this patch and re-checked: the swatch row is **Base**, there is **no "Inherit" value anywhere** in A22, no shared control is renamed or extended, and every narrowing shows its reason — Background role locked on 4, 5, 6, 7 and 10; all three universal rows locked on 14; 9 Slim Bar's Field width offering no Wide value. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16.** Sixteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** — sixteen
   designs, no gaps and no renumbering.
2. **The `**[Free] designs:**` line is present** in §0, on its own line, and names **1 Inline Row** and
   **13 Boxed** — both of which exist in this category's roster, and both **confirmed by the owner on
   28 August 2026**.

### Open questions

**Housekeeping, 1 September 2026.** All three items below were settled before this pass and were reading as
open; each is now **struck through with who settled it** and kept for the record. **Nothing on this list is
open.** The questions this pass raises are in **Patch notes — pass two**, each marked OPEN FOR THE OWNER on
its own line, and none of them is answered here.

~~**QUESTION 1 — Which two designs are free**~~ · **SETTLED BY THE OWNER, 28 AUGUST 2026** · **ANSWERED 28 AUGUST 2026: 1 Inline Row and 13 Boxed**, the recommendation confirmed. Recorded in §0 and in the roster; kept here for the record.

Two of the sixteen newsletter designs ship in the free theme. Which two is your call. These five are the
plainest — a site could publish any of them and not look unfinished, and none of them needs the customer to
have good photography:

1. **1 Inline Row and 13 Boxed.** *(RECOMMENDED)*
   Inline Row is a heading, a sentence and a field on the page, with nothing around it. Boxed is the same
   ask inside a thin outline, which gives it an edge on a busy page. They differ in kind rather than degree,
   so a free customer gets a real choice.
   *What it gives up:* the free theme has no version with a filled or raised background, so a free site's
   newsletter block never separates itself from the page by colour.
2. **1 Inline Row and 2 Card.**
   Card puts the ask on a raised white card. It looks the most "designed" of the plain five and is the one
   most customers would pick first.
   *What it costs:* a card is a stronger visual claim than most page layouts want, and the free pair then has
   nothing quiet on a busy page.
3. **1 Inline Row and 9 Slim Bar.**
   Slim Bar is a single 93 px strip with a label and a field — the smallest newsletter section in the
   library, made to sit under a header or above a footer.
   *What it costs:* it has no heading and no body copy at all, so a free customer who wants to explain the
   letter has only one design that can, and Slim Bar can read as page furniture rather than an invitation.

*Example.* A free customer building a home page picks the newsletter block and sees two options: with
option 1, "a plain ask" and "a plain ask in a box". With option 2, "a plain ask" and "an ask on a white
card".

~~**QUESTION 2 — What a paid newsletter's row does in the design that lists several letters**~~ · **SETTLED BY GHOST'S OWN DOCUMENTATION, CHECKED 28 AUGUST 2026** · **CHECKED
AGAINST GHOST'S DOCUMENTATION, 28 AUGUST 2026, AND ANSWERED BY IT.** The owner asked whether ticking a paid
letter and clicking Subscribe would ask the reader for payment. **It would not.** Ghost's theme
documentation is explicit that a members form creates a free member and sends an email link; payment happens
only through a Portal checkout link carrying a tier's ID, which needs Stripe and JavaScript. So a ticked paid
letter takes an address, makes a free member, and sends nothing — **option 1 stands as drawn**, and finding
11 records the platform fact. **A fourth option the documentation opens up** is recorded there too: the row
could carry a real checkout button, but only if the editor pastes a tier ID out of Ghost Admin, since Ghost
gives the theme no way to tell which tier grants which letter. Not drawn, and not recommended without the
owner asking for it.

Design 10 Choice lists the site's newsletters as tick boxes above one email field. A **paid** newsletter
cannot be delivered to an email address alone — the reader has to have an account and a subscription — so
ticking one and typing an address subscribes them to silence. The old drawing swapped the email field for a
"join" link the moment a reader ticked a paid letter, which needs code we do not have in this section, and
would leave a reader with scripts turned off ticking a box that does nothing. **I have drawn option 1 and
this question asks you to confirm it.**

1. **A paid letter has no tick box: the row shows the letter, a "Members" mark and a permanent link to join.**
   *(RECOMMENDED)*
   Nothing changes as the reader clicks, so nothing can go wrong, and the row tells the truth before anybody
   types anything.
   *What it gives up:* a reader cannot tick the free letter and the paid letter in one gesture; joining is a
   separate step, on a separate page.
2. **Keep the tick box for the paid letter and put one permanent line under the field:** "Field Notes is for
   members — join to get it", with the link in it.
   *What it costs:* a reader can still tick a letter they will not receive, and the explanation sits below
   the field rather than on the row they ticked.
3. **Leave paid letters out of the list entirely.**
   *What it costs:* the publication cannot advertise its paid letter where it lists the others, and a reader
   has no way to discover it from this section.

*Example.* A site sends "The Friday edition" free and "Field Notes" to members only. Under option 1 the
reader sees one tick box, one email field, and beneath it "Field Notes · Members — Join to get Field Notes".
Under option 2 they see two tick boxes and a line of explanation under the field.

~~**QUESTION 3 — What the one-word letter mark says for a letter every member receives**~~ · **SETTLED BY THE OWNER, 28 AUGUST 2026** · **ANSWERED
28 AUGUST 2026: no word at all unless the letter is paid.** The mark is "Members" on a paid letter and
absent on every other, and the card closes up rather than reserving the line. Redrawn in 15 Two Up (eleven
places) and already the condition in 10 Choice's badge. Kept below for the record.

The line above each newsletter's name used to read "Free · weekly". "Weekly" is gone — Ghost does not record
how often a letter goes out. That leaves one word, and the word for a paid letter is "Members". A letter that
any signed-in reader receives, free or paying, is the awkward case.

1. ~~**"Free".**~~ *(recommended, and not chosen)*
   It answers the question a reader is actually asking — does this cost anything — and it is the word the
   design was drawn with.
   *What it gives up:* strictly, the reader still needs an account, so "free" means "free to receive", not
   "no sign-up".
2. **"Members".** Accurate — every letter goes to members — but then the mark is the same word on every
   letter and stops telling anybody anything.
3. **No word at all** unless the letter is paid. **← chosen by the owner.**
   Cleanest and least arguable, but the line above the name disappears on most sites, and the cards lose a
   line of vertical rhythm they were drawn with.

*Example.* A site with a free letter and a paid one shows, under option 1, "Free" over one card and
"Members" over the other. Under option 3, nothing over the first card and "Members" over the second.

**Not a question, recorded for the architect:** the withdrawn "posts natively to Ghost's members endpoint"
sentence is the shared `member-form` registry line, and **A2·5 Capture, A3·4 Newsletter Band, A30 and A32
quote it too**. Correcting it there is a registry job, not this category's, and finding 9 names it.

— End of specification —

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** sixteen designs, numbered **1–16**.

---

## Patch notes — pass two, 1 September 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named,
never numbered: the letter-and-number labels elsewhere in this project are filing codes and say nothing about
what a rule requires.

**Frames changed — seventeen, and every one of them.** All sixteen design frames and `A22-0 Category Proof`
gain a **PASS TWO PATCH** section: on a design frame, the greyed row drawn at panel size with the reason
beneath it and a rule-by-rule grid saying what each of the five rules, each of the two Ghost findings and the
work list's own item did to that design; on the proof, the same grid read category-wide, the
**disabled-control map** for all sixteen, the open questions and a *left alone deliberately* card.
**One frame gained a drawn state:** `A22-12 Issue Preview` now draws **THE EMPTY FEED** — the label, the
rule, the two lines and the undrawn archive link — on a 948 px card beside a 320 px note, the pair pinned in
the frames' own 1,288 px row rather than at the section's 1,296 content box, which is the width every
explanatory card in these frames uses. **No arrangement moved, no
control was added, removed or renamed, and no value, default, type scale, colour pack or spacing step
changed.**

### What changed, and the rule that required it

| Rule | Change |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Applied without exception, and five rows changed.** Each is drawn, the unavailable value struck, the reason one short sentence **at the control** and never a tooltip, the fallback named. **The five that were accepting a value the design would not honour:** 3 Split's **Field: In a row** at *Wide head* · 9 Slim Bar's **custom label** at *Label: Newsletter name* · 10 Choice's **Members badge: On** where no letter is `paid` · 15 Two Up's **Card meta: Show** for the same reason · 16 Quote's **heading** at *Quote size: Large*, the rule applied to a content field rather than a control ⚑. **Two new rows, both on 12** and both from the empty feed: **Archive link** and the Data group's **When nothing matches**. **The locks are restated, not converted:** Background role on 4, 5, 6, 7 and 10, the whole universal trio on 14, Top divider at *Full bleed* on 4 and 7. **Three things deliberately left ungreyed:** a width is not a control (14's Corner and Card width, 6's Picture side) · an advisory stays an advisory where both values are honoured (8's Compact at Huge) · a mode's own controls were never switched off (11's icon slots at *Reason marks: Icons*). **The rule's one exception is claimed nowhere in A22** — no control here is one this project can never offer. |
| **A feed with nothing in it shows its designed empty state** *(the work list's own item)* | **Written into 12 Issue Preview, the category's only feed, and it reverses two of that entry's rulings.** The label and the rule hold; where the rows were, **“No issues yet”** at 20 px in the heading face and **“The first letter will appear here once it has gone out.”** at 15 px muted, the pair at **one row's height** so a page that loses its issues does not jump. **Never hidden** — it renders on the site as much as on canvas — and **never back-filled with whatever is newest**, the Data group's *When nothing matches* greying its back-fill value there ⚑. **The archive link is not drawn while the feed is empty.** **Both lines are fixed strings in the translation catalogue** ⚑: no new content field, no new control. **Withdrawn:** the rows, label and rule going absent together, and the notice living in the editor alone. **Kept in its own scope:** no placeholder row, no empty thumbnail, and no chip beside populated rows. **No subject on the other fifteen** — 10 Choice and 15 Two Up list newsletters and zero is unreachable, 11 Reasons' list is authored with a floor of one. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **No subject in the category.** A22 renders no person in any of the sixteen — no author, no member avatar, no initials — and **16 Quote's attribution draws no portrait at any value** ⚑. Recorded rather than skipped: a list the user types gets two initials, an author Ghost supplies gets one letter, and the two are never mixed inside one component. |
| **The Remove button never greys out** | **One subject, already compliant: 11 Reasons' authored list.** ✕ is live on every row and never disabled; at one line, clicking it produces the floor and the reason as one sentence under the list. **Add** disables at three with its reason readable — a ceiling on Add, never a lock on Remove. The Ghost-sourced lists in 9, 10, 12 and 15 have no Add and no Remove at all. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No conversion, in either direction.** 15 Two Up's **Cards across** — Two · Three · Auto — stays a named set: every value has a frame somebody has looked at. **12 Issue Preview's Count is the shared P0·5 panel's row**, drawn Three · Four · Six, and it is both an item count and a choice between arrangements — **recorded as an open question rather than converted**, so one category does not fork the shared panel. |
| **A design may declare the width below which its script runs** | **No design declares one.** All sixteen declare `member-form`, which runs at every width. **14 Slide-in Card is the only design that could and does not:** `slide-in-card` runs at 390 as at 1440 — the card narrows to 342 and stays in its corner rather than collapsing — so there is no boundary to name, and **its no-JavaScript line already describes both ends**. No no-JavaScript line in the category needed a second half. |
| **Ghost finding · the feature-image caption renders differently on the two Ghost versions** | **Does not reach this category, and is recorded rather than skipped.** A22 reads two images and neither carries a caption: 6 Image Split's and 7 Cover's are authored in the section with alt text and a focus, and 12's thumbnails read `feature_image` with `alt=""`. For a builder who adds one: **Ghost 6 removes `<em>` and `<strong>` from a caption while keeping links and `<b>`; Ghost 5 keeps everything**, so a caption that leans on italics gets them on one supported version and not the other. |
| **Ghost finding · a comment count renders nothing at all without JavaScript** | **Does not reach this category.** A22 reads no comment count, ships no comment noun and labels no number — A28 owns that surface. Recorded because the shape is easy to get wrong: Ghost writes the number in with a script and **prepends** it to the noun, so a catalog string is the bare noun and never holds a number or a placeholder; an accessible label goes on the surrounding element, never on the count; and the widget degrades differently from its count, so one sentence cannot cover both. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15 · 16.** Sixteen designs, no gaps, nothing renumbered, nothing reused, nothing deleted. |

### Open questions this pass raises — none of them answered here

~~**QUESTION 4 — Does 12 Issue Preview's Count stay a named set?**~~ · **SETTLED BY THE OWNER,
1 SEPTEMBER 2026: yes — it stays three named buttons.** Nothing is converted and the shared panel is not
forked; if a second category needs the same row, the stepper question is P0·5's to answer then.
The rule says an item count stays a number picker and a choice between drawn arrangements is a named set.
This row is both: Three · Four · Six each has a frame — three columns of 416, four wrapping, six wrapping —
and it also says how many issues to show. Converting it would fork **P0·5's shared panel** for one category,
which the newsletter patch already declined to do once. Left exactly as drawn, and named rather than guessed.

~~**QUESTION 5 — May a publication author the empty feed's two lines?**~~ · **SETTLED BY THE OWNER,
1 SEPTEMBER 2026: fixed strings now.** No field and no control is added. **If customers ask, it becomes one
optional field that falls back to the shipped wording** — written down here so the fallback is part of the
decision rather than an afterthought.
They are drawn as fixed strings in the translation catalogue, so this pass adds no field and no control.
Authoring them would add a content field to the shared list and a row to a panel the category holds at five
controls, and “No issues yet” is a house voice in some publications. Not invented here.

~~**QUESTION 6 — Where does the rule put a condition that comes from the site rather than from another
control?**~~ · **SETTLED BY THE OWNER, 1 SEPTEMBER 2026: the rule's wording is widened** to *switched off
by another control **or by the connected site***. One sentence in the shared control definition; no frame in
A22 changes.
Four rows in A22 grey on a fact about the connected Ghost site: *Let the reader choose* unless there is more
than one newsletter, 10's Members badge and 15's Card meta unless some letter is `paid`, and 12's Archive
link while its feed is empty. The rule's **shape** fits them exactly; its **wording** says “by another
control”. Recorded as finding 13 — a wording question for the shared control definition, not a design one.

**The three standing items are settled too — the owner, 1 September 2026:**
~~dismissal memory~~ → **a first-party cookie**, thirty days by expiry and the session value as a session
cookie, read server-side so a dismissed card is not rendered at all (finding 3; the registry entry still
needs the sentence, which is a registry job);
~~a real checkout on a paid letter~~ → **refused**: the paid letter keeps the generic sign-up link, so there
is no tier ID to paste and nothing to paste wrongly (finding 11);
~~the withdrawn `member-form` registry line~~ → **fixed**: A2, A3 and A32 already carried the correction, and
**A30·11 Rail was the one entry left quoting the sentence as current** — corrected in *A30 Members Pages —
Spec* on 1 September 2026 (finding 9).

**Nothing in this category is left open.**

### The owner's rulings — 1 September 2026

Six questions were put to him the day this pass landed. **Three answer this pass's own questions, two close
findings that had stood since the first pass, and one is a library-wide wording change.** **None changes an
arrangement, a type scale, a colour or a spacing step.**

1. **12 Issue Preview's Count stays three named buttons** — *a count that picks between drawn layouts is a
   named set*. Every value has a frame, and converting one category's row would fork **P0·5's shared panel**.
   The stepper question moves to P0·5, for the next category that needs it.
2. **The empty feed's two lines stay fixed strings** — *a feed with nothing in it shows its designed empty
   state*. No field, no control. **If customers ask, it becomes one optional field with a fallback to the
   shipped wording**, recorded as part of the ruling rather than left to a later argument.
3. **The greying rule's wording is widened** — *a control switched off **by another control or by the
   connected site** is greyed, with the reason beside it*. A22's four site-conditional rows are its first
   subjects: *Let the reader choose* unless the site has more than one newsletter, 10 Choice's Members badge
   and 15 Two Up's Card meta unless some letter is `paid`, and 12's Archive link while its feed is empty.
   **One sentence in the shared control definition; nothing in A22 is redrawn.** Finding 13 is struck.
4. **14 Slide-in Card keeps both dismissal values, and both are a first-party cookie** ⚑. Thirty days is a
   cookie with a thirty-day expiry; **this session is a session cookie** that dies with the browser rather
   than resting on whatever the module remembers. **One name, one flag, no personal data and no third
   party**, and because a cookie is sent with the request the section reads it **server-side**: a dismissed
   card is **not rendered at all** rather than rendered and hidden — which is also the only reading that
   holds with JavaScript off. Finding 3 is struck; `slide-in-card`'s registry entry still needs the sentence.
5. **A paid letter keeps the generic sign-up link** — the tier-ID checkout is refused. Nothing for a
   publication to paste and nothing to paste wrongly; the platform gap in finding 11 stands and the design
   question is closed.
6. **The withdrawn `member-form` sentence is corrected everywhere it was still quoted.** A2, A3 and A32
   already carried the correction; **A30·11 Rail was the one entry left quoting “the `<form>` posts natively
   to Ghost's members endpoint” as current**, and it is struck there with P0·4's notice named in its place.
   **That edit was made to *A30 Members Pages — Spec* on 1 September 2026** and is recorded here because
   this category's finding 9 asked for it.

### The Open questions housekeeping

**Done, and it found nothing open.** All three items in **Open questions** — the two free designs, what a paid
letter's row does, and what the one-word mark says for a letter every member receives — **were settled on
28 August 2026**, two by the owner and one by Ghost's own documentation, and all three are now **struck
through with who settled it** and kept for the record. **Nothing on that list is open**, and the questions
above are this pass's own, each marked OPEN FOR THE OWNER on its own line. **Nothing was answered in the
housekeeping itself.**

**Findings for the architect** was read the same way. **Struck by this document rather than by this pass:**
finding 7's refusal of a member count (withdrawn in the reconciliation patch — `{{total_members}}` exists),
finding 8's “not public” badge condition and finding 10's cadence line (both corrected in the newsletter
patch, the owner ruling on 28 August 2026). **Left open and marked above:** findings 3, 9 and 11.
**Findings 1 and 2 are platform gaps, not decisions** — Ghost has no newsletter-issue object and no
newsletter archive route — and they stay written as gaps; **findings 12 and 13 are new in this pass** and 13
is question 6.

### Left alone deliberately

**Two things in this category were changed outside Claude Design and are untouched here.** The
**count-agnostic product copy** — nothing in this pass writes a number of designs into any marketing, app or
frame string, and none was reintroduced — and **P0's per-prop mark allowlist**, whose wording about a mark
being **absent** from the toolbar rather than greyed is P0's text and is not restated, softened or
contradicted by anything above. **The scope is different and the difference is stated on every frame**: a
mark a field does not permit is absent; a control switched off by another control is greyed with its reason.

**Two sentences this pass could have rewritten and did not.** **6 Image Split's hand-off to 5 Panel and
7 Cover's to 4 Contrast Band** both still describe a design turning into another when no picture is
authored. No rule in this pass names hand-offs, so they were left as found and are named here — a thing left
alone can be fixed in one message. **And every no-JavaScript line is unchanged**: all sixteen replace the
form with P0·4's notice at the form row's own height.

### Confirmations

1. **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16** — sixteen
   designs, no gap created or closed, no number reused, nothing renumbered.
2. **The `**[Free] designs:**` line is present**, on its own line at the head of this document, and names
   **1 Inline Row** and **13 Boxed** — both of which exist in this category's roster. Unchanged from the
   owner's ruling of 28 August 2026.

— End of pass two —
