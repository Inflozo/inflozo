---
title: Derived fields — categories A1–A12
created: 2026-08-21
purpose: the four per-design fields missing from the first 12 exported categories, derived from the export's own text
---

# Derived fields — A1 Headers through A12 About and Team

## What this is

The first 12 categories were designed with a prompt that asked for six of the ten fields the
reconciliation pass checks (`sections-inventory.md` §"What each design carries"). The four missing —
**Descriptor**, **Archetype**, **Structural descriptor (tuple)** and **no-JS degradation** — are
derived here from the 12 spec files in `claude-design-export/unpacked/`, one full read per category.
Categories 13 onward carry all ten natively (`claude-design-prompt-3-library.md` is corrected).

**Nothing here is invented.** Where the spec's text supports a derivation, it is written; where it
does not, the entry says **NEEDS DESIGN ANSWER** and why. Where a slot rests on an inference (a
first-listed control value taken as the default, an icon position implied by a sibling design's
vocabulary), a Notes line says so. When a design answer arrives, replace the NEEDS DESIGN ANSWER
entry in place.

**Supersede rule.** When the owner re-runs a category's patch prompt and Claude Design writes the
four fields at the source, those authored entries **replace this file's derived ones for that whole
category** — the source has design context a derivation does not. On landing: normalise the incoming
tuples into the closed vocabulary below (same meaning, this file's words), then re-run
`tools/tuple-check.py` — uniqueness must be re-proven for a re-authored category, never assumed to
carry over.

> **Schema decision taken 2026-08-21** (owner, option 1 of 3, recommended): the tuple is six slots —
> the dead `primary axis` slot swapped for `containment`, plus `ground` — and every tuple in this
> file is rewritten to it, containment and ground derived from the specs per design. Supersedes
> resume when a re-run category's export lands on disk; A1's is authored in Claude Design and
> pending export.

These fields merge into `sections-inventory.md` with the rest of each design's specification when
the specs land there (build-sequence step 3→4). Until then this file is their home.

## The tuple vocabulary

FR-G5's uniqueness assertion runs on the tuple, so its slots use closed sets — the same sets
categories 13+ should use. Six slots since 2026-08-21 (owner decision):

| Slot | Values |
|---|---|
| archetype | grid-of-N · split · stack · bar · nav · edge rail · overlay · feed · form · carousel · table · media frame · sticky · article body |
| containment | none (in flow, no wrapper) · card (inset panel, own plane) · box (hairline border, no plane) · pill (detached capsule) |
| ground | page (the page's own) · surface · contrast · image · transparent (none of its own) · accent |
| item-count class | none (no repeating unit) · one · few (2–4) · many (5+) · variable (author-set) |
| media placement | none · left · right · top · bottom · background · inline · edge · full-bleed |
| emphasis mechanism | free phrase, ≤ 4 words, naming the design's one distinguishing device |

Containment applies to the section as a whole: per-item cards inside a bare section are the item's
geometry, so the section reads `none · page`. Ground is the drawn default where a control can flip
it. The former `primary axis` slot is gone — measured across all 186 designs it did distinguishing
work twice, and `ground` covers one of the two; the schema records what separates designs, not what
describes them.

**What the machine check promises, stated plainly:** it checks structure, containment and ground.
Anything past that is the emphasis phrase and a human's judgement — two designs whose closed slots
match are distinct only if a person agrees the emphasis names a real structural device.

A tuple must be unique within its category. `python3 tools/tuple-check.py` verifies uniqueness,
vocabulary and per-category numbering for this file and exits non-zero on drift; `doc-audit.py
--check` runs it. **The closed sets in tuple-check.py are the authority; this table describes
them.** The category prompts teach the same sets and their generator refuses to emit prompts that
disagree with the gate — so changing a set is a two-file change: edit tuple-check.py, regenerate
the prompts. The closed slots take their values bare — `few`, never `few (2–4)`; the glosses in
the table are explanation, not tuple text. The emphasis slot is deliberately open.

## What needs a design answer

Every gap below is also marked on its design. Grouped by root cause — a few answers resolve most of
the list. Umang answers these; the entries are then edited in place.

**1. The email/subscribe form without JavaScript** — one shared component (A3·4's one-row form), one
answer. The specs give in-place error/submitting/success states but never say whether the form
posts natively (and what a no-JS submission renders) or is script-only. Affects: A2-5 Capture,
A3-4 Newsletter Band, A4-11 Subscribe, A6-6 Inline Form, A6-14 Members (inherits A6-6).

**2. Disclosure components without JavaScript** — §0 of A1 defines every dropdown, More menu, drawer
and takeover as a `<button aria-expanded>`; no design states a no-JS fallback, so mobile nav
reachability is underivable across all 16 headers. Acute: A1-6 Drawer-First (site has no navigation
at all without JS), A1-4 Overlay (no nav and no actions at ≤767), A1-9 Search-Forward (search is the
design; no non-JS submit route). The same question — is `hidden` in the served markup or applied by
script? — blocks A3-2, A3-3 and A3-8's mobile accordion. A9's accordions state their served markup,
so they derive (closed rows, answers unreachable) — but whether that lock-out is *intended* is worth
the same answer.

**3. A7's cadence switch resting state** — §0 never names which cadence renders at Billing period
Both, so the static prices a no-JS reader sees are underivable in A7-1 through A7-14. One answer
(the default resting cadence) resolves all fourteen. A7-15 Both Prices is exempt and is the
category's own no-JS answer.

**4. The reader-scrolled rail and the marquee** — A11-9 Rail's core degradation derives (native
overflow container), but its end-fade mask and measured hand-off to 1 Row do not; A12-13 Rail is
A11-9 "carried over verbatim" and shares the answer. A11-8 Marquee's transport (CSS animation or
script?) and its mandatory pause control have no stated no-JS state.

**5. Singles.** A2-6 Countdown (frozen digits or suppressed clock?), A2-8 Ticker (motion and
mandatory pause without script), A2-11 Toast (is the markup hidden or shown before the trigger
fires?), A2-13 Consent (answer-recording mechanism — inert buttons would leave an unremovable bar),
A4-10 Video Poster (no non-JS fallback for the play dialog), A4-14 Full Height (scroll cue has no
anchor fallback), A6-14 Members (Portal fragment links open nothing without Ghost's Portal script),
A9-7 Index (sticky mechanism unstated), A9-11 Tabs (≤767 hand-off mechanism unstated), A3 §0
(the site-wide Back-to-top control is on every footer's sidebar but specified nowhere), A1's
dark-mode toggle (A1-1, 8, 14) and member menu (A1-14).

## Near-collisions worth a look at reconciliation

No two tuples collide. But the recurring **Contrast Band** design shares every slot except emphasis
with its category's base design, and in A9 and A12 the spec itself says the DOM is identical —
the band is the entire difference. A3-5/10/12 (three grid variants), A6-13 vs A6-4, A6-14 vs A6-1
and A12-7 vs A12-1 are the same shape of near-miss, each carried honestly in its Notes line rather
than wordsmithed apart. FR-G5 holds on the tuple as written; whether "same DOM, different ground"
should count as a distinct design is a judgement the reconciliation pass can make once, for all of
them.

---

## A1 Headers & Navigation — derived fields (16 designs)

### A1-1 Rail
- Descriptor: Logo left, nav inline beside it, actions right, hairline under — the library's baseline, which every other design's sticky state falls back to.
- Archetype: nav
- Tuple: nav · none · page · few · none · hairline rule
- No-JS: NEEDS DESIGN ANSWER: dropdown/More panels and mobile drawer — top-level items are plain links and On-scroll has a designed Static state, but every disclosure trigger is a `<button aria-expanded>` (§0) with no stated no-JS or default-open fallback, so child items and ≤767 nav reachability are not derivable.

### A1-2 Split Rail
- Descriptor: Wordmark centred with the nav divided around it and utilities right — the same components on one axis of symmetry.
- Archetype: nav
- Tuple: nav · none · page · many · none · centred wordmark
- No-JS: NEEDS DESIGN ANSWER: More panel and mobile drawer (including its accordion, where opening one parent collapses any other) — scripted disclosure with no stated no-JS fallback; Re-form-left degrades to the designed Static state, but ≤767 nav and the drawer-pinned CTA are not derivable.

### A1-3 Stacked Masthead
- Descriptor: A masthead row (date, wordmark + tagline, actions) over a ruled nav row; the nav row detaches on scroll and carries the reading-progress rule — A1's one display moment.
- Archetype: stack
- Tuple: stack · none · page · many · none · display masthead
- No-JS: NEEDS DESIGN ANSWER: mobile drawer and child dropdowns — the 768–1023 nav rail is natively horizontally scrollable and sticky/progress degrade to the designed Static masthead (progress exists only on the pinned bar), but at ≤767 the rail shows two items and the rest live in the drawer, which has no stated no-JS route.

### A1-4 Overlay
- Descriptor: Rail's arrangement with no ground of its own, sitting on the first section's image and solidifying once the hero passes.
- Archetype: overlay
- Tuple: overlay · none · transparent · few · background · transparent over image
- No-JS: NEEDS DESIGN ANSWER: drawer and dropdown/More panels — scroll behaviour degrades to the designed Stay-transparent state and the no-image fallback to Rail is markup-level, but at ≤767 the bar is wordmark + toggle only with nav and both actions drawer-only, and the drawer has no stated no-JS fallback.

### A1-5 Floating Pill
- Descriptor: Rail's contents held in a capsule on surface, inset from three sides with the page ground visible around it — the only design with a shadow at rest.
- Archetype: nav
- Tuple: nav · pill · surface · few · none · floating pill
- No-JS: NEEDS DESIGN ANSWER: dropdowns and mobile drawer — Stick-and-narrow degrades to the designed Static state and pill links navigate, but nav and Sign in move to a button-opened drawer at ≤767 with no stated no-JS fallback.

### A1-6 Drawer-First
- Descriptor: No nav in the bar at any width — wordmark, labelled Menu button, one action, and a takeover holding the whole navigation at display size.
- Archetype: overlay
- Tuple: overlay · none · page · variable · none · display-size takeover
- No-JS: NEEDS DESIGN ANSWER: takeover — the entire navigation at every width sits behind a click-only `aria-expanded` Menu button and the spec offers no no-JS route to any nav item, so without JS the header is wordmark + one action and the site has no navigation.

### A1-7 Mega Bar
- Descriptor: Rail's bar with a full-width panel behind it — children in columns with descriptions, a grandchild group indented under any child that has one — with the resting bar as the primary frame.
- Archetype: nav
- Tuple: nav · none · page · few · none · full-width mega panel
- No-JS: NEEDS DESIGN ANSWER: mega panel and mobile drawer — the panel opens on click/Enter/intent-hover and closes by scripted rules with no default-open or no-JS state stated; parents with 0 children are plain links and navigate, but children and grandchildren are panel-only ≥768 and drawer-only ≤767, so they are unreachable without a stated fallback.
- Notes: Archetype judged nav, not grid-of-N — the resting bar is the declared primary frame and follows the nav ladder (cap held, drawer at 767); only the panel state stacks its columns like a grid.

### A1-8 Utility + Nav
- Descriptor: A 38 px utility strip above the main bar — secondary links, social, mode toggle, an optional editorial note — the first design to render Ghost's secondary navigation in the header.
- Archetype: stack
- Tuple: stack · none · page · many · none · utility strip
- No-JS: NEEDS DESIGN ANSWER: mobile drawer and mode toggle — strip and bar links are plain links and scroll states degrade to the designed Static state, but the `aria-pressed` toggle and the ≤767 drawer (which absorbs the whole strip as a labelled group) have no stated no-JS behaviour.

### A1-9 Search-Forward
- Descriptor: A persistent search field between the nav and the actions, taking the slack in the bar.
- Archetype: nav
- Tuple: nav · none · page · few · none · persistent search field
- No-JS: NEEDS DESIGN ANSWER: search field — the design's core is scripted (debounced queries against Ghost content, suggestion panel, two-step Escape) and the spec names no non-JS submit route or results page; nav links still navigate, but the ≤767 drawer also has no stated no-JS fallback.
- Notes: Archetype judged nav, not form — the collapse ladder is the nav's (nav to drawer at 767); the field only relocates to a second row.

### A1-10 Contrast Band
- Descriptor: Rail's arrangement on the `contrast` token; the structure is settled — the design is the answer to what the accent does on an inverted ground.
- Archetype: nav
- Tuple: nav · none · contrast · few · none · contrast band
- No-JS: NEEDS DESIGN ANSWER: dropdowns and mobile drawer — behaviour is Rail's (data "identical to Rail"): Sticky/Shrink degrade to the designed Static state and links navigate, but child items and ≤767 nav sit behind `aria-expanded` buttons with no stated no-JS fallback.

### A1-11 Side Rail
- Descriptor: A fixed 240 px column at the left — logo top, nav as rows, actions pinned to the foot — that changes the page's layout rather than sitting on top of it, and exists only at 1200 and wider.
- Archetype: edge rail
- Tuple: edge rail · none · page · many · none · leading accent bar
- No-JS: NEEDS DESIGN ANSWER: child side panel (and, below 1200, Rail's dropdowns and drawer) — the panel's open/close rules (Escape, pointer leave, close on scroll) are scripted with no stated fallback; the fixed rail itself and the 1199 hand-off to Rail are layout, not behaviour, and top-level rows are links that navigate.

### A1-12 Boxed
- Descriptor: A hairline box aligned to the content column, so the nav's left edge is the headline's left edge.
- Archetype: nav
- Tuple: nav · box · page · few · none · content-aligned hairline box
- No-JS: NEEDS DESIGN ANSWER: dropdowns and mobile drawer — Stick-and-fill degrades to the designed Static state (transparent box with hairline, no fill needed at rest) and links navigate, but child items and the ≤767 drawer have no stated no-JS fallback.

### A1-13 Centre Nav
- Descriptor: Logo left, actions right, nav centred between them in a three-column grid.
- Archetype: nav
- Tuple: nav · none · page · few · none · centred nav
- No-JS: NEEDS DESIGN ANSWER: More/dropdown panels and mobile drawer — the ≤1024 re-anchor is a breakpoint layout change with no change to content or order and Shrink degrades to the designed Static state, but overflow items, children and ≤767 nav open from buttons with no stated no-JS fallback.

### A1-14 Icon Utilities
- Descriptor: Rail's bar with a bare-icon cluster at the right — search, RSS, dark mode, and the member's avatar — with the signed-in state as the primary frame.
- Archetype: nav
- Tuple: nav · none · page · few · none · bare icon cluster
- No-JS: NEEDS DESIGN ANSWER: member menu, dark-mode toggle and mobile drawer — all button-driven (`aria-expanded` / `aria-pressed`) with no stated no-JS state; the signed-in/out swap is data-driven rather than scripted, nav links and the RSS link navigate, and tooltips are cosmetic.

### A1-15 Big Type
- Descriptor: The wordmark at 64 px with the nav small and low beside it; suits a home page or an archive rather than a post.
- Archetype: stack
- Tuple: stack · none · page · few · none · oversized wordmark
- No-JS: NEEDS DESIGN ANSWER: mobile drawer (and any child dropdowns) — Collapse-to-bar degrades to the designed Static large state and the 24-character auto size step is an authoring-time rule, but ≤767 nav and Sign in are drawer-only with no stated no-JS route.
- Notes: Archetype judged stack, not nav — the written Responsive rule restacks content into rows at 1023–768 (nav drops to its own row) rather than only narrowing or folding; primary axis is horizontal as drawn at 1440.

### A1-16 Reveal
- Descriptor: Rail's bar, hidden while the reader goes down the page and back on any upward scroll — three states, and the design is the rules between them.
- Archetype: sticky
- Tuple: sticky · none · page · few · none · upward-scroll return
- No-JS: NEEDS DESIGN ANSWER: mobile drawer — without the scroll machine the header remains in its at-top in-flow state and never hides, which is the spec's own short-page presentation, and the hidden state anyway keeps the header in the DOM and tab order; but ≤767 nav is drawer-only with no stated no-JS fallback.

## Category summary
- Tuple collisions: none — eight designs share `nav · horizontal · few · none` (the spec itself declares Rail the baseline and derives A1-4, 5, 7, 10, 14, 16 from "Rail's bar/arrangement"), but each emphasis slot is a genuinely different device taken from the spec's own opening lines, so no two tuples are identical.
- Not recoverable: none.
- Needs design answer: all 16 designs, on one shared root cause plus three acute cases. Root cause: §0 defines every disclosure (dropdown, More, drawer, takeover) as a `<button aria-expanded>` component and no design states a no-JS or default-open fallback, so nav reachability at ≤767 (and child items at any width) is underivable in every design. Acute cases: A1-6 (whole navigation behind a click-only takeover at every width — no nav at all without JS), A1-9 (search is the design; no non-JS submit route stated), A1-4 (≤767 bar is wordmark + toggle only — no nav and no actions without JS). Also underivable wherever present: dark-mode toggle (A1-1, 8, 14), member menu (A1-14).

## A2 Announcement Bars — derived fields (15 designs)

### A2-1 Rule
- Descriptor: One line on the contrast band, optically centred, close at the right end — the baseline and the fallback for designs whose preconditions are absent; spends no accent.
- Archetype: bar
- Tuple: bar · none · contrast · none · none · contrast band
- No-JS: Renders as drawn and always shows; the close is inert without script — no 160 ms collapse, no per-browser dismiss memory, no scroll correction.

### A2-2 Split
- Descriptor: Message at the left margin, one button at the right, hairline under — a raised strip on surface by default, the button its single accent.
- Archetype: split
- Tuple: split · none · surface · none · none · single accent button
- No-JS: Renders as drawn and always shows; the button is a plain link and works, but the close is inert without script (no collapse, no dismiss memory).

### A2-3 Badge
- Descriptor: A short label, then the sentence, then a text link, left-aligned on the page's own ground with one hairline below — the bar with no band.
- Archetype: bar
- Tuple: bar · none · page · none · none · accent label pill
- No-JS: Renders as drawn and always shows; the ≤ 767 whole-bar link is markup and the 2 px arrow hover is CSS, so both survive, but the close is inert (no collapse, no dismiss memory).

### A2-4 Two-Line
- Descriptor: A headline in the pack's heading font over one line of body, centred, action at the right end — the tallest of the text bars and the category's one display moment.
- Archetype: stack
- Tuple: stack · none · contrast · none · none · display headline
- No-JS: Renders as drawn and always shows; the close is inert without script (no collapse, no dismiss memory).

### A2-5 Capture
- Descriptor: One sentence and an email field, subscribed without leaving the page — the only design that takes input, and the only one that becomes a different design when members are off.
- Archetype: form
- Tuple: form · none · surface · none · none · inline email field
- No-JS: NEEDS DESIGN ANSWER: subscribe form — the spec defines in-place submitting, error and success states posting to Ghost's members endpoint, but names no native form action or non-script fallback; the specified substitution (render as A2-2 with a link to the subscribe page) is keyed to Ghost's members setting, not to script absence, so what the field and submit do without JS is not derivable.

### A2-6 Countdown
- Descriptor: A sentence, a clock and one action — the only design whose content changes without anyone editing it, so expiry is a specified state.
- Archetype: bar
- Tuple: bar · none · contrast · none · none · live clock
- No-JS: The message must name the deadline in words and the spec states the bar is complete without the clock, so the sentence survives unscripted. NEEDS DESIGN ANSWER: clock module and expiry — whether the digits render frozen at paint time or are suppressed, and how "When it ends" (Hide bar / Keep, drop clock) is honoured without script, is not stated.

### A2-7 Dateline
- Descriptor: An eyebrow and a sentence at the left margin, publication meta at the right, no button — the masthead-adjacent bar and the first in the category to read content from Ghost.
- Archetype: split
- Tuple: split · none · page · none · none · publication meta slot
- No-JS: Renders as drawn and always shows; the close is inert without script (no collapse, no dismiss memory).
- Notes: Archetype ambiguous between bar and split — split chosen because the right-end meta leaves its end and restacks at ≤ 767 (the split ladder), where A2-3's bar ladder shortens and drops in place. The Latest-post-date binding's mechanism (server template vs client fetch) is unstated; the spec's meta-absent rendering (slot and divider removed) is keyed to "no posts published", not to script absence.

### A2-8 Ticker
- Descriptor: Several notices on one continuously moving strip, with a pause control that is not optional; the resting state the editor shows is deliberately not the state most readers see.
- Archetype: carousel
- Tuple: carousel · none · contrast · variable · none · ticker marquee
- No-JS: NEEDS DESIGN ANSWER: continuous strip and pause — the only non-moving state the spec defines (message 1 centred with A2-9's dots) is keyed to prefers-reduced-motion, not to script absence; whether the no-JS strip renders frozen at its start position, falls back to that static state, or runs as CSS animation without its mandatory pause mechanism (WCAG 2.2.2, "not optional") is not derivable.

### A2-9 Rotator
- Descriptor: The same message list as Ticker shown one at a time, dots at the right end, nothing moving horizontally — on surface the only multi-message bar that does not read as a news channel.
- Archetype: carousel
- Tuple: carousel · none · surface · variable · none · timed rotation
- No-JS: No auto-advance: message 1 renders and stays; dots, swipe and crossfade are inert, so sighted readers never reach the later messages, while screen-reader users still get every message — the spec keeps all messages in the DOM, visually hidden but readable. Close inert (no dismiss memory).

### A2-10 Pill
- Descriptor: A detached bar with air around it, sitting clear of the top edge on the page's own ground — pack-radius corners, not a capsule.
- Archetype: bar
- Tuple: bar · pill · surface · none · none · surrounding air
- No-JS: Renders as drawn in its reserved space and always shows; the ≤ 767 whole-pill link is markup and survives, but the close is inert without script (no removal of pill and spacer, no dismiss memory).

### A2-11 Toast
- Descriptor: A small card in a bottom corner, arriving after the page has settled — the only design that appears rather than being there, and one of two that never touch the header.
- Archetype: overlay
- Tuple: overlay · card · surface · none · none · late-arriving corner card
- No-JS: NEEDS DESIGN ANSWER: appearance trigger — the card arrives via the Appears control (Immediately / After 2 seconds / After 25% scroll) and the spec does not say whether the markup at the end of the body is hidden or shown before the trigger fires, so without script the card is either permanently absent or permanently present; not derivable. Escape-dismiss and the entry motion are also script-bound.

### A2-12 Takeover
- Descriptor: A 200 px band with a picture in it — image on one side, headline, body and a button on the other; the only design in the category that carries imagery.
- Archetype: media frame
- Tuple: media frame · none · surface · none · left · bled image panel
- No-JS: Renders as drawn and always shows — panel, scrim and dark-mode dim are presentation; the close is inert without script, so the 200 px band never collapses and the scroll-correction rule never runs.
- Notes: Media placement "left" taken from the first-listed Image control value (Left panel); the prose says only "image on one side" and never names the drawn side.

### A2-13 Consent
- Descriptor: A bottom bar asking a question, with accept and decline at the same weight — the only design with no close control and the only one with no audience targeting.
- Archetype: overlay
- Tuple: overlay · none · surface · none · none · equal-weight answer pair
- No-JS: NEEDS DESIGN ANSWER: answer recording — the design "draws the question and records the answer" but names no mechanism (no form action or endpoint), so whether Accept/Decline degrade to a native submit or go inert is not derivable; inert answers plus no close and no Escape would leave a permanently unremovable bar.
- Notes: Archetype ambiguous — the Responsive rule's internal collapse (900 px re-arrangement, equal halves) resembles split, but the page-level ladder (bottom-anchored, floating, never offsetting or reflowing the page, safe-area padded) is overlay's; chosen on the latter.

### A2-14 Edge
- Descriptor: A 4 px accent rule across the top with a chip at its right end that, pressed, opens into A2-1 Rule — four pixels of furniture instead of forty-four.
- Archetype: edge rail
- Tuple: edge rail · none · accent · none · none · collapsed accent rule
- No-JS: Renders permanently collapsed — the rule and chip at every width. The chip is a `<button aria-expanded>` toggle with no stated non-script path, so the bar never opens for sighted readers; the full sentence remains available as the chip's accessible name ("the sentence plus Show announcement"), and the × is inert (no dismissal, no memory).

### A2-15 Triple
- Descriptor: Three short notices side by side in one band, divided by hairlines — the only design that shows more than one message at once without moving.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · surface · variable · none · hairline dividers
- No-JS: At ≥ 768 renders as drawn — a static grid whose slot links and hover fill need no script; the close is inert (no dismissal, no memory). Below 768 the specified hand-off to A2-9 Rotator inherits Rotator's no-JS state: message 1 fixed, the rest reachable only in the DOM.

## Category summary
- Tuple collisions: none. Nearest pair: A2-8 and A2-9 share `carousel · horizontal · variable · none` and differ only in the emphasis slot (ticker marquee vs timed rotation) — a genuine structural difference, but the spec itself flags in A2-0 that the two converge into the same design under prefers-reduced-motion.
- Not recoverable: none.
- Needs design answer: A2-5 (subscribe form's non-script submission path), A2-6 (clock module render and expiry handling without script), A2-8 (strip motion and mandatory pause without script), A2-11 (appearance trigger / initial markup visibility), A2-13 (answer-recording mechanism).

## A3 Footers — derived fields (16 designs)

### A3-1 Minimal Line
- Descriptor: One row above a hairline — lockup left, social row, legal line right; the category's baseline and the fallback for six other designs.
- Archetype: bar
- Tuple: bar · none · page · few · none · single hairline row
- No-JS: No behaviour — renders as drawn without JS.

### A3-2 Columns
- Descriptor: Brand block at the left margin, link columns filling the measure, legal line on its own row under a hairline; the design that settles the column rule for the category.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · none · brand-anchored link columns
- No-JS: At 2–4 columns, no behaviour — columns stack open as drawn. NEEDS DESIGN ANSWER: ≤767 accordion at 5–7 columns — the spec says closed groups are `hidden` and headings carry `aria-expanded` buttons, but never says whether `hidden` is script-applied at collapse or present in the markup; without JS the outcome is either all groups open or all-but-first unreachable, and the text supports both readings.

### A3-3 Two-Tier
- Descriptor: Links on one ground, a full-bleed legal bar on another; the lockup lives in the bar, which is A3-1 Minimal Line verbatim.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · surface · variable · none · paired ground tiers
- No-JS: The bar is A3-1 and has no behaviour. NEEDS DESIGN ANSWER: ≤767 accordion at 5–7 columns — the tier follows A3-2's column rule "including the accordion threshold", so it inherits A3-2's underivable no-JS accordion state (script-applied vs markup `hidden` is unstated).

### A3-4 Newsletter Band
- Descriptor: A band across the top of the footer holding one newsletter form row, with the links beneath; settles the footer's inline form for the category.
- Archetype: form
- Tuple: form · none · surface · one · none · accent subscribe button
- No-JS: NEEDS DESIGN ANSWER: newsletter form — the spec's invalid/submitting/done states are all in-place page states (error replaces the note, button relabels, confirmation swaps in at identical height), which require script, and the spec never says whether the form falls back to a native POST to Ghost's members endpoint or what a no-JS submission renders. Only native field validation is derivable (`type="email"`, `required` are specified markup). The Members-off variant (button-as-link to the subscribe page) works without JS, but that is a different configuration, not a degradation.

### A3-5 Contrast Band
- Descriptor: The whole footer — brand, columns and legal — on one contrast ground with no second tier; ground is not a control, it is the design.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · few · none · full contrast ground
- No-JS: No behaviour — renders as drawn without JS. (Columns are capped at four, so the settlement's 5–7 accordion case can never arise.)

### A3-6 Centred Stack
- Descriptor: One centred column on a fixed measure — lockup, tagline, one wrapping row of links, social, legal; no columns and no grid.
- Archetype: stack
- Tuple: stack · none · page · variable · none · centred fixed measure
- No-JS: No behaviour — renders as drawn without JS. (The spec states the design "has no collapse to specify".)

### A3-7 Big Type
- Descriptor: The site's name set large enough to be the last thing on the page, with links and legal kept small above it; the category's one display moment.
- Archetype: stack
- Tuple: stack · none · page · one · none · oversized wordmark
- No-JS: No behaviour — renders as drawn without JS. Fill width is "measured at build" per the spec, and its recompute under zoom is consistent with a CSS clamp rather than script.
- Notes: If "Columns above" is set with 5+ authored groups, the §0 accordion collapse (and its underivable no-JS state) would apply; the design's own text is silent on that combination.

### A3-8 Sitemap
- Descriptor: Five to seven columns, every route, at the category's smallest link size; the only design above four columns and the only Density control.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · many · none · maximum column density
- No-JS: NEEDS DESIGN ANSWER: ≤767 accordion — always in effect here (the design is 5–7 groups). The spec specifies `hidden` closed groups, first open, and `<button aria-expanded aria-controls>` headings, but never whether `hidden` is script-applied or in the markup; without JS the links in groups 2–7 are either all visible or unreachable, and the text supports both readings.

### A3-9 Latest Posts
- Descriptor: The three most recent posts beside one link column; the only design whose content changes without anyone editing it and the only one carrying imagery.
- Archetype: feed
- Tuple: feed · none · page · few · inline · self-updating post feed
- No-JS: No behaviour — renders as drawn without JS. Posts are Ghost data at render time, not client-fetched; the 1.02 hover is a CSS transition and `loading="lazy"` is native.

### A3-10 Contact Block
- Descriptor: A postal address, an email, a phone number and reply hours as a labelled block beside the link columns; the only design carrying the contact fields.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · labelled contact block
- No-JS: No behaviour — renders as drawn without JS. `mailto:` and `tel:` are plain links; columns are capped at two drawn, which stack open per the settlement.

### A3-11 Colophon
- Descriptor: A short paragraph about the publication set as reading text, with the credits beneath or beside it as labelled pairs; the only footer whose main content is prose.
- Archetype: article body
- Tuple: article body · none · page · variable · none · reading-measure prose
- No-JS: No behaviour — renders as drawn without JS.

### A3-12 Card
- Descriptor: The footer as a panel inset from the page's edges with the page ground visible around it; the only footer that does not touch the window.
- Archetype: grid-of-N
- Tuple: grid-of-N · card · surface · few · none · inset card panel
- No-JS: No behaviour — renders as drawn without JS. (Columns capped at four; no accordion case. No hover, no lift on the card itself.)

### A3-13 Tags
- Descriptor: The site's subjects as chips drawn from Ghost's own tags; the only design whose main content the user does not type, and where the chip is established for the library.
- Archetype: nav
- Tuple: nav · none · page · many · none · uniform tag chips
- No-JS: No behaviour — renders as drawn without JS. Chips are plain links; the mobile eight-chip cap and overflow link are responsive rendering, not scripted behaviour.

### A3-14 Image Band
- Descriptor: One full-bleed photograph closing the page with the site's name over it on a scrim and the links in a plain row beneath; the design that settles the scrim.
- Archetype: media frame
- Tuple: media frame · none · image · one · full-bleed · bottom-up scrim
- No-JS: No behaviour — renders as drawn without JS. The spec states "no motion at all, no parallax"; `loading="lazy"` is native and the band reserves its height in markup.
- Notes: `linkColumns[]` is uncapped here with a Columns option; whether the §0 accordion collapse (and its no-JS question) applies at 5+ authored groups is unstated in the design's own text.

### A3-15 Wrap
- Descriptor: Every link in one wrapping block at reading size, no headings and no columns; for a list with twenty links and no hierarchy worth drawing.
- Archetype: nav
- Tuple: nav · none · page · variable · none · reading-size link wrap
- No-JS: No behaviour — renders as drawn without JS. Separators are CSS `::after` content.
- Notes: Shares its first four tuple slots with A3-13 (nav · horizontal · differing count class · none); the two are separated by count class and by genuinely different devices (boxed uniform chips vs bare wrapping text links), not by wordsmithing.

### A3-16 Mini Bar
- Descriptor: A slim bar pinned to the bottom of the window while the reader is in the page, released at the page's end into the real footer beneath; the category's only scroll behaviour.
- Archetype: sticky
- Tuple: sticky · none · page · few · none · pin-and-release bar
- No-JS: Specified outright: with no JavaScript the bar is simply the last element in the page — opaque, in flow, no shadow, no back to top. It never pins, so the release, the translucency and the reserved bottom padding never run; the footer it would release into renders beneath as normal (the two are one element).

## Category summary
- Tuple collisions: none. Near-collision worth noting as a finding: A3-5, A3-10 and A3-12 all produce `grid-of-N · horizontal · few · none` and are separated only by their emphasis slot — each emphasis names a real device from the spec (contrast ground, contact `<dl>`, card inset), so they are not the same design, but structurally they are three variants of A3-2.
- Not recoverable: none — every Descriptor, Archetype and Tuple derived from written text.
- Needs design answer:
  - A3-2, A3-3, A3-8 — ≤767 accordion no-JS state: the spec specifies `hidden` closed groups and `aria-expanded` toggle buttons but never says whether `hidden` is script-applied or present in the markup, so no-JS is either all-open or all-but-first-unreachable; not derivable.
  - A3-4 — newsletter form no-JS: in-place invalid/submitting/done states require script; native POST fallback and its response rendering are unspecified.
  - §0 (category-wide) — the shared Site-wide "Back to top" control: it exists on every design's sidebar, but its rendering, markup and no-JS behaviour are specified nowhere (only A3-16's own back-to-top button is specified, and that one is explicitly absent without JS).

## A4 Heroes — derived fields (18 designs)

### A4-1 Centred
- Descriptor: The whole set centred on a 720 px measure with no picture — the category's floor from which every other design departs.
- Archetype: stack
- Tuple: stack · none · page · none · none · centred narrow measure
- No-JS: No behaviour — renders as drawn without JS.

### A4-2 Flush Left
- Descriptor: 1 Centred's set moved to the left margin on a half measure, the right half deliberately empty, with an optional proof row under the actions.
- Archetype: stack
- Tuple: stack · none · page · variable · none · empty right half
- No-JS: No behaviour — renders as drawn without JS.

### A4-3 Split
- Descriptor: Text on seven columns, one picture on five, both on the page's own ground — the design that settles the two-column hero.
- Archetype: split
- Tuple: split · none · page · none · right · seven-five split media
- No-JS: No behaviour — renders as drawn without JS.

### A4-4 Full Bleed
- Descriptor: One 16:9 photograph edge to edge with the set over it, anchored to the lower third.
- Archetype: overlay
- Tuple: overlay · none · image · none · background · full-bleed image
- No-JS: No behaviour — renders as drawn without JS.

### A4-5 Image Under
- Descriptor: The set centred above a wide band of picture, with a caption under it.
- Archetype: stack
- Tuple: stack · none · page · none · bottom · wide picture band
- No-JS: No behaviour — renders as drawn without JS.

### A4-6 Big Type
- Descriptor: The headline set large enough to be the page, flush left across the whole measure, with no eyebrow.
- Archetype: stack
- Tuple: stack · none · page · none · none · display headline
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Fill width is "measured against the column, clamped between 64 and 160 px" with no mechanism named; the written rule maps to CSS clamp, so it is treated as rendering, not behaviour.

### A4-7 Masthead
- Descriptor: The publication's nameplate at the top of its own front page — the site's name set large and centred over a rule, with an issue line under it.
- Archetype: stack
- Tuple: stack · none · page · none · none · nameplate over rule
- No-JS: No behaviour — renders as drawn without JS.

### A4-8 Card
- Descriptor: The hero as a surface panel inset from the page's edges, page ground visible around it — A3·12's card geometry at hero scale.
- Archetype: stack
- Tuple: stack · card · surface · none · none · inset surface card
- No-JS: No behaviour — renders as drawn without JS.

### A4-9 Contrast Band
- Descriptor: The whole hero on the inverted ground — ground is not a control here, it is the design.
- Archetype: stack
- Tuple: stack · none · contrast · none · none · contrast band
- No-JS: No behaviour — renders as drawn without JS. (The Accent value disabled with its ratio is an editor-panel rule, not runtime behaviour.)
- Notes: The only design with no Responsive rule of its own; the stack ladder is inherited from §0 and its 1 Centred base (Fields "As 1", band always full bleed on a phone), not stated locally.

### A4-10 Video Poster
- Descriptor: A 16:9 poster with a labelled play control at its centre and the set in the lower third, opening A15's player in a dialog.
- Archetype: overlay
- Tuple: overlay · none · image · none · background · labelled play control
- No-JS: NEEDS DESIGN ANSWER: play control / dialog hand-off — the spec defines a labelled `<button>` that opens a focus-trapped dialog (A15 owns the player inside), but states no non-JS fallback such as a plain link to `videoUrl`; without script the button does nothing derivable.

### A4-11 Subscribe
- Descriptor: The set with A3·4's one-row form standing where the actions would be — the hero's only form.
- Archetype: form
- Tuple: form · none · page · none · none · one-row email form
- No-JS: NEEDS DESIGN ANSWER: email form states — the four states include error and a success that "replaces the row in place", but the row's markup and submission behaviour are deferred to A3·4 and no native (non-JS) submission path is stated in this spec.
- Notes: Whether the deadline line counts down live (its wording is A2·6's) or is render-time text is not stated; "past its date the line is removed" is derivable as a render-time rule.

### A4-12 Offset Image
- Descriptor: Text on a 620 px measure at the left margin with the picture running off the right edge of the window.
- Archetype: split
- Tuple: split · none · page · none · edge · edge-bleed picture
- No-JS: No behaviour — renders as drawn without JS.

### A4-13 Latest Post
- Descriptor: 3 Split's arrangement with the newest published post as the right half — one card carrying its picture, title, tag and date, the category's only live data.
- Archetype: split
- Tuple: split · none · page · one · right · live post card
- No-JS: No behaviour — renders as drawn without JS; the card is one plain link, hover effects are CSS-level states, and every data state is written as an alternative render, none as a client update.
- Notes: The delivery mechanism for the Ghost data is unstated; treated as server/render-time because all data states are described as render outcomes, but the spec never says so explicitly.

### A4-14 Full Height
- Descriptor: 4 Full Bleed's arrangement measured against the window, with a labelled scroll cue at the foot — the only design that knows how tall the browser is.
- Archetype: overlay
- Tuple: overlay · none · image · none · background · full-window height
- No-JS: NEEDS DESIGN ANSWER: scroll cue — its scroll-then-move-focus action, and its removal from the DOM past 40 px of scroll and when the section is not window height, are script behaviours with no stated non-JS fallback (no anchor target is specified). The height itself (`min-height: 100svh`) and the 560 px sub rule are CSS-derivable and survive without script.

### A4-15 Search
- Descriptor: One field where the actions would be, for an archive whose front door is a query — it never renders a result.
- Archetype: form
- Tuple: form · none · page · none · none · single search field
- No-JS: The `<form role="search">` with `<input type="search">` is native markup, so typing and submitting on the return key still work without JS — everything after the return key is A23's by the spec's own boundary. The typed-state clear control (empties the field and returns focus) and the submitted-state ground change do not survive without script.

### A4-16 Pull Quote
- Descriptor: Somebody else's sentence in the display position, with the publication's own headline demoted to a line above it.
- Archetype: stack
- Tuple: stack · none · page · none · inline · display quotation
- No-JS: No behaviour — renders as drawn without JS. The spec states no rotation and no motion, and the 180-character step-down is an author-time rendering rule.

### A4-17 Slim
- Descriptor: A page title, not an argument — one row, about 160 px, for the top of an archive index, a tag page or an About.
- Archetype: bar
- Tuple: bar · none · page · none · none · one-row page title
- No-JS: No behaviour — renders as drawn without JS ("Nothing interactive but the action; no motion").
- Notes: The meta's drop to its own line "once the title passes 75% of the row" is a measured layout threshold with no stated mechanism; treated as rendering, not behaviour.

### A4-18 Overlap Card
- Descriptor: A wide picture with the text on a surface card pulled up over its bottom edge, the greater part of the card sitting on the page below — the category's only design that reaches into its neighbour.
- Archetype: overlay
- Tuple: overlay · card · surface · none · top · overlapping surface card
- No-JS: No behaviour — renders as drawn without JS. The overlap is negative margin, not absolute positioning, and the spec states no motion of any kind.

## Category summary
- Tuple collisions: none. (Five stacks — A4-1, 6, 7, 8, 9 — share the first four slots and are separated only by emphasis; each emphasis is that design's own stated device (centring, headline scale, nameplate-and-rule, card inset, inverted ground), not wordsmithing. Likewise A4-11 and A4-15 share `form · vertical · none · none` and differ by genuinely different modules.)
- Not recoverable: none.
- Needs design answer: A4-10 (play control / dialog — no non-JS fallback stated), A4-11 (email form — submission and error/success states deferred to A3·4, no non-JS path stated), A4-14 (scroll cue — script-only behaviours, no anchor fallback stated).

## A5 Features — derived fields (16 designs)

### A5-1 Three Up
- Descriptor: A centred head over three bare items on the page's own ground — the category's floor the other fifteen depart from.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · three bare columns
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Icon position within the item is never stated for 1 (or the grids that inherit its item: 3, 4, 10, 16). "Top" is inferred from 2's arrangement vocabulary — 2 alone offers "Icon beside the text · Stacked", implying the inherited default elsewhere is stacked (icon above text).

### A5-2 Two Up
- Descriptor: Two items across a 632 px column each, for features that need a sentence rather than a phrase.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · left · two capped-measure columns
- No-JS: No behaviour — renders as drawn without JS.

### A5-3 Four Up
- Descriptor: Four items across 300 px each — the densest grid the ladder allows, the design for eight or more.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · four dense columns
- No-JS: No behaviour — renders as drawn without JS. (Body copy Hide removes the paragraph from the DOM at author time, not via script.)

### A5-4 Cards
- Descriptor: 1's grid with each item on its own plane; settles the plane, the row-height stretch and Whole item.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · card grid
- No-JS: No behaviour — renders as drawn without JS. Whole item is one `<a>` inside the `<li>`; hover and focus states are CSS.

### A5-5 Split Head
- Descriptor: The head as a left column beside a two-across grid, with the section's one action inside it.
- Archetype: split
- Tuple: split · none · page · variable · none · head column beside grid
- No-JS: No behaviour — "Follows the scroll" is `position: sticky`, which the spec treats as a position rather than an animation; renders as drawn without JS.

### A5-6 Rows
- Descriptor: One item per full-width row with a hairline between — the only arrangement in A5 where an item has as much room as it wants.
- Archetype: stack
- Tuple: stack · none · page · variable · left · full-width ruled rows
- No-JS: No behaviour — renders as drawn without JS. Whole row hover and focus are CSS states.

### A5-7 Alternating Media
- Descriptor: Picture-and-text rows whose sides alternate, for two to four features that each need showing.
- Archetype: split
- Tuple: split · none · page · few · left · alternating picture sides
- No-JS: No behaviour — renders as drawn without JS. Alternation is `flex-direction: row-reverse`, never a source reorder.
- Notes: Media placement alternates left/right by design; "left" is the first-listed value of the First row's picture control (no default is stated).

### A5-8 Media Top
- Descriptor: A picture across the top of every item, three across, on 4 Cards' plane — where 7 hands off at the fifth item.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · picture-topped card grid
- No-JS: No behaviour — renders as drawn without JS. The 4% hover darken is a CSS filter; `loading="lazy"` is native.

### A5-9 Bento
- Descriptor: One tile at four times the size of the others, with the rest filling the remaining cells in written order.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · double-span first tile
- No-JS: No behaviour — renders as drawn without JS. The 2 × 2 span is grid placement in CSS, never a source reorder.
- Notes: The picture's position inside the large tile is never stated — only that its crop is "derived from the tile's remaining height" and dropped below 120 px. "Inline" (media within the tile's content) is the nearest honest value.

### A5-10 Contrast Band
- Descriptor: The whole set on the inverted ground — Ground is not a control here, it is the design.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · variable · top · contrast band
- No-JS: No behaviour — renders as drawn without JS. The 3% action hover is a CSS state; the lift and hairline are colour ratios.

### A5-11 Checklist
- Descriptor: Two columns of one-line, title-only items with a small mark at the left — the design settlement 4's title-only item was written for.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · none · mark per entry
- No-JS: No behaviour — renders as drawn without JS. Nothing is a checkbox: no role, no `aria-checked`, no input.

### A5-12 Tabs
- Descriptor: One item at a time behind a labelled row of tabs — the category's only behaviour, and its only design whose resting state hides most of its content.
- Archetype: nav
- Tuple: nav · none · page · variable · right · tabbed panels
- No-JS: The tab buttons are inert. The first item's panel shows — a published page always opens on the first item — and the other panels stay `hidden`, their pictures unfetched, so the remaining items are unreachable without JS.
- Notes: The derivation rests on `hidden` being in the served markup, implied by "pictures not fetched"; the spec states the one-of-six cost only for readers who don't touch the tabs and never declares whether the permanent no-JS lock-out is intended or wants a fallback. Archetype: the tab is A1·1's nav item verbatim and the phone row scrolls sideways rather than becoming an accordion, which is the nav-row ladder, not carousel's.

### A5-13 Spotlight
- Descriptor: One feature at picture scale with the rest reduced to single lines beneath it — where 9 Bento makes the first item bigger, this makes it the subject.
- Archetype: split
- Tuple: split · none · page · variable · left · spotlit first item
- No-JS: No behaviour — renders as drawn without JS. At The rest Hidden the other items are absent from the DOM, not script-hidden.

### A5-14 Scroller
- Descriptor: A rail of cards that overflows sideways instead of wrapping — the library's overflow model.
- Archetype: edge rail
- Tuple: edge rail · none · page · many · top · right-bleeding card rail
- No-JS: The rail still scrolls — it is a `<ul>` in an `overflow-x: auto` box, and proximity snap is CSS. The arrow buttons go inert (an arrow press is what moves one card), and the 3 px rule — already "not draggable and not a scrollbar" — stays static.

### A5-15 Index
- Descriptor: A large numeral where the icon would be — the editorial answer to the media question, and the design that holds the boundary with A13 Process.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · index numerals
- No-JS: No behaviour — renders as drawn without JS. The numeral is generated from the item's position at authoring, not by script; renumbering on delete is an editor behaviour.

### A5-16 Panel
- Descriptor: The whole set on one surface panel, inset from the page, divided internally by hairlines rather than separated by gaps — the only design in A5 whose items share a plane.
- Archetype: grid-of-N
- Tuple: grid-of-N · card · surface · variable · top · hairline-divided panel
- No-JS: No behaviour — renders as drawn without JS. The cell-block hover and its focus ring are CSS states; dividers are `border` properties on the items.

## Category summary
- Tuple collisions: none. Nine designs share `grid-of-N · horizontal · variable`, but each emphasis slot names the design's own stated device (column count, plane, picture-top, span, band, numeral, panel) — none is wordsmithed to force uniqueness. A5-1 and A5-3 come closest: they differ structurally only in column count and density, which the tuple can express nowhere but the emphasis slot.
- Not recoverable: none outright. Two placements are inferred rather than stated: icon position in the A5-1 item family (top — inferred from A5-2's "Stacked" vocabulary) and the picture's position inside A5-9's large tile (inline — nearest value to "derived from the tile's remaining height").
- Needs design answer: none. A5-12's no-JS state is derivable (first panel only, rest unreachable) but the spec never says whether that lock-out is intended — flagged in its Notes rather than as a blocker.

## A6 CTA Banners — derived fields (15 designs)

### A6-1 Centred
- Descriptor: The ask centred on the page's own ground — eyebrow, title, sub, one action, a note; the floor the other fourteen depart from.
- Archetype: stack
- Tuple: stack · none · page · none · none · centred symmetry
- No-JS: No behaviour — renders as drawn without JS.

### A6-2 Flush Left
- Descriptor: 1's ladder stacked at the page's left margin on a stated measure, with the right half of the row left empty.
- Archetype: stack
- Tuple: stack · none · page · none · none · empty right half
- No-JS: No behaviour — renders as drawn without JS.
- Notes: The rule above is the design's stated "answer" but is a Show/Hide control, so the always-true structural device — the empty right half, which the spec itself calls "the arrangement" — was taken as the emphasis slot instead.

### A6-3 Split
- Descriptor: The words on the left of one row and the actions on the right of it — the shortest banner in A6 that still carries a title and a sub.
- Archetype: split
- Tuple: split · none · surface · none · none · right-aligned action column
- No-JS: No behaviour — renders as drawn without JS.

### A6-4 Card
- Descriptor: The banner on one surface card, inset from the page margin, page ground visible on all four edges.
- Archetype: stack
- Tuple: stack · card · surface · none · none · boxed card
- No-JS: No behaviour — renders as drawn without JS.

### A6-5 Contrast Band
- Descriptor: The whole banner on the inverted ground — Ground is not a control here, it is the design.
- Archetype: stack
- Tuple: stack · none · contrast · none · none · contrast band
- No-JS: No behaviour — renders as drawn without JS.

### A6-6 Inline Form
- Descriptor: The banner with A3·4's one-row form standing where the actions would be; settles §8's fourth question for the whole category.
- Archetype: form
- Tuple: form · none · surface · none · none · one-row form
- No-JS: NEEDS DESIGN ANSWER: inline form submission — the spec gives the endpoint (Ghost's members subscribe) and five in-place states (empty, focus, invalid with the error replacing the note, submitting, done with the row replaced in place), but never states the transport: whether the `<form>` posts natively without script, degrading to a full-page response with native `required`/`type` validation, or whether the in-place states are script-only with no native action. Not derivable from the text.
- Notes: §0 declares "Behaviours. There are none… A6 is fifteen resting states", yet 6 draws five form states — the category-wide claim and this design's own section are in mild tension, which is exactly why its no-JS path is unstated.

### A6-7 Full Bleed Image
- Descriptor: The ask over a photograph that fills the section, its height set by its own content rather than a crop — the third of §8's grounds.
- Archetype: overlay
- Tuple: overlay · none · image · none · background · flat scrim wash
- No-JS: No behaviour — renders as drawn without JS. The picture is a CSS background and the spec states it never moves.

### A6-8 Image Split
- Descriptor: A photograph on one half and the ask on the other, with no scrim between them — the design for a picture that carries information rather than atmosphere.
- Archetype: split
- Tuple: split · none · page · none · right · unscrimmed picture half
- No-JS: No behaviour — renders as drawn without JS (`<img loading="lazy">` is native).
- Notes: Picture side (Right · Left) has no marked default; the tuple's media slot uses the first-listed Right. The side is author-switchable — grid placement only, never a source reorder.

### A6-9 Big Type
- Descriptor: The ask set large enough to be the section, flush left across the whole content width, a rule under it, the actions beneath — A6's only design above its own title ladder.
- Archetype: stack
- Tuple: stack · none · page · none · none · display headline
- No-JS: No behaviour — renders as drawn without JS.

### A6-10 Slim
- Descriptor: One line of text and one action on a single row, at the tightest padding in the category — the design A6 names whenever a site has no title to write.
- Archetype: bar
- Tuple: bar · none · page · none · none · hairline rules
- No-JS: No behaviour — renders as drawn without JS. The spec states it explicitly: not dismissible, no close control, nothing remembered in storage, no live region.

### A6-11 Reasons
- Descriptor: The ask with up to three short lines saying what comes with it — where A6 borrows A5·11's mark.
- Archetype: split
- Tuple: split · none · surface · variable · none · marked reason list
- No-JS: No behaviour — renders as drawn without JS. Marks are decorative (`aria-hidden`, drawn from `currentColor`), nothing is a checkbox, no reason is a link.
- Notes: Reasons position (Beside the text · Under the actions) has no marked default; the tuple follows the first-listed Beside the text, whose written responsive rule (forced Under the actions at ≤ 1080) is a split collapse. At Under the actions the same design is a vertical stack. Item count is author-set 1–3 (one is a supported state), hence variable.

### A6-12 Pair
- Descriptor: Two asks side by side, each with its own words and its own action — the only design in A6 that spends the accent twice.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · twin accent asks
- No-JS: No behaviour — renders as drawn without JS.

### A6-13 Overlap
- Descriptor: A card that crosses the footer's top edge, so the last ask on the page and the end of the page are one object — the only design in A6 with a precondition.
- Archetype: stack
- Tuple: stack · card · surface · none · none · footer-crossing card
- No-JS: No behaviour — renders as drawn without JS. The overlap is a negative bottom margin plus matching footer padding — the spec states no transform, no absolute positioning, and that the overlap is a position, not a behaviour.
- Notes: Tuple separates from A6-4 Card only in the emphasis slot. Not a collision — the overlap mechanics (negative margin, absorbed footer padding, the precondition) are a genuine structural difference, and its written responsive rule explicitly follows 4 Card's steps, which is why the archetype matches 4's.

### A6-14 Members
- Descriptor: The signup ask with its sign-in line, and the one design in A6 that reads Ghost's member state.
- Archetype: stack
- Tuple: stack · none · surface · none · none · member-state ask
- No-JS: The drawn state renders without JS — the member state is rendered on the server, no markup is swapped after load, and all actions are real links. NEEDS DESIGN ANSWER: Portal opening — the `#/portal/*` links change the URL but the dialog is Ghost's Portal script, which the spec explicitly places outside the banner ("the banner draws nothing of Portal") with no banner-side fallback stated; and at Signup Inline form the design inherits 6's form "unchanged and unextended", including its unresolved submission transport.
- Notes: Tuple separates from A6-1 Centred only in the emphasis slot. Not reported as a collision because the member-state model and the sign-in line are the design's stated identity — but geometrically the visitor state is 1's arrangement plus a fixed sign-in sentence, so the pair is the category's closest structural neighbour.

### A6-15 Signature
- Descriptor: The ask written in the first person and signed by the person making it — the only design in A6 whose copy has an author.
- Archetype: stack
- Tuple: stack · none · page · none · left · signature block
- No-JS: No behaviour — renders as drawn without JS. The spec states the portrait is not a link and does not respond to a pointer, and nothing comes from Ghost.
- Notes: At the first-listed Portrait position (Beside the text) the spec never states which side the portrait sits on; left is assumed from the design's stated lineage (A1·6's avatar-and-meta row, avatar leading). The media slot depends on that assumption.

## Category summary
- Tuple collisions: none — two pairs separate only in the emphasis slot (A6-13 vs A6-4, A6-14 vs A6-1) and are noted on those designs; in both cases the differing device is real in the spec's own text, not wordsmithed.
- Not recoverable: none.
- Needs design answer: A6-6 (inline form submission transport without script); A6-14 (Portal fragment links open nothing without Ghost's Portal script and no fallback is stated; plus the inherited 6 form gap at Signup Inline form).

## A7 Pricing and Tiers — derived fields (15 designs)

### A7-1 Cards
- Descriptor: Three tier cards in one row under a centred head — the floor the other fourteen depart from, and the design every hand-off names.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · highlighted tier
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 gives the switch two `<button>`s and a 160 ms cross-fade but never names which cadence is the rendered resting state, so the static prices a no-JS reader sees cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn.

### A7-2 Table
- Descriptor: Benefits as rows, tiers as columns, prices and actions in the head — the only real `<table>` in the library so far, the only design that scrolls, and the only one that accepts a fourth tier.
- Archetype: table
- Tuple: table · none · page · variable · none · comparison table
- No-JS: The 1080-and-below sideways scroll is a CSS position, not a behaviour ("sticky is a position, not a behaviour"), so it survives without JS. Otherwise: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design renders as drawn.
- Notes: Item-count "variable" here means the design accepts any tier count (§0: "2 Table scrolls" at four or more); the count itself is Ghost data, not section-authored.

### A7-3 Stack
- Descriptor: One full-width row per tier — name and price left, benefits in the middle, action right — the only arrangement in A7 that does not care how many tiers there are, which is why every columned design hands off to it at 1080.
- Archetype: stack
- Tuple: stack · none · page · variable · none · fixed-column rows
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn.
- Notes: Item-count "variable" means accepts any tier count (§0: takes four or more as ordinary rows); the count is Ghost data, not section-authored.

### A7-4 Split Head
- Descriptor: A5·5's division — the head held at the left margin, the tiers in a column of rows to the right; exists to answer where the cadence switch belongs when the head is not above the tiers.
- Archetype: split
- Tuple: split · none · page · variable · none · left-margin head
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived; here the inert switch also remains the section's first tab stop. At Monthly or Yearly the design has no behaviour and renders as drawn.
- Notes: Item-count "variable" means accepts any tier count (§0: takes four or more as ordinary rows); the count is Ghost data, not section-authored.

### A7-5 Contrast Band
- Descriptor: The whole section on the inverted ground, the tiers drawn as panels on it — Ground is not a control here, it is the design.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · few · none · contrast band
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn (the band, panels and derived colour mixes are all static).

### A7-6 Single Tier
- Descriptor: One card at 480, centred, with the free tier beside it — settlement 4 built rather than ruled, and the only design in A7 that hands off upwards.
- Archetype: split
- Tuple: split · none · page · one · none · single centred card
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. The control is already unavailable where there is no paid tier, and at Monthly or Yearly the design has no behaviour and renders as drawn.
- Notes: The list holds one or two items ("a list of one is a list"); "one" reflects the single paid card that is the design's repeating-card unit — the free tier is drawn with no plane at all.

### A7-7 Highlight
- Descriptor: The recommended tier at two thirds of the width with the others stacked beside it — a recommendation goes as far as size, and no further.
- Archetype: split
- Tuple: split · none · page · few · none · enlarged recommended tier
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn.

### A7-8 Slim Row
- Descriptor: The tier names and prices on one line, no benefits, and one action for the whole section rather than one per tier — A7 without its list.
- Archetype: bar
- Tuple: bar · none · page · variable · none · slim row
- No-JS: The single action is a plain link to the site's pricing page (or the one paid tier's Portal fragment) and works without JS. Otherwise: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design renders as drawn.
- Notes: Item-count "variable" means accepts any tier count ("four tiers wrap to a second line, a supported state"); the count is Ghost data, not section-authored.

### A7-9 Big Price
- Descriptor: The price set large enough to be the section — 88 or 112 px, flush left, a rule under it, the benefits beneath; the only design in A7 above the price ladder and the only one that refuses three tiers.
- Archetype: stack
- Tuple: stack · none · page · one · none · oversized price
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static price without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn.
- Notes: One or two paid tiers only (two stack, separated by a rule); "one" reflects the canonical single price block.

### A7-10 Tabs
- Descriptor: Tier names as a tab row, one tier's card at a time — A5·12's tabs verbatim, plus A7's second and last behaviour.
- Archetype: nav
- Tuple: nav · none · page · few · none · tab-switched panel
- No-JS: Derivable for the tab switch from the spec's own text: only the selected panel is in the DOM and the tabs are `<button role="tab">`, so without JS the default tab's panel (the recommended tier's; the free tier's with none authored) renders alone, the inert tab row still shows every tier's name but no prices, and "a reader who cannot switch tabs cannot read the other prices" — the spec's stated consequence, and why the editor names 1 Cards where the comparison is the point. NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static price in the open panel cannot be derived.
- Notes: Axis "layered" because only one tier's panel exists at a time; the tab row itself runs horizontally. Four or five tiers are supported (the row wraps), so "few" reflects the canonical two-to-four.

### A7-11 Free and Paid
- Descriptor: Two tiers drawn as what they are — an open door and an offer: the free tier a block of text on the page's own ground, the paid tier the only card.
- Archetype: split
- Tuple: split · none · page · few · none · paid-only plane
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn (the phone's tier reorder is a served DOM change, not a behaviour).

### A7-12 Ledger
- Descriptor: No planes at all — hairline rows, the name at the left, the price at the right, the benefits as one muted line beneath; the quietest thing A7 can put on a page.
- Archetype: stack
- Tuple: stack · none · page · variable · none · right-aligned prices
- No-JS: NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design has no behaviour and renders as drawn (at Actions None it is a pure reference table either way).
- Notes: Item-count "variable" means accepts any tier count (§0: takes four or more as ordinary rows); the count is Ghost data, not section-authored.

### A7-13 Members
- Descriptor: 1 Cards reading Ghost's member state — a third fact about the reader, which tier they are on, and that is the only new thing it does.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · current-plan marking
- No-JS: The member state itself survives without JS by the spec's own text — "the state is server-rendered and the other states are not in the page; nothing is announced, nothing is remembered" — so the reader's card, date line, badge precedence and computed accent all render as drawn. NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived.

### A7-14 Assurances
- Descriptor: The tiers with three short lines under a hairline saying what happens at checkout — A6·11's `reasons[]` reused verbatim, settling where a site may write a claim about payment.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · assurance strip
- No-JS: The strip itself is static text with no behaviour. NEEDS DESIGN ANSWER: cadence switch (Billing period Both) — §0 never names which cadence is the rendered resting state, so the static prices without JS cannot be derived. At Monthly or Yearly the design renders as drawn.

### A7-15 Both Prices
- Descriptor: Both cadences on every card — yearly at the price size, monthly muted beneath — and no switch at all: the design that answers "content" where the other fourteen answer "a control".
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · paired cadence prices
- No-JS: No behaviour — renders as drawn without JS. The spec states it directly: "no `<button>`, no `aria-pressed` and no cross-fade — the one design in A7 with no behaviour of any kind, and the reason a site with a reduced-motion or no-JavaScript audience might choose it."

## Category summary
- Tuple collisions: none. (Honest near-miss worth recording: 1, 5, 13, 14 and 15 share `grid-of-N · horizontal · few · none` and differ only in the emphasis slot — expected, since 5, 13, 14 and 15 are explicitly built on 1 Cards' arrangement, and each emphasis is that design's own stated device, not invented. Likewise 7 and 11 share `split · horizontal · few · none`, distinguished honestly by size versus plane.)
- Not recoverable: none — all four fields derivable for all fifteen, with the one shared gap recorded under needs-design-answer.
- Needs design answer: A7-1 through A7-14 (every design carrying the Billing period control): the cadence switch — §0 specifies the switch's construction, motion and computed saving line, but nowhere in the file is the initially rendered cadence at Billing period Both named, so the static state a no-JS reader is left with is not derivable from the spec. One design answer (the default resting cadence) resolves all fourteen. A7-15 is exempt — it has no behaviour and the spec says so explicitly.

## A8 Testimonials — derived fields (15 designs)

### A8-1 Single
- Descriptor: One quotation at Feature 27 on a 780 px measure, the attribution beneath it, no card — the design six others hand off to at a count of one.
- Archetype: stack
- Tuple: stack · none · page · one · inline · single feature quote
- No-JS: No behaviour — renders as drawn without JS.

### A8-2 Three Up
- Descriptor: Three cards of 416 on a 24 px gutter under a centred head — the quote card's home and the collapse target every columned design names at 1080.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · inline · card grid
- No-JS: No behaviour — renders as drawn without JS.

### A8-3 Two Up
- Descriptor: Two cards of 632 on a 32 px gutter, the quotation at Feature 27 inside the card; every control is Three Up's at this card's scale.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · inline · in-card feature quote
- No-JS: No behaviour — renders as drawn without JS.

### A8-4 Grid
- Descriptor: Six cards, three columns and two rows, on Three Up's 416/24 grid; rows equal within themselves and never across the grid.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · two-row card grid
- No-JS: No behaviour — renders as drawn without JS.

### A8-5 Wall
- Descriptor: Up to twelve quotations in three or four CSS columns at their natural heights — the many answer, and the design that gives up equal heights entirely.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · natural-height column wall
- No-JS: No behaviour — renders as drawn without JS (`column-count` and `break-inside: avoid` are CSS).
- Notes: Masonry-style column arrangement; grid-of-N is the nearest archetype and its ladder matches the written 4 → 3 → 2 → 1 column collapse. Axis recorded as vertical because the spec states authored order reads down each column, then across.

### A8-6 Split Head
- Descriptor: A5·5's division — the head in a 416 px column at the left margin, the quotations as rows in an 824 px column at the right.
- Archetype: split
- Tuple: split · none · page · variable · inline · head column beside rows
- No-JS: No behaviour — renders as drawn without JS (Head column Right is `flex-direction: row-reverse`, no motion at any value).

### A8-7 Slider
- Descriptor: A5·14 Scroller's rail carrying quote cards — a `<ul>` in an `overflow-x:auto` box, every quotation in the tree at all times, proximity snap, outlined arrows in the head, no dots, bleeding past the right margin.
- Archetype: carousel
- Tuple: carousel · none · page · variable · inline · overflow scroll rail
- No-JS: The rail is a native `overflow-x:auto` scroll container with every quotation in the DOM in authored order and proximity snap, so it scrolls, snaps and remains fully reachable by drag, keyboard and find without JS. The arrow `<button>`s (one-card-per-press scrolling and the 40%/`disabled` end state) are scripted and become inert.
- Notes: The spec explicitly frames this as A5·14's rail, "not a carousel" (no dots, no loop, no timer); carousel is the nearest vocabulary term, and its ladder matches the written rule that the arrangement does not change at any width.

### A8-8 Portrait
- Descriptor: One quotation beside one photograph of the person who said it — the only design (with 15 Overlap) that reads `image`, the only one where the photograph is a person, and the avatar is not drawn.
- Archetype: split
- Tuple: split · none · page · one · left · speaker portrait
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Image side is a control (Left · Right); the tuple records the first-listed value, Left. At ≤ 1080 the written ladder stacks image above quotation at both values.

### A8-9 Contrast Band
- Descriptor: The section inverted onto the `contrast` token, the quotations drawn as panels on the band, with A4·9's 44 · 64 · 88 band padding scale and derived mixes.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · variable · inline · inverted contrast band
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Responsive rule is stated as "2 Three Up's collapse exactly", which fixes the archetype. First four tuple slots match A8-4; the emphasis difference is genuine (the band is this design's entire identity — the spec states switching from Three Up "changes nothing but the colours").

### A8-10 Big Quote
- Descriptor: One quotation at Display 40, flush left on a 1,000 px measure, the attribution at its foot — the only design that reaches the top of the ladder outside a card.
- Archetype: stack
- Tuple: stack · none · page · one · inline · display-scale quotation
- No-JS: No behaviour — renders as drawn without JS (the spec states no motion at any value — no reveal, no fade, no letter-by-letter).

### A8-11 Faces
- Descriptor: The attributions become the control — a row of avatars and names as A5·12's tablist (`role="tablist"`, roving focus, arrow keys, accent underline), one quotation shown at a time, cross-fading at 160 ms.
- Archetype: nav
- Tuple: nav · none · page · variable · inline · avatar tablist
- No-JS: The resting DOM has the first tab active and the other quotations carrying the `hidden` attribute, so without JS the page renders the tab row and the first quotation only; tab switching, roving focus and the cross-fade are scripted, so the tabs are inert and the remaining quotations stay hidden and unreachable — the "five of six hidden on load" cost becomes permanent.
- Notes: The derivation follows from the stated resting DOM (`hidden` attribute, first tab active on load). Whether a no-JS fallback to the 12 Rows stack (which the spec already uses at ≤ 767 and at two quotations) is intended is not specified.

### A8-12 Rows
- Descriptor: Quotations as rows between hairlines — the words at the left on 780, the attribution in a 300 px column at the right; no title, no eyebrow, no card, no shadow, no avatar — the plainest thing the category can put on a page.
- Archetype: table
- Tuple: table · none · page · variable · none · hairline rows
- No-JS: No behaviour — renders as drawn without JS (the spec states nothing focusable unless a link is authored, no hover state, no motion).
- Notes: Archetype supported by the spec's own words — 4 Grid calls this design "the honest version of" a table's rule — and by the ladder: two-column rows collapse to attribution-under-quote at 1080.

### A8-13 Highlight
- Descriptor: One quotation at Display 40 in an 848 px card with two at Small 17 stacked in 416 px cards beside it — one voice may lead by two steps of the ladder and no more.
- Archetype: split
- Tuple: split · none · page · few · inline · display lead card
- No-JS: No behaviour — renders as drawn without JS.

### A8-14 Slim Line
- Descriptor: One short quotation on a single line between rules, the attribution inline after it — no head, no card, its own 32 · 44 · 56 padding scale and a 120-character ceiling no other design imposes.
- Archetype: bar
- Tuple: bar · none · page · one · none · one-line ruled quote
- No-JS: No behaviour — renders as drawn without JS (the spec states it is the only design in A8 with no interactive element at all; the 120-character hand-off is measured from the authored string, not at runtime).
- Notes: The spec distinguishes this from A2's bars behaviourally (not sticky, not dismissible, no rotation); structurally the bar archetype's ladder matches — one strip at every width, attribution wrapping to its own line at ≤ 767.

### A8-15 Overlap
- Descriptor: A4·18's shape — a full-bleed image band with a quote card pulled up over its foot; the only design whose geometry depends on the section after it, and the only one that puts text over a photograph.
- Archetype: overlay
- Tuple: overlay · none · image · one · full-bleed · card over photo band
- No-JS: No behaviour — renders as drawn without JS (the spec states no motion at any value — no parallax, no reveal, nothing scroll-linked; the scrim is a static `aria-hidden` sibling `<div>` and the overlap reservation is padding).

## Category summary
- Tuple collisions: none
- Not recoverable: none
- Needs design answer: none — the category's only two behaviours (7 Slider's rail, 11 Faces' tabs) both degrade derivably from the spec's own text: the rail is native CSS overflow with scripted arrows; the tablist's resting DOM (first active, rest `hidden`) fixes the JS-off state.

## A9 FAQ — derived fields (15 designs)

### A9-1 Accordion
- Descriptor: One column of hairline accordion rows on a 780 px measure, centred in the 1,296 width — the design a site reaches for when it types "FAQ", and the one seven others hand off to.
- Archetype: stack
- Tuple: stack · none · page · variable · none · accordion rows
- No-JS: The disclosure is a scripted `<button aria-expanded aria-controls>` / `hidden` pattern — `<details>` is explicitly refused in §0 — so with JS off every closed row renders question-only, its answer in the page source ("not removed, not lazily fetched") but `hidden` and unopenable. At Open on load: First open, the first answer is the drawn load state and stays readable; anchors still scroll to a row but cannot open it.

### A9-2 Two Column
- Descriptor: Two independent lists of 632 px on a 32 px gutter, split by count with the extra row going left — settlement 4, built.
- Archetype: split
- Tuple: split · none · page · variable · none · two-column list
- No-JS: As 1 Accordion — rows render closed, answers present in the source but `hidden` and unopenable (button-driven disclosure, `<details>` refused). The column split and its ≤ 767 stacking are arrangement, not behaviour, and are unaffected.

### A9-3 Open List
- Descriptor: Every answer drawn — question above answer, rows between hairlines, one column on 780, with no button, no marker, no region, and nothing focusable unless a link is authored.
- Archetype: stack
- Tuple: stack · none · page · variable · none · open list
- No-JS: No behaviour — renders as drawn without JS. (The spec states no button, no `aria-expanded`, no region, no hover, no motion, and that print and screen are the same drawing; anchors are native `id`s on the `<h3>`.)

### A9-4 Cards
- Descriptor: One question and its answer per always-open card, three cards of 416 px on a 24 px gutter — A8·2's grid and card carrying a question.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · none · question cards
- No-JS: No behaviour — renders as drawn without JS. (The spec states no button, region, marker, hover or motion, and cards are not links.)

### A9-5 Split Head
- Descriptor: The head in a 416 px column at the left margin, the accordion in an 824 px column at the right, on a 56 px gutter; the head does not move when a row opens.
- Archetype: split
- Tuple: split · none · page · variable · none · side head column
- No-JS: As 1 Accordion (All closed is fixed here) — rows render closed, answers in the source but `hidden` and unopenable. The head column, foot and split are arrangement and are unaffected.

### A9-6 Grouped
- Descriptor: Group labels with their own accordion rows beneath, stacked down one column — the first of three designs that read `groups[]`.
- Archetype: stack
- Tuple: stack · none · page · variable · none · group-labelled sets
- No-JS: As 1 Accordion — every group and label is drawn at all times (labels are not focusable and a group cannot collapse), so only the row disclosure is lost: rows render closed, answers `hidden` and unopenable.

### A9-7 Index
- Descriptor: A jump list of group labels at the left margin, every group of rows at the right — A9's only copy-link affordance and the library's first sticky element inside a section.
- Archetype: edge rail
- Tuple: edge rail · none · page · variable · none · sticky jump index
- No-JS: Rows render closed with answers `hidden` and unopenable (button-driven disclosure, as 1 Accordion), while the index's links still jump — anchors are native `id`s and the spec states "the anchors still work". The copy `<button>` (clipboard write, the two-second "Link copied" swap, the polite live region) and the scroll-following current-group mark are scripted and go inert. NEEDS DESIGN ANSWER: sticky index — the spec states sticky's four conditions but never its mechanism (CSS position vs script), so whether the index still sticks without JS is not derivable.
- Notes: Whether a current-group mark is drawn at rest (before any scroll) is not stated; immaterial to content access.

### A9-8 Contrast Band
- Descriptor: 1 Accordion inverted onto the `contrast` token — switching between this design and 1 Accordion changes nothing but the colours.
- Archetype: stack
- Tuple: stack · none · contrast · variable · none · contrast band
- No-JS: As 1 Accordion — rows render closed, answers in the source but `hidden` and unopenable. The band and its derived colours are token work, not behaviour, and are unaffected.
- Notes: Near-collision with A9-1. The tuples differ only in the emphasis slot, and the spec itself says the switch "changes nothing but the colours" and that "the band is a background, not an element" — the band's own padding scale and Full bleed · Inset control are the only structural remainder. Reported as a finding, not wordsmithed away.

### A9-9 Numbered
- Descriptor: Questions numbered in the pack's heading font at Display 40, the question at Feature 24 beside the numeral, the answer beneath — always open, the design that makes order visible.
- Archetype: stack
- Tuple: stack · none · page · variable · none · display numerals
- No-JS: No behaviour — renders as drawn without JS. (The spec states no button, region, marker, hover or motion, and that print and screen are the same drawing; numbering comes from position in the `<ol>`.)

### A9-10 Image Split
- Descriptor: A photograph on one half, the accordion on the other, both top-aligned on a 32 px gutter — the only design in A9 that reads `image`.
- Archetype: split
- Tuple: split · none · page · variable · left · photograph half
- No-JS: As 1 Accordion for the rows — closed, answers `hidden` and unopenable. The photograph is a native `<img>` with real alt text, not a link and with no hover or motion, so it renders unaffected.
- Notes: Media placement `left` is the first-listed Image side value; the control can flip it to right, and it stacks to top at ≤ 1080.

### A9-11 Tabs
- Descriptor: Group labels as a tab row, one group's questions shown at a time — A5·12's tablist structure and behaviour with A8·11's tab styling.
- Archetype: nav
- Tuple: nav · none · page · variable · none · tab row
- No-JS: Tab switching is scripted (`role="tablist"`, roving tabindex, arrow keys, `aria-selected`); the spec fixes "first tab active on load" with inactive panels `hidden`, so with JS off the first group's always-open rows (3 Open List's rows, no buttons) render readable and every other group stays `hidden` and unreachable — deep links into a non-first group cannot select their tab. Below 767: NEEDS DESIGN ANSWER — the hand-off to 6 Grouped's stack is stated as the drawn arrangement at that width, but whether it is width-driven markup that survives without JS is not stated.

### A9-12 Filter
- Descriptor: A filter field above the accordion, narrowing the list as a reader types — with 7 Index one of the two designs holding twenty-four questions.
- Archetype: stack
- Tuple: stack · none · page · variable · none · filter field
- No-JS: Filtering is stated as client-side over the authored rows, so with JS off the section stands in its stated resting and deep-link state — unfiltered, every authored row drawn, the field empty; typing narrows nothing, and there is no fallback because the spec refuses a `<form>` and a submit button (Enter is a no-op by design). The rows are 1 Accordion's buttons, so answers stay `hidden` and unopenable; the count, `<mark>`, Clear button and no-match state exist only while script-driven filtering runs.

### A9-13 Slim
- Descriptor: Three or four accordion rows in a tight band with no head, its own 32 · 44 · 56 padding scale and a 300-character answer ceiling no other design imposes.
- Archetype: stack
- Tuple: stack · none · page · variable · none · slim band
- No-JS: As 1 Accordion — the three or four rows render closed, answers in the source but `hidden` and unopenable. The 300-character ceiling and list/code hand-offs are editor-side rules, not page behaviour.

### A9-14 Ask
- Descriptor: The accordion with a contact panel at its foot — the section's `note` as one sentence and its link as the only filled accent button in A9.
- Archetype: stack
- Tuple: stack · none · page · variable · none · ask panel
- No-JS: Rows as 1 Accordion — closed, answers `hidden` and unopenable. The panel's button is an `<a href>` styled as a button, "never a `<button>`: it navigates", so the ask link still works without JS.

### A9-15 Ledger
- Descriptor: The question in a 300 px column at the left, the answer on 620 at the right, rows between hairlines — always open, no head, no marker, no button; the category's floor.
- Archetype: table
- Tuple: table · none · page · variable · none · open ledger
- No-JS: No behaviour — renders as drawn without JS. (The spec states no button, no marker, no motion, no tab stop at all with no links authored, and that print and screen are the same drawing.)
- Notes: Archetype is structural only — the collapse ladder is the label-column/value-column pair stacking per row at ≤ 767, a table's ladder — while the spec explicitly refuses `<table>` (and `<dl>`) markup; no contradiction, but stated to prevent misreading.

## Category summary
- Tuple collisions: none — nearest miss is A9-1 vs A9-8, which differ only in the emphasis slot ("accordion rows" vs "contrast band"); the spec itself states the switch "changes nothing but the colours", so the pair may be structurally one design and is flagged for a human look rather than disguised.
- Not recoverable: none — all four fields derived for all fifteen designs.
- Needs design answer: A9-7 Index — whether the index still sticks without JS (the four sticky conditions are stated, the mechanism is not); A9-11 Tabs — whether the ≤ 767 hand-off to 6 Grouped's stack survives without JS (drawn arrangement stated, mechanism not).

## A10 Stats and Numbers — derived fields (15 designs)

### A10-1 Row
- Descriptor: Two, three or four stats in one row of equal cells — the category's default, the row the whole category is measured against.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · display value
- No-JS: No behaviour — renders as drawn without JS.

### A10-2 Cards
- Descriptor: One stat per surface card, for a page whose ground is already busy and needs the numbers to sit on something.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · surface cards
- No-JS: No behaviour — renders as drawn without JS.

### A10-3 Grid
- Descriptor: A hairline matrix in one block — the only design that holds five and six comfortably, and where five is drawn.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · none · hairline matrix
- No-JS: No behaviour — renders as drawn without JS.

### A10-4 Single
- Descriptor: One number as the whole section, at up to 128 px — the design eight others hand off to when only one stat is authored.
- Archetype: stack
- Tuple: stack · none · page · one · none · huge off-ladder value
- No-JS: No behaviour — renders as drawn without JS.

### A10-5 Lead Stat
- Descriptor: One value at Display beside the rest at Row, for a site with one number it wants read first and two or three that support it.
- Archetype: split
- Tuple: split · none · page · few · none · lead/support size pair
- No-JS: No behaviour — renders as drawn without JS.

### A10-6 Split Head
- Descriptor: Head in a 416 column at the left, a 2 × 2 of stats at the right — A8·6's split holding numbers.
- Archetype: split
- Tuple: split · none · page · few · none · head column beside stats
- No-JS: No behaviour — renders as drawn without JS.

### A10-7 Contrast Band
- Descriptor: 1 Row inverted onto the `contrast` token — switching between this design and 1 Row changes nothing but the colours.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · few · none · contrast band
- No-JS: No behaviour — renders as drawn without JS.

### A10-8 Ledger
- Descriptor: Label at the left, value at the right, hairline rows — A9·15's geometry, and the design for six long labels.
- Archetype: table
- Tuple: table · none · page · variable · none · ledger rows
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Archetype is layout only — its within-row collapse (value under label at 1080) is the table ladder; the spec's refusal of `<table>` is semantics, not structure.

### A10-9 Bars
- Descriptor: A proportional bar per stat — the only design that draws anything other than type, and the only one with a precondition (`share` on every drawn stat).
- Archetype: stack
- Tuple: stack · none · page · few · none · proportional bars
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Not the "bar" archetype despite the name — its rows are already full-width and its written Responsive rule collapses nothing (the track narrows, nothing else changes), which is the stack ladder.

### A10-10 Image Split
- Descriptor: A photograph on one half and everything else on the other — the only design in A10 that reads an image, and the only one where the head sits in the column with the stats.
- Archetype: split
- Tuple: split · none · page · few · left · half-width photograph
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Media placement `left` is the control's first-listed side; Image side may be set Right, and at ≤ 1080 the image goes above at both values.

### A10-11 Inline
- Descriptor: The values set inside a sentence, at 34 px in a 20 px paragraph — the one design where a stat has a grammar, and the one that does not draw `label`.
- Archetype: article body
- Tuple: article body · none · page · few · none · in-sentence values
- No-JS: No behaviour — renders as drawn without JS.
- Notes: The chip mechanism is editor-side authoring behaviour, not front-end behaviour; the rendered output is one paragraph.

### A10-12 Sourced
- Descriptor: Numbered footnotes, one per stat, for numbers that came from different places and have to say so — the only design that draws `note`.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · none · numbered footnote markers
- No-JS: No behaviour — renders as drawn without JS.

### A10-13 Slim
- Descriptor: A band 128 px tall with no head, no source line and no link, on its own padding scale — the only design where the label sits beside the value.
- Archetype: bar
- Tuple: bar · none · page · few · none · label beside value
- No-JS: No behaviour — renders as drawn without JS.

### A10-14 Change
- Descriptor: Each value with the figure it replaced — a glyph, a word and the previous number — the only design that reads `prev`.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · none · previous-figure change line
- No-JS: No behaviour — renders as drawn without JS.
- Notes: "Direction is computed only when both figures parse" is a render-time rule, not a client behaviour — consistent with §0's no-behaviour finding; no JS is implied or needed.

### A10-15 Big Type
- Descriptor: One stat per full-width row, the value at 96 px on the left margin and the label in a 416 column at the right — the category's loudest design.
- Archetype: table
- Tuple: table · none · page · few · none · full-row 96px value
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Same layout family as 8 Ledger (two-cell rows, per-row cell stack at the breakpoint) but distinguished by count class and emphasis; the pairing is real and the tuples stay distinct.

## Category summary
- Tuple collisions: none
- Not recoverable: none
- Needs design answer: none

## A11 Logo Walls — derived fields (15 designs)

### A11-1 Row
- Descriptor: Three to six logos in one row of equal cells, each contained in a fixed-height box on one centre line — the default design, and the one eleven others hand off to.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · single row
- No-JS: No behaviour — renders as drawn without JS.

### A11-2 Caption Row
- Descriptor: A short label in a 196 px column at the left and the logos filling the remaining 1,056, all on one line — the only design where type and artwork share a horizontal band.
- Archetype: split
- Tuple: split · none · page · variable · right · label column
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Media placement flips with the Label side control (Left · Right); tuple records the default (label left, logos right).

### A11-3 Grid
- Descriptor: Six to eighteen logos in rows of equal cells, with or without a hairline matrix — the only A11 design that draws more rows than it has counts.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · many · inline · wrapped rows
- No-JS: No behaviour — renders as drawn without JS.

### A11-4 Boxed
- Descriptor: The whole wall inside one `surface` panel with a hairline and the pack's radius, for pages whose ground is already carrying something.
- Archetype: grid-of-N
- Tuple: grid-of-N · card · surface · variable · inline · surface panel
- No-JS: No behaviour — renders as drawn without JS.

### A11-5 Cards
- Descriptor: One logo per card, every card the same height — making a linked logo's target the card rather than the artwork's own box, while linked and unlinked cards look identical at rest.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · bordered cards
- No-JS: No behaviour — renders as drawn without JS.

### A11-6 Split Head
- Descriptor: Head, sub, note and link in a 416 column at one side; the wall in the 824 at the other — A8·6's split and A10·6's division carried forward verbatim.
- Archetype: split
- Tuple: split · none · page · variable · right · head column
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Media placement flips with the Head column control (Left · Right); tuple records the default (head left, wall right).

### A11-7 Contrast Band
- Descriptor: 1 Row inverted onto the `contrast` token — a band that always wants the opposite logo file from the mode it is in, reading `logoDark` in light mode and `logo` in dark.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · variable · inline · contrast band
- No-JS: No behaviour — renders as drawn without JS. The mode-dependent file swap is a `<picture>` `prefers-color-scheme` source (inverted here), which is native HTML, not script.

### A11-8 Marquee
- Descriptor: Eight to twenty-four logos on a track that runs continuously in one or two rows — the category's one behaviour and its only motion, with no cell grid at all.
- Archetype: carousel
- Tuple: carousel · none · page · many · full-bleed · marquee scroll
- No-JS: NEEDS DESIGN ANSWER: marquee transport + pause button — the spec fixes the motion (list duplicated with `aria-hidden` copies, translated by its own width, 20/32/48 px per second linear, focus pauses, hover does not) but never states whether the transport is CSS animation or script, and the pause button is an `aria-pressed` toggle that cannot function without script; no no-JS state is declared. The stated static fallbacks (print's wrapped wall, reduced-motion's hand-off to 3 Grid) are tied to print and `prefers-reduced-motion`, not to script absence, so the no-JS rendering is not derivable.

### A11-9 Rail
- Descriptor: One line of logos wider than the window, scrolled only when the reader moves it — the one design with a precondition, measured against the viewport at render.
- Archetype: carousel
- Tuple: carousel · none · page · many · full-bleed · reader-driven scroll
- No-JS: Degrades to its own specced arrow-less state: the track is a reader-scrolled container (`tabindex="0"` at every width, `smooth` becoming `auto` — CSS scroll-behavior values — and at ≤ 767 the design already runs with arrows dropped and touch scrolling it), so scrolling by the reader survives. The "Scroll left" / "Scroll right" buttons, which step the scroll by viewport-minus-96 and toggle `aria-disabled`, do nothing.
- Notes: Two sub-mechanisms have no stated implementation layer, so their no-JS state is not derivable: the 96 px mask "at an overflowing end only" (depends on scroll position) and the measured-at-render precondition that hands off to 1 Row when the list fits the viewport.

### A11-10 Slim
- Descriptor: A band 92 to 148 px tall with no head, no note and no link — three to six marks and nothing else, the one design in A11 with no type in it at all.
- Archetype: bar
- Tuple: bar · none · page · variable · inline · typeless band
- No-JS: No behaviour — renders as drawn without JS.

### A11-11 Named
- Descriptor: A caption under each logo — the only design in A11 that draws `caption`, carrying the category's one equalisation (caption block equalised to the tallest caption per row).
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · inline · per-logo captions
- No-JS: No behaviour — renders as drawn without JS.

### A11-12 Tiers
- Descriptor: Two groups at two box sizes — the first one, two or three logos at Huge 64 or Large 48, the rest at Small 28 — the only design that draws two logo sizes in one section.
- Archetype: stack
- Tuple: stack · none · page · variable · inline · two-size tiers
- No-JS: No behaviour — renders as drawn without JS.

### A11-13 Dense
- Descriptor: Twelve to twenty-four marks at Tiny 22, six to ten across, reading as a texture rather than as individual marks — the one design where the aspect classes stop governing.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · many · inline · dense texture
- No-JS: No behaviour — renders as drawn without JS.

### A11-14 Inline
- Descriptor: Two to four marks set inside a sentence, on the line — a logo as the object of a verb rather than an item in a list, the one design with no list and no arrangement to collapse.
- Archetype: article body
- Tuple: article body · none · page · few · inline · marks inside sentence
- No-JS: No behaviour — renders as drawn without JS. (The chip's dashed outline and padding are editor-only and never published.)

### A11-15 Big Type
- Descriptor: A title at Display 48 on a 1,040 measure with three marks at Huge 64 beneath it, or four at Large 48 — the only design where the type is louder than the artwork.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · inline · display-size title
- No-JS: No behaviour — renders as drawn without JS.

## Category summary
- Tuple collisions: none
- Not recoverable: none
- Needs design answer: A11-8 Marquee — no-JS state of the transport and the pause button (implementation layer never stated; declared fallbacks are for print and reduced motion, not script absence). A11-9 Rail — partial only: the overflowing-end-only fade mask and the measured-at-render hand-off to 1 Row have no stated mechanism; the core reader-scroll degradation is derived.

## A12 About and Team — derived fields (15 designs)

### A12-1 Grid
- Descriptor: Three to twelve people, photo above name and role, three to five across — the default grid that ten other designs hand off to.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · plain photo grid
- No-JS: No behaviour — renders as drawn without JS.

### A12-2 Cards
- Descriptor: One person per card on a plane with a hairline — the only design in A12 with a card, for a team with bios.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · hairline card plane
- No-JS: No behaviour — renders as drawn without JS.

### A12-3 Rows
- Descriptor: Full-width rows with the photograph at the left and name, role and the category's longest bio (≤ 400) at the right.
- Archetype: feed
- Tuple: feed · none · page · variable · left · full-width bio rows
- No-JS: No behaviour — renders as drawn without JS.

### A12-4 Story and Team
- Descriptor: The about paragraphs and a group photograph above the team — the design the category is named for, and the only one that reads `image` and `imageAlt`.
- Archetype: stack
- Tuple: stack · none · page · variable · inline · story above roster
- No-JS: No behaviour — renders as drawn without JS.

### A12-5 Split Head
- Descriptor: Head and story in a 416 column with the people in the 824 beside it — the design for a long sub.
- Archetype: split
- Tuple: split · none · page · variable · top · narrow head column
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Person-card photo sits above the name at Counts Three and Four but beside it at Count Two; `top` reflects the stacked counts (no default count is marked).

### A12-6 Portraits
- Descriptor: Two or three editorial portraits at a named crop, the name under the image or set over it on a scrim — the one design in A12 with a scrim.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · top · editorial portrait crops
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Media placement is `top` per Caption Under the image; at Caption Overlaid the name moves onto the image (no default is marked between the two values).

### A12-7 Contrast Band
- Descriptor: 1 Grid inverted onto the `contrast` token at the band's own vertical scale, needing no extra upload of any kind.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · contrast · variable · top · inverted contrast band
- No-JS: No behaviour — renders as drawn without JS.
- Notes: The spec states this design's DOM and announcement are 1 Grid's exactly; only the emphasis slot (the band) separates its tuple from A12-1 — the nearest thing to a real collision in the category.

### A12-8 Founder
- Descriptor: One person — portrait, name, role and the 900-character letter — the team of one that every grid design hands off to.
- Archetype: split
- Tuple: split · none · page · one · left · split biography
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Image side is author-set (Left · Right) with no marked default; `left` is the listed-first value.

### A12-9 Faces
- Descriptor: Eight to twenty-four people, four to eight across, a circle and a name and nothing else — the only design in A12 that refuses the role.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · many · top · dense face wall
- No-JS: No behaviour — renders as drawn without JS.

### A12-10 Directory
- Descriptor: Names and roles in hairline rows in one, two or three columns — the one design in A12 that draws no photograph at any setting.
- Archetype: table
- Tuple: table · none · page · variable · none · hairline name ledger
- No-JS: No behaviour — renders as drawn without JS.
- Notes: Visually tabular (rows share heights, hairlines align across columns) but explicitly not a `<table>` and not marked up as columns; `table` is the structural archetype, not the semantics.

### A12-11 Slim
- Descriptor: A 96 to 144 px band of overlapped faces, one sentence and the section link at the far end — the shortest section in A12 and the only one with no heading of any kind.
- Archetype: bar
- Tuple: bar · none · page · variable · left · overlapped face strip
- No-JS: No behaviour — renders as drawn without JS.

### A12-12 Big Type
- Descriptor: One sentence at Display 48 on a 1,040 measure with a single row of three or four people under it — the only design in A12 that offers Display 48.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · few · top · display-size statement
- No-JS: No behaviour — renders as drawn without JS.

### A12-13 Rail
- Descriptor: One line of portrait cards wider than the window, scrolled by the reader — A11·9's rail carried over verbatim with the person card at a named crop.
- Archetype: edge rail
- Tuple: edge rail · none · page · many · top · reader-scrolled overflow track
- No-JS: NEEDS DESIGN ANSWER: reader-scrolled rail (arrows, end fades, measured precondition) — the spec defines print and reduced-motion fallbacks but never states a script-off state: whether the track is a native overflow container that still scrolls, what the arrow buttons and the content-dependent end fades do without script, and whether the measured "cards not wider than the content width → draw as 1 Grid" precondition can run at all.

### A12-14 Reveal
- Descriptor: 1 Grid where each person's bio opens on a button in their own card — for the team that has twelve bios and no room for twelve bios.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · per-card bio disclosure
- No-JS: Buttons are inert and bios stay in their Start state — all hidden, or the first open at Start First open — since each bio sits in the DOM toggled with `hidden`. Nothing can open or close without script; a person with no bio has no button either way.

### A12-15 Groups
- Descriptor: People under labelled headings, regrouped by reading the authored `group` field rather than by sorting — the one design in A12 that regroups the list.
- Archetype: grid-of-N
- Tuple: grid-of-N · none · page · variable · top · grouped roster
- No-JS: No behaviour — renders as drawn without JS.

## Category summary
- Tuple collisions: none exact. Five tuples (A12-1, A12-2, A12-7, A12-14, A12-15) share the first four slots (grid-of-N · horizontal · variable · top) and are separated only by their emphasis slot. For 2, 14 and 15 the emphasis names a genuine structural addition (a drawn card plane, a disclosure button and behaviour, `<h3>` group blocks). A12-7 vs A12-1 is the honest borderline: the spec itself states 7's DOM and announcement are 1 Grid's exactly, so its only separating device is a background band and spacing scale — flagged in 7's notes as a finding rather than resolved by wordsmithing.
- Not recoverable: none.
- Needs design answer: A12-13 Rail — No-JS state of the scroll track, arrows, end fades, and the measured 1 Grid precondition.

