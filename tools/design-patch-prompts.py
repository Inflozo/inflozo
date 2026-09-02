#!/usr/bin/env python3
"""Inflozo — one self-contained Claude Design prompt per category, as a trackable HTML page.

    python3 tools/design-patch-prompts.py            # regenerate DESIGN-PATCH-PROMPTS.html
    python3 tools/design-patch-prompts.py --check    # exit non-zero if the file is stale

Why per-category rather than one master prompt: the controls pass shipped one prompt per category
and that is what worked. Twenty categories of instruction in a single Claude Design session is more
than it holds well, and a session that drifts halfway through is worse than one that never started.

Every prompt is SELF-CONTAINED — Claude Design cannot read this repository, so each carries the four
Ghost facts, the ten library-wide rules, its own roster, and its own work list. The repetition is
the feature.

The roster in each prompt is DERIVED from the export via export-roster.py (standing rule 4), so the
design numbers and names in the prompts cannot drift from the library. Only the per-category work
list is authored here, because it is a set of rulings and not something derivable.

Rulings cite `prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md`.
"""
import os, re, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_bmad-output/planning-artifacts/DESIGN-PATCH-PROMPTS.html')
_s = importlib.util.spec_from_file_location('er', os.path.join(ROOT, 'tools/export-roster.py'))
er = importlib.util.module_from_spec(_s); _s.loader.exec_module(er)

# ─────────────────────────────────────────────────────────────────────────────
# Shared prompt text. Carried in EVERY prompt: each is pasted into a fresh chat.
# ─────────────────────────────────────────────────────────────────────────────

FACTS = """WHY THIS PASS EXISTS — four facts that caused nearly every change below.

1. GHOST'S TEMPLATES CANNOT COUNT, ADD, OR REMEMBER. No arithmetic, and inside a loop no
   access to the previous item. So "Jane and 2 others", "Save 20%", a month heading that
   appears only when the month changes, and a page-number window each need a different
   approach or must go.
2. CSS CANNOT SEE CONTENT. It does not know a caption runs over 140 characters or that a
   paragraph is two lines, and it cannot reorder the DOM at a breakpoint.
3. SOME FIELDS WE DREW DO NOT EXIST. Ghost gives a theme no member join date, no list of a
   member's newsletters, no newsletter cadence, no site address, and no "posts per page"
   setting inside its admin.
4. INSIDE A BLOG POST'S BODY WE OWN THE STYLESHEET AND NOTHING ELSE. Not the markup, not
   the ARIA attributes, not the text. Ghost renders those."""

PART_A = """PART A — THE TEN LIBRARY-WIDE RULES. These apply to this category too.

Each rule has a NAME. Use the name, never the number, whenever you refer to one — the
letter-and-number codes in this project are filing labels and mean nothing to the owner.

RULE 1 · AVATARS WITH NO PHOTOGRAPH. Lists the user types themselves keep two initials
   ("JD"). Authors pulled from Ghost show ONE letter only ("J") — Ghost cannot produce two
   initials from a name.
RULE 2 · THE REMOVE BUTTON NEVER GREYS OUT. In any repeating list with a minimum, Remove
   stays visible and clickable at the minimum, and clicking it explains why it cannot go
   lower ("a pricing table needs at least two tiers"). Never dimmed, never hidden.
RULE 3 · SLIDER LABELS. A slider's TITLE says what it affects; its three VALUES may reuse
   the standard words. "Card padding: Compact · Comfortable · Spacious" is correct. Do not
   invent a new three-word vocabulary for each slider.
RULE 4 · GAP NAMES ARE "Tight · Normal · Loose". Replace any Tight/Even/Airy or
   Tight/Standard/Wide.
RULE 5 · ITEM COUNTS ARE A NUMBER PICKER, never a row of fixed buttons ("Three · Four ·
   Six"). A design may cap its own maximum and the panel says why. Locked values are drawn
   greyed with the reason visible.
RULE 6 · A DESIGN MAY OFFER FEWER CHOICES ON A SHARED CONTROL, AND MUST SAY WHY — "this
   design is always on a contrast background". It may never rename a shared control or add
   choices to it. The colour swatch row is called "Base". There is no "Inherit" choice
   anywhere; remove it.
RULE 7 · THE TWO FREE DESIGNS ARE THE OWNER'S CHOICE — ASK HIM.
   Exactly two per category. WHICH two is his decision: not yours, and not just the first
   two in the roster. Shortlist the three to five PLAINEST designs — the ones a site could
   ship without looking unfinished, and that do not depend on the customer having good
   photography — give one line each on why it qualifies, recommend two, and ask him to
   pick. Then record his answer in the spec as ONE line, on its own line, in exactly this
   shape and no other:

       **[Free] designs:** 1 Rail · 13 Centre Nav

   The merge reads that line literally. Without it the merge falls back to the first two
   and reports that it guessed — which is how one category came to name designs 1 and 13
   while the published inventory said 1 and 2, two documents disagreeing about what a free
   customer gets.
RULE 8 · NO DESIGN EVER TURNS INTO ANOTHER DESIGN. Delete every phrase like "below this
   width it draws as design 1" or "if the hero has no image it becomes the solid header".
   A placed design is the design that renders. Instead the section HIDES what does not
   apply (a sideways-scrolling row whose track already fits shows no arrows and no fade),
   and the panel may ADVISE ("at this count, 1 Row reads better") — advice, never a switch.
RULE 9 · MEMBER BUTTONS ARE CONDITIONAL, AND GHOST'S SIGN-UP POP-UP NEEDS JAVASCRIPT.
   Every "Sign up free" / "Subscribe" / paid-tier button gets a panel note: it does not
   render when the connected site cannot support it (self-signup switched off, or no
   payment provider connected). Every button that opens Ghost's own sign-up pop-up gets
   the line: with JavaScript off, nothing happens. Delete any claim that something can be
   subscribed to without JavaScript.
RULE 10 · THE NO-JAVASCRIPT NOTICE. Tested against both live Ghost servers: Ghost's signup
   endpoint cannot accept a plain form submission, so a subscribe form needs JavaScript.
   Every design containing a subscribe or sign-in form needs a small designed notice that
   replaces the form when JavaScript is unavailable, so a visitor is told rather than
   typing an address that goes nowhere. The sent / error / loading states you already drew
   all still work — Ghost's own script applies those. Keep them."""

