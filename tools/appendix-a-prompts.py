#!/usr/bin/env python3
"""Inflozo — the Appendix A Claude Design prompts, as a trackable HTML page.

    python3 tools/appendix-a-prompts.py            # regenerate APPENDIX-A-PROMPTS.html
    python3 tools/appendix-a-prompts.py --check    # exit non-zero if the file is stale

The prompts live in the UX spine, EXPERIENCE.md → "## Appendix A — Claude Design prompts", one fenced
block under each `### A<n> · <title>` heading. This page EXTRACTS them at generation time and retypes
nothing — the fenced text, the preamble's export warning and its Handlebars line all come from the
spine — so the page cannot drift from it, and --check fails when either side moves.

The list of prompts is DERIVED from the headings (counts are derived, never written down). The only
thing authored here is the session split the preamble names: A7 together with A8, then the rest.
"""
import os, re, sys, html, importlib.util

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAN = os.path.join(ROOT, '_bmad-output/planning-artifacts')
OUT = os.path.join(PLAN, 'APPENDIX-A-PROMPTS.html')
SPINE = os.path.join(PLAN, 'ux-designs/ux-Inflozo-2026-09-03/EXPERIENCE.md')
SPINE_REL = os.path.relpath(SPINE, PLAN)                     # the page links it relatively

_s = importlib.util.spec_from_file_location('dp1', os.path.join(ROOT, 'tools/design-patch-prompts.py'))
dp1 = importlib.util.module_from_spec(_s); _s.loader.exec_module(dp1)

# The preamble: "A7 together with A8 (both correct or extend the editor's existing frames and share
# the focus-ring token), then A1 to A6". Session 1 is that pair; session 2 is every other heading,
# in heading order — so a new heading lands in session 2 rather than being dropped.
SESSION_1 = ['A7', 'A8']
WHY_1 = ("Both correct or extend the editor's existing frames and share the focus-ring token — "
         "A8's prompt says \"Run with A7\". Paste A7 first, then A8, in the same chat.")
WHY_2 = "New canvases, each independent of the others. Paste one at a time, in the order shown."


def appendix():
    """(preamble, [(id, title, prompt)]) read from the spine. One fenced block per ### A heading."""
    text = open(SPINE, encoding='utf8').read()
    m = re.search(r'^## Appendix A[^\n]*\n(.*?)(?=^## |\Z)', text, re.M | re.S)
    assert m, 'the spine has no "## Appendix A" section'
    body = m.group(1)
    preamble = body.split('\n---\n', 1)[0].strip()
    parts = re.split(r'^### (A\d+) · (.+?)[ \t]*$', body, flags=re.M)   # [lead, id, title, section, ...]
    prompts = []
    for i in range(1, len(parts), 3):
        pid, title, section = parts[i], parts[i + 1], parts[i + 2]
        fences = re.findall(r'^```[^\n]*\n(.*?)\n```[ \t]*$', section, re.M | re.S)
        assert len(fences) == 1, f'{pid}: expected exactly one fenced block, found {len(fences)}'
        prompts.append((pid, title, fences[0]))
    assert prompts, 'no "### A" headings under Appendix A'
    assert len({p[0] for p in prompts}) == len(prompts), 'duplicate ### A heading'
    return preamble, prompts


def para(preamble, start):
    """The preamble paragraph that starts with `start`, blockquote marks stripped, as one line."""
    for p in re.split(r'\n\s*\n', preamble):
        lines = [l.lstrip('> ').strip() for l in p.splitlines()]
        if lines and lines[0].startswith(start):
            return ' '.join(lines)
    raise AssertionError(f'the Appendix A preamble has no paragraph starting {start!r}')


def md(s):
    """Escape, then the two inline marks the preamble uses: **bold** and `code`."""
    s = html.escape(s)
    s = re.sub(r'\*\*(.+?)\*\*', r'<b>\1</b>', s)
    return re.sub(r'`([^`]+)`', r'<code>\1</code>', s)


