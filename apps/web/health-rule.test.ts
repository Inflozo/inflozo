import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { HEALTH, MIN_GHOST_MAJOR } from './lib/connect-rule.ts'
import {
  BATCH,
  CRON_PATH,
  emailAllowed,
  EMAIL_CAP_DAYS,
  HEALTH_REASONS,
  healthOf,
  openHealthNotices,
  runHealthChecks,
  transitionOf,
  type Health,
  type HealthDeps,
} from './lib/health-rule.ts'
import { healthEmail } from './lib/health-email.ts'

/* Story 3.7 — FR-C5's decision, and every branch of it that a live Ghost cannot be made to
   produce. THE FOUR TRANSITIONS AND BOTH SIDES OF THE CAP ARE HERE AND NOWHERE ELSE: making a real
   Ghost go healthy → unhealthy → healthy → unhealthy inside one week, twice, with the clock in two
   places, is not a thing `tools/probe/run-verify-site-health.py` can do — what THAT run does is
   drive one real transition and one real recovery on T3 with a regenerated key (R-82), which is
   the half no unit test can claim. The two together are the story's evidence.

   NOTHING HERE REACHES A DATABASE OR A NETWORK, which is why the whole decision is in
   `lib/health-rule.ts` rather than in `server/site-health.ts` or in the route: a rule inside a
   route file is a rule that gets read rather than run. */

const HEALTHY = { ok: true }
const now = new Date('2026-09-10T12:00:00.000Z')
const daysAgo = (days: number) => new Date(now.getTime() - days * 86_400_000).toISOString()

test('a probe that passed on a supported Ghost is healthy, and carries no reason', () => {
  assert.deepEqual(healthOf(HEALTHY, '6.58.0'), { health: 'healthy', reason: null })
  assert.deepEqual(healthOf(HEALTHY, '5.130.6'), { health: 'healthy', reason: null })
})

test('THE FIVE CAUSES THAT MAKE A SITE UNHEALTHY, and every one has a sentence', () => {
  // Four come off `probeSite`'s summary — which is `ghostCode`'s vocabulary, one row per Ghost
  // cause (AD-24) — and the fifth is the version floor, below.
  for (const code of ['ghost_unknown_key', 'ghost_unauthorized', 'credential_missing', 'ghost_redirected']) {
    const answer = healthOf({ ok: false, code }, '6.58.0')
    assert.equal(answer.health, 'unhealthy', `${code} must set Reconnect needed`)
    assert.equal(answer.reason, code)
    assert.ok(HEALTH_REASONS[answer.reason as keyof typeof HEALTH_REASONS], `${code} has no sentence`)
  }
})

test('DW-63: a Ghost that now reports 4.x is unhealthy with its own reason', () => {
  // The version rule is CONNECT'S — `versionVerdict` — called and not restated, and this is the
  // surface DW-63 was waiting for: refusing inside 3.3's probe would have meant inventing an
  // unhealthy state this epic could not yet draw.
  const answer = healthOf(HEALTHY, '4.48.0')
  assert.deepEqual(answer, { health: 'unhealthy', reason: 'ghost_too_old' })
  // …and the floor it is decided against lives in ONE place, so this test cannot disagree with
  // connect about which majors are in (standing rule 4).
  assert.equal(healthOf(HEALTHY, `${MIN_GHOST_MAJOR}.0.0`).health, 'healthy')
  assert.equal(healthOf(HEALTHY, `${MIN_GHOST_MAJOR - 1}.99.0`).health, 'unhealthy')
})

test('EVERYTHING ELSE IS UNDECIDED — never a badge, and never an email (FR-P2)', () => {
  // A site that is briefly offline, rate-limited, or answering 500 has not "gone unhealthy", and a
  // JWT WE mis-signed is our bug and must never be shown as the user's (§37). Each of these leaves
  // `health` exactly where it was and makes the run red instead.
  for (const code of [
    'ghost_unreachable',
    'ghost_refused',
    'ghost_bad_signature',
    'settings_unreadable',
    'credential_store_unavailable',
    'site_not_found',
    '42703',
  ]) {
    assert.equal(healthOf({ ok: false, code }, '6.58.0').health, null, `${code} must decide nothing`)
  }
  // A 200 that reports NO version at all is not a floor failure either: the credential worked, and
  // `versionVerdict` calls that `ghost_unreachable` for the connect wizard's own reasons.
  assert.equal(healthOf(HEALTHY, null).health, null)
  assert.equal(healthOf(HEALTHY, 'not-a-version').health, null)
})