NUMBERING = """THE NUMBERING RULE — the instruction most likely to be broken by good intentions.

DO NOT RENUMBER ANYTHING. Deleted designs leave PERMANENT gaps. Do not close them and do
not reuse those numbers. Every other document in the project references designs by number,
and renumbering would break all of them silently."""

DONT = """DO NOT CHANGE: the visual language, type scale, colour packs or spacing system; any
design not named above; the sent / error / loading states on member forms (they work —
only the "works without JavaScript" promise was wrong); design numbering (see above)."""

OUTPUT = """OUTPUT.
1. Update this category's frames.
2. Update its spec: the roster (with [Free] marked), the control lists, the data fields,
   the no-JavaScript line per design, and the behaviour each design declares.
3. End the spec with a "Patch notes" section listing every change and the rule NAME that
   required it (the name, not the number). Where a ruling cannot be applied without inventing a decision, write it
   there as an OPEN QUESTION rather than guessing.
4. Confirm at the end, in one line each: the design numbering is unchanged (list this
   category's numbers), and the "**[Free] designs:**" line is present and names two designs
   that exist.
5. Export the updated library as a zip.

If any instruction above contradicts another, or contradicts something already in the
spec, STOP and list the conflict rather than choosing.

IF YOU HAVE A QUESTION FOR THE OWNER, DO NOT ASK HIM AND DO NOT WAIT FOR AN ANSWER.
He is running these prompts one after another and is not able to answer mid-session; an
answer given in this chat also reaches nothing — it would live here and never arrive in
the requirements, so the next pass would ask the same question again.

Instead, for anything you cannot settle from this prompt and the specification in front
of you:

  RECORD IT in the Patch notes, on its own line, marked OPEN FOR THE OWNER.
  SAY WHAT YOU WOULD HAVE NEEDED TO KNOW, in one sentence, in plain words.
  SAY WHAT YOU DID INSTEAD — left it as found, or applied the work list around it.
  THEN CARRY ON with the rest of the work list. One open item does not stop the others.

Do not guess, and do not pick an option because it seems the smaller change. Flagging is
the behaviour these passes want: several of the library's real errors were found because
a session stopped at exactly this point instead of choosing.

ONE THING WORTH KNOWING, because it changes what a question costs you. A category only
sees itself. Roughly a third of the questions raised in these passes turn out to be
ALREADY ANSWERED somewhere else in the project — the same question asked independently by
four categories, or settled by a ruling made days after your specification was written.
Recording a question is therefore cheap and often free; guessing at one is what is
expensive. Write it down and let it be checked."""

ASK = """IF YOU NEED A DECISION FROM THE OWNER — how to ask.

The owner is a solo founder and is NOT an engineer. He reads every question you write.

- STOP and ask rather than guessing. A guess that looks plausible costs far more to undo
  later than a question costs now. If applying a rule needs a decision nobody has made,
  ask it — do not pick and carry on.
- Write the question in PLAIN ENGLISH. No jargon unless you explain it in the same
  sentence. Never write "Handlebars", "compileTarget", "contentSchema", "the union" or
  "the tuple" at him without saying what it means.
- NEVER refer to anything by its code. Not "A7", not "P0", not "RULE 5", not "FR-H2".
  Say "the Pricing and Tiers category", "the shared editor controls", "the rule that item
  counts are a number picker". The codes are filing labels; they mean nothing to him.
- Give NUMBERED OPTIONS — usually two or three, never more than four.
- Mark exactly ONE option "(RECOMMENDED)" and say in one line why you recommend it.
- For each option, say what it COSTS and what it gives up, concretely. "Editors lose the
  ability to X" beats "less flexible".
- Give a real example of what the visitor or the editor would see under each option.

Shape to follow:

    QUESTION 1 — Team photos when someone has no picture

    Six of these designs draw a circle with a person's initials. Ghost can only give us
    one letter, not two. What should the circle show?

    1. A single letter — "Jane Doe" shows J. (RECOMMENDED)
       Works everywhere, needs nothing extra, and still feels personal.
    2. A grey silhouette icon.
       Safe and consistent, but every person without a photo looks identical.
    3. Hide the circle entirely.
       Cleanest, but the row reflows and the layout shifts depending on who is shown.

EVERY category has at least one question: which two designs are free (RULE 7).
Ask it even if the answer looks obvious.

Collect your questions at the END of your work, in one numbered list, after you have done
everything that does NOT depend on an answer. Do not stop the whole category over one
open point — finish the rest and ask at the end."""


# ─────────────────────────────────────────────────────────────────────────────
# Per-category work. Authored, because a ruling is not derivable from the export.
# Categories absent here get Part A only, which is stated in their prompt.
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# The run order. Not arbitrary: some categories DRAW a pattern the rest reuse, so they go
# first. Wave 1 is a deliberate checkpoint — P0 sets the shared controls, and A1 and A4 are
# the ONLY two categories with a deleted design, so they are the only two that test the
# rule most likely to be broken (do not renumber). Three sessions buys the answer to
# "is this working?" before thirty-one more are spent.
# ─────────────────────────────────────────────────────────────────────────────

