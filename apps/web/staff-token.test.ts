// Story 7.19 (R-280) — the one check a pasted Staff Access Token passes before it is kept (`server/staff-token.ts`), over an
// injected fetch and store: Ghost is asked `GET users/me/?include=roles` with the token in hand, and only an Owner's or an
// Administrator's is stored. Every refusal leaves `store` uncalled. The real Ghost's half is `record-staff-token.mjs` (§88).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { AdminError } from './server/ghost-admin/admin-rule.ts'
import { addStaffToken, USERS_ME, type StaffTokenIo } from './server/staff-token.ts'

const TOKEN = '6512a1b2c3d4e5f60718293a:' + 'ab'.repeat(32)
const ARGS = { siteId: 'site-1', userId: 'user-1', url: 'https://ghost6.inflozo.com', version: '6.58.0', token: TOKEN, route: 'test' }
const me = (role: string) => ({ users: [{ id: 'u1', roles: [{ name: role }] }] })

/** a fake io: Ghost's answer (or a throw), and every call each side received */
function io(answer: { status: number; body?: unknown; code?: string } | Error) {
  const fetched: Parameters<StaffTokenIo['fetchWithKey']>[0][] = []
  const stored: Parameters<StaffTokenIo['store']>[0][] = []
  const fake: StaffTokenIo = {
    fetchWithKey: async (args) => {
      fetched.push(args)
      if (answer instanceof Error) throw answer
      const text = JSON.stringify(answer.body ?? null)
      const ok = answer.status >= 200 && answer.status < 300
      return { ok, status: answer.status, body: answer.body ?? null, text, bytes: new TextEncoder().encode(text), ...(answer.code ? { code: answer.code } : {}) }
    },
    store: async (args) => {
      stored.push(args)
      return { ref: 'ref-1' }
    },
  }
  return { fake, fetched, stored }
}

test('an Owner\'s and an Administrator\'s token: Ghost asked ONCE, users/me with the roles, signed with the token in hand — then stored once, as staff', async () => {
  for (const role of ['Owner', 'Administrator']) {
    const { fake, fetched, stored } = io({ status: 200, body: me(role) })
    assert.deepEqual(await addStaffToken({ ...ARGS, token: `  ${TOKEN}  ` }, fake), { ok: true }, role)
    assert.equal(fetched.length, 1)
    assert.equal(fetched[0]?.path, 'users/me/?include=roles')
    assert.equal(fetched[0]?.path, USERS_ME)
    assert.equal(fetched[0]?.credential, TOKEN, 'the token, trimmed, in hand')
    assert.equal(fetched[0]?.method, undefined, 'a GET — permitted() passes it, ADMIN_WRITES stays four')
    assert.deepEqual([fetched[0]?.siteId, fetched[0]?.userId, fetched[0]?.major, fetched[0]?.siteUrl], ['site-1', 'user-1', 6, ARGS.url], 'the audit row\'s site and user')
    assert.deepEqual(stored, [{ siteId: 'site-1', userId: 'user-1', kind: 'staff', secret: TOKEN, route: 'test' }])
  }
})

