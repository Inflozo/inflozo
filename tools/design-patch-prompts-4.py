#!/usr/bin/env python3
"""Inflozo — design patch pass FOUR. The spec-side half of R-48 to R-59 (2026-09-03).

    python3 tools/design-patch-prompts-4.py            # regenerate DESIGN-PATCH-PROMPTS-4.html
    python3 tools/design-patch-prompts-4.py --check    # exit non-zero if the file is stale

Same shape as passes two and three, and a separate file for the same reason: each earlier page is
the record of what was actually sent.

WHAT THIS PASS CARRIES. Twelve rulings came out of `LIBRARY-QUESTIONS.html` on 2026-09-03. Six
changed a requirement and are already landed. These eight prompts carry the rest — and **five of the
eighteen questions asked needed no ruling at all**, because the PRD had already answered them; those
are confirmations here, not decisions, and they close the library's most-repeated question in five
places at once.

ONE THING THIS PASS DELIBERATELY DOES NOT FINISH, and it is named rather than hidden. R-51 gives
Image focus a horizontal axis. That control is enumerated **independently in two dozen category
specs** — it is not a shared control at all, which is R-53's own complaint in its worst form. P0
gains the single definition, and **only A13 is asked to switch to it**, because A13 is where the gap
was found; every other category still carries a private copy and needs a mechanical sweep.
`image_focus_sweep()` derives that list from the export rather than taking it on trust — see its
docstring for why the first version of it was wrong.
"""
import os, re, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_bmad-output/planning-artifacts/DESIGN-PATCH-PROMPTS-4.html')
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')

_s = importlib.util.spec_from_file_location('dp3', os.path.join(ROOT, 'tools/design-patch-prompts-3.py'))
dp3 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp3)
dp2, dp1, er = dp3.dp2, dp3.dp1, dp3.er

ORDER = ['P0', 'A13', 'A14', 'A17', 'A18', 'A19', 'A24', 'A26']


ENUMERATES = re.compile(r'Centre · Top · Bottom|Centre / Top / Bottom|Top · Centre · Bottom')
REFERENCES = re.compile(r'P0·9|P0-9')


def image_focus_sweep():
    """Categories still carrying a PRIVATE copy of the focus values.

    Derived, never typed: R-53's whole point is that this control has private copies, and a
    hand-written list of them would be one more thing to go stale.

    THE FIRST VERSION OF THIS FUNCTION WAS WRONG, and the 2026-09-03 export proved it. It excluded
    every category in ORDER, assuming that being in the pass meant being fixed. It does not: only
    A13 was ASKED to switch to the shared control, and A14, A19, A24 and A26 were in the pass for
    other work entirely — so they were reported as swept while still carrying private copies. The
    test is now what it should always have been: does the spec enumerate the values WITHOUT
    referencing P0·9? P0 itself is the definition and is never in the list.
    """
    out = []
    for fn in sorted(os.listdir(EXPORT)):
        if not fn.endswith('- Spec.md'):
            continue
        cat = fn.split()[0]
        if cat == 'P0':
            continue
        t = open(os.path.join(EXPORT, fn), encoding='utf8').read()
        if ENUMERATES.search(t) and not REFERENCES.search(t):
            out.append(cat)
    return sorted(out, key=lambda c: int(c[1:]) if c[1:].isdigit() else 0)


CONFIRMED = """FIVE THINGS YOUR LAST SESSIONS ASKED ABOUT WERE ALREADY ANSWERED, and the answers are
below. None of them is a decision for you — they are facts to write in, replacing the open question
with the answer and the date. They were raised independently in several categories, which is why
they are stated once here rather than per category.

1. THE THREE MISSING PACK COLOURS. Designs kept working out their own readable text colour for a
   coloured band, because the Style Pack seemed not to supply one. It does. Every pack value is
   marked either COMPUTED (worked out automatically from colours the pack already declares) or
   AUTHORED (a human picks it). On-contrast text, accent-on-contrast, dark elevation, dark
   hover-surface and tabular figures are ALL COMPUTED. No design derives one for itself, ever again.

2. WHICH SECTION IS THE MAIN FEED. Exactly one section per page is designated the main feed, and the
   project file stores which one. A design does not work it out; it is told. That is what makes an
   empty state and a page-number control conditional.

3. HOW A CONTROL SAYS IT SWITCHES ANOTHER ONE OFF. The dependency is declared in the control's own
   definition and carries its reason, so the panel, the checker and the compiler read one source. A
   design does not hand-draw the relationship.

4. HAND-PICKED POSTS KEEP THEIR ORDER. References are held in the order the user dragged them and
   handed to the template that way, never re-sorted by date. Ruled 2 September.

5. A DESIGN MAY DECLARE MORE THAN ONE BEHAVIOUR MODULE. The compiler emits the union. This has been
   true since the inventory merge; a category that asked was asking a settled question."""

