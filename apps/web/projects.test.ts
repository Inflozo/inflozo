import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  copyName,
  filterProjects,
  freeName,
  matchesName,
  NAME_HINT,
  NAME_MAX,
  nameSchema,
  nextUntitled,
  slugAttempts,
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

/* ── STORY 3.9 ───────────────────────────────────────────────────────────────────────────────── */

/**
 * DW-24. The retry itself lives in a `'use server'` module and is covered by the harness against
 * the live database; the DECISION it makes is here, where every step of it can be read without one.
 */
test('slugAttempts: the losing slug is taken, so the next attempt asks for the next free one', () => {
  assert.deepEqual(slugAttempts('blog', []), ['blog', 'blog-2', 'blog-3'])
  // The read said `blog` was taken, so the first attempt is already the suffixed one.
  assert.deepEqual(slugAttempts('blog', ['blog']), ['blog-2', 'blog-3', 'blog-4'])
  // It skips what the read saw AND what each attempt has since learned — never the same twice,
  // which is the whole of it: a retry that re-proposed the losing slug would loop on 23505.
  assert.deepEqual(slugAttempts('blog', ['blog', 'blog-3']), ['blog-2', 'blog-4', 'blog-5'])
  assert.equal(new Set(slugAttempts('blog', [])).size, 3)
  // Three round trips and then the action's own failure path — a fourth is not a race any more.
  assert.equal(slugAttempts('blog', []).length, 3)
})

/**
 * DW-72, the owner's Question 2 ruling ("Blog 2"). Connect two Ghost sites both titled *Blog* and
 * press Use your brand on each: the dashboard used to draw two cards called *Blog*.
 */
test('freeName: the plain numeric suffix, and copyName is the same rule with its own base', () => {
  assert.equal(freeName('Blog', []), 'Blog')
  assert.equal(freeName('Blog', ['Blog']), 'Blog 2')
  assert.equal(freeName('Blog', ['Blog', 'Blog 2']), 'Blog 3')
  // Trimmed on both sides of the comparison, as the taken set is.
  assert.equal(freeName('  Blog  ', ['Blog']), 'Blog 2')
  // Clamped WITH the suffix on, so an 80-character title still gets a distinct name.
  const long = 'a'.repeat(NAME_MAX)
  assert.equal(freeName(long, []).length, NAME_MAX)
  assert.equal(freeName(long, [long]).length, NAME_MAX)
  assert.notEqual(freeName(long, [long]), long)
  // …and it is NOT copyName's wording, which would tell the customer this site is a copy.
  assert.equal(copyName('Blog', ['Copy of Blog']), 'Copy of Blog 2')
  assert.ok(!freeName('Blog', ['Blog']).startsWith('Copy of'))
})

/**
 * DW-28 — THE DUPLICATE'S SELECT LIST AGAINST THE DATABASE'S OWN INSERT GRANT.
 *
 * `duplicateProject` copies a project by selecting the columns it may carry and spreading them
 * into an insert. Add a column to `projects` and widen the grant, and the duplicate silently stops
 * carrying it — there is nothing to go red, because the code is still correct about the columns it
 * knows. So the grant is READ out of the migrations and every column in it must be either in the
 * select list or named here as deliberately not copied. A future widening then reads as an
 * instruction rather than as an omission.
 */
test('duplicateProject carries every column the insert grant allows, or says why not', () => {
  const MIGRATIONS = '../../supabase/migrations'
  const sql = readdirSync(MIGRATIONS)
    .filter((f) => f.endsWith('.sql'))
    .sort()
    .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
    .join('\n')
  const grants = [...sql.matchAll(/grant\s+insert\s*\(([^)]*)\)\s*on\s+(?:table\s+)?public\.projects/gi)]
  assert.ok(grants.length > 0, 'no `grant insert (…) on public.projects` found in supabase/migrations — this test is reading the wrong thing')
  const granted = new Set(
    grants.flatMap((m) => m[1].split(',').map((c) => c.trim().replace(/"/g, ''))).filter(Boolean),
  )

  const source = readFileSync('app/(app)/app/(authed)/projects/actions.ts', 'utf8')
  const select = source.match(/\.select\('([^']*)'\)\s*\n\s*\.eq\('id', id\)/)
  assert.ok(select, "duplicateProject's `.select(...)` was not found — it is what decides which columns a copy carries")
  const copied = new Set(select[1].split(',').map((c) => c.trim()))

  /** Named here, with the reason, and each is a decision rather than an omission. */
  const NOT_COPIED: Record<string, string> = {
    id: 'the identity column — the copy is a new row and the database defaults it',
    user_id: 'the copy belongs to the caller, who is read from the session and never from the source row',
    name: 'the copy is named by `copyName`, not by the original',
    slug: 'FR-J10 makes the slug the emitted theme name, and the boundary asks a duplicate for a fresh one',
    linked_site_id:
      'FR-B5 allows a project at most one site. Carrying it forward would make a duplicate inherit ' +
      'the original\'s binding — two projects pointing at one site — and since Story 3.9 the ' +
      'database refuses the second with 23505 rather than merely disapproving (DW-69)',
  }
  const missed = [...granted].filter((c) => !copied.has(c) && !(c in NOT_COPIED))
  assert.deepEqual(
    missed,
    [],
    'the database lets `authenticated` insert these columns on `projects`, and `duplicateProject` ' +
      'neither copies them nor says why not — so a duplicate silently loses them:\n  ' +
      missed.join('\n  ') +
      '\nAdd each to the select list, or to NOT_COPIED above with its reason.',
  )
})
