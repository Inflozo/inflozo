#!/usr/bin/env python3
"""Inflozo — design patch pass FIVE. The Image-focus sweep, A33's selectors, two stale layers.

    python3 tools/design-patch-prompts-5.py            # regenerate DESIGN-PATCH-PROMPTS-5.html
    python3 tools/design-patch-prompts-5.py --check    # exit non-zero if the file is stale

Three jobs, and the first is most of the pass:

1. THE IMAGE-FOCUS SWEEP. Pass four defined the control once in P0·9 with both axes and pointed A13
   at it. Every other category still carries a private enumeration and none has the horizontal axis.
   The list is DERIVED from the export by the same test pass four uses: does the spec enumerate the
   values without referencing P0·9.

2. A33's SELECTORS, settled by execution on 2026-09-03 (`MEASUREMENTS.md` §35). Four of six
   confirmed, one refuted outright, and one finding nobody asked for.

3. TWO STALE CATEGORY LAYERS. The Actions split ran on 2026-08-31 across 36 designs, and A4 and A6
   each left the OLD compound control stated in their category layer — the part of the document a
   reader meets first — while their own patch notes at the end record the split correctly. Found by
   reading the layer, not by counting: A1, A2 and A32 quote the old list too, but only as the
   mapping, which is right.
"""
import os, re, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, '_bmad-output/planning-artifacts/DESIGN-PATCH-PROMPTS-5.html')
EXPORT = os.path.join(ROOT, '_bmad-output/planning-artifacts/design/claude-design-export/Inflozo')

_s = importlib.util.spec_from_file_location('dp4', os.path.join(ROOT, 'tools/design-patch-prompts-4.py'))
dp4 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp4)
dp3, dp2, dp1, er = dp4.dp3, dp4.dp2, dp4.dp1, dp4.er

SWEEP = dp4.image_focus_sweep()          # derived, never typed
EXTRA_ONLY = ['A33']                     # in the pass for its own work, not the sweep
ORDER = sorted(set(SWEEP) | set(EXTRA_ONLY),
               key=lambda c: int(c[1:]) if c[1:].isdigit() else 0)

SWEEP_JOB = """- POINT AT P0·9 FOR IMAGE FOCUS INSTEAD OF LISTING THE VALUES YOURSELF.
  Image focus was never a shared control: two dozen category specs each wrote out their own copy of
  its values, which is the owner's ruling "one control name means one set of values" in its worst
  form in the whole library. It is now defined ONCE, in **P0·9**, and it carries BOTH axes:
  **Centre · Top · Bottom** and **Centre · Left · Right**.
  The horizontal half is new (owner's ruling, 2026-09-03) and this category does not have it yet. A
  wide photograph cropped into a tall frame loses its sides, and a vertical-only control has nothing
  to say about which side survives.
  What to do: wherever this specification enumerates the focus values, replace the enumeration with a
  reference to P0·9's definition. Do not restate the values. If a design's panel draws the control,
  draw both axes. If a design constrains the control — offering fewer values for a good reason —
  keep the constraint and say what it is, because that is a design decision rather than a private copy.
  GHOST NEVER SEES THIS: it is a hint the compiler resolves, which is why it is a control and not a
  data binding. Say so once if this spec does not already."""

EXTRA = {
 'A4': """- YOUR CATEGORY LAYER STILL DESCRIBES THE OLD ACTIONS CONTROL. Near the top of this
  document, under "What the design patch pass changed category-wide", it says: *"The Actions control,
  on every design that has one, is Both · Primary · None — those three words, as drawn."*
  **That is no longer true and has not been since 31 August 2026.** Your own Patch notes at the foot
  of this file record the change correctly: Actions is a labelled group of one toggle per action —
  **Primary action: On · Off** and **Secondary action: On · Off** — with both off being the old None.
  The split ran across 36 designs library-wide; the canonical definition is **P0·4a**.
  The layer is what a reader meets first, so it is the sentence that misleads. Rewrite it to describe
  the toggles. Quote the old list only if you show the mapping, the way A1 does.""",

 'A6': """- YOUR CATEGORY LAYER STILL DESCRIBES THE OLD ACTIONS CONTROL. Under "The shared floor" it
  says: *"Actions is one control, two values: Both · Primary."*
  **That is no longer true and has not been since 31 August 2026.** Your own Patch notes record it
  correctly: A6's group holds a single toggle, **Secondary action: On · Off**, because A6 never
  offered None — a banner with no action is a section head — so **the primary action is a constant,
  not a decision**. The canonical definition is **P0·4a**.
  The layer is what a reader meets first. Rewrite it to describe the toggle and the constant.""",

 'A33': """- FOUR OF YOUR SIX UNVERIFIED SELECTORS ARE CONFIRMED. Read from Ghost's own card
  renderers on both supported versions on 2026-09-03. Drop the "unverified" mark from each and record
  that it was checked against the code that emits it:
    `kg-cta-card`      the call-to-action card — CONFIRMED, both versions
    `kg-callout-card`  CONFIRMED, both versions
    `kg-product-card`  CONFIRMED, and its inner classes are `kg-product-title`, `kg-product-image`,
                       `kg-product-description-wrapper`, `kg-product-button-wrapper`
    `kg-header-card`   CONFIRMED, and Ghost 6's shape is `kg-header-card-content`, `-heading`,
                       `-subheading`, `-subheading-wrapper`, `-text`, `-image`, plus
                       `kg-header-button-wrapper`, `kg-v2`, `kg-style-accent`, `kg-style-image`,
                       `kg-layout-split`, `kg-size-large`, `kg-swapped`, `kg-align-center`,
                       `kg-content-wide`

- `kg-email-card` DOES NOT EXIST, AND THE FIX IS DELETION RATHER THAN CORRECTION. The email card's
  renderer returns an empty container unless the render target is email — so on the web it produces
  no element and no class at all. Your rule for it matches nothing, ever. You were already right that
  the card "never renders on the web"; the mistake was carrying a selector for it anyway. **Remove
  the selector.** There is nothing to correct it to.

- GHOST 5 HAS A SECOND RENDERER, AND SIX CARDS COME OUT DIFFERENTLY. This was on nobody's list.
  Ghost 5 ships both the current renderer and an older one, because a Ghost 5 site can still hold
  posts written before the current editor. **header, file, product, video and embed emit different
  classes depending which one rendered the post** — most severely the header card, which under the
  older renderer carries almost none of the structure your treatments style. So an older post on a
  Ghost 5 site renders cards your selectors will not match.
  **THE OWNER HAS RULED ON THIS (2026-09-03): the treatments target the CURRENT renderer only.**
  A post written before Ghost 5's current editor keeps Ghost's own default card styling — readable,
  just not carrying the chosen treatment. Write that into the specification as a stated limitation,
  in words a customer could be shown, not as an open question. The reason it went that way is worth
  recording with it: a second selector set would roughly double this category's stylesheet and its
  testing permanently, and the header card would need genuinely different rules rather than a second
  selector, because the older markup lacks the structure the treatments rely on. Ghost 5 is
  end-of-life, so the affected posts are a shrinking set.

- `kg-nft-card` STILL EXISTS and this category draws twenty cards without it. **The owner has ruled
  (2026-09-03): it stays unstyled, deliberately.** It keeps Ghost's default appearance. Record that
  as a decision rather than a gap, so no later pass raises it as an oversight.""",
}


