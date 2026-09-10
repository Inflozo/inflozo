import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  ADMIN_KEY_CONSENT,
  checkedLabel,
  CONNECT_MESSAGES,
  connectMessage,
  DISCONNECT,
  projectCounts,
  projectsLabel,
  filterSites,
  ghostLabel,
  hostOf,
  HTTP_WARNING,
  isHttpUrl,
  isPlainHttp,
  KEYS,
  keysFieldOf,
  MIN_GHOST_MAJOR,
  ORPHAN_SNAPSHOT_DAYS,
  normaliseSiteUrl,
  SITES_EMPTY,
  stepOf,
  versionVerdict,
  type MessageCode,
} from './lib/connect-rule.ts'
import { atSiteCap, PLANS, siteCapSentence } from './lib/plan.ts'
import { checkContentKey } from './app/(app)/app/(authed)/sites/content-check.ts'

/* Story 3.2 — the connect wizard's pure half, and the I/O matrix's rows that do not need a
   Ghost, a browser or a database. The rest of the matrix runs on the DEPLOYED site under
   `tools/probe/run-verify-ghost-admin.py` (R-82): a mocked Ghost proves nothing about the two
   real ones, and the version floor is the reverse — no Ghost 4 server exists, so the ONLY place
   that refusal can be executed at all is here. */

const ACTIONS = join('app', '(app)', 'app', '(authed)', 'sites', 'actions.ts')

test('the version floor: 5 and 6 in, 4 out, and no version at all is not a Ghost we know', () => {
  // The two versions the harness meets, by value: T1 6.58.0 and T3 5.130.6.
  assert.deepEqual(versionVerdict('6.58.0'), { ok: true, major: 6, minor: 58 })
  assert.deepEqual(versionVerdict('5.130.6'), { ok: true, major: 5, minor: 130 })
  // AND THE ONE THAT CANNOT BE EXECUTED ANYWHERE ELSE (MEASUREMENTS §38, "not executed, and
  // cannot be"): there is no Ghost 4 server, so this line is the whole proof of FR-C2's refusal.
  assert.deepEqual(versionVerdict('4.48.0'), { ok: false, code: 'ghost_too_old', major: 4, minor: 48 })
  assert.deepEqual(versionVerdict('4.0.0'), { ok: false, code: 'ghost_too_old', major: 4, minor: 0 })
  // A Ghost that answers no version is refused as UNREACHABLE, never accepted on a guess.
  for (const answer of [undefined, null, '', 'unknown', 'v6']) {
    assert.deepEqual(versionVerdict(answer), { ok: false, code: 'ghost_unreachable' }, `${answer}`)
  }
  // The floor is a named constant and the branch is really at it, not one either side.
  assert.equal(versionVerdict(`${MIN_GHOST_MAJOR}.0.0`).ok, true)
  assert.equal(versionVerdict(`${MIN_GHOST_MAJOR - 1}.99.9`).ok, false)
})

