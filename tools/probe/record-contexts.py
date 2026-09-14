#!/usr/bin/env python3
"""AD-23's recorder for Story 4.6 — which Ghost field exists in which template, scope and version.

    python3 tools/probe/record-contexts.py            # record both servers and read Ghost's source
    python3 tools/probe/record-contexts.py --index    # regenerate fixtures/index.ts from disk only

FR-H7's matrix is `packages/library/contexts/matrix.json`. This script reads THOSE BYTES and proves
them, never the appendix's prose:

  1. It generates a probe theme FROM the matrix, in a temporary directory: per template and scope,
     every field — a value printed as `F<n>|path=[{{path}}]` beside its guard's truthiness
     (`{{#if path}}`, and `{{#if path includeZero=true}}` for a number), a list or an object as its
     truthiness and its first row's first field, a helper into its own raw block — plus the page's
     title through both `{{#post}}` and `{{#page}}`, a root `{{title}}` on index.hbs and post.hbs, and
     a misspelt field in every scope. It gates the theme through tools/stress/gate.js (0 errors on
     both majors) before anything is uploaded.
  2. On T1 (6.x) and T3 (5.x) it uploads and activates that theme with the staff token, fetches `/`,
     `/page/2/`, a post with a feature image and tags, a post without a feature image, the first public
     page, a tag archive, the archive of an author with no profile_image and a missing path, and
     restores the previous theme in a `finally` — then re-reads the active theme to prove it.
  3. It reads the whole Content API row of every resource a frame printed, one tier and one
     newsletter, and never writes the Content API key (a Void, not an assert: `python -O` strips asserts).
  4. It reads Ghost's own `public.js`, `default-settings.json` and the two template-options middleware
     files at every version gate in the matrix, at the published release before each, at the floor and
     at both servers' versions — through jsDelivr's npm mirror, each URL and sha256 recorded.

It refuses to write ANYTHING when a page other than the 404 is not 200, a control fails (the root
`{{title}}` on post.hbs prints empty while `{{#post}}{{title}}{{/post}}` beside it prints the title; a
misspelt field prints empty in every scope), gscan reports an error, or the previous theme did not
come back. What it writes to the servers is one theme upload and two activations — no content, no
setting, no private mode, no custom-template assignment (the story's Ask First boundary).

Writes packages/library/contexts/fixtures/ghost5.json, ghost6.json and ghost-source.json, each with
the capture date and this command, and the generated index.ts a core test imports them through; `packages/library/src/contexts.test.ts` asserts the matrix
against them per commit and offline.
"""
import os, re, sys, json, io, zipfile, hashlib, tempfile, subprocess, datetime, importlib.util, time
import urllib.request, urllib.error

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MATRIX = os.path.join(ROOT, 'packages', 'library', 'contexts', 'matrix.json')
OUT = os.path.join(ROOT, 'packages', 'library', 'contexts', 'fixtures')
GATE = os.path.join(ROOT, 'tools', 'stress', 'gate.js')
COMMAND = 'python3 tools/probe/record-contexts.py'
THEME_ZIP = 'inflozo-probe-contexts.zip'

# record-shim.py's client, env loader and JWT, imported rather than copied (one copy, three recorders)
_spec = importlib.util.spec_from_file_location('record_shim', os.path.join(HERE, 'record-shim.py'))
shim = importlib.util.module_from_spec(_spec)
_spec.loader.exec_module(shim)

VALUE_KINDS = {'text', 'url', 'image', 'color', 'date', 'number'}
MISSPELT = 'inflozo_no_such_field'
GHOST_FILES = {
    'public': 'core/shared/settings-cache/public.js',
    'defaults': 'core/server/data/schema/default-settings/default-settings.json',
    'global': 'core/frontend/services/theme-engine/middleware/update-global-template-options.js',
    'local': 'core/frontend/services/theme-engine/middleware/update-local-template-options.js',
}


class Void(Exception):
    """The run is void: nothing may be written."""


def mustache(expr):
    return '{{' + expr + '}}'


