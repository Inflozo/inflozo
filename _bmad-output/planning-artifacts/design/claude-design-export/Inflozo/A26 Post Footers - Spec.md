# A26 Post Footers — written specification

15 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass, 25 August 2026**

The frames are `A26-0 Category Proof.dc.html` and `A26-1` … `A26-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Controls-reconciliation pass.** The whole category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. This revision applies that patch. It reuses the shared editor primitives designed in **P0 ·
Editor primitives** by name and never redesigns them: **P0·1** the inline text toolbar and its link
popover (with **Open in new tab** and rel **nofollow · noreferrer · sponsored**), **P0·2** the icon
slot and Icon Picker with its size and colour-role popover — which supplies the author-socials brand
icons, the share glyphs and the optional button icons — **P0·3** the item-list controls, which in A26
apply to **one site setting and to no section**, **P0·4** the member-aware action editor, which opens
on **12 Subscribe alone**, **P0·5** the "Populate from…" data panel, which lands nowhere because the
category owns no query, and **P0·6** the editor state switcher, which is how the absent blocks, the
copied confirmation and 12 Subscribe's three member states are seen while editing. What each design
gained is in a **Reconciled** paragraph at the foot of its entry, and the frame-by-frame list is in
**Reconciliation notes** at the end.

The category's additional artefacts are **on the proof frame, not here**: the tokenisation proof
(A26·1 in three packs, light and dark), the stress frame, the roster and the four settlements in
full. The shared field list is repeated below because the build reads it.

---

## 0 · The category layer

### What A26 is

Everything between the last line of the article and the site footer. **A25 owned the article, A3
owns the site, and this category owns the space in between** — which is what A25's seventh finding
asked for in as many words.

**Four blocks and one prompt, in a fixed order, arranged fifteen ways:** tags, author, share,
subscribe, next and prev. The tags, the authors and the neighbouring posts are Ghost's, and **no
design in A26 offers an Add, a Remove or a reorder for any of them** — the rule the brief states for
repeating items, which A26 obeys without exception.

**What the user authors is labels, kickers, one URL and the subscribe strings.** Before this pass
that list included `revisionNote`, the one field in A26 about the post rather than about the section;
**it is cut** ⚑, and with it the last thing in the category a user could write that would have been
false on the next post the template served.

A26 inherits A17's page margins and content width, A19·3's card, A19's missing-image vocabulary
(Reflow · Plate · Hand off), A24's padding ladder, A24·14's Links control and copied confirmation
**and its one site-wide Share-destinations setting**, A25·9's share tower and share row, A1's avatar
and initials fallback, A1·2's 38-in-44 target and A6's focus ring. **A26 adds the footer block
vocabulary** — the author block, the author-socials row, the tag pill, the destination pair, the
ledger row and the subscribe prompt — and nothing else.

### The four settlements (§8 of the brief)

**1 · The author bio block, and a post with two authors.** The block is **a 56 px avatar, the name in
the heading font at 19, two clamped lines of bio and a link to the author's archive** ⚑. A26·1 draws
it and eleven designs reuse it unchanged. **Two authors are two rows with a hairline between them**
⚑, each with its own avatar, bio and link. **Three or more collapse to one row of overlapped 40 px
avatars and a names line with no bios** ⚑; four or more read "Rosa Menendez and three others".
**Ghost's own author order is kept and is not selectable anywhere in the category** ⚑. Three designs
answer it differently and each says so: **10 Big Type** puts both names in one display line and drops
the bio, **11 Portrait** draws two half-width portraits, **14 Ledger** writes one line and never reads
the bio at all.

**After this pass the block has one more part: the socials row** ⚑ — **Author socials · Off · Icons ·
Icons and names** on 1, 3, 4, 5, 10, 11 and 15, drawn under the bio and above the archive link, at
38-in-44 targets, with **brand icons from P0·2's Social / Brands group**. See the floor for the
version gate.

**2 · Tag row, share row and next/prev, and their order.** **The order is Tags · Author · Share ·
Subscribe · Next and prev, it is fixed, and it is not a control** ⚑. A design may draw fewer blocks;
**no design may reorder them**. The argument is that a reader who meets two posts on one site meets
the same shape twice, and an order control makes consistency the user's problem. **Eleven panels open
with a Blocks control** — one control, five named values, Author → Author and tags → Tags, author and
share → Everything but subscribe → Everything — **rather than five switches** ⚑: five switches have
thirty-two combinations and four of them are empty footers. **The four single-block designs (7, 8, 9,
12) carry no Blocks control at all**, and **6 Slim's has three values rather than five** ⚑ because it
has no author block.

**3 · The newsletter CTA here versus A22.** **A26 yields** ⚑. A22 Newsletter owns the newsletter
section — pictures, benefits, tiers, counts, a full-bleed ground — and **A26 keeps one prompt in one
design**: 12 Subscribe, a `surface` bar with a line, a sentence, one field and one button. The other
eleven reach it only through **Blocks Everything, which draws that same bar** ⚑ rather than a second
one. **The route rule: where an A22 section is on the route, the footer prompt does not render** ⚑ —
and the same mechanism gives **9 Share Row** the only share block on a page and **resolves A25's
share affordance to Off**. One rule, three uses; **nothing in the product expresses it today, and
that is finding 1**.

**The prompt is member-aware after this pass** ⚑. 12 Subscribe carries **Member Visibility**
(Everyone · Logged out · Free members · Paid members) and, at Everyone, **three asks through P0·4**:
the logged-out ask, **a free-member upgrade ask**, and the signed-in line as the authored
`subscribedLine`. That is the ruling the owner made for headers, applied here.

**4 · A post with no tags, no next post and no author bio.** **Every absent block is absent — no
placeholder, no "Untagged", no em dash, no reserved height** ⚑ — and every hairline goes with the
block it belonged to. **No bio** → the avatar, name and link stay and the row loses one line. **No
photograph** → A1's initials avatar, or A19's plate at 11 Portrait's crop. **No next post** → the
remaining destination takes the full width and keeps its own label ⚑. **No tags at all** → 8 Tag Row
hands off to 6 Slim ⚑, **the only design in A26 that swaps rather than drops**. **No social handles**
→ the socials row is absent, never a rail of placeholders ⚑. With every block empty a footer
**renders nothing at all**, and the editor draws the absent blocks dashed and labelled.

### The shared floor

Every design obeys these unless its own entry says otherwise.

- **The space above.** **64 px between the last line of the article and the first footer block, fixed
  at every width and in every design** ⚑ — the mirror of C Post Body's 64 above the article — and **no
  control anywhere changes it, including the universal Vertical spacing.** **Only the four designs
  with a ground or a plane of their own carry an internal ladder:** 3 Card's inset (32/48/64),
  4 Contrast Band's band padding (64/96/132), 9 Share Row's bar padding (20/28/36), 12 Subscribe's bar
  padding (32/48/64) — plus 2 Rows' row padding (20/28/40). **Each keeps its own name** because each
  is the space inside an object of the design's own rather than the section's outer spacing.
- **The universal trio, outside every design's list.** **Background role · Vertical spacing · Top
  divider**, on every placeable section, drawn outside the numbered list on all fifteen panels.
  **Vertical spacing resolves Compact 40 · Comfortable 64 · Spacious 96** ⚑ and governs **the footer's
  trailing space — between its last block and A3's site footer** — never the fixed 64 above.
  **Top divider's Line resolves into a design's own top hairline rather than drawing a second one** ⚑
  (1, 2, 6, 8, 10, 13, 14 all have one), **Fade is refused on 4 Contrast Band's band** ⚑, and on a
  design with a plane of its own (3, 9, 12) **Line draws above the plane on the page's ground, never
  inside it** ⚑. **Background role is locked where the ground is the design, with the reason shown**
  ⚑: 3 Card, 9 Share Row and 12 Subscribe to `surface`, 4 Contrast Band to `contrast`.
- **The measure.** The footer is on the article's **720** measure by default and eleven designs carry
  a **Width** control (On the measure · Content width 1,296). **Four depart and each says so:** 2 Rows
  defaults to the content width, 5 Split has no Width control (a split at 720 is two 336 columns),
  13 Rail draws its body at 1,008 beside a 240 margin, 15 Grid is three columns of 400. **754 at 834
  on a 40 margin; 350 at 390 on a 20 margin** — A17's page margins, unchanged.
- **The type.** Name 19 in the heading font; bio 15/1.6; labels 11 px uppercase tracked .1em; meta,
  kickers and the Updated line 13; tags 13 as meta and 15–19 in 8 Tag Row; destination titles 17–24.
  **Nothing goes below 11 and the only 11s are labels** ⚑. **Two designs carry their own ladder:**
  10 Big Type at 44/56/72 and 11 Portrait's 28 px name.
- **Accent, once at most.** The subscribe button where there is one, the copied confirmation for
  1.6 s where there is not, and A6's focus ring ⚑. **Six of the fifteen have no accent at all at
  rest.** No tag, name, kicker, label, rule, destination title, socials glyph or Updated line is ever
  accent.
- **Targets 44 px at every width.** Tag pills are 44 px boxes in 8 Tag Row and 32 px pills in 44 px
  targets everywhere else ⚑; share links and socials icons are 38 px boxes in 44 px targets above 767
  and 44 px rows below; the whole tile is the target in 7; ledger links fill their row. **There is no
  sub-44 target in A26.**
- **Responsive floor.** **Margin furniture leaves at 1,200, not at 834** ⚑ — 13 Rail is the only
  design with any and it inherits A25's threshold and its 288 px reason. **Splits and grids collapse
  at 834** (5, 15) because a column under 288 cannot hold prose; **everything else collapses at 767**.
  **The destination pair stacks previous-above-next at ≤ 767 in every design that draws it** ⚑.
  **The socials row wraps rather than scrolling, and its icons take 44 px targets at ≤ 767** ⚑. Every
  element that leaves a width has a stated destination.
- **Dark.** A17's step: ground `#171511`, surface `#211D17`, hairline `#332E27`, warm shadows dropped
  and the hairline carrying every plane. **The socials glyphs take `text-muted` in both modes** ⚑ —
  no brand colour anywhere in the category. **The accent's foreground flips on the subscribe button**
  — `#171511` on `#E0805A` at 8.4:1 ⚑ — **the only place in A26 where a foreground changes with the
  mode**. **No design filters, dims, tints or borders a photograph in either mode** (A19's rule).
- **Print.** **Tags, the byline, the Updated line and the ledger print; share rows, socials rows,
  subscribe prompts and destination pictures do not** ⚑. 3 Card's plane and 4 Contrast Band's band are
  omitted and both print as 1 Author Bio on white; **9 Share Row and 12 Subscribe print nothing at
  all**.
- **Editing.** **Every visible authored text is inline-editable on canvas with P0·1** — bold ·
  italic · underline · link, the link popover carrying **Open in new tab** and rel **nofollow ·
  noreferrer · sponsored**. **Ghost-owned content is never inline-editable** ⚑: post titles, tag
  names, author names, bios, social handles, feature-image captions and tier facts — clicking one
  selects the section and the sidebar says **"Edit in Ghost"**. **A26 has exactly one authored URL
  field** — 8 Tag Row's `archiveUrl` — and **it opens the Ghost-aware Link Picker** ⚑. **Buttons
  accept an optional icon before or after the label** from P0·2, with its size and colour-role
  popover; the only buttons in the category are 12 Subscribe's (and 3, 5, 15's at Blocks Everything).
