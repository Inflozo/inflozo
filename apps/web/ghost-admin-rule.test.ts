import { test } from 'node:test'
import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import {
  ADMIN_WRITES,
  AdminError,
  adminUrl,
  ghostCode,
  ghostError,
  headers,
  majorOf,
  mintJwt,
  parseCredential,
  permitted,
} from './server/ghost-admin/admin-rule.ts'

/* Story 3.1 — the Admin chokepoint's pure half, contract-first: every branch here is green
   before anything in `index.ts` connects to a pooler or a Ghost. What is NOT here is the round
   trip — Vault, the pooler, both real Ghosts — which runs on the DEPLOYED site under
   `tools/probe/run-verify-ghost-admin.py` (R-82), because a mocked Vault proves nothing about
   the one that holds a customer's key. */

// A key of the real shape and NOT a real key: the kid is 24 hex, the secret 64 hex, which is
// what Ghost issues. Nothing in this file reads `tools/probe/.env`.
const KEY = '6512a1b2c3d4e5f60718293a:' + 'ab'.repeat(32)

test('the mint is the one the probe executes against both majors', () => {
  // Pinned `now`, so `exp - iat` is an assertion rather than a race.
  const jwt = mintJwt(KEY, 1_757_000_000_000)
  const [head, body, sig] = jwt.split('.')
  const header = JSON.parse(Buffer.from(head, 'base64url').toString())
  const claims = JSON.parse(Buffer.from(body, 'base64url').toString())

  assert.deepEqual(header, { alg: 'HS256', typ: 'JWT', kid: '6512a1b2c3d4e5f60718293a' })
  assert.equal(claims.aud, '/admin/')
  assert.equal(claims.iat, 1_757_000_000)
  assert.equal(claims.exp - claims.iat, 300, "Ghost's ceiling is five minutes and the mint asks for all of it")

  // THE SIGNATURE IS OVER THE HEX-DECODED SECRET. Signing over the hex TEXT yields a well-formed
  // JWT that Ghost answers `401 Invalid token: invalid signature` (§37) — our bug wearing the
  // user's error, and green under every assertion that only parses the token.
  const expected = createHmac('sha256', Buffer.from('ab'.repeat(32), 'hex'))
    .update(`${head}.${body}`)
    .digest('base64url')
  assert.equal(sig, expected)
  assert.notEqual(
    sig,
    createHmac('sha256', 'ab'.repeat(32)).update(`${head}.${body}`).digest('base64url'),
    'the HMAC key must be the decoded bytes, not the hex string',
  )
})

test('a credential that cannot sign is refused before Vault and before the network', () => {
  for (const bad of ['', 'nocolon', ':' + 'ab'.repeat(32), 'kid:', 'kid:zzzz', 'kid:abc', 'a:b:c']) {
    assert.throws(
      () => parseCredential(bad),
      (error: AdminError) => error.code === 'credential_malformed',
      `parseCredential(${JSON.stringify(bad)}) should be credential_malformed`,
    )
  }
  assert.deepEqual(parseCredential(` ${KEY} `), { kid: '6512a1b2c3d4e5f60718293a', secret: 'ab'.repeat(32) })
})

test('the write allowlist is exactly the four the owner approved', () => {
  // Deep-equal on the KEYS, so a fifth write is this test failing rather than a diff nobody read.
  // Three further writes were proposed and declined (R-22): the credential is all-or-nothing.
  assert.deepEqual(Object.keys(ADMIN_WRITES).sort(), [
    'announcement_clear',
    'routes_upload',
    'theme_activate',
    'theme_upload',
  ])
})

test('a GET needs no item, and every write must name its own', () => {
  assert.equal(permitted('GET', 'config/', undefined), true)
  assert.equal(permitted('get', 'settings/', undefined), true)

  assert.equal(permitted('POST', 'themes/upload/', undefined, 'theme_upload'), true)
  assert.equal(permitted('PUT', 'themes/casper/activate/', undefined, 'theme_activate'), true)
  assert.equal(permitted('POST', 'settings/routes/yaml/', undefined, 'routes_upload'), true)

  // The three denials the matrix names — and none of them reaches a network call.
  assert.equal(permitted('POST', 'posts/', { posts: [] }), false, 'no item')
  assert.equal(permitted('POST', 'posts/', { posts: [] }, 'theme_upload'), false, 'wrong item')
  assert.equal(permitted('DELETE', 'posts/x/', undefined, 'not_an_item'), false, 'invented item')
  // The method is part of the item, not decoration: the right path under the wrong verb is refused.
  assert.equal(permitted('DELETE', 'themes/upload/', undefined, 'theme_upload'), false, 'wrong method')
  // And a prototype key is not a member.
  assert.equal(permitted('POST', 'posts/', undefined, 'constructor'), false, 'inherited property')
})