# ── the probe theme, generated from the matrix ────────────────────────────────
class Probe:
    def __init__(self, m):
        self.m = m
        self.frames = {}   # label -> {scope, via}

    def _label(self, scope, via):
        label = f'F{len(self.frames) + 1}'
        self.frames[label] = {'scope': scope, 'via': via}
        return label

    def frame(self, scope, via, depth=0):
        """Every field of `scope`, printed in the CURRENT Handlebars context."""
        L = self._label(scope, via)
        lines = [f'{L}|{MISSPELT}=[{mustache(MISSPELT)}]']
        for name, f in self.m['scopes'][scope].items():
            kind = f['kind']
            truth = f'{L}|{name}?if=[{mustache("#if " + name)}1{{{{else}}}}0{{{{/if}}}}]'
            if kind in VALUE_KINDS or kind == 'boolean':
                lines.append(f'{L}|{name}=[{mustache(name)}]')
                lines.append(truth)
                if kind == 'number':
                    lines.append(f'{L}|{name}?zero=[{mustache("#if " + name + " includeZero=true")}1{{{{else}}}}0{{{{/if}}}}]')
            elif kind == 'helper':
                lines.append(f'{L}|{name}?raw=[<!--RAW:{L}:{name}-->{mustache(name)}<!--/RAW:{L}:{name}-->]')
            elif kind in ('list', 'object'):
                # an object's truthiness through {{#with}}: gscan's GS001-DEPR-CON-AUTH is a regex that
                # reads `{{#if author}}` on author.hbs as the retired author context, an error on both majors
                lines.append(truth if kind == 'list' else f'{L}|{name}?if=[{mustache("#with " + name)}1{{{{else}}}}0{{{{/with}}}}]')
                of = f.get('of')
                if of is None or depth >= 4:
                    continue
                first = next(iter(self.m['scopes'][of]), None)
                opener = f'#foreach {name} limit="1"' if kind == 'list' else f'#with {name}'
                closer = '/foreach' if kind == 'list' else '/with'
                if first is not None:
                    lines.append(f'{L}|{name}?first=[{mustache(opener)}{mustache(first)}{mustache(closer)}]')
                lines.append(mustache(opener))
                lines.append(self.frame(of, via + [name], depth + 1))
                lines.append(mustache(closer))
        return '\n'.join(lines)

    def universal(self):
        lines = []
        for path, f in self.m['universal'].items():
            kind = f['kind']
            if path == 'content_api_key':
                continue  # FR-H5: a real key never reaches a recording; the shim's contract test owns its shape
            if kind == 'helper':
                lines.append(f'U|{path}?raw=[<!--RAW:U:{path}-->{mustache(path)}<!--/RAW:U:{path}-->]')
                continue
            if kind != 'list':
                lines.append(f'U|{path}=[{mustache(path)}]')
            lines.append(f'U|{path}?if=[{mustache("#if " + path)}1{{{{else}}}}0{{{{/if}}}}]')
            of = f.get('of')
            if kind == 'list' and of is not None:
                lines.append(mustache(f'#foreach {path} limit="1"'))
                lines.append(self.frame(of, [path], 1))
                lines.append(mustache('/foreach'))
        return '\n'.join(lines)

    def template(self, target):
        t = self.m['targets'][target]
        top, block = t['top'], t.get('block')
        if block is None:
            return self.frame(top, [])
        # the template opens the block ONCE around every section (FR-H7, §7.4) — the matrix names it
        body = [f'C|{target}_root_title=[{mustache("title")}]',
                mustache('#' + block),
                f'C|{target}_block_title=[{mustache("title")}]',
                self.frame(self.m['scopes'][top][block]['of'], [block]),
                mustache('/' + block)]
        if 'page' in self.m['scopes'][top]:
            body.append(f'C|{target}_post_title=[{mustache("#post")}{mustache("title")}{mustache("/post")}]')
            body.append(f'C|{target}_page_title=[{mustache("#page")}{mustache("title")}{mustache("/page")}]')
        return '\n'.join(body)

    def files(self):
        wrap = lambda s: f'{{{{!< default}}}}\n<div id="probe">\n{s}\nEND|end=[]\n</div>\n'
        # the two {{#get}}-only resources, on the home page only: posts, tags and authors share their row
        # scope with the native contexts recorded above, and a {{#get}} on error.hbs is R-7's refusal
        gets = []
        for source in ('tiers', 'newsletters'):
            include = ' include="monthly_price,yearly_price,benefits"' if source == 'tiers' else ''
            gets += [mustache(f'#get "{source}" limit="1"{include}'), mustache(f'#foreach {source}'),
                     self.frame(self.m['get'][source], [f'#get {source}']), mustache('/foreach'), mustache('/get')]
        return {
            'default.hbs': ('<!DOCTYPE html>\n<html lang="{{@site.locale}}"><head><meta charset="utf-8">\n'
                            '<title>{{meta_title}}</title>\n<link rel="stylesheet" href="{{asset "css/screen.css"}}">'
                            '{{ghost_head}}</head>\n<body class="{{body_class}}">\n<div id="universal">\n'
                            + self.universal() + '\n</div>\n{{{body}}}\n{{ghost_foot}}</body></html>\n'),
            'home.hbs': wrap(self.template('home.hbs') + '\n' + '\n'.join(gets)),
            'index.hbs': wrap(f'C|index.hbs_root_title=[{mustache("title")}]\n' + self.template('index.hbs')),
            'post.hbs': wrap(self.template('post.hbs')),
            'page.hbs': wrap(self.template('page.hbs')),
            'tag.hbs': wrap(self.template('tag.hbs')),
            'author.hbs': wrap(self.template('author.hbs')),
            'error.hbs': wrap(self.template('error.hbs')),
            'assets/css/screen.css': ('body { font-family: system-ui, sans-serif; }\n'
                                      '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\n'),
            'package.json': json.dumps({
                'name': 'inflozo-probe-contexts',
                'description': "AD-23 recording surface for Story 4.6's Template Context Matrix",
                'version': '1.0.0', 'engines': {'ghost': '>=5.0.0'}, 'license': 'MIT',
                'keywords': ['ghost', 'theme', 'ghost-theme'],
                'author': {'name': 'Inflozo', 'email': 'hello@inflozo.com'},
                'config': {'posts_per_page': 12, 'card_assets': True},
            }, indent=2) + '\n',
        }