CORRECTION = """INFLOZO — DESIGN PATCH PASS · CORRECTION to P0, A1 Headers and A4 Heroes
Paste into a NEW Claude Design chat. Self-contained: assume no other context.
RUN THIS BEFORE ANY OTHER CATEGORY. P0's module list is read by every later session.

You patched these three in the last pass. Three corrections, then a question that was
missed. Change nothing else in them.

1 · P0 EDITOR PRIMITIVES — a deleted module is still listed as legal.
P0 rule 11 lists the modules a design may name, and it still includes `search-overlay`.
That module was deleted when the Search category went, and P0's own rule 10 already says
so. Every other category reads this list to learn what it may declare, so leaving it there
invites later sessions to declare a module that no longer exists.
  - REMOVE `search-overlay` from that list.
  - Confirm `search-expand` and `command-palette` are absent too — all three went together.
  - ADD the three created in the same pass and missing from the list: `nav-transform`,
    `contact-form`, `group-headings`.

2 · THE TWO FREE DESIGNS — a question none of the three asked.
Every category has exactly two [Free] designs, on the free plan. WHICH two is the owner's
decision and it was not put to him. Headers chose 1 Rail and 13 Centre Nav on its own
reasoning; Heroes chose 1 Centred and 2 Flush Left. Both were reasonable, neither was
asked, and Headers' choice disagreed with what the merge published — so a free customer
would have been given different designs from the ones the specification named.

FOR HEADERS AND FOR HEROES, ASK THE OWNER. For each:
  - Shortlist the three to five PLAINEST designs — the ones a site could ship without
    looking unfinished, that do not depend on the customer having good photography.
  - One line each on why it qualifies.
  - Recommend two, with a one-line reason.
  - Let him pick any two from the shortlist.
Record his answer in that category's spec as ONE line, on its own line, in exactly this
shape and no other:

    **[Free] designs:** 1 Rail · 13 Centre Nav

The merge reads that line literally. Each number must be the design's own number, and both
designs must exist in the category. P0 is not a design category and has no free pair —
skip it there.

3 · NUMBERING — confirm, do not change.
You got this right and it must stay right. Headers runs 1-8 then 10-16, with no 9. Heroes
runs 1-14 then 16-18, with no 15. Those gaps are permanent; every other document in the
project references designs by number. Confirm both are still open and nothing was
renumbered.

OUTPUT. Update the three specs and any frame the free-design marking touches. Add to each
spec's existing Patch notes a short "Correction pass" entry saying what changed. Export the
library as a zip.

IF YOU NEED A DECISION: plain English, no codes — say "the Headers category", never "A1".
Numbered options, two or three, exactly one marked (RECOMMENDED) with a one-line reason,
and what each option costs."""


WAVES = [
 ("Step 1 · Correction — run this first, before any other category",
  "P0, A1 Headers and A4 Heroes came back from the checkpoint. The numbering held, which is why "
  "the rest can be batched. Three things need correcting first, and one of them is urgent: P0's "
  "list of legal behaviour modules still names one that was deleted, and every later session reads "
  "that list. This also asks the free-designs question that none of the three put to you.",
  ['CORRECTION']),

 ("Done — kept for reference",
  "Patched at the checkpoint. Re-run only if the correction above tells you to. A2 Announcement "
  "Bars and A3 Footers were also partially patched by those sessions without being asked; they "
  "keep their place in the order below and their prompts now say so.",
  ['P0', 'A1', 'A4']),

 ("Step 2 · Pattern-setters — each draws something later categories reuse",
  "Newsletter draws the no-JavaScript notice first because it is the heaviest form "
  "category; About and Team draws the one-letter avatar; Post Lists draws the grouping "
  "behaviour and its plain fallback; Post Headers draws the \u201cand others\u201d byline. Every "
  "one of those is copied by categories further down, so drawing them well here saves "
  "re-deciding four times.",
  ['A22', 'A12', 'A18', 'A24']),

 ("Step 3 · The heavy ones",
  "Substantial redraws and deletions. Koenig Card Treatments is the biggest single piece of "
  "work in the pass and deserves a fresh session of its own.",
  ['A33', 'A30', 'A7', 'A34', 'A25', 'A32', 'A28', 'A15', 'A17', 'A20', 'A21']),

 ("Step 4 · Smaller specific work",
  "A short, named list of changes each. Mostly applying the member-button and "
  "no-JavaScript rules that Wave 2 already designed.",
  ['A2', 'A3', 'A6', 'A9', 'A10', 'A11', 'A16', 'A26', 'A31']),

 ("Step 5 · Sweep — the ten rules only",
  "No category-specific rulings. Each still needs a pass to confirm the ten rules against "
  "every design, and to record in its Patch notes which rules changed something and which "
  "were already satisfied — so \u201cnothing to do\u201d is a recorded finding, not a silent skip.",
  ['A5', 'A8', 'A13', 'A14', 'A19', 'A27', 'A29']),
]


