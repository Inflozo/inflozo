#!/usr/bin/env node
/**
 * STORY 7.18a — THE DEPLOY RECORDER (MEASUREMENTS §86): the theme half of DW-51 (a multipart `FormData` body through the
 * product's own request builder), standing rule 1 on the Admin key's right to upload and activate a theme (F4: a source
 * reading until this runs), Ghost's answers to an upload mapped by the product's own rule, and R-260's index filter on a
 * real Ghost's SQL before any Ship it uploads a routing.
 *
 *   node --experimental-strip-types tools/probe/record-deploy.mjs        # the local half: writes nothing anywhere
 *   node --experimental-strip-types tools/probe/record-deploy.mjs --t1   # the local half, then T1 (§86) — the owner's go,
 *                                                                         # in the MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` writes; ANY other argument (`--help` included) prints this and exits 2
 * without a request (memory: probe recorders ignore --help). Node 24: it imports the packages' and the app's TypeScript
 * through type stripping, so every byte judged is the product's own — `tools/pilot-theme.mjs`' pilot theme, the deploy's
 * zip writer (`apps/web/server/deploy/zip.ts`), the request builder (`adminRequest`), Ghost's answers (`uploadAnswer`,
 * `activateAnswer`) and the routing (`indexFilter`).
 *
 * THE LOCAL HALF. It compiles the pilot theme (with §73's stand-in `page.hbs`, Story 10.79's) and a PLANTED FATAL theme
 * (the same theme with one template Handlebars cannot parse — gscan's `GS005-TPL-ERR`, fatal on both pins), zips each
 * TWICE through `zipTheme` (the bytes must be equal: AD-14), and gates each with both pinned gscans and the quality gate.
 * The pilot theme must score 0 errors on both; the planted one must be BLOCKED on both — the control: a gate that never
 * blocks proves nothing.
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x; T3 is retired, R-238 — Ghost 5 on a server is DW-326's, Story 15.7). It runs only
 * after the local half held. Its guards are `record-shim.py`'s: `start_guard` refuses a run while a theme named
 * `inflozo-probe-…` is installed or active (an earlier run did not clean up), and a `finally` re-activates the theme that
 * was active and deletes every probe theme, both read back whichever step failed.
 *   1. The pilot theme, zipped by `zipTheme` as `inflozo-probe-deploy.zip`, uploaded (`POST themes/upload/`, field `file`)
 *      and activated (`PUT themes/inflozo-probe-deploy/activate/`) with the ADMIN key, every request built by `adminRequest`
 *      with no Content-Type of Inflozo's own; both answers mapped by `uploadAnswer` / `activateAnswer`; the activation's
 *      body recorded (F3: never recorded before); the home page read, carrying the run's page word. R-264 (b): the first
 *      upload, under a name that is not active, answers `themes[0].active` false (the control); the probe uploaded AGAIN
 *      once it is active answers true and is still the active theme with no PUT sent — the fact Deploy only's guard rests on.
 *   2. Two CONCURRENT uploads of one name, each answer mapped by `uploadAnswer` (§25f saw one 200 and one 500 `EEXIST`,
 *      mapped to `deploy_running`; whichever Ghost gives is recorded).
 *   3. The planted fatal theme uploaded: Ghost's 422 `ThemeValidationError`, mapped to `ghost_theme_refused`.
 *   4. R-260 on Ghost's own SQL: a Primary tag collection over T1's most-used public tag, and every published post with no
 *      public primary tag (T1 carries one, §84's `probe-gated-post`). The Content API lists posts with the index's filter
 *      exactly as Ghost's collection does (`posts.browse` with `filter=`, the SQL reading): the NEW `indexFilter` lists
 *      every such post; the OLD filter (`primary_tag:-'<tag>'`, Story 7.16a's emission — the control) lists none of them;
 *      and each one's own address answers 200 (ownership, unchanged). Leg 6 then reads the same on Home itself.
 *   5. The finally: the previous theme active again and every `inflozo-probe-` theme deleted, both read back with the
 *      staff token (the Admin key cannot `GET themes/`: 403 on Ghost 6, F4).
 *   6. R-260 ON HOME, end to end (the spec's leg 4 as a visitor reads it), with the site's own theme active again: with the
 *      STAFF token, T1's own `routes.yaml` read and saved before any write; the file `routesYaml` emits for a Primary tag
 *      collection `/inflozo-probe/` over that tag uploaded, and every post with no public primary tag must be linked from a
 *      page of `/`; the CONTROL — the same file with only the index's filter put back to `primary_tag:-'<tag>'` — must
 *      leave each of them on no page of `/` while its own address answers; and in a `finally` T1's own file uploaded and
 *      read back byte for byte (`record-routes.mjs`' restore).
 * WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §86 alone, replacing an earlier §86 of its own.
 *
 * NO KEY IS EVER PRINTED: `GHOST6_URL`, `GHOST6_ADMIN_API_KEY`, `GHOST6_STAFF_ACCESS_TOKEN` and `GHOST6_CONTENT_API_KEY`
 * are read from tools/probe/.env in-process (never argv, never the environment), and every error is scrubbed of them.
 */
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const SELF = fileURLToPath(import.meta.url)
const ARGS = process.argv.slice(2)
if (!(ARGS.length === 0 || (ARGS.length === 1 && ARGS[0] === '--t1'))) {
  console.error(fs.readFileSync(SELF, 'utf8').split('*/')[0])
  process.exit(2)
}
const T1 = ARGS[0] === '--t1'
const REPO = path.join(path.dirname(SELF), '..', '..')
const MEASUREMENTS = path.join(REPO, '_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md')
const SECTION = '86'
const COMMAND = 'node --experimental-strip-types tools/probe/record-deploy.mjs --t1'
const PROBE = 'inflozo-probe-deploy'
const PROBE_PREFIX = 'inflozo-probe-'

