#!/usr/bin/env python3
"""Inflozo — design patch pass THREE. The six spec-side rulings of 2026-09-02.

    python3 tools/design-patch-prompts-3.py            # regenerate DESIGN-PATCH-PROMPTS-3.html
    python3 tools/design-patch-prompts-3.py --check    # exit non-zero if the file is stale

WHY A THIRD FILE. Same reason as the second: passes one and two are the record of what was actually
sent, and a record is not rewritten. This is a separate, much smaller pass — seven categories, and
four of the seven are closing a question the pass-two session was right to raise rather than answer.

WHY THESE CANNOT JUST BE EDITED IN THE REPOSITORY. They change text inside the category
specifications, and a Claude Design re-export replaces the repository's copy of those files with the
project's copy. That is not a rule anyone can be careful enough to work around — it is how export
works, and 2026-09-01 proved it (see `tools/reapply-export-edits.py`). Anything that must survive
inside a spec goes through Claude Design.

Everything shared is IMPORTED from the pass-two generator, which imports its own from pass one. Only
the work lists are authored here.
"""
import os, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_bmad-output/planning-artifacts/DESIGN-PATCH-PROMPTS-3.html')

_s = importlib.util.spec_from_file_location('dp2', os.path.join(ROOT, 'tools/design-patch-prompts-2.py'))
dp2 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp2)
dp1, er = dp2.dp1, dp2.er

INTRO = """WHAT THIS PASS IS. The whole library was read on 2026-09-02 and 49 items were found marked
open. Most were already answered elsewhere or belong to the architect. NINE needed the owner and he
ruled on all nine. Three of those changed a requirement and are already landed. THE SIX BELOW ARE
THE REST, and they are small: four of them close a question your last session raised rather than
answered, which was the right call and is why they are back here as a ruling instead of a correction.

Nothing in this pass is a question, and nothing here asks you to redesign anything."""

WORK3 = {
 'P0': """- THE [Free] DESIGNS LINE DOES NOT APPLY TO P0, AND THAT IS NOW SETTLED (owner's ruling,
  2026-09-02). Your last session flagged that the instructions demanded a "**[Free] designs:**" line
  while this file records an exemption, and refused to invent two design names to satisfy it. That
  was correct. The exemption stands: P0 holds shared editor controls, it has no placeable designs,
  so it has nothing to make free.
  Strike the open question with the owner's name and the date, and state the exemption once as
  settled so no later pass re-raises it. Do not add a [Free] line.""",

 'A2': """- EDGE RENDERS OPEN WITHOUT JAVASCRIPT, AND THAT IS THE OWNER'S RULING NOW (2026-09-02),
  not your own choice. Your last session specified the open bar and honestly flagged the decision as
  its own. The owner has confirmed it: a reader without script gets the sentence, its link and the
  rule at the open height, and the close is hidden. The alternative — rendering nothing, which keeps
  the four-pixel promise — was considered and refused, because a 4 px line nobody can open is not a
  bar and that reader would lose the message entirely.
  Change the flag from "mine" to the owner's ruling with its date. The specified behaviour does not
  change; only its authority does.""",

 'A3': """- THE FRAMES WERE RIGHT AND THE INSTRUCTION'S WORDING WAS LOOSE (owner's ruling,
  2026-09-02). Your last session noticed that pass two described the wide-screen state of the
  accordion footers as "a plain stacked list of links" while every A3 frame draws an open column
  grid there, and it wrote the no-JavaScript lines from the frames rather than from that phrasing.
  That was right. THE COLUMNS STAY. No layout changes, in any of the five designs.
  Close the flag, recording that the wording was corrected rather than the drawings.""",

 'A9': """- THE NUMBERING GAP STAYS OPEN (owner's ruling, 2026-09-02). You asked whether to close
  it. The answer is no: the roster reads 1-11 and 13-15 and stays that way. Renumbering 13, 14 and 15
  down would repoint every existing reference to them — in this document, on the proof frame, in the
  repository and in anything already shipped — which is the exact failure the never-reuse rule
  exists to prevent. Every other cut design in the library leaves the same hole: A1 skips 9, A2 skips
  13, A4 skips 15.
  Strike the open question with the owner's name and the date. Nothing renumbers.""",

 'A14': """- BOUND MODE DOES NOT LINK EACH PICTURE TO ITS POST (owner's ruling, 2026-09-02). You
  raised that a bound gallery is A17 Post Grids without the titles, and that is exactly why the
  answer is no. A gallery whose every frame links to a post resolves, for a visitor, to the same
  thing a Post Grid resolves to — and two categories arriving at one outcome is what the library's
  uniqueness rule exists to prevent.
  A14 STAYS PICTURES-ONLY. Remove the per-frame post link from bound mode wherever it is specified
  or drawn, and state the boundary once in the category layer: A14 shows images the owner chose,
  A17 shows posts. Close the open question with the ruling.""",

 'A17': """- A WIDTH FLOOR MEASURES THE TEXT COLUMN, NOT THE CELL (owner's ruling, 2026-09-02).
  You raised that 4 Cards at Per row Four, 6 Split Head at Per row Three and 17 Panel at Per row Four
  all fall under the 306 px excerpt floor once the cell's padding is taken off — and that greying the
  value meant deciding which width the floor measures. It measures the INNER width: a floor exists so
  a reader can read, and what they read is the column the words sit in.
  So in those three designs, at those settings, THE EXCERPT VALUE THE DESIGN CANNOT DRAW IS GREYED
  WITH THE REASON BESIDE IT — use the greyed-control treatment from P0, and write the reason as a
  sentence ("at four across this card's text column is 290 px; three lines needs 306"). The floor
  itself does not move, and no design is redrawn.
- 11 MASONRY'S CONTROL TABLE STILL PRINTS "Columns: Four" while this document's own Reconciled
  paragraph says that value was removed on 24 August. One of the two is wrong. The frame is the
  authority: check what 11 Masonry actually draws, make the table and the paragraph agree with it,
  and say in your Patch notes which one you corrected.""",

 'A24': """- FOUR IS THE MAXIMUM, AND IT IS A DESIGN DECISION (owner's ruling, 2026-09-02). You
  recorded that the caps on 11 Dateline's Cells and 14 Share Row's Links are simply the counts the
  frames were drawn at, and that neither was ever ruled on. They are ruled now: four is the maximum
  and no fifth cell or fifth link is drawn. The reasons already on the frames are the reasons — a
  fifth cell's label wraps, a fifth link takes a second line.
  Close the open question. Both rows stay as the owner set them on 1 September: Two · Three · Four,
  a named set, default Four.""",
}

