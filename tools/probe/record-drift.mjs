#!/usr/bin/env node
/**
 * STORY 7.21 — THE DRIFT RECORDER (MEASUREMENTS §90, VERIFY-AT-BUILD 79): FR-J16's drift check, its two manifests built by the
 * product's own rule (`apps/web/lib/drift.ts`' `contentManifest`, `liveManifest`, `compareManifests`) over the product's own zip
 * writer and reader (`apps/web/server/deploy/zip.ts`' `zipTheme`, `unzipTheme`). Standing rule 1 for the Ghost claims the check
 * rests on, until now read in Ghost's source alone (6.58.0: `storage.js:95-107`, `theme-storage.js:23-55`,
 * `@tryghost/zip/lib/compress.js`):
 *   - THE ZERO FALSE POSITIVE CONTROL: the pilot theme zipped by Inflozo, uploaded, then downloaded again with the Staff Access
 *     Token, compares with ZERO differences — any directory or dot entry Ghost adds to its re-zip is named;
 *   - a hand-edited copy uploaded under the same INACTIVE name downloads as exactly its three edits (one section partial's text
 *     changed, `custom-handmade.hbs` added, `README.md` removed);
 *   - a third upload without a file drops it from the download: every upload REPLACES every file under the name, live or not
 *     (`storage.js:95-107` executed — R-287's premise);
 *   - the download with the token's last hex digit flipped is a 401, with the integration's Admin API key a 403, and under a
 *     name T1 does not hold a 400 `BadRequestError` — `getZip`'s "Please select a valid theme.", Ghost's one answer for a theme
 *     it does not hold (`storage.js:43-50`), never a 404, which R-288 reads as `missing` (the controls, and D3b's
 *     `token_refused`, `role` and `missing`).
 * ANY OTHER ANSWER STOPS DEV (the spec's Ask First): if Ghost adds or drops a file, stop and report it before any ignore rule
 * is written.
 *
 *   node --experimental-strip-types tools/probe/record-drift.mjs        # the local half: no request, writes nothing
 *   node --experimental-strip-types tools/probe/record-drift.mjs --t1   # then T1 — WRITES (uploads and deletes a probe theme):
 *                                                                        # the owner's in-session go, in the MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` reaches the network; ANY other argument (`--help` included) prints this and
 * exits 2 without a request (memory: probe recorders ignore --help). Node 24: it imports the app's TypeScript through type
 * stripping, so every byte judged is the product's own.
 *
 * THE LOCAL HALF (both modes; no network). The pilot theme (`tools/pilot-theme.mjs`, with §73's scaffold, as the deploy recorder
 * uploads it) zipped by `zipTheme` and read back by `unzipTheme` compares with zero differences; an archiver-shaped zip (directory
 * entries, data descriptors, a dot file) reads as its files alone; the hand-edited copy shows exactly its three edits; a
 * CRLF-only copy is clean; a moved partial is clean. Each beside its CONTROL, a row that must show the difference it guards.
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x; T3 is retired, R-238 — Ghost 5 is DW-326's, Story 15.7). Only after the local half held.
 * Its guard is the deploy recorder's: it refuses while any `inflozo-probe-…` theme is installed or active. Under the probe name
 * `inflozo-probe-drift` — NEVER the active theme, and never activated:
 *   1. the pilot theme uploaded (`POST themes/upload/`, ADMIN key, through `adminRequest`), downloaded (`GET themes/{name}/download/`,
 *      STAFF token, the download's own read budget), compared: zero differences, Ghost's directory and dot entries named;
 *   2. the hand-edited copy uploaded under the same name: its download shows exactly the three edits against step 1's manifest;
 *   3. step 2's copy without `custom-handmade.hbs` uploaded: the file is gone from the download (it was there in step 2's — the
 *      control);
 *   4. the controls: flipped token → 401, Admin key → 403, an unknown name → 400 (R-288);
 *   5. in a `finally`: every `inflozo-probe-drift…` theme deleted (staff token), and `GET themes/` read back — the active theme the
 *      one found at the start, and no probe left.
 * WHAT IT WRITES ON T1: three uploads of `inflozo-probe-drift.zip` (inactive) and its deletion. Nothing else — no activation, no
 * post, no setting, no `routes.yaml`. WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §90 alone, replacing an
 * earlier §90 of its own.
 *
 * NO KEY IS EVER PRINTED: `GHOST6_URL`, `GHOST6_ADMIN_API_KEY` and `GHOST6_STAFF_ACCESS_TOKEN` are read from tools/probe/.env
 * in-process, by name (never argv, never the environment), and every line and cell is scrubbed of them.
 */
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'
import { crc32, deflateRawSync } from 'node:zlib'