test('THE FOUR TRANSITIONS', () => {
  assert.equal(transitionOf({ was: 'healthy', now: 'unhealthy' }), 'opened')
  assert.equal(transitionOf({ was: 'unhealthy', now: 'healthy' }), 'resolved')
  // The same site the next day: nothing sent, nothing inserted — FR-C5's suppression during an
  // outage, and the row this test exists to keep from ever becoming a second notification.
  assert.equal(transitionOf({ was: 'unhealthy', now: 'unhealthy' }), null)
  assert.equal(transitionOf({ was: 'healthy', now: 'healthy' }), null)
  // …and a check that could not be made is not a transition in either direction.
  assert.equal(transitionOf({ was: 'healthy', now: null }), null)
  assert.equal(transitionOf({ was: 'unhealthy', now: null }), null)
})

test('THE EMAIL SENDS ON A TRANSITION AND NEVER OTHERWISE', () => {
  // Only on the way down. A recovery is good news and FR-P2 permits no nudge about it; the same
  // state twice is the flapping rule.
  assert.equal(emailAllowed({ transition: 'opened', lastEmailAt: null, now }), true)
  assert.equal(emailAllowed({ transition: 'resolved', lastEmailAt: null, now }), false)
  assert.equal(emailAllowed({ transition: null, lastEmailAt: null, now }), false)
})

test('BOTH SIDES OF THE ROLLING CAP, and the boundary itself', () => {
  const opened = { transition: 'opened' as const, now }
  // The matrix's "Two transitions inside 7 days": two notification rows, ONE email.
  assert.equal(emailAllowed({ ...opened, lastEmailAt: daysAgo(1) }), false)
  assert.equal(emailAllowed({ ...opened, lastEmailAt: daysAgo(EMAIL_CAP_DAYS - 1) }), false)
  // Exactly the cap is ALLOWED — `>=`, so a site that breaks a week to the second is not silenced
  // for another whole week by a rounding choice nobody made.
  assert.equal(emailAllowed({ ...opened, lastEmailAt: daysAgo(EMAIL_CAP_DAYS) }), true)
  assert.equal(emailAllowed({ ...opened, lastEmailAt: daysAgo(EMAIL_CAP_DAYS + 1) }), true)
  // A stamp that is not a date must not silence the one email FR-P1 promises.
  assert.equal(emailAllowed({ ...opened, lastEmailAt: 'never' }), true)
  // A `Date` and its ISO string are the same instant: the cron holds one and the row holds the
  // other, and this is the only place they meet.
  assert.equal(emailAllowed({ ...opened, lastEmailAt: new Date(daysAgo(1)) }), false)
})

test('THE REASON TABLE CARRIES NO NUMBER, NO DATE AND NO DIAGNOSIS', () => {
  const words = Object.values(HEALTH_REASONS).join(' ')
  // COUNTS ARE DERIVED (standing rule 4): the version floor's figure is `MIN_GHOST_MAJOR`'s and the
  // cap's is `EMAIL_CAP_DAYS`'s, so neither may be written into a sentence. A DIGIT IS NOT THE ONLY
  // WAY TO WRITE A NUMBER — the review of 2026-09-09 found "two Ghost keys" passing `\d` for a
  // whole story — so the spelled-out words are refused too.
  assert.ok(!/\d/.test(words), `HEALTH_REASONS names a number: ${words}`)
  const spelled = /\b(one|two|three|four|five|six|seven|eight|nine|ten|ninety)\b/i
  assert.ok(!spelled.test(words), `HEALTH_REASONS spells a number out: ${words}`)
  // "EXPIRED" APPEARS IN NONE OF THEM: Ghost's `api_keys` has no expiry column (§37), so a 401 is a
  // key regenerated or an integration removed, and telling a customer their key expired sends them
  // looking for a setting Ghost has not got.
  assert.doesNotMatch(words, /expired/i)
  // R-100, THE OWNER'S RULING: no sentence may claim to have recognised another Ghost's key.
  // `api_keys` carries no install identity, so Ghost answers the same 401 to a wrong key and to
  // another install's, and a sentence that guessed would be guessing.
  assert.doesNotMatch(words, /different (ghost )?site|another site|belongs to/i)
  // EACH ONE IS A WHOLE SENTENCE AND NOT A CODE WEARING PROSE, because this is what the customer
  // reads under an amber badge and in an inbox. What it deliberately does NOT have to carry is the
  // FIX: `ghost_unknown_key`'s wording is the epic's own approved voice — "Ghost said no — this
  // Admin API key no longer works. It was regenerated or removed in Ghost Admin." — and that line
  // ends at what happened because the **Reconnect** control sits beside it on the card and the
  // button sits under it in the email. A sentence that also told you where to click would be
  // duplicating a control (UX-DR3's own argument, one level down).
  for (const [code, said] of Object.entries(HEALTH_REASONS)) {
    assert.ok(said.length > 20, `${code}'s sentence is too short to say what happened`)
    assert.match(said, /\.$/, `${code}'s reason is not a sentence`)
  }
})