test('the address is normalised to an origin, and a typo is refused rather than guessed at', () => {
  // The matrix's own rows.
  assert.equal(normaliseSiteUrl('orbitweekly.com'), 'https://orbitweekly.com')
  assert.equal(normaliseSiteUrl('orbit weekly'), null)
  assert.equal(normaliseSiteUrl('https://ghost5.inflozo.com/'), 'https://ghost5.inflozo.com')
  // One row under `unique (user_id, url)`, whichever way it was typed.
  for (const typed of ['ghost6.inflozo.com', 'https://Ghost6.Inflozo.com', 'https://ghost6.inflozo.com/ghost/', '  ghost6.inflozo.com  ']) {
    assert.equal(normaliseSiteUrl(typed), 'https://ghost6.inflozo.com', typed)
  }
  // `http://` is KEPT: it is warned, not rewritten, and Ghost's own answer — a 301 the chokepoint
  // never follows, `ghost_redirected` (§38c as corrected at Review) — is the honest one. Silently
  // upgrading it would connect to an address the customer did not give.
  assert.equal(normaliseSiteUrl('http://ghost5.inflozo.com'), 'http://ghost5.inflozo.com')
  assert.equal(isPlainHttp('http://ghost5.inflozo.com'), true)
  assert.equal(isPlainHttp('https://ghost5.inflozo.com'), false)
  assert.equal(isPlainHttp('ghost5.inflozo.com'), false)
  // Not a site address at all.
  for (const bad of ['', '   ', 'ftp://example.com', 'javascript:alert(1)', 'localhost', 'orbitweekly', 'https://']) {
    assert.equal(normaliseSiteUrl(bad), null, bad)
  }
  // Nor is an IP literal, over either scheme: the function's fetch stays on public names (review,
  // 2026-09-08), and a Ghost on a bare IP has no certificate for the browser's own check anyway.
  for (const ip of ['127.0.0.1', 'http://10.0.0.1', 'https://169.254.169.254/', 'https://[::1]/', 'http://[fe80::1]:2368']) {
    assert.equal(normaliseSiteUrl(ip), null, ip)
  }
  // What Ghost answers is checked before it becomes a link or an <img>, and kept as sent.
  assert.equal(isHttpUrl('https://ghost6.inflozo.com/'), true)
  assert.equal(isHttpUrl('http://example.com/blog/'), true)
  for (const bad of ['javascript:alert(1)', 'ghost6.inflozo.com', '', null, undefined, 42, 'data:text/html,x']) {
    assert.equal(isHttpUrl(bad), false, String(bad))
  }
  // A port survives, because a self-hosted Ghost may carry one.
  assert.equal(normaliseSiteUrl('https://example.com:2368/'), 'https://example.com:2368')
  assert.equal(hostOf('https://ghost6.inflozo.com/'), 'ghost6.inflozo.com')
})

