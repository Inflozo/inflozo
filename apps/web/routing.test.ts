import { test } from 'node:test'
import assert from 'node:assert/strict'
import { route, stripApp } from './routing.ts'

test('stripApp takes the internal prefix off as a segment, never as a prefix', () => {
  assert.equal(stripApp('/app'), '/')
  assert.equal(stripApp('/app/'), '/')
  assert.equal(stripApp('/app/sites'), '/sites')
  assert.equal(stripApp('/'), '/')
  assert.equal(stripApp('/sites'), '/sites')
  assert.equal(stripApp('/apply'), '/apply')
})

test('the app host rewrites to the internal prefix and keeps the query', () => {
  assert.deepEqual(route('app.inflozo.com', '/', ''), { kind: 'rewrite', path: '/app/' })
  assert.deepEqual(route('app.inflozo.com', '/', '?token=T'), {
    kind: 'rewrite',
    path: '/app/?token=T',
  })
})

test('the apex sends the app prefix to the app host, query intact', () => {
  assert.deepEqual(route('inflozo.com', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
  assert.deepEqual(route('inflozo.com', '/app/signin', '?next=%2Fdashboard'), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/signin?next=%2Fdashboard',
  })
  assert.deepEqual(route('inflozo.com', '/app', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/',
  })
})

test('/app is a segment, not a prefix', () => {
  for (const p of ['/apply', '/apps', '/appearance', '/approach']) {
    assert.deepEqual(route('inflozo.com', p, ''), { kind: 'pass' }, p)
  }
})

test('the app host never double-prefixes', () => {
  assert.deepEqual(route('app.inflozo.com', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
})

test('only the two exact hosts route', () => {
  assert.deepEqual(route('www.inflozo.com', '/app/x', ''), { kind: 'pass' })
  assert.deepEqual(route('ghost5.inflozo.com', '/app/x', ''), { kind: 'pass' })
  assert.deepEqual(route('notinflozo.com', '/app/x', ''), { kind: 'pass' })
})

test('the host header may carry a port or capitals', () => {
  assert.deepEqual(route('APP.INFLOZO.COM', '/', ''), { kind: 'rewrite', path: '/app/' })
  assert.deepEqual(route('inflozo.com:3000', '/app/x', ''), {
    kind: 'redirect',
    url: 'https://app.inflozo.com/x',
  })
})

test('localhost is untouched, so dev needs no host tricks', () => {
  assert.deepEqual(route('localhost:3000', '/', ''), { kind: 'pass' })
  assert.deepEqual(route('localhost:3000', '/app', ''), { kind: 'pass' })
})