test("HEALTH's copy is R-98-shaped, and the card's three states are three words", () => {
  // Every control that starts work wears a present tense that DIFFERS from its resting label, or
  // the control says nothing by changing.
  for (const [resting, busy] of [
    [HEALTH.recheck, HEALTH.recheckBusy],
    [HEALTH.reconnect, HEALTH.reconnectBusy],
  ] as [string, string][]) {
    assert.ok(busy.length > 0, `${resting} has no busy label`)
    assert.notEqual(busy, resting)
  }
  // The frame's own two badge words plus the owner's third, and no two of them are the same string
  // — a state line whose states read alike is a state line that says nothing.
  const states = [HEALTH.connected, HEALTH.unhealthy, HEALTH.checking]
  assert.equal(new Set(states).size, 3, `the three card states are not three words: ${states.join(' / ')}`)
  // The wrapper takes BOTH halves as arguments, which is what keeps the date format out of the copy.
  assert.equal(HEALTH.reason('Ghost said no.', 'Aug 15, 2026'), 'Ghost said no. · Aug 15, 2026')
})

test('THE OPEN NOTICES JOIN ON THE PAYLOAD, and refuse a row that is not one', () => {
  const rows = [
    { data: { site_id: 'a', reason: 'ghost_unknown_key' }, created_at: '2026-09-09T00:00:00.000Z' },
    // An older row for the same site loses: the caller reads newest first and the current outage
    // is the one the card is about.
    { data: { site_id: 'a', reason: 'ghost_redirected' }, created_at: '2026-08-01T00:00:00.000Z' },
    { data: { site_id: 'b' }, created_at: '2026-09-08T00:00:00.000Z' },
    // `notifications.data` is jsonb and the client can mark a row read, so nothing may be trusted
    // about its shape: none of these four may throw and none may reach the map.
    { data: null, created_at: '2026-09-07T00:00:00.000Z' },
    { data: { site_id: 42 }, created_at: '2026-09-07T00:00:00.000Z' },
    { data: 'nope', created_at: '2026-09-07T00:00:00.000Z' },
    { data: { reason: 'ghost_unknown_key' }, created_at: '2026-09-07T00:00:00.000Z' },
  ]
  const found = openHealthNotices(rows)
  assert.deepEqual(found.get('a'), { reason: 'ghost_unknown_key', at: '2026-09-09T00:00:00.000Z' })
  // A row with no reason still dates the outage — the card then draws the button and no caption.
  assert.deepEqual(found.get('b'), { reason: null, at: '2026-09-08T00:00:00.000Z' })
  assert.equal(found.size, 2)
  // A read that failed answers an empty map, never a throw: `sites.health` came out of its own
  // read, so the badge stands and the caption is simply absent.
  assert.equal(openHealthNotices(null).size, 0)
  assert.equal(openHealthNotices(undefined).size, 0)
})

/* ───────── THE LOOP. `runPurge`'s own review is the argument for this being pure: "one failure
   never stops the rest" ran under no executing test until the loop took a deps interface. */

const site = (n: string) => ({ siteId: n, userId: `u-${n}` })

/** A log that records rather than prints. */
function recorder() {
  const errors: unknown[][] = []
  return { errors, log: { log: () => {}, error: (...a: unknown[]) => errors.push(a) } }
}

test('one site that throws never stops the rest, and the run counts it', async () => {
  const seen: string[] = []
  const deps: HealthDeps = {
    async check({ siteId }) {
      seen.push(siteId)
      if (siteId === 'b') throw Object.assign(new Error('timeout'), { code: 'ghost_unreachable' })
      return { health: (siteId === 'c' ? 'unhealthy' : 'healthy') as Health, reason: null }
    },
  }
  const { log, errors } = recorder()
  const counts = await runHealthChecks(deps, [site('a'), site('b'), site('c')], log)
  // The matrix's "Cron: one site throws": the others complete IN THE SAME RUN, and the run is red.
  assert.deepEqual(seen, ['a', 'b', 'c'])
  assert.deepEqual(counts, { checked: 2, unhealthy: 1, failed: 1 })
  assert.equal(errors.length, 1)
  const [line, logged] = errors[0] as [string, Record<string, unknown>]
  assert.equal(line, 'site-health: failed')
  assert.equal(logged.siteId, 'b')
  assert.equal(logged.code, 'ghost_unreachable')
  // NEVER AN ADDRESS AND NEVER A TITLE (spine, Security floor).
  assert.deepEqual(Object.keys(logged).sort(), ['code', 'siteId'])
})