WORK = {
 'A1': """- ADD THE SEARCH CONTROL. Search is no longer a category of its own — the whole Search
  category was deleted, because Ghost's own search opens in a sealed frame our stylesheet
  cannot reach and its index holds no article text. Search becomes a control HERE:
  "Search: Off · Icon · Button · Bar". Button may be with or without an icon. All three
  forms do one thing on click: open Ghost's native search. Draw the three trigger forms in
  the panel and in each header design with room for one.
- REMOVE every search overlay, search results panel and expanding search field. All of
  that is Ghost's now. The behaviour modules `search-overlay` and `search-expand` no
  longer exist, and neither does the Ctrl-K command palette — Ghost's search already binds
  Ctrl-K on every site, so no design may bind it.
- DELETE the drawn search form with a `/search/` destination. No such page is published.
- THE TRANSPARENT OVERLAY HEADER: delete the clause "or if its image fails to load".
  Whether the header is transparent is decided when the theme is BUILT, from what is
  actually placed below it — never in the visitor's browser.
- The header that watches scroll direction uses the shared `header-scroll` behaviour; with
  JavaScript off it renders in its resting state.
- The link picker across the library gains "Ghost search" as a destination, so any button
  anywhere can open search with no new design.""",

 'A2': """- ALREADY PARTIALLY PATCHED. A previous session removed this category's render-time
  hand-off language without being asked to, and left Patch notes. Read them first: confirm
  what was done, do not redo it, and record in your own Patch notes which of the ten rules
  were already satisfied.
- Apply RULE 9 (member buttons are conditional) and RULE 10 (the no-JavaScript notice) to every signup, subscribe and sign-in affordance in the bars.
- Any bar offering a member action states which site settings make it render.""",

 'A3': """- ALREADY PARTIALLY PATCHED. A previous session touched this category without being
  asked to, and left Patch notes. Read them first: confirm what was done, do not redo it,
  and record which of the ten rules were already satisfied.
- Apply RULE 9 (member buttons are conditional) and RULE 10 (the no-JavaScript notice) to the footer's subscribe form and any member links.
- Footer social links must go through Ghost's own link helper rather than printing a
  handle as a URL.""",

 'A6': """- Apply RULE 9 (member buttons are conditional) and RULE 10 (the no-JavaScript notice) to every banner's call to action.
- THE SIGNER PICKER offers only authors who have PUBLISHED a post. A Ghost staff user with
  no published post returns nothing and the section silently loses its signature.
- THE FEATURE-IMAGE DEFAULT is offered only on post, page and custom-entry templates. On a
  list page (home, tag, author) there is no feature image and it renders empty.""",

 'A7': """- THE SAVING LINE ("Save 20%") exists only on a design carrying the billing toggle, and it
  disappears without JavaScript. Say so in the panel. Remove it from every other design —
  Ghost cannot do arithmetic.
- THE COMPARISON MATRIX: one row per tier-and-benefit pair. Remove de-duplication of shared
  benefits and any "includes everything in the tier below" parsing. Neither is buildable.
- ON PHONES the comparison table keeps scrolling sideways. It does not transpose into
  cards — CSS cannot do that. The design whose columns reorder on mobile reorders
  VISUALLY only; source order stays fixed.
- THE MEMBER CARD: delete the join date. Ghost gives themes no member join date, so it
  would always render as today.
- Every paid action renders only when a payment provider is connected (RULE 9).""",

 'A9': """- Part A only. Your one-at-a-time accordion is APPROVED EXACTLY AS DRAWN: it uses the
  native HTML grouping and needs no JavaScript. On an older browser more than one panel may
  sit open at once, which is accepted and needs nothing designed for it.""",

 'A10': """- A STAT PULLED FROM GHOST that also shows a previous value reads "was 1,200" only — no
  up arrow, no down arrow, no direction word. Ghost cannot compare the two numbers, so
  nothing can decide which way the arrow points.
- Stats the user types themselves are unaffected.""",

 'A11': """- THE RAIL THAT "DRAWS AS ONE ROW WHEN IT FITS": see RULE 8. It stays a rail. When the
  track fits its container the module simply shows no arrows and no fade — same visual
  result, no second design. The panel may advise "at this count, 1 Row reads better".""",

 'A12': """- AVATARS are the main work here (RULE 1): authors pulled from Ghost show ONE letter,
  not two initials. Restate every empty state that assumed two.
- Any per-author role override keyed by name must be keyed by the author's slug instead.""",

 'A15': """- DELETE THE "UPLOAD" SOURCE from every design. There is nowhere to upload to: Ghost's
  public interface has no media library a theme can read, Inflozo is not permitted to
  upload files to a customer's Ghost, and Inflozo's own asset system handles images only.
- THE "AMBIENT LOOP" background-video option goes with it — it had no source of files.
- Remove any reading of a video file's duration; nothing can read it.
- EMBEDS ARE UNAFFECTED. YouTube, Vimeo and the rest keep every design and keep their
  refusal to autoplay. If a design offered a pasted Ghost media URL, that still works.""",

 'A16': """- "SEEDED WITH THE SITE'S OWN CITY" becomes a plain placeholder. No Ghost setting carries
  an address or a city, so the field cannot be seeded from the site.
- REMOVE any pre-filling of the visitor's email from their member record. An Inflozo theme
  never prints a member's own details into the page.
- The honest mailto link stays: it works without JavaScript; the pre-filled draft is what
  JavaScript adds.""",

 'A17': """- "THE FIRST FEATURED POST SPANS TWO COLUMNS" becomes "THE FIRST POST spans" — position,
  not the featured flag. Ghost cannot look across a loop to find which item is featured.
  A grid of featured posts is still available by setting the source to Featured.
- DELETE the "tags from these posts" value in the filtered design. Ghost cannot compute a
  distinct set across a loop. Keep "All site tags" and "Chosen tags".
- "LOAD MORE" is only available when this section is the site's MAIN FEED. Elsewhere there
  is no page 2 to load. Remove the option from the other placements.
- Avatars in the meta row follow RULE 1, avatars — one letter for Ghost authors.""",

 'A18': """- THE GROUPED LIST (by month, year or tag) needs a small script. Ghost cannot tell that
  the month changed between two posts. Without the script the list renders FLAT and
  ungrouped — draw that state and say so in the panel.
- THE NUMBERED LIST restarts at 01 on every page. Ghost cannot continue a count across
  pages. State it in the panel.
- "LOAD MORE" is main-feed-only; remove it from other placements.""",

 'A20': """- "GROUP BY INITIAL" needs the same small script as the grouped post list, with a flat
  ungrouped list as its no-script state. Ghost cannot detect that the first letter changed.
- THE TAG COUNT is capped at 100. "All" both trips Ghost's own warning and silently
  returns 100 anyway, so the panel states the cap and the truncation.
- "TAG COLOUR: Tag's own" requires a recent Ghost. Note the version requirement in the
  panel; on older versions the theme colour is used.""",

 'A21': """- "GROUP BY LETTER" needs the same small script, flat list as the no-script state.
- AUTHOR SOCIAL LINKS must go through Ghost's own link helper. Printing the stored handle
  as a URL produces broken links, because Ghost stores handles in several shapes.
- Avatars follow RULE 1, avatars.""",

 'A22': """- DELETE THE CADENCE LINE ("weekly", "twice a month"). Ghost's newsletters carry no
  cadence field, so half of that generated line can never be generated.
- THE MEMBERS BADGE appears only on PAID newsletters, not on every non-public one.
- "YOU ARE SUBSCRIBED" becomes "SIGNED IN". Ghost does not tell a theme which newsletters
  a member has, so the design cannot know.
- The design where ticking a paid newsletter swaps the field for a Portal link needs
  either a stated no-JavaScript state or a static link instead.
- Apply RULE 9 (member buttons are conditional) and RULE 10 (the no-JavaScript notice) throughout — this category is mostly forms.""",

 'A24': """- BYLINES: "Jane and 2 others" becomes "Jane and others". No number, anywhere. Ghost
  cannot subtract one from the author count.
- THE CONDENSED READING BAR that sticks after the header scrolls away CANNOT WORK AS
  DRAWN — its container has already left the screen, on every site. It becomes
  script-revealed and pinned at the threshold, and it does not appear at all without
  JavaScript.
- Avatars follow RULE 1, avatars.""",

 'A25': """- DELETE the rule that captions over 140 characters are treated differently. CSS cannot
  count characters. All captions get the same treatment.
- HEADING ANCHOR LINKS need JavaScript — an anchor per heading cannot exist without it.
  Declare the behaviour and remove any claim that the design looks identical without it.
- THE LIGHTBOX over article images likewise, and it must NOT run while the user is editing
  (clicking an image to edit its caption should not open a modal).
- SHARE LINKS point at Ghost's Portal share path, not a bare "#/share" — that bare path is
  parsed by nothing and every such link is dead.""",

 'A26': """- BYLINES: "and N others" becomes "and others"; "+N more" for tags likewise. No computed
  numbers.
- "MORE FROM {first name}" uses the author's FULL name. Ghost cannot split a name into
  parts on the versions we support.
- Captions that carry a link need the same treatment as Post Headers'.""",

 'A28': """- THE COMMENT COUNT IS DRAWN BY GHOST'S OWN SCRIPT. Without JavaScript there is no number
  at all — not a zero, nothing. Rewrite the no-JavaScript line on EVERY design, give every
  section a proper accessible name that does not depend on the count, and remove any "%"
  from count labels.
- THE FORCED-DARK THREAD DESIGN is offered only when the project's colour scheme is
  PINNED. On a site that follows the visitor's system preference it renders in the wrong
  scheme for half the audience.
- Ghost's comment box takes its colour from a setting inside Ghost. Inflozo does not
  change that setting; the panel links to it instead.""",

 'A30': """- DELETE THE "MEMBER SINCE" ROW and the newsletter list from the account designs. Neither
  field exists on the member object Ghost gives a theme; both render empty on every live
  site. The newsletter row becomes a link out to Ghost's own account screen.
- NO DESIGN PRINTS A MEMBER'S OWN EMAIL OR NAME into the page. Layout and actions are ours;
  anything identifying is handed to Ghost's own account panel.
- PAID TIER CARDS, their buttons and any deep link render only when a payment provider is
  connected. Ghost seeds a $5 tier at install, so an unconnected site otherwise ships a
  card whose checkout cannot complete.
- DRAW A NEW STATE: the account page as seen by someone SIGNED OUT. Ghost does not redirect
  them — the page is served to anonymous visitors exactly as it stands.""",

 'A31': """- KEEP ALL TEN DESIGNS. The 404 page renders the site header, so search there is simply
  the Headers category's Search control.
- STRIKE this category's own drawn search form. There is no search page to submit to.
- THE PRIVATE-SITE GATE FORM has no destination attribute — Ghost supplies it, and drawing
  one breaks Ghost's own return-to-page behaviour. Remove any drawn form action.""",

 'A32': """- THE FADE at the paywall cut becomes a fixed-height gradient. DELETE "suppressed under
  two lines of visible text" — CSS cannot count lines, so a one-line last paragraph would
  fade to nothing.
- THE READING METER: the words are a static line from Ghost's reading time; the
  proportional fill is script-driven and hidden on very short posts. As drawn it asked a
  template to count the preview's words, which is not possible.""",

 'A33': """THIS IS THE BIGGEST REDRAW IN THE PASS. This category styles the cards inside a blog
post. We own the STYLESHEET and nothing else — not the markup, not the ARIA attributes,
not the text. Ghost renders those.

- THE COLLAPSIBLE "TOGGLE" CARD IS NOT native HTML disclosure markup. Ghost emits a plain
  container with a heading and a button inside it. Redraw the whole toggle roll against
  that, and delete the claim that it avoids heading levels.
- DELETE THE "PUBLIC PREVIEW MARKER" component. Ghost leaves only an invisible comment at
  the paywall cut. There is no element to style.
- THE HTML CARD leaves the target list of both the Rules control and the Contrast Band. It
  emits no wrapper element, so those controls do nothing for it.
- GALLERIES AND EMBED CARDS LOSE the "full bleed" option. Ghost fixes their width and we
  may not override it. Bleed applies to images and video only.
- SIGNUP, CALL-TO-ACTION AND HEADER CARDS leave the Contrast Band's inversion list. They
  carry the post author's own inline colours, which we are not permitted to override. The
  band's background may run behind them; their surfaces stay as the author set them.
- DELETE the claim that this category controls any translatable strings. Those strings
  live inside Ghost's own renderer, and no theme can reach them.
- Record the product-rating card's accessibility as a Ghost limitation rather than
  something this category fixes.""",

 'A34': """- "ALL PAGES" IS CAPPED. Ghost cannot loop over a range of numbers, so a 137-page archive
  cannot be drawn. Draw the seven-slot window as the maximum and cap or drop the value.
- THE "SHOWING 1–12 OF 137" POSITION LINE exists only on the two designs that carry a
  script. Remove it from the eight link-based designs and narrow their block to
  Off · Page count.
- THE "POSTS PER PAGE" LINK points at INFLOZO's theme settings, not Ghost's admin. Ghost
  has no such setting and the drawn link goes nowhere.""",

 'P0': """These are the shared editor controls every category draws from.

- THE REMOVE BUTTON (RULE 2, the Remove button) is the single most-repeated correction in the review. It
  stays visible and active at a list's minimum and explains why it cannot go lower.
- EVERY ITEM COUNT IS A NUMBER PICKER (RULE 5, number pickers), never a row of fixed buttons.
- UNIVERSAL CONTROLS may offer fewer values with a stated reason (RULE 6); the swatch row
  is named "Base"; there is no "Inherit" value.
- ADD TO THE STATE SWITCHER: the signed-out account page, and the no-JavaScript notice for
  member forms.
- HAND-PICKED POSTS HAVE NO MAXIMUM. Earlier drafts said twelve; that was withdrawn after
  measurement. The field lets the user pick as many as they like and WARNS PAST 25. The
  warning must say the cost is PER PAGE, not per section — three hand-picked sections at 25
  each is 75 database queries, about three-quarters of a second added to every visitor's
  page load. Draw that warning state.
- FIELDS THAT ACCEPT A PLACEHOLDER TOKEN in typed text (for example a subscriber count
  inside a heading) show the exact list of tokens that field accepts. Anything else typed
  in braces stays literal text.
- ICONS ARE TABLER throughout; the picker names it as a curated Tabler set and includes the
  nine social platforms Ghost supports.""",
}

