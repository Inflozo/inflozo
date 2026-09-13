#!/usr/bin/env python3
"""AD-23's recorder for Story 4.4 — the style-guide body, as a real Ghost prints it, on both majors.

    python3 tools/probe/record-cards.py
    python3 tools/probe/record-cards.py --self-check   # offline: the refusals fire, no server touched

Writes `packages/library/orbit-weekly/fixtures/` and `packages/library/orbit-weekly/vendor/`:

  * fixtures/ghost{5,6}/capture.json   — the capture date, the command, the Ghost version, the Lexical
                                          renderer's package version, and the Content API's default
                                          limit and order per resource (the resolver's defaults are
                                          asserted against these, never restated)
  * fixtures/ghost{5,6}/article.json   — C4's readable article, split per block
  * fixtures/ghost{5,6}/variations.json — every variant in the corpus, split per block
  * fixtures/ghost{5,6}/page.json      — the same article body, created as a PAGE (fixture 3)
  * fixtures/variations.html           — the variation sheet as one labelled fragment (pinned target)
  * fixtures/index.ts                  — GENERATED import module, derived from what is on disk
  * vendor/cards/{css,js}/*            — Ghost's card chunks, verbatim, from the pinned target (T1)

WHY A REAL GHOST, NOT `render*Node` DIRECTLY (the spec's Design Notes). FR-H3 says the body is
"generated from Ghost's own renderers, never hand-written". Creating the corpus on T1 and T3 and reading
`html` back through the Content API produces those renderers' output with no `@tryghost/*` install —
and `post.html` is what `{{content}}` emits, so the recording is what Ghost actually PRINTS.

THE INPUT is `packages/library/orbit-weekly/corpus.json`: ONE corpus, rendered twice in one run, so
the article and the variation sheet can never come from different renderer versions (Q1, ruled).

WHAT IT WRITES TO THE SERVERS, and nothing else: three documents, found by slug and updated in place
on every later run — a post for the article, a post for the variation sheet, a page for fixture 3 —
PUBLISHED for the moment the Content API is read and returned to DRAFT in a `finally`, so no feed,
tag count or sitemap on either box carries them afterwards (the analogue of record-shim.py restoring
the previous theme). No image is uploaded: every URL in the corpus sits on the reserved origin
`https://orbit-weekly.example`, which Ghost does not rewrite. ONE setting is touched for the length of
the run and restored in a `finally`: `outbound_link_tagging` is switched off, because with it on Ghost
prints `?ref=<this box's host>` on every outbound link and the recording would carry the test
servers' hostnames into every customer's canvas (Story 4.4's review, 2026-09-13). The vendored
chunks and the renderer version are READ over SSH, the method `run-verify-a33-cards.py` uses.

THE CONTROL COMES FIRST AND VOIDS THE RUN (standing rule 2). The four root classes Ghost documents —
kg-image-card, kg-bookmark-card, kg-gallery-card, kg-toggle-card (MEASUREMENTS.md §35) — must come back
on BOTH majors. So must every block: a card Ghost has no renderer for is refused BY NAME before
anything is created, and a block that renders to nothing is refused rather than written as an empty
snapshot, because an empty snapshot reads as a passing test. Any failure on either major exits 1 having
written NOTHING — a recording from one box is worse than none.

R-66: Lexical only. The mobiledoc renderer is never exercised — the corpus is Lexical JSON.
"""
import os, re, sys, json, datetime, subprocess, importlib.util

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
OW = os.path.join(ROOT, 'packages', 'library', 'orbit-weekly')
FIXTURES = os.path.join(OW, 'fixtures')
VENDOR = os.path.join(OW, 'vendor', 'cards')
COMMAND = 'python3 tools/probe/record-cards.py'
CONTROL = ['kg-image-card', 'kg-bookmark-card', 'kg-gallery-card', 'kg-toggle-card']
PINNED = '6'   # the target the vendored chunks are read from — T1

# record-shim.py's client, env loader and JWT, imported rather than copied (one copy, two recorders)
_spec = importlib.util.spec_from_file_location('record_shim', os.path.join(HERE, 'record-shim.py'))
shim = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(shim)

