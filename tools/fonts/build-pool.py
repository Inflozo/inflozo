#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["fonttools==4.60.1", "brotli==1.1.0"]
# ///
"""Story 6.2 — THE FONT POOL, BUILT ONCE (PRD Appendix D §D.a–§D.c).

    uv run tools/fonts/build-pool.py 2>&1 | cat        # (the pipe: this machine's snap `uv` prints nothing without one)

`--self-check` (offline, no fontTools, in `pnpm test`) feeds the refusals synthetic upstream records and asserts each
one fires and the legitimate case still builds. Otherwise no flags. Its one input is Appendix D §D.c itself — the thirty rows are read out of `prd.md`, never typed again here —
and every font file comes from github.com/google/fonts at ONE pinned commit (`COMMIT` below). For each family it reads
the upstream `METADATA.pb`, the licence text and the declared TTFs, and it REFUSES, naming the family and the
difference, with nothing written:

  - a licence that is not OFL or Apache 2.0 (§D.a rule 7);
  - a face whose type or weights differ from §D.c — a `V` family that is static upstream, a declared weight or range
    upstream does not have, a static family whose declared weight has no static file (§D.c is never changed to fit:
    Story 6.2's Ask First);
  - a pairing whose built faces differ from §D.c's Files column, or whose same-family heading the body does not cover.

Then, per face: a variable face has every non-`wght` axis pinned at its design default and `wght` clipped to the
declared range with fontTools' instancer (§D.a rule 4 — Google's own CSS2 API never clips, executed at Create); a static
face is the declared weight's file. Each face is subset to `latin` and `latin-ext` with the `unicode-range`s
`apps/web/app/fonts/fonts.css` carries (Google's own, word for word), every layout feature kept (§D.b: by script range,
never by content) and TrueType hinting dropped (§D.a rule 5), and written as woff2 with no timestamp recalculated — so a
second run is byte-identical. Into
`packages/library/fonts/`: `files/*.woff2` (a file nothing declares is removed), `licences/<family>.txt`, and
`pool.json`, the record of every file with its bytes and sha256, each face's cap height (OS/2) and `tnum`, each family's
licence and CSS fallback, and the commit. `tools/stress/test-vocabulary.mjs` holds pool.json to §D.c and every file to
its sha256 in CI. One step builds the canvas's files and the theme's (§D.b).

Downloads are kept under `$XDG_CACHE_HOME/inflozo-fonts/<commit>/` (default `~/.cache`), so a re-run reads no network.
"""
import hashlib
import io
import json
import os
import re
import sys
import urllib.error
import urllib.request

try:
    from fontTools import subset
    from fontTools.pens.boundsPen import BoundsPen
    from fontTools.ttLib import TTFont
    from fontTools.varLib import instancer
except ImportError:  # the refusals need none of it, so `--self-check` runs under CI's bare python3
    if '--self-check' not in sys.argv:
        raise

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PRD = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'prds', 'prd-Inflozo-2026-08-17', 'prd.md')
APP_FONTS = os.path.join(ROOT, 'apps', 'web', 'app', 'fonts', 'fonts.css')
OUT = os.path.join(ROOT, 'packages', 'library', 'fonts')

# google/fonts `main` on 2026-10-03 (`git ls-remote https://github.com/google/fonts refs/heads/main`). Moving it is a
# rebuild, a new pool.json and a mass rebaseline of the render matrix — never a quiet edit.
COMMIT = '9710da1eacb3be272583c3224dcb70f9da6eadbb'
RAW = f'https://raw.githubusercontent.com/google/fonts/{COMMIT}'
LICENCES = {'OFL': ('ofl', 'OFL.txt'), 'APACHE2': ('apache', 'LICENSE.txt')}
SUBSETS = ('latin', 'latin-ext')
# METADATA.pb's category → the CSS generic a family list falls back to. ponytail: DISPLAY → sans-serif because both
# DISPLAY families in the pool (Syne, Anton) are sans faces; a serif display family would need its own word.
GENERIC = {'SERIF': 'serif', 'SANS_SERIF': 'sans-serif', 'MONOSPACE': 'monospace', 'DISPLAY': 'sans-serif', 'HANDWRITING': 'cursive'}

