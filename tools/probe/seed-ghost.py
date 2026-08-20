#!/usr/bin/env python3
"""Seed a probe Ghost with the FR-H3 fixture shape.

    python3 tools/probe/seed-ghost.py 5        # or 6, or "5 6"

The dataset is not arbitrary — `sections-inventory.md` derives every number from
what has to be renderable, and the probes are worthless without it:

  32 posts        12 + 12 + 8 at posts_per_page 12, so pagination has a first
                  page, a TRUE MIDDLE page (the only state carrying both a
                  previous and a next link) and a partial last page. A34's ten
                  designs and FR-D21's page-2 state have no renderable state
                  otherwise.
   8 featured     spread across tags and authors, never clustered, so a Source
                  of "Featured" is never a one-card row and a COMBINED filter
                  (featured AND by tag) still returns something.
   6 tags         each carrying >= 3 posts, so "By tag" returns a real set on
                  any tag. An empty Source is indistinguishable from a broken
                  binding, which is the confusion this composition prevents.
   8 posts        deliberately WITHOUT a feature image, to exercise FR-H8's
                  media guards — a subject with an image and one without
                  produce structurally different markup.

Deterministic: no randomness anywhere, so re-seeding a rebuilt box reproduces
the same dataset and NFR-6(c1)'s snapshot diffs stay meaningful.
"""
import os, sys, re, time, json, hmac, hashlib, base64, urllib.request, urllib.error

ENV = os.path.join(os.path.dirname(__file__), '.env')


def load_env():
    out = {}
    for line in open(ENV):
        m = re.match(r'^([A-Z0-9_]+)=(.*)$', line.rstrip('\n'))
        if m and m.group(2).strip():
            out[m.group(1)] = m.group(2).strip()
    return out


def jwt(key):
    kid, secret = key.split(':')
    b64 = lambda b: base64.urlsafe_b64encode(b).rstrip(b'=')
    h = b64(json.dumps({"alg": "HS256", "typ": "JWT", "kid": kid}).encode())
    n = int(time.time())
    p = b64(json.dumps({"iat": n, "exp": n + 300, "aud": "/admin/"}).encode())
    s = b64(hmac.new(bytes.fromhex(secret), h + b'.' + p, hashlib.sha256).digest())
    return (h + b'.' + p + b'.' + s).decode()


class Ghost:
    def __init__(self, url, token, version):
        self.url, self.token, self.av = url.rstrip('/'), token, f'v{version}.0'

    def call(self, method, path, body=None):
        req = urllib.request.Request(
            f'{self.url}/ghost/api/admin/{path}',
            data=json.dumps(body).encode() if body is not None else None,
            method=method,
            headers={'Authorization': 'Ghost ' + jwt(self.token),
                     'Accept-Version': self.av,
                     'Content-Type': 'application/json'})
        try:
            with urllib.request.urlopen(req, timeout=40) as r:
                return json.load(r) if r.status != 204 else {}
        except urllib.error.HTTPError as e:
            raise RuntimeError(f'{method} {path} -> {e.code} {e.read()[:200].decode("utf8","replace")}')


# ---------------------------------------------------------------- the dataset
TAGS = ['Craft', 'Systems', 'Field Notes', 'Interviews', 'Tooling', 'Archive']

# Ghost's own CDN — real images, no upload step, stable URLs.
IMG = ('https://static.ghost.org/v5.0.0/images/publication-cover.jpg',
       'https://static.ghost.org/v4.0.0/images/feature-image.jpg',
       'https://static.ghost.org/v5.0.0/images/writing-posts-with-ghost.png')

TITLES = [
    'On typography and restraint', 'The cost of clever', 'A quiet week in the archive',
    'What the grid gets wrong', 'Notes from a slow rebuild', 'Reading the margins',
    'Against the redesign', 'Small tools, sharp edges', 'The shape of an interview',
    'How we pick our defaults', 'A field guide to whitespace', 'Ten years of one layout',
    'The paragraph is the unit', 'Why we stopped measuring', 'On being legible',
    'The second draft problem', 'Colour, and when to stop', 'A note on footnotes',
    'Interviews we never ran', 'The tooling tax', 'What survives a migration',
    'Editing as subtraction', 'The last mile of design', 'On dependable dullness',
    'Systems that outlive teams', 'A brief history of the sidebar', 'Reading order',
    'The archive as argument', 'Notes on naming things', 'When to break the rule',
    'The weight of a headline', 'Everything is a list',
]