PART_A_ONLY = ("- No category-specific rulings. Apply the ten rules in PART A, confirm each rule against every design in "
               "the roster, and record in the Patch notes which rules changed something and which "
               "were already satisfied.")


RESEARCH = os.path.join(ROOT, '_bmad-output/planning-artifacts/prds/prd-Inflozo-2026-08-17',
                        'research-section-js-libraries.md')


def module_list():
    """The legal module names, read from the registry — never typed here (standing rule 4).

    P0's own copy of this list still named `search-overlay` after the module was deleted, in the
    very list every other category reads to learn what it may declare. Deriving it means a prompt
    cannot carry a stale one."""
    mods = re.findall(r'^\| \d+ \| \*\*`([a-z][a-z0-9-]+)`\*\*',
                      open(RESEARCH, encoding='utf8').read(), re.M)
    assert len(mods) > 20, 'module registry did not parse — refusing to emit a short list'
    return mods


def build_prompt(cat, title, designs, holes):
    if cat == 'P0':
        scope = ("THIS IS NOT A DESIGN CATEGORY. P0 Editor Primitives is the set of SHARED CONTROLS\n"
                 "every category's side panel draws from — the item list with its Add and Remove, the\n"
                 "number pickers, the shared colour and spacing controls, the state switcher, the link\n"
                 "picker and the icon picker. Change them here once and every category inherits it,\n"
                 "which is why this runs first.")
    else:
        roster = '\n'.join(f'  {d["n"]:>2}. {d["name"]}' for d in designs)
        scope = f"THIS CATEGORY — {cat} {title}, {len(designs)} designs:\n\n{roster}"
    hole_note = ''
    if holes:
        hole_note = ('\n\nNUMBERING GAP IN THIS CATEGORY: ' +
                     ', '.join(f'#{h["n"]} ({h["name"]}) is DELETED' for h in holes) +
                     '. That number is retired. Do not close the gap and do not reuse it.')
    work = WORK.get(cat, PART_A_ONLY)
    modules = '  ' + ' · '.join(f'`{m}`' for m in module_list())
    return f"""INFLOZO — DESIGN PATCH PASS · {cat} {title}
Paste into a NEW Claude Design chat. Self-contained: assume no other context.

WHAT THIS IS. You previously produced a library of Ghost theme sections — categories of
designs, each with frames and a specification. That library was reconciled against the
product requirements, the architecture, and Ghost itself, including live tests against two
real Ghost servers. 1,086 findings came back and the owner ruled on all of them. This
prompt is the complete work list for ONE category: {cat} {title}.

Work only on {cat}. Do not touch other categories.

{FACTS}

{scope}

The library as a whole is 33 categories and 468 designs. There is no A23 — the Search
category was deleted and that number is retired.{hole_note}

{NUMBERING}

THE BEHAVIOUR MODULES THAT EXIST. If a design needs behaviour, it names one of these and
nothing else. This list is complete and current:

{modules}

`search-overlay`, `search-expand` and `command-palette` were DELETED when the Search
category went — never name them. If a design needs behaviour no module here covers, mark
it "ARCHITECT: registry addition" in the spec and design its no-JavaScript state; never
invent a module name.

{PART_A}

PART B — {cat} {title}: THE SPECIFIC WORK.

{work}

{DONT}

{OUTPUT}

{ASK}
"""