- **No fixed English visitor-facing string ships** ⚑. Every string a reader sees is **an authored
  field with a default** or **a theme translation-catalog string**, and the spec says which per
  string. Authored with defaults: 2 Rows' four row labels, 14 Ledger's seven, 15 Grid's three column
  labels, 7's two kickers, 10's desk line, 12's five member strings, and the five labels the category
  already had. Catalog strings: the destination names, "and three others", "+4 more", the long form of
  a date, the socials links' accessible names, the hidden field label in 12.
- **The share destinations are one site-wide ordered setting** ⚑ — X · Facebook · LinkedIn · Bluesky ·
  Mastodon · Threads · WhatsApp · Reddit · Email · Copy link, **ordered and enabled once by the
  owner** with P0·3's drag-reorder and per-destination enable **in the setting, never in a panel**.
  Every share row draws **the first N enabled**, in the owner's order, which is what **Share links ·
  Two · Three · Four** now means. **The glyphs are fixed per-platform brand icons** from P0·2's
  Social / Brands group and are not choosable per section ⚑. **Ships with all ten present and four
  enabled**, in A24's order, so nothing moves on a site that never opens the setting. **A24·14's
  admitted cost — "a site that shares to LinkedIn cannot" — is paid off.**
- **Member awareness lands on 12 Subscribe alone**, and elsewhere that is a judgement rather than an
  omission: **a tag is navigation, a byline is attribution, and a share link is not an offer.** P0·4
  opens on 12 and on the subscribe bar the other designs inherit at Blocks Everything.
- **No Preview control anywhere** — previewing belongs to the editor, and **the category never had one
  to remove.** P0·6's state switcher is how the absent blocks, the two- and three-author rows, the
  copied confirmation and 12's member states are seen while editing.
- **Behaviour comes only from the fixed module registry.** A26 spends two: `share` and `member-form`.
  **Nothing in this pass needed behaviour the registry does not have**, so nothing is marked
  ARCHITECT: registry addition. **`share` is declared by the twelve designs that draw share links**
  — 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15 — **twelve, not the eleven this file said before the
  pass** ⚑; the earlier count was an arithmetic slip and is corrected here and on every panel.
- **The page-target rule.** `{{#prev_post}}` and `{{#next_post}}` **are post-context only** ⚑ — **on a
  page the destination pair is absent**, which is the category's absent-block rule and needs no new
  mechanism. 7 Next and Prev therefore does not render on a page; 8 Tag Row and 12 Subscribe do.
- **Where an image field would carry a focus, there is no image field.** Rule 10 asks every image
  field for **Image focus (Centre · Top · Bottom)** from the Image Picker; **A26 authors no image**
  ⚑. 7's tile pictures are Ghost's `feature_image` and 11's portrait is Ghost's `profile_image` —
  **both crop from the centre and neither offers a focus**, which is finding 7 and is stated on both
  panels rather than left implicit.
- **Refused category-wide, each with a reason:** a comment count (A28), a related-posts grid (A27), a
  members-only badge (A32), a back-to-top link ⚑ (a browser affordance), a licence line, a word
  count. **The author's-social-links refusal is withdrawn** — see the floor's socials rule.

### The controls every design shares

**Blocks** and **Width**, in that order, open eleven of the fifteen panels, and **the universal trio
sits outside all fifteen lists.** What a design adds below them is its own argument. **After this pass
the counts run five to eight** — five on 6, 8 and 9; six on 2, 7, 12, 13 and 14; seven on 11 and 15;
eight on 1, 3, 4, 5 and 10. **The PRD's ceiling is about fifteen visible controls and the tallest
panel here holds eight**, so the earlier 4–7 norm is lifted without approaching the cap. **Quick
controls stay three to five per panel** — on 1 Author Bio they are Blocks, Width, Avatar and Bio
lines; on 14 Ledger, Rows, Label column and Width.

### The roster

| # | Design | Tuple | When content is missing | Ctl | Modules |
|---|---|---|---|---|---|
| 1 | Author Bio | `stack · none · page · one · left · author block leading the footer` | Blocks close, no gaps | 8 | `share` |
| 2 | Rows | `stack · none · page · few · none · hairline between every block` | Row and its rule go | 6 | `share` |
| 3 | Card | `stack · none · surface · one · left · the footer on a raised card` | As 1; no card when empty | 8 | `share` `member-form` |
| 4 | Contrast Band | `stack · none · contrast · one · left · inverted closing band` | As 1; no band when empty | 8 | `share` |
| 5 | Split | `split · none · page · few · left · author against the next post` | Empty column collapses the split | 8 | `share` `member-form` |
| 6 | Slim | `bar · none · page · few · none · one line closing the article` | Share takes the left; nothing if both go | 5 | `share` |
| 7 | Next and Prev | `nav · none · page · few · background · paired destinations with their pictures` | One tile full width; none → hand off to 1 | 6 | — |
| 8 | Tag Row | `bar · none · page · many · none · tags as the closing gesture` | Hand off → 6 Slim | 5 | — |
| 9 | Share Row | `bar · none · surface · few · none · share bar on its own ground` | Cannot be empty | 5 | `share` |
| 10 | Big Type | `stack · none · page · one · none · the author's name at display size` | Name always drawn | 8 | `share` |
| 11 | Portrait | `split · none · page · one · right · portrait at the column height` | Plate at the portrait crop | 7 | `share` |
| 12 | Subscribe | `form · none · surface · one · none · the ask before the exit` | Nothing with members off | 6 | `member-form` |
| 13 | Rail | `edge rail · none · page · few · none · footer meta in the margin` | No rail; body takes the width | 6 | `share` |
| 14 | Ledger | `table · none · page · few · none · labelled rows of facts` | Absent rows, never "never" | 6 | `share` |
| 15 | Grid | `grid-of-N · none · page · few · top · three closing columns` | Three columns become two | 7 | `share` `member-form` |

**Every count excludes the universal trio.** **All fifteen are distinct on the five closed slots.**
Archetype carries the category — stack five, bar three, split two, one each of nav, form, edge rail,
table and grid-of-N — because **containment and ground barely move**: **fourteen `none` and no `card`
at all** ⚑ (3 Card's plane is its *ground*, not a box round the section, which is the same call A25·3
made in reverse); eleven `page`, three `surface`, one `contrast`. **The count slot does the rest:**
`few` nine times, `one` five, `many` once. **There is no `none` and no `variable` in A26** ⚑ — every
design lays out something Ghost supplies more than one of, and nothing in a post footer follows an
authored array. **Media is the quietest slot again** — nine `none`, three `left`, one each of `right`,
`top`, `background` — and **the three avatar placements are what separate 1, 10 and 15**, which draw
the same author block beside, under and above its name.

**The closest pairs are 2 Rows against 14 Ledger** (labelled rows either way, separated by archetype
and by whether a value may be taller than a line) **and 6 Slim against 9 Share Row** (the same links,
separated by ground and by whether the tags are in the line).

### Repeating items — the whole category, in one place

**There is no field in A26 that is an array the user authors** ⚑. Checked against all fifteen content
models, and unchanged by this pass. **Four things repeat and not one of them is authored in the
sidebar:** the tags, the authors, the author's social handles and the two neighbouring posts — all
Ghost's — plus the share destinations, which are **a site setting whose ordering and enabling use
P0·3's item controls inside that setting**.

So there is **no Add, no Remove, no reorder, no per-item editing and no choice of which item** in any
panel. **Five controls come closest and all five are single values written onto the section:** 8 Tag
Row's **Tags shown** (Three · Six · All — a count taken from Ghost's own tag order), 14 Ledger's
**Rows** (Three · Four · Five · All — a named set of the design's own rows, A24·11's Cells
precedent), 15 Grid's **Columns**, 7 Next and Prev's **Within** (a scope, not a selection), and the
**Share links / Links** control the twelve share designs carry.

**Every design states its behaviour at 0, 1 and many** for each array it reads. Selecting a footer on
the canvas gives the user **text fields only** — labels, kickers, one URL and 12's five member
strings — **and every one of them edits inline on the canvas as well**.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `tagsLabel` | text | yes | 24 ch | 8, 13, 14, 15 · default "Filed under" |
| `archiveLabel` | text | yes | 24 ch | 8 only · default "Browse the archive" ⚑ |
| `archiveUrl` | URL | yes | — | 8 only ⚑ · the Link Picker · default the site's tag index — finding 5 |
| `authorLinkLabel` | text | yes | 24 ch | 1, 3, 4, 5, 11, 13, 15 · default "More from {first name}" · the prefix in 10 ⚑ |
| `shareLabel` | text | yes | 24 ch | the twelve with share · default "Share this piece" · A24·14's |
| `copiedLabel` | text | yes | 24 ch | the same twelve · default "Link copied" · A24·14's |
| `rowLabels` ×4 | text | yes | 24 ch each | 2 only ⚑ · "Filed under" · "Written by" · "Share" · "Read next" |
| `ledgerLabels` ×7 | text | yes | 24 ch each | 14 only ⚑ · the six it had plus "Photography" |
| `columnLabels` ×3 | text | yes | 24 ch each | 15 only ⚑ · "Written by" · "Filed under" · "Read next" |
| `prevKicker` | text | yes | 20 ch | 7 only ⚑ · default "Previous" |
| `nextKicker` | text | yes | 20 ch | 7 only ⚑ · default "Next" |
| `deskLine` | text | yes | 60 ch | 10 only ⚑ · default "More from the {site} desk" at 3+ authors |
| `subscribeHeading` | text | yes | 40 ch | 12, and any design at Blocks Everything · falls back to the site title ⚑ |
| `subscribeLine` | text | yes | 120 ch | the same · renders nothing when empty |
| `subscribeButton` | text | yes | 20 ch | the same · default "Subscribe" · takes an optional icon ⚑ |
| `subscribedLine` | text | yes | 90 ch | 12 ⚑ · default "You are subscribed to {site}" |
| `upgradeHeading` | text | yes | 40 ch | 12 ⚑ · the free-member ask · default "You are on the free list" |
| `upgradeLine` | text | yes | 120 ch | 12 ⚑ · default "Paid members get the Thursday archive and the tape." |
| `upgradeButton` | text | yes | 20 ch | 12 ⚑ · default "Upgrade" · takes an optional icon |
| `tags[]` | array | n/a | — | 13 of 15 · `name`, `url` · never `accent_color` ⚑ · internal tags never drawn |
| `authors[]` | array | n/a | — | 11 of 15 · `name`, `bio`, `profile_image`, `url` · Ghost's order |
| `authors[].socials` | array | n/a | — | 1, 3, 4, 5, 10, 11, 15 ⚑ · nine handles + website on Ghost ≥ 6.36; Facebook and X only below |
| `prev_post` / `next_post` | object | n/a | — | 11 of 15 · `title`, `url`; `feature_image` and byline in 7 only · post-context only ⚑ |
| `post.url` | text | no | — | the twelve with share |
| `post.title` | text | no | — | the same twelve · the share text |
| `post.published_at` | date | no | — | 14 only · `<time datetime>` |
| `post.updated_at` | date | no | — | 14, and 1, 3, 4, 5 at Updated line On ⚑ |
| `post.reading_time` | integer | no | — | 14 only |
| `post.feature_image_caption` | text | n/a | — | 14 only ⚑ · the Photography row · absent caption → absent row |
| author post count | derived | — | — | 10 only ⚑ · at Post count Show · absent rather than zero |

**Nineteen authored, ten read, one derived — thirty in all**, and **every authored field is a label, a
kicker, a URL or one of the subscribe strings**: `revisionNote` is cut ⚑, so **nothing in A26 is
authored about the post rather than about the section**, which is what made that one field wrong.
**Switching between any two of the fifteen is lossless** — `tagsLabel` survives dormant in the
designs that do not draw it, the label sets in the designs that are not 2, 14 or 15, and 12's five
member strings in the fourteen without a prompt. **Derived, never stored:** the initials in an avatar
fallback, "and three others", the author's post count, the long form of a date, and **the fact that a
post has been updated at all** ⚑.

