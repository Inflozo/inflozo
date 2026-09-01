# A2 · Announcement Bars — written specification

Pack drawn: **Paper**. **All 14 designs complete.** Numbered **1–12, 14, 15** — design 13 is cut and its number retired. Category artefacts — the four settlements, stack checks, tokenisation proof, stress frame, shared field list, roster — are in **A2-0 Category Proof.dc.html**.

Frames: `A2-1 Rule` · `A2-2 Split` · `A2-3 Badge` · `A2-4 Two-Line` · `A2-5 Capture` · `A2-6 Countdown` · `A2-7 Dateline` · `A2-8 Ticker` · `A2-9 Rotator` · `A2-10 Pill` · `A2-11 Toast` · `A2-12 Takeover` · `A2-14 Edge` · `A2-15 Triple` (all `.dc.html`).

**Frame set per design:** desktop 1440 light (primary, drawn above A1·1 Rail) · a states frame at 1440 showing hover, focus-visible and pressed · the design's behaviour states · tablet 834 · mobile 390 twice — once with the short fields authored, once without · dark desktop 1440 · an annotated accessibility frame · the control panel · the spec card.

**Specification-only pass, this session.** Every design now carries four added fields — descriptor, structural descriptor, archetype, behaviour module — at the head of its section, above its content fields. Nothing drawn changed, no frame moved, and no earlier field was rewritten: responsive rules, content fields, controls, data binding, empty states, behaviour and accessibility notes all stand as written. **No module rename was needed.** This document had named no modules at all — it wrote behaviour as motion and state rather than as JavaScript — so nothing here had to be corrected against the fixed 31-module registry (FR-G7). Every module name below is the registry's, and every no-JS sentence is quoted from it rather than composed here.

**A2 uses seven modules.** `dismiss` on all fourteen — every design carries a close — plus `member-form` (5 Capture), `countdown` (6), `marquee` (8 Ticker), `rotator` (9 Rotator, and 15 Triple below 768 — the owner’s ruling, patch pass two), `slide-in-card` (11 Toast) and `accordion` (14 Edge). The findings are listed at the end.

**`core` is assumed, not declared per design.** Every no-JS branch in A2 — the inert close, the static strip, the resting rotator — is CSS keyed off `.js-enabled`, which is `core`'s job: “Never runs; the `.js-enabled` class is never set, so all JS-conditional CSS stays in its no-JS branch.” Stated once here rather than fourteen times. *Flagged: not listing it per design is mine.*

**Placement: Sticky declares no module.** `position: sticky` is CSS and needs nothing. The measured combined offset the category rule describes — bar height plus header height, recomputed on dismissal and used as every anchor's `scroll-margin-top` — is measurement the header's `header-scroll` already does; A2 contributes its height to it rather than running a script of its own, and with JavaScript off “Header renders in its resting state — `position: sticky` still works, only the shrink/solidify transition is absent,” with the bar pinned above it. *Flagged: reading that offset as `header-scroll`'s rather than A2's is this pass's inference.*

**Second specification-only pass: the item controls.** The category's one repeater — the shared 2–6 `messages[]` list that A2·8 Ticker, A2·9 Rotator and A2·15 Triple read — now has its controls written: a shared section in the category rules below, and an **Items** field on every design, stating for the three list designs how items are added, removed, reordered and counted, and stating plainly for the other twelve that they draw one notice and carry no repeater. Nothing drawn changed here either, and no earlier field was rewritten. The pass produced one finding, listed fourth at the end.

**Third pass — the controls-reconciliation patch (this document’s current state).** The category was audited against the PRD’s control vocabulary and Ghost’s verified data surface, reusing the P0 editor primitives **by name** — the inline text toolbar and its link popover, the icon slot + Icon Picker, the item-list controls, the member-aware action editor, the “Populate from…” data panel, the editor state switcher — never redesigning them. What changed: the universal trio (Background role · Vertical spacing · Top divider) now sits outside every panel and absorbs the old Ground and Height rows; the Visibility group gains Schedule and Shows on and loses the Preview as switcher; the shared messages[] list gains a posts source; Dateline, Ticker, Rotator, Takeover, Capture, Countdown and Toast take per-design items; and 13 Consent is renamed **Notice**, its Accept/Decline pair removed by owner ruling. Every collision with an earlier ruling is recorded in the closing **Reconciliation notes**, which open with the list of frames changed.

**Fourth pass — the member-ask pass (this document’s current state).** One instruction: apply the rule that member buttons are conditional, and the rule that a subscribe form needs a designed no-JavaScript notice, to **every** subscribe, sign-up and sign-in affordance in the category — and make each bar that offers a member action state which site settings make it render. Nothing drawn was restyled: the fifteen control panels each gain a **Member ask** block, the fifteen spec cards each gain a one-line version of it, and every design section below gains a **Member ask** field. The previous pass had already drawn both rules once, category-wide, in **A2-0**; that drawing stands and was not redone. Three things this pass found and one it refused to guess are in the closing **Patch notes — member-ask pass**.

**Edit-safe** means the module does not run while the section is being edited and writes nothing to authored DOM. All seven are edit-safe, which is why every frame in A2 is a resting state. `dismiss` carries the one consequence worth naming: it writes a per-browser dismissal record, not DOM, and **in the editor the bar always renders whatever that record says** — an author who dismissed their own bar must still be able to see it. *Flagged: mine.*

---

## 0 · Category-wide rules

These apply to all 14 designs and are not repeated per design.

**What the design patch pass changed category-wide.**

- **No design turns into another design (Part A·A8).** Every hand-off in A2 is withdrawn: **Badge** hides its badge at Label style None, **Dateline** hides its eyebrow and date, **Ticker** and **Rotator** draw a single message static at one item, **Triple** draws one slot below 768 and cycles its notices through it, and gives one item the whole band. No sidebar offers a switch to another design.
- **Remove never greys (Part A·A2).** Active at the floor in all three list designs, answered with **"A bar needs at least one message."**
- **Counts are number pickers (Part A·A5).** Messages 1–6 in Ticker, Rotator and Triple; **Slots becomes a picker capped at 3** with the reason stated. No fixed count buttons remain.
- **Universals (Part A·A6).** The trio may narrow with a stated reason — A2·5's Contrast is disabled with its reason, A2·15's Vertical spacing is locked to the slot height — and may never be renamed or extended. The swatch row is **Base**. **No "Inherit" value exists in A2.**
- **Scale labels (Part A·A3) and gap names (Part A·A4).** Vertical spacing keeps Compact · Comfortable · Spacious; A2 draws no gap control, so Tight · Normal · Loose has nothing to rename here.
- **Member asks are conditional (Part A·A9).** Every subscribe, sign-up and sign-in affordance carries the P0·4 card's two notes: **it does not render when the connected site has self-signup off, or no payment provider for a paid ask** — the band closes up, with no reserved gap — and **it opens Ghost's Portal, so with JavaScript off nothing happens.** **The notes attach to the affordance, not to the design**, and every design that has one now carries them in its own panel, its spec card and its Member ask field below. Nine designs offer an action of their own — 1, 2, 3, 4, 5, 6, 10, 11, 12 — and five more can carry the ask through a link: the per-item message links on 8 Ticker, 9 Rotator and 15 Triple, 7 Dateline's Meta: Link, and the link inside 14 Edge's open bar. **Fourteen designs, then — every design in the category**, each stating the settings that make the ask render: **members on and signup open** for a free ask, **plus a payment provider connected and a live paid tier** for a paid one, and members on alone for a sign-in link. *The one design that had no ask, 13 Notice, was cut this pass, so no A2 design is now without one.* *The earlier count of nine was the designs with an action of their own; it did not reach the item links.* **Ruled by the owner this pass: the notes appear on every link that can carry an ask, item links included** — so an author who puts a sign-up link into notice two of a ticker is told there, where it would otherwise be missed. The correction is recorded in this pass's Patch notes.
- **The no-JavaScript form notice (Part A·A10).** **A2·5 Capture is the only design with a field**, so it is the only one that draws the notice: P0·4's **slim variant** replaces the form at the band's own height, keeping the close. **Focus, invalid, submitting and success are unchanged** — they are Ghost's own script — only the claim that the form works without script was withdrawn. Reached from the P0·6 switcher's **No JavaScript** entry.
- **Avatars (Part A·A1).** A2 renders no person, so neither initial rule applies here.
- **Ctrl-K (Part B·B5).** Unbound; nothing in A2 bound it.
- **[Free], two per category (Part A·A7): 1 Rule and 2 Split** — **ruled by the owner this pass**, no longer a suggestion: between them a free site can post a notice or make an offer, which covers almost every reason to put a bar on a page. The line the merge reads is this one:

**[Free] designs:** 1 Rule · 2 Split

**The universal trio (this pass).** Every placeable section carries **Background role**, **Vertical spacing** (Compact · Comfortable · Spacious) and **Top divider** (None · Line · Fade) outside its own control list. In A2, every per-design **Ground** row was the universal Background role under a local name and merges into it, keeping each design’s value set and its disable-with-ratio rules; A2·14 Edge locks it — the accent rule is the design’s identity — and its Open ground control is a different thing and stays. Every per-design **Height** row used the universal value names and is ruled to *be* Vertical spacing: merged, each design’s px ladder kept as the values’ meanings (Rule 36·44·56 · Split 48·56·68 · Badge 40·48·60 · Two-Line 72·88·104 · Capture 56·64·76 · Dateline 40·48·60 · Ticker 36·44·56 · Rotator 44·52·64 · Takeover 160·200·240 with the Compact ceiling intact). The five fixed-height designs lock the universal row with the reason shown — Countdown (Clock style decides), Pill (48 px; Air is the presence control), Toast (content decides; Width is the control), Edge (Rule weight collapsed; 44 px plus the rule open), Triple (slot height). **Top divider locks None on all fourteen**: thirteen designs are the first element on the page — nothing sits above them — and one is a bottom-anchored float. The seam *below* a bar stays governed by the grounds-and-hairlines rule; A2·2’s bottom-edge control is renamed **Divider under** rather than removed — different edges, both real.

**Editing on canvas (this pass).** Every visible text is inline-editable with the P0·1 toolbar: `message` (bold + one link; the link popover carries open-in-new-tab and rel nofollow · noreferrer · sponsored), `label`, `headline`, `body`, and buttons edit label and link in place (`ctaLabel`/`ctaUrl`, `linkLabel`/`linkUrl`). Every URL field opens the Ghost-aware Link Picker. **Ghost-owned text is never inline-editable**: bound post titles (Ticker · Rotator · Triple · Takeover · Dateline’s Meta) and `published_at` render the plain-text lock pill — “Edit in Ghost”. **No fixed English visitor-facing string ships.** Per string: `emailPlaceholder`, `submitLabel`, `successMessage`, `expiredMessage`, `expiredCtaLabel`, `chipLabel` and every message and label are editable fields with defaults, as specified per design; Capture’s error line, Countdown’s inside-24-hours sentence pattern (“ends tonight at 23:59 (UK)”), Ticker’s “Pause announcements” / “Play announcements”, Rotator’s “Show announcement 2 of 3”, every close’s “Dismiss announcement” and Edge’s “Show announcement” are **theme translation-catalog strings** — locale-editable, never per-site free text, because they are mechanical or must match API behaviour.

**Posts as a source for the shared list (this pass).** `messages[]` gains **Source: Authored · From posts**, with the P0·5 panel beneath (Latest · Featured · By tag · By author · Hand-picked · Count, capped at the 6-message cap · Order). Bound, each item renders the post’s title linking to the post; Add, Remove and drag hide and the rows read “From Ghost”. **The binding lives on the shared list — never per design — so switching between Ticker, Rotator and Triple cannot fork content.** Zero bound posts → the section does not render, the same zero-items floor. A2·12 Takeover gets the single-post version: **Content source: Authored · From a post**.

**Button icons (this pass).** Every A2 button accepts an optional icon before or after the label from the Icon Picker (P0·2) — always Small, inheriting the label colour, so the accent budget is untouched.

**Height rows are gone** — merged into the universal Vertical spacing (see the trio above). The old paragraph's per-design reasons survive as the five lock reasons.

**Placement is not universal either.** Ten of the thirteen top designs offer In flow · Sticky: Rule, Split, Badge, Two-Line, Capture, Countdown, Dateline, Ticker, Pill, Edge. A2·9 Rotator is In flow only — a bar that changes its text every six seconds should not follow the reader down the page — A2·12 Takeover is In flow only too — 200 px must not follow the reader — and A2·15 Triple is In flow only as well, and A2·11 Toast is bottom-anchored, floating. Two designs carry Sticky with a *not recommended* note: A2·4 Two-Line (144 px pinned) and A2·8 Ticker (moving text that follows the reader).

**Placement.** First element in the body after the skip link, above `<header>`, on every template. **One A2 per site** — the category is site-wide furniture, not a message queue; simultaneous messages are what Ticker and Rotator are for. The one bottom-anchored design (A2·11 Toast) is not in the top stack and may coexist with one top bar.

**Grounds and hairlines.** A bar whose ground differs from the header's draws no bottom hairline — two grounds meeting is separation enough. When the grounds match, the bar owns the hairline and the header keeps its own. When sticky, the bar drops its hairline and the header's md shadow carries both bands.

**Height and reflow.** Every top bar is in flow: it pushes the page and the header down and scrolls away with them. **Placement: In flow · Sticky** is a control on ten of the thirteen top designs — Rotator, Takeover and Triple are In flow only; Sticky pins the bar above a sticky header and the two heights sum into one offset, which every in-page anchor uses as its `scroll-margin-top`. Height is measured, never assumed — no design hard-codes 44 px. Height is reserved on first paint and the dismissal state is read before paint, so a dismissed bar never flashes. The bar never changes height on scroll; only the header shrinks.

**The Compact ceiling.** When the header below has more than one row (A1·3 Stacked Masthead, A1·8 Utility + Nav), the bar's Height control defaults to Compact and Spacious is disabled, with the reason shown. 138 px of furniture above a headline is the ceiling. *Flagged: mine, and it is the one place in the library where a section's control set depends on its neighbour.*

**Above A1·4 Overlay.** The bar is opaque and in flow, so the hero starts below it and the transparent header still overlays image, never band. The bar is never given a transparent or scrim treatment. When the bar is sticky above Overlay, the header's *solidify* threshold is measured from the bottom of the bar.

**Dismissal.** Close sits at the right end: a 32 px box in a 44 px hit area at desktop, a full 44 px target at ≤ 767, moving to the block's top-right whenever the bar is more than one line. Dismissal collapses the height to zero over 160 ms; the sticky offset and every anchor's scroll-margin recompute in the same frame, and if the reader has scrolled, the scroll position is reduced by the bar's height so the words under the pointer do not move. Under reduced-motion the bar is removed instantly, with the same scroll correction. Focus moves to the header's first focusable item, never to nothing.

**Dismiss memory.** `dismissMemory`: This session · **30 days (default)** · Never comes back · Always shows. Stored per browser against a hash of the bar's content, so editing the message brings the bar back immediately.

**Audience.** `audience`: Everyone · Logged out · Free members · Paid members. Member state comes from the same Ghost source as A1·14's member block; with members disabled in Ghost the control collapses to Everyone and says why. Audience previewing is the editor’s global **View as** — the Preview as switcher is removed from every panel this pass. A section hidden for the previewed audience ghosts to 40% with a “Hidden for this audience” pill (P0·4), never dimmed content pretending to be disabled.

**The Visibility group.** `audience`, `dismissible`, `dismissMemory`, **Schedule** and **Shows on** live in a shared **Visibility** group below each design's own controls; with the universal trio they sit outside the per-design list and outside the ceiling. **Schedule:** Always · From date · Until date · Between dates (Date Picker) — a “sale ends Friday” bar must stop showing itself. Stated honestly, owner-accepted: dates are server-evaluated, so under page caching an expired bar may show until the cache turns; the panel says so. **Shows on:** All pages · Home only · Posts · Pages, mirroring A3's Site-wide group — before this pass every A2 rendered on every template. **The control budget:** the old 4–7 norm is lifted where this pass adds controls; the ceiling is the PRD's ~15 visible controls per design plus the universal trio, the Visibility group and the Data group. Quick Controls stay the 3–5 highest-impact.

**Accent on contrast.** On a contrast or accent ground the inline link is the carried text colour with a 50%-opacity underline, never accent, and a button inverts to the pack's lightest surface with contrast-coloured text. The rule is set by the worst pack: Paper's accent on near-ink measures 4.85:1 (AA at 14 px, only just) and Ink's dark accent on its pale contrast measures 2.9:1 (fail). Accent links are permitted on background and surface grounds only; the Link style control shows the disabled value with its measured ratio.

