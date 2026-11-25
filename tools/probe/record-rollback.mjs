#!/usr/bin/env node
/**
 * STORY 7.23a — THE ROLLBACK RECORDER (MEASUREMENTS §91, VERIFY-AT-BUILD 10's rollback half): Roll back and Re-activate asked
 * of T1 exactly as `server/deploy/put-back.ts` asks — every request built by the product's `adminRequest`, every answer read
 * by its `uploadAnswer` / `activateAnswer`, every zip its `zipTheme`, every comparison its drift check's `contentManifest`,
 * `liveManifest` and `compareManifests`. Standing rule 1 for the Ghost claims the put-back rests on, until now read in Ghost's
 * source alone (6.58.0: `services/themes/storage.js` `setFromZip` `:56-125` — `checkSafe` at `:85` before the existing theme
 * is renamed at `:100`, `activateFromAPIOverride` at `:116` for the active name; `activate.js:57`, `checkSafe` on activation):
 *   - an upload under the ACTIVE theme's name is live at once with no PUT (R-264), so ONE CLICK BACK IS A RE-UPLOAD of the
 *     stored zip — the download then equals that version's manifest, nothing recompiled;
 *   - a FATAL theme uploaded under the active name is Ghost's 422 `ThemeValidationError` with `errorDetails`, read by
 *     `uploadAnswer` as `ghost_theme_refused` with a non-empty `detail`, and Ghost REPLACES NOTHING: the download is still
 *     the version that was live, still active (never retried — the spec's Never);
 *   - RE-ACTIVATE is the activation alone: with another theme made live in between (as a customer would in Ghost Admin),
 *     `PUT themes/{name}/activate/` with no upload makes the files Ghost holds under the name live again.
 * ANY OTHER ANSWER STOPS DEV (the spec's Ask First): if Ghost does not hand back what was put back, stop and report it.
 *
 *   node --experimental-strip-types tools/probe/record-rollback.mjs        # the local half: no request, writes nothing
 *   node --experimental-strip-types tools/probe/record-rollback.mjs --t1   # then T1 — WRITES (uploads, activates, deletes a
 *                                                                           # probe theme): the owner's in-session go, in the
 *                                                                           # MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` reaches the network; ANY other argument (`--help` included) prints this and
 * exits 2 without a request (memory: probe recorders ignore --help). Node 24: it imports the app's TypeScript through type
 * stripping, so every byte judged is the product's own.
 *
 * THE LOCAL HALF (both modes; no network). Two versions of the pilot theme (`tools/pilot-theme.mjs`, with §73's scaffold, as
 * the deploy and drift recorders upload it), v1 and v2, differing in ONE file — `home.hbs` ends with a visible
 * "Version 1" / "Version 2" line — each zipped by `zipTheme` and read back by `unzipTheme`: zero differences against its own
 * manifest; v2 against v1's manifest is exactly `home.hbs` changed (the control the T1 half tells the versions apart by).
 * The pinned v6 gscan (Ghost's own checker, `packages/theme-compiler/gate`) scores v1 at 0 errors and BLOCKS the planted fatal
 * theme (v1 plus one template Handlebars cannot parse, record-deploy.mjs' — gscan's `GS005-TPL-ERR`) — the control: Ghost's
 * `checkSafe` is the same checker, so this is the 422 step 5 expects.
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x; T3 is retired, R-238 — Ghost 5 is DW-326's, Story 15.7). Only after the local half held.
 * Its guard is the deploy recorder's: it refuses while any `inflozo-probe-…` theme is installed or active, and reads the theme
 * active at the start (expected `casper`). Under the probe name `inflozo-probe-rollback`:
 *   1. v1 uploaded (`POST themes/upload/`, ADMIN key) under the not-yet-active name: `uploadAnswer` reads `active` false (the
 *      control for steps 3 and 4);
 *   2. `PUT themes/inflozo-probe-rollback/activate/` (ADMIN key): `activateAnswer` ok, `GET themes/` (staff) shows the probe
 *      active, and its download (`GET themes/{name}/download/`, STAFF token) compares with ZERO differences against v1;
 *   3. v2 uploaded under the now-ACTIVE name: `active` true with no PUT (R-264); the download equals v2 and differs from v1 in
 *      `home.hbs` alone (the control);
 *   4. THE ROLL BACK: v1's SAME zip bytes uploaded again under the active name: `active` true, no PUT; the download equals v1
 *      again (step 3's download was v2's — the control);
 *   5. GHOST REFUSES: the planted fatal theme uploaded under the active name: 422 `ThemeValidationError`, its `errorDetails`
 *      carrying `GS005-TPL-ERR` fatal, read as `ghost_theme_refused` with a non-empty `detail`; then the download still equals
 *      v1, the probe is still active and no other `inflozo-probe-rollback…` theme is listed — Ghost replaced nothing. Never
 *      retried;
 *   6. RE-ACTIVATE: `PUT themes/casper/activate/` (STAFF token, as a customer would in Ghost Admin) — casper active, the probe
 *      not (the control) — then `PUT themes/inflozo-probe-rollback/activate/` ALONE (ADMIN key, no upload): active again, and
 *      its download still equals v1;
 *   7. in a `finally`: the theme active at the start re-activated (staff), every `inflozo-probe-rollback…` theme deleted
 *      (staff, as record-drift.mjs), and `GET themes/` read back — the start's theme active, no probe left.
 * WHAT IT WRITES ON T1: four uploads of `inflozo-probe-rollback.zip` with the Admin key — v1 (inactive), v2 and v1 again (each
 * over the active probe, live at once), and the planted fatal theme (refused by Ghost with a 422, nothing written); four
 * activations — `PUT themes/inflozo-probe-rollback/activate/` with the Admin key twice (steps 2 and 6), `PUT
 * themes/casper/activate/` with the staff token (step 6), and in the `finally` the theme active at the start re-activated with
 * the staff token (expected `casper`); and `DELETE themes/inflozo-probe-rollback/` with the staff token (with any other
 * `inflozo-probe-rollback…` theme Ghost lists). T1's live theme is the probe for about a minute (steps 2 to 6, casper for a
 * moment inside step 6), so a visitor to ghost6.inflozo.com meanwhile sees the pilot theme. Nothing else — no post, no setting,
 * no `routes.yaml`. WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §91 alone, replacing an earlier §91 of
 * its own.
 *
 * NO KEY IS EVER PRINTED: `GHOST6_URL`, `GHOST6_ADMIN_API_KEY` and `GHOST6_STAFF_ACCESS_TOKEN` are read from tools/probe/.env
 * in-process, by name (never argv, never the environment), and every line and cell is scrubbed of them.
 */
