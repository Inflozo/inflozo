#!/usr/bin/env node
/**
 * STORY 7.16a — THE ROUTES RECORDER (MEASUREMENTS §82): every `routes.yaml` the Routes Manager writes, read by Ghost's own
 * route-settings code on both majors, and one emitted file uploaded to T1 and read back as a visitor sees it. Standing
 * rule 1 for every Ghost claim the Routes page makes ("Ghost will accept this routing"): `routes.ts`' facts F1–F7 were read
 * in Ghost's source; this executes them.
 *
 *   node tools/probe/record-routes.mjs         # the local half: read only, writes nothing anywhere
 *   node tools/probe/record-routes.mjs --t1    # the local half, then T1 — the owner's go, in the MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` writes; ANY other argument (`--help` included) prints this and exits
 * 2 without a request. Node 24: it imports `packages/section-runtime/src/routes.ts` and `routes-fixtures.ts` through type
 * stripping, so the files judged are the ones `routesYaml` writes, never a copy.
 *
 * THE LOCAL HALF (both modes; network reads only: registry.npmjs.org). Into a FRESH temp dir it downloads the Ghost
 * 6.58.0 and 5.130.6 npm tarballs, each refused unless its sha512 is the pin below AND the registry's `dist.integrity`;
 * extracts only `package.json`, `core/server/services/route-settings/` and `core/frontend/services/routing/config.js`
 * (5's `validate.js` requires it); and `npm install --ignore-scripts`es beside each only what those files require, at
 * that Ghost's own exact pins, read from its package.json. Then, for every fixture in `ROUTES_FIXTURES` (one list with
 * `routes.test.ts`), `routesYaml(parseRoutesConfig(config))` goes through:
 *   - Ghost 6: `yaml-parser.js`, then `route-settings-parser.js`' `parseRouteSettings(parsed, text)` — the pair
 *     `dynamic-routing-service.js:81-90` runs on an upload, before anything is stored;
 *   - Ghost 5: `yaml-parser.js`, then `validate.js` — `SettingsLoader.js:33-36`'s pair.
 * Each must accept the file AND read it back as meant: the collections in the config's order with `/` last, each filter
 * exactly the fixture's hand-written NQL, each limit and template, each route, the taxonomies.
 *
 * THE CONTROLS (standing rule 2), each voiding the run: `limit: abc` planted on a collection is REFUSED by Ghost 6
 * (`LimitField`); Ghost 5's answer to the same plant is RECORDED, not judged (F3: it checks nothing). A collection with
 * its `permalink:` line removed is REFUSED by Ghost 5's `validate.js` and by Ghost 6 — so "accepted" means something on
 * both. A refusal counts only as Ghost's own ValidationError naming the planted key.
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x; T3 is retired, R-238 — Ghost 5 on a server is DW-326's). It runs only after
 * the local half held, and the files it uploads have been through both parsers first. With the STAFF token, each its
 * own printed check:
 *   1. `GET settings/routes/yaml/` — T1's own file, saved to the temp dir and kept in memory BEFORE any write; nothing
 *      is written if it cannot be. Then, read only: `site/`, `themes/` (the active theme), every published post's
 *      address, and the busiest public tag with at least 3 published posts, one of them listed on `/` (the control
 *      for "/ does not list them"); `/inflozo-probe/` must answer 404 and `/inflozo-probe-featured/rss/` must not
 *      serve a feed, so both segments are free.
 *   2. ONE emitted file — `routesYaml` of a parsed config `validateRoutes` passes, never hand-written: a collection
 *      `/inflozo-probe/` filtering that tag with `limit: 2`, a featured channel `/inflozo-probe-featured/`, the index
 *      last. Its template, `custom-inflozo-probe.hbs`, is in no theme, so both render with Ghost's fallback `index`
 *      (F6; recorded against `themes/`) — a theme's own `custom-*` files are post templates, and a listing drawn with
 *      one shows no posts to count.
 *   3. Read back anonymously: every tagged post's Admin `url` is `/inflozo-probe/<slug>/` and the page answers 200
 *      there; the collection's page 1 links exactly 2 of the tag's posts and `/page/2/` the next ones; `/` links none;
 *      `/inflozo-probe-featured/rss/` serves RSS. Posts are counted as links to known post addresses, so no theme's
 *      markup is assumed — the counts are printed.
 *   4. CONTROL: the same file with the index collection FIRST AND WITHOUT ITS FILTER — Ghost's default `/` block — is
 *      uploaded: the collection answers 200 listing none of the tag's posts, and they are back under `/`. Its filter
 *      goes too because the inverse filter alone already keeps every tagged post out of `/`: the first router WHOSE
 *      FILTER MATCHES owns a post (`lazy-url-service.js:300-303`), so moving `/` alone changes nothing.
 *   5. RESTORE, in a `finally` that encloses every write: T1's own bytes uploaded and read back, byte for byte.
 *
 * WHAT IT WRITES TO THE SERVER: T1 only, with --t1 only — three `POST settings/routes/yaml/` (the emitted file, the
 * index-first control, the restore) and nothing else: no post, tag, theme, member or setting.
 * WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §82 alone, replacing an earlier §82 of its own so a
 * re-run re-records. The local half writes nothing to the repo; its temp dir is removed, and a --t1 run keeps its own
 * (T1's original routes.yaml is in it) and prints where.
 *
 * NO KEY IS EVER PRINTED: `GHOST6_URL` and `GHOST6_STAFF_ACCESS_TOKEN` are read from tools/probe/.env in-process (never
 * argv, never the environment), the token signs a 5-minute JWT, and every error is scrubbed of it.
 */
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import crypto from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const SELF = fileURLToPath(import.meta.url)
const ARGS = process.argv.slice(2)
// a recorder that ran on `--help` would write to T1; the header is the help (memory: probe recorders ignore --help)
if (!(ARGS.length === 0 || (ARGS.length === 1 && ARGS[0] === '--t1'))) {
  console.error(fs.readFileSync(SELF, 'utf8').split('*/')[0])
  process.exit(2)
}
const T1 = ARGS[0] === '--t1'
const REPO = path.join(path.dirname(SELF), '..', '..')
const MEASUREMENTS = path.join(REPO, '_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md')
const SECTION = '82'
const COMMAND = 'node tools/probe/record-routes.mjs --t1'
const SRC = path.join(REPO, 'packages/section-runtime/src')
const { ROUTES_FIXTURES } = await import(path.join(SRC, 'routes-fixtures.ts'))
const { parseRoutesConfig, validateRoutes, routesYaml } = await import(path.join(SRC, 'routes.ts'))

