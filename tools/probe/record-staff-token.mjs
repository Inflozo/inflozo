#!/usr/bin/env node
/**
 * STORY 7.19 — THE STAFF TOKEN RECORDER (MEASUREMENTS §88): whose token it is, asked of a real Ghost exactly as the first
 * deploy's Safety net and Manage keys ask it (R-280). Standing rule 1 for the three Ghost claims `server/staff-token.ts`
 * rests on, until now read in Ghost's source alone (6.58.0, 5.130.6):
 *   - `GET users/me/?include=roles` signed with a Staff Access Token answers 200 with THE TOKEN'S OWN USER and its role;
 *   - the same token with one hex digit changed answers 401 — a token Ghost does not know (the control);
 *   - an integration's Admin API key, which looks identical (`id:hex`), answers 404 `NotFoundError`: it has no user, so
 *     `me` stays literal and finds nobody. ANY OTHER ANSWER CHANGES `token_integration`'s TRIGGER BEFORE DEV SHIPS IT.
 *
 *   node --experimental-strip-types tools/probe/record-staff-token.mjs        # the local half: no request, writes nothing
 *   node --experimental-strip-types tools/probe/record-staff-token.mjs --t1   # then T1, read only — the owner's go, in the MAIN session only
 *
 * THIS HEADER IS ITS HELP. Only an explicit `--t1` reaches the network; ANY other argument (`--help` included) prints this
 * and exits 2 without a request.
 *
 * IT IS THE PRODUCT'S OWN CHECK, ON THE WIRE: every request is built by `adminRequest` (`apps/web/server/ghost-admin/
 * admin-rule.ts`) and sent as built, and every reading is `addStaffToken`'s (`apps/web/server/staff-token.ts`) — handed an
 * `io` whose fetch is that request against T1 (with the code `ghostCode` gives the chokepoint's answer) and whose store
 * RECORDS that it was asked and writes nothing. So "kept", "token_unknown" and "token_integration" below are the product's
 * own words for T1's own answers. Nothing reaches Inflozo's database or Vault, and no audit row is written: that path is the
 * deployed walk's step 116 (c), which adds a token through the real chokepoint.
 *
 * THE LOCAL HALF (both modes; no network): the read's request — `GET`, `…/ghost/api/admin/users/me/?include=roles`, no body,
 * `Accept-Version: v6.0` — built from a well-formed throwaway key; the flipped token is still well-formed and differs from
 * the real one in its last hex digit alone; and `addStaffToken` over a fake Ghost reads an Owner's 200 as kept, an Editor's
 * 200 as `token_role`, a 401 as `token_unknown` and a 404 `NotFoundError` as `token_integration`, the store asked once, for
 * the Owner's alone (each the next one's control).
 *
 * THE --t1 HALF (T1 `GHOST6_URL`, 6.x; T3 is retired, R-238 — Ghost 5's half is DW-326's, Story 15.7). READ ONLY: three GETs.
 *   1. `GHOST6_STAFF_ACCESS_TOKEN` → 200, and its user's role is the Owner or an Administrator: `addStaffToken` keeps it.
 *   2. The same token, its last hex digit flipped → 401: `token_unknown`, nothing kept (the control — the read can refuse).
 *   3. `GHOST6_ADMIN_API_KEY` → 404 `NotFoundError`: `token_integration`, nothing kept.
 * Each row prints the status, `errors[0].type` and the role — never a body, a name or an email.
 * WHAT IT WRITES HERE: with --t1 and every row held, MEASUREMENTS.md §88 alone, replacing an earlier §88 of its own.
 *
 * NO KEY IS EVER PRINTED: `GHOST6_URL`, `GHOST6_ADMIN_API_KEY` and `GHOST6_STAFF_ACCESS_TOKEN` are read from
 * tools/probe/.env in-process, by name (never argv, never the environment), and every line and cell is scrubbed of them.
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
const SECTION = '88'
const COMMAND = 'node --experimental-strip-types tools/probe/record-staff-token.mjs --t1'

const { adminRequest, ghostCode, ghostError } = await import(path.join(REPO, 'apps/web/server/ghost-admin/admin-rule.ts'))
const { addStaffToken, USERS_ME } = await import(path.join(REPO, 'apps/web/server/staff-token.ts'))
const { staffRoleOf, STAFF_ROLES_OK } = await import(path.join(REPO, 'apps/web/lib/connect-rule.ts'))

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

/** `addStaffToken`'s io over a `send` (a fake Ghost, or T1): the chokepoint's answer shape, and a store that only records */
function ioOver(send) {
  const asked = []
  return {
    asked,
    io: {
      fetchWithKey: async ({ credential, siteUrl, path: p, major }) => {
        const answer = await send(credential, siteUrl, p, major)
        return { ...answer, bytes: new TextEncoder().encode(answer.text), ...(answer.ok ? {} : { code: ghostCode(answer.status, ghostError(answer.body)) }) }
      },
      store: async (args) => {
        asked.push(args.kind)
        return { ref: 'not-stored' }
      },
    },
  }
}