import fs from 'node:fs'
import path from 'node:path'
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
const SECTION = '91'
const COMMAND = 'node --experimental-strip-types tools/probe/record-rollback.mjs --t1'
const PROBE = 'inflozo-probe-rollback'
const PROBE_PREFIX = 'inflozo-probe-'
const OTHER = 'casper' // Ghost's default theme, always installed: step 6's "another theme made live"
const MARKER = 'home.hbs'
/** A template Handlebars cannot parse: gscan's GS005-TPL-ERR, fatal (record-deploy.mjs' planted theme; §15j: Ghost's 422) */
const FATAL = { 'custom-inflozo-probe-fatal.hbs': '{{!< default}}\n{{#if @site.title}}\n  <p>unclosed\n' }

const pilots = await import(path.join(REPO, 'tools/pilot-theme.mjs'))
const { zipTheme, unzipTheme } = await import(path.join(REPO, 'apps/web/server/deploy/zip.ts'))
const { compareManifests, contentManifest, liveManifest } = await import(path.join(REPO, 'apps/web/lib/drift.ts'))
const { adminRequest, READ_TIMEOUT_MS, CALL_TIMEOUT_MS } = await import(path.join(REPO, 'apps/web/server/ghost-admin/admin-rule.ts'))
const { activateAnswer, uploadAnswer } = await import(path.join(REPO, 'apps/web/lib/deploy.ts'))
const { downloadPath } = await import(path.join(REPO, 'apps/web/server/snapshot.ts'))
const { gscanGate } = await import(path.join(REPO, 'packages/theme-compiler/gate/index.ts'))

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

/** a diff as a row prints it */
const said = (d) => `changed [${d.changed.join(', ')}] · added [${d.added.join(', ')}] · removed [${d.removed.join(', ')}]`
const none = (d) => d.changed.length + d.added.length + d.removed.length === 0
const exactly = (d, want) => JSON.stringify(d) === JSON.stringify(want)
const ONLY_MARKER = { changed: [MARKER], added: [], removed: [] }

/** a zip compared with a stored manifest, as the drift check compares them */
const compare = async (manifest, bytes) => compareManifests(manifest, await liveManifest(unzipTheme(bytes)))

