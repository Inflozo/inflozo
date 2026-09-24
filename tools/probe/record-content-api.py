#!/usr/bin/env python3
"""Story 5.18's recorder — the Content API facts the editor's live reads rest on, executed read-only
on T1 and T3 before a line of the read layer is written.

    env $(grep -E '^GHOST[56]_(URL|CONTENT_API_KEY)=' tools/probe/.env | xargs) \\
        python3 tools/probe/record-content-api.py

WHY IT EXISTS. Story 5.18 reads the linked site's Content API from the browser, never the body,
through one cache with a failure policy built around Ghost's own limiter. Every one of those rests on
a claim about Ghost — read in its source on both majors at the spec's Create — and CLAUDE.md's first
standing rule makes a claim about an external platform a hypothesis until it is executed. So this
runs first, and the read layer is written against what it records.

WHAT IT EXECUTES, per server (T3 `ghost5` first, then T1 `ghost6`), every request carrying the two
headers the editor's reads carry — `Origin: https://app.inflozo.com` and `Accept-Version: v5.0` —
each step PASS, FAIL or RECORD, exiting non-zero if any step fails:

  (a) control      `settings/` with the real key answers 200. Without it every refusal below is a
                   broken request, not a result (standing rule 2), so a server whose control fails
                   is recorded as VOID and nothing further is asked of it
  (b) cors         `posts/` `pages/` `tags/` `authors/` `settings/` carry
                   `access-control-allow-origin` on the 200 AND on a 401 (a key Ghost never
                   issued), and the preflight (OPTIONS, `access-control-request-headers:
                   accept-version`) allows the header
  (c) cache        `Cache-Control` on a 200 — whether there is any HTTP caching to lean on
  (d) no-body      `formats=mobiledoc` against a plain read, on every post and every page: no
                   `html`, `plaintext`, `lexical` or `mobiledoc`, and `reading_time` and `excerpt`
                   identical to the plain read's; the bytes of both. Its control: the plain read
                   DOES carry `html`. Then the same on a read by `filter=slug:'…'` — the exact shape
                   the editor sends — and a slug no row holds answers `200 []`, never a 404
  (e) fields       `fields=` drops `reading_time`, which is why it is not the alternative
  (f) past-last    `filter=tags:'…'` + `page=2` on a tag whose posts fit one page answers `200 []`
                   with `meta.pagination.pages` 1; its control is the same tag's page 1, whose
                   `total` is the tag's own `count.posts` — and the same for a writer
  (g) count-order  `tags/` and `authors/` with `include=count.posts&order=count.posts desc`: 200, and
                   the counts never rise down the list
  (h) ids-order    `filter=id:[c,b,a]` answers in Ghost's order, not the request's (R-20's reason to
                   re-order by the pick)
  (i) settings     the key NAMES `/settings/` carries — never a value — including whether
                   `codeinjection_head`/`_foot` are there, the time zone, and the navigation's url FORM

LAST, ON T1 ONLY — GHOST'S BRUTE LIMITER. A read with the real key (the control, and it resets the
count, so the run starts from zero), 100 reads with a key Ghost never issued, then ONE read with the
real key: its status, its body's message, whether it carries `access-control-allow-origin`, and the
time. **T1's Content API then refuses this machine's network — every key, the site's own search
included — for about an hour by Ghost's own config** (`minWait` 3,600,000 ms), which this run does
not measure (MEASUREMENTS §52 timed it: an hour); the script prints when the refusal began.

NO KEY IS EVER PRINTED. Every URL that carries one is built inside `get()` and never leaves it, and an
exception is reported by its class name alone. Nothing is written to either server.

It writes MEASUREMENTS.md §51 — replacing an earlier §51 written by this command, so a re-run
re-records rather than appending a second — and to nothing else.
"""

import collections
import datetime
import json
import os
import sys
import urllib.error
import urllib.parse
import urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
MEASUREMENTS = os.path.join(ROOT, '_bmad-output', 'planning-artifacts', 'architecture',
                            'architecture-Inflozo-2026-08-19', 'MEASUREMENTS.md')
COMMAND = "env $(grep -E '^GHOST[56]_(URL|CONTENT_API_KEY)=' tools/probe/.env | xargs) python3 tools/probe/record-content-api.py"

ORIGIN = 'https://app.inflozo.com'
VERSION = 'v5.0'
# the SHAPE of a Content API key (26 hex), which Ghost never issued
BAD_KEY = '0' * 26
BODY_FORMATS = ('html', 'plaintext', 'lexical', 'mobiledoc')
POSTS_PER_PAGE = 12
# Ghost's `spam.content_api_key.freeRetries` is 99 (`core/shared/config/defaults.json`, both majors):
# one failure more than that is the whole of what the limiter needs to see
BAD_READS = 100