const pilots = await import(path.join(REPO, 'tools/pilot-theme.mjs'))
const { zipTheme } = await import(path.join(REPO, 'apps/web/server/deploy/zip.ts'))
const { adminRequest } = await import(path.join(REPO, 'apps/web/server/ghost-admin/admin-rule.ts'))
const { activateAnswer, uploadAnswer } = await import(path.join(REPO, 'apps/web/lib/deploy.ts'))
const { gscanGate, qualityGate } = await import(path.join(REPO, 'packages/theme-compiler/gate/index.ts'))
const { indexFilter, parseRoutesConfig, routesYaml, validateRoutes } = await import(path.join(REPO, 'packages/section-runtime/src/routes.ts'))
const { ROUTES_PATH, routesForm } = await import(path.join(REPO, 'apps/web/lib/routes-upload.ts'))
const { REFERENCE_PACK } = await import(path.join(REPO, 'packages/section-runtime/src/reference.ts'))

class Void extends Error {}
const SECRETS = []
const clean = (s) => SECRETS.reduce((t, k) => t.split(k).join('<key>'), String(s))
const rows = []
const row = (half, where, what, ok, got = '') => {
  rows.push({ half, where, what, ok, got: String(got) })
  console.log(clean(`  ${ok ? 'PASS' : 'FAIL'}  ${where} — ${what}${got === '' ? '' : ` — ${got}`}`))
}
const sha = (b) => crypto.createHash('sha256').update(b).digest('hex')
const nonce = crypto.randomBytes(4).toString('hex')

/* ───────────────────────────── the local half ───────────────────────────── */

/** A template Handlebars cannot parse: gscan's GS005-TPL-ERR, fatal on both pins (§15j: Ghost refuses it with a 422). */
const FATAL = { 'custom-inflozo-probe-fatal.hbs': '{{!< default}}\n{{#if @site.title}}\n  <p>unclosed\n' }