# A §D.c `S` face whose family google/fonts now publishes as a variable file only. The builder refuses that by default
# (the type differs from §D.c); a family named here is cut as a STATIC instance at its declared weight instead — the
# one file §D.c describes. Each entry is an owner's ruling, never a convenience. ponytail: one entry, one question.
STATIC_CUTS = {
    # R-235 (owner, 2026-10-03, Story 6.2's Dev, Question 5, option 1): Libre Caslon Text is `LibreCaslonText[wght].ttf`, 400–700, at
    # COMMIT; §D.c declares `S · 700`. Remove this line and the builder refuses D2 again.
    'Libre Caslon Text': 'Story 6.2 Question 5',
}


class Refused(Exception):
    pass


# ── §D.c, read out of the PRD ──────────────────────────────────────────────────────────────────────────────────────
def pool_rows(prd):
    start = prd.find('\n### D.c ')
    end = prd.find('\n### ', start + 1)
    if start < 0:
        raise Refused('prd.md has no "### D.c" heading — the pool cannot be read')
    section = prd[start:end if end > 0 else None]
    rows = []
    for line in section.splitlines():
        cells = [c.strip() for c in line.split('|')[1:-1]]
        if len(cells) == 7 and re.fullmatch(r'D\d+', cells[0]):
            rows.append(cells)
    if not rows:
        raise Refused('§D.c parsed as an empty table')
    return rows


def face_cell(cell, role):
    """`V · wght 500–800 (…)`, `V · wght 400–700 + italic`, `V · wght 400–900 + italic wght 400–700`, `S · 700`,
    `S · 400, 700, 400i, 700i` → the declaration."""
    text = cell.replace('`', '').replace('–', '-')
    kind = text[:1]
    if kind == 'V':
        ranges = [(int(a), int(b)) for a, b in re.findall(r'wght (\d+)-(\d+)', text)]
        if not ranges:
            raise Refused(f'{cell!r}: a variable face with no wght range')
        italic = '+ italic' in text
        if role == 'body' and not italic:
            raise Refused(f'{cell!r}: a body face without its italic (§D.a rule 2)')
        out = {'type': 'V', 'range': list(ranges[0])}
        if italic:
            out['italic'] = list(ranges[1] if len(ranges) > 1 else ranges[0])
        return out
    if kind == 'S':
        weights = re.findall(r'\d+i?', text.split('·', 1)[1])
        if not weights:
            raise Refused(f'{cell!r}: a static face with no weight')
        return {'type': 'S', 'weights': weights}
    raise Refused(f'{cell!r}: neither V nor S')


def subset_ranges():
    css = open(APP_FONTS, encoding='utf8').read()
    out = {}
    for name in SUBSETS:
        m = re.search(r'/\* ' + re.escape(name) + r' \*/\s*@font-face\s*\{[^}]*?unicode-range:\s*([^;]+);', css)
        if not m:
            raise Refused(f'apps/web/app/fonts/fonts.css carries no /* {name} */ face to read its unicode-range from')
        out[name] = m.group(1).strip()
    return out


def unicodes(ranges):
    out = set()
    for part in ranges.split(','):
        lo, _, hi = part.strip().removeprefix('U+').partition('-')
        out.update(range(int(lo, 16), int(hi or lo, 16) + 1))
    return out


# ── upstream ───────────────────────────────────────────────────────────────────────────────────────────────────────
CACHE = os.path.join(os.environ.get('XDG_CACHE_HOME') or os.path.expanduser('~/.cache'), 'inflozo-fonts', COMMIT)


