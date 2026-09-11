import { test } from 'node:test'
import assert from 'node:assert/strict'
import { policy, policyName, requestHeaders } from './csp.ts'

// The four claims the spine and NFR-3 make about the CSP, made checkable. §18 proved the
// MECHANISM on Vercel; this proves the STRING, which is the half a deploy cannot catch —
// a nonce policy that silently loses `'strict-dynamic'` still looks like a policy.

const APP = 'app.inflozo.com'
const MARKETING = 'inflozo.com'
const N = 'test-nonce'

/** `default-src 'self'; script-src …` -> { 'default-src': "'self'", … } */
const directives = (csp: string) =>
  Object.fromEntries(
    csp.split('; ').map((d) => {
      const [name, ...rest] = d.split(' ')
      return [name, rest.join(' ')]
    }),
  )

test('the nonce and strict-dynamic are on the app host only', () => {
  const app = directives(policy(APP, N))
  assert.equal(app['script-src'], `'self' 'nonce-${N}' 'strict-dynamic'`)

  const marketing = directives(policy(MARKETING, ''))
  assert.equal(marketing['script-src'], `'self' 'unsafe-inline'`)
  assert.ok(!policy(MARKETING, '').includes('nonce'), 'marketing must carry no nonce — it stays prerendered')
})

/**
 * DW-18's marketing half, the owner's Question 1 ruling (option 1, 2026-09-11) — and the guard on
 * it. `policy()` is ONE function serving two hosts, which is exactly the shape in which a later
 * edit walks a relaxation across the split without anyone noticing: the app host would keep
 * looking correct (`'nonce-…' 'strict-dynamic'` still there) while `'unsafe-inline'` sat beside
 * them. Asserted in both directions, at every combination of host and nonce the function takes,
 * so it cannot be satisfied by the one case someone happened to think of.
 */
test("'unsafe-inline' is the marketing host's alone — the app policy may never carry it", () => {
  for (const nonce of [N, '']) {
    for (const host of [APP, 'localhost:3000']) {
      const csp = policy(host, nonce)
      if (!csp.includes('strict-dynamic')) continue          // that combination is not an app request
      assert.ok(
        !directives(csp)['script-src'].includes("'unsafe-inline'"),
        `the app policy carries 'unsafe-inline' in script-src (host ${host}, nonce ${JSON.stringify(nonce)}) — ` +
          "the relaxation is the MARKETING host's alone (DW-18, the owner's ruling of 2026-09-11), and " +
          'this function serves both.',
      )
    }
  }
  // …and it really is there on the other side, so this test cannot pass by the relaxation being gone.
  assert.ok(directives(policy(MARKETING, ''))['script-src'].includes("'unsafe-inline'"))
})

test('a nonce marks an app request even without the app host — localhost has no host split', () => {
  assert.match(policy('localhost:3000', N), /'strict-dynamic'/)
  assert.ok(!policy('localhost:3000', '').includes('strict-dynamic'))
})

test("no 'unsafe-eval' unless dev — §18c makes this a requirement, not an observation", () => {
  for (const host of [APP, MARKETING]) {
    for (const nonce of [N, '']) {
      assert.ok(
        !policy(host, nonce).includes('unsafe-eval'),
        `${host} (nonce=${Boolean(nonce)}): the production policy must never carry 'unsafe-eval'`,
      )
    }
  }
  // and the dev relaxation exists, so the negative above is a control rather than a tautology
  assert.ok(policy(APP, N, true).includes("'unsafe-eval'"))
  assert.ok(policy(MARKETING, '', true).includes("'unsafe-eval'"))
})

test("frame-ancestors and form-action are 'self' on both policies", () => {
  for (const csp of [policy(APP, N), policy(MARKETING, '')]) {
    const d = directives(csp)
    // 'none' would break AD-21's same-origin editing iframe; absent would break nothing
    // visibly and leave the page framable, which is why both are asserted by value.
    assert.equal(d['frame-ancestors'], `'self'`)
    assert.equal(d['form-action'], `'self'`)
    assert.equal(d['base-uri'], `'self'`)
    assert.equal(d['default-src'], `'self'`)
  }
})

test('connect-src is self and https on the app host, and nowhere else', () => {
  // Story 3.2: the customer's Ghost is the origin the browser checks the Content API key against,
  // and it is never a stored one — it is being typed. `https:` is the narrowest value that makes
  // FR-C2's browser-side check possible for every customer.
  const app = directives(policy(APP, N))
  assert.equal(app['connect-src'], `'self' https:`)
  // `http:` stays out: mixed content would block it anyway and the field warns before Connect.
  assert.ok(!app['connect-src'].includes('http:'), "connect-src must not admit plain http")
  assert.ok(!app['connect-src'].includes('*'), "connect-src must not be widened to a wildcard")
  assert.equal(directives(policy(MARKETING, ''))['connect-src'], undefined)
})

test('the policy name says which branch served the page', () => {
  assert.equal(policyName(APP, N), 'app-nonce')
  assert.equal(policyName('APP.INFLOZO.COM:443', N), 'app-nonce')
  assert.equal(policyName(MARKETING, ''), 'marketing-static')
  // a Ghost test server is not the app host — the same near-miss routing.ts was built around
  assert.equal(policyName('ghost6.inflozo.com', ''), 'marketing-static')
})

test('the two request headers travel together, and marketing gets neither', () => {
  const csp = policy(APP, N)
  // §18's SILENT failure: Next stamps its own <script> tags from the REQUEST policy, so handing
  // the layout a nonce without it blocks every script on the page behind a response header that
  // still reads exactly right. The pair is one value so one of them cannot be dropped alone.
  assert.deepEqual(requestHeaders(N, csp), { 'x-nonce': N, 'content-security-policy': csp })
  assert.deepEqual(requestHeaders('', policy(MARKETING, '')), {})
})

test('the two most-weakened directives are held by value, not left to drift wider', () => {
  for (const csp of [policy(APP, N), policy(MARKETING, '')]) {
    const d = directives(csp)
    // 'unsafe-inline' is here because next/font and React inline critical CSS; it is the widest
    // thing in either policy and the one most likely to be copied into script-src by accident.
    assert.equal(d['style-src'], `'self' 'unsafe-inline'`)
    assert.equal(d['img-src'], `'self' data: https:`)
  }
})