**Accent budget.** Once per bar. The permitted uses are: the button's fill, Badge's label pill, and Edge's 4 px rule. Rule spends none — the band is the emphasis.

**Type floors.** Message 14 px, never below, at every width. Label 12 px / 600 in a pill, 13 px / 600 as an eyebrow. Meta 13 px. Tap targets 44 px.

**Motion.** 160 ms ease-out, one transition per state change. Dismissal, hover, focus and the arrow's 2 px travel are the only motion in the text bars; Ticker and Rotator add their own, as does Triple below 768, all suppressed under `prefers-reduced-motion`. Nothing animates while the section is being edited.

**Content parity.** Every frame of a design draws the same authored content. Only what a stated rule names may differ by width — a dropped link label, a wrapped message, a stacked button. The two mobile frames are the exception the rules name: one with `messageShort` / `ctaLabelShort` authored, one without.

**Accessibility floor.** The bar is `<aside aria-label="Announcement">` before `<header>`. The skip link stays first in focus order at every width. No heading inside the bar — it is a sentence, not a section. Close is `<button aria-label="Dismiss announcement">`. Not a live region: the bar is present at page load, so it is read in document order rather than interrupting. Link and button labels must stand alone out of context.

**Empty-data floor.** Empty `message` → the bar does not render at all; a bar with no sentence is nothing, not an empty state. Missing `ctaUrl` → the button renders as plain text and the editor flags it rather than shipping a dead button. Fields a design does not display are kept, not cleared, and reappear on switching to a design that shows them.

**The item list.** One repeater runs through the category: **`messages[]`, the 2–6 list A2·8 Ticker, A2·9 Rotator and A2·15 Triple all read** — the same list, so switching between the three keeps everything. The union item shape is `message` (req, ≤ 120) · `messageShort` (opt, ≤ 48) · `label` (opt, ≤ 14, added to the item shape by Triple) · `linkLabel` (opt, ≤ 24) + `linkUrl`. Each design draws what it draws and keeps the rest: Ticker draws neither `messageShort` nor `label`, Rotator does not draw `label`. **The other eleven designs draw one notice from `message` and carry no repeater at all**, and their Items field says so rather than leaving it to be inferred.

**Where the item controls sit.** The repeater is the **Messages** row at the head of each of the three panels — above the design's own controls and above the shared Visibility group — one row per notice with a drag handle, a remove action, and **Add message** at the foot of the list. Selecting a notice on the canvas selects its row and opens that notice's fields, which is possible in all three because nothing moves while the section is edited. Keyboard: ⌥↑ / ⌥↓ moves the focused row.

**What Add produces — never a blank row.** A new notice arrives carrying a sentence — "Something new to tell readers." — with **its link pair empty**, and lands **last**: the end of the loop, the last dot, the slot after the last filled one. On Triple it also arrives with the label "New". The link pair is left empty deliberately: a label with no URL is the dead button the empty-data floor already refuses, and a placeholder URL is worse than none.

**Remove, and the floor.** Remove sits on the row, is undoable, and **stays visible and fully active at the floor** (Part A·A2) — never dimmed, never hidden. At one item each design **hides what does not apply and stays itself** (Part A·A8): **Ticker** draws the single message static, with no loop and no pause control; **Rotator** draws it with no dots; **Triple** gives it the whole band, with no dividers. Removing the last item is answered with the floor in this category's words: **"A bar needs at least one message."** No design names another design as a state, and no switch is offered anywhere.

**The cap is six**, shared. Add is disabled at six on Ticker and Rotator with the reason shown. **On Triple Add stays enabled past the slot count** and the sidebar counts what is not drawn, because the list is shared and an item invisible in three slots is visible on the other two designs.

**Reorder.** Authored order is drawn order in all three, and it is consequential in each for a different reason: Ticker's is loop and static-row order, Rotator's decides item 1 — the only notice a no-JS or reduced-motion reader gets — and Triple's decides which items are shown at all and which slot carries the accent label. Each design states its own case below; none of the three has an order that is merely decorative.

**Zero items** is the category's empty-data floor in item terms: **the section does not render**. No empty strip, no edge fades over nothing, no dots above an empty band, no empty slots, no placeholder sentence, and no pause control for a strip with nothing on it.

**Two rules about item controls, and they are architectural rather than stylistic.** (1) **A design control writes one value onto the section and the stylesheet reads it, so it applies to every notice at once.** "Run notice 3 slower", "hold message 2 longer" and "make slot 2 wider" are not expressible by construction; where one notice needs to be louder than its neighbours, it is the only notice, and that design is A2·1 or A2·3. (2) **Inside a notice the user edits content only** — its sentence, its short form, its label, its link — never layout, spacing, alignment or emphasis. Triple's **Labels: First in accent** is the shape this takes when a position needs emphasis: the accent belongs to the slot, so moving an item into slot one moves the accent onto it, and no item carries it.

**Switching between the three and the twelve.** `message` and `messages[]` are separate fields, so switching from Ticker, Rotator or Triple to a single-notice design draws `message` where it is authored and item 1's sentence where it is not. An authored `message` is never overwritten and **a switch never deletes an item**. *Flagged: mine.*

**Shared field list.** In A2-0. The union of all fourteen designs' needs; any design may use fewer, none may need a field that is not on it.

---

## 1 · Rule

One line on the contrast band, optically centred, close at the right end. The baseline: the least a bar can be and still be a bar. Spends no accent.

**Descriptor.** The category's floor — one line on a contrast band with nothing added to it, spending no accent — the category's least-furnished arrangement, which is what makes it the baseline.

**Structural descriptor.** `bar · none · contrast · one · none · full-width contrast band`

**Archetype.** bar

**Behaviour module.** `dismiss`, and nothing else — the close is the only script in the design. Edit-safe: it does not run while the section is edited and writes a browser record rather than DOM. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” The sentence, the inline link, the band, the alignment and the Height value are all server-rendered, so the bar is complete; what a reader without JavaScript loses is the ability to put it away, and the 30-day memory never starts. Dismissible: Off is the same bar with no button either way, and Placement: Sticky adds nothing — CSS pins it.

**Items.** None — one notice, no repeater. Rule is the plainest arrangement of a single notice rather than a design with items of its own: at one item Ticker and Rotator stay themselves and draw that notice static (Part A·A8) — neither hands off to this design — and `messages[]` is kept whole underneath a bar that draws `message`. Nothing here repeats, so the every-item-at-once rule has nothing to apply to.

