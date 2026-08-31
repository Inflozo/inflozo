#!/usr/bin/env python3
"""Inflozo — design patch pass TWO, one self-contained Claude Design prompt per category.

    python3 tools/design-patch-prompts-2.py            # regenerate DESIGN-PATCH-PROMPTS-2.html
    python3 tools/design-patch-prompts-2.py --check    # exit non-zero if the file is stale

WHY A SECOND FILE RATHER THAN AN EDIT TO THE FIRST. Pass one ran on 2026-08-31 and
`DESIGN-PATCH-PROMPTS.html` is the record of what was sent. Rewriting its work lists in place
would destroy that record to save one file, and this project's whole discipline is that a dated
record is not edited.

WHAT THIS PASS CARRIES. The SPEC HALF of every ruling taken after pass one was written — R-30 to
R-38 (§A2/§A3 of `reconcile-designs-decisions.md`), the three carried-forward rulings R-2, R-10
and R-29, and two findings that came out of execution on 2026-08-31 rather than out of a ruling
(`MEASUREMENTS.md` §31a and §32). The NORMATIVE half of all of them is already landed; nothing
here is a decision, and nothing here is optional.

Everything shared with pass one — the four Ghost facts, the roster derivation, the output
contract, the page CSS — is IMPORTED from `design-patch-prompts.py` rather than copied. Only the
per-category work lists are authored here, because a ruling is not something you can derive.
"""
import os, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_bmad-output/planning-artifacts/DESIGN-PATCH-PROMPTS-2.html')

_s = importlib.util.spec_from_file_location('dp1', os.path.join(ROOT, 'tools/design-patch-prompts.py'))
dp1 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp1)
er = dp1.er

# ─────────────────────────────────────────────────────────────────────────────
# Carried in EVERY prompt. Pass one's four Ghost facts still hold; these are the
# rules this pass adds on top of them.
# ─────────────────────────────────────────────────────────────────────────────

PART_A2 = """PART A — THE FIVE RULES THIS PASS ADDS. They apply to this category too, whether or
not the work list below repeats them. Use the NAME, never the number.

RULE A · A CONTROL SWITCHED OFF BY ANOTHER IS GREYED, WITH THE REASON BESIDE IT.
   Never hidden, and never left accepting a value it will not honour. Write the reason as a
   short sentence at the control, not as a tooltip: "not available while the media uses the
   accent colour". A control that vanishes teaches nothing — the user cannot tell a rule from
   a bug — and one that silently ignores you is worse. Same shape as the Remove button rule.
   ONE EXCEPTION, and it is different in kind: a control this project can NEVER offer is not
   drawn at all and the panel says why. The visitor dark-mode switch under a pinned colour
   scheme is the only current case.

RULE B · AVATARS WITH NO PHOTOGRAPH SHOW INITIALS, AND THE TWO FORMS ARE NOT INTERCHANGEABLE.
   A list the user types themselves gets TWO initials ("Jane Doe" -> JD). An author pulled
   from Ghost gets ONE letter ("Jane Doe" -> J). This is not a style choice: Ghost's template
   language cannot split a name on the versions we support, so two initials are unreachable
   for anything Ghost supplies. Never mix the two forms inside one component.

RULE C · THE REMOVE BUTTON NEVER GREYS OUT. Unchanged from pass one and restated because it is
   the reference case Rule A points at. At the minimum, Remove stays visible and fully
   clickable, and clicking it produces the floor and the reason as one sentence under the list.

RULE D · A COUNT THAT PICKS BETWEEN DRAWN LAYOUTS IS A NAMED SET, NOT A NUMBER PICKER.
   The test is whether every value has a frame somebody has actually looked at. "How many
   items to show" stays a number picker. "Which of three drawn arrangements" is three named
   values. Do not convert one into the other.

RULE E · A DESIGN MAY DECLARE THE WIDTH BELOW WHICH ITS SCRIPT RUNS.
   Write it as "collapses into sections under 768". Where a design declares one, its no-JS
   line must describe the state on BOTH sides of that width, not just the narrow one."""

