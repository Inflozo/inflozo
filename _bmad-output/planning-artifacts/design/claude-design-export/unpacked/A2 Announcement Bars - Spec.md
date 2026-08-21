# A2 · Announcement Bars — written specification

Pack drawn: **Paper**. **All 15 designs complete.**. Category artefacts — the four settlements, stack checks, tokenisation proof, stress frame, shared field list, roster — are in **A2-0 Category Proof.dc.html**.

Frames: `A2-1 Rule` · `A2-2 Split` · `A2-3 Badge` · `A2-4 Two-Line` · `A2-5 Capture` · `A2-6 Countdown` · `A2-7 Dateline` · `A2-8 Ticker` · `A2-9 Rotator` · `A2-10 Pill` · `A2-11 Toast` · `A2-12 Takeover` · `A2-13 Consent` · `A2-14 Edge` · `A2-15 Triple` (all `.dc.html`).

**Frame set per design:** desktop 1440 light (primary, drawn above A1·1 Rail) · a states frame at 1440 showing hover, focus-visible and pressed · the design's behaviour states · tablet 834 · mobile 390 twice — once with the short fields authored, once without · dark desktop 1440 · an annotated accessibility frame · the control panel · the spec card.

---

## 0 · Category-wide rules

These apply to all 15 designs and are not repeated per design.

**Height as a control is not universal.** Nine designs carry a Height control: Rule, Split, Badge, Two-Line, Capture, Dateline, Ticker, Rotator, Takeover. Six do not, each spending the slot elsewhere or fixing the height by construction — Countdown ties height to Clock style (56 with boxes, 44 inline), Consent has Padding instead, Toast has Width instead, Pill is fixed at 48/52 px, Edge is the Rule weight collapsed and 44 px plus the rule open, and Triple's band is fixed at its slot height. Each is named in its own spec.

**Placement is not universal either.** Ten of the thirteen top designs offer In flow · Sticky: Rule, Split, Badge, Two-Line, Capture, Countdown, Dateline, Ticker, Pill, Edge. A2·9 Rotator is In flow only — a bar that changes its text every six seconds should not follow the reader down the page — A2·12 Takeover is In flow only too — 200 px must not follow the reader — and A2·15 Triple is In flow only as well, and A2·11 Toast and A2·13 Consent are bottom-anchored, floating. Two designs carry Sticky with a *not recommended* note: A2·4 Two-Line (144 px pinned) and A2·8 Ticker (moving text that follows the reader).

**Placement.** First element in the body after the skip link, above `<header>`, on every template. **One A2 per site** — the category is site-wide furniture, not a message queue; simultaneous messages are what Ticker and Rotator are for. The two bottom-anchored designs (A2·11 Toast, A2·13 Consent) are not in the top stack and may coexist with one top bar.

**Grounds and hairlines.** A bar whose ground differs from the header's draws no bottom hairline — two grounds meeting is separation enough. When the grounds match, the bar owns the hairline and the header keeps its own. When sticky, the bar drops its hairline and the header's md shadow carries both bands.

**Height and reflow.** Every top bar is in flow: it pushes the page and the header down and scrolls away with them. **Placement: In flow · Sticky** is a control on ten of the thirteen top designs — Rotator, Takeover and Triple are In flow only; Sticky pins the bar above a sticky header and the two heights sum into one offset, which every in-page anchor uses as its `scroll-margin-top`. Height is measured, never assumed — no design hard-codes 44 px. Height is reserved on first paint and the dismissal state is read before paint, so a dismissed bar never flashes. The bar never changes height on scroll; only the header shrinks.

**The Compact ceiling.** When the header below has more than one row (A1·3 Stacked Masthead, A1·8 Utility + Nav), the bar's Height control defaults to Compact and Spacious is disabled, with the reason shown. 138 px of furniture above a headline is the ceiling. *Flagged: mine, and it is the one place in the library where a section's control set depends on its neighbour.*

**Above A1·4 Overlay.** The bar is opaque and in flow, so the hero starts below it and the transparent header still overlays image, never band. The bar is never given a transparent or scrim treatment. When the bar is sticky above Overlay, the header's *solidify* threshold is measured from the bottom of the bar.

**Dismissal.** Close sits at the right end: a 32 px box in a 44 px hit area at desktop, a full 44 px target at ≤ 767, moving to the block's top-right whenever the bar is more than one line. Dismissal collapses the height to zero over 160 ms; the sticky offset and every anchor's scroll-margin recompute in the same frame, and if the reader has scrolled, the scroll position is reduced by the bar's height so the words under the pointer do not move. Under reduced-motion the bar is removed instantly, with the same scroll correction. Focus moves to the header's first focusable item, never to nothing.

**Dismiss memory.** `dismissMemory`: This session · **30 days (default)** · Never comes back · Always shows. Stored per browser against a hash of the bar's content, so editing the message brings the bar back immediately.

**Audience.** `audience`: Everyone · Logged out · Free members · Paid members. Member state comes from the same Ghost source as A1·14's member block; with members disabled in Ghost the control collapses to Everyone and says why. The editor sidebar carries a **Preview as** switcher (Everyone / Logged out / Free / Paid) and the canvas renders exactly what that reader would get. When the preview audience is not the targeted one, the bar renders normally with a dashed outline and the line "Not shown to free members" in the editor chrome — never dimmed, because a dimmed bar reads as a disabled bar.

**The Visibility group.** `audience`, `dismissible` and `dismissMemory` live in a shared **Visibility** group below each design's own controls and do not count against the 6-control norm.

**Accent on contrast.** On a contrast or accent ground the inline link is the carried text colour with a 50%-opacity underline, never accent, and a button inverts to the pack's lightest surface with contrast-coloured text. The rule is set by the worst pack: Paper's accent on near-ink measures 4.85:1 (AA at 14 px, only just) and Ink's dark accent on its pale contrast measures 2.9:1 (fail). Accent links are permitted on background and surface grounds only; the Link style control shows the disabled value with its measured ratio.

**Accent budget.** Once per bar. The permitted uses are: the button's fill, Badge's label pill, and Edge's 4 px rule. Rule spends none — the band is the emphasis.

**Type floors.** Message 14 px, never below, at every width. Label 12 px / 600 in a pill, 13 px / 600 as an eyebrow. Meta 13 px. Tap targets 44 px.

**Motion.** 160 ms ease-out, one transition per state change. Dismissal, hover, focus and the arrow's 2 px travel are the only motion in the text bars; Ticker and Rotator add their own, both suppressed under `prefers-reduced-motion`. Nothing animates while the section is being edited.