WORK4 = {
 'P0': """- GREYING HAS NO "BUT THIS IS A MODE" EXCEPTION (owner's ruling, 2026-09-03). Two shared
  panels HIDE controls where the library-wide rule greys them: P0·5's Count and Order vanish at
  Hand-picked, and P0·3's Add / Remove / drag vanish on a Ghost-sourced list. Two categories flagged
  the clash rather than copying it.
  BOTH CHANGE TO GREY, with the reason beside them, using the treatment already drawn in P0-0. For
  the Data group that reads "the list you picked is the count"; for the Ghost-sourced list, "these
  come from Ghost, so there is nothing to add here."
  The argument for hiding was that a control belonging to a MODE you are not in differs in kind from
  one switched off. The owner refused the distinction, and the reason is worth carrying: A USER
  CANNOT SEE WHICH OF THE TWO THEY ARE LOOKING AT, and a vanished control teaches nothing either way.
  Every category inherits this from P0, so this frame is where it changes.

- IMAGE FOCUS BECOMES A SHARED CONTROL, DEFINED HERE ONCE, AND IT CARRIES BOTH AXES.
  Today it is not a shared control at all: two dozen category specs each enumerate their own copy,
  which is exactly the failure the owner ruled on as "one control name means one set of values".
  Define it here: **Centre · Top · Bottom AND Centre · Left · Right**.
  The horizontal half is new (owner's ruling, 2026-09-03). A wide photograph cropped into a tall
  frame loses its sides, and a vertical-only control has nothing to say about which side survives —
  a photo of two people side by side, cropped tall, currently offers their heads or their feet but
  not which person stays in shot.
  State also that GHOST NEVER SEES THIS: it is a hint the compiler resolves, which is why it is a
  control and not a data binding.""",

 'A13': """- POINT AT P0'S IMAGE FOCUS RATHER THAN ENUMERATING YOUR OWN. This category raised the
  gap — 12 Media Top's Portrait 4:5 crops a landscape file left and right and the control had nothing
  to say about it. The control now lives in P0 and carries both axes: Centre · Top · Bottom AND
  Centre · Left · Right. Replace this category's private enumeration with a reference to P0's
  definition, and draw the horizontal case on 12 Media Top where the gap was found.""",

 'A14': """- THE LOCKED-CONTROL TEST IS DROPPED (owner's ruling, 2026-09-03). Finding 13 proposed a
  test for when a control should be locked rather than offered, and it has been waiting to be
  ratified. It is not adopted: the library-wide rule "a control switched off by another is greyed,
  with the reason beside it" already does that job, and two overlapping tests would be worse than
  one. Strike the finding with the ruling and its date.

- THE DEPENDENCY QUESTION IS ANSWERED — see item 3 above. Your open question about how a control
  declares that another switches it off is settled: it is declared in the control's own definition.
  Replace the question with the answer.""",

 'A17': """- THE POST CARD'S EXCEPTIONS MOVE INTO THE CARD, and this is where the card is defined
  (A18, A19 and A20 inherit it whole). Two sets:
    THE FOUR DOM-ORDER EXCEPTIONS — A17·9, A18·4, A18·9, A18·13 — currently recorded in four
    separate design specs. Write them into the card's own definition.
    THE ONE TRUNCATION EXCEPTION — A18·3 Slim — where the card promises text is never cut short and
    that design cuts it. Write it into the promise, so the promise stops being false.
  Nothing about any design changes. The point is that the fifth exception would otherwise be
  recorded somewhere nobody looks.

- ONE CONTROL NAME MEANS ONE SET OF VALUES (owner's ruling, 2026-09-03). This category and A18
  between them carry `rowDensity` with five different value sets, `thumbSize` with three, and `order`
  with two shapes. A user who learns a control in one design meets a different control wearing the
  same name in the next. Reconcile them: one name, one set. Where two designs genuinely differ, they
  differ BY NAME. Some designs lose a value they had, and that is the intended cost.

- THE EXCERPT FLOOR IS EXCLUSIVE, and the earlier instruction had it wrong. Your session caught this
  and was right: three lines needs a text column ABOVE 306 px, so at exactly 306 three lines is
  already refused and falls to two — which this document's shared floor and its disabled-control
  table both said. The 2 September instruction's example implied the opposite. It has been corrected
  centrally; make sure nothing here now reads the other way.

- CONFIRM ITEMS 1, 2 AND 3 ABOVE and replace the matching open questions with their answers.""",

 'A18': """- ONE CONTROL NAME MEANS ONE SET OF VALUES (owner's ruling, 2026-09-03). You raised this:
  `rowDensity` carries five different value sets in this category alone, `thumbSize` three, `order`
  two shapes. Reconcile with A17, which defines the shared card — one name, one set, and where two
  designs genuinely differ they differ by name.

- THE CARD'S EXCEPTIONS ARE MOVING TO A17, where the card is defined. Your four DOM-order exceptions
  and the one truncation exception (A18·3 Slim) go into the card's own definition rather than staying
  in the design specs. Remove them from here once A17 carries them, or note that A17 owns them.

- CONFIRM ITEMS 1, 2, 4 AND 5 ABOVE and replace the matching open questions with their answers.
  Four of your ten open items are on that list, including the two you called the strongest findings.""",

 'A19': """- CONFIRM ITEMS 1 AND 3 ABOVE. Your remaining open items are the pack's three colour
  values — which 5 Contrast Band derives for the third time — and how the schema declares a
  cross-field dependency. Both are answered: the colours are COMPUTED pack tokens and no design
  derives one, and a dependency is declared in the control's own definition. Replace the questions
  with the answers and their dates.""",

 'A24': """- THE FOUR-MAXIMUM STANDS UNTIL THE NATIVE-SHARE REDRAW, AND NOTHING INHERITS IT AFTER
  (owner's ruling, 2026-09-03). You found two rulings pointing different ways at 14 Share Row's Links
  control and named the collision instead of picking one — that was right. The sequencing is the
  answer: four is correct for the row as drawn today; the redraw replaces it with one Share trigger,
  so there is no count left to cap. Record it and close the question.

- 5 FULL BLEED'S PICTURE-LESS BAND KEEPS THE PAGE'S OWN TEXT COLOUR (owner's ruling, 2026-09-03).
  You invented this out of necessity and flagged it as yours. It is ratified. The alternative you
  rejected — keeping the contrast colours and putting the band on a contrast ground — would have made
  the design read as 8 Contrast Band, which the rule against one design becoming another forbids.
  Change the flag from "invented here" to the owner's ruling.

- TWO MODULES ON ONE DESIGN IS ALREADY PERMITTED — see item 5 above. 13 Sticky declaring two is
  fine and always was. Replace the open question with the answer.

- THE SEVEN CARRIED ITEMS STAY WHERE THEY ARE. The owner will take them one at a time and bring back
  only the ones that need him. Leave the register as it is; do not resolve any of them here.""",

 'A26': """- THE ALL-TAGS LINK IS AUTHORED, NOT ASSUMED (owner's ruling, 2026-09-03, and it is his own
  answer rather than either option he was offered). Ghost publishes no all-tags route — there is a
  page per tag and nothing above them — so the destination cannot be hard-coded, and the link cannot
  simply be dropped either, because a site owner may well have built such a page.
  THE ROW BECOMES: a Text Field for the label, plus a Link Picker for the destination. Both already
  exist in the control vocabulary; nothing new is invented.
  IT DOES NOT RENDER UNTIL A DESTINATION IS SET, so it can never ship broken, and an owner with no
  such page simply leaves it empty. Draw the empty and the set states.

- AN AUTHOR'S POST COUNT MAY BE SHOWN, AND A DESIGN MAY TURN IT OFF (owner's ruling, 2026-09-03).
  Your open question was whether it belongs in a theme at all, given a new writer's page reads
  "1 post". It stays, with an off switch. Close the question.""",
}