const SELF = fileURLToPath(import.meta.url)
const ARGS = process.argv.slice(2)
if (!(ARGS.length === 0 || (ARGS.length === 1 && ARGS[0] === '--t1'))) {
  console.error(fs.readFileSync(SELF, 'utf8').split('*/')[0])
  process.exit(2)
}
const T1 = ARGS[0] === '--t1'
const REPO = path.join(path.dirname(SELF), '..', '..')
const MEASUREMENTS = path.join(REPO, '_bmad-output/planning-artifacts/architecture/architecture-Inflozo-2026-08-19/MEASUREMENTS.md')
const SECTION = '90'
const COMMAND = 'node --experimental-strip-types tools/probe/record-drift.mjs --t1'
const PROBE = 'inflozo-probe-drift'
const PROBE_PREFIX = 'inflozo-probe-'
const ADDED = 'custom-handmade.hbs'
const REMOVED = 'README.md'

const pilots = await import(path.join(REPO, 'tools/pilot-theme.mjs'))
const { zipTheme, unzipTheme } = await import(path.join(REPO, 'apps/web/server/deploy/zip.ts'))
const { compareManifests, contentManifest, liveManifest } = await import(path.join(REPO, 'apps/web/lib/drift.ts'))
const { adminRequest, READ_TIMEOUT_MS, CALL_TIMEOUT_MS } = await import(path.join(REPO, 'apps/web/server/ghost-admin/admin-rule.ts'))
const { downloadPath } = await import(path.join(REPO, 'apps/web/server/snapshot.ts'))

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

/** the token with its LAST hex digit changed: still `id:hex`, so only Ghost can refuse it (record-snapshot.mjs') */
const flipped = (token) => {
  const last = token.slice(-1).toLowerCase()
  return `${token.slice(0, -1)}${last === '0' ? '1' : '0'}`
}

/** a diff as a row prints it */
const said = (d) => `changed [${d.changed.join(', ')}] · added [${d.added.join(', ')}] · removed [${d.removed.join(', ')}]`
const none = (d) => d.changed.length + d.added.length + d.removed.length === 0
const exactly = (d, want) => JSON.stringify(d) === JSON.stringify(want)

/** every entry's NAME in a zip's central directory, directories included — what `unzipTheme` skips, named here (the recorder's
 *  own reading: the end record's count and offset, then each record's name) */
function namesIn(bytes) {
  const b = Buffer.from(bytes)
  let end = b.length - 22
  while (end >= 0 && b.readUInt32LE(end) !== 0x06054b50) end--
  if (end < 0) return []
  const names = []
  let at = b.readUInt32LE(end + 16)
  for (let i = 0; i < b.readUInt16LE(end + 10); i++) {
    const n = b.readUInt16LE(at + 28)
    names.push(b.subarray(at + 46, at + 46 + n).toString('utf8'))
    at += 46 + n + b.readUInt16LE(at + 30) + b.readUInt16LE(at + 32)
  }
  return names
}
const isDot = (p) => p.split('/').some((part) => part.startsWith('.'))

/** A zip as Ghost's `@tryghost/zip` (archiver) writes one: a directory entry per folder, each file's sizes and CRC after its data
 *  in a data descriptor (flag bit 3), deflated. `null` is a directory. zip.test.ts holds the reader over the same shape. */