HOSTS = {'6': ('ghost6.inflozo.com', '/var/www/ghost6/versions'),
         '5': ('ghost5.inflozo.com', '/var/www/ghost5/versions')}

# Lexical's own node types. Every other type in the corpus is a CARD and must have a renderer
# directory in the target's kg-default-nodes, or the recorder refuses by name.
TEXT_NODES = {'paragraph', 'extended-heading', 'extended-quote', 'extended-text', 'list', 'listitem',
              'link', 'linebreak'}
CARD_DIR = {'codeblock': 'codeblock', 'call-to-action': 'call-to-action', 'horizontalrule': 'horizontalrule'}

SLUGS = {'article': ('posts', 'inflozo-style-guide-article'),
         'variations': ('posts', 'inflozo-style-guide-variations'),
         'page': ('pages', 'inflozo-style-guide-page')}


class Void(Exception):
    """The run is void: nothing may be written."""


# ── what the renderer on each box is, read rather than assumed ───────────────
REMOTE = r'''
set -e
V=$(ls -dv {versions}/* | tail -1)
echo "VERSION=$(basename $V)"
D=$(find $V/node_modules -type d -name nodes -path "*kg-default-nodes*" 2>/dev/null | grep -vE "/es/|/esm/" | head -1)
P=$(dirname $(dirname $D))
[ -f "$P/package.json" ] || P=$(dirname $P)
echo "RENDERER=$(grep -m1 '"version"' $P/package.json | sed -E 's/.*"([0-9][^"]*)".*/\1/')"
for c in $(ls "$D"); do [ -d "$D/$c" ] && echo "NODE $c"; done
'''


def ssh(host, script):
    r = subprocess.run(['ssh', '-o', 'BatchMode=yes', '-o', 'ConnectTimeout=10', '-o', 'StrictHostKeyChecking=no',
                        f'root@{host}', 'bash -s'], input=script, capture_output=True, text=True, timeout=300)
    if r.returncode != 0:
        raise Void(f'ssh {host} failed: {r.stderr.strip()[-300:]}')
    return r.stdout


def renderer(major):
    host, versions = HOSTS[major]
    out = {'nodes': set()}
    for line in ssh(host, REMOTE.format(versions=versions)).splitlines():
        if line.startswith('VERSION='):
            out['ghost_install'] = line[8:]
        elif line.startswith('RENDERER='):
            out['renderer_version'] = line[9:]
        elif line.startswith('NODE '):
            out['nodes'].add(line[5:])
    if not out['nodes']:
        raise Void(f'Ghost {major}: no kg-default-nodes renderer directory found — the probe is reading the wrong thing')
    return out


def refuse_unrendered(corpus, nodes, major):
    """A card Ghost has no Lexical renderer for is refused BY NAME, before anything is created."""
    missing = sorted({v['node']['type'] for v in corpus['variants']
                      if v['node']['type'] not in TEXT_NODES
                      and CARD_DIR.get(v['node']['type'], v['node']['type']) not in nodes})
    if missing:
        raise Void(f'Ghost {major} has no Lexical renderer for: {", ".join(missing)} — remove it from corpus.json '
                   f'rather than record an empty snapshot')


# ── the two bodies, from one corpus ───────────────────────────────────────────
def blocks(corpus, which):
    by_id = {v['id']: v for v in corpus['variants']}
    if which == 'variations':
        return [{'id': v['id'], 'node': v['node']} for v in corpus['variants']]
    return [{'id': x, 'node': by_id[x]['node']} if isinstance(x, str) else {'id': None, 'node': x['text']}
            for x in corpus['article']]


def lexical(bs):
    return json.dumps({'root': {'children': [b['node'] for b in bs], 'direction': None, 'format': '',
                                'indent': 0, 'type': 'root', 'version': 1}})


# ── splitting Ghost's html per block, losslessly ──────────────────────────────
TOKEN = re.compile(r'<!--.*?-->|</[a-zA-Z][^>]*>|<[a-zA-Z](?:"[^"]*"|\'[^\']*\'|[^\'">])*>', re.S)
VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'source', 'track', 'wbr'}