async function localHalf() {
  const words = { pageWord: `Deploy${nonce}`, layerWord: `Layer${nonce}` }
  const compiled = pilots.compilePilots(words, { theme: { name: PROBE, version: '1.0.0', description: 'Deploy probe' } })
  const theme = { ...compiled.files, ...pilots.SCAFFOLD }
  const planted = { ...theme, ...FATAL }
  const out = {}
  for (const [name, files] of [['pilot', theme], ['planted', planted]]) {
    const a = zipTheme(files)
    const b = zipTheme(Object.fromEntries(Object.entries(files).reverse()))
    row('local', `zip · ${name}`, 'zipped twice (the second from the files in reverse order): the same bytes (AD-14)', Buffer.compare(Buffer.from(a), Buffer.from(b)) === 0, `${a.length} bytes, sha256 ${sha(a).slice(0, 16)}…`)
    const gates = {}
    for (const major of [5, 6]) gates[major] = await gscanGate(files, major)
    const quality = qualityGate(files, { pack: REFERENCE_PACK, library: compiled.find })
    out[name] = { zip: a, gates, quality }
  }
  for (const major of [5, 6]) {
    const g = out.pilot.gates[major]
    row('local', `gscan ${g.gscan} · pilot`, `the pilot theme scores 0 errors at v${major}`, g.errors.length === 0, `${g.errors.length} errors · ${g.warnings.length} warnings`)
    const p = out.planted.gates[major]
    // THE CONTROL: the planted template is refused, fatally, by the same checker
    row('local', `gscan ${p.gscan} · planted`, `the planted theme is BLOCKED at v${major}, on GS005-TPL-ERR (the control)`, p.blocked && p.errors.some((e) => e.rule === 'GS005-TPL-ERR' && e.fatal), p.errors.map((e) => e.rule).join(', '))
  }
  row('local', 'quality gate · pilot', 'the pilot theme is not blocked', !out.pilot.quality.blocked, `${out.pilot.quality.errors.length} errors · ${out.pilot.quality.warnings.length} warnings`)
  return { ...out, words }
}

/* ───────────────────────────── the --t1 half ───────────────────────────── */

function loadEnv() {
  const names = ['GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST6_STAFF_ACCESS_TOKEN', 'GHOST6_CONTENT_API_KEY']
  const env = {}
  for (const line of fs.readFileSync(path.join(REPO, 'tools/probe/.env'), 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line)
    if (m && names.includes(m[1]) && m[2].trim()) env[m[1]] = m[2].trim()
  }
  for (const k of names) if (!env[k]) throw new Void(`${k} is not in tools/probe/.env`)
  for (const k of names.slice(1)) SECRETS.push(...[env[k], env[k].split(':')[1]].filter(Boolean))
  return env
}

/** T1 through the product's own request builder — `adminRequest` (DW-51's transport) — with the key named. */
function ghost(env) {
  const siteUrl = env.GHOST6_URL
  const origin = new URL(siteUrl).origin
  const send = async (credential, method, p, body) => {
    const { url, init } = adminRequest({ credential, siteUrl, method, path: p, body, major: 6 })
    const r = await fetch(url, init)
    const text = await r.text()
    let parsed = null
    try {
      parsed = text ? JSON.parse(text) : null
    } catch {
      parsed = null
    }
    return { ok: r.ok, status: r.status, body: parsed, text, headers: init.headers }
  }
  const admin = (method, p, body) => send(env.GHOST6_ADMIN_API_KEY, method, p, body)
  const staff = (method, p, body) => send(env.GHOST6_STAFF_ACCESS_TOKEN, method, p, body)
  const content = async (resource, params) => {
    const q = new URLSearchParams({ key: env.GHOST6_CONTENT_API_KEY, ...params })
    const r = await fetch(`${origin}/ghost/api/content/${resource}/?${q}`, { headers: { 'Accept-Version': 'v6.0' } })
    if (!r.ok) throw new Error(`T1 content ${resource} answered HTTP ${r.status}`)
    return r.json()
  }
  const page = async (p) => {
    const r = await fetch(`${origin}${p}`, { redirect: 'manual', headers: { 'Cache-Control': 'no-cache' } })
    return { status: r.status, html: await r.text() }
  }
  const form = (bytes, name) => {
    const f = new FormData()
    f.append('file', new Blob([bytes], { type: 'application/zip' }), `${name}.zip`)
    return f
  }
  return { origin, admin, staff, content, page, form }
}

