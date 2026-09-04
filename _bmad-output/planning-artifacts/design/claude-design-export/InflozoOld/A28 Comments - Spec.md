# A28 Comments — written specification

10 designs · Paper pack · drawn 23 August 2026 · **controls reconciled 25 August 2026** · **design patch pass, 29 August 2026** · **design patch pass two, 1 September 2026**

**Design patch pass two — 1 September 2026 (this document's current state).** Two tested findings and one
library rule landed on this category. **The count and the comments widget degrade differently without
JavaScript, and one sentence cannot cover both**: tested against live Ghost servers on 31 August 2026, **the
count creates no element at all** — no number, no word, no empty box — while **the widget itself does render**.
Every design's no-JavaScript line is now written as two sentences. **The count's accessible label sits on the
surrounding element, never on the count**, and **`countSingular` and `countPlural` are bare nouns** because
Ghost's script *prepends* the number to them — a "%" or a `{count}` in either string renders literally.
**Where the project's colour scheme is pinned there is no visitor dark-mode switch at all** — not greyed, not
drawn, with the panel saying why — and **the comments widget takes its light or dark appearance from that same
pinned value**, which is the rule the deleted Block colour row follows from. **4 Contrast Band is still offered
only on a pinned scheme.** **Nothing was renumbered, no measure moved and no colour changed.** **One conflict
with the previous pass is recorded rather than resolved** — see the Patch notes below.

**Design patch pass — 29 August 2026 (superseded in part by pass two, above).** Three platform facts landed on this
category and every design in it. **The comment count is drawn by Ghost's own script** — `{{comment_count}}`
renders a placeholder that Ghost's comments script fills — so **with JavaScript off there is no number at all:
not a zero, nothing**. Every design's no-JavaScript line is rewritten, and **no section's accessible name
depends on the count any more**: 1 Rule's count leaves the `h2`, **9 Big Count's `h2` is its 13 px label
rather than its figure**, and 10 Slim takes `aria-label="Comments"` at Count only as well as at None.
**The comment box's colour is a setting inside Ghost and Inflozo does not change it**, so **the Block colour
row is deleted from the Data group in all ten**, no design passes `mode=` at all, and a read-only row links to
the setting instead — which withdraws the previous pass's "Match the page resolves to `auto`" fix as moot and
means **4 Contrast Band is offered only where the project's colour scheme is pinned**. **Ghost's signup
endpoint refuses a plain form submission**, tested against two live Ghost servers, so 8 Prompt's "posts
natively" promise is withdrawn and **the designed no-JavaScript notice replaces its form**, with the sent,
error and loading states unchanged. **Three hand-off phrases were deleted** (2, 6, 8) — no design turns into
another. **No count label carried a "%", so there was nothing to remove.** **Nothing was renumbered.**

**[Free] designs:** 1 Rule · 5 Boxed

*(Shortlisted in this pass — 1 Rule, 5 Boxed, 10 Slim, 3 Panel, 2 Split Head — and **confirmed by the owner on
29 August 2026**: the category default plus the one thin outlined box. Neither needs a photograph, a list or a
member button, and both draw identically with JavaScript switched off.)*

**Two further rulings landed with it, both on 29 August 2026.** **The shared background row gains a fourth
value — *None: show whatever is behind*** — which retires the word "Inherit" and gives **10 Slim** a real value
to be locked at; the change is **library-wide** and is recorded as a finding for the architect rather than a
local invention. And **a design that cannot work on a site is not offered on it**: where a project's colour
scheme follows the visitor's device, **4 Contrast Band is drawn greyed in the picker and cannot be placed**,
under one line — *"Needs a fixed light or dark site — change that in your theme settings and this becomes
available."* It is withheld, never switched.

The frames are `A28-0 Category Proof.dc.html` and `A28-1` … `A28-10`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

This revision folds in the controls-reconciliation pass. Six things now sit on every design: the
**universal trio outside each control list** (with each design's old Padding row, and five designs'
Divider rows, retired into it), the Comments block group recut as **the Data group** with **Match the page fixed for dual-mode sites** *(since withdrawn in the design patch pass — the box's colour is Ghost's own setting and the row is gone)*, the count's three words as **authored fields**,
`rules[]` **settled at one to four**, a **`<noscript>` line** under the head, and every authored
string **inline-editable** with the P0 primitives. Two designs gained a state: **8 Prompt** designs
the free member under paid-only commenting, **9 Big Count** stops shipping a display-scale zero.

The shared editor primitives are **not redesigned here**. They were designed in the *P0 · Editor
primitives* session — `P0-1 Inline Text Toolbar`, `P0-2 Icon Slot and Picker`, `P0-3 Item List
Controls`, `P0-4 Member Action Editor`, `P0-5 Populate From Panel`, `P0-6 Editor State Switcher` —
and are referenced by name throughout.

The category's additional artefacts are **on the proof frame, not here**: the reconciliation banner,
the tokenisation proof (A28·1 in three packs, light and dark), the **drawn no-JS state**, the stress
frame, the roster and the four settlements in full. The shared field list is repeated below because
the build reads it.

*(The master brief files these specs at `prds/prd-Inflozo-2026-08-17/sections-inventory.md`. That
path does not exist in this project; A1–A27 are specified in root-level `<ID> — Spec.md` files and
this follows them.)*

---

## 0 · The category layer

### What A28 is

**Ten wrappers around a block the theme does not own.** Ghost renders its comments UI into a
sandboxed frame, in Ghost's colours, at Ghost's type scale, with Ghost's focus rings, and **theme CSS
cannot reach inside it**. So this category designs the four things that are ours: **the heading, the
count, the house rules, and the ground the block stands on** — and states, in every design, where the
line falls.

On the frames, everything the theme owns is drawn at full strength; everything Ghost owns is drawn
inside a dashed outline at reduced opacity, in its own greys rather than the pack's. That is not a
placeholder convention. It is the category's central fact, drawn.

A28 inherits **A25's 720 measure centred in A17's 1,296 content box on a 72 px margin**; A17's padding
ladder, now resolved by Vertical spacing; **A25's 240 · 48 · 1,008 rail division** (6 Rail); A1's
avatar and initials fallback; A6's focus ring and its rule for a control on a band; **A6·6's inline
form and A22's field-and-button pair** (8 Prompt); **A9·1's `accordion` and its `default state` →
server-rendered `open`** (7 Disclosure); A26·3 and A27·4's call that a plane is a ground rather than a
containment; A25·11's distinction between a plane and a border. **A28 adds one component to the
vocabulary — the house-rules list — and nothing else.**

### The four settlements (§8 of the brief)

**1 · The frame only — what the section draws, and what it hands over.** The section draws a head, a
count, one line or one list of house rules, and the ground. It then calls
`{{comments title="" count=false}}` — **the block's own title and count are switched off in all ten
designs** ⚑, because the section has just drawn them and Ghost's would be the second pair on the page.
The count is `{{comment_count singular=countSingular plural=countPlural empty=countEmpty}}` ⚑, which
**renders whether or not the block does** — the fact 8 Prompt is built on. **The three words were
literals inside that call until this pass** and are now authored fields with those literals as their
defaults: a non-English site could not change them, and 9 Big Count draws one of them at display size.

**2 · Signed out, free member, paid-only.** **Ghost owns all three inside the block**, and its sign-up
prompt cannot be suppressed, so **nine of the ten designs draw nothing extra in any of them** ⚑ — a
second prompt above Ghost's is two calls to action in 400 px. **8 Prompt is the exception**: it
replaces the block with the publication's own invitation for signed-out readers, and pays for it by
not showing them the thread. **What Ghost renders to a signed-in free member when commenting is set to
paid-members only is not documented and was not verifiable** ⚑ — that is finding 5, and it still needs
one live check. **8 Prompt no longer assumes Ghost handles it**: at paid-only commenting a free member
gets **the prompt in upgrade form** ⚑ — per-state heading and button, the shared body, Portal's
`account/plans` action through P0·4, and no email field — mirroring the member-state pattern the owner
ruled for headers. The other nine still assume it, and the **ARCHITECT: verify** flag stays on 8's
frame.

**3 · Where it sits.** **A28 sits below A26 Post Footers and above A27 Related Posts** ⚑ — the author
card and the share row belong to the piece just read, the comments belong to the reader, the related
set is the offer to leave. Every frame draws A26's tail above and A27's set below at half opacity.
**A28 draws its own top padding and cannot know what precedes it** ⚑ — the same route-awareness gap
A26 and A27 both raised, now for the third time (finding 6).

**4 · What the design must not style.** Everything inside the outline: comment type, spacing, avatars,
buttons, reply threading, the editor, the moderation menu, error states, and the focus ring on every
one of them. **Two attributes and one setting are the whole of the theme's reach** — `mode`,
`saturation`, and whether the section renders at all. **The block's accent is Ghost's accent colour
setting, not the pack's accent token** ⚑ (finding 1), and that one has to be solved outside the theme.
**No control anywhere in A28 claims otherwise**, and every panel says so in its own words.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The universal trio, outside every design's control list.** **Background role** (Background ·
  Surface · Contrast), **Vertical spacing** (Compact 64 · Comfortable 96 · Spacious 132; 80 at 834,
  64 at 390) and **Top divider** (None · Line · Fade). **Every design's Padding row was Vertical
  spacing under another name and is gone** ⚑ — including **4's "Band padding"**, which resolves
  *inside* the band because the band **is** the section (rule 3's band-internal exemption was
  considered and **declined**, on A27·5's precedent), and **10's 40 · 64 · 96**, which keeps its own
  shorter ladder and its Compact default under the universal name. **1, 2, 6, 7 and 9's Divider
  (On · Off) was Top divider under another name and is gone too** — Line is what On drew, Fade is new,
  Line stays their default. **3's Inset, 5's Inset and 5's Head row stay**: a plane's internal
  padding, a box's internal padding and a border *inside* a box are not the space around a section.
  **Background role is locked at Contrast on 4 and at None on 10**, and **Top divider at None on
  4**, each with the reason shown. **The shared row gains a fourth value in this pass — *None: show whatever is
  behind*** — **Ruled by the owner on 29 August 2026** ⚑, which retires the word "Inherit" and gives 10 Slim a
  real value to be locked at. **The change lands on the shared control for every category**, so it is a finding
  for the architect and not this category's invention.
- **The seam.** A28 draws its own top padding: Vertical spacing's **64 · 96 · 132** at 1440, **80** at
  834, **64** at 390 ⚑ — A17's ladder. **10 Slim runs its own shorter ladder** ⚑, 40 · 64 · 96, and
  says so.
- **The measures.** Measure **720 centred** in the 1,296 content box on a 72 margin, A25's division
  exactly; 754 at 834, 350 at 390. **Seven designs offer Width Measure · Content**; 2, 6 and 9 are on
  the content width by construction.
- **The head.** One control, four values — **Label** 13 px uppercase tracked .08em · **Heading** 28 px
  in the heading font · **Count only** 22 px · **None** — all reading one `headingText`, default
  **"Discussion"** ⚑. **6 Rail and 9 Big Count have no Heading control** (the rail and the figure are
  the head); **7 offers two values, 10 offers three.** At None the section takes `aria-label="Comments"` ⚑ — a
  translation-catalog string, not a literal. **No section is ever named by its count** ⚑ — Ghost's script
  draws the number, so 1's count sits beside the `h2` rather than inside it, **9's `h2` is its 13 px label
  rather than its figure**, and 10 takes the `aria-label` at Count only as well as at None. **And where a design
  reads the count aloud, the accessible label sits on the surrounding element, never on the count itself** ⚑ —
  new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist
  is not a label.
- **The type.** Head 28 · 22 · 17 · 13 by value; the figure 76 or 104 in 9. Count 15, 17 in 9. Rules
  15, 14 in 6's rail. **Nothing below 13, and nothing between 13 and 15** ⚑.
- **The count's own words.** `countSingular` "comment", `countPlural` "comments", `countEmpty`
  "No comments yet" — **three authored fields in all ten** ⚑, edited **in the panel rather than
  inline**, because the canvas shows one of the three at a time and editing in place would silently
  rewrite whichever variant happened to be on screen. **P0·6**'s state switcher steps 0 · 1 · many to
  see each. **The number itself is Ghost's** and shows P0·1's lock pill. **`countSingular` and `countPlural`
  are bare nouns** ⚑ — new on 1 September 2026: Ghost's script **prepends** the number to the word, so a "%" or
  a `{count}` inside either string renders literally on the page. **Checked on all eleven frames: neither
  appears** ⚑; the 20-character limit is unchanged. **`countEmpty` is not bound by the same rule** ⚑ — **ruled by the owner on 1 September 2026**: it is a
  whole line rather than a noun, it keeps "No comments yet", and **the one live check owed covers whether
  Ghost prints a nought in front of it**.
- **The comment box's colour.** **It is a setting inside Ghost, and Inflozo does not change it** ⚑ — so
  **no A28 design passes `mode=` at all**, the Block colour row is gone from every panel, and a read-only row
  **links to the setting** in its place. The previous pass's "Match the page resolves to `auto`" fix is
  **withdrawn as moot**. **4 Contrast Band is what this costs**: its band inverts the page, the box cannot be
  inverted with it, so that design is **offered only where the project's colour scheme is pinned** ⚑ — on a
  site that follows the visitor's system preference, half the audience would read a light thread on a dark
  band. **The design is not offered there and never turns into another design.** **And where the colour scheme is
  pinned there is no visitor dark-mode switch at all** ⚑ — not greyed: **not drawn**, with the panel saying
  why, because it is the one control this project can never offer. **The comments widget takes its light or
  dark appearance from that same pinned value** and is given no second selector of its own — which is the rule
  the deleted Block colour row follows from, stated on 1 September 2026.
- **Accent, once at most.** **Only 8 Prompt draws accent at all** — its buttons, or its link. No head,
  count, rule, bullet, chevron or figure is ever accent ⚑. **The accent inside the block is Ghost's and
  is not counted, because it is not ours.**
- **Targets.** 7's bar and 8's form are the only interactive elements the theme draws. Bar 720 × 56,
  350 × 52 at mobile; field and button 44. **Nothing the theme draws is under 44** ⚑.
- **Responsive floor.** **Margin furniture leaves at 1,200** (6, 9) · **splits collapse at 834** (2) ·
  **planes, boxes and bands do not collapse at all** (3, 4, 5, 7). Every element that leaves a width
  has a stated destination.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm
  shadows dropped and the hairline carrying every plane. **The block is passed no mode at all** ⚑ — its colour is Ghost's own
  setting in both schemes, which is why 4 Contrast Band is offered only where the project's colour scheme is
  pinned.
- **No JavaScript, said out loud.** A `<noscript>` line sits under the head in all ten — **"Comments
  need JavaScript."**, a **theme translation-catalog string** (`comments.noscript`), **not an authored
  field** ⚑. One line of markup, no module, taking the muted text token at the count's size, at the
  position the block would have occupied: no box, no icon, no border — a sentence, not an error state.
  It stops the chrome promising a thread that never loads. **The count and the widget degrade differently, and
  one sentence cannot cover both** ⚑ — tested against live Ghost servers on 31 August 2026, and rewritten
  category-wide in this pass. **The count renders nothing at all**: no number, no word, no empty box, **no
  element**, because Ghost's script creates it and writes the number in, and no `countEmpty` line either.
  **The comments widget itself does render.** **Every design's no-JavaScript line is therefore two sentences,
  one for each**, and 8 Prompt's is three. **Drawn on the proof frame** — on **two** designs, 1 Rule and 9 Big
  Count, because the figure *is* 9's count and its absence is the category's hardest case; **those cards show
  the count's absence, not the widget's**. **The `<noscript>` line keeps its wording, "Comments need JavaScript."** — **ruled by the owner on 1
  September 2026** ⚑. What the widget draws in that state was not established by the test, so **one live check
  is owed** and the line is not rewritten on a guess. **And the section is always drawn** ⚑ — heading, rules
  and that line render whether or not the discussion can, on the same ruling.
- **Print.** **No A28 section prints** ⚑ — head, rules, `<noscript>` line and block all go. A printed
  page cannot be commented on. The second category in a row that prints nothing.
- **Behaviour.** **Two designs declare a module** — 7's `accordion`, 8's `member-form` — both from
  the registry, both quoted. **Only one of the two survives without JavaScript**: 7's bar opens and closes,
  and **8's form no longer posts** ⚑ — Ghost's signup endpoint refuses a plain submission, so the designed
  no-JavaScript notice replaces it. The other eight declare none. **No design declares a module for the block
  itself, because Ghost's script is not in the registry** ⚑. **No design declares a width below which its script
  runs** ⚑ — neither module is width-conditional; 7's is native `<details>` and 8's runs at every width — so
  no design owes a two-sided no-JavaScript sentence on that account. **No registry addition was needed in this
  pass**: the upgrade action is a Portal link, the `<noscript>` line is markup, and 9's At zero is
  server-side. **No frame carries an "ARCHITECT: registry addition" note.**
- **Refused category-wide, each with a reason:** a comment count in the post header ⚑ (A24 owns it) ·
  a "jump to comments" link ⚑ (a browser affordance, and the section is the last thing on the route) ·
  sorting or filtering the thread (Ghost's, inside the block) · a moderator badge ⚑ · reply counts,
  top-comment pulls and quoted highlights ⚑ (all require reading inside the block) · `reveal` on the
  block ⚑ · **a comments overlay or drawer** ⚑ — the registry has no drawer module for anything but
  nav, and the closest is `nav-drawer`; that is a finding, not a licence to name one.

### The Data group — what replaces the Comments block group

Three fields, identical in all ten, **below** each design's own controls and the universal trio, **not
counted** ⚑, plus one read-only row.

| Field | Type | Values |
|---|---|---|
| *Comment box colour* | read-only | **Deleted as a control in this pass** ⚑ — the box takes its colour from a setting inside Ghost, Inflozo does not change it, and **no design passes `mode=`**. The row links to the setting |
| *Visitor dark-mode switch* | **not drawn** | **Where the project's colour scheme is pinned this control is not drawn at all** ⚑ — the one control this project can never offer — **and the panel says why**, as a sentence here: *"your site's colour scheme is fixed, so readers have nothing to switch."* **The comments widget takes its light or dark appearance from that same pinned value** and is given no second selector |
| `avatarSaturation` | enum req | Muted 40 · Standard 60 · Vivid 80 → `saturation=` |
| `whenClosed` | enum req | Show the notice · Hide the section · **Hide is 10's default** ⚑ |
| *Who can comment* | read-only | Nobody · All members · Paid-members only — **Ghost → Settings → Membership owns it; the section reports it and cannot change it** ⚑ |

**P0·5's "Populate from…" panel does not appear in A28** ⚑ — there is nothing to populate. The thread
is Ghost's, inside the block, and this group chooses its colour mode, its avatar saturation and
whether the section renders at all. That is the whole of the theme's reach.

### The control budget

The old 4–7 norm is lifted. **The ceiling is the PRD's ~15 visible controls per design, plus the
universal trio and the Data group.** A28 ranges **four to six**: four on 1, 2, 6, 7 and 10; five on
3, 4, 5 and 9; **six on 8**, the largest. Nothing came close to the ceiling, so **no design was cut to
fit**. Quick Controls are the 3–5 highest-impact rows, named on each control-panel frame's header
line.

### The editor primitives in play

| Primitive | Where it lands in A28 |
|---|---|
| **P0·1** inline text toolbar | Every authored string in all ten. **Link is disabled inside 7's `<summary>`** ⚑ — a link there is not operable. The comment count shows the **lock pill** instead of the toolbar. |
| **P0·2** icon slot + Icon Picker | **8 Prompt only** — the optional icon before or after each button label, always Small, inheriting the label colour. Nothing else in A28 is a button ⚑. |
| **P0·3** item-list controls | **2 and 6 only** — `rules[]`: add arrives with content, remove never disabled, drag reorder, per-item content only. |
| **P0·4** member-aware action editor | **8 Prompt only, twice** — the sign-up button (Portal `signup`) and the upgrade button (Portal `account/plans`). |
| **P0·5** "Populate from…" | **Nowhere** ⚑ — there is no authored data source in A28. |
| **P0·6** editor state switcher | The count's 0 · 1 · many, 7's open and closed, 8's three member states, and the closed-commenting state in all ten. |

### The roster

**[Free] designs:** 1 Rule · 5 Boxed — **recommended in this pass, awaiting the owner's word.** That line at
the head of this document is the merge's only input.

| # | Design | Tuple | When the content is thin | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Rule | `stack · none · page · none · none · one hairline above a labelled count` | Rules line goes; head sits 36 above the block | 4 | — |
| 2 | Split Head | `split · none · page · few · none · the head and house rules in a left column` | Column keeps 320; the block never widens | 4 | — |
| 3 | Panel | `stack · none · surface · none · none · the block on a raised plane` | Plane collapses to its content; goes at Hide | 5 | — |
| 4 | Contrast Band | `stack · none · contrast · none · none · an inverted band with the block re-moded` | The band goes with the section | 5 | — |
| 5 | Boxed | `stack · box · page · none · none · one hairline box round head and block` | The box is drawn round a short block | 5 | — |
| 6 | Rail | `edge rail · none · page · few · none · the head standing in the margin` | Rail keeps 240; below 1,200 it stacks | 4 | — |
| 7 | Disclosure | `bar · none · page · none · none · the block behind a disclosure bar` | No bar at all when commenting is off | 4 | `accordion` |
| 8 | Prompt | `form · none · page · none · none · the member prompt leads` | Free member → upgrade form; member → the prompt hides and the block leads | 6 | `member-form` |
| 9 | Big Count | `split · none · page · none · none · the count at display size` | At zero: the count line, not the figure | 5 | — |
| 10 | Slim | `stack · none · transparent · none · none · a single line and no ground` | Hides the section by default | 4 | — |

### Tuple uniqueness — the honest statement

**All ten are distinct on the five closed slots.** **Archetype carries the category** — four `stack`,
two `split`, and one each of `edge rail`, `bar` and `form`. **Ground separates the four stacks**:
`page` (1), `surface` (3), `contrast` (4), `transparent` (10). **Containment separates 5 from 1** —
`box` is a border, `card` is a plane, and A28 uses neither for its planes because it follows A26·3 and
A27·4 in calling a plane a ground (finding 4). **Item-count separates 9 from 2**: `few` where the
rules are an authored list, `none` where they are one line. **Media is `none` in all ten** ⚑ — A28
draws no pictures at all, and the only faces on the page are the ones Ghost draws inside the block.

**What the check cannot promise.** 1 Rule and 10 Slim differ in ground and in very little else — one
draws a hairline and its own ground, the other declares neither. The distinction is real (10 can be
dropped inside a plane and take its colour; 1 cannot) but **it rests on the emphasis phrase, which no
machine reads.** The reconciliation gives it one machine-readable consequence: **10's Background role is locked at *None: show whatever is behind* and 1's is not** — the shared row's new
fourth value, **Ruled by the owner on 29 August 2026** (finding 7).

### Repeating items — the whole category, in one place

**There is exactly one field in A28 that is an array the user authors:** `rules[]`, the house rules.
**Two designs draw it as a list — 2 Split Head and 6 Rail** — and both take item-count `few` for it.
The other eight draw `rulesText`, a single authored line, which is not an array. **The comments
themselves are not the section's items** ⚑: they are Ghost's, inside the block, and no control in this
category can add, remove, reorder, style or count them.

The list is **P0·3's shared item controls**, unchanged:

- **Add an item.** "+ Add a rule" at the foot of the list in the sidebar. **A new rule lands at the end
  of the list reading "Be kind"** ⚑ — real placeholder text, never an empty row — and opens for
  editing.
- **Remove an item.** The ✕ on each row, **never disabled**. **Removing the last remaining rule sets
  House rules to Off** ⚑ rather than leaving an empty list; the list returns with one rule when the
  user sets it back.
- **Reorder.** Drag by the ⠿ handle. **Order is meaningful in both designs** — they read top to bottom
  and the first is the one that gets read ⚑.
- **Minimum and maximum. One to four** ⚑ — **settled in this pass**, where the old text said "two to
  four" in one breath and "one rule is legal" in the next. **One rule is legal and is drawn as one
  bulleted line**; the Add control disables at four with its reason shown — a fifth rule in a 240 px
  rail runs past the block's first comment, which is where the design stops working.
- **At zero items.** House rules resolves to Off: no list, no bullet, no heading, no reserved space ⚑.
  2 becomes a head and a count in a 320 column, 6 a label and a count in a 240 rail. **Neither widens
  the block.**
- **The two architectural rules, checked.** **Every design control writes one value onto the section** —
  there is no per-rule styling anywhere in A28 and nothing in the category wants one. **Inside an item
  the user edits content only**: the rule's text, up to 60 characters, inline with the P0·1 toolbar.
  **A rule has no optional field, so there is no empty-field state inside an item** ⚑ — a rule with no
  text is a rule that gets removed.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `headingText` | text | yes | 40 ch | All ten · default "Discussion" ⚑ · the rail's label in 6, the 13 px label in 9 |
| `rulesText` | text | yes | 140 ch | 1, 3, 4, 5, 7, 9, 10 · and 2 and 6 at House rules One line |
| `rules[]` | list of text | yes | **1–4** × 60 ch | **2 and 6 only** ⚑ · the category's only authored array |
| `closedNotice` | text | yes | 80 ch | All ten · default "Comments are closed on this post." ⚑ |
| `countSingular` | text | no | 20 ch | All ten · default "comment" · **a bare noun** ⚑ — Ghost's script prepends the number, so a "%" or a `{count}` here renders literally |
| `countPlural` | text | no | 20 ch | All ten · default "comments" · drawn at 17 px in 9 · **a bare noun** ⚑, same reason |
| `countEmpty` | text | no | 40 ch | All ten · default "No comments yet" · 9's zero state at At zero Count line · **the bare-noun rule does not bind it** ⚑ — ruled 1 September 2026; one live check owed on Ghost's behaviour at zero |
| `promptHeading` | text | req in 8 | 40 ch | **8 only** · default "Join the discussion" ⚑ |
| `promptBody` | text | yes | 140 ch | 8 only · **shared by both prompt states** ⚑ · default "Members can reply, ask questions and tell us where we got it wrong." |
| `promptButton` | text | req in 8 | 20 ch | 8 only · default "Sign up" ⚑ · Portal `signup` |
| `signinLabel` | text | yes | 40 ch | 8 only · default "Already a member? Sign in" ⚑ |
| `upgradeHeading` | text | req in 8 | 40 ch | **8 only · new** ⚑ · default "Commenting is for paid members" |
| `upgradeButton` | text | req in 8 | 20 ch | **8 only · new** ⚑ · default "Upgrade" · Portal `account/plans` |
| `showLabel` · `hideLabel` | text | yes | 12 ch each | **7 only** · defaults "Show" and "Hide" ⚑ |
| ~~`blockMode`~~ | — | — | **deleted in this pass** ⚑ | **No design writes it.** The comment box's colour is a Ghost setting; the Data group links to it and passes no `mode=` |
| `avatarSaturation` | enum | no | Muted · Standard · Vivid | All ten |
| `whenClosed` | enum | no | Show the notice · Hide the section | All ten · Hide in 10 ⚑ |
| `signedOutReaders` | enum | no | The prompt only · The prompt and the block | **8 only** ⚑ |
| `freeMembers` | enum | no | The upgrade prompt only · The upgrade prompt and the block | **8 only** ⚑ · **greyed, with the reason beside it, where commenting is open to all members** — it was hidden there until 1 September 2026 |

Read from Ghost, never authored:

| Value | Type | Read by |
|---|---|---|
| `{{comment_count}}` | int | All ten · pluralised by the three authored words ⚑ · **twice in 9**, bare and pluralised · **drawn by Ghost's script, so without JavaScript it creates no element at all** ⚑ · **its accessible label sits on the surrounding element, never on it** ⚑ |
| `{{#if comments}}` | bool | All ten · false → `whenClosed` |
| `{{#if @member}}` | bool | **8 only** · with the commenting setting, decides between three arrangements |
| *Ghost setting:* commenting | enum | **Read-only in the sidebar, in all ten** ⚑ · **8 reads it to choose an arrangement** |

Translation-catalog strings, authored nowhere: **`comments.noscript`** "Comments need JavaScript." ⚑
and the `aria-label="Comments"` at Heading None ⚑.

**Fourteen authored strings, one array and five enums is the entire authored surface of A28.** **10
Slim reads the fewest** (a head, a notice, the count's words); **8 Prompt reads the most** and is the
only design that reads `{{#if @member}}`. Switching between any two of the ten preserves everything: a
site on 2 Split Head that switches to 1 Rule keeps its `rules[]` and stops drawing them ⚑.

---

## 1 · Rule

**Descriptor.** One hairline, a labelled count and a line of house rules above Ghost's block, on the
article measure. The category default and the one the other nine depart from.

**Structural descriptor.** `stack · none · page · none · none · one hairline above a labelled count` —
containment `none`, the section draws no box and no plane; count `none`, the section itself repeats
nothing ⚑.

**Archetype.** stack. **No departures** — a stack is already what the ladder collapses everything else
into.

**Responsive rule. 1440** measure 720 centred on a 72 margin, hairline the full measure, label 13
uppercase, count 15 at the right, rules 15 clamped at 620, 36 to the block, padding 96. **834** measure
754, padding 80, everything else held. **≤ 767** measure 350, **count under the label** ⚑, rules full
width, 28 to the block, padding 64.

**Content fields.** `headingText` · `rulesText` · `closedNotice` · the count's three words. From Ghost:
`{{comment_count}}`, `{{#if comments}}`. **No post field, no image, no author.**

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Count | Beside · Under · Off |
| House rules | On · Off |
| Width | Measure · Content |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Four.** Then the universal trio and the Data group. **Quick: Heading, Count, House rules.**

**Data.** `{{comment_count singular=countSingular plural=countPlural empty=countEmpty}}` and
`{{comments title="" count=false}}`. **0** → the `countEmpty` line and the block renders its editor.
**1** → "1 comment". **Many** → Ghost paginates inside the block; the section neither knows nor cares.

**Empty state.** No `rulesText` → the line and its 12 px go. `{{#if comments}}` false → the notice
replaces the block, or the section goes at Hide. **The section never draws a placeholder comment, an
outline or a reserved height** ⚑.

**Behaviour module.** **none.** **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. So the right-hand end of the head row is empty. **The comments widget itself does render.** It stands where it always did, with the hairline, the head and the rules line above it. **Category-wide, not a design defect** ⚑ (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>` named by the head, an `h2`; `aria-label="Comments"` at
Heading None ⚑. **The count is beside the heading and never inside it** ⚑ — Ghost's script draws it, and a name that can be
missing is not a name; `aria-label="Comments"` covers Count only as well as None. **Focus order enters the block after the rules line
and the theme controls no stop inside it** ⚑. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing** and **Divider (On · Off)** into **Top
divider (None · Line · Fade)**, both outside the list — Line is what On drew, Fade is new, and Line
stays the default because the hairline above the head is the seam this design is built on. The count's
three words become fields, Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group is
recut as the Data group, and the `<noscript>` line arrives. **Four controls of its own.**

**Flagged ⚑.** "Discussion" as the default head · `countEmpty` "No comments yet" · always passing
`title="" count=false` · the count moving under the label at 390 · Width doing nothing below 834 · A28
sitting below A26 and above A27 · drawing nothing extra when signed out · no-JS leaving the head and the rules standing with no count and no block, above one line.

---

## 2 · Split Head

**Descriptor.** The head, count and house rules in a fixed left column beside Ghost's block. The design
for a publication that moderates and wants its rules read.

**Structural descriptor.** `split · none · page · few · none · the head and house rules in a left column`
— count `few`, the rules list is one to four items; 9 Big Count is the other `split · none · page` and
is separated on exactly this slot.

**Archetype.** split. **One departure: it collapses at 834 rather than 767** ⚑ — at 754 a 320 column
leaves the block 362, and Ghost's editor row plus a 40 px avatar does not compose there.

**Responsive rule. 1440** 320 · 72 · 904 on 1,296; heading 28, count 15 under it, rules 15 with 5 px
bullets, **top-aligned to the block's box, not its editor row** ⚑. **834** stacked at 754, count beside
the heading, rules full width, padding 80. **≤ 767** stacked at 350, count under the heading, padding
64. **Head column and Sticky head stop applying when stacked** ⚑.

**Content fields.** `headingText` · `rulesText` (at One line) · `rules[]` **1–4 × 60 ch, authored and
ordered** ⚑ · `closedNotice` · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Head column | Narrow 280 · Standard 320 · Wide 384 |
| House rules | Off · One line · List |
| Sticky head | On · Off |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Four.** Then the universal trio and the Data group. **The item list is not counted** — it
edits content. **Quick: Heading, Head column, House rules, Sticky head.**

**Data.** As 1 Rule. The count sits under the heading and **is not repeated anywhere else** ⚑.

**Empty state.** Rules off or list empty → the column is head and count alone at 320, and **the block
does not widen** ⚑. Heading None with rules on → a column of rules with no head, drawn and legal. Both off → the column is a count alone at 320, the block still does not
widen, and **it is still 2 Split Head** ⚑ — the panel may advise 1 Rule and never switches to it.

**Behaviour module.** **none.** Sticky head is CSS — `position: sticky` needs no JavaScript and declares no module ⚑. **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. So the left column is a head and its rules with nothing under them. **The comments widget itself does render.** It stands in the right column, and both columns draw (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2`. **The rules are a `<ul>`**, so a screen
reader announces "list, 3 items" before the block ⚑. DOM order head → rules → block at every width. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`rules[]` is
settled at one to four** ⚑ — one rule is drawn as one bulleted line, and removing the last sets House
rules to Off — and the list is named as **P0·3's** item controls. The count's words become fields,
Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group is recut as the Data group.
**Four controls of its own.**

**Flagged ⚑.** 320 · 72 · 904 · top-aligning to the block's box · collapsing at 834 · List as this
design's default · the new-rule placeholder "Be kind" · the notice keeping the block's column · sticky
off by default · removing the last rule setting House rules to Off.

---

## 3 · Panel

**Descriptor.** The whole section on a raised surface plane, inset from its own edge, at the measure
plus that inset.

**Structural descriptor.** `stack · none · surface · none · none · the block on a raised plane` —
ground `surface` is the whole of the difference from 1 Rule. **Containment stays `none`: A26·3 and
A27·4 both called a plane a ground, and A28 follows them** ⚑ (finding 4).

**Archetype.** stack. **One departure: the plane is kept at 390** ⚑ where A25·3's sheet is dropped
below 767.

**Responsive rule. 1440** plane 816 centred (720 + 2×48) or 1,296, inset 48, heading 28, count beside
it, block 720. **834** plane 754, inset 32, block 690, padding 80. **≤ 767** plane 350, inset 20, block
310, count under the heading, padding 64. **Panel width stops applying below 1,200** ⚑.

**Content fields.** `headingText` · `rulesText` · `closedNotice` · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Panel width | Measure · Content |
| Inset | Compact 32 · Comfortable 48 · Spacious 64 |
| House rules | On · Off |
| Plane edge | Soft · Hairline (**Soft greyed in dark, with the reason beside it at the control** — *"not available in dark: the hairline carries every plane here"*) |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Five.** Then the universal trio and the Data group. **Quick: Heading, Panel width, Inset,
House rules.**

**Data.** As 1 Rule. **At Panel width Content the block is 1,200 wide and its lines are not clamped** ⚑
— clamping would mean styling inside the block.

**Empty state.** Rules off → plane is head and block. `{{#if comments}}` false → the notice on the
plane and **the plane shrinks to its content** ⚑. At Hide the section **the plane goes with the
section** — it is the section's ground, not the page's furniture ⚑.

**Behaviour module.** **none.** **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. **The comments widget itself does render.** So the plane carries a head, a rules line, its inset and the widget — **the design this fact costs least**, where the previous pass had it costing most (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2`. **The plane is a `<div>` with no role** ⚑ —
it is a colour, not a region. Muted on surface is 5.4:1 in Paper light, re-checked per pack. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**; **Inset stays**, because a plane's internal
padding is not the space around the section — **the ladder A27·4 Panel leaves fixed at 40 px, and that
disagreement is recorded rather than settled uninstructed**. **Background role is deliberately
unlocked**, on A27·4's argument: the plane is one step from the page at every value, and at Contrast it
lifts *off* the band rather than becoming 4 Contrast Band, whose block sits *on* it. Count words become
fields, Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group is recut as the Data group. **Five controls
of its own.**

**Flagged ⚑.** 816 = 720 + 2×48 · inset stepping to 32 and 20 by width · the plane surviving at 390 ·
Soft disabled in dark · not clamping the block at Content · the plane collapsing to its content · the
plane leaving with the section at Hide · **Ghost's white field on a white plane** (finding 1's smaller
cousin, drawn on the frame).

---

## 4 · Contrast Band

**Descriptor.** The section as a band of the pack's contrast colour, the measure centred in it, the
block re-moded to match the band rather than the page.

**Structural descriptor.** `stack · none · contrast · none · none · an inverted band with the block
re-moded` — containment `none` even at Band edges Content ⚑, A25·4's call: a band is a ground, not a
box.

**Archetype.** stack. **One departure: the band does not collapse at any width** ⚑.

**Responsive rule. 1440** band full bleed or 1,296 inset at the pack radius; Vertical spacing's 64 · 96
· 132 *inside* it and **none outside** ⚑; measure 720 centred; heading 28 in contrast ink. **834** band
full bleed, padding 80, measure 754. **≤ 767** padding 64, measure 350, count under the heading. **At
Band edges Content the inset drops 72 → 40 → 24** ⚑.

**Content fields.** `headingText` · `rulesText` · `closedNotice` · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Band edges | Full bleed · Content |
| Alignment | Left · Centre |
| House rules | On · Off |
| Width | Measure · Content |
| Background role (universal) | **Locked at Contrast**, reason shown |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | **Locked at None**, reason shown |

**Five.** Then the universal trio — **Background role locked at Contrast and Top divider locked
at None**, reasons shown — and the Data group, **whose Block colour row is gone** ⚑ — there is
nothing left to force: the box's colour is Ghost's own setting and this design needs it pointed
at the band. **Quick: Heading, Band edges, Alignment, Width.**

**Data.** As 1 Rule. **No `mode` attribute is passed at all** ⚑ — the comment box takes its colour from a
setting inside Ghost, which this design needs pointed at the band: dark in a light pack, light in a dark one.
**So this design is offered only on a project whose colour scheme is pinned** ⚑; where the scheme follows the
visitor's system, half the audience would read a light thread on a dark band. **Alignment moves the head
and the rules; the block never centres** ⚑.

**Empty state.** Rules off → head and block. `{{#if comments}}` false → the notice in contrast ink
inside the band; **at Hide the section the entire band goes** ⚑ and the route closes A26 straight into
A27.

**Behaviour module.** **none.** **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. **The comments widget itself does render.** The band, its bleed and its derived colours draw with the widget standing in them, so **the design's whole argument survives** (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2`. Contrast ink on contrast ground is 14.6:1 in
Paper light and 13.9:1 in Paper dark; **a pack whose muted contrast fails is corrected in the pack, not
here** ⚑. **Ghost's block sets its own contrast and we cannot audit it** ⚑ (finding 2). **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Band padding retired into **Vertical spacing**, which resolves *inside* the band
because the band **is** the section — **rule 3's band-internal exemption was considered and declined**,
on A27·5's precedent, and that is recorded rather than decided quietly. **Background role locked at
Contrast, Top divider locked at None**, both with the reason drawn. **Block colour stays forced and
disabled.** Count words become fields; the block group is recut as the Data group. **Five controls of
its own.**

**Flagged ⚑.** The band carrying all the section's vertical spacing · no outer padding at all · forcing
and disabling Block colour · the block never centring · the 72 → 40 → 24 inset ladder · the band not
collapsing · the dark band being lighter than the page · refusing accent anywhere in the band.

---

## 5 · Boxed

**Descriptor.** A hairline box round the head, the rules and the block, with the head in its own
divided row at the top of the box.

**Structural descriptor.** `stack · box · page · none · none · one hairline box round head and block` —
**the only `box` in A28**. A border, not a plane: 3 Panel is the plane, and the two are separated on
this slot alone.

**Archetype.** stack. **One departure: the box is kept at every width** ⚑.

**Responsive rule. 1440** box 800 (720 + 2×40) or 1,296, inset 40, head row 20/40 with a divider, block
720. **834** box 754, inset 28, block 698, padding 80. **≤ 767** box 350, inset 18, block 314, count
under the label, padding 64. **Box width stops applying below 1,200** ⚑.

**Content fields.** `headingText` · `rulesText` · `closedNotice` · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Box width | Measure · Content |
| Head row | Divided · Plain |
| House rules | On · Off |
| Inset | Compact 28 · Comfortable 40 · Spacious 56 |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Five.** Then the universal trio and the Data group. **No fill control** ⚑ — a box with a
surface fill is 3 Panel with an extra hairline, and a value that lets one design impersonate
another breaks the roster. **Quick: Heading, Box width, Head row, Inset.**

**Data.** As 1 Rule.

**Empty state.** Heading None → **no head row and no divider** ⚑, not an empty row. Rules off → the
block sits at the inset. `{{#if comments}}` false → the notice inside the box, box kept; at Hide the box
goes with the section. Zero comments → **the box closes round a short block and reserves no height** ⚑.

**Behaviour module.** **none.** **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. So the head row draws with nothing at its right-hand end. **The comments widget itself does render.** It is what the box closes round; box, head row, divider and inset all draw (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2` inside the head row. **The box is a `<div>`
with no role and the divider is a border, not an `<hr>`** ⚑. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**; **Head row and Inset both stay**, being a
border *inside* the box and the box's internal padding rather than the section's seam and spacing.
Count words become fields, Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group is
recut as the Data group. **Five controls of its own.**

**Flagged ⚑.** 800 = 720 + 2×40 · one hairline weight everywhere · no fill control · Heading None
removing the whole row · the inset ladder 40/28/18 · the box surviving at 390 · drawing the box round an
empty block · no shadow in either mode.

---

## 6 · Rail

**Descriptor.** The label, count and house rules standing in the page margin on A25's rail division,
with Ghost's block in the 1,008 column beside them.

**Structural descriptor.** `edge rail · none · page · few · none · the head standing in the margin` —
the only `edge rail` in A28; count `few` for the rules list, one to four.

**Archetype.** edge rail. **One departure: the rail leaves at 1,200 rather than the ladder's 834** ⚑ —
the margin decides, not the breakpoint.

**Responsive rule. 1440** rail 240, gap 48, block 1,008 on 1,296; label 13, count 22, rules 14.
**1,200 and below** the rail leaves: label, count and rules stack above the block at the content width,
rules step to 15 — **stacked, it is still 6 Rail** ⚑, a label, a count and a list above the block. **834** as stacked,
padding 80. **≤ 767** count under the label, padding 64. **Rail side and Sticky rail stop applying below
1,200** ⚑.

**Content fields.** `headingText` (the rail's label) · `rulesText` · `rules[]` 1–4 × 60 ch ·
`closedNotice` · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Rail side | Left · Right |
| House rules | Off · One line · List |
| Sticky rail | On · Off |
| Count | Under the label · Beside it · Off |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Four, and no Heading control** ⚑ — the rail is the head, so a control offering four head
values would be offering to draw a second one. A27·7 Rail made the same call. Then the universal
trio and the Data group. **Quick: Rail side, House rules, Count, Sticky rail.**

**Data.** As 1 Rule. **The rail draws the count at 22 px, so `countEmpty` reads at display size when the post is quiet** ⚑ — and
with JavaScript off neither the number nor that word renders at all ⚑ — the one place in A28 where a zero state is the biggest thing in the section, and
the clearest reason the three words became fields.

**Empty state.** Rules off → a label and a count in a 240 rail; **the block does not widen** ⚑. Count
off and rules off → a label alone, legal and drawn. `{{#if comments}}` false → the notice in the 1,008
column, rail kept; at Hide both columns go ⚑.

**Behaviour module.** **none.** Sticky rail is CSS. **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. The count was 22 px, the biggest thing in the rail, so a scriptless rail is **its label and its rules**; `countEmpty` does not render there either, because that word is Ghost's script too ⚑. **The comments widget itself does render.** It stands in the 1,008 column beside them (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>` named by the rail's label, which is the `h2` ⚑. **DOM
order is rail then block at every width, including Rail side Right, where the visual order is reversed
by grid placement and the reading order is not** ⚑. Rules are a `<ul>`. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`rules[]`
settled at one to four** with **P0·3's** item controls named. **The count's three words become fields**,
which matters most here. Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑; the block group is recut
as the Data group. **Four controls of its own.**

**Flagged ⚑.** A25's 240 · 48 · 1,008 division · no Heading control · the rail leaving at 1,200 · the
block never widening · the count at the rail's display size · sticky off by default · reversing Rail
side by placement rather than DOM order · the stacked form staying 6 Rail.

---

## 7 · Disclosure

**Descriptor.** A full-width bar carrying the label, the count and a Show or Hide, with Ghost's block
inside a native disclosure beneath it.

**Structural descriptor.** `bar · none · page · none · none · the block behind a disclosure bar` — the
only `bar` in A28; archetype `bar` rather than `stack` because the row, not the stack, is the design.

**Archetype.** bar. **No departures** — a bar does not collapse.

**Responsive rule. 1440** bar 720 (or 1,296), 56 tall, label 13 or heading 22, count 15, Show/Hide 14
with an 11 px chevron; open adds 26 px, the rules and the block. **834** bar 754, padding 80. **≤ 767**
bar 350, 52 tall, count beside the label, **the word kept rather than reduced to a chevron** ⚑, padding
64.

**Content fields.** `headingText` · `rulesText` · `closedNotice` · `showLabel` / `hideLabel` text opt
12 ch, defaults "Show" and "Hide" ⚑ · the count's three words.

**Controls.**

| Control | Values |
|---|---|
| Heading | **Label · Heading only** — Count only and None would leave a bar with nothing to click |
| Default state | Open · Closed |
| Bar width | Measure · Content |
| House rules | On · Off (**inside the disclosure**) |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Four.** Then the universal trio and the Data group. **Default state is Open** ⚑: the bar
exists so a reader can put a long thread away, not so a publication can hide it. **Quick:
Heading, Default state, Bar width, House rules.**

**Data.** As 1 Rule. **The count is on the bar, so it is readable while the block is closed** ⚑ — the
reason the bar carries it. **At Closed the block still mounts and Ghost's script still loads** ⚑;
`<details>` hides its contents, it does not defer them, so this design saves 900 px of page, not a
request.

**Empty state.** Zero comments → the bar reads the `countEmpty` line and **still opens**, onto Ghost's
editor ⚑. `{{#if comments}}` false → **no bar at all** ⚑: the notice stands alone, because a disclosure
with nothing behind it is a control that lies.

**Behaviour module.** `accordion`. **Registry no-JS, quoted:** "Native `<details>` — fully functional, keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the server-rendered `open` attribute." **So the bar works without JavaScript — and it takes two more sentences after that** ⚑. **The count on the bar renders nothing at all**: no number, no word, **no element**, so a scriptless bar is a label and a Show or Hide. **The comments widget itself does render.** It is what opening the bar reveals (finding 3). **The count is why this design puts a bar there at all, and that argument holds only with script.** **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑. **This design declares no width below which its script runs** ⚑ — `<details>` is native and runs at every width — so it owes no two-sided sentence on that account.

**Accessibility.** `<details>` / `<summary>`, so the open state is announced by the browser and needs no
`aria-expanded` of ours ⚑. **The `h2` is inside the `<summary>`**, which keeps the section in the
heading outline while closed. **Focus does not move into the block on open** ⚑. The chevron rotation is
160 ms ease-out and **is dropped under reduced-motion while the word still changes** ⚑. **Editing
`showLabel` and `hideLabel` in place:** while the section is selected a click on the word edits it and
the rest of the bar still toggles, and **P0·1's Link action is disabled there with its reason shown** ⚑
— a link inside a `<summary>` is not operable. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`showLabel`
and `hideLabel` now edit inline**, with the two rulings above — the click that edits is not the click
that toggles, and Link is disabled inside a `<summary>`. Count words become fields, Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group is recut as the Data group. **Four controls of
its own.**

**Flagged ⚑.** Default state Open · Heading offering two values · the whole bar as the target · keeping
the word at 390 · rules inside the disclosure · no bar when commenting is off · the block mounting while
closed · dropping the rotation under reduced-motion.

---

## 8 · Prompt

**Descriptor.** The publication's own membership prompt in place of the block for readers who cannot comment,
with the count of the discussion they cannot see — **a count Ghost's script draws, and a form Ghost's script
posts** ⚑, so with JavaScript off the reader gets the prompt, no number, and a designed notice where the field
was.

**Structural descriptor.** `form · none · page · none · none · the member prompt leads` — the only
`form` in A28. Ground `page`: **the prompt's plane is the prompt's, not the section's** ⚑, the same
reading 1 Rule uses for the block.

**Archetype.** form. **One departure: the field and button do not stack at 390** ⚑.

**Responsive rule. 1440** measure 720, prompt plane 720 with a 24/26 inset, heading 22, body 15 clamped
at 520, field 280 × 44, button 44. **834** prompt 754, one row, padding 80. **≤ 767** prompt 350, field
168, button beside it, count under the label, padding 64 — 168 + 10 + 100 fits inside 350 with the field
still showing a whole address, and a stacked form reads as two separate actions. **The upgrade state has
no field**, so it is one heading, one line and one button at every width ⚑.

**Content fields.** `headingText` · `promptHeading` req 40 ch, default "Join the discussion" ⚑ ·
`promptBody` opt 140 ch, **shared by both prompt states** ⚑ · `promptButton` req 20 ch, default "Sign
up" ⚑ · `signinLabel` opt 40 ch · `upgradeHeading` req 40 ch, default "Commenting is for paid members"
⚑ · `upgradeButton` req 20 ch, default "Upgrade" ⚑ · `rulesText` · `closedNotice` · the count's three
words.

**Controls.**

| Control | Values |
|---|---|
| Heading | Label · Heading · Count only · None |
| Prompt style | Panel · Hairline |
| Form | Email field · Link only |
| Signed-out readers | The prompt only · The prompt and the block |
| Free members | The upgrade prompt only · The upgrade prompt and the block (**greyed where commenting is open to all members, with the reason beside it** — *"not available while anyone who signs up can comment"*) |
| House rules | On · Off (**off by default here**) |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Six — the most in A28.** Then the universal trio and the Data group. **Quick: Prompt style,
Form, Signed-out readers, Free members.**

**Data.** `{{#if @member}}` **and the Ghost commenting setting** decide between **three arrangements**
⚑. **Signed out** → head, count and the prompt; the count comes from `{{comment_count}}`, which renders without the block ⚑ — **but only with JavaScript**:
Ghost's script draws that number, so a scriptless signed-out reader gets the prompt and no count at all ⚑. **Signed-in free member, commenting paid-members only** → head, count and **the
prompt in upgrade form**: `upgradeHeading`, the shared `promptBody`, `upgradeButton` on Portal's
`account/plans` through **P0·4**, and **no email field**, because this reader already has an account ⚑.
**Member who can comment** → the prompt hides and the block leads, **and it is still 8 Prompt** ⚑ — the panel
may advise 1 Rule and never switches to it. **0 and signed out** → the
prompt under the `countEmpty` line, the weakest case and still composed. **Ghost's own prompt inside the
block cannot be suppressed** ⚑, which is why the second value of either row shows two calls to action
and says so on the control. **ARCHITECT: verify** — what Ghost renders to the free member inside the
block is undocumented and was not verifiable; the state is designed as though Ghost renders nothing.

**Empty state.** No `promptBody` → heading, form and sign-in line, 20 px shorter — **in both prompt
states, which share the one body** ⚑. No `signinLabel` → the line goes; **Portal still handles an
existing member typing a known address** ⚑. **The upgrade state draws no sign-in line at all** ⚑ — the
reader is signed in. `{{#if comments}}` false → the notice and **no prompt of either kind** ⚑: inviting
a reader into a conversation that is closed is worse than saying it is closed.

**Behaviour module.** `member-form` at Form Email field; **none** at Link only, and **none in the upgrade state**, which is a link to Portal. **The registry's "posts natively to Ghost's members endpoint" quote is withdrawn** ⚑ — tested against two live Ghost servers, Ghost's signup endpoint refuses a plain form submission — so **the designed no-JavaScript notice replaces the form** at the form row's own height: *"Signing up needs JavaScript — turn it on to comment."* The **sent, error and loading states are Ghost's own script and are unchanged**. **Both buttons are conditional**: they do not render where the connected site cannot take them (self-signup switched off, or no payment provider connected), and where they do they open Ghost's own window — **with JavaScript off, nothing happens** ⚑. **This frame degrades three ways and needs three sentences** ⚑, one more than the rest of the category. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. The prompt's words are server-rendered and draw beside that absence. **The comments widget itself does render.** It renders wherever the arrangement shows it. **The form is the third**: it does not post, and the designed notice stands where the field and button were (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2`, `promptHeading` — or `upgradeHeading` — an
`h3`. The field has a real `<label>`, visually hidden, reading "Email address" ⚑. Errors are Ghost's and
are announced by Ghost. Focus order: head → field → button → sign-in link; **in the upgrade state,
head → button** ⚑, the shortest focus path in A28. Paper dark accent `#E0805A` on `#171511` is 8.9:1 ⚑. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**, and **Top divider arrives as a row this
design never had** (None by default, because Prompt style Hairline already draws one). **The
free-member-under-paid-commenting state is designed** ⚑: **Free members** joins the panel,
`upgradeHeading` and `upgradeButton` join the fields, the button takes **Portal's upgrade action**
through P0·4, the email field is never drawn there, and `promptBody`'s default is neutralised so one
string serves both states. **Member Visibility is not offered**, on rule 9's own exception — this design
already carries a richer member-state model, and a fourth Everyone / Logged out / Free / Paid row on top
of it would be two systems answering one question. **Rule 11 lands here and only here**: both buttons
take an optional icon from **P0·2**. Count words become fields; the block group is recut as the Data
group. **Six controls of its own.**

**Flagged ⚑.** **Withholding the thread from signed-out readers by default** · the count rendering
without the block · the prompt never being drawn to a member who can comment · **one body shared by two
headings** · **no email field in the upgrade state** · rules off by default · the field and button not
stacking at 390 · no prompt when commenting is closed · Ghost's prompt being unsuppressable.

---

## 9 · Big Count

**Descriptor.** The comment count set at display size in a column beside the block, with the label and
house rules under it.

**Structural descriptor.** `split · none · page · none · none · the count at display size` — separated
from 2 Split Head on item-count: `none` here, `few` there. The column carries a number and a line, not
an authored list.

**Archetype.** split. **One departure: it collapses at 1,200 rather than 834** ⚑ — below that the block
would be under 700 px with a 416 column beside it.

**Responsive rule. 1440** 416 · 72 · 808 on 1,296; label 13, figure 76 or 104 with a .92 line, word 17,
rules 15 clamped to the column. **1,200 and below** stacked, figure 68, rules clamped at 620. **834** as
stacked, padding 80. **≤ 767** figure 56, word 15, padding 64. **Count size and Number position stop
applying below 1,200** ⚑.

**Content fields.** `headingText` (the 13 px label) · `rulesText` · `closedNotice` · the count's three
words — **this design draws `countPlural` at 17 px beside a 76 or 104 px figure and `countEmpty` as its
whole zero state** ⚑. From Ghost: **`{{comment_count}}` twice — once bare for the figure, once
pluralised for the word** ⚑, so "1 comments" cannot happen.

**Controls.**

| Control | Values |
|---|---|
| Label | On · Off |
| Count size | Large 76 · Display 104 |
| Number position | Left · Above |
| House rules | On · Off |
| At zero | Figure · Count line |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact · Comfortable · Spacious |
| Top divider (universal) | None · Line · Fade |

**Five, and no Heading control** ⚑ — the figure is the head. **Count size does not move the
layout**: both sizes sit in the same 416 column ⚑. Then the universal trio and the Data group.
**Quick: Count size, Number position, At zero, House rules.**

**Data.** **0** → **At zero decides** ⚑: at **Count line**, the default, the column draws the 15 px
`countEmpty` line and **no figure at all**; at **Figure** it draws 0 at 76 or 104. **1** → "1" and the
`countSingular` word. **Four digits** → 1,284 at 76 px is 214 px inside a 416 column, so **the figure
never wraps and never shrinks to fit** ⚑; the comma is the helper's.

**Empty state.** Label off → the figure leads. Rules off → figure and word alone and **the column keeps
its 416** ⚑. **Zero comments** → the At zero value decides, **Count line by default** ⚑.
`{{#if comments}}` false → **no figure at all** ⚑ and the notice takes the block's column: a count of a
conversation nobody can join is a number without a referent.

**Behaviour module.** **none.** **No `count-up`** ⚑ — the registry has it and A10 uses it, but animating the size of a discussion as the reader arrives is a claim about momentum the section cannot support. **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The figure renders nothing at all** — the figure *is* the count, so no number, no word, **no element** ⚑ — and **At zero's count line does not render either**; a scriptless column is its 13 px label and its rules line. **The comments widget itself does render.** It stands in the 808 column beside an empty one, which is why this design is one of the two drawn on the proof frame (finding 3). **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>` named by **the 13 px label, which is the `h2`** ⚑ — **not the
figure and its word, as it was**: Ghost's script draws the figure, and a name that can be missing is not a name.
**At Label Off the section takes `aria-label="Comments"`** ⚑. The figure and its word are a `<p>`, and **the
figure takes the text token and never the accent** ⚑. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **At zero:
Figure · Count line** arrives, defaulting to **Count line** ⚑ — a display-scale 0 on a quiet site is an
embarrassment, so the shipped zero state is the 15 px count line and the old behaviour is a value a
publication chooses. **The count's three words become fields**, which matters most in the design that
sets one of them at 17 px next to a 104 px figure. Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑; the block group is recut as the Data group. **Five controls of its own.**

**Flagged ⚑.** 416 · 72 · 808 · 76 and 104 as the two sizes · the figure never shrinking or wrapping ·
**Count line as the zero default** · no Heading control · collapsing at 1,200 · refusing `count-up` ·
never accent · no figure when commenting is closed.

---

## 10 · Slim

**Descriptor.** One line of muted type above the block, on no ground of its own, at the category's
tightest spacing.

**Structural descriptor.** `stack · none · transparent · none · none · a single line and no ground` —
**the only `transparent` in A28.** Not `page`: the section declares no ground and shows whatever is
beneath it, which is how it survives being dropped inside a sheet or a panel ⚑.

**Archetype.** stack. **No departures**, and almost nothing to collapse.

**Responsive rule. 1440** measure 720 centred, head 17, 18 to the block, **spacing 40 · 64 · 96 — one
step below the category ladder** ⚑. **834** measure 754, spacing 36. **≤ 767** measure 350, gap 14,
spacing 28. **The head is 17 at every width** ⚑.

**Content fields.** `headingText` (at Heading Label) · `rulesText` (at House rules On) · `closedNotice`
· the count's three words — **at Heading Count only the count line is the whole of the theme's visible
text** ⚑.

**Controls.**

| Control | Values |
|---|---|
| Heading | Count only · Label · None (**Heading is not offered**) |
| Alignment | Left · Centre |
| House rules | On · Off (**off by default**) |
| Width | Measure · Content |
| Background role (universal) | **Locked at *None: show whatever is behind*** — the shared row's new fourth value |
| Vertical spacing (universal) | this design's own **40 · 64 · 96** ladder, at Compact by default |
| Top divider (universal) | None · Line · Fade |

**Four — still the shortest panel in A28.** Then the universal trio — **Vertical spacing running
this design's own 40 · 64 · 96 ladder at Compact by default**, and **Background role locked at
*None: show whatever is behind*** ⚑ — the shared row's new fourth value — and the Data group,
**defaulting to Hide the section** ⚑. **Quick: Heading, Alignment, House rules, Width.**

**Data.** As 1 Rule. **0** → the `countEmpty` line at 17 px above Ghost's editor, which at this scale is
the whole section.

**Empty state.** Heading None and House rules Off → **the section is the block and its spacing, and
nothing of the theme is visible** ⚑. That is legal, it is drawn, and it is the extreme this design
exists to reach. `{{#if comments}}` false → nothing renders, by default.

**Behaviour module.** **none.** **No-JS, and it takes two sentences, not one** ⚑ — the count and the widget degrade differently, tested against live Ghost servers on 31 August 2026. **The count renders nothing at all**: no number, no word, no empty box, **no element** — Ghost's script creates it and writes the number in. At Heading Count only the count is the theme's whole visible text, so **nothing of the theme renders at all**. **The comments widget itself does render.** The section is then the widget and its spacing, which is the honest floor of finding 3. **The `<noscript>` line keeps its wording** — *"Comments need JavaScript."* — **ruled by the owner on 1 September 2026**; what the widget draws in that state is not established by the test, so **one live check is owed and the line is not rewritten on a guess** ⚑.

**Accessibility.** `<section aria-labelledby>` named by the head at Heading Label; **at Count only and at None
the section takes `aria-label="Comments"`** ⚑ — the count can never be the name, because Ghost's script draws
it. **A 17 px muted head on a transparent ground is
checked against the ground it is dropped onto, not against the page** ⚑ — surface and page in Paper
differ by 2 % and both pass. **The count's accessible label sits on the surrounding element, never on the count itself** ⚑ — new on 1 September 2026: Ghost's script writes the number in, and a label on an element that may never exist is not a label.

**Reconciled.** Padding retired into **Vertical spacing** — **keeping this design's own 40 · 64 · 96
ladder and its Compact default**, recorded as a named exception rather than flattened into the
category's. **Background role is locked at *None: show whatever is behind***, the shared row's new fourth value —
**Ruled by the owner on 29 August 2026** — because ground `transparent` is this design's identity and every pack role
paints. **The value exists in the design system and not yet in the product, and it lands on the shared control
for every category**: that is finding 7. Count words become fields, Block colour has since left the panel altogether — the box's colour is Ghost's own setting ⚑, the block group
is recut as the Data group. **Four controls of its own.**

**Flagged ⚑.** Ground `transparent` rather than `page` · the 40 · 64 · 96 ladder · Compact as the
default · no Heading value above Label · the head holding at 17 · rules off by default · Hide the
section as this design's default · allowing a section with nothing of the theme in it but one
`<noscript>` line.

---

## Findings for the architect

1. **The block's accent is Ghost's, not the pack's.** Ghost's comments UI takes its accent from the
   site's accent colour setting. A theme in the Tangerine pack with a Ghost accent of blue shows a blue
   Reply button in every A28 section ⚑. **Inflozo must write the pack's accent into Ghost's accent setting at deploy**, or the category cannot keep its
   tokenisation promise. **The comment box's colour scheme is the same problem, found in this pass** ⚑ — it too
   is a setting inside Ghost that a theme cannot pass, which is why the Block colour row is gone and why
   4 Contrast Band is offered only on a pinned colour scheme. **Both have to be solved outside the theme.**
2. **Nothing inside the block can be styled or audited.** Type scale, spacing, avatars, buttons, focus
   rings and contrast are all Ghost's, inside a sandboxed frame. **The category's accessibility
   statement and its pack conformance both stop at the dashed outline** ⚑, and every design says so
   rather than implying a coverage it does not have. **The count is the same problem one step out** ⚑ — its
   element is Ghost's script's, not the template's, so **the accessible label goes on the surrounding element
   the theme does draw**, never on the count. New on 1 September 2026.
3. **The count and the widget degrade differently, and the two claims on file disagree.** `{{comment_count}}`
   is a placeholder Ghost's script fills, so **without JavaScript the count creates no element at all** — no
   number, not a zero, no `countEmpty` line — and that part is tested and settled. **The widget is where the
   record conflicts.** The 29 August pass wrote that **Ghost's comments-ui has no server-rendered equivalent
   and does not render**; the 31 August test against live Ghost servers says **the widget itself does render**.
   **This pass carries the tested finding and records the conflict rather than resolving it** ⚑ — see the Patch
   notes. **What the widget draws in that state was not established by the test**, so both consequences were **ruled by the owner on 1 September 2026**: the `<noscript>` line
   **keeps its wording** pending one live check, and **the frame is always drawn** — heading, rules and that
   line render whether or not the discussion can. **The standing question of this finding is closed**; what
   remains is the check. 7's bar still opens and closes; **8's form no
   longer posts** — Ghost's signup endpoint refuses a plain submission, so the notice replaces it. **Every
   design's no-JavaScript line is now two sentences, one for the count and one for the widget**, and 8's is
   three.
4. **Is a plane a ground or a containment?** A25·3 Sheet called a raised plane `card · surface`; A26·3
   and A27·4 called the same thing a ground with containment `none`. **A28 follows the later reading**
   ⚑ — 3 Panel is `stack · none · surface` — but the two cannot both be right, and the reconciliation
   pass has to settle one. It affects the tuple of every plane in the library.
5. **The free member under paid-only commenting.** Ghost's documentation states the block appears when
   comments are enabled and the reader has access to the post. **What is rendered to a signed-in free
   member when commenting is set to paid-members only is not documented and was not verifiable** ⚑.
   **Amended in this pass:** 8 Prompt now *designs* that state — the prompt in upgrade form, with a
   per-state heading and button and Portal's upgrade action — rather than assuming Ghost owns it; the
   other nine still assume it. **This still needs one live check before build**, and the frame keeps its
   **ARCHITECT: verify** flag. If Ghost renders nothing, 8's arrangement becomes the pattern the other
   nine need too.
6. **Route awareness, again.** A28 cannot know that an A26 footer sits directly above it, so the two
   paddings sit adjacent — 192 px at Comfortable. The third category in a row to raise it, and the same
   mechanism resolves all three.
7. **The universal Background role gains a fourth value, *None: show whatever is behind*.** ⚑ **New in this pass.** 10 Slim's ground is
   `transparent` — it declares none and shows whatever it is dropped onto, which is the whole of its
   difference from 1 Rule — and the universal control offers Background · Surface · Contrast, all three
   of which paint. **Settled on 29 August 2026** ⚑: **the shared control gains a fourth value, *None: show whatever is behind***,
   the word "Inherit" is withdrawn, and **10 Slim's row is locked at None** with the reason shown. **What is
   owed now is the build** — the value exists in the design system and not yet in the product — and **it lands
   on the shared control for every category, not on A28**. A28 is simply the first category to need it; every
   category with a design that paints no ground needs it next.

---

## Reconciliation notes

**Frames changed in this pass — eleven, and every one of them.** `A28-0 Category Proof` (a new
reconciliation banner, a new **drawn no-JS state**, settlements 1 and 2 rewritten, three new rules on
the shared floor, the roster's control counts and two thin-content cells, the repeating-items minimum,
six new rows in the field list, finding 5 amended and **finding 7 added**), and all ten design frames:
`A28-1 Rule`, `A28-2 Split Head`, `A28-3 Panel`, `A28-4 Contrast Band`, `A28-5 Boxed`, `A28-6 Rail`,
`A28-7 Disclosure`, `A28-8 Prompt`, `A28-9 Big Count`, `A28-10 Slim`. **On all ten:** the control-panel
frame was rebuilt — Padding retired, five Divider rows retired, the universal trio added outside the
list, a **Content group** added for the authored strings, the Comments block group recut as the **Data
group**, an **Editing group** added naming the P0 primitives; the masthead, the panel header line and
the footer count were rewritten with the design's Quick Controls; a **Reconciled** paragraph was added
to the panel card and the drawn spec's Controls entry was rewritten; and the dark frame's helper
annotation now reads `mode="auto"`. **Section frames redrawn on two** — **9 Big Count** (the zero state
is now the count line, with the display-scale 0 kept as a second drawn card at At zero: Figure) and
**8 Prompt** (a new drawn state for the free member under paid-only commenting, and the shared body
neutralised so one string serves both prompt states). **No other section frame was redrawn**: nothing
else in this pass changes what the site renders at the defaults.

**Where this pass conflicts with something A28 already ruled, one line each.**

- **"Match the page resolves to the pack's mode, not to `auto`" is withdrawn.** It was stated on the
  proof frame, in the shared group and on all ten panels. The old argument — that `auto` follows the
  reader's system rather than the page — was true only of a single-mode site; on a dual-mode Inflozo
  theme the page *is* the reader's system. ~~**Now: `auto` when the site ships both modes, the pack's mode when it ships one.**~~ **Struck on 1
  September 2026** — the Block colour row is gone and no design passes `mode=` at all, so there is nothing
  left to resolve. 4 Contrast Band is withheld on an unpinned scheme rather than forced.
- **The `rules[]` contradiction is settled at one to four.** "Two to four" and "one rule is legal and is
  drawn as one bulleted line" were both written down. The minimum is **one**; removing the last rule
  sets House rules to Off, which is where the old "two" was really coming from.
- **The count's three literals are withdrawn as literals.** `singular="comment" plural="comments"
  empty="No comments yet"` were flagged ⚑ but hardcoded. They are now `countSingular`, `countPlural` and
  `countEmpty` with those defaults — **panel fields, not inline-edited**, because the canvas shows one
  variant at a time.
- **"9 Big Count draws 0 at full size" is amended, not withdrawn.** The argument for it survives and is
  now what the **Figure** value is for; **Count line** is the default, and a display-scale zero is a
  choice a publication makes rather than the thing it ships.
- **"Every design assumes Ghost handles the free member inside the block" is amended for 8 Prompt
  only.** The other nine still assume it. The live check is still owed, and the frame still says so.
- **The 4–7 control norm is superseded** by the PRD's ~15 ceiling. A28 ranges four to six, so **no
  design was cut to fit** — and every design *lost* rows on net, because Padding and Divider left the
  lists.
- **Rule 3's "band-internal padding" exemption was declined on 4 Contrast Band.** The band *is* the
  section, so its vertical padding is Vertical spacing under another name. A27·5's identical call is the
  precedent. Recorded rather than resolved silently.
- **Rule 3's "genuinely different ladder" exemption was taken on 3 Panel's Inset and 5 Boxed's Inset,
  and declined on 10 Slim's Padding.** A plane's and a box's internal padding are not the space around a
  section; 10's 40 · 64 · 96 *is* that space, so it keeps the universal name and states its own ladder
  and its Compact default.
- **3 Panel keeps an Inset ladder where A27·4 Panel's inset is fixed at 40 px with no control.** The two
  categories now disagree about the same component. Recorded, not settled uninstructed.
- **10 Slim's Background role was locked at a value the product does not have.** **Settled in the design patch
  pass**: the shared row gains *None: show whatever is behind*, "Inherit" is withdrawn as a word, and 10 Slim's
  row is locked at None. The alternative — unlocking the row and letting three painting values overwrite a
  `transparent` ground — would have deleted the design's reason to exist.
- **Member Visibility lands nowhere in A28.** Nine designs draw no CTA at all: the only call to action
  on the page is inside Ghost's block, and Ghost gates it. **8 Prompt is rule 9's own exception** — its
  Signed-out readers and Free members rows plus the Ghost commenting setting are a richer member-state
  model, and a fourth row over the top would be two systems answering one question. A judgement, not an
  omission.
- **P0·5's "Populate from…" panel lands nowhere either.** There is no authored data source in A28; the
  Data group governs the block's colour mode and saturation, not a query.
- **Rule 10's Image focus lands nowhere.** A28 authors no image at all — media is `none` in all ten, and
  the only faces on the page are Ghost's, inside the block.
- **Rule 11's button icon lands once**, on 8 Prompt's two buttons. 7 Disclosure's chevron was considered
  and refused: it is the disclosure's state indicator, not a button icon.
- **No registry addition was needed**, and no frame carries an "ARCHITECT: registry addition" note. The
  upgrade action is a Portal link, the `<noscript>` line is markup, and 9's At zero is server-side. 7's
  `accordion` and 8's `member-form` remain the category's only two modules.
- **No Preview control was removed, because none existed.** Rule 7 is satisfied by construction; the
  states that used to need one — 7's closed bar, 8's three member states, the count's 0 · 1 · many — are
  attributed to **P0·6**'s state switcher.
- **P0·1's Link action is disabled inside 7's `<summary>`**, which is a new limit on a shared primitive
  rather than a redesign of it: a link inside a `<summary>` is not operable. Recorded here so the
  primitive's own spec can absorb it.
- **The `<noscript>` line is drawn once, on the proof frame, rather than ten times.** It is identical in
  all ten, sits in the same place relative to the head, and changes no arrangement — so ten redraws
  would have added no information. Each design's panel and spec name it.
- **One open item, named rather than answered.** Finding 5's live check: what Ghost renders to a signed-in free
  member under paid-only commenting. **Finding 7 is now closed** — the shared Background row gains *None: show
  whatever is behind* and 10 Slim's row is locked at it.

---

## Patch notes — comments patch, 29 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written here as an
**open question** and asked in plain words at the end.

**Frames changed — all eleven:** `A28-0 Category Proof` and `A28-1` … `A28-10`. Every design frame carries a
dated **design patch pass** panel at the top saying what changed on it and why, and `A28-0` carries the
category's version of the same panel above the settlements. **The drawn no-JavaScript state was redrawn** and
now shows two designs — 1 Rule and 9 Big Count — because the figure *is* 9's count. **8 Prompt gained one drawn
frame**: the no-JavaScript notice standing where its form was. **No layout was redesigned, no measure moved and
no colour changed.**

### This category's own rulings

| What changed | Why, and where |
|---|---|
| **The comment count is drawn by Ghost's own script, so with JavaScript off there is no number at all.** `{{comment_count}}` renders a placeholder that Ghost's comments script fills — **not a zero, nothing**, and no `countEmpty` line either. **Every design's no-JavaScript line is rewritten**, in the spec and on the frame; the proof frame's claim that *the count still renders because it is Handlebars* is **deleted**; the drawn state lost its count. Consequences by design: **6 Rail's** 22 px count and its display-scale "No comments yet" both go, leaving a label and a list; **7 Disclosure's** bar still opens but the number that justified putting it there is absent; **8 Prompt's** signed-out reader gets the prompt and no count; **9 Big Count** has no figure at all; **10 Slim** at Count only is the `<noscript>` line and nothing else. | *(The count is Ghost's script, not the template's.)* |
| **No section is named by its count.** A name Ghost's script has to draw is a name that can be missing, so every section's accessible name is now something the theme itself renders. **1 Rule's count leaves the `h2`** and sits beside it; **9 Big Count's `h2` is its 13 px label, not the figure and its word**, and at Label Off the section takes `aria-label="Comments"`; **10 Slim takes that label at Count only as well as at None**; 7's `h2` inside the `<summary>` is the head alone. The other six were already named by their head and now say so. | *(The count is Ghost's script, not the template's.)* |
| **The comment box's colour is a setting inside Ghost, and Inflozo does not change it.** **The Block colour row (Match the page · Light · Dark) is deleted from the Data group in all ten**, **no design passes `mode=` at all**, and a **read-only row links to the setting in Ghost** in its place. The previous pass's "Match the page resolves to `auto` on a dual-mode site" fix is **withdrawn as moot** — there is nothing left to resolve. Every drawn helper annotation on every frame lost its `mode=`. | *(Ghost owns the comment box; we own the chrome around it.)* |
| **4 Contrast Band is offered only where the project's colour scheme is pinned.** Its band inverts the page and the thread inside it can no longer be inverted with it, so on a project that follows the visitor's system preference **half the audience would read a light thread on a dark band**. The panel says so, and links to the Ghost setting the band needs pointed at it — dark box in a light pack, light box in a dark one. **It is withheld, not switched**: the design never becomes another design. **Ruled by the owner on 29 August 2026**: where the scheme is not pinned the design is **drawn greyed in the picker and cannot be placed**, under one line — *"Needs a fixed light or dark site — change that in your theme settings and this becomes available."* A site already using it is unaffected until its scheme changes. | *(Ghost owns the comment box; we own the chrome around it.)* |
| **No count label carried a "%".** Checked on all eleven frames: the count is a number and a word, never a share. **No subject, nothing removed.** | *(The count is Ghost's script, not the template's.)* |

### The library-wide rules

| Rule | What it did here |
|---|---|
| **The two free designs are the owner's choice — ask him** | Shortlisted the five plainest designs, none of which needs photography: **1 Rule** (the category default — a hairline, a label, a count and one line; nothing in it can be empty), **5 Boxed** (one hairline box, no fill and no shadow — the smallest thing here that still looks finished), **10 Slim** (one muted line and no ground of its own; it hides itself when commenting is off), **3 Panel** (the same stack on one raised plane) and **2 Split Head** (the house rules in a left column, for a publication that moderates). **Recommended 1 Rule · 5 Boxed**, and the line is at the head of this document in the required shape. **Awaiting the owner's word — question 1.** |
| **No design ever turns into another design** | **Three hand-off phrases deleted.** **2 Split Head** — *both off → the design is 1 Rule* becomes: the column carries the count alone at 320, the block still does not widen, and it is still 2 Split Head. **6 Rail** — *stacked, the design is 1 Rule with a list instead of a line* becomes: stacked, it is still 6 Rail, a label, a count and a list above the block; the inherited A25·1 hand-off phrasing is withdrawn with it. **8 Prompt** — *member who can comment → the design is 1 Rule* becomes: the prompt hides, the block leads, and it is still 8 Prompt. **In every case the panel may advise the neighbouring design and never switches to it**, and the roster's thin-content cell for 8 was rewritten to match. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **One subject: 8 Prompt, the only design in the category that draws a button.** Both of its buttons — Sign up (Portal's signup) and Upgrade (Portal's plans) — now carry the two lines in the panel and on the frame: **they do not render where the connected site cannot take them** (self-signup switched off, or no payment provider connected), and where they do render they open Ghost's own window, so **with JavaScript off, nothing happens**. The other nine draw no call to action at all: the only one on the page is inside Ghost's block, and Ghost gates it. |
| **The no-JavaScript notice** | **One subject: 8 Prompt's email form.** The registry's *"the `<form>` posts natively to Ghost's members endpoint"* quote is **withdrawn** — Ghost's signup endpoint refuses a plain form submission — so **the designed notice replaces the form** at the form row's own height: *"Signing up needs JavaScript — turn it on to comment."* Plain text, not an alert; no field and no button; the sign-in line kept beneath it. **Drawn on 8's frame beside the form it replaces.** **The sent, error and loading states are unchanged** — they are Ghost's own script and they work. |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all ten. The swatch row is **Base**. **Background role is locked in two** — 4 Contrast Band at Contrast, 10 Slim at **None: show whatever is behind** — each with the reason drawn. **No design renamed a shared control**, and this pass **deleted** one row, Block colour, from all ten with the reason drawn in its place. **The one conflict this rule raised is closed by the owner**: it also says there is no "Inherit" choice anywhere, and 10 Slim's row was locked at exactly that value — so **the shared row gains a fourth value, *None: show whatever is behind*, the word "Inherit" is withdrawn, and 10 Slim is locked at None**. The change is **library-wide** and is a finding for the architect, not a value this category invented. |
| **Item counts are a number picker** | **No subject.** A28 has no count row. Its one authored list, `rules[]`, is P0·3's add-and-remove list, not a number, and its floor and ceiling (one to four) were settled in the previous pass. |
| **The Remove button never greys out** | **One subject: `rules[]` on 2 Split Head and 6 Rail.** Already compliant and unchanged by this pass: **✕ is never disabled, never dimmed and never hidden**, removing the last rule sets House rules to Off rather than leaving an empty list, and it is **Add** that stops at four with the reason shown. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A28 draws no gap control. Its three surviving ladders are internal padding — 3 Panel's Inset, 5 Boxed's Inset, and 10 Slim's own vertical-spacing ladder — each in the standard padding words. |
| **Slider labels** | **No subject.** A28 draws no slider. Every control is a named-value row or a read-only row, and each title says what it affects. |
| **Avatars with no photograph** | **No subject.** A28 renders no person and draws no initials: every face and every avatar on the page is Ghost's, inside the block, where the theme cannot reach. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10.** Ten designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted. |

### The no-JavaScript line, per design

| # | Design | Behaviour declared | Without JavaScript |
|---|---|---|---|
| 1 | Rule | — | Hairline, head and rules line render. **No block and no count** — the right-hand end of the head row is empty. The `<noscript>` line stands where the block would have been. |
| 2 | Split Head | — | Both columns render; sticky is CSS. **No block and no count** — the left column is a head, its rules and the `<noscript>` line. |
| 3 | Panel | — | The plane, its inset, the head and the rules render. **No block and no count**; the `<noscript>` line is what the plane carries. |
| 4 | Contrast Band | — | The band, its bleed and its derived colours render — **the design's whole argument survives**. **No block and no count.** |
| 5 | Boxed | — | Box, head row, divider and inset render. **No block and no count**; the `<noscript>` line is what the box contains. |
| 6 | Rail | — | The rail, its label and its rules render; sticky is CSS. **No block, and no 22 px count** — nor the display-scale "No comments yet". |
| 7 | Disclosure | `accordion` | **The bar opens and closes** — native `<details>`, and Default state resolves to the server-rendered `open`. **No count on the bar**, and opening it reveals the `<noscript>` line. |
| 8 | Prompt | `member-form` at Form Email field | The prompt's words are server-rendered and render. **The notice replaces the field and button** — the form does not post. **No block and no count.** Both buttons open nothing. |
| 9 | Big Count | — | The 13 px label and the rules line render. **No block and no figure** — the figure *is* the count — and no At-zero count line. |
| 10 | Slim | — | The head renders at Heading Label. **No block and no count**; at Heading Count only, **the `<noscript>` line is the whole section**. |

### Still owed from the previous pass

**The live check on 8 Prompt is still owed.** What Ghost renders to a signed-in free member inside the block
when commenting is set to paid-members only is undocumented and was not verifiable; 8 Prompt designs that state
and the other nine assume Ghost handles it. The **ARCHITECT: verify** flag stays on 8's frame.

### Open questions

~~**QUESTION 1 — Which two designs a free site gets**~~
**SETTLED — 1 Rule · 5 Boxed. Settled by the owner on 29 August 2026**, recorded in the `**[Free] designs:**`
line at the head of this document and on the roster. Struck on 1 September 2026.

Every category gives two of its ten designs away, and which two is your call. The five plainest here — the ones
a real site could ship without looking unfinished, and that need no photography — are **1 Rule** (a hairline, a
small label, the count at the other end of it and one line of house rules), **5 Boxed** (the same words inside
one thin outlined box), **10 Slim** (a single quiet line and no background of its own), **3 Panel** (the words
and the discussion on one raised panel) and **2 Split Head** (the house rules in a column beside the
discussion).

1. **1 Rule · 5 Boxed — the default and the outline. (RECOMMENDED)**
   A free site gets the arrangement most publications expect, plus one with a visible container, so the two do
   not read as the same design twice. Costs nothing: neither needs a photograph, a list or a member button, and
   both draw identically whether or not the visitor has JavaScript. What it gives up: no free design carries the
   house rules as a list, so a publication that moderates has to fit its rules into one line.
   A visitor sees a thin line, the word "Discussion", "24 comments" at the far right, one line of house rules,
   then Ghost's comment box.
2. **1 Rule · 2 Split Head — the default and the one for moderators.**
   The free set can then carry up to four house rules as a list beside the discussion, which is what a
   publication with a comment problem actually needs. Costs: the customer has to write those rules, and a
   fixed 320-wide column narrows the discussion on a laptop.
   A visitor sees the rules stacked at the left — *Be kind · Stay on the story · No links to your own work* —
   with the comment box beside them.
3. **1 Rule · 10 Slim — the two quietest.**
   The smallest possible footprint under an article. Costs: 10 Slim and 1 Rule are nearly the same design — a
   free customer effectively gets one idea twice — and 10 Slim hides the whole section by default when
   commenting is switched off, which can read as a missing feature.
   A visitor sees one muted line, "24 comments", then the comment box.

~~**QUESTION 2 — The design that draws no background of its own**~~
**SETTLED — the shared background row gains a fourth value, *None: show whatever is behind*; "Inherit" is
withdrawn and 10 Slim's row is locked at None. Settled by the owner on 29 August 2026**, and carried to the
architect as finding 7 because the change is library-wide. Struck on 1 September 2026.

One design in this category, **10 Slim**, exists because it declares no background: dropped inside a coloured
panel it takes that panel's colour instead of painting over it. The shared background row offers three values
and **all three paint**, so the design's row is locked at a fourth, "Inherit", **which the product does not
have** — and one of the library rules says the word "Inherit" should not appear anywhere. The two cannot both stand.
**Closed: option 1.**

1. **Give the shared background row a fourth value — "None", meaning show whatever is behind. (RECOMMENDED)**
   It is the honest description of what several designs across the library will need, and it makes the rule and
   the design agree. Costs: the shared row changes for every category, and an editor can then set any section
   to no background, which on a design that needs one will look unfinished until they change it back.
   The editor sees *Background: Background · Surface · Contrast · None*.
2. **Lock the row at the ordinary page background instead.**
   Nothing new to build, and on a normal page a visitor sees no difference at all. Costs: dropped inside a
   coloured panel the section would paint the page colour over it — which is precisely the one thing this
   design was for, so it becomes 1 Rule with a smaller head.
   The editor sees *Background: Background (locked — this design draws no ground of its own)*.
3. **Delete 10 Slim.**
   The rule is satisfied with no product change. Costs: the quietest design in the category goes, the roster
   drops to nine, and the number 10 becomes a permanent gap that can never be reused.
   A visitor on a site that used it would see whichever design replaced it.

~~**QUESTION 3 — What a customer sees when a design needs a fixed light-or-dark site**~~
**SETTLED — the design is not offered: 4 Contrast Band is drawn greyed in the picker under one line saying why
and how to enable it. Settled by the owner on 29 August 2026.** Struck on 1 September 2026.

**4 Contrast Band** puts the discussion on an inverted band — dark on a light site. Ghost's comment box takes
its colour from a setting inside Ghost, which you set once, so the band only works on a site whose colour
scheme is fixed. On a site that follows each visitor's device, half the audience would get a light comment box
on a dark band. What should that customer see?

1. **The design is not offered, with one line saying why and how to make it available. (RECOMMENDED)**
   Nobody can pick something that will look broken for half their readers, and the line tells them the fix:
   fix the site's colour scheme, then this design appears. Costs: a customer who wants it has to change a site
   setting first, and one design quietly missing from a list of ten needs explaining.
   The editor sees the design greyed in the picker: *Needs a fixed light or dark site — change that in your
   theme settings and this becomes available.*
2. **It is offered with a warning, and they can place it anyway.**
   Nothing is withheld; the customer decides. Costs: the warning is read once and the mismatch lives on the
   site forever, and it is the kind of fault a customer blames on us rather than on a setting.
   The editor sees a caution line under the design: *Half your readers will see a light comment box on this
   dark band.*
3. **Offering it fixes the site's colour scheme automatically.**
   The design always looks right. Costs: placing one section silently changes a site-wide setting, and every
   reader who preferred dark mode loses it — far too much for one section to decide.
   The editor sees nothing; their site stops following readers' devices.

**Answered on 29 August 2026 — all three as recommended.** **Question 1: 1 Rule · 5 Boxed**, recorded in the
line at the head of this document and on the roster. **Question 2: the shared background row gains a fourth
value, *None: show whatever is behind***; the word "Inherit" is withdrawn, 10 Slim's row is locked at None, and
**the change lands on the shared control for every category** — a finding for the architect rather than a value
this category invented. **Question 3: a design that cannot work on a site is not offered on it** — where the
colour scheme follows the visitor's device, 4 Contrast Band is drawn greyed in the picker and cannot be placed,
under one line saying why and how to enable it; a site already using it is unaffected until its scheme changes.
**All three are closed and all three are struck.** **The items still open in this category are listed under
Patch notes — comments patch pass two, 1 September 2026, below**, each on its own line and marked **OPEN FOR
THE OWNER**; none of them is answered here.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10** — ten designs, no gap created or
  closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the required
  shape, and names **1 Rule** and **5 Boxed** — both of which exist in this category's roster. It is the
  owner's own choice, **confirmed on 29 August 2026**.
- **No registry module was invented.** A28 declares `accordion` (7) and `member-form` (8) — both existing
  entries — and no frame carries an "ARCHITECT: registry addition" note.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** ten designs, numbered **1–10**.

---

## Patch notes — comments patch pass two, 1 September 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written at the end as
an **open question** rather than guessed at.

**Frames changed — all eleven:** `A28-0 Category Proof` and `A28-1` … `A28-10`. Each carries a dated
**design patch pass two** panel above the 29 August one, newest first, and **every masthead now carries the
pass-two stamp**. **The drawn Data group on all ten gains the not-drawn visitor dark-mode row**; **3 Panel's
drawn Plane edge helper** is reworded from "disabled" to **greyed with the reason beside it**; **8 Prompt's
drawn Free members helper** is rewritten from "shown only at that Ghost setting" to **greys, never hidden**. **No layout was redesigned, no measure
moved, no colour changed, no control was renamed and no design's set of controls changed** except where named
below. **Nothing was renumbered.**

### The conflict, recorded rather than resolved

**The 29 August pass wrote that the comments block does not render without JavaScript. The 31 August test
against live Ghost servers says the widget does render.** Both statements are in this document's history and
they cannot both stand. **This pass carries the tested finding**, because it is a measurement and the other was
an inference from the registry, **and records the disagreement here rather than deleting the older claim**.
Two consequences follow, **both ruled by the owner on 1 September 2026**:

- **The `<noscript>` line keeps its wording**, *"Comments need JavaScript."* What the widget draws with
  JavaScript off was not established by the test, so **the line stands and one live check is owed** rather
  than a rewrite on a guess. **And the section is always drawn** — heading, rules and that line render whether
  or not the discussion can, which closes finding 3's standing question.
- **The two drawn no-JavaScript cards on `A28-0`** (1 Rule, 9 Big Count) **show the count's absence, not the
  widget's**, and their captions now say so. They were not redrawn, because what to draw in the widget's place
  is the open question itself.

### This category's own rulings

| What changed | Rule or fact that required it |
|---|---|
| **Every no-JavaScript line is now two sentences, one for the count and one for the widget.** Rewritten in all ten Behaviour module entries, on all ten frames, in the shared floor and in finding 3. **The count renders nothing at all** — no number, no word, no empty box, **no element**, because Ghost's script creates it and writes the number in — and **the widget itself does render**. 8 Prompt's is three sentences: its form is a third thing degrading a third way. Consequences by design: **1 Rule's** head row is empty at its right-hand end; **6 Rail** loses the 22 px count and its display-scale `countEmpty`; **7 Disclosure's** bar opens with no number on it; **9 Big Count** has no figure, the figure *being* the count; **10 Slim** at Count only renders nothing of the theme at all. | *A comment count renders nothing at all without JavaScript* |
| **The count's accessible label sits on the surrounding element, never on the count.** Added to all ten Accessibility entries and to the shared floor's head rule. A label on an element Ghost's script may never create is not a label. This extends, and does not replace, the 29 August ruling that took the count out of every `h2`. | *A comment count renders nothing at all without JavaScript* |
| **`countSingular` and `countPlural` are bare nouns.** Ghost's script **prepends** the number to the word, so a "%" or a `{count}` inside either string renders literally on the page. The constraint is written into the shared field list and the shared floor; the 20-character limits and the defaults "comment" and "comments" are unchanged. **Checked on all eleven frames: neither a "%" nor a `{count}` appears in any count string.** | *A comment count renders nothing at all without JavaScript* |
| **Where the project's colour scheme is pinned there is no visitor dark-mode switch at all.** Not greyed — **not drawn**, with the panel saying why, as a sentence rather than a tooltip: *"your site's colour scheme is fixed, so readers have nothing to switch."* It is entered in the Data group as a **not-drawn row** so the panel carries the reason, and that row is drawn on all ten design frames and in `A28-0`'s shared field list. **The comments widget takes its light or dark appearance from that same pinned value and is given no second selector of its own** — which is the rule the Block colour row's deletion on 29 August already followed from, now stated as such. **No control was added, removed or changed by this**, and no design passes `mode=`. | *A control switched off by another is greyed, with the reason beside it* — its **one exception** |
| **4 Contrast Band is offered only where the colour scheme is pinned.** Unchanged from 29 August and restated on the frame: greyed in the picker, the reason beside it — *"Needs a fixed light or dark site — change that in your theme settings and this becomes available."* **Withheld, never switched into another design.** A site already using it is unaffected until its scheme changes. | *A control switched off by another is greyed, with the reason beside it* |
| **The feature-image caption finding has no subject here.** A28 authors no image at all — media is `none` in all ten — so nothing in this category leans on `<em>` or `<strong>` inside a caption, and no specification promise changes. Recorded so the check is not repeated. | *The feature-image caption renders differently on the two Ghost versions* |
| **No printed design total appears anywhere in this category**, in the spec or on any of the eleven frames, and none was added. The copy here is count-agnostic and stays that way. | *(Repository ruling — no printed totals.)* |

### The five rules, checked against this category

| Rule | What it did here |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Three subjects.** **3 Panel's Plane edge** — Soft was "disabled in dark"; it is now **greyed with the reason written as a short sentence at the control**, *"not available in dark: the hairline carries every plane here"*, never hidden and never accepting a value it will not honour. **8 Prompt's Free members** — it was **shown only at paid-only commenting**, which is hiding; it now **stays in the panel and greys** where commenting is open to all members, under *"not available while anyone who signs up can comment"*. **On 8's own frame the drawn Ghost setting is paid-members only, so the row is drawn live and its helper states the greyed case** rather than the frame contradicting its own Data group. **The exception:** the visitor dark-mode switch under a pinned colour scheme is **not drawn at all** and the panel says why. |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **No subject.** A28 renders no person and draws no initials of its own: every face and every avatar on the page is Ghost's, inside the widget, where the theme cannot reach. Nothing to check and nothing changed. |
| **The Remove button never greys out** | **One subject** — `rules[]` on **2 Split Head** and **6 Rail**. Already compliant, re-checked, unchanged: ✕ is never disabled, never dimmed, never hidden; **removing the last rule sets House rules to Off and says so as one sentence under the list**; it is **Add** that stops at four with its reason shown. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **No subject.** A28 has no count row at all. `rules[]` is P0·3's add-and-remove list rather than a number, and no control in the category picks between drawn arrangements by number. Nothing was converted in either direction. |
| **A design may declare the width below which its script runs** | **No subject, stated rather than assumed.** Neither module is width-conditional: 7's `accordion` is native `<details>` and runs at every width, 8's `member-form` likewise. **No design declares a width**, so none owes a two-sided no-JavaScript sentence on that account — which is now written into the shared floor's Behaviour rule and onto 7's frame. |

### The no-JavaScript line, per design — rewritten

| # | Design | The count | The widget |
|---|---|---|---|
| 1 | Rule | Nothing at all — the right-hand end of the head row is empty | Renders; hairline, head and rules line draw above it |
| 2 | Split Head | Nothing at all — the left column is a head and its rules | Renders in the right column; both columns draw, sticky is CSS |
| 3 | Panel | Nothing at all | Renders on the plane, with its inset, head and rules line |
| 4 | Contrast Band | Nothing at all | Renders in the band; bleed and derived colours draw, **the design's argument survives** |
| 5 | Boxed | Nothing at all — nothing at the head row's right-hand end | Renders; the box closes round it, divider and inset intact |
| 6 | Rail | Nothing at all — no 22 px count, no display-scale `countEmpty` | Renders in the 1,008 column; the rail is its label and its rules |
| 7 | Disclosure | Nothing at all — the bar carries no number | **The bar opens and closes** (native `<details>`); the widget is what opening it reveals |
| 8 | Prompt | Nothing at all — the prompt's words are server-rendered, the number is not | Renders wherever the arrangement shows it. **Third thing: the form does not post** and the designed notice stands in its place |
| 9 | Big Count | Nothing at all — the figure **is** the count, and no At-zero count line | Renders in the 808 column beside an empty one |
| 10 | Slim | Nothing at all — at Count only, nothing of the theme renders | Renders; the section is the widget and its spacing |

**In every row the `<noscript>` line keeps its wording** — ruled by the owner on 1 September 2026 — **and
the section is always drawn**. One live check on a scriptless page is owed, and would be a wording change
rather than a redesign.

### Open questions

~~**OPEN FOR THE OWNER — 1. The sentence we show to a reader whose browser has JavaScript switched off.**~~
**SETTLED — leave the line exactly as it is; one live check on a scriptless page is owed. Settled by the owner
on 1 September 2026, as recommended.**

Under every comment section we print one small line: **"Comments need JavaScript."** We wrote it when we
believed the whole discussion vanished for those readers. Last week's test says **the discussion box itself
still appears** — only the number beside the heading disappears. So the line may now be telling readers
something untrue, sitting directly above the thing it says they cannot have. Nobody has yet looked at a real
scriptless page to see what that box actually shows, so we do not know whether the line should be softened,
narrowed or deleted. **Not answered here — pick one.**

1. **Leave the line exactly as it is until someone looks at a real page. (RECOMMENDED)**
   Ten minutes with JavaScript switched off settles it for good, and a wrong sentence written twice is worse
   than a wrong sentence written once. Costs: the line stays possibly-wrong in the meantime, and it ships that
   way if the check never happens.
   A visitor sees no change: the section, then one small grey line, then whatever Ghost draws.
2. **Narrow it to the part we have tested: "The comment count needs JavaScript."**
   Every word of it is now known to be true. Costs: it explains a missing number, which nobody was looking
   for, and says nothing about the discussion, which is the thing readers care about. It is precise and
   useless.
   A visitor sees a line about a number they never saw.
3. **Delete the line.**
   Nothing on the page can be wrong if nothing is there. Costs: if the box turns out to render as an empty
   grey rectangle, the reader gets that with no explanation at all — which is the exact problem the line was
   added to solve.
   A visitor sees the section and then Ghost's box, unannotated.

~~**OPEN FOR THE OWNER — 2. The words next to the number, when the number is nought.**~~
**SETTLED — leave `countEmpty` at "No comments yet"; the same live check settles it. Settled by the owner on
1 September 2026, as recommended.**

Ghost writes the comment count by pasting a number in front of a word we supply — we give it "comment" and
"comments", it prints "1 comment" and "24 comments". That is why those two must stay bare nouns: anything else
in them prints on the page exactly as typed. **We also supply a third string for an empty discussion,
"No comments yet", and we do not know whether Ghost pastes a nought in front of that one too.** If it does,
readers see "0No comments yet". **Not answered here — pick one.**

1. **Leave the wording and check it against a real empty post. (RECOMMENDED)**
   Same ten-minute check as question 1, on the same page. The current wording is the one everybody prefers if
   it works, and it is the wording already drawn on every frame. Costs: if it is wrong, it is wrong on a quiet
   new site — the first post of a new customer, which is the worst place to find out.
   A visitor on a post with no comments sees "No comments yet".
2. **Change it to a phrase that reads correctly either way — "comments yet".**
   Safe whichever way the test goes: with a nought in front it reads "0 comments yet", without one it reads
   "comments yet". Costs: on its own it reads like a fragment, and we would be picking the uglier of two
   wordings to avoid doing the check.
   A visitor sees "0 comments yet".
3. **Drop our own wording and let Ghost print its default.**
   One fewer thing to get wrong. Costs: a publication cannot translate it or change its tone, which is exactly
   why these three strings became editable fields in the first place.
   A visitor sees Ghost's own phrasing, in English.

~~**OPEN FOR THE OWNER — 3. Whether the section should appear at all for a reader who cannot use it.**~~
**SETTLED — the section is always drawn. Settled by the owner on 1 September 2026, as recommended. Finding 3's
standing question is closed.**

The oldest open item in this category. If a reader's browser cannot run the discussion properly, should the
whole comments section still be drawn — heading, house rules, the space it occupies — or should the page skip
it and close straight into the related posts? **Not answered here — pick one.**

1. **Always draw it. (RECOMMENDED)**
   The reader is told there is a discussion and told what is missing, and the page reads the same for
   everybody. It is also what the frames already draw. Costs: on the quietest designs the reader gets a
   heading and a small grey line over an area that may do nothing for them.
   A visitor sees the heading, the house rules, and whatever the box manages to draw.
2. **Skip the whole section when the discussion cannot work.**
   No reader ever meets a dead area. Costs: the page silently loses a feature the publication paid for, we
   cannot tell that state apart from a bug, and a reader who wanted to comment is given no clue that
   commenting exists.
   A visitor sees the article, then the related posts.
3. **Let the customer choose, as a setting.**
   Both camps are served. Costs: one more control on ten panels answering a question most customers have never
   thought about, for a shrinking minority of readers.
   The editor sees an extra row: *When comments cannot load: show the section · hide it.*

**Answered on 1 September 2026 — all three as recommended.** **Question 1:** the `<noscript>` line keeps its
wording, "Comments need JavaScript.", and is no longer marked OPEN. **Question 2:** `countEmpty` keeps
"No comments yet" and its 40-character limit; the bare-noun rule binds `countSingular` and `countPlural`
only. **Question 3:** **the section is always drawn** — heading, house rules and the `<noscript>` line render
whether or not the discussion can, no design hides itself on that account, and no control is added for it;
**finding 3's standing question is closed**. **What the three leave behind is one check, not a question**:
ten minutes on a real page with JavaScript switched off, to confirm what the widget draws there and whether
Ghost prints a nought in front of `countEmpty`. **If either comes back wrong, it is a wording change, not a
redesign.** **The category's only other open item is the architect's check on 8 Prompt.**

**OPEN FOR THE ARCHITECT — a check, not a question.** What Ghost renders to a signed-in free member inside the
widget when commenting is set to paid-members only. Undocumented, not verifiable, and still owed; 8 Prompt
designs that state and the other nine assume Ghost handles it. The **ARCHITECT: verify** flag stays on 8's
frame.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10** — ten designs, no gap created or
  closed, no number reused, nothing renumbered.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, and names
  **1 Rule** and **5 Boxed** — both of which exist in this category's roster of ten.
- **All three of this pass's open questions were answered by the owner on 1 September 2026**, all as
  recommended. **The category's remaining items are two checks, not questions**: what the widget draws on a
  scriptless page, and what Ghost renders to a free member under paid-only commenting.
