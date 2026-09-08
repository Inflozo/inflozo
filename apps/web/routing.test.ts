import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { route, stripApp } from './routing.ts'

test('stripApp takes the internal prefix off as a segment, never as a prefix', () => {
  assert.equal(stripApp('/app'), '/')
  assert.equal(stripApp('/app/'), '/')
  assert.equal(stripApp('/app/sites'), '/sites')
  assert.equal(stripApp('/'), '/')
  assert.equal(stripApp('/sites'), '/sites')
  assert.equal(stripApp('/apply'), '/apply')
})

test('the app host rewrites to the internal prefix and keeps the query', () => {
  assert.deepEqual(route('app.inflozo.com', '/', ''), { kind: 'rewrite', path: '/app/' })
  assert.deepEqual(route('app.inflozo.com', '/', '?token=T'), {
    kind: 'rewrite',
    path: '/app/?token=T',
  })
})

test('the apex sends the app prefix to the app host, query intact', () => {
  assert.deepEqual(route('inflozo.com', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
  assert.deepEqual(route('inflozo.com', '/app/signin', '?next=%2Fdashboard'), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/signin?next=%2Fdashboard',
  })
  assert.deepEqual(route('inflozo.com', '/app', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/',
  })
})

test('/app is a segment, not a prefix', () => {
  for (const p of ['/apply', '/apps', '/appearance', '/approach']) {
    assert.deepEqual(route('inflozo.com', p, ''), { kind: 'pass' }, p)
  }
})

test('the app host never double-prefixes', () => {
  assert.deepEqual(route('app.inflozo.com', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
})

test('only the two exact hosts route', () => {
  assert.deepEqual(route('www.inflozo.com', '/app/x', ''), { kind: 'pass' })
  assert.deepEqual(route('ghost5.inflozo.com', '/app/x', ''), { kind: 'pass' })
  assert.deepEqual(route('notinflozo.com', '/app/x', ''), { kind: 'pass' })
})

test('the host header may carry a port or capitals', () => {
  assert.deepEqual(route('APP.INFLOZO.COM', '/', ''), { kind: 'rewrite', path: '/app/' })
  assert.deepEqual(route('inflozo.com:3000', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
})

test('localhost is untouched, so dev needs no host tricks', () => {
  assert.deepEqual(route('localhost:3000', '/', ''), { kind: 'pass' })
  assert.deepEqual(route('localhost:3000', '/app', ''), { kind: 'pass' })
})

/*
 * THE MATCHER IS A LITERAL IN `proxy.ts` — Next extracts `config` statically, so it cannot be
 * imported from here — and until this test its only control was a curl on the deployed site:
 * mistype `icon.svg` and every gate stays green while app.inflozo.com rewrites the favicon to
 * /app/icon.svg and 404s (review of Story 1.6, 2026-09-06). So the literal is read back as text,
 * the way `app-routes.test.ts` reads `TYPES`, and run. The excluded files are DERIVED: every
 * metadata icon under `app/` and every file under `public/brand/`, never a restated name.
 */
test('the proxy matcher leaves the root-served identity files alone and still sees app paths', () => {
  const literal = /matcher: \['([^']+)'\]/.exec(readFileSync('proxy.ts', 'utf8'))
  assert.ok(literal, 'proxy.ts has no `matcher: [\'…\']` literal')
  const matcher = new RegExp(`^${literal[1]}$`)

  const icons = readdirSync('app').filter((f) => /^(icon|apple-icon)\./.test(f))
  assert.ok(icons.length > 0, 'no metadata icon under app/')
  // EVERY FOLDER UNDER `public/`, derived rather than listed: Story 3.2 added `public/connect/`
  // for the wizard's screenshot and a hand list would have shipped it 404ing on the app host with
  // every check green — the same failure the identity files had (counts and membership are
  // derived, never restated). A file added to a folder already excluded is covered by this too.
  // A file placed directly in `public/` (a `robots.txt`, an `og.png`) is served from the root and
  // is in the same danger, so it is walked too (review, 2026-09-08).
  const served = readdirSync('public', { withFileTypes: true })
    .flatMap((entry) =>
      entry.isDirectory()
        ? readdirSync(join('public', entry.name)).map((f) => `/${entry.name}/${f}`)
        : [`/${entry.name}`],
    )
  assert.ok(served.length > 0, 'public/ has no served folders — this loop would assert nothing')

  for (const path of [...icons.map((f) => `/${f}`), ...served, '/favicon.ico', '/_next/static/x.js']) {
    assert.ok(!matcher.test(path), `${path} is inside the matcher — the app host would rewrite it to /app${path}`)
  }
  // `/sites/connect` is Story 3.2's own route and `connect/` is its exclusion: the one must stay
  // inside the matcher while the other stays out (review, 2026-09-08).
  for (const path of ['/', '/sites', '/sites/connect', '/apply', '/sign-in', '/branding']) {
    assert.ok(matcher.test(path), `${path} escaped the proxy — no rewrite, no CSP, no session refresh`)
  }
})