const themesOf = async (g) => {
  const r = await g.staff('GET', 'themes/')
  if (!r.ok) throw new Error(`GET themes/ with the staff token answered HTTP ${r.status}`)
  return r.body.themes
}

async function t1Half(local) {
  const env = loadEnv()
  const g = ghost(env)
  const host = new URL(g.origin).host
  const site = (await g.content('settings', {})).settings
  // start_guard (record-shim.py's): the theme to restore, refused while it is a probe
  const before = await themesOf(g)
  const previous = before.find((t) => t.active)?.name
  if (!previous) throw new Void('no active theme reported — refusing to upload with nothing to restore')
  if (previous.startsWith(PROBE_PREFIX)) throw new Void(`the active theme is ${previous}, a probe: an earlier run did not restore. Activate the site's own theme in Ghost admin, then re-run`)
  const left = before.filter((t) => t.name.startsWith(PROBE_PREFIX)).map((t) => t.name)
  if (left.length > 0) throw new Void(`probe themes still installed: ${left.join(', ')} — an earlier run did not clean up. Delete them in Ghost admin, then re-run`)
  const t = { host, previous, version: null, activation: null, concurrent: [], tag: null, untagged: [], untaggedPaths: [], inactiveAnswer: undefined, activeAnswer: undefined }
  try {
    // 1 — upload and activate with the ADMIN key, through adminRequest
    const up = await g.admin('POST', 'themes/upload/', g.form(local.pilot.zip, PROBE))
    const noType = !Object.keys(up.headers).some((h) => h.toLowerCase() === 'content-type')
    row('t1', '1 POST themes/upload/ [admin key]', 'the pilot theme accepted with the Admin key; the request carried no Content-Type of Inflozo\'s own', 'ok' in uploadAnswer(up) && up.body?.themes?.[0]?.name === PROBE && noType, `HTTP ${up.status}; themes[0].name ${up.body?.themes?.[0]?.name}`)
    // R-264 (b)'s CONTROL: an upload under a name that is NOT the active theme's answers `themes[0].active` false
    t.inactiveAnswer = up.body?.themes?.[0]?.active
    row('t1', '1 POST themes/upload/ — themes[0].active', 'R-264 (b)\'s control: an upload under an inactive name answers active false, read by uploadAnswer as not live', up.body?.themes?.[0]?.active === false && uploadAnswer(up).active === false, `active ${JSON.stringify(up.body?.themes?.[0]?.active)}`)
    const act = await g.admin('PUT', `themes/${PROBE}/activate/`)
    t.activation = JSON.stringify({ status: act.status, keys: Object.keys(act.body ?? {}), theme: act.body?.themes?.[0] ? { name: act.body.themes[0].name, active: act.body.themes[0].active, errors: (act.body.themes[0].errors ?? []).length, warnings: (act.body.themes[0].warnings ?? []).length } : null })
    row('t1', `1 PUT themes/${PROBE}/activate/ [admin key]`, 'activated with the Admin key, read by activateAnswer as live; its body recorded (F3)', 'ok' in activateAnswer(act) && act.body?.themes?.[0]?.active === true, t.activation)
    const home = await g.page('/')
    row('t1', '1 GET /', 'the home page is the pilot theme: it carries the run\'s page word', home.status === 200 && home.html.includes(local.words.pageWord), `HTTP ${home.status}`)
    const listed = await themesOf(g)
    row('t1', '1 GET themes/ [staff]', 'the probe is installed and active', listed.some((x) => x.name === PROBE && x.active), listed.filter((x) => x.name.startsWith(PROBE_PREFIX)).map((x) => `${x.name}${x.active ? ' (active)' : ''}`).join(', '))
    // R-264 (b) — the fact Deploy only's guard rests on (VERIFY-AT-BUILD 74): an upload under the ACTIVE theme's name replaces
    // its files and Ghost makes them live at once (`storage.js`' `activateFromAPIOverride`), and its answer says so
    const again = await g.admin('POST', 'themes/upload/', g.form(local.pilot.zip, PROBE))
    t.activeAnswer = again.body?.themes?.[0]?.active
    row('t1', '1b POST themes/upload/ (the active name) — themes[0].active', 'R-264 (b): an upload under the active theme\'s name answers active true, read by uploadAnswer as live, with no PUT', 'ok' in uploadAnswer(again) && again.body?.themes?.[0]?.active === true && uploadAnswer(again).active === true, `HTTP ${again.status}; active ${JSON.stringify(again.body?.themes?.[0]?.active)}`)
    const still = await themesOf(g)
    row('t1', '1b GET themes/ [staff]', 'the probe is still the active theme, with no activation sent', still.find((x) => x.active)?.name === PROBE, still.find((x) => x.active)?.name ?? 'none')

    // 2 — two concurrent uploads of one name
    const pair = await Promise.all([1, 2].map(() => g.admin('POST', 'themes/upload/', g.form(local.pilot.zip, PROBE))))
    t.concurrent = pair.map((r) => {
      const a = uploadAnswer(r)
      return `${r.status}→${'ok' in a ? 'ok' : a.failed}${/EEXIST/.test(r.text) ? ' (EEXIST)' : ''}`
    })
    row('t1', '2 POST themes/upload/ ×2 at once', 'each answer reads as accepted or as deploy_running (§25f\'s EEXIST 500) — never Ghost\'s text', pair.every((r) => {
      const a = uploadAnswer(r)
      return 'ok' in a || a.failed === 'deploy_running'
    }), t.concurrent.join(' · '))

    // 3 — the planted fatal theme
    const fatal = await g.admin('POST', 'themes/upload/', g.form(local.planted.zip, `${PROBE}-fatal`))
    const read = uploadAnswer(fatal)
    row('t1', '3 POST themes/upload/ (planted)', 'Ghost\'s 422 ThemeValidationError, read as ghost_theme_refused with Ghost\'s message as detail', fatal.status === 422 && fatal.body?.errors?.[0]?.type === 'ThemeValidationError' && read.failed === 'ghost_theme_refused', `HTTP ${fatal.status} ${fatal.body?.errors?.[0]?.type}; ${read.failed}; detail ${String(read.detail ?? '').slice(0, 80)}`)

    // 4 — R-260 on Ghost's own SQL, through the Content API's posts.browse
    // the Content API sends `primary_tag` null for a post with no public primary tag (§84) — that set, and no other
    const posts = (await g.content('posts', { limit: 'all', include: 'tags' })).posts
    const untagged = posts.filter((p) => (p.primary_tag ?? null) === null)
    const counts = new Map()
    for (const p of posts) if (p.primary_tag?.visibility === 'public') counts.set(p.primary_tag.slug, (counts.get(p.primary_tag.slug) ?? 0) + 1)
    const tag = [...counts.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))[0]?.[0]
    t.tag = tag
    t.untagged = untagged.map((p) => p.slug)
    t.untaggedPaths = untagged.map((p) => new URL(p.url).pathname)
    if (tag === undefined || untagged.length === 0) {
      row('t1', '4 GET content/posts/', 'T1 has a public tag and a post with no public primary tag to judge R-260 by', false, `tag ${tag}; ${untagged.length} untagged`)
    } else {
      const config = { collections: [{ path: '/inflozo-probe-craft/', filter: { match: 'all', conditions: [{ field: 'primary_tag', op: 'any', values: [tag] }] }, template: 'custom-inflozo-probe.hbs' }], routes: [], taxonomies: { tag: 'tag', author: 'author' } }
      const fresh = indexFilter(config.collections)
      const old = `primary_tag:-'${tag}'` // Story 7.16a's emission for this collection: the control
      const listing = async (filter) => new Set((await g.content('posts', { limit: 'all', filter, fields: 'slug' })).posts.map((p) => p.slug))
      const now = await listing(fresh)
      const then = await listing(old)
      row('t1', '4 GET content/posts/?filter=<new index filter>', `R-260: Home's filter lists every post with no public primary tag (${untagged.length})`, t.untagged.every((s) => now.has(s)), `${fresh} → ${now.size} posts`)
      row('t1', '4 GET content/posts/?filter=<old index filter>', 'the control: the old filter lists none of them (DW-364)', t.untagged.every((s) => !then.has(s)), `${old} → ${then.size} posts`)
      // and a post the collection owns stays off Home either way
      const owned = posts.find((p) => p.primary_tag?.slug === tag)
      row('t1', '4 the collection\'s own post', 'a post whose primary tag is the collection\'s is listed by neither index filter', owned !== undefined && !now.has(owned.slug) && !then.has(owned.slug), owned?.slug ?? '')
      for (const p of untagged.slice(0, 3)) {
        const own = await g.page(new URL(p.url).pathname)
        row('t1', `4 GET ${new URL(p.url).pathname}`, 'its own address answers (ownership unchanged)', own.status === 200, `HTTP ${own.status}`)
      }
    }
  } finally {
    // 5 — restore and delete, both read back whatever failed (record-shim.py's restore_and_delete)
    const back = await g.staff('PUT', `themes/${previous}/activate/`)
    for (const name of [PROBE, `${PROBE}-fatal`]) await g.staff('DELETE', `themes/${name}/`)
    const after = await themesOf(g)
    const active = after.find((x) => x.active)?.name
    const probes = after.filter((x) => x.name.startsWith(PROBE_PREFIX)).map((x) => x.name)
    row('t1', `5 PUT themes/${previous}/activate/ + DELETE + GET themes/ [staff]`, `${previous} active again and no probe theme installed, read back`, active === previous && probes.length === 0, `HTTP ${back.status}; active ${active}; probes ${probes.join(', ') || 'none'}`)
  }
  // 6 — R-260 ON HOME, end to end, with the site's own theme active again (leg 5): only when leg 4 found what to judge by
  if (t.tag !== null && t.untagged.length > 0) await homeLeg(g, t)
  t.version = site?.version ?? null
  return t
}