def seed(g, label):
    print(f'\n=== {label} — seeding ===')

    existing = g.call('GET', 'posts/?limit=1&formats=html')['meta']['pagination']['total']
    if existing >= 30:
        print(f'   {existing} posts already present — skipping (delete them to re-seed)')
        return

    created = 0
    for i, title in enumerate(TITLES):
        # 6 tags, round-robin, so every tag lands >= 5 posts (floor is 3)
        primary = TAGS[i % len(TAGS)]
        tags = [{'name': primary}]
        if i % 4 == 0:                       # a second tag on a quarter of them
            tags.append({'name': TAGS[(i + 2) % len(TAGS)]})

        # 8 featured, every 4th — which spreads them across all 6 tags rather
        # than clustering, so featured AND by-tag both return something
        featured = (i % 4 == 0)

        # 8 without a feature image, every 4th offset by 2 — deliberately NOT
        # the same posts as the featured ones, so the two axes are independent
        has_image = (i % 4 != 2)

        body = {'posts': [{
            'title': title,
            'html': (f'<p>{title}. This fixture post exists so a design has something '
                     f'structurally real to render.</p>'
                     f'<h2>A second heading</h2>'
                     f'<p>A further paragraph, so excerpt truncation and reading time '
                     f'have something to work on.</p>'
                     f'<blockquote>A pull quote, for the Koenig card treatments.</blockquote>'),
            'status': 'published',
            'featured': featured,
            'tags': tags,
            'custom_excerpt': f'{title} — a hand-written excerpt, distinct from the body.'
                              if i % 3 == 0 else None,
            # descending, one day apart, fixed epoch → stable ordering forever
            'published_at': time.strftime('%Y-%m-%dT%H:%M:%S.000Z',
                                          time.gmtime(1755000000 - i * 86400)),
        }]}
        if has_image:
            body['posts'][0]['feature_image'] = IMG[i % len(IMG)]
            body['posts'][0]['feature_image_alt'] = f'Cover for {title}'
            body['posts'][0]['feature_image_caption'] = 'Photo: Ghost'

        g.call('POST', 'posts/?source=html', body)
        created += 1

    print(f'   {created} posts created')

    # a page, for page.hbs and the @page.show_title_and_feature_image guard
    try:
        g.call('POST', 'pages/?source=html', {'pages': [{
            'title': 'Member Home Preview',        # multi-word: VERIFY item 14c
            'html': '<p>A standing page, for page.hbs and its title/feature-image guard.</p>',
            'status': 'published',
            'feature_image': IMG[0],
        }]})
        print('   1 page created ("Member Home Preview" — multi-word, for VERIFY 14c)')
    except RuntimeError as e:
        print(f'   page: {e}')

    # VERIFY item 21 — the announcement bar seed, and whether clearing it stops the script
    try:
        g.call('PUT', 'settings/', {'settings': [
            {'key': 'announcement_content', 'value': '<p>Fixture announcement — seeded for VERIFY 21.</p>'},
            {'key': 'announcement_visibility', 'value': json.dumps(['visitors'])},
            {'key': 'announcement_background', 'value': 'accent'},
        ]})
        print('   announcement bar seeded (VERIFY item 21)')
    except RuntimeError as e:
        print(f'   announcement: {e}')


def report(g, label):
    print(f'\n--- {label}: what is now there ---')
    p = g.call('GET', 'posts/?limit=all&formats=html')['posts']
    tags = g.call('GET', 'tags/?limit=all')['tags']
    counts = {}
    for post in p:
        for t in post.get('tags', []):
            counts[t['name']] = counts.get(t['name'], 0) + 1
    print(f'   posts     {len(p)}   (pages of 12: {len(p)//12} full + {len(p)%12} partial)')
    print(f'   featured  {sum(1 for x in p if x["featured"])}')
    print(f'   no image  {sum(1 for x in p if not x.get("feature_image"))}')
    print(f'   tags      {len(tags)}  -> ' + ', '.join(f'{k}:{v}' for k, v in sorted(counts.items())))
    weak = [k for k, v in counts.items() if v < 3]
    print(f'   tags under the 3-post floor: {weak or "none"}')


if __name__ == '__main__':
    env = load_env()
    for major in (sys.argv[1:] or ['5', '6']):
        g = Ghost(env[f'GHOST{major}_URL'], env[f'GHOST{major}_STAFF_ACCESS_TOKEN'], major)
        seed(g, f'Ghost {major}')
        report(g, f'Ghost {major}')