**Content fields.** `message` (rich text, req, ≤ 120 chars, bold + one inline link) · `messageShort` (text, opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · `dismissible` · `audience` · `dismissMemory`.

**Controls.**

| Control | Values |
|---|---|
| Background role (universal) | Contrast · Surface · Accent |
| Vertical spacing (universal) | Compact 36 · Comfortable 44 · Spacious 56 |
| Alignment | Centred · Left |
| Link style | Inline link · Underlined text · None |
| Placement | In flow · Sticky |
| Dismissible | On · Off |

**Data.** Nothing from Ghost except member state, for audience. Members disabled → audience collapses to Everyone with the reason shown.

**Member ask (Part A·A9).** The inline link in the sentence is this design's only affordance, and pointed at sign-up, subscribe or a paid tier it is a member ask. It does not render when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the sentence then holds the band alone at the same Vertical spacing value, with nothing reserved where the link was. It opens Ghost's Portal, so **with JavaScript off nothing happens**: pressing it does nothing at all, and nothing in this bar is subscribable without script. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on and nothing more.

**Responsive.** 1440–768 identical but for padding (64 → 56) and the close inset (20 → 14); one line, centred, height held at the Height control's value. ≤ 767 the band grows 44 → 48 so the close can be a 44 px target without overhanging; `messageShort` is used if set, otherwise the sentence wraps, the band left-aligns and grows to fit, two lines maximum — a third is clipped with an ellipsis and the editor says so. The link stays inline with the text at every width.

**Behaviour.** *Sticky*: bar pins above the header, combined offset (44 + 56 = 100 at Comfortable with A1·1 shrunk), bar height unchanged. *Dismissed*: as the category rule.

**Empty state.** No link → the sentence sits alone, still centred. No message → no bar.

**Accessibility.** Category floor. Carried text on contrast is 13.9:1 in Paper light, 12.6:1 in Paper dark. The 50%-opacity underline is decoration; the link is also distinguished by weight.

**Flagged as mine.** The 30-day default, the two-line mobile cap, the 48 px mobile band, and the scroll-compensation rule.

---

## 2 · Split

Message at the left margin, one button at the right, hairline under. On `surface` by default — a raised strip above the header rather than a band across it. The button is the bar's single accent.

**Descriptor.** The only single-row bar whose action is a filled button at the right margin, and the only one that breaks its row on a content threshold rather than at a width.

**Structural descriptor.** `bar · none · surface · one · none · single right-hand button`

**Archetype.** bar

**Behaviour module.** `dismiss` only. The button is an `<a>`, the hairline and shadow are CSS, and **the 24 px gap threshold is a layout rule, not a measurement** — it compiles as a wrap with a minimum on the button (or a container query), because measuring the gap in script would need a module A2 does not have. *Flagged: mine, and it is the one place in this design where the written rule and the module registry had to be reconciled.* **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” Message, button and both grounds render; the row still breaks where it breaks.

**Items.** None — one sentence, one button. `messages[]` is kept and not drawn; two notices in one band is A2·15 Triple's job and several in sequence is Ticker's or Rotator's.

**Content fields.** Shared list. Uses `message` (a trailing clause may be marked muted), `messageShort` (≤ 40 here), `ctaLabel` + `ctaUrl` (≤ 18), `ctaLabelShort` (≤ 12). Does not display `label`, `linkLabel`, `headline`, `body` — all kept.

**Controls.**

| Control | Values |
|---|---|
| Background role (universal) | Surface · Contrast · Background |
| Vertical spacing (universal) | Compact 48 · Comfortable 56 · Spacious 68 |
| Action | Button · Text link · None |
| Width | Match header · Full bleed |
| Divider under | Hairline · Shadow · None |
| Placement | In flow · Sticky |

**Data.** Member state only. No `ctaUrl` → the label renders as plain text and the editor flags the missing link.

**Member ask (Part A·A9).** Action: Button and Action: Text link are both member asks when their URL points at sign-up, subscribe or a paid tier. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the sentence then spans the row at the same Vertical spacing value, with no gap held at the right margin and no 24 px row-break threshold to reach. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only. The bar does not become another design in either case (Part A·A8).

**Responsive.** 1440–768 one row: message left on the header's own margin, button right on the header's right margin, both hold. Padding 72 → 40, button padding 9 × 17 → 8 × 15. The row breaks to two when the gap between sentence and button would fall below 24 px — a content threshold, not a width one. At 390 with a full-length message that always happens: the message wraps, the button drops to its own row and hugs the left edge (a full-width accent bar directly above a header holding another accent button reads as two competing primaries), the close moves to the top-right aligned to the first text line, bar ≈ 104 px. With `messageShort` and `ctaLabelShort` both set, 390 holds one row at 58 px.

**Behaviour.** *Sticky*: 56 + 56 = 112 px of pinned furniture with two accent buttons on one edge — the editor recommends Ground: Contrast, under the Ground control. Recommends, not enforces. On a contrast ground the button inverts to the pack's lightest surface and the bar spends no accent.

**Empty state.** Action: None → the sentence spans and the bar keeps its height. No message → no bar.

**Accessibility.** Category floor. The muted trailing clause is part of the same paragraph, not a separate element — quieter, not less important. Focus order: message link if any, then button, then close. Accent fill with a white label is 3.6:1 at 14 px / 600 — under AA — so the pack's darkened accent is what renders on fills, and the sidebar disables any Ground whose button pairing drops below 4.5:1, showing the ratio.

**Flagged as mine.** The 24 px gap threshold, the 40-character preview-pair trigger, the left-aligned rather than full-width mobile button, and the Ground recommendation under Sticky.

---

## 3 · Badge

A short label, then the sentence, then a text link — left-aligned on the page's own ground, separated from the header by one hairline. The bar with no band.

**Descriptor.** The only design with a label before the sentence and no band of its own — a bar drawn with a single hairline on the page's own ground.

**Structural descriptor.** `bar · none · page · one · none · label pill before sentence`

**Archetype.** bar

**Behaviour module.** `dismiss` only. The whole-bar tap target at ≤ 767 is an `<a>` wrapping the row, not a click handler, and the arrow's 2 px travel is a CSS transition. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” Label, sentence, link and the mobile whole-bar link all work, so nothing about the design's purpose depends on script; the close is hidden and the bar stays.

**Items.** None — one label, one sentence, one link. `messages[]` is kept and not drawn; Triple at one item stays Triple and gives that notice the whole band (Part A·A8), so no items reach this design.

**Content fields.** Shared list. Uses `label` (≤ 14 chars, never truncates; longer values are rejected in the editor with the count shown), `message`, `messageShort` (≤ 44), `linkLabel` + `linkUrl` (≤ 24).

**Controls.**

| Control | Values |
|---|---|
| Label style | Accent pill · Outlined pill · Eyebrow caps · None |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 40 · Comfortable 48 · Spacious 60 |
| Alignment | Left · Centred |
| Link style | Arrow link · Underlined · None |
| Placement | In flow · Sticky |

**Data.** Member state only. Nothing here reads posts or tags: a future design wanting "latest post title" needs a new field on the category list, not a silent Ghost lookup.

**Member ask (Part A·A9).** The arrow link is the affordance, and pointed at sign-up it is a member ask. It does not render when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and label and sentence then hold the band, with **the whole-bar tap target at ≤ 767 going with it**: a bar-wide link to a Portal that cannot open is exactly the dead button the empty-data floor refuses. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–768 one line: label, sentence, link, close at the right edge; padding 72 → 40, gaps 14 → 10. Truncation priority is fixed — the label never truncates, the link never truncates, so the sentence shortens: to `messageShort` if set, by ellipsis on one line if not. ≤ 767 the link label and its arrow are dropped and **the whole bar becomes the link**; the label stays inline if `messageShort` is set, otherwise it moves above the sentence with left edges aligned at 20 px (an inline pill pushes a two-line sentence into three). Bar 52 px one-line, ≈ 86 px stacked.

**Behaviour.** *Sticky*: the bar's hairline is dropped and the header's md shadow carries both bands — two grounds this close in tone plus two hairlines 48 px apart reads as a smear when it floats over content. Combined offset 104 px. *Hover*: the arrow moves 2 px right, the only movement in the design. **Label style: None** hides the badge and leaves the sentence holding the band, left-aligned on background — **this design with its badge hidden** (Part A·A8). No switch is offered and the `label` field is kept.

**Empty state.** No label → see above. Link style: None → sentence alone, left-aligned, and the whole-bar tap target does not apply at any width.

**Accessibility.** The label is text inside the same paragraph as the sentence, so it is read: "New. Field Notes is now a weekly column, written by Mara Ellison." At ≤ 767 the bar's accessible name is the sentence plus the label — the name does not shrink when the visible link label does. The close sits **outside** the bar link and later in focus order; that is the one DOM constraint this design imposes. Accent pill: carried background on accent is 4.9:1 in Paper light, 8.1:1 in Paper dark. Outlined pill in Paper light is 4.85:1 — AA, shown in the sidebar because two packs fail it and disable the value.

**Flagged as mine.** The 14-character label cap, the whole-bar tap target at ≤ 767, the truncation priority order, and dropping the hairline when sticky.

---

## 4 · Two-Line

A headline in the pack's heading font over one line of body, centred, action at the right end. The tallest of the text bars and the category's one display moment.

**Descriptor.** The only design with two type sizes stacked — a heading-font line over a body line — and the only one that re-arranges on a stated usable-width trigger rather than at a breakpoint.

**Structural descriptor.** `stack · none · contrast · one · none · headline in heading font`

**Archetype.** stack

**Behaviour module.** `dismiss` only. The 900 px re-arrangement is a media query and the promotion of `body` into the headline's slot is server-side. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” Headline, body and action render at every width. The consequence is worth naming: 144 px of furniture that cannot be put away is the strongest argument for the *not recommended* label already on Sticky.

**Items.** None. Headline and body are two type sizes of one notice, not two items, and `messages[]` is kept untouched.

**Content fields.** `headline` (text, opt, ≤ 60) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `ctaLabelShort` (opt, ≤ 12). `message` is kept and is what appears if the user switches to designs 1–3, so a bar authored here never arrives empty there.

**Controls.**

| Control | Values |
|---|---|
| Background role (universal) | Contrast · Surface · Accent |
| Headline size | Small 19 · Medium 22 · Large 26 |
| Vertical spacing (universal) | Compact 72 · Comfortable 88 · Spacious 104 |
| Text alignment | Centred · Left |
| Action | Button · Text link · None |
| Placement | In flow · Sticky (marked *not recommended* — 144 px pinned with a sticky header) |

**Data.** Member state only. Neither headline nor body is pulled from Ghost. Both empty → no bar.

**Member ask (Part A·A9).** Action: Button and Action: Text link are both member asks when their URL points at sign-up, subscribe or a paid tier. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and headline and body then hold the band, the close keeping the top-right corner. The 900 px re-arrangement is unaffected: it is a media query, not a consequence of the action. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–900 as drawn: text centred on the full width, button placed at the right end and close in the top-right corner, so neither shifts the centring. Below 900 px of usable width the design **re-arranges** — the button centres under the body and the band becomes a padded block, 118 px at 834 — because the body line and a right-hand button cannot both hold and 15 px body is the floor. ≤ 767 the text goes left-aligned (three ragged centred lines at 20 px is the one thing this design cannot survive), headline 22 → 20, body 15 → 14, button hugs the left edge as in A2·2; bar 168 px. Nothing is dropped at any width.

**Behaviour.** *Sticky*: 144 px of pinned furniture, allowed but not recommended, stated in the sidebar under Placement. Button hover on an inverted fill brightens one step to the pack's whitest surface rather than darkening, since there is no accent to darken.

**Empty state.** No body → the band closes to 72 px and the headline centres alone; the headline does not grow to fill the space. No headline → the body is promoted into the headline's slot and font, because a bar whose only text is 15 px muted reads as disabled. At 390 the no-body case is 122 px instead of 168, and the gap between headline and button opens 8 → 10 so the pair does not read as one block.

**Accessibility.** The headline is a `<p>` in the heading font, **never** a heading element: the bar sits above the page's own h1, and a heading here would put site furniture at the top of every page's outline. This is the design that tests that floor. DOM order is headline, body, action, close at every width, including where the action moves. Contrast: headline 13.9:1, body at 72% carried 8.4:1; in dark the body moves to 68% for 5.1:1 — the one value that changes per mode.

**Flagged as mine.** The 900 px re-arrangement trigger, the three headline sizes and the 26 px ceiling, the 72% → 68% dark body opacity, and the "not recommended" label on Sticky.

---

## 5 · Capture

One sentence and an email field, subscribed without leaving the page. The only design that takes input — so the only one with focus, error, submitting and success states — and the only one whose whole ask disappears when the connected site cannot honour it.

**Descriptor.** The only design that takes input, so the only one with focus, error, submitting and success states — and the only one whose ask is dropped, its own band intact, when members are off in Ghost.

**Structural descriptor.** `form · none · surface · one · none · inline email field`

**Archetype.** form

**Behaviour module.** `member-form`, plus `dismiss` for the close. Both edit-safe: nothing posts or validates while the section is edited, and the frames draw the states rather than reaching them. **JS off:** “The `<form>` posts natively to Ghost's members endpoint; Ghost's own server response replaces the designed sent state.” So the field, its visually-hidden label, the submit control and the sentence all render and **the address is subscribable** — what the reader does not get is the in-place confirmation and the `aria-live` error line, because Ghost's own page answers instead. The drawn success state, the fixed error copy, the 118 → 66 px mobile collapse and the “success counts as dismissed” rule all belong to the enhanced path and do not happen; the invalid state falls back to the browser's own `type="email"` validation. **Self-signup off, or members disabled (Part A·A9) → the field does not render: this design keeps its own band and drops the ask, and its module set is `dismiss` alone.**

**Items.** None. The email field is one input, not a repeater — the design takes one address and offers one submit — and `messages[]` is kept.

**Content fields.** `message` (rich text, req, ≤ 120 — a trailing clause may be marked muted and is the first thing dropped) · `emailPlaceholder` (text, opt, ≤ 28, default "you@example.com") · `submitLabel` (text, opt, ≤ 14, default "Subscribe") · `successMessage` (text, opt, ≤ 60, default "You're in. Check your inbox to confirm the address."). The error line ships as a theme translation-catalog string — locale-editable, never per-site free text — because it has to match what the API actually rejected. `audience` defaults to **Logged out** on this design: signed-in members are not asked for an email Ghost already has.

**Controls.**

| Control | Values |
|---|---|
| Background role (universal) | Surface · Background · ~~Contrast~~ (disabled — a field on a contrast band needs a surface step the packs do not define) |
| Vertical spacing (universal) | Compact 56 · Comfortable 64 · Spacious 76 |
| Field width | Narrow 200 · Medium 240 · Wide 320 |
| Submit style | Button beside · Inside field · Icon only |
| Sentence | Before field · Above field · Hidden |
| Placement | In flow · Sticky |

**Data.** Posts to Ghost's members subscribe endpoint; the reader gets Ghost's own confirmation email. An already-subscribed address gets Ghost's response, shown in the success slot. **Self-signup off, or members disabled in Ghost → the field and its submit do not render** (Part A·A9): this design keeps its own band at 56 px, the sentence holds, the authored link renders if there is one, the close stays, and the sidebar says which of the two conditions is in force, with a link to Ghost's setting. **It does not become another design** (Part A·A8) — the substitute button the old text described is withdrawn, because a button that cannot subscribe anyone is no better than a field that cannot. The field controls stay in the panel, disabled with the reason. `emailPlaceholder` and `successMessage` are kept and return when members are switched on.

**Member ask (Part A·A9 and Part A·A10).** The email field *is* the ask, so both rules land on this design and both states are drawn on its frame. Self-signup off, or members disabled → the field and its submit do not render, the design keeps its own band at 56 px and drops the ask, and the field controls stay in the panel disabled with the reason (owner's ruling); it does not become another design. JavaScript off → Ghost's signup endpoint refuses a plain form submission, so P0·4's slim notice replaces the form at the band's own height with the close kept. **It renders when** members are on and signup is open; this design carries no paid ask, so no payment provider is involved. Focus, invalid, submitting and success are unchanged — they are Ghost's own script.

**Responsive.** 1440–1024 as drawn: sentence left, field and submit right, close at the end. 834: field steps one named value down (Medium 240 → Narrow 200) and the muted clause is dropped; the field never goes below 200 px, because 14 px email text needs about 22 visible characters. ≤ 767: field and submit take a full row and both grow to 44 px — the only place in the category where a control gets taller on a phone — and field text goes 14 → 15 px so iOS does not zoom the viewport; bar 118 px. The sentence itself is never shortened here; it is the reason to type.

**States.** *Focus*: 1.5 px accent border on the field, library ring suppressed — the 2 px ring at 2 px offset would collide with a button 10 px away. This is the one documented departure from the library focus shape, and it is why the gap is 10 px. *Invalid*: the sentence is replaced by the error in `text`, field border 1.5 px `text`, **no red anywhere** — the seven roles contain no error colour. *Submitting*: label becomes "Subscribing…", one 160 ms accent step, field disabled on the pack's hover surface; no spinner, so nothing to suppress. *Success*: field, button and sentence are replaced by a centred confirmation with a 20 px accent check; 64 px at desktop, and at 390 the bar collapses 118 → 66 px. That is one of two reader-caused after-load height changes in the category — the other is A2·14 Edge opening — allowed because the reader caused it, it sits below the header, and the alternative is holding 52 px of empty white. Success then counts as dismissed for the full memory period — a subscriber is not asked twice.

**Empty state.** Empty message → the field spans and the bar keeps its height.

**Accessibility.** Visually-hidden `<label>Email address</label>` — the placeholder is never the label. `type="email"`, `autocomplete="email"`, `inputmode="email"`. The sentence is the form's description via `aria-describedby`, so it is read when focus reaches the field. Error and success render into one `aria-live="polite"` region in the sentence's place; on error focus stays in the field, on success focus moves nowhere. Close sits outside the form, last in focus order. With Submit style: Icon only the button's accessible name is `submitLabel`, which stays required. Placeholder on background is 4.7:1.

**Flagged as mine.** The suppressed focus ring, the 200 px field floor, the 15 px mobile field text, the error state's wording, and the absence of an error role in the packs.

---

## 6 · Countdown

A sentence, a clock and one action. The only design whose content changes without anyone editing it, so expiry is a specified state.

**Descriptor.** The only design whose content changes without anyone editing it, and the only one whose height is set by a clock rather than by a Height control.

**Structural descriptor.** `bar · none · contrast · one · none · live clock beside sentence`

**Archetype.** bar

**Behaviour module.** `countdown`, plus `dismiss`. Edit-safe: the clock does not tick while the section is edited, which is why every frame shows an authored time. **JS off:** “The static deadline renders as a `<time datetime>` element (“Ends 3 September 2026”); no ticking digits.” **This is the design whose accessibility rule was already written for that**: the sentence has to name the deadline in words, so the bar is complete with the clock absent, and the boxes, the dropped zero units, the one-hour seconds threshold and the named time zone are all the module's. Two consequences, both flagged as this pass's inferences: with the clock rendering inline as `<time>` the band is the 44 px inline height whatever Clock style says; and a page rendered after `endsAt` carries the expired sentence server-side, while a page already open when the deadline passes does not change, because the switch is the module's.

**Items.** None. One deadline, one clock: a bar with two countdowns is two bars, and the category allows one. `messages[]` and the shared item shape are kept, not drawn.

**Content fields.** `message` (rich text, req, ≤ 120 — **must name the deadline in words**; the editor warns if `endsAt`'s date does not appear in it) · `endsAt` (datetime, required for this design, site time zone from Ghost) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `expiredMessage` (text, opt, ≤ 120) · `expiredCtaLabel` + **`expiredCtaUrl`** (opt pair, ≤ 18 — `expiredCtaUrl` is new this pass; empty, the expired state renders no button rather than reusing the live URL). The expiry fields are **added to the category field list** by this design.

**Controls.**

| Control | Values |
|---|---|
| Ends | Datetime, site time zone |
| Units | Days, hours, minutes · Hours and minutes · Days only |
| Clock style | Boxes · Inline text |
| When it ends | Hide bar · Keep, drop clock |
| Background role (universal) | Contrast · Surface · Accent |
| Placement | In flow · Sticky |

No height ladder — the universal Vertical spacing locks here: height follows Clock style — 56 with boxes, 44 inline, and 44 with no clock at all (no date set, or expired at *Keep, drop clock*).

**Data.** Member state for audience; time zone from Ghost's site setting. No `endsAt` → **the clock does not render and the bar stays itself** (owner's ruling this pass): sentence and action hold the band at the inline height of 44 px, exactly as at *When it ends: Keep, drop clock*, and the sidebar says the clock is waiting for a date. The visitor reads the deadline in words, which the sentence is already required to name. The bar never hands off to another design (Part A·A8); `endsAt` stays required for this design and the editor asks for it, but a missing date can no longer break a live page.

**Member ask (Part A·A9).** The action beside the clock is the affordance, and pointed at sign-up, subscribe or a paid tier it is a member ask — as is `expiredCtaLabel`'s action in the expired state. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the sentence and clock then centre alone, the band keeping the height Clock style sets. The deadline is still named in words, so the bar still says what it says. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–768 one centred group — sentence, clock, action — with the close at the right end so changing digits never move the group's optical centre; numerals are tabular, a requirement on the pack's body font. Group gap 20 → 14 and box minimum 38 → 36 at 834; all three units and the full sentence hold. ≤ 767 two rows: sentence, then clock and action with the button pushed right; bar 109 px. Clock style: Inline text is the same 109 px at this width — the sentence still wraps to two lines and the button still takes its own row, so inline buys height only at 768 and above, where the band is 44 instead of 56. Inline then shows two units above an hour, because a clock inside a sentence that re-flows every minute is a sentence that moves while you read it.

**Behaviour.** Above an hour the clock updates once a minute. Under an hour seconds appear and the sentence switches to "ends tonight at 23:59 (UK)" — from the same `endsAt`, not a second authored string; the zone is named whenever the deadline is inside 24 hours. A unit reading zero is removed, not shown as "00". Digits are replaced in place with no transition, so there is nothing to suppress under reduced-motion and no pause control is required. Expiry follows the control; a bar already on screen when the deadline passes switches to the expired sentence rather than vanishing under the reader. The clock has no hover state and is not focusable.

**Empty state.** No CTA → sentence and clock centre alone. Expired with *Keep, drop clock* → boxes removed, height unchanged, expired copy in place.

**Accessibility.** The sentence names the deadline in words, so the bar is complete without the clock — that requirement shapes the design. The clock is `<time datetime="…">` carrying visually-hidden prose ("2 days, 14 hours and 9 minutes left") with the boxes `aria-hidden`; `aria-live="off"`, because a clock announcing itself every minute — every second in the last hour — would make the page unusable. Focus order: action, then close. Contrast: sentence and digits 13.9:1; the 9 px unit labels at 66% carried measure 7.2:1, and 9 px is permitted only because each label duplicates a word already in the sentence.

**Flagged as mine.** The one-hour seconds threshold, dropping zero units, naming the time zone inside 24 hours, the 9 px unit labels, tying height to Clock style instead of a Height control, and the two new expiry fields.

---

## 7 · Dateline

An eyebrow and a sentence at the left margin, publication meta at the right, no button. The masthead-adjacent bar, and the first design in the category that reads content from Ghost.

**Descriptor.** The only design that reads content from Ghost, and the only one whose right end carries publication meta instead of an action or a close-adjacent control.

**Structural descriptor.** `bar · none · page · one · none · publication meta, right end`

**Archetype.** bar

**Behaviour module.** `dismiss` only. `published_at` is server-rendered, its three lengths are CSS, and the hover-**and**-focus underline the accessibility note requires is CSS too. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” Eyebrow, sentence, `<time datetime>`, divider and the mobile re-arrangement all render; the close is hidden and nothing else in the design notices.

**Items.** None. The meta slot holds one value and Meta: Latest post date reads one post, so nothing here is a list. `messages[]` is kept.

**Content fields.** `label` (text, opt, ≤ 14, never truncates) · `message` (rich text, req, ≤ 120, may carry one inline link) · `messageShort` (text, opt, ≤ 44) · **`metaText`** (text, opt, ≤ 28 — **added to the category list** by this design) · `linkLabel` + `linkUrl` (opt pair, used by Meta: Link).

**Controls.**

| Control | Values |
|---|---|
| Meta | Latest post date · Latest post title (linked) · Custom date (Date Picker) · Custom text · Link · None |
| Label style | Eyebrow · Pill · None |
| Background role (universal) | Background · Surface · Contrast |
| Vertical spacing (universal) | Compact 40 · Comfortable 48 · Spacious 60 |
| Link style | Inline · Underlined · None |
| Placement | In flow · Sticky |

**Data.** The category's only content binding. **Meta: Latest post date** reads `published_at` — the current post's on a post template, the newest published post's everywhere else — and is labelled "from Ghost" in the sidebar. Custom text is the default, so no site gets a date it did not ask for. No posts published → the meta slot and its hairline divider are removed; never a dash, never today's date as a stand-in, never an empty gap for the close to float in. Meta: Link puts A2·3's arrow link in the meta slot, replacing the meta rather than joining it. **New this pass:** **Latest post title (linked)** renders the newest post's title in the meta slot as a link to the post — the natural “Out now: …” bar, one field wider on the same binding; the title is Ghost-owned and plain-text-locked. **Custom date** is now a real Date Picker value rather than free text. A visitor's-browser date is deferred by owner ruling — not offered — and the theme never server-renders “today”.

**Member ask (Part A·A9).** Two affordances here can carry an ask: **Meta: Link**, and an inline link inside the sentence. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the meta slot and its hairline divider are then removed exactly as at Meta: None, the sentence keeping the left margin. The design's other Meta values read Ghost's posts and are never asks: a date is a date. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–1024 as drawn: eyebrow, sentence, meta right, divider, close. 834: the date steps to its medium form ("Wednesday 12 March" → "Wed 12 Mar") before anything else moves — the date has three authored lengths and the sentence has two; padding 72 → 40, gaps 16 → 12. ≤ 767 the meta leaves the right end and joins the eyebrow on row one in its short form ("12 Mar"), the sentence takes the full measure below, and the divider is dropped because meta and close are no longer adjacent; bar 82 px. Truncation priority as A2·3: label never, link never, meta before the sentence.

**Behaviour.** Above a multi-row header the Compact ceiling applies, and the sidebar adds a second note: **Meta: None is recommended when the header below shows a date.** Recommended, not enforced — the bar's date is the issue's and the masthead's is today's, and there are mastheads where both belong.

**Empty state.** Meta: None → the slot goes, the sentence stays on the left margin, height unchanged. Label None + Meta None + `messageShort` set → the band is the short sentence alone, left-aligned: **this design with everything optional hidden** (Part A·A8). No switch is offered and both fields are kept.

**Accessibility.** The eyebrow is text in the same paragraph as the sentence ("Issue 47. Out now: …"), not a heading. The date is `<time datetime="2026-03-12">` with its long form as the visible text, so no hidden duplicate is needed; the visible text shortens at ≤ 767 and the attribute does not. An inline link inside the sentence is distinguished by colour alone at rest, which fails 1.4.1 — so the underline appears on hover **and** on focus, and **Link style: Underlined is the accessible default the sidebar recommends**. This is the only place in A2 where the drawn default and the accessibility recommendation differ. Contrast on background: sentence 13.2:1, muted meta 5.4:1, accent eyebrow 4.85:1 at 13 px / 600.

**Flagged as mine.** `metaText` and its 28-character cap, the three date forms, dropping the divider at 390, the Ghost date binding, and the Meta: None recommendation above a dated masthead.

---

## 8 · Ticker

Several notices on one continuously moving strip, with a pause control that is not optional. The resting state the editor shows is deliberately not the state most readers see: motion does not run while editing.

**Descriptor.** The only design where the text moves continuously, and the only one carrying a pause control as a requirement rather than a choice.

**Structural descriptor.** `bar · none · contrast · variable · none · continuously moving strip`

**Archetype.** bar

**Behaviour module.** `marquee`, plus `dismiss`. Edit-safe, and this design is the reason the property matters: the strip is still while the section is edited, so the resting state the editor shows is deliberately not the state most readers see. **JS off:** “The track renders as a static row, horizontally scrollable via `overflow-x: auto`; nothing moves.” Every message and every link stays reachable by scrolling the strip, and **because nothing moves there is nothing for WCAG 2.2.2 to pause** — the pause button is hidden with no obligation left behind, and the ≤ 767 tap-to-pause and the session-sticky pause are the module's. Two things follow, flagged as inferences: the `aria-hidden` duplicate track exists only to close the loop and has no job in the static row, and the 56 px edge fades read as decoration on a strip the reader scrolls by hand.

**Items.** `messages[]` — the shared list, and the design the list was drawn for.

- **Add.** **Add message** at the foot of the Messages repeater. The new notice arrives as "Something new to tell readers." with its link pair empty and lands **last**, which is the end of the loop. Add is disabled at six with the reason shown.
- **Remove.** On the row, undoable, and active at the floor (Part A·A2). At one item **the strip stops moving and draws that message static** — the loop, the pause control and the duplicate track all have nothing to do, so none render (Part A·A8). Removing the last one is refused with the category's floor sentence.
- **Reorder.** Drag, or ⌥↑ / ⌥↓ on the focused row. Order is the loop's order and the static row's left-to-right order — **but the loop has no privileged first**: a reader arriving mid-cycle meets whichever notice is passing, so nothing in this design may depend on being item 1. That is the honest difference from Rotator, and the sidebar says it on the repeater.
- **Counts.** A number picker, 1–6 (Part A·A5). Designed for **two to four**; at one the strip is static rather than a ticker, and six is the cap because a loop that long may finish after the reader has left the page — a reading limit rather than a layout one. Every message stays in the loop at every width, so no count changes the layout.
- **Zero.** The section does not render: no strip, no fades, no pause button over an empty band.
- **Inside an item.** `message` (req, ≤ 120) and the optional `linkLabel` + `linkUrl` pair. `messageShort` and `label` sit on the shared shape and are **kept but never drawn here** — the strip is a queue rather than a layout, so nothing needs shortening and no notice carries a label. A notice with an empty link pair is plain text in the strip and is not focusable; focus order is the notices that do have links, in authored order.
- **Per-item styling does not exist.** Speed, Separator, Ground and Height write one value onto the strip. A notice that needs to move slower or louder than its neighbours is one bar on its own.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `linkLabel` ≤ 24, `linkUrl` }, req, **2–6 items** — one message is not a ticker, and the editor says so and offers A2·1). Uses no label, headline, body, image or clock; all are kept.