CSS = """*{box-sizing:border-box}
:root{--bg:#fbfaf8;--card:#fff;--ink:#191919;--muted:#6a6a6c;--line:#e5e1db;--code:#f4f2ef;
--accent:#1f6feb;--accent-s:#e9f0fe;--patch:#96650a;--patch-s:#fff4d9;--build:#12784a;--build-s:#e2f5ec;
--sh:0 1px 2px rgba(0,0,0,.04),0 6px 20px rgba(0,0,0,.05)}
@media(prefers-color-scheme:dark){:root:not([data-theme=light]){--bg:#131316;--card:#1b1b20;
--ink:#ecebea;--muted:#9e9b99;--line:#2f2f36;--code:#232329;--accent:#6ea8fe;--accent-s:#1b2a45;
--patch:#e8bd57;--patch-s:#33280d;--build:#5ed6a0;--build-s:#112f20;
--sh:0 1px 2px rgba(0,0,0,.3),0 6px 20px rgba(0,0,0,.36)}}
body{margin:0;background:var(--bg);color:var(--ink);
font:15px/1.6 ui-sans-serif,-apple-system,"Segoe UI",Inter,system-ui,sans-serif}
.wrap{max-width:1000px;margin:0 auto;padding:32px 20px 96px}
h1{font-size:1.55rem;margin:0 0 6px;letter-spacing:-.01em}
.sub{color:var(--muted);margin:0 0 22px;font-size:.93rem}
.bar{position:sticky;top:0;z-index:5;background:var(--bg);padding:12px 0 10px;border-bottom:1px solid var(--line);
margin-bottom:20px;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
.prog{height:8px;flex:1;min-width:180px;background:var(--line);border-radius:99px;overflow:hidden}
.prog i{display:block;height:100%;width:0;background:var(--build);transition:width .3s}
.count{font-weight:680;font-size:.9rem;white-space:nowrap}
.btn{font:inherit;font-size:.82rem;font-weight:600;padding:6px 12px;border-radius:8px;
border:1px solid var(--line);background:var(--card);color:var(--ink);cursor:pointer}
.btn:hover{border-color:var(--accent);color:var(--accent)}
.cat{background:var(--card);border:1px solid var(--line);border-radius:13px;box-shadow:var(--sh);
margin:0 0 14px;overflow:hidden}
.cat.done{opacity:.5}
.cat.urgent{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-s),var(--sh)}
.chead{display:flex;gap:12px;align-items:center;padding:13px 16px;cursor:pointer}
.cid{font-weight:700;font-size:.82rem;padding:3px 9px;border-radius:99px;background:var(--accent-s);
color:var(--accent);min-width:44px;text-align:center}
.cname{font-weight:650;flex:1}
.cmeta{color:var(--muted);font-size:.82rem}
.tick{width:19px;height:19px;accent-color:var(--build);cursor:pointer;flex:none}
.cat.done .cname{text-decoration:line-through}
.body{display:none;border-top:1px solid var(--line);padding:14px 16px 16px}
.cat.open .body{display:block}
pre{background:var(--code);border:1px solid var(--line);border-radius:9px;padding:13px;
overflow:auto;max-height:460px;font:12px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;
white-space:pre-wrap;word-break:break-word;margin:0 0 10px}
.note{background:var(--patch-s);color:var(--patch);border-radius:9px;padding:10px 13px;
font-size:.87rem;margin:0 0 16px}
.big{background:var(--build-s);color:var(--build);border-radius:9px;padding:10px 13px;
font-size:.87rem;font-weight:600;margin:0 0 6px;display:inline-block}
h2.wave{font-size:1.02rem;margin:30px 0 4px;letter-spacing:-.01em}
.why{color:var(--muted);font-size:.87rem;margin:0 0 12px;max-width:78ch}
.step{font-weight:700;font-size:.78rem;min-width:22px;text-align:right;color:var(--muted);flex:none}
.flag{display:inline-block;font-size:.78rem;font-weight:600;border-radius:8px;padding:5px 10px;margin:0 6px 10px 0}
.flag.hole{background:var(--patch-s);color:var(--patch)}
.flag.big{background:var(--build-s);color:var(--build)}
.gate{background:var(--accent-s);color:var(--accent);border-radius:11px;padding:13px 16px;
margin:14px 0 8px;font-size:.89rem;line-height:1.55}
.gate code{background:transparent;font-weight:600}
footer{color:var(--muted);font-size:.82rem;margin-top:32px;border-top:1px solid var(--line);padding-top:14px}"""