test('every code the wizard can answer with has a sentence, and none of them says “expired”', () => {
  const codes = Object.keys(CONNECT_MESSAGES) as MessageCode[]
  assert.ok(codes.length > 0, 'the message table is empty — this test would assert nothing')
  for (const code of codes) {
    const sentence = connectMessage(code, 'ghost6.inflozo.com')
    assert.ok(sentence.trim().length > 0, `${code} has no sentence`)
    // §37: `api_keys` has no expiry column, so "your key expired" is a failure that does not
    // exist and sends the customer looking for a setting Ghost has not got.
    assert.doesNotMatch(sentence, /expire/i, `${code} tells the user a key expired; keys never do`)
  }
  // The matrix's sentences, by value — the ones the owner reads on his own test.
  assert.equal(connectMessage('url_invalid'), "That doesn't look like a site address — try https://yoursite.com.")
  assert.equal(connectMessage('content_key_unknown'), "Ghost doesn't recognise this Content API key.")
  assert.equal(
    connectMessage('credential_malformed'),
    'An Admin API key looks like 65a3f…:9c2b41d8e0f… — an id, a colon, then a long secret.',
  )
  // Plain text under a field: the matrix's code spans are Markdown, not characters (review, 2026-09-08).
  for (const code of codes) assert.doesNotMatch(connectMessage(code, 'x'), /`/, `${code} carries a backtick`)
  assert.equal(
    connectMessage('ghost_unreachable', 'nonexistent.inflozo.com'),
    "We couldn't reach nonexistent.inflozo.com. Check the address — it's your Ghost site's own.",
  )
  assert.equal(
    connectMessage('ghost_redirected'),
    'Your site sent us somewhere else. Connect with the address your site actually uses.',
  )
  assert.equal(
    connectMessage('ghost_too_old', '4.48'),
    'Your site runs Ghost 4.48. Inflozo needs Ghost 5 or newer — please update Ghost, then connect.',
  )
  assert.equal(connectMessage('already_connected', 'ghost6.inflozo.com'), 'ghost6.inflozo.com is already connected.')
  assert.equal(
    connectMessage('credential_store_unavailable'),
    "We couldn't save your key just now. Nothing was connected — try again in a moment.",
  )
  assert.match(connectMessage('ghost_refused', '403'), /HTTP 403/)
  // The two standing sentences the frames carry.
  assert.match(HTTP_WARNING, /^Most Ghost sites use https:\/\//)
  // FR-C3's honesty rule names what the key reads AND what Inflozo writes, in one breath.
  assert.match(ADMIN_KEY_CONSENT, /members' email addresses/)
  assert.match(ADMIN_KEY_CONSENT, /only ever writes your theme and your routes file/)
})

test('the at-cap row is Appendix F.1’s sentence and nothing typed here', () => {
  // The one matrix row whose sentence is NOT in the table above, deliberately: it is derived from
  // `PLANS`, so a plan change moves the banner and the pill together.
  assert.equal(siteCapSentence('free'), `Free includes 1 site. Pro connects up to ${PLANS.pro.sites}.`)
  assert.ok(!Object.prototype.hasOwnProperty.call(CONNECT_MESSAGES, 'at_cap'),
    'at_cap must have no sentence here — a second copy could disagree with S11c’s pill')
  assert.equal(atSiteCap('free', PLANS.free.sites), true, 'Free at one site refuses the second')
  assert.equal(atSiteCap('pro', PLANS.free.sites), false, 'Pro at one site connects the second')
})

/* ───────── STORY 3.6 — MANAGE KEYS' WORDS, AND THE SAME TWO RULES OVER THEM. */

/** Every string `KEYS` holds, functions called with a placeholder — the shape `DISCONNECT`'s
    no-number assertion already uses, walked one level deeper because `KEYS` nests. */
function wordsOf(held: unknown): string[] {
  if (typeof held === 'string') return [held]
  if (typeof held === 'function') return [String((held as (x: string) => unknown)('x'))]
  if (Array.isArray(held)) return held.flatMap(wordsOf)
  if (held && typeof held === 'object') return Object.values(held).flatMap(wordsOf)
  return []
}

test('KEYS holds every word Manage keys shows, and names no number', () => {
  // The ⋯ row and the screen's own title are one object, so the owner's manual test reads the same
  // label in the menu and above the panel.
  assert.equal(KEYS.menu, 'Manage API keys')
  assert.equal(KEYS.title('orbitweekly.com'), 'API keys — orbitweekly.com')

  // PRESENT OR ABSENT, AND NEVER AN ERROR BADGE (the acceptance criterion, and B20's "Working" is
  // the departure this asserts): nothing checks on load, so no word here may claim a check passed.
  assert.equal(KEYS.absent, 'Not added')
  assert.notEqual(KEYS.present as string, 'Working')

  // Each credential says what it ENABLES, in one plain line — B20's whole argument: `settings:write`
  // means nothing to a founder and "uploads routes.yaml" means everything.
  assert.match(KEYS.admin.enables, /theme/i)
  assert.match(KEYS.content.enables, /posts/i)
  assert.match(KEYS.staff.enables, /routes\.yaml/)
  // D1b's disclosure, VERBATIM and unsoftened (A1, 2026-09-04). Deleting it would leave the screen
  // asking for a full-Administrator credential without saying so.
  assert.match(KEYS.staff.enables, /full-Administrator credential/)
  // NOTHING RETROACTIVE IS PROMISED: adding the token starts the safety net from that moment.
  assert.match(KEYS.staff.forward, /already been replaced/)

  // R-98: every control that starts work wears a present tense, and it must DIFFER from the
  // resting label or the control says nothing by changing.
  for (const [resting, busy] of [
    [KEYS.admin.save, KEYS.admin.busy],
    [KEYS.content.save, KEYS.content.busy],
    [KEYS.staff.add, KEYS.staff.addBusy],
    [KEYS.staff.remove, KEYS.staff.removeBusy],
    [KEYS.test.label, KEYS.test.busy],
  ] as [string, string][]) {
    assert.ok(busy.length > 0, `${resting} has no busy label`)
    assert.notEqual(busy, resting)
  }

  // THE URL ROW SAYS WHY THERE IS NO FIELD (A9 item 17, FR-C8), and the reveal's absence is said
  // to the customer rather than only in a comment (the departure from B20's eye).
  assert.match(KEYS.urlReason, /disconnecting and connecting again/)
  assert.match(KEYS.noReveal, /cannot read the rest back/)

  // COUNTS ARE DERIVED (standing rule 4) — the same assertion `DISCONNECT` carries, and for the
  // same reason: the one number this screen's copy needs is the orphan clock's, and it belongs to
  // `ORPHAN_SNAPSHOT_DAYS` rather than to a sentence. A DIGIT IS NOT THE ONLY WAY TO WRITE A
  // NUMBER, so the spelled-out words are refused too.
  const words = wordsOf(KEYS).join(' ')
  assert.ok(!/\d/.test(words), `KEYS names a number: ${words}`)
  const spelled = /\b(one|two|three|four|five|six|seven|eight|nine|ten|ninety)\b/i
  assert.ok(!spelled.test(words), `KEYS spells a number out: ${words}`)
})

test('FR-C8’s moved-domains hint names the orphan clock, and takes it as an argument', () => {
  assert.equal(ORPHAN_SNAPSHOT_DAYS, 90)
  const said = KEYS.movedDomains(ORPHAN_SNAPSHOT_DAYS)
  assert.match(said, /Moved domains\?/)
  assert.match(said, /90 days/)
  // …and the number is the CALLER's. `wordsOf` above calls it with 'x', which is what lets the
  // no-number assertion hold over an object whose one sentence has to name a figure.
  assert.doesNotMatch(KEYS.movedDomains('x'), /\d/)
})

test('the three Manage-keys codes are in the one table, and each lands under its own field', () => {
  for (const code of ['keys_other_site', 'token_malformed', 'keys_failed'] as MessageCode[]) {
    assert.ok(Object.prototype.hasOwnProperty.call(CONNECT_MESSAGES, code), `${code} has no sentence`)
    assert.ok(connectMessage(code).length > 0)
  }
  // FR-C8's refusal NAMES THE FIX, because "these are the wrong keys" without it leaves the
  // customer with a site they cannot connect and no idea what to do.
  assert.match(connectMessage('keys_other_site'), /disconnecting/)
  // "EXPIRED" APPEARS IN NONE OF THEM either — Ghost's `api_keys` has no expiry column (§37).
  for (const code of Object.keys(CONNECT_MESSAGES) as MessageCode[]) {
    assert.doesNotMatch(connectMessage(code, 'x'), /expired/i, `${code} tells the customer a key expired`)
  }

  // THE FIELD IS DERIVED FROM THE CODE AND NEVER READ OUT OF THE URL BESIDE IT, which is what
  // stops a hand-typed link putting a refusal under a field it has nothing to do with.
  assert.equal(keysFieldOf('keys_other_site'), 'admin_key')
  assert.equal(keysFieldOf('ghost_unknown_key'), 'admin_key')
  assert.equal(keysFieldOf('credential_malformed'), 'admin_key')
  assert.equal(keysFieldOf('content_key_unknown'), 'content_key')
  assert.equal(keysFieldOf('token_malformed'), 'staff_token')
  // THE THREE EMPTY-BOX CODES, one per row: each row posts only its own field, so the code names
  // the row that was pressed and the refusal must land under that box and no other (his finding 4).
  assert.equal(keysFieldOf('credential_empty'), 'admin_key')
  assert.equal(keysFieldOf('content_key_empty'), 'content_key')
  assert.equal(keysFieldOf('token_empty'), 'staff_token')
  // Everything else is the panel's banner, including a code the table does not name at all.
  assert.equal(keysFieldOf('keys_failed'), null)
  assert.equal(keysFieldOf('credential_store_unavailable'), null)
  assert.equal(keysFieldOf('not-a-code'), null)

  // AND THE FOUR "CHECK THE ADDRESS" CODES ARE THE BANNER'S, not the Admin field's. Their
  // sentences tell the customer to check or change the address, and this is the one screen whose
  // address is read-only text with no edit affordance at all (A9 item 17) — so answering them
  // under the key's field pointed at a fix the screen does not offer. It is also what the
  // wizard's own `FIELD_OF` has always done with them: two maps over one vocabulary that
  // disagreed on four codes (review, 2026-09-09).
  for (const code of ['ghost_unreachable', 'ghost_redirected', 'ghost_refused', 'ghost_bad_signature']) {
    assert.equal(keysFieldOf(code), null, `${code} answers under a field on a screen with no address`)
  }
})

test('every code Manage keys can answer with has a sentence of its own', () => {
  // THE SCREEN'S OWN CODE TABLE, DERIVED FROM THE ACTIONS rather than listed by hand: any code
  // `saveKeys`, `removeToken` or `testConnection` can redirect with must resolve to a sentence, or
  // the panel silently falls back to one written for a different press. `credential_missing` did
  // exactly that — `call()` throws it and **Test connection** rendered "We couldn't save that just
  // now. Nothing changed" at someone who pressed a read-only test (review, 2026-09-09).
  const source = readFileSync(ACTIONS, 'utf8')
  const codes = new Set([
    ...[...source.matchAll(/KEYS_REFUSED\([^,]+,\s*'([a-z_]+)'/g)].map((m) => m[1]),
    ...[...source.matchAll(/KEYS_TESTED\([^,]+,\s*'([a-z_]+)'/g)].map((m) => m[1]),
    // The two the chokepoint throws through those calls as `thrown.code`, which no regex can see.
    'credential_missing',
    'credential_store_unavailable',
    // …AND THE CODES THAT REACH `KEYS_REFUSED` THROUGH A VARIABLE, which the regexes above cannot
    // see either (review, 2026-09-10): `emptyKeyCode(formData)`'s three, the `token_malformed`
    // ternary, `config.code ?? 'ghost_refused'`, and what `fetchWithKey` answers as `config.code`.
    // Named here beside the regex so the list has one home; the assertion below is the same.
    'credential_empty',
    'content_key_empty',
    'token_empty',
    'token_malformed',
    'credential_malformed',
    'ghost_refused',
    'ghost_unknown_key',
    'ghost_unauthorized',
    'ghost_unreachable',
  ])
  assert.ok(codes.size > 0, 'no Manage-keys codes found — the regex has gone stale')
  // The named ones must still be IN the actions' source, or the list above has gone stale too.
  for (const code of ['credential_empty', 'content_key_empty', 'token_empty', 'token_malformed', 'ghost_refused']) {
    assert.ok(source.includes(`'${code}'`), `${code} is named here but no longer appears in sites/actions.ts`)
  }
  for (const code of codes) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(CONNECT_MESSAGES, code),
      `${code} is redirected with but has no sentence in CONNECT_MESSAGES`,
    )
  }
})

/* ───────── STORY 3.5 — DISCONNECT'S WORDS. */

test('DISCONNECT holds every word the confirm shows, and names no number', () => {
  // The menu item and the confirm's primary are ONE word — the owner's manual test reads the same
  // label in both places, so they are the same constant and not two that could drift.
  assert.equal(DISCONNECT.menu, 'Disconnect')
  assert.equal(DISCONNECT.title('orbitweekly.com'), 'Disconnect orbitweekly.com?')
  assert.equal(DISCONNECT.cancel, 'Cancel')
  // R-98: a submit control cannot exist without the present tense it wears while it works, and it
  // must differ from the resting label or the control says nothing by changing.
  // `as string` because `as const` makes both literal types and `tsc` refuses a comparison it can
  // already decide — which is the compiler agreeing with the assertion, not disagreeing with it.
  assert.ok(DISCONNECT.busy.length > 0)
  assert.notEqual(DISCONNECT.busy as string, DISCONNECT.menu as string)

  // THE OWNER'S QUESTION 2 RULING, IN THE ONLY PLACE A TEST CAN HOLD IT: the body says what
  // SURVIVES, because that is what a confirm with no typed field owes the reader.
  assert.match(DISCONNECT.body, /projects/)
  assert.match(DISCONNECT.body, /keys/)

  // COUNTS ARE DERIVED (standing rule 4). The cap's number belongs to `siteCapSentence`, the
  // 90-day orphan clock to Story 7.20 (DW-75) — nothing in this object may name either, or the
  // screen would carry a number whose source lives somewhere else.
  // A DIGIT IS NOT THE ONLY WAY TO WRITE A NUMBER. The body said "two Ghost keys" and passed this
  // assertion for a whole story, because `\d` cannot see a word (review, 2026-09-09). The small
  // words are the ones a sentence about keys, sites or days would actually reach for.
  const words = Object.values(DISCONNECT).map((v) => (typeof v === 'function' ? v('x') : v)).join(' ')
  assert.ok(!/\d/.test(words), `DISCONNECT names a number: ${words}`)
  const spelled = /\b(one|two|three|four|five|six|seven|eight|nine|ten|ninety)\b/i
  assert.ok(!spelled.test(words), `DISCONNECT spells a number out: ${words}`)
})

test('disconnect_failed is in the one codes-to-sentences table, and names no half', () => {
  assert.ok(Object.prototype.hasOwnProperty.call(CONNECT_MESSAGES, 'disconnect_failed'))
  const said = connectMessage('disconnect_failed')
  assert.match(said, /couldn’t|couldn't/)
  // Two states reach this sentence — `remove()` throwing (the keys are still there) and the stamp
  // failing after it (they are not) — so it may claim neither. Pressing again is idempotent.
  assert.ok(!/still connected/i.test(said), 'the sentence must not claim which half ran')
})

test('the card’s two labels', () => {
  assert.equal(ghostLabel('6.58.0'), 'Ghost 6.58')
  assert.equal(ghostLabel('5.130.6'), 'Ghost 5.130')
  assert.equal(ghostLabel(null), null)

  const now = new Date('2026-09-08T12:00:00Z')
  assert.equal(checkedLabel(now.toISOString(), now), 'Checked just now')
  assert.equal(checkedLabel('2026-09-08T11:58:00Z', now), 'Checked 2 minutes ago')
  assert.equal(checkedLabel('2026-09-08T09:00:00Z', now), 'Checked 3 hours ago')
  assert.equal(checkedLabel('2026-09-05T12:00:00Z', now), 'Checked 3 days ago')
  assert.equal(checkedLabel(null, now), 'Not checked yet')
  assert.equal(checkedLabel('not a date', now), 'Not checked yet')
})

test('?step= reads one value, an array, and anything else as the guide', () => {
  assert.equal(stepOf('keys'), 'keys')
  assert.equal(stepOf(['keys', 'integration']), 'keys')
  for (const value of [undefined, '', 'integration', 'nonsense', []] as (string | string[] | undefined)[]) {
    assert.equal(stepOf(value), 'integration', JSON.stringify(value))
  }
})

test('the browser check calls the Content API the way §38b executed it, and never throws', async (t) => {
  const calls: { url: string; version: string | null }[] = []
  const answer = (status: number) =>
    async (url: string | URL, init?: RequestInit) => {
      calls.push({
        url: String(url),
        version: new Headers(init?.headers).get('accept-version'),
      })
      return new Response(null, { status })
    }
  const real = globalThis.fetch
  t.after(() => { globalThis.fetch = real })

  globalThis.fetch = answer(200) as typeof fetch
  assert.equal(await checkContentKey('ghost6.inflozo.com', '8d41c0a97b'), 'ok')
  assert.equal(calls[0].url, 'https://ghost6.inflozo.com/ghost/api/content/settings/?key=8d41c0a97b')
  // Both majors answer 200 to `v5.0` and the preflight allows the header (§38b).
  assert.equal(calls[0].version, 'v5.0')

  // The matrix's "wrong Content key" row: 401 `Unknown Content API Key` stops the submit.
  globalThis.fetch = answer(401) as typeof fetch
  assert.equal(await checkContentKey('https://ghost6.inflozo.com', 'wrong'), 'unknown_key')

  // The matrix's plain-http row: the check is SKIPPED, not failed — the CSP admits no `http:`
  // and mixed content would block it anyway; Ghost's 403 answers the connect instead.
  calls.length = 0
  assert.equal(await checkContentKey('http://ghost5.inflozo.com', 'anything'), 'skipped_http')
  assert.equal(calls.length, 0, 'a plain-http address must not be fetched at all')

  // Anything else lets the submit through with the SERVER's answer: it never throws, and a
  // thrown fetch must not become a refusal the customer is asked to fix.
  globalThis.fetch = (async () => { throw new TypeError('network') }) as typeof fetch
  assert.equal(await checkContentKey('https://nonexistent.inflozo.com', 'k'), 'unreachable')
  globalThis.fetch = answer(500) as typeof fetch
  assert.equal(await checkContentKey('https://ghost6.inflozo.com', 'k'), 'unreachable')
  assert.equal(await checkContentKey('orbit weekly', 'k'), 'unreachable')
})

/*
 * TWO CONTRACTS IN THE ACTION THAT A GREEN GATE CANNOT SEE, in `server-wiring.test.ts`'s idiom —
 * both are read out of the file they govern rather than restated here. Neither can be reached by
 * `node --test` any other way: the action needs a session, a pooler and a real Ghost.
 */
test('config/ is the validator and site/ is read only after it has passed', () => {
  const source = readFileSync(ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const config = source.indexOf("path: 'config/'")
  const site = source.indexOf("path: 'site/'")
  assert.ok(config >= 0, `${ACTIONS}: nothing calls GET config/, which is the only validator (FR-C2)`)
  assert.ok(site >= 0, `${ACTIONS}: nothing reads GET site/, which is where the public url comes from`)
  // §38a: `GET /admin/site/` answers 200 with NO CREDENTIAL AT ALL on both majors, so a connect
  // that read it first would accept any key at all. The order is the control.
  assert.ok(config < site, `${ACTIONS}: site/ is called before config/ — site/ validates nothing (§38a)`)
  // And NO THIRD ADMIN PATH out of this file, ever (the spec's Ask First). DISTINCT paths, because
  // the contract is about which endpoints Inflozo reaches and not how many callers reach them:
  // Story 3.6's Manage keys validates a rotated key with the same `config/` + `site/` pair the
  // connect does, and Test connection presses `config/` a third time — three more call sites and
  // not one new endpoint, which is exactly what this is meant to allow (2026-09-09).
  const paths = [...new Set([...source.matchAll(/path: '([^']+)'/g)].map((m) => m[1]))].sort()
  assert.deepEqual(paths, ['config/', 'site/'], `${ACTIONS} calls Admin paths beyond config/ and site/`)
})

test('a store that fails undoes the row it just made, so no site is half-connected', () => {
  const source = readFileSync(ACTIONS, 'utf8').replace(/\/\*[^]*?\*\//g, ' ').replace(/\/\/[^\n]*/g, ' ')
  const from = source.indexOf('await store(')
  assert.ok(from >= 0, `${ACTIONS}: nothing stores the Admin key`)
  const compensation = source.slice(from, source.indexOf('revalidatePath', from))
  // A NEW row is deleted; a record Inflozo KEPT (FR-C6) is put back as it was, never deleted.
  assert.match(compensation, /\.delete\(\)/, `${ACTIONS}: a failed store leaves the row it just inserted behind`)
  assert.match(compensation, /disconnected_at: existing\.disconnected_at/,
    `${ACTIONS}: a failed store on a RE-ADOPTED record must restore it, not delete a kept record`)
  // "AS IT WAS" MEANS EVERY COLUMN the connect writes before `store()` runs, not the stamp alone
  // (review, 2026-09-08): the columns are read out of the two writes above the store, so a column
  // added to either without a line in the restore fails here.
  const before = source.slice(0, from)
  // The columns are the schema's server-asserted set plus the three the client may write; the
  // set is one list, and what the action writes must be exactly it (review 2, 2026-09-08).
  const COLUMNS = ['title', 'favicon_url', 'ghost_version', 'content_key', 'credentials_present', 'site_settings', 'settings_read_at', 'disconnected_at']
  const written = new Set(
    [...before.matchAll(new RegExp(`^\\s+(${COLUMNS.join('|')}):`, 'gm'))].map((m) => m[1]),
  )
  assert.deepEqual([...written].sort(), [...COLUMNS].sort(), `${ACTIONS}: the connect writes a different set of sites columns before store() than the restore knows`)
  for (const column of written) {
    assert.match(compensation, new RegExp(`${column}: existing\\.${column}`),
      `${ACTIONS}: a failed store on a RE-ADOPTED record must put \`${column}\` back`)
  }
  // And the undo's own failure is not silent: a row it could not remove says Connected with no key.
  assert.match(compensation, /undo failed/, `${ACTIONS}: a compensating write that fails must be logged`)
})