function archiverZip(files) {
  const parts = []
  const centrals = []
  let offset = 0
  for (const [p, body] of Object.entries(files)) {
    const name = Buffer.from(p, 'utf8')
    const data = Buffer.from(body ?? '', 'utf8')
    const dir = body === null
    const packed = dir ? data : deflateRawSync(data)
    const local = Buffer.alloc(30)
    local.writeUInt32LE(0x04034b50, 0)
    local.writeUInt16LE(20, 4)
    local.writeUInt16LE(dir ? 0 : 0x0008, 6)
    local.writeUInt16LE(dir ? 0 : 8, 8)
    local.writeUInt16LE(name.length, 26)
    const descriptor = Buffer.alloc(dir ? 0 : 16)
    if (!dir) {
      descriptor.writeUInt32LE(0x08074b50, 0)
      descriptor.writeUInt32LE(crc32(data), 4)
      descriptor.writeUInt32LE(packed.length, 8)
      descriptor.writeUInt32LE(data.length, 12)
    }
    const central = Buffer.alloc(46)
    central.writeUInt32LE(0x02014b50, 0)
    central.writeUInt16LE(20, 4)
    central.writeUInt16LE(20, 6)
    central.writeUInt16LE(dir ? 0 : 0x0008, 8)
    central.writeUInt16LE(dir ? 0 : 8, 10)
    central.writeUInt32LE(crc32(data), 16)
    central.writeUInt32LE(packed.length, 20)
    central.writeUInt32LE(data.length, 24)
    central.writeUInt16LE(name.length, 28)
    central.writeUInt32LE(offset, 42)
    parts.push(local, name, packed, descriptor)
    centrals.push(central, name)
    offset += local.length + name.length + packed.length + descriptor.length
  }
  const directory = Buffer.concat(centrals)
  const end = Buffer.alloc(22)
  end.writeUInt32LE(0x06054b50, 0)
  end.writeUInt16LE(Object.keys(files).length, 8)
  end.writeUInt16LE(Object.keys(files).length, 10)
  end.writeUInt32LE(directory.length, 12)
  end.writeUInt32LE(offset, 16)
  return new Uint8Array(Buffer.concat([...parts, directory, end]))
}

/** the hand edit a customer makes in Ghost: one section partial's text changed, a template added, the read me removed */
function handEdited(files, partial) {
  const out = { ...files, [partial]: `${files[partial]}<!-- edited by hand ${nonce} -->\n`, [ADDED]: `{{!< default}}\n\n<p>Made by hand ${nonce}</p>\n` }
  delete out[REMOVED]
  return out
}

/** a downloaded zip compared with a stored manifest, as the drift check compares them */
const compare = async (baseline, bytes) => compareManifests(baseline, await liveManifest(unzipTheme(bytes)))

/* ───────────────────────────── the local half ───────────────────────────── */

async function localHalf() {
  const words = { pageWord: `Drift${nonce}`, layerWord: `Layer${nonce}` }
  const compiled = pilots.compilePilots(words, { theme: { name: PROBE, version: '1.0.0', description: 'Drift probe' } })
  const files = { ...compiled.files, ...pilots.SCAFFOLD }
  const sections = compiled.sections
  const baseline = await contentManifest(files, sections)
  const partial = Object.keys(files).find((p) => p.startsWith('partials/sections/'))
  if (partial === undefined || !(REMOVED in files)) throw new Void(`the pilot theme has no section partial or no ${REMOVED} to edit`)
  const zip = zipTheme(files)

  const round = await compare(baseline, zip)
  row('local', 'zipTheme → unzipTheme', `the pilot theme (${Object.keys(files).length} files) read back compares with ZERO differences`, none(round), said(round))
  const one = await compare(baseline, zipTheme({ ...files, [REMOVED]: `${files[REMOVED]} ` }))
  row('local', 'zipTheme → unzipTheme (control)', 'one byte more in one file is exactly one changed file', exactly(one, { changed: [REMOVED], added: [], removed: [] }), said(one))

  const shaped = { 'partials/': null, 'partials/sections/': null, [partial]: files[partial], '.editorconfig': 'root = true\n', 'package.json': files['package.json'] }
  const shapedZip = archiverZip(shaped)
  const read = unzipTheme(shapedZip)
  const own = Object.fromEntries(Object.entries(shaped).filter(([, b]) => b !== null))
  const shapedDiff = compareManifests(await contentManifest(own, {}), await liveManifest(read))
  row('local', 'archiver-shaped zip', 'directory entries skipped, data descriptors read, the dot file kept: its files alone, zero differences', none(shapedDiff) && Object.keys(read).sort().join() === Object.keys(own).sort().join(), `${Object.keys(read).length} files of ${namesIn(shapedZip).length} entries`)
  row('local', 'archiver-shaped zip (control)', 'the directory entries ARE in the zip — the reader skipped them, not the writer', namesIn(shapedZip).filter((n) => n.endsWith('/')).length === 2, namesIn(shapedZip).filter((n) => n.endsWith('/')).join(', '))

  const edited = await compare(baseline, zipTheme(handEdited(files, partial)))
  row('local', 'the hand-edited copy', `exactly its three edits: ${partial} changed, ${ADDED} added, ${REMOVED} removed`, exactly(edited, { changed: [partial], added: [ADDED], removed: [REMOVED] }), said(edited))

  const crlf = Object.fromEntries(Object.entries(files).map(([p, b]) => [p, typeof b === 'string' ? b.replace(/\n/g, '\r\n') : b]))
  const crlfDiff = await compare(baseline, zipTheme(crlf))
  row('local', 'a CRLF-only copy', 'every text file\'s line endings rewritten: clean', none(crlfDiff), said(crlfDiff))
  const lone = await compare(baseline, zipTheme({ ...files, [REMOVED]: `${files[REMOVED]}\r` }))
  row('local', 'a CRLF-only copy (control)', 'a CR before no LF is a change', exactly(lone, { changed: [REMOVED], added: [], removed: [] }), said(lone))

  const moved = { ...files, [`${partial.replace(/\.hbs$/, '')}-moved.hbs`]: files[partial] }
  delete moved[partial]
  const movedDiff = await compare(baseline, zipTheme(moved))
  row('local', 'a moved partial', 'the same bytes under another path: clean (identity is content)', none(movedDiff), said(movedDiff))
  const movedEdit = { ...moved, [`${partial.replace(/\.hbs$/, '')}-moved.hbs`]: `${files[partial]} ` }
  const movedEditDiff = await compare(baseline, zipTheme(movedEdit))
  row('local', 'a moved partial (control)', 'moved AND changed is a removal and an addition', exactly(movedEditDiff, { changed: [], added: [`${partial.replace(/\.hbs$/, '')}-moved.hbs`], removed: [partial] }), said(movedEditDiff))

  const fake = `${crypto.randomBytes(12).toString('hex')}:${crypto.randomBytes(32).toString('hex')}`
  const f = flipped(fake)
  row('local', 'flipped', 'the control token is well-formed and differs in its last digit alone', f.length === fake.length && f !== fake && f.slice(0, -1) === fake.slice(0, -1), `${f.length} characters`)
  return { files, baseline, partial, zip }
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
  for (const k of names.slice(1)) SECRETS.push(...[env[k], env[k].split(':')[1], flipped(env[k]).split(':')[1]].filter(Boolean))
  return env
}