test('a site that could not be DECIDED is a failure too, so the run answers 500', async () => {
  const deps: HealthDeps = { async check() { return { health: null, reason: 'ghost_unreachable' } } }
  const { log, errors } = recorder()
  assert.deepEqual(await runHealthChecks(deps, [site('a')], log), { checked: 0, unhealthy: 0, failed: 1 })
  assert.equal((errors[0] as [string])[0], 'site-health: undecided')
})

test('nothing due is a run of nothing, not an error', async () => {
  let called = 0
  const deps: HealthDeps = { async check() { called += 1; return { health: 'healthy' as Health, reason: null } } }
  assert.deepEqual(await runHealthChecks(deps, [], recorder().log), { checked: 0, unhealthy: 0, failed: 0 })
  assert.equal(called, 0)
})

/* ───────── THE ROUTE AND THE SCHEDULE. Two promises only the source makes, and no stub can reach.
   (That the schedule NAMES this route is `purge.test.ts`'s, over every entry `vercel.json` carries.) */

const ROUTE = join('app', CRON_PATH, 'route.ts')

test('the cron checks the secret before it reads, backfills oldest-first, and goes red on a failure', () => {
  const flat = readFileSync(ROUTE, 'utf8').replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
  // 401 BEFORE ANY DATABASE READ. An `authorized()` moved below the select would answer 401 to the
  // internet and still have read every site's row first, with every check green.
  const guard = flat.indexOf('authorized(request.headers')
  const read = flat.indexOf(".from('sites')")
  assert.ok(guard >= 0 && read >= 0, `${ROUTE}: the guard or the select was not found`)
  assert.ok(guard < read, `${ROUTE}: CRON_SECRET must be checked before any database read`)
  assert.match(flat, /status: 401/, `${ROUTE}: an unauthorised call must answer 401`)
  // DW-62: the first run is a BACKFILL, and this ordering is the whole of it — a site never checked
  // has a null `last_checked_at`, so nulls first puts it at the front of the very first pass.
  assert.match(
    flat,
    /\.order\('last_checked_at', \{ ascending: true, nullsFirst: true \}\)/,
    `${ROUTE}: DW-62's backfill is the "nulls first" ordering; without it a never-checked site can starve`,
  )
  assert.match(flat, /\.limit\(BATCH\)/, 'the run is bounded by BATCH, not by however many sites exist')
  // FR-C6's kept record is not a site, and a partially credentialed one is a first-class state.
  assert.match(flat, /\.is\('disconnected_at', null\)/, `${ROUTE}: a disconnected record must never be checked`)
  assert.match(flat, /credentials_present->>admin/, `${ROUTE}: a site with no Admin key must be skipped`)
  assert.match(flat, /runHealthChecks\(/, `${ROUTE}: the route must run the loop that is tested above`)
  assert.match(
    flat,
    /status: counts\.failed \? 500 : 200/,
    `${ROUTE}: a run with a failed site must answer 500 — the red line in Vercel's log is the only alarm (DW-46)`,
  )
  // A cached cron response is skipped and never logged (Vercel docs) — a check that did not run.
  assert.match(flat, /export const dynamic = 'force-dynamic'/)
  assert.match(flat, /'Cache-Control': 'no-store'/)
  assert.ok(typeof BATCH === 'number' && BATCH > 0)
})

/* ───────── A ROUTES READ THAT FAILS DOES NOT MAKE A SITE UNHEALTHY, and leaves both columns where
   they were. The matrix row no stub reaches: `readRoutes` is internal to a module that opens a
   service-role client at import, so this is read out of the source in `ROUTE`'s own shape above.
   It is here rather than in a note because the three ways the read can fail — a non-200, a body
   with no bytes, and a throw — each have to end in the SAME `null`, and a fourth path added later
   that rethrows would turn an unreadable file into an unhealthy site with nothing to catch it. */

const CHECK = join('server', 'site-health.ts')

test('an unreadable routes.yaml leaves health and both routes columns alone', () => {
  const source = readFileSync(CHECK, 'utf8')
  const flat = source.replace(/\/\*[^]*?\*\/|\/\/[^\n]*/g, ' ').replace(/\s+/g, ' ')
  // 1. HEALTH CANNOT DEPEND ON THE READ. `healthOf` takes the probe and the version, full stop —
  //    a third argument here is the review question, not a refactor.
  assert.match(
    flat,
    /healthOf\(probe, probe\.version\)/,
    `${CHECK}: health is decided from the probe and the version alone — routes are never an input`,
  )
  // 2. BOTH COLUMNS ARE WRITTEN ONLY BEHIND THE ANSWER, so a null read writes neither and the
  //    last good hash and stamp stand. An unconditional spread would blank them on every 404.
  assert.match(
    flat,
    /\.\.\.\(routes \? \{ routes_live_sha256: routes\.sha256, routes_verified_at: [^}]+\} : \{\}\)/,
    `${CHECK}: routes_live_sha256 and routes_verified_at must be left where they were on a failed read`,
  )
  // 3. EVERY WAY THE READ CAN FAIL ENDS IN THE SAME `null` — counted out of the function's own
  //    body, so a path added without one fails here rather than escaping as a throw.
  const body = source.slice(source.indexOf('async function readRoutes'))
  const fn = body.slice(0, body.indexOf('\n}\n') + 2)
  assert.equal(
    (fn.match(/return null/g) ?? []).length,
    3,
    `${CHECK}: readRoutes has three ways to fail — a non-200, no bytes, and a throw — and each must return null`,
  )
  assert.doesNotMatch(fn, /\bthrow\b/, `${CHECK}: readRoutes must never rethrow; the rest of the check stands`)
  assert.match(fn, /catch \(thrown\)/, `${CHECK}: the read is wrapped, so a network throw is logged and swallowed`)
})

