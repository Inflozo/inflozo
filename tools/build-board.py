#!/usr/bin/env python3
"""Inflozo — the build board.

    python3 tools/build-board.py            # regenerate BUILD-BOARD.html from build-sequence.md
    python3 tools/build-board.py --check    # exit non-zero if the board is stale

**The prompts are extracted from `build-sequence.md`, never retyped here.** That file is the source
of truth; this only presents it. A board carrying its own copy of a prompt is a second place for a
prompt to go stale, and this project has been bitten by exactly that shape more than once — most
recently by design prompt 3, which was run against a version missing four required fields.

Status is declared below rather than parsed, because "is this step done" is a judgement about the
world and not a string in a document.
"""
import os, re, sys, html, subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, '_bmad-output', 'planning-artifacts')
SRC  = os.path.join(PLAN, 'build-sequence.md')
OUT  = os.path.join(PLAN, 'BUILD-BOARD.html')

# key, number, title, status, one-line where-it-stands, what it produces, blocked-by
STEPS = [
 ('s1', '1', 'Architecture', 'done',
  'The 36 invariants, the schema, and its runnable proof. Four stress rounds and a reliability '
  'round applied on top.',
  'The architecture spine — the rules everything else is built from.', None),
 ('s2', '2', 'The two E0 spikes', 'done',
  'Both emitters exist and are proven to agree node by node. The platform register is closed to the '
  'limit of what is reachable without a Ghost(Pro) site.',
  'Proof the rich-text model works end to end, and executed results for the whole register.', None),
 ('s3', '3', 'Design prompts 2 and 3', 'running',
  'Prompt 2 is RUN but not yet exported to disk. Prompt 3 is RUNNING in batches — and its first '
  'batches used a prompt that asked for only six of the ten required spec fields.',
  'The archetype system and missing surfaces (prompt 2); then 484 designs AND their '
  'specifications (prompt 3, run 34 times).', None),
 ('s4', '4', 'Reconcile designs against the PRD', 'next',
  'Runnable as soon as the first two or three categories land — do NOT wait for all 34.',
  'A reconciliation report: contradictions, gaps, and spec completeness.',
  'the first categories from prompt 3'),
 ('s5', '5', 'Journeys and flows', 'ready',
  'Blocked only on prompt 2 being EXPORTED — the work itself is already done. Nothing here depends '
  'on the 484 designs, so this can run alongside them rather than after.',
  'Four journeys and eight flows, authored rather than verified.',
  'prompt 2 landing in design/'),
 ('s6', '6', 'Epics and stories', 'later',
  'Expands section 8 into stories. It does not re-plan anything.',
  'The story breakdown.', 'steps 4 and 5'),
 ('s6b', '6b', 'Readiness gate', 'later',
  'Two readiness conditions specific to this project, both about the library running sequentially.',
  'Sprint status tracking, and a go/no-go on opening any story.', 'step 6'),
]

# which fenced block in build-sequence.md belongs to which step, in document order,
# and whether it is safe to run. A historical prompt gets NO copy button on purpose.
PROMPTS = [
 ('s1',  'Architecture', 'historical',
  'Complete. Kept for provenance. It states figures that were true when written and are not now.'),
 ('s2',  'Spike (a) — mark emission', 'refuted',
  'Complete, AND one instruction in it is FALSE — it tells you to escape a preceding backslash, '
  'which was executed and disproved. Following it would rebuild a defect four rounds removed. '
  'Read the warning in build-sequence.md before this prompt, never the prompt alone.'),
 ('s2',  'Spike (b) — platform verification', 'historical',
  'Complete. Its "21 items" is long out of date; the register has grown every round.'),
 ('s4',  'Reconcile designs against the PRD', 'live', None),
 ('s5',  'Journeys and flows', 'live', None),
 ('s6',  'Epics and stories', 'live', None),
 ('s6b', 'Readiness gate', 'live', None),
]

