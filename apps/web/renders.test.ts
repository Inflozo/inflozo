import { test } from 'node:test'
import assert from 'node:assert/strict'
import { canvasFirst, handed } from './lib/renders.ts'

// Story 5.23b — R-210's hand-over (`lib/renders.ts`): what a section operation hands React is held in the press's task,
// in order, and paid in the next — and nothing set later may land before it.

/** a timer queued after the hand-over's own: by then its task has run */
const nextTask = () => new Promise((resolve) => setTimeout(resolve, 0))

test('canvasFirst: held in order through the press task, nested calls join, and a later setter pays what is owed first', async () => {
  const seen: string[] = []
  const a = handed<string>((v) => seen.push(`a=${String(v)}`))
  const b = handed<string>((v) => seen.push(`b=${String(v)}`))
  canvasFirst(() => {
    a('1')
    canvasFirst(() => b('2'))
  })
  a('3')
  assert.deepEqual(seen, [], 'nothing reaches React in the press task, even a call made after the operation returned')
  await Promise.resolve()
  assert.deepEqual(seen, [], 'the press task has yielded: owed, not yet paid')
  b('4')
  assert.deepEqual(seen, ['a=1', 'b=2', 'a=3', 'b=4'], 'a later call pays everything owed first, in order, then sets')
  await nextTask()
  assert.equal(seen.length, 4, "the hand-over's own task finds nothing left to pay")
})

test('canvasFirst: its own task pays what is owed, and outside a hand-over a setter sets at once', async () => {
  const seen: string[] = []
  const a = handed<string>((v) => seen.push(String(v)))
  canvasFirst(() => a('held'))
  await Promise.resolve()
  assert.deepEqual(seen, [])
  await nextTask()
  assert.deepEqual(seen, ['held'])
  a('now')
  assert.deepEqual(seen, ['held', 'now'])
  // an operation that sets nothing owes nothing
  canvasFirst(() => {})
  await nextTask()
  assert.deepEqual(seen, ['held', 'now'])
})
