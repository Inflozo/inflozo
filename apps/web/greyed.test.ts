import { test } from 'node:test'
import assert from 'node:assert/strict'
import { renderToStaticMarkup } from 'react-dom/server'
import { greyedProps, marked, reason } from './components/kit/greyed.ts'

// UX-DR3 by construction, and the construction under test: the one place every control
// gets its greyed attributes, its reason sentence and its R-69 marking.

test('greyedProps: nothing without greyed, the announced form with it', () => {
  assert.deepEqual(greyedProps('x'), {})
  assert.deepEqual(greyedProps('x', { reason: 'Off while the header sits over the hero image.' }), {
    'aria-disabled': true,
    'aria-describedby': 'x-reason',
    'data-greyed': '',
    tabIndex: 0, // stays in the Tab order — P0-0: read aloud with its reason
  })
})

test('a greyed control must say why — a blank reason throws', () => {
  assert.throws(() => greyedProps('x', { reason: '  ' }), /must say why/)
  assert.throws(() => reason('x', { reason: '' }), /must say why/)
})

test('reason: the sentence under the control, addressed by aria-describedby', () => {
  assert.equal(reason('x'), null)
  const html = renderToStaticMarkup(reason('x', { reason: 'Fixed at 3 while the lead item is full width.' }))
  assert.match(html, /^<p id="x-reason" class="[^"]*text-ink-soft[^"]*">Fixed at 3 while the lead item is full width\.<\/p>$/)
})

test('marked (R-69): the value in force, unless it is not this control’s own', () => {
  assert.equal(marked('Newest'), 'Newest')
  assert.equal(marked('Newest', { reason: 'Nothing to scroll.' }), 'Newest')
  assert.equal(marked('Newest', { reason: 'The list you picked is the order.', value: null }), null)
})