/* ───────── FR-P1's THIRD EMAIL. None of it is reachable from a browser step — the harness sees
   Resend's 2xx and nothing after it (DW-22) — so the message itself is held here, exactly as
   `deletion-email.test.ts` holds the eighth. */

const KEYS_URL = 'https://app.inflozo.com/sites?manage=aaaa'
const AT = '2026-09-10T12:00:00.000Z'

test('the reconnect email names the site, says what Ghost said, and offers one way to fix it', () => {
  const { subject, html, text } = healthEmail({
    site: 'Orbit Weekly',
    reason: 'ghost_unknown_key',
    at: AT,
    keysUrl: KEYS_URL,
  })
  assert.match(subject, /Orbit Weekly/)
  for (const body of [html, text]) {
    assert.match(body, /Orbit Weekly/, 'the customer may have several sites')
    assert.match(body, /Sep 10, 2026/, 'the date the check ran, in the app\'s one date format')
    assert.ok(body.includes(HEALTH_REASONS.ghost_unknown_key), 'the reason table\'s own sentence')
    assert.ok(body.includes(KEYS_URL), 'the way to fix it must be in both bodies')
    assert.match(body, /only email we'll send/, 'FR-P2 permits no nudge, and this says so')
  }
  // The button is the shell's ink one and it points at the Manage keys WINDOW.
  assert.ok(html.includes(`<a href="${KEYS_URL.replace(/&/g, '&amp;')}"`))
  assert.ok(html.includes(`>${HEALTH.emailButton}</a>`))
  // The product's own copy is NOT entity-escaped: `we&#39;ll` in an inbox is a defect.
  assert.doesNotMatch(html, /&#39;/)
  // AND IT PROMISES NO SECOND ONE, in either direction: no "we'll check again", no "if this keeps".
  assert.doesNotMatch(html, /we.ll (check|email|remind) (you )?again/i)
})

test('a site title is escaped — it is text somebody else controls', () => {
  const nasty = '<script>alert(1)</script> & "Weekly"'
  const { html, text } = healthEmail({ site: nasty, reason: null, at: AT, keysUrl: KEYS_URL })
  assert.doesNotMatch(html, /<script>/, 'a site title went into the markup unescaped')
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt; &amp;/)
  // The plain-text half is not markup and is not escaped — it is read as characters.
  assert.ok(text.includes(nasty))
})

test('a cause the table does not name still says what to do', () => {
  // `healthOf` never sends one of these — an undecided check writes nothing at all — but the email
  // takes the code from a row that may have been written by a version of this table that is not
  // this one, so a hole in the lookup has to be an answer rather than "undefined".
  const { html } = healthEmail({ site: 'x', reason: 'something_new', at: AT, keysUrl: KEYS_URL })
  assert.doesNotMatch(html, /undefined/)
  assert.ok(html.includes(HEALTH.emailUnknown))
})
