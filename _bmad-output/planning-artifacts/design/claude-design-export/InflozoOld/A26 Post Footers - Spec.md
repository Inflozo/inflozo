# A26 Post Footers — written specification

15 designs · Paper pack · drawn 23 August 2026 · **controls-reconciliation pass, 25 August 2026** ·
**design patch pass, 30 August 2026** ·
**design patch pass two, 1 September 2026** ·
**design patch pass four, 3 September 2026** ·
**design patch pass five, 3 September 2026**

**[Free] designs:** 1 Author Bio · 6 Slim

*(**The owner's choice, ruled 30 August 2026**, from a shortlist of five — 1 Author Bio, 6 Slim, 2 Rows, 9 Share Row, 8 Tag Row. One complete footer and one minimal one, neither dependent on the customer having photographs. **Closed.** Nothing was renumbered.)*

**Design patch pass, 30 August 2026.** The category was re-read against four platform facts —
Ghost's templates cannot count, add or remember; CSS cannot see content; some fields we drew do not
exist; and inside a post's body we own the stylesheet and nothing else — and against the ten
library-wide rules. **Every change is listed with the name of the rule that required it in
Patch notes at the end of this document**, and the two decisions nobody had made are asked there in
plain words rather than guessed. **The visual language, the type scale, the colour packs, the spacing
system, the member form's sent / error / loading states and the design numbering are untouched.**

The frames are `A26-0 Category Proof.dc.html` and `A26-1` … `A26-15`. **Where this file and a drawn
panel disagree, the panel is the authority** — it is the thing that was designed; this is the thing
that was written down. Every invented decision is marked ⚑ here and on the frame.

**Design patch pass two, 1 September 2026.** The category was re-read against **five further rules** and against **two things learned by testing real Ghost servers on 31 August 2026**. The rules, by name: **a control switched off by another is greyed, with the reason beside it**; **avatars with no photograph show initials, and the two forms are not interchangeable**; **the remove button never greys out**; **a count that picks between drawn layouts is a named set, not a number picker**; **a design may declare the width below which its script runs**. The findings: **the feature-image caption renders differently on the two Ghost versions**, and **a comment count renders nothing at all without JavaScript**. This category's own work list first settled the share block one way and **the owner reversed it the same day**; the ruling that stands is **native Ghost Share only** — **one trigger opening Ghost's own share panel, which owns its destinations and their order; Copy link and Email as the fallback where the app reports an older Ghost; the 2-to-4 stepper cut; the site setting reduced to two switches; and no brand glyph in any share block** ⚑. The caption finding was carried into 14 Ledger. **Every change is listed with the rule NAME that required it in Patch notes — pass two at the end of this document.** **No frame was redesigned, no design renumbered, no control's values changed, and no printed design total exists anywhere in this category to reintroduce.** Two things edited in the repository rather than here are left exactly as they stand: **the removal of every printed design total from the marketing and app screens**, and **P0's per-prop mark allowlist, including the word "absent"**.

**Design patch pass four, 3 September 2026.** **Two rulings and five answers, carried in.** The rulings: **the all-tags link is authored, not assumed** — 8 Tag Row's archive row is **a Text Field for the label plus a Link Picker for the destination**, **the destination has no default, and the row does not render until one is set** — and **an author's post count may be shown, and a design may turn it off**, which leaves 10 Big Type's **Post count · Show · Hide** exactly as it was drawn and closes the question behind it. The five answers that already existed and are now written in rather than asked again: **every pack value is marked COMPUTED or AUTHORED, and on-contrast text, accent-on-contrast, dark elevation, dark hover-surface and tabular figures are all COMPUTED**; **which section is the main feed is stored in the project file, not worked out by a design**; **a control's dependency is declared in the control's own definition and carries its reason**; **hand-picked posts keep the order the user dragged them**; and **a design may declare more than one behaviour module, the compiler emitting the union**. **Three of the five have no subject in A26** and are recorded as having none rather than left blank. **The five rules restated for this pass are pass two's five**, re-tested here: the only new subject is **8 Tag Row's Archive link, greyed while its destination is empty, with the reason beside it**. **Every change is listed with the rule NAME in Patch notes — pass four at the end of this document.** **No frame was redesigned, no design renumbered, no control's values changed, and no printed design total exists anywhere in this category to reintroduce.**

**Design patch pass five, 3 September 2026.** **One work item, and it is a naming change.** **Image focus is one shared control, defined once in `P0 · Editor primitives` as P0·9, and it carries both axes** — the side-to-side half being the owner's ruling of 3 September 2026, which this category did not have. Until now two dozen category specs each enumerated their own copy of the control's values, which is the rule *one control name means one set of values* in its worst form in the library. **Wherever this document enumerated the focus values it now cites P0·9 instead, and it does not restate them.** **Ghost never sees a focus:** it is a hint the compiler resolves into the crop the theme ships with, which is why it is a control and not a data binding, and why it declares no behaviour module. **A26 draws the control nowhere**, before this pass and after it — the category authors no image — **so nothing drawn changed on any of the sixteen frames, no control was added or removed, no default moved and no value changed.** **Two things this pass would have had to invent are recorded as open questions instead**: whether 7 Next and Prev and 11 Portrait, which both crop a Ghost-owned photograph, should now draw the control, and whether an avatar's circular crop is a subject for it. **Every change is listed with the rule NAME in Patch notes — pass five at the end of this document.** **No printed design total exists anywhere in this category to reintroduce, and none was written.**

**Controls-reconciliation pass.** The whole category was audited, design by design, against the PRD's
control vocabulary and Ghost's verified data surface, thinking like an end user editing their own
site. This revision applies that patch. It reuses the shared editor primitives designed in **P0 ·
Editor primitives** by name and never redesigns them: **P0·1** the inline text toolbar and its link
popover (with **Open in new tab** and rel **nofollow · noreferrer · sponsored**), **P0·2** the icon
slot and Icon Picker with its size and colour-role popover — which supplies the author-socials brand
icons, the share glyphs and the optional button icons — **P0·3** the item-list controls, which in A26
apply **nowhere at all after the native-share ruling** — the destinations setting is two switches, not a list, **P0·4** the member-aware action editor, which opens
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

A26 inherits A17's page margins and content width, A19·3's card, A19's missing-image vocabulary (Reflow · Plate · Ground — **of which A26 uses only Reflow and Plate** ⚑), A24's padding ladder and A24·14's copied confirmation —
**but not its Links control and not its ordered Share-destinations setting, both of which this pass
replaces with Ghost's own share panel** ⚑, A25·9's share tower and share row, A1's avatar and its one-letter fallback, A1·2's 38-in-44 target and A6's focus ring. **A26 adds the footer block
vocabulary** — the author block, the author-socials row, the tag pill, the destination pair, the
ledger row and the subscribe prompt — and nothing else.

### The four settlements (§8 of the brief)

**1 · The author bio block, and a post with two authors.** The block is **a 56 px avatar, the name in
the heading font at 19, two clamped lines of bio and a link to the author's archive** ⚑. A26·1 draws
it and eleven designs reuse it unchanged. **Two authors are two rows with a hairline between them**
⚑, each with its own avatar, bio and link. **Three or more collapse to one row of overlapped 40 px avatars and a names line with no bios**
⚑ — **except 11 Portrait, which draws the primary author alone** ⚑, the owner's ruling of 30 August —
and from three upward the line reads "Rosa Menendez and others": **no number anywhere in a byline** ⚑.
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
block it belonged to. **No bio** → the avatar, name and link stay and the row loses one line. **No photograph** → A1's avatar drawing **one letter** ⚑, or A19's plate at 11 Portrait's crop. **No next post** → the
remaining destination takes the full width and keeps its own label ⚑. **No tags at all** → 8 Tag Row **renders nothing at all** ⚑ — no label, no ruled row, no reserved height. **No design in A26 turns into another design**: a footer hides what does not apply, and where a panel would rather the user placed something else it says so as advice. **No social handles**
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
  targets everywhere else ⚑; the share trigger and the socials icons are 38 px boxes in 44 px targets above 767
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
  field** — 8 Tag Row's `archiveUrl` — and **it opens the Ghost-aware Link Picker** ⚑. **It has no
  default, and the row it draws does not render until a destination is set** — the owner's ruling of
  3 September 2026, because **Ghost publishes no all-tags route** and a default could only point at a
  page that may not exist. **Buttons
  accept an optional icon before or after the label** from P0·2, with its size and colour-role
  popover; the only buttons in the category are 12 Subscribe's (and 3, 5, 15's at Blocks Everything).
- **No fixed English visitor-facing string ships** ⚑. Every string a reader sees is **an authored
  field with a default** or **a theme translation-catalog string**, and the spec says which per
  string. Authored with defaults: 2 Rows' four row labels, 14 Ledger's seven, 15 Grid's three column
  labels, 7's two kickers, 10's desk line, 12's five member strings, and the five labels the category
  already had. Catalog strings: **the trigger's label ("Share") and the two fallback names ("Copy link", "Email")** ⚑, **"and others"** ⚑, **"+ more"** ⚑, the long form of a date, the socials links' accessible names, the hidden field label in 12, and **the no-JavaScript notice that replaces a subscribe form** ⚑ — **new in this pass**. **No catalog string in A26 carries a number**, because no template can compute one.
- **Sharing is Ghost's own share panel, and a design draws one trigger** ⚑ — a label and a single **Share** control, never a list of platforms. **Ghost's panel owns its destinations and their order**, so nothing in A26 chooses, counts or orders them: **the 2-to-4 stepper is cut, `Share links` and `Links` leave every panel, and the ten-destination ordered setting is reduced to two switches — Copy link and Email** ⚑, **which are the fallback pair only**. **Where the app reports an older Ghost that panel does not exist** ⚑ — the same link opens the sign-in box — **so the trigger is replaced by Copy link and Email, two links in the row the destinations used to fill**, while **the editor's Share destinations row is greyed with the reason beside it**. That split is deliberate: the greyed-control rule governs a panel, and **a visitor page cannot show a greyed control**, so the page draws the fallback instead of disabling anything. **How a design knows which: a capability flag the app sets when the site is connected** ⚑, because a theme cannot ask Ghost its version — finding 11's mechanism, decided here for share. **No brand glyph is drawn in any A26 share block** ⚑; P0·2's Social / Brands group is left to the author-socials row, and **P0·3's item controls now have no subject anywhere in the category** ⚑. **A24·14's old admitted cost — "a site that shares to LinkedIn cannot" — is no longer ours to pay or to pay off:** the panel decides. **This supersedes the ruling made earlier the same day** that Ghost's panel would not be used at all — that ruling rested on Ghost 5, and the fallback pair answers Ghost 5 directly.
- **Member awareness lands on 12 Subscribe alone**, and elsewhere that is a judgement rather than an
  omission: **a tag is navigation, a byline is attribution, and a share link is not an offer.** P0·4
  opens on 12 and on the subscribe bar the other designs inherit at Blocks Everything.
- **No Preview control anywhere** — previewing belongs to the editor, and **the category never had one
  to remove.** P0·6's state switcher is how the absent blocks, the two- and three-author rows, the
  copied confirmation and 12's member states are seen while editing.
- **Behaviour comes only from the fixed module registry.** A26 spends two: `share` and `member-form`.
  **A design may declare more than one behaviour module and the compiler emits the union** — settled at
  the inventory merge, and **3 Card, 5 Split and 15 Grid have each declared both all along**, so nothing
  in the category needed a ruling.
  **Nothing in this pass needed behaviour the registry does not have**, so nothing is marked
  ARCHITECT: registry addition. **`share` is declared by the twelve designs that draw a share trigger**
  — 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15 — **twelve, not the eleven this file said before the
  pass** ⚑; the earlier count was an arithmetic slip and is corrected here and on every panel. **What `share` does after the native-share ruling is open Ghost's own share panel — and, on the older-Ghost fallback, copy a link to the clipboard** ⚑; **both need JavaScript, so unscripted a share block draws Email alone** ⚑.
- **The page-target rule.** `{{#prev_post}}` and `{{#next_post}}` **are post-context only** ⚑ — **on a
  page the destination pair is absent**, which is the category's absent-block rule and needs no new
  mechanism. 7 Next and Prev therefore does not render on a page; 8 Tag Row and 12 Subscribe do.
