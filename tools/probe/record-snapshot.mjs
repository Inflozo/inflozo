#!/usr/bin/env node
/**
 * STORY 7.20a — THE SNAPSHOT RECORDER (MEASUREMENTS §89): FR-J13's capture of the live theme, asked of a real Ghost exactly as
 * `server/snapshot.ts` asks it. Standing rule 1 for the Ghost claims the one capture rests on, until now read in Ghost's source
 * alone (6.58.0, 5.130.6):
 *   - `GET themes/` signed with a Staff Access Token answers 200, the active theme the entry with `active: true`, its `package`
 *     the theme's whole package.json (the marker read there, never the name);
 *   - `GET themes/{active}/download/` with the same token is a DIRECT 200 `application/zip` attachment — never a redirect — whose
 *     bytes open with a zip's `PK` (VERIFY-AT-BUILD 78);
 *   - the same download with the token's last hex digit flipped is a 401 (the control: the read can refuse at all);
 *   - the same download with the integration's Admin API key is a 403, and so is `GET themes/` with it — the Ghost 6 half of
 *     the ONE code `snapshot_needs_token` (VERIFY 9, MEASUREMENTS §15h; Ghost 5's 501 is DW-326's, R-238);
 *   - `GET settings/routes/yaml/` with the Admin key alone is 200 (R-282's premise, §37 re-run).
 * ANY OTHER ANSWER TO THE DOWNLOAD CHANGES THE CAPTURE'S PLAN BEFORE DEV SHIPS IT.
 *
 *   node --experimental-strip-types tools/probe/record-snapshot.mjs        # the local half: no request, writes nothing
 *   node --experimental-strip-types tools/probe/record-snapshot.mjs --t1   # then T1, read only — the owner's go, in the MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` reaches the network; ANY other argument (`--help` included) prints this and
 * exits 2 without a request.
 *
 * IT IS THE PRODUCT'S OWN CAPTURE, ON THE WIRE: every request is built by `adminRequest` (`apps/web/server/ghost-admin/
 * admin-rule.ts`) with the download's own budget (`READ_TIMEOUT_MS`), and the capture's reading is `captureSnapshot`'s
 * (`apps/web/server/snapshot.ts`) — handed an io whose `call` is that request against T1 and whose store RECORDS what it was
 * asked and writes nothing. Nothing reaches Inflozo's bucket, its database or Vault: the real write is the deployed walk's
 * step 117, through the real chokepoint.
 *
 * THE LOCAL HALF (both modes; no network): the two reads' requests — `GET`, `…/ghost/api/admin/themes/` and
 * `…/themes/casper/download/`, no body, `Accept-Version: v6.0`, `redirect: 'manual'` — built from a throwaway key; the flipped
 * token is still well-formed and one digit off; and `captureSnapshot` over a fake Ghost reads a staff list and zip as captured
 * (object before row), a marked theme as `marked` (nothing written), an Admin key's 403 and 501 as `snapshot_needs_token`, and
 * a staff 401 as `snapshot_token_refused` (each the next one's control).
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x). READ ONLY: six GETs and the capture's own two. Each row prints status, content type,
 * disposition, byte length, the `PK` magic and a sha256 — never a body, a name of a person or a key.
 * WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §89 alone, replacing an earlier §89 of its own.
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
const SECTION = '89'
const COMMAND = 'node --experimental-strip-types tools/probe/record-snapshot.mjs --t1'

const { adminRequest, READ_TIMEOUT_MS, CALL_TIMEOUT_MS } = await import(path.join(REPO, 'apps/web/server/ghost-admin/admin-rule.ts'))
const { captureSnapshot, downloadPath, THEMES_LIST } = await import(path.join(REPO, 'apps/web/server/snapshot.ts'))
const { ROUTES_PATH } = await import(path.join(REPO, 'apps/web/lib/routes-upload.ts'))
const { THEME_MARKER } = await import(path.join(REPO, 'packages/theme-compiler/src/compile.ts'))

class Void extends Error {}
const SECRETS = []
const clean = (s) => SECRETS.reduce((t, k) => t.split(k).join('<key>'), String(s))
const rows = []
const row = (half, where, what, ok, got = '') => {
  rows.push({ half, where, what, ok, got: String(got) })
  console.log(clean(`  ${ok ? 'PASS' : 'FAIL'}  ${where} — ${what}${got === '' ? '' : ` — ${got}`}`))
}

/** the token with its LAST hex digit changed: still `id:hex`, of even length, so only Ghost can refuse it */
const flipped = (token) => {
  const last = token.slice(-1).toLowerCase()
  return `${token.slice(0, -1)}${last === '0' ? '1' : '0'}`
}
const isZip = (bytes) => bytes.length >= 4 && bytes[0] === 0x50 && bytes[1] === 0x4b
const sha = (bytes) => crypto.createHash('sha256').update(bytes).digest('hex')