def split(html):
    """Top-level fragments. Whitespace between two blocks travels with the block before it, and an HTML
    card's `<!--kg-card-begin: html-->…<!--kg-card-end: html-->` is one block, so `''.join()` of the
    result is the input byte for byte — asserted by the caller."""
    out, depth, start, group = [], 0, 0, False
    for m in TOKEN.finditer(html):
        t = m.group(0)
        if t.startswith('<!--'):
            if depth == 0 and 'kg-card-begin' in t:
                group = True
            elif depth == 0 and 'kg-card-end' in t:
                group = False
                out.append([start, m.end()])
                start = m.end()
            continue
        if t.startswith('</'):
            depth -= 1
        else:
            name = re.match(r'<([a-zA-Z0-9-]+)', t).group(1).lower()
            if name not in VOID and not t.endswith('/>'):
                depth += 1
        if depth == 0 and not group:
            out.append([start, m.end()])
            start = m.end()
    frags = [html[a:b] for a, b in out]
    if frags and start < len(html):
        frags[-1] += html[start:]   # trailing whitespace
    # leading whitespace before a fragment belongs to the previous one
    fixed = []
    for f in frags:
        lead = len(f) - len(f.lstrip())
        if fixed and lead:
            fixed[-1] += f[:lead]
            f = f[lead:]
        fixed.append(f)
    return fixed


def first_element(frag):
    m = re.search(r'<([a-zA-Z0-9-]+)((?:"[^"]*"|\'[^\']*\'|[^\'">])*)>', frag)
    if not m:
        return None, set()
    cls = re.search(r'\sclass="([^"]*)"', m.group(2))
    return m.group(1).lower(), set(cls.group(1).split()) if cls else set()


def check_block(major, which, i, b, frag, variant):
    tag, classes = first_element(frag)
    where = f'Ghost {major} {which} block {i} ({b["id"] or "text"})'
    if tag is None:
        raise Void(f'{where} rendered to nothing — refused rather than written as an empty snapshot')
    if variant is None:
        return
    if variant['root'] not in classes and variant['root'] != tag:
        raise Void(f'{where}: the root "{variant["root"]}" is not on its top-level element <{tag} class="{" ".join(sorted(classes))}">')
    all_classes = set(' '.join(re.findall(r'\sclass="([^"]*)"', frag)).split())
    missing = [c for c in variant['expect'] if c not in all_classes]
    if missing:
        raise Void(f'{where}: the variant exists to carry {missing} and Ghost printed none of them')


def control(blocks_, major):
    seen = set(' '.join(re.findall(r'\sclass="([^"]*)"', ''.join(b['html'] for b in blocks_))).split())
    missing = [c for c in CONTROL if c not in seen]
    if missing:
        raise Void(f'CONTROL FAILED on Ghost {major}: {missing} did not come back — the recording is reading the wrong thing')


def self_check():
    """Offline: the three refusals the spec's matrix names fire, and their neighbours do not."""
    def voids(fn, *a):
        try:
            fn(*a)
        except Void as e:
            return str(e)
        return None
    ok = [{'html': f'<figure class="{c}"></figure>'} for c in CONTROL]
    assert voids(control, ok, '6') is None
    assert 'kg-toggle-card' in voids(control, ok[:-1], '6')
    corpus = {'variants': [{'node': {'type': 'image'}}, {'node': {'type': 'nft'}}, {'node': {'type': 'paragraph'}}]}
    assert voids(refuse_unrendered, corpus, {'image'}, '5').endswith('rather than record an empty snapshot')
    assert 'nft' in voids(refuse_unrendered, corpus, {'image'}, '5')
    assert voids(refuse_unrendered, corpus, {'image', 'nft'}, '5') is None
    b, v = {'id': 'img'}, {'root': 'kg-image-card', 'expect': []}
    assert 'rendered to nothing' in voids(check_block, '6', 'article', 0, b, '  ', v)
    assert voids(check_block, '6', 'article', 0, b, '<figure class="kg-card kg-image-card"></figure>', v) is None
    html = '<p>a</p>\n<figure class="x"><img src="i"></figure><!--kg-card-begin: html--><div>h</div><!--kg-card-end: html-->'
    assert ''.join(split(html)) == html and len(split(html)) == 3
    print('self-check: control, unrendered-card and empty-block refusals fire; the lossless split holds')


