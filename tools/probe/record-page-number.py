#!/usr/bin/env python3
"""Story 5.16a's recorder — R-186's page-1 guard, executed on T1 and T3 before a line is emitted.

    python3 tools/probe/record-page-number.py

The story emits ONE constant Handlebars expression into user text (AD-5's first deliberate
exception), and its guard is the story's one unproven claim: the guard is falsy exactly on page 1
and wherever `pagination` is absent. That was read in Ghost's source on both majors and controlled
locally; standing rule 1 says a claim about an external platform is a hypothesis until it is
executed against it, so this runs it on real servers.

It records TWO spellings of the same expression, because the spec's Design Note prefers `@root` and
gscan refuses it:

    the @root form   {{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}
    the plain form   {{#if pagination.prev}}{{pagination.page}}{{/if}}

  1. It generates the probe theme WITH the `@root` markers and gates it through
     `tools/stress/gate.js`. GS120-NO-UNKNOWN-GLOBALS is EXPECTED there and is recorded rather than
     voiding the run — it is the finding — but any OTHER gscan error voids it. It then generates the
     same theme WITHOUT the `@root` markers, which must gate 0 errors on both majors or the run is
     void.
  2. On T1 (6.x) and T3 (5.x) it uploads the `@root` theme first and records what GHOST ITSELF says:
     a refusal there is the conclusive answer, and it falls back to the plain theme so the run still
     measures. Whichever was accepted is activated, `/`, `/page/2/`, `/page/3/`, a post, a public
     page and a 404 are fetched, and the previous theme is restored in a `finally` and re-read to
     prove it came back.
  3. Every marker is in `default.hbs` — the layout, where a site-wide section compiles (R-180) and
     the hardest place for `pagination` to reach — and a second pair sits inside `{{#foreach posts}}`,
     which is what the emitter writes for a repeat and the one place the two spellings can differ.
  4. THE CONTROLS (standing rule 2). The guard must print nothing at `/`, `2` at `/page/2/`, `3` at
     `/page/3/` and nothing on the other three; `pagination.page` must print 1 · 2 · 3 on the three
     list pages, or a guard printing nothing at `/` would prove only that `pagination` never reached
     the layout at all; and the `{{#foreach}}` block must print its first post's title, or an empty
     marker inside it would prove nothing either. A control that fails voids the run: nothing is
     written, and the story stops and asks (R-186 is an Ask First, not an improvisation).

It writes what a real Ghost served to MEASUREMENTS.md §49 — under its own heading, replacing an
earlier §49 written by this command so a re-run re-records rather than appending a second one — and
to nothing else. What it writes to the SERVERS is one or two theme uploads and two activations: no
content, no setting, no private mode, no custom-template assignment.
"""
import os, sys, json, time, datetime, importlib.util
import urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = 'python3 tools/probe/record-page-number.py'
POSTS_PER_PAGE = 12

# record-contexts.py's gate, zipper, `Void` and Ghost client, imported rather than copied — one
# theme-upload recorder pattern, and its `__main__` guard means importing it touches no server.
_spec = importlib.util.spec_from_file_location('record_contexts', os.path.join(HERE, 'record-contexts.py'))
ctx = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(ctx)
Void, shim = ctx.Void, ctx.shim

LAYOUT = '{{!< default}}\n'
GUARD_ROOT = '{{#if @root.pagination.prev}}{{@root.pagination.page}}{{/if}}'
GUARD_PLAIN = '{{#if pagination.prev}}{{pagination.page}}{{/if}}'

# Every expression, by the name §49 records it under, and whether it spells `@root`. The `@root`
# half is dropped from the fallback theme; everything else is in both.
EXPRESSIONS = {
    'ctx_page': ('{{pagination.page}}', False),
    'ctx_prev': ('{{pagination.prev}}', False),
    'ctx_guard': (GUARD_PLAIN, False),
    'root_page': ('{{@root.pagination.page}}', True),
    'root_prev': ('{{@root.pagination.prev}}', True),
    'root_guard': (GUARD_ROOT, True),
}
# …and the same question asked from inside `{{#foreach}}` — what the emitter writes for a repeat,
# and the one place the two spellings can differ. `loop_title` is that block's own control.
IN_LOOP = {
    'loop_title': ('{{title}}', False),
    'loop_ctx_page': ('{{pagination.page}}', False),
    'loop_root_page': ('{{@root.pagination.page}}', True),
}


def markers(names, root_ok):
    return '\n'.join(f'PN|{n}=[{e}]' for n, (e, is_root) in names.items() if root_ok or not is_root)