/** `captureSnapshot`'s io over a `send` (a fake Ghost, or T1): the site's credential chosen, a store that only RECORDS */
function ioOver(send, { staff }) {
  const steps = []
  return {
    steps,
    io: {
      site: async () => ({ staff }),
      call: async ({ path: p, kind, read }) => send(p, kind, read),
      current: async () => null,
      put: async (key, bytes) => {
        steps.put = bytes
        steps.push(`put ${bytes.length} bytes`)
      },
      upsert: async (r) => {
        steps.push(`row ${r.theme_name}`)
        return 'recorded-not-written'
      },
      remove: async () => void steps.push('remove'),
      now: () => new Date(),
      log: () => {},
    },
  }
}
const ARGS_OF = { siteId: 'recorder', userId: 'recorder', route: 'probe/record-snapshot' }

/* ───────────────────────────── the local half ───────────────────────────── */

async function localHalf() {
  const fake = `${crypto.randomBytes(12).toString('hex')}:${crypto.randomBytes(32).toString('hex')}`
  SECRETS.push(fake.split(':')[1])
  for (const p of [THEMES_LIST, downloadPath('casper')]) {
    const { url, init } = adminRequest({ credential: fake, siteUrl: 'https://ghost.example', method: 'GET', path: p, major: 6 })
    row('local', 'adminRequest', `GET ${p}: no body, at v6.0, a redirect answered and never followed`,
      url === `https://ghost.example/ghost/api/admin/${p}` && init.method === 'GET' && init.body === undefined && init.headers['Accept-Version'] === 'v6.0' && init.redirect === 'manual', url)
  }
  row('local', 'budget', 'the download has its own read budget, longer than an ordinary read', READ_TIMEOUT_MS.theme_download > CALL_TIMEOUT_MS, `${READ_TIMEOUT_MS.theme_download} ms`)
  const f = flipped(fake)
  row('local', 'flipped', 'the control token is well-formed and differs from the real one in its last digit alone',
    f.length === fake.length && f !== fake && f.slice(0, -1) === fake.slice(0, -1) && /^[0-9a-f]+:[0-9a-f]+$/.test(f), `${f.length} characters`)
  const zip = new Uint8Array([0x50, 0x4b, 3, 4, 1, 2, 3])
  const list = (pkg) => ({ ok: true, status: 200, body: { themes: [{ name: 'casper', active: true, package: pkg }] }, bytes: new Uint8Array() })
  const refuse = (status) => ({ ok: false, status, body: {}, bytes: new Uint8Array() })
  const cases = [
    ['staff · captured', true, [list({ version: '5.9.4' }), { ok: true, status: 200, body: null, bytes: zip }], (g, steps) => g.ok && g.theme === 'casper' && steps.join(',') === `put ${zip.length} bytes,row casper`],
    ['staff · marked', true, [list({ version: '1.0.0', [THEME_MARKER]: true })], (g, steps) => g.ok && g.marked === true && steps.length === 0],
    ['admin · 403', false, [refuse(403)], (g, steps) => !g.ok && g.code === 'snapshot_needs_token' && g.status === 403 && steps.length === 0],
    ['admin · 501', false, [refuse(501)], (g, steps) => !g.ok && g.code === 'snapshot_needs_token' && g.status === 501 && steps.length === 0],
    ['staff · 401', true, [refuse(401)], (g, steps) => !g.ok && g.code === 'snapshot_token_refused' && steps.length === 0],
  ]
  for (const [name, staff, answers, holds] of cases) {
    const queue = [...answers]
    const { io, steps } = ioOver(async () => queue.shift(), { staff })
    const got = await captureSnapshot(ARGS_OF, io)
    row('local', `captureSnapshot · ${name}`, 'read as the capture reads it', holds(got, steps), JSON.stringify(got))
  }
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

/** T1, through the product's own request builder — GETs only — with the download's own budget */
async function send(env, credential, p, read) {
  const { url, init } = adminRequest({ credential, siteUrl: env.GHOST6_URL, method: 'GET', path: p, major: 6 })
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(read ? READ_TIMEOUT_MS[read] : CALL_TIMEOUT_MS) })
  const bytes = new Uint8Array(await r.arrayBuffer())
  let body = null
  try {
    body = JSON.parse(new TextDecoder().decode(bytes))
  } catch {
    body = null
  }
  return { ok: r.ok, status: r.status, body, bytes, type: r.headers.get('content-type') ?? '—', disposition: r.headers.get('content-disposition') ?? '—', location: r.headers.get('location') }
}
const shape = (a) => `HTTP ${a.status} · ${a.type} · ${a.disposition} · ${a.bytes.length} bytes${isZip(a.bytes) ? ` · PK · sha256 ${sha(a.bytes).slice(0, 16)}…` : ''}`

