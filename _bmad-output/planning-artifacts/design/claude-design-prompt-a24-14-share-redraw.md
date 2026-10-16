# ⛔ OWED BY THE OWNER — Claude Design prompt: A24 #14 Share Row, the native-share redraw

> **Run this before Story 10.82 opens.** Story 10.82 builds Post Headers #14 Share Row, and it cannot be planned
> until this redraw is in the export (DW-360, ruling R-244). Its Create stops and asks you if it has not run.
>
> **Status: NOT RUN.** When it has run and the export has landed, a session marks this file `record` in
> `tools/doc-audit.py`, closes DW-360 and writes the date here.

**Why.** On 16 October 2026 you ruled Story 7.15's Question 1 option 3: sharing on your readers' sites is Ghost's own
Share button, with Copy link and Email on an older Ghost. Post Headers #14 is still drawn the old way (your own row of
Bluesky, Mastodon, Email and Copy link). This prompt redraws it to match.

**What to do.**
1. Open the Inflozo project in Claude Design.
2. Copy everything in the box below into a new message and let it finish.
3. Export the project into the repo as you did for the other passes.
4. Tell the next Claude session: "the A24 #14 redraw landed".

The same prompt is kept in Story 7.15's spec, `_bmad-output/implementation-artifacts/spec-7-15-share-destinations-one-ordered-site-wide-list.md`,
under `## Claude Design prompt — A24 #14 Share Row, the native-share redraw`. The two are identical.

```
This is a follow-up on A24 · Post Headers, which you have already designed. Redraw ONE design:
#14 Share Row (`A24-14 Share Row.dc.html`). Change nothing else in the project.

WHY. On 1 September 2026 the owner ruled "native Ghost Share only, everywhere". A26 Post Footers was
carried over in full that day; A24 #14 was not, and its frame says so in the dated panel at its foot
("THE NATIVE-SHARE RULING · 1 SEPTEMBER 2026 · THIS FRAME IS SUPERSEDED IN PART"). On 16 October 2026 the
owner confirmed that ruling and withdrew the older one (one ordered, site-wide list of our own share
links). This pass is the redraw that panel names as outstanding.

READ FIRST, in this project:
- `A24 Post Headers - Spec.md` — 14 Share Row's section, and "Patch notes — the native-share ruling,
  1 September 2026" at the end of the document, above all its paragraph "What the redraw carries".
- `A24-14 Share Row.dc.html` — the frame you are redrawing, including its dated native-share panel.
- `A26-9 Share Row.dc.html` — its section "THE TWO SHARE STATES": the pattern to follow.
- `Calibration Set.dc.html` — the tokens, type scale, spacing and colour roles. Use nothing outside it.
- `Editor Sidebar Kit.dc.html` — every sidebar control, panel, badge and greyed state. The panel uses
  these and nothing else.

WHAT THE REDRAW CARRIES — exactly this list, nothing added:
1. One trigger: a label and one Share control — a link to `#/share` — which opens Ghost's own share
   panel. Ghost's panel owns the destinations and their order.
2. Copy link and Email as the older-Ghost fallback, two links in the same row the trigger sits in.
3. The capability flag: which of the two draws comes from a flag the app sets when the site is
   connected ⚑, because a theme cannot ask Ghost its version. Say so on the frame.
4. The Links stepper (Two · Three · Four) CUT, not greyed — a control with nothing left to do is not a
   disabled control.
5. In the editor panel, the Share destinations row greyed, with the reason beside it — "Ghost's own
   share panel owns the destinations and their order" — and, on an older Ghost, saying which.
6. The site-wide setting reduced to two switches, Copy link and Email: the fallback pair only.
7. No brand glyphs.
8. The copied confirmation kept, inside the fallback only.
9. A no-JavaScript state that reads Email alone — the trigger and Copy link both need a script.

THE PATTERN. Draw #14's share row in A26 #9's four states, side by side and in A26 #9's order:
(a) current Ghost — one trigger, Ghost's panel owns the destinations;
(b) older Ghost — no panel, Email and Copy link in the same row;
(c) older Ghost — the copied confirmation, which then reverts;
(d) either version, no JavaScript — Email alone.
The header above the row — tag, title, standfirst, byline and hairline — does not move between the
four. Draw the design in light and dark, at 1440, 834 and 390, as A26 drew its share designs.

REWRITE THE WORDS TO MATCH THE PICTURE. In 14 Share Row's section of `A24 Post Headers - Spec.md` and on
the frame, strike what the ruling superseded: the four destinations and their order, the Links stepper,
the ten-platform ordered list, the per-platform brand glyphs, and the two arguments "three of the four
destinations are ordinary links and one is not" and "Mastodon's link is the honest problem in the row".
Keep every superseded sentence legible — struck and dated 16 October 2026 — so the reversal is visible.
Then update the frame's dated native-share panel to say the redraw has landed.

RULES:
- Design numbering unchanged: nothing renumbered, nothing deleted, no design added. Do not write a
  total of designs anywhere.
- The same components and tokens as the rest of A24 and the Editor Sidebar Kit. No new control,
  colour, size or vocabulary.
- A greyed control is drawn, never hidden, with its reason in one short sentence at the control.
- Any literal Ghost Handlebars in markup you emit — for example the Email link's `{{encode}}` or
  `{{url}}` — must be written with zero-width entities, `{&#8203;{` and `}&#8203;}`, because a bare
  `{{ … }}` is a Claude Design value hole and renders EMPTY.
- Change no other design, frame or spec section.

WHEN DONE: list every file you changed and, for each of the nine items above, where it is drawn.
```
