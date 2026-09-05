import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  copyName,
  matchesName,
  NAME_HINT,
  NAME_MAX,
  nameSchema,
  nextUntitled,
  slugify,
  updatedLabel,
  UNTITLED,
} from './lib/projects.ts'

// Every rule the dashboard's four actions are built on. The typed confirm in particular:
// `matchesName` is the whole of what stands between a click and a deleted project, and the
// server re-runs it rather than trusting the client.

test('nameSchema: trimmed, 1 to NAME_MAX, one sentence for both failures', () => {
  assert.equal(nameSchema.parse('  Field Notes  '), 'Field Notes')
  assert.equal(nameSchema.safeParse('').success, false)
  assert.equal(nameSchema.safeParse('   ').success, false)
  assert.equal(nameSchema.parse('a'.repeat(NAME_MAX)), 'a'.repeat(NAME_MAX))
  assert.equal(nameSchema.safeParse('a'.repeat(NAME_MAX + 1)).success, false)
  // Trimming happens BEFORE the length check, or 80 characters plus a space would be refused.
  assert.equal(nameSchema.parse(` ${'a'.repeat(NAME_MAX)} `), 'a'.repeat(NAME_MAX))

  for (const bad of ['', 'a'.repeat(NAME_MAX + 1)]) {
    const result = nameSchema.safeParse(bad)
    assert.equal(result.success, false)
    assert.equal(result.error?.issues[0]?.message, NAME_HINT)
  }
})

test('the hint quotes the limit rather than restating it', () => {
  assert.ok(NAME_HINT.includes(String(NAME_MAX)))
})

test('nextUntitled counts the names in use, not the rows', () => {
  assert.equal(nextUntitled([]), UNTITLED)
  assert.equal(nextUntitled(['Field Notes']), UNTITLED)
  assert.equal(nextUntitled([UNTITLED]), `${UNTITLED} 2`)
  assert.equal(nextUntitled([UNTITLED, `${UNTITLED} 2`]), `${UNTITLED} 3`)
  // A gap is filled, because the name is what must be free — not the count.
  assert.equal(nextUntitled([UNTITLED, `${UNTITLED} 3`]), `${UNTITLED} 2`)
  assert.equal(nextUntitled([`  ${UNTITLED}  `]), `${UNTITLED} 2`)
})

test('copyName is clamped to the schema’s maximum', () => {
  assert.equal(copyName('Field Notes'), 'Copy of Field Notes')
  const long = copyName('a'.repeat(NAME_MAX))
  assert.equal(long.length, NAME_MAX)
  assert.equal(nameSchema.safeParse(long).success, true)
})

test('slugify', () => {
  assert.equal(slugify('Copy of Field Notes'), 'copy-of-field-notes')
  assert.equal(slugify(UNTITLED), 'untitled-project')
  assert.equal(slugify('  Harbour — Letter!  '), 'harbour-letter')
  assert.equal(slugify('Café Crème'), 'cafe-creme')
  // A name with nothing sluggable in it still needs a slug: the column is NOT NULL.
  assert.equal(slugify('日本語'), 'project')
  assert.equal(slugify(''), 'project')
})

test('updatedLabel: today, this year, another year', () => {
  const now = new Date('2026-09-05T09:00:00Z')
  assert.equal(updatedLabel('2026-09-05T00:00:01Z', now), 'Updated today')
  assert.equal(updatedLabel('2026-09-05T23:59:59Z', now), 'Updated today')
  assert.equal(updatedLabel('2026-08-19T12:00:00Z', now), 'Updated Aug 19')
  assert.equal(updatedLabel('2025-08-19T12:00:00Z', now), 'Updated Aug 19, 2025')
  // Same day-of-month, different month: the year check alone would call this today.
  assert.equal(updatedLabel('2026-08-05T09:00:00Z', now), 'Updated Aug 5')
  assert.equal(updatedLabel('nonsense', now), 'Updated recently')
})

test('matchesName is trimmed and then exact — case included', () => {
  assert.equal(matchesName('Field Notes', 'Field Notes'), true)
  assert.equal(matchesName('  Field Notes  ', 'Field Notes'), true)
  assert.equal(matchesName('field notes', 'Field Notes'), false)
  assert.equal(matchesName('Field  Notes', 'Field Notes'), false)
  assert.equal(matchesName('', ''), true)
})
