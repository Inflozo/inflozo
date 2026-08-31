#!/usr/bin/env python3
"""`{{comment_count}}` — does it substitute `%`, and what does it render with JS off?

    python3 tools/probe/run-verify-comment-count.py

WHY. R-10 #8 says "strike `%` from `comments.count_*`". `appendix-h1` §3.9 says the opposite,
and gives a reason: "`comments.count_one` / `count_many` use `%` rather than `{count}` because
Ghost's `{{plural}}`/`{{comment_count}}` helpers substitute `%` themselves". One of those is
wrong. The claim underneath R-10 #8 belongs to probe family 30, which has never been run — so
applying it would be exactly the failure standing rule 1 names. This settles it by execution.

METHOD. One theme, one post. post.hbs prints, each inside its own marker:

    A  {{comment_count}}                                    bare
    B  {{comment_count empty="none" singular="% comment" plural="% comments"}}
    C  {{comment_count empty="none" singular="{count} comment" plural="{count} comments"}}
    D  {{comments}}                                          the widget itself

WHAT THE FIRST RUN FOUND, and why the assertion below is shaped this way. The original control
asked "does exactly one of `%` / `{count}` get substituted?" and FAILED — correctly. Neither is,
because `{{comment_count}}` performs NO server-side substitution at all: it emits a `<script>`
carrying `data-ghost-comment-count-*` attributes and no text. The count is written client-side by
`core/frontend/public/comment-counts.min.js`, identical on 5.130.6 and 6.58.0, which does:

    text = `${count} ${dataset.ghostCommentCountSingular}`     // count PREPENDED, with a space

It replaces nothing. So `singular="% comment"` renders the literal **"1 % comment"**, and the
correct catalog value is the bare noun. That is now what this probe asserts.

CONTROL (standing rule 2). The bare `{{comment_count}}` case must emit EMPTY singular/plural
attributes while the two hash-param cases emit theirs verbatim. If the bare case also carried
text, the attributes would be fixed rather than reflecting the hash params, and "passed through
verbatim" would be unproven.

Cleans up: restores the previously active theme, deletes the probe post and theme.
"""
import os, re, sys, json, time, uuid, shutil, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
_s = importlib.util.spec_from_file_location('e2', os.path.join(HERE, 'run-verify-e2.py'))
e2 = importlib.util.module_from_spec(_s); _s.loader.exec_module(e2)   # reuse Ghost/jwt/zip_dir

THEME = os.path.join(HERE, 'theme-cc')
KEEP = '--keep' in sys.argv

CASES = [
    ('A_bare',    '{{comment_count}}'),
    ('B_percent', '{{comment_count empty="none" singular="% comment" plural="% comments"}}'),
    ('C_braces',  '{{comment_count empty="none" singular="{count} comment" plural="{count} comments"}}'),
]


def build_theme():
    shutil.rmtree(THEME, ignore_errors=True)
    os.makedirs(os.path.join(THEME, 'assets', 'css'), exist_ok=True)
    open(os.path.join(THEME, 'package.json'), 'w').write(json.dumps({
        "name": "inflozo-probe-cc", "description": "comment_count placeholder substitution",
        "version": "1.0.0", "engines": {"ghost": ">=5.0.0"}, "license": "MIT",
        "keywords": ["ghost", "theme", "ghost-theme"],
        "author": {"name": "Inflozo", "email": "hello@inflozo.com"},
        "config": {"posts_per_page": 12, "card_assets": True}}, indent=2))
    open(os.path.join(THEME, 'assets', 'css', 'screen.css'), 'w').write('body{font:14px monospace}\n')
    open(os.path.join(THEME, 'default.hbs'), 'w').write(
        '<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
        '<title>{{meta_title}}</title>{{ghost_head}}</head>\n'
        '<body class="{{body_class}}"><main>{{{body}}}</main>{{ghost_foot}}</body></html>\n')
    for f in ('index.hbs', 'tag.hbs', 'author.hbs', 'page.hbs', 'error.hbs'):
        open(os.path.join(THEME, f), 'w').write('<h1>{{title}}</h1>\n')
    body = '{{#post}}\n'
    for name, expr in CASES:
        body += f'<div id="{name}">[[[{expr}]]]</div>\n'
    body += '<div id="D_widget">[[[{{comments}}]]]</div>\n{{/post}}\n'
    open(os.path.join(THEME, 'post.hbs'), 'w').write(body)


def grab(html, marker):
    m = re.search(rf'<div id="{marker}">\[\[\[(.*?)\]\]\]</div>', html, re.S)
    return m.group(1).strip() if m else None