/** Each Ghost's tarball pin (`npm view ghost@<v> dist.integrity`; 6.58.0's is record-theme-assembly.py's) and the
 *  packages its route-settings files `require` — js-yaml, @tryghost/tpl and @tryghost/errors in both, zod (6's parser)
 *  or lodash (5's validate.js). */
const GHOSTS = {
  '6.58.0': { integrity: 'sha512-4upiXdkeXgDl6gUpTs/rFm6qGSwrR7J0N4TWHQuOHftSNxwxH+1OqM76xqPNl1kdL6/8lR5h0FRjvBk5kBPXtQ==', needs: ['js-yaml', 'zod', '@tryghost/tpl', '@tryghost/errors'] },
  '5.130.6': { integrity: 'sha512-CAWqPKt+7ws+/1NrVmvuiWiDZDEtutiu7niVMTku9uM29MjfNFFUVKM3giQBpZGZrUORXkWiXSlqbry4QGVrBw==', needs: ['js-yaml', 'lodash', '@tryghost/tpl', '@tryghost/errors'] },
}
const RS = 'package/core/server/services/route-settings'
const MEMBERS = ['package/package.json', RS, 'package/core/frontend/services/routing/config.js']
const NPM = path.join(path.dirname(process.execPath), 'npm')

const COLL = 'inflozo-probe'
const CHAN = 'inflozo-probe-featured'
const TEMPLATE = 'custom-inflozo-probe.hbs'

class Void extends Error {}
/** every key this run read, scrubbed from anything it prints */
const SECRETS = []
const clean = (s) => SECRETS.reduce((t, k) => t.split(k).join('<token>'), String(s))
const rows = []
const row = (half, where, what, ok, got = '') => {
  rows.push({ half, where, what, ok, got: String(got) })
  console.log(clean(`  ${ok ? 'PASS' : 'FAIL'}  ${where} — ${what}${got === '' ? '' : ` — ${got}`}`))
}
const canon = (v) =>
  Array.isArray(v) ? `[${v.map(canon).join(',')}]`
    : v !== null && typeof v === 'object' ? `{${Object.keys(v).filter((k) => v[k] !== undefined).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}`
      : JSON.stringify(v)
const stem = (file) => file.replace(/\.hbs$/, '')

