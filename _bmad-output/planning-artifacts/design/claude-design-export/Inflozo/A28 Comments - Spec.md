# A28 Comments — written specification

10 designs · Paper pack · drawn 23 August 2026 · **controls reconciled 25 August 2026**

The frames are `A28-0 Category Proof.dc.html` and `A28-1` … `A28-10`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

This revision folds in the controls-reconciliation pass. Six things now sit on every design: the
**universal trio outside each control list** (with each design's old Padding row, and five designs'
Divider rows, retired into it), the Comments block group recut as **the Data group** with
**Match the page fixed for dual-mode sites**, the count's three words as **authored fields**,
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
  **Background role is locked at Contrast on 4 and at Inherit on 10**, and **Top divider at None on
  4**, each with the reason shown.
- **The seam.** A28 draws its own top padding: Vertical spacing's **64 · 96 · 132** at 1440, **80** at
  834, **64** at 390 ⚑ — A17's ladder. **10 Slim runs its own shorter ladder** ⚑, 40 · 64 · 96, and
  says so.
- **The measures.** Measure **720 centred** in the 1,296 content box on a 72 margin, A25's division
  exactly; 754 at 834, 350 at 390. **Seven designs offer Width Measure · Content**; 2, 6 and 9 are on
  the content width by construction.
- **The head.** One control, four values — **Label** 13 px uppercase tracked .08em · **Heading** 28 px
  in the heading font · **Count only** 22 px · **None** — all reading one `headingText`, default
  **"Discussion"** ⚑. **6 Rail and 9 Big Count have no Heading control** (the rail and the figure are
  the head); **7 offers two values, 10 offers three.** At None the section takes
  `aria-label="Comments"` ⚑ — a translation-catalog string, not a literal.
- **The type.** Head 28 · 22 · 17 · 13 by value; the figure 76 or 104 in 9. Count 15, 17 in 9. Rules
  15, 14 in 6's rail. **Nothing below 13, and nothing between 13 and 15** ⚑.
- **The count's own words.** `countSingular` "comment", `countPlural` "comments", `countEmpty`
  "No comments yet" — **three authored fields in all ten** ⚑, edited **in the panel rather than
  inline**, because the canvas shows one of the three at a time and editing in place would silently
  rewrite whichever variant happened to be on screen. **P0·6**'s state switcher steps 0 · 1 · many to
  see each. **The number itself is Ghost's** and shows P0·1's lock pill.
- **The block's mode.** **Match the page resolves to `auto` when the site ships both modes and to the
  pack's mode when it ships one** ⚑. An Inflozo theme with dark mode enabled flips with the reader's
  system, so for those sites `auto` **is** the page's mode; the old rule — always the pack's fixed
  mode — sent every dark-scheme reader a light thread. **4 Contrast Band's forced value is
  untouched**: a band that inverts the page cannot follow a system preference.
- **Accent, once at most.** **Only 8 Prompt draws accent at all** — its buttons, or its link. No head,
  count, rule, bullet, chevron or figure is ever accent ⚑. **The accent inside the block is Ghost's and
  is not counted, because it is not ours.**
- **Targets.** 7's bar and 8's form are the only interactive elements the theme draws. Bar 720 × 56,
  350 × 52 at mobile; field and button 44. **Nothing the theme draws is under 44** ⚑.
- **Responsive floor.** **Margin furniture leaves at 1,200** (6, 9) · **splits collapse at 834** (2) ·
  **planes, boxes and bands do not collapse at all** (3, 4, 5, 7). Every element that leaves a width
  has a stated destination.
- **Dark.** A27's step, unchanged: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm
  shadows dropped and the hairline carrying every plane. **The block is passed the page's mode** —
  which on a dual-mode site is `auto` — except on 4, where the band decides ⚑.
- **No JavaScript, said out loud.** A `<noscript>` line sits under the head in all ten — **"Comments
  need JavaScript."**, a **theme translation-catalog string** (`comments.noscript`), **not an authored
  field** ⚑. One line of markup, no module, taking the muted text token at the count's size, at the
  position the block would have occupied: no box, no icon, no border — a sentence, not an error state.
  It stops the chrome promising a thread that never loads. **Drawn once, on the proof frame**, because
  it is identical in all ten and changes no design's arrangement.
- **Print.** **No A28 section prints** ⚑ — head, rules, `<noscript>` line and block all go. A printed
  page cannot be commented on. The second category in a row that prints nothing.
