import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// THREE CONTRACTS A FULLY GREEN GATE CANNOT SEE, in `app-routes.test.ts`'s idiom: each is READ
// out of the files it governs rather than restated here, so none can drift into a lie. All three
// are Story 2.1's, and all three fail the same way — silently, with every check still green
// (review, 2026-09-06).

const SERVER = 'lib/supabase/server.ts'
const FLAGS = 'lib/flags.ts'
const MIGRATIONS = '../../supabase/migrations'

/** Every `.ts`/`.tsx` under `apps/web`, minus the build output and the tests themselves. */
function sources(dir = '.'): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      return ['node_modules', '.next'].includes(entry.name) ? [] : sources(path)
    }
    return /\.tsx?$/.test(entry.name) && !entry.name.endsWith('.test.ts') ? [path] : []
  })
}

test('the flag reader filters on a key the migration actually seeds', () => {
  // A typo here — `'passkey'` for `'passkeys'` — is not an error anywhere: `maybeSingle()` answers
  // `{ data: null, error: null }`, `rowEnabled(null)` is `undefined`, `bothOn` is false, and the
  // whole story switches itself off in production while the row reads `true` and every gate,
  // including `flags-rule.test.ts`, stays green. So the literal is tied to its seed.
  const seeded = [
    ...readdirSync(MIGRATIONS)
      .filter((f) => f.endsWith('.sql'))
      .map((f) => readFileSync(join(MIGRATIONS, f), 'utf8'))
      .join('\n')
      .matchAll(/\(\s*'([a-z_]+)'\s*,\s*(?:true|false)\s*,/g),
  ].map((m) => m[1])
  assert.ok(seeded.includes('passkeys'), `no migration seeds a 'passkeys' flag row; found ${seeded}`)

  const flags = readFileSync(FLAGS, 'utf8')
  const filtered = /\.eq\('key',\s*'([a-z_]+)'\)/.exec(flags)
  assert.ok(filtered, `${FLAGS}: no .eq('key', …) was found — this test reads the literal, not restates it`)
  assert.ok(
    seeded.includes(filtered[1]),
    `${FLAGS} reads the flag '${filtered[1]}', which no migration seeds (seeded: ${seeded}). ` +
      'The read would answer null for ever and the feature would be off with every check green.',
  )
  // And the table it reads from is the one the seed inserts into.
  assert.match(flags, /\.from\('feature_flags'\)/)
})

test('the server client keeps the passkey opt-in that every ceremony asserts', () => {
  // `auth-js` 2.115.0 calls `assertPasskeyExperimentalEnabled` at the top of every
  // `auth.passkey.*` method, OUTSIDE its own try, and it throws a plain `Error`. The property is
  // optional, so deleting this line is green under eslint, `tsc --noEmit`, `node --test` and
  // `next build` — and takes `/account` and all five ceremonies down at run time.
  assert.match(
    readFileSync(SERVER, 'utf8').replace(/\s+/g, ' '),
    /auth: \{ experimental: \{ passkey: true \} \}/,
    `${SERVER}: the experimental.passkey opt-in is gone. Every auth.passkey.* call throws without it.`,
  )
})

test('the service-role client is imported by the flag reader and by nothing else', () => {
  // `supabaseAdmin()` holds `SUPABASE_SECRET_KEY` and bypasses RLS by construction. Story 2.1
  // retired the spine's "the ONLY Supabase client the app makes" invariant, and what replaced it
  // was a sentence in a comment. This is that sentence, enforced: a second caller is a deliberate
  // decision that edits this list, never an import that slips in.
  // The IMPORT, not the mention: `projects/actions.ts` names `supabaseAdmin()` in a comment that
  // explains why it does not use it, and prose is not a caller.
  const allowed = [join('lib', 'flags.ts')]
  const importers = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) =>
      [...readFileSync(p, 'utf8').matchAll(/import\s*\{([^}]*)\}\s*from/g)].some((m) =>
        /\bsupabaseAdmin\b/.test(m[1]),
      ),
    )
    .filter((p) => !allowed.includes(p))
  assert.deepEqual(
    importers,
    [],
    `${importers.join(', ')} reaches supabaseAdmin(), which bypasses RLS. Only ${allowed.join(' and ')} may. ` +
      'If a new privileged read is genuinely wanted, add it here with its reason.',
  )
})