/* ───────────────────────────── the local half: Ghost's own code, from its tarballs ───────────────────────────── */

async function ghostTree(tmp, version, { integrity, needs }) {
  const meta = await (await fetch(`https://registry.npmjs.org/ghost/${version}`)).json()
  if (meta.dist?.integrity !== integrity) throw new Void(`the registry's integrity for ghost@${version} is not the pin`)
  const r = await fetch(`https://registry.npmjs.org/ghost/-/ghost-${version}.tgz`)
  if (!r.ok) throw new Void(`the ghost@${version} tarball answered HTTP ${r.status}`)
  const bytes = Buffer.from(await r.arrayBuffer())
  const got = `sha512-${crypto.createHash('sha512').update(bytes).digest('base64')}`
  if (got !== integrity) throw new Void(`the ghost@${version} tarball is not the pinned one: ${got.slice(0, 24)}…`)
  const dir = path.join(tmp, `ghost-${version}`)
  const tgz = path.join(tmp, `ghost-${version}.tgz`)
  fs.mkdirSync(dir)
  fs.writeFileSync(tgz, bytes)
  execFileSync('tar', ['-xzf', tgz, '-C', dir, ...MEMBERS])
  fs.rmSync(tgz)
  const deps = JSON.parse(fs.readFileSync(path.join(dir, 'package/package.json'), 'utf8')).dependencies ?? {}
  const pins = needs.map((n) => {
    if (!/^\d+\.\d+\.\d+$/.test(deps[n] ?? '')) throw new Void(`ghost@${version} pins ${n} as ${deps[n]}, not one exact version`)
    return [n, deps[n]]
  })
  // beside `package/`, never inside it: Node finds `<dir>/node_modules` walking up from the extracted files
  execFileSync(NPM, ['install', '--prefix', dir, '--no-save', '--no-package-lock', '--ignore-scripts', '--no-audit', '--no-fund',
    '--loglevel=error', ...pins.map(([n, v]) => `${n}@${v}`)], { cwd: tmp, stdio: ['ignore', 'ignore', 'inherit'] })
  for (const [n, v] of pins) {
    const installed = JSON.parse(fs.readFileSync(path.join(dir, 'node_modules', n, 'package.json'), 'utf8')).version
    if (installed !== v) throw new Void(`${n} ${installed} installed for ghost@${version}, which pins ${v}`)
  }
  const req = createRequire(SELF)
  const at = (f) => req(path.join(dir, RS, f))
  const yaml = at('yaml-parser.js')
  if (version.startsWith('6.')) {
    const { parseRouteSettings } = at('route-settings-parser.js')
    return { version, pins, read: (text) => shape6(parseRouteSettings(yaml(text), text)) }
  }
  const validate = at('validate.js')
  return { version, pins, read: (text) => shape5(validate(yaml(text))) }
}

/** Ghost 6's parsed settings, in one shape: collections in registration order, routes by path. */
const shape6 = (s) => ({
  collections: s.collections.map((c) => ({ path: c.path, templates: c.templates, filter: c.filter, limit: c.limit })),
  routes: Object.fromEntries(s.routes.map((r) => [r.path, { channel: r.type === 'channel', templates: r.templates, filter: r.filter, limit: r.limit }])),
  taxonomies: s.taxonomies,
})
/** Ghost 5's validated object, in the same shape (its permalinks are rewritten to `:slug`, put back for the compare). */
const shape5 = (o) => ({
  collections: Object.entries(o.collections).map(([p, c]) => ({ path: p, templates: c.templates, filter: c.filter, limit: c.limit })),
  routes: Object.fromEntries(Object.entries(o.routes).map(([p, r]) => [p, { channel: r.controller === 'channel', templates: r.templates, filter: r.filter, limit: r.limit }])),
  taxonomies: Object.fromEntries(Object.entries(o.taxonomies).map(([k, v]) => [k, v.replace(/:(\w+)/g, '{$1}')])),
})

/** What a file must read back as: the config's collections in order then `/`, every filter the fixture's hand-written
 *  NQL (`where` is `collections.<path>` or `routes.<path>`), every other key from the config itself. */