def fetch(path):
    local = os.path.join(CACHE, path)
    if os.path.exists(local):
        return open(local, 'rb').read()
    url = f'{RAW}/{urllib.request.quote(path)}'
    try:
        with urllib.request.urlopen(url, timeout=60) as r:
            body = r.read()
    except urllib.error.HTTPError as e:  # a 404 is a missing file, which the caller names; a network fault is itself
        if e.code != 404:
            raise
        raise FileNotFoundError(f'{url}: {e}') from None
    os.makedirs(os.path.dirname(local), exist_ok=True)
    with open(local + '.part', 'wb') as f:  # renamed whole, so an interrupted download is never read as upstream
        f.write(body)
    os.replace(local + '.part', local)
    return body


def dir_name(family):
    return re.sub(r'[^a-z0-9]', '', family.lower())


def slug(family):
    return re.sub(r'[^a-z0-9]+', '-', family.lower()).strip('-')


def metadata(family):
    for licence, (top, _) in LICENCES.items():
        try:
            pb = fetch(f'{top}/{dir_name(family)}/METADATA.pb').decode('utf8')
            return top, pb
        except FileNotFoundError:
            continue
    # not under ofl/ or apache/: the only other homes (ufl/) hold licences the pool refuses
    raise Refused(f'{family}: no METADATA.pb under ofl/ or apache/ at {COMMIT[:12]} — not an OFL or Apache 2.0 family')


def read_metadata(family):
    top, pb = metadata(family)
    name = re.search(r'^name: "([^"]+)"', pb, re.M).group(1)
    if name != family:
        raise Refused(f'{family}: upstream METADATA.pb names it "{name}"')
    licence = re.search(r'^license: "([^"]+)"', pb, re.M).group(1)
    if licence not in LICENCES:
        raise Refused(f'{family}: licence {licence}, which is neither OFL nor Apache 2.0 (§D.a rule 7)')
    category = re.search(r'^category: "([^"]+)"', pb, re.M).group(1)
    if category not in GENERIC:  # here, before anything is written — never a KeyError after the files are
        raise Refused(f'{family}: upstream category {category} has no CSS fallback in GENERIC')
    fonts = [{'style': s, 'weight': int(w), 'filename': f} for s, w, f in
             re.findall(r'fonts \{[^}]*?style: "(\w+)"[^}]*?weight: (\d+)[^}]*?filename: "([^"]+)"', pb, re.S)]
    axes = {t: (float(lo), float(hi)) for t, lo, hi in
            re.findall(r'axes \{\s*tag: "(\w+)"\s*min_value: ([\d.]+)\s*max_value: ([\d.]+)', pb)}
    return {'dir': f'{top}/{dir_name(family)}', 'licence': licence, 'category': category, 'fonts': fonts, 'axes': axes}


# ── the faces a pairing emits (§D.a rules 1–3) ─────────────────────────────────────────────────────────────────────
def declared_faces(pairing, heading, body, hfam, bfam):
    """Each face as (family, style, kind, weight) — kind V with a (lo, hi) range, S with one weight."""
    faces = []
    for fam, decl, role in ((bfam, body, 'body'), (hfam, heading, 'heading')):
        if decl['type'] == 'V':
            wanted = [('normal', tuple(decl['range']))] + ([('italic', tuple(decl['italic']))] if 'italic' in decl else [])
            for style, rng in wanted:
                # §D.a rule 3: the same family's heading is the body's roman, provided its clip covers the heading
                covered = [f for f in faces if f[0] == fam and f[1] == style and f[2] == 'V' and f[3][0] <= rng[0] and rng[1] <= f[3][1]]
                if role == 'heading' and fam == bfam:
                    if not covered:
                        raise Refused(f'{pairing}: {fam} heading {rng[0]}–{rng[1]} is not covered by the body roman (§D.a rule 3)')
                    continue
                faces.append((fam, style, 'V', rng))
        else:
            for w in decl['weights']:
                style = 'italic' if w.endswith('i') else 'normal'
                face = (fam, style, 'S', int(w.rstrip('i')))
                if face not in faces:
                    faces.append(face)
    return faces


def role_faces(decl, fam, built, role):
    """The faces a role draws with: a static role its declared weights; a variable heading its roman — the body's own,
    where one family holds both roles (rule 3); a variable body its roman and italic."""
    if decl['type'] == 'S':
        return [face_id((fam, 'italic' if w.endswith('i') else 'normal', 'S', int(w.rstrip('i')))) for w in decl['weights']]
    return [face_id(f) for f in built if f[0] == fam and f[2] == 'V' and (role == 'body' or f[1] == 'normal')]