FINDINGS = """TWO THINGS WE LEARNED BY TESTING REAL GHOST SERVERS ON 2026-08-31. Both change
what a specification may promise, and neither is a preference.

FINDING 1 · THE FEATURE-IMAGE CAPTION RENDERS DIFFERENTLY ON THE TWO GHOST VERSIONS.
   Same stored text, same template, different output. Ghost 6 quietly removes <em> and
   <strong> from a caption while keeping links and <b>. Ghost 5 keeps everything. So a caption
   design that leans on italics gets them on one supported version and not the other. Say so
   in the specification rather than letting a builder discover it.

FINDING 2 · A COMMENT COUNT RENDERS NOTHING AT ALL WITHOUT JAVASCRIPT.
   Not a zero, not an empty box, not a dash — the element is never created. Ghost writes the
   number in with a script and PREPENDS it to your word, so the catalog string is the bare
   noun ("comment", "comments") and must never contain a number or a placeholder. Any design
   that reads the count aloud puts its accessible label on the surrounding element, never on
   the count itself. The comments WIDGET does render without JavaScript; only its count does
   not, so the two degrade differently and a single no-JS sentence cannot cover both."""

KEEP_IT = """SOME OF THIS LIBRARY WAS EDITED IN THE REPOSITORY, NOT IN CLAUDE DESIGN. LEAVE
THOSE EDITS ALONE — they are deliberate, they are the current truth, and re-exporting over them
would undo work that was done for a reason.

WHAT WAS CHANGED OUTSIDE CLAUDE DESIGN, and must stay changed:

1. EVERY PRINTED DESIGN TOTAL WAS REMOVED FROM THE MARKETING AND APP SCREENS. Copy that used to
   read "485 designs", "485 designed sections" or "70 Free designs" now reads "Ship every
   design", "Browse every design", "Hundreds of designed sections", "The free set". This was
   done in the repository across the Index frames, M1 Home, M2 Features, M4 Gallery, M5 Pricing,
   S2 Onboarding, S12 Billing, B Missing Surfaces, R Responsive System and three A-frames
   (A18-9, A18-11, A29-10).
   DO NOT put a number back. Not the old one, not a corrected one. The library changes size
   whenever a design is added or cut, so any number in product copy is wrong within a month —
   which is exactly what happened to the last one. If you touch any of that copy, keep it
   count-agnostic. There is an automated check that fails the build if a number reappears.

2. P0's PER-PROP MARK ALLOWLIST WAS WRITTEN IN THE REPOSITORY. The section stating the default
   inline marks (bold, italic, underline, link), that a field may NARROW that set, and that a
   mark a field does not permit is ABSENT from the toolbar rather than greyed — that text is
   current and correct. Do not rewrite it, do not soften "absent" to "disabled", and do not
   drop it. There is an automated check for this one too.

IF YOU ARE UNSURE whether something you are looking at was changed here or in Claude Design:
leave it. Say in your Patch notes that you left it and why. A thing left alone can be fixed in
one message; a deliberate edit silently reverted is found months later, if at all."""


# ─────────────────────────────────────────────────────────────────────────────
# The per-category work lists. Authored — these are rulings, not derivations.
# ─────────────────────────────────────────────────────────────────────────────