function intended(config, filters, indexFirst = false) {
  const f = Object.fromEntries(filters.map((x) => [x.where, x.nql]))
  const index = { path: '/', templates: ['index'], filter: f['collections./'] }
  const own = config.collections.map((c) => ({ path: c.path, templates: [stem(c.template)], filter: f[`collections.${c.path}`], limit: c.limit }))
  return {
    collections: indexFirst ? [index, ...own] : [...own, index],
    routes: Object.fromEntries(config.routes.map((r) => [r.path, { channel: 'channel' in r, templates: [stem(r.template)], filter: f[`routes.${r.path}`], limit: r.limit }])),
    taxonomies: { tag: `/${config.taxonomies.tag}/{slug}/`, author: `/${config.taxonomies.author}/{slug}/` },
  }
}

const said = (err) => `${err?.errorType ?? err?.name}: ${err?.message}`.replace(/\s+/g, ' ')
const brief = (s) => `order ${s.collections.map((c) => c.path).join(' ')} · filters ${[...s.collections, ...Object.values(s.routes)].filter((x) => x.filter !== undefined).length} · limits [${[...s.collections, ...Object.values(s.routes)].map((x) => x.limit).filter((l) => l !== undefined).join(', ')}] · routes ${Object.keys(s.routes).length}`

/** One file through one Ghost: accepted AND read back as meant. */
function judge(g, name, text, want) {
  let got
  try {
    got = g.read(text)
  } catch (err) {
    return row('local', `[${g.version}] ${name}`, 'REFUSED by Ghost\'s own parser', false, said(err))
  }
  const ok = canon(got) === canon(want)
  row('local', `[${g.version}] ${name}`, 'accepted, and read back as meant', ok, ok ? brief(got) : `got ${canon(got)} — meant ${canon(want)}`)
}

/** A planted file: refused as Ghost's own ValidationError naming `key` — or, `judged` false, only recorded. */
function plant(g, name, text, key, judged = true) {
  try {
    const got = g.read(text)
    if (judged) row('local', `[${g.version}] CONTROL ${name}`, 'refused', false, `ACCEPTED as ${canon(got)}`)
    else row('local', `[${g.version}] RECORDED ${name}`, 'what this Ghost does with it (F3: Ghost 5 checks nothing)', true, `accepted, limit read as ${JSON.stringify(got.collections[0]?.limit)}`)
  } catch (err) {
    const own = err?.errorType === 'ValidationError' && err.message.includes(key)
    if (judged) row('local', `[${g.version}] CONTROL ${name}`, `refused as Ghost's ValidationError naming ${key}`, own, said(err))
    else row('local', `[${g.version}] RECORDED ${name}`, 'what this Ghost does with it — REFUSED, which F3 does not say', true, said(err))
  }
}

/** The local half: every fixture through both Ghosts, then the two plants. Returns the two Ghosts for --t1's files. */
async function localHalf(tmp) {
  const ghosts = []
  for (const [version, pin] of Object.entries(GHOSTS)) {
    const g = await ghostTree(tmp, version, pin)
    row('local', `[${version}] tarball`, 'sha512 is the pin and the registry\'s dist.integrity; its own pins installed', true, g.pins.map(([n, v]) => `${n}@${v}`).join(' '))
    ghosts.push(g)
  }
  const files = []
  for (const fx of ROUTES_FIXTURES) {
    const parsed = parseRoutesConfig(fx.config)
    const text = parsed.ok ? routesYaml(parsed.config) : null
    if (text === null) {
      row('local', fx.name, 'the fixture parses and emits a file', false, parsed.ok ? 'routesYaml emitted nothing (default routing)' : parsed.message)
      continue
    }
    files.push({ fx, text })
    for (const g of ghosts) judge(g, fx.name, text, intended(parsed.config, fx.filters))
  }
  // the plants: the first file with a collection `limit:` line — the only hand edits, each asserted to have happened
  const host = files.find((f) => /^ {4}limit: \d+$/m.test(f.text))
  if (host === undefined) throw new Void('no fixture emits a collection limit — the limit plant has nowhere to go')
  const abc = host.text.replace(/^( {4}limit: )\d+$/m, '$1abc')
  const bare = host.text.replace(/^ {4}permalink: \/[a-z0-9-]+\/\{slug\}\/\n/m, '')
  if (abc === host.text || bare === host.text) throw new Void('a plant did not change the file')
  const [g6, g5] = ghosts
  plant(g6, `limit: abc in "${host.fx.name}"`, abc, 'limit')
  plant(g5, `limit: abc in "${host.fx.name}"`, abc, 'limit', false)
  for (const g of ghosts) plant(g, `a collection with no permalink in "${host.fx.name}"`, bare, 'permalink')
  return ghosts
}

/* ───────────────────────────── the --t1 half ───────────────────────────── */