def face_id(face):
    fam, style, kind, weight = face
    return f"{slug(fam)}-{'italic' if style == 'italic' else 'roman'}" + (f'-{weight}' if kind == 'S' else '')


def source_for(face, meta):
    """The upstream file and the instancer limits that make this face, or a refusal naming the difference."""
    fam, style, kind, weight = face
    variable = [f for f in meta['fonts'] if f['style'] == style and '[' in f['filename']]
    static = [f for f in meta['fonts'] if f['style'] == style and '[' not in f['filename']]
    if kind == 'V':
        if not variable:
            raise Refused(f'{fam}: §D.c declares a variable {style} face; upstream ships it static only')
        lo, hi = meta['axes'].get('wght', (None, None))
        if lo is None or weight[0] < lo or weight[1] > hi:
            raise Refused(f'{fam}: §D.c clips wght {weight[0]}–{weight[1]}; upstream {style} spans {lo}–{hi}')
        return variable[0]['filename'], {'wght': weight}
    exact = [f for f in static if f['weight'] == weight]
    if exact:
        return exact[0]['filename'], None
    if variable and fam in STATIC_CUTS:
        lo, hi = meta['axes'].get('wght', (None, None))
        if lo is not None and lo <= weight <= hi:
            return variable[0]['filename'], {'wght': weight}
    have = sorted(f['weight'] for f in static)
    kind_up = 'variable only' if variable and not static else f'static at {have}'
    raise Refused(f'{fam}: §D.c declares a static {style} {weight}; upstream is {kind_up}')


def build_face(face, meta):
    filename, limits = source_for(face, meta)
    font = TTFont(io.BytesIO(fetch(f"{meta['dir']}/{filename}")), recalcTimestamp=False)
    pinned = {}
    if 'fvar' in font:
        axes = {a.axisTag: a for a in font['fvar'].axes}
        full = {}
        for tag, axis in axes.items():
            if tag == 'wght' and limits is not None:
                full[tag] = limits['wght']
            else:
                full[tag] = axis.defaultValue
                pinned[tag] = axis.defaultValue
        font = instancer.instantiateVariableFont(font, full, updateFontNames=False)
        buf = io.BytesIO()
        font.save(buf)
        source = buf.getvalue()
    else:
        buf = io.BytesIO()
        font.save(buf)
        source = buf.getvalue()
    probe = TTFont(io.BytesIO(source), recalcTimestamp=False)
    upm = probe['head'].unitsPerEm
    os2 = probe['OS/2']
    cap = getattr(os2, 'sCapHeight', 0) or 0
    if cap <= 0:  # an old OS/2: the capital H's own height
        glyphs = probe.getGlyphSet()
        pen = BoundsPen(glyphs)
        glyphs[probe.getBestCmap()[ord('H')]].draw(pen)
        cap = pen.bounds[3]
    return source, round(cap / upm, 4), {k: (int(v) if float(v).is_integer() else v) for k, v in sorted(pinned.items())}


def woff2(source, ranges):
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    opts = subset.Options()
    opts.layout_features = ['*']
    opts.layout_scripts = ['*']
    opts.name_IDs = ['*']
    opts.name_languages = ['*']
    opts.notdef_outline = True
    # TrueType hinting is dropped: the pool's variable faces carry none upstream, browsers off Windows ignore it, and it
    # is about a quarter of a static face's bytes — kept, D15's Lato would break §D.a rule 5's 200 KB (executed: 211 KB)
    opts.hinting = False
    opts.drop_tables += ['meta']
    opts.recalc_timestamp = False
    opts.flavor = 'woff2'
    sub = subset.Subsetter(opts)
    sub.populate(unicodes=unicodes(ranges))
    sub.subset(font)
    buf = io.BytesIO()
    subset.save_font(font, buf, opts)
    data = buf.getvalue()
    tnum = False
    check = TTFont(io.BytesIO(data))
    if 'GSUB' in check and check['GSUB'].table.FeatureList is not None:
        tnum = any(r.FeatureTag == 'tnum' for r in check['GSUB'].table.FeatureList.FeatureRecord)
    return data, tnum