**Content parity.** Every frame of a design draws the same authored content. Only what a stated rule names may differ by width — a dropped link label, a wrapped message, a stacked button. The two mobile frames are the exception the rules name: one with `messageShort` / `ctaLabelShort` authored, one without.

**Accessibility floor.** The bar is `<aside aria-label="Announcement">` before `<header>`. The skip link stays first in focus order at every width. No heading inside the bar — it is a sentence, not a section. Close is `<button aria-label="Dismiss announcement">`. Not a live region: the bar is present at page load, so it is read in document order rather than interrupting. Link and button labels must stand alone out of context.

**Empty-data floor.** Empty `message` → the bar does not render at all; a bar with no sentence is nothing, not an empty state. Missing `ctaUrl` → the button renders as plain text and the editor flags it rather than shipping a dead button. Fields a design does not display are kept, not cleared, and reappear on switching to a design that shows them.

**Shared field list.** In A2-0. The union of all fifteen designs' needs; any design may use fewer, none may need a field that is not on it.

---

## 1 · Rule

One line on the contrast band, optically centred, close at the right end. The baseline, and the fallback for designs whose preconditions are absent. Spends no accent.

**Content fields.** `message` (rich text, req, ≤ 120 chars, bold + one inline link) · `messageShort` (text, opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · `dismissible` · `audience` · `dismissMemory`.

**Controls.**

| Control | Values |
|---|---|
| Ground | Contrast · Surface · Accent |
| Height | Compact 36 · Comfortable 44 · Spacious 56 |
| Alignment | Centred · Left |
| Link style | Inline link · Underlined text · None |
| Placement | In flow · Sticky |
| Dismissible | On · Off |

**Data.** Nothing from Ghost except member state, for audience. Members disabled → audience collapses to Everyone with the reason shown.

**Responsive.** 1440–768 identical but for padding (64 → 56) and the close inset (20 → 14); one line, centred, height held at the Height control's value. ≤ 767 the band grows 44 → 48 so the close can be a 44 px target without overhanging; `messageShort` is used if set, otherwise the sentence wraps, the band left-aligns and grows to fit, two lines maximum — a third is clipped with an ellipsis and the editor says so. The link stays inline with the text at every width.

**Behaviour.** *Sticky*: bar pins above the header, combined offset (44 + 56 = 100 at Comfortable with A1·1 shrunk), bar height unchanged. *Dismissed*: as the category rule.

**Empty state.** No link → the sentence sits alone, still centred. No message → no bar.

**Accessibility.** Category floor. Carried text on contrast is 13.9:1 in Paper light, 12.6:1 in Paper dark. The 50%-opacity underline is decoration; the link is also distinguished by weight.

**Flagged as mine.** The 30-day default, the two-line mobile cap, the 48 px mobile band, and the scroll-compensation rule.

---

## 2 · Split

Message at the left margin, one button at the right, hairline under. On `surface` by default — a raised strip above the header rather than a band across it. The button is the bar's single accent.

**Content fields.** Shared list. Uses `message` (a trailing clause may be marked muted), `messageShort` (≤ 40 here), `ctaLabel` + `ctaUrl` (≤ 18), `ctaLabelShort` (≤ 12). Does not display `label`, `linkLabel`, `headline`, `body` — all kept.

**Controls.**

| Control | Values |
|---|---|
| Ground | Surface · Contrast · Background |
| Height | Compact 48 · Comfortable 56 · Spacious 68 |
| Action | Button · Text link · None |
| Width | Match header · Full bleed |
| Divider | Hairline · Shadow · None |
| Placement | In flow · Sticky |

**Data.** Member state only. No `ctaUrl` → the label renders as plain text and the editor flags the missing link.

**Responsive.** 1440–768 one row: message left on the header's own margin, button right on the header's right margin, both hold. Padding 72 → 40, button padding 9 × 17 → 8 × 15. The row breaks to two when the gap between sentence and button would fall below 24 px — a content threshold, not a width one. At 390 with a full-length message that always happens: the message wraps, the button drops to its own row and hugs the left edge (a full-width accent bar directly above a header holding another accent button reads as two competing primaries), the close moves to the top-right aligned to the first text line, bar ≈ 104 px. With `messageShort` and `ctaLabelShort` both set, 390 holds one row at 58 px.

**Behaviour.** *Sticky*: 56 + 56 = 112 px of pinned furniture with two accent buttons on one edge — the editor recommends Ground: Contrast, under the Ground control. Recommends, not enforces. On a contrast ground the button inverts to the pack's lightest surface and the bar spends no accent.

**Empty state.** Action: None → the sentence spans and the bar keeps its height. No message → no bar.

**Accessibility.** Category floor. The muted trailing clause is part of the same paragraph, not a separate element — quieter, not less important. Focus order: message link if any, then button, then close. Accent fill with a white label is 3.6:1 at 14 px / 600 — under AA — so the pack's darkened accent is what renders on fills, and the sidebar disables any Ground whose button pairing drops below 4.5:1, showing the ratio.

**Flagged as mine.** The 24 px gap threshold, the 40-character preview-pair trigger, the left-aligned rather than full-width mobile button, and the Ground recommendation under Sticky.

---

## 3 · Badge

A short label, then the sentence, then a text link — left-aligned on the page's own ground, separated from the header by one hairline. The bar with no band.

**Content fields.** Shared list. Uses `label` (≤ 14 chars, never truncates; longer values are rejected in the editor with the count shown), `message`, `messageShort` (≤ 44), `linkLabel` + `linkUrl` (≤ 24).

**Controls.**

| Control | Values |
|---|---|
| Label style | Accent pill · Outlined pill · Eyebrow caps · None |
| Ground | Background · Surface · Contrast |
| Height | Compact 40 · Comfortable 48 · Spacious 60 |
| Alignment | Left · Centred |
| Link style | Arrow link · Underlined · None |
| Placement | In flow · Sticky |

**Data.** Member state only. Nothing here reads posts or tags: a future design wanting "latest post title" needs a new field on the category list, not a silent Ghost lookup.

**Responsive.** 1440–768 one line: label, sentence, link, close at the right edge; padding 72 → 40, gaps 14 → 10. Truncation priority is fixed — the label never truncates, the link never truncates, so the sentence shortens: to `messageShort` if set, by ellipsis on one line if not. ≤ 767 the link label and its arrow are dropped and **the whole bar becomes the link**; the label stays inline if `messageShort` is set, otherwise it moves above the sentence with left edges aligned at 20 px (an inline pill pushes a two-line sentence into three). Bar 52 px one-line, ≈ 86 px stacked.

**Behaviour.** *Sticky*: the bar's hairline is dropped and the header's md shadow carries both bands — two grounds this close in tone plus two hairlines 48 px apart reads as a smear when it floats over content. Combined offset 104 px. *Hover*: the arrow moves 2 px right, the only movement in the design. **Label style: None** makes this design A2·1 Rule set to Left on background; the sidebar says so and offers the switch, and the `label` field is kept.

**Empty state.** No label → see above. Link style: None → sentence alone, left-aligned, and the whole-bar tap target does not apply at any width.

**Accessibility.** The label is text inside the same paragraph as the sentence, so it is read: "New. Field Notes is now a weekly column, written by Mara Ellison." At ≤ 767 the bar's accessible name is the sentence plus the label — the name does not shrink when the visible link label does. The close sits **outside** the bar link and later in focus order; that is the one DOM constraint this design imposes. Accent pill: carried background on accent is 4.9:1 in Paper light, 8.1:1 in Paper dark. Outlined pill in Paper light is 4.85:1 — AA, shown in the sidebar because two packs fail it and disable the value.

**Flagged as mine.** The 14-character label cap, the whole-bar tap target at ≤ 767, the truncation priority order, and dropping the hairline when sticky.

---

## 4 · Two-Line

A headline in the pack's heading font over one line of body, centred, action at the right end. The tallest of the text bars and the category's one display moment.

**Content fields.** `headline` (text, opt, ≤ 60) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `ctaLabelShort` (opt, ≤ 12). `message` is kept and is what appears if the user switches to designs 1–3, so a bar authored here never arrives empty there.

**Controls.**

| Control | Values |
|---|---|
| Ground | Contrast · Surface · Accent |
| Headline size | Small 19 · Medium 22 · Large 26 |
| Height | Compact 72 · Comfortable 88 · Spacious 104 |
| Text alignment | Centred · Left |
| Action | Button · Text link · None |
| Placement | In flow · Sticky (marked *not recommended* — 144 px pinned with a sticky header) |

**Data.** Member state only. Neither headline nor body is pulled from Ghost. Both empty → no bar.

**Responsive.** 1440–900 as drawn: text centred on the full width, button placed at the right end and close in the top-right corner, so neither shifts the centring. Below 900 px of usable width the design **re-arranges** — the button centres under the body and the band becomes a padded block, 118 px at 834 — because the body line and a right-hand button cannot both hold and 15 px body is the floor. ≤ 767 the text goes left-aligned (three ragged centred lines at 20 px is the one thing this design cannot survive), headline 22 → 20, body 15 → 14, button hugs the left edge as in A2·2; bar 168 px. Nothing is dropped at any width.

**Behaviour.** *Sticky*: 144 px of pinned furniture, allowed but not recommended, stated in the sidebar under Placement. Button hover on an inverted fill brightens one step to the pack's whitest surface rather than darkening, since there is no accent to darken.

**Empty state.** No body → the band closes to 72 px and the headline centres alone; the headline does not grow to fill the space. No headline → the body is promoted into the headline's slot and font, because a bar whose only text is 15 px muted reads as disabled. At 390 the no-body case is 122 px instead of 168, and the gap between headline and button opens 8 → 10 so the pair does not read as one block.

**Accessibility.** The headline is a `<p>` in the heading font, **never** a heading element: the bar sits above the page's own h1, and a heading here would put site furniture at the top of every page's outline. This is the design that tests that floor. DOM order is headline, body, action, close at every width, including where the action moves. Contrast: headline 13.9:1, body at 72% carried 8.4:1; in dark the body moves to 68% for 5.1:1 — the one value that changes per mode.

**Flagged as mine.** The 900 px re-arrangement trigger, the three headline sizes and the 26 px ceiling, the 72% → 68% dark body opacity, and the "not recommended" label on Sticky.

---

## 5 · Capture

One sentence and an email field, subscribed without leaving the page. The only design that takes input — so the only one with focus, error, submitting and success states — and the only one that becomes a different design when members are off.

**Content fields.** `message` (rich text, req, ≤ 120 — a trailing clause may be marked muted and is the first thing dropped) · `emailPlaceholder` (text, opt, ≤ 28, default "you@example.com") · `submitLabel` (text, opt, ≤ 14, default "Subscribe") · `successMessage` (text, opt, ≤ 60, default "You're in. Check your inbox to confirm the address."). The error line is fixed copy, not a field: it has to match what the API actually rejected.

**Controls.**

| Control | Values |
|---|---|
| Ground | Surface · Background · ~~Contrast~~ (disabled — a field on a contrast band needs a surface step the packs do not define) |
| Height | Compact 56 · Comfortable 64 · Spacious 76 |
| Field width | Narrow 200 · Medium 240 · Wide 320 |
| Submit style | Button beside · Inside field · Icon only |
| Sentence | Before field · Above field · Hidden |
| Placement | In flow · Sticky |

**Data.** Posts to Ghost's members subscribe endpoint; the reader gets Ghost's own confirmation email. An already-subscribed address gets Ghost's response, shown in the success slot. **Members off in Ghost → this design renders as A2·2 Split** at 56 px: the sentence holds, the field is replaced by a button carrying `submitLabel`, linking to the site's subscribe page, and the sidebar states the substitution with a link to Ghost's setting. `emailPlaceholder` and `successMessage` are kept and return when members are switched on.

**Responsive.** 1440–1024 as drawn: sentence left, field and submit right, close at the end. 834: field steps one named value down (Medium 240 → Narrow 200) and the muted clause is dropped; the field never goes below 200 px, because 14 px email text needs about 22 visible characters. ≤ 767: field and submit take a full row and both grow to 44 px — the only place in the category where a control gets taller on a phone — and field text goes 14 → 15 px so iOS does not zoom the viewport; bar 118 px. The sentence itself is never shortened here; it is the reason to type.

**States.** *Focus*: 1.5 px accent border on the field, library ring suppressed — the 2 px ring at 2 px offset would collide with a button 10 px away. This is the one documented departure from the library focus shape, and it is why the gap is 10 px. *Invalid*: the sentence is replaced by the error in `text`, field border 1.5 px `text`, **no red anywhere** — the seven roles contain no error colour. *Submitting*: label becomes "Subscribing…", one 160 ms accent step, field disabled on the pack's hover surface; no spinner, so nothing to suppress. *Success*: field, button and sentence are replaced by a centred confirmation with a 20 px accent check; 64 px at desktop, and at 390 the bar collapses 118 → 66 px. That is one of two reader-caused after-load height changes in the category — the other is A2·14 Edge opening — allowed because the reader caused it, it sits below the header, and the alternative is holding 52 px of empty white. Success then counts as dismissed for the full memory period — a subscriber is not asked twice.

**Empty state.** Empty message → the field spans and the bar keeps its height.

**Accessibility.** Visually-hidden `<label>Email address</label>` — the placeholder is never the label. `type="email"`, `autocomplete="email"`, `inputmode="email"`. The sentence is the form's description via `aria-describedby`, so it is read when focus reaches the field. Error and success render into one `aria-live="polite"` region in the sentence's place; on error focus stays in the field, on success focus moves nowhere. Close sits outside the form, last in focus order. With Submit style: Icon only the button's accessible name is `submitLabel`, which stays required. Placeholder on background is 4.7:1.

**Flagged as mine.** The suppressed focus ring, the 200 px field floor, the 15 px mobile field text, the error state's wording, and the absence of an error role in the packs.

---

## 6 · Countdown

A sentence, a clock and one action. The only design whose content changes without anyone editing it, so expiry is a specified state.

**Content fields.** `message` (rich text, req, ≤ 120 — **must name the deadline in words**; the editor warns if `endsAt`'s date does not appear in it) · `endsAt` (datetime, required for this design, site time zone from Ghost) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `expiredMessage` (text, opt, ≤ 120) · `expiredCtaLabel` (text, opt, ≤ 18). The last two are **added to the category field list** by this design.

**Controls.**

| Control | Values |
|---|---|
| Ends | Datetime, site time zone |
| Units | Days, hours, minutes · Hours and minutes · Days only |
| Clock style | Boxes · Inline text |
| When it ends | Hide bar · Keep, drop clock |
| Ground | Contrast · Surface · Accent |
| Placement | In flow · Sticky |

No Height control: height follows Clock style — 56 with boxes, 44 inline.

**Data.** Member state for audience; time zone from Ghost's site setting. No `endsAt` → the bar renders as A2·2 Split and the sidebar says the clock is waiting for a date.

**Responsive.** 1440–768 one centred group — sentence, clock, action — with the close at the right end so changing digits never move the group's optical centre; numerals are tabular, a requirement on the pack's body font. Group gap 20 → 14 and box minimum 38 → 36 at 834; all three units and the full sentence hold. ≤ 767 two rows: sentence, then clock and action with the button pushed right; bar 109 px. Clock style: Inline text is the same 109 px at this width — the sentence still wraps to two lines and the button still takes its own row, so inline buys height only at 768 and above, where the band is 44 instead of 56. Inline then shows two units above an hour, because a clock inside a sentence that re-flows every minute is a sentence that moves while you read it.

**Behaviour.** Above an hour the clock updates once a minute. Under an hour seconds appear and the sentence switches to "ends tonight at 23:59 (UK)" — from the same `endsAt`, not a second authored string; the zone is named whenever the deadline is inside 24 hours. A unit reading zero is removed, not shown as "00". Digits are replaced in place with no transition, so there is nothing to suppress under reduced-motion and no pause control is required. Expiry follows the control; a bar already on screen when the deadline passes switches to the expired sentence rather than vanishing under the reader. The clock has no hover state and is not focusable.

**Empty state.** No CTA → sentence and clock centre alone. Expired with *Keep, drop clock* → boxes removed, height unchanged, expired copy in place.

**Accessibility.** The sentence names the deadline in words, so the bar is complete without the clock — that requirement shapes the design. The clock is `<time datetime="…">` carrying visually-hidden prose ("2 days, 14 hours and 9 minutes left") with the boxes `aria-hidden`; `aria-live="off"`, because a clock announcing itself every minute — every second in the last hour — would make the page unusable. Focus order: action, then close. Contrast: sentence and digits 13.9:1; the 9 px unit labels at 66% carried measure 7.2:1, and 9 px is permitted only because each label duplicates a word already in the sentence.

**Flagged as mine.** The one-hour seconds threshold, dropping zero units, naming the time zone inside 24 hours, the 9 px unit labels, tying height to Clock style instead of a Height control, and the two new expiry fields.

---

## 7 · Dateline

An eyebrow and a sentence at the left margin, publication meta at the right, no button. The masthead-adjacent bar, and the first design in the category that reads content from Ghost.

**Content fields.** `label` (text, opt, ≤ 14, never truncates) · `message` (rich text, req, ≤ 120, may carry one inline link) · `messageShort` (text, opt, ≤ 44) · **`metaText`** (text, opt, ≤ 28 — **added to the category list** by this design) · `linkLabel` + `linkUrl` (opt pair, used by Meta: Link).

**Controls.**

| Control | Values |
|---|---|
| Meta | Latest post date · Custom text · Link · None |
| Label style | Eyebrow · Pill · None |
| Ground | Background · Surface · Contrast |
| Height | Compact 40 · Comfortable 48 · Spacious 60 |
| Link style | Inline · Underlined · None |
| Placement | In flow · Sticky |

**Data.** The category's only content binding. **Meta: Latest post date** reads `published_at` — the current post's on a post template, the newest published post's everywhere else — and is labelled "from Ghost" in the sidebar. Custom text is the default, so no site gets a date it did not ask for. No posts published → the meta slot and its hairline divider are removed; never a dash, never today's date as a stand-in, never an empty gap for the close to float in. Meta: Link puts A2·3's arrow link in the meta slot, replacing the meta rather than joining it.

**Responsive.** 1440–1024 as drawn: eyebrow, sentence, meta right, divider, close. 834: the date steps to its medium form ("Wednesday 12 March" → "Wed 12 Mar") before anything else moves — the date has three authored lengths and the sentence has two; padding 72 → 40, gaps 16 → 12. ≤ 767 the meta leaves the right end and joins the eyebrow on row one in its short form ("12 Mar"), the sentence takes the full measure below, and the divider is dropped because meta and close are no longer adjacent; bar 82 px. Truncation priority as A2·3: label never, link never, meta before the sentence.

**Behaviour.** Above a multi-row header the Compact ceiling applies, and the sidebar adds a second note: **Meta: None is recommended when the header below shows a date.** Recommended, not enforced — the bar's date is the issue's and the masthead's is today's, and there are mastheads where both belong.

**Empty state.** Meta: None → the slot goes, the sentence stays on the left margin, height unchanged. Label None + Meta None + `messageShort` set → the design is A2·1 Rule set to Left, and the sidebar offers the switch; both fields are kept.

**Accessibility.** The eyebrow is text in the same paragraph as the sentence ("Issue 47. Out now: …"), not a heading. The date is `<time datetime="2026-03-12">` with its long form as the visible text, so no hidden duplicate is needed; the visible text shortens at ≤ 767 and the attribute does not. An inline link inside the sentence is distinguished by colour alone at rest, which fails 1.4.1 — so the underline appears on hover **and** on focus, and **Link style: Underlined is the accessible default the sidebar recommends**. This is the only place in A2 where the drawn default and the accessibility recommendation differ. Contrast on background: sentence 13.2:1, muted meta 5.4:1, accent eyebrow 4.85:1 at 13 px / 600.

**Flagged as mine.** `metaText` and its 28-character cap, the three date forms, dropping the divider at 390, the Ghost date binding, and the Meta: None recommendation above a dated masthead.

---

## 8 · Ticker

Several notices on one continuously moving strip, with a pause control that is not optional. The resting state the editor shows is deliberately not the state most readers see: motion does not run while editing.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `linkLabel` ≤ 24, `linkUrl` }, req, **2–6 items** — one message is not a ticker, and the editor says so and offers A2·1). Uses no label, headline, body, image or clock; all are kept.

