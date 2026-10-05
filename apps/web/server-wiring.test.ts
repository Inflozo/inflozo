import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, normalize } from 'node:path'

// CONTRACTS A FULLY GREEN GATE CANNOT SEE, in `app-routes.test.ts`'s idiom: each is READ out of
// the files it governs rather than restated here, so none can drift into a lie. The first three
// are Story 2.1's and all fail the same way — silently, with every check still green (review,
// 2026-09-06); the last is Story 2.4's, and it failed that way for two stories.

const SERVER = 'lib/supabase/server.ts'
const FLAGS = 'lib/flags.ts'
const ACCOUNT_PAGE = 'app/(app)/app/(authed)/account/page.tsx'
const ACCOUNT_ACTIONS = 'app/(app)/app/(authed)/account/actions.ts'
const AUTHED_LAYOUT = 'app/(app)/app/(authed)/layout.tsx'
const CONNECT_ACTIONS = join('app', '(app)', 'app', '(authed)', 'sites', 'actions.ts')
const SNAPSHOT_ROUTE = join('app', '(app)', 'app', 'snapshots', '[id]', 'download', 'route.ts')
const PURGE_ROUTE = join('app', 'api', 'cron', 'purge-accounts', 'route.ts')
const HEALTH_ROUTE = join('app', 'api', 'cron', 'site-health', 'route.ts')
const SITE_PROBE = join('server', 'site-probe.ts')
const SITE_SETTINGS = join('server', 'site-settings.ts')
const SITE_HEALTH = join('server', 'site-health.ts')
const KEYS_SCREEN = join('app', '(app)', 'app', '(authed)', 'sites', 'keys-screen.tsx')
const EDITOR_ACTIONS = join('app', '(app)', 'app', '(authed)', 'projects', '[id]', '(editor)', 'actions.ts')
const EDITOR_READ = join('app', '(app)', 'app', '(authed)', 'projects', '[id]', '(editor)', 'read.ts')
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
  // EVERY key the module reads, not the first: Story 3.3 made the row read take its key as an
  // argument (`flagRow(key)`) so the timeout and the fail-closed catch are written once, and the
  // literals moved out to the call sites. Which is where this test now reads them from — the list
  // is derived, never counted or restated (standing rule: counts are derived).
  const read = [...flags.matchAll(/flagRow\('([a-z_]+)'\)/g)].map((m) => m[1])
  assert.ok(read.length > 0, `${FLAGS}: no flagRow('…') call was found — this test reads the literals`)
  for (const key of read) {
    assert.ok(
      seeded.includes(key),
      `${FLAGS} reads the flag '${key}', which no migration seeds (seeded: ${seeded}). ` +
        'The read would answer null for ever and the feature would be off with every check green.',
    )
  }
  assert.ok(read.includes('ghostpro_preview_probe'), `${FLAGS}: FR-C2's probe switch is no longer read`)
  // AND EVERY ROW READ GOES THROUGH `flagRow`, WITH A LITERAL. The regex above can only see
  // literals, so a `flagRow(someKey)` — or a second `.eq('key', …)` written straight onto the
  // table — would simply not appear in `read` and this test would pass vacuously about a flag it
  // never checked was seeded. Both shapes are asserted away instead (review, 2026-09-08).
  const calls = [...flags.matchAll(/(?<!function )flagRow\(/g)].length
  assert.equal(
    calls,
    read.length,
    `${FLAGS}: ${calls} flagRow(…) call(s) but only ${read.length} with a literal key. ` +
      'A key that is not a literal cannot be checked against the migrations, so the flag would ' +
      'fail closed for ever with every gate green.',
  )
  const direct = [...flags.matchAll(/\.eq\('key',/g)].length
  assert.equal(
    direct,
    1,
    `${FLAGS}: ${direct} .eq('key', …) filter(s). Exactly one may exist — the one inside ` +
      'flagRow — or a flag is being read on a path that this test cannot see.',
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
  // The SECOND privileged reader, added by Story 2.5 with its reason: the `site-snapshots` bucket
  // has NO Storage policy at all by design (AD-32) — "a snapshot the client could write defeats
  // FR-J13's whole purpose" — so the service role is its only reader and the download route mints
  // the signed URL with it. It never touches a user ROW: whose snapshot it is has already been
  // answered by RLS on the user's own client, one call earlier in the same file.
  // The THIRD, added by Story 2.6 with its reason: FR-A5's purge acts for NOBODY. There is no
  // session that could make its reads — it selects the accounts whose deadline has passed, walks
  // four buckets by prefix and anonymises rows that are about to lose their owner — and
  // `auth.admin.deleteUser()` is an admin-API call by definition. It is a cron behind Vercel's
  // own `CRON_SECRET` bearer and it is reachable by nobody else (`purge-rule.ts`'s `authorized`).
  // The FOURTH, added by Story 3.2 with its reason: `authenticated` may insert only
  // `(id, user_id, url, title, favicon_url)` on `sites` and update only `(title, favicon_url,
  // updated_at)` — schema :1040, :1198 — so every other column the connect wizard writes
  // (`ghost_version`, `content_key`, `site_settings`, `settings_read_at`, `disconnected_at`) is
  // SERVER-ASSERTED by AD-7 and cannot go through the caller's own session. The read that decides
  // the cap and finds an existing record still does (RLS scopes it); only the write is privileged.
  // The FIFTH, added by Story 3.3 with its reason: FR-C2's connect-time probes write `capability`,
  // `capability_source`, `site_settings` and `settings_read_at`, and all four are server-asserted
  // by AD-7 — `authenticated` may update only title, favicon_url and updated_at (schema :1198).
  // It is also the module that runs those probes on a STORED key through `call()`, which is what
  // gives the decrypt path its first product caller (DW-54); connect, B15's Re-check plan and
  // Story 3.7's cron all call this one function, so there is one write and one audit shape rather
  // than three.
  // The SIXTH, added by Story 3.7 with its reason: FR-C5's daily health check writes `health`,
  // `last_checked_at`, `last_health_email_at` and the two `routes_*` columns — every one of them
  // server-asserted by AD-7 — and it is this epic's first emitter of `notifications`, a table with
  // a select policy and a `read_at`-only update grant and NO insert policy at all (schema `:907-910`,
  // `:1156-1157`). It also reads the owner's address through GoTrue's admin API, which is an
  // admin-API call by definition: the cron acts for NOBODY and has no session to read one from.
  // The SEVENTH, added by Story 3.7 with its reason: that cron's own route. It selects the sites
  // whose check is due — every connected site, ordered by the oldest check — and, like the purge
  // beside it, acts for nobody: there is no session that could make its reads, and it is reachable
  // only behind Vercel's `CRON_SECRET` bearer (`lib/cron-auth.ts`'s `authorized`).
  const allowed = [
    join('lib', 'flags.ts'),
    SNAPSHOT_ROUTE,
    PURGE_ROUTE,
    HEALTH_ROUTE,
    CONNECT_ACTIONS,
    SITE_PROBE,
    SITE_HEALTH,
  ]
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

test('the session guard is one export, imported, and copied into neither actions file', () => {
  // DW-38: `signedIn()` stood written out in `account/actions.ts` and in `projects/actions.ts`,
  // because a `'use server'` file may export only Server Actions and a guard is not one. That
  // forbids EXPORTING it from an actions file, not copying it — and two copies are two things to
  // remember. Story 2.4 moved it to this plain module; a copy reappearing is what this sees.
  assert.match(
    readFileSync(SERVER, 'utf8'),
    /export async function signedIn\(/,
    `${SERVER}: signedIn() is the one guard both actions files import (DW-38).`,
  )
  const copies = sources()
    .map((p) => p.replace(/^\.\//, ''))
    // Written as a function OR as a const — `const signedIn = async () =>` is the same copy.
    .filter((p) => /async function signedIn\s*\(|\b(?:const|let|var)\s+signedIn\s*=/.test(readFileSync(p, 'utf8')))
    .filter((p) => p !== SERVER)
  assert.deepEqual(
    copies,
    [],
    `${copies.join(', ')} writes its own signedIn(). It belongs in ${SERVER} alone (DW-38) — ` +
      'import it there rather than keeping a second copy the next change has to remember.',
  )
})

test('the way out of every device does not hang on a way in', () => {
  // Two of Story 2.4's matrix rows live only in the source, and no browser step can see either:
  // production runs with the passkey switches ON, so a Sessions card moved inside the
  // `passkeys ? … : null` branch would be green in every gate and every harness, and would take
  // sign-out-everywhere away from exactly the user whose passkeys are off. And the action's guard
  // is the session ALONE — never `ready()`, whose flag would refuse it for the same reason.
  // JSX comments out (one names the flag in prose), then BRACE DEPTH from the page's `return (`:
  // a conditional child sits inside a `{ … }` expression and a standalone one does not, and the
  // Email card — the one this card is extrapolated from, rendered for everyone — is the standalone
  // the depth is compared against. The first version looked at the character before the element
  // (`?` or `&&`) and was evadable: a formatter's `? (` and a fragment's `/>` both stood before a
  // gated card and passed. Depth catches the ternary, the `&&`, the parenthesised ternary and the
  // fragment alike (review, 2026-09-07, each of the four controlled).
  const page = readFileSync(ACCOUNT_PAGE, 'utf8').replace(/\{\/\*[^]*?\*\/\}/g, ' ')
  const render = page.slice(page.indexOf('function AccountPage'))
  const from = render.indexOf('return (')
  assert.ok(from >= 0, `${ACCOUNT_PAGE}: AccountPage's JSX return was not found.`)
  const depthAt = (element: string) => {
    const at = render.indexOf(element)
    assert.ok(at >= 0, `${ACCOUNT_PAGE}: ${element} is not rendered.`)
    const before = render.slice(from, at)
    return (before.match(/\{/g) ?? []).length - (before.match(/\}/g) ?? []).length
  }
  assert.equal(
    depthAt('<SessionsCard'),
    depthAt('<EmailCard'),
    `${ACCOUNT_PAGE}: the Sessions card is rendered inside an expression the Email card is not — ` +
      'conditionally. A way OUT of every device must not disappear with the switch that offers a way in.',
  )

  // The calls to /logout are `signOutFailed`'s since DW-41 (Story 5.24b), so the guard is read
  // before that call.
  const actions = readFileSync(ACCOUNT_ACTIONS, 'utf8').replace(/\s+/g, ' ')
  const body = actions.slice(actions.indexOf('function signOutEverywhere'))
  assert.match(
    body,
    /await signedIn\(\)[^]*signOutFailed\(/,
    `${ACCOUNT_ACTIONS}: signOutEverywhere must guard on signedIn() — the session alone — before ` +
      'it calls /logout. A session that ended between the render and the click is the sign-in page.',
  )
  assert.doesNotMatch(
    body.slice(0, body.indexOf('signOutFailed(')),
    /await ready\(\)/,
    `${ACCOUNT_ACTIONS}: signOutEverywhere guards on ready(), whose passkey flag would refuse it.`,
  )
})

test('the deletion window has a door, and it is the shell layout', () => {
  // FR-A5 offers Restore *on signing in*, so a pending account must not reach any page under the
  // shell. That is ONE `if` in a layout, and deleting it is green under eslint, `tsc --noEmit`,
  // `node --test` and `next build`: the app would simply work normally for an account whose rows
  // Story 2.6 is about to remove, and the work done meanwhile would be purged in silence. Neither
  // half of it is reachable from a browser step without deleting a real account, so both are read
  // out of the source here — the column in the select, and the redirect after it.
  const layout = readFileSync(AUTHED_LAYOUT, 'utf8').replace(/\/\/[^\n]*/g, ' ')
  // Anchored on the TABLE, so a select added earlier in the layout is not the one read here.
  const select = /from\('profiles'\)\s*\.select\('([^']*)'\)/.exec(layout)
  assert.ok(select, `${AUTHED_LAYOUT}: the profiles select was not found — this test reads it, not restates it`)
  assert.ok(
    select[1].split(',').map((c) => c.trim()).includes('deleted_at'),
    `${AUTHED_LAYOUT}: the profiles select is '${select[1]}' and does not read deleted_at. ` +
      'Without it the door never closes and a deleted account keeps using the app until it is purged.',
  )
  assert.match(
    layout.replace(/\s+/g, ' '),
    /if \(profile\?\.deleted_at\) redirect\(RESTORE_PATH\)/,
    `${AUTHED_LAYOUT}: nothing redirects a pending account to RESTORE_PATH (FR-A5).`,
  )
})

// ── Story 3.1's five. The Admin chokepoint (AD-10) is a directory boundary, and a directory
//    boundary is exactly the kind of claim that is true on the day it is written and false two
//    stories later with every gate green. Each of these is READ out of the tree.

const GHOST_ADMIN = join('server', 'ghost-admin')
const GHOST_ADMIN_DB = join(GHOST_ADMIN, 'db.ts')
const GHOST_ADMIN_INDEX = join(GHOST_ADMIN, 'index.ts')

/** Every source file under `server/ghost-admin/`, tests excluded (there are none in there). */
function ghostAdminSources(): string[] {
  return sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => p.startsWith(GHOST_ADMIN + '/'))
}

test('the postgres driver has exactly one importer, and it is db.ts', () => {
  // The driver is the ONLY thing in the app that can decrypt a Ghost credential: `vault.*` is
  // granted to service_role alone and answers 404 over PostgREST (§21j), which is what bounds a
  // leaked API secret key to opaque references. A second direct connection anywhere would be a
  // second thing that can decrypt, and nothing else in the codebase would say so.
  const importers = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => /from\s*['"]postgres['"]|(?:require|import)\(\s*['"]postgres['"]\s*\)/.test(readFileSync(p, 'utf8')))
    .filter((p) => p !== GHOST_ADMIN_DB)
  assert.deepEqual(
    importers,
    [],
    `${importers.join(', ')} imports the postgres driver. Only ${GHOST_ADMIN_DB} may (AD-10, DW-49).`,
  )
})

test('the pooler URL has exactly one reader, and it is db.ts', () => {
  // The connection string is the one secret that can decrypt every customer's Ghost key. A second
  // reader is a second blast radius, and `process.env` makes one a one-line change.
  const readers = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => /SUPABASE_DB_POOLER_URL/.test(readFileSync(p, 'utf8')))
    .filter((p) => p !== GHOST_ADMIN_DB)
  assert.deepEqual(
    readers,
    [],
    `${readers.join(', ')} reads SUPABASE_DB_POOLER_URL. Only ${GHOST_ADMIN_DB} may.`,
  )
})

test('no SQL outside server/ghost-admin names vault or the two private tables', () => {
  // `supabaseAdmin()` cannot reach either schema, so a query naming them elsewhere is either dead
  // or a new connection nobody declared. Written as the TEXT, because the failure this catches is
  // a query string copied into a route, not an import.
  // COMMENTS STRIPPED FIRST, the idiom the supabaseAdmin() contract above already uses: the verify
  // route explains in prose why `vault.create_secret` can only be executed on the deployed
  // function, and prose is not a query (executed 2026-09-07 — it failed on that sentence).
  const named = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) =>
      /vault\.|private\.site_credentials|private\.credential_audit/.test(
        readFileSync(p, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' '),
      ),
    )
    .filter((p) => !p.startsWith(GHOST_ADMIN + '/'))
  assert.deepEqual(
    named,
    [],
    `${named.join(', ')} writes SQL naming vault or a private table. That belongs in ${GHOST_ADMIN}/ (AD-10).`,
  )
})

test('the code-injection payload is named in exactly one file, and it is the pure rule', () => {
  // NFR-3 and FR-C2: `codeinjection_head` and `codeinjection_foot` are read, OR'd into ONE boolean
  // and DISCARDED. Neither string is stored, returned to a client, logged, or put anywhere a
  // render path could reach — and the way that stays true is that only one function has ever seen
  // the key names. A second mention is either a second reader or a payload on its way somewhere.
  const PROBE_RULE = join('lib', 'probe-rule.ts')
  const named = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => /codeinjection/i.test(readFileSync(p, 'utf8')))
    .filter((p) => p !== PROBE_RULE)
  assert.deepEqual(
    named,
    [],
    `${named.join(', ')} names Ghost's codeinjection payload. Only ${PROBE_RULE} may, and it turns ` +
      'the pair into one boolean and keeps neither string (NFR-3).',
  )
})

test('Story 5.20: no source file names a Stripe setting — the member record is built from two named keys', () => {
  // FR-H6's record (`site_settings.members`) is copied from the Admin `settings/` payload, which carries every Stripe
  // setting, secrets included (MEASUREMENTS §54). `membersOf` names the two keys it copies and nothing else, so a Stripe
  // key's NAME appearing anywhere in the app is a reader of it on its way somewhere — the codeinjection rule's shape.
  const named = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => /stripe_/i.test(readFileSync(p, 'utf8')))
  assert.deepEqual(named, [], `${named.join(', ')} names a Stripe setting. Nothing in the app may; the member record copies two keys (FR-H6).`)
  // the control: the pattern is live — the probe rule's own test feeds Stripe keys in to prove none comes out
  assert.match(readFileSync('probe-rule.test.ts', 'utf8'), /stripe_/i)
})

test('Story 5.20: the editor\'s re-read reads the site as the caller\'s before it asks Ghost anything', () => {
  // `call()` decrypts whatever site id it is handed, and the re-read's id is `projects.linked_site_id` — a column the
  // client may write, whose foreign key checks only that the site exists. So the re-read must refuse a site that is not
  // the caller's BEFORE the chokepoint runs: an owned-row read (`user_id`) ahead of the first `call(`. Since Story 5.24b
  // its body is `rereadSettings` in `server/site-settings.ts`, where `site-settings.test.ts` EXECUTES the refusal
  // (DW-272); this reads the order out of the source as well, so the two fail on different edits.
  const ownedFirst = (body: string) => {
    const owned = body.indexOf(".eq('user_id', userId)")
    const asked = body.indexOf('io.call({')
    return owned > 0 && asked > 0 && owned < asked
  }
  const source = readFileSync(SITE_SETTINGS, 'utf8')
  const start = source.indexOf('export async function rereadSettings')
  assert.ok(start >= 0, 'rereadSettings is not in site-settings.ts — this test is pointed at nothing')
  const next = source.indexOf('\nexport ', start + 1)
  const body = source.slice(start, next < 0 ? undefined : next)
  assert.ok(ownedFirst(body), 'rereadSettings asks Ghost before it has checked the site is the caller\'s')
  // the control: the OLD ORDER — the chokepoint asked first, the owned row read after — fails the same check
  const line = '    const response = await io.call({'
  const call = body.slice(body.indexOf(line), body.indexOf('\n', body.indexOf(line)) + 1)
  const oldOrder = body.replace(call, '').replace('  try {\n', `  try {\n${call}`)
  assert.ok(oldOrder !== body && oldOrder.indexOf('io.call({') < oldOrder.indexOf(".eq('user_id', userId)"), 'control: the old order was built')
  assert.equal(ownedFirst(oldOrder), false, 'control: a body that asks Ghost before the ownership read is caught')
  // …and `site-probe.ts` keeps no second copy of the body: its `readSettings` is the wrapper and nothing else.
  const probe = readFileSync(SITE_PROBE, 'utf8')
  assert.doesNotMatch(probe.slice(probe.indexOf('export async function readSettings')), /settingsPatch\(|\.update\(/,
    `${SITE_PROBE}: readSettings writes on its own again — its body is rereadSettings's (DW-272)`)
})

/**
 * DOES THIS FILE IMPORT ANYTHING UNDER `server/ghost-admin/`, BY ANY SPELLING. The rule used to match the `@/` alias alone,
 * so `import { call } from './ghost-admin'` from `server/`, or `'../../server/ghost-admin/db.ts'` from a route, walked
 * past it (Story 5.24b's Create). Every specifier — `from '…'`, `import('…')` and `import type` alike — is RESOLVED against
 * the importing file, and only the resolved path is judged.
 */
function reachesChokepoint(file: string): boolean {
  const text = readFileSync(file, 'utf8')
  return [...text.matchAll(/(?:from\s*|import\(\s*)['"]([^'"]+)['"]/g)].some(([, spec]) => {
    const resolved = spec.startsWith('@/') ? normalize(spec.slice(2)) : spec.startsWith('.') ? normalize(join(dirname(file), spec)) : ''
    return resolved === GHOST_ADMIN || resolved.startsWith(GHOST_ADMIN + '/')
  })
}

test('the chokepoint rule sees a relative import as well as the alias', () => {
  // THE CONTROL the rule was missing: the three spellings a file can use, judged from where each file sits.
  const judged = (file: string, spec: string) => {
    const resolved = spec.startsWith('@/') ? normalize(spec.slice(2)) : normalize(join(dirname(file), spec))
    return resolved === GHOST_ADMIN || resolved.startsWith(GHOST_ADMIN + '/')
  }
  assert.equal(judged(join('server', 'site-settings.ts'), './ghost-admin'), true)
  assert.equal(judged(join('app', 'api', 'x', 'route.ts'), '../../../server/ghost-admin/db.ts'), true)
  assert.equal(judged(join('lib', 'x.ts'), '@/server/ghost-admin'), true)
  assert.equal(judged(join('server', 'site-probe.ts'), './site-settings'), false)
  // …and the real tree: `site-settings.ts` reaches no part of the chokepoint — `call` is handed in.
  assert.equal(reachesChokepoint(SITE_SETTINGS), false, `${SITE_SETTINGS} imports the chokepoint; its call() is handed in`)
  assert.equal(reachesChokepoint(SITE_PROBE), true, 'control: site-probe.ts imports the chokepoint by the alias')
})

test('the Admin chokepoint is imported by the routes named here and by nothing else', () => {
  // AD-10 allows no third path: no Admin API call from a browser and no generic proxy endpoint.
  // The module is a library that server actions and routes import, and this is that list.
  //   - THE CONNECT ACTION, Story 3.2's: the first PRODUCT caller. It validates a key the customer
  //     has just typed with `fetchWithKey` on `GET config/` — against a site that has no row yet,
  //     so the audit row carries a null `site_id` — and then `store`s it. It is the caller
  //     DW-48 was waiting for: Story 3.1's bearer-gated verify route stood here until this
  //     existed, and 3.2 deleted it rather than keep a permanent privileged surface that stored a
  //     credential for any `site_id` a caller named.
  //   - THE SITE PROBE, Story 3.3's: the first caller that uses a STORED key. It runs `call()` on
  //     `GET config/` and `GET settings/` — two GETs, so no allowlist item — and it is deliberately
  //     NOT `fetchWithKey` with the key connect still has in scope: Re-check plan and 3.7's cron
  //     have no typed key and must run the identical probe, and a second code path is how "the
  //     daily check re-runs the connect probe" quietly becomes false. It closes DW-54's third gap:
  //     the decrypt path had no product caller between the verify route's deletion and this.
  // ANY module in the directory counts, not only the index: `db.ts` hands out the decrypting
  // connection, and an import of it from an unlisted file is the same third path (review,
  // 2026-09-07 — the first regex matched the index alone).
  //   - MANAGE KEYS' SCREEN, Story 3.6's: the first caller that only READS, and it reads nothing
  //     secret. `credentialsOf` hands back the Admin key's public id half — the part before the
  //     colon, which rides in the header of every JWT this module mints — and the two rotation
  //     stamps, so the screen can draw what Inflozo HAS without ever approaching what it holds.
  //     IT IS ONE FILE AND NOT TWO, and that is what keeps the list this short: the panel appears
  //     as a window over the Sites list (`/sites?manage=…`) and as a full page (`sites/keys/page.tsx`),
  //     and both render THIS component, so the read happens once wherever the customer came from.
  //     It is here rather than on the Sites list deliberately: a `<dialog>` RENDERED BY that list
  //     would put this read on every card of the busiest route in the app, and
  //     `private.site_credentials` is reachable from this module and nowhere else (§21j). No
  //     decryption is on this path and none can be — `decrypt()` is private to the module and
  //     `call()` is its only caller.
  //   - THE HEALTH CHECK, Story 3.7's: the one function AD-33's cron and S11a's ⋯ **Re-check
  //     connection** both drive. It calls `probeSite` for everything FR-C5 lists and reaches this
  //     module twice on its own account: `call()` once more for `GET settings/routes/yaml/`, which
  //     answers 200 with the Admin key alone on both majors (§37's trailing block) and whose BYTES
  //     are what FR-I4's `routes_live_sha256` hashes; and `backfillAdminKeyId`, which closes DW-78
  //     by filling the Admin key's public id half where a pre-3.6 record has none. That second one
  //     is the narrowest use of Vault in the app — the split happens inside the database, so the
  //     decrypted value never enters Node at all — and it is here rather than on the `call()` path
  //     precisely because the ledger refused to put a write on the read path of every Ghost call.
  const allowed = [CONNECT_ACTIONS, SITE_PROBE, SITE_HEALTH, KEYS_SCREEN]
  const importers = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => reachesChokepoint(p))
    .filter((p) => !p.startsWith(GHOST_ADMIN + '/'))
    .filter((p) => !allowed.includes(p))
  assert.deepEqual(
    importers,
    [],
    `${importers.join(', ')} imports the Admin chokepoint. Only ${allowed.join(' and ')} may — ` +
      'add a new caller here with its reason, or it is a path AD-10 says does not exist.',
  )
})

test('every log line in the chokepoint is one of the shapes that cannot carry a key', () => {
  // The decrypted secret lives for the milliseconds between the select and the HMAC, and a
  // `console.error('…', error)` anywhere in this directory would be enough to put a customer's
  // Ghost key in Vercel's log for thirty days. So the SHAPE is asserted, not the intent: the
  // message is a literal and the second argument is an object of `code`, `name` and `status`.
  const shape = /^console\.error\('ghost-admin: [^']*', \{ (?:(?:code|name|status)(?::[^,}]*)?(?:, )?)+ \}\)$/
  const offenders = ghostAdminSources().flatMap((path) =>
    [...readFileSync(path, 'utf8').matchAll(/console\.[a-z]+\([^\n]*/g)]
      .map((m) => m[0].trim())
      .filter((line) => !shape.test(line))
      .map((line) => `${path}: ${line}`),
  )
  assert.deepEqual(
    offenders,
    [],
    'a log line under server/ghost-admin/ is not the allowed shape ' +
      "console.error('ghost-admin: …', { code | name | status }). Nothing there may log an error object.",
  )
  // And the assertion is worth having only if it is looking at lines at all.
  assert.ok(
    ghostAdminSources().some((p) => /console\./.test(readFileSync(p, 'utf8'))),
    'no console. line was found under server/ghost-admin/ — this test would pass over an empty set.',
  )
})

test('the credential kinds are the two Vault holds, and content is not one of them', () => {
  // `sites.content_key` is browser-safe by Ghost's design and is DELIVERED to the client on
  // purpose (FR-C3). A `content` member here would quietly move it into Vault and break the
  // canvas's live-content reads, with every other check still green.
  const source = readFileSync(GHOST_ADMIN_INDEX, 'utf8')
  const union = /export type CredentialKind = ([^\n]*)/.exec(source)
  assert.ok(union, `${GHOST_ADMIN_INDEX}: CredentialKind was not found — this test reads it, not restates it`)
  assert.deepEqual(
    [...union[1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]).sort(),
    ['admin', 'staff'],
    `${GHOST_ADMIN_INDEX}: CredentialKind is ${union[1].trim()}. Vault holds the Admin key and the Staff token; ` +
      'the Content API key is a plain column and never a secret.',
  )
})

/* ───────── STORY 5.24b — DW-65: ONE WRITER FOR THE TWO READ-MODIFY-WRITTEN COLUMNS.

   `site_settings` and `credentials_present` are jsonb that several writers read, change and write back, and PostgREST
   has no `||` — so every such write goes through `patchSite` in `server/site-settings.ts`, the one compare-and-set.
   A new writer that spreads a row it read an hour ago into `.update()` is green in every other check; this sees it.

   WHAT COUNTS AS A WRITE: the ARGUMENTS of `.update(`, `.insert(`, `.upsert(` and `writeSite(`, and inside them a key in
   VALUE position (`site_settings:`, a shorthand `site_settings,` or `site_settings }`) — so a `.select('…')` string, a
   type annotation and a comment are not writes. THE NAMED EXCEPTIONS, and only in `sites/actions.ts`: connect's insert
   (`.insert({ …connection })`) and re-adopt (`.update(connection)`) write a whole connection, and a failed store puts a
   kept record back whole (`.update(kept)`) — each a whole record by design, never a merge. `store()`/`remove()` write
   `credentials_present` as one SQL statement (`credentials_present || …`), atomic, and are not `.update(` calls. */

function argumentsOf(source: string, open: number): string {
  let depth = 0
  for (let at = open; at < source.length; at++) {
    if (source[at] === '(') depth++
    else if (source[at] === ')' && --depth === 0) return source.slice(open + 1, at)
  }
  return source.slice(open + 1)
}

const WHOLE_RECORD = [/^\s*connection\s*$/, /^\s*kept\s*$/, /^\s*\{[^}]*\.\.\.connection\s*\}\s*$/]

function jsonbWrites(source: string): { call: string; args: string; whole: boolean }[] {
  const code = source.replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  return [...code.matchAll(/(\.update|\.insert|\.upsert|\bwriteSite)\(/g)].flatMap((m) => {
    const args = argumentsOf(code, m.index! + m[0].length - 1)
    const whole = WHOLE_RECORD.some((shape) => shape.test(args))
    const touches = /\b(site_settings|credentials_present)\b\s*[:,}]/.test(args)
    return whole || touches ? [{ call: m[1], args: args.replace(/\s+/g, ' ').trim(), whole }] : []
  })
}

test('DW-65: every site_settings and credentials_present write goes through the one compare-and-set', () => {
  const offenders = sources()
    .map((p) => p.replace(/^\.\//, ''))
    .filter((p) => p !== SITE_SETTINGS)
    .flatMap((p) =>
      jsonbWrites(readFileSync(p, 'utf8'))
        .filter((w) => !(w.whole && p === CONNECT_ACTIONS))
        .map((w) => `${p}: ${w.call}(${w.args.slice(0, 90)})`),
    )
  assert.deepEqual(
    offenders,
    [],
    'these write site_settings or credentials_present around patchSite — a read-then-write that loses a concurrent ' +
      'writer\'s keys (DW-65). Route them through patchSite in server/site-settings.ts.',
  )
  // THE NAMED EXCEPTIONS ARE STILL THERE AND STILL WHOLE — or the list above is looking at nothing.
  const whole = jsonbWrites(readFileSync(CONNECT_ACTIONS, 'utf8')).filter((w) => w.whole).map((w) => `${w.call}(${w.args})`)
  assert.deepEqual(whole.sort(), ['.insert({ user_id: user.id, url, title: host, ...connection })', '.update(connection)', '.update(kept)'].sort())
  // …and `site-settings.ts` really is the writer: its conditional update is the one `.update(` the rule exempts.
  assert.match(readFileSync(SITE_SETTINGS, 'utf8'), /\.update\(next\)[^;]*\.eq\('updated_at', row\.updated_at\)/)

  // THE PLANTED CONTROL: the writes as `sites/actions.ts` made them at 0b00f5d9, before this story — each must fire.
  const head = [
    "await writeSite('portal answer', at, { site_settings: { ...row.site_settings, portal_button: true } })",
    ".update({ content_key: contentKey, credentials_present: { ...(site.credentials_present ?? {}), content: true } })",
    ".update({ disconnected_at: now, content_key: null, credentials_present: { content: false, admin: false, staff: false } })",
    ".update({ ...(version ? { ghost_version: version } : {}), site_settings, settings_read_at: now })",
    ".update({ site_settings })",
  ]
  for (const line of head) {
    assert.equal(jsonbWrites(line).filter((w) => !w.whole).length, 1, `control: the rule does not fire on ${line}`)
  }
  // …and does not fire on a read, a type, or a write of another column.
  for (const line of [".select('site_settings, credentials_present')", 'maybeSingle<{ site_settings: Record<string, unknown> }>()', ".update({ code_injection_notice_shown_at: now })"]) {
    assert.deepEqual(jsonbWrites(line), [], `control: the rule fires on ${line}`)
  }
})

test('R-226: connect says already connected, then judges a typed path at the root, and only then counts the plan', () => {
  // The owner's Question 1 ruling (2026-09-29): nobody is asked to upgrade for an address that could not connect. The
  // decision executes in `connect-rule.test.ts` (`pathOf`, `pathRefused`); `connectSite` needs a session, a pooler and a
  // real Ghost, so its ORDER is read out of the source — the harness's `path-refused` runs below the cap and cannot see it.
  const actions = readFileSync(CONNECT_ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const from = actions.indexOf('export async function connectSite')
  const body = actions.slice(from, actions.indexOf('\nexport ', from + 1))
  const ordered = (text: string) => {
    const known = text.indexOf("fail('already_connected'")
    const path = text.indexOf('pathRefused(')
    const cap = text.indexOf('atSiteCap(')
    return known > 0 && path > known && cap > path
  }
  assert.ok(ordered(body), `${CONNECT_ACTIONS}: connectSite must answer already_connected, then judge a typed path, then count the plan (R-226)`)
  // the control: the plan counted first — the order R-226 declined — fails the same check
  const cap = body.slice(body.indexOf('  const active = rows'), body.indexOf('\n', body.indexOf("fail('at_cap'")) + 1)
  const swapped = body.replace(cap, '').replace('  const path = pathOf(typed)', `${cap}  const path = pathOf(typed)`)
  assert.notEqual(swapped, body, 'control: the swapped body was built')
  assert.equal(ordered(swapped), false, 'control: a plan counted before the path is judged is caught')
})

test('DW-77: disconnect takes both keys out in ONE transaction, with the begin() around the loop', () => {
  const actions = readFileSync(CONNECT_ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const disconnect = actions.slice(actions.indexOf('export async function disconnectSite'), actions.indexOf('\nexport ', actions.indexOf('export async function disconnectSite') + 1))
  const removes = [...disconnect.matchAll(/\bremove\(/g)]
  assert.equal(removes.length, 1, `disconnectSite calls remove() ${removes.length} times — two calls are two transactions (DW-77)`)
  const call = argumentsOf(disconnect, removes[0].index! + 'remove'.length)
  assert.match(call, /kinds: \['admin', 'staff'\]/, 'disconnectSite must name both kinds in its one call')

  const index = readFileSync(GHOST_ADMIN_INDEX, 'utf8')
  const from = index.indexOf('export async function remove(')
  const body = index.slice(from, index.indexOf('\nexport ', from + 1))
  const inLoop = (text: string) => {
    const begins = [...text.matchAll(/\.begin\(/g)]
    const loop = text.indexOf('for (const kind of args.kinds)')
    return begins.length === 1 && loop > begins[0].index!
  }
  assert.ok(inLoop(body), `${GHOST_ADMIN_INDEX}: remove() must open ONE begin() and loop over the kinds inside it`)
  // the control: the begin() moved inside the loop — one transaction per kind again — fails the same check
  const moved = body.replace('    await sql().begin(async (tx) => {\n      for (const kind of args.kinds) {', '    for (const kind of args.kinds) {\n      await sql().begin(async (tx) => {')
  assert.notEqual(moved, body, 'control: the moved body was built')
  assert.equal(inLoop(moved), false, 'control: a begin() inside the loop is caught')
})

test('DW-59: a failed undo is logged, twice — once for the restore and once for the delete (review, 2026-09-29)', () => {
  const actions = readFileSync(CONNECT_ACTIONS, 'utf8')
  const logged = actions.match(/console\.error\('sites: connect undo failed'/g) ?? []
  assert.equal(logged.length, 2, `connectSite must log a failed undo on both of storeOrUndo's ways back, found ${logged.length}`)
})

test('DW-82: every landing in sites/actions.ts keeps the list’s search, except Connect’s (review, 2026-09-29)', () => {
  const actions = readFileSync(CONNECT_ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const connect = [actions.indexOf('export async function connectSite'), actions.indexOf('\nexport ', actions.indexOf('export async function connectSite') + 1)]
  const landings = [...actions.matchAll(/\bredirect\(([^\n]*)/g)].filter((m) => m.index! < connect[0] || m.index! > connect[1])
  assert.ok(landings.length >= 8, `expected the sites actions to land somewhere, found ${landings.length}`)
  for (const landing of landings) {
    assert.match(landing[1], /\bq\b|\burl\b/, `a landing without the list's search: redirect(${landing[1].trim()}`)
  }
  assert.doesNotMatch(actions, /redirect\(['"`]\/sites/, 'a literal /sites landing drops the search (DW-82)')
})

test('R-213: no editor action redirects a signed-out tab — each reads the user and answers ITS OWN refusal on none', () => {
  // `signedIn()` redirects, and Next navigates whatever the caller catches (`lib/action-redirect.ts`): a tab whose session
  // had ended was taken off the editor — and away from the only copy of work it might hold — by a preview subject, a
  // look or a re-read. The owner declined exactly that (5.24's Question 3, option 3), so every export refuses instead,
  // with the refusal it already answers its other failures with.
  const REFUSALS: Readonly<Record<string, string>> = {
    setPreviewSubject: '{ error: SAVE_REFUSED }',
    setViewedStates: '{ error: VIEWED_REFUSED }',
    recheckSite: '{ refused: true }',
  }
  /** the file's code, comments out (its prose names `signedIn()` and `redirect` to say why neither is called) */
  const code = readFileSync(EDITOR_ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  const names = [...code.matchAll(/^export async function (\w+)/gm)].map((m) => m[1]!)
  assert.deepEqual([...names].sort(), Object.keys(REFUSALS).sort(), `${EDITOR_ACTIONS}: every exported action has its own refusal named here, and only those`)
  assert.doesNotMatch(code, /\bredirect\(/, 'nothing in the file redirects')
  const bodyOf = (text: string, name: string) => {
    const start = text.indexOf(`export async function ${name}`)
    const next = text.indexOf('\nexport ', start + 1)
    return text.slice(start, next < 0 ? undefined : next)
  }
  const escape = (t: string) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  /** the rule for one action: no redirecting guard, the user READ, and none answered with its own refusal at once */
  const refuses = (body: string, refusal: string) =>
    // …and read QUIETLY (the review, 2026-10-02): `currentUser()` or a bare `supabaseServer()` writes a dead session's
    // cookie removal inside the action, which re-renders the route into the layout's redirect — executed on production
    !/\bsignedIn\(|\bcurrentUser\(|\bsupabaseServer\(/.test(body) && new RegExp(`const \\{ user, supabase \\} = await quietSession\\(\\)\\s*\\n\\s*if \\(!user\\) return ${escape(refusal)}`).test(body)
  for (const name of names) assert.ok(refuses(bodyOf(code, name), REFUSALS[name]!), `${EDITOR_ACTIONS}: ${name} does not read the user and refuse with ${REFUSALS[name]}`)
  // the controls, each from the file itself: HEAD's redirecting guard, an export that reads no user, and another
  // action's refusal answered in place of its own — each is caught
  for (const name of names) {
    const body = bodyOf(code, name)
    assert.equal(refuses(body.replace(/const \{ user, supabase \} = await quietSession\(\)\s*\n\s*if \(!user\) return [^\n]*\n/, 'const user = await signedIn()\n'), REFUSALS[name]!), false, `control: ${name} with signedIn()`)
    assert.equal(refuses(body.replace(/const \{ user, supabase \} = await quietSession\(\)\s*\n\s*if \(!user\) return [^\n]*\n/, ''), REFUSALS[name]!), false, `control: ${name} reading no user`)
    assert.equal(refuses(body.replace('await quietSession()', '{ user: await currentUser(), supabase: await supabaseServer() }'), REFUSALS[name]!), false, `control: ${name} reading the user the cookie-writing way`)
    const other = Object.values(REFUSALS).find((r) => r !== REFUSALS[name])!
    assert.equal(refuses(body, other), false, `control: ${name} answering ${other}`)
  }
})

test('R-213: the proxy removes no session cookie on a server action\'s request — the removal re-renders the route into the layout\'s redirect', () => {
  // Executed on production (the deployed walk's step 8, twice): with the action writing nothing, the proxy's own removal
  // on the action's response still sent the tab to /sign-in. A refresh — a non-empty value — is still written.
  const proxy = readFileSync(join(process.cwd(), 'proxy.ts'), 'utf8').replace(/\/\*[^]*?\*\//g, '').replace(/\/\/.*$/gm, '')
  assert.match(proxy, /const action = req\.headers\.has\('next-action'\)/)
  assert.match(proxy, /if \(action && \(value === '' \|\| options\?\.maxAge === 0\)\) continue\s*\n\s*res\.cookies\.set\(/)
})

test('R-214: the shell hands its user to every page it draws, not the editor alone — Sign out everywhere reads the id there', () => {
  // `sessions-card.tsx` takes the user's id from `useShellUser()`, and `useSignOut` with no id signs out without sending
  // or erasing. The provider stood on the editor branch only, so on production Account's door skipped R-214 whole (the
  // review of 5.24e, the deployed walk's step 8). Both of the shell's returns provide it.
  const shell = readFileSync(join(process.cwd(), 'components', 'shell', 'shell.tsx'), 'utf8')
  // one per `<main>` the shell draws: the editor path's and every other page's
  assert.equal(shell.split('<ShellUserContext value={user}>{children}</ShellUserContext>').length - 1, 2, 'a main draws its children with no user')
  assert.match(readFileSync(join(process.cwd(), 'app', '(app)', 'app', '(authed)', 'account', 'sessions-card.tsx'), 'utf8'), /useSignOut\(useShellUser\(\)\?\.id/)
})

test('DW-198: /pilots hands the Sidebar the mode it is showing, never a fixed one', () => {
  // `mode` is required on the Sidebar, so the typecheck finds a caller that forgets it — but not one that passes
  // "light" while showing dark, which is the defect DW-198 was reported on. `/pilots` is behind sign-in with no harness
  // mount, so the keyboard gate cannot press it; the editor's own stop covers the Sidebar's half.
  const review = readFileSync(join(process.cwd(), 'app', '(app)', 'app', '(authed)', 'pilots', 'review.tsx'), 'utf8')
  const sidebar = review.slice(review.indexOf('<Sidebar'), review.indexOf('/>', review.indexOf('<Sidebar')))
  assert.match(sidebar, /\bswatches=\{swatches\}/)
  assert.match(sidebar, /\bmode=\{mode\}/)
})

test('DW-273: the editor\'s read asks for the linked site\'s ghost_version and hands it to siteWith', () => {
  // `siteWith` and `paywallPage` are each unit-tested, and the keyboard journey walks the major from the site to the
  // Paywall's box — on a harness fixture. This is the one link neither reaches: the column in the real read's select, and
  // the read value given to the rule. Without either a Ghost 5 site's Paywall quietly draws Ghost 6's box.
  const read = readFileSync(EDITOR_READ, 'utf8')
  const select = /\.from\('sites'\)\s*\.select\('([^']*)'\)/.exec(read)?.[1] ?? ''
  assert.ok(select.split(',').map((c) => c.trim()).includes('ghost_version'), `${EDITOR_READ}: the sites select no longer names ghost_version`)
  assert.match(read.replace(/\s+/g, ' '), /siteWith\([^)]*\.ghost_version\)/, `${EDITOR_READ}: ghost_version no longer reaches siteWith`)
})

test('DW-327 (Story 6.6): Use your brand writes style_pack only through sync_project_doc\'s compare-and-set — and no source updates the column whole', () => {
  // The race itself (an editor save landing between the action's read and its write) is not staged end to end: its guard is
  // the compare-and-set, proven by the RLS gate's stale-base case. This is the half no running test can see — that the
  // action really goes through it, and that no whole-column write of `style_pack` is left anywhere to lose a save.
  const code = (text: string) => text.replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const wholeWrite = (text: string) => /\.update\(\s*\{[^}]*\bstyle_pack\b/.test(code(text))
  assert.deepEqual(sources().filter((p) => wholeWrite(readFileSync(p, 'utf8'))), [], 'a whole-column style_pack update loses a concurrent save (DW-327)')
  const actions = code(readFileSync(CONNECT_ACTIONS, 'utf8'))
  const from = actions.indexOf('export async function useBrand')
  const body = actions.slice(from, actions.indexOf('\nexport ', from + 1))
  assert.ok(from > 0 && body.length > 0, 'the control: useBrand was found')
  assert.match(body, /\.rpc\('sync_project_doc', \{\s*p_project: row\.id,\s*p_docs: \{\},\s*p_base: row\.revision,\s*p_preset: seed\.preset,\s*p_packs: seed\.packs,\s*\}\)/, 'useBrand seeds through sync_project_doc against the revision it read')
  // `brand` is no longer written: no `style_pack` the action builds carries it
  for (const literal of body.matchAll(/style_pack: \{[^\n]*/g)) assert.doesNotMatch(literal[0], /\bbrand\b/, literal[0])
  assert.match(body, /style_pack: \{ \.\.\.defaultStylePack\(\)/, 'the control: the insert\'s style_pack was found')
  // THE PLANTED CONTROL: the write as `useBrand` made it before this story fires the rule
  assert.equal(wholeWrite(".from('projects')\n      .update({ style_pack: { ...pack, brand } })\n      .eq('id', project.id)"), true, 'control: the rule does not fire on the old write')
  assert.equal(wholeWrite(".update({ dark_enabled: next })"), false, 'control: the rule fires on another column')
})