# ── talking to one box ────────────────────────────────────────────────────────
def upsert_published(g, resource, slug, lex):
    try:
        cur = g.api('GET', f'{resource}/slug/{slug}/')[resource][0]
    except shim.urllib.error.HTTPError as e:
        if e.code != 404:
            raise
        cur = None
    body = {'title': f'Inflozo fixture — {slug}', 'slug': slug, 'lexical': lex, 'status': 'published',
            'visibility': 'public'}
    if cur:
        body['updated_at'] = cur['updated_at']
        return g.api('PUT', f'{resource}/{cur["id"]}/', {resource: [body]})[resource][0]
    return g.api('POST', f'{resource}/', {resource: [body]})[resource][0]


def to_draft(g, resource, doc_id):
    cur = g.api('GET', f'{resource}/{doc_id}/')[resource][0]
    if cur['status'] != 'draft':
        g.api('PUT', f'{resource}/{doc_id}/', {resource: [{'status': 'draft', 'updated_at': cur['updated_at']}]})


def setting(g, key):
    """One Ghost setting's current value, read through the Admin API. The whole list, then the key:
    `settings/?filter=key:…` is NOT honoured — executed 2026-09-13, it answered the full list and the
    first row (the site title) was written back as the restore value, refused with 422."""
    return next(s['value'] for s in g.api('GET', 'settings/')['settings'] if s['key'] == key)


def set_setting(g, key, value):
    g.api('PUT', 'settings/', {'settings': [{'key': key, 'value': value}]})


def api_defaults(g):
    """The Content API's own default LIMIT and ORDER per Source resource — no order and no limit passed,
    so what comes back is Ghost's default. The resolver's defaults are asserted against this."""
    out = {}
    for res, fields in (('posts', 'slug,published_at'), ('tags', 'slug,name'), ('authors', 'slug,name'),
                        ('tiers', 'slug,name,type,monthly_price')):
        st, d = g.content(f'{res}/?fields={fields}')
        if st != 200:
            raise Void(f'Ghost {g.major}: Content API {res}/ answered HTTP {st}')
        out[res] = {'limit': d['meta']['pagination']['limit'],
                    'rows': [{k: r.get(k) for k in fields.split(',')} for r in d[res]]}
    return out


def record(g, corpus):
    major = g.major
    print(f'\n{"=" * 72}\nGhost {major} — {g.url}\n{"=" * 72}')
    rend = renderer(major)
    print(f'    install {rend["ghost_install"]} · kg-default-nodes {rend["renderer_version"]} · {len(rend["nodes"])} renderer directories')
    refuse_unrendered(corpus, rend['nodes'], major)

    variants = {v['id']: v for v in corpus['variants']}
    bodies, docs = {}, []
    tagging = setting(g, 'outbound_link_tagging')
    set_setting(g, 'outbound_link_tagging', False)   # restored below, whatever happens in between
    try:
        for which, (resource, slug) in SLUGS.items():
            bs = blocks(corpus, 'variations' if which == 'variations' else 'article')
            doc = upsert_published(g, resource, slug, lexical(bs))
            docs.append((resource, doc['id']))
            st, d = g.content(f'{resource}/{doc["id"]}/')
            if st != 200:
                raise Void(f'Ghost {major}: Content API {resource}/{doc["id"]} answered HTTP {st}')
            html = d[resource][0]['html'] or ''
            frags = split(html)
            if ''.join(frags) != html:
                raise Void(f'Ghost {major} {which}: the split is not lossless — refusing to write a recording that is not Ghost\'s bytes')
            if len(frags) != len(bs):
                raise Void(f'Ghost {major} {which}: {len(bs)} blocks in, {len(frags)} top-level fragments out — a block '
                           f'rendered to nothing or to more than one element')
            for i, (b, f) in enumerate(zip(bs, frags)):
                check_block(major, which, i, b, f, variants.get(b['id']))
            bodies[which] = [{'id': b['id'], 'html': f} for b, f in zip(bs, frags)]
            print(f'    [{which}] {resource}/{slug} — {len(frags)} blocks, {len(html)} bytes')
    finally:
        # every restore is attempted, whichever fails: one failed draft must not leave the others
        # published, and a restore failure must not mask the Void that got us here
        failed = []
        for step, args in [(to_draft, (g, r, i)) for r, i in docs] + [(set_setting, (g, 'outbound_link_tagging', tagging))]:
            try:
                step(*args)
            except Exception as e:   # noqa: BLE001 — collected, reported, re-raised below
                failed.append(f'{step.__name__}{args[1:]}: {e}')
        print(f'    returned {len(docs)} documents to draft; outbound_link_tagging restored to {tagging}')
        if failed:
            raise Void(f'Ghost {major}: restore failed — {"; ".join(failed)} — put the box right by hand before re-running')
    # read AFTER the drafts are back, or the three fixture documents would sit in the recorded feed
    defaults = api_defaults(g)

    control(bodies['variations'], major)
    print(f'    control: all four documented root classes present')
    return {
        'capture': {
            'ghost_major': major, 'ghost_version': shim.read_version(g), 'ghost_install': rend['ghost_install'], 'site': g.url,
            # `nodes` is the renderer directory list itself, so "no Lexical NFT renderer on either
            # major" (DW-101) is a recorded fact a test reads, not a paraphrase (AD-23)
            'renderer': {'package': '@tryghost/kg-default-nodes', 'version': rend['renderer_version'],
                         'nodes': sorted(rend['nodes'])},
            'captured': datetime.date.today().isoformat(), 'command': COMMAND,
            'content_api_defaults': defaults,
            'note': 'AD-23: the style-guide body enters here. Every block is Ghost\'s own bytes, split per top-level '
                    'element; nothing in this directory is hand-written and nothing is normalised.',
        },
        **bodies,
    }