- **Where an image field would carry a focus, there is no image field.** Rule 10 asks every image
  field for **Image focus**, which is **one shared control defined once in P0·9, carrying both axes**;
  **this document does not restate its values.** **A26 authors no image** ⚑. 7's tile pictures are
  Ghost's `feature_image` and 11's portrait is Ghost's `profile_image` — **both crop from the centre
  and neither offers a focus**, which is finding 7 and is stated on both panels rather than left
  implicit. **Ghost never sees a focus in any case**: it is a hint the compiler resolves into the crop
  the theme ships with, which is why it is a control and not a data binding, and why it declares no
  behaviour module. **Whether the two Ghost-owned pictures should now draw it, and whether an avatar's
  circular crop is a subject for it, are OPEN FOR THE OWNER** — Patch notes, pass five.
- **Refused category-wide, each with a reason:** a comment count (A28) — **and the refusal has a second reason after this pass: Ghost writes the number in with a script and prepends it to the theme's own word, so without JavaScript the element is never created at all** ⚑, not a zero and not a dash, and the only catalog string that could ship would be the bare noun with no number and no placeholder — a related-posts grid (A27), a
  members-only badge (A32), a back-to-top link ⚑ (a browser affordance), a licence line, a word
  count. **The author's-social-links refusal is withdrawn** — see the floor's socials rule.

### The five rules of pass two, in this category

- **A control switched off by another is greyed, with the reason beside it.** Never hidden, never left accepting a value it will not honour, and the reason written as a short sentence at the control rather than as a tooltip. **A26 has eight subjects and every one was already drawn this way; the wording is now uniform across the panels.** The four locked **Background role** rows — 3 Card, 9 Share Row and 12 Subscribe to Surface, 4 Contrast Band to Contrast — stay greyed and readable with the reason beside them; **Fade stays refused on 4's band** the same way; **the greyed Share destinations row on all twelve share panels** — Ghost's panel owns the destinations, and the old stepper is **cut outright rather than greyed**, because a control with nothing left to do is not a disabled control; and **two capped steppers** grey the **+** and say why: **8 Tag Row at twelve** (past twelve the row is four lines and stops being a gesture) and **14 Ledger's Rows at seven** (the ledger has seven rows). **The one never-offered case in A26 is 12 Subscribe's member buttons** ⚑: where the connected site has self-signup switched off, or no payment provider for the upgrade ask, **the button is not drawn at all and the panel says which** — a thing the project cannot offer rather than a control another control turned off. **No A26 panel carries a visitor dark-mode switch**, so the library's other never-offered case has no subject here.
- **Avatars with no photograph show initials, and the two forms are not interchangeable.** **A26 shows one letter, everywhere, without exception** ⚑ — "Rosa Menendez" is R — because **every person in the category comes from Ghost**, and Ghost gives a theme one display name it cannot promise is splittable. **Two initials are the form for a list the user types, and A26 has no such list**, so the two forms are never mixed inside one component. Unchanged from the last pass and now stated as the rule requires: on 1, 2, 3, 4, 5, 10, 11, 13, 14 and 15, and on **11 Portrait's plate at the portrait crop**.
- **The remove button never greys out.** **No subject.** **Nothing in A26 is an authored repeating list** — the tags, the authors, the handles and the two neighbours are Ghost's, and the one list a user orders is the share-destinations site setting, where P0·3's item controls live. There is no Add, no Remove and no minimum in any A26 panel, so there is no floor sentence to draw.
- **A count that picks between drawn layouts is a named set, not a number picker.** Re-tested on all five near-count rows and **not one changes.** Number pickers, because every value draws the same arrangement with more or fewer of one thing: **8 Tag Row's Tags shown 1 to 12** and **14 Ledger's Rows 3 to 7** (rows drop from the bottom of a ledger that is drawn once). **The share stepper is not converted but cut** — after the native-share ruling there is nothing to count. Named sets, because each value is an arrangement somebody has looked at: **15 Grid's Columns · Two · Three** and **the Blocks row on eleven panels**. **7 Next and Prev's Within is a scope, not a count.** No row was converted in either direction.
- **A design may declare the width below which its script runs.** **No subject in A26** ⚑, and it is worth writing down rather than leaving blank: the category spends two modules, **`share` and `member-form`, and neither is width-dependent** — a share link is a link at every width, and the member form is one field and one button at every width. **Every collapse in the category is a media query**: 5 Split and 15 Grid at 834, 13 Rail's margin at 1,200, everything else at 767. **So no design declares a width, and no no-JavaScript line in this category needs to describe both sides of one.** **What the native-share ruling did change is the unscripted state itself:** the trigger opens a panel that needs JavaScript and Copy link needs it too, **so where share is drawn, Email alone renders** ⚑.

### The controls every design shares

**Blocks** and **Width**, in that order, open eleven of the fifteen panels, and **the universal trio
sits outside all fifteen lists.** What a design adds below them is its own argument. **After this pass, and after the native-share ruling cut one row from every share panel,
the counts run four to seven** — four on 6 and 9; five on 2, 8, 13 and 14; six on 7, 11, 12 and 15;
seven on 1, 3, 4, 5 and 10. **The PRD's ceiling is about fifteen visible controls and the tallest
panel here holds seven**, so the earlier 4–7 norm is barely lifted and the cap is nowhere near. **Quick
controls stay three to five per panel** — on 1 Author Bio they are Blocks, Width, Avatar and Bio
lines; on 14 Ledger, Rows, Label column and Width.

### The roster

| # | Design | Tuple | When content is missing | Ctl | Modules |
|---|---|---|---|---|---|
| 1 | Author Bio **[Free]** | `stack · none · page · one · left · author block leading the footer` | Blocks close, no gaps | 7 | `share` |
| 2 | Rows | `stack · none · page · few · none · hairline between every block` | Row and its rule go | 5 | `share` |
| 3 | Card | `stack · none · surface · one · left · the footer on a raised card` | As 1; no card when empty | 7 | `share` `member-form` |
| 4 | Contrast Band | `stack · none · contrast · one · left · inverted closing band` | As 1; no band when empty | 7 | `share` |
| 5 | Split | `split · none · page · few · left · author against the next post` | Empty column collapses the split | 7 | `share` `member-form` |
| 6 | Slim **[Free]** | `bar · none · page · few · none · one line closing the article` | Share takes the left; nothing if both go | 4 | `share` |
| 7 | Next and Prev | `nav · none · page · few · background · paired destinations with their pictures` | One tile full width; none → nothing renders | 6 | — |
| 8 | Tag Row | `bar · none · page · many · none · tags as the closing gesture` | Nothing renders | 5 | — |
| 9 | Share Row | `bar · none · surface · few · none · share bar on its own ground` | Cannot be empty | 4 | `share` |
| 10 | Big Type | `stack · none · page · one · none · the author's name at display size` | Name always drawn | 7 | `share` |
| 11 | Portrait | `split · none · page · one · right · portrait at the column height` | Plate at the portrait crop | 6 | `share` |
| 12 | Subscribe | `form · none · surface · one · none · the ask before the exit` | Nothing with members off | 6 | `member-form` |
| 13 | Rail | `edge rail · none · page · few · none · footer meta in the margin` | No rail; body takes the width | 5 | `share` |
| 14 | Ledger | `table · none · page · few · none · labelled rows of facts` | Absent rows, never "never" | 5 | `share` |
| 15 | Grid | `grid-of-N · none · page · few · top · three closing columns` | Three columns become two | 6 | `share` `member-form` |

**[Free] designs:** 1 Author Bio · 6 Slim

*(**The owner's choice, ruled 30 August 2026**, from the five plainest — 1 Author Bio, 6 Slim, 2 Rows, 9 Share Row, 8 Tag Row. **Closed.**)*

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
Ghost's — plus, before this pass, the share destinations — **now Ghost's own panel's, with two switches in the site setting (Copy link, Email) and no list to order** ⚑, so **P0·3's item controls have no subject anywhere in A26**.

So there is **no Add, no Remove, no reorder, no per-item editing and no choice of which item** in any
panel. **Five controls come closest and all five are single values written onto the section:** 8 Tag Row's **Tags shown** (**a stepper, 1 to 12, default 6** ⚑ — a count over Ghost's own tag order), 14 Ledger's **Rows** (**a stepper, 3 to 7, default 7** ⚑ — a count of the design's own rows, A24·11's Cells precedent), 15 Grid's **Columns** (Two · Three — **a column count and not an item count, which is why it stays a named-value row** ⚑), 7 Next and Prev's **Within** (a scope, not a selection), and — until the native-share ruling — the **Share links / Links** control the twelve share designs carried. **That row is cut** ⚑: Ghost's panel owns its destinations, so **four controls come closest now**, and not one of them ever gained an Add, a Remove or a reorder.

**Every design states its behaviour at 0, 1 and many** for each array it reads. Selecting a footer on
the canvas gives the user **text fields only** — labels, kickers, one URL and 12's five member
strings — **and every one of them edits inline on the canvas as well**.

### The shared field list — the contract that makes design-switching safe

| Field | Type | Optional | Limit | Read by |
|---|---|---|---|---|
| `tagsLabel` | text | yes | 24 ch | 8, 13, 14, 15 · default "Filed under" |
| `archiveLabel` | text | yes | 24 ch | 8 only · default "Browse the archive" ⚑ |
| `archiveUrl` | URL | yes | — | 8 only ⚑ · the Link Picker · **no default** · the row does not render until it is set — ruled 3 September 2026, finding 5 closed |
| `authorLinkLabel` | text | yes | 24 ch | 1, 3, 4, 5, 11, 13, 15 · default **"More from {author name}" — the author's full name** ⚑ · the prefix in 10 |
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
| `post.feature_image_caption` | **html** | n/a | — | 14 only ⚑ · the Photography row · **rendered as HTML so a credit link survives** ⚑ · absent caption → absent row · **Ghost 6 removes `<em>` and `<strong>`; Ghost 5 keeps them; links and `<b>` survive on both** ⚑ |
| author post count | derived | — | — | 10 only ⚑ · at Post count Show · absent rather than zero |

**Nineteen authored, ten read, one derived — thirty in all**, and **every authored field is a label, a
kicker, a URL or one of the subscribe strings**: `revisionNote` is cut ⚑, so **nothing in A26 is
authored about the post rather than about the section**, which is what made that one field wrong.
**Switching between any two of the fifteen is lossless** — `tagsLabel` survives dormant in the
designs that do not draw it, the label sets in the designs that are not 2, 14 or 15, and 12's five
member strings in the fourteen without a prompt. **Derived, never stored:** the one letter in an avatar
fallback, "and others", the author's post count, the long form of a date, and **the fact that a
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Width | On the measure 720 · Content width 1,296 |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Bio lines | One · Two · Full |
  | Rules | None · Above each block · Full |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Updated line | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Seven, plus the universal trio. **Cut:** block order, block gap, a tag limit, a next/prev
  picture, a per-handle socials choice ⚑.
- **7 · Data.** Tags 0 → no row, no hairline; many → all of them, wrapping ⚑. Authors 1 → as drawn;
  2 → two rows and a hairline ⚑; 3+ → avatars and a names line ⚑. Socials 0 → no row ⚑; on Ghost
  < 6.36 only Facebook and X can render. Prev/next 2 → the pair; **1 → one destination at the full
  measure keeping its own label** ⚑; 0 → absent; **on a page the pair is absent** ⚑.
- **8 · Empty state.** Absent blocks close the stack ⚑; **every block empty → nothing renders**. The
  editor draws one dashed row. An empty `shareLabel` falls back.
- **9 · Behaviour module.** `share`. **No-JS, quoted:** "The trigger opens Ghost's share panel, which needs JavaScript, so unscripted **Email alone renders** — a `mailto:` link; Copy link needs JavaScript too and is hidden." Edit-safe.
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
  14 Ledger's day-gap rule, and **the authored `revisionNote` is cut category-wide**. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**. **Six controls became eight**, the
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Width | On the measure 720 · Content width 1,296 (**defaulting to Content width, the only design that does**) |
  | Row padding | Compact 20 · Comfortable 28 · Spacious 40 |
  | Labels | On · Off |
  | Rules | Hairlines · None |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Five, plus the universal trio. **Cut:** width, alignment, per-row padding. **No longer cut: the
  label text**, which is now four authored fields.
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
  and falls back. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**.
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Card width | On the measure · Content width |
  | Card inset | Compact 32 · Comfortable 48 · Spacious 64 |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Rules | Between blocks · None |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Updated line | Off · On |
  | Background role (universal) | **Locked to Surface** |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Seven, plus the universal trio with **Background role locked to Surface**. **Cut:** card colour,
  radius, a shadow value, a hover lift.
