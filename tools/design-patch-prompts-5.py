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
# In the pass for their own work, not the sweep. Found by the 2026-09-03 stress test: pass five as
# first built had NO home for R-60, R-61 or R-62, and left four categories with outstanding work out
# of the pass entirely. A sixth pass would have been certain.
EXTRA_ONLY = ['P0', 'A13', 'A17', 'A18', 'A33']
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
 'P0': """- THREE QUESTIONS YOUR LAST SESSION RAISED ARE ANSWERED. All three were sharp and none was
  guessable; each is now ruled.
  (a) **TWO CONTROLS DRAWN ABSENT THAT THE LAST RULING DID NOT NAME** — the filter block under
      Source = Static, and the Recent row with nothing picked yet. The test is now general:
      **could this control EVER do anything in this design?** Could-never means it is not drawn and
      the panel says why; could-but-not-now means greyed with the reason. **The filter block greys**
      — a Static source could carry a filter, it just does not now. **The Recent row is neither**:
      a picker with nothing picked is an EMPTY LIST, not a control something switched off, and it
      stays drawn as the empty list it is. Draw both.
  (b) **THE GREYED CONTROL WHOSE VALUE IN FORCE IS NOT ONE OF ITS OWN** — Order at Hand-picked.
      **What you drew provisionally is right and is now ruled**: no value marked, and the reason
      sentence carries the order in force. The alternatives were inventing a third value the control
      does not have, or marking one that is not in force. Change the flag from provisional to ruled.
  (c) **DOES IMAGE FOCUS GREY OR VANISH WHERE NOTHING IS CROPPED?** It is **not drawn**, and the
      panel says why — a design that places a photograph at its own shape will never crop, so focus
      can never have work to do there. That is the could-never side of the same test. The
      never-offered case is no longer a single named exception; it is a category, and this is its
      second member. Draw that state on P0·9 beside the cropping one.""",

 'A13': """- 11 WALKTHROUGH'S DOUBLE ANNOUNCEMENT IS RULED. With JavaScript off, the tabs module
  precedes each stacked panel with its label as a heading, and your panels already carry their own —
  so the same label is announced twice. **The module emits its heading ONLY where the panel does not
  already carry one.** Your design's own heading is never dropped instead, because that would change
  the WITH-JavaScript state too. Rewrite design 11's no-JavaScript line accordingly.

- YOUR EMPTY-STATE CONTRADICTION IS RESOLVED, AND IN YOUR FAVOUR. You raised that pass two asked for
  a designed "nothing here yet" state while this category has always said that at zero the section
  does not render, and you correctly changed neither. **The rule was too wide, not the category.**
  It now governs FEEDS only: items pulled from Ghost render the designed empty state, because an
  empty tag archive that renders nothing is a broken page a visitor arrived at deliberately. **Items
  the user AUTHORS — a Process list — render nothing at zero**, because there is no such page to
  break and an editor who has typed no steps is mid-build. Close the question with that.""",

 'A17': """- 18 EDGE TO EDGE MAY SQUARE ITS IMAGE AND INVERT ITS FOCUS RING. Both were raised as
  departures; both are ruled as **consequences of running to a bleed edge**, not departures. An
  outward focus ring is clipped at the viewport, so at an edge cell it inverts to an inset offset —
  that is what the focus requirement demands there, not a style choice. A rounded corner at a bleed
  edge leaves a visible gap, so squaring is structural. Record both as ruled, with those reasons.
  The pack's radius still governs every card that COULD follow it; this design cannot.

- THE MISSING SORT MODULE IS ANSWERED, AND THE ANSWER IS NO. There is no client-side sort module and
  there will not be: the order a list shows is the order its owner arranged. A module for one or two
  designs would also have to differ from its own no-JavaScript state, which is a cost with no gain.
  Close the finding rather than carrying it.

- AN EXCERPT ON HOVER IS CSS, NOT A MODULE. 14 Dense's hover excerpt needs no registry entry — it is
  already on the list of behaviours that need no JavaScript at all. Close that half of the finding by
  pointing at it.""",

 'A18': """- `group-headings` MAY STEP THE HEADINGS IT GROUPS, AND MUST. You assumed this and you were
  right; it is now ruled. The module inserts each group heading at the level the design declares and
  steps the titles it groups one level below. **That is the only arrangement whose outline is correct
  in BOTH states** — nested with the script, describing a grouped list; flat peers without it,
  describing a flat list. Each state then tells the truth about itself. Inserting a group heading as
  a peer of the titles it groups would announce a nesting that is not there. Write the contract in.

- THE MISSING SORT MODULE IS ANSWERED, AND THE ANSWER IS NO. Same as A17: the order a list shows is
  the order its owner arranged, and no client-side sort module exists or will. Close the finding.""",
 'A5': """- TWO REGISTRY QUESTIONS YOU RAISED ARE ANSWERED.
  (a) **12 Tabs is announced twice with JavaScript off.** Ruled: **the tabs module emits its heading
      ONLY where the panel does not already carry one.** Your design's own heading is never dropped
      instead — that would change the WITH-JavaScript state too, and the no-JS branch should differ
      from the JS branch as little as possible. Rewrite design 12's no-JavaScript line.
  (b) **14 Scroller's 3 px rule has no registry sentence.** Ruled generally, because the general form
      matters more than this case: **a module hides only the affordances IT ADDS, never a static
      element the design drew.** Your rule is CSS the stylesheet emits, so **it survives with
      JavaScript off**. Say so in design 14's no-JavaScript line.""",

 'A12': """- 15 GROUPS MUST NOT NAME ANOTHER DESIGN. Its Ghost-mode sentence says that with no group
  field "every author lands in the unlabelled block and the section draws as 1 Grid". You left this
  one alone and were right to: no corrected wording existed to align it to. There is now — 13 Rail
  was corrected in the same way. **Describe the arrangement, not the design**: an unlabelled block of
  cards with no group headings. The editor may still ADVISE "1 Grid reads better here"; advising is
  permitted, naming is not.""",

 'A14': """- THE MISSING SORT MODULE IS ANSWERED, AND THE ANSWER IS NO. You raised that 14 Index is
  where a sort would be wanted and none exists. **None will.** The order a gallery shows is the order
  its owner arranged. A module for one design would also have to differ from its own no-JavaScript
  state — a visitor without script would get the arranged order anyway — so the two states would
  disagree for no gain. Close the finding with the ruling rather than carrying it.""",

 'A15': """- YOUR PLAYLIST AND TABS DESIGNS ARE ANNOUNCED TWICE WITH JAVASCRIPT OFF, and it is ruled.
  The tabs module precedes each stacked panel with its label as a heading, and designs 10 and 15
  already carry their own. **The module emits its heading ONLY where the panel does not already carry
  one.** The design's own heading is never dropped instead. Rewrite both no-JavaScript lines.""",

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
    if cat == 'P0':
        scope = ("THIS IS NOT A DESIGN CATEGORY. P0 Editor Primitives is the set of SHARED CONTROLS\n"
                 "every category's side panel draws from. Change one here and every category inherits it.")
    else:
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
    unknown = [c for c in ORDER if c != 'P0' and c not in live]
    assert not unknown, f'ORDER names a category the export does not have: {unknown}'
    orphan = sorted(set(EXTRA) - set(ORDER))
    assert not orphan, f'EXTRA has a category ORDER never emits: {orphan}'

    cards = []
    for step, cat in enumerate(ORDER, 1):
        if cat == 'P0':
            title, designs, holes = 'Editor Primitives', [], []
        else:
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