WORK2 = {
 'P0': """- THE GREYED-CONTROL PATTERN IS DRAWN HERE ONCE AND EVERY CATEGORY INHERITS IT. A control
  another control has switched off is drawn greyed with its reason as a short sentence beside
  it. Draw the resting state, the greyed state and where the sentence sits. Categories will
  point at this frame rather than each inventing a treatment.
- RESTATE THE REMOVE BUTTON RULE in the item-list controls: never greys, never hides, and
  clicking at the minimum produces the floor and the reason as one line of text under the list.
- THE INITIALS FALLBACK in the "Populate from..." panel: a person with no photograph shows
  initials, TWO letters where the user typed the name and ONE where Ghost supplied it. Draw
  both, labelled, so no category has to guess which it is looking at.""",

 'A1': """- NO VISITOR DARK-MODE SWITCH WHEN THE SITE'S COLOUR SCHEME IS PINNED. If the owner has
  chosen Light or Dark rather than Auto, the header's dark-mode toggle is NOT OFFERED AT ALL —
  not drawn greyed — and the panel says why in one sentence. Pinning is the owner's deliberate
  choice and a visitor switch that overrides it makes the pin meaningless. Draw the panel in
  both states: toggle available under Auto, absent with its reason under a pin.
- THE AVATAR RULE reaches A1-6, wherever a person's face appears in a header.""",

 'A2': """- A2-15 DECLARES THE WIDTH BELOW WHICH ITS SCRIPT RUNS. Write it as "collapses into
  sections under 768", and give its no-JS line BOTH states: what a visitor without JavaScript
  sees above that width, and what they see below it. One sentence covering only the narrow
  case is what this rule exists to stop.""",

 'A3': """- THE FOOTER ACCORDIONS DECLARE THEIR WIDTH. Same shape as A2-15: the accordion
  behaviour only runs below a stated width, the declaration names it, and the no-JS line
  describes both sides of it — a plain stacked list of links above the width, the same list
  above it below.""",

 'A5': """- THE DISABLED-CONTROL PATTERN, and this category is its worked example. "Icon in
  accent" spends the accent colour, so the Action button below the set can no longer use it:
  that control is GREYED with the sentence "not available while the media uses the accent
  colour" beside it. Draw the pair in both states. Use P0's treatment; do not invent one.""",

 'A12': """- "COUNT PER ROW" KEEPS ITS THREE NAMED VALUES — three, four, five. It is NOT a
  number picker, and this is the one carve-out to the rule that every item count is one. The
  reason is that this control picks between three DRAWN layouts: at three the photograph is
  large and a job title has room to wrap; at five it is small and a long title wraps twice.
  Those are the only widths any frame here has been drawn and checked at, against a long role
  and a wrapping name. Six across would give 196px photographs, which is the size the
  wall-of-faces design uses precisely BECAUSE it draws no roles. A typed number would let an
  editor choose a width nobody has looked at.
  Note that "how many people to show" is a separate control and stays a number picker.
- THE AVATAR RULE, across all fourteen Empty lines: TWO initials, because a team list is typed
  by the user.
- ONE DESIGN MUST NOT NAME ANOTHER. The responsive note currently says the section "draws as
  1 Grid" when the cards are not wider than the content width. Describe the RESULT, not another
  design: "draws as a plain grid, with no arrows, no fades and no scroll container". A14 already
  made this change for the same reason — a design that turns into a named design is the thing
  the library rules out, and the phrasing is how it creeps back.""",

 'A13': """- A13-15 DECLARES THE WIDTH BELOW WHICH ITS SCRIPT RUNS, with both sides of it
  described in the no-JS line.
- THE EMPTY STATE IS THIN HERE AND NEEDS WRITING. When the feed this category draws from has
  nothing in it, show the designed "nothing here yet" state. It is never back-filled with the
  newest posts — a visitor must not be shown posts nobody chose for that spot.""",

 'A14': """- THE DISABLED-CONTROL PATTERN wherever one gallery control switches another off.
  Greyed, with the reason beside it, using P0's treatment.""",

 'A15': """- THE TITLE, DESCRIPTION AND POSTER ARE REQUIRED FIELDS THE CUSTOMER FILLS IN. NOTHING
  IS EVER FETCHED FROM YOUTUBE, VIMEO OR ANY OTHER PROVIDER — not by our server, not by the
  editor's browser, at any point. The specification must say the fields are REQUIRED, not
  "fetched with a manual override", and the panel must ask for them rather than showing a
  spinner or a "fetch details" button. Delete any affordance that implies a lookup.""",

 'A17': """- THE DISABLED-CONTROL PATTERN wherever one control switches another off.
- THE AVATAR RULE across the eleven Meta designs. These bylines come from GHOST, so it is ONE
  letter, not two.""",

 'A18': """- THE DISABLED-CONTROL PATTERN wherever one control switches another off, greyed with
  the reason beside it.""",

 'A19': """- THE DISABLED-CONTROL PATTERN wherever one control switches another off, greyed with
  the reason beside it.""",

 'A22': """- THE EMPTY STATE IS THIN HERE AND NEEDS WRITING. A feed with nothing in it shows its
  designed "nothing here yet" state — never hidden, and never back-filled with whatever is
  newest.""",

 'A24': """- DESIGN 13, THE STICKY READING BAR, RENDERS NOTHING WITHOUT JAVASCRIPT. No bar, and
  NO RESERVED SPACE: the header simply scrolls away as every other Post Header design's does.
  The bar cannot be built without a script — a browser can only pin an element inside its
  containing box, and the header it belongs to has scrolled out of view by then. Of the three
  shapes we considered, a persistent title bar costs every such visitor 56px of phone screen
  for a feature they are not getting, and a bar that is drawn but does not follow reads as
  broken rather than as a choice. Rewrite design 13's no-JS line to say exactly this.
- THE CAPTION VERSION DIFFERENCE (Finding 1): state in the specification that italics and bold
  inside a feature-image caption survive on Ghost 5 and are stripped on Ghost 6, so no caption
  design may depend on them.
- THE AVATAR RULE wherever a byline face appears — ONE letter, since these come from Ghost.""",

 'A25': """- A PAGE LAYOUT MAY CARRY EXACTLY ONE POST CONTENT SECTION, AND THE EDITOR REFUSES A
  SECOND. Two would print the article twice on the live page. It is refused AT PLACEMENT with
  the reason shown — not accepted and warned about afterwards — because there is no reason to
  want it, so nothing is lost by making it impossible. Draw the refusal.
- THE SHARE RAIL USES THE SITE-WIDE SHARE LIST, in the order the site set, not its own. Every
  sharing surface on a site offers the same destinations in the same order.""",

 'A26': """- THE SHARE ROW USES THE SITE-WIDE SHARE LIST, in the order the site set. Do not draw
  a per-section destination picker.
- WE DO NOT USE GHOST'S OWN SHARE POPUP, and the reason is worth carrying: it does not exist
  on Ghost 5 at all — the same link opens the SIGN-IN box instead — and where it does exist it
  is a sealed frame we cannot style, with a fixed order and no Mastodon. Our share links are
  ordinary links and work with JavaScript off.
- THE CAPTION VERSION DIFFERENCE (Finding 1) applies here too.""",

 'A28': """- NO VISITOR DARK-MODE SWITCH WHEN THE COLOUR SCHEME IS PINNED, and the comments
  widget takes its light or dark appearance from that same pinned value rather than offering a
  second selector of its own.
- DESIGN 4 IS ONLY OFFERED WHEN THE COLOUR SCHEME IS PINNED. On a site set to Auto its forced
  band renders wrong for half the audience.
- THE COMMENT COUNT (Finding 2). Rewrite every no-JS line in this category: without JavaScript
  the count renders NOTHING — no number, no word, no empty box, no element at all. The count's
  accessible label goes on the SURROUNDING element, never on the count. And the count's words
  are bare nouns — "comment", "comments" — because Ghost's script puts the number in front of
  them; a "%" or "{count}" in that string renders literally on the page. Note the widget itself
  DOES render without JavaScript, so its no-JS sentence is not the count's.""",

 'A33': """- GIVE THIS CATEGORY ITS SELECTORS. The coverage here is good — all twenty of Ghost's
  cards are drawn, each with its fields — and the toggle is already described correctly in words
  ("a plain container with an h4 and a button, not details/summary"). What is missing is the one
  thing this category's deliverable actually is: **not a single Ghost class name appears anywhere
  in the specification.** No `kg-toggle-card`, no `kg-card`, no `kg-width-wide` — nothing. A33
  ships a stylesheet and nothing else, so a builder is told exactly what to style and never told
  what to SELECT.
  Add the class name beside each card in the shared field list, and name the width classes the
  Card widths row depends on. Where you are not certain of a class, say so rather than guessing —
  a wrong selector silently styles nothing, which is the worst failure available here.
  Keep the standing constraint in view: inside a post's body we own the stylesheet and nothing
  else — not the markup, not the ARIA attributes, not the text. Nothing here may assume markup we
  would have to emit.""",

 'A34': """- THE EMPTY STATE IS THIN HERE AND NEEDS WRITING: a feed with nothing in it shows its
  designed "nothing here yet" state.
- "POSTS PER PAGE" POINTS AT INFLOZO'S OWN THEME SETTINGS, NEVER AT GHOST'S ADMIN. Ghost has
  no such setting anywhere in its admin, so a link sending someone there sends them looking for
  a control that does not exist. Fix the wording and the destination everywhere this category
  mentions it.""",
}

