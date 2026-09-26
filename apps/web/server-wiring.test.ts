import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

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
const SITE_HEALTH = join('server', 'site-health.ts')
const KEYS_SCREEN = join('app', '(app)', 'app', '(authed)', 'sites', 'keys-screen.tsx')
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

  const actions = readFileSync(ACCOUNT_ACTIONS, 'utf8').replace(/\s+/g, ' ')
  const body = actions.slice(actions.indexOf('function signOutEverywhere'))
  assert.match(
    body,
    /await signedIn\(\)[^]*auth\.signOut/,
    `${ACCOUNT_ACTIONS}: signOutEverywhere must guard on signedIn() — the session alone — before ` +
      'it calls /logout. A session that ended between the render and the click is the sign-in page.',
  )
  assert.doesNotMatch(
    body.slice(0, body.indexOf('auth.signOut')),
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
  // client may write, whose foreign key checks only that the site exists. So `readSettings` (Story 5.21's name for 5.20's
  // `readMembers`, widened) must refuse a site that is not the caller's BEFORE the chokepoint runs: an owned-row read
  // (`user_id`) ahead of the first `call(`. Since 5.21 it runs on every open of the editor, not only on a press.
  const ownedFirst = (body: string) => {
    const owned = body.indexOf(".eq('user_id', args.userId)")
    const asked = body.indexOf('call({')
    return owned > 0 && asked > 0 && owned < asked
  }
  const source = readFileSync(SITE_PROBE, 'utf8')
  const start = source.indexOf('export async function readSettings')
  assert.ok(start >= 0, 'readSettings is not in site-probe.ts — this test is pointed at nothing')
  const next = source.indexOf('\nexport ', start + 1)
  const body = source.slice(start, next < 0 ? undefined : next)
  assert.ok(ownedFirst(body), 'readSettings asks Ghost before it has checked the site is the caller\'s')
  // the control: the OLD ORDER — the chokepoint asked first, the owned row read after — fails the same check
  const call = body.slice(body.indexOf('    const response = await call({'), body.indexOf('\n', body.indexOf('    const response = await call({')) + 1)
  const oldOrder = body.replace(call, '').replace('    const admin = supabaseAdmin()\n', `    const admin = supabaseAdmin()\n${call}`)
  assert.ok(oldOrder !== body && oldOrder.indexOf('call({') < oldOrder.indexOf(".eq('user_id', args.userId)"), 'control: the old order was built')
  assert.equal(ownedFirst(oldOrder), false, 'control: a body that asks Ghost before the ownership read is caught')
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
    .filter((p) => /from\s*['"][^'"]*server\/ghost-admin(\/[a-z-]+(\.ts)?)?['"]/.test(readFileSync(p, 'utf8')))
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