def build_prompt(cat, title, designs, holes, sweep):
    if cat == 'P0':
        scope = ("THIS IS NOT A DESIGN CATEGORY. P0 Editor Primitives is the set of SHARED CONTROLS\n"
                 "every category's side panel draws from. Change one here and every category inherits it,\n"
                 "which is why this runs first.")
    else:
        roster = '\n'.join(f'  {d["n"]:>2}. {d["name"]}' for d in designs)
        scope = f"THIS CATEGORY — {cat} {title}, {len(designs)} designs:\n\n{roster}"
    hole_note = ''
    if holes:
        hole_note = ('\n\nRETIRED NUMBERS IN THIS CATEGORY: ' +
                     ', '.join(f'#{h["n"]} ({h["name"]})' for h in holes) +
                     '. Each is deliberate and permanent. Do not close the gap and do not reuse it.')
    sweep_note = ''
    if cat == 'P0' and sweep:
        sweep_note = (f"\n\nNOT YOUR JOB, BUT SO YOU KNOW WHY THIS MATTERS: {len(sweep)} other categories "
                      f"still enumerate their own copy of Image focus — {', '.join(sweep)}. They are swept "
                      "separately. Define it correctly here and that sweep becomes mechanical.")
    return f"""INFLOZO — DESIGN PATCH PASS FOUR · {cat} {title}
Paste into a NEW Claude Design chat. Self-contained: assume no other context.

WHAT THIS IS. The whole library was read on 2 September and every question the specifications still
left open was put to the owner. He answered eighteen. Six changed a requirement and are already
landed. This pass carries the rest into the specifications — and five of the eighteen turned out to
need no ruling at all, because the answer already existed and the specs had not caught up.

DO NOT REDESIGN ANYTHING. Keep every frame, every name, every number. Change only what the work list
names.

{dp2.KEEP_IT}

{dp1.FACTS}

{CONFIRMED}

{dp2.PART_A2}

{scope}{hole_note}{sweep_note}

THE WORK LIST FOR {cat}:

{WORK4[cat]}

{dp1.OUTPUT}"""