def gate(files):
    """gscan on both majors through the stress harness's own pairing. The errors are parsed from its
    text; a count that did not parse is a failure, never a pass (standing rule 2)."""
    with tempfile.TemporaryDirectory() as d:
        for rel, body in files.items():
            os.makedirs(os.path.dirname(os.path.join(d, rel)), exist_ok=True)
            open(os.path.join(d, rel), 'w').write(body)
        out = subprocess.run(['node', GATE, d], capture_output=True, text=True, timeout=300).stdout
    counts = re.findall(r'^Ghost (\S+)\s+via gscan (\S+).*?ERRORS (\d+)\s+WARNINGS (\d+)', out, re.M)
    print('    gscan:\n      ' + '\n      '.join(out.strip().splitlines()))
    if len(counts) != 2:
        raise Void(f'gate.js did not report both majors:\n{out}')
    for major, version, errors, _ in counts:
        if int(errors) != 0:
            raise Void(f'gscan {version} (Ghost {major}) reports {errors} error(s) on the probe theme')
    return [{'major': a, 'gscan': b, 'errors': int(c), 'warnings': int(w)} for a, b, c, w in counts]


def zip_bytes(files):
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED) as z:
        for rel, body in sorted(files.items()):
            z.writestr(rel, body)
    return buf.getvalue()


# ── reading a rendered page back ──────────────────────────────────────────────
RAW_RE = re.compile(r'<!--RAW:(U|F\d+):([^>]+?)-->(.*?)<!--/RAW:\1:\2-->', re.S)
LINE_RE = re.compile(r'^(U|C|F\d+|END)\|([^=\s]+)=\[(.*?)\][ \t]*$(?=\s*(?:(?:U|C|F\d+|END)\|[^=\s]+=\[|</div>|\Z))',
                     re.S | re.M)


def parse(html, probe):
    raws = {}
    for m in RAW_RE.finditer(html):
        raws[(m.group(1), m.group(2))] = m.group(3)
    html = RAW_RE.sub('', html)
    frames, universal, controls = {}, {}, {}
    for m in LINE_RE.finditer(html):
        label, key, value = m.group(1), m.group(2), m.group(3)
        name, _, facet = key.partition('?')
        if label == 'END':
            continue
        if label == 'C':
            controls[name] = value
            continue
        if facet == 'raw':
            text = raws.get((label, name), '')
            value = {'length': len(text), 'head': text[:160]}
        target = universal if label == 'U' else frames.setdefault(label, dict(probe.frames[label], fields={}))['fields']
        target.setdefault(name, {})['printed' if facet == '' else facet] = value
    return frames, universal, controls


