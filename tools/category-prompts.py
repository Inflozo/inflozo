#!/usr/bin/env python3
"""Inflozo — one paste-ready Claude Design prompt per category.

    python3 tools/category-prompts.py           # regenerate CATEGORY-PROMPTS.html
    python3 tools/category-prompts.py --check   # exit non-zero if stale

34 categories, 34 buttons. Two kinds of prompt:

  PATCH  — for a category already designed. Asks only for the four fields the earlier prompt did
           not request, naming that category's actual designs so nothing is missed.
  BUILD  — for a category not yet started. Fully self-contained: the master brief (§1–§4 of
           design/claude-design-prompt-3-library.md, extracted live) plus that category's own row.

Everything is extracted from the prompt file and from the export. Nothing is retyped here, because
a second copy of a prompt is a second place for it to go stale — which is the defect that produced
the twelve half-specified categories in the first place.
"""
import os, re, sys, html, glob, subprocess

ROOT   = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN   = os.path.join(ROOT, '_bmad-output', 'planning-artifacts')
DESIGN = os.path.join(PLAN, 'design')
PROMPT = os.path.join(DESIGN, 'claude-design-prompt-3-library.md')
EXPORT = os.path.join(DESIGN, 'claude-design-export', 'unpacked')
OUT    = os.path.join(PLAN, 'CATEGORY-PROMPTS.html')

# ─────────────────────────────────────────────────────────────────────────────
# Repeating content. Two kinds, and they need OPPOSITE controls — which is why they are
# listed separately rather than lumped together as "repeats".
#
#   AUTHORED  the user types the items. Needs add / remove / reorder.
#   GHOST     the count comes from the customer's Ghost site. There is nothing to add — the
#             control is how MANY to show, and an Add button here would be a lie.
#
# Derived from each category's content model in sections-inventory.md. The PRD's own gap list
# (§7.3 item 1, "the largest single gap in the library") names 11 categories; this scan of the
# content models finds A3 and A23 as well, and treats A22 as Ghost-bound rather than authored
# because its only repeat is a {{#get}}-driven issue preview. That discrepancy is recorded in
# VERIFY-AT-BUILD rather than silently resolved here.
AUTHORED_REPEATS = {
 'A3':  'link columns[] and social links[]',
 'A5':  'items[] {icon?, image?, title, body, link?}',
 'A8':  'items[] {quote, name, role?, avatar?, rating?, link?}',
 'A9':  'items[] {question, answer}',
 'A10': 'items[] {value, label, sublabel?}',
 'A11': 'logos[] {image, link?}',
 'A12': 'images[], team[] {name, role, image, link?}, values[]',
 'A13': 'steps[] {title, body, icon?/image?}',
 'A14': 'images[] {image, caption?, link?}',
 'A15': 'embed url(s) — where a design takes more than one',
 'A16': 'socials[] and locations[]',
 'A23': 'popular tag chips[] — design #5 only',
}
GHOST_REPEATS = {
 'A7':  'tiers, from {{#get "tiers"}}',
 'A17': 'posts', 'A18': 'posts', 'A19': 'posts', 'A20': 'tags', 'A21': 'authors',
 'A22': 'posts, on the issue-preview design only',
 'A26': 'authors and tags', 'A27': 'posts', 'A30': 'tiers', 'A32': 'tiers',
}

def repeat_block(cid):
    """The instruction for whichever kind of repeat this category has, or nothing."""
    if cid in AUTHORED_REPEATS:
        return f"""

## Repeating items — this category has them, and they need controls it does not yet have

This category repeats **{AUTHORED_REPEATS[cid]}**. The user authors those items themselves, so the
sidebar must let them manage the list. Specify all of this, per design:

- **Add an item.** Where the control sits, what a newly added item contains (sensible placeholder
  content, never an empty shell), and where it lands in the order.
- **Remove an item.** Including what happens when the user removes down to the minimum.
- **Reorder items**, if order is meaningful for this design — say so plainly if it is not.
- **Minimum and maximum item count**, and what the design does at each end. A design laid out as a
  three-column grid behaves differently at 1 item than at 7; say which counts it is designed for and
  what happens outside that range.
- **What the section renders at zero items** — this is the empty state you have already specified,
  but state it again here in terms of the item list specifically.

**Two rules about item controls, and they are architectural rather than stylistic:**

1. **Design controls apply to EVERY item at once, never to one item.** A control writes a single
   value onto the section, and the stylesheet reads it — so "make card 3 bigger" is not
   expressible, by construction. If a design seems to need per-item styling, that is a signal it
   should be two designs, and you should say so rather than inventing a per-item control.

2. **Inside an item the user edits CONTENT only** — its text, its image, its link. Never its
   layout, spacing, alignment or emphasis. Selecting an item on the canvas gives them the text and
   image fields for that item and nothing else.

State for each design: which fields inside an item are editable, which are optional and may be left
empty, and what the item looks like when an optional field is empty."""
    if cid in GHOST_REPEATS:
        return f"""

## Repeating items — this category repeats {GHOST_REPEATS[cid]}, which comes from Ghost

The user does **not** author these items and cannot add or remove them — they are their own posts,
tags, authors or tiers. **No design in this category may show an Add or Remove control for them.**

Specify instead, per design:

- **How many to show**, and which counts the layout is designed for.
- **What the design does when there are fewer than expected**, including exactly one, and exactly
  zero — a real site will hit all three.
- **Whether order is selectable**, and from what.
- Which fields of each item the design displays, and what it does when an optional one is missing
  on a particular post or author.

Design controls apply to every item at once, never to one item — a control writes a single value
onto the section and the stylesheet reads it, so per-item styling is not expressible."""
    return ''