/* ───────────────────────────── the local half ───────────────────────────── */

async function localHalf() {
  const compiled = pilots.compilePilots({ pageWord: `Rollback${nonce}`, layerWord: `Layer${nonce}` }, { theme: { name: PROBE, version: '1.0.0', description: 'Rollback probe' } })
  const base = { ...compiled.files, ...pilots.SCAFFOLD }
  if (typeof base[MARKER] !== 'string') throw new Void(`the pilot theme has no ${MARKER} to mark the versions in`)
  // the one difference between the versions: a visible line on Home
  const version = async (n) => {
    const files = { ...base, [MARKER]: `${base[MARKER]}\n<p class="inflozo-probe-version">Version ${n} · ${nonce}</p>\n` }
    return { files, zip: zipTheme(files), manifest: await contentManifest(files, compiled.sections) }
  }
  const v1 = await version(1)
  const v2 = await version(2)
  const fatal = { ...v1.files, ...FATAL }

  for (const [name, v] of [['v1', v1], ['v2', v2]]) {
    const round = await compare(v.manifest, v.zip)
    row('local', `zipTheme → unzipTheme · ${name}`, `${name} (${Object.keys(v.files).length} files) read back compares with ZERO differences against its own manifest`, none(round), `${said(round)} · ${v.zip.length} bytes, sha256 ${sha(v.zip).slice(0, 16)}…`)
  }
  const apart = await compare(v1.manifest, v2.zip)
  row('local', 'v2 against v1 (the control)', `the versions differ in ${MARKER} alone — what the T1 half tells them apart by`, exactly(apart, ONLY_MARKER), said(apart))

  const clean1 = await gscanGate(v1.files, 6)
  row('local', `gscan ${clean1.gscan} · v1`, 'v1 scores 0 errors at v6 — Ghost\'s checkSafe lets it upload and activate', clean1.errors.length === 0, `${clean1.errors.length} errors · ${clean1.warnings.length} warnings`)
  const refused = await gscanGate(fatal, 6)
  row('local', `gscan ${refused.gscan} · planted (the control)`, 'the planted fatal theme is BLOCKED at v6 on GS005-TPL-ERR — the checker Ghost\'s checkSafe runs before it writes', refused.blocked && refused.errors.some((e) => e.rule === 'GS005-TPL-ERR' && e.fatal), refused.errors.map((e) => e.rule).join(', '))
  return { v1, v2, fatal: { zip: zipTheme(fatal) } }
}

/* ───────────────────────────── the --t1 half ───────────────────────────── */

function loadEnv() {
  const names = ['GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST6_STAFF_ACCESS_TOKEN']
  const env = {}
  for (const line of fs.readFileSync(path.join(REPO, 'tools/probe/.env'), 'utf8').split('\n')) {
    const m = /^([A-Z0-9_]+)=(.*)$/.exec(line)
    if (m && names.includes(m[1]) && m[2].trim()) env[m[1]] = m[2].trim()
  }
  for (const k of names) if (!env[k]) throw new Void(`${k} is not in tools/probe/.env`)
  for (const k of names.slice(1)) SECRETS.push(...[env[k], env[k].split(':')[1]].filter(Boolean))
  return env
}

/** T1 through the product's own request builder, the download with its own read budget (record-drift.mjs') */
function ghost(env) {
  const send = async (credential, method, p, body, read) => {
    const { url, init } = adminRequest({ credential, siteUrl: env.GHOST6_URL, method, path: p, body, major: 6 })
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(read ? READ_TIMEOUT_MS[read] : body ? 180_000 : CALL_TIMEOUT_MS) })
    const bytes = new Uint8Array(await r.arrayBuffer())
    const text = new TextDecoder().decode(bytes)
    let parsed = null
    try {
      parsed = JSON.parse(text)
    } catch {
      parsed = null
    }
    return { ok: r.ok, status: r.status, body: parsed, text, bytes }
  }
  const form = (bytes) => {
    const f = new FormData()
    f.append('file', new Blob([bytes], { type: 'application/zip' }), `${PROBE}.zip`)
    return f
  }
  const admin = env.GHOST6_ADMIN_API_KEY
  const staff = env.GHOST6_STAFF_ACCESS_TOKEN
  return {
    upload: (bytes) => send(admin, 'POST', 'themes/upload/', form(bytes)),
    activate: (name, credential = admin) => send(credential, 'PUT', `themes/${encodeURIComponent(name)}/activate/`),
    download: async () => {
      const d = await send(staff, 'GET', downloadPath(PROBE), undefined, 'theme_download')
      if (d.status !== 200) throw new Void(`GET ${downloadPath(PROBE)} with the staff token answered HTTP ${d.status} — nothing to compare`)
      return d.bytes
    },
    themes: async () => {
      const r = await send(staff, 'GET', 'themes/')
      if (!r.ok) throw new Error(`GET themes/ with the staff token answered HTTP ${r.status}`)
      return r.body.themes
    },
    remove: (name) => send(staff, 'DELETE', `themes/${encodeURIComponent(name)}/`),
    staff,
    host: new URL(env.GHOST6_URL).host,
  }
}