- **Behaviour.** **Two designs declare a module** — 7's `accordion`, 8's `member-form` — both from the
  registry, both quoted. The other eight declare none. **No design declares a module for the block
  itself, because Ghost's script is not in the registry** ⚑. **No registry addition was needed in this
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
| `blockMode` | enum req | Match the page · Light · Dark → `mode=` · **forced and disabled in 4** ⚑ |
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

| # | Design | Tuple | When the content is thin | Ctl | Module |
|---|---|---|---|---|---|
| 1 | Rule | `stack · none · page · none · none · one hairline above a labelled count` | Rules line goes; head sits 36 above the block | 4 | — |
| 2 | Split Head | `split · none · page · few · none · the head and house rules in a left column` | Column keeps 320; the block never widens | 4 | — |
| 3 | Panel | `stack · none · surface · none · none · the block on a raised plane` | Plane collapses to its content; goes at Hide | 5 | — |
| 4 | Contrast Band | `stack · none · contrast · none · none · an inverted band with the block re-moded` | The band goes with the section | 5 | — |
| 5 | Boxed | `stack · box · page · none · none · one hairline box round head and block` | The box is drawn round a short block | 5 | — |
| 6 | Rail | `edge rail · none · page · few · none · the head standing in the margin` | Rail keeps 240; below 1,200 it stacks | 4 | — |
| 7 | Disclosure | `bar · none · page · none · none · the block behind a disclosure bar` | No bar at all when commenting is off | 4 | `accordion` |
| 8 | Prompt | `form · none · page · none · none · the member prompt leads` | Free member → upgrade form; member → 1 Rule | 6 | `member-form` |
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
machine reads.** The reconciliation gives it one machine-readable consequence: **10's Background role
is locked at Inherit and 1's is not** (finding 7).

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
| `countSingular` | text | no | 20 ch | **All ten · new** ⚑ · default "comment" |
| `countPlural` | text | no | 20 ch | **All ten · new** ⚑ · default "comments" · drawn at 17 px in 9 |
| `countEmpty` | text | no | 40 ch | **All ten · new** ⚑ · default "No comments yet" · 9's zero state at At zero Count line |
| `promptHeading` | text | req in 8 | 40 ch | **8 only** · default "Join the discussion" ⚑ |
| `promptBody` | text | yes | 140 ch | 8 only · **shared by both prompt states** ⚑ · default "Members can reply, ask questions and tell us where we got it wrong." |
| `promptButton` | text | req in 8 | 20 ch | 8 only · default "Sign up" ⚑ · Portal `signup` |
| `signinLabel` | text | yes | 40 ch | 8 only · default "Already a member? Sign in" ⚑ |
| `upgradeHeading` | text | req in 8 | 40 ch | **8 only · new** ⚑ · default "Commenting is for paid members" |
| `upgradeButton` | text | req in 8 | 20 ch | **8 only · new** ⚑ · default "Upgrade" · Portal `account/plans` |
| `showLabel` · `hideLabel` | text | yes | 12 ch each | **7 only** · defaults "Show" and "Hide" ⚑ |
| `blockMode` | enum | no | Match the page · Light · Dark | All ten · forced in 4 ⚑ |
| `avatarSaturation` | enum | no | Muted · Standard · Vivid | All ten |
| `whenClosed` | enum | no | Show the notice · Hide the section | All ten · Hide in 10 ⚑ |
| `signedOutReaders` | enum | no | The prompt only · The prompt and the block | **8 only** ⚑ |
| `freeMembers` | enum | no | The upgrade prompt only · The upgrade prompt and the block | **8 only · new** ⚑ · shown only at paid-only commenting |

Read from Ghost, never authored:

| Value | Type | Read by |
|---|---|---|
| `{{comment_count}}` | int | All ten · pluralised by the three authored words ⚑ · **twice in 9**, bare and pluralised |
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

**Controls.** Heading (Label · Heading · Count only · None) · Count (Beside · Under · Off) · House
rules (On · Off) · Width (Measure · Content). **Four.** Then the universal trio and the Data group.
**Quick: Heading, Count, House rules.**

**Data.** `{{comment_count singular=countSingular plural=countPlural empty=countEmpty}}` and
`{{comments title="" count=false}}`. **0** → the `countEmpty` line and the block renders its editor.
**1** → "1 comment". **Many** → Ghost paginates inside the block; the section neither knows nor cares.