/** T1 through the product's own request builder, the download with its own read budget */
function ghost(env) {
  const send = async (credential, method, p, body, read) => {
    const { url, init } = adminRequest({ credential, siteUrl: env.GHOST6_URL, method, path: p, body, major: 6 })
    const r = await fetch(url, { ...init, signal: AbortSignal.timeout(read ? READ_TIMEOUT_MS[read] : body ? 180_000 : CALL_TIMEOUT_MS) })
    const bytes = new Uint8Array(await r.arrayBuffer())
    let parsed = null
    try {
      parsed = JSON.parse(new TextDecoder().decode(bytes))
    } catch {
      parsed = null
    }
    return { ok: r.ok, status: r.status, body: parsed, bytes, type: r.headers.get('content-type') ?? '—' }
  }
  const form = (bytes) => {
    const f = new FormData()
    f.append('file', new Blob([bytes], { type: 'application/zip' }), `${PROBE}.zip`)
    return f
  }
  const staff = env.GHOST6_STAFF_ACCESS_TOKEN
  return {
    upload: (bytes) => send(env.GHOST6_ADMIN_API_KEY, 'POST', 'themes/upload/', form(bytes)),
    download: (name, credential = staff) => send(credential, 'GET', downloadPath(name), undefined, 'theme_download'),
    themes: async () => {
      const r = await send(staff, 'GET', 'themes/')
      if (!r.ok) throw new Error(`GET themes/ with the staff token answered HTTP ${r.status}`)
      return r.body.themes
    },
    remove: (name) => send(staff, 'DELETE', `themes/${encodeURIComponent(name)}/`),
    staff,
    admin: env.GHOST6_ADMIN_API_KEY,
    host: new URL(env.GHOST6_URL).host,
  }
}

/** an upload under the probe name, held: accepted, named, never made live */
const uploaded = (where, up) => row('t1', where, `accepted under ${PROBE}, inactive (Admin key)`, up.status === 200 && up.body?.themes?.[0]?.name === PROBE && up.body?.themes?.[0]?.active === false, `HTTP ${up.status}; themes[0] ${up.body?.themes?.[0]?.name ?? '—'} active ${JSON.stringify(up.body?.themes?.[0]?.active)}`)
const zipShape = (a) => `HTTP ${a.status} · ${a.type} · ${a.bytes.length} bytes · sha256 ${sha(a.bytes).slice(0, 16)}…`