const HOME_COLL = '/inflozo-probe/'
const HOME_TEMPLATE = 'custom-inflozo-probe.hbs'
const until = async (test, ms = 30000) => {
  for (const end = Date.now() + ms; ; await new Promise((r) => setTimeout(r, 1000))) {
    if (await test()) return true
    if (Date.now() > end) return false
  }
}

/** Every same-origin path the pages of `/` link: `/`, `/page/2/`, … until one does not answer 200 (at most 40 pages). */
async function homeLinks(g) {
  const paths = new Set()
  for (let n = 1; n <= 40; n += 1) {
    const r = await g.page(n === 1 ? '/' : `/page/${n}/`)
    if (r.status !== 200) break
    for (const m of r.html.matchAll(/href="([^"]+)"/g)) {
      try {
        const u = new URL(m[1].replace(/&amp;/g, '&'), g.origin)
        if (u.origin === g.origin) paths.add(u.pathname)
      } catch {}
    }
  }
  return paths
}

/** LEG 6 — the routing Ship it would upload, on T1, read as a visitor reads Home. With the STAFF token (a settings write):
 *  T1's own routes.yaml read and saved before any write; the file `routesYaml` emits for a Primary tag collection uploaded,
 *  and every post with no public primary tag must be linked from a page of `/`; then the CONTROL — the same file with the
 *  index's filter put back to Story 7.16a's `primary_tag:-'<tag>'` (the only hand edit, checked to be exactly one) — and
 *  each such post must leave every page of `/` while its own address still answers; then, in a `finally`, T1's own file
 *  uploaded and read back byte for byte. */