---

## 1 · The designs

### A26·1 — Author Bio

- **1 · Descriptor.** The four blocks stacked on the article's measure in the fixed order, each
  opening with a hairline, **the author block carrying the weight** — 56 px avatar, name in the
  heading font, two clamped lines of bio, the socials row, a link to the author's archive. **The
  category default and the design a switch falls back to.**
- **2 · Structural descriptor.** `stack · none · page · one · left · author block leading the footer`.
  Count `one`: the author is the unit and there is normally one. Media `left` is the avatar.
- **3 · Archetype.** stack. **No departures.**
- **4 · Responsive rule. 1440** measure 720 centred in the 1,296 box on the 72 margin, blocks at a 32
  gap, hairline above each, avatar 56, bio 15/1.6 clamped at two, socials 38-in-44, share row split,
  pair side by side at 340. **834** measure 754, pair at 357. **≤ 767** measure 350, avatar 48,
  **pair stacked previous-above-next** ⚑, share label above its buttons, **socials wrapping at 44 px
  targets**, every target 44.
- **5 · Content fields.** Read: `tags[]`, `authors[]` with `socials`, `prev_post`, `next_post`,
  `post.url`, `post.title`, and `post.updated_at` at Updated line On. Authored: `shareLabel`,
  `copiedLabel`, `authorLinkLabel`. Unread: the subscribe strings, `tagsLabel`, `archiveLabel`,
  `archiveUrl`.
- **6 · Controls.** **Blocks** (five values) · **Width** On the measure 720 · Content width 1,296 ·
  **Avatar** Compact 48 · Comfortable 56 · Spacious 72 · **Bio lines** One · Two · Full · **Rules**
  None · Above each block · Full · **Share links** Two · Three · Four · **Author socials** Off · Icons
  · Icons and names · **Updated line** Off · On. Eight, plus the universal trio. **Cut:** block order,
  block gap, a tag limit, a next/prev picture, a per-handle socials choice ⚑.
- **7 · Data.** Tags 0 → no row, no hairline; many → all of them, wrapping ⚑. Authors 1 → as drawn;
  2 → two rows and a hairline ⚑; 3+ → avatars and a names line ⚑. Socials 0 → no row ⚑; on Ghost
  < 6.36 only Facebook and X can render. Prev/next 2 → the pair; **1 → one destination at the full
  measure keeping its own label** ⚑; 0 → absent; **on a page the pair is absent** ⚑.
- **8 · Empty state.** Absent blocks close the stack ⚑; **every block empty → nothing renders**. The
  editor draws one dashed row. An empty `shareLabel` falls back.
- **9 · Behaviour module.** `share`. **No-JS, quoted:** "Share links are real `<a href="https://…">`
  URLs and work normally; only the copy-link button is hidden." Edit-safe.
- **10 · Accessibility.** `<footer>` inside the post `<article>`, **no heading of its own** ⚑. Tags a
  list of 44 px links; **the name and the archive link are two links to one URL and the second carries
  `aria-hidden`** ⚑. **The socials row is a `<ul>` whose links take catalog accessible names —
  "Rosa Menendez on Bluesky"** ⚑ — never the bare glyph. The Updated line is a `<time datetime>`. The
  pair is `<nav aria-label="Post navigation">` with `rel="prev"`/`rel="next"`. Light: name 13.1:1,
  bio 5.4:1, socials glyph 5.4:1, hairline 1.3:1. Print: **tags, byline and the Updated line print;
  share, socials and the pair do not** ⚑.
- **Repeating items.** Four, all Ghost's. No Add, Remove, reorder or per-item control. Three text
  fields, all editing inline.
- **Reconciled.** **Author socials · Off · Icons · Icons and names** joins the list — the old refusal
  was a Ghost 5.x fact and **authors on ≥ 6.36 carry nine handles and a website**; brand icons from
  P0·2, 38-in-44, absent at zero handles. **Updated line · Off · On** draws `post.updated_at` on
  14 Ledger's day-gap rule, and **the authored `revisionNote` is cut category-wide**. The destinations
  become **one site-wide ordered setting** with fixed brand glyphs. **Six controls became eight**, the
  trio sits outside the list, and the three labels edit inline while everything Ghost owns says "Edit
  in Ghost". **There was no Preview control to remove.**
- **Flagged ⚑** — the fixed order; the footer on the measure; two authors as rows and three as a line;
  Ghost's author order; the socials row's placement, version gate and absence at zero handles; the
  Updated line's day-gap rule; one destination at the full measure; the pair stacking
  previous-above-next; no accent at rest; the duplicate share row resolving in the footer's favour;
  the hidden second link; share, socials and pair omitted in print.

---

### A26·2 — Rows

- **1 · Descriptor.** Every block a full-width row across the content measure, opened by a 120 px
  uppercase label column and closed by a hairline. **The design that names its blocks instead of
  relying on their shape.**
- **2 · Structural descriptor.** `stack · none · page · few · none · hairline between every block`.
  Count `few`: **the row is the unit**, two to four of them — the difference from 1, whose unit is the
  author.
- **3 · Archetype.** stack. **One departure: at ≤ 767 the label column becomes a label line** ⚑.
- **4 · Responsive rule. 1440** rows on 1,296, label column 120 on a 24 gutter, row padding 20/28/40,
  hairline above each row and below the last, avatar 48. **834** rows 754, **label column held at
  120** ⚑. **≤ 767** rows 350, label above the row at a 12 gap, padding 20.
- **5 · Content fields.** Read: `tags[]`, `authors[]`, `prev_post`, `next_post`, `post.url`,
  `post.title`. Authored: **the four `rowLabels`** — "Filed under", "Written by", "Share", "Read
  next" — plus `shareLabel`, `copiedLabel`, `authorLinkLabel`.
- **6 · Controls.** **Blocks** · **Width** — **defaulting to Content width, the only design that
  does** ⚑ · **Row padding** Compact 20 · Comfortable 28 · Spacious 40 · **Labels** On · Off ·
  **Rules** Hairlines · None · **Share links** Two · Three · Four. Six, plus the universal trio.
  **Cut:** width, alignment, per-row padding. **No longer cut: the label text**, which is now four
  authored fields.
- **7 · Data.** Tags 0 → the row is absent with its hairline ⚑. Authors 1 or 2 → **one row, two
  people** ⚑; 3+ → avatars and a names line. Prev/next 1 → one destination, **the right half empty
  rather than stretched** ⚑; on a page the row is absent ⚑. **A row is drawn only when it has
  content** and the hairline count follows.
- **8 · Empty state.** **An empty row is never drawn** ⚑ — the label is not a promise. Editor: a
  dashed labelled row per absent block, not present when published.
- **9 · Behaviour module.** `share`, quoted as above. Edit-safe; the rows are static markup.
- **10 · Accessibility.** **The rows are a `<dl>` of `<dt>`/`<dd>` pairs** ⚑; **at Labels Off the
  `<dt>` remains and is visually hidden**, **carrying the authored label and falling back to its
  default when empty** ⚑ — the reason the labels were catalog strings is gone, the behaviour is not.
  Light: labels 5.4:1, values 13.1:1. Print: **the rows print with their labels** ⚑.
- **Repeating items.** Three Ghost arrays plus the rows themselves, decided by Blocks.
- **Reconciled.** **The four row labels stop being theme strings and become authored fields with those
  defaults** ⚑, editable inline; **the visually hidden `<dt>` at Labels Off carries the authored text**
  and falls back. The destinations become **one site-wide ordered setting** with fixed brand glyphs.
  **Row padding keeps its own name** because it is the ladder inside a row rather than the section's
  outer spacing. **Six controls, unchanged**, plus the trio. **No Author socials row was added here**:
  the patch named 1, 3, 4, 5, 10, 11 and 15, and this design draws an author row too — not added
  uninstructed, and recorded in the Reconciliation notes.
- **Flagged ⚑** — the content width as default; the labels as authored fields with the hidden `<dt>`
  behind them; the 120 column held at 834; the label line at 390; Labels Off flipping tags to pills;
  two authors in one row; the empty half of a single destination; no row without content; the rows
  printing.

---

### A26·3 — Card

- **1 · Descriptor.** The whole footer on one A19·3 surface card at the content width, symmetrical
  inset, md shadow in light and a hairline in dark, **the plane leaving below 767**. **The category's
  one raised design.**
- **2 · Structural descriptor.** `stack · none · surface · one · left · the footer on a raised card`.
  **Containment reads `card` on a first pass and is `none`:** the ground the section rests on *is* the
  plane ⚑ — A25·3's call in reverse. Ground `surface` is the slot doing the work.
- **3 · Archetype.** stack. **One departure: no card below 767** ⚑; the ground reverts.
- **4 · Responsive rule. 1440** card 1,296 or 720 + inset centred, inset 32/48/64 symmetrical, blocks
  at 28, hairlines above share and the pair. **834** card 754, **inset forced to 40** ⚑. **≤ 767** no
  card, blocks at 350, avatar 48.
- **5 · Content fields.** As 1, plus `subscribeHeading`/`subscribeLine`/`subscribeButton` at Blocks
  Everything, and `post.updated_at` at Updated line On.
- **6 · Controls.** **Blocks** · **Card width** On the measure · Content width · **Card inset**
  Compact 32 · Comfortable 48 · Spacious 64 · **Avatar** · **Rules** Between blocks · None · **Share
  links** · **Author socials** · **Updated line**. Eight, plus the universal trio with **Background
  role locked to Surface**. **Cut:** card colour, radius, a shadow value, a hover lift.
