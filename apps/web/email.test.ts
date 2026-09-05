import { test } from 'node:test'
import assert from 'node:assert/strict'
import { BAD_EMAIL, parseEmail } from './app/(app)/app/sign-in/email.ts'

// The one schema at the email boundary, used by the client form AND the server action, so this
// is also the check that the sentence the field shows is the sentence the action would return.

test('an address comes back trimmed; anything else comes back null', () => {
  assert.equal(parseEmail('maya@orbitweekly.com'), 'maya@orbitweekly.com')
  // trim BEFORE validate: `z.email().trim()` transforms on the way OUT, so a pasted address
  // with a trailing space failed while reading as valid (executed with zod 4.4.3)
  assert.equal(parseEmail('  maya@orbitweekly.com \n'), 'maya@orbitweekly.com')

  for (const bad of ['maya', '', '   ', 'maya@', '@orbitweekly.com', 'maya orbit@weekly.com', null, undefined, 42]) {
    assert.equal(parseEmail(bad), null, `${JSON.stringify(bad)} is not an address`)
  }
})

test('the message is the frame’s sentence, not zod’s', () => {
  assert.equal(BAD_EMAIL, 'Enter an email address like you@example.com')
})