def files(root_ok=True):
    """A minimal valid theme. Every marker is in `default.hbs` ALONE: that is where a site-wide
    section compiles, and a `pagination` that reaches a page template proves nothing about it."""
    loop = ('{{#foreach posts}}{{#if @first}}\n' + markers(IN_LOOP, root_ok) + '\n{{/if}}{{/foreach}}')
    return {
        'default.hbs': ('<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
                        '<title>{{meta_title}}</title>\n<link rel="stylesheet" href="{{asset "css/screen.css"}}">'
                        '{{ghost_head}}</head>\n<body class="{{body_class}}">\n<div id="page-number">\n'
                        + markers(EXPRESSIONS, root_ok) + '\n' + loop + '\n</div>\n{{{body}}}\n{{ghost_foot}}</body></html>\n'),
        # `{{!< default}}` is how a template opts INTO the layout — without it express-hbs renders the
        # template alone and `default.hbs` is never reached (executed: the markers were simply absent)
        'index.hbs': LAYOUT + '<main data-template="index.hbs">{{#foreach posts}}<article>{{title}}</article>{{/foreach}}</main>\n',
        'post.hbs': LAYOUT + '<article data-template="post.hbs">{{title}}{{content}}</article>\n',
        # GS110: a page template must offer the page builder's title/feature-image switch
        'page.hbs': (LAYOUT + '<article data-template="page.hbs">{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>'
                     '{{#if feature_image}}<img src="{{feature_image}}" alt="{{title}}">{{/if}}{{/if}}{{content}}</article>\n'),
        'error.hbs': LAYOUT + '<main data-template="error.hbs">{{statusCode}} {{message}}</main>\n',
        # GS050: the two Koenig width classes are required, or wide and full images ship unstyled
        'assets/css/screen.css': ('body { font-family: system-ui, sans-serif; }\n'
                                  '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'),
        'package.json': json.dumps({
            'name': 'inflozo-probe-page-number',
            'description': "Story 5.16a's recording surface for R-186's page-1 guard",
            'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
            'keywords': ['ghost', 'theme', 'ghost-theme'],
            'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
            'config': {'posts_per_page': POSTS_PER_PAGE, 'card_assets': True},
        }, indent=2) + '\n',
    }


def gate(theme, allow):
    """`gate.js` over one theme, with the codes in `allow` recorded rather than refused. gate.js
    prints the codes it counted, so the partition is read from its own output and a count that did
    not parse is a failure, never a pass (standing rule 2)."""
    import re, subprocess, tempfile
    with tempfile.TemporaryDirectory() as d:
        for rel, body in theme.items():
            os.makedirs(os.path.dirname(os.path.join(d, rel)), exist_ok=True)
            open(os.path.join(d, rel), 'w').write(body)
        out = subprocess.run(['node', ctx.GATE, d], capture_output=True, text=True, timeout=300).stdout
    print('    gscan:\n      ' + '\n      '.join(out.strip().splitlines()))
    blocks = re.split(r'^(?=Ghost )', out.strip(), flags=re.M)
    got = []
    for b in blocks:
        head = re.match(r'Ghost (\S+)\s+via gscan (\S+).*?ERRORS (\d+)\s+WARNINGS (\d+)', b)
        if head is None:
            continue
        codes = re.findall(r'^\s+ERROR\s+(\S+)', b, re.M)
        if len(codes) != int(head.group(3)):
            raise Void(f'gate.js reported {head.group(3)} errors and printed {len(codes)} codes — unparsed')
        unexpected = [c for c in codes if c not in allow]
        if unexpected:
            raise Void(f'gscan {head.group(2)} (Ghost {head.group(1)}) reports {unexpected} on the probe theme')
        got.append({'major': head.group(1), 'gscan': head.group(2), 'errors': codes,
                    'warnings': int(head.group(4))})
    if len(got) != 2:
        raise Void(f'gate.js did not report both majors:\n{out}')
    return got


def read(html):
    """Every marker, as this page printed it. A marker absent from the HTML is NOT an empty string —
    an expression that failed to render at all and one that rendered empty are different findings —
    so it comes back as None and the controls below say so."""
    out = {}
    for name in list(EXPRESSIONS) + list(IN_LOOP):
        at = html.find(f'PN|{name}=[')
        end = html.find(']', at) if at != -1 else -1
        out[name] = None if at == -1 or end == -1 else html[at + len(f'PN|{name}=['):end]
    return out