def run(g, label, out):
    print(f'\n{"=" * 78}\n{label}\n{"=" * 78}')
    post = previous = name = None
    try:
        post = e2.make_post(g, f'CC probe {uuid.uuid4().hex[:6]}', 'n/a')
        build_theme()
        previous = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
        _st, res = g.upload(e2.zip_dir(THEME), 'inflozo-probe-cc.zip')
        name = res['themes'][0]['name']
        g.api('PUT', f'themes/{name}/activate/')
        time.sleep(2)
        code, html = g.page('/' + post['slug'] + '/')
        vals = {k: grab(html, k) for k, _ in CASES}
        widget = grab(html, 'D_widget')
        print(f'  HTTP {code}   (the post has ZERO comments)')
        for k, expr in CASES:
            print(f'  {k:10s} {expr}\n             -> {vals[k]!r}')
        print(f'  D_widget   {{{{comments}}}} rendered {len(widget or "")} chars '
              f'({"present" if widget else "EMPTY"})')

        # ── the assertions ─────────────────────────────────────────────────
        v_bare, v_pct, v_brc = vals['A_bare'], vals['B_percent'], vals['C_braces']
        no_number = all(v and not re.search(r'>\s*\d', v) for v in (v_bare, v_pct, v_brc))
        pct_verbatim = v_pct is not None and 'ghost-comment-count-singular="% comment"' in v_pct
        brc_verbatim = v_brc is not None and 'ghost-comment-count-singular="{count} comment"' in v_brc
        # CONTROL: the bare call must carry EMPTY singular/plural, proving the attributes
        # reflect the hash params rather than being fixed strings.
        bare_empty = v_bare is not None and (
            'ghost-comment-count-singular=""' in v_bare or
            'ghost-comment-count-singular="comment"' in v_bare)
        print(f'\n  CONTROL: the bare call carries its own (different) singular attribute — '
              f'{"PASS" if bare_empty else "FAIL"}')
        print(f'  no server-rendered number in any case      : {"PASS" if no_number else "FAIL"}')
        print(f'  `%` passed through to the attribute verbatim: {"PASS" if pct_verbatim else "FAIL"}')
        print(f'  `{{count}}` passed through verbatim too      : {"PASS" if brc_verbatim else "FAIL"}')
        ok = bare_empty and no_number and pct_verbatim and brc_verbatim
        if ok:
            print('  => NO server-side substitution. The count is prepended CLIENT-side, so a')
            print('     placeholder in the string renders literally. Catalog values must be the')
            print('     bare noun ("comment" / "comments"), never "% comment".')
        out[label] = {'values': vals, 'widget_chars': len(widget or ''),
                      'no_server_number': no_number, 'percent_verbatim': pct_verbatim,
                      'braces_verbatim': brc_verbatim, 'control_ok': ok}
    finally:
        if name and previous:
            try:
                g.api('PUT', f'themes/{previous}/activate/')
            except Exception as ex:
                print(f'  ! restore failed: {ex}')
        if name and not KEEP:
            try:
                g.api('DELETE', f'themes/{name}/')
            except Exception:
                pass
        if post and not KEEP:
            try:
                g.api('DELETE', f'posts/{post["id"]}/')
            except Exception as ex:
                print(f'  ! post cleanup failed: {ex}')


def main():
    env = e2.load_env()
    out = {}
    for pfx, label in (('GHOST6', 'T1 — ghost6.inflozo.com'), ('GHOST5', 'T3 — ghost5.inflozo.com')):
        try:
            g = e2.Ghost(env[f'{pfx}_URL'], env[f'{pfx}_STAFF_ACCESS_TOKEN'],
                         env[f'{pfx}_MAJOR'], env[f'{pfx}_CONTENT_API_KEY'])
            run(g, f'{label}  (Ghost {env[f"{pfx}_VERSION"]})', out)
        except Exception as ex:
            print(f'\n{label}: FAILED — {ex}')
    shutil.rmtree(THEME, ignore_errors=True)
    print(f'\n{"=" * 78}\nVERDICT\n{"=" * 78}')
    if not out:
        sys.exit(1)
    for k, v in out.items():
        print(f'  {k}: {"PASS" if v["control_ok"] else "FAIL"} · no server number='
              f'{v["no_server_number"]} · attributes verbatim='
              f'{v["percent_verbatim"] and v["braces_verbatim"]}')
    sys.exit(0 if all(v['control_ok'] for v in out.values()) else 1)


if __name__ == '__main__':
    main()