ORDER = ['P0', 'A1', 'A2', 'A3', 'A5', 'A12', 'A13', 'A14', 'A15', 'A17',
         'A18', 'A19', 'A22', 'A24', 'A25', 'A26', 'A28', 'A33', 'A34']


def build_prompt(cat, title, designs, holes):
    if cat == 'P0':
        scope = ("THIS IS NOT A DESIGN CATEGORY. P0 Editor Primitives is the set of SHARED CONTROLS\n"
                 "every category's side panel draws from. Change them here once and every category\n"
                 "inherits it, which is why this runs first.")
    else:
        roster = '\n'.join(f'  {d["n"]:>2}. {d["name"]}' for d in designs)
        scope = f"THIS CATEGORY — {cat} {title}, {len(designs)} designs:\n\n{roster}"
    hole_note = ''
    if holes:
        hole_note = ('\n\nNUMBERING GAP IN THIS CATEGORY: ' +
                     ', '.join(f'#{h["n"]} ({h["name"]}) is DELETED' for h in holes) +
                     '. That number is retired. Do not close the gap and do not reuse it.')
    return f"""INFLOZO — DESIGN PATCH PASS TWO · {cat} {title}
Paste into a NEW Claude Design chat. Self-contained: assume no other context.

WHAT THIS IS. You produced a library of Ghost theme sections, and it has already been through
one patch pass. Since then the owner ruled on nine further questions and we tested two claims
against real Ghost servers. This pass carries those results into the specifications and the
frames. Nothing below is a proposal or a question — every item is already decided.

DO NOT REDESIGN ANYTHING. Keep every frame, every name, every number. Change only what the work
list names. Where a change touches a drawn frame, change that frame; where it touches only the
written specification, change only that.

{KEEP_IT}

{dp1.FACTS}

{PART_A2}

{FINDINGS}

{scope}{hole_note}

ONE HOUSEKEEPING JOB WHILE YOU ARE IN THIS SPECIFICATION. Its "Open questions" section still
lists items that were since answered, and they are indistinguishable from ones that were not.
For each: if it has been settled anywhere in the document, strike it through and write who
settled it. If it is genuinely still open, leave it and mark it OPEN FOR THE OWNER on its own
line. Do not answer one yourself. A list where everything looks open is a list nobody reads.

THE WORK LIST FOR {cat}:

{WORK2.get(cat, '- No category-specific items beyond PART A and the two findings above.')}

{dp1.OUTPUT}"""