const activeOf = (list) => list.find((x) => x.active)?.name
const probesOf = (list) => list.filter((x) => x.name.startsWith(PROBE_PREFIX)).map((x) => `${x.name}${x.active ? ' (active)' : ''}`)
const answerOf = (up) => `HTTP ${up.status}; themes[0] ${up.body?.themes?.[0]?.name ?? '—'} active ${JSON.stringify(up.body?.themes?.[0]?.active)}`
/** an upload under the probe name, read by the product's `uploadAnswer`: accepted, named, live or not as `live` says */
const uploaded = (where, up, live, why) => {
  const a = uploadAnswer(up)
  row('t1', where, why, 'ok' in a && a.theme === PROBE && a.active === live && up.body?.themes?.[0]?.active === live, answerOf(up))
}

async function t1Half(local) {
  const g = ghost(loadEnv())
  // the guard (record-deploy.mjs'): the active theme found, and no probe left by an earlier run
  const before = await g.themes()
  const start = activeOf(before)
  if (!start) throw new Void('no active theme reported — refusing to write with nothing to restore')
  if (start.startsWith(PROBE_PREFIX)) throw new Void(`the active theme is ${start}, a probe: an earlier run did not restore. Activate the site's own theme in Ghost admin, then re-run`)
  const left = probesOf(before)
  if (left.length > 0) throw new Void(`probe themes still installed: ${left.join(', ')} — an earlier run did not clean up. Delete them in Ghost admin, then re-run`)
  if (!before.some((x) => x.name === OTHER)) throw new Void(`${OTHER} is not installed — step 6 has no other theme to make live`)
  const t = { host: g.host, start, activation: null, reactivation: null, refused: null, details: [] }
  try {
    // 1 — v1 under the not-yet-active name: active false (the control for steps 3 and 4)
    uploaded('1 POST themes/upload/ (v1) [admin key]', await g.upload(local.v1.zip), false, `v1 accepted under ${PROBE}, not active: uploadAnswer reads active false (the control for steps 3 and 4)`)

    // 2 — the activation, then the download: v1's files
    const act = await g.activate(PROBE)
    t.activation = `HTTP ${act.status}; themes[0] ${act.body?.themes?.[0]?.name ?? '—'} active ${JSON.stringify(act.body?.themes?.[0]?.active)}`
    row('t1', `2 PUT themes/${PROBE}/activate/ [admin key]`, 'activated, read by activateAnswer as live', 'ok' in activateAnswer(act), t.activation)
    const listed = await g.themes()
    row('t1', '2 GET themes/ [staff]', 'the probe is the active theme', activeOf(listed) === PROBE, `active ${activeOf(listed) ?? '—'}`)
    const d2 = await compare(local.v1.manifest, await g.download())
    row('t1', `2 GET ${downloadPath(PROBE)} [staff]`, 'ZERO differences against v1\'s manifest', none(d2), said(d2))

    // 3 — v2 under the ACTIVE name: live at once, no PUT (R-264); the download is v2's and not v1's
    uploaded('3 POST themes/upload/ (v2, the active name) [admin key]', await g.upload(local.v2.zip), true, 'R-264: an upload under the active name answers active true, read by uploadAnswer as live — no PUT sent')
    const b3 = await g.download()
    const d3 = await compare(local.v2.manifest, b3)
    const d3v1 = await compare(local.v1.manifest, b3)
    row('t1', `3 GET ${downloadPath(PROBE)} [staff]`, `ZERO differences against v2's manifest, and against v1's exactly ${MARKER} (the control)`, none(d3) && exactly(d3v1, ONLY_MARKER), `v2: ${said(d3)} · v1: ${said(d3v1)}`)

    // 4 — THE ROLL BACK: v1's SAME zip again under the active name — nothing recompiled
    uploaded('4 POST themes/upload/ (v1 again, the active name) [admin key]', await g.upload(local.v1.zip), true, 'the Roll back: v1\'s same zip bytes re-uploaded answer active true — live with no PUT')
    const d4 = await compare(local.v1.manifest, await g.download())
    row('t1', `4 GET ${downloadPath(PROBE)} [staff]`, 'ZERO differences against v1\'s manifest again — one click back is a re-upload (step 3\'s download was v2\'s: the control)', none(d4) && exactly(d3v1, ONLY_MARKER), said(d4))

    // 5 — GHOST REFUSES: a fatal theme under the active name — 422, and nothing replaced. Never retried.
    const fatal = await g.upload(local.fatal.zip)
    const read = uploadAnswer(fatal)
    t.details = (fatal.body?.errors?.[0]?.details?.errors ?? []).map((e) => `${e.code}${e.fatal ? ' (fatal)' : ''}`)
    t.refused = { status: fatal.status, type: fatal.body?.errors?.[0]?.type, failed: read.failed, detail: read.detail ?? '' }
    row('t1', '5 POST themes/upload/ (planted fatal, the active name) [admin key]', 'Ghost\'s 422 ThemeValidationError, its errorDetails carrying GS005-TPL-ERR fatal, read by uploadAnswer as ghost_theme_refused with a non-empty detail', fatal.status === 422 && t.refused.type === 'ThemeValidationError' && (fatal.body?.errors?.[0]?.details?.errors ?? []).some((e) => e.code === 'GS005-TPL-ERR' && e.fatal) && read.failed === 'ghost_theme_refused' && t.refused.detail.trim() !== '', `HTTP ${fatal.status} ${t.refused.type ?? '—'}; ${read.failed ?? 'accepted'}; details [${t.details.join(', ')}]; detail ${t.refused.detail.slice(0, 80)}`)
    const d5 = await compare(local.v1.manifest, await g.download())
    const after5 = await g.themes()
    row('t1', `5 GET ${downloadPath(PROBE)} + GET themes/ [staff]`, 'Ghost replaced nothing: ZERO differences against v1, the probe still active, no other probe theme listed', none(d5) && activeOf(after5) === PROBE && probesOf(after5).length === 1, `${said(d5)} · active ${activeOf(after5) ?? '—'} · probes ${probesOf(after5).join(', ')}`)

    // 6 — RE-ACTIVATE: another theme made live (as in Ghost Admin), then the activation ALONE
    const other = await g.activate(OTHER, g.staff)
    const after6 = await g.themes()
    row('t1', `6 PUT themes/${OTHER}/activate/ [staff] (the control)`, `${OTHER} made live as a customer would in Ghost Admin: the probe is no longer active`, other.ok && activeOf(after6) === OTHER, `HTTP ${other.status}; active ${activeOf(after6) ?? '—'}`)
    const again = await g.activate(PROBE)
    t.reactivation = `HTTP ${again.status}; themes[0] ${again.body?.themes?.[0]?.name ?? '—'} active ${JSON.stringify(again.body?.themes?.[0]?.active)}`
    row('t1', `6 PUT themes/${PROBE}/activate/ [admin key]`, 'Re-activate: the activation alone, no upload, read by activateAnswer as live', 'ok' in activateAnswer(again), t.reactivation)
    const d6 = await compare(local.v1.manifest, await g.download())
    const after6b = await g.themes()
    row('t1', `6 GET themes/ + GET ${downloadPath(PROBE)} [staff]`, 'the probe active again, and its files still v1\'s: activation alone makes what Ghost holds live', activeOf(after6b) === PROBE && none(d6), `active ${activeOf(after6b) ?? '—'} · ${said(d6)}`)
  } finally {
    // 7 — T1 as found: the start's theme active, every probe deleted (Ghost's own `{name}_{ObjectID}` backups included, should
    // any be listed), read back — each call in its own catch, so a refused activation still deletes what it can
    const back = await g.activate(start, g.staff).catch((e) => ({ status: `threw ${e?.name ?? 'error'}` }))
    const listed = await g.themes().catch(() => [])
    for (const name of new Set([PROBE, ...listed.map((x) => x.name).filter((n) => n.startsWith(PROBE))])) await g.remove(name).catch(() => {})
    const end = await g.themes().catch(() => [])
    row('t1', `7 PUT themes/${start}/activate/ + DELETE themes/{probe}/ + GET themes/ [staff]`, `${start} active again and no probe installed, read back`, activeOf(end) === start && probesOf(end).length === 0, `HTTP ${back.status}; active ${activeOf(end) ?? '—'}; probes ${probesOf(end).join(', ') || 'none'}`)
  }
  return t
}