# One chat per category is what the prompt intends ("runs once per category, 34 times... this
# prompt is self-contained"). Two consequences the board has to carry.
#
# (1) The durable fix for the missing fields is the CORRECTED FILE, used for every new chat — not a
#     correction pasted into a session. The paste is only for a category already in flight.
# (2) The prompt tells each session to reuse components established in earlier categories, and a
#     fresh chat cannot see them. That continuity has to be carried by hand.
FIX_PROMPT = """A correction to the specification requirements for this category.

Each design's written spec must carry TEN fields. This session was started with a version asking for
only six, so please include all ten from here on, and add the missing four to any design already
produced in this session:

1. Descriptor — the one-line structural identity: what makes this design THIS design.

2. Structural descriptor (the tuple) — archetype · primary axis · item-count class · media placement
   · emphasis mechanism. This one is machine-checked and free prose is not, because two designs can
   be described differently in English and still be the same design. It must stay unique within this
   category once every design's control list is written, since controls stop distinguishing designs
   at that point.

3. Archetype — which responsive archetype it collapses under, from this closed list: grid-of-N,
   split, stack, bar, nav, edge rail, overlay, feed, form, carousel, table, media frame, sticky,
   article body. It supplies the default collapse ladder, so the responsive rule only needs to state
   the departures from it.

4. Behaviour module — which module the design declares (if any), whether that module is edit-safe,
   and its no-JS degradation written out. The degradation is an acceptance criterion, not a note: a
   design whose module has no degradation statement is not finished.

The six fields already being produced stay exactly as they are: responsive rule, content fields,
controls (sidebar order, closed value sets), data binding with 0/1/many behaviour, empty state, and
accessibility notes.

Also: the specifications belong in sections-inventory.md, not alongside the frames. The frames go in
the design folder; the specs do not. They are the half the build reads."""

# Asked at the END of each category session. A fresh chat has no memory of the components earlier
# categories established, and the prompt requires reusing them verbatim ("by category ten you should
# be reusing far more than you invent"). Without this the library drifts one category at a time.
HANDOFF_PROMPT = """Before we close this category, produce a COMPONENT INVENTORY for me to carry into
the next session.

List every reusable component this category established or reused — button, card, avatar, meta row,
badge, input, tab, whatever it turned out to be. One line each:

    component name — what it is, in a few words — first established in category X

Include the ones this category REUSED from earlier categories, not only the new ones, so the list
stays cumulative rather than resetting. Keep it tight enough to paste at the top of the next session.

Then give me this category's shared field list as a separate block — the union of every field its
designs need, which is the contract that makes design-switching safe."""

# Pasted at the START of each new category session, above the master brief.
CARRY_PROMPT = """These components already exist from earlier categories and carry forward VERBATIM.
Reuse them rather than inventing equivalents — consistency outranks novelty, and by the tenth
category you should be reusing far more than you invent.

<paste the component inventory from the previous session here>

If a design genuinely needs something none of these covers, say so explicitly and explain why the
existing component could not be adapted."""

ACTIONS = [
 ('now', 'Use the CORRECTED prompt file for every new category chat',
  'One chat per category is exactly what prompt 3 intends — it says so, and it is self-contained by '
  'design. That makes the fix simple: the file on disk is already corrected, so from the next '
  'category onward you just paste the current version of §1–§4. Nothing else to do. '
  'design/claude-design-prompt-3-library.md.'),
 ('now', 'Only if a category is mid-flight right now: paste the correction into THAT chat',
  'Not needed for future chats — they get the corrected file. This is purely to rescue a session '
  'already in progress, and it asks for the four missing fields to be added to designs already '
  'produced in that session.'),
 ('now', 'Carry a component inventory between chats — the prompt assumes it and a fresh chat cannot',
  'Prompt 3 tells each session to reuse components established in earlier categories, verbatim, and '
  'says that by category ten you should be reusing far more than you invent. A new chat has no way '
  'to see them. So end each session by asking for a component inventory, and paste it at the top of '
  'the next. Without this the library drifts one category at a time and the reconciliation pass '
  'finds thirty variants of a button.'),
 ('soon', 'Decide what to do about categories finished before the correction',
  'Descriptor and archetype back-fill cheaply — both are readable off a finished frame. The '
  'structural tuple and the no-JS degradation do not: the tuple must be unique across a whole '
  'category, and the degradation is a design question rather than a documentation one. One or two '
  'categories: re-run. More: back-fill the easy two and do a dedicated pass for the hard two while '
  'the designs are fresh.'),
 ('soon', 'Export design prompt 2 to design/',
  'It has already been run; it is simply not on disk. The moment it is, step 5 unblocks and can run '
  'alongside the 34 category sessions instead of queuing behind them.'),
 ('soon', 'Send category one\'s specs for a ten-field check',
  'Minutes of work, and it either confirms the format for the remaining 33 or catches a systematic '
  'problem while it is still cheap.'),
 ('gate', 'Supabase Pro before the Live project holds real customer data',
  'The Free plan has NO automatic backups at all. Live is provisioned as a FRESH project at go-live, '
  'so this is a step someone performs rather than inherits. The gate includes one real restore — a '
  'backup nobody has restored from is a hypothesis. Register 42.'),
 ('gate', 'Ghost(Pro) Starter before public launch',
  'One Ghost hosting tier forbids custom themes, and that path is untested until an account on it '
  'exists. Launch-blocking. Surfaces at the end of E13.'),
 ('gate', 'Enable Dodo\'s renewal reminder — Settings → Communication',
  'Off by default, and it is a backstop rather than the mechanism: Inflozo sends its own at 30 days '
  '(annual) and 7 days (monthly), because the exposure was always the timing.'),
]