MISSING_FIELDS = """1. Descriptor — one line: what makes this design different from every other design
   in this category.

2. Structural descriptor — a tuple, written exactly in this shape, the six slots separated
   by a space, a middle dot, and a space:
       archetype · containment · ground · item-count class · media placement · emphasis mechanism

   The first five slots are CLOSED sets. Write the exact word on its own — no parenthetical,
   no qualifier, no synonym, nothing appended. A script checks these by literal match, so
   "few (2–4)" FAILS where "few" passes.

       archetype        the closed list in field 3 below
       containment      none | card | box | pill
       ground           page | surface | contrast | image | transparent | accent
       item-count class none | one | few | many | variable
       media placement  none | left | right | top | bottom | background | inline | edge | full-bleed

   Containment is a property of the SECTION, not of the items inside it. A bare section whose
   posts happen to be drawn as cards is "none" — those cards are the item's geometry. Most card
   grids are "none · page". This is the slot most likely to be got wrong.

   Ground is what the section rests on, and it is how two otherwise identical designs earn their
   separate places: the same header on surface and on contrast are two designs. "page" is the
   page's own background; "transparent" means the section has no ground of its own.

   What the count values mean — a gloss, never write it into the tuple: none = no repeating
   unit · one = exactly one · few = 2–4 · many = 5 or more · variable = the author decides how
   many. The sixth slot, emphasis mechanism, is the only open one: a free phrase of at most four
   words naming the single device that distinguishes this design.

   The whole tuple must be UNIQUE within this category. Two designs may be described differently
   in words and still be the same design; this tuple is what that is checked against, so check it
   yourself across the whole category before you finish.

3. Archetype — pick exactly one from this closed list: grid-of-N, split, stack, bar, nav,
   edge rail, overlay, feed, form, carousel, table, media frame, sticky, article body.

4. Behaviour module — which module the design uses (if any), whether it is edit-safe, and what the
   design does with JavaScript switched off. If a design has no module, say "none". The JavaScript-
   off answer is required wherever a module exists — if a design genuinely does not work without
   JavaScript, say so plainly rather than inventing a fallback."""


RESEARCH = os.path.join(os.path.dirname(PROMPT), '..', 'prds', 'prd-Inflozo-2026-08-17',
                        'research-section-js-libraries.md')


def module_registry():
    """FR-G7's 31 modules and FR-G4's no-JS degradations, read from their source of truth.

    A1 and A7 both invented a parallel `M-*` module vocabulary and wrote their own no-JS
    statements, because the prompt asked for a module and never said a registry existed.
    Two of those inventions contradicted a written acceptance criterion. Emitted into every
    prompt so the author cites instead of inventing; derived, so it cannot drift."""
    txt = open(RESEARCH, encoding='utf8').read()
    names = re.findall(r'^\| \d+ \| \*\*`([a-z-]+)`\*\*', txt, re.M)
    sec = txt[txt.index('\n## 7'):]
    sec = sec[:sec.index('\n## Appendix')]
    degr = re.findall(r'^\| `([a-z-]+)` \| (.+?) \|\s*$', sec, re.M)
    assert len(names) == 31, f'expected 31 modules in the registry, parsed {len(names)}'
    missing = [n for n in names if n not in dict(degr)]
    assert not missing, f'modules with no no-JS degradation on record: {missing}'
    rows = '\n'.join(f'| `{n}` | {dict(degr)[n]} |' for n in names)
    return f"""## Behaviour modules — a FIXED registry. Do not invent one.

Every piece of JavaScript a generated theme can run comes from these **{len(names)}** modules
(FR-G7). **This list is closed.** If a design needs behaviour, it declares one of these by its
exact name. It does **not** get a new name, and it does **not** get an `M-`prefixed alias — those
do not map to anything the build can compile.

**Each module's no-JS degradation is already written and is an acceptance criterion (FR-G4).
Quote it. Do not compose your own, and never declare that a design fails without JavaScript —
if the registry says it degrades, it degrades.**

| Module | What it renders with JavaScript off |
|---|---|
{rows}

If a design genuinely needs behaviour no module covers, say so plainly and name the closest
module — that is a finding for the architect, not a licence to name a new module."""