/* ───────────────────────────── §91 ───────────────────────────── */

const cell = (s) => clean(String(s)).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 240)
const tableOf = (list) => ['| Step | Row | Got | Held |', '|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
function section(t, today) {
  return [
    `## ${SECTION}. Roll back and Re-activate on T1 — two versions of the pilot theme put back under one probe name through the product's \`adminRequest\` and read by its \`uploadAnswer\` / \`activateAnswer\`: an upload under the active name live at once with no PUT, so one click back is a re-upload whose download equals the version's manifest; a fatal theme refused with a 422 that replaced nothing; the activation alone making the held files live again · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — four uploads of \`${PROBE}.zip\` with the Admin key (v1 inactive; v2 and v1 again over the active probe; the planted fatal theme, refused); \`PUT themes/${PROBE}/activate/\` twice with the Admin key and \`PUT themes/${OTHER}/activate/\` once with the staff token; every download with the staff token; then, in a \`finally\`, \`${t.start}\` re-activated, the probe deleted and \`GET themes/\` read back. The probe was T1's live theme for about a minute. No post, setting or \`routes.yaml\` written.`,
    '',
    `**Ghost.** T1 \`${t.host}\` (6.x); the theme active before the run \`${t.start}\`. Ghost 5's half is DW-326's (R-238, Story 15.7).`,
    '',
    `**The controls, each of which voids the run:** v1 and v2 differ in \`${MARKER}\` alone, locally and in step 3's download, so a download that equals v1 is v1's; the first upload, under an inactive name, answers \`active\` false; the planted theme is blocked by the pinned v6 gscan before Ghost is asked; ${OTHER} made live before the Re-activate, so the probe was not already active.`,
    '',
    ...tableOf(rows),
    '',
    '- **One click back is a re-upload** (FR-J9, R-264, VERIFY-AT-BUILD 10\'s rollback half): v1\'s stored zip, uploaded again under the active theme\'s name, answered `active` true with no activation sent, and the download compared with ZERO differences against v1\'s `content_manifest` — nothing recompiled, the put-back\'s Roll back as `server/deploy/put-back.ts` sends it.',
    `- **Ghost refuses before it writes** (\`storage.js\` \`setFromZip\` — \`checkSafe\` \`:85\` precedes the rename \`:100\`, executed): the fatal theme answered HTTP ${t.refused?.status} \`${t.refused?.type}\` with errorDetails [${t.details.join(', ')}], read as \`${t.refused?.failed}\` with Ghost's detail "${cell(t.refused?.detail ?? '').slice(0, 160)}"; the probe stayed active and its download stayed v1's. Hence the spec's "Ghost says no, nothing changes": no row changes, and the 422 is said, never retried.`,
    `- **Re-activate is the activation alone** (D2d): with \`${OTHER}\` made live in between, \`PUT themes/${PROBE}/activate/\` with no upload answered \`${cell(t.reactivation)}\` and the files Ghost held under the name — v1's — went live again.`,
    `- **What this does NOT say.** Nothing went through the product's \`call()\`, its database or its bucket, and no \`deploys\` row was read or written: walk step 121 is the put-back route end to end. \`${t.start}\` was active again at the end.`,
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
  console.log('\n  THE LOCAL HALF — v1, v2 and the planted fatal theme, over the product\'s own zip writer, manifests and gscan')
  const local = await localHalf()
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND} (uploads, activates and deletes ${PROBE}; T1's live theme for about a minute)`)
    const t = await t1Half(local)
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND REPORT (the spec\'s Ask First): Ghost does not take a put-back as Story 7.23a plans it')
    writeSection(SECTION, section(t, new Date().toISOString().slice(0, 10)))
    console.log(`\n    MEASUREMENTS.md §${SECTION} written — every row held, behind its controls.`)
  } else {
    console.log(`\n    PASS — every row held. The local half sends nothing and writes nothing; §${SECTION} is the --t1 run's.`)
  }
} catch (err) {
  console.log(`\n  ** RUN VOID — nothing written to MEASUREMENTS.md. ${clean(err instanceof Void ? err.message : err.stack ?? err)}`)
  code = 1
}
process.exit(code)
