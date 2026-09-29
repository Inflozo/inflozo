import { test, type TestContext } from 'node:test'
import assert from 'node:assert/strict'
import { createServer } from 'node:http'
import type { AddressInfo } from 'node:net'
import { createServerClient } from '@supabase/ssr'
import {
  SIGN_OUT_FAILED_PATH,
  SIGNED_OUT_PATH,
  signOutFailed,
  signOutPathFor,
} from './app/(app)/app/sign-in/signed-out.ts'

/* DW-41 (Story 5.24b): WHERE A SIGN-OUT LANDS, EXECUTED against the installed client instead of
   read in it. The landing used to follow the error `/logout` answered, and the client's own
   behaviour made that a lie. `_signOut` deletes this device's cookie before it returns most
   failures, and keeps it on the one path that returns before any `/logout`.

   Nothing here is a fake Supabase client. It is the app's own `createServerClient`
   (`@supabase/ssr` 0.12.6 over `@supabase/auth-js` 2.115.0), holding a signed-in session in the
   cookie `sb-127-auth-token` (the client derives the name from the host, `127.0.0.1`). It talks to a
   `node:http` GoTrue that answers each `/logout` scope, and the refresh, with the status it is
   given. Each case asserts what reached the server, what happened to the cookie, and the landing. */

const COOKIE = 'sb-127-auth-token'

type Answers = { others?: number; local?: number; refresh?: number }

/** A GoTrue that records every request and answers 200 unless told otherwise. */
async function gotrue(t: TestContext, answers: Answers, onRefresh = () => {}) {
  const seen: string[] = []
  const server = createServer((request, response) => {
    const url = new URL(request.url ?? '/', 'http://gotrue')
    const scope = url.searchParams.get('scope')
    const logout = url.pathname === '/auth/v1/logout'
    seen.push(logout ? `logout?scope=${scope}` : `${request.method} ${url.pathname}`)
    if (!logout) onRefresh()
    const status = (logout ? answers[scope as keyof Answers] : answers.refresh) ?? 200
    response.writeHead(status, { 'content-type': 'application/json' })
    response.end(status < 300 ? '' : JSON.stringify({ code: status, error_code: 'unexpected_failure', msg: 'down' }))
  })
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  t.after(() => server.close())
  return { url: `http://127.0.0.1:${(server.address() as AddressInfo).port}`, seen }
}

/** This device: a signed-in session in the cookie, the jar `setAll` writes to, and the app's client over it. */
function device(url: string, expiresAt: number) {
  const session = {
    access_token: 'header.payload.signature',
    refresh_token: 'refresh',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: expiresAt,
    user: { id: '11111111-1111-1111-1111-111111111111', aud: 'authenticated', role: 'authenticated' },
  }
  let jar = [{ name: COOKIE, value: `base64-${Buffer.from(JSON.stringify(session)).toString('base64url')}` }]
  const client = createServerClient(url, 'publishable', {
    cookies: {
      getAll: () => jar,
      setAll(written) {
        for (const { name, value } of written) {
          jar = [...jar.filter((cookie) => cookie.name !== name), ...(value ? [{ name, value }] : [])]
        }
      },
    },
  })
  return { client, signedIn: () => jar.some((cookie) => cookie.name === COOKIE) }
}

const inAnHour = () => Math.floor(Date.now() / 1000) + 3600

test('the control: GoTrue answering, every scope reaches it and no session is left', async (t) => {
  for (const scopes of [['local'], ['others', 'local']] as const) {
    const server = await gotrue(t, {})
    const phone = device(server.url, inAnHour())
    assert.equal(await signOutFailed(phone.client, scopes), false, `${scopes}: nothing failed`)
    assert.deepEqual(server.seen, scopes.map((scope) => `logout?scope=${scope}`), `${scopes}: each call, in order`)
    assert.equal(phone.signedIn(), false, `${scopes}: the cookie is deleted`)
  }
})

test('everywhere: `others` answering 500 stops there, this device keeps its session, "try again" is true', async (t) => {
  const server = await gotrue(t, { others: 500 })
  const laptop = device(server.url, inAnHour())
  assert.equal(await signOutFailed(laptop.client, ['others', 'local']), true, 'the dialog says "try again"')
  assert.deepEqual(server.seen, ['logout?scope=others'], '`local` is never made after `others` failed')
  assert.equal(laptop.signedIn(), true, 'the client keeps the session on a failed `others`, so the retry is real')
})

test('everywhere: `others` 200, then `local` 500, lands on the everywhere sentence, because the client deleted the cookie', async (t) => {
  const server = await gotrue(t, { local: 500 })
  const laptop = device(server.url, inAnHour())
  assert.equal(
    await signOutFailed(laptop.client, ['others', 'local']),
    false,
    'every other device is signed out and this one holds no session: SIGNED_OUT_EVERYWHERE_PATH',
  )
  assert.deepEqual(server.seen, ['logout?scope=others', 'logout?scope=local'])
  assert.equal(laptop.signedIn(), false, "auth-js deletes this device's cookie before it returns the 500")
})

test('`local` 500 alone lands on the sign-in card, not on a red line the guard would bounce', async (t) => {
  const server = await gotrue(t, { local: 500 })
  const laptop = device(server.url, inAnHour())
  assert.equal(signOutPathFor(await signOutFailed(laptop.client, ['local'])), SIGNED_OUT_PATH)
  assert.deepEqual(server.seen, ['logout?scope=local'])
  assert.equal(laptop.signedIn(), false, "auth-js deletes this device's cookie before it returns the 500")
})

test('an expired ticket whose refresh answers 500 keeps the cookie, makes no /logout, and lands on the red line', async (t) => {
  // THE CLIENT RETRIES A 500 REFRESH FOR 30 SECONDS OF ITS OWN CLOCK (`GoTrueClient.js:4012-4028`,
  // `AUTO_REFRESH_TICK_DURATION_MS`, `lib/constants.js:6`), so the real run took 25.5 s over eight
  // attempts and ended exactly where this one does. This GoTrue spends that budget on the client's
  // clock as it answers, so the first 500 is the last try. Only `Date` is mocked (node:test's own
  // timers, `with-timeout.test.ts`'s precedent); the client, its storage and the server are real.
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() })
  const server = await gotrue(t, { refresh: 500 }, () => t.mock.timers.tick(30_000))
  const laptop = device(server.url, Math.floor(Date.now() / 1000) - 60)
  assert.equal(signOutPathFor(await signOutFailed(laptop.client, ['local'])), SIGN_OUT_FAILED_PATH)
  assert.ok(server.seen.length > 0, 'the refresh reached the server, so its 500 is what was answered')
  assert.ok(
    server.seen.every((request) => request === 'POST /auth/v1/token'),
    `no /logout is made when the ticket cannot be refreshed: ${server.seen}`,
  )
  assert.equal(laptop.signedIn(), true, 'the cookie stays, so this device is still signed in')
})