def master_brief():
    """§1–§4 of the live prompt file — the self-contained master brief."""
    txt = open(PROMPT, encoding='utf8').read()
    a = txt.index('## 1. What this is')
    b = txt.index('## 5. Order of work')
    return txt[a:b].strip() + '\n\n' + module_registry()


def categories():
    """Every row of §6's table: id, name, count, notes."""
    txt = open(PROMPT, encoding='utf8').read()
    sec = txt[txt.index('## 6. The 34 categories'):]
    out = []
    # the notes column is OPTIONAL — many rows are just "| A4 | Heroes | 18 |". The first version
    # of this regex required it and silently found 10 of 34, which is exactly the kind of quiet
    # under-match this project keeps being bitten by. Count the rows and assert.
    for line in sec.split('\n'):
        m = re.match(r'^\| (A\d+) \| ([^|]+?) \| (\d+) \|(.*)$', line)
        if m:
            out.append({'id': m[1], 'name': m[2].strip(), 'n': m[3].strip(),
                        'notes': m[4].strip().rstrip('|').strip()})
    n_rows = len([l for l in sec.split('\n') if re.match(r'^\| A\d+ \|', l)])
    if len(out) != n_rows:
        raise SystemExit(f'parsed {len(out)} categories from {n_rows} table rows — regex is wrong')
    return out


def done_designs():
    """{category id: [design names]} from the export, so a patch prompt can name them."""
    out = {}
    for f in glob.glob(os.path.join(EXPORT, '*.dc.html')):
        b = os.path.basename(f)[:-len('.dc.html')]
        m = re.match(r'(A\d+)-(\d+) (.+)', b)
        if not m or m[2] == '0':          # "0 Category Proof" is not a design
            continue
        out.setdefault(m[1], []).append((int(m[2]), m[3]))
    for k in out:
        out[k] = [n for _, n in sorted(out[k])]
    return out


def patch_prompt(cat, designs):
    lst = '\n'.join(f'    {i}. {n}' for i, n in enumerate(designs, 1))
    return f"""This is a follow-up on {cat['id']} · {cat['name']}, which you have already designed.

The written specs are complete except for four fields that the earlier brief did not ask for. Do not
redesign anything and do not change any frame — this is a specification-only pass.

For EACH of the {len(designs)} designs in this category:

{lst}

...add these four fields to its spec:

{MISSING_FIELDS}

Leave every field you already wrote exactly as it is: responsive rule, content fields, controls,
data binding, empty state, behaviour and accessibility notes are all correct and stay.

{module_registry()}

**If a spec you already wrote names a module that is not on that list — an `M-`prefixed name, or
any name you coined — rename it to the registry module it actually is, and replace its no-JS
sentence with the registry's. That correction is in scope for this pass even though nothing else
about the behaviour section is.**

Return the result as an updated version of this category's specification file, so I can replace the
existing one wholesale rather than merge by hand.{repeat_block(cat['id'])}"""


def build_prompt(cat, brief):
    return f"""{brief}

---

## The category for this session

Design **all {cat['n']} designs** of the following category, and nothing else. Produce the frames and
the written specification for each, exactly as the brief above requires — all ten spec fields, every
design.

| ID | Category | Designs | Notes |
|---|---|---|---|
| {cat['id']} | {cat['name']} | {cat['n']} | {cat['notes']} |

When the category is complete, finish with two blocks I can carry into the next session:

1. **Component inventory** — every reusable component this category established or reused. One line
   each: name — what it is — which category it first came from. Include reused ones, so the list
   stays cumulative.

2. **Shared field list** — the union of every content field this category's designs need.{repeat_block(cat['id'])}"""