test('below Administrator, a 401, the integration key\'s 404 and a busy Ghost: each refused with its code, and store NEVER called', async () => {
  const cases: [string, { status: number; body?: unknown; code?: string } | Error, Record<string, unknown>][] = [
    ['an Editor', { status: 200, body: me('Editor') }, { ok: false, code: 'token_role', role: 'Editor' }],
    ['a Super Editor', { status: 200, body: me('Super Editor') }, { ok: false, code: 'token_role', role: 'Super Editor' }],
    ['a Contributor', { status: 200, body: me('Contributor') }, { ok: false, code: 'token_role', role: 'Contributor' }],
    ['an unknown role reads as below', { status: 200, body: me('Wizard') }, { ok: false, code: 'token_role', role: 'Wizard' }],
    ['a 200 with no role', { status: 200, body: { users: [] } }, { ok: false, code: 'token_role' }],
    ['an unknown key', { status: 401, body: { errors: [{ type: 'UnauthorizedError' }] }, code: 'ghost_unknown_key' }, { ok: false, code: 'token_unknown' }],
    ['a bad signature', { status: 401, code: 'ghost_bad_signature' }, { ok: false, code: 'token_unknown' }],
    ['the integration key', { status: 404, body: { errors: [{ type: 'NotFoundError' }] }, code: 'ghost_refused' }, { ok: false, code: 'token_integration' }],
    ['another 404 is Ghost refusing, with its status', { status: 404, body: { errors: [{ type: 'Other' }] }, code: 'ghost_refused' }, { ok: false, code: 'ghost_refused', status: 404 }],
    ['a 403', { status: 403, code: 'ghost_refused' }, { ok: false, code: 'ghost_refused', status: 403 }],
    ['a 503', { status: 503, code: 'ghost_unavailable' }, { ok: false, code: 'ghost_unavailable' }],
    ['a 429', { status: 429, code: 'ghost_unavailable' }, { ok: false, code: 'ghost_unavailable' }],
    ['Ghost unreachable', new AdminError({ code: 'ghost_unreachable', message: 'x' }), { ok: false, code: 'ghost_unreachable' }],
    ['the store unreachable for the audit row', new AdminError({ code: 'credential_store_unavailable', message: 'x' }), { ok: false, code: 'credential_store_unavailable' }],
  ]
  for (const [name, answer, expected] of cases) {
    const { fake, fetched, stored } = io(answer)
    assert.deepEqual(await addStaffToken(ARGS, fake), expected, name)
    assert.equal(fetched.length, 1, `${name}: asked once`)
    assert.equal(stored.length, 0, `${name}: nothing stored`)
  }
})

test('empty and malformed are refused BEFORE Ghost is asked; a non-AdminError throw is thrown on', async () => {
  for (const [token, code] of [['', 'token_empty'], ['   ', 'token_empty'], ['hello', 'token_malformed'], ['abc:xyz', 'token_malformed'], ['a:b:c', 'token_malformed'], ['abc:abc', 'token_malformed']] as const) {
    const { fake, fetched, stored } = io({ status: 200, body: me('Owner') })
    assert.deepEqual(await addStaffToken({ ...ARGS, token }, fake), { ok: false, code }, token)
    assert.equal(fetched.length, 0, `${token}: Ghost is not called`)
    assert.equal(stored.length, 0)
  }
  const { fake } = io(new TypeError('boom'))
  await assert.rejects(addStaffToken(ARGS, fake), TypeError)
  // the control: a well-formed token reaches Ghost
  const control = io({ status: 401 })
  await addStaffToken(ARGS, control.fake)
  assert.equal(control.fetched.length, 1)
})

test('a store that refuses a kept token answers its code — malformed under the TOKEN\'s name', async () => {
  const { fake } = io({ status: 200, body: me('Administrator') })
  fake.store = async () => {
    throw new AdminError({ code: 'site_not_found', message: 'x' })
  }
  assert.deepEqual(await addStaffToken(ARGS, fake), { ok: false, code: 'site_not_found' })
  fake.store = async () => {
    throw new AdminError({ code: 'credential_malformed', message: 'x' })
  }
  assert.deepEqual(await addStaffToken(ARGS, fake), { ok: false, code: 'token_malformed' })
})

test('the token never reaches a log line — the check logs nothing at all', () => {
  const source = readFileSync('server/staff-token.ts', 'utf8')
  assert.doesNotMatch(source, /console\./)
})

test('both callers run THIS check, and Manage keys no longer stores a token unchecked (R-170)', () => {
  const keys = readFileSync('app/(app)/app/(authed)/sites/actions.ts', 'utf8')
  const branch = keys.slice(keys.indexOf('  if (staffToken) {'), keys.indexOf('  if (contentKey) {'))
  assert.match(branch, /await addStaffToken\(\{/)
  assert.doesNotMatch(branch, /\bstore\(/, 'no store() beside the check')
  assert.doesNotMatch(keys, /NOTHING VALIDATES IT AGAINST GHOST/)
  const editor = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/actions.ts', 'utf8')
  assert.match(editor, /const answer = await addStaffToken\(\{/)
})