/* The owner's findings 5 and 7 (2026-09-08): the Sites search, and the empty screen's own words. */

test('the Sites search matches a title or an address, and survives a repeated ?q', () => {
  const rows = [
    { title: 'Orbit Weekly', url: 'https://orbitweekly.com', site_settings: { public_url: 'https://orbitweekly.com/' } },
    { title: null, url: 'https://ghost5.inflozo.com', site_settings: null },
    { title: 'Field Notes', url: 'https://fieldnotes.example', site_settings: { public_url: 'https://notes.example/' } },
  ]
  const shownFor = (q: string | string[] | undefined) => filterSites(rows, q).shown.map((r) => r.url)

  // No query is every row, in the order given — never a filter that quietly reorders the grid.
  assert.deepEqual(shownFor(undefined), rows.map((r) => r.url))
  assert.deepEqual(shownFor('   '), rows.map((r) => r.url))
  // BY TITLE, case-insensitively, on a substring.
  assert.deepEqual(shownFor('orbit'), ['https://orbitweekly.com'])
  assert.deepEqual(shownFor('FIELD'), ['https://fieldnotes.example'])
  // BY ADDRESS: the host as the card prints it, and the whole address as the browser shows it.
  assert.deepEqual(shownFor('ghost5'), ['https://ghost5.inflozo.com'])
  assert.deepEqual(shownFor('https://ghost5.inflozo.com'), ['https://ghost5.inflozo.com'])
  // A title-less row is findable by the host the card falls back to.
  assert.deepEqual(filterSites(rows, 'inflozo').shown.map((r) => r.title), [null])
  // THE PUBLIC url is searched too — on Ghost(Pro) it is the address the customer knows.
  assert.deepEqual(shownFor('notes.example'), ['https://fieldnotes.example'])
  assert.deepEqual(shownFor('nothing here'), [])
  // `?q=a&q=b` arrives as an ARRAY; the first is taken, as `filterProjects` does (schema of the
  // dashboard's own 500 on 2026-09-05).
  assert.equal(filterSites(rows, ['orbit', 'field']).query, 'orbit')
  assert.deepEqual(shownFor(['orbit', 'field']), ['https://orbitweekly.com'])
  // The query comes back TRIMMED, because it is what "No sites match …" prints.
  assert.equal(filterSites(rows, '  orbit  ').query, 'orbit')
  assert.match(SITES_EMPTY.noMatch('orbit'), /No sites match/)
})