- **7 · Data.** As 1 in every case — the card changes the ground, not the content. Two authors give a
  hairline **inside** the card ⚑. Socials 0 → **the plane closes over the row and the inset is
  unchanged** ⚑. **At the paywall cut the card closes above the cut** with its lower inset intact ⚑
  (A25·3's rule).
- **8 · Empty state.** **An empty footer draws no card** ⚑. **A footer with one block still draws
  it.** Editor: dashed rows inside a dashed card.
- **9 · Behaviour module.** `share`; `member-form` at Blocks Everything. **No-JS, quoted:** `share` as
  above; `member-form` — **"Ghost's signup endpoint cannot accept a plain form submission, so the form needs JavaScript; where it is unavailable a designed notice replaces the form, and the sent, error and loading states are Ghost's own script and still apply."** ⚑ Both edit-safe.
- **10 · Accessibility.** **The card is a `div` with no role and no label** ⚑. Light: name 13.4:1 on
  `surface`, the card against the page 1.05:1 — decorative, carried by the shadow in light and the
  hairline in dark. Print: **no card; prints as 1 Author Bio on white** ⚑.
- **Repeating items.** Four, all Ghost's. Three text fields, six at Everything.
- **Reconciled.** **Author socials** and **Updated line** join the list on 1 Author Bio's terms, both
  drawn inside the plane. **Background role is locked to Surface with its reason shown** ⚑ — the raised plane is the design, and at Background the footer would read like 1 Author Bio. **Card inset keeps its own name** against
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Band edges | Full bleed · Inset to the content width |
  | Band padding | Compact 64 · Comfortable 96 · Spacious 132 |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Alignment | Left · Centre |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Updated line | Off · On |
  | Background role (universal) | **Locked to Contrast** |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · ~~Fade~~ refused |

  Seven, plus the universal trio with **Background role locked to Contrast** and **Top divider's
  Fade refused**. **Cut:** band colour, band height, dimmed images, a rules value.
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
  keeps its own name.** The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**. **Six controls became eight**, and the derived on-band surface is still finding 4 — two
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Split | Half · Seven and five · Five and seven |
  | Column rule | Hairline · None |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Bio lines | One · Two · Full |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Updated line | Off · On |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Seven, plus the universal trio, whose **Line spans both columns** ⚑. **Cut:** a column side, a
  width value, per-column padding, vertical alignment.
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
  the bio in the left column and wraps inside it** rather than widening it ⚑. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**. The trio sits outside the list with
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Blocks | Tags · Tags and share · Tags, share and next — **three values, not five** |
  | Width | On the measure 720 · Content width 1,296 |
  | Rules | Above · Above and below · None |
  | Alignment | Left · Centre |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Four, plus the universal trio, whose **Line resolves into this design's own Rules row** ⚑.
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
- **Reconciled.** The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**;
  the trigger replaces them, and **the old cap at three links on the 720 measure goes with the
  stepper** ⚑ — there is nothing left to cap. The trio sits outside the list: **Background role live, with the note that Surface makes
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Tile media | None · Thumbnail · Picture behind |
  | Tile height | Compact 200 · Comfortable 260 · Spacious 320, **disabled at the other two media values with its reason shown** |
  | Edges | Full bleed · Content width |
  | Kickers | Words · Words and arrows |
  | Title lines | One · Two |
  | Within | All posts · Same tag · Same author |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Six, plus the universal trio. **Cut:** a scrim value, a crop ratio, a side swap, a heading, and
  **Image focus, the shared control defined in P0·9** — **the tile picture is Ghost's `feature_image`,
  not an authored image field, so there is no Image Picker here and the tile crops from the centre**
  ⚑. **The values are P0·9's and are not restated here**, and whether this design should now draw the
  control is an open question of pass five rather than a decision taken in it.
- **7 · Data.** 2 → the pair; **1 → one tile at the full width keeping its kicker and alignment** ⚑;
  **0 → nothing renders** ⚑ — **the footer is absent, never replaced by another design**. **Within scopes with Ghost's own
  `in="primary_tag"` / `in="primary_author"`** ⚑, and at either value a post with no scoped neighbour
  draws one tile or none. **Order is Ghost's and is not selectable** ⚑, and there is no Add. **A
  missing feature image takes A19's plate per tile** ⚑. **On a page the pair is absent** ⚑ — the
  helpers are post-context only.
- **8 · Empty state.** **Nothing renders on the first and last posts of a one-post site** ⚑. **No
  authored fallback, no placeholder picture and no other design in its place** ⚑.
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
  state**: on a page the pair is absent. **Image focus is not offered and the reason is shown** ⚑ — and
  after pass five the panel **names P0·9 as the one definition of that control** rather than listing
  its values. **Five controls became six.**
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
  `tagsLabel` ⚑, `archiveLabel` ⚑ and **`archiveUrl` — the only URL field in A26** ⚑, **which has no
  default and gates the row: no destination, no archive line** ⚑ — ruled 3 September 2026.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Tag style | Pills · Words |
  | Tag size | Compact 15 · Comfortable 17 · Spacious 19 |
  | Tags shown | **a number picker, 1 to 12, default 6** |
  | Alignment | Left · Centre |
  | Archive link | Off · On — **greyed while the destination is empty, with the reason beside it: "not available until a destination is set"** ⚑ |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Five, plus the universal trio, whose **Line resolves into the hairline already above the row**
  ⚑. **Cut:** a tag colour, a post count, a hash prefix, which tags.
- **7 · Data.** **0 → nothing renders** ⚑ — no label, no row, no reserved height; 1 → one pill with the
  label and link kept; **7 at Tags shown 3 → three pills and a "+ more" link to the post** ⚑, **with no
  number in it**; 15 at Tags shown 12 → twelve pills over four lines and the link, stated rather than
  clamped. **Ghost's order, primary first, not selectable, and no Add** ⚑.
  **Internal `#hash` tags are never drawn** ⚑. **On a page the row draws normally** — a page can carry
  tags, so this design is not post-only ⚑. **The archive line is authored in two parts and gated by
  one of them** ⚑: `archiveLabel` keeps its default, **`archiveUrl` has none, and with the destination
  empty the line does not render at all** — no label, no arrow, no reserved height, the tags closing
  the footer alone. **Both states are drawn on `A26-8`**, beside the panel as it reads while the
  destination is empty.
- **8 · Empty state.** **An untagged post never draws this design** ⚑ — no "Untagged" pill, no ruled
  row and no hand-off. Editor: "This post has no tags, so this footer renders nothing. Add a tag in
  Ghost."
- **9 · Behaviour module.** **None; `core` assumed. No-JS: pixel-identical** ⚑ — **the "+ more" is a
  link and not a disclosure** ⚑.
- **10 · Accessibility.** A `<ul>` of links with the label as its `aria-label` ⚑, **never a heading**.
  Every target 44 px at every size and width. **The archive link is the last item in the list** ⚑.
  Light: tags 13.1:1, label 5.4:1. Print: **the tags print as a comma-separated line** ⚑.
- **Repeating items.** One, Ghost's. Tags shown picks a count, never which, and shows no Add.
- **Reconciled.** **The archive link gains a Ghost-aware Link Picker** ⚑ — it had a label and no link
  control at all. The field carries **Open in new tab** and the rel values in the same popover as
  P0·1's links. **Pass four cut its default**: the destination is authored, **the row does not render
  until it is set**, and **finding 5 is closed by the owner's ruling** rather than by the product
  deciding a tags route — **A29·11's `allTopicsUrl` had already set the same precedent**.
  `tagsLabel` and `archiveLabel` edit inline; the tag names stay Ghost's and say "Edit in Ghost".
  **Five controls, unchanged** — a content field is not a sixth control — plus the trio, with **Line
  resolving into the row's existing hairline**.
- **Flagged ⚑** — the tag at reading size; the 44 px box as the target itself; the tag accent colour
  refused; internal tags never drawn; "+ more" as a link with no number in it; the size held at every width; nothing rendering on an untagged post; the archive route invented (**finding 5**); the archive link inside the list; tags
  printing as a line; **the destination authored with no default and the row gated on it** (ruled
  3 September 2026, so **no longer an invented route**); **Archive link greyed while the destination is
  empty**.

---

### A26·9 — Share Row

- **1 · Descriptor.** A share trigger alone on a `surface` bar at the content width, label left
  and the trigger right, one 44 px row ⚑ — **the destinations belong to Ghost's own share panel, which the trigger opens**. **The canonical home of the share block, and the reason A25's share
  affordance resolves to Off.**
- **2 · Structural descriptor.** `bar · none · surface · few · none · share bar on its own ground`.
  Ground is the slot doing the work — it is what separates this from 6 Slim.
- **3 · Archetype.** bar. **One departure: it becomes two rows inside the same bar rather than a
  stack** ⚑.
- **4 · Responsive rule. 1440** bar 1,296 or 720 at the pack radius, bar padding 20/28/36 vertical and
  32 horizontal, the trigger 15/600 on a 44 px target, and the fallback pair at 28 px gaps on 44 px targets ⚑. **834** bar 754. **≤ 767** bar 350,
  **label above the links and both left-aligned whatever Alignment says** ⚑.
- **5 · Content fields.** Read: `post.url`, `post.title`. Authored: `shareLabel`, `copiedLabel`.
  **The shortest field list in A26** ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Link style | Words · Words and glyph — **it places the trigger, not a list of destinations** |
  | Alignment | Split · Left · Centre |
  | Bar padding | Compact 20 · Comfortable 28 · Spacious 36 |
  | Edges | Content width · On the measure |
  | Background role (universal) | **Locked to Surface** |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Four, plus the universal trio with **Background role locked to Surface**. **Cut:** a glyph-only
  value, share counts, **the Links stepper** ⚑, **a destination list of any kind — per-section or site-wide** ⚑, a sticky value, a bar colour, **a per-section
  choice of glyph** ⚑. **What is not cut is the native trigger: it is now the whole design** ⚑.
- **7 · Data.** **Nothing about the destinations is read at all** ⚑ — **Ghost's own share panel owns them and their order** — so there is no count, no list, no zero case and no Add. **The capability flag the app sets at connect time decides which of two things the bar draws** ⚑: the trigger, or **Copy link and Email in the row the destinations used to fill**. **Nothing else is read**, which still makes it the safe fallback ⚑. **The route rule:**
  where this design is on a route, **A25's share affordance resolves to Off and other A26 share blocks
  are suppressed** ⚑ — finding 1. **It draws on posts and pages alike.**
- **8 · Empty state.** **None in the usual sense** ⚑; an empty `shareLabel` falls back rather than
  rendering an unlabelled row ⚑.
- **9 · Behaviour module.** `share`, quoted as above. **With JavaScript off it keeps its bar, label,
  ground and padding and draws Email alone** ⚑ — **the largest no-JS loss in the category after the
  native-share ruling**, where before it was the smallest: a trigger that needs a script cannot
  degrade into links that no longer exist. Drawn as the fourth state on `A26-9`.
- **10 · Accessibility.** **The trigger is a `<button>` labelled by `shareLabel`** ⚑, and on the older-Ghost fallback **Copy link is a `<button>` and Email is an `<a>` in a `<ul>` labelled the same way** ⚑. The confirmation is announced `aria-live="polite"` and **focus never moves**.
  Light: links 13.1:1, confirmation 4.6:1 on `surface`. Print: **nothing prints** ⚑.
- **Repeating items.** **None at all after the native-share ruling** ⚑ — the destinations are Ghost's panel's, and the site setting keeps two switches rather than a list, so P0·3 has no subject here.
- **Reconciled.** **The destinations became one site-wide ordered setting** ⚑ and **Links · Two ·
  Three · Four draws the first N enabled** in the owner's order, which **pays off this design's
  admitted cost — "a site that shares to LinkedIn cannot."** **Link style's glyphs are fixed
  per-platform brand icons** from P0·2's Social / Brands group ⚑, not section-choosable and not theme
  artwork. **Background role is locked to Surface with its reason shown** — the ground is what
  separates this design from 6 Slim — **Bar padding keeps its own name**, and **Line draws above the
  bar rather than inside it**. **Then the native-share ruling replaced all of that** ⚑, and the two paragraphs above are kept only so a reader can see what it replaced: **sharing is Ghost's own share panel everywhere**, opened by **one trigger**; **the site-wide ordered list is reduced to two switches**, Copy link and Email, **which are the older-Ghost fallback only**; **the Links stepper is cut**; **no brand glyph is drawn**; and **Link style now places the trigger**. **Four controls, one fewer than before.** **Finding 10 is settled the other way round from the morning's ruling** — Ghost's panel is what the theme uses — and it is A24·14 and this design that changed, not A25.
- **Flagged ⚑** — `surface` as the slot that makes it a design and the locked Background role; four
  links wrapping where 6 Slim disables the same combination; horizontal padding fixed at 32; the label
  above the links at 390; the one-share-row-per-route rule; **the trigger as a button**; **the capability flag that
  picks between the trigger and the fallback pair**; **Email alone without JavaScript**; nothing printing.

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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Name size | Small 44 · Medium 56 · Large 72 |
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything (Author always drawn) |
  | Alignment | Left · Centre |
  | Bio lines | One · Two · Full |
  | Rule | None · Above · Below |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Post count | Show · Hide |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Seven, plus the universal trio, whose **Line resolves into the design's own Rule row** ⚑.
  **Cut:** tracking, shrink-to-fit, an uppercase value, a name-only value.
- **7 · Data.** Authors 1 → as drawn; **2 → both names in the line, bio suppressed** ⚑; **3+ → the
  authored `deskLine`, default "More from the {site} desk"** ⚑. **The post count is absent rather than
  zero** ⚑ on an author's first piece, **and Hide is its default** ⚑. **The count stays in the theme and
  a design may turn it off** — the owner's ruling of 3 September 2026, which closes the question of
  whether a derived figure that reads "1 post" on a new writer's page belongs here at all; **the
  control, its values and its default are unchanged by the ruling.** Socials 0 → no row. On a page
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
  inline, while **the author's name inside the display line stays Ghost's**. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**. **Six controls became eight**, and
  **finding 6's product question is now closed as well** — ruled 3 September 2026: the count stays,
  with an off switch. The default answered the layout half; the ruling answers the other, and **nothing
  drawn on `A26-10` changes.**
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
- **5 · Content fields.** As 1, with `profile_image` drawn at picture scale, `socials` under the
  words, and **`primary_author` at three or more authors** ⚑.
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Portrait side | Left · Right |
  | Portrait ratio | Portrait 4:5 · Square 1:1 — **A8's ladder minus its landscape values** |
  | Portrait size | Compact 200 · Comfortable 280 · Spacious 360 |
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything (Author always drawn) |
  | Bio lines | Two · Four · Full — **a different ladder from the category's** |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Six, plus the universal trio, whose **Line spans both columns** ⚑. **Cut:** a crop, a radius,
  a circular value, a caption, **and Image focus, the shared control defined in P0·9** — **the
  portrait is Ghost's `profile_image`, not an authored image field: Ghost stores one image and no
  focal point, so the crop is from the centre** ⚑, which is finding 7. **The values are P0·9's and
  are not restated here**, and whether a 4:5 crop of a Ghost-owned portrait should now draw the
  control is an open question of pass five rather than a decision taken in it.
- **7 · Data.** Authors 1 → as drawn; **2 → two half-width portraits with three-line bios** ⚑; **3+ → the primary author alone, drawn exactly as at one author** ⚑ — **the owner's ruling of 30 August 2026**. `{{#primary_author}}` is Ghost's own helper for the singular first author and carries `name`, `bio`, `profile_image` and `url`, so the design needs **no loop and no arithmetic**; **the co-authors are named in one muted 13 px line under the name** — "with Daniel Reith and others", **no number**. **The split, the portrait size and the ratio are unchanged, so the design renders as itself at every author count.** **The cost, stated:** at three or more only one writer gets a photograph and a bio, and the designs that credit everyone equally are 1 Author Bio and 14 Ledger. **No photograph → the one-letter plate at the portrait crop** ⚑. **No
  bio → the portrait keeps its height** ⚑ and the row is a picture beside two lines. Socials 0 → no
  row, and the portrait's height is unchanged ⚑.
- **8 · Empty state.** **Neither photograph nor bio → the one-letter plate and the name** ⚑, never an empty
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
  icons from P0·2, version-gated and absent at zero handles. **Image focus is not offered and the panel says why** ⚑ — Ghost stores one profile image and no focal point, so **finding 7 stands and a crop-from-top default remains the platform's call**; after pass five the panel **names P0·9 as the one definition of that control** rather than listing its values. **Patched 30 August:** the hand-off at three or more authors is deleted and **the design draws `primary_author` alone**, the owner's ruling, with the co-authors as one muted line. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**. **Six controls became seven**, the trio outside the list with
  **Line spanning both columns**, and the three labels edit inline while the name, bio and alt stay
  Ghost's.
- **Flagged ⚑** — the portrait at picture scale; the centre crop and absent Image focus (**finding
  7**); the one-letter plate at the portrait crop; two authors as a two-up; **three or more drawing the primary author alone** ⚑; the portrait holding its height; 240 forced at 834; the ratio held at 390; the different Bio lines ladder; alt
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Prompt | Heading and line · One line |
  | Field | Inline · Stacked |
  | Bar padding | Compact 32 · Comfortable 48 · Spacious 64 |
  | Alignment | Left · Centre |
  | Edges | Content width · On the measure |
  | Member Visibility | Everyone · Logged out · Free members · Paid members |
  | Background role (universal) | **Locked to Surface** |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Six, plus the universal trio with **Background role locked to Surface**. **Cut:** a benefit
  list, a tier, a picture, a second field, a full-bleed value, a member count.
- **7 · Data.** **Ghost's members endpoint and nothing else** ⚑. **Members disabled → the design does not render and the editor says why** ⚑. **Self-signup switched off, or no payment provider connected for the paid ask → the button does not render either, and the editor says which** ⚑. **The Upgrade button opens Ghost's own pop-up: with JavaScript off, nothing happens** ⚑. **Logged out → the subscribe ask. A free member → the
  upgrade ask, with no field, because the address is known** ⚑. **A paid member → `subscribedLine`,
  with no field** ⚑. **An A22 section on the route → it does not render** ⚑. **It draws on posts and
  pages alike** — it reads no `prev_post`, so the page-target rule does not touch it.
- **8 · Empty state.** Every authored string falls back or renders nothing ⚑; **with members off,
  nothing renders at all** — not a disabled form.
- **9 · Behaviour module.** `member-form`. **No-JS, quoted:** **"Ghost's signup endpoint cannot accept a
  plain form submission, so the form needs JavaScript; where it is unavailable a designed notice
  replaces the form — one catalog sentence in `text-muted` at 15, in the space the field and the button
  occupied, the bar keeping its ground, its padding and its words — and the sent, error and loading
  states are Ghost's own script and still apply."** ⚑ **Tested against both live Ghost servers, and the
  earlier claim that this form "posts natively" is withdrawn.** Edit-safe ⚑ — the
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Rail side | Left · Right |
  | Rail contents | Tags · Share · Tags and share |
  | Rail width | Compact 180 · Comfortable 240 — **two values** |
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Five, plus the universal trio, whose **Line takes the body's width, not the rail's** ⚑. **Cut:**
  a sticky value, a rail rule, a rail ground, a third width.
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
- **Reconciled.** The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere** and **the tower's glyphs
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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Rows | **a number picker, 3 to 7, default 7** — the + is greyed at seven with the reason shown |
  | Label column | Compact 132 · Comfortable 180 |
  | Rules | Between rows · None |
  | Width | On the measure 720 · Content width 1,296 |
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Five, plus the universal trio, whose **Line resolves into the first row's own rule** ⚑. **Cut:**
  a per-row toggle, label alignment, a date format, a word count, a licence row.
- **7 · Data.** Tags many → **the value wraps under itself, never under the label** ⚑. Authors 2 →
  joined by "and"; **3+ → "Rosa Menendez and others"** ⚑, with no number. **Updated: drawn on the gap alone —
  `post.updated_at` more than a day after `published_at`** ⚑, **now that the authored note is cut**;
  one invented threshold instead of two. **Photography: drawn only when `feature_image_caption` exists** ⚑ — a photograph with no caption draws no row — **and the caption is rendered as HTML, so a photographer's credit link survives** ⚑. **The two supported Ghost versions render that caption differently and the row lives with it** ⚑: **Ghost 6 removes `<em>` and `<strong>` while keeping links and `<b>`, and Ghost 5 keeps everything** — same stored text, two outputs — so **the Photography row never leans on italics for meaning**. The credit and its link survive on both versions; the emphasis does not. Read next 2 → **next above previous** ⚑, and
  absent on a page ⚑.
- **8 · Empty state.** **A row with no value is not drawn** ⚑ — no em dash, no "None", never "Updated:
  never".
- **9 · Behaviour module.** `share`, quoted as above. **Everything else is a `<dl>` and two `<time>`
  elements** ⚑.
- **10 · Accessibility.** **A `<dl>` of `<dt>`/`<dd>` pairs** ⚑. **Both dates are `<time datetime>`**
  ⚑. Every link fills its row for a 44 px target ⚑. **The Photography row is a `<dd>` of Ghost's own HTML** ⚑ — **the row itself is never a link, and a link inside the caption is kept**, taking the design's own link colour and filling a 44 px target inside its row. The old plain-text rule is withdrawn: it threw away the one thing the field usually carries. **Emphasis inside the caption is not promised** ⚑ — Ghost 6 strips `<em>` and `<strong>` — **so nothing the row means may depend on it**; links and `<b>` survive on both supported versions. Light: values 13.1:1, labels 5.4:1. Print: **the whole ledger prints except the Share row** ⚑ — **a trigger is not a fact and cannot be
  printed**, so after the native-share ruling the row is absent in print, as every other empty row is.
  **Whether it should instead print the post's URL is an open question** at the end of this document,
  and it is not answered here.
- **Repeating items.** Three, all Ghost's; Rows picks a count of the design's own rows from a named
  set.
- **Reconciled.** **A Photography row joins the ledger**, reading Ghost's `feature_image_caption` ⚑ —
  **the credit A24·5 Full Bleed promised** and had nowhere to put — drawn only when the caption
  exists, and **Rows gains a fourth value, All**, the only one that includes it. **The authored
  `revisionNote` is cut** ⚑: a section-level field would have written one note onto every post the
  template serves, and Ghost gives themes no per-post custom field to bind — so **Updated now rests on
  the day gap alone** and **finding 8 loses one of its two invented halves**. **The seven row labels
  become authored fields with defaults** and edit inline, while the caption, the dates and the names
  stay Ghost's. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**.
  **Six controls, unchanged.**
- **Flagged ⚑** — labels right-aligned and values held to a line; the bio never read; the Photography
  row and its caption condition; Rows' fourth value; the Updated row on the day gap alone and absent
  rather than "never"; next above previous; the value wrapping under itself; three authors as "and others" with no number; the label column held at 834; the convergence with 2 Rows at 390; the share words printing.

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
- **6 · Controls.**

  | Control | Values |
  |---|---|
  | Columns | Two · Three |
  | Column rule | Hairline · None |
  | Blocks | Author · Author and tags · Tags, author and share · Everything but subscribe · Everything |
  | Avatar | Compact 48 · Comfortable 56 · Spacious 72 |
  | Bio lines | One · Three · Full — **a different ladder from the category's** |
  | Share destinations | **greyed, with the reason beside it — Ghost's own share panel owns the destinations and their order; the old 2-to-4 stepper is cut** |
  | Author socials | Off · Icons · Icons and names |
  | Background role (universal) | Background · Surface · Contrast |
  | Vertical spacing (universal) | Compact · Comfortable · Spacious |
  | Top divider (universal) | None · Line · Fade |

  Six, plus the universal trio, whose **Line spans all three columns** ⚑. **Cut:** column
  weights, a fourth column, per-column alignment, a heading.
- **7 · Data.** Tags 0 at Columns Three → **two columns, widened, no reserved third** ⚑; at Two →
  nothing under the bio. Authors 2 → two stacked in the first column at 48 px ⚑. Socials 0 → no row,
  and the column does not reflow ⚑. Destinations 0 → the column is absent and the grid is two ⚑, and
  on a page it is absent ⚑. **At one column the panel advises 1 Author Bio** ⚑ — **advice, never a switch**: the design goes on rendering as one column of its own.
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
  than a heading. The destinations become **Ghost's own share panel's**, with **two fallback switches in the site setting and no brand glyph anywhere**,
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
| Avatar + meta row | 24 px circle, **one-letter fallback**, "Name · date" at 13 px | A1·6 |
| Focus ring | 4 px accent ring on every interactive element | A6 |
| Named ratio ladder | Landscape 3:2 · Wide 16:9 · Square 1:1 · Portrait 4:5 | A8 |
| Measure and page margin | content 1,296 on 72; 754 on 40; 350 on 20 | A17 |
| On-contrast derivation | every colour in a band derived from two `contrast` tokens | A17·7 |
| Surface card | radius token, md shadow in light, hairline in dark | A19·3 |
| Missing-image vocabulary | Reflow · Plate · Ground ⚑ *corrected 1 September 2026 — A19 deleted Hand off and Ground replaced it; A24 adds Hide* | A19 |
| Padding ladder | Compact 64 · Comfortable 96 · Spacious 132, named never numeric | A24 |
| Share trigger | one control that opens **Ghost's own share panel**; **no destination list, no count, no brand glyph** | A26·9, this pass |
| Share-destinations setting | **two switches — Copy link and Email — the older-Ghost fallback only** | A26, this pass |
| Copied confirmation | accent fill + label for 1.6 s, `aria-live="polite"` | A24·14 |
| Share row | label left, buttons right, above a hairline | A25·1 |
| Share tower | icon buttons in a column with a label, at a margin's inner edge | A25·9 |
| Margin threshold | side furniture leaves at 1,200, not at a breakpoint | A25 |
| Inline text toolbar | bold · italic · underline · link, the popover with new-tab and rel | P0·1 |
| Icon slot + Icon Picker | one glyph, size and colour-role popover; Social / Brands group | P0·2 |
| Item-list controls | add · remove · drag reorder — **no subject anywhere in A26 after the native-share ruling** | P0·3 |
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
| **Photography credit row** | `feature_image_caption` **as Ghost's HTML, a credit link kept**; the row itself never a link | **A26·14** |
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
   categories have now worked around the same missing token.** **Narrowed, 3 September 2026:** every
   pack value is marked COMPUTED or AUTHORED, and **on-contrast text and accent-on-contrast are
   COMPUTED** — so **no design derives a readable text colour for a coloured band, here or anywhere**,
   and 4 Contrast Band's glyph and text colours come from the pack. **What is still missing is a
   surface on contrast** — a field background on the band rather than text on it, which is not one of
   the five COMPUTED values — **so the finding stands, narrowed to that one value.**
5. **~~Ghost has no canonical "all tags" route.~~ Settled by the owner, 3 September 2026 — and with
   his own answer rather than either option he was offered.** The platform fact is unchanged: **Ghost
   publishes a page per tag and nothing above them**, so a destination cannot be hard-coded — and the
   link cannot simply be dropped either, because a site owner may well have built such a page. **The
   ruling: the link is authored.** 8 Tag Row's archive row is **a Text Field for the label plus a Link
   Picker for the destination**, both already in the control vocabulary; **the destination has no
   default**; and **the row does not render until one is set**, so it can never ship broken and an
   owner with no such page simply leaves it empty. **The product does not have to decide a route after
   all** — which is what the finding asked for. **A20's and A29·11's versions of the same field should
   follow**, and A29·11 already does.
6. **~~An author's post count is computable and probably should not be shown.~~ Settled by the owner,
   3 September 2026.** 10 Big Type has **Post count · Show · Hide, defaulting to Hide** — the layout
   half, answered by the last pass. **The product half is now answered too: it stays, and a design may
   turn it off.** A new writer's page reading "1 post" is the reason the switch exists rather than the
   reason to refuse the figure. **Nothing drawn changes**, and the question is closed.
7. **Ghost stores one profile image and no focal point.** 11 Portrait crops it to 4:5 from the centre
   and 7 Next and Prev crops the feature image the same way; **neither can offer the Image focus the
   control vocabulary asks for**, because neither picture is an authored image field. **A crop-from-top
   default would serve most portraits better**, and it is a platform-level choice the section cannot
   make alone. **Reopened by pass five, on one word of P0·9.** Image focus is now defined once, in
   P0·9, and that definition says the choice is **a hint the compiler resolves and Ghost never sees**
   — so **whether Ghost stores a focal point has no bearing on whether the control can be offered**,
   and this finding's stated reason for the absence no longer holds on its own. P0·9's own ground for
   not drawing the control is a design that **crops nothing**, and both of these crop. **The absence
   is left exactly as drawn and the question is put to the owner** in Patch notes, pass five, rather
   than settled here: adding a control to two designs is not a naming change.
8. **`updated_at` is not a revision.** Ghost stamps it on every save, including a typo fix. **This
   pass cut the authored `revisionNote`, so the Updated row and the Updated line now rest on one
   invented threshold instead of two** — a gap of more than a day. Either Ghost needs a real revision
   flag or the theme layer needs to own the threshold and say so.
9. **A26 and A27 will disagree about what "read next" means.** This category draws the post's two
   neighbours in publication order, or in `primary_tag` / `primary_author` scope; A27 Related Posts
   will draw a query. **A route with both shows the same post twice more often than not**, and the two
   categories should share the route rule from finding 1.
10. **~~One theme, two share experiences.~~ Settled by the owner, 1 September 2026.** A25's native-share pass gave sharing to Ghost's own
    `#/share` modal and reads **no** destination list; A24·14 and A26·9 draw platform links and read
    **the** site-wide ordered list this pass adopted. **Both cannot be right on one page.** The owner
    should rule, and whichever way it goes, one of the three categories needs redrawing. **The ruling: we do not use Ghost's own share popup anywhere.** It does not exist on Ghost 5 — the same link opens the sign-in box — and where it does exist it is a sealed frame we cannot style, with a fixed order and no Mastodon. **~~A24·14 and A26·9 keep ordinary links reading the site-wide ordered list, and A25's native-share pass is the frame that needs redrawing.~~** **Reversed the same day, by the owner: native Ghost Share only, everywhere.** Where the app reports an older Ghost, **the share block draws Copy link and Email and nothing else**, and the editor's destinations row is greyed with the reason. **So A25's native-share pass was right about the mechanism**, and it is **A24·14, A26 and the site setting that change**. The finding is closed in the opposite direction to the morning's entry, which is left above so the reversal is visible.
11. **A theme cannot ask Ghost what version it is running.** Author socials need to know whether the
    site is on ≥ 6.36 (nine handles and a website) or below it (Facebook and X). **The section degrades
    by rendering only the handles that exist**, which is honest and is also silent: an owner on 5.x
    sees a control whose values mostly do nothing. **A capability flag the theme layer can read** would
    let the panel say so. **After this pass the same gap has a second instance:** the feature-image caption renders differently on Ghost 5 and Ghost 6 — 14 Ledger's Photography row — **and a theme still cannot ask which version it is running**, so the difference can only be documented, never handled.
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
  panels — finding 7. **Since pass five the control has one definition, P0·9, carrying both axes**, and
  every place this category named it cites that section instead of listing values.
- **P0·3 lands in no A26 panel** — the only list a user orders is the Share-destinations *site
  setting*, where P0·3's controls live. **P0·5 lands nowhere** at all: the footer reads the post's own
  relations, never a query.
- **No Preview control was removed, because A26 never had one.** Rule 7 is satisfied by absence, and
  P0·6's state switcher covers what a preview would have been asked to do.
- **No ARCHITECT: registry addition anywhere.** A26 still spends `share` and `member-form`, and every
  behaviour this pass added — scoped neighbours, member-aware asks, a credit row — is server-rendered
  or already covered.

---

## Patch notes — post footers patch, 30 August 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered. Where a ruling could not be applied without inventing a decision, it is written
here as an **open question** and asked in plain words at the end.

**Frames changed — all sixteen:** `A26-0 Category Proof` and `A26-1` … `A26-15`. Every design frame
carries a dated **post footers patch** panel at the foot saying what changed in that design and which
rule required it, and `A26-0` carries the category's version of the same panel plus **a badged
`[Free] designs` card under the roster**.

### This category's own rulings — Part B of the brief

| What changed | Why, and where |
|---|---|
| **No number appears in a byline anywhere in the category.** "Rosa Menendez and three others" is now **"Rosa Menendez and others"** — in settlement 1, in the shared field list's derived line, on 1 Author Bio, 2 Rows, 3 Card, 4 Contrast Band, 14 Ledger and on the proof. 10 Big Type was already clean: at three or more authors it draws the authored desk line. **The string is a catalog string and it no longer interpolates anything**, which is why a template can render it: Ghost can be told inside a loop that a third author exists, and cannot be told how many are left. | *(Ghost's templates cannot count, add or remember.)* |
| **The tag row's overflow carries no number either.** 8 Tag Row's **"+4 more" is now "+ more"** — in the drawn row, in the control note, in the data field, in the accessibility line and in the flagged list. Same reason, same mechanism: the link is drawn when a tag past the number exists, and **nothing can subtract the drawn tags from the total**. **It is still a link and still not a disclosure**, so the design's unscripted page is unchanged. | *(Ghost's templates cannot count, add or remember.)* |
| **"More from" uses the author's full name.** The archive link reads **"More from Rosa Menendez"**, and `authorLinkLabel`'s default changes with it in all seven designs that read it and in 10 Big Type, which reads it as a prefix. **Ghost gives a theme one display name and no separate first name** on the versions we support, so the first-name form could only have been produced by splitting a string the platform does not promise is splittable — "Ada Lovelace-Byron", "Kim Min-jun", a single-word name, an organisation. 10 Big Type's display line already used the full name and is untouched. | *(Some fields we drew do not exist.)* |
| **A caption that carries a link keeps it.** 14 Ledger's Photography row takes **Post Headers' treatment**: `post.feature_image_caption` is **rendered as HTML**, so the credit link a photographer needs survives, and the field's type in the shared list changes from text to **html**. The old rule — "a `<dd>` of plain text, **never a link** — a credit is not a destination" — **is withdrawn**: a photograph credit is very often exactly a link, and stripping it threw away the one thing the field usually holds. **What survives from the old rule is the part that was right:** the row itself is not a link. A link inside the caption takes the design's own link colour, fills a 44 px target inside its row, and **the caption stays Ghost's — clicking it says "Edit in Ghost"**. A post with no caption still draws no row. Drawn on `A26-14` on the credit "Elena Ruiz". | *(Post Headers' caption ruling, applied here.)* |