**Controls.**

| Control | Values |
|---|---|
| Messages | The list itself, up to 6, drag to reorder |
| Speed | Slow 40 px/s · Medium 60 · Fast 90 |
| Separator | An icon slot (P0·2) — default: point, Small, Muted; swap, size and colour role in its popover |
| Background role (universal) | Contrast · Surface · Accent |
| Vertical spacing (universal) | Compact 36 · Comfortable 44 · Spacious 56 |
| Placement | In flow · Sticky (*not recommended* — moving text that follows the reader) |

Speed is constant at every viewport: a percentage-based speed would make narrow screens unreadable. The sidebar shows named values only.

**Data.** Member state, plus the shared list’s posts source (§0): Source: Authored · From posts with the P0·5 panel; bound items render post titles linking to their posts, plain-text-locked, and the repeater’s Add, Remove and drag hide. Fewer than two messages (or bound posts) → the strip draws that one notice static, with no loop, no pause control and no duplicate track (Part A·A8); the panel *advises* that A2·1 Rule is the design for a single notice, and advises only. Zero → the section does not render.

**Member ask (Part A·A9).** Any message's `linkUrl` may point at sign-up, so **the ask is per item rather than per design** and the two notes attach to each item's link in the repeater. An item whose ask cannot render — signup closed, members disabled, or no payment provider for a paid ask — draws as plain text in the strip and is not focusable; speed, separators and count are unchanged, and no item leaves the loop. Items bound to posts link to posts and are never asks. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–768: the strip runs behind 56 → 40 px edge fades in the band colour, separator spacing 28 → 24, speed unchanged. All messages stay in the loop at every width — the strip is a queue, not a layout, so nothing needs to fit. ≤ 767: bar 48 px for a 44 px close; **the pause button leaves the bar** — two 44 px targets plus a moving strip in 390 px leaves no window to read — and its job passes to tap-to-pause: first tap pauses, second follows the link under the finger. A 28 px resume button appears once paused, inside the right fade, left of the close. The strip stops with a message at the left margin rather than wherever the finger landed.

**Motion.** 160 ms is not the unit here; the strip runs continuously at the Speed value. It pauses on hover anywhere on the strip, on focus entering the bar (including focus landing on a message link), and on the pause button, which is sticky for the session — a reader who stops the ticker does not have it start again on the next page. Under `prefers-reduced-motion` the strip does not move at all: message 1, centred, with A2·9's three dots at the right end and no auto-advance. **That makes Ticker identical to Rotator for those readers** — a convergence flagged in A2-0. The alternative, stepping one message every few seconds, is still motion for someone who asked for none.

**Empty state.** One message → that notice, static, with the loop and the pause control hidden — still this design. No links → the strip is plain text and nothing in the bar is focusable except pause and close.

**Accessibility.** `<aside aria-label="Announcements">` — plural — containing a `<ul>` of the messages in authored order. The visual loop repeats the list a second time so the strip never shows a gap; **the duplicate is `aria-hidden` and carries no links**, so nothing is announced or focusable twice. Separator dots are decorative and hidden. `aria-live="off"`. The pause button satisfies WCAG 2.2.2 and stays in the accessibility tree at every width, labelled "Pause announcements" / "Play announcements"; hover-pause is never the only mechanism. Focus order: message links in order, pause, close. Carried text on contrast 13.9:1.

**Flagged as mine.** The three speeds in px per second, the 6-message cap, the 56 px edge fades, dropping the pause button at 390 in favour of tap-to-pause, and session-sticky pausing.

---

## 9 · Rotator

The same message list as Ticker, one at a time, dots at the right end, nothing moving horizontally. On `surface` it is the only multi-message bar that does not read as a news channel.

**Descriptor.** The only design that shows one message of several at a time with nothing moving horizontally, and the only one whose stop mechanism is its indicators rather than a pause button.

**Structural descriptor.** `carousel · none · surface · variable · none · single message with dots`

**Archetype.** carousel

**Behaviour module.** `rotator`, plus `dismiss`. Edit-safe: no rotation while editing. **JS off:** “The first message renders statically; the others are not emitted into the visible flow.” Message 1, its link and the Height value all render, so the bar is a working single-message bar — and with one message the dots do not render either, so script-off and one-item resolve to the same band. Two consequences: **the dots go with the module**, since with nothing to advance they would be controls that do nothing (flagged — the registry names the messages, not the indicators); and the visually-hidden `<ul>` of all messages the accessibility note requires is not the visible flow, so it survives and a screen-reader user still gets every message in authored order. *Flagged: reading the hidden list as outside “the visible flow” is this pass's reading of the registry sentence.* The reduced-motion convergence with Ticker is CSS and is unaffected either way.

**Items.** The same `messages[]` list Ticker reads — one repeater, two designs, so editing the list in either edits both.

- **Add.** **Add message** at the foot of the repeater; the notice arrives as "Something new to tell readers." with the link pair empty and lands **last**, which is the last dot and the last turn. Before it is saved the editor measures the sentence against the one-line rule and asks for a `messageShort` if it will not hold one centred line above 767. Add is disabled at six.
- **Remove.** On the row, undoable, and active at the floor (Part A·A2). The canvas returns to message 1 after any removal, so the editor never draws an empty frame. **At one item the rotation and its dots do not render** — indicators for one message are controls that do nothing — and the design draws that message alone, still itself (Part A·A8).
- **Reorder.** Drag, or ⌥↑ / ⌥↓. **Order matters more here than anywhere else in A2:** item 1 is what renders with JavaScript off — "The first message renders statically" — and what a `prefers-reduced-motion` reader sees, so **whatever every reader must read belongs in position 1**. The sidebar states that on the repeater rather than leaving it to be discovered.
- **Counts.** A number picker, 1–6 (Part A·A5). Designed for **two to four**: at Interval: Medium the full cycle is six seconds an item, so six notices need thirty-six seconds on the page to come round, and the sidebar shows the cycle time beside the Interval control. At one item the rotation and the dots are absent. *Flagged: the cycle-time note is mine.*
- **Zero.** The section does not render: never dots above an empty band.
- **Inside an item.** `message` (req, ≤ 120) · `messageShort` (opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair). Empty `messageShort` → the full sentence renders and must hold one centred line above 767, which is what the editor measures. Empty link pair → that message's turn has nothing focusable, and at ≤ 767 the whole-bar link does not apply while it shows, so the bar is plain for those seconds; the dots and the close stay. `label` is kept, not drawn.
- **Per-item styling does not exist.** Interval, Transition, Indicators, Ground and Height are section values. One notice cannot be held longer than the others; a notice that needs its own timing is the only notice.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `messageShort` ≤ 48, `linkLabel` ≤ 24, `linkUrl` }, req, 2–6 items — **the same list Ticker uses**, so switching between the two keeps everything). Every message must fit one centred line above 767; the editor measures the longest against the available width rather than letting one item wrap where the others do not.

**Controls.**

| Control | Values |
|---|---|
| Messages | The list itself, up to 6, drag to reorder |
| Interval | Slow 8 s · Medium 6 s · Fast 4 s |
| Transition | Crossfade · Slide up · None |
| Indicators | Dots · Numbers · None (None requires Interval: Slow) |
| Background role (universal) | Surface · Contrast · Background |
| Vertical spacing (universal) | Compact 44 · Comfortable 52 · Spacious 64 |

**No Placement control** — In flow only. Only **Dots** can be pressed to stop the rotation; with Numbers or None, hover, focus and reduced-motion carry the whole burden, and the sidebar says so under the control.

**Data.** Member state, plus the shared list’s posts source (§0): Source: Authored · From posts with the P0·5 panel; bound items render post titles linking to their posts, plain-text-locked, and the repeater’s Add, Remove and drag hide. Fewer than two messages (or bound posts) → the bar draws that one notice with no rotation and no dots (Part A·A8); the panel *advises* A2·1 Rule for a single notice, and advises only. Zero → the section does not render.

**Member ask (Part A·A9).** Any message's `linkUrl` may point at sign-up, so **the ask is per item rather than per design** and the two notes attach to each item's link in the repeater. An item whose ask cannot render — signup closed, members disabled, or no payment provider for a paid ask — is plain text for its turn; dots, close and interval are unchanged, and item 1 is still what a no-JavaScript or reduced-motion reader gets. Items bound to posts are never asks. It opens Ghost's Portal, so **with JavaScript off nothing happens** — which is worth stating twice here, because a reader without script sees item 1 and nothing else, so **an ask in position 1 is an ask that cannot be answered**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–768 message centred on the full width with 200 → 120 px side padding, so the longest message still centres without touching the dots; each message uses its short form where the author wrote one. Dots hold 24 px targets; divider 16 → 14. ≤ 767 the message goes left-aligned and the dots move below it at 25 px spacing in **32 px-wide targets** — under the 44 px floor, stated on the frame, because dots at the right end of a wrapped two-line message sit where no thumb reaches; swipe left and right does the same job with no target at all. The message's link label is dropped and the whole bar becomes the link, as A2·3. Bar 95 px, or 66 px with Numbers, which sits inline at the end of the first line as "1/3". Height is fixed by the control, never by the longest message — a bar that changed height every six seconds would move the page under the reader.

**Motion.** Crossfade is 160 ms, and that is the ceiling: both messages are on screen mid-transition and two overlapping sentences are unreadable for that eighth of a second, which is also why Transition: None exists. Rotation pauses on hover anywhere in the bar and on focus entering it, and **stops for the session when a dot is pressed**. Under `prefers-reduced-motion` there is no auto-advance and no crossfade: message 1, dots forced on whatever Indicators says (with no rotation and no dots there would be no way to reach messages 2 and 3), and an instant swap on press.

**Empty state.** One message → that notice alone, rotation and dots absent, still this design. A message with no link → that message has nothing focusable; the dots and close remain.

**Accessibility.** `<aside aria-label="Announcements">` containing a `<ul>` with **all messages in the DOM and readable** — visually hidden, not `display:none` — so a screen-reader user gets all three in order without waiting for a rotation. Only the active message's link is focusable, so tabbing never lands on something invisible. Dots are buttons ("Show announcement 2 of 3") with `aria-current` on the active one; each dot is 7 px in a 24 px target at desktop (17 px gap, 24 px pitch), and the focus ring is drawn round the dot rather than the target so spacing stays even. `aria-live="off"`. Inactive dot on surface is 1.9:1 — decorative, which is why the active state is carried by `aria-current` and the message itself, not by colour alone. Dots pressed, hover-pause, focus-pause and the close together are this design's answer to WCAG 2.2.2.

**Flagged as mine.** The 32 px-wide mobile dot target with swipe as the alternative, reading the dots as the WCAG 2.2.2 stop mechanism rather than shipping a labelled pause button, the dark inactive-dot value (#453E35 in Paper) that no pack defines, the 160 ms crossfade ceiling, and dropping the Placement control.

---

## 10 · Pill

A detached bar with air around it, sitting clear of the top edge on the page's own ground. Not a capsule: the corners are the pack's radius token, like everything else in the library.

**Descriptor.** The only design that is a detached object with air around it rather than a band, and the only one where a control — Sticky — changes what the design is rather than where it sits.

**Structural descriptor.** `bar · card · page · one · none · detached object with air`

**Archetype.** bar

**Behaviour module.** `dismiss` only. Lifting out of its reserved space at Sticky is `position: sticky` over a spacer that stays, both CSS; the hairline, the md shadow and the dark shadow value are CSS; the whole-pill link at ≤ 767 is an `<a>`. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” The pill, its air, its ground and its 88 px of reserved space all render, and the space stays reserved because nothing removes it.

**Items.** None. One notice in one detached object — a second pill beside the first is two bars, which the one-per-site rule refuses. `messages[]` is kept.

**Content fields.** `label` (text, opt, ≤ 14) · `message` (rich text, req, ≤ 120) · `messageShort` (text, opt, ≤ 44) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18, used by Action: Button). No new fields — the design is the A2·3 content kit in a detached object.

**Controls.**