def choose(g):
    """Which resources to render — chosen from the site itself, never assumed, and recorded."""
    _, d = g.content('posts/?limit=all&include=tags,authors&filter=visibility:public&order=slug%20asc')
    posts = d.get('posts') or []
    with_image = next((p for p in posts if p.get('feature_image') and p.get('tags')), None)
    without = next((p for p in posts if not p.get('feature_image')), None)
    _, d = g.content('pages/?limit=all&filter=visibility:public&order=slug%20asc')
    page = (d.get('pages') or [None])[0]
    _, d = g.content('tags/?limit=all&include=count.posts&filter=visibility:public&order=slug%20asc')
    tag = next((t for t in d.get('tags') or [] if t.get('count', {}).get('posts')), None)
    _, d = g.content('authors/?limit=all&order=slug%20asc')
    author = next((a for a in d.get('authors') or [] if not a.get('profile_image')), None)
    for what, row in (('a post with a feature image and tags', with_image), ('a post without a feature image', without),
                      ('a public page', page), ('a tag with posts', tag), ('an author with no profile_image', author)):
        if row is None:
            raise Void(f'{g.url} carries no {what} — the recorder writes no content, so it cannot make one')
    return [
        ('home.hbs', '/'),
        ('index.hbs', '/page/2/'),
        ('post.hbs', f'/{with_image["slug"]}/'),
        ('post.hbs', f'/{without["slug"]}/'),
        ('page.hbs', f'/{page["slug"]}/'),
        ('tag.hbs', f'/tag/{tag["slug"]}/'),
        ('author.hbs', f'/author/{author["slug"]}/'),
        ('error.hbs', '/inflozo-probe-no-such-page/'),
    ]


def api_rows(g, frames):
    """The whole Content API row behind every frame that printed an id."""
    rows = {}
    _, tiers = g.content('tiers/?limit=all&include=monthly_price,yearly_price,benefits')
    _, letters = g.content('newsletters/?limit=all')
    lists = {'tier': tiers.get('tiers') or [], 'newsletter': letters.get('newsletters') or []}
    for fr in frames:
        rid = fr['fields'].get('id', {}).get('printed', '')
        scope = fr['scope']
        if rid == '' or f'{scope}:{rid}' in rows:
            continue
        if scope == 'post':
            st, d = g.content(f'posts/{rid}/?include=tags,authors')
            if st == 404:
                st, d = g.content(f'pages/{rid}/?include=tags,authors')
            row = (d.get('posts') or d.get('pages') or [None])[0]
        elif scope in ('tag', 'author'):
            st, d = g.content(f'{scope}s/{rid}/')
            row = (d.get(f'{scope}s') or [None])[0]
        elif scope in lists:
            row = next((r for r in lists[scope] if r.get('id') == rid), None)
        else:
            continue
        if row is None:
            raise Void(f'no Content API row for the {scope} {rid} a frame printed')
        rows[f'{scope}:{rid}'] = row
    return rows


def controls_held(pages):
    """Standing rule 2: a control that did not pass voids the run."""
    failures = []
    for p in pages:
        c = p['controls']
        t = p['template']
        if t == 'post.hbs':
            if c.get('post.hbs_root_title', None) != '':
                failures.append(f'{p["path"]}: the root {{{{title}}}} on post.hbs printed {c.get("post.hbs_root_title")!r}')
            if not c.get('post.hbs_block_title'):
                failures.append(f'{p["path"]}: {{{{#post}}}}{{{{title}}}}{{{{/post}}}} printed nothing')
        if t == 'page.hbs' and (not c.get('page.hbs_post_title') or c.get('page.hbs_post_title') != c.get('page.hbs_page_title')):
            failures.append(f'{p["path"]}: the page title through {{{{#post}}}} and {{{{#page}}}} is not the same non-empty text')
        if t == 'index.hbs' and c.get('index.hbs_root_title', None) != '':
            failures.append(f'{p["path"]}: the root {{{{title}}}} on index.hbs printed {c.get("index.hbs_root_title")!r}')
        for label, fr in p['frames'].items():
            if fr['fields'].get(MISSPELT, {}).get('printed', None) != '':
                failures.append(f'{p["path"]}: the misspelt field printed something in {label} ({fr["scope"]})')
        if t != 'error.hbs' and not p['frames']:
            failures.append(f'{p["path"]}: no frame printed at all')
    return failures