### The library-wide rules

| Rule | What it did here |
|---|---|
| **The two free designs are the owner's choice — ask him** | Shortlisted the five plainest, none of which needs the customer to have good photography: **1 Author Bio** (the category default — four blocks on the measure, ships without looking unfinished, and its only picture is an avatar Ghost already draws as a letter), **6 Slim** (one 44 px line, no author block, no picture of any kind — the smallest thing a site can close a post with), **2 Rows** (labelled rows, plain, but the label column is a decision a free site has to get right), **9 Share Row** (one bar, indifferent to content, but it closes a post with an action rather than a fact) and **8 Tag Row** (plainest of all to look at, and useless on a site that does not tag). Recommended, and **ruled by the owner on 30 August 2026: 1 Author Bio · 6 Slim** — one complete footer and one minimal one. The line is at the head of this document in the required shape and badged under the roster on `A26-0`. **Closed.** |
| **No design ever turns into another design** | **Three hand-offs deleted and six phrases reworded.** **8 Tag Row** no longer hands off to 6 Slim: an untagged post **renders nothing at all** — no label, no ruled row, no reserved height — and the editor reads "This post has no tags, so this footer renders nothing. Add a tag in Ghost." It was the category's only design that swapped rather than dropped, and **the category now has none**. **7 Next and Prev** no longer falls back to 1 Author Bio: with no neighbours **nothing renders**, in the descriptor, the data field and the empty state. **11 Portrait** no longer hands off at three authors: **it draws `primary_author` alone** — the owner's ruling of 30 August — with the co-authors as one muted line and no number. On **3 Card**, **4 Contrast Band**, **5 Split**, **6 Slim**, **13 Rail** and **15 Grid**, every "the design **is** 1 Author Bio / 9 Share Row / 6 Slim" now reads **"reads like"** or **"the panel advises"**: a comparison a panel may draw and a piece of advice it may give, **never a switch it performs**. **A19's Hand off value is therefore no longer used anywhere in A26**, which now uses Reflow and Plate only. |
| **Item counts are a number picker** | **Partly superseded: the share stepper is cut by the native-share ruling.** **Three rows became steppers and one was ruled not to be a count.** **Share links / Links** on all twelve share designs: **a stepper, 2 to 4, default 4**, drawing the first N of the site's ordered destinations, the + greyed at four with the reason visible — and on **6 Slim** the + is greyed at **three** on the 720 measure, where the old row disabled the value Four. **8 Tag Row's Tags shown: a stepper, 1 to 12, default 6**, the + greyed at twelve because past twelve the row is four lines and stops being a gesture. **14 Ledger's Rows: a stepper, 3 to 7, default 7** — the ledger has seven rows and seven is the value that draws the Photography row, so **the "All" special case disappears without costing anything**. **15 Grid's Columns · Two · Three stays a named-value row**: it is a column count, not an item count — the items are the footer's blocks and the control decides how many lanes they fill. **One deliberate loss is recorded:** Tags shown's old **All** value is gone, so a post with more than twelve tags now draws twelve and the "+ more" link. |
| **The no-JavaScript notice** | **A false promise withdrawn and a notice designed.** The category's member-form quote read "the `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the designed sent state." **Tested against both live Ghost servers, Ghost's signup endpoint cannot accept a plain form submission**, so the claim is wrong and is deleted from **12 Subscribe** and from the inherited subscribe bar on **3 Card**, **5 Split** and **15 Grid**. In its place: **where JavaScript is unavailable, a designed notice replaces the form** — one catalog sentence in `text-muted` at 15, in the space the field and the button occupied, **so the bar keeps its ground, its padding and its words and nobody types an address that goes nowhere**. Drawn in full on `A26-12` at 1440 and at 390, with a 44 px minimum held. **The sent, error and loading states are unchanged and still apply** — they are Ghost's own script, and only the promise about them was wrong. |
| **Member buttons are conditional, and Ghost's sign-up pop-up needs JavaScript** | **12 Subscribe is the only design in A26 that makes an offer**, and its Member Visibility row now carries both lines: the button **does not render when the connected site cannot support it** — self-signup switched off, or, for the paid upgrade ask, no payment provider connected — **and the editor says which**; and **the Upgrade button opens Ghost's own pop-up, so with JavaScript off nothing happens**. The same notes travel with the inherited bar on 3, 5 and 15. **The old claim that the form worked without JavaScript is deleted with it** (above). Elsewhere in the category the absence is a judgement, not an omission: a tag is navigation, a byline is attribution, a share link is not an offer. |
| **Avatars with no photograph** | **One letter, never two.** "Rosa Menendez" shows R. **Every person in A26 comes from Ghost**, which gives a theme a display name and no separate first and last name, so **two initials were never available**. Changed on the proof and on 1, 2, 3, 4, 5, 10, 11, 13, 14 and 15, including **11 Portrait's plate, which is now the one-letter plate** at the portrait crop, and in the derived line of the shared field list. **The circle, its sizes, its colours and every crop are unchanged.** |
| **A design may offer fewer choices on a shared control, and must say why** | Re-checked on all fifteen. **Background role stays locked on four** — 3 Card, 9 Share Row and 12 Subscribe to Surface, 4 Contrast Band to Contrast — **with the reason shown, and the reasons are now phrased as comparisons rather than as identities**. **Fade stays refused on 4's band.** **6 Slim keeps Blocks at three values** because it has no author block. **Two steppers are capped with the reason visible** (6 Slim at three on the measure, 8 Tag Row at twelve). **The colour swatch row is called Base** — A26 has no swatch row — and **there is no "Inherit" choice anywhere in the category**. No design renamed a shared control or added a value to one. |
| **The remove button never greys out** | **No subject.** **Nothing in A26 is an authored repeating list** — no repeater, no Add, no Remove, no minimum. Four things repeat and all four are Ghost's (tags, authors, the author's handles, the two neighbours); the only list a user orders is the **share-destinations site setting**, where the shared item controls live, and a site setting is not a section panel. |
| **Slider labels** | **No subject.** A26 draws no slider. Every control is a named-value row whose title says what it affects — Avatar, Bio lines, Card inset, Band padding, Row padding, Bar padding, Tile height — or, after this pass, **a stepper whose title says what it counts**: Tags shown and Rows — **Share links and Links are cut by the native-share ruling**. |
| **Gap names are "Tight · Normal · Loose"** | **No subject.** A26 has no Gap row. The five internal ladders are padding inside an object of the design's own and each keeps its own name in the standard padding words: 2 Rows' Row padding, 3 Card's Card inset, 4's Band padding, 9's and 12's Bar padding. |
| **Numbering** | **1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10 · 11 · 12 · 13 · 14 · 15.** Fifteen designs, **no gap created or closed, no number reused, nothing renumbered, nothing deleted.** |