test("the empty Sites screen says what the owner ruled, and borrows the handshake's own words", () => {
  // Question 5, option 3 (owner, 2026-09-08). The words are asserted here so a rewrite has to
  // pass his ruling, and so the deployed-site harness can read them instead of retyping them.
  assert.equal(SITES_EMPTY.title, "One handshake and you're in.")
  assert.equal(SITES_EMPTY.sub, 'Connect your Ghost site — it takes about a minute.')
  // They borrow the handshake's word and its "about a minute", so the two screens agree.
  assert.match(SITES_EMPTY.sub, /about a minute/)
})

test('the card tallies projects per site and pluralises the pill', () => {
  const counts = projectCounts([
    { linked_site_id: 'a' }, { linked_site_id: 'a' }, { linked_site_id: 'b' }, { linked_site_id: null },
  ])
  assert.deepEqual([...counts.entries()], [['a', 2], ['b', 1]])
  assert.equal(projectsLabel(counts.get('a') ?? 0), '2 projects')
  assert.equal(projectsLabel(counts.get('b') ?? 0), '1 project')
  assert.equal(projectsLabel(counts.get('c') ?? 0), '0 projects')
  // A malformed Content key is answered under its own field, with its own sentence.
  assert.match(connectMessage('content_key_malformed'), /Content API key/)
})
