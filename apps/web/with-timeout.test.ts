import { test, mock } from 'node:test'
import assert from 'node:assert/strict'
import { withTimeout } from './lib/with-timeout.ts'

// DW-33 (2)'s ceiling, pinned: a read that never settles yields `null` at the ceiling, a read
// that settles inside it is returned untouched, and a rejection is still a rejection.

test('withTimeout: a promise that never settles resolves to null at the ceiling', async () => {
  mock.timers.enable({ apis: ['setTimeout'] })
  try {
    const hung = withTimeout(new Promise<string>(() => {}), 3000)
    mock.timers.tick(2999)
    let settled = false
    void hung.then(() => (settled = true))
    await Promise.resolve()
    assert.equal(settled, false)
    mock.timers.tick(1)
    assert.equal(await hung, null)
  } finally {
    mock.timers.reset()
  }
})

test('withTimeout: a promise that settles in time is returned as-is, and a rejection still rejects', async () => {
  assert.equal(await withTimeout(Promise.resolve('answered'), 3000), 'answered')
  await assert.rejects(withTimeout(Promise.reject(new Error('boom')), 3000), /boom/)
})