async function t1Half(local) {
  const g = ghost(loadEnv())
  // the guard (record-deploy.mjs'): the active theme found, and no probe left by an earlier run
  const before = await g.themes()
  const active = before.find((t) => t.active)?.name
  if (!active) throw new Void('no active theme reported — refusing to write with nothing to compare the end against')
  if (active.startsWith(PROBE_PREFIX)) throw new Void(`the active theme is ${active}, a probe: an earlier run did not restore. Activate the site's own theme in Ghost admin, then re-run`)
  const left = before.filter((t) => t.name.startsWith(PROBE_PREFIX)).map((t) => t.name)
  if (left.length > 0) throw new Void(`probe themes still installed: ${left.join(', ')} — an earlier run did not clean up. Delete them in Ghost admin, then re-run`)
  const t = { host: g.host, active, added: [], dirs: [], dots: [], size: 0, edited: null, third: null, controls: {} }
  try {
    // 1 — the zero false positive control: uploaded by Inflozo, downloaded again, compared
    uploaded('1 POST themes/upload/ (the pilot theme)', await g.upload(local.zip))
    const back = await g.download(PROBE)
    const names = namesIn(back.bytes)
    t.dirs = names.filter((n) => n.endsWith('/'))
    t.dots = names.filter((n) => !n.endsWith('/') && isDot(n))
    t.size = back.bytes.length
    row('t1', `1 GET ${downloadPath(PROBE)} [staff]`, 'a 200 zip the product\'s reader opens', back.status === 200 && (() => { try { unzipTheme(back.bytes); return true } catch { return false } })(), `${zipShape(back)} · ${names.length} entries, ${t.dirs.length} directories, dot entries [${t.dots.join(', ')}]`)
    const round = await compare(local.baseline, back.bytes)
    t.added = round.added
    row('t1', '1 the pilot\'s round trip', 'ZERO differences — the zero false positive control (any file Ghost adds or drops: STOP AND REPORT)', none(round), said(round))

    // 2 — a hand edit under the same INACTIVE name, read back as exactly its three edits
    const editedFiles = handEdited(local.files, local.partial)
    uploaded('2 POST themes/upload/ (the hand-edited copy)', await g.upload(zipTheme(editedFiles)))
    const edited = await g.download(PROBE)
    const diff = await compare(local.baseline, edited.bytes)
    t.edited = diff
    row('t1', `2 GET ${downloadPath(PROBE)} [staff]`, `exactly the three edits: ${local.partial} changed, ${ADDED} added, ${REMOVED} removed`, exactly(diff, { changed: [local.partial], added: [ADDED], removed: [REMOVED] }), said(diff))

    // 3 — a third upload without a file: the file is gone (every upload replaces every file under the name, storage.js:95-107)
    const third = { ...editedFiles }
    delete third[ADDED]
    uploaded(`3 POST themes/upload/ (without ${ADDED})`, await g.upload(zipTheme(third)))
    const after = unzipTheme((await g.download(PROBE)).bytes)
    t.third = !(ADDED in after)
    row('t1', `3 GET ${downloadPath(PROBE)} [staff]`, `${ADDED} is gone — the upload replaced every file under the name (step 2's download held it: the control)`, !(ADDED in after) && diff.added.includes(ADDED), `${ADDED} ${ADDED in after ? 'still there' : 'gone'} · ${Object.keys(after).length} files`)

    // 4 — the controls, each one of D3b's causes
    const flip = await g.download(PROBE, flipped(g.staff))
    row('t1', `4 GET ${downloadPath(PROBE)} [flipped] (control)`, '401 — a token Ghost does not know (D3b token_refused)', flip.status === 401, `HTTP ${flip.status} · ${flip.body?.errors?.[0]?.type ?? '—'}`)
    const admin = await g.download(PROBE, g.admin)
    row('t1', `4 GET ${downloadPath(PROBE)} [admin key] (control)`, '403 — the integration key may not download a theme (D3b role)', admin.status === 403, `HTTP ${admin.status} · ${admin.body?.errors?.[0]?.type ?? '—'}`)
    const unknown = `${PROBE}-none-${nonce}`
    const missing = await g.download(unknown)
    row('t1', `4 GET ${downloadPath(unknown)} [staff] (control)`, '400 BadRequestError — a name T1 does not hold: getZip\'s "Please select a valid theme." (D3b missing, R-288)', missing.status === 400 && missing.body?.errors?.[0]?.type === 'BadRequestError', `HTTP ${missing.status} · ${missing.body?.errors?.[0]?.type ?? '—'}`)
    t.controls = { flip: flip.status, admin: admin.status, missing: missing.status }
  } finally {
    // 5 — T1 as found: every probe deleted (Ghost's own `{name}_{ObjectID}` backups included, should any be listed), read back
    const listed = await g.themes().catch(() => [])
    for (const name of new Set([PROBE, ...listed.map((x) => x.name).filter((n) => n.startsWith(PROBE))])) await g.remove(name).catch(() => {})
    const end = await g.themes().catch(() => [])
    const nowActive = end.find((x) => x.active)?.name
    const probes = end.filter((x) => x.name.startsWith(PROBE_PREFIX)).map((x) => x.name)
    row('t1', '5 DELETE themes/{probe}/ + GET themes/ [staff]', `${active} still the active theme and no probe installed, read back`, nowActive === active && probes.length === 0, `active ${nowActive ?? '—'}; probes ${probes.join(', ') || 'none'}`)
  }
  return t
}