function loadEnv() {
  const env = {}
  for (const line of fs.readFileSync(path.join(REPO, 'tools/probe/.env'), 'utf8').split('\n')) {
    const m = /^(GHOST6_URL|GHOST6_STAFF_ACCESS_TOKEN)=(.*)$/.exec(line)
    if (m && m[2].trim()) env[m[1]] = m[2].trim()
  }
  for (const k of ['GHOST6_URL', 'GHOST6_STAFF_ACCESS_TOKEN']) if (!env[k]) throw new Void(`${k} is not in tools/probe/.env`)
  SECRETS.push(env.GHOST6_STAFF_ACCESS_TOKEN, env.GHOST6_STAFF_ACCESS_TOKEN.split(':')[1])
  return env
}

/** T1's Admin API with the STAFF token — record-ghost-surfaces.cjs's signing — and its site, read anonymously. */
function ghost(env) {
  const origin = new URL(env.GHOST6_URL).origin
  const [kid, secret] = env.GHOST6_STAFF_ACCESS_TOKEN.split(':')
  const jwt = () => {
    const part = (o) => Buffer.from(JSON.stringify(o)).toString('base64url')
    const now = Math.floor(Date.now() / 1000)
    const unsigned = `${part({ alg: 'HS256', typ: 'JWT', kid })}.${part({ iat: now, exp: now + 300, aud: '/admin/' })}`
    return `${unsigned}.${crypto.createHmac('sha256', Buffer.from(secret, 'hex')).update(unsigned).digest('base64url')}`
  }
  const call = async (method, resource, body) => {
    const r = await fetch(`${origin}/ghost/api/admin/${resource}`, { method, body, headers: { Authorization: `Ghost ${jwt()}`, 'Accept-Version': 'v6.0' } })
    if (!r.ok) throw new Error(`T1 admin ${method} ${resource.split('?')[0]} answered HTTP ${r.status}: ${(await r.text()).slice(0, 300)}`)
    return r
  }
  const json = async (resource) => (await call('GET', resource)).json()
  const yamlGet = async () => Buffer.from(await (await call('GET', 'settings/routes/yaml/')).arrayBuffer())
  /** The upload Ghost Admin's Labs page makes: field `routes`, `routes.yaml`, `text/yaml` (`overrides.json:178-181`). */
  const yamlPost = async (bytes) => {
    const form = new FormData()
    form.append('routes', new Blob([bytes], { type: 'text/yaml' }), 'routes.yaml')
    return (await call('POST', 'settings/routes/yaml/', form)).status
  }
  const page = async (p) => {
    const r = await fetch(`${origin}${p}`, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } })
    return { status: r.status, type: r.headers.get('content-type') ?? '', html: await r.text() }
  }
  /** Every same-origin address a page links, as a path. */
  const linked = (html) => new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => {
    try {
      const u = new URL(m[1].replace(/&amp;/g, '&'), origin)
      return u.origin === origin ? u.pathname : null
    } catch {
      return null
    }
  }).filter(Boolean))
  return { origin, json, yamlGet, yamlPost, page, linked }
}

const pathOf = (url) => new URL(url).pathname
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex').slice(0, 16)
const until = async (test, ms = 30000) => {
  for (const end = Date.now() + ms; ; await new Promise((r) => setTimeout(r, 1000))) {
    if (await test()) return true
    if (Date.now() > end) return false
  }
}