def render():
    lib, _ = er.build()
    live = {c: v for c, v in lib.items() if not v.get('deleted')}
    unknown = [c for c in ORDER if c != 'P0' and c not in live]
    assert not unknown, f'ORDER names a category the export does not have: {unknown}'
    assert set(WORK4) == set(ORDER), f'WORK4 and ORDER disagree: {set(WORK4) ^ set(ORDER)}'
    sweep = image_focus_sweep()

    cards = []
    for step, cat in enumerate(ORDER, 1):
        if cat == 'P0':
            title, designs, holes, meta = 'Editor Primitives', [], [], 'shared controls'
        else:
            v = lib[cat]; title = v['title']
            designs = [d for d in v['designs'] if not d.get('deleted')]
            holes = [d for d in v['designs'] if d.get('deleted')]
            meta = f'{len(designs)} designs'
        prompt = build_prompt(cat, title, designs, holes, sweep)
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
<title>Inflozo — Design patch prompts, pass four</title><style>{dp1.CSS}</style></head>
<body><div class="wrap">
<div class="kick">Inflozo</div>
<h1>Design patch pass four — the answers to your eighteen</h1>
<p class="lede">Every open question in the library was put to you on 2 September and you answered
eighteen. Six changed a requirement and are landed. These eight prompts carry the rest into the
specifications. <b>Run P0 first</b> — it holds two shared controls that every other category
inherits. The rest can run in any order.</p>
<p class="lede"><b>Five of the eighteen needed no ruling at all.</b> The answers already existed and
the specifications had not caught up — the pack colours, the main-feed designation, how a control
declares a dependency, hand-picked order, and whether one design may use two behaviours. Every prompt
carries all five, because they were each raised in more than one category.</p>
<p class="lede">One thing this pass starts but does not finish, named rather than hidden:
<b>Image focus is enumerated separately in {len(image_focus_sweep()) + 2} category specs</b> instead
of being one shared control. P0 gains the single definition here; the rest need a mechanical sweep
afterwards, and the P0 prompt names them.</p>
<p class="lede">Verify each returned export with <code>python3 tools/verify-design-pass.py</code>,
then <code>python3 tools/reapply-export-edits.py</code>.</p>
{''.join(cards)}
</div>
<script>
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{{
  navigator.clipboard.writeText(b.parentElement.querySelector('pre').textContent);
  b.textContent='Copied';setTimeout(()=>b.textContent='Copy prompt',1400);}}));
document.querySelectorAll('.chead').forEach(h=>h.addEventListener('click',e=>{{
  if(e.target.classList.contains('tick'))return;
  h.parentElement.classList.toggle('open');}}));
const K='inflozo-patch4';
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
            print('DESIGN-PATCH-PROMPTS-4.html was stale and has been regenerated'); return 1
        print('design patch prompts (pass 4): current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)} — {len(ORDER)} prompts '
          f'(Image-focus sweep still owed on {len(image_focus_sweep())} categories)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