def build():
    brief, cats, done = master_brief(), categories(), done_designs()
    e = html.escape
    date = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                          capture_output=True, text=True).stdout.strip()
    rows, n_patch, n_build = [], 0, 0
    for c in cats:
        ds = done.get(c['id'])
        if ds:
            n_patch += 1
            kind, label = 'patch', f'{len(ds)} designs · needs 4 fields'
            body, note = patch_prompt(c, ds), 'Specification only — no redesign, no frames touched.'
        else:
            n_build += 1
            kind, label = 'build', f"{c['n']} designs · not started"
            body, note = build_prompt(c, brief), 'Self-contained. Paste this alone — nothing else needed.'
        rows.append(f'''<div class="cat {kind}" id="{c['id']}">
  <div class="chead">
    <span class="cid">{e(c['id'])}</span>
    <div class="cmeta"><h3>{e(c['name'])}</h3><span class="clabel">{e(label)}</span></div>
    <span class="ctag {kind}">{'patch' if kind=='patch' else 'build'}</span>
    <button class="copy" data-t="{e(body)}">Copy prompt</button>
  </div>
  <p class="cnote">{e(note)}</p>
  <details><summary>Show the prompt ({len(body):,} characters)</summary><pre>{e(body)}</pre></details>
</div>''')

    open(OUT, 'w', encoding='utf8').write(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Category Prompts</title><style>
:root{{--bg:#fbfaf8;--card:#fff;--ink:#191919;--muted:#6a6a6c;--line:#e5e1db;--code:#f4f2ef;
--accent:#1f6feb;--accent-s:#e9f0fe;--patch:#96650a;--patch-s:#fff4d9;--build:#12784a;--build-s:#e2f5ec;
--sh:0 1px 2px rgba(0,0,0,.04),0 6px 20px rgba(0,0,0,.05)}}
@media(prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#131316;--card:#1b1b20;
--ink:#ecebea;--muted:#9e9b99;--line:#2f2f36;--code:#232329;--accent:#6ea8fe;--accent-s:#1b2a45;
--patch:#e8bd57;--patch-s:#33280d;--build:#5ed6a0;--build-s:#112f20;
--sh:0 1px 2px rgba(0,0,0,.3),0 6px 20px rgba(0,0,0,.36)}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.6 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:920px;margin:0 auto;padding:52px 22px 120px}}
.kick{{color:var(--accent);font-weight:660;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase}}
h1{{font-size:clamp(1.9rem,4.4vw,2.6rem);letter-spacing:-.023em;margin:.28em 0 .3em;font-weight:730}}
.lede{{color:var(--muted);font-size:1.08rem;max-width:66ch;margin:0 0 6px}}
.how{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:20px 24px;
box-shadow:var(--sh);margin:26px 0 8px}}
.how h2{{margin:0 0 .5em;font-size:1.02rem;font-weight:680}}
.how ol{{margin:0;padding-left:1.2em}}.how li{{margin-bottom:.4em}}
.how b{{font-weight:645}}
.counts{{display:flex;gap:9px;margin:22px 0 4px;flex-wrap:wrap}}
.pill{{background:var(--card);border:1px solid var(--line);border-radius:999px;padding:6px 14px;
font-size:.85rem;color:var(--muted)}}
.pill b{{color:var(--ink)}}
.cat{{background:var(--card);border:1px solid var(--line);border-radius:13px;padding:15px 18px;
box-shadow:var(--sh);margin:10px 0}}
.cat.patch{{border-left:3px solid var(--patch)}}
.cat.build{{border-left:3px solid var(--build)}}
.chead{{display:flex;align-items:center;gap:12px;flex-wrap:wrap}}
.cid{{font-family:ui-monospace,Menlo,monospace;font-weight:700;font-size:.85rem;color:var(--muted);
background:var(--code);border-radius:7px;padding:4px 9px;min-width:44px;text-align:center}}
.cmeta{{flex:1;min-width:170px}}
.cmeta h3{{margin:0;font-size:1.02rem;font-weight:665;letter-spacing:-.008em}}
.clabel{{font-size:.82rem;color:var(--muted)}}
.ctag{{font-size:.68rem;font-weight:680;padding:2px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}}
.ctag.patch{{background:var(--patch-s);color:var(--patch)}}
.ctag.build{{background:var(--build-s);color:var(--build)}}
.cnote{{margin:8px 0 0;font-size:.86rem;color:var(--muted)}}
details{{margin-top:9px}}
summary{{cursor:pointer;font-size:.83rem;color:var(--muted)}}
pre{{margin:8px 0 0;padding:13px;background:var(--code);border-radius:9px;overflow-x:auto;
font-size:.76rem;line-height:1.5;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;
white-space:pre-wrap;word-break:break-word;max-height:440px}}
button.copy{{font:inherit;font-size:.82rem;font-weight:645;cursor:pointer;border:1px solid var(--accent);
background:var(--accent);color:#fff;border-radius:8px;padding:6px 15px;white-space:nowrap}}
button.copy:hover{{opacity:.9}}
button.copy.ok{{background:var(--build);border-color:var(--build)}}
h2.grp{{font-size:1.1rem;margin:34px 0 4px;font-weight:690}}
footer{{margin-top:44px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:.86rem}}
</style></head><body><div class="wrap">
<div class="kick">Inflozo</div><h1>Category prompts</h1>
<p class="lede">One button per category. <b>Patch</b> fixes a category you have already designed;
<b>build</b> designs one you have not started. Every prompt is self-contained — copy, open a new
Claude Design chat, paste, done.</p>

<div class="counts">
  <span class="pill"><b>{n_patch}</b> to patch</span>
  <span class="pill"><b>{n_build}</b> to build</span>
  <span class="pill"><b>{len(cats)}</b> categories total</span>
</div>

<div class="how"><h2>How to use this</h2><ol>
<li><b>Open a new chat in Claude Design</b> — one chat per category, as you have been doing.</li>
<li><b>Copy that category's prompt</b> with its button and paste it in. Nothing else to paste.</li>
<li><b>Save the output</b> — frames to <code>design/</code>, the specification file to
    <code>sections-inventory.md</code>.</li>
<li><b>The patches are specification-only.</b> They do not touch a single frame, so they are quick
    and cannot damage work you have already approved.</li>
</ol></div>

<h2 class="grp">Already designed — patch the four missing fields</h2>
{''.join(r for r in rows if 'class="cat patch"' in r)}

<h2 class="grp">Not yet started — build the category</h2>
{''.join(r for r in rows if 'class="cat build"' in r)}

<footer>Generated {e(date)} from <code>design/claude-design-prompt-3-library.md</code> and the design
export. The master brief inside every build prompt is extracted from that file, never retyped, so
the two cannot drift. Regenerate with <code>python3 tools/category-prompts.py</code>.</footer>
</div>
<script>
document.querySelectorAll('button.copy').forEach(b => b.onclick = async () => {{
  try {{ await navigator.clipboard.writeText(b.dataset.t); }} catch (e) {{
    const t = document.createElement('textarea'); t.value = b.dataset.t;
    document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove();
  }}
  const was = b.textContent; b.textContent = 'Copied'; b.classList.add('ok');
  setTimeout(() => {{ b.textContent = was; b.classList.remove('ok'); }}, 1800);
}});
</script></body></html>''')
    return n_patch, n_build, len(cats)


def assert_tuple_vocab_matches_gate():
    """The prompts teach Claude Design the tuple vocabulary; tools/tuple-check.py enforces it.
    If the two ever disagree, designs get authored that cannot pass the gate — which is exactly
    how A1's tuples were written free-text. Derive both sides; never restate either."""
    gate = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'tuple-check.py'),
                encoding='utf8').read()
    sets = {name: eval(m) for name in ('ARCH', 'CONTAIN', 'GROUND', 'COUNT', 'MEDIA')
            for m in [re.search(rf'^{name} = (\{{.*?\}})', gate, re.M | re.S).group(1)]}
    brief = open(PROMPT, encoding='utf8').read()
    for name, row in (('CONTAIN', 'containment'), ('GROUND', 'ground'),
                      ('COUNT', 'item-count class'), ('MEDIA', 'media placement')):
        line = re.search(rf'^\s*\| {row} \| (.+?) \|\s*$', brief, re.M)
        assert line, f'{PROMPT}: no closed-set row for "{row}" — the prompts would teach free prose'
        taught = set(re.findall(r'`([^`]+)`', line.group(1)))
        assert taught == sets[name], (
            f'{row}: prompt teaches {sorted(taught)}, tuple-check.py enforces {sorted(sets[name])}')
    missing = [a for a in sets['ARCH'] if a not in brief and a not in MISSING_FIELDS]
    assert not missing, f'archetypes absent from both prompts: {missing}'


if __name__ == '__main__':
    if '--check' in sys.argv:
        if not os.path.exists(OUT):
            print('  FAIL  CATEGORY-PROMPTS.html missing'); sys.exit(1)
        assert_tuple_vocab_matches_gate()
        before = open(OUT, encoding='utf8').read()
        build()
        if open(OUT, encoding='utf8').read() != before:
            print('  FAIL  CATEGORY-PROMPTS.html was stale and has been regenerated'); sys.exit(1)
        print('category prompts: current'); sys.exit(0)
    assert_tuple_vocab_matches_gate()
    p, b, t = build()
    print(f'CATEGORY-PROMPTS.html regenerated — {p} patch + {b} build = {t} categories')