| Control | Values |
|---|---|
| Position | Left · Centre · Right |
| Air around it | Close 12 · Comfortable 20 · Far 32 |
| Background role (universal) | Surface · Contrast · Accent |
| Label style | Accent pill · Eyebrow · None (forced to None on contrast and accent grounds) |
| Action | Arrow link · Button · None |
| Placement | In flow · Sticky |

No height ladder — the universal Vertical spacing locks here: the pill is 48 px, 52 px at ≤ 767 for its 44 px close, and its presence is set by the air around it instead.

**Data.** Member state only. Position: Left is flagged in the sidebar when A1·11 Side Rail is the header — the pill would collide with the rail's column. Centre is the only value that survives every A1 header.

**Member ask (Part A·A9).** Action: Button and Action: Arrow link are both member asks when their URL points at sign-up, subscribe or a paid tier. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the pill then hugs sentence and close alone; the air around it and its 88 px of reserved space are unchanged, and on an accent ground the object still spends the accent budget rather than the button. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–768 the pill hugs its content at the chosen position; internal gaps 14 → 12, label 12 → 11.5 px, left padding 20 → 16, air unchanged — the air is the design, so the Offset control changes it and the viewport does not. Reserved space 88 px at Comfortable. ≤ 767 the pill stops hugging and spans the page margins (16 px either side, 12 px air), the label moves above the sentence as in A2·3, the arrow link is dropped and the whole pill becomes the link, close 44 px in the corner; reserved 98 px, or 76 px with `messageShort` on a contrast ground.

**Behaviour.** *Sticky* is the one control in A2 that changes what a design **is**: in flow the pill reserves 88 px and scrolls away; sticky, it lifts out of its reserved space and floats over the article below a sticky header, keeping the same air. The spacer stays, so nothing jumps. Pointer events stay on the pill only, so text behind it remains selectable.

**Grounds.** On surface the pill needs hairline **and** md shadow — in this pack neither alone reads as lifted. On contrast the hairline goes (a border on a dark object against a light page is a second outline) and the label goes with it. On accent the whole object is the accent budget: nothing inside it may be accent, and the pack's darkened accent renders so 13.5 px white holds 4.6:1.

**Empty state.** No label → sentence and action alone. Action: None → the close is the only interactive thing in the pill.

**Accessibility.** `<aside aria-label="Announcement">` before `<header>` in the DOM at every width **including Sticky** — the visual detachment must not become a DOM detachment, and the pill is never moved to the end of the body to make positioning easier. Label and sentence are one paragraph. Dismissal removes the pill and its reserved space and moves focus to the header's first focusable item. The sticky offset includes the pill's height, so it never covers a focused element.