# ── the pinned target's chunks, verbatim ──────────────────────────────────────
def vendor():
    host, versions = HOSTS[PINNED]
    script = (f'set -e; V=$(ls -dv {versions}/* | tail -1); echo "VERSION=$(basename $V)"; cd $V/core/frontend/src/cards; '
              'for f in css/*.css js/*.js; do echo "@@FILE $f"; cat "$f"; echo; done; echo "@@FILE LICENSE"; cat $V/LICENSE')
    raw = ssh(host, script)
    version = re.search(r'^VERSION=(.+)$', raw, re.M).group(1)
    files = {}
    for part in raw.split('@@FILE ')[1:]:
        name, _, body = part.partition('\n')
        files[name.strip()] = body.removesuffix('\n')   # the `echo` after each `cat`, and nothing of the file's
    lic = files.pop('LICENSE')
    copyright_line = next(l for l in lic.splitlines() if l.startswith('Copyright'))
    if not any(n.startswith('js/') for n in files) or not any(n.startswith('css/') for n in files):
        raise Void('vendoring read no chunks — refusing to write an empty bundle')
    return version, copyright_line, lic, files


def write_vendor(version, copyright_line, lic, files):
    for name, body in sorted(files.items()):
        head = (f'/* Vendored verbatim from Ghost {version}, core/frontend/src/cards/{name}, by `{COMMAND}`.\n'
                f'   {copyright_line}. MIT licence — the full text is vendor/LICENSE-ghost.txt. */\n')
        os.makedirs(os.path.dirname(os.path.join(VENDOR, name)), exist_ok=True)
        with open(os.path.join(VENDOR, name), 'w') as f:
            f.write(head + body)   # verbatim: the file's own bytes end it, no newline of ours
    for sub in ('css', 'js'):
        prune(os.path.join(VENDOR, sub), {os.path.basename(n) for n in files if n.startswith(sub + '/')})
    with open(os.path.join(os.path.dirname(VENDOR), 'LICENSE-ghost.txt'), 'w') as f:
        f.write(lic if lic.endswith('\n') else lic + '\n')


def prune(d, keep):
    """A chunk or recording that no longer exists must not survive as a stale file — removed AFTER
    the new files are written, so a write that fails part-way leaves the previous tree, never an
    empty one (the library's static imports would break on an empty fixtures/ghost5/)."""
    for f in os.listdir(d) if os.path.isdir(d) else []:
        if f not in keep:
            os.remove(os.path.join(d, f))