async function homeLeg(g, t) {
  const got = await g.staff('GET', ROUTES_PATH)
  const original = got.ok ? got.text : ''
  if (original.length === 0) return row('t1', `6 GET ${ROUTES_PATH} [staff]`, "T1's own routes.yaml read before any write — nothing is written without it", false, `HTTP ${got.status}`)
  const saved = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'record-deploy-')), 'original-routes.yaml')
  fs.writeFileSync(saved, original)
  const sha = (x) => crypto.createHash('sha256').update(x).digest('hex').slice(0, 16)
  row('t1', `6 GET ${ROUTES_PATH} [staff]`, "T1's own routes.yaml read and saved before any write", true, `${original.length} bytes, sha256 ${sha(original)}… → ${saved}`)
  const free = await g.page(HOME_COLL)
  if (free.status !== 404) return row('t1', `6 GET ${HOME_COLL}`, 'the collection\'s segment is free before the upload', false, `HTTP ${free.status}`)

  const config = { collections: [{ path: HOME_COLL, filter: { match: 'all', conditions: [{ field: 'primary_tag', op: 'any', values: [t.tag] }] }, template: HOME_TEMPLATE }], routes: [], taxonomies: { tag: 'tag', author: 'author' } }
  const parsed = parseRoutesConfig(config)
  const problems = parsed.ok ? validateRoutes(config, { templates: [HOME_TEMPLATE] }) : [parsed]
  if (!parsed.ok || problems.length > 0) return row('t1', '6 routesYaml', 'routes.ts accepts the probe routing', false, JSON.stringify(problems).slice(0, 160))
  const text = routesYaml(parsed.config)
  const fresh = `filter: "${indexFilter(parsed.config.collections)}"`
  const old = `filter: "primary_tag:-'${t.tag}'"`
  const control = text.split(fresh).join(old)
  const once = text.split(fresh).length === 2 && control !== text
  row('t1', '6 routesYaml', 'the emitted file carries R-260\'s index filter once; the control differs from it in that one line', once, fresh)
  if (!once) return

  const want = t.untaggedPaths
  let wrote = false
  try {
    wrote = true
    const a = await g.staff('POST', ROUTES_PATH, routesForm(text))
    row('t1', `6 POST ${ROUTES_PATH} [staff]`, 'the emitted file uploads', a.ok, `HTTP ${a.status}`)
    let links = new Set()
    const listed = await until(async () => {
      links = await homeLinks(g)
      return want.every((p) => links.has(p))
    })
    row('t1', '6 GET / … /page/N/', `R-260 ON HOME: every post with no public primary tag is linked from a page of / (${want.join(', ')})`, a.ok && listed, `${want.filter((p) => links.has(p)).length} of ${want.length} linked; ${links.size} paths over Home's pages`)

    const b = await g.staff('POST', ROUTES_PATH, routesForm(control))
    row('t1', `6 POST ${ROUTES_PATH} [staff] (control)`, "the control file (Story 7.16a's index filter) uploads", b.ok, `HTTP ${b.status}`)
    const gone = await until(async () => {
      links = await homeLinks(g)
      return want.every((p) => !links.has(p))
    })
    row('t1', '6 GET / … /page/N/ (control)', "the CONTROL: under the old filter no such post is linked from any page of / (DW-364)", b.ok && gone, `${want.filter((p) => links.has(p)).length} of ${want.length} still linked`)
    for (const p of want.slice(0, 3)) {
      const own = await g.page(p)
      row('t1', `6 GET ${p} (control)`, 'its own address still answers — owned, listed nowhere', own.status === 200, `HTTP ${own.status}`)
    }
  } finally {
    if (wrote) {
      const put = await g.staff('POST', ROUTES_PATH, routesForm(original)).catch((e) => ({ ok: false, status: clean(e.message) }))
      const now = await g.staff('GET', ROUTES_PATH).catch(() => ({ ok: false, text: '' }))
      const same = now.ok && now.text === original
      row('t1', `6 POST + GET ${ROUTES_PATH} [staff]`, `T1's own routes.yaml restored and read back byte for byte${same ? '' : ` — RESTORE IT BY HAND from ${saved}`}`, put.ok && same, `HTTP ${put.status}; ${now.text.length} bytes, sha256 ${sha(now.text)}… (saved ${sha(original)}…)`)
    }
  }
}