### The no-JavaScript line, per design

| # | Design | Behaviour declared | Without JavaScript |
|---|---|---|---|
| 1 | Author Bio | `share` | **Email alone renders** — a `mailto:` link. The trigger opens Ghost's share panel, which needs JavaScript, and Copy link needs it too, so the fallback's second link is hidden with it. Tags, the author block, the socials row, the Updated line and the destination pair are exactly as drawn. |
| 2 | Rows | `share` | As 1. The rows, their labels and their hairlines are static markup. |
| 3 | Card | `share` `member-form` | As 1 for share. **At Blocks Everything the subscribe form is replaced by the designed notice**, inside the plane, at the inset the card already had. |
| 4 | Contrast Band | `share` | As 1. **The band, its bleed and every derived colour are CSS and are unaffected** — the design's whole argument survives. |
| 5 | Split | `share` `member-form` | As 1 for share; **the notice replaces the form** at Blocks Everything. The two columns are a grid and the collapse is a media query. |
| 6 | Slim | `share` | As 1; at Blocks Tags it declares nothing and `core` is assumed. **The line, the dotted run and both rules are unchanged.** |
| 7 | Next and Prev | none | **Pixel-identical.** Two links with a background image and a gradient; nothing is measured, faded in or lazily swapped. |
| 8 | Tag Row | none | **Pixel-identical**, and **the "+ more" is a link rather than a disclosure**, which is what keeps that true. **The archive line is a server-rendered `<a>` where a destination is set and absent where it is not** — the same in both branches, because the gate is a template condition and not a script. |
| 9 | Share Row | `share` | **It keeps its bar, its label, its ground and its padding, and draws Email alone** ⚑ — drawn as the fourth state on `A26-9`. **This is the category's largest no-JavaScript loss after the native-share ruling**, where before the ruling it was the smallest: a trigger that needs a script cannot degrade into links that no longer exist. |
| 10 | Big Type | `share` | As 1. **The display name, the post count and the size ladder are server-rendered.** |
| 11 | Portrait | `share` | As 1. The portrait is an `<img>` with `width`, `height` and `object-fit: cover` — no layout shift. |
| 12 | Subscribe | `member-form` | **The form is replaced by a designed notice** — one catalog sentence, no field and no button, in the space they occupied, the bar keeping its ground, padding and words. **Ghost's signup endpoint cannot accept a plain form post**, so there is nothing honest to submit. The sent, error and loading states are Ghost's script and still apply when it runs. |
| 13 | Rail | `share` | As 1. **The rail is a grid column and the collapse is a media query** — never scripted, which is the difference from A25·7. |
| 14 | Ledger | `share` | As 1. Everything else is a `<dl>` and two `<time>` elements. **A link inside the Photography caption is Ghost's own markup and works normally.** **Emphasis inside that caption is not promised across versions — Ghost 6 strips `<em>` and `<strong>` — but that is a rendering difference, not a JavaScript one.** |
| 15 | Grid | `share` `member-form` | As 1 for share; **the notice replaces the form** in the spanning row at Blocks Everything. The columns are a grid. |