**Controls.**

| Control | Values |
|---|---|
| Messages | The list itself, up to 6, drag to reorder |
| Speed | Slow 40 px/s · Medium 60 · Fast 90 |
| Separator | Dot · Slash · Wide space |
| Ground | Contrast · Surface · Accent |
| Height | Compact 36 · Comfortable 44 · Spacious 56 |
| Placement | In flow · Sticky (*not recommended* — moving text that follows the reader) |

Speed is constant at every viewport: a percentage-based speed would make narrow screens unreadable. The sidebar shows named values only.

**Data.** Member state only. Fewer than two messages → renders as A2·1 Rule with item 1.

**Responsive.** 1440–768: the strip runs behind 56 → 40 px edge fades in the band colour, separator spacing 28 → 24, speed unchanged. All messages stay in the loop at every width — the strip is a queue, not a layout, so nothing needs to fit. ≤ 767: bar 48 px for a 44 px close; **the pause button leaves the bar** — two 44 px targets plus a moving strip in 390 px leaves no window to read — and its job passes to tap-to-pause: first tap pauses, second follows the link under the finger. A 28 px resume button appears once paused, inside the right fade, left of the close. The strip stops with a message at the left margin rather than wherever the finger landed.

**Motion.** 160 ms is not the unit here; the strip runs continuously at the Speed value. It pauses on hover anywhere on the strip, on focus entering the bar (including focus landing on a message link), and on the pause button, which is sticky for the session — a reader who stops the ticker does not have it start again on the next page. Under `prefers-reduced-motion` the strip does not move at all: message 1, centred, with A2·9's three dots at the right end and no auto-advance. **That makes Ticker identical to Rotator for those readers** — a convergence flagged in A2-0. The alternative, stepping one message every few seconds, is still motion for someone who asked for none.