test('the announcement clear may touch the three announcement settings and nothing else', () => {
  const clear = (body: unknown) => permitted('PUT', 'settings/', body, 'announcement_clear')
  assert.equal(clear({ settings: [{ key: 'announcement_content', value: '' }] }), true)
  assert.equal(
    clear({
      settings: [
        { key: 'announcement_content', value: '' },
        { key: 'announcement_visibility', value: '[]' },
        { key: 'announcement_background', value: 'accent' },
      ],
    }),
    true,
  )
  // The matrix row: one guarded key alongside a legal one is the whole body refused.
  assert.equal(clear({ settings: [{ key: 'announcement_content', value: '' }, { key: 'title', value: 'x' }] }), false)
  assert.equal(clear({ title: 'Owned' }), false, 'the flat shape is read too, or it is the way around the guard')
  assert.equal(clear({}), false, 'a write that names nothing is not a clear')
})

test('the URL builder only ever addresses the Admin API', () => {
  assert.equal(adminUrl('https://ghost6.inflozo.com', 'config/'), 'https://ghost6.inflozo.com/ghost/api/admin/config/')
  assert.equal(adminUrl('https://ghost6.inflozo.com/', '/settings/'), 'https://ghost6.inflozo.com/ghost/api/admin/settings/')
  // A subdirectory install keeps its path: Ghost supports `https://example.com/blog`.
  assert.equal(adminUrl('https://example.com/blog', 'config/'), 'https://example.com/blog/ghost/api/admin/config/')
  assert.throws(() => adminUrl('https://example.com/blog', '../../content/posts/'), (e: AdminError) => e.code === 'path_not_admin')
  // A dot segment the allowlist's `[^/]+` would admit: `themes/../activate/` is not an activate.
  for (const dotted of ['themes/../activate/', 'themes/./activate/', '.', '..']) {
    assert.throws(() => adminUrl('https://ghost6.inflozo.com', dotted), (e: AdminError) => e.code === 'path_not_admin', dotted)
  }
  // `sites.url` is client-writable: one that is not a URL is refused, not thrown as a TypeError.
  assert.throws(() => adminUrl('not a url', 'config/'), (e: AdminError) => e.code === 'site_url_invalid')

  // P5: no Content API call from the server, EVER — and a traversal is how it would happen by
  // accident. `URL` resolution plus one prefix check refuses that, an absolute path and another
  // origin with the same line; string concatenation would have shipped all three.
  for (const escape of ['../content/posts/', '/ghost/api/content/settings/', 'https://evil.example/x', '../../']) {
    assert.throws(
      () => adminUrl('https://ghost6.inflozo.com', escape),
      (error: AdminError) => error.code === 'path_not_admin',
      `adminUrl should refuse ${escape}`,
    )
  }
})

test('Accept-Version is sent only once the version is known', () => {
  assert.deepEqual(headers('jwt'), { Authorization: 'Ghost jwt' })
  assert.deepEqual(headers('jwt', 6), { Authorization: 'Ghost jwt', 'Accept-Version': 'v6.0' })
  assert.equal(majorOf('6.58.0'), 6)
  assert.equal(majorOf('5.130.6'), 5)
  assert.equal(majorOf(null), undefined)
  assert.equal(majorOf(''), undefined)
})

test('a 401 is told apart by its cause, and "expired" is not one of them', () => {
  // Executed on both majors, §37: a key Ghost never issued, and a JWT we mis-signed.
  const unknown = { errors: [{ message: 'Unknown Admin API Key', type: 'UnauthorizedError', code: 'UNKNOWN_ADMIN_API_KEY' }] }
  const invalid = { errors: [{ message: 'Invalid token: invalid signature', type: 'UnauthorizedError' }] }
  assert.equal(ghostCode(401, ghostError(unknown)), 'ghost_unknown_key')
  assert.equal(ghostCode(401, ghostError(invalid)), 'ghost_bad_signature')
  assert.equal(ghostCode(401, undefined), 'ghost_unauthorized')
  assert.equal(ghostCode(403, ghostError({ errors: [{ type: 'NoPermissionError' }] })), 'ghost_refused')
  // A redirect is answered, never followed: an http:// site's upgrade must not read as a refusal.
  assert.equal(ghostCode(301, undefined), 'ghost_redirected')
  assert.equal(ghostError({}), undefined)
  assert.equal(ghostError('not json'), undefined)

  // The word the whole product must never say, in the one file that decides the wording.
  assert.doesNotMatch(
    readFileSync('server/ghost-admin/admin-rule.ts', 'utf8').replace(/\/\*[^]*?\*\//g, ' '),
    /expire/i,
    'Admin API keys have no expiry (§37): a code or message saying so describes a failure Ghost cannot produce.',
  )
})
