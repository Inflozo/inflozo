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
  'Every invariant (the spine is the count), the schema, and its runnable proof. Four stress '
  'rounds and a reliability '
  'round applied on top.',
  'The architecture spine — the rules everything else is built from.', None),
 ('s2', '2', 'The two E0 spikes', 'done',
  'Both emitters exist and are proven to agree node by node. The platform register is closed to the '
  'limit of what is reachable without a Ghost(Pro) site.',
  'Proof the rich-text model works end to end, and executed results for the whole register.', None),
 ('s3', '3', 'Design prompts 2 and 3', 'done',
  'Every category designed and exported, then patched by the controls-reconciliation pass '
  '(P0 primitives plus one patch per category; 39 decisions, all ruled — four later reversed). '
  'Every spec ends with its own Reconciliation notes — step 4\'s third input.',
  'The archetype system and the app screens (prompt 2); every category\'s designs AND their '
  'specifications (prompt 3).', None),
 ('s4', '4', 'Reconcile designs against the PRD, the architecture and Ghost', 'done',
  'Both halves ran 2026-08-27. 4a reviewed every category spec, P0 and the S/M screens (1,086 '
  'findings, 41 probe families, a 1,078-row owner-flag register). The Ghost Build Room then ruled: '
  'all 66 ghost-infeasible findings and all five decision-collisions closed, FOUR approved decisions '
  'reversed (D3, D17, D26, D27 in half), and four probe families removed — two closed by execution '
  'against T1/T3 during the session, two deleted by the native-search ruling. Nine more rulings '
  '(R-30 \u2026 R-38) were taken on 2026-08-31. Read reconcile-designs-decisions.md \u00a7B before '
  'trusting any D-number anywhere in this project.',
  'prds/.../reconcile-designs.md and reconcile-designs-decisions.md \u2014 every ruling naming the '
  'documents that must move. Its ledger records what has landed; R-30 \u2026 R-38 have not yet, and '
  'are owed before E4 and E9 open.', None),
 ('smerge', '4\u00bd', 'The inventory merge', 'done',
  'The specs merged into sections-inventory.md and the inventory is now GENERATED from the design '
  'export and gated, so it cannot drift again. A23 Search deleted whole; the design patch pass run '
  'over every category and verified by tools/verify-design-pass.py; both deferred derivations '
  '(the per-category Content/Controls/Data unions, and research \u00a77\u2019s design lists) '
  'complete; derived-fields-A1-A12.md retired.',
  'An inventory the build can open, that no longer restates a count anywhere.', None),
 ('s5', '5', 'Journeys and flows', 'next',
  'THE CRITICAL PATH, and blocked by nothing. Its input is \u00a737.7 of reconcile-designs.md — the '
  'editor surfaces with no frame, the flows drawn on wrong semantics, and the journeys that hold — '
  're-verified against the current export on 2026-08-31 and still standing (see \u00a7A4 of the '
  'decisions file for the delta; two of its items are now fixed).',
  'Four journeys and eight flows, authored rather than verified.', None),
 ('s6', '6', 'Epics and stories', 'later',
  'Expands section 8 into stories. It does not re-plan anything.',
  'The story breakdown.', 'step 5'),
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
 ('s4',  '4a — The review (unattended)', 'live', None),
 ('s4',  '4b — The Ghost Build Room (you must be in the room)', 'live',
  'Interactive. Run 4a first; the room reads its report as the agenda and presents each unsettled '
  'item to you as a numbered decision.'),
 ('s5',  'Journeys and flows', 'live', None),
 ('s6',  'Epics and stories', 'live', None),
 ('s6b', 'Readiness gate', 'live', None),
]

# What to do the moment a patched export lands in the design-export folder, in order.
# (command or None, what it is, why it matters / what a failure means)
RUNBOOK = [
 (None,
  'Drop the export in, replacing the folder contents',
  'The zip is authoritative and Inflozo/ is its extraction. Do not hand-merge: replace, then let the '
  'checks below tell you what moved. Two things in there were edited in the REPO rather than in '
  'Claude Design — the count-agnostic marketing copy and P0\u2019s mark allowlist — and step 2 is what '
  'catches it if the re-export undid either.'),
 ('python3 tools/verify-design-pass.py',
  'Did the pass actually apply the rulings?',
  'One check per ruling, run against the export. Every structural check must pass. Six prose scans '
  'come back LOOK by design — they cannot tell a violation from a spec RECORDING that it removed the '
  'thing, so a human reads those six. The last two checks guard the repo-side hand edits: if the '
  're-export put a design total back on a marketing screen, or dropped P0\u2019s mark allowlist, they '
  'go red here rather than months later.'),
 ('python3 tools/export-roster.py > /dev/null && python3 tools/inventory-gen.py --write',
  'Re-derive the library from what was actually drawn',
  'The export is the count. This rewrites the inventory\u2019s totals and every category roster from '
  'it, so no number is ever typed by hand. If a design was cut or renamed in the pass, this is where '
  'it shows up.'),
 ('python3 tools/tuple-check.py',
  'Is every design still structurally distinct?',
  'FR-G5\u2019s gate: six slots, five closed vocabularies, unique within a category, contiguous '
  'numbering. A pass that edits arrangement or media placement can collide two designs without '
  'anyone noticing \u2014 this is what notices.'),
 ('python3 tools/derive-module-reach.py',
  'Re-derive which designs declare which script',
  'A9 loses its filter and A2-13 is gone, so at least two module rows change their design list. '
  'Counts a module only where a design\u2019s OWN declaration names it \u2014 a mention in category prose '
  'is not a declaration, which is what stops every A1 design claiming accordion by association.'),
 ('python3 tools/derive-content-lines.py && python3 tools/derive-control-lines.py',
  'Re-derive the storage contract and the control unions',
  'The Content: line is the STORAGE CONTRACT \u2014 a field missing from it has nowhere to park when a '
  'user switches design, and their words are lost. If the pass added a field to any spec, it has to '
  'reach here or FR-D17\u2019s preservation gate fails on it.'),
 ('python3 tools/doc-audit.py --check',
  'The documentation gate \u2014 run it twice',
  'Catalogue, index, generated artifacts, tuples, inventory-versus-export. The FIRST run after a '
  'change often reports FAIL and fixes itself: its sub-tools regenerate on failure. That is the '
  'tools working. The second run is the one that counts.'),
 (None,
  'Triage what came back \u2014 the only human step',
  'Each prompt was asked to do two things beyond its work list: strike the Open questions that were '
  'already settled and mark the ones that are not, and flag anything it was unsure of rather than '
  'guess (A33\u2019s Ghost class names especially). Read those flags. Anything genuinely open comes to '
  'the owner as a numbered decision \u2014 nobody answers one on his behalf.'),
 (None,
  'Then step 5 \u2014 journeys and flows',
  'Nothing above blocks it and it never did; clearing first was a choice. The prompt is on this '
  'board under STEP 5.'),
]