**Empty state.** One message → A2·1. No links → the strip is plain text and nothing in the bar is focusable except pause and close.

**Accessibility.** `<aside aria-label="Announcements">` — plural — containing a `<ul>` of the messages in authored order. The visual loop repeats the list a second time so the strip never shows a gap; **the duplicate is `aria-hidden` and carries no links**, so nothing is announced or focusable twice. Separator dots are decorative and hidden. `aria-live="off"`. The pause button satisfies WCAG 2.2.2 and stays in the accessibility tree at every width, labelled "Pause announcements" / "Play announcements"; hover-pause is never the only mechanism. Focus order: message links in order, pause, close. Carried text on contrast 13.9:1.

**Flagged as mine.** The three speeds in px per second, the 6-message cap, the 56 px edge fades, dropping the pause button at 390 in favour of tap-to-pause, and session-sticky pausing.

---

## 9 · Rotator

The same message list as Ticker, one at a time, dots at the right end, nothing moving horizontally. On `surface` it is the only multi-message bar that does not read as a news channel.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `messageShort` ≤ 48, `linkLabel` ≤ 24, `linkUrl` }, req, 2–6 items — **the same list Ticker uses**, so switching between the two keeps everything). Every message must fit one centred line above 767; the editor measures the longest against the available width rather than letting one item wrap where the others do not.

