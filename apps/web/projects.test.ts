import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  copyName,
  filterProjects,
  matchesName,
  NAME_HINT,
  NAME_MAX,
  nameSchema,
  nextUntitled,
  slugify,
  uniqueSlug,
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

test('copyName steps away from the names already taken, clamped with the suffix on', () => {
  assert.equal(copyName('X', ['Copy of X']), 'Copy of X 2')
  assert.equal(copyName('X', ['Copy of X', 'Copy of X 2']), 'Copy of X 3')
  assert.equal(copyName('X', ['  Copy of X  ']), 'Copy of X 2')
  const name = 'a'.repeat(NAME_MAX)
  const first = copyName(name)
  const second = copyName(name, [first])
  assert.equal(second.length, NAME_MAX)
  assert.notEqual(second, first)
  assert.notEqual(slugify(second), slugify(first))
  // A cut that lands on a space: the name is trimmed, so the second copy still differs.
  const spaced = `${'b'.repeat(NAME_MAX - 9)} ccccccccc`
  const cut = copyName(spaced)
  assert.equal(cut, cut.trim())
  assert.notEqual(copyName(spaced, [cut]), cut)
})

test('uniqueSlug counts against the slugs taken, not the names', () => {
  assert.equal(uniqueSlug('untitled-project', []), 'untitled-project')
  assert.equal(uniqueSlug('untitled-project', ['untitled-project']), 'untitled-project-2')
  assert.equal(uniqueSlug('untitled-project', ['untitled-project', 'untitled-project-2']), 'untitled-project-3')
  assert.equal(uniqueSlug('untitled-project', ['untitled-project-2']), 'untitled-project')
})

test('filterProjects: one key or many, case-insensitive, and the empty query shows all', () => {
  const rows = [{ name: 'Harbour Letter' }, { name: 'Field Notes' }]
  assert.deepEqual(filterProjects(rows, undefined), { query: '', shown: rows })
  assert.deepEqual(filterProjects(rows, '  '), { query: '', shown: rows })
  assert.deepEqual(filterProjects(rows, 'HARB'), { query: 'HARB', shown: [rows[0]] })
  assert.deepEqual(filterProjects(rows, ['harb', 'zzz']), { query: 'harb', shown: [rows[0]] })
  assert.deepEqual(filterProjects(rows, 'zzz'), { query: 'zzz', shown: [] })
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