JS = """const K='inflozo-design-patch-done-v2';   // v2: seeded with the checkpoint's completed set
const SEED=['P0','A1','A4'];
let done;
try{const raw=localStorage.getItem(K); done=new Set(raw?JSON.parse(raw):SEED);}
catch(e){done=new Set(SEED);}
function save(){try{localStorage.setItem(K,JSON.stringify([...done]))}catch(e){}paint()}
function paint(){
  document.querySelectorAll('.cat').forEach(c=>{
    const id=c.dataset.cat, is=done.has(id);
    c.classList.toggle('done',is); c.querySelector('.tick').checked=is;});
  const n=document.querySelectorAll('.cat').length;
  document.querySelector('.count').textContent=done.size+' / '+n+' done';
  document.querySelector('.prog i').style.width=(done.size/n*100)+'%';}
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.classList.contains('tick')){const id=t.closest('.cat').dataset.cat;
    done.has(id)?done.delete(id):done.add(id); save(); e.stopPropagation(); return;}
  if(t.closest('.chead')){t.closest('.cat').classList.toggle('open'); return;}
  if(t.classList.contains('copy')){
    const pre=t.closest('.body').querySelector('pre');
    navigator.clipboard.writeText(pre.textContent).then(()=>{
      const o=t.textContent; t.textContent='Copied'; setTimeout(()=>t.textContent=o,1200);});}
});
document.querySelector('#reset').onclick=()=>{if(confirm('Clear all progress?')){done.clear();save();}};
document.querySelector('#expand').onclick=()=>document.querySelectorAll('.cat').forEach(c=>c.classList.add('open'));
paint();"""