/* ───────────────────────────── §86 ───────────────────────────── */

const cell = (s) => String(s).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 200)
const tableOf = (list) => ['| Step | Row | Got | Held |', '|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
function section(t, today) {
  return [
    `## ${SECTION}. The deploy's theme upload on T1 — the pilot theme zipped by Inflozo's own writer, uploaded and activated with the ADMIN key through \`adminRequest\` (DW-51's theme half), two concurrent uploads and a planted fatal theme read by \`uploadAnswer\`, R-260's index filter listing every post with no primary tag on Ghost's own SQL and on Home, and ${t.previous} and T1's routes.yaml restored · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — uploads of \`${PROBE}.zip\` (one, then two at once) and \`${PROBE}-fatal.zip\` (refused), one activation, every one with the Admin key; then, with the staff token, \`${t.previous}\` re-activated and both probe themes deleted in a \`finally\`, read back; then, with the staff token, the emitted \`routes.yaml\` and its control uploaded and T1's own file put back in a \`finally\`, read back byte for byte. No post, tag or other setting written.`,
    '',
    `**Ghost.** T1 \`${t.host}\`; the theme active before the run \`${t.previous}\`; the collection's tag \`${t.tag}\`; the posts with no public primary tag ${t.untagged.map((s) => `\`${s}\``).join(', ')}.`,
    '',
    "**The controls, each of which voids the run:** the planted theme is blocked by both pinned gscans locally (`GS005-TPL-ERR`, fatal) and refused by Ghost with a 422; each zip is the same bytes twice; the OLD index filter lists none of the posts the NEW one must list.",
    '',
    ...tableOf(rows),
    '',
    `- **The Admin key uploads and activates a theme** (F4, until now a source reading of \`tokenPermissionCheck\`), through the product's request builder: a \`FormData\` body under \`file\`, the zip named by the theme, no Content-Type of Inflozo's own. The activation answered \`${t.activation}\`.`,
    `- **Two uploads of one name at once** answered ${t.concurrent.join(' and ')}.`,
    `- **An upload under the ACTIVE theme's name goes live at once, and says so** (R-264 b, VERIFY-AT-BUILD 74): \`themes[0].active\` was ${JSON.stringify(t.activeAnswer)} for the re-upload of the live probe, against ${JSON.stringify(t.inactiveAnswer)} for the first upload under an inactive name (the control) — which is why Deploy only is greyed while the project's theme is the live one, and why Ship it reads the answer before any activation.`,
    "- **What this does NOT say.** Ghost 5 on a server is DW-326's, at Story 15.7 (R-238). The product's `call()` (its database, Vault and audit rows) and the deploy route are the deployed walk's (step 113); Ghost(Pro)'s plan refusal is read in source only (F7, VERIFY 1–3). R-260 is executed twice: through the Content API's `posts.browse` (Ghost's SQL alone, leg 4) and on Home under the uploaded routing (leg 6), each behind the old filter as its control.",
  ].join('\n')
}