**Controls.**

| Control | Values |
|---|---|
| Messages | The list itself, up to 6, drag to reorder |
| Interval | Slow 8 s · Medium 6 s · Fast 4 s |
| Transition | Crossfade · Slide up · None |
| Indicators | Dots · Numbers · None (None requires Interval: Slow) |
| Ground | Surface · Contrast · Background |
| Height | Compact 44 · Comfortable 52 · Spacious 64 |

**No Placement control** — In flow only. Only **Dots** can be pressed to stop the rotation; with Numbers or None, hover, focus and reduced-motion carry the whole burden, and the sidebar says so under the control.

**Data.** Member state only. Fewer than two messages → renders as A2·1 Rule with item 1.

**Responsive.** 1440–768 message centred on the full width with 200 → 120 px side padding, so the longest message still centres without touching the dots; each message uses its short form where the author wrote one. Dots hold 24 px targets; divider 16 → 14. ≤ 767 the message goes left-aligned and the dots move below it at 25 px spacing in **32 px-wide targets** — under the 44 px floor, stated on the frame, because dots at the right end of a wrapped two-line message sit where no thumb reaches; swipe left and right does the same job with no target at all. The message's link label is dropped and the whole bar becomes the link, as A2·3. Bar 95 px, or 66 px with Numbers, which sits inline at the end of the first line as "1/3". Height is fixed by the control, never by the longest message — a bar that changed height every six seconds would move the page under the reader.

**Motion.** Crossfade is 160 ms, and that is the ceiling: both messages are on screen mid-transition and two overlapping sentences are unreadable for that eighth of a second, which is also why Transition: None exists. Rotation pauses on hover anywhere in the bar and on focus entering it, and **stops for the session when a dot is pressed**. Under `prefers-reduced-motion` there is no auto-advance and no crossfade: message 1, dots forced on whatever Indicators says (with no rotation and no dots there would be no way to reach messages 2 and 3), and an instant swap on press.

**Empty state.** One message → A2·1. A message with no link → that message has nothing focusable; the dots and close remain.

**Accessibility.** `<aside aria-label="Announcements">` containing a `<ul>` with **all messages in the DOM and readable** — visually hidden, not `display:none` — so a screen-reader user gets all three in order without waiting for a rotation. Only the active message's link is focusable, so tabbing never lands on something invisible. Dots are buttons ("Show announcement 2 of 3") with `aria-current` on the active one; each dot is 7 px in a 24 px target at desktop (17 px gap, 24 px pitch), and the focus ring is drawn round the dot rather than the target so spacing stays even. `aria-live="off"`. Inactive dot on surface is 1.9:1 — decorative, which is why the active state is carried by `aria-current` and the message itself, not by colour alone. Dots pressed, hover-pause, focus-pause and the close together are this design's answer to WCAG 2.2.2.