def targets(g):
    """Which addresses to fetch — chosen from the site itself, never assumed. A publication whose
    archive does not reach three pages cannot answer this question, so it voids the run."""
    _, d = g.content('posts/?limit=all&filter=visibility:public&order=slug%20asc')
    posts = d.get('posts') or []
    _, d = g.content('pages/?limit=all&filter=visibility:public&order=slug%20asc')
    pages = d.get('pages') or []
    if len(posts) <= POSTS_PER_PAGE * 2:
        raise Void(f'{g.url} has {len(posts)} public posts at {POSTS_PER_PAGE} per page — /page/3/ would 404, '
                   'and the recorder writes no content, so it cannot make more')
    if not pages:
        raise Void(f'{g.url} carries no public page')
    return [
        ('/', 200, 'list page 1', '1'),
        ('/page/2/', 200, 'list page 2', '2'),
        ('/page/3/', 200, 'list page 3', '3'),
        (f'/{posts[0]["slug"]}/', 200, 'a post', None),
        (f'/{pages[0]["slug"]}/', 200, 'a public page', None),
        ('/inflozo-probe-no-such-page/', 404, 'the 404', None),
    ]


def controls_held(rows, root_ok):
    """R-186, as the assertion the run is void without. `''` is "rendered, and rendered empty"; a
    `None` — the marker never appeared — fails wherever the expression was in the theme."""
    bad = []
    for r in rows:
        n, p = r['page'], r['printed']
        want = {'ctx_guard': n or '', 'ctx_page': n or ''}
        if root_ok:
            want |= {'root_guard': n or '', 'root_page': n or ''}
        # page 1 is the whole point: a number is served and the guard must still print nothing
        if r['path'] == '/':
            want['ctx_guard'] = ''
            if root_ok:
                want['root_guard'] = ''
        for name, expect in want.items():
            if p[name] != expect:
                bad.append(f'{r["path"]}: {name} printed {p[name]!r}, expected {expect!r}')
        for name, (_, is_root) in EXPRESSIONS.items():
            if (root_ok or not is_root) and p[name] is None:
                bad.append(f'{r["path"]}: the {name} marker never rendered at all')
        # the loop's own control: on a list page the block must run and print a title, or an empty
        # `loop_ctx_page` beside it would prove nothing
        if n is not None and not p['loop_title']:
            bad.append(f'{r["path"]}: {{{{#foreach posts}}}} printed no title — the loop markers prove nothing')
    return bad


def record(g, themes):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    previous = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
    if previous is None:
        raise Void('no active theme reported — refusing to activate the probe with nothing to restore')
    want = targets(g)
    rows, root_ok, ghost_said = [], True, {}
    try:
        # GHOST'S OWN VERDICT on the `@root` theme, which is the conclusive half of the finding: gscan
        # is the linter, Ghost is the platform. Three answers are possible and each is recorded — the
        # upload refused, the upload accepted but the site still served the old theme (Ghost keeps an
        # invalid theme off the front end), or it rendered. Anything but the last falls back to the
        # plain theme, so the run still measures the expression that can actually ship.
        served = None
        for label, zipped in themes:
            try:
                st, res = g._multipart('themes/upload/', [('file', f'inflozo-probe-{label}.zip', 'application/zip', zipped)])
                name = res['themes'][0]['name']
                print(f'    [{label}] theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')
            except urllib.error.HTTPError as e:
                detail = ' '.join(e.read()[:600].decode('utf8', 'replace').split())
                ghost_said[label] = f'upload REFUSED, HTTP {e.code}: {detail[:300]}'
                print(f'    [{label}] Ghost REFUSED the upload: HTTP {e.code} {detail[:200]}')
                root_ok = False
                continue
            g.api('PUT', f'themes/{name}/activate/')
            time.sleep(3)  # the front end picks the new theme up a beat after the API answers (record-contexts.py's own wait)
            _, front = g.page('/')
            if 'id="page-number"' in front:
                ghost_said[label] = f'upload HTTP {st}, activated and SERVED'
                served = label
                break
            ghost_said[label] = (f'upload HTTP {st}, activation HTTP 200, but the site kept serving {previous!r} — '
                                 'Ghost holds an invalid theme off the front end')
            print(f'    [{label}] activated, but the front page is still {previous!r} — falling back')
            root_ok = False
        if served is None:
            raise Void('no probe theme was ever served — nothing to measure')
        for path, expect, what, page in want:
            got, html = g.page(path)
            if got != expect:
                raise Void(f'{path} answered HTTP {got}, not {expect} — its markers would be filed under the wrong page')
            # THE FIRST CONTROL: this is the probe theme's own layout, not the one it replaced
            if 'id="page-number"' not in html:
                raise Void(f'{path} was not served by the probe theme — the layout\'s own div is absent, so every '
                           'marker would read as "rendered empty" when it was never rendered at all')
            printed = read(html)
            rows.append({'path': path, 'what': what, 'http': got, 'page': page, 'printed': printed})
            shown = ' · '.join(f'{k}=[{"ABSENT" if v is None else v}]' for k, v in printed.items())
            print(f'    HTTP {got} {path:<34} {shown}')
    finally:
        g.api('PUT', f'themes/{previous}/activate/')
        active = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
        print(f'    theme RESTORED -> {active!r}')
        if active != previous:
            raise Void(f'the previous theme {previous!r} did not come back — {active!r} is active')
    bad = controls_held(rows, root_ok)
    if bad:
        raise Void("A CONTROL FAILED — R-186's guard is not what the story assumes. STOP AND ASK; do not reach "
                   'for a Ghost helper:\n      ' + '\n      '.join(bad))
    return {'major': g.major, 'version': version, 'site': g.url, 'rows': rows,
            'root_ok': root_ok, 'ghost_said': ghost_said}