function writeSection(n, text) {
  const body = fs.readFileSync(MEASUREMENTS, 'utf8').replace(/\n+$/, '')
  const at = body.indexOf(`\n## ${n}. `)
  const head = at === -1 ? body : body.slice(0, at)
  const rest = at === -1 ? '' : body.slice(at + 1)
  const next = rest.indexOf('\n## ')
  const tail = next === -1 ? '' : rest.slice(next + 1)
  fs.writeFileSync(MEASUREMENTS, `${head.replace(/\n+$/, '')}\n\n${text.replace(/\n+$/, '')}\n${tail ? `\n${tail}\n` : ''}`)
}

/* ───────────────────────────── main ───────────────────────────── */

let code = 0
try {
  console.log('\n  THE LOCAL HALF — the pilot theme and the planted one, zipped twice and gated on both pinned gscans')
  const local = await localHalf()
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND}`)
    const t = await t1Half(local)
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND ASK: Ghost does not take the theme as the deploy claims')
    writeSection(SECTION, section(t, new Date().toISOString().slice(0, 10)))
    console.log(`\n    MEASUREMENTS.md §${SECTION} written — every row held, behind its controls.`)
  } else {
    console.log('\n    PASS — every row held, behind its controls. The local half writes nothing; §86 is the --t1 run\'s.')
  }
} catch (err) {
  console.log(`\n  ** RUN VOID — nothing written to MEASUREMENTS.md. ${clean(err instanceof Void ? err.message : err.stack ?? err)}`)
  code = 1
}
process.exit(code)