async function t1Half() {
  const env = loadEnv()
  const host = new URL(env.GHOST6_URL).host
  const staff = env.GHOST6_STAFF_ACCESS_TOKEN
  const admin = env.GHOST6_ADMIN_API_KEY

  const list = await send(env, staff, THEMES_LIST)
  const active = Array.isArray(list.body?.themes) ? list.body.themes.find((t) => t?.active === true) : undefined
  const name = typeof active?.name === 'string' ? active.name : null
  const version = typeof active?.package?.version === 'string' ? active.package.version : null
  const marked = active?.package?.[THEME_MARKER] === true
  row('t1', `GET ${THEMES_LIST} [staff]`, '200, the active theme named with its package.json (and the marker read there)', list.status === 200 && name !== null, `HTTP ${list.status} · active ${name ?? '—'} ${version ?? ''} · package.${THEME_MARKER} ${marked}`)
  if (name === null) throw new Void('no active theme in the staff list')

  const p = downloadPath(name)
  const zip = await send(env, staff, p, 'theme_download')
  row('t1', `GET ${p} [staff]`, "a direct 200 application/zip attachment, no redirect, opening with the zip's PK", zip.status === 200 && /application\/zip/.test(zip.type) && /attachment/.test(zip.disposition) && zip.location === null && isZip(zip.bytes), shape(zip))
  const flip = await send(env, flipped(staff), p, 'theme_download')
  row('t1', `GET ${p} [flipped] (control)`, '401 — a token Ghost does not know', flip.status === 401, `HTTP ${flip.status} · errors[0].type ${flip.body?.errors?.[0]?.type ?? '—'}`)
  const adminZip = await send(env, admin, p, 'theme_download')
  row('t1', `GET ${p} [admin]`, '403 — the integration key may not download a theme', adminZip.status === 403, `HTTP ${adminZip.status} · errors[0].type ${adminZip.body?.errors?.[0]?.type ?? '—'}`)
  const adminList = await send(env, admin, THEMES_LIST)
  row('t1', `GET ${THEMES_LIST} [admin]`, "403 — the one code's Ghost 6 half (snapshot_needs_token)", adminList.status === 403, `HTTP ${adminList.status} · errors[0].type ${adminList.body?.errors?.[0]?.type ?? '—'}`)
  const routes = await send(env, admin, ROUTES_PATH)
  row('t1', `GET ${ROUTES_PATH} [admin]`, "200 — R-282's premise: routes.yaml reads with the integration key alone (§37 re-run)", routes.status === 200 && routes.bytes.length > 0, `HTTP ${routes.status} · ${routes.type} · ${routes.bytes.length} bytes`)

  // the product's own reading of the same answers: `captureSnapshot` with the staff token, and with the Admin key alone
  for (const [kind, credential, holds] of [
    ['staff', staff, (g, steps) => g.ok && (g.marked === true ? marked : g.theme === name && g.bytes === zip.bytes.length && steps[0] === `put ${zip.bytes.length} bytes`)],
    ['admin', admin, (g, steps) => !g.ok && g.code === 'snapshot_needs_token' && g.status === 403 && steps.length === 0],
  ]) {
    const { io, steps } = ioOver(async (path_, _k, read) => send(env, credential, path_, read), { staff: kind === 'staff' })
    const got = await captureSnapshot(ARGS_OF, io)
    // told, not held: whether Ghost's zip-on-the-fly gives the same bytes twice decides how walk step 117a compares them
    const same = steps.put ? ` · byte-identical to the first download: ${sha(steps.put) === sha(zip.bytes) ? 'yes' : 'no'}` : ''
    row('t1', `captureSnapshot [${kind}]`, kind === 'staff' ? 'captured: the object before the row (recorded, not written)' : 'snapshot_needs_token with the 403, nothing written', holds(got, steps), `${JSON.stringify(got)} · ${steps.join(', ') || 'nothing'}${same}`)
  }
  return { host, name, version, marked, zip, routes }
}