**Empty state.** No `rulesText` → the line and its 12 px go. `{{#if comments}}` false → the notice
replaces the block, or the section goes at Hide. **The section never draws a placeholder comment, an
outline or a reserved height** ⚑.

**Behaviour module.** **none.** **No-JS: the frame is unchanged and the block does not render** — the
`<noscript>` line stands where it would have been. **Category-wide, not a design defect** ⚑ (finding
3).

**Accessibility.** `<section aria-labelledby>` named by the head, an `h2`; `aria-label="Comments"` at
Heading None ⚑. The count is inside the heading. **Focus order enters the block after the rules line
and the theme controls no stop inside it** ⚑.

**Reconciled.** Padding retired into **Vertical spacing** and **Divider (On · Off)** into **Top
divider (None · Line · Fade)**, both outside the list — Line is what On drew, Fade is new, and Line
stays the default because the hairline above the head is the seam this design is built on. The count's
three words become fields, Match the page resolves to `auto` on a dual-mode site, the block group is
recut as the Data group, and the `<noscript>` line arrives. **Four controls of its own.**

**Flagged ⚑.** "Discussion" as the default head · `countEmpty` "No comments yet" · always passing
`title="" count=false` · the count moving under the label at 390 · Width doing nothing below 834 · A28
sitting below A26 and above A27 · drawing nothing extra when signed out · no-JS leaving the frame alone
but for one line.

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

**Controls.** Heading · Head column (Narrow 280 · Standard 320 · Wide 384) · House rules (Off · One
line · List) · *the rules item list, P0·3* · Sticky head (On · Off). **Four.** Then the universal trio
and the Data group. **The item list is not counted** — it edits content. **Quick: Heading, Head column,
House rules, Sticky head.**

**Data.** As 1 Rule. The count sits under the heading and **is not repeated anywhere else** ⚑.

**Empty state.** Rules off or list empty → the column is head and count alone at 320, and **the block
does not widen** ⚑. Heading None with rules on → a column of rules with no head, drawn and legal. Both
off → the design is 1 Rule and the editor says so ⚑.

**Behaviour module.** **none.** Sticky head is CSS — `position: sticky` needs no JavaScript and
declares no module ⚑. **No-JS: frame unchanged, block absent, the `<noscript>` line in its place**
(finding 3).

**Accessibility.** `<section aria-labelledby>`, head `h2`. **The rules are a `<ul>`**, so a screen
reader announces "list, 3 items" before the block ⚑. DOM order head → rules → block at every width.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`rules[]` is
settled at one to four** ⚑ — one rule is drawn as one bulleted line, and removing the last sets House
rules to Off — and the list is named as **P0·3's** item controls. The count's words become fields,
Match the page resolves to `auto` on a dual-mode site, the block group is recut as the Data group.
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