ORDER = ['P0', 'A2', 'A3', 'A9', 'A14', 'A17', 'A24']


def build_prompt(cat, title, designs, holes):
    if cat == 'P0':
        scope = ("THIS IS NOT A DESIGN CATEGORY. P0 Editor Primitives is the set of SHARED CONTROLS\n"
                 "every category's side panel draws from.")
    else:
        roster = '\n'.join(f'  {d["n"]:>2}. {d["name"]}' for d in designs)
        scope = f"THIS CATEGORY — {cat} {title}, {len(designs)} designs:\n\n{roster}"
    hole_note = ''
    if holes:
        hole_note = ('\n\nRETIRED NUMBERS IN THIS CATEGORY: ' +
                     ', '.join(f'#{h["n"]} ({h["name"]})' for h in holes) +
                     '. Each is deliberate and permanent. Do not close the gap and do not reuse it.')
    return f"""INFLOZO — DESIGN PATCH PASS THREE · {cat} {title}
Paste into a NEW Claude Design chat. Self-contained: assume no other context.

{INTRO}

DO NOT REDESIGN ANYTHING. Keep every frame, every name, every number. Change only what the work list
names.

{dp2.KEEP_IT}

{dp1.FACTS}

{dp2.PART_A2}

{scope}{hole_note}

THE WORK LIST FOR {cat}:

{WORK3[cat]}

{dp1.OUTPUT}"""


def render():
    lib, _ = er.build()
    live = {c: v for c, v in lib.items() if not v.get('deleted')}
    unknown = [c for c in ORDER if c != 'P0' and c not in live]
    assert not unknown, f'ORDER names a category the export does not have: {unknown}'
    assert set(WORK3) == set(ORDER), f'WORK3 and ORDER disagree: {set(WORK3) ^ set(ORDER)}'

    cards = []
    for step, cat in enumerate(ORDER, 1):
        if cat == 'P0':
            title, designs, holes, meta = 'Editor Primitives', [], [], 'shared controls'
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
<title>Inflozo — Design patch prompts, pass three</title><style>{dp1.CSS}</style></head>
<body><div class="wrap">
<div class="kick">Inflozo</div>
<h1>Design patch pass three — the six spec-side rulings</h1>
<p class="lede">The whole library was read on 2 September and 49 items were marked open. Most were
already answered elsewhere or belong to the architect; <b>nine needed the owner and he ruled on all
nine</b>. Three changed a requirement and are landed. These seven prompts carry the rest into the
specifications. <b>Four of them simply close a question your last session was right to raise rather
than answer.</b></p>
<p class="lede">Run in any order — nothing here depends on anything else. Verify each returned export
with <code>python3 tools/verify-design-pass.py</code>, then
<code>python3 tools/reapply-export-edits.py</code>.</p>
{''.join(cards)}
</div>
<script>
document.querySelectorAll('.copy').forEach(b=>b.addEventListener('click',()=>{{
  navigator.clipboard.writeText(b.parentElement.querySelector('pre').textContent);
  b.textContent='Copied';setTimeout(()=>b.textContent='Copy prompt',1400);}}));
document.querySelectorAll('.chead').forEach(h=>h.addEventListener('click',e=>{{
  if(e.target.classList.contains('tick'))return;
  h.parentElement.classList.toggle('open');}}));
const K='inflozo-patch3';
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
            print('DESIGN-PATCH-PROMPTS-3.html was stale and has been regenerated'); return 1
        print('design patch prompts (pass 3): current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)} — {len(ORDER)} prompts')
    return 0


if __name__ == '__main__':
    sys.exit(main())