def render():
    lib, _ = er.build()
    live = {c: v for c, v in lib.items() if not v.get('deleted')}

    ordered = [c for _, _, cats in WAVES for c in cats]
    missing = sorted(set(live) - set(ordered), key=lambda c: int(c[1:]))
    assert not missing, f'WAVES does not place every category: {missing}'   # never silently drop one

    def card(cat, step):
        if cat == 'CORRECTION':
            return f'''<div class="cat urgent" data-cat="CORRECTION">
  <div class="chead"><input class="tick" type="checkbox" aria-label="mark correction done">
    <span class="step">{step}</span>
    <span class="cid">FIX</span><span class="cname">Correction to P0, Headers and Heroes</span>
    <span class="cmeta">run before anything else</span></div>
  <div class="body"><span class="flag hole">unblocks every later session</span>
    <pre>{html.escape(CORRECTION)}</pre>
    <button class="btn copy">Copy prompt</button></div></div>'''
        if cat == 'P0':
            title, n_live, holes, designs = 'Editor Primitives', 0, [], []
        else:
            v = lib[cat]; title = v['title']
            designs = [d for d in v['designs'] if not d.get('deleted')]
            holes = [d for d in v['designs'] if d.get('deleted')]
            n_live = len(designs)
        prompt = build_prompt(cat, title, designs, holes)
        meta = ('shared controls' if cat == 'P0' else f'{n_live} designs')
        meta += ' · specific rulings' if cat in WORK else ' · the ten rules only'
        flags = ''
        if holes:
            flags += '<span class="flag hole">numbering gap — tests the riskiest rule</span>'
        if cat == 'A33':
            flags += '<span class="flag big">biggest redraw in the pass</span>'
        return f'''<div class="cat" data-cat="{cat}">
  <div class="chead"><input class="tick" type="checkbox" aria-label="mark {cat} done">
    <span class="step">{step}</span>
    <span class="cid">{cat}</span><span class="cname">{html.escape(title)}</span>
    <span class="cmeta">{meta}</span></div>
  <div class="body">{flags}
    <pre>{html.escape(prompt)}</pre>
    <button class="btn copy">Copy prompt</button>
  </div></div>'''

    cards, step, n_designs = [], 0, sum(
        len([d for d in v['designs'] if not d.get('deleted')]) for v in live.values())
    DONE_WAVE = 1                       # the "Done — kept for reference" group
    for wi, (wtitle, why, cats) in enumerate(WAVES):
        cards.append(f'<h2 class="wave">{html.escape(wtitle)}</h2>'
                     f'<p class="why">{why}</p>')
        for cat in cats:
            if wi == DONE_WAVE:
                cards.append(card(cat, '&#10003;'))     # done: a tick, not a position
            else:
                step += 1
                cards.append(card(cat, step))
        if wi == 1:
            cards.append('''<div class="gate"><b>The checkpoint passed.</b> Headers came back
      numbered 1&ndash;8 then 10&ndash;16 and Heroes 1&ndash;14 then 16&ndash;18 &mdash; the gaps
      held, so the rest can be batched. It also found three things worth knowing: your merge tool
      was silently closing those gaps afterwards (fixed), the two free designs were being chosen by
      the design session rather than by you (now a question every category must ask), and P0 still
      listed a deleted module as legal (the correction above). Run the correction, then work
      straight down. Export once at the end and run
      <code>python3 tools/verify-design-pass.py</code>.</div>''')

    return f"""<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Design patch prompts</title><style>{CSS}</style>
<body><div class="wrap">
<h1>Design patch pass — one prompt per category</h1>
<p class="sub">Paste each into a <b>new</b> Claude Design chat. Every prompt is self-contained:
it carries the four Ghost facts, the ten library-wide rules, its own roster and its own work list.
Tick a category when its export is back. Progress is stored in this browser.</p>
<div class="bar"><span class="count"></span><span class="prog"><i></i></span>
<button class="btn" id="expand">Expand all</button><button class="btn" id="reset">Reset</button></div>
<p class="note"><b>The rule most likely to be broken by good intentions:</b> do not renumber
anything. Deleted designs leave permanent gaps — Headers has no #9, Heroes has no #15 — and every
other document in the project references designs by number. If an export comes back with Headers
numbered 1–15 contiguously, that is the tell.</p>
<p class="note"><b>Run them in the order below, top to bottom.</b> It is not arbitrary: the first
three are a deliberate checkpoint, and the four after that each draw something the later categories
reuse, so drawing them well once saves re-deciding the same thing four times. Within a wave the
order does not matter.</p>
{''.join(cards)}
<footer>Generated from <code>tools/design-patch-prompts.py</code>. Rosters derive from the design
export via <code>export-roster.py</code>, so design numbers and names cannot drift; the rulings are
authored in the generator. {len(live)} categories · {n_designs} designs · plus P0.
Rulings: <code>prds/prd-Inflozo-2026-08-17/reconcile-designs-decisions.md</code>.
Verify a returned export with <code>python3 tools/verify-design-pass.py</code>.</footer>
</div><script>{JS}</script></body></html>"""


def main():
    out = render()
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur.strip() != out.strip():
            open(OUT, 'w', encoding='utf8').write(out)
            print('DESIGN-PATCH-PROMPTS.html was stale and has been regenerated'); return 1
        print('design patch prompts: current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