def fenced(md):
    return re.findall(r'\n```\n(.*?)\n```\n', md, re.S)


def build():
    md = open(SRC, encoding='utf8').read()
    blocks = fenced(md)
    # the memlog snippet is a bash block, not a step prompt — drop anything not starting with /
    blocks = [b for b in blocks if b.lstrip().startswith('/')]
    if len(blocks) != len(PROMPTS):
        print(f'  ! build-sequence.md has {len(blocks)} slash-prompts, PROMPTS declares '
              f'{len(PROMPTS)}. Update tools/build-board.py.', file=sys.stderr)
        sys.exit(2)
    date = subprocess.run(['git', 'log', '-1', '--format=%cs'], cwd=ROOT,
                          capture_output=True, text=True).stdout.strip()
    e = html.escape
    by_step = {}
    for (skey, title, kind, note), body in zip(PROMPTS, blocks):
        by_step.setdefault(skey, []).append((title, kind, note, body))

    LABEL = {'done': 'complete', 'running': 'running now', 'next': 'next up',
             'ready': 'ready when unblocked', 'later': 'later'}
    cards = []
    for key, num, title, status, stands, produces, blocked in STEPS:
        ps = ''
        for ptitle, kind, note, body in by_step.get(key, []):
            warn = f'<p class="pnote {kind}">{e(note)}</p>' if note else ''
            btn = ('' if kind != 'live' else
                   f'<button class="copy" data-t="{e(body)}">Copy prompt</button>')
            ps += (f'<div class="prompt {kind}"><div class="phead"><h4>{e(ptitle)}</h4>'
                   f'<span class="ptag {kind}">{kind}</span>{btn}</div>{warn}'
                   f'<pre>{e(body)}</pre></div>')
        cards.append(f'''<section class="step {status}" id="{key}">
  <div class="shead">
    <span class="snum">{e(num)}</span>
    <div class="stitle"><h2>{e(title)}</h2>
      <span class="badge {status}">{LABEL[status]}</span></div>
  </div>
  <p class="stands">{e(stands)}</p>
  <dl><dt>Produces</dt><dd>{e(produces)}</dd>
  {'<dt>Waiting on</dt><dd>' + e(blocked) + '</dd>' if blocked else ''}</dl>
  {ps}
</section>''')

    acts = {'now': [], 'soon': [], 'gate': []}
    for kind, t, d in ACTIONS:
        acts[kind].append(f'<li><b>{e(t)}</b><span>{e(d)}</span></li>')

    open(OUT, 'w', encoding='utf8').write(f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Build Board</title><style>
:root{{--bg:#fbfaf8;--card:#fff;--ink:#191919;--muted:#6a6a6c;--line:#e5e1db;--code:#f4f2ef;
--accent:#1f6feb;--accent-s:#e9f0fe;--done:#12784a;--done-s:#e2f5ec;--run:#96650a;--run-s:#fff4d9;
--next:#1f6feb;--wait:#8b8b93;--red:#b42318;--red-s:#fdeceb;
--sh:0 1px 2px rgba(0,0,0,.04),0 8px 26px rgba(0,0,0,.055)}}
@media(prefers-color-scheme:dark){{:root:not([data-theme=light]){{--bg:#131316;--card:#1b1b20;
--ink:#ecebea;--muted:#9e9b99;--line:#2f2f36;--code:#232329;--accent:#6ea8fe;--accent-s:#1b2a45;
--done:#5ed6a0;--done-s:#112f20;--run:#e8bd57;--run-s:#33280d;--next:#6ea8fe;--wait:#75757e;
--red:#f08b80;--red-s:#3a1a17;--sh:0 1px 2px rgba(0,0,0,.3),0 8px 26px rgba(0,0,0,.36)}}}}
*{{box-sizing:border-box}}body{{margin:0;background:var(--bg);color:var(--ink);
font:16px/1.62 ui-sans-serif,system-ui,-apple-system,"Segoe UI",Inter,Roboto,sans-serif;-webkit-font-smoothing:antialiased}}
.wrap{{max-width:940px;margin:0 auto;padding:52px 22px 120px}}
.kick{{color:var(--accent);font-weight:660;font-size:.78rem;letter-spacing:.1em;text-transform:uppercase}}
h1{{font-size:clamp(1.9rem,4.4vw,2.7rem);letter-spacing:-.023em;margin:.28em 0 .3em;font-weight:730}}
.lede{{color:var(--muted);font-size:1.1rem;max-width:66ch;margin:0}}
/* rail */
.rail{{display:flex;gap:6px;margin:30px 0 6px;flex-wrap:wrap}}
.rail a{{flex:1;min-width:96px;text-decoration:none;background:var(--card);border:1px solid var(--line);
border-radius:11px;padding:11px 12px;box-shadow:var(--sh);transition:transform .12s,border-color .12s}}
.rail a:hover{{transform:translateY(-2px);border-color:var(--accent)}}
.rail .n{{font-size:.72rem;color:var(--muted);font-weight:650;letter-spacing:.06em}}
.rail .t{{display:block;color:var(--ink);font-size:.86rem;font-weight:640;margin-top:2px;line-height:1.3}}
.rail .b{{display:inline-block;margin-top:7px;height:4px;width:100%;border-radius:2px;background:var(--line)}}
.rail a.done .b{{background:var(--done)}}.rail a.running .b{{background:var(--run)}}
.rail a.next .b{{background:var(--next)}}.rail a.ready .b{{background:var(--next);opacity:.5}}
/* actions */
.acts{{margin:34px 0 0}}
.act{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:20px 24px;
box-shadow:var(--sh);margin-bottom:14px}}
.act.now{{border-left:3px solid var(--red)}}
.act.soon{{border-left:3px solid var(--accent)}}
.act.gate{{border-left:3px solid var(--run)}}
.act h3{{margin:0 0 .55em;font-size:1.02rem;font-weight:680}}
.act ol{{margin:0;padding-left:1.2em}}
.act li{{margin-bottom:.75em}}
.act li b{{display:block;font-weight:645}}
.act li span{{display:block;color:var(--muted);font-size:.9rem;margin-top:.15em}}
/* steps */
.step{{background:var(--card);border:1px solid var(--line);border-radius:15px;padding:22px 25px;
box-shadow:var(--sh);margin:14px 0;scroll-margin-top:16px}}
.step.done{{opacity:.72}}
.step.running{{border-color:var(--run)}}
.shead{{display:flex;align-items:center;gap:13px;margin-bottom:10px}}
.snum{{width:34px;height:34px;border-radius:10px;background:var(--accent-s);color:var(--accent);
display:flex;align-items:center;justify-content:center;font-weight:720;font-size:.9rem;flex:none}}
.step.done .snum{{background:var(--done-s);color:var(--done)}}
.step.running .snum{{background:var(--run-s);color:var(--run)}}
.stitle{{display:flex;align-items:center;gap:10px;flex-wrap:wrap}}
.stitle h2{{margin:0;font-size:1.22rem;font-weight:690;letter-spacing:-.012em}}
.badge{{font-size:.72rem;font-weight:660;padding:3px 10px;border-radius:999px;white-space:nowrap}}
.badge.done{{background:var(--done-s);color:var(--done)}}
.badge.running{{background:var(--run-s);color:var(--run)}}
.badge.next,.badge.ready{{background:var(--accent-s);color:var(--accent)}}
.badge.later{{background:var(--code);color:var(--wait)}}
.stands{{margin:0 0 12px;max-width:74ch}}
dl{{margin:0 0 6px;display:grid;grid-template-columns:max-content 1fr;gap:4px 14px;font-size:.92rem}}
dt{{color:var(--muted);font-size:.75rem;text-transform:uppercase;letter-spacing:.055em;font-weight:660;padding-top:3px}}
dd{{margin:0}}
/* prompts */
.prompt{{margin-top:16px;border:1px solid var(--line);border-radius:12px;overflow:hidden}}
.prompt.refuted{{border-color:var(--red)}}
.phead{{display:flex;align-items:center;gap:10px;padding:11px 14px;background:var(--code);flex-wrap:wrap}}
.phead h4{{margin:0;font-size:.93rem;font-weight:660;flex:1}}
.ptag{{font-size:.68rem;font-weight:680;padding:2px 9px;border-radius:999px;text-transform:uppercase;letter-spacing:.05em}}
.ptag.live{{background:var(--done-s);color:var(--done)}}
.ptag.historical{{background:var(--code);color:var(--wait);border:1px solid var(--line)}}
.ptag.refuted{{background:var(--red-s);color:var(--red)}}
.pnote{{margin:0;padding:11px 14px;font-size:.87rem;color:var(--muted);border-bottom:1px solid var(--line)}}
.pnote.refuted{{background:var(--red-s);color:var(--red)}}
pre{{margin:0;padding:14px;background:var(--card);overflow-x:auto;font-size:.79rem;line-height:1.5;
font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;white-space:pre-wrap;word-break:break-word}}
.prompt.historical pre,.prompt.refuted pre{{opacity:.6}}
button.copy{{font:inherit;font-size:.8rem;font-weight:640;cursor:pointer;border:1px solid var(--accent);
background:var(--accent);color:#fff;border-radius:8px;padding:5px 13px}}
button.copy:hover{{opacity:.9}}button.copy.ok{{background:var(--done);border-color:var(--done)}}
footer{{margin-top:46px;padding-top:20px;border-top:1px solid var(--line);color:var(--muted);font-size:.86rem}}
</style></head><body><div class="wrap">
<div class="kick">Inflozo</div><h1>Build board</h1>
<p class="lede">Where the project is, what is next, and every prompt ready to copy. Generated from
<code>build-sequence.md</code> — the prompts are extracted from it, never retyped, so the two cannot
drift apart.</p>

<div class="rail">
{''.join(f'<a class="{st}" href="#{k}"><span class="n">STEP {n}</span><span class="t">{e(t)}</span><span class="b"></span></a>' for k,n,t,st,_,_,_ in STEPS)}
</div>

<div class="acts">
  <div class="act now"><h3>Do now — time-sensitive</h3><ol>{''.join(acts['now'])}</ol>
    <div class="prompt live" style="margin-top:4px">
      <div class="phead"><h4>Rescue a category already in flight</h4>
        <span class="ptag live">only if mid-category</span>
        <button class="copy" data-t="{e(FIX_PROMPT)}">Copy</button></div>
      <pre>{e(FIX_PROMPT)}</pre></div>
    <div class="prompt live">
      <div class="phead"><h4>Ask for this at the END of every category</h4>
        <span class="ptag live">every session</span>
        <button class="copy" data-t="{e(HANDOFF_PROMPT)}">Copy</button></div>
      <pre>{e(HANDOFF_PROMPT)}</pre></div>
    <div class="prompt live">
      <div class="phead"><h4>Paste this at the START of every category, above the brief</h4>
        <span class="ptag live">every session</span>
        <button class="copy" data-t="{e(CARRY_PROMPT)}">Copy</button></div>
      <pre>{e(CARRY_PROMPT)}</pre></div>
  </div>
  <div class="act soon"><h3>Do soon</h3><ol>{''.join(acts['soon'])}</ol></div>
  <div class="act gate"><h3>Gates — purchases and checks with triggers</h3><ol>{''.join(acts['gate'])}</ol></div>
</div>

{''.join(cards)}

<footer>Generated {e(date)} from <code>build-sequence.md</code>, which governs on any conflict.
Regenerate with <code>python3 tools/build-board.py</code>. A prompt marked <b>historical</b> has no
copy button on purpose — one of them contains an instruction that execution disproved.</footer>
</div>
<script>
document.querySelectorAll('button.copy').forEach(b => b.onclick = async () => {{
  try {{ await navigator.clipboard.writeText(b.dataset.t); }} catch (e) {{
    const ta = document.createElement('textarea'); ta.value = b.dataset.t;
    document.body.appendChild(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }}
  const was = b.textContent; b.textContent = 'Copied'; b.classList.add('ok');
  setTimeout(() => {{ b.textContent = was; b.classList.remove('ok'); }}, 1800);
}});
</script></body></html>''')
    return len(blocks)


if __name__ == '__main__':
    if '--check' in sys.argv:
        if not os.path.exists(OUT):
            print('  FAIL  BUILD-BOARD.html missing — run tools/build-board.py'); sys.exit(1)
        before = open(OUT, encoding='utf8').read()
        build()
        if open(OUT, encoding='utf8').read() != before:
            print('  FAIL  BUILD-BOARD.html was stale and has been regenerated'); sys.exit(1)
        print('build board: current'); sys.exit(0)
    n = build()
    print(f'BUILD-BOARD.html regenerated — {n} prompts extracted from build-sequence.md')
