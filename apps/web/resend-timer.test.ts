import { test } from 'node:test'
import assert from 'node:assert/strict'
import { mmss, retryAfterFrom, secondsLeft, sentTooRecently } from './app/(app)/app/sign-in/resend-timer.ts'

// Beside the other four checks at the package root, where `node --test '*.test.ts'` finds
// them — a test inside the route folder would exist and never run, which counts as missing.

test('secondsLeft counts down from the interval and floors at zero', () => {
  const sentAt = 1_000_000
  assert.equal(secondsLeft(sentAt, 60, sentAt), 60)
  assert.equal(secondsLeft(sentAt, 60, sentAt + 33_000), 27) // the frame's own 0:27
  assert.equal(secondsLeft(sentAt, 60, sentAt + 60_000), 0)
  assert.equal(secondsLeft(sentAt, 60, sentAt + 600_000), 0, 'never negative')
  // a part-second is not a second: 32.9s elapsed still leaves 28, not 27
  assert.equal(secondsLeft(sentAt, 60, sentAt + 32_900), 28)
  // a clock stepped backwards never shows more than the interval
  assert.equal(secondsLeft(sentAt, 60, sentAt - 5_000), 60)
})

test('only the per-address 429 means "too soon", and it never means "a link is waiting"', () => {
  assert.equal(sentTooRecently({ status: 429, code: 'over_email_send_rate_limit' }), true)
  // the project-wide hourly cap is also a 429, and nothing was sent — that one is an error
  assert.equal(sentTooRecently({ status: 429, code: 'over_request_rate_limit' }), false)
  assert.equal(sentTooRecently({ status: 500, code: 'unexpected_failure' }), false)
  assert.equal(sentTooRecently({}), false)
})

test('mmss is the frame’s m:ss, zero-padded on the seconds only', () => {
  assert.equal(mmss(27), '0:27')
  assert.equal(mmss(9), '0:09')
  assert.equal(mmss(0), '0:00')
  assert.equal(mmss(60), '1:00')
  assert.equal(mmss(600), '10:00')
  assert.equal(mmss(-5), '0:00')
})

test('the 429 remainder is read from GoTrue’s own message, with the interval as fallback', () => {
  const real = 'For security purposes, you can only request this after 27 seconds.'
  assert.equal(retryAfterFrom(real, 60), 27)
  assert.equal(retryAfterFrom('you can only request this after 1 second.', 60), 1)
  // a reworded or translated message must not silently become zero — that would present a
  // live Resend link that 429s again
  assert.equal(retryAfterFrom('slow down', 60), 60)
  assert.equal(retryAfterFrom('', 60), 60)
})