/* ───────────────────────────── §89 ───────────────────────────── */

const cell = (s) => clean(String(s)).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 240)
const tableOf = (list) => ['| Step | Row | Got | Held |', '|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
function section(t, today) {
  return [
    `## ${SECTION}. The live theme's capture on T1 — \`GET themes/\` and \`GET themes/{active}/download/\` with the Staff Access Token through the product's \`adminRequest\`, read by its own \`captureSnapshot\`: a direct 200 \`application/zip\` of \`${t.name}\`, a flipped digit 401, the Admin key 403 on both reads, and \`routes.yaml\` 200 with it · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — GETs only, nothing written anywhere: \`captureSnapshot\` is handed an io whose \`call\` sends \`adminRequest\`'s request to T1 and whose store records what it was asked.`,
    '',
    `**Ghost.** T1 \`${t.host}\` (6.x). Ghost 5's half — the Admin key's 501 — is DW-326's (R-238, Story 15.7).`,
    '',
    "**The control, which voids the run:** the same download with the token's last hex digit changed must answer 401, so the read can refuse at all.",
    '',
    ...tableOf(rows),
    '',
    `- **The download is a direct 200 attachment** (\`theme-storage.js\` \`serve()\`, read in source): ${t.zip.bytes.length} bytes of \`${t.name}\`${t.version ? ` ${t.version}` : ''} opening with \`PK\`, no redirect — so \`fetchWithKey\`'s \`redirect: 'manual'\` never meets one, and \`CallResult.bytes\` is the zip as-is. VERIFY-AT-BUILD 78 EXECUTED.`,
    `- **The marker is read on the list** (\`package.${THEME_MARKER}\` ${t.marked}): T1's live theme is ${t.marked ? "Inflozo's own, so a capture would write nothing" : 'not Inflozo\'s, so a first upload would capture it'}.`,
    "- **The Admin key is refused on both reads (403)**: B12b's `GET /ghost/api/admin/themes/ → 403` is T1's own answer, and the one code's Ghost 6 half. `routes.yaml` reads with it alone (R-282).",
    "- **What this does NOT say.** Nothing was stored: the bucket, the row and the signed URL are the deployed walk's step 117. Ghost 5's 501 is unexecuted here (T3 retired).",
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
  console.log('\n  THE LOCAL HALF — the reads as the product builds them, and captureSnapshot over a fake Ghost')
  await localHalf()
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND} (read only)`)
    const t = await t1Half()
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND ASK: Ghost does not answer the capture as Story 7.20a plans it (any other answer to the download changes the capture\'s plan)')
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