/* ───────────────────────────── §90 ───────────────────────────── */

const cell = (s) => clean(String(s)).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 240)
const tableOf = (list) => ['| Step | Row | Got | Held |', '|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
function section(t, today) {
  return [
    `## ${SECTION}. The drift check's two manifests on T1 — the pilot theme zipped by Inflozo, uploaded, downloaded with the Staff Access Token and compared by the product's own \`compareManifests\`: zero differences; a hand edit read back as exactly its three files; a later upload dropping a file Ghost then no longer serves; a flipped digit 401, the Admin key 403, an unknown name 400 (R-288) · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — three uploads of \`${PROBE}.zip\` with the Admin key, never activated, each downloaded with the staff token; then, in a \`finally\`, the probe deleted and \`GET themes/\` read back. No activation, post, setting or \`routes.yaml\` written.`,
    '',
    `**Ghost.** T1 \`${t.host}\` (6.x). Ghost 5's half is DW-326's (R-238, Story 15.7).`,
    '',
    '**The control, which voids the run:** the pilot theme\'s own round trip must compare with zero differences — a drift check that cried drift here would cry it on every deploy.',
    '',
    ...tableOf(rows),
    '',
    `- **Zero false positives on a real Ghost** (FR-J16, VERIFY-AT-BUILD 79 EXECUTED): Ghost re-zips the theme on download (${t.size} bytes, ${t.dirs.length} directory entries${t.dots.length === 0 ? ', no dot entry' : `, dot entries ${t.dots.join(', ')}`}), and the content manifests — path → SHA-256, CR-before-LF dropped — still match file for file. The zip's bytes are never compared.`,
    `- **Every upload replaces every file under the name, live or not** (\`storage.js:95-107\`, executed): \`${ADDED}\`, in the second upload, was ${t.third ? 'gone' : 'NOT gone'} after the third — R-287's baseline (the newest upload Ghost accepted) is what the site holds.`,
    `- **D3b's three Ghost causes are Ghost's answers**: a flipped token ${t.controls.flip}, the Admin key ${t.controls.admin}, an unknown theme ${t.controls.missing} — Ghost's \`BadRequestError\` "Please select a valid theme." (\`getZip\`, \`storage.js:43-50\`), never a 404, so the check reads a 400 on this download as \`missing\` (R-288, owner, 2026-11-24).`,
    `- **What this does NOT say.** Nothing went through the product's \`call()\`, its database, Vault or bucket: walk step 119 is the deploy route end to end. \`${t.active}\` stayed active throughout.`,
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
  console.log('\n  THE LOCAL HALF — the two manifests as the product builds them, over its own zip writer and reader')
  const local = await localHalf()
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND} (uploads and deletes ${PROBE}, never activated)`)
    const t = await t1Half(local)
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND REPORT (the spec\'s Ask First): Ghost does not hand back what Inflozo uploaded as Story 7.21 plans it, so no ignore rule may be written before the owner hears it')
    writeSection(SECTION, section(t, new Date().toISOString().slice(0, 10)))
    console.log(`\n    MEASUREMENTS.md §${SECTION} written — every row held, behind its control.`)
  } else {
    console.log(`\n    PASS — every row held. The local half sends nothing and writes nothing; §${SECTION} is the --t1 run's.`)
  }
} catch (err) {
  console.log(`\n  ** RUN VOID — nothing written to MEASUREMENTS.md. ${clean(err instanceof Void ? err.message : err.stack ?? err)}`)
  code = 1
}
process.exit(code)