- **7 · Data.** As 1 in every case — the card changes the ground, not the content. Two authors give a
  hairline **inside** the card ⚑. Socials 0 → **the plane closes over the row and the inset is
  unchanged** ⚑. **At the paywall cut the card closes above the cut** with its lower inset intact ⚑
  (A25·3's rule).
- **8 · Empty state.** **An empty footer draws no card** ⚑. **A footer with one block still draws
  it.** Editor: dashed rows inside a dashed card.
- **9 · Behaviour module.** `share`; `member-form` at Blocks Everything. **No-JS, quoted:** `share` as
  above; `member-form` — "The `<form>` posts natively to Ghost's members endpoint; Ghost's own server
  response replaces the designed sent state." Both edit-safe.
- **10 · Accessibility.** **The card is a `div` with no role and no label** ⚑. Light: name 13.4:1 on
  `surface`, the card against the page 1.05:1 — decorative, carried by the shadow in light and the
  hairline in dark. Print: **no card; prints as 1 Author Bio on white** ⚑.
- **Repeating items.** Four, all Ghost's. Three text fields, six at Everything.
- **Reconciled.** **Author socials** and **Updated line** join the list on 1 Author Bio's terms, both
  drawn inside the plane. **Background role is locked to Surface with its reason shown** ⚑ — the raised
  plane is the design, and at Background it is 1 Author Bio. **Card inset keeps its own name** against
  the universal Vertical spacing, and **Line draws above the card, never inside it** ⚑. The
  destinations become **one site-wide ordered setting** with fixed brand glyphs; the six authored
  strings edit inline, **the subscribe button takes an optional Icon-Picker icon**, and **P0·4's
  member-aware ask is inherited whole from 12 Subscribe** at Blocks Everything. **Six controls became
  eight.**
- **Flagged ⚑** — `surface` as ground rather than `card` as containment; the locked Background role;
  the symmetrical inset; 40 forced at 834; no card below 767; the subscribe bar inside the plane; the
  card closing above a cut; no card when empty; the card omitted in print.

---

### A26·4 — Contrast Band

- **1 · Descriptor.** The footer inside a full-bleed band of the pack's `contrast` colour, every
  colour derived from the two contrast tokens, the blocks on the measure centred in it. **The
  category's one inverted closing surface.**
- **2 · Structural descriptor.** `stack · none · contrast · one · left · inverted closing band`.
  **Containment `none` even at Band edges Inset** ⚑ — a band is a ground, not a box.
- **3 · Archetype.** stack. **One departure: the band does not collapse at any width** ⚑.
- **4 · Responsive rule. 1440** band full bleed or inset to 1,296 at the pack radius, padding
  64/96/132, measure 720 centred, hairlines at 18% of the band's text. **834** padding 80, measure
  754. **≤ 767** padding 64, **32 at Inset** ⚑, measure 350, **a hairline added between the stacked
  destinations** ⚑.
- **5 · Content fields.** As 1, plus the subscribe three at Blocks Everything and `post.updated_at` at
  Updated line On. **The author's photograph is drawn; a next-post picture is not read at all** ⚑.
- **6 · Controls.** **Blocks** · **Band edges** Full bleed · Inset to the content width · **Band
  padding** Compact 64 · Comfortable 96 · Spacious 132 · **Avatar** · **Alignment** Left · Centre ·
  **Share links** · **Author socials** · **Updated line**. Eight, plus the universal trio with
  **Background role locked to Contrast** and **Top divider's Fade refused**. **Cut:** band colour,
  band height, dimmed images, a rules value.
- **7 · Data.** As 1. **The photograph is untouched — no filter, no dim, no border** ⚑. **The socials
  glyphs take the band's muted foreground** ⚑ and their boxes the band's 18% hairline. **At Blocks
  Everything the subscribe field sits on a surface derived at 6% of the band's text** ⚑, because the
  packs supply no on-contrast surface token — **finding 4**.
- **8 · Empty state.** **An empty footer draws no band** ⚑. One block still draws it at full padding.
- **9 · Behaviour module.** `share`, quoted as above. **The band, its bleed and every derived colour
  are CSS and are unaffected** ⚑.
- **10 · Accessibility.** **Every ratio is measured against the band, never the page** ⚑: dark band
  text 14.9:1, muted at 70% 8.1:1, socials glyph 8.1:1, accent `#E0805A` 6.4:1; light band text
  15.8:1, muted 6.1:1, accent `#D96C3F` 4.6:1. **Selection colour re-derived on the band** ⚑. Print:
  **the band is not printed** ⚑.
- **Repeating items.** Four, all Ghost's. Three text fields.
- **Reconciled.** **Author socials** and **Updated line** join the list, **the glyphs re-derived on the
  band** at its muted value — no brand colour on a contrast ground ⚑. **Background role is locked to
  Contrast with its reason shown**, and **Top divider's Fade is refused here** ⚑: a fade into a
  contrast ground reads as a printing fault, so Line draws above the band on the page. **Band padding
  keeps its own name.** The destinations become **one site-wide ordered setting** with fixed brand
  glyphs. **Six controls became eight**, and the derived on-band surface is still finding 4 — two
  categories have now worked around the same missing token.
- **Flagged ⚑** — seven colours from two tokens; muted 70/66%, hairlines 18/16%, plate 12%; the socials
  glyphs at the band's muted value; the accent lifting to the other mode's on each band; the band never
  collapsing; inset padding at 32; the added hairline at 390; no next-post picture at any setting; the
  derived on-band surface; Fade refused; the locked Background role; no band when empty; the band
  omitted in print.

---

### A26·5 — Split

- **1 · Descriptor.** Two columns across the content width — tags and the author left, the share row
  and the two destinations stacked right — divided by a hairline in the gutter. **The design that
  answers the footer's two questions side by side.**
- **2 · Structural descriptor.** `split · none · page · few · left · author against the next post`.
  Count `few`: the destinations, two of them.
- **3 · Archetype.** split. **One departure: the collapse is at 834, not 767** ⚑ — a 266 px right
  column is under the library's floor for prose.
- **4 · Responsive rule. 1440** 728 / 519 on a 48 gutter with a 1 px rule in it (Half 624/624, Five and
  seven reversed), avatar 56, bio clamped at two, **the socials row wrapping inside the left column**
  ⚑. **834** **one column at 754** ⚑ in the order left then right; **the gutter rule becomes a hairline
  above the share row** ⚑. **≤ 767** one column at 350, avatar 48.
- **5 · Content fields.** As 1, plus the subscribe three at Blocks Everything and `post.updated_at` at
  Updated line On.
- **6 · Controls.** **Blocks** · **Split** Half · Seven and five · Five and seven · **Column rule**
  Hairline · None · **Avatar** · **Bio lines** One · Two · Full · **Share links** · **Author socials**
  · **Updated line**. Eight, plus the universal trio, whose **Line spans both columns** ⚑. **Cut:** a
  column side, a width value, per-column padding, vertical alignment.
- **7 · Data.** Tags 0 → the author moves up. Authors 2 → two rows in the left column. Socials 0 → no
  row, and the column does not reflow ⚑. Prev/next 1 → one destination and the rule below it goes ⚑;
  **0 with share off → the right column is empty and the design collapses to one column at the
  measure** ⚑ — the only case where data overrides a control here. On a page the destinations are
  absent ⚑.
- **8 · Empty state.** **No empty column is ever drawn** ⚑; the hairline goes with it.
- **9 · Behaviour module.** `share`; `member-form` at Everything; both quoted as above. Edit-safe;
  **the columns are a grid and the collapse is a media query** ⚑.
- **10 · Accessibility.** **DOM order is left column then right at every width** ⚑, which is also the
  collapsed visual order. The gutter rule is a border and is not in the tree. Light: name 13.1:1,
  titles 13.1:1. Print: **the columns become one; share and socials omitted** ⚑.
- **Repeating items.** Four, all Ghost's.
- **Reconciled.** **Author socials** and **Updated line** join the list; **the socials row lands under
  the bio in the left column and wraps inside it** rather than widening it ⚑. The destinations become
  **one site-wide ordered setting** with fixed brand glyphs. The trio sits outside the list with
  **Line spanning both columns, never one and never in the gutter** ⚑. **Six controls became eight**;
  no per-column padding was added and there was no Preview control to remove.
- **Flagged ⚑** — Seven and five as default; the destinations stacked; nothing spanning the gutter; the
  rule to the taller column; the 834 collapse; the gutter rule becoming horizontal; the socials row
  wrapping inside its column; the emptying right column collapsing the split; no side control; no
  width control.

---

### A26·6 — Slim

- **1 · Descriptor.** One 44 px line under the article carrying the tags as a dotted run left and the
  share links right, on a hairline, with a second line for the destinations. **The footer with no
  author block in it.**
- **2 · Structural descriptor.** `bar · none · page · few · none · one line closing the article`.
  Count `few`: the term in the line. Separated from 8 by count and from 9 by ground.
- **3 · Archetype.** bar. **No departures** — a bar becomes a short stack below 767.
- **4 · Responsive rule. 1440** one line on 720 or 1,296, 44 px minimum, 16 px padding, previous
  clamped to one line and next ellipsed at 44%. **834** unchanged but for the measure. **≤ 767**
  **three rows** ⚑ at 44 px each, hairlines kept.
- **5 · Content fields.** Read: `tags[]`, `prev_post`, `next_post`, `post.url`, `post.title`.
  Authored: `shareLabel` — **read but not drawn** ⚑, it names the group for screen readers — and
  `copiedLabel`. **Unread: `authors[]` and their socials** ⚑ and the rest.
- **6 · Controls.** **Blocks** Tags · Tags and share · Tags, share and next — **three values, not
  five** ⚑ · **Width** · **Rules** Above · Above and below · None · **Alignment** Left · Centre ·
  **Share links**, **Four disabled at the 720 measure with its reason shown** ⚑. Five, plus the
  universal trio, whose **Line resolves into this design's own Rules row** ⚑.
- **7 · Data.** Tags 0 → **the share links take the left edge** ⚑; many → **the run wraps and the bar
  grows** ⚑. **Authors not read at any count** ⚑. Prev/next 1 → one side, **the other empty rather than
  stretched** ⚑; 0 → no second line; on a page there is no second line ⚑.
- **8 · Empty state.** **No tags and no destinations → nothing renders** ⚑, not an empty ruled line.
- **9 · Behaviour module.** `share`, quoted as above; **at Blocks Tags it declares nothing and `core`
  is assumed** ⚑.
- **10 · Accessibility.** **The dotted run is a real list** ⚑ with the dots as `::before`, never
  announced. **Truncated titles carry no `title` attribute** ⚑ — the full text is in the DOM and only
  clipped. Light: tags 13.1:1, prefixes 5.4:1. Print: **the tag line prints** ⚑.
- **Repeating items.** Two, both Ghost's.
- **Reconciled.** The destinations become **one site-wide ordered setting** with fixed brand glyphs;
  Share links draws the first N enabled and **Four stays disabled at the 720 measure** with its
  reason. The trio sits outside the list: **Background role live, with the note that Surface makes
  this 9 Share Row**, Vertical spacing as the footer's trailing space, **Top divider resolving into
  the design's own Rules row** ⚑. `shareLabel` and `copiedLabel` are drawn as fields and edit inline.
  **No Author socials row** ⚑ — this is the one design with no author block, which is what separates
  it from the rest of the category. **Five controls, unchanged.**
- **Flagged ⚑** — no author block and so no socials; tags as a text run; titles truncating; the empty
  side of a single destination; share moving left; three Blocks values; Four disabled at the measure;
  the run wrapping; nothing rendering when both blocks are empty; no `title` on a clipped line.

---

### A26·7 — Next and Prev

- **1 · Descriptor.** The two destinations as tiles running to the viewport edges, each carrying its
  feature image behind a warm scrim with its kicker, title and byline, mirrored left and right. **The
  category's one picture.**
- **2 · Structural descriptor.**
  `nav · none · page · few · background · paired destinations with their pictures`. **The only `nav`
  and the only `background` in A26.**
- **3 · Archetype.** nav. **One departure: it stacks into two full-width tiles** ⚑ rather than
  becoming a list — a picture cannot become a menu item.
- **4 · Responsive rule. 1440** two tiles at 720 each with a 1 px seam, height 200/260/320, scrim
  76→12%, title 24 clamped at two lines; at Edges Content width 636 each on a 24 gap. **834** 417
  each, **height forced to 220** ⚑. **≤ 767** stacked at 350, height 200, **mirror off — both tiles
  left-aligned** ⚑, arrows kept.
- **5 · Content fields.** Read: `prev_post`/`next_post` with `title`, `url`, `feature_image`,
  `feature_image_alt`, `primary_author.name`, `published_at`, **scoped by Within**. Authored:
  **`prevKicker` and `nextKicker`**, defaults "Previous" and "Next" ⚑ — the design that had no
  authored field now has two.
- **6 · Controls.** **Tile media** None · Thumbnail · Picture behind · **Tile height** Compact 200 ·
  Comfortable 260 · Spacious 320, **disabled at the other two media values with its reason shown** ⚑ ·
  **Edges** Full bleed · Content width · **Kickers** Words · Words and arrows · **Title lines** One ·
  Two · **Within** All posts · Same tag · Same author. Six, plus the universal trio. **Cut:** a scrim
  value, a crop ratio, a side swap, a heading, an Image focus — **the tile picture is Ghost's
  `feature_image`, not an authored image field, so there is no Image Picker here and the tile crops
  from the centre** ⚑.
- **7 · Data.** 2 → the pair; **1 → one tile at the full width keeping its kicker and alignment** ⚑;
  **0 → nothing renders and the route falls back to 1 Author Bio** ⚑. **Within scopes with Ghost's own
  `in="primary_tag"` / `in="primary_author"`** ⚑, and at either value a post with no scoped neighbour
  draws one tile or none. **Order is Ghost's and is not selectable** ⚑, and there is no Add. **A
  missing feature image takes A19's plate per tile** ⚑. **On a page the pair is absent** ⚑ — the
  helpers are post-context only.
- **8 · Empty state.** **Nothing renders on the first and last posts of a one-post site** ⚑. **No
  authored fallback and no placeholder picture.**
- **9 · Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑. Edit-safe.
- **10 · Accessibility.** `<nav aria-label="Post navigation">`, two anchors with `rel`. **The whole
  tile is the link** ⚑. **The feature image is a CSS background and carries no alt** ⚑ — the accessible
  name is kicker plus title; `feature_image_alt` is read at Thumbnail, where it is an `<img>`.
  Measured: title on scrim 12.6:1 darkest / 4.9:1 lightest ⚑. Print: **two lines of text, no
  pictures** ⚑.
- **Repeating items.** One, Ghost's, and **no choice of which posts** — Within chooses a scope, never
  an item, and a Ghost-sourced pair shows no Add.
- **Reconciled.** **Within · All posts · Same tag · Same author** joins the panel ⚑, on Ghost's own
  `in="primary_tag"` / `in="primary_author"` scoping — a real hookup the helper already supports and
  **the design's whole value on a multi-topic site**. **The two kickers stop being fixed English and
  become authored fields with defaults**, editable inline; at Words and arrows the arrow joins the
  authored word rather than replacing it. **The page-target rule is stated on the panel and drawn as a
  state**: on a page the pair is absent. **Image focus is not offered and the reason is shown** ⚑.
  **Five controls became six.**
- **Flagged ⚑** — full bleed with no radius or gap; the warm scrim at 76/12 and 86/20; `#FFFFFF`
  rather than the text token on the scrim; the mirror and its end at 390; 220 forced at 834; Tile
  height disabled at two of three media values; Within's three values; the authored kickers; the
  per-tile plate; the centre crop and absent Image focus; nothing with no destinations; the absent
  pair on a page; no image alt; the derived seam colour; the tiles printing as text.

---

### A26·8 — Tag Row

- **1 · Descriptor.** The post's tags as the whole footer, at reading size, in 44 px full-height
  targets under a small label, with one link to the archive. **The design for a site whose tags are
  navigation.**
- **2 · Structural descriptor.** `bar · none · page · many · none · tags as the closing gesture`.
  **The only `many` in A26.**
- **3 · Archetype.** bar. **One departure: it wraps rather than becoming a stack below 767** ⚑.
- **4 · Responsive rule. 1440** label 11 px uppercase, tags 15/17/19 in 44 px boxes on a 10 gap,
  hairline above at 32, archive link below. **834** row at 754, **size held** ⚑. **≤ 767** row at 350,
  **size held**, gap 8.
- **5 · Content fields.** Read: `tags[]` — `name` and `url`, **never `accent_color`** ⚑. Authored:
  `tagsLabel` ⚑, `archiveLabel` ⚑ and **`archiveUrl` — the only URL field in A26** ⚑.
- **6 · Controls.** **Tag style** Pills · Words · **Tag size** Compact 15 · Comfortable 17 · Spacious
  19 · **Tags shown** Three · Six · All · **Alignment** Left · Centre · **Archive link** Off · On.
  Five, plus the universal trio, whose **Line resolves into the hairline already above the row** ⚑.
  **Cut:** a tag colour, a post count, a hash prefix, which tags.
- **7 · Data.** **0 → hand off to 6 Slim's destination line** ⚑; 1 → one pill with the label and link
  kept; **7 at Tags shown Three → three pills and a "+4 more" link to the post** ⚑; 15 at All → four
  lines, stated rather than clamped. **Ghost's order, primary first, not selectable, and no Add** ⚑.
  **Internal `#hash` tags are never drawn** ⚑. **On a page the row draws normally** — a page can carry
  tags, so this design is not post-only ⚑.
- **8 · Empty state.** **An untagged post never draws this design** ⚑ — no "Untagged" pill. Editor:
  "This post has no tags. Add one in Ghost, or this footer shows the next post instead."
- **9 · Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑ — **the "+4 more" is a
  link and not a disclosure** ⚑.
- **10 · Accessibility.** A `<ul>` of links with the label as its `aria-label` ⚑, **never a heading**.
  Every target 44 px at every size and width. **The archive link is the last item in the list** ⚑.
  Light: tags 13.1:1, label 5.4:1. Print: **the tags print as a comma-separated line** ⚑.
- **Repeating items.** One, Ghost's. Tags shown picks a count, never which, and shows no Add.
- **Reconciled.** **The archive link gains a Ghost-aware Link Picker** ⚑ — it had a label and no link
  control at all. The field carries **Open in new tab** and the rel values in the same popover as
  P0·1's links, **defaults to the site's tag index**, and **resolves to the product's tags-route
  decision once that is made** — finding 5, now visible in a panel rather than only in a spec.
  `tagsLabel` and `archiveLabel` edit inline; the tag names stay Ghost's and say "Edit in Ghost".
  **Five controls, unchanged** — a content field is not a sixth control — plus the trio, with **Line
  resolving into the row's existing hairline**.
- **Flagged ⚑** — the tag at reading size; the 44 px box as the target itself; the tag accent colour
  refused; internal tags never drawn; "+4 more" as a link; the size held at every width; the hand-off
  to 6 Slim; the archive route invented (**finding 5**); the archive link inside the list; tags
  printing as a line.

---

### A26·9 — Share Row

- **1 · Descriptor.** The share destinations alone on a `surface` bar at the content width, label left
  and links right, one 44 px row. **The canonical home of the share block, and the reason A25's share
  affordance resolves to Off.**
- **2 · Structural descriptor.** `bar · none · surface · few · none · share bar on its own ground`.
  Ground is the slot doing the work — it is what separates this from 6 Slim.
- **3 · Archetype.** bar. **One departure: it becomes two rows inside the same bar rather than a
  stack** ⚑.
- **4 · Responsive rule. 1440** bar 1,296 or 720 at the pack radius, bar padding 20/28/36 vertical and
  32 horizontal, links 15/600 at 28 px gaps on 44 px targets. **834** bar 754. **≤ 767** bar 350,
  **label above the links and both left-aligned whatever Alignment says** ⚑.
- **5 · Content fields.** Read: `post.url`, `post.title`. Authored: `shareLabel`, `copiedLabel`.
  **The shortest field list in A26** ⚑.
- **6 · Controls.** **Links** Two · Three · Four · **Link style** Words · Words and glyphs ·
  **Alignment** Split · Left · Centre · **Bar padding** Compact 20 · Comfortable 28 · Spacious 36 ·
  **Edges** Content width · On the measure. Five, plus the universal trio with **Background role
  locked to Surface**. **Cut:** a glyph-only value, share counts, a native share trigger, a sticky
  value, a bar colour, **a per-section choice of glyph** ⚑.
- **7 · Data.** **Links is a count over the site-wide ordered destination list** ⚑; there is no zero
  case and no Add. **Nothing else is read**, which makes it the safe fallback ⚑. **The route rule:**
  where this design is on a route, **A25's share affordance resolves to Off and other A26 share blocks
  are suppressed** ⚑ — finding 1. **It draws on posts and pages alike.**
- **8 · Empty state.** **None in the usual sense** ⚑; an empty `shareLabel` falls back rather than
  rendering an unlabelled row ⚑.
- **9 · Behaviour module.** `share`, quoted as above. **With JavaScript off it loses one link and
  keeps its bar, label and ground** ⚑ — the smallest no-JS loss in the category.
- **10 · Accessibility.** A `<ul>` labelled by `shareLabel` ⚑. **Copy link is a `<button>` and the
  others are `<a>`** ⚑. The confirmation is announced `aria-live="polite"` and **focus never moves**.
  Light: links 13.1:1, confirmation 4.6:1 on `surface`. Print: **nothing prints** ⚑.
- **Repeating items.** One, the site's, ordered in the setting with P0·3's controls and never here.
- **Reconciled.** **The destinations become one site-wide ordered setting** ⚑ and **Links · Two ·
  Three · Four draws the first N enabled** in the owner's order, which **pays off this design's
  admitted cost — "a site that shares to LinkedIn cannot."** **Link style's glyphs are fixed
  per-platform brand icons** from P0·2's Social / Brands group ⚑, not section-choosable and not theme
  artwork. **Background role is locked to Surface with its reason shown** — the ground is what
  separates this design from 6 Slim — **Bar padding keeps its own name**, and **Line draws above the
  bar rather than inside it**. **Five controls, unchanged.** **Conflict recorded, not resolved
  silently:** A25's native-share pass gave sharing to Ghost's own `#/share` modal and reads no list at
  all, while this design and A24·14 still draw platform links and still read the setting.
- **Flagged ⚑** — `surface` as the slot that makes it a design and the locked Background role; four
  links wrapping where 6 Slim disables the same combination; horizontal padding fixed at 32; the label
  above the links at 390; the one-share-row-per-route rule; Copy link as a button; the fixed brand
  glyphs; nothing printing.

---

### A26·10 — Big Type

- **1 · Descriptor.** "More from Rosa Menendez" at display size across the content width, the bio, a
  40 px avatar and the socials row beneath it, then share and the destinations. **The category's one
  display moment.**
- **2 · Structural descriptor.** `stack · none · page · one · none · the author's name at display
  size`. Media `none`: the avatar is in a meta line, **which is what separates this from 1 Author
  Bio**.
- **3 · Archetype.** stack. **No departures** — the ladder is a scale rule, not a collapse rule.
- **4 · Responsive rule. 1440** name 44/56/72 on 1,296, leading 1.06, tracking −.02em, bio 17 clamped
  on 620, socials under the meta line. **834** 34/40/50. **≤ 767** 28/32/38. **The name wraps rather
  than shrinking at every width** ⚑.
- **5 · Content fields.** As 1, plus **the derived post count at Post count Show** ⚑ and the authored
  **`deskLine`**; `authorLinkLabel` is read as the prefix, defaulting to "More from" ⚑.
- **6 · Controls.** **Name size** Small 44 · Medium 56 · Large 72 · **Blocks** (Author always drawn) ·
  **Alignment** Left · Centre · **Bio lines** One · Two · Full · **Rule** None · Above · Below ·
  **Share links** · **Author socials** · **Post count** Show · Hide. Eight, plus the universal trio,
  whose **Line resolves into the design's own Rule row** ⚑. **Cut:** tracking, shrink-to-fit, an
  uppercase value, a name-only value.
- **7 · Data.** Authors 1 → as drawn; **2 → both names in the line, bio suppressed** ⚑; **3+ → the
  authored `deskLine`, default "More from the {site} desk"** ⚑. **The post count is absent rather than
  zero** ⚑ on an author's first piece, **and Hide is its default** ⚑. Socials 0 → no row. On a page
  the destinations are absent ⚑.
- **8 · Empty state.** **An author with no bio still draws the name at full size** ⚑ — Ghost
  guarantees an author, so the design cannot be empty.
- **9 · Behaviour module.** `share`, quoted as above. **The name, the count and the ladder are
  server-rendered** ⚑.
- **10 · Accessibility.** **The display line is a link, not a heading** ⚑ — the largest text below the
  title and still not an `h2`. **At two authors it holds two links and the "and" is outside both** ⚑.
  Light: name 13.1:1. Print: **the name prints at 24 pt**; the socials row does not print ⚑.
- **Repeating items.** Four, all Ghost's.
- **Reconciled.** **Post count · Show · Hide joins the panel, defaulting to Hide** ⚑ — the figure was
  derived and ungoverned, and "2 posts" under a 72 px name is worse than nothing; at Show it is still
  absent rather than zero. **Author socials** joins it, drawn under the meta line so the display moment
  keeps its air. **"More from the {site} desk" becomes an authored field with that default**, editable
  inline, while **the author's name inside the display line stays Ghost's**. The destinations become
  **one site-wide ordered setting** with fixed brand glyphs. **Six controls became eight**, and
  **finding 6 keeps its product question** — the default answers the layout half of it.
- **Flagged ⚑** — the ladder one step below A24·10's; the display line as the link; the derived count
  and its Hide default (**finding 6**); two authors in one line; three becoming the authored desk line;
  the name wrapping; the socials row under the meta line; the dark weight finding at display scale;
  the name printing at 24 pt.

---

### A26·11 — Portrait

- **1 · Descriptor.** The author as a 280 px portrait at 4:5 beside four lines of bio, the name at 28,
  the socials row under the words, tags above and the share row beneath. **The category's one
  photograph of a person.**
- **2 · Structural descriptor.** `split · none · page · one · right · portrait at the column height`.
  **The only `right` in A26**; the count separates it from 5 Split.
- **3 · Archetype.** split. **One departure: two columns held at 834 with the portrait forced to
  240** ⚑, collapsing only below 767.
- **4 · Responsive rule. 1440** portrait 200/280/360 at 4:5 or 1:1 on either side, 48 gutter, name 28,
  bio 17 clamped at four, socials under the bio. **834** **portrait 240** ⚑, words 466. **≤ 767**
  **portrait above the words at 350 with the ratio held** ⚑, side ignored.
- **5 · Content fields.** As 1, with `profile_image` drawn at picture scale and `socials` under the
  words.
- **6 · Controls.** **Portrait side** Left · Right · **Portrait ratio** Portrait 4:5 · Square 1:1 —
  **A8's ladder minus its landscape values** ⚑ · **Portrait size** Compact 200 · Comfortable 280 ·
  Spacious 360 · **Blocks** (Author always drawn) · **Bio lines** Two · Four · Full — **a different
  ladder from the category's** ⚑ · **Share links** · **Author socials**. Seven, plus the universal
  trio, whose **Line spans both columns** ⚑. **Cut:** a crop, a radius, a circular value, a caption,
  **and an Image focus** — **the portrait is Ghost's `profile_image`, not an authored image field:
  Ghost stores one image and no focal point, so the crop is from the centre** ⚑, which is finding 7.
- **7 · Data.** Authors 1 → as drawn; **2 → two half-width portraits with three-line bios** ⚑; **3+ →
  hand off to 1 Author Bio** ⚑. **No photograph → the initials plate at the portrait crop** ⚑. **No
  bio → the portrait keeps its height** ⚑ and the row is a picture beside two lines. Socials 0 → no
  row, and the portrait's height is unchanged ⚑.
- **8 · Empty state.** **Neither photograph nor bio → the plate and the name** ⚑, never an empty
  rectangle beside an empty column.
- **9 · Behaviour module.** `share`, quoted as above. **The portrait is an `<img>` with `width`,
  `height` and `object-fit: cover`** ⚑ — no layout shift.
- **10 · Accessibility.** **The portrait carries alt text naming the author** ⚑ — at this size it is
  content, **the opposite call from the 24 px avatar in 1 Author Bio**, stated so the build does not
  unify them; **the alt is Ghost's, not authored here**. **DOM order is words then picture at either
  side value** ⚑; Portrait side is `order`. Light: name 13.1:1. Print: **the portrait prints at
  120 px**; the socials row does not ⚑.
- **Repeating items.** Four, all Ghost's; **no per-author portrait or bio length** ⚑.
- **Reconciled.** **Author socials joins the list**, drawn under the bio in the words column, brand
  icons from P0·2, version-gated and absent at zero handles. **Image focus is not offered and the
  panel says why** ⚑ — Ghost stores one profile image and no focal point, so **finding 7 stands and a
  crop-from-top default remains the platform's call**. The destinations become **one site-wide ordered
  setting** with fixed brand glyphs. **Six controls became seven**, the trio outside the list with
  **Line spanning both columns**, and the three labels edit inline while the name, bio and alt stay
  Ghost's.
- **Flagged ⚑** — the portrait at picture scale; the centre crop and absent Image focus (**finding
  7**); the plate at the portrait crop; two authors as a two-up; three handing off; the portrait
  holding its height; 240 forced at 834; the ratio held at 390; the different Bio lines ladder; alt
  text where the avatar has none; the socials row under the bio; the portrait printing.

---

### A26·12 — Subscribe

- **1 · Descriptor.** A subscribe prompt on a `surface` bar under the article — a line, a sentence,
  one field, one button — **with no picture, no benefits, no tiers and no counts** — **and one ask per
  member state**. **The one place A26 asks for an email address.**
- **2 · Structural descriptor.** `form · none · surface · one · none · the ask before the exit`. **The
  only `form` in A26**; the archetype separates it from 9 Share Row.
- **3 · Archetype.** form. **One departure: the field and the button stack as well as the label** ⚑ at
  ≤ 767, because two 44 px targets inside 302 leave the field unusable.
- **4 · Responsive rule. 1440** bar 1,296 or 720, bar padding 32/48/64 vertical and 48 horizontal,
  field 260 and button inline. **834** row held ⚑. **≤ 767** bar 350, **words above, field and button
  stacked** ⚑, Field Inline overridden.
- **5 · Content fields.** Authored, and **all of them per member state through P0·4**:
  `subscribeHeading` (40 ch, default "Orbit Weekly, Thursdays" ⚑), `subscribeLine` (120 ch ⚑),
  `subscribeButton` (20 ch, default "Subscribe"), **`upgradeHeading` / `upgradeLine` /
  `upgradeButton`** for the free-member ask ⚑, and **`subscribedLine`** (90 ch, default "You are
  subscribed to {site}") ⚑. Read: `@site.title` for the heading fallback ⚑ and Ghost's member state.
- **6 · Controls.** **Prompt** Heading and line · One line · **Field** Inline · Stacked · **Bar
  padding** Compact 32 · Comfortable 48 · Spacious 64 · **Alignment** Left · Centre · **Edges**
  Content width · On the measure · **Member Visibility** Everyone · Logged out · Free members · Paid
  members. Six, plus the universal trio with **Background role locked to Surface**. **Cut:** a benefit
  list, a tier, a picture, a second field, a full-bleed value, a member count.
- **7 · Data.** **Ghost's members endpoint and nothing else** ⚑. **Members disabled → the design does
  not render and the editor says why** ⚑. **Logged out → the subscribe ask. A free member → the
  upgrade ask, with no field, because the address is known** ⚑. **A paid member → `subscribedLine`,
  with no field** ⚑. **An A22 section on the route → it does not render** ⚑. **It draws on posts and
  pages alike** — it reads no `prev_post`, so the page-target rule does not touch it.
- **8 · Empty state.** Every authored string falls back or renders nothing ⚑; **with members off,
  nothing renders at all** — not a disabled form.
- **9 · Behaviour module.** `member-form`. **No-JS, quoted:** "The `<form>` posts natively to Ghost's
  members endpoint; Ghost's own server response replaces the designed sent state." Edit-safe ⚑ — the
  form does not submit while editing and **the three member states are switched with P0·6**.
- **10 · Accessibility.** A `<form>` with the heading as its `aria-labelledby` ⚑ — **not a heading
  element**. A visually hidden `<label>`, **which is a catalog string**; **the placeholder is never the
  label** ⚑. **Errors are announced `aria-live="polite"` in `text`, never in red** ⚑ — **finding 3**.
  Light: button label 4.6:1; **dark 8.4:1 with the inverted foreground** ⚑. Print: **nothing prints**
  ⚑.
- **Repeating items.** **None** ⚑ — the only A26 design with no repeating unit of any kind, so P0·3
  lands nowhere here.
- **Reconciled.** **Member Visibility · Everyone · Logged out · Free members · Paid members** joins
  the panel ⚑ — the normative control the category was missing, on the one design here that makes an
  offer. **The ask becomes member-aware through P0·4**, the way the owner ruled it for headers:
  per-state strings, **a free-member upgrade ask**, and **the signed-in line as the authored
  `subscribedLine`** rather than fixed English built from the site title. **Padding is renamed Bar
  padding** ⚑ — the old row was the same Compact · Comfortable · Spacious ladder as the universal
  Vertical spacing, and the duplicate is gone; what survives is the ladder inside the bar.
  **Background role is locked to Surface with its reason shown**, and **each button takes an optional
  icon** from P0·2. **Five controls became six**; the tier facts stay Ghost's, and errors are still
  drawn in `text` — finding 3, which no pack can answer yet.
- **Flagged ⚑** — settlement 3 and the route rule; the prohibited list; one field only; the sent state
  in place; the three member asks and the free-member upgrade; the authored `subscribedLine`; the
  renamed Bar padding; the locked Background role; errors in `text`; the heading fallback; the accent
  foreground flipping in dark; Field Inline overridden at 390; nothing with members off; nothing
  printing.

---

### A26·13 — Rail

- **1 · Descriptor.** The tags as a stacked list and the share destinations as A25·9's tower in a
  240 px margin column, the author block and the destinations on the measure beside them, **the rail
  leaving the margin at 1,200**. **The footer for a post whose article already uses its margins.**
- **2 · Structural descriptor.** `edge rail · none · page · few · none · footer meta in the margin`.
  **The only `edge rail` in A26.**
- **3 · Archetype.** edge rail. **One departure: the collapsing rail goes above the author block, not
  to the foot** ⚑ — the foot is occupied by the destinations.
- **4 · Responsive rule. 1440** rail 180/240 on a 48 gutter, tags on 32 px rows, tower of 38-in-44
  boxes, body on the remaining 1,008. **1,200 and below** **rail → a row above the author** ⚑, tags
  dotted left and share right on a hairline. **834** that row at 754. **≤ 767** two rows at 44 px.
- **5 · Content fields.** As 1, plus `tagsLabel`; **`shareLabel` is drawn as the rail's own label** ⚑
  and is edited where it is read.
- **6 · Controls.** **Rail side** Left · Right · **Rail contents** Tags · Share · Tags and share ·
  **Rail width** Compact 180 · Comfortable 240 — **two values** ⚑ · **Blocks** · **Avatar** · **Share
  links**. Six, plus the universal trio, whose **Line takes the body's width, not the rail's** ⚑.
  **Cut:** a sticky value, a rail rule, a rail ground, a third width.
- **7 · Data.** Tags 0 at Rail contents Tags → **no rail at all and the body takes the content
  width** ⚑; 0 at Tags and share → the tower alone; **many → the list runs past the body, which is
  allowed** ⚑. Destinations as 1, and absent on a page ⚑.
- **8 · Empty state.** **An empty rail is never drawn and never reserved** ⚑ — the 288 returns to the
  body, A25·1's rule for its index.
- **9 · Behaviour module.** `share`, quoted as above. **The rail is a grid column and the collapse is
  a media query** ⚑ — no JavaScript, which is the difference from A25·7.
- **10 · Accessibility.** **The rail is after the body in the DOM and before it visually at Rail side
  Left** ⚑ — A25·1's rule. Rail labels are `<span>` elements used as `aria-label` on the list and the
  tower ⚑, **never headings**. Light: tags 13.1:1, labels 5.4:1. Print: **the tags print in the
  margin** ⚑, the tower omitted.
- **Repeating items.** Three, Ghost's or the site's.
- **Reconciled.** The destinations become **one site-wide ordered setting** and **the tower's glyphs
  are fixed brand icons** from P0·2 ⚑ — the tower borrowed from A25·9 keeps its geometry and loses its
  invented marks. The four labels are drawn as fields and **edit inline**, `shareLabel` where it is
  read as the rail's label. The trio sits outside the list, **Background role live with the note that
  the rail takes no ground of its own**, and **Line at the body's width rather than the rail's** ⚑.
  **Six controls, unchanged.** **No Author socials row was added here** ⚑ — the patch named seven
  designs and this was not one, though it draws the author block; recorded rather than invented.
- **Flagged ⚑** — 288 of margin deciding the 1,200 collapse; the body at 1,008; tags as a stacked
  list; the tower borrowed from A25·9 with fixed brand glyphs; the collapse going above the author; no
  rail when its contents are empty; the rail growing past the body; the rail after the body in the
  DOM; two width values; never sticky; **the same-side clash with A25's index left as a warning —
  finding 2**.

---

### A26·14 — Ledger

- **1 · Descriptor.** A colophon for the post: a right-aligned label column and one line of fact per
  row — filed under, written by, published, updated, **photography**, share, read next — a hairline
  between each. **The design that carries the credits and the dates.**
- **2 · Structural descriptor.** `table · none · page · few · none · labelled rows of facts`. **The
  only `table` in A26**, and the slot that separates it from 2 Rows.
- **3 · Archetype.** table. **One departure: it becomes label-above-value pairs rather than cards** ⚑
  — 2 Rows' collapse, **where the two designs converge** ⚑.
- **4 · Responsive rule. 1440** label column 132 or 180 right-aligned on a 24 gutter, values 15 px on
  one line each, 14 px row padding, Read next two lines with **next above previous** ⚑. **834**
  measure 754, **label column held** ⚑. **≤ 767** **label above value, left-aligned, 12 px** ⚑.
- **5 · Content fields.** Read: `tags[]`, `authors[]` (**never `bio`** ⚑), `post.published_at`,
  `post.reading_time`, **`post.updated_at`**, **`post.feature_image_caption` — new in this pass** ⚑,
  `prev_post`, `next_post`, `post.url`, `post.title`. Authored: **the seven `ledgerLabels`**,
  `shareLabel`, `copiedLabel`. **`revisionNote` is gone** ⚑.
- **6 · Controls.** **Rows** Three · Four · Five · **All** — **a fourth value, and the only one that
  draws the Photography row** ⚑ · **Label column** Compact 132 · Comfortable 180 · **Rules** Between
  rows · None · **Width** · **Blocks** · **Share links**. Six, plus the universal trio, whose **Line
  resolves into the first row's own rule** ⚑. **Cut:** a per-row toggle, label alignment, a date
  format, a word count, a licence row.
- **7 · Data.** Tags many → **the value wraps under itself, never under the label** ⚑. Authors 2 →
  joined by "and"; **3+ → "Rosa Menendez and two others"** ⚑. **Updated: drawn on the gap alone —
  `post.updated_at` more than a day after `published_at`** ⚑, **now that the authored note is cut**;
  one invented threshold instead of two. **Photography: drawn only when `feature_image_caption`
  exists** ⚑ — a photograph with no caption draws no row. Read next 2 → **next above previous** ⚑, and
  absent on a page ⚑.
- **8 · Empty state.** **A row with no value is not drawn** ⚑ — no em dash, no "None", never "Updated:
  never".
- **9 · Behaviour module.** `share`, quoted as above. **Everything else is a `<dl>` and two `<time>`
  elements** ⚑.
- **10 · Accessibility.** **A `<dl>` of `<dt>`/`<dd>` pairs** ⚑. **Both dates are `<time datetime>`**
  ⚑. Every link fills its row for a 44 px target ⚑. **The Photography row is a `<dd>` of plain text,
  never a link** ⚑ — a credit is not a destination. Light: values 13.1:1, labels 5.4:1. Print: **the
  whole ledger prints, share included as plain words** ⚑ — **the only A26 share row that survives
  print**, because in a ledger it is a fact rather than an action.
- **Repeating items.** Three, all Ghost's; Rows picks a count of the design's own rows from a named
  set.
- **Reconciled.** **A Photography row joins the ledger**, reading Ghost's `feature_image_caption` ⚑ —
  **the credit A24·5 Full Bleed promised** and had nowhere to put — drawn only when the caption
  exists, and **Rows gains a fourth value, All**, the only one that includes it. **The authored
  `revisionNote` is cut** ⚑: a section-level field would have written one note onto every post the
  template serves, and Ghost gives themes no per-post custom field to bind — so **Updated now rests on
  the day gap alone** and **finding 8 loses one of its two invented halves**. **The seven row labels
  become authored fields with defaults** and edit inline, while the caption, the dates and the names
  stay Ghost's. The destinations become **one site-wide ordered setting** with fixed brand glyphs.
  **Six controls, unchanged.**
- **Flagged ⚑** — labels right-aligned and values held to a line; the bio never read; the Photography
  row and its caption condition; Rows' fourth value; the Updated row on the day gap alone and absent
  rather than "never"; next above previous; the value wrapping under itself; three authors as "and two
  others"; the label column held at 834; the convergence with 2 Rows at 390; the share words printing.

---

### A26·15 — Grid

- **1 · Descriptor.** Three labelled columns across the content width — written by, filed under, read
  next — the avatar above the name in the first, the socials row under its bio, the share row spanning
  beneath. **A3·2's site footer, at a post's scale.**
- **2 · Structural descriptor.** `grid-of-N · none · page · few · top · three closing columns`. **The
  only `grid-of-N` in A26**; media `top` is the avatar above the name.
- **3 · Archetype.** grid-of-N. **No departures** — three to two to one is the archetype's own ladder;
  **the only addition is that the width and the Columns control resolve to the same two-column
  arrangement** ⚑.
- **4 · Responsive rule. 1440** three 400 px columns on 48 gutters with a rule in each, avatar 56 above
  a 19 px name, bio clamped at three, socials under it, destinations 17 with next above previous,
  share row spanning under a hairline. **834** **two columns, tags under the bio** ⚑, gutters 40.
  **≤ 767** one column, labels kept, **gutter rules become horizontal hairlines** ⚑.
- **5 · Content fields.** As 1, plus `tagsLabel`; **the three column labels are authored fields with
  defaults** ⚑.
- **6 · Controls.** **Columns** Two · Three · **Column rule** Hairline · None · **Blocks** ·
  **Avatar** · **Bio lines** One · Three · Full — **a different ladder from the category's** ⚑ ·
  **Share links** · **Author socials**. Seven, plus the universal trio, whose **Line spans all three
  columns** ⚑. **Cut:** column weights, a fourth column, per-column alignment, a heading.
- **7 · Data.** Tags 0 at Columns Three → **two columns, widened, no reserved third** ⚑; at Two →
  nothing under the bio. Authors 2 → two stacked in the first column at 48 px ⚑. Socials 0 → no row,
  and the column does not reflow ⚑. Destinations 0 → the column is absent and the grid is two ⚑, and
  on a page it is absent ⚑. **A grid of one column is 1 Author Bio and the panel says so** ⚑.
- **8 · Empty state.** **An empty column is never drawn and never reserved** ⚑; the rest widen.
- **9 · Behaviour module.** `share`; `member-form` at Blocks Everything; both quoted as above.
  Edit-safe.
- **10 · Accessibility.** **Each column is a `<section aria-label>` and the labels are `<span>`
  elements rather than headings** ⚑ — **which the authored labels do not change**. DOM order matches
  visual order at every width. Light: labels 5.4:1, name 13.1:1. Print: **three stacked blocks**,
  share and socials omitted ⚑.
- **Repeating items.** Four, all Ghost's; **no way to put a block in a different column** ⚑.
- **Reconciled.** **Author socials joins the list**, drawn under the bio in the first column and
  wrapping inside it. **The three column labels stop being theme strings and become authored fields
  with defaults** ⚑, editable inline, each still a `<span>` used as its column's `aria-label` rather
  than a heading. The destinations become **one site-wide ordered setting** with fixed brand glyphs,
  and the spanning share row draws the first N enabled. **Six controls became seven**, the trio outside
  the list with **Line spanning all three columns**, and the quick controls stay Columns, Blocks and
  Avatar.
- **Flagged ⚑** — equal rather than weighted columns; the avatar above the name as the media slot; the
  socials row inside the first column; next above previous; the tags moving under the bio at Columns
  Two and at 834; no reserved column; two authors stacked at 48; the gutter rules becoming horizontal;
  the different Bio lines ladder; the authored labels staying `<span>` elements; the columns printing
  stacked.

---

## 2 · Component inventory

Every reusable component this category established or reused, cumulative.

| Component | What it is | First from |
|---|---|---|
| Logo lockup · nav item · dropdown panel | 26 px accent mark + wordmark; 15 px nav; 248 px panel | A1·1 |
| Primary button · ghost action · drawer | accent fill 14/600; muted bar text; 64 px close row | A1·1, A1·2 |
| Icon button | 38 px box, bare / outlined / filled, 44 px target | A1·14 |
| Avatar + meta row | 24 px circle, initials fallback, "Name · date" at 13 px | A1·6 |
| Focus ring | 4 px accent ring on every interactive element | A6 |
| Named ratio ladder | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 | A8 |
| Measure and page margin | content 1,296 on 72; 754 on 40; 350 on 20 | A17 |
| On-contrast derivation | every colour in a band derived from two `contrast` tokens | A17·7 |
| Surface card | radius token, md shadow in light, hairline in dark | A19·3 |
| Missing-image vocabulary | Reflow · Plate · Hand off | A19 |
| Padding ladder | Compact 64 · Comfortable 96 · Spacious 132, named never numeric | A24 |
| Links control | Two · Three · Four, **the first N of one site-wide ordered list** | A24·14 |
| Share-destinations setting | ten platforms, ordered and enabled once, P0·3's controls inside it | A24·14 |
| Copied confirmation | accent fill + label for 1.6 s, `aria-live="polite"` | A24·14 |
| Share row | label left, buttons right, above a hairline | A25·1 |
| Share tower | icon buttons in a column with a label, at a margin's inner edge | A25·9 |
| Margin threshold | side furniture leaves at 1,200, not at a breakpoint | A25 |
| Inline text toolbar | bold · italic · underline · link, the popover with new-tab and rel | P0·1 |
| Icon slot + Icon Picker | one glyph, size and colour-role popover; Social / Brands group | P0·2 |
| Item-list controls | add · remove · drag reorder — **in a site setting, never in an A26 panel** | P0·3 |
| Member-aware action editor | one ask per member state | P0·4 |
| Editor state switcher | absent blocks, confirmations, member states, seen while editing | P0·6 |
| Universal trio | Background role · Vertical spacing · Top divider, outside every list | this pass |
| **Author block** | 56 px avatar, 19 px name in the heading font, 2-line bio, socials, archive link | **A26·1** |
| **Author socials row** | 38-in-44 brand icons, optional handles, version-gated, absent at zero | **A26·1** |
| **Updated line** | 13 px muted `<time>`, drawn on a gap of more than a day | **A26·1, A26·14** |
| **Tag pill** | 13 px/500 in a hairline box at the pack radius, 32-in-44 target | **A26·1** |
| **Tag pill, large** | the same at 15/17/19 in a 44 px box that *is* the target | **A26·8** |
| **Destination pair** | kicker + 2-line title, previous left and next right, `rel` attributes | **A26·1** |
| **Destination tile** | full-bleed picture behind a warm 76→12% scrim, mirrored contents | **A26·7** |
| **Scoped neighbours** | Within · All posts · Same tag · Same author, on Ghost's `in=` scoping | **A26·7** |
| **Subscribe prompt** | line, sentence, one field, one accent button on a `surface` bar | **A26·12** |
| **Member-aware ask** | subscribe · upgrade · subscribed, one authored string set each | **A26·12** |
| **Footer label** | 11 px uppercase authored string, never a heading, `aria-label` on its group | **A26·2** |
| **Ledger row** | right-aligned label column, one line of value, `<dl>` pairs | **A26·14** |
| **Photography credit row** | `feature_image_caption` as plain text, never a link | **A26·14** |
| **Blocks control** | one control, five named values, replacing per-block switches | **A26·1** |
| **Route rule** | one of a kind per route: one share block, one subscribe prompt | **A26·9, A26·12** |

---

## 3 · Findings for the architect

1. **The product has no way to express "one of a kind, per route".** A26 needs it three times: one
   share block per page (this category's own designs plus A25's affordance), and one subscribe form
   (12 Subscribe against an A22 section). **Today it is a rule written on three panels and enforced by
   nobody.** It is the single largest gap this category found, and this pass did not close it.
2. **Two sections can want the same margin and nothing stops them.** 13 Rail and A25·1's index both
   take 288 px of page margin, and a user can put them on the same side. The panel warns. **A
   margin-occupancy check at the route level would catch it; a warning at design time cannot.**
3. **No pack carries a negative token.** 12 Subscribe draws its error state in `text`, which is
   correct and is also indistinguishable from a hint. **Every A-series form will hit this.** A pack
   needs a negative colour and its on-colour before any of them can draw a real error.
4. **The packs have no on-contrast surface token.** 4 Contrast Band derives one at 6% of the band's
   text for the subscribe field. A25·4 refused to draw a share control for the same reason. **Two
   categories have now worked around the same missing token.**
5. **Ghost has no canonical "all tags" route.** 8 Tag Row's archive link now has a Link Picker and a
   default, and **the default still points at a route a theme has to invent**. **The product should
   decide the route once**, because every category with a tag row will otherwise decide it separately.
6. **An author's post count is computable and probably should not be shown.** 10 Big Type now has
   **Post count · Show · Hide, defaulting to Hide** — the layout half of the question is answered.
   **The product half is not:** whether a derived figure that is embarrassing at small values belongs
   in a theme at all.
7. **Ghost stores one profile image and no focal point.** 11 Portrait crops it to 4:5 from the centre
   and 7 Next and Prev crops the feature image the same way; **neither can offer the Image focus the
   control vocabulary asks for**, because neither picture is an authored image field. **A crop-from-top
   default would serve most portraits better**, and it is a platform-level choice the section cannot
   make alone.
8. **`updated_at` is not a revision.** Ghost stamps it on every save, including a typo fix. **This
   pass cut the authored `revisionNote`, so the Updated row and the Updated line now rest on one
   invented threshold instead of two** — a gap of more than a day. Either Ghost needs a real revision
   flag or the theme layer needs to own the threshold and say so.
9. **A26 and A27 will disagree about what "read next" means.** This category draws the post's two
   neighbours in publication order, or in `primary_tag` / `primary_author` scope; A27 Related Posts
   will draw a query. **A route with both shows the same post twice more often than not**, and the two
   categories should share the route rule from finding 1.
10. **One theme, two share experiences.** A25's native-share pass gave sharing to Ghost's own
    `#/share` modal and reads **no** destination list; A24·14 and A26·9 draw platform links and read
    **the** site-wide ordered list this pass adopted. **Both cannot be right on one page.** The owner
    should rule, and whichever way it goes, one of the three categories needs redrawing.
11. **A theme cannot ask Ghost what version it is running.** Author socials need to know whether the
    site is on ≥ 6.36 (nine handles and a website) or below it (Facebook and X). **The section degrades
    by rendering only the handles that exist**, which is honest and is also silent: an owner on 5.x
    sees a control whose values mostly do nothing. **A capability flag the theme layer can read** would
    let the panel say so.
12. **Ghost gives themes no per-post custom field.** That is why `revisionNote` had to go: the only
    place to put it was the section, and a section field is true of every post the template serves.
    **Any per-post authored addendum — a correction, a credit, an editor's note — has the same
    problem**, and several categories will want one.
13. **A universal control that resolves into a design's own furniture needs a name.** A25 found it
    first (Top divider into an index's hairline); A26 does it seven times, plus a refusal on a contrast
    band. **The platform should either bless "resolves into" as a documented behaviour or forbid it**,
    because at the moment every category is inventing the same accommodation.

---

## Reconciliation notes

**Frames changed in this pass — sixteen, and every one of them.** `A26-0 Category Proof`,
`A26-1 Author Bio`, `A26-2 Rows`, `A26-3 Card`, `A26-4 Contrast Band`, `A26-5 Split`, `A26-6 Slim`,
`A26-7 Next and Prev`, `A26-8 Tag Row`, `A26-9 Share Row`, `A26-10 Big Type`, `A26-11 Portrait`,
`A26-12 Subscribe`, `A26-13 Rail`, `A26-14 Ledger`, `A26-15 Grid`.

**All fifteen control panels** gained the **universal trio outside the list**, a **Content group** with
the design's authored fields, an **EDITING · THE P0 PRIMITIVES** block, a **DATA** block, an updated
control count, a new panel headline, and a full-width **RECONCILED IN THIS PASS** card; the twelve
share designs also gained the **read-only Share-destinations site-setting row**. **Every design's spec
card carries a new Reconciled paragraph.**

**Section frames were redrawn only where visible content changed** — eleven of them, each with a new
`reconciled states` section: `A26-1` (socials at Icons and at Icons and names, the Updated line),
`A26-3` (both, inside the plane), `A26-4` (the glyphs re-derived on the band), `A26-5` (the socials row
wrapping inside the left column), `A26-7` (Within · Same tag, and the absent pair on a page),
`A26-9` (Words and glyphs as fixed brand icons), `A26-10` (Post count Hide as the default, and Show),
`A26-11` (the socials row under the bio), `A26-12` (the three member asks), `A26-14` (the Photography
row and the Updated row with no revision note), `A26-15` (socials in the first column, labels at their
defaults). **Two panels had a row rewritten rather than added:** `A26-12`'s **Padding → Bar padding**
and `A26-14`'s **Rows → Three · Four · Five · All**.

On `A26-0 Category Proof`: the roster's control counts (all fifteen) and a new note under the table,
the withdrawn socials refusal in the floor, a new full-width **ten-rule floor card**, and the shared
field list — `revisionNote` removed, **ten rows added**, the header and the closing paragraph
restated. **The tokenisation proof, the settlements frame and the stress frame are untouched**, because
nothing in this pass changes what the footer looks like at rest in three packs.

**Item by item.**

- **Category-wide 1 — author socials, version-gated.** Added to **1, 3, 4, 5, 10, 11, 15** as
  **Author socials · Off · Icons · Icons and names**: brand icons from P0·2's Social / Brands group,
  38-in-44, **nine handles and a website on Ghost ≥ 6.36**, **Facebook and X only below it**, **the row
  absent at zero handles**. The old refusal is withdrawn with its reason kept: it was true of 5.x.
- **Category-wide 2 — `revisionNote` cut.** Removed from 14 Ledger, from the field list and from the
  category. The Updated row and the new Updated line rest on the **day-gap rule alone**.
- **Category-wide 3 — the hardcoded strings become authored fields with defaults.** 2 Rows' four row
  labels, 14 Ledger's seven, 15 Grid's three column labels, 7's two kickers, 10's desk line, 12's
  signed-in line. **All edit inline where they are drawn.**
- **Category-wide 4 — share destinations and glyphs.** A24·14's **one site-wide ordered setting** is
  adopted by all twelve share designs; **Share links / Links draws the first N enabled**; **glyphs are
  fixed per-platform brand icons**, not section-choosable.
- **Category-wide 5 — the five authored labels edit inline**, with P0·1 and its link popover, on every
  panel that reads them.
- **Per design 1 — 7 Next and Prev gains Within** (All posts · Same tag · Same author), on Ghost's
  `in="primary_tag"` / `in="primary_author"`.
- **Per design 2 — 8 Tag Row's archive link gains a Link Picker**, defaulting to the site's tag index
  and resolving to the product's tags-route decision (finding 5).
- **Per design 3 — 10 Big Type gains Post count · Show · Hide**, default **Hide**.
- **Per design 4 — 12 Subscribe gains Member Visibility and a member-aware ask** through P0·4:
  logged-out ask, **free-member upgrade ask**, authored `subscribedLine`.
- **Per design 5 — 14 Ledger gains a Photography row** reading `feature_image_caption`, and **Rows
  gains All** as the value that draws it.
- **Per design 6 — Updated line · Off · On added to 1, 3, 4 and 5**, on 14 Ledger's rule.
- **Per design 7 — the page-target rule is stated in the category floor** and on every panel that
  reads a neighbour: `{{#prev_post}}` / `{{#next_post}}` are post-context only, so **on a page the pair
  is absent**.

**Conflicts and judgements recorded rather than resolved silently.**

- **The share conflict with A25 is not resolved here.** A25's native-share pass reads no destination
  list at all; this pass adopts A24·14's site-wide list for twelve A26 designs. **Both are drawn, both
  are defensible, and one page cannot honestly have both** — finding 10, for the owner.
- **Three designs draw author content and were not named for socials:** **2 Rows**, **13 Rail** and
  **14 Ledger**. **No socials row was added to them**, because the patch named seven designs and these
  were not among them; 6 Slim has no author block at all. Recorded rather than invented.
- **Vertical spacing is live in A26, where A25 drew it inert in all twelve.** A25's reason was that
  C Post Body owns the space above the article; **A26's fixed 64 above is the floor's too, so the
  universal row was given the footer's *trailing* space instead** — Compact 40 · Comfortable 64 ·
  Spacious 96 ⚑. The two categories therefore treat the same universal control differently, and the
  precedent is stated here rather than left for the build to discover.
- **A per-design "Padding" was retired exactly once.** Only **12 Subscribe** had a row whose name and
  ladder duplicated the universal one; it is now **Bar padding**. 2 Rows' Row padding, 3 Card's Card
  inset, 4's Band padding and 9's Bar padding are **genuinely different ladders** and keep their
  distinct names, each with the reason on its panel.
- **Background role is locked on four designs** — 3, 4, 9, 12 — **with the reason shown**, on the
  ground that the ground is the design. **7 Next and Prev is not locked** although its tiles carry an
  image ground: the role is what shows at Tile media None and in the seam, so it stays live.
- **Top divider resolves into a design's own hairline seven times and is refused once** (Fade, on
  4 Contrast Band's band). Recorded as finding 13.
- **The category's own module count is corrected.** This file previously said "the eleven with share";
  **there are twelve** — 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15. An arithmetic slip, fixed here and
  in every panel that repeats the phrase.
- **Image focus lands nowhere in A26**, and rule 10 is satisfied by absence: **the category authors no
  image**. 7's tile picture and 11's portrait are Ghost's, crop from the centre, and say so on their
  panels — finding 7.
- **P0·3 lands in no A26 panel** — the only list a user orders is the Share-destinations *site
  setting*, where P0·3's controls live. **P0·5 lands nowhere** at all: the footer reads the post's own
  relations, never a query.
- **No Preview control was removed, because A26 never had one.** Rule 7 is satisfied by absence, and
  P0·6's state switcher covers what a preview would have been asked to do.
- **No ARCHITECT: registry addition anywhere.** A26 still spends `share` and `member-form`, and every
  behaviour this pass added — scoped neighbours, member-aware asks, a credit row — is server-rendered
  or already covered.