ACTIONS = [
 ('now', 'Step 5 — journeys and flows',
  'THE CRITICAL PATH. /bmad-ux authors the four journeys and eight flows from the PRD and prompt 2\'s '
  'exported app screens. Its work list is \u00a737.7 of reconcile-designs.md — the editor surfaces '
  'with no frame and the flows drawn on wrong semantics — re-verified on 2026-08-31 and still '
  'standing. It needs almost nothing from you.'),
 ('now', 'Design patch pass TWO \u2014 IN PROGRESS in Claude Design',
  'DESIGN-PATCH-PROMPTS-2.html \u2014 20 self-contained prompts, one per category with work. RUN P0 '
  'FIRST: the greyed-control treatment is drawn there once and every later category points at it. '
  'THREE PROMPTS CHANGED on 2026-08-31 after the owner ruled on register 45 \u2014 A1 (Sticky and '
  'Stay-transparent may not both be on), A2 (design 13 Consent is CUT, number retired) and A9 (new '
  'to the pass: 12 Filter loses its filter control). If those three were already run, run them '
  'again. Nothing in the pass is a question: every item is already in the PRD and the spine. When '
  'the export comes back, follow the runbook at the top of this board.'),
 ('gate', 'Supabase Pro before the live site has real customers',
  'Free has no backups at all. Includes doing one real restore.'),
 ('gate', 'Ghost(Pro) Starter before public launch', 'Blocks launch. Comes up at the end of E13.'),
 ('gate', 'Turn on Dodo renewal reminder', 'Settings, Communication. Off by default.'),
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

    rb = []
    for n, (cmd, title, why) in enumerate(RUNBOOK, 1):
        code = f'<code>{e(cmd)}</code>' if cmd else '<span class="nocmd">no command \u2014 by hand</span>'
        rb.append(f'<li><div class="rbh"><span class="rbn">{n}</span><b>{e(title)}</b></div>'
                  f'{code}<p>{e(why)}</p></li>')

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
.runbook{{background:var(--card);border:1px solid var(--line);border-radius:16px;
padding:24px 26px;box-shadow:var(--sh);margin:26px 0 4px}}
.runbook h2{{font-size:1.12rem;margin:0 0 .4em;letter-spacing:-.01em}}
.rblede{{color:var(--muted);font-size:.93rem;margin:0 0 18px;max-width:78ch}}
ol.rb{{list-style:none;margin:0;padding:0;counter-reset:none}}
ol.rb>li{{padding:14px 0;border-top:1px solid var(--line)}}
ol.rb>li:first-child{{border-top:0;padding-top:0}}
.rbh{{display:flex;align-items:center;gap:10px;margin-bottom:7px}}
.rbn{{flex:none;width:22px;height:22px;border-radius:50%;background:var(--accent-s);
color:var(--accent);font-size:.76rem;font-weight:700;display:flex;align-items:center;
justify-content:center}}
.rbh b{{font-size:.99rem;letter-spacing:-.006em}}
ol.rb code{{display:block;background:var(--code);border-radius:7px;padding:8px 11px;
font-size:.82rem;overflow-x:auto;white-space:pre;margin:0 0 7px}}
.nocmd{{display:block;color:var(--muted);font-size:.8rem;font-style:italic;margin:0 0 7px}}
ol.rb p{{margin:0;color:var(--muted);font-size:.9rem;line-height:1.58;max-width:82ch}}
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

<section class="runbook">
  <h2>When the patched export lands \u2014 run these, in this order</h2>
  <p class="rblede">Pass two is being run in Claude Design now. This is what happens the moment its
  output is dropped into <code>design/claude-design-export/</code>. Every count in this project is
  DERIVED from that export, so most of the list is re-derivation rather than editing \u2014 and the
  one human step is at the end, not the start.</p>
  <ol class="rb">{''.join(rb)}</ol>
</section>

<div class="acts">
  <div class="act now"><h3>Do now — time-sensitive</h3><ol>{''.join(acts['now'])}</ol></div>
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