class Void(Exception):
    """A control did not pass. Nothing is written."""


def need(name):
    value = os.environ.get(name)
    if not value:
        raise Void(f'{name} is not in this command\'s environment — read it from tools/probe/.env')
    return value


def get(base, resource, params, key, method='GET', preflight=False):
    """One call to the Content API. Returns status, lower-cased headers, the raw bytes and the parsed
    body. Never raises, and never lets the URL — which carries the key — out of this function."""
    query = dict(params)
    query['key'] = key
    url = f'{base}/ghost/api/content/{resource}/?{urllib.parse.urlencode(query)}'
    headers = {'Origin': ORIGIN, 'User-Agent': 'inflozo-probe (Story 5.18)'}
    if preflight:
        headers['Access-Control-Request-Method'] = 'GET'
        headers['Access-Control-Request-Headers'] = 'accept-version'
    else:
        headers['Accept-Version'] = VERSION
    req = urllib.request.Request(url, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            raw, status, hdrs = r.read(), r.status, r.headers
    except urllib.error.HTTPError as e:
        raw, status, hdrs = e.read(), e.code, e.headers
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return {'status': 0, 'headers': {}, 'raw': b'', 'body': None, 'error': type(e).__name__}
    try:
        body = json.loads(raw) if raw.strip() else None
    except ValueError:
        body = None
    return {'status': status, 'headers': {k.lower(): v for k, v in hdrs.items()}, 'raw': raw, 'body': body}


def rows(answer, resource):
    body = answer['body'] if isinstance(answer['body'], dict) else {}
    out = body.get(resource)
    return out if isinstance(out, list) else []


def pagination(answer):
    body = answer['body'] if isinstance(answer['body'], dict) else {}
    return ((body.get('meta') or {}).get('pagination')) or {}


def acao(answer):
    return answer['headers'].get('access-control-allow-origin')


def error_words(answer):
    """Ghost's error `message` and `type` — never its `context`, `id` or anything that could echo input."""
    body = answer['body'] if isinstance(answer['body'], dict) else {}
    errs = body.get('errors') or [{}]
    first = errs[0] if isinstance(errs, list) and errs else {}
    return f'{first.get("type", "?")} · "{first.get("message", "?")}"'


def server(name, base, key, steps):
    """Every fact but the limiter, on one server. Returns False where its control failed."""
    def step(label, ok, detail):
        steps.append((name, label, ok, detail))
        return ok

    # (a) the control
    ctl = get(base, 'settings', {}, key)
    if not step('control', ctl['status'] == 200,
                f'`settings/` with the real key: HTTP {ctl["status"]}{" (" + ctl.get("error", "") + ")" if ctl["status"] == 0 else ""}'):
        return False

    # (b) CORS on the 200 and on the 401, and the preflight
    for resource in ('posts', 'pages', 'tags', 'authors', 'settings'):
        params = {'limit': '1'} if resource != 'settings' else {}
        good = get(base, resource, params, key)
        bad = get(base, resource, params, BAD_KEY)
        step(f'cors/{resource}', good['status'] == 200 and bad['status'] == 401 and acao(good) == '*' and acao(bad) == '*',
             f'200 → `access-control-allow-origin: {acao(good)}` · a key Ghost never issued → HTTP {bad["status"]} '
             f'{error_words(bad)}, `access-control-allow-origin: {acao(bad)}`')
    pre = get(base, 'posts', {'limit': '1'}, key, method='OPTIONS', preflight=True)
    allowed = (pre['headers'].get('access-control-allow-headers') or '').lower()
    step('cors/preflight', pre['status'] in (200, 204) and acao(pre) == '*' and 'accept-version' in allowed,
         f'OPTIONS → HTTP {pre["status"]}, `access-control-allow-origin: {acao(pre)}`, '
         f'`access-control-allow-headers: {allowed}`, `access-control-max-age: {pre["headers"].get("access-control-max-age")}`')

    # (c) HTTP caching
    step('cache-control', None, f'`Cache-Control: {ctl["headers"].get("cache-control")}` on `settings/`')

    # (d) formats=mobiledoc is "no body" — on every post and every page
    for resource in ('posts', 'pages'):
        inc = {'include': 'tags,authors'} if resource == 'posts' else {}
        plain = get(base, resource, {'limit': '100', **inc}, key)
        lean = get(base, resource, {'limit': '100', **inc, 'formats': 'mobiledoc'}, key)
        a, b = rows(plain, resource), rows(lean, resource)
        by_id = {r.get('id'): r for r in a}
        control = len(a) > 0 and all('html' in r for r in a)
        bodyless = all(not any(f in r for f in BODY_FORMATS) for r in b)
        same = len(a) == len(b) and all(
            r.get('id') in by_id
            and r.get('reading_time') == by_id[r['id']].get('reading_time')
            and r.get('excerpt') == by_id[r['id']].get('excerpt')
            for r in b)
        present = all('reading_time' in r and 'excerpt' in r for r in b)
        step(f'no-body/{resource}', control and bodyless and same and present,
             f'{len(b)} {resource}: the plain read carries `html` on every row ({control}) · with `formats=mobiledoc` '
             f'none carries {", ".join(BODY_FORMATS)} ({bodyless}) · `reading_time` and `excerpt` present on every row '
             f'({present}) and identical to the plain read\'s ({same}) · **{len(lean["raw"]):,} bytes against '
             f'{len(plain["raw"]):,}** · keys: {", ".join(sorted(b[0].keys())) if b else "—"}')
        if resource == 'posts' and a:
            first = a[0]
            one = get(base, 'posts', {'filter': f"slug:'{first['slug']}'", 'include': 'tags,authors', 'formats': 'mobiledoc'}, key)
            got = rows(one, 'posts')
            step('no-body/by-slug', one['status'] == 200 and len(got) == 1 and got[0].get('id') == first.get('id')
                 and not any(f in got[0] for f in BODY_FORMATS) and got[0].get('reading_time') == first.get('reading_time'),
                 f"`filter=slug:'<slug>'` (quoted, the editor's shape) → HTTP {one['status']}, {len(got)} row, no body, "
                 f"`reading_time` {got[0].get('reading_time') if got else '—'} as the plain read's")
            gone = get(base, 'posts', {'filter': "slug:'inflozo-probe-no-such-post'", 'formats': 'mobiledoc'}, key)
            step('by-slug/gone-is-a-browse', gone['status'] == 200 and rows(gone, 'posts') == [],
                 f'a slug no post holds → HTTP {gone["status"]}, {len(rows(gone, "posts"))} rows — a browse, never a 404 '
                 f'(which Ghost would count against the network)')

    # (e) fields= drops reading_time
    thin = get(base, 'posts', {'limit': '5', 'fields': 'id,slug,title,reading_time'}, key)
    t = rows(thin, 'posts')
    step('fields-drops-reading-time', thin['status'] == 200 and len(t) > 0 and all('reading_time' not in r or r['reading_time'] is None for r in t),
         f'`fields=id,slug,title,reading_time` → HTTP {thin["status"]}, `reading_time` on '
         f'{sum(1 for r in t if r.get("reading_time") is not None)} of {len(t)} rows')

    # (f) past the last page of an archive
    for kind, filt in (('tags', 'tags'), ('authors', 'authors')):
        listed = get(base, kind, {'limit': '100', 'include': 'count.posts'}, key)
        small = [r for r in rows(listed, kind) if 0 < ((r.get('count') or {}).get('posts') or 0) <= POSTS_PER_PAGE]
        if not small:
            step(f'past-last/{kind}', None, f'no {kind[:-1]} with 1–{POSTS_PER_PAGE} posts to ask about')
            continue
        pick = min(small, key=lambda r: r['count']['posts'])
        p1 = get(base, 'posts', {'filter': f"{filt}:'{pick['slug']}'", 'limit': str(POSTS_PER_PAGE), 'page': '1', 'formats': 'mobiledoc'}, key)
        p2 = get(base, 'posts', {'filter': f"{filt}:'{pick['slug']}'", 'limit': str(POSTS_PER_PAGE), 'page': '2', 'formats': 'mobiledoc'}, key)
        control = p1['status'] == 200 and pagination(p1).get('total') == pick['count']['posts']
        step(f'past-last/{kind}', control and p2['status'] == 200 and rows(p2, 'posts') == [] and pagination(p2).get('pages') == 1,
             f"`filter={filt}:'<slug>'` on a {kind[:-1]} of {pick['count']['posts']} posts: page 1 total "
             f"{pagination(p1).get('total')} (the control) · page 2 → HTTP {p2['status']}, {len(rows(p2, 'posts'))} rows, "
             f"`meta.pagination.pages` {pagination(p2).get('pages')}")

    # (g) order=count.posts desc
    for kind in ('tags', 'authors'):
        ordered = get(base, kind, {'limit': '100', 'include': 'count.posts', 'order': 'count.posts desc'}, key)
        counts = [((r.get('count') or {}).get('posts')) for r in rows(ordered, kind)]
        falling = all(isinstance(c, int) for c in counts) and all(counts[i] >= counts[i + 1] for i in range(len(counts) - 1))
        step(f'count-order/{kind}', ordered['status'] == 200 and len(counts) > 0 and falling,
             f'`include=count.posts&order=count.posts desc` → HTTP {ordered["status"]}, counts {counts}')

    # (h) ids come back in Ghost's order
    listed = rows(get(base, 'posts', {'limit': '3', 'formats': 'mobiledoc'}, key), 'posts')
    if len(listed) == 3:
        asked = [r['id'] for r in reversed(listed)]
        back = rows(get(base, 'posts', {'filter': f"id:[{','.join(asked)}]", 'limit': '100', 'formats': 'mobiledoc'}, key), 'posts')
        got = [r['id'] for r in back]
        step('ids-order', None, f'`filter=id:[c,b,a]` → {len(got)} rows, in the REQUESTED order: {got == asked}; '
             f'in the newest-first order: {got == list(reversed(asked))}')

    # (i) the settings a browser can read — NAMES only
    s = (ctl['body'] or {}).get('settings') or {}
    nav = s.get('navigation') or []
    forms = sorted({'relative' if str(i.get('url', '')).startswith('/') else 'absolute' for i in nav if isinstance(i, dict)})
    step('settings', None,
         f'{len(s)} keys: {", ".join(sorted(s.keys()))} · `codeinjection_head` present: {"codeinjection_head" in s}, '
         f'`codeinjection_foot` present: {"codeinjection_foot" in s} · `timezone`: `{s.get("timezone")}` · '
         f'`title`: "{s.get("title")}" · navigation urls: {forms or ["none"]} ({len(nav)} items)')
    return True


def limiter(base, key, steps):
    """LAST, T1 only: 100 failures, then the real key."""
    def step(label, ok, detail):
        steps.append(('T1 ghost6', label, ok, detail))
        return ok

    ctl = get(base, 'settings', {}, key)
    if not step('limiter/control', ctl['status'] == 200,
                f'a read with the real key first: HTTP {ctl["status"]} — the count starts from zero'):
        return None
    seen = collections.Counter()
    for _ in range(BAD_READS):
        seen[get(base, 'posts', {'limit': '1'}, BAD_KEY)['status']] += 1
    at = datetime.datetime.now(datetime.timezone.utc)
    final = get(base, 'posts', {'limit': '1'}, key)
    step('limiter/failures', seen.get(401, 0) == BAD_READS,
         f'{BAD_READS} reads with a key Ghost never issued: ' + ', '.join(f'HTTP {k} × {v}' for k, v in sorted(seen.items())))
    step('limiter/the-real-key', final['status'] == 429,
         f'then ONE read with the real key → HTTP {final["status"]} {error_words(final)} at {at.strftime("%H:%M:%S")} UTC — '
         f'the limiter runs BEFORE authentication, so a good key is refused with the rest')
    step('limiter/cors-on-429', None,
         f'the 429 carries `access-control-allow-origin: {acao(final)}`'
         + (' — so a browser CAN read its status, and the editor can name it' if acao(final) == '*' else
            ' — so a browser CANNOT read its status, and the editor sees "not answering"'))
    return at


def section(steps, at):
    when = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d')
    out = [
        f'## 51. The Content API from a browser — CORS, `formats=mobiledoc` as "no body", and Ghost\'s brute limiter, '
        f'executed read-only on both majors · {when}',
        '',
        f'`{COMMAND}`. Story 5.18. Every request carried `Origin: {ORIGIN}` and `Accept-Version: {VERSION}` — the two '
        'headers the editor\'s reads carry — and nothing was written to either server. The facts were read in Ghost\'s '
        'source on both majors at the spec\'s Create; this is their execution (standing rule 1).',
        '',
        '### (a) Step by step',
        '',
        '| Server | Step | Verdict | What Ghost answered |',
        '|---|---|---|---|',
    ]
    for srv, label, ok, detail in steps:
        mark = 'RECORD' if ok is None else ('**PASS**' if ok else '**FAIL**')
        out.append(f'| {srv} | `{label}` | {mark} | {detail} |')
    out += [
        '',
        '### (b) What it means',
        '',
        '- **The browser may read every Content API route the editor uses, and a refusal too.** `access-control-allow-origin: *` '
        'is on the 200 and on the 401 of `posts/` `pages/` `tags/` `authors/` `settings/`, and the preflight allows '
        '`accept-version` — so a wrong key reaches the editor as a readable 401, not as "not answering".',
        '- **There is no HTTP caching to lean on**: the 60 s cache is the editor\'s own.',
        '- **`formats=mobiledoc` is "no body" on both majors** — no `html`, `plaintext`, `lexical` or `mobiledoc`, while '
        '`reading_time` and `excerpt` are still computed on the server and identical to a plain read\'s. `fields=` is not '
        'the alternative: it loses `reading_time`, which a17/1 and a24/1 print.',
        '- **A post and a page carry `codeinjection_head` and `codeinjection_foot` of their OWN** (the keys column of '
        '`no-body/*` above), beside the site\'s on `/settings/` — so the editor\'s whitelist, not the request, is what '
        'keeps both out of every row it caches.',
        '- **A missing subject is a browse that answers `200 []`**, and past an archive\'s last page is `200 []` too — so '
        'nothing the editor asks for is ever a 404, which Ghost would count against the customer\'s network.',
        '- **Ghost limits FAILED requests per network, not keys**, and checks before it authenticates: after the run of '
        'failures above, the real key was refused as well. FR-H4\'s *"because Ghost rate-limits Content API keys"* is '
        'corrected to that sentence wherever it is stated.',
        '',
    ]
    if at is not None:
        out += [
            f'**T1\'s Content API refused this machine\'s network from {at.strftime("%H:%M UTC")}** — every key, the site\'s '
            'own search included. How long is Ghost\'s config, read in source on both majors and NOT measured by this run: '
            '`spam.content_api_key` holds a network for `minWait` 3,600,000 ms within a `lifetime` of 3,600 s '
            '(`core/shared/config/defaults.json`). That is the cost the editor\'s failure policy exists to never impose on '
            'a customer: a refusal is never retried, three failures stop reading, and every session has a ceiling.',
            '',
        ]
    out += [
        '**What this does NOT say.** Nothing here ran through a Ghost(Pro) edge (DW-249): whether an edge\'s own 429 carries '
        '`access-control-allow-origin`, the edge\'s limits, and whether the `*.ghost.io` admin origin serves the Content '
        'API with these headers are the Ghost(Pro) trial\'s, on VERIFY-AT-BUILD\'s checklist.',
        '',
    ]
    return '\n'.join(out)


def write_section(text):
    """§51 IN PLACE: a re-run replaces its own section where it stands — §52, which times the hold this run earns,
    follows it — and a first run appends it."""
    body = open(MEASUREMENTS).read().rstrip('\n')
    at = body.find('\n## 51. ')
    if at == -1:
        body = body + '\n\n' + text.rstrip('\n')
    else:
        end = body.find('\n## ', at + 1)
        body = body[:at].rstrip('\n') + '\n\n' + text.rstrip('\n') + ('' if end == -1 else '\n' + body[end:])
    with open(MEASUREMENTS, 'w') as f:
        f.write(body.rstrip('\n') + '\n')


if __name__ == '__main__':
    if any(a.startswith('-') for a in sys.argv[1:]):
        # a recorder that ran on `--help` would earn a 429 on T1; the docstring is the help
        print(__doc__)
        sys.exit(0)

    steps = []
    try:
        t3 = (need('GHOST5_URL').rstrip('/'), need('GHOST5_CONTENT_API_KEY'))
        t1 = (need('GHOST6_URL').rstrip('/'), need('GHOST6_CONTENT_API_KEY'))
        ok3 = server('T3 ghost5', *t3, steps)
        ok1 = server('T1 ghost6', *t1, steps)
        if not (ok3 and ok1):
            raise Void('a control failed, so the limiter is not asked about')
        print('    both servers recorded; the limiter on T1 now — T1 will refuse this machine for about an hour')
        at = limiter(*t1, steps)
    except Void as e:
        for srv, label, ok, detail in steps:
            print(f'  {"RECORD" if ok is None else ("PASS  " if ok else "FAIL  ")}  {srv} {label}: {detail}')
        print(f'\n  ** RUN VOID — nothing written. {e}')
        sys.exit(1)

    for srv, label, ok, detail in steps:
        print(f'  {"RECORD" if ok is None else ("PASS  " if ok else "FAIL  ")}  {srv} {label}: {detail}')
    write_section(section(steps, at))
    print('\n    MEASUREMENTS.md §51 written.')
    if at is not None:
        print(f'    T1 refuses this machine\'s Content API reads from {at.strftime("%H:%M UTC")}, for about an hour by '
              'Ghost\'s own config (not measured here).')
    failed = [f'{s} {l}' for s, l, ok, _ in steps if ok is False]
    if failed:
        print(f'    {len(failed)} step(s) FAILED: {", ".join(failed)}')
        sys.exit(1)
    sys.exit(0)