async function t1Half(tmp, [g6, g5]) {
  const g = ghost(loadEnv())
  const T = (where, what, ok, got) => row('t1', where, what, ok, got)
  // 1. T1's own file, saved before anything else happens
  const original = await g.yamlGet()
  if (original.length === 0) throw new Void("T1 answered an empty routes.yaml — nothing to restore, so nothing is written")
  const saved = path.join(tmp, 'original-routes.yaml')
  fs.writeFileSync(saved, original)
  T('1 settings/routes/yaml/', "T1's own routes.yaml read and saved before any write", true, `${original.length} bytes, sha256 ${sha(original)}… → ${saved}`)
  const site = (await g.json('site/')).site
  const theme = (await g.json('themes/')).themes.find((t) => t.active)
  const themeHas = (theme?.templates ?? []).some((t) => [TEMPLATE, stem(TEMPLATE)].includes(t.filename))
  T('1 themes/', `the active theme carries no ${TEMPLATE}, so the collection and channel render with Ghost's fallback index (F6)`, !themeHas, `${theme?.name} — custom templates: ${(theme?.templates ?? []).map((t) => t.filename).join(', ') || 'none'}`)
  const tagPosts = async (slug) => (await g.json(`posts/?filter=${encodeURIComponent(`tag:'${slug}'+status:published`)}&limit=all&fields=id,slug,url`)).posts
  const home0 = g.linked((await g.page('/')).html)
  const tags = (await g.json('tags/?include=count.posts&limit=all&filter=visibility:public')).tags.sort((a, b) => (b.count?.posts ?? 0) - (a.count?.posts ?? 0))
  let pick = null
  for (const t of tags.filter((x) => (x.count?.posts ?? 0) >= 3)) {
    const posts = await tagPosts(t.slug)
    if (posts.length >= 3 && posts.some((p) => home0.has(pathOf(p.url)))) { pick = { tag: t.slug, posts }; break }
  }
  if (pick === null) throw new Void('T1 has no public tag with 3 published posts, one of them on / — the listing rows would mean nothing')
  const { tag } = pick
  T('1 /', `CONTROL — under T1's own routing, / links at least one of tag ${tag}'s posts`, true, `${pick.posts.filter((p) => home0.has(pathOf(p.url))).length} of ${pick.posts.length}`)
  const free = [await g.page(`/${COLL}/`), await g.page(`/${CHAN}/rss/`)]
  if (free[0].status !== 404 || (free[1].status === 200 && free[1].html.includes('<rss'))) throw new Void(`/${COLL}/ answered ${free[0].status} and /${CHAN}/rss/ ${free[1].status} — a segment this run needs is taken`)
  T(`1 /${COLL}/ · /${CHAN}/rss/`, 'CONTROL — both segments are free before the upload', true, `HTTP ${free[0].status} · HTTP ${free[1].status}`)

  // 2. the file — a config `validateRoutes` passes, emitted by `routesYaml`, never hand-written
  const config = {
    collections: [{ path: `/${COLL}/`, filter: { match: 'all', conditions: [{ field: 'tag', op: 'any', values: [tag] }] }, template: TEMPLATE, limit: 2 }],
    routes: [{ path: `/${CHAN}/`, channel: { match: 'all', conditions: [{ field: 'featured', is: true }] }, template: TEMPLATE }],
    taxonomies: { tag: 'tag', author: 'author' },
  }
  const parsed = parseRoutesConfig(config)
  const problems = parsed.ok ? validateRoutes(config, { templates: [TEMPLATE] }) : [parsed]
  if (!parsed.ok || problems.length > 0) throw new Void(`routes.ts refuses the probe config: ${JSON.stringify(problems)}`)
  const text = routesYaml(parsed.config)
  // CONTROL file — the ONLY hand edit: the `/:` block moved to the top of `collections:` with its `filter:` line dropped,
  // i.e. Ghost's default index first (header, step 4: with its inverse filter, moving `/` alone would change nothing)
  const lines = text.split('\n')
  const from = lines.indexOf('  /:')
  let to = from + 1
  while (lines[to]?.startsWith('    ')) to += 1
  const index = lines.slice(from, to).filter((l) => !l.startsWith('    filter: '))
  const rest = [...lines.slice(0, from), ...lines.slice(to)]
  const control = [rest[0], ...index, ...rest.slice(1)].join('\n')
  if (rest[0] !== 'collections:' || index.length !== 3 || control === text) throw new Void('the index-first control could not be built from the emitted file')
  const filters = [{ where: `collections./${COLL}/`, nql: `tag:'${tag}'` }, { where: 'collections./', nql: `tag:-'${tag}'` }, { where: `routes./${CHAN}/`, nql: 'featured:true' }]
  for (const gg of [g6, g5]) {
    judge(gg, 'the T1 file', text, intended(parsed.config, filters))
    judge(gg, 'the T1 control file (index first, unfiltered)', control, intended(parsed.config, filters.filter((f) => f.where !== 'collections./'), true))
  }
  if (rows.some((r) => !r.ok)) throw new Void('a file this run would upload did not read back as meant — nothing is written')

  const tagged = async () => tagPosts(tag)
  let wrote = false
  try {
    wrote = true
    T('2 POST settings/routes/yaml/', 'the emitted file uploads', true, `HTTP ${await g.yamlPost(text)}`)
    // 3. read back
    const owns = (posts) => posts.every((p) => pathOf(p.url) === `/${COLL}/${p.slug}/`)
    let posts = []
    const moved = await until(async () => owns((posts = await tagged())))
    T('3 posts/ (Admin url)', `every one of tag ${tag}'s published posts lives at /${COLL}/<slug>/`, moved && posts.length >= 3, posts.map((p) => pathOf(p.url)).slice(0, 3).join(' ') + (posts.length > 3 ? ' …' : ''))
    const paths = new Set(posts.map((p) => pathOf(p.url)))
    const first = await g.page(`/${COLL}/${posts[0].slug}/`)
    T(`3 /${COLL}/${posts[0].slug}/`, 'the tagged post answers 200 at its new address', first.status === 200, `HTTP ${first.status}`)
    const p1 = await g.page(`/${COLL}/`)
    const on1 = [...g.linked(p1.html)].filter((p) => paths.has(p))
    T(`3 /${COLL}/`, "page 1 answers 200 and links exactly 2 of the tag's posts (limit: 2)", p1.status === 200 && on1.length === 2, `HTTP ${p1.status}, ${on1.length} linked: ${on1.join(' ')}`)
    const p2 = await g.page(`/${COLL}/page/2/`)
    const on2 = [...g.linked(p2.html)].filter((p) => paths.has(p))
    const want2 = Math.min(2, posts.length - 2)
    T(`3 /${COLL}/page/2/`, `page 2 answers 200 and links the next ${want2}, none of page 1's`, p2.status === 200 && on2.length === want2 && !on2.some((p) => on1.includes(p)), `HTTP ${p2.status}, ${on2.length} linked: ${on2.join(' ')}`)
    const before = new Set(pick.posts.map((p) => pathOf(p.url)))
    const home = [...g.linked((await g.page('/')).html)].filter((p) => paths.has(p) || before.has(p))
    T('3 /', "/ links none of the tag's posts, at either address", home.length === 0, `${home.length} linked`)
    const rss = await g.page(`/${CHAN}/rss/`)
    T(`3 /${CHAN}/rss/`, "the featured channel's feed serves RSS", rss.status === 200 && /xml/.test(rss.type) && rss.html.includes('<rss'), `HTTP ${rss.status}, ${rss.type}, ${(rss.html.match(/<item>/g) ?? []).length} items`)

    // 4. CONTROL — the default index first: the collection owns nothing
    T('4 POST settings/routes/yaml/', 'the index-first control uploads', true, `HTTP ${await g.yamlPost(control)}`)
    const back = await until(async () => (posts = await tagged()).every((p) => pathOf(p.url) === `/${p.slug}/`))
    T('4 posts/ (Admin url)', "CONTROL — with the default index first, every tagged post is back at /<slug>/", back, posts.map((p) => pathOf(p.url)).slice(0, 3).join(' '))
    const c1 = await g.page(`/${COLL}/`)
    // a listed post links wherever it lives now, so all three of its addresses count
    const anywhere = new Set([...paths, ...before, ...posts.map((p) => pathOf(p.url))])
    const onC = [...g.linked(c1.html)].filter((p) => anywhere.has(p))
    const homeC = [...g.linked((await g.page('/')).html)].filter((p) => posts.some((q) => pathOf(q.url) === p))
    T(`4 /${COLL}/`, 'CONTROL — the collection answers 200 and lists none of its posts', c1.status === 200 && onC.length === 0, `HTTP ${c1.status}, ${onC.length} linked`)
    T('4 /', "CONTROL — / links the tag's posts again", homeC.length > 0, `${homeC.length} linked`)
  } finally {
    // 5. RESTORE — whatever failed above
    if (wrote) {
      try {
        await g.yamlPost(original)
        const now = await g.yamlGet()
        T('5 settings/routes/yaml/', "T1's own routes.yaml restored and read back byte for byte", now.equals(original), `${now.length} bytes, sha256 ${sha(now)}… (saved ${sha(original)}…)`)
      } catch (err) {
        T('5 settings/routes/yaml/', `T1's own routes.yaml restored — RESTORE IT BY HAND from ${saved}`, false, clean(err.message))
      }
    }
  }
  return { host: new URL(g.origin).host, version: site?.version, theme: theme?.name, tag, count: pick.posts.length, text, control }
}