def render():
    lib, _ = er.build()
    live = {c: v for c, v in lib.items() if not v.get('deleted')}
    unknown = [c for c in ORDER if c != 'P0' and c not in live]
    assert not unknown, f'ORDER names a category the export does not have: {unknown}'
    orphan = sorted(set(WORK2) - set(ORDER))
    assert not orphan, f'WORK2 has a category ORDER never emits: {orphan}'   # never silently drop one

    cards = []
    for step, cat in enumerate(ORDER, 1):
        if cat == 'P0':
            title, designs, holes = 'Editor Primitives', [], []
            meta = 'shared controls'
        else:
            v = lib[cat]; title = v['title']
            designs = [d for d in v['designs'] if not d.get('deleted')]
            holes = [d for d in v['designs'] if d.get('deleted')]
            meta = f'{len(designs)} designs'
        prompt = build_prompt(cat, title, designs, holes)
        cards.append(f'''<div class="cat" data-cat="{cat}">
  <div class="chead"><input class="tick" type="checkbox" aria-label="mark {cat} done">
    <span class="step">{step}</span>
    <span class="cid">{cat}</span><span class="cname">{html.escape(title)}</span>
    <span class="cmeta">{meta}</span></div>
  <div class="body"><pre>{html.escape(prompt)}</pre>
    <button class="btn copy">Copy prompt</button></div></div>''')

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Design patch prompts, pass two</title><style>{dp1.CSS}</style></head>
<body><div class="wrap">
<div class="kick">Inflozo</div>
<h1>Design patch pass two — one prompt per category</h1>
<p class="lede">The spec half of every ruling taken after pass one, plus two things we learned by
testing real Ghost servers. <b>Run P0 first</b> — the greyed-control treatment is drawn there once
and every later category points at it. Then work down. Each prompt is self-contained: open a new
Claude Design chat, paste, done. Your ticks are remembered in this browser.</p>
<p class="lede"><b>Nothing here is a question.</b> The normative half of every item is already in
the PRD and the architecture; this pass carries it into the designs. Verify each returned export
with <code>python3 tools/verify-design-pass.py</code>.</p>
{''.join(cards)}
</div>
<script>
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{{
  navigator.clipboard.writeText(b.parentElement.querySelector('pre').textContent);
  b.textContent='Copied';setTimeout(()=>b.textContent='Copy prompt',1400);}}));
document.querySelectorAll('.chead').forEach(h=>h.addEventListener('click',e=>{{
  if(e.target.classList.contains('tick'))return;
  h.parentElement.classList.toggle('open');}}));
const K='inflozo-patch2';
const st=JSON.parse(localStorage.getItem(K)||'{{}}');
document.querySelectorAll('.cat').forEach(c=>{{
  const id=c.dataset.cat,t=c.querySelector('.tick');
  if(st[id]){{t.checked=true;c.classList.add('done');}}
  t.addEventListener('change',()=>{{st[id]=t.checked;c.classList.toggle('done',t.checked);
    localStorage.setItem(K,JSON.stringify(st));}});}});
</script></body></html>"""


def main():
    out = render()
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur.strip() != out.strip():
            open(OUT, 'w', encoding='utf8').write(out)
            print('DESIGN-PATCH-PROMPTS-2.html was stale and has been regenerated'); return 1
        print('design patch prompts (pass 2): current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)} — {len(ORDER)} prompts')
    return 0


if __name__ == '__main__':
    sys.exit(main())