def record(g, probe, zipped):
    print(f'\n{"=" * 72}\nGhost {g.major} — {g.url}\n{"=" * 72}')
    version = g.api('GET', 'config/')['config']['version']
    themes = g.api('GET', 'themes/')['themes']
    previous = next((t['name'] for t in themes if t.get('active')), None)
    if previous is None:
        raise Void('no active theme reported — refusing to activate the probe with nothing to restore')
    targets = choose(g)
    st, res = g._multipart('themes/upload/', [('file', THEME_ZIP, 'application/zip', zipped)])
    name = res['themes'][0]['name']
    print(f'    theme uploaded HTTP {st} -> {name!r} (previous active: {previous!r})')
    pages = []
    try:
        g.api('PUT', f'themes/{name}/activate/')
        time.sleep(2)
        for template, path in targets:
            st, html = g.page(path)
            want = 404 if template == 'error.hbs' else 200
            if st != want:
                raise Void(f'{path} answered HTTP {st}, not {want} — its frames would be filed under the wrong template')
            frames, universal, controls = parse(html, probe)
            pages.append({'template': template, 'path': path, 'http': st, 'frames': frames,
                          'universal': universal, 'controls': controls})
            print(f'    [{template}] HTTP {st} {path} — {len(frames)} frames, {len(universal)} universal, {len(controls)} controls')
    finally:
        g.api('PUT', f'themes/{previous}/activate/')
        active = next((t['name'] for t in g.api('GET', 'themes/')['themes'] if t.get('active')), None)
        print(f'    theme RESTORED -> {active!r}')
        if active != previous:
            raise Void(f'the previous theme {previous!r} did not come back — {active!r} is active')
    failures = controls_held(pages)
    if failures:
        raise Void('a control failed:\n      ' + '\n      '.join(failures))
    frames = [fr for p in pages for fr in p['frames'].values()]
    return {
        'captured': datetime.date.today().isoformat(),
        'command': COMMAND,
        'ghost_major': g.major,
        'ghost_version': version,
        'site': g.url,
        'note': 'AD-23: what a real Ghost printed for every field of FR-H7\'s matrix, per template and scope. '
                'Frames are the probe theme\'s own blocks: `scope` names the matrix scope, `via` the path '
                'that opened it, and each field carries what it printed, its {{#if}} truthiness, the '
                'includeZero=true truthiness for a number, and a list or object\'s first row.',
        'pages': pages,
        'api': api_rows(g, frames),
    }


# ── Ghost's own source, at every gate ─────────────────────────────────────────
def fetch(url, headers=None):
    req = urllib.request.Request(url, headers=headers or {'User-Agent': 'inflozo-probe'})
    with urllib.request.urlopen(req, timeout=90) as r:
        return r.read()


def site_keys(kind, text):
    """The `@site` keys one file contributes. public.js is the allow-list (each key at a line start);
    the two middleware files add the computed ones."""
    if kind == 'public':
        return sorted(set(re.findall(r'^\s*([a-z_]+)\s*:', text, re.M)))
    if kind == 'defaults':
        return sorted({k for group in json.loads(text).values() for k in group})
    keys = set(re.findall(r'siteData\.(\w+)\s*=', text))
    for block in re.findall(r'(?:const siteData = |site:\s*)\{(.*?)\n\s*\}', text, re.S):
        keys.update(re.findall(r'^\s*(\w+)\s*:', block, re.M))
    return sorted(keys)


def read_source(m, server_versions):
    registry = 'https://registry.npmjs.org/ghost'
    listing = json.loads(fetch(registry, {'Accept': 'application/vnd.npm.install-v1+json', 'User-Agent': 'inflozo-probe'}))
    parse_v = lambda v: tuple(int(x) for x in v.split('.'))
    released = sorted((v for v in listing['versions'] if re.fullmatch(r'\d+\.\d+\.\d+', v)), key=parse_v)
    gates = sorted({f['since'] for f in m['universal'].values() if 'since' in f}, key=parse_v)
    versions = {m['floor'], *server_versions}
    before = {}
    for since in gates:
        if since not in released:
            raise Void(f'the matrix gates a key at {since}, which npm never published')
        before[since] = released[released.index(since) - 1]
        versions.update({since, before[since]})
    out = {}
    for v in sorted(versions, key=parse_v):
        out[v] = {}
        for kind, rel in GHOST_FILES.items():
            url = f'https://cdn.jsdelivr.net/npm/ghost@{v}/{rel}'
            body = fetch(url)
            out[v][kind] = {'url': url, 'sha256': hashlib.sha256(body).hexdigest(),
                            'keys': site_keys(kind, body.decode('utf8'))}
        print(f'    ghost@{v}: public.js {len(out[v]["public"]["keys"])} keys')
    return {
        'captured': datetime.date.today().isoformat(),
        'command': COMMAND,
        'registry': registry,
        'note': 'Ghost\'s own source at the floor, both servers\' versions, every gate in matrix.json and the '
                'published release before each. `keys` are the @site keys public.js allow-lists (each line-start '
                'key), the setting keys default-settings.json declares, and the keys the two template-options '
                'middleware files add to @site.',
        'floor': m['floor'],
        'servers': sorted(server_versions, key=parse_v),
        'before': before,
        'versions': out,
    }