**Flagged as mine.** The 32 px-wide mobile dot target with swipe as the alternative, reading the dots as the WCAG 2.2.2 stop mechanism rather than shipping a labelled pause button, the dark inactive-dot value (#453E35 in Paper) that no pack defines, the 160 ms crossfade ceiling, and dropping the Placement control.

---

## 10 · Pill

A detached bar with air around it, sitting clear of the top edge on the page's own ground. Not a capsule: the corners are the pack's radius token, like everything else in the library.

**Content fields.** `label` (text, opt, ≤ 14) · `message` (rich text, req, ≤ 120) · `messageShort` (text, opt, ≤ 44) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18, used by Action: Button). No new fields — the design is the A2·3 content kit in a detached object.

**Controls.**

| Control | Values |
|---|---|
| Position | Left · Centre · Right |
| Air around it | Close 12 · Comfortable 20 · Far 32 |
| Ground | Surface · Contrast · Accent |
| Label style | Accent pill · Eyebrow · None (forced to None on contrast and accent grounds) |
| Action | Arrow link · Button · None |
| Placement | In flow · Sticky |

No Height control: the pill is 48 px, 52 px at ≤ 767 for its 44 px close, and its presence is set by the air around it instead.

**Data.** Member state only. Position: Left is flagged in the sidebar when A1·11 Side Rail is the header — the pill would collide with the rail's column. Centre is the only value that survives every A1 header.

**Responsive.** 1440–768 the pill hugs its content at the chosen position; internal gaps 14 → 12, label 12 → 11.5 px, left padding 20 → 16, air unchanged — the air is the design, so the Offset control changes it and the viewport does not. Reserved space 88 px at Comfortable. ≤ 767 the pill stops hugging and spans the page margins (16 px either side, 12 px air), the label moves above the sentence as in A2·3, the arrow link is dropped and the whole pill becomes the link, close 44 px in the corner; reserved 98 px, or 76 px with `messageShort` on a contrast ground.

**Behaviour.** *Sticky* is the one control in A2 that changes what a design **is**: in flow the pill reserves 88 px and scrolls away; sticky, it lifts out of its reserved space and floats over the article below a sticky header, keeping the same air. The spacer stays, so nothing jumps. Pointer events stay on the pill only, so text behind it remains selectable.

**Grounds.** On surface the pill needs hairline **and** md shadow — in this pack neither alone reads as lifted. On contrast the hairline goes (a border on a dark object against a light page is a second outline) and the label goes with it. On accent the whole object is the accent budget: nothing inside it may be accent, and the pack's darkened accent renders so 13.5 px white holds 4.6:1.

**Empty state.** No label → sentence and action alone. Action: None → the close is the only interactive thing in the pill.

**Accessibility.** `<aside aria-label="Announcement">` before `<header>` in the DOM at every width **including Sticky** — the visual detachment must not become a DOM detachment, and the pill is never moved to the end of the body to make positioning easier. Label and sentence are one paragraph. Dismissal removes the pill and its reserved space and moves focus to the header's first focusable item. The sticky offset includes the pill's height, so it never covers a focused element.