# ── writing ───────────────────────────────────────────────────────────────────
def dump(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(obj, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write('\n')


def esc(s):
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;')


def write_sheet(corpus, rec):
    labels = {v['id']: v['label'] for v in corpus['variants']}
    parts = [f'<!-- GENERATED by `{COMMAND}` from Ghost {rec["capture"]["ghost_version"]} on '
             f'{rec["capture"]["captured"]} — do not edit by hand. The variation sheet (Q1): every variant in '
             f'corpus.json, labelled. Each label is ours; every byte between two labels is Ghost\'s. -->']
    for b in rec['variations']:
        parts.append(f'<p class="inflozo-variant" data-variant="{b["id"]}">{esc(labels[b["id"]])}</p>')
        parts.append(b['html'])
    with open(os.path.join(FIXTURES, 'variations.html'), 'w') as f:
        f.write('\n'.join(parts) + '\n')


def write_fixture_index():
    """record-shim.py's pattern: the import module is DERIVED from what is on disk (standing rule 4)."""
    found = []
    for major in sorted(os.listdir(FIXTURES)):
        d = os.path.join(FIXTURES, major)
        if os.path.isdir(d) and major.startswith('ghost'):
            found += [(major, f[:-5]) for f in sorted(os.listdir(d)) if f.endswith('.json')]
    ident = lambda m, t: (m + '_' + t).replace('-', '_')
    lines = [f'// GENERATED by `{COMMAND}` — do not edit by hand.', '//',
             '// The style-guide recordings, reachable from inside a core package: AD-1 bans `node:fs` there, so a',
             '// static import is the only door. Derived from what is on disk, so a recording added or removed',
             '// cannot go unasserted through a stale list.', '']
    lines += [f"import {ident(m, t)} from './{m}/{t}.json' with {{ type: 'json' }}" for m, t in found]
    lines += ['', f'export const CAPTURE_COMMAND = {json.dumps(COMMAND)}', '',
              'export const RECORDINGS: Readonly<Record<string, Readonly<Record<string, unknown>>>> = {']
    by = {}
    for m, t in found:
        by.setdefault(m, []).append(t)
    for m, ts in by.items():
        lines.append(f'  {m}: {{ ' + ', '.join(f'{json.dumps(t)}: {ident(m, t)}' for t in ts) + ' },')
    lines += ['}', '']
    with open(os.path.join(FIXTURES, 'index.ts'), 'w') as f:
        f.write('\n'.join(lines))
    return found


if __name__ == '__main__':
    if '--self-check' in sys.argv:
        self_check()
        sys.exit(0)
    env = shim.load_env()
    corpus = json.load(open(os.path.join(OW, 'corpus.json')))
    recs = {}
    try:
        for M in ('5', '6'):
            g = shim.Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            recs[M] = record(g, corpus)
            blob = json.dumps(recs[M])
            for k in ('CONTENT_API_KEY', 'STAFF_ACCESS_TOKEN'):   # a Void, not an assert: `python -O` strips asserts
                if env[f'GHOST{M}_{k}'] in blob:
                    raise Void(f'GHOST{M}_{k} reached a recording — refusing to write it')
        vendored = vendor()
    except (Void, shim.urllib.error.HTTPError, OSError, KeyError, subprocess.SubprocessError) as e:
        detail = e.read()[:400].decode('utf8', 'replace') if isinstance(e, shim.urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(e).__name__}: {e} {detail}')
        sys.exit(1)

    for M, rec in recs.items():
        d = os.path.join(FIXTURES, f'ghost{M}')
        dump(os.path.join(d, 'capture.json'), rec['capture'])
        for which in SLUGS:
            dump(os.path.join(d, f'{which}.json'), {'command': COMMAND, 'ghost_major': M, 'blocks': rec[which]})
        prune(d, {'capture.json', *(f'{w}.json' for w in SLUGS)})
    write_sheet(corpus, recs[PINNED])
    write_vendor(*vendored)
    found = write_fixture_index()
    print(f'\n    wrote {len(found)} recordings, variations.html and index.ts under packages/library/orbit-weekly/fixtures/')
    print(f'    vendored {len(vendored[3])} chunks from Ghost {vendored[0]} into packages/library/orbit-weekly/vendor/cards/')
    sys.exit(0)