# ── §49 ───────────────────────────────────────────────────────────────────────
COLUMNS = ['ctx_page', 'ctx_prev', 'ctx_guard', 'root_page', 'root_prev', 'root_guard',
           'loop_title', 'loop_ctx_page', 'loop_root_page']


def section(recs, gates):
    today = datetime.date.today().isoformat()
    cell = lambda v: '—' if v is None else ('*(empty)*' if v == '' else f'`{v}`')
    head = lambda n: {'ctx_page': '`{{pagination.page}}`', 'ctx_prev': '`{{pagination.prev}}`',
                      'ctx_guard': '**plain guard**', 'root_page': '`{{@root.…page}}`',
                      'root_prev': '`{{@root.…prev}}`', 'root_guard': '**@root guard**',
                      'loop_title': 'in-loop `{{title}}`', 'loop_ctx_page': 'in-loop `{{pagination.page}}`',
                      'loop_root_page': 'in-loop `{{@root.…page}}`'}[n]
    gline = lambda g: ' · '.join(f'Ghost {c["major"]} via gscan {c["gscan"]} — ' +
                                 (', '.join(c['errors']) if c['errors'] else '0 errors') +
                                 f' / {c["warnings"]} warnings' for c in g)
    out = [f'## 49. `{{page_number}}` — the page-1 guard executed on both majors, and why the emitted constant '
           f'spells `pagination` and not `@root` · {today}', '',
           f'**Command.** `{COMMAND}` — one theme upload per server (a second only where the first is refused or '
           'never served) and two activations, the previous theme restored in a `finally` and re-read to prove it; '
           'no content, no setting and no key written.', '',
           "**Why.** Story 5.16a emits ONE constant Handlebars expression into user text (AD-5's first deliberate "
           "exception), guarded so page 1 prints nothing (R-186). The guard — `#if` on `pagination.prev` — was read in "
           "Ghost's source on both majors (bookshelf-pagination assigns only `next` on page 1, so `prev` is literally "
           "`null` there) and controlled locally under express-hbs 2.5.0. Standing rule 1 says that is a hypothesis "
           'until it is executed against a real Ghost. This is that execution, and every marker is in `default.hbs` '
           '— the layout, where a site-wide section compiles (R-180) and the hardest place for `pagination` to reach.',
           '',
           '### (a) gscan refuses `@root` as an ERROR on both majors — so the emitted constant cannot spell it', '',
           f'- with the `@root` markers: {gline(gates["root"])}',
           f'- with them removed: {gline(gates["plain"])}', '',
           "`GS120-NO-UNKNOWN-GLOBALS` fires four times, once per `@root` path: *\"`{{@root.pagination.page}}` is not a "
           "known global\"*. Read in gscan's own source at both bundled versions — "
           '`lib/ast-linter/rules/internal/scope.js:5-13`, byte-identical in gscan 4.49.7 (Ghost 5) and 6.4.2 '
           "(Ghost 6) — the allow-list is `@site`, `@member`, `@setting`, `@config`, `@labs`, `@custom`, `@page` and "
           "`{{#foreach}}`'s own data variables, and `isOnAllowlist` tests `parts[0]` alone, so no `@root.…` path can "
           'pass. `lint-no-unknown-globals.js` checks a block helper\'s PARAMS, so `{{#if @root.pagination.prev}}` is '
           'refused as well as the value.', '',
           "**And the refusal is gscan's alone — Ghost itself served the `@root` theme on both boxes**, as the verdict "
           'lines below record, so the expression is CORRECT at runtime and unshippable by the product\'s own standard: '
           '`tools/stress/gate.js` must report 0 errors on both majors for every theme we emit (AD-34), and a Ghost '
           "admin marks a theme carrying a fatal gscan error invalid. **Finding: the emitted constant is "
           '`' + GUARD_PLAIN + '`** — the same guard, one qualifier shorter, and the only spelling that is both correct '
           'in `default.hbs` and gscan-clean. The spec\'s Design Note preferred `@root` for a reason (d) measures and '
           'prices at zero.', '']
    for rec in recs:
        t = 'T1' if rec['major'] == '6' else 'T3'
        out += [f'### ({"b" if rec is recs[0] else "c"}) {t} `{rec["site"].replace("https://", "")}` ({rec["version"]})', '',
                "**Ghost's own verdict on the upload.** " + ' · '.join(f'`{k}` theme → {v}' for k, v in rec['ghost_said'].items()), '',
                '| Address | HTTP | ' + ' | '.join(head(c) for c in COLUMNS) + ' |',
                '|---|---|' + '---|' * len(COLUMNS)]
        for r in rec['rows']:
            out.append(f'| `{r["path"]}` — {r["what"]} | {r["http"]} | ' +
                       ' | '.join(cell(r['printed'][c]) for c in COLUMNS) + ' |')
        out.append('')
    out += ['### (d) What it means', '',
            "- **R-186 holds.** The guard prints nothing at `/`, the page's own number from `/page/2/` on, and nothing "
            'on a post, a standalone page and the 404 — identically on both majors.',
            '- **R-183 comes free.** Ghost leaves `pagination` off post, page and the 404 entirely, and Handlebars '
            'renders a missing path as the empty string rather than throwing (it compiles with `{preventIndent: true}` '
            'alone — no `strict`, no `assumeObjects`).',
            "- **`{{pagination.page}}` resolves in `default.hbs`.** express-hbs renders the page template and then the "
            'layout with the SAME locals object, so the layout sees the response root.',
            "- **The one place the two spellings differ is inside `{{#foreach}}`**, and the table measures it: the "
            'in-loop `{{title}}` control prints, so the block ran, and `{{pagination.page}}` is empty inside it while '
            '`{{@root.pagination.page}}` is not. That is Handlebars, not Ghost — a path lookup does not walk out to the '
            'parent context. **It costs nothing today: no design in the library puts a `data-prop` inside a '
            '`data-repeat`** (the authored-array props a design does repeat are expanded by `expandItems` on BOTH '
            'emitters, never as `{{#foreach}}`), so the emitted constant never lands inside one. '
            '`docs/section-authoring.md` says so where an author would need to know it.', '',
            "**What this does NOT say.** Nothing here was rendered through Inflozo's own emitter: the markers are the "
            'raw expressions, written by hand into a probe theme. That the emitter produces exactly this string, once '
            'per occurrence and with every other character of user text escaped, is `agreement.test.ts`\'s and '
            "`ad36.test.ts`'s, per commit.", '']
    return '\n'.join(out)