**Flagged as mine.** The dark shadow value `0 4px 16px rgba(0,0,0,.32)` (the brief's two shadows are both light-mode), needing hairline *and* shadow on surface, dropping the label on contrast and accent grounds, the three air values, and the fixed 48/52 px height.

---

## 11 · Toast

A small card in a bottom corner, arriving after the page has settled. The only design that appears rather than being there, and one of two — with A2·13 Consent — that never touch the header.

**Content fields.** `message` (rich text, req, ≤ 60 here — it is a title line, capped shorter than the category's 120) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `linkLabel` + `linkUrl` (opt pair, ≤ 24, the ghost action). No image: a picture in a 380 px corner card is A2·12's job at full width.

**Controls.**

| Control | Values |
|---|---|
| Position | Bottom right · Bottom left · Bottom centre |
| Appears | Immediately · After 2 seconds · After 25% scroll |
| Ground | Surface · Contrast |
| Actions | Button · Link · Button + link · None |
| Body text | Show · Hide |
| Width | Narrow 320 · Medium 380 |

**No Placement control** — bottom-anchored, floating, never in flow. No Accent ground: a 380 × 120 px accent card is a poster. No exit-intent value under Appears: it needs mouse tracking, does not exist on touch, and reads as a trap — a deliberate omission.

**Data.** Member state only. **This design and A2·13 Consent are the two that may coexist with one top bar** — the category's "one bar per site" rule counts the top stack only. The editor warns once if a toast and a top bar carry the same message.

**Responsive.** 1440 as drawn: 380 px wide, 24 px from both edges, actions in a row, close in the card's top-right at a −6 px offset so its 32 px box aligns optically to the 16 px padding. 834: same width, insets 24 → 20 — the card holds while the page narrows, which is what Narrow 320 is for. ≤ 767: spans the margins at 12 px either side, 20 px above the safe-area inset, actions stack with the primary **full width** — the opposite of A2·2's rule, because there is no header button below it to compete with; 178 px tall, or 74 px with Body hidden and Actions: Link, which is what the sidebar recommends when `body` runs past 100 characters.

**Motion.** Enters with 8 px of travel and a fade to full over 160 ms ease-out, shadow arriving with it; dismissal reverses it. Under reduced-motion it appears and disappears in place at the same moments. Nothing below it reflows at any point: no reserved space, no offset.

**Placement against other fixed things.** The card never covers a fixed element the site already owns — it stacks 12 px above a consent bar or a bottom player, and consent is always first because it gates everything else.

**Empty state.** Body hidden or empty → title and actions only. Actions: None → title, body and close.

**Accessibility.** `<aside aria-label="Announcement">` at the **end** of the body — the one A2 design not before the header, because it is not part of the top of the page and putting it first would make it the first thing every keyboard user meets. It carries `aria-live="polite"`, which the load-present bars do not: this card arrives after the page has settled, so it is announced once when it does. The title is a `<p>` at 14 px / 600, not a heading. Focus is **not** moved into the card: it is not a dialog, does not trap focus and does not block the page. **Escape dismisses it from anywhere on the page** — the only A2 design where that is true — and focus returns to where it was, never to the header.

**Flagged as mine.** The 60-character title cap, the 2-second default, the omission of exit-intent, the dark shadow value, stacking 12 px above consent, and the full-width mobile primary that contradicts A2·2 for a stated reason.

---

## 12 · Takeover

A 200 px band with a picture in it: image on one side, headline, body and a button on the other. The only design in the category that carries imagery, and the only one tall enough to be mistaken for a hero.

**Content fields.** `image` (image, opt — the category's only one) · **`imageAlt`** (text, opt, ≤ 120 — **added to the category list**; empty means decorative, and the editor never invents alt text or uses the file name) · `label` (text, opt, ≤ 14, rendered as the eyebrow) · `headline` (text, req here, ≤ 60) · `body` (text, opt, ≤ 160) · `ctaLabel` + `ctaUrl` (opt pair, ≤ 18) · `linkLabel` + `linkUrl` (opt pair, used by Action: Arrow link).

**Controls.**

| Control | Values |
|---|---|
| Image | Left panel · Right panel · Background · None |
| Height | Compact 160 · Comfortable 200 · Spacious 240 (Compact only above a multi-row header) |
| Ground | Surface · Background · Contrast |
| Scrim | ~~None~~ (disabled — text on an unscrimmed photograph cannot be measured) · Subtle · Strong; Background images only |
| Body text | Show · Hide |
| Action | Button · Arrow link · None |

**No Placement control** — In flow only.

**Data.** Member state only. Empty `image` → the band renders as Image: None at 160 px whatever the control says; the striped placeholder is for the editor, never for a reader.

**Image treatment.** The panel is bled to the band's edges with no radius of its own — a rounded card inside a full-bleed band reads as two objects. Panel width and crop follow the layout: 360 px at 16:9 on desktop, 260 px at 4:3 at 834, a 132 px band at 3:1 at ≤ 767, so the image must be authored with a subject that survives all three. Background fills the band and puts the text on the image behind a scrim built from the pack's contrast colour — never a black-to-transparent gradient — running 72% at the text edge to 28% at the far side, turning 90° at ≤ 767 to 30% → 82% top to bottom. In dark the image is dimmed 6% and nothing else is done to it: no filter, no duotone, no border; the scrim pair becomes 78/38%.

**Responsive.** 1440 as drawn, text vertically centred against the panel's full height, close in the band's top-right at 14 px, clear of the text column. 834: panel 360 → 260, headline 26 → 23, body 15 → 14, padding 72 → 40, band holds 200. ≤ 767: panel becomes the top band, text stacks below, button full width (as A2·11, and for the same reason — no competing accent inside the band), close sits on the image behind an 85% wash of the lightest surface; band 331 px, 39% of a 844 px viewport, named in the sidebar, with Image: None (150 px) offered as the phone-first choice. Background at ≤ 767 drops the body's second sentence — the only content this design cuts at any width.

**Stress.** With headline and body both at their caps the type steps down inside the fixed band — headline 26 → 19, body 15 → 13 — rather than the band growing, because a bar that grows with its text can push a hero off the screen. Below 13 px the body truncates with an ellipsis and the editor names the sentence that went. The panel narrows to a 120 px strip before it is dropped at 480.

**Empty state.** No image → Image: None at 160 px. Body hidden → headline and action, band unchanged. Action: None → the close is the only interactive thing in 200 px, which the sidebar warns about.

**Accessibility.** The skip link matters most here: 200 px of furniture stands between a keyboard user and the article. The image is decorative by default with an empty `alt`; `imageAlt` is used when filled. Eyebrow, headline and body are all `<p>` elements — a 26 px headline in the heading font is exactly the case that tempts an `h2`, and the category floor holds. The band is not a link and neither is the image: a 1440 × 200 px target above the header would swallow the page. One action. Dismissal removes 200 px in one 160 ms collapse with the category's scroll correction — this is the design where that rule earns its keep. Contrast: headline on surface 13.2:1, body 5.4:1, eyebrow 4.85:1; on Background the 72% scrim stop puts white headline at 9.1:1 and body at 7.4:1 over a mid-tone photograph. The editor cannot measure a photograph, so scrim values are fixed rather than adaptive and Strong exists for images that need it.

**Flagged as mine.** `imageAlt`, the three panel widths and their crops, the 6% dark image dim, all three scrim pairs, the 85% close wash at ≤ 767, dropping the body's second sentence at 390, and disabling Scrim: None.

---

## 13 · Consent

A bottom bar asking a question, with accept and decline at the same weight. The only design with **no close control**, and the only one with **no audience targeting**.

**Content fields.** `message` (rich text, req, ≤ 200 — the category's one longer cap, because a notice has to say what it does; carries the policy link inline) · `ctaLabel` (text, req, ≤ 18, default "Accept") · `secondaryLabel` (text, req, ≤ 18, default "Decline") · `linkLabel` + `linkUrl` (opt pair, "Manage choices") · **`policyUrl`** (url, opt — **added to the category list**). `dismissible` is forced off, `audience` forced to Everyone, and **`askAgainAfter`** (Never · 6 months · 12 months — also added) replaces `dismissMemory`.

**Controls.**

| Control | Values |
|---|---|
| Layout | Full width · Boxed centre · Boxed left |
| Actions | Accept + Decline · Accept + Decline + Manage · ~~Accept only~~ (disabled) |
| Ground | Surface · Contrast |
| Padding | Compact · Comfortable · Spacious |
| Policy link in text | On · Off |
| Ask again after | Never · 6 months · 12 months |

**Scope, flagged.** This design draws the question and records the answer. It does **not** gate scripts, set or clear cookies, or integrate a consent framework — that is product behaviour outside A2. A theme that ships the bar without wiring it is showing a notice that does nothing, and the sidebar says so.

**Equal weight.** Accept and Decline are the same size, shape and 10 px apart; only the fill differs, which is the minimum difference the pack can express. On a contrast ground Accept becomes the lightest surface and Decline an outline in the carried colour at 40%. Accept only is disabled with the reason stated rather than hidden — "a consent notice needs a way to refuse" — and that disabling is a design judgment, not legal advice.

**Responsive.** 1440–900 one row: sentence left, Manage, Decline, Accept right, 18 px padding, top hairline and an inverted md shadow. Below 900 px of usable width it re-arranges — sentence on its own row, actions below with Manage left and the answers right; 118 px at 834. ≤ 767 the two answers share a row as **equal halves** at 44 px and Manage centres below them; they never stack vertically, because either order is a thumb on the scale. 160 px with Manage, 136 px without, including bottom padding for the safe-area inset. Nothing above the bar is ever offset or reflowed.

**Empty state.** No Manage → two answers only. Policy link off → the sentence carries no link and the policy is reachable from the footer, which the sidebar notes.

**Accessibility.** `<aside aria-label="Cookie consent">` at the end of the body, present at load, so `aria-live` is off. **Not a dialog:** no focus trap, no focus move, no blocking — flagged, because many consent bars do trap focus, and a bar that traps focus and cannot be dismissed is a page you cannot leave. The policy link is underlined at rest, the one always-underlined link in A2. Tab order is policy link, Manage, **Decline, then Accept** — refusal reached first. No close, and Escape does nothing.

**Flagged as mine.** The 200-character cap, disabling Accept only, not trapping focus, the invented dark border step `#453E35` (third design to need it), the 900 px re-arrangement trigger, and the equal-halves mobile pair.

---

## 14 · Edge

A 4 px accent rule across the top with a chip at its right end; pressed, it opens into A2·1 Rule. Four pixels of furniture instead of forty-four.

**Content fields.** `message` (rich text, req, ≤ 120) · `messageShort` (text, opt, ≤ 48) · `linkLabel` + `linkUrl` (opt pair, ≤ 24) · **`chipLabel`** (text, req, ≤ 14 — **added to the category list**; the only visible text in the collapsed state). The open bar is A2·1 and reads the same fields, so switching between the two loses nothing but the chip label.

**Controls.**

| Control | Values |
|---|---|
| Rule weight | Hairline 2 · Rule 4 · Bold 6 |
| Chip | Right · Centre · ~~None~~ (disabled) |
| Chip label | Text, ≤ 14 |
| Opens on | Click and focus · Hover and focus |
| Open ground | Contrast · Surface (Surface recommended in dark-first packs) |
| Placement | In flow · Sticky |

No Height control: collapsed is the Rule weight, open is 44 px plus the rule.

**Collapsed.** 4 px of reserved space at every width. The 24 px chip hangs into the header's own padding rather than adding height, which is why it sits at the right end where A1·1 has nothing but air; its bottom corners take the pack radius so it reads as a tag pulled out of the rule. Rule and chip share the design's entire accent budget.

**Open.** A2·1 Rule on the chosen ground with the accent rule still above it — 48 px desktop, 82 px at 390 with A2·1's two-line wrap — and the page moves down by the difference over 160 ms; instantly under reduced-motion, because a state change is not motion. The chip becomes the word "Close" with the caret flipped and keeps its position, so the thing you pressed has not moved.

**Collapse is not dismissal.** The chip toggles and keeps the rule. The × beside it removes the bar *and* the rule for the memory period. Two controls 24 px apart doing different things is this design's risk, which is why the collapse control is a word and not a second glyph.

**Responsive.** Only the chip's inset changes with width, following the header's padding: 56 → 32 → 12. ≤ 767 the chip grows to 32 px with a 12 px label, and its hit area extends 6 px up into the rule and 6 px down into the header's padding — 44 px of target without a 44 px chip.

**Empty state.** No link → the open bar is the sentence alone. `chipLabel` is required: without it there is nothing to press, so the editor blocks publishing rather than falling back.

**Accessibility.** The rule is decorative and `aria-hidden`. The chip is `<button aria-expanded>` whose accessible name is the full sentence plus "Show announcement", so a screen reader hears the message without opening anything while the visible label stays the authored short one. Chip: None is disabled because a hover-only 4 px strip fails 2.1.1. Opening moves no focus; Escape collapses when focus is inside; the × is a separate labelled button.

**Flagged as mine.** `chipLabel` and its cap, disabling Chip: None, the overlapping mobile hit area, the 2 px chip growth on hover, and the dark-pack recommendation for Open ground: Surface.

---

## 15 · Triple

Three short notices side by side in one band, divided by hairlines. The only design that shows more than one message at once without moving.

**Content fields.** `messages[]` (list of { `message` ≤ 120, `messageShort` ≤ 48, **`label` ≤ 14**, `linkLabel` ≤ 24, `linkUrl` }, req, 2–6 items — the same list Ticker and Rotator use, with a **per-item label this design adds to the item shape**). Each slot clips to one line with an ellipsis and never wraps; `messageShort` renders when set. About 34 characters per slot after the label at 1440, shown per slot in the editor.

**Controls.**

| Control | Values |
|---|---|
| Messages | The shared list |
| Slots | Two · Three |
| Dividers | Hairline · Space · None |
| Labels | First in accent · All muted · None |
| Link style | Whole slot · Arrow link |
| Ground | Surface · Background · Contrast |

**No Placement control** — In flow only.

**Grid.** Three equal columns on `1fr 1fr 1fr` — equal by grid, never by content, so a short third notice cannot steal width from a long first one. Only the first slot's label takes accent; three accent labels in one 56 px band is three focal points and none. The close reserves 24 px of the third slot's right padding at every width, on its own ground patch, so hovering it never highlights the slot underneath.

**Data.** Member state only. Two items with Slots: Three → the grid drops to two columns rather than leaving an empty cell; an empty third is the one thing this design cannot show. One item → the design becomes A2·3 Badge set to Centred and the sidebar offers the switch. Items beyond the slot count are kept and counted in the sidebar.

**Responsive.** 1440–1024 as drawn. 834 keeps three slots and **drops the labels** — 278 px cannot hold a label, a sentence and an arrow, and the sentence is what the reader came for; the accent leaves the band entirely, the only design in A2 where that happens by rule rather than by control. **Below 768 the design hands off to A2·9 Rotator** from the same list, at 95 px, with the full sentence restored because there is one column and no clipping; Slots and Dividers are inert there and the sidebar names them. The rejected alternative — three stacked rows at 138 px, three quarters of the space above the fold — is drawn on the frame at 62% so the choice is visible rather than assumed.

**Empty state.** Labels: None → sentence and arrow per slot. Dismissal removes all three notices at once; there is no per-slot dismissal, because a band that can lose a column mid-session would re-lay-out under the reader.

**Accessibility.** `<aside aria-label="Announcements">` containing a `<ul>` of items in authored order, which is also visual order and tab order. **A clipped sentence keeps its full text**, so screen readers get the whole message where sighted readers get an ellipsis, and the editor marks clipping per slot rather than hiding it. One link per slot — whole cell or arrow, never both. The close sits outside all three links, last in focus order. The focus ring is drawn *inside* the cell rather than at 2 px offset: on a cell flush against its neighbour an offset ring sits on the divider and looks like the wrong slot is focused. Slot hover fills the cell with the pack's hover surface — the only hover background in A2 that covers a region of text rather than a 32 px control, allowed because a slot is a cell rather than a bar.

**Flagged as mine.** The per-item label on the shared list shape, the 34-character budget, dropping labels at 834, the inside-the-cell focus ring, the hover background, and no per-slot dismissal.