**Controls.** Heading · Panel width (Measure · Content) · Inset (Compact 32 · Comfortable 48 ·
Spacious 64) · House rules (On · Off) · Plane edge (Soft · Hairline — **Soft disabled in dark with its
reason shown** ⚑, because the shadow token is `none` in every pack's dark mode). **Five.** Then the
universal trio and the Data group. **Quick: Heading, Panel width, Inset, House rules.**

**Data.** As 1 Rule. **At Panel width Content the block is 1,200 wide and its lines are not clamped** ⚑
— clamping would mean styling inside the block.

**Empty state.** Rules off → plane is head and block. `{{#if comments}}` false → the notice on the
plane and **the plane shrinks to its content** ⚑. At Hide the section **the plane goes with the
section** — it is the section's ground, not the page's furniture ⚑.

**Behaviour module.** **none.** **No-JS: frame unchanged, block absent** — which here leaves a plane
carrying a head, a rules line, 96 px of inset **and the `<noscript>` line**, which is the design that
needed it most ⚑.

**Accessibility.** `<section aria-labelledby>`, head `h2`. **The plane is a `<div>` with no role** ⚑ —
it is a colour, not a region. Muted on surface is 5.4:1 in Paper light, re-checked per pack.

**Reconciled.** Padding retired into **Vertical spacing**; **Inset stays**, because a plane's internal
padding is not the space around the section — **the ladder A27·4 Panel leaves fixed at 40 px, and that
disagreement is recorded rather than settled uninstructed**. **Background role is deliberately
unlocked**, on A27·4's argument: the plane is one step from the page at every value, and at Contrast it
lifts *off* the band rather than becoming 4 Contrast Band, whose block sits *on* it. Count words become
fields, Match the page resolves to `auto`, the block group is recut as the Data group. **Five controls
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

**Controls.** Heading · Band edges (Full bleed · Content) · Alignment (Left · Centre) · House rules
(On · Off) · Width (Measure · Content). **Five.** Then the universal trio — **Background role locked at
Contrast and Top divider locked at None**, reasons shown — and the Data group, **with Block colour
forced and disabled** ⚑ (A27·12's precedent). **Quick: Heading, Band edges, Alignment, Width.**

**Data.** As 1 Rule. The mode attribute is computed from the band, not authored: `mode="dark"` in a
light pack, `mode="light"` in a dark one ⚑. **The category's Match-the-page fix does not reach this
design** — a band that inverts the page cannot follow the reader's system. **Alignment moves the head
and the rules; the block never centres** ⚑.

**Empty state.** Rules off → head and block. `{{#if comments}}` false → the notice in contrast ink
inside the band; **at Hide the section the entire band goes** ⚑ and the route closes A26 straight into
A27.

**Behaviour module.** **none.** **No-JS: frame unchanged, block absent** — a band with a head, one line
and the `<noscript>` line in it, which is the honest consequence (finding 3).

**Accessibility.** `<section aria-labelledby>`, head `h2`. Contrast ink on contrast ground is 14.6:1 in
Paper light and 13.9:1 in Paper dark; **a pack whose muted contrast fails is corrected in the pack, not
here** ⚑. **Ghost's block sets its own contrast and we cannot audit it** ⚑ (finding 2).

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

**Controls.** Heading · Box width (Measure · Content) · Head row (Divided · Plain) · House rules (On ·
Off) · Inset (Compact 28 · Comfortable 40 · Spacious 56). **Five.** Then the universal trio and the
Data group. **No fill control** ⚑ — a box with a surface fill is 3 Panel with an extra hairline, and a
value that lets one design impersonate another breaks the roster. **Quick: Heading, Box width, Head
row, Inset.**

**Data.** As 1 Rule.

**Empty state.** Heading None → **no head row and no divider** ⚑, not an empty row. Rules off → the
block sits at the inset. `{{#if comments}}` false → the notice inside the box, box kept; at Hide the box
goes with the section. Zero comments → **the box closes round a short block and reserves no height** ⚑.

**Behaviour module.** **none.** **No-JS: frame unchanged, block absent, the `<noscript>` line inside the
box** (finding 3).

**Accessibility.** `<section aria-labelledby>`, head `h2` inside the head row. **The box is a `<div>`
with no role and the divider is a border, not an `<hr>`** ⚑.

**Reconciled.** Padding retired into **Vertical spacing**; **Head row and Inset both stay**, being a
border *inside* the box and the box's internal padding rather than the section's seam and spacing.
Count words become fields, Match the page resolves to `auto` on a dual-mode site, the block group is
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
rules step to 15 — **the stacked form is 1 Rule with a list instead of a line** ⚑. **834** as stacked,
padding 80. **≤ 767** count under the label, padding 64. **Rail side and Sticky rail stop applying below
1,200** ⚑.

**Content fields.** `headingText` (the rail's label) · `rulesText` · `rules[]` 1–4 × 60 ch ·
`closedNotice` · the count's three words.

**Controls.** Rail side (Left · Right) · House rules (Off · One line · List) · *the rules item list,
P0·3* · Sticky rail (On · Off) · Count (Under the label · Beside it · Off). **Four, and no Heading
control** ⚑ — the rail is the head, so a control offering four head values would be offering to draw a
second one. A27·7 Rail made the same call. Then the universal trio and the Data group. **Quick: Rail
side, House rules, Count, Sticky rail.**

**Data.** As 1 Rule. **The rail draws the count at 22 px, so `countEmpty` reads at display size when
the post is quiet** ⚑ — the one place in A28 where a zero state is the biggest thing in the section, and
the clearest reason the three words became fields.

**Empty state.** Rules off → a label and a count in a 240 rail; **the block does not widen** ⚑. Count
off and rules off → a label alone, legal and drawn. `{{#if comments}}` false → the notice in the 1,008
column, rail kept; at Hide both columns go ⚑.

**Behaviour module.** **none.** Sticky rail is CSS. **No-JS: frame unchanged, block absent, the
`<noscript>` line in the 1,008 column** (finding 3).

**Accessibility.** `<section aria-labelledby>` named by the rail's label, which is the `h2` ⚑. **DOM
order is rail then block at every width, including Rail side Right, where the visual order is reversed
by grid placement and the reading order is not** ⚑. Rules are a `<ul>`.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`rules[]`
settled at one to four** with **P0·3's** item controls named. **The count's three words become fields**,
which matters most here. Match the page resolves to `auto` on a dual-mode site; the block group is recut
as the Data group. **Four controls of its own.**

**Flagged ⚑.** A25's 240 · 48 · 1,008 division · no Heading control · the rail leaving at 1,200 · the
block never widening · the count at the rail's display size · sticky off by default · reversing Rail
side by placement rather than DOM order · the stacked form being 1 Rule with a list.

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

**Controls.** Heading (**Label · Heading only** ⚑ — Count only and None would leave a bar with nothing
to click) · Default state (Open · Closed) · Bar width (Measure · Content) · House rules (On · Off,
**inside the disclosure** ⚑). **Four.** Then the universal trio and the Data group. **Default state is
Open** ⚑: the bar exists so a reader can put a long thread away, not so a publication can hide it.
**Quick: Heading, Default state, Bar width, House rules.**

**Data.** As 1 Rule. **The count is on the bar, so it is readable while the block is closed** ⚑ — the
reason the bar carries it. **At Closed the block still mounts and Ghost's script still loads** ⚑;
`<details>` hides its contents, it does not defer them, so this design saves 900 px of page, not a
request.

**Empty state.** Zero comments → the bar reads the `countEmpty` line and **still opens**, onto Ghost's
editor ⚑. `{{#if comments}}` false → **no bar at all** ⚑: the notice stands alone, because a disclosure
with nothing behind it is a control that lies.

**Behaviour module.** `accordion`. **Registry no-JS, quoted:** "Native `<details>` — fully functional,
keyboard-operable, opens and closes with no JS at all. A9's `default state` control resolves to the
server-rendered `open` attribute." **The bar therefore works without JavaScript; the block inside it
still does not render** ⚑, and the `<noscript>` line is what the reader finds when they open it
(finding 3).

**Accessibility.** `<details>` / `<summary>`, so the open state is announced by the browser and needs no
`aria-expanded` of ours ⚑. **The `h2` is inside the `<summary>`**, which keeps the section in the
heading outline while closed. **Focus does not move into the block on open** ⚑. The chevron rotation is
160 ms ease-out and **is dropped under reduced-motion while the word still changes** ⚑. **Editing
`showLabel` and `hideLabel` in place:** while the section is selected a click on the word edits it and
the rest of the bar still toggles, and **P0·1's Link action is disabled there with its reason shown** ⚑
— a link inside a `<summary>` is not operable.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **`showLabel`
and `hideLabel` now edit inline**, with the two rulings above — the click that edits is not the click
that toggles, and Link is disabled inside a `<summary>`. Count words become fields, Match the page
resolves to `auto` on a dual-mode site, the block group is recut as the Data group. **Four controls of
its own.**

**Flagged ⚑.** Default state Open · Heading offering two values · the whole bar as the target · keeping
the word at 390 · rules inside the disclosure · no bar when commenting is off · the block mounting while
closed · dropping the rotation under reduced-motion.

---

## 8 · Prompt

**Descriptor.** The publication's own membership prompt in place of the block for readers who cannot
comment, with the count of the discussion they cannot see.

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

**Controls.** Heading · Prompt style (Panel · Hairline) · Form (Email field · Link only) ·
**Signed-out readers (The prompt only · The prompt and the block)** ⚑ · **Free members (The upgrade
prompt only · The upgrade prompt and the block)** ⚑ · House rules (On · Off, **off by default here** ⚑).
**Six — the most in A28.** Then the universal trio and the Data group. **Quick: Prompt style, Form,
Signed-out readers, Free members.**

**Data.** `{{#if @member}}` **and the Ghost commenting setting** decide between **three arrangements**
⚑. **Signed out** → head, count and the prompt; the count comes from `{{comment_count}}`, which renders
without the block ⚑. **Signed-in free member, commenting paid-members only** → head, count and **the
prompt in upgrade form**: `upgradeHeading`, the shared `promptBody`, `upgradeButton` on Portal's
`account/plans` through **P0·4**, and **no email field**, because this reader already has an account ⚑.
**Member who can comment** → the block, no prompt, and the design is 1 Rule. **0 and signed out** → the
prompt under the `countEmpty` line, the weakest case and still composed. **Ghost's own prompt inside the
block cannot be suppressed** ⚑, which is why the second value of either row shows two calls to action
and says so on the control. **ARCHITECT: verify** — what Ghost renders to the free member inside the
block is undocumented and was not verifiable; the state is designed as though Ghost renders nothing.

**Empty state.** No `promptBody` → heading, form and sign-in line, 20 px shorter — **in both prompt
states, which share the one body** ⚑. No `signinLabel` → the line goes; **Portal still handles an
existing member typing a known address** ⚑. **The upgrade state draws no sign-in line at all** ⚑ — the
reader is signed in. `{{#if comments}}` false → the notice and **no prompt of either kind** ⚑: inviting
a reader into a conversation that is closed is worse than saying it is closed.

**Behaviour module.** `member-form` at Form Email field; **none** at Link only, and **none in the
upgrade state**, which is a link to Portal. **Registry no-JS, quoted:** "The `<form>` posts natively to
Ghost's members endpoint; Ghost's own server response replaces the designed sent state." **So with
JavaScript off this is the one A28 design that still does its job** ⚑ — the prompt is server-rendered
and the form still posts.

**Accessibility.** `<section aria-labelledby>`, head `h2`, `promptHeading` — or `upgradeHeading` — an
`h3`. The field has a real `<label>`, visually hidden, reading "Email address" ⚑. Errors are Ghost's and
are announced by Ghost. Focus order: head → field → button → sign-in link; **in the upgrade state,
head → button** ⚑, the shortest focus path in A28. Paper dark accent `#E0805A` on `#171511` is 8.9:1 ⚑.

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

**Controls.** Label (On · Off) · Count size (Large 76 · Display 104) · Number position (Left · Above) ·
House rules (On · Off) · **At zero (Figure · Count line)** ⚑. **Five, and no Heading control** ⚑ — the
figure is the head. **Count size does not move the layout**: both sizes sit in the same 416 column ⚑.
Then the universal trio and the Data group. **Quick: Count size, Number position, At zero, House
rules.**

**Data.** **0** → **At zero decides** ⚑: at **Count line**, the default, the column draws the 15 px
`countEmpty` line and **no figure at all**; at **Figure** it draws 0 at 76 or 104. **1** → "1" and the
`countSingular` word. **Four digits** → 1,284 at 76 px is 214 px inside a 416 column, so **the figure
never wraps and never shrinks to fit** ⚑; the comma is the helper's.

**Empty state.** Label off → the figure leads. Rules off → figure and word alone and **the column keeps
its 416** ⚑. **Zero comments** → the At zero value decides, **Count line by default** ⚑.
`{{#if comments}}` false → **no figure at all** ⚑ and the notice takes the block's column: a count of a
conversation nobody can join is a number without a referent.

**Behaviour module.** **none.** **No `count-up`** ⚑ — the registry has it and A10 uses it, but animating
the size of a discussion as the reader arrives is a claim about momentum the section cannot support.
**No-JS: frame unchanged, block absent, the `<noscript>` line in the block's column** (finding 3).

**Accessibility.** `<section aria-labelledby>` named by **the figure and its word together, which form
the `h2`** ⚑ — "24 comments", not "24". **At zero and At zero: Count line, the `h2` is that line** ⚑ —
"No comments yet" — so the section is never named by a bare numeral. The 13 px label is a `<span>`
inside it, not a second heading. **The figure takes the text token and never the accent** ⚑.

**Reconciled.** Padding retired into **Vertical spacing**, Divider into **Top divider**. **At zero:
Figure · Count line** arrives, defaulting to **Count line** ⚑ — a display-scale 0 on a quiet site is an
embarrassment, so the shipped zero state is the 15 px count line and the old behaviour is a value a
publication chooses. **The count's three words become fields**, which matters most in the design that
sets one of them at 17 px next to a 104 px figure. Match the page resolves to `auto` on a dual-mode
site; the block group is recut as the Data group. **Five controls of its own.**

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

**Controls.** Heading (Count only · Label · None — **Heading is not offered** ⚑) · Alignment (Left ·
Centre) · House rules (On · Off, **off by default**) · Width (Measure · Content). **Four — still the
shortest panel in A28.** Then the universal trio — **Vertical spacing running this design's own 40 · 64
· 96 ladder at Compact by default**, and **Background role locked at Inherit** ⚑ — and the Data group,
**defaulting to Hide the section** ⚑. **Quick: Heading, Alignment, House rules, Width.**

**Data.** As 1 Rule. **0** → the `countEmpty` line at 17 px above Ghost's editor, which at this scale is
the whole section.

**Empty state.** Heading None and House rules Off → **the section is the block and its spacing, and
nothing of the theme is visible** ⚑. That is legal, it is drawn, and it is the extreme this design
exists to reach. `{{#if comments}}` false → nothing renders, by default.

**Behaviour module.** **none.** **No-JS: frame unchanged, block absent** — at Heading None that leaves
**the `<noscript>` line alone in an otherwise empty section** ⚑, which is the honest floor of finding 3
and is now at least a sentence rather than nothing.

**Accessibility.** `<section aria-labelledby>` named by the count line, which is the `h2`; at Heading
None the section takes `aria-label="Comments"` ⚑. **A 17 px muted head on a transparent ground is
checked against the ground it is dropped onto, not against the page** ⚑ — surface and page in Paper
differ by 2 % and both pass.

**Reconciled.** Padding retired into **Vertical spacing** — **keeping this design's own 40 · 64 · 96
ladder and its Compact default**, recorded as a named exception rather than flattened into the
category's. **Background role is locked at Inherit**, because ground `transparent` is this design's
identity and every pack role paints; **the value does not exist in the product yet, and that is finding
7**. Count words become fields, Match the page resolves to `auto` on a dual-mode site, the block group
is recut as the Data group. **Four controls of its own.**

**Flagged ⚑.** Ground `transparent` rather than `page` · the 40 · 64 · 96 ladder · Compact as the
default · no Heading value above Label · the head holding at 17 · rules off by default · Hide the
section as this design's default · allowing a section with nothing of the theme in it but one
`<noscript>` line.

---

## Findings for the architect

1. **The block's accent is Ghost's, not the pack's.** Ghost's comments UI takes its accent from the
   site's accent colour setting. A theme in the Tangerine pack with a Ghost accent of blue shows a blue
   Reply button in every A28 section ⚑. **Inflozo must write the pack's accent into Ghost's accent
   setting at deploy**, or the category cannot keep its tokenisation promise. The one finding that has
   to be solved outside the theme.
2. **Nothing inside the block can be styled or audited.** Type scale, spacing, avatars, buttons, focus
   rings and contrast are all Ghost's, inside a sandboxed frame. **The category's accessibility
   statement and its pack conformance both stop at the dashed outline** ⚑, and every design says so
   rather than implying a coverage it does not have.
3. **No JavaScript means no comments.** All 31 registry modules degrade; Ghost's comments-ui is not one
   of them and has no server-rendered equivalent. **With JavaScript off, all ten designs render their
   frame and no block** ⚑. 7's bar still opens and closes and 8's form still posts — the only two A28
   behaviours that survive. **The `<noscript>` line added in this pass makes the state readable; it does
   not answer the finding.** Whether the frame should render at all when the block cannot is still the
   architect's call.
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
7. **The universal Background role has no "inherit" value.** ⚑ **New in this pass.** 10 Slim's ground is
   `transparent` — it declares none and shows whatever it is dropped onto, which is the whole of its
   difference from 1 Rule — and the universal control offers Background · Surface · Contrast, all three
   of which paint. The row is **locked at Inherit** on that design with the reason shown, but **the
   value does not exist in the product yet**: either the control gains it, or A28·10's ground slot has
   to change and the design loses the reason it exists. **A28 is the first category to need it**; every
   category with a transparent design will need it next.

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
  theme the page *is* the reader's system. **Now: `auto` when the site ships both modes, the pack's mode
  when it ships one.** 4 Contrast Band's forced value stays.
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
- **10 Slim's Background role is locked at a value the product does not have.** Inherit is named on the
  frame with its reason; **finding 7** asks for it. The alternative — unlocking the row and letting three
  painting values overwrite a `transparent` ground — would delete the design's reason to exist.
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
- **Two open questions, named rather than answered.** (1) Finding 5's live check: what Ghost renders to
  a signed-in free member under paid-only commenting. (2) Finding 7: whether the universal Background
  role gains an Inherit value or A28·10 changes its ground slot.