**Flagged as mine.** The dark shadow value `0 4px 16px rgba(0,0,0,.32)` (the brief's two shadows are both light-mode), needing hairline *and* shadow on surface, dropping the label on contrast and accent grounds, the three air values, and the fixed 48/52 px height.

---

## 11 · Toast

A small card in a bottom corner, arriving after the page has settled. The only design that appears rather than being there, and the only one that never touches the header.

**Descriptor.** The only design that arrives after the page has settled rather than being present at load, and the only one Escape dismisses from anywhere on the page.

**Structural descriptor.** `overlay · card · page · one · none · fixed bottom corner`

**Archetype.** overlay

**Behaviour module.** `slide-in-card`, plus `dismiss`. Edit-safe: the card is drawn in place while editing rather than timed. **JS off:** “The card renders statically in the document flow near the page end rather than sliding in.” Said plainly, that is a different object from the one drawn: not a floating card but a card at the end of the page, so **Appears (Immediately · After 2 seconds · After 25% scroll) has nothing to time, Position has nothing to anchor, the 12 px stack above whatever the site already owns at the bottom edge does not arise, and Escape does nothing** — a key handler is script. What survives is the card itself: title, body, actions, ground and shadow, in the DOM position this design already specifies, which is why the accessibility note put it at the end of the body. Its `aria-live="polite"` announces nothing there, because a card present at load is read in document order — the live region exists for the arrival the module provides.

**Items.** None. One card, one title, one body: a stack of toasts is a message queue, and the category's answer to a queue is Ticker or Rotator. `messages[]` is kept.

**Content fields.** `message` (rich text, req, ≤ 60 here — it is a title line, capped shorter than the category's 120) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `linkLabel` + `linkUrl` (opt pair, ≤ 24, the ghost action). No image: a picture in a 380 px corner card is A2·12's job at full width. **New this pass:** an optional **icon slot** before the title (P0·2), default off — the one A2 shape that conventionally carries an icon; empty, it renders nothing and the title starts at the padding.

**Controls.**

| Control | Values |
|---|---|
| Position | Bottom right · Bottom left · Bottom centre |
| Icon | Off (default) · an icon slot before the title (P0·2) |
| Appears | Immediately · After 2 seconds · After 25% scroll |
| Background role (universal) | Surface · Contrast |
| Actions (group) | **Button: On · Off** · **Link: On · Off** — one toggle per action, each its own P0·4 card; both off is the old None |
| Body text | Show · Hide |
| Width | Narrow 320 · Medium 380 |

**No Placement control** — bottom-anchored, floating, never in flow. No Accent ground: a 380 × 120 px accent card is a poster. No exit-intent value under Appears: it needs mouse tracking, does not exist on touch, and reads as a trap — a deliberate omission.

**Data.** Member state only. **This design is the one that may coexist with one top bar** — the category's "one bar per site" rule counts the top stack only. The editor warns once if a toast and a top bar carry the same message.

**Member ask (Part A·A9).** Both Actions toggles — Button and Link — are member asks when their URLs point at sign-up, subscribe or a paid tier, and the ghost action is as conditional as the primary. None renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the card then keeps its title and body with the actions row absent and no gap reserved: the card shortens rather than showing an empty row. Arrival, Escape and the live region are the module's and are unaffected. It opens Ghost's Portal, so **with JavaScript off nothing happens** — and with JavaScript off this card is a static block near the page end, so an ask there is doubly inert. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440 as drawn: 380 px wide, 24 px from both edges, actions in a row, close in the card's top-right at a −6 px offset so its 32 px box aligns optically to the 16 px padding. 834: same width, insets 24 → 20 — the card holds while the page narrows, which is what Narrow 320 is for. ≤ 767: spans the margins at 12 px either side, 20 px above the safe-area inset, actions stack with the primary **full width** — the opposite of A2·2's rule, because there is no header button below it to compete with; 178 px tall, or 74 px with Body hidden and Actions: Link, which is what the sidebar recommends when `body` runs past 100 characters.

**Motion.** Enters with 8 px of travel and a fade to full over 160 ms ease-out, shadow arriving with it; dismissal reverses it. Under reduced-motion it appears and disappears in place at the same moments. Nothing below it reflows at any point: no reserved space, no offset.

**Placement against other fixed things.** The card never covers a fixed element the site already owns — it stacks 12 px above a bottom player, or above a consent bar the owner added through Ghost’s code injection, and whatever was there first stays underneath. *A2 no longer draws a bottom bar of its own: 13 was cut this pass, so the only bottom-anchored design in the category is this one.*

**Empty state.** Body hidden or empty → title and actions only. Actions: None → title, body and close.

**Accessibility.** `<aside aria-label="Announcement">` at the **end** of the body — the one A2 design not before the header, because it is not part of the top of the page and putting it first would make it the first thing every keyboard user meets. It carries `aria-live="polite"`, which the load-present bars do not: this card arrives after the page has settled, so it is announced once when it does. The title is a `<p>` at 14 px / 600, not a heading. Focus is **not** moved into the card: it is not a dialog, does not trap focus and does not block the page. **Escape dismisses it from anywhere on the page** — the only A2 design where that is true — and focus returns to where it was, never to the header.

**Flagged as mine.** The 60-character title cap, the 2-second default, the omission of exit-intent, the dark shadow value, stacking 12 px above whatever the site already owns at the bottom edge, and the full-width mobile primary that contradicts A2·2 for a stated reason.

---

## 12 · Takeover

A 200 px band with a picture in it: image on one side, headline, body and a button on the other. The only design in the category that carries imagery, and the only one tall enough to be mistaken for a hero.

**Descriptor.** The only design that carries imagery, and the only one tall enough to be mistaken for a hero.

**Structural descriptor.** `split · none · surface · one · left · full-bleed image panel`

**Archetype.** split

**Behaviour module.** `dismiss` only. The panel is an `<img>` at three authored crops, the scrim is a CSS layer built from the pack's contrast colour, the 6% dark dim is CSS, and the type step-down inside the fixed band is CSS with the editor — not the theme — naming any sentence that truncates. **JS off:** “The bar renders and stays; the close button is hidden rather than rendered inert.” Image, eyebrow, headline, body and action all render at full quality. The consequence is the largest in the category: **200 px of furniture above every page that no reader can put away**, which is the case for Height: Compact above a multi-row header, and for the skip link the accessibility note already insists on.

**Items.** None. One image, one headline, one action — `image` is a single field and the category has no gallery. `messages[]` is kept.

**Content fields.** `image` (image, opt — the category's only one) · **`imageAlt`** (text, opt, ≤ 120 — **added to the category list**; empty means decorative, and the editor never invents alt text or uses the file name) · `label` (text, opt, ≤ 14, rendered as the eyebrow) · `headline` (text, req here, ≤ 60) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `linkLabel` + `linkUrl` (opt pair, used by Action: Arrow link).

**Controls.**

| Control | Values |
|---|---|
| Image | Left panel · Right panel · Background · None |
| Content source | Authored · From a post (P0·5: Latest · Featured · By tag · By author · Hand-picked) |
| Vertical spacing (universal) | Compact 160 · Comfortable 200 · Spacious 240 (Compact only above a multi-row header) |
| Background role (universal) | Surface · Background · Contrast |
| Scrim | ~~None~~ (disabled — text on an unscrimmed photograph cannot be measured) · Subtle · Strong; Background images only |
| Body text | Show · Hide |
| Action | Button · Arrow link · None |

**No Placement control** — In flow only.

**Data.** Member state, plus **Content source: Authored · From a post** (new this pass): bound, image ← the post’s feature image, headline ← its title, CTA ← its URL, chosen through the same P0·5 panel. Bound text is plain-text-locked (“Edit in Ghost”); the eyebrow and the button label stay authored and inline-editable. Empty `image` → the band renders as Image: None at 160 px whatever the control says; the striped placeholder is for the editor, never for a reader.

**Image treatment.** The panel is bled to the band's edges with no radius of its own — a rounded card inside a full-bleed band reads as two objects. Panel width and crop follow the layout: 360 px at 16:9 on desktop, 260 px at 4:3 at 834, a 132 px band at 3:1 at ≤ 767, so the image must be authored with a subject that survives all three. **Image focus** (Centre · Top · Bottom) is set in the Image Picker popover — never a hidden field — and biases all three crops. Background fills the band and puts the text on the image behind a scrim built from the pack's contrast colour — never a black-to-transparent gradient — running 72% at the text edge to 28% at the far side, turning 90° at ≤ 767 to 30% → 82% top to bottom. In dark the image is dimmed 6% and nothing else is done to it: no filter, no duotone, no border; the scrim pair becomes 78/38%.

**Member ask (Part A·A9).** Action: Button and Action: Arrow link are both member asks when their URL points at sign-up, subscribe or a paid tier. Neither renders when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the 200 px band then carries image, eyebrow, headline and body with the close as the only interactive thing in it: the case Action: None already carries a sidebar warning for, and the warning now names this cause too. Content source: From a post is not an ask — a post link is a post link. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440 as drawn, text vertically centred against the panel's full height, close in the band's top-right at 14 px, clear of the text column. 834: panel 360 → 260, headline 26 → 23, body 15 → 14, padding 72 → 40, band holds 200. ≤ 767: panel becomes the top band, text stacks below, button full width (as A2·11, and for the same reason — no competing accent inside the band), close sits on the image behind an 85% wash of the lightest surface; band 331 px, 39% of a 844 px viewport, named in the sidebar, with Image: None (150 px) offered as the phone-first choice. Background at ≤ 767 drops the body's second sentence — the only content this design cuts at any width.

**Stress.** With headline and body both at their caps the type steps down inside the fixed band — headline 26 → 19, body 15 → 13 — rather than the band growing, because a bar that grows with its text can push a hero off the screen. Below 13 px the body truncates with an ellipsis and the editor names the sentence that went. The panel narrows to a 120 px strip before it is dropped at 480.

**Empty state.** No image → Image: None at 160 px. Body hidden → headline and action, band unchanged. Action: None → the close is the only interactive thing in 200 px, which the sidebar warns about.

**Accessibility.** The skip link matters most here: 200 px of furniture stands between a keyboard user and the article. The image is decorative by default with an empty `alt`; `imageAlt` is used when filled. Eyebrow, headline and body are all `<p>` elements — a 26 px headline in the heading font is exactly the case that tempts an `h2`, and the category floor holds. The band is not a link and neither is the image: a 1440 × 200 px target above the header would swallow the page. One action. Dismissal removes 200 px in one 160 ms collapse with the category's scroll correction — this is the design where that rule earns its keep. Contrast: headline on surface 13.2:1, body 5.4:1, eyebrow 4.85:1; on Background the 72% scrim stop puts white headline at 9.1:1 and body at 7.4:1 over a mid-tone photograph. The editor cannot measure a photograph, so scrim values are fixed rather than adaptive and Strong exists for images that need it.

**Flagged as mine.** `imageAlt`, the three panel widths and their crops, the 6% dark image dim, all three scrim pairs, the 85% close wash at ≤ 767, dropping the body's second sentence at 390, and disabling Scrim: None.

---

## 14 · Edge

A 4 px accent rule across the top with a chip at its right end; pressed, it opens into a one-line band of its own. Four pixels of furniture instead of forty-four.

**Descriptor.** The only design that is four pixels of furniture until it is pressed, and the only one whose two states differ by more than a control setting.

**Structural descriptor.** `bar · none · accent · one · none · four-pixel accent rule`

**Archetype.** bar

**Behaviour module.** `accordion` — the chip is a disclosure — plus `dismiss` for the × beside it. Edit-safe. **Ruled by the owner, patch pass two: the disclosure is the hand-built one** — a `<button aria-expanded>` controlling the panel, not native `<details>`/`<summary>`. The accessibility field, which specified that markup all along, stands as written; the registry's compilation is what gives way, and **the library rule that the registry is the authority on module mechanics is overridden here, for this design, by name.** **ARCHITECT:** the registry owes either an `accordion` variant that compiles to `<button aria-expanded>` or a separate entry for it. **No module name is coined**; Edge keeps `accordion` as its declared module until the architect rules. Finding 2 closes with the ruling.

**What the ruling costs.** A hand-built button needs script, so **Edge is no longer the one A2 design whose own behaviour is unaffected by JavaScript being off** — that sentence is withdrawn. **JS off:** the 4 px rule and the band are both server-rendered, and **the bar renders open with no chip.** A chip that cannot be pressed is the dead control the category's floors already refuse, and 4 px of accent over text nobody can reach is not a bar. So a reader without script gets the sentence, its link and the rule at the open height; the close is hidden, as everywhere else in A2. *Flagged as mine: the choice of the open state as the no-JavaScript state.* **OPEN FOR THE OWNER:** the alternative is that Edge does not render at all without script — it keeps the four-pixel promise and costs that reader the message.

**What the ruling buys.** **Opens on: Hover and focus is now expressible at every state.** It was the one value `<details>` could not carry, and the old flag — that it silently degraded to Click and focus — withdraws. Escape-to-collapse and the × were script before this ruling and are script still.

**Items.** None. One chip, one sentence; opened, the band carries that single notice in its own strip. `messages[]` is kept.

**Content fields.** `message` (rich text, req, ≤ 120) · `messageShort` (text, opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · **`chipLabel`** (text, req, ≤ 14 — **added to the category list**; the only visible text in the collapsed state). The open bar reads the same fields every single-message design reads, so switching designs loses nothing but the chip label.

**Controls.**

| Control | Values |
|---|---|
| Rule weight | Hairline 2 · Rule 4 · Bold 6 |
| Chip | Right · Centre · ~~None~~ (disabled) |
| Chip label | Text, ≤ 14 |
| Opens on | Click and focus · Hover and focus |
| Open ground | Contrast · Surface (Surface recommended in dark-first packs) |
| Placement | In flow · Sticky |

No height ladder — the universal Vertical spacing locks here: collapsed is the Rule weight, open is 44 px plus the rule.

**Collapsed.** 4 px of reserved space at every width. The 24 px chip hangs into the header's own padding rather than adding height, which is why it sits at the right end where A1·1 has nothing but air; its bottom corners take the pack radius so it reads as a tag pulled out of the rule. Rule and chip share the design's entire accent budget.

**Open.** One line on the chosen ground with the accent rule still above it — the same arrangement A2·1 draws, built by this design rather than handed to it — 48 px desktop, 82 px at 390 with A2·1's two-line wrap — and the page moves down by the difference over 160 ms; instantly under reduced-motion, because a state change is not motion. The chip becomes the word "Close" with the caret flipped and keeps its position, so the thing you pressed has not moved.

**Collapse is not dismissal.** The chip toggles and keeps the rule. The × beside it removes the bar *and* the rule for the memory period. Two controls 24 px apart doing different things is this design's risk, which is why the collapse control is a word and not a second glyph.

**Member ask (Part A·A9).** The link inside the **open** bar is the affordance, and pointed at sign-up it is a member ask; the chip is a disclosure and never an ask. It does not render when the connected site cannot honour it — signup closed, members disabled, or no payment provider for a paid ask — and the open bar is then the sentence alone, with the chip, the 4 px rule and the disclosure untouched, because none of them is the ask. It opens Ghost's Portal, so **with JavaScript off nothing happens** — and **the ask is dead without script like every other ask in A2** — and after the owner's ruling the bar no longer opens without script either; it renders open instead, with the sentence and the ask both visible and only the ask inert. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** Only the chip's inset changes with width, following the header's padding: 56 → 32 → 12. ≤ 767 the chip grows to 32 px with a 12 px label, and its hit area extends 6 px up into the rule and 6 px down into the header's padding — 44 px of target without a 44 px chip.

**Empty state.** No link → the open bar is the sentence alone. `chipLabel` is required: without it there is nothing to press, so the editor blocks publishing rather than falling back.

**Accessibility.** The rule is decorative and `aria-hidden`. The chip is `<button aria-expanded>` — **the owner's ruling this pass, and now the whole design's markup rather than only its accessibility note** — whose accessible name is the full sentence plus "Show announcement", so a screen reader hears the message without opening anything while the visible label stays the authored short one. Chip: None is disabled because a hover-only 4 px strip fails 2.1.1. Opening moves no focus; Escape collapses when focus is inside; the × is a separate labelled button.

**Flagged as mine.** `chipLabel` and its cap, disabling Chip: None, the overlapping mobile hit area, the 2 px chip growth on hover, the dark-pack recommendation for Open ground: Surface, and the open bar as the no-JavaScript state.

---

## 15 · Triple

Three short notices side by side in one band, divided by hairlines. The only design that shows more than one message at once without moving — and below 768, where they will not fit at once, the only one that shows them in sequence instead.

**Descriptor.** The only design that shows more than one message at once without moving. Below 768 it draws one slot and cycles its notices through it — it stays itself at every width (Part A·A8).

**Structural descriptor.** `grid-of-N · none · surface · few · none · three hairline-divided slots`

**Archetype.** grid-of-N

**Behaviour module.** `dismiss` at every width, plus **`rotator` below 768** — the owner’s ruling, patch pass two: on a phone the band becomes one slot that cycles its notices, each fading in after five seconds, looping. **This design declares the width below which its script runs: “collapses into sections under 768”** (Part A·Rule E), and after this ruling the declaration names a real script boundary rather than a layout threshold — above it nothing runs but the close, below it `rotator` does. Edit-safe: nothing cycles while the section is edited, and the editor draws the first notice at rest.

**JS off, at 768 and above:** “The bar renders and stays; the close button is hidden rather than rendered inert.” The whole band draws — two or three slots, dividers, labels, per-slot links — all CSS and markup. **JS off, below 768:** `rotator`’s own sentence, “The first message renders statically; the others are not emitted into the visible flow,” and `dismiss`’s alongside it: the first notice draws alone with its label and its sentence wrapped in full, there is no cycling and no “1/3”, and the close is hidden. **That is exactly the band the owner’s earlier ruling gave every phone reader**, which is now the floor a phone reader falls back to rather than the ceiling. **Both states are complete without script**; what a no-JavaScript phone reader loses is notices two and three, and authored order decides which one they get.

**Part A·A8, checked rather than assumed.** Borrowing `rotator` is not becoming A2·9: Triple’s phone band keeps its own label, its own ground and its own close, draws no right-end dot rail, and the sidebar names no other design at any width. The earlier pass removed `rotator` from this design citing A8; **that reading is reversed by the ruling, and a module shared is not a design handed off.** *Flagged: the reading is this pass’s.* **What a phone reader sees no longer depends on script**: slot one draws either way, where the previous hand-off to `rotator` made it script-dependent. Finding 3 closes with it.

**Items.** The same `messages[]` list again, **plus the per-item `label` this design adds to the item shape.**

- **Add.** **Add message** at the foot of the repeater. The notice arrives with the label "New" and the sentence "Something new to tell readers.", link pair empty, and lands **last** — the next empty slot, or beyond the slot count if the slots are full. **Add stays enabled past the slot count**, unlike Ticker and Rotator: the list is shared, so an item this design does not draw is still drawn by the other two. The sidebar counts what is not shown ("three of five shown") rather than refusing the item.
- **Remove.** On the row, undoable. Removing a drawn item **promotes the next kept item into the slot** rather than leaving a hole — an empty cell is the one thing this design cannot show. At two items with Slots: Three the grid drops to two columns, as the Data field states. **At one item the slot takes the whole band and the dividers are absent** — still this design, no switch offered (Part A·A8).
- **Reorder.** Drag, or ⌥↑ / ⌥↓, and it is load-bearing three times over: order decides **which items are drawn at all** — the first two or three — **which slot carries the accent label**, since Labels: First in accent names a position rather than an item, and **where the phone cycle starts and in what sequence it runs**. Moving an item into slot one moves the accent onto it; the item never carries it. Item one is also the only notice a phone reader without script, or with reduced motion, is guaranteed to read.
- **Counts.** A number picker (Part A·A5), 1–6, designed for **exactly the slot count** — two at Slots: Two, three at Slots: Three. Items past the slot count are kept, counted and **not drawn**. **Ruled by the owner, patch pass two:** that is the whole answer and no other was needed — **the list stays shared, the extra notices are hidden when a lower slot count is chosen and drawn again when a higher one is**, and nothing is capped, mirrored or forked. No per-design cap, no slot-following count, no second list. **Finding 4 closes.** Below 768 the same drawn set cycles rather than one notice standing alone, so a six-item list is three notices on a desktop and the same three in turn on a phone.
- **Zero.** The section does not render: no band, no dividers, no empty cells.
- **Inside an item.** `message` (req, ≤ 120, clipped to one line with its full text kept for screen readers) · `label` (opt, ≤ 14) · `messageShort` (opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair). Empty `label` → the slot starts at the sentence with no space reserved for a label, and if slot one's label is empty under Labels: First in accent the accent simply does not appear in the band; nothing is promoted from another slot to carry it. `messageShort` set → it renders, which is how an author beats the ~34-character slot budget. Empty link pair → the slot is not a link under Link style: Whole slot and draws no arrow under Arrow link, and that slot is not focusable while its neighbours are.
- **Per-item styling does not exist.** Slots, Dividers, Labels, Link style and Ground are section values, and `1fr 1fr 1fr` refuses "make slot two wider" by construction. A notice that needs more width than its neighbours is a one-notice design.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `messageShort` ≤ 48, **`label` ≤ 14**, `linkLabel` ≤ 24, `linkUrl` }, req, 2–6 items — the same list Ticker and Rotator use, with a **per-item label this design adds to the item shape**). Each slot clips to one line with an ellipsis and never wraps; `messageShort` renders when set. About 34 characters per slot after the label at 1440, shown per slot in the editor.

**Controls.**

| Control | Values |
|---|---|
| Messages | The shared list |
| Slots | **Number picker, 2–3** (Part A·A5) — capped at three with the reason stated: "three columns is what 1,296 px divides into with a sentence still readable" |
| Dividers | Hairline · Space · None |
| Labels | First in accent · All muted · None |
| Link style | Whole slot · Arrow link |
| Background role (universal) | Surface · Background · Contrast |

**No Placement control** — In flow only.

**Grid.** Three equal columns on `1fr 1fr 1fr` — equal by grid, never by content, so a short third notice cannot steal width from a long first one. Only the first slot's label takes accent; three accent labels in one 56 px band is three focal points and none. The close reserves 24 px of the third slot's right padding at every width, on its own ground patch, so hovering it never highlights the slot underneath.

**Data.** Member state, plus the shared list’s posts source (§0) — bound, each slot renders a post’s title linking to the post, labels do not apply to bound items, and the sidebar counts bound items past the slot count. Two items with Slots: Three → the grid drops to two columns rather than leaving an empty cell; an empty third is the one thing this design cannot show. One item → the slot takes the whole band and the dividers are absent, and below 768 it draws with no cycling and no indicators; still this design (Part A·A8), and no switch is offered. Items beyond the slot count are kept and counted in the sidebar.

**Member ask (Part A·A9).** Any slot's `linkUrl` may point at sign-up, so **the ask is per item rather than per design** and the two notes attach to each item's link in the repeater. A slot whose ask cannot render — signup closed, members disabled, or no payment provider for a paid ask — is not a link under Link style: Whole slot and draws no arrow under Arrow link; the grid keeps its columns and the slot keeps its sentence, because an empty cell is the one thing this design cannot show. Below 768 the notices cycle, so **every ask comes round on a phone** rather than only slot one’s — the earlier consequence withdraws. It survives in one place: a phone reader **without script, or with reduced motion**, gets the first notice only, so an ask outside position one is invisible to them. It opens Ghost's Portal, so **with JavaScript off nothing happens**. **It renders when** members are on and signup is open; a paid ask needs a payment provider connected and a live paid tier as well; a sign-in link needs members on only.

**Responsive.** 1440–1024 as drawn. 834 keeps three slots and **drops the labels** — 278 px cannot hold a label, a sentence and an arrow, and the sentence is what the reader came for; the accent leaves the band entirely, the only design in A2 where that happens by rule rather than by control. **Below 768 the band is one slot and the notices cycle through it** (owner’s ruling, patch pass two): the label kept, the sentence wrapped in full, one close for the band, **77 px** — the same band the single static slot cost, because the indicator is **A2·9’s inline “1/3”**, set at the end of the sentence rather than on a row of its own. Ruled by the owner. **A notice holds for five seconds and the next crossfades in, looping**; the set that cycles is the set the slot count draws — two at Slots: Two, three at Slots: Three — in authored order, so what a phone reader gets and what a desktop reader gets is the same content in sequence rather than a subset. **Every drawn notice now reaches a phone reader**, which the previous ruling’s single static slot did not give. Dividers is inert there and the sidebar names it; Slots is not inert any more — it still decides how many notices come round. The band height is fixed at the tallest notice in the cycle, measured once, so it never changes height mid-cycle and the page never moves under the reader; the editor asks for a `messageShort` on any notice that would run past two lines. **The five seconds and the inline “1/3” are the owner’s; the fixed-to-the-tallest height is mine.** The rejected alternative — all three stacked at 212 px, most of a phone’s first screen — is still rejected and stays drawn on the frame at 62%.

**Motion, below 768.** Crossfade at 160 ms, the category ceiling, on a five-second hold. The cycle **pauses on focus entering the band and on hover where there is a pointer, and stops for the session when the “1/3” is pressed**, which also advances one — A2·9’s dot behaviour on A2·9’s Numbers indicator. **Swipe left and right does the same job with no target at all.** Under `prefers-reduced-motion` there is no auto-advance and no crossfade: the first notice, the “1/3” still there and still pressable so notices two and three stay reachable, and an instant swap on press.

**One thing the pick changes, and it is not a preference.** On A2·9 Numbers is one of three Indicators values and the spec says plainly that only Dots can be pressed — with Numbers, hover and focus carry the whole burden. **That cannot stand here**, because this is a phone band where hover does not exist and Numbers is the only indicator there is: WCAG 2.2.2 needs a stop, and reduced motion needs a way to reach notices two and three. **So Triple’s “1/3” is pressable** where Rotator’s is not. *Flagged as mine: the divergence. The alternative is a labelled pause button, which costs the band the 28 px the owner’s pick just saved.* Above 768 nothing moves and nothing is suppressed.

**Empty state.** Labels: None → sentence and arrow per slot. **One item, below 768:** the notice draws alone with no cycling and no “1/3” — an indicator for one notice is a control that does nothing — and the band is the old 77 px, still this design (Part A·A8). Dismissal removes all three notices at once, and below 768 it removes the whole cycle rather than the showing notice; there is no per-slot dismissal, because a band that can lose a column mid-session would re-lay-out under the reader.

**Accessibility.** `<aside aria-label="Announcements">` containing a `<ul>` of items in authored order, which is also visual order and tab order. **A clipped sentence keeps its full text**, so screen readers get the whole message where sighted readers get an ellipsis, and the editor marks clipping per slot rather than hiding it. One link per slot — whole cell or arrow, never both. The close sits outside all three links, last in focus order. The focus ring is drawn *inside* the cell rather than at 2 px offset: on a cell flush against its neighbour an offset ring sits on the divider and looks like the wrong slot is focused. Slot hover fills the cell with the pack's hover surface — the only hover background in A2 that covers a region of text rather than a 32 px control, allowed because a slot is a cell rather than a bar. **Below 768, where the notices cycle**, the same `<ul>` carries **all of them in the DOM and readable**, so a screen-reader user gets every notice in authored order without waiting for a turn; only the showing notice’s link is focusable, so tabbing never lands on something invisible; the band is `aria-live="off"`, because a bar present at load is read in document order. **WCAG 2.2.2 is answered the way A2·9 answers it** — an indicator that stops the cycle when pressed, plus focus-pause, hover-pause where there is a pointer, swipe, and the close — rather than with a labelled pause button. **The indicator is A2·9’s inline “1/3”, ruled by the owner**: one button set at the end of the sentence, 13 px in the muted role, carrying the catalog string “Show announcement 2 of 3” and `aria-current`, with a 44 px target made by extending its hit area into the sentence’s trailing space rather than by growing the numerals. Pressing it advances one and stops the cycle for the session. *Flagged as mine: that it is pressable at all — A2·9’s Numbers are not, and here they are the only indicator on a band with no hover.* The owner’s pick closes the open question this pass raised.

**Flagged as mine.** The per-item label on the shared list shape, the 34-character budget, dropping labels at 834, the inside-the-cell focus ring, the hover background, no per-slot dismissal, and — from this pass — the fixed-to-the-tallest-notice height, and making the inline “1/3” pressable where A2·9’s is not.

---

## Structural descriptors — uniqueness check

Tuple shape: `archetype · containment · ground · item-count class · media placement · emphasis mechanism`. All fourteen checked against each other; no two are the same, and every emphasis phrase is four words or fewer.

| # | Design | Tuple |
|---|---|---|
| 1 | Rule | bar · none · contrast · one · none · full-width contrast band |
| 2 | Split | bar · none · surface · one · none · single right-hand button |
| 3 | Badge | bar · none · page · one · none · label pill before sentence |
| 4 | Two-Line | stack · none · contrast · one · none · headline in heading font |
| 5 | Capture | form · none · surface · one · none · inline email field |
| 6 | Countdown | bar · none · contrast · one · none · live clock beside sentence |
| 7 | Dateline | bar · none · page · one · none · publication meta, right end |
| 8 | Ticker | bar · none · contrast · variable · none · continuously moving strip |
| 9 | Rotator | carousel · none · surface · variable · none · single message with dots |
| 10 | Pill | bar · card · page · one · none · detached object with air |
| 11 | Toast | overlay · card · page · one · none · fixed bottom corner |
| 12 | Takeover | split · none · surface · one · left · full-bleed image panel |
| 14 | Edge | bar · none · accent · one · none · four-pixel accent rule |
| 15 | Triple | grid-of-N · none · surface · few · none · three hairline-divided slots |

**Containment is `none` twelve times, and that is the honest answer.** A2's sections are bands, and a band is not a container — it is the section's own ground. Only **10 Pill** and **11 Toast** are contained, because in both the section *is* a detached object with the page ground visible around it. **Pill is `card`, not `pill`:** the design's own rule refuses the capsule — “the corners are the pack's radius token, like everything else in the library” — so the name is the design's, not the tuple's. The one place a box could otherwise have been claimed went with 13, cut this pass.

**Ground does the most separating in A2** — four values across fourteen designs, and it is the drawn default in every case, never the control's full range. `contrast` on 1, 4, 6, 8; `surface` on 2, 9, 12, 15; `page` on 3, 7, 10, 11; `accent` on 14 alone, because the rule *is* the design. 1 Rule offers Surface and Accent as control values and is still `contrast`. **`image` and `transparent` are unused:** 12 Takeover's Image: Background is a control value on a surface band, and the category rule forbids a transparent or scrimmed bar over a hero outright — “The bar is never given a transparent or scrim treatment.”

**Item count: the repeating unit in A2 is the notice.** Eleven designs show exactly `one`. 8 Ticker and 9 Rotator take the shared 2–6 list and are `variable`, since the author decides how many. 15 Triple is `few` because its Slots control fixes two or three whatever the list holds — the items beyond the slot count are kept and counted in the sidebar, not shown. `none` and `many` are unused: there is no A2 design without a notice, and the 6-message cap keeps every list under five shown at once.

**Media placement is `none` thirteen times.** 12 Takeover is the category's only imagery and is `left` — its drawn default panel. Background is a control value on that same design, not a second one, and `imageAlt` is the only image field on the category list.

**Two names that do not match their archetype, stated rather than left to trip someone.** A2·2 is called **Split** and its archetype is `bar`: a message at one end and a button at the other is a row with two ends, not two panels — `split` is 12 Takeover, which really does divide the band. A2·9 **Rotator**'s archetype is `carousel`, one item of several shown at a time with indicators and a swipe, while 8 Ticker, the design that actually moves, is a `bar` whose content moves. Neither pair leans on that reading alone: 2 and 12 differ on three further slots, 8 and 9 on ground and emphasis.

**The close pairs, stated rather than buried.** 1 Rule and 6 Countdown share `bar · none · contrast · one · none` and separate on the clock. 3 Badge and 7 Dateline share `bar · none · page · one · none` and separate on which end carries the extra element. *The third pair the earlier pass listed — 2 Split against 13 Notice — went with 13.* Each pair is exactly what it looks like — the same bar with one device changed — which is what the sixth slot is for.

**Not used as a separator.** Height, Placement, Alignment, Link style, Dismissible, `dismissMemory` and `audience` never appear in a tuple: they are controls, and two designs that differ only by a control setting are one design. Neither does the fallback web — and after Part A·A8 there is none: **no A2 design resolves to another design.** Each hides what does not apply and states it.

---

## Behaviour modules — roster

Seven of the registry's 31, and nothing coined. `dismiss` appears on all fourteen designs.

| # | Design | Modules | Note |
|---|---|---|---|
| 1 | Rule | `dismiss` | — |
| 2 | Split | `dismiss` | the 24 px row-break threshold is CSS, not a measurement |
| 3 | Badge | `dismiss` | the whole-bar tap target is an `<a>` |
| 4 | Two-Line | `dismiss` | the 900 px re-arrangement is a media query |
| 5 | Capture | `member-form` · `dismiss` | `dismiss` alone when members are off in Ghost |
| 6 | Countdown | `countdown` · `dismiss` | the sentence names the deadline, so the bar survives the clock |
| 7 | Dateline | `dismiss` | `published_at` and its three lengths are server-rendered |
| 8 | Ticker | `marquee` · `dismiss` | static row is scrollable, so 2.2.2 has nothing to pause |
| 9 | Rotator | `rotator` · `dismiss` | the hidden `<ul>` survives; the dots go with the module |
| 10 | Pill | `dismiss` | Sticky is `position: sticky` over a spacer that stays |
| 11 | Toast | `slide-in-card` · `dismiss` | degrades to a static card at the end of the page |
| 12 | Takeover | `dismiss` | scrim, crops and the type step-down are all CSS |
| 14 | Edge | `accordion` · `dismiss` | owner's ruling: the hand-built `<button aria-expanded>`, so the disclosure needs script; the registry owes the variant |
| 15 | Triple | `dismiss` · `rotator` (below 768) | owner’s ruling: the phone band cycles its notices, five seconds, crossfade |

**Modules A2 deliberately does not use.** `header-scroll` (the header's, and the source of the sticky offset A2 contributes to), `nav-drawer`, `reveal`, `count-up`, `confetti`, `typewriter`, `carousel` — 9 Rotator's archetype is a carousel and its module is `rotator`, which is the registry's name for the same thing in a bar — and the twenty-two others. Nothing in A2 animates on scroll, counts up, or reveals.

---

## Findings for the architect

Four were recorded across the earlier passes; the reconciliation patch closes one and re-records its gap as an upgrade path.

1. **Retired with the design — 13 is cut.** The finding was that 13 had no module that fits. The owner's ruling closes it by removing the design rather than the gap: `dismiss` was the nearest module and the wrong idea, because dismissing makes a bar go away while a consent choice has to be recorded and honoured on the next visit. **A2 no longer waits on a `consent` module**, and a site that needs a consent bar uses Ghost's code injection. The number 13 is retired: not closed, not renumbered, not reused.
2. ~~14 Edge's markup and its module disagree~~ — **closed by the owner, patch pass two: the hand-built `<button aria-expanded>` wins and `accordion`'s `<details>`/`<summary>` compilation gives way for this design.** What is left is the architect's and is not a disagreement: **the registry owes an `accordion` variant that compiles to a button, or a separate entry for it.** No name is coined here. Two consequences are written into the design: Hover and focus is now a real value at every state, and Edge is no longer script-independent — without script the bar renders open with no chip.
3. **15 Triple's module set changes with width** — **reopened by the owner's ruling, patch pass two, and recorded rather than argued.** `dismiss` runs at every width; `rotator` runs below 768. This is what the earlier pass closed the finding by removing, and the ruling reverses it deliberately: the phone band cycles. The reading that keeps it inside Part A·A8 is written into the design — a module shared is not a design handed off — and it is the architect's to confirm.
4. ~~15 Triple draws less of the shared list than its siblings, and less again on a phone~~ — **closed by the owner, patch pass two: the list stays shared and nothing is capped, mirrored or forked.** Notices past the slot count are hidden and are drawn again when a higher slot count is chosen; a bound six-post list is three titles on a desktop and the same three in turn on a phone. Per-design cap, slot-following count and a second list are all refused.

---

## Reconciliation notes

> **Historical.** This section records the third pass, written when the category held fifteen designs. **Design 13 has since been cut and its number retired**; the counts and the Consent → Notice entries below are the counts and rulings of that pass, kept as the record of how the category got here rather than rewritten to match the present. The current state is §0, the design sections above, and the closing patch notes.

**Frames changed in this pass.** All fifteen control-panel frames (Preview as removed; the universal trio added outside the list — Ground rows relabelled Background role and Height rows relabelled Vertical spacing and moved into it, locked with reasons on the six fixed-height designs; Schedule and Shows on added to Visibility; footer counts updated). Section frames redrawn or added where visible content changed: **A2-7** (Meta control redrawn with Latest post title (linked) and a real Custom date; new "Out now" frame) · **A2-8** (Separator row is now an icon slot; Source + P0·5 Data panel on the Messages list; new bound-to-posts strip frame) · **A2-9** (Source + Data panel; new bound frame) · **A2-11** (Icon slot row; new icon-on card frame) · **A2-12** (Content source + Data panel; Image-focus note; new bound-band frame) · **A2-15** (Source + Data panel; new bound-band frame) · **A2-5** and **A2-6** (panel notes only: audience default, expiredCtaUrl) · **A2-13 redrawn wholesale as Notice** (file renamed from "A2-13 Consent.dc.html" to "A2-13 Notice.dc.html"; Accept/Decline removed; dismiss added; ARCHITECT: registry addition frame drawn). No other section frame moved.

Conflicts between this patch and what the category had already ruled, one line each:

1. **Height vs Vertical spacing.** All nine Height rows used the universal value names and are ruled to *be* Vertical spacing (merged, §0); the px ladders survive as the values' meanings, and the six designs that had no Height now lock the universal row for the same reasons they had none. Notice's Padding was the literal duplicate the patch names and is removed.
2. **Ground vs Background role.** Every A2 Ground was the universal control under a local name — merged with value sets, defaults and disable-with-ratio rules intact. The "ground is identity" lock applies only to A2·14 Edge (the accent rule *is* the design); the other fourteen grounds were already real choices — drawn defaults, not identities — so nothing else locks. Edge's Open ground is a different control and stays.
3. **Top divider locks None on all fifteen.** A2 is the first element in the body (or a bottom-anchored float); the seam it could draw does not exist. The seam *below* stays the grounds-and-hairlines rule's, and A2·2's bottom-edge Divider is renamed **Divider under** rather than removed — the A1 precedent, different edges, both real.
4. **Preview as existed on thirteen panels and is removed from all of them** (Edge and Triple never drew one); the `audience` control — the PRD's Member Visibility — stays. The old category text's dashed-outline preview treatment is superseded by the editor's View as plus P0·4's 40% ghost and pill.
5. **Schedule narrows an old absolute.** "The bar is present at page load" reasoning stands per render, but visibility is now date-conditional; the degradation is stated as owner-accepted — server-evaluated dates go stale under page caching, and the panel says so rather than pretending otherwise.
6. **Shows on narrows another.** "On every template" was placement doctrine; it is now the default value of a control, not an invariant. One A2 per site is unchanged.
7. **The posts source honours A2·3's old refusal.** Badge's spec ruled "no silent Ghost lookup — a future design wanting latest-post data needs a declared field"; the binding arrives exactly that way: a declared Source on the shared list with the P0·5 panel, and a declared Meta value on Dateline. Badge itself stays unbound.
8. **Dateline.** "Custom text is the default so no site gets a date it did not ask for" stands. Custom date becomes a real Date Picker value (it was free text); Latest post title (linked) joins on the same binding; the visitor's-browser date is deferred by owner ruling — the same ruling A1's date carried — and "today" is never server-rendered.
9. **Ticker's separator.** Dot · Slash · Wide space becomes an icon slot; the drawn dot survives as the default point icon at Small in the Muted role, so no resting strip was redrawn — only the panel row and the new bound frame.
10. **Countdown.** `expiredCtaUrl` is added; the old spec itself noted `expiredCtaLabel` could only reuse the live URL, so this closes a gap the spec had flagged. Empty URL → the expired state renders no button, per the dead-button floor.
11. **Capture.** `audience` defaults to Logged out — the drawn panel already showed it; the spec now says it. The error line's "fixed copy, not a field" ruling is reconciled with the no-fixed-strings rule as a theme translation-catalog string: locale-editable, never per-site free text, still matching what the API rejected.
12. **Toast.** The icon slot defaults off, so every resting frame stands; one new frame shows it on. Escape-ownership and the live-region rules are untouched.
13. **Consent → Notice.** The owner's ruling ends the standoff the old spec recorded from both sides (a legal surface the theme cannot honestly wire). Accept only's disable, the equal-weight rule, the forced-Everyone audience, `askAgainAfter`, `ctaLabel`/`secondaryLabel` and `policyUrl` retire with the buttons — the policy link now lives inline in `message` via the P0·1 link popover. `dismissible` and `audience` return; `dismissMemory` replaces `askAgainAfter` (default Never comes back). The honesty line survives verbatim. The old finding 1 closes; the upgrade path is recorded as ARCHITECT: registry addition (`consent`).
14. **The #453E35 flag count drops to two.** Notice no longer needs the invented dark border step (the Decline outline is gone); A2·9's and A2·13's earlier contexts stand as recorded history, A2·9's as a live need.
15. **Member Visibility is subsumed, not added.** The patch's rule adds it to CTA-bearing designs "unless a richer member-state model already subsumes it" — A2's category-wide `audience` control is exactly that model, so no design gains a second member control; Capture's `member-form` continues to use the P0 member-aware machinery.
16. **Inline editing confirmed everywhere** against rule 4: every authored text takes the P0·1 toolbar (message with bold + one link, now with new-tab/rel in the popover), buttons edit label and link inline, and the bound-mode texts (post titles, `published_at`) are plain-text-locked with "Edit in Ghost" — the one place editing is refused, by design.
17. **Fixed strings reconciled** per rule 5: the spec now names, per string, which ship as editable fields with defaults and which as translation-catalog strings (§0). No visitor-facing English ships uneditable.
18. **Button icons** (P0·2, before/after, Small, label-coloured) are available on every A2 button; the accent-budget rule is unaffected because button icons inherit the label colour — recorded so the budget's "once per bar" arithmetic stays honest.
19. **The 6-control norm is lifted** where this pass adds controls; every panel stays within the PRD's ~15 plus the universal trio, Visibility and Data. Footer counts on the panels were rewritten to the new arithmetic.
20. **Zero items and the bound list agree.** A bound list with zero published posts does not render the section — the P0·5 zero rule and the category's zero-items floor are the same rule seen from two sides; stated once here.
21. **A2-0 Category Proof is now partially historical.** Its shared field list, its "Preview as" mention and its Consent findings predate this patch; this spec supersedes it, and A2-0 is kept as the drawn record of the earlier settlements rather than redrawn.

## Patch notes — design patch pass

> **Historical.** Written when the category held fifteen designs, one of which — 13 Notice — has since been cut. Its counts are that pass’s counts.

Frames updated: `A2-0 Category Proof`, `A2-3 Badge`, `A2-5 Capture`, `A2-7 Dateline`, `A2-15 Triple`.

| Rule | Change |
|---|---|
| A8 | **All hand-offs withdrawn.** A2·3 hides the badge; A2·7 hides eyebrow and date; A2·8 and A2·9 draw one message static at the floor; **A2·15 draws slot one alone below 768** and hides slots two and three — owner's ruling this pass, 77 px against the stack's 212. The rejected all-three stack is kept on the frame at 62%. A2·15's module set no longer varies by width (finding 3 closed). |
| A2 | Remove is active at the floor in all three list designs, with the category's floor sentence. |
| A5 | Message counts are pickers, 1–6; **Slots is a picker capped at 3** with the reason drawn in the panel. |
| A6 | Universals may narrow with a reason, never rename or extend; swatch row is **Base**; no "Inherit" anywhere in A2. |
| A9 | The two conditional notes added to every member ask (nine designs), drawn once in `A2-0`. |
| A10 | **A2·5 draws the no-JavaScript notice** (slim variant) in place of its field, at the band's height, close kept — new frame. Its four working states are untouched. |
| A1 | Not applicable: A2 renders no person. |
| B5 | Ctrl-K unbound; nothing in A2 bound it. |
| A7 | **[Free]: 1 Rule and 2 Split**, marked in the roster as a suggestion. |

### Open questions

1. ~~A2·15's stacked height.~~ **Closed by the owner**, then **superseded by the owner in patch pass two** — the phone band is one slot that *cycles* its notices at five seconds, so what follows is the no-script and reduced-motion floor rather than what every phone reader sees. As closed at the time: slot one draws alone below 768 and slots two and three do not draw — 77 px, against 212 for the stack. The stack is kept on the frame at 62% as the rejected alternative. **Consequence recorded:** authored order now decides what a phone reader sees, and the sidebar states it beside the count of items kept and not drawn.
2. ~~The floor sentence's second clause.~~ **Closed by the owner:** one clause only — **"A bar needs at least one message."** No floor sentence in the library points at another control.
3. ~~A2·5's disabled field controls.~~ **Closed by the owner:** they stay in the panel, disabled with the reason.

**Housekeeping, patch pass two.** All three items above were already struck through and attributed when this pass opened, so none of them was indistinguishable from a live question and none needed converting. **Nothing in this list is open.** Two items elsewhere in this document are genuinely unresolved, and both are the architect's rather than the owner's — finding 2 (14 Edge's `<button aria-expanded>` against `accordion`'s `<details>`/`<summary>`) and finding 4 (15 Triple drawing less of the shared list than its siblings), under **Findings for the architect**. They are left exactly as written; this pass answered neither.

## Patch notes — member-ask pass

> **Historical.** Written when the category held fifteen designs, one of which — 13 Notice — has since been cut. Its counts are that pass’s counts.

Frames updated: **all fifteen design frames** (`A2-1 Rule` through `A2-15 Triple`) and **`A2-0 Category Proof`**. Nothing was restyled and no frame moved: each control panel gains a **Member ask** block above the Visibility group, each spec card gains a one-line version of it, and A2-0's member-ask section gains the enumeration and the settings sentence.

**What the previous pass had already done, confirmed and not redone.** By rule name, never number:

| Rule (by name) | State before this pass | This pass |
|---|---|---|
| Avatars with no photograph | Satisfied — not applicable; A2 renders no person | Confirmed, unchanged |
| The remove button never greys out | Satisfied — Remove active at the floor in all three list designs, answered with "A bar needs at least one message." | Confirmed, unchanged |
| Slider labels | Satisfied — Vertical spacing keeps Compact · Comfortable · Spacious | Confirmed, unchanged |
| Gap names are Tight · Normal · Loose | Satisfied — A2 draws no gap control, so nothing to rename | Confirmed, unchanged |
| Item counts are a number picker | Satisfied — Messages 1–6 pickers; Slots a picker capped at 3 with its reason | Confirmed, unchanged |
| A design may offer fewer choices, and must say why | Satisfied — the trio narrows with stated reasons; the swatch row is **Base**; no "Inherit" anywhere | Confirmed, unchanged |
| The two free designs are the owner's choice | **Partly** — 1 Rule and 2 Split were marked as a *suggestion*; the owner had not ruled | **Ruled: 1 Rule and 2 Split**, written in the shape the merge reads |
| No design ever turns into another design | **Partly** — the render-time hand-offs were withdrawn from the designs, but six sentences elsewhere still named one design as another's state | **Six leftovers cleared** (listed below); one case refused rather than guessed |
| Member buttons are conditional, and the sign-up pop-up needs JavaScript | **Partly** — drawn once, category-wide, in A2-0 | **Applied per affordance**, in fourteen panels, fourteen spec cards and fifteen spec sections |
| The no-JavaScript notice | Satisfied — A2·5 Capture is the only design with a field and draws P0·4's slim notice at the band's height, close kept; its four working states untouched | Confirmed, unchanged, and now also stated in Capture's Member ask field |

**Changes in this pass.**

| Rule (by name) | Change |
|---|---|
| Member buttons are conditional, and the sign-up pop-up needs JavaScript | **Every design now carries a Member ask field**, and every panel a Member ask block. Each names its own affordance, what happens when the ask is withdrawn, that Ghost's Portal needs JavaScript, and **which settings make it render** — members on and signup open for a free ask, plus a payment provider connected and a live paid tier for a paid one, members on alone for a sign-in link. |
| Member buttons are conditional, and the sign-up pop-up needs JavaScript | **The count of nine is corrected to fourteen.** Nine designs have an action of their own (1, 2, 3, 4, 5, 6, 10, 11, 12); five more can carry an ask through a link the old count did not reach — the per-item message links on 8 Ticker, 9 Rotator and 15 Triple, 7 Dateline's Meta: Link, and the link inside 14 Edge's open bar. **The notes attach to the affordance, not to the design.** 13 Notice is the only design with no ask, and now says so. |
| Member buttons are conditional, and the sign-up pop-up needs JavaScript | **Three designs where the ask has a second consequence, now stated:** 9 Rotator (a no-script reader sees item 1 only, so an ask in position 1 is an ask that cannot be answered), 15 Triple (below 768 only slot one draws, so an ask outside it is invisible on a phone), 11 Toast (with script off the card is a static block near the page end, so an ask there is doubly inert). |
| The no-JavaScript notice | Confirmed only. A2·5 is still the only design with a field; the notice, its height and its close are as drawn, and focus, invalid, submitting and success stay Ghost's own script. |
| No design ever turns into another design | **Six leftover sentences cleared**, all of them prose the earlier pass had not reached: **5 Capture**'s intro, descriptor and Data field (members off no longer "renders as A2·2 Split" — the field goes, the band stays, which is what its own frame already draws); **1 Rule**'s Items field ("Ticker and Rotator render *as* this design"); **3 Badge**'s Items field ("Triple at one item renders as this design"); **8 Ticker** and **9 Rotator**'s Data and Empty-state fields ("renders as A2·1 Rule with item 1" → each draws its single notice and stays itself, with A2·1 offered as *advice*); **14 Edge**'s four references to its open state as "A2·1 Rule" (it draws that arrangement itself). |
| No design ever turns into another design | **The last hand-off is closed by the owner's ruling:** 6 Countdown with no `endsAt` draws no clock and stays itself. **No A2 design names another design as a state, in any field, at any width.** |
| The two free designs are the owner's choice | **Ruled: 1 Rule and 2 Split.** The line the merge reads is present in §0 — **[Free] designs:** 1 Rule · 2 Split — and the roster mark is now a ruling rather than a suggestion. |

**Not touched, as instructed:** the visual language, type scale, colour packs and spacing system; the sent, error, loading and success states on the member form; every design's numbering.

### Owner's rulings, this pass

1. **The two free designs are 1 Rule and 2 Split.** Ruled, not suggested. The line the merge reads is in §0 and the roster mark in A2-0 now says *ruled* rather than *suggested*.
2. **The sign-up notes appear on every link that can carry an ask, item links included** — the fourteen-design reading, not the old nine. The three list designs state it per item in their repeaters.
3. **6 Countdown with no deadline set: the clock does not appear and the bar stays itself.** Sentence and action hold the band at 44 px, as at *Keep, drop clock*; the sidebar says the clock is waiting for a date. The old hand-off to A2·2 Split is withdrawn, and no open question remains in this category.

**No open questions remain in A2.**

### Confirmations

- **The design numbering is unchanged: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15** — fifteen designs, no gaps in this category, nothing renumbered, no number reused.
- **The "[Free] designs:" line is present** in §0, on its own line, naming **1 Rule** and **2 Split** — both exist in this category's roster.

— End of specification —

---

## Patch notes — declarations standardised, 31 August 2026

**Declarations standardised.** Every design's **Controls** field is now a table — `| Control | Values |`, one row per control — in the shape Headers, Announcement Bars and Footers already used. The Control column carries the **name only**: never a value, never a sentence, never a reason. The Values column carries the choices separated by " · "; a number picker states its range and default; an on/off reads "On · Off"; a control that is offered but **locked on this design says so in its Values cell, with the reason** ("Contrast (locked — …)"). The **universal controls sit in the same table, marked "(universal)"** — Background role, Vertical spacing and Top divider — each carrying this design's own resolution, lock or disablement where it has one, and any Data-group control this design's own list named is marked "(data)".

**Prose kept, moved.** Every sentence already written *about* the controls — the reasons, the refusals, the "no such-and-such control" notes, the Quick Controls line, the counts and the cuts — is kept verbatim and now sits **after** the table rather than inside the list. The table is the declaration; the prose is the reasoning.

**Nothing else changed.** No frame, no visual design, no wording of any control, no control's values, no design's set of controls, no free-design choice, no data binding, no accessibility note. This entry writes down what was already true in a form a tool can read.

**Design numbering unchanged:** fifteen designs, numbered **1–15**.


---

## Patch notes — the Actions split, 31 August 2026

Frame updated: `A2-11 Toast` — the one design in this category whose Actions control carried a compound value. Nothing renumbered, renamed or redesigned.

| Rule (by name) | Change |
|---|---|
| One toggle per thing — no compound values | **Actions becomes a labelled group of one toggle per action:** **Button: On · Off** and **Link: On · Off**, each opening its own P0·4 member-aware card. **Both off is the old None**, and *Button + link* is both on. The old four-value list is gone. Canonical definition: **P0·4a**; the owner scheduled the library-wide split on 31 August 2026. |
| One toggle per thing — no compound values | **Not applied to the other four designs.** `Action: Button · Text link · None`, `Arrow link · Button · None` and `Button · Arrow link · None` are a **form** — one thing with several settings, plus its absence — and the rule explicitly leaves those as one control. Checked design by design; nothing else in A2 changed. |

**Collateral, and repaired in the same pass.** The scripted edit that replaced the Actions row on `A2-11 Toast` over-reached and took the **Body text** and **Width** rows and the **universal block's heading and Background role row** with it. All four were restored from this specification's own control table (Body text: Show · Hide; Width: Narrow 320 · Medium 380; Background role: Surface · Contrast) and the panel's markup was re-balanced. Recorded because a reader comparing this panel against an older screenshot will see those rows re-authored rather than untouched.

---

## Patch notes — design patch pass two, 31 August 2026

Frames updated (two rulings arrived mid-pass and are folded in here): **`A2-14 Edge`** (a disclosure block in the panel recording the hand-built ruling, its gain, its cost and the architect item; the member-ask and accessibility notes reworded off `<details>`) · **`A2-15 Triple`** (the phone band redrawn as a cycling one-slot band with indicators, a new four-band strip showing turns one to three and the no-JavaScript floor, and the declared-width, Vertical-spacing, Visibility, member-ask and spec-card notes rewritten) · **`A2-0 Category Proof`** (roster header, roster row 13, the stacking rule, the lead paragraph and its roll-call, the shared field list — count, plus `secondaryLabel`/`secondaryUrl`, `policyUrl` and `askAgainAfter` marked retired, since all three existed for 13 alone — the member-ask paragraph, a *superseded* marker on the one settlement that stated a live stacking rule, and a patch block recording the cut) · **`A2-11 Toast`** (its three references to the cut design) · **`A2-15 Triple`** (the declared width and both no-JavaScript states, in the panel and on the spec card) · **all fourteen design frames** (the eyebrow count and the Visibility group's heading, 15 → 14). Frame deleted: **`A2-13 Notice.dc.html`**. Nothing was restyled, no frame moved, no control changed, no design renumbered.

| Rule (by name) | Change |
|---|---|
| Owner's ruling — design 13 is cut | **13 Consent/Notice is deleted**: the frame, the specification section, the roster row, the structural-descriptor row, the module-roster row, and every cross-reference in 11 Toast and in the category rules. The reason is recorded rather than paraphrased away: no behaviour module covers a consent bar, and the nearest one — `dismiss` — is the wrong idea, because dismissing makes a bar go away while a consent choice has to be **recorded and honoured on the next visit**. A bar that forgets is a consent bar that does not work. A site that needs one uses Ghost's code injection. **The number is retired**: the gap is not closed, nothing is renumbered, 13 is never reused. Finding 1 retires with the design; A2 no longer waits on a `consent` registry addition. |
| A design may declare the width below which its script runs | **A2·15 Triple declares "collapses into sections under 768"**, and its no-JavaScript line covers **both sides** of that width: at 768 and above the whole band renders — two or three slots, dividers, labels, per-slot links — and only the close is hidden; below 768 the first notice draws alone with its label and its sentence wrapped in full, the cycle does not run, and the close is hidden. Written into the design's Behaviour module field, into the control panel as a declared-width block, and onto the spec card. **The declaration names a real script boundary** after the owner's ruling below: `rotator` runs under 768 and nothing but the close runs above it. |
| A control switched off by another is greyed, with the reason beside it | **No subject in this pass.** Every A2 control that another switch turns off is already drawn greyed with its reason at the control: Vertical spacing locked on the five fixed-height designs, Top divider locked None on all fourteen, Edge's Chip: None disabled, Split's Ground values disabled with their measured ratio, Triple's Slots and Dividers inert below 768. Nothing was hidden and nothing accepts a value it will not honour. No control was added or removed here. |
| The remove button never greys out | **Confirmed, unchanged.** Remove stays visible and fully active at the floor in all three list designs, answered with **"A bar needs at least one message."** The cut design carried no repeater, so nothing about the floor moved. |
| A count that picks between drawn layouts is a named set, not a number picker | **Confirmed, unchanged.** Messages stays a 1–6 number picker; Slots stays a number picker capped at three with its reason. Neither was converted. |
| Avatars with no photograph show initials | **No subject.** A2 renders no person, at either initial form. |
| Ghost 6 strips `<em>` and `<strong>` from a feature-image caption | **No subject.** No A2 design renders a feature-image caption; the category's rich text is `message`, which is authored content in the section's own field, not Ghost's caption. Recorded so the next reader does not have to check. |
| A comment count renders nothing without JavaScript | **No subject.** No A2 design reads a comment count, and no catalog string in the category names one. |
| Printed design totals stay out of product copy | **Untouched, and one judgement recorded.** A2 has no marketing or app copy and prints no library total. The per-frame eyebrow "DESIGN 11 OF 15" and the panel heading "shared by all 15" are the *category's* own count on a design-library artefact, not a product-copy total, and the cut made them wrong — they now read 14, matching the A4 precedent, where a category of seventeen numbered 1–14 and 16–18 counts seventeen. If that reading is wrong, the fix is one pass over fourteen eyebrows. |
| P0's per-prop mark allowlist | **Not touched.** This pass did not open P0. |
| Owner's ruling — 14 Edge uses the hand-built disclosure | **`<button aria-expanded>` wins; `accordion`'s `<details>`/`<summary>` compilation gives way for this design**, and the library rule that the registry is the authority on module mechanics is overridden here by name. **Finding 2 closes.** Two consequences are written into the design rather than left to be discovered: **Opens on: Hover and focus is now a real value at every state** — it was the one thing `<details>` could not carry — and **Edge is no longer script-independent**, so its no-JavaScript state is specified as the bar rendering **open, with no chip** (a chip that cannot be pressed is the dead control the category already refuses). **ARCHITECT:** the registry owes an `accordion` variant that compiles to a button, or a separate entry; no module name is coined. |
| Owner's ruling — 15 Triple keeps one shared list | **Nothing is capped, mirrored or forked.** Notices past the slot count are hidden when a lower slot count is chosen and drawn again when a higher one is — which is what the design already did, now ruled rather than inferred. Per-design cap, slot-following count and second list are all refused. **Finding 4 closes.** |
| Owner's ruling — 15 Triple cycles on a phone | **Below 768 the band is one slot and its notices cycle: a five-second hold, a crossfade in, looping**, with **A2·9’s inline “1/3”** as the indicator — the owner’s pick over dots, which keeps the band at 77 px. Unlike A2·9’s, this one is **pressable**: it is the only indicator on a band with no hover, and WCAG 2.2.2 needs a stop while reduced motion needs a way to reach notices two and three. *That divergence is flagged as mine.* The set that cycles is the set the slot count draws, in authored order, so **every drawn notice now reaches a phone reader** — the previous ruling's single static slot did not. That earlier ruling is **superseded, not deleted**: it survives as the no-script and reduced-motion floor. **Finding 3 reopens** — `rotator` runs below 768 and `dismiss` at every width, so the module set varies by width again, which is exactly what the earlier pass closed it by removing. The Part A·A8 reading is written out rather than assumed: Triple's phone band keeps its own label, ground and close and draws no dot rail at the right end, so a module shared is not a design handed off. |

### Owner's rulings, patch pass two

1. **14 Edge is the hand-built disclosure.** `<button aria-expanded>`, not native `<details>`.
2. **15 Triple keeps the one shared list**, hiding and re-showing notices as the slot count changes.
3. **15 Triple cycles below 768** — five seconds, crossfade, looping, indicated by A2·9’s inline “1/3” rather than dots.

**Three things the rulings did not settle, and none is guessed here.** Each is written into the design as specified with the alternative named, or left to the architect: the **no-JavaScript state of Edge** (specified as the open bar; **OPEN FOR THE OWNER** — the alternative is not rendering at all, which keeps the four-pixel promise and costs that reader the message); the **stop mechanism for Triple's phone cycle** (WCAG 2.2.2 requires one, so A2·9's indicators were reused rather than a new control invented — **since ruled by the owner: the inline "1/3" Numbers**, which keeps the band at 77 px, and which this design makes pressable where A2·9 does not); and the **registry entry for a button-based disclosure**, which is the architect's and where no name is coined.

**Housekeeping — the Open questions section.** All three items were already struck through and attributed to the owner before this pass; none was indistinguishable from a live one, so none needed converting and none was answered here. A line was added saying so, and naming the two items that *are* still unresolved — findings 2 and 14 Edge's markup, and finding 4 and Triple's share of the shared list — both of which are the architect's call, both left exactly as written.

**Left alone deliberately, and why.** Three passes of history in this document — the reconciliation notes, the design patch pass, the member-ask pass — count fifteen designs and record the Consent → Notice rename. They are the record of how the category reached its present state, and rewriting them to match today would hide the ruling instead of recording it; each now opens with a one-line note that it is historical and that 13 has since been cut. **A2-0's four settlements** likewise still discuss Consent as an open question of the batch that drew it; the same reasoning applies, and A2-0's new patch block says so. If the owner wants that history flattened, it is one message.

### Confirmations

- **The design numbering is unchanged: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15** — fourteen designs, the gap at 13 left open, nothing renumbered and no number reused. The two rulings above changed behaviour on 14 and 15 and touched no number.
- **The "[Free] designs:" line is present** in §0, on its own line, naming **1 Rule** and **2 Split** — both of which exist in this category.