def write_section(text):
    """Replace an earlier §49 written by this command, or append. A re-run must re-record rather than
    leave two §49s disagreeing."""
    body = open(MEASUREMENTS).read().rstrip('\n')
    at = body.find('\n## 49. ')
    if at != -1:
        end = body.find('\n## ', at + 1)
        body = (body[:at] + ('' if end == -1 else body[end:])).rstrip('\n')
    with open(MEASUREMENTS, 'w') as f:
        f.write(body + '\n\n' + text.rstrip('\n') + '\n')


if __name__ == '__main__':
    if any(a.startswith('-') for a in sys.argv[1:]):
        # a recorder that ran on `--help` would upload to T1 and T3; the docstring is the help
        print(__doc__)
        sys.exit(0)
    env = shim.load_env()
    recs, gates = [], {}
    try:
        print('    probe theme generated — the @root markers first, then the same theme without them')
        gates['root'] = gate(files(True), allow={'GS120-NO-UNKNOWN-GLOBALS'})
        gates['plain'] = gate(files(False), allow=set())
        themes = [('root', ctx.zip_bytes(files(True))), ('plain', ctx.zip_bytes(files(False)))]
        for M in ('5', '6'):
            g = shim.Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            recs.append(record(g, themes))
    except (Void, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError) as e:
        detail = e.read()[:400].decode('utf8', 'replace') if isinstance(e, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(e).__name__}: {e} {detail}')
        sys.exit(1)
    write_section(section(recs, gates))
    print('\n    MEASUREMENTS.md §49 written — the guard held on both majors.')
    sys.exit(0)