# ── the run ────────────────────────────────────────────────────────────────────────────────────────────────────────
def main():
    prd = open(PRD, encoding='utf8').read()
    rows = pool_rows(prd)
    ranges = subset_ranges()

    # 1. every declaration and every refusal BEFORE anything is written
    pairings, families, faces = [], {}, {}
    for pid, name, hfam, hcell, bfam, bcell, files in rows:
        heading, body = face_cell(hcell, 'heading'), face_cell(bcell, 'body')
        for fam in (hfam, bfam):
            if fam not in families:
                families[fam] = read_metadata(fam)
        built = declared_faces(pid, heading, body, hfam, bfam)
        if len(built) != int(files):
            raise Refused(f'{pid} {name}: §D.a builds {len(built)} faces and §D.c\'s Files column says {files}')
        for face in built:
            fid = face_id(face)
            if fid in faces and faces[fid]['face'] != face:
                raise Refused(f'{fid}: two pairings declare {face[0]} {face[1]} differently ({faces[fid]["face"]} and {face})')
            faces[fid] = {'face': face}
            source_for(face, families[face[0]])  # the type and weight refusals, before any download of a font file
        pairings.append({'id': pid, 'name': name,
                         'heading': {'family': hfam, **heading, 'faces': role_faces(heading, hfam, built, 'heading')},
                         'body': {'family': bfam, **body, 'faces': role_faces(body, bfam, built, 'body')}})

    # 2. build every face once
    os.makedirs(os.path.join(OUT, 'files'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'licences'), exist_ok=True)
    written = set()
    record = {}
    for fid in sorted(faces):
        fam, style, kind, weight = faces[fid]['face']
        source, cap, pinned = build_face(faces[fid]['face'], families[fam])
        files, tnum = [], False
        for sub in SUBSETS:
            data, has_tnum = woff2(source, ranges[sub])
            tnum = tnum or (sub == 'latin' and has_tnum)
            file = f'{fid}-{sub}.woff2'
            with open(os.path.join(OUT, 'files', file), 'wb') as f:
                f.write(data)
            written.add(file)
            files.append({'subset': sub, 'file': file, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
        record[fid] = {'family': fam, 'style': style, 'type': kind,
                       'weight': f'{weight[0]} {weight[1]}' if kind == 'V' else str(weight),
                       **({'pinned': pinned} if pinned else {}),
                       **({'cut': STATIC_CUTS[fam]} if kind == 'S' and fam in STATIC_CUTS else {}),
                       'capHeight': cap, 'tnum': tnum, 'files': files}
        print(f'  {fid}: ' + ' · '.join(f"{x['subset']} {x['bytes']:,} B" for x in files))
    for stale in sorted(set(os.listdir(os.path.join(OUT, 'files'))) - written):
        os.remove(os.path.join(OUT, 'files', stale))
        print(f'  removed {stale}: no face declares it')

    fams = {}
    for fam in sorted(families):
        meta = families[fam]
        top, licence_file = LICENCES[meta['licence']]
        text = fetch(f"{meta['dir']}/{licence_file}")
        rel = f'licences/{slug(fam)}.txt'
        with open(os.path.join(OUT, rel), 'wb') as f:
            f.write(text)
        fams[fam] = {'slug': slug(fam), 'fallback': GENERIC[meta['category']], 'licence': meta['licence'],
                     'licenceFile': rel, 'upstream': meta['dir']}
    keep = {f['licenceFile'].split('/', 1)[1] for f in fams.values()}
    for stale in sorted(set(os.listdir(os.path.join(OUT, 'licences'))) - keep):
        os.remove(os.path.join(OUT, 'licences', stale))

    pool = {
        'about': 'GENERATED by tools/fonts/build-pool.py from prd.md Appendix D §D.c — never edit; re-run the builder. '
                 'A file\'s unicode-range is subsets[file.subset]; tools/stress/test-vocabulary.mjs holds this to §D.c '
                 'and every file to its sha256.',
        'source': {'repository': 'https://github.com/google/fonts', 'commit': COMMIT},
        'subsets': ranges,
        'families': fams,
        'faces': record,
        'pairings': pairings,
    }
    with open(os.path.join(OUT, 'pool.json'), 'w', encoding='utf8') as f:
        f.write(json.dumps(pool, indent=2, ensure_ascii=False) + '\n')
    for p in pairings:
        ids = list(dict.fromkeys(p['heading']['faces'] + p['body']['faces']))
        latin = sum(next(x['bytes'] for x in record[i]['files'] if x['subset'] == 'latin') for i in ids)
        ext = sum(next(x['bytes'] for x in record[i]['files'] if x['subset'] == 'latin-ext') for i in ids)
        print(f'{p["id"]} {p["name"]}: {len(ids)} faces · latin {latin / 1000:.1f} KB · latin-ext {ext / 1000:.1f} KB')
    print(f'pool.json written: {len(pairings)} pairings, {len(record)} faces, {len(written)} files, at {COMMIT[:12]}')


def self_check():
    """Each refusal on a synthetic upstream record, beside its control — the same record shaped as §D.c declares."""
    def refused(fn, *args):
        try:
            fn(*args)
        except Refused as e:
            return str(e)
        raise AssertionError(f'{fn.__name__}{args!r} was not refused')
    var = {'fonts': [{'style': 'normal', 'weight': 400, 'filename': 'X[wght].ttf'}], 'axes': {'wght': (100.0, 900.0)}}
    static = {'fonts': [{'style': 'normal', 'weight': 700, 'filename': 'X-Bold.ttf'}], 'axes': {}}
    assert source_for(('X', 'normal', 'V', (500, 800)), var) == ('X[wght].ttf', {'wght': (500, 800)})  # control
    assert 'static only' in refused(source_for, ('X', 'normal', 'V', (500, 800)), static)
    assert 'spans' in refused(source_for, ('X', 'normal', 'V', (500, 950)), var)
    assert source_for(('X', 'normal', 'S', 700), static) == ('X-Bold.ttf', None)  # control
    assert 'variable only' in refused(source_for, ('X', 'normal', 'S', 700), var)  # X is not a STATIC_CUTS family
    assert 'static at [700]' in refused(source_for, ('X', 'normal', 'S', 400), static)
    body = {'type': 'V', 'range': [400, 700], 'italic': [400, 700]}
    assert len(declared_faces('D0', {'type': 'V', 'range': [600, 700]}, body, 'X', 'X')) == 2  # control: rule 3 holds
    assert 'not covered' in refused(declared_faces, 'D0', {'type': 'V', 'range': [600, 900]}, body, 'X', 'X')
    real = metadata
    try:
        for licence, ok in (('OFL', True), ('APACHE2', True), ('UFL', False)):
            pb = f'name: "X"\nlicense: "{licence}"\ncategory: "SERIF"\n'
            globals()['metadata'] = lambda family, pb=pb: ('ofl', pb)
            if ok:
                assert read_metadata('X')['licence'] == licence
            else:
                assert 'neither OFL nor Apache' in refused(read_metadata, 'X')
    finally:
        globals()['metadata'] = real
    print('self-check: build-pool refuses a V face static upstream, a clip upstream lacks, an S face variable-only '
          'upstream or at another weight, an uncovered same-family heading and a UFL licence; each control builds')


if __name__ == '__main__':
    if sys.argv[1:] == ['--self-check']:
        self_check()
        sys.exit(0)
    if sys.argv[1:]:  # `--help` or a typo must never run the build: it fetches, rewrites and removes files
        sys.exit(f'unknown argument {sys.argv[1:]}: no flags but --self-check (read the docstring)')
    try:
        main()
    except Refused as e:
        print(f'REFUSED: {e}', file=sys.stderr)
        sys.exit(1)