def build_prompt(cat, title, designs, holes):
    roster = '\n'.join(f'  {d["n"]:>2}. {d["name"]}' for d in designs)
    scope = f"THIS CATEGORY — {cat} {title}, {len(designs)} designs:\n\n{roster}"
    hole_note = ''
    if holes:
        hole_note = ('\n\nRETIRED NUMBERS IN THIS CATEGORY: ' +
                     ', '.join(f'#{h["n"]} ({h["name"]})' for h in holes) +
                     '. Each is deliberate and permanent. Do not close the gap and do not reuse it.')
    jobs = []
    if cat in SWEEP:
        jobs.append(SWEEP_JOB)
    if cat in EXTRA:
        jobs.append(EXTRA[cat])
    return f"""INFLOZO — DESIGN PATCH PASS FIVE · {cat} {title}
Paste into a NEW Claude Design chat. Self-contained: assume no other context.

WHAT THIS IS. A small, mostly mechanical pass. Its main job is to finish something pass four started:
Image focus is now one shared control instead of two dozen private copies, and this category still
has a private copy. A few categories carry one extra item each.

DO NOT REDESIGN ANYTHING. Keep every frame, every name, every number. Change only what the work list
names.

{dp2.KEEP_IT}

{dp1.FACTS}

{scope}{hole_note}

THE WORK LIST FOR {cat}:

{chr(10).join(jobs)}

{dp1.OUTPUT}"""


def render():
    lib, _ = er.build()
    live = {c: v for c, v in lib.items() if not v.get('deleted')}
    unknown = [c for c in ORDER if c not in live]
    assert not unknown, f'ORDER names a category the export does not have: {unknown}'
    orphan = sorted(set(EXTRA) - set(ORDER))
    assert not orphan, f'EXTRA has a category ORDER never emits: {orphan}'

    cards = []
    for step, cat in enumerate(ORDER, 1):
        v = lib[cat]; title = v['title']
        designs = [d for d in v['designs'] if not d.get('deleted')]
        holes = [d for d in v['designs'] if d.get('deleted')]
        tags = []
        if cat in SWEEP: tags.append('image focus')
        if cat in EXTRA: tags.append('+ extra')
        prompt = build_prompt(cat, title, designs, holes)
        cards.append(f'''<div class="cat" data-cat="{cat}">
  <div class="chead"><input class="tick" type="checkbox" aria-label="mark {cat} done">
    <span class="step">{step}</span>
    <span class="cid">{cat}</span><span class="cname">{html.escape(title)}</span>
    <span class="cmeta">{" · ".join(tags)}</span></div>
  <div class="body"><pre>{html.escape(prompt)}</pre>
    <button class="btn copy">Copy prompt</button></div></div>''')

    return f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Design patch prompts, pass five</title><style>{dp1.CSS}</style></head>
<body><div class="wrap">
<div class="kick">Inflozo</div>
<h1>Design patch pass five — mostly one mechanical job</h1>
<p class="lede"><b>{len(SWEEP)} of these carry the same small change.</b> Image focus was never a
shared control — two dozen categories each wrote out their own copy of its values, which is the
"one control name, one set of values" ruling in its worst form. Pass four defined it once in
<b>P0·9</b> with both axes; these categories still have private copies and none has the new
horizontal axis. Each prompt asks for the same replacement.</p>
<p class="lede">Three carry one extra item: <b>A33</b>'s card selectors, now settled by reading
Ghost's own renderers, and <b>A4</b> and <b>A6</b>, whose category layers still describe the Actions
control as it was before the 31 August split — their own patch notes have it right, but the layer is
what a reader meets first.</p>
<p class="lede">Run in any order; nothing here depends on anything else. Then
<code>python3 tools/verify-design-pass.py</code> and
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
const K='inflozo-patch5';
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
            print('DESIGN-PATCH-PROMPTS-5.html was stale and has been regenerated'); return 1
        print('design patch prompts (pass 5): current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)} — {len(ORDER)} prompts '
          f'({len(SWEEP)} sweep, {len(EXTRA)} with extra work)')
    return 0


if __name__ == '__main__':
    sys.exit(main())