**No design in A26 declares a width below which its script runs** ⚑ — `share` and `member-form` are width-independent and every collapse in the category is a media query — **so no line above needs to describe both sides of a threshold.** *(A design may declare the width below which its script runs.)*

### Open questions — every item, with who settled it

**Housekeeping, 1 September 2026.** Every item below is struck through with the name of whoever settled it, so a reader can tell a closed question from a live one at a glance. **Nothing in this section is still open.** The items that are still open live in **Findings for the architect** above and are marked there on their own line: **finding 5** (Ghost has no canonical all-tags route) and **the product half of finding 6** (whether an author's post count belongs in a theme at all) both read **OPEN FOR THE OWNER**, and **finding 10 was settled by this pass and is struck**. **Superseded on 3 September 2026:** findings 5 and 6 were both settled by the owner that day and are struck in the findings list, so **no finding in this category now reads OPEN FOR THE OWNER**; finding 4 is narrowed rather than closed.

**1 · ~~Which two designs a free customer gets.~~ Ruled: 1 Author Bio · 6 Slim — settled by the owner, 30 August 2026.** One complete footer —
tags, author, share and the next post on the article's measure — and one 44 px line with no author
block and no picture of any kind. **Neither depends on the customer having photographs.** Recorded as
**`**[Free] designs:** 1 Author Bio · 6 Slim`** at the head of this document and badged under the
roster on `A26-0`; that is the line the merge reads. **Closed.**

**2 · ~~What 11 Portrait draws at three or more authors.~~ Ruled: the primary author alone — settled by the owner, 30 August 2026.** Ghost's own
`{{#primary_author}}` helper outputs the singular, first author and gives the block the same
attributes as a full author — `name`, `bio`, `profile_image`, `url` — so **the design draws its one
portrait, name, bio and archive link with no loop and no arithmetic**, and the split, the portrait size
and the ratio are unchanged. **The co-authors are named in one muted 13 px line under the name** —
"with Daniel Reith and others", no number, on this pass's byline rule. **Closed, with the cost
recorded** ⚑: at three or more authors only one writer gets a photograph and a bio, so a site that
co-writes everything should place 1 Author Bio or 14 Ledger, which credit every author equally. Drawn
as a state on `A26-11`.

**3 · ~~The tag overflow's wording.~~ Ruled: "+ more" — settled by the owner, 30 August 2026.** The smallest change from "+4 more", same shape and
same position, and it makes no promise about a route Ghost does not reliably have — which the two
alternatives ("More tags", "All tags") both did. **Closed**, and already drawn throughout `A26-8`.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, in the
  required shape, and names **1 Author Bio** and **6 Slim** — both of which exist in this category's
  roster. **It is the owner's own choice, ruled 30 August 2026**, and the same line is badged under the
  roster on `A26-0`.

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** fifteen designs, numbered **1–15**.

---

## Patch notes — post footers patch pass two, 1 September 2026

Every change below carries the **name** of the rule or the platform fact that required it. Rules are
named, never numbered. Where a ruling could not be applied without inventing a decision, it is written
here as an **OPEN QUESTION** rather than guessed.

**Frames changed — all sixteen:** `A26-0 Category Proof` and `A26-1` … `A26-15`. Every design frame
gains a dated **post footers patch · pass two** panel at the foot saying what changed in that design
and which rule required it; `A26-0` carries the category's version of the same panel. **Two frames
changed in their drawn content:** `A26-9 Share Row` (the site's order, and no Ghost share popup) and
`A26-14 Ledger` (the caption's version difference). **Nothing else was redrawn.**

### This category's work list

| What changed | Why, and where |
|---|---|
| ~~**The share row uses the site-wide share list, in the order the site set.**~~ **Superseded the same day by the native-share ruling** — there is no share list any more. Kept here so the reversal is legible; the current rule is in Patch notes — the native-share ruling at the end of this document. | *(Superseded: sharing is Ghost's own share panel.)* |
| ~~**We do not use Ghost's own share popup.**~~ **Reversed the same day by the owner: native Ghost Share only, everywhere.** The morning's entry is kept below so the reversal is legible, and the fallback pair answers the Ghost 5 objection it rested on. Original entry: **We do not use Ghost's own share popup, and the reason is carried with the decision.** **On Ghost 5 it does not exist at all — the same link opens the sign-in box instead** — and where it does exist **it is a sealed frame we cannot style, with a fixed order and no Mastodon**. Our share links are **ordinary links**, which is what every no-JavaScript line in this category has always rested on. Added to the floor's share bullet, to 9 Share Row's cut list, data paragraph and Reconciled paragraph, to the no-JavaScript line for 9, and to the pass-two panel on all twelve share designs. **Finding 10 — "one theme, two share experiences" — is settled by this and struck, with the settlement written into the finding**; A25's native-share pass is the frame that needs redrawing, not this one. | *(We do not use Ghost's own share popup.)* |
| **The caption version difference is written into the one design that reads a caption.** 14 Ledger's Photography row: **Ghost 6 removes `<em>` and `<strong>` while keeping links and `<b>`; Ghost 5 keeps everything** — same stored text, two outputs. So **the row never leans on italics for meaning**: the credit and its link survive on both supported versions, the emphasis does not. Written into the design's data and accessibility paragraphs, its no-JavaScript line, the caption's row in the shared field list, and onto `A26-14`. **The HTML-rendered caption and its surviving credit link are unchanged** — this is a warning about emphasis, not a withdrawal. | *(The feature-image caption renders differently on the two Ghost versions.)* |

### The five rules of pass two

| Rule | What it did here |
|---|---|
| **A control switched off by another is greyed, with the reason beside it** | **Eight subjects, all already drawn this way; the wording is now uniform.** Four locked **Background role** rows (3, 9, 12 to Surface, 4 to Contrast), **Fade refused on 4's band**, and four capped steppers that grey the **+** and say why — Links at four, 6 Slim at three, 8 Tag Row at twelve, 14 Ledger's Rows at seven. **Nothing is hidden and nothing accepts a value it will not honour.** **The one never-offered case is 12 Subscribe's member buttons** — self-signup off, or no payment provider for the upgrade ask — **not drawn at all, with the panel saying which**, which is the exception the rule names rather than a greyed control. **No A26 panel carries a visitor dark-mode switch.** |
| **Avatars with no photograph show initials, and the two forms are not interchangeable** | **One letter, everywhere, unchanged — and now stated as the rule requires.** Every person in A26 comes from Ghost, so **two initials were never reachable**; the two-initial form belongs to a list the user types, and **A26 has no such list**, so the forms are never mixed inside one component. Restated on 1, 2, 3, 4, 5, 10, 11, 13, 14, 15 and on 11 Portrait's plate. **No circle, size, colour or crop changed.** |
| **The remove button never greys out** | **No subject, for the second pass running.** Nothing in A26 is an authored repeating list; the only ordered list is the share-destinations **site setting**, and a site setting is not a section panel. No Add, no Remove, no minimum, no floor sentence. |
| **A count that picks between drawn layouts is a named set, not a number picker** | **Re-tested on all five near-count rows and not one changes.** Number pickers: **Links 2–4**, **Tags shown 1–12**, **Rows 3–7** — each value is the same drawn arrangement with more or fewer of one thing. Named sets: **15 Grid's Columns · Two · Three** and **Blocks on eleven panels** — each value is an arrangement that has a frame. **7's Within is a scope.** No row converted in either direction, so the last pass's three steppers stand. |
| **A design may declare the width below which its script runs** | **No subject in A26, and the reason is now written down.** The category spends `share` and `member-form` and **neither is width-dependent**; **every collapse here is a media query** — 5 and 15 at 834, 13 Rail's margin at 1,200, the rest at 767. **So no no-JavaScript line in this category needs to describe both sides of a threshold**, and the note now sits under that table rather than being inferred from its absence. |

### The two Ghost findings

| Finding | What it did here |
|---|---|
| **The feature-image caption renders differently on the two Ghost versions** | Carried into **14 Ledger**, the category's only caption reader — see the work list above. **Added as a second instance to finding 11** (a theme cannot ask Ghost what version it is running), which previously rested on author socials alone. |
| **A comment count renders nothing at all without JavaScript** | **No design in A26 reads a count**, so nothing changed in a drawn frame. What changed is the reason: **the category-wide refusal of a comment count now carries a second one** — Ghost writes the number in with a script and **prepends** it to the theme's word, so unscripted the element is never created at all, and any catalog string would have to be **the bare noun with no number and no placeholder**. Written into the refusals bullet. **The comments widget itself is A28's, not this category's.** |

### Left alone deliberately

- **No printed design total exists anywhere in A26** — not in this document, not on any of the sixteen frames — so there was nothing to remove and **nothing was added**. Where this pass wrote about size, it wrote count-agnostically.
- **P0's per-prop mark allowlist is untouched.** This pass did not open that document, and the sentence about a disallowed mark being **absent** from the toolbar rather than greyed is neither quoted nor paraphrased here.
- **A26·9's "Open Sharing →" link and the drawn site-setting row are left exactly as they were.** They were drawn in the last pass, and this pass adds words beside them rather than moving them.
- **The last pass's sentences are kept where a change would only be a rephrasing.** The one superseded sentence — 9 Share Row's recorded conflict — is replaced by its settlement, because leaving it would leave a settled thing looking open.

### Open questions

**OPEN QUESTION · Who redraws A25, and when.** The ruling settles what A26 does: ordinary links, the
site's list, no Ghost popup. It does not say whether **A25's native-share frames are redrawn in place
now or on that category's next pass** — and this category cannot answer it without deciding another
category's schedule. Finding 10 records the consequence; the scheduling is the owner's.

**OPEN QUESTION · Whether the share-destinations site setting says the popup is not used.** The
decision lives in a **site setting A26 does not own**. A one-line note in that panel would stop a
future builder reaching for Ghost's popup, but **adding words to another surface's panel is a decision
this category cannot make for it.**

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, and
  names **1 Author Bio** and **6 Slim** — both of which exist in this category's roster, where they
  are now badged **[Free]** in the table as well.

---

## Patch notes — the native-share ruling, 1 September 2026

**The owner's ruling:** native Ghost Share only, everywhere; on an older Ghost the share components
grey out and show **Copy link and Email** alone, with no other social sharing; and it applies to
**every share component we have now**. **This supersedes the ruling made earlier the same day** that
Ghost's own share panel would not be used — that one rested on Ghost 5 having no panel, and the
fallback pair answers Ghost 5 directly. **Everything below is that ruling applied; nothing here is a
proposal.**

### What the ruling changed in A26

| What changed | Where, and the rule name |
|---|---|
| **Every share block is one trigger.** A label and a single **Share** control that opens **Ghost's own share panel**, which owns its destinations and their order. **No platform links, no ordered list, no brand glyphs.** Redrawn in every state on all twelve share designs — light, dark, 1440, 834, 390 — plus the tower on 13 Rail and the value in 14 Ledger's Share row. | *(Sharing is Ghost's own share panel, everywhere.)* |
| **The older-Ghost fallback is Copy link and Email, in the row the destinations used to fill.** Nothing else, and no explanatory line on the page. Drawn as a state on `A26-9` beside the trigger, the copied confirmation and the unscripted state; stated in words on the other eleven panels. | *(Sharing is Ghost's own share panel, everywhere.)* |
| **A capability flag the app sets when the site is connected decides which of the two draws** ⚑. A theme cannot ask Ghost its version, so nothing in the theme infers it. **This closes the mechanism half of finding 11** for share; the author-socials version gate can read the same flag. | *(Some fields we drew do not exist.)* |
| **The Share links / Links stepper is cut on all twelve share designs**, one pass after it became a stepper. **Cut, not greyed** — a control with nothing left to do is not a disabled control. **Every share panel loses one row**: the counts now run **four to seven**, and the roster's Ctl column is updated design by design. | *(A count that picks between drawn layouts is a named set, not a number picker.)* |
| **In the editor, the Share destinations row is greyed with the reason beside it** — "Ghost's own share panel owns the destinations and their order" — and stays greyed on an older Ghost, saying which. **Greying is the panel's business only:** a visitor page cannot show a greyed control, which is exactly why the page draws the fallback pair instead of disabling anything. | *(A control switched off by another is greyed, with the reason beside it.)* |
| **The site-wide Share-destinations setting is reduced to two switches, Copy link and Email**, and they are the fallback pair only. **The ten-platform ordered list is gone**, and with it **P0·3's item controls, which now have no subject anywhere in A26**, and **P0·2's brand glyphs for share** (author socials keep them). **A24·14's old admitted cost — "a site that shares to LinkedIn cannot" — is no longer ours to pay or to pay off:** the panel decides. | *(Sharing is Ghost's own share panel, everywhere.)* |
| **Without JavaScript, Email alone renders.** The trigger opens a panel that needs a script, and Copy link needs one too, so the block draws **one `mailto:` link** and nothing else. Rewritten in the per-design no-JavaScript table, in 9 Share Row's own line, and drawn as the fourth state on `A26-9`. **This is a real loss:** before the ruling a share row "lost one link"; now it loses everything but Email. | *(The no-JavaScript line must say what actually renders.)* |
| **9 Share Row keeps its number and its shape and loses its subject.** It is now a `surface` bar carrying a label and one trigger; **Link style · Words · Words and glyph now places the trigger** rather than a list, and Alignment, Bar padding and Edges are untouched. **Nothing was renumbered.** | *(No design ever turns into another design — and numbering is frozen.)* |
| **14 Ledger's Share row no longer prints.** A ledger prints facts and **a trigger is not a fact**, so the row is absent in print like any other empty row. It was the only share row in A26 that survived print. | *(Absent, never a placeholder — and see the open question below.)* |
| **Finding 10 is closed in the opposite direction to the morning's entry.** A25's native-share pass was right about the mechanism; **A24·14, A26 and the site setting are what change.** Both entries are kept, struck and dated, so the reversal is visible rather than tidied away. | *(Findings for the architect.)* |

### Still to carry the ruling — named, not assumed

**A24·14 Post Headers' share row** and **A25·9 Share Rail with A25's share affordance** are in the
ruling's scope and are **not yet redrawn in this project**. Their specs and frames still describe
platform links and an ordered list. **They are named here rather than quietly left:** the next pass on
each carries the trigger, the fallback pair, the capability flag, the cut stepper and the two-switch
setting, exactly as written above.

### Open questions

**OPEN QUESTION · What 14 Ledger's Share row prints.** A trigger cannot print. The row is absent in
print today; the alternative is **printing the post's URL as the row's value**, which is a fact and
fits a colophon. **Not guessed** — the owner should pick.

**OPEN QUESTION · Whether 9 Share Row still earns its number.** Its subject was a bar of destinations;
it is now a bar with one trigger, which is 6 Slim's share half on a `surface` ground. **Numbering is
frozen, so nothing moved**, but the design's argument is thinner than it was and the owner should say
whether it survives the next cut.

**OPEN QUESTION · Whether the fallback pair is drawn on every design or described once.** It is drawn
in four states on `A26-9` and **stated in words on the other eleven panels**. Drawing it twelve times
is more honest and much more frame; describing it once risks a builder guessing the layout.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The [Free] designs line is present** at the head of this document and names **1 Author Bio** and
  **6 Slim**, both of which exist in this category's roster and are badged **[Free]** in it.
- **No printed design total was reintroduced** anywhere in this pass.

---

## Patch notes — design patch pass four, 3 September 2026

Every change below carries the **name** of the rule or the ruling that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written here
as an **OPEN QUESTION** rather than guessed.

**Frames changed — all sixteen:** `A26-0 Category Proof` and `A26-1` … `A26-15`. Every frame gains a
dated **post footers patch · pass four** panel saying what changed in that design and which rule
required it. **One frame changed in its drawn content: `A26-8 Tag Row`** — the archive link's two
states and the panel as it reads while the destination is empty. **`A26-0`'s shared field list has one
row rewritten** (`archiveUrl`). **Nothing else was redrawn, and no control's values changed anywhere.**

### This category's work list

| What changed | Why, and where |
|---|---|
| **The all-tags link is authored, not assumed.** 8 Tag Row's archive row is now **a Text Field for the label plus a Link Picker for the destination** — both already in the control vocabulary, nothing invented — and **the destination has no default**. Ghost publishes a page per tag and nothing above them, so a hard-coded destination would point at a page that may not exist; dropping the link would take it from the owners who have built one. **The row does not render until a destination is set**, so it cannot ship broken, and an owner with no such page leaves it empty. **Both states are drawn on `A26-8`**, with the panel beside them. **The label keeps its default, "Browse the archive"** — a label with no destination is harmless. **In the panel, Archive link is greyed while the destination is empty, with the reason beside it** — "not available until a destination is set" — rather than hidden or left accepting a value it will not honour. Written into the floor's editing bullet, the shared field list, 8 Tag Row's content fields, controls table, data paragraph, no-JavaScript line, Reconciled paragraph and flagged list, and onto `A26-8` and `A26-0`. **Finding 5 is closed by the ruling**, in the owner's own terms rather than either option he was offered. | *(The all-tags link is authored, not assumed.* Also *a control switched off by another is greyed, with the reason beside it.)* |
| **An author's post count may be shown, and a design may turn it off.** 10 Big Type's **Post count · Show · Hide, default Hide** is **unchanged** — the ruling settles that the figure belongs in a theme at all, which is what was asked. At Show it is still **absent rather than zero** on an author's first piece. Written into 10 Big Type's data and Reconciled paragraphs and onto `A26-10`; **the product half of finding 6 is closed** and **nothing drawn changes.** | *(An author's post count may be shown, and a design may turn it off.)* |

### The five answers that already existed

| Answer | What it did here |
|---|---|
| **The pack supplies its contrast colours, and they are COMPUTED** | **On-contrast text, accent-on-contrast, dark elevation, dark hover-surface and tabular figures are all COMPUTED** — the pack works them out — so **no A26 design derives a readable text colour for a coloured band**, and 4 Contrast Band's text and glyph colours are the pack's. **Finding 4 is narrowed, not closed:** the value that category still works around is **a surface on contrast** — the subscribe field's background at 6 % of the band's text — which is not one of the five COMPUTED values. Written into finding 4 and onto all sixteen frames. |
| **Which section is the main feed is stored in the project file** | **No subject in A26.** The category owns no feed, no query, no empty state of a query and no page-number control — the roster's fifteen designs read the post's own tags, authors and neighbours. Recorded as having no subject rather than left blank. |
| **A control's dependency is declared in the control's own definition, with its reason** | **Every greyed row in A26 reads its reason from one source** — the panel, the checker and the compiler alike — rather than each panel drawing the relationship by hand. Subjects unchanged: the four locked **Background role** rows, **Fade refused on 4's band**, **the greyed Share destinations row on all twelve share panels**, **Tags shown's + at twelve**, **14 Ledger's Rows at seven**, **7 Next and Prev's Tile height at two of three Media values**, and **12 Subscribe's member buttons, which are the never-offered case and are not drawn at all**. **One subject is new in this pass: 8 Tag Row's Archive link while its destination is empty**, which takes the category from eight greyed subjects to nine. |
| **Hand-picked posts keep the order the user dragged them** | **No subject in A26.** **Nothing in the category is an authored array** — checked again against all fifteen content models — so there is no dragged order to preserve; the tags, the authors, the handles and the two neighbours are Ghost's, in Ghost's order, and **7 Next and Prev's Within chooses a scope rather than an item**. |
| **A design may declare more than one behaviour module** | **Already true here, and now written down.** **3 Card, 5 Split and 15 Grid each declare `share` and `member-form`**, and **the compiler emits the union** — settled at the inventory merge, so the category was asking a settled question. Added to the floor's behaviour bullet. **No module was added or removed in this pass:** `share` on 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15; `member-form` on 3, 5, 12, 15; 7 and 8 declare none. |

### The five rules restated for this pass

**They are pass two's five, and they were re-tested rather than re-applied.** **A control switched off
by another is greyed, with the reason beside it** — nine subjects now, one of them new, and the
never-offered exception is still 12 Subscribe's member buttons; **no A26 panel carries a visitor
dark-mode switch**. **Avatars with no photograph show initials** — **one letter, everywhere,
unchanged**, because every person in A26 comes from Ghost; **the two-initial form belongs to a list the
user types and A26 has no such list**. **The remove button never greys out** — **no subject for the
third pass running**: nothing in A26 is an authored repeating list. **A count that picks between drawn
layouts is a named set, not a number picker** — re-tested on the four remaining near-count rows and
**not one converts**: **Tags shown 1–12** and **14 Ledger's Rows 3–7** stay number pickers, **15 Grid's
Columns** and **Blocks on eleven panels** stay named sets, and **7's Within is a scope**. **A design may
declare the width below which its script runs** — **still no subject**: `share` and `member-form` are
width-independent and every collapse in the category is a media query, so **no no-JavaScript line here
describes both sides of a threshold**.

### Left alone deliberately

- **No printed design total exists anywhere in A26** — not in this document, not on any of the sixteen
  frames — so there was nothing to remove and **nothing was added**. Where this pass wrote about size,
  it wrote count-agnostically.
- **P0's per-prop mark allowlist is untouched.** This pass did not open that document.
- **The marketing and app screens were not opened either.** They are maintained in the repository, and
  this pass authored no product copy of any kind.
- **The Archive link toggle stays.** With the destination gating the row there are now two ways to
  switch the line off, which is one more than the design needs — but **the work list did not name the
  toggle**, and cutting a control the owner did not ask about is exactly the silent edit this pass is
  told not to make. See the open question below.
- **8 Tag Row's control count stays at five.** The Link Picker is a content field, not a sixth control
  — the same call the last pass made when the field was added.
- **10 Big Type's frame, control values and default are untouched.** The ruling closed a question about
  the figure, not about the drawing.
- **The earlier passes' sentences are kept where a change would only be a rephrasing**, including the
  pass-two paragraph that counted eight greyed subjects: the ninth is recorded here rather than by
  editing history.

### Open questions

**OPEN QUESTION · Whether 8 Tag Row's Archive link toggle survives its own gate.** The destination now
decides whether the line renders, so **Off · On is a second switch for the same thing** — useful for an
owner who wants to keep a destination stored while hiding the line, redundant otherwise. **Not guessed:
the toggle is left exactly as drawn**, greyed while the destination is empty.

**OPEN QUESTION · Who re-points the same field in the other categories.** **A29·11's `allTopicsUrl`
already has no default and does not render without a target**, so it needs nothing. **A20's version
still says the product should decide the route and that its field should then default to it** — that
sentence is now wrong, and **A20's spec is not this category's to edit.** Named rather than quietly
left.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, and
  names **1 Author Bio** and **6 Slim** — both of which exist in this category's roster, where they are
  badged **[Free]**.
- **No printed design total was reintroduced** anywhere in this pass.

---

## Patch notes — design patch pass five, 3 September 2026

Every change below carries the **name** of the rule or the ruling that required it. Rules are named,
never numbered. Where a ruling could not be applied without inventing a decision, it is written here
as an **OPEN QUESTION** rather than guessed.

**Frames changed — all sixteen:** `A26-0 Category Proof` and `A26-1` … `A26-15`. Every frame gains a
dated **pass five** panel saying what changed on it and which rule required it. **Not one frame
changed in its drawn content.** `A26-0`'s rule-10 line, `A26-7`'s editing and Reconciled notes and
`A26-11`'s portrait, panel and Reconciled notes are rewritten to cite P0·9 instead of naming values.
**No control was added or removed anywhere, no default moved, no value changed, and no picture,
measure, type step, colour pack or spacing step was touched.**

### This category's work list

| What changed | Why, and where |
|---|---|
| **Image focus points at P0·9 instead of listing its values.** The control is **defined once, in P0·9, and it carries both axes** — the side-to-side half by the owner's ruling of 3 September 2026, which this category did not have. **Every place this document enumerated the values now cites P0·9 and supplies only the slot**: the floor's image bullet, 7 Next and Prev's controls table and Reconciled paragraph, 11 Portrait's controls table and Reconciled paragraph, finding 7, and the reconciliation note. **The values are not restated anywhere in A26.** **Ghost never sees the choice** — it is a hint the compiler resolves into the crop the theme ships with, which is why it is a control and not a data binding — and this is now said once, in the floor's image bullet, because the category had not said it. **The control declares no behaviour module**, so **no design's no-JavaScript line changed** and **no design's declared behaviour changed**: `share` on 1, 2, 3, 4, 5, 6, 9, 10, 11, 13, 14, 15; `member-form` on 3, 5, 12, 15; 7 and 8 declare none. | *(One control name means one set of values.)* |
| **Where the control is not drawn, the reason is the one written on the panel and nothing was added to it.** A26 draws Image focus **nowhere**, and the two designs that crop a photograph — **7 Next and Prev** (Ghost's `feature_image`, centre crop) and **11 Portrait** (Ghost's `profile_image`, 4:5, centre crop) — **already carried a drawn reason**, which is what P0·0's test asks for. **Both were left exactly as drawn** and both notes now name P0·9. **Whether either should now draw the control is an OPEN QUESTION below**, because P0·9's ground for never offering it is a design that crops nothing, and these crop. | *(A control that could never do anything here is not drawn, and the panel says why.* Also *one control name means one set of values.)* |
| **No constraint was invented, and none was removed.** P0·9 allows a category to narrow an axis with the reason at the control, the switched-off values greying in P0·0's treatment. **A26 narrows nothing**, because it draws the control nowhere; **no axis was narrowed, renamed, extended, turned into a percentage or turned into a draggable focal point.** Recorded so the silence is not read as an omission. | *(One control name means one set of values.)* |

### The rest of the output list, checked rather than assumed

| Asked for | State after this pass |
|---|---|
| **The roster, with [Free] marked** | **Unchanged.** Fifteen designs, 1 to 15, and **[Free] designs: 1 Author Bio · 6 Slim** at the head of this document and badged on `A26-0`'s roster. Nothing was added, renamed or reordered. |
| **The control lists** | **No list changed.** The counts still run four to seven — four on 6 and 9; five on 2, 8, 13 and 14; six on 7, 11, 12 and 15; seven on 1, 3, 4, 5 and 10. Image focus was never a row in any of them and is not one now. |
| **The data fields** | **Unchanged.** Image focus reads and writes no Ghost field: it is a compiler hint, which P0·9 says in those words and the floor's image bullet now repeats once. |
| **The no-JavaScript line per design** | **Unchanged on all fifteen.** The control declares no module, so there is nothing to run and nothing to fail with JavaScript off. |
| **The behaviour each design declares** | **Unchanged on all fifteen**, listed in the work list above. `share` and `member-form` remain the category's two, and **no ARCHITECT: registry addition** appears anywhere. |
| **The component inventory** | **No row added.** The inventory lists what this category established or reused, and **A26 uses Image focus nowhere**; a row for a control the category never draws would say something untrue. P0's own inventory carries it. Recorded rather than left silent. |

### Left alone deliberately

- **The absence of Image focus on 7 and 11.** The work list asked for a naming change. Adding a control
  to two designs is not one, and the reason each panel gives is drawn, dated and the owner's to revise.
  See the open questions.
- **The avatars.** Every avatar in A26 is Ghost's `profile_image` cropped to a circle at 24, 40 or
  56 px, on 1, 2, 3, 4, 5, 10, 11, 13, 14 and 15 — **a crop, and no focus is drawn on any of them.**
  Left as found; the question is below rather than answered by adding ten controls.
- **Finding 7's text is extended, not rewritten.** The platform fact it records is still true; what pass
  five adds is that the fact no longer explains the absence on its own.
- **No printed design total exists anywhere in A26** — not in this document, not on any of the sixteen
  frames — so there was nothing to remove and **nothing was added**. Where this pass wrote about the
  scale of the problem it wrote count-agnostically: "two dozen category specs" counts specs that
  duplicated a control, not designs in the library.
- **P0's per-prop mark allowlist is untouched**, a sixth time. This pass did not open that document to
  edit it, and the allowlist is not in this project's copy.
- **The marketing and app screens were not opened.** They are maintained in the repository and this pass
  authored no product copy of any kind.
- **P0·9 itself was not edited.** It is another category's specification; this one cites it.

### Open questions

**OPEN QUESTION · OPEN FOR THE OWNER · Should 7 Next and Prev and 11 Portrait now draw P0·9's Image
focus?** **What I would have needed to know:** whether Image focus is offered on a photograph the
design crops but does not own. **Why it is open:** P0·9 says the control belongs wherever a design
crops a photograph into a frame of its own shape, and both of these do — a 16:9 or 200/260/320 px tile
and a 4:5 portrait. The reason both panels give for the absence is that the picture is Ghost's rather
than an authored field, and that Ghost stores no focal point — but P0·9 also says **the choice is a
hint the compiler resolves and Ghost never sees**, so what Ghost stores has no bearing on it. P0·9's
own ground for never offering the control is a design that **crops nothing**, which is not this case;
if A26 is a third member of that category, P0·9 directs it to the owner rather than drawing it. **What
I did instead:** applied the naming change, and **left both absences and both drawn reasons exactly as
found** — nothing added, nothing removed. **One part of the same question, if the answer is yes:** 7
draws two tiles from Ghost's two neighbour helpers, and P0·9 draws **one control per image slot**, so
it is not clear whether one row would govern both tiles or whether the design has one slot or two.

**OPEN QUESTION · OPEN FOR THE OWNER · Is an avatar's circular crop a subject for Image focus?** **What
I would have needed to know:** whether a 24, 40 or 56 px circle counts as "a photograph cropped into a
frame of its own shape", or whether there is a size below which focus is not worth a control. **Why it
is open:** ten A26 designs crop Ghost's `profile_image` to a circle, so on the letter of P0·9 each
would draw a focus control; at 24 px the choice is close to invisible, and ten new rows across the
category is not a naming change. **What I did instead:** left every avatar as found, with no focus
control anywhere, and recorded the question. **It is not this category's alone** — A1 owns the avatar
and its one-letter fallback, and every category that reuses it inherits the same question.

### Confirmations

- **The design numbering is unchanged:** **1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** —
  fifteen designs, no gap created or closed, no number reused, nothing renumbered, nothing deleted.
- **The `**[Free] designs:**` line is present**, on its own line at the head of this document, and
  names **1 Author Bio** and **6 Slim** — both of which exist in this category's roster, where they are
  badged **[Free]**.
- **No printed design total was reintroduced** anywhere in this pass.