JS = """const K='inflozo-appendix-a-done';
let done;
try{done=new Set(JSON.parse(localStorage.getItem(K)||'[]'));}catch(e){done=new Set();}
function save(){try{localStorage.setItem(K,JSON.stringify([...done]))}catch(e){}paint()}
function paint(){
  const cats=document.querySelectorAll('.cat');
  cats.forEach(c=>{const is=done.has(c.dataset.cat);
    c.classList.toggle('done',is); c.querySelector('.tick').checked=is;});
  document.querySelector('.count').textContent=done.size+' / '+cats.length+' done';
  document.querySelector('.prog i').style.width=(done.size/cats.length*100)+'%';}
function copy(txt){                       // file:// has no clipboard API in some browsers
  if(navigator.clipboard) return navigator.clipboard.writeText(txt);
  const ta=document.createElement('textarea'); ta.value=txt; document.body.appendChild(ta);
  ta.select(); document.execCommand('copy'); ta.remove(); return Promise.resolve();}
document.addEventListener('click',e=>{
  const t=e.target;
  if(t.classList.contains('tick')){const id=t.closest('.cat').dataset.cat;
    done.has(id)?done.delete(id):done.add(id); save(); e.stopPropagation(); return;}
  if(t.closest('.chead')){t.closest('.cat').classList.toggle('open'); return;}
  if(t.classList.contains('copy')){
    copy(t.closest('.body').querySelector('pre').textContent).then(()=>{
      const o=t.textContent; t.textContent='Copied'; setTimeout(()=>t.textContent=o,1200);});}
});
document.querySelector('#reset').onclick=()=>{if(confirm('Clear all progress?')){done.clear();save();}};
document.querySelector('#expand').onclick=()=>document.querySelectorAll('.cat').forEach(c=>c.classList.add('open'));
paint();"""


def render():
    preamble, prompts = appendix()
    by_id = {p[0]: p for p in prompts}
    missing = [c for c in SESSION_1 if c not in by_id]
    assert not missing, f'SESSION_1 names a heading the spine does not have: {missing}'
    session_2 = [p[0] for p in prompts if p[0] not in SESSION_1]
    assert session_2, 'every heading is in session 1 — the split no longer makes sense'
    sessions = [(f'Session 1 — {" with ".join(SESSION_1)}', WHY_1, SESSION_1),
                (f'Session 2 — {session_2[0]} to {session_2[-1]}', WHY_2, session_2)]

    export_line = para(preamble, '**Running any of these')
    two_sessions = para(preamble, '**They can be run as two')
    handlebars = para(preamble, '**A literal Ghost Handlebars')

    cards, step = [], 0
    for n, (stitle, why, ids) in enumerate(sessions, 1):
        cards.append(f'<h2 class="wave">{html.escape(stitle)}</h2><p class="why">{html.escape(why)}</p>')
        for pid in ids:
            _, title, prompt = by_id[pid]
            step += 1
            cards.append(f'''<div class="cat" data-cat="{pid}">
  <div class="chead"><input class="tick" type="checkbox" aria-label="mark {pid} done">
    <span class="step">{step}</span>
    <span class="cid">{pid}</span><span class="cname">{html.escape(title)}</span>
    <span class="cmeta">session {n}</span></div>
  <div class="body"><pre>{html.escape(prompt)}</pre>
    <button class="btn copy">Copy prompt</button></div></div>''')

    return f"""<!doctype html><html lang="en"><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Inflozo — Appendix A prompts</title><style>{dp1.CSS}</style>
<body><div class="wrap">
<h1>Appendix A — the Claude Design prompts</h1>
<p class="sub">These drew the parts of Inflozo's own app that Claude Design had not drawn, and
corrected the frames it drew wrongly; they ran on 2026-09-04 and this page is the record of what was asked. They live in the UX spine,
<a href="{html.escape(SPINE_REL)}">EXPERIENCE.md</a> → Appendix A, and this page lifts them from it word
for word. Paste each session's prompts into one Claude Design chat, in the order shown. Tick a card
when you have run it. Export the whole project once, after Session 2, then run the runbook once.
Progress is stored in this browser.</p>
<div class="bar"><span class="count"></span><span class="prog"><i></i></span>
<button class="btn" id="expand">Expand all</button><button class="btn" id="reset">Reset</button></div>
<p class="note">{md(export_line)} The build board is <a href="BUILD-BOARD.html">BUILD-BOARD.html</a>;
the runbook is the numbered list at its top.</p>
<div class="gate">{md(two_sessions)}</div>
<p class="note"><b>Every session must observe:</b> {md(handlebars)}</p>
{''.join(cards)}
<footer>Generated from <code>tools/appendix-a-prompts.py</code>. Every prompt, the export warning and
the Handlebars line are extracted from <code>{html.escape(SPINE_REL)}</code> at generation time and
retyped nowhere; <code>python3 tools/appendix-a-prompts.py --check</code> fails when the two disagree.
As many cards as the spine has <code>### A</code> headings.</footer>
</div><script>{JS}</script></body></html>"""


def main():
    out = render()
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf8').read() if os.path.exists(OUT) else ''
        if cur.strip() != out.strip():
            open(OUT, 'w', encoding='utf8').write(out)
            print('APPENDIX-A-PROMPTS.html was stale and has been regenerated'); return 1
        print('appendix A prompts: current'); return 0
    open(OUT, 'w', encoding='utf8').write(out)
    print(f'wrote {os.path.relpath(OUT, ROOT)}')
    return 0


if __name__ == '__main__':
    sys.exit(main())