/* ───────────────────────────── §82 ───────────────────────────── */

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 160)
function section(t, today) {
  const table = (half, head) => [head, '|---|---|---|---|', ...rows.filter((r) => r.half === half).map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
  return [
    `## ${SECTION}. The Routes Manager's \`routes.yaml\` — every file \`routesYaml\` writes accepted and read back as meant by Ghost 6.58.0's and 5.130.6's own route-settings code, and one emitted file on T1: a tag collection owning its posts two per page, a featured channel's feed, the index-first control and T1's own file restored byte for byte · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — three \`POST settings/routes/yaml/\` to T1 (the emitted file, the index-first control, and T1's own file restored in a \`finally\` that encloses both and read back), and nothing else: no post, tag, theme or setting.`,
    '',
    `**Ghost.** T1 \`${t.host}\` (\`site/\` version ${t.version}), active theme \`${t.theme}\`; the tag \`${t.tag}\` (${t.count} published posts); the template \`${TEMPLATE}\` is in no theme, so the collection and the channel render with Ghost's fallback \`index\` (F6).`,
    '',
    "**The controls, each of which voids the run:** `limit: abc` refused by Ghost 6's own parser; a collection with no `permalink:` refused by both majors' own code; under T1's own routing `/` links one of the tag's posts and both segments are free; and the same file with Ghost's default index FIRST (its inverse filter dropped too — the first router whose filter matches owns a post, `lazy-url-service.js:300-303`, so with the inverse in place `/`'s position alone changes nothing) leaves the collection owning none of its posts and puts them back under `/`.",
    '',
    '**The file uploaded** (`routesYaml`, never hand-written):',
    '',
    '```yaml',
    t.text.trimEnd(),
    '```',
    '',
    '### (a) Ghost\'s own route-settings code, from the npm tarballs (read only)',
    '',
    ...table('local', '| Ghost · file | Row | Got | Held |'),
    '',
    `### (b) T1 \`${t.host}\` (${t.version})`,
    '',
    ...table('t1', '| Step | Row | Got | Held |'),
    '',
    "- **Order decides ownership; the inverse filter decides it too.** With the index last carrying the inverse, the tag's posts live under the collection, two per page, and `/` lists none; with Ghost's default index first, the collection owns nothing. With the inverse in place the index's position is a second guard, not the operative one.",
    "- **`limit:` is the route's own page size**, read by the collection over `posts_per_page`; Ghost 6 refuses a non-number, and Ghost 5's answer is recorded above.",
    '- **What this does NOT say.** Ghost 5 on a server is DW-326\'s, at Story 15.7 (R-238: T3 retired) — its half here is its own code, read locally. Nothing deployed through Inflozo\'s own path (Story 7.17 uploads); no theme template was drawn for a route (Story 7.16b); a relative date in a collection was not executed (R-246 keeps rolling dates to channels).',
  ].join('\n')
}

/** Replace an earlier §82 written by this command in place, or append — a re-run re-records rather than leaving two
 *  (record-theme-assembly.py's `write_section`). */
function writeSection(text) {
  const body = fs.readFileSync(MEASUREMENTS, 'utf8').replace(/\n+$/, '')
  const at = body.indexOf(`\n## ${SECTION}. `)
  const head = at === -1 ? body : body.slice(0, at)
  const rest = at === -1 ? '' : body.slice(at + 1)
  const next = rest.indexOf('\n## ')
  const tail = next === -1 ? '' : rest.slice(next + 1)
  fs.writeFileSync(MEASUREMENTS, `${head.replace(/\n+$/, '')}\n\n${text.replace(/\n+$/, '')}\n${tail ? `\n${tail}\n` : ''}`)
}

/* ───────────────────────────── main ───────────────────────────── */

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'inflozo-routes-'))
let code = 0
try {
  console.log('\n  THE LOCAL HALF — Ghost\'s own route-settings code, from its npm tarballs')
  const ghosts = await localHalf(tmp)
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND}`)
    const t = await t1Half(tmp, ghosts)
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND ASK: Ghost does not route the file as routes.ts claims')
    writeSection(section(t, new Date().toISOString().slice(0, 10)))
    console.log(`\n    MEASUREMENTS.md §${SECTION} written — ${path.relative(REPO, MEASUREMENTS)} — every row held, behind its controls.`)
  } else {
    console.log('\n    PASS — every row held, behind its controls. The local half writes nothing; §82 is the --t1 run\'s.')
  }
} catch (err) {
  const msg = String(err instanceof Void ? err.message : err.stack ?? err)
  console.log(`\n  ** RUN VOID — nothing written to MEASUREMENTS.md. ${clean(msg)}`)
  code = 1
} finally {
  if (T1) console.log(`    temp dir kept (T1's original routes.yaml is in it): ${tmp}`)
  else fs.rmSync(tmp, { recursive: true, force: true })
}
process.exit(code)
