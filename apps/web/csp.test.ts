import { test } from 'node:test'
import assert from 'node:assert/strict'
import { policy, policyName } from './csp.ts'

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
  assert.equal(marketing['script-src'], `'self'`)
  assert.ok(!policy(MARKETING, '').includes('nonce'), 'marketing must carry no nonce — it stays prerendered')
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

test('connect-src names the Ghost origins on the app host and nowhere else', () => {
  const app = directives(policy(APP, N))
  assert.equal(app['connect-src'], `'self' https://ghost5.inflozo.com https://ghost6.inflozo.com`)
  assert.equal(directives(policy(MARKETING, ''))['connect-src'], undefined)
})

test('the policy name says which branch served the page', () => {
  assert.equal(policyName(APP, N), 'app-nonce')
  assert.equal(policyName('APP.INFLOZO.COM:443', N), 'app-nonce')
  assert.equal(policyName(MARKETING, ''), 'marketing-static')
  // a Ghost test server is not the app host — the same near-miss routing.ts was built around
  assert.equal(policyName('ghost6.inflozo.com', ''), 'marketing-static')
})