const ARGS_OF = (url, token) => ({ siteId: 'recorder', userId: 'recorder', url, version: '6.58.0', token, route: 'probe/record-staff-token' })

/* ───────────────────────────── the local half ───────────────────────────── */

async function localHalf() {
  const fake = `${crypto.randomBytes(12).toString('hex')}:${crypto.randomBytes(32).toString('hex')}`
  SECRETS.push(fake.split(':')[1])
  const { url, init } = adminRequest({ credential: fake, siteUrl: 'https://ghost.example', method: 'GET', path: USERS_ME, major: 6 })
  row('local', 'adminRequest', 'the read is a GET of users/me with the roles, no body, at v6.0', url === 'https://ghost.example/ghost/api/admin/users/me/?include=roles' && init.method === 'GET' && init.body === undefined && init.headers['Accept-Version'] === 'v6.0', url)
  const f = flipped(fake)
  row('local', 'flipped', 'the control token is well-formed and differs from the real one in its last digit alone',
    f.length === fake.length && f !== fake && f.slice(0, -1) === fake.slice(0, -1) && /^[0-9a-f]+:[0-9a-f]+$/.test(f), `${f.length} characters`)
  const answers = {
    owner: { ok: true, status: 200, body: { users: [{ roles: [{ name: 'Owner' }] }] } },
    editor: { ok: true, status: 200, body: { users: [{ roles: [{ name: 'Editor' }] }] } },
    unknown: { ok: false, status: 401, body: { errors: [{ type: 'UnauthorizedError', message: 'Unknown Admin API Key' }] } },
    integration: { ok: false, status: 404, body: { errors: [{ type: 'NotFoundError' }] } },
  }
  const expected = { owner: '{"ok":true}', editor: '{"ok":false,"code":"token_role","role":"Editor"}', unknown: '{"ok":false,"code":"token_unknown"}', integration: '{"ok":false,"code":"token_integration"}' }
  for (const [name, a] of Object.entries(answers)) {
    const { io, asked } = ioOver(async () => ({ ...a, text: JSON.stringify(a.body) }))
    const got = JSON.stringify(await addStaffToken(ARGS_OF('https://ghost.example', fake), io))
    row('local', `addStaffToken · ${name}`, `read as ${expected[name]}, the store asked ${name === 'owner' ? 'once' : 'never'}`, got === expected[name] && asked.length === (name === 'owner' ? 1 : 0), got)
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

/** T1, through the product's own request builder, the key named — GETs only */
async function send(credential, siteUrl, p, major) {
  const { url, init } = adminRequest({ credential, siteUrl, method: 'GET', path: p, major })
  const r = await fetch(url, { ...init, signal: AbortSignal.timeout(15_000) })
  const text = await r.text()
  let body = null
  try {
    body = text ? JSON.parse(text) : null
  } catch {
    body = null
  }
  return { ok: r.ok, status: r.status, body, text }
}

async function t1Half() {
  const env = loadEnv()
  const host = new URL(env.GHOST6_URL).host
  const seen = {}
  for (const [name, credential, want] of [
    ['staff', env.GHOST6_STAFF_ACCESS_TOKEN, 'kept'],
    ['flipped', flipped(env.GHOST6_STAFF_ACCESS_TOKEN), 'token_unknown'],
    ['admin', env.GHOST6_ADMIN_API_KEY, 'token_integration'],
  ]) {
    let raw = null
    const { io, asked } = ioOver(async (c, siteUrl, p, major) => (raw = await send(c, siteUrl, p, major)))
    const answer = await addStaffToken(ARGS_OF(env.GHOST6_URL, credential), io)
    const read = answer.ok ? 'kept' : answer.code
    const role = raw?.ok ? staffRoleOf(raw.body) : null
    const type = ghostError(raw?.body)?.type ?? '—'
    seen[name] = { status: raw?.status ?? 0, type, role, read }
    const got = `HTTP ${raw?.status ?? 'none'} · errors[0].type ${type} · role ${role ?? '—'} · read ${read} · stored ${asked.length === 0 ? 'nothing' : 'asked once (recorded, not written)'}`
    if (name === 'staff') {
      row('t1', `GET ${USERS_ME} [${name}]`, `200, the token's own user is the Owner or an Administrator, and addStaffToken keeps it`, raw?.status === 200 && STAFF_ROLES_OK.includes(role) && read === 'kept' && asked.length === 1, got)
    } else if (name === 'flipped') {
      row('t1', `GET ${USERS_ME} [${name}] (control)`, '401 — a token Ghost does not know; token_unknown, nothing kept', raw?.status === 401 && read === 'token_unknown' && asked.length === 0, got)
    } else {
      row('t1', `GET ${USERS_ME} [${name}]`, "404 NotFoundError — an integration's key has no user; token_integration, nothing kept", raw?.status === 404 && type === 'NotFoundError' && read === 'token_integration' && asked.length === 0, got)
    }
  }
  return { host, seen }
}

/* ───────────────────────────── §88 ───────────────────────────── */

const cell = (s) => clean(String(s)).replace(/\|/g, '\\|').replace(/`/g, "'").replace(/\s+/g, ' ').slice(0, 220)
const tableOf = (list) => ['| Step | Row | Got | Held |', '|---|---|---|---|', ...list.map((r) => `| ${cell(r.where)} | ${cell(r.what)} | \`${cell(r.got)}\` | ${r.ok ? 'yes' : 'no'} |`)]
function section(t, today) {
  return [
    `## ${SECTION}. Whose Staff Access Token it is, on T1 — \`GET users/me/?include=roles\` through the product's \`adminRequest\` and read by its own \`addStaffToken\`: the staff token's user is the ${t.seen.staff.role}, one flipped digit is a 401, and the integration's Admin API key a 404 \`NotFoundError\` · T1 · ${today}`,
    '',
    `**Command.** \`${COMMAND}\` — three GETs, nothing written anywhere: \`addStaffToken\` is handed an io whose fetch sends \`adminRequest\`'s request to T1 and whose store records that it was asked.`,
    '',
    `**Ghost.** T1 \`${t.host}\` (6.x). Ghost 5's half is DW-326's (R-238, Story 15.7).`,
    '',
    '**The control, which voids the run:** the same token with its last hex digit changed must answer 401 and be refused, so the read can refuse at all.',
    '',
    ...tableOf(rows),
    '',
    `- **\`users/me\` with a staff token is the token's own user** (read in source: \`api/endpoints/users.js:30\`, \`serializers/input/users.js:17,25\`), roles included (\`ALLOWED_INCLUDES\`): T1 answered ${t.seen.staff.status} with \`${t.seen.staff.role}\`, so Story 7.19's check keeps an Owner's or an Administrator's token and the Safety net can be added on T1.`,
    `- **An integration's Admin API key answers ${t.seen.admin.status} \`${t.seen.admin.type}\`** — the reading \`token_integration\` keys on (an Admin key has no \`context.user\`, so \`me\` stays literal and \`findOne\` finds nobody). Read in source until now; executed here.`,
    "- **What this does NOT say.** An Editor's token was not executed: T1 has no Editor, so `token_role` rests on both majors' `fixtures.json` and `staff-token.test.ts`. The product's `call()` path (Vault, `credentials_present`, the `admin_read` audit row) is the deployed walk's step 116 (c).",
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
  console.log('\n  THE LOCAL HALF — the read as the product builds it, and addStaffToken over a fake Ghost')
  await localHalf()
  if (rows.some((r) => !r.ok)) throw new Void('the local half did not hold')
  if (T1) {
    console.log(`\n  THE T1 HALF — ${COMMAND} (read only)`)
    const t = await t1Half()
    if (rows.some((r) => !r.ok)) throw new Void('a T1 row did not hold — STOP AND ASK: Ghost does not answer the token check as Story 7.19 claims (an integration key that is not a 404 changes token_integration\'s trigger)')
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