def write_index():
    """record-shim.py's pattern: the import module a core test reads is DERIVED from what is on disk
    (standing rule 4), because AD-1 bans `node:fs` and a dynamic import there. A recording absent from
    disk is absent from the module, and the test refuses by name, naming this command."""
    names = sorted(f[:-5] for f in os.listdir(OUT) if f.endswith('.json')) if os.path.isdir(OUT) else []
    ident = lambda n: n.replace('-', '_')
    lines = [f'// GENERATED by `{COMMAND}` — do not edit by hand.', '//',
             '// FR-H7\'s recordings, reachable from inside a core package: AD-1 bans `node:fs` there, so a static',
             '// import is the only door. Derived from what is on disk, so a recording removed cannot go unasserted',
             '// through a stale list — `contexts.test.ts` refuses by name when one is absent.', '']
    lines += [f"import {ident(n)} from './{n}.json' with {{ type: 'json' }}" for n in names]
    lines += ['', f'export const CAPTURE_COMMAND = {json.dumps(COMMAND)}', '',
              'export const RECORDINGS: Readonly<Record<string, unknown>> = {']
    lines += [f'  {json.dumps(n)}: {ident(n)},' for n in names]
    lines += ['}', '']
    os.makedirs(OUT, exist_ok=True)
    with open(os.path.join(OUT, 'index.ts'), 'w') as f:
        f.write('\n'.join(lines))
    return names


def dump(path, body):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        json.dump(body, f, indent=2, sort_keys=True)
        f.write('\n')


if __name__ == '__main__':
    if '--index' in sys.argv:
        # regenerate the import module from what is on disk, touching no server — the control for a
        # missing recording is to move one aside and run this
        print(f'    fixtures/index.ts over {write_index()}')
        sys.exit(0)
    env = shim.load_env()
    m = json.load(open(MATRIX))
    probe = Probe(m)
    files = probe.files()
    recs = {}
    try:
        print(f'    probe theme generated from packages/library/contexts/matrix.json: {len(probe.frames)} frames')
        gscan = gate(files)
        zipped = zip_bytes(files)
        for M in ('5', '6'):
            g = shim.Ghost(env[f'GHOST{M}_URL'], env[f'GHOST{M}_STAFF_ACCESS_TOKEN'], M, env[f'GHOST{M}_CONTENT_API_KEY'])
            recs[M] = record(g, probe, zipped)
            recs[M]['gscan'] = gscan
            blob = json.dumps(recs[M])
            for k in ('CONTENT_API_KEY', 'STAFF_ACCESS_TOKEN', 'ADMIN_API_KEY'):
                if env.get(f'GHOST{M}_{k}') and env[f'GHOST{M}_{k}'] in blob:
                    raise Void(f'GHOST{M}_{k} reached a recording — refusing to write it')
        source = read_source(m, [recs[M]['ghost_version'] for M in recs])
    except (Void, urllib.error.HTTPError, urllib.error.URLError, OSError, KeyError, subprocess.SubprocessError) as e:
        detail = e.read()[:400].decode('utf8', 'replace') if isinstance(e, urllib.error.HTTPError) else ''
        print(f'\n  ** RUN VOID — nothing written. {type(e).__name__}: {e} {detail}')
        sys.exit(1)
    for M, rec in recs.items():
        dump(os.path.join(OUT, f'ghost{M}.json'), rec)
    dump(os.path.join(OUT, 'ghost-source.json'), source)
    write_index()
    print(f'\n    wrote ghost5.json, ghost6.json, ghost-source.json and index.ts to packages/library/contexts/fixtures/')
    sys.exit(0)
