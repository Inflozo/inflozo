#!/usr/bin/env python3
"""The connect wizard, driven through the real UI on the deployed site and read off the wire. Story 3.2.

    python3 tools/probe/run-verify-ghost-admin.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-ghost-admin.py           # the whole round trip, T1 and T3
    python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com

WHY IT EXISTS, AND WHY IT CHANGED. Story 3.1 drove a bearer-gated verify route, because the Admin
chokepoint had no product caller and R-82 wants the Vault write, the decryption and both real
Ghosts executed on the DEPLOYED function rather than on a laptop that cannot write to the live
database. Story 3.2 built that caller — the connect wizard — and DELETED the route (DW-48), so this
harness now drives the product itself: a throwaway account signs in, pastes T1's real keys into
S2b·2 on `app.inflozo.com`, and every claim is read back off PostgREST and off the transaction
pooler. Nothing here calls an endpoint that exists only for testing.

WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails. The steps are
named here in the order the run prints them (a docstring that names fewer than the run prints is a
list gone stale — the sibling harness's own note):

  keys           every key this run needs is in `tools/probe/.env`, BY NAME. Printed in both modes;
                 no value is ever printed
  vault-off-rest THE BOUND THE DESIGN RESTS ON, re-executed every run rather than remembered
                 (§21j): `GET /rest/v1/{decrypted_secrets,secrets,site_credentials}` with the
                 secret key -> 404 all three, `/rest/v1/sites` -> 200 as the positive control. A
                 leaked API key yields references, not keys
  then, in the browser, as one throwaway account on the Free plan:
  first-run      `/sites` with nothing connected IS S2b·1: the handshake headline, "1/2", three
                 numbered steps, the integration screenshot really served (not a 404 behind an
                 <img>), Back and "Done — next" — which is a LINK, so it is followed, not clicked
  keys-step      "Done — next" lands on S2b·2: the three fields the frame draws and NO fourth. The
                 Staff Access Token is not asked for here and the page is read to prove it
  http-warned    `http://…` typed into the API URL: the warning appears UNDER THE FIELD as it is
                 typed, before anything is submitted
  malformed      `abc` as the Admin key: the field says what a key looks like, and the wire shows
                 NO sites row — refused before Vault and before the network
  bogus-key      a key of the right shape whose `kid` Ghost never issued: `ghost_unknown_key`'s
                 sentence under the field (§37 — a regenerated key, never an "expired" one), no row
  content-wrong-key  the Content API key with one character changed: the browser's own check (§38b)
                 answers 401 and the submit NEVER LEAVES THE PAGE — counted, not assumed
  connect        T1's real keys: the browser lands on `/sites` showing the card, and the wire shows
                 the row with `ghost_version`, `content_key`, `site_settings.public_url` and
                 `credentials_present {content,admin} = true, staff = false`; the pooler shows a
                 `private.site_credentials` row and a live `vault.secrets` row behind its ref
  audit          `private.credential_audit` read through the pooler: an `admin_read ok` for
                 `config/` with a NULL `site_id` (there was no row yet) and then one for `site/`
                 carrying the new id; the bogus key's `admin_read error` at 401; every row stamped
                 with the action's own route; and no `detail` anywhere holding a `kid:secret`
  already-connected  the same address a second time: "… is already connected.", and still one row
  at-cap         T3's keys on a Free account that already has T1: Appendix F.1's own sentence, read
                 from the app's `siteCapSentence('free')` rather than typed here, and no second row
  axe-sites · axe-connect
                 axe-core at WCAG 2.1 AA over `/sites` with the card and over `/sites/connect`,
                 each at 1440 AND 390, and no horizontal scroll
  user-gone      `GET /auth/v1/admin/users/{id}` -> 404 after GoTrue deletes the throwaway user
  secret-gone    the site's ref is gone from the vault — the CASCADE path of DW-44's trigger:
                 auth.users -> sites -> site_credentials -> the trigger, under GoTrue's role
  no-secret-leak no response body this run received contains any key it typed
  users before == after, read from the Admin API before any sweep and after cleanup.

THREE OF STORY 3.1's LIVE PROOFS LEFT WITH THE ROUTE, and DW-54 records it rather than letting
anyone believe they still run: `write-denied` (no product caller makes an allowed write until Epic
7's deploy path), `rotated` (until Story 3.6's Manage keys re-pastes a key) and `staff-removed`
(until Epic 7 stores and removes the token). Each is a unit contract in
`apps/web/ghost-admin-rule.test.ts` and, for the trigger, the RLS gate, until the story that
re-drives it live.

THE POOLER IS READ FROM THE BROWSER HALF, read-only, through the app's own installed `postgres`
driver (3.4.9) — `vault` and `private` answer 404 over PostgREST by design (§21j), so there is no
other way to see them, and reading them beside the UI steps is what lets "the card says Connected"
and "there is a secret behind the ref" be one assertion.

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

ONE FIXTURE USER IS CREATED AND DELETED HERE, and its two sites go with it. The Admin-API user
count is read before and after — BEFORE any sweep of strays, so a step that created a user it
should not have is reported as the leak it is rather than tidied away — and a count that could not
be read FAILS the run, because it is the cleanup's control.

Playwright and axe-core are resolved from the machine, and the helpers that do it — `Admin`,
`load_env`, `playwright_dir`, `axe_path` and the fixture sweep — are IMPORTED from
`run-verify-passkeys.py` through the sibling `_sibling` pattern rather than copied, so a fix to
any lands on all of them (propagate, never localise).
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, time

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'
FIXTURE = r'^ghost-admin-harness-\d+@inflozo\.com$'

# The app's own files, READ rather than retyped: a harness carrying its own copy of a sentence or
# of the audit route proves nothing about the app Vercel serves.
WEB = os.path.join(HERE, '..', '..', 'apps', 'web')
CONNECT_ACTIONS = os.path.join(WEB, 'app', '(app)', 'app', '(authed)', 'sites', 'actions.ts')
CONNECT_RULE = os.path.join(WEB, 'lib', 'connect-rule.ts')
PLAN = os.path.join(WEB, 'lib', 'plan.ts')
PG_DIR = os.path.join(WEB, 'node_modules', 'postgres')


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
playwright_dir, axe_path = _passkeys.playwright_dir, _passkeys.axe_path
_deletion = _sibling('run-verify-account-deletion')
rest = _deletion.rest


def audit_route():
    """The `route` string the connect action stamps on every audit row, read out of the action."""
    found = re.search(r"const ROUTE = '([^']+)'", open(CONNECT_ACTIONS, encoding='utf-8').read())
    if not found:
        sys.exit('  FAIL  sites/actions.ts no longer declares its audit `route` name')
    return found.group(1)


def sentence(code):
    """One of `CONNECT_MESSAGES`'s sentences, read out of `lib/connect-rule.ts` and never retyped:
    a harness that carries its own copy proves nothing about the sentence the customer is shown.
    The table is TypeScript, so every string literal in the arrow's body is joined in order — the
    `+` the long ones are written with included — and the arrow's body ends at the next key OR at
    the next comment line, because two of the entries carry one (a comment holds apostrophes, and
    a body that ran on into one swallowed the entry after it).
    """
    source = open(CONNECT_RULE, encoding='utf-8').read()
    block = re.search(r'export const CONNECT_MESSAGES = \{(.*?)\n\} as const', source, re.S)
    if not block:
        sys.exit('  FAIL  CONNECT_MESSAGES could not be read out of lib/connect-rule.ts')
    body = re.search(rf"^  {code}: \([^)]*\) =>\s*(.+?)(?=\n  (?://|[a-z_]+:)|\Z)",
                     block.group(1), re.S | re.M)
    if not body:
        sys.exit(f'  FAIL  the connect message `{code}` is not in lib/connect-rule.ts')
    parts = re.findall(r"'((?:[^'\\]|\\.)*)'|\"((?:[^\"\\]|\\.)*)\"|`((?:[^`\\]|\\.)*)`",
                       body.group(1))
    text = ''.join(a or b or c for a, b, c in parts)
    return text.replace('${MIN_GHOST_MAJOR}', '5')


def cap_sentence():
    """`siteCapSentence('free')`, composed from `lib/plan.ts`'s own numbers — Appendix F.1 is the
    sole definition of the gating and this run must not restate either figure."""
    source = open(PLAN, encoding='utf-8').read()
    rows = re.search(r"export const PLANS[^=]*= \{(.*?)\n\}", source, re.S)
    if not rows:
        sys.exit('  FAIL  PLANS could not be read out of lib/plan.ts')
    free = re.search(r"free: \{[^}]*sites: (\d+)", rows.group(1))
    pro = re.search(r"pro: \{[^}]*sites: (\d+)", rows.group(1))
    if not (free and pro):
        sys.exit('  FAIL  the sites caps could not be read out of PLANS')
    n = int(free.group(1))
    return f"Free includes {n} site{'' if n == 1 else 's'}. Pro connects up to {pro.group(1)}."


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    privileged wire reads and the read-only pooler reads live here too, so the database can be
#    read BETWEEN two UI steps.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)
const postgres = require(process.env.PG_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const USER_ID = process.env.USER_ID
const CONFIRM = process.env.CONFIRM_URL
const ROUTE = process.env.AUDIT_ROUTE
const GHOSTS = JSON.parse(process.env.GHOSTS)
const BOGUS = process.env.BOGUS_KEY
const SAY = JSON.parse(process.env.SENTENCES)

/* `load`, NOT `networkidle`, AND A MINUTE TO DO IT IN — the sibling harness's own finding: the
   FIRST authed render on a cold deployment took longer than Playwright's 30s default, and Deploy
   always meets a fresh deployment. Every step asserts through a locator that waits on its own. */
const NAV_TIMEOUT = 60000

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

/* THE POOLER, READ-ONLY. `vault` and `private` answer 404 over PostgREST (§21j), so this is the
   only way to see either — the same connection shape the app itself opens (`server/ghost-admin/
   db.ts`): transaction pooler, one connection, no prepared statements. Nothing here writes. */
const sql = postgres(process.env.PG_URL, {
  max: 1, prepare: false, ssl: 'require', connect_timeout: 10, idle_timeout: 20,
})

/* PostgREST with the SERVICE ROLE — how the wire is read between two UI steps. It never stands in
   for a user: every claim about what a USER may do is made through that user's own session. */
const wire = async (path) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

// axe-core at WCAG 2.1 AA, at BOTH widths — the card goes one column at 390 and a violation that
// only exists there is still a violation. `evaluate` and not `addScriptTag`: the app serves a
// per-session CSP with no `unsafe-inline`, which blocks an injected <script>.
const AXE_SOURCE = process.env.AXE_PATH ? require('fs').readFileSync(process.env.AXE_PATH, 'utf8') : null
const axeAt = async (page, label) => {
  if (!AXE_SOURCE) return record(`axe-${label}`, 'axe-core not on this machine — not run')
  const found = []
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.evaluate(AXE_SOURCE)
    const r = await page.evaluate(() =>
      window.axe.run(document, {
        runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
      }))
    for (const v of r.violations) found.push(`${width}: ${v.id} x${v.nodes.length}`)
    const wide = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    if (wide) found.push(`${width}: horizontal scroll`)
  }
  await page.setViewportSize({ width: 1440, height: 900 })
  step(`axe-${label}`, found.length === 0,
       found.length === 0 ? 'zero violations at WCAG 2.1 AA, 1440 and 390; no horizontal scroll'
                          : found.join(', '))
}

/* A sentence with its `${…}` hole taken out: the harness matches the halves it can be sure of
   rather than rebuilding the app's own interpolation. */
const says = async (page, text) => {
  for (const part of text.split('%s').map((p) => p.trim()).filter(Boolean)) {
    if (!(await page.getByText(part, { exact: false }).first().isVisible().catch(() => false))) return false
  }
  return true
}

const fill = async (page, url, adminKey, contentKey) => {
  await page.fill('#s2b-api-url', url)
  await page.fill('#s2b-admin-key', adminKey)
  await page.fill('#s2b-content-key', contentKey)
}
const submit = (page) => page.locator('form button[type="submit"]').click()
const errorAt = (page, field) => page.locator(`#s2b-${field}-error`)

;(async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  context.setDefaultNavigationTimeout(NAV_TIMEOUT)
  const page = await context.newPage()

  // Every POST the page makes, and every body it received. The first is how "nothing left the
  // browser" is PROVED rather than assumed; the second is the no-secret-leak sweep's input.
  let posts = 0
  const bodies = []
  page.on('request', (r) => { if (r.method() === 'POST') posts += 1 })
  page.on('response', async (r) => {
    if (!r.url().startsWith(APP)) return
    const body = await r.text().catch(() => '')
    if (body) bodies.push(body)
  })
  const sent = async (fn) => { const before = posts; await fn(); return posts - before }

  const [T1, T3] = GHOSTS
  let t1SiteId = null
  let vaultRef = null

  try {
    await page.goto(CONFIRM, { waitUntil: 'load' })

    // ── `/sites` WITH NOTHING CONNECTED IS S2b·1 (EXPERIENCE.md:318).
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    const shot = page.locator('img[src="/connect/integration.png"]')
    // The picture is served, not a broken <img> behind an alt: the app host rewrites every path
    // it sees onto /app/…, so a public/ folder outside the proxy matcher would 404 in silence.
    const shotOk = await shot.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
    const numbered = await page.locator('ol li').count()
    const nextLink = page.locator('a[href="?step=keys"]', { hasText: 'Done — next' })
    step('first-run',
      (await page.locator('text=1/2').count()) > 0 && numbered === 3 && shotOk
      && (await nextLink.count()) === 1 && (await page.locator('text=Back').count()) > 0,
      `the handshake card with "1/2", ${numbered} numbered steps, the integration screenshot ` +
      `served = ${shotOk}, Back, and "Done — next" as a link`)

    await nextLink.click()
    await page.waitForSelector('#s2b-content-key')
    const fields = await page.locator('form input').count()
    const token = await page.locator('text=/staff access token/i').count()
    step('keys-step',
      fields === 3 && token === 0 && (await page.locator('text=Where do I find these?').count()) === 1,
      `S2b·2 shows ${fields} fields (API URL, Admin API key, Content API key), "Where do I find ` +
      `these?" below them, and mentions the Staff Access Token ${token} times (FR-C1: never here)`)

    // ── The `http://` warning, as the field is typed into and before anything is submitted.
    const typedHttp = await sent(async () => {
      await page.fill('#s2b-api-url', T3.url.replace('https://', 'http://'))
      await page.waitForSelector('#s2b-api-url-hint')
    })
    step('http-warned',
      (await page.locator('#s2b-api-url-hint').innerText()).includes('Most Ghost sites use https://')
      && typedHttp === 0,
      `the warning appears under the field as it is typed, and ${typedHttp} POSTs left the page`)

    // ── A malformed Admin key: refused before Vault AND before the network.
    await fill(page, T1.url, 'abc', T1.contentKey)
    await submit(page)
    await errorAt(page, 'admin-key').waitFor()
    const afterMalformed = (await wire(`/sites?user_id=eq.${USER_ID}&select=id`)).body || []
    step('malformed',
      await says(page, SAY.credential_malformed) && afterMalformed.length === 0,
      `the field says what a key looks like; the wire shows ${afterMalformed.length} sites rows`)

    // ── A key of the right shape whose `kid` Ghost never issued (§37).
    await fill(page, T1.url, BOGUS, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Ghost said no')
    const afterBogus = (await wire(`/sites?user_id=eq.${USER_ID}&select=id`)).body || []
    step('bogus-key',
      await says(page, SAY.ghost_unknown_key) && afterBogus.length === 0,
      `ghost_unknown_key's sentence is shown and the wire shows ${afterBogus.length} sites rows`)

    // ── The Content API key, checked IN THE BROWSER (§38b): a 401 stops the submit dead.
    await fill(page, T1.url, T1.adminKey, T1.contentKey.slice(0, -1) + (T1.contentKey.endsWith('a') ? 'b' : 'a'))
    const posted = await sent(async () => {
      await submit(page)
      await errorAt(page, 'content-key').waitFor()
    })
    step('content-wrong-key',
      await says(page, SAY.content_key_unknown) && posted === 0,
      `Ghost's 401 on the Content API is shown under the field, and ${posted} POSTs left the page ` +
      '— the server action was never called')

    // ── T1, for real.
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Connected')
    const rows = (await wire(`/sites?user_id=eq.${USER_ID}&select=*`)).body || []
    const row = rows[0] || {}
    t1SiteId = row.id || null
    const creds = t1SiteId
      ? await sql`select admin_key_vault_ref, staff_token_vault_ref from private.site_credentials where site_id = ${t1SiteId}`
      : []
    vaultRef = creds[0] ? creds[0].admin_key_vault_ref : null
    const secret = vaultRef ? await sql`select count(*)::int as n from vault.secrets where id = ${vaultRef}` : [{ n: 0 }]
    const present = row.credentials_present || {}
    const card = await page.locator('article', { hasText: 'Connected' }).innerText().catch(() => '')
    step('connect',
      rows.length === 1 && row.ghost_version === T1.version && Boolean(row.content_key)
      && (row.site_settings || {}).public_url && present.content === true && present.admin === true
      && present.staff === false && Boolean(vaultRef) && secret[0].n === 1
      && card.includes('Connected') && card.includes(`Ghost ${T1.version.split('.').slice(0, 2).join('.')}`)
      && page.url().replace(/\?.*$/, '') === `${APP}/sites`,
      `${rows.length} row, ghost_version ${row.ghost_version}, content_key stored = ${Boolean(row.content_key)}, ` +
      `site_settings.public_url ${(row.site_settings || {}).public_url}, credentials_present ` +
      `${JSON.stringify(present)}, a site_credentials row with a ref = ${Boolean(vaultRef)}, ` +
      `vault.secrets rows behind it = ${secret[0].n}; the browser is on ${page.url()} showing ` +
      `${JSON.stringify(card.replace(/\s+/g, ' ').trim())}`)

    // ── The audit trail, through the pooler.
    const audit = await sql`
      select action::text as action, route, site_id, outcome, detail
        from private.credential_audit
       where user_id = ${USER_ID}
       order by occurred_at, id
    `
    const reads = audit.filter((r) => r.action === 'admin_read')
    const beforeRow = reads.filter((r) => r.outcome === 'ok' && r.site_id === null)
    const withRow = reads.filter((r) => r.outcome === 'ok' && r.site_id === t1SiteId)
    const refused = reads.filter((r) => r.outcome === 'error' && String((r.detail || {}).status) === '401')
    const stamped = audit.every((r) => r.route === ROUTE)
    const objects = audit.every((r) => r.detail !== null && typeof r.detail === 'object')
    const leak = audit.filter((r) => /[0-9a-f]{16,}:[0-9a-f]{16,}/.test(JSON.stringify(r)))
    step('audit',
      beforeRow.length >= 1 && withRow.length >= 1 && refused.length >= 1
      && stamped && objects && leak.length === 0,
      `${audit.length} rows: ${beforeRow.length} admin_read ok with a NULL site_id (config/, before ` +
      `any row existed), ${withRow.length} with the new site_id (site/), ${refused.length} at 401 ` +
      `(the bogus key); every row stamped ${ROUTE} = ${stamped}; every detail a jsonb object = ` +
      `${objects}; rows that look like they hold a key = ${leak.length}`)

    // ── The same address again, from the S11a route this time.
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=is already connected')
    const stillOne = (await wire(`/sites?user_id=eq.${USER_ID}&select=id`)).body || []
    step('already-connected',
      await says(page, SAY.already_connected) && stillOne.length === 1,
      `the sentence is shown and the account still has ${stillOne.length} site`)

    // ── T3 on a Free account that already has T1: Appendix F.1's own sentence.
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await fill(page, T3.url, T3.adminKey, T3.contentKey)
    await submit(page)
    await page.waitForSelector(`text=${SAY.at_cap}`)
    const capped = (await wire(`/sites?user_id=eq.${USER_ID}&select=id`)).body || []
    step('at-cap',
      capped.length === 1,
      `the banner reads ${JSON.stringify(SAY.at_cap)} — derived from PLANS, not typed here — and ` +
      `the account still has ${capped.length} site`)

    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    await axeAt(page, 'sites')
    await page.goto(`${APP}/sites/connect`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    await axeAt(page, 'connect')

    // ── The cascade: GoTrue deletes the user, Postgres cascades to sites and to the credentials
    //    row, and DW-44's trigger takes the secret with it.
    await admin(`/admin/users/${USER_ID}`, { method: 'DELETE' })
    const gone = await admin(`/admin/users/${USER_ID}`)
    step('user-gone', gone.status === 404, `GET /admin/users/{id} -> HTTP ${gone.status}`)

    const left = vaultRef ? await sql`select count(*)::int as n from vault.secrets where id = ${vaultRef}` : [{ n: 0 }]
    step('secret-gone', Boolean(vaultRef) && left[0].n === 0,
      `the vault after the account went: ${left[0].n} row(s) behind the site's ref`)

    const typed = [T1.adminKey, T1.contentKey, T3.adminKey, T3.contentKey, BOGUS]
    const leaked = typed.filter((k) => bodies.some((b) => b.includes(k)))
    step('no-secret-leak', leaked.length === 0,
      `${bodies.length} response bodies scanned for the ${typed.length} keys this run typed; ` +
      `${leaked.length === 0 ? 'none appeared' : 'A KEY CAME BACK IN A RESPONSE'}`)
  } catch (error) {
    step('browser', false, `${error && error.message ? error.message : error}`)
  } finally {
    await sql.end({ timeout: 5 }).catch(() => {})
    await browser.close()
    process.stdout.write('\n@@RESULT@@' + JSON.stringify(steps) + '\n')
  }
})()
'''


def run_browser(cfg):
    pw = playwright_dir()
    if not pw:
        print('  FAIL  playwright is not on this machine. Set PLAYWRIGHT_DIR to a playwright')
        print('        package directory, or install one; see memory `headless-browser-tooling`.')
        return [{'name': 'browser', 'ok': False, 'detail': 'playwright not resolvable'}]
    if not os.path.isdir(PG_DIR):
        return [{'name': 'browser', 'ok': False,
                 'detail': f'the postgres driver is not at {os.path.relpath(PG_DIR)}; run pnpm install'}]

    with tempfile.TemporaryDirectory() as work:
        script = os.path.join(work, 'connect-wizard.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, PG_DIR=os.path.abspath(PG_DIR),
                     AXE_PATH=axe_path() or '', **cfg)
        try:
            proc = subprocess.run(['node', script], env=child, capture_output=True, text=True, timeout=1200)
        except subprocess.TimeoutExpired:
            return [{'name': 'browser', 'ok': False, 'detail': 'node did not finish inside 1200s'}]
        except FileNotFoundError:
            return [{'name': 'browser', 'ok': False, 'detail': 'node is not on PATH; Playwright is Node'}]
    for line in proc.stdout.splitlines():
        if line.startswith('@@RESULT@@'):
            return json.loads(line[len('@@RESULT@@'):])
    print(proc.stdout[-2000:])
    print(proc.stderr[-2000:], file=sys.stderr)
    return [{'name': 'browser', 'ok': False, 'detail': f'node exited {proc.returncode} with no result'}]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--check', action='store_true',
                    help='the plumbing alone: every key present by name, playwright, axe and the '
                         'postgres driver resolvable, and §21j re-executed over PostgREST. No '
                         'browser and no user, so it runs before the story is deployed.')
    ap.add_argument('--url', default=APP,
                    help='where the app lives. app.inflozo.com by default; a Review run may point '
                         'this at a deployment URL.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_DB_POOLER_URL',
              'GHOST6_URL', 'GHOST6_ADMIN_API_KEY', 'GHOST6_CONTENT_API_KEY', 'GHOST6_VERSION',
              'GHOST5_URL', 'GHOST5_ADMIN_API_KEY', 'GHOST5_CONTENT_API_KEY', 'GHOST5_VERSION']
    missing = [k for k in needed if not env.get(k)]
    print(f'  {"PASS" if not missing else "FAIL"}  keys: present in tools/probe/.env by name: '
          f'{", ".join(k for k in needed if env.get(k))}'
          + (f'; MISSING: {", ".join(missing)}' if missing else ''))
    if missing:
        print('  RESULT: FAILED')
        return 1

    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']
    failed = False

    # ── §21j, THE BOUND THE DESIGN RESTS ON, re-executed every run rather than remembered.
    off_api = {}
    for table in ('decrypted_secrets', 'secrets', 'site_credentials'):
        st, _ = rest(sb, secret, 'GET', f'/{table}?limit=1')
        off_api[table] = st
    st_sites, _ = rest(sb, secret, 'GET', '/sites?limit=1')
    ok = all(v == 404 for v in off_api.values()) and st_sites == 200
    failed = failed or not ok
    print(f'  {"PASS" if ok else "FAIL"}  vault-off-rest: '
          f'GET /rest/v1/{{decrypted_secrets,secrets,site_credentials}} -> {json.dumps(off_api)}; '
          f'the positive control /rest/v1/sites -> {st_sites}')

    if args.check:
        pw, axe = playwright_dir(), axe_path()
        print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
        print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
        print(f'  postgres driver: {"resolved" if os.path.isdir(PG_DIR) else "NOT FOUND"} '
              f'({os.path.relpath(PG_DIR)})')
        print(f'  the audit route the app stamps: {audit_route()}')
        print(f'  the cap sentence, composed from PLANS: {cap_sentence()!r}')
        print('  --check: the plumbing alone — no browser, no user, nothing connected')
        print('  RESULT: ' + ('FAILED' if failed or not pw or not axe or not os.path.isdir(PG_DIR)
                              else 'all steps passed'))
        return 1 if (failed or not pw or not axe or not os.path.isdir(PG_DIR)) else 0

    admin = Admin(sb, secret)
    stamp = int(time.time())
    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale ghost-admin-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')

    user_id = None
    try:
        status, user = admin.call('POST', '/admin/users',
                                  {'email': f'ghost-admin-harness-{stamp}@inflozo.com', 'email_confirm': True})
        if status not in (200, 201) or not user.get('id'):
            print(f'  FAIL  could not create the fixture user: HTTP {status}')
            return 1
        user_id = user['id']
        print('  fixture user created (Free plan, so T3 after T1 is the cap proof)')

        status, link = admin.call('POST', '/admin/generate_link',
                                  {'type': 'magiclink', 'email': f'ghost-admin-harness-{stamp}@inflozo.com'})
        if status != 200 or not link.get('hashed_token'):
            print(f"  FAIL  generate_link (the fixture's sign-in link) answered HTTP {status}")
            return 1

        # A `kid` of the right shape that Ghost has never issued (§37: 401 Unknown Admin API Key).
        bogus = '0' * 24 + ':' + 'ab' * 32
        ghosts = [
            {'label': 'T1', 'url': env['GHOST6_URL'].rstrip('/'), 'adminKey': env['GHOST6_ADMIN_API_KEY'],
             'contentKey': env['GHOST6_CONTENT_API_KEY'], 'version': env['GHOST6_VERSION']},
            {'label': 'T3', 'url': env['GHOST5_URL'].rstrip('/'), 'adminKey': env['GHOST5_ADMIN_API_KEY'],
             'contentKey': env['GHOST5_CONTENT_API_KEY'], 'version': env['GHOST5_VERSION']},
        ]
        # `%s` marks the app's own `${…}` hole, so the browser half matches the halves around it
        # rather than rebuilding the interpolation.
        says = {
            'credential_malformed': sentence('credential_malformed'),
            'ghost_unknown_key': sentence('ghost_unknown_key'),
            'content_key_unknown': sentence('content_key_unknown'),
            'already_connected': '%s' + sentence('already_connected').replace('${host}', ''),
            'at_cap': cap_sentence(),
        }
        steps = run_browser({
            'APP_URL': args.url.rstrip('/'),
            'SB_URL': sb,
            'SB_SECRET': secret,
            'PG_URL': env['SUPABASE_DB_POOLER_URL'],
            'USER_ID': user_id,
            'CONFIRM_URL': f'{args.url.rstrip("/")}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink',
            'AUDIT_ROUTE': audit_route(),
            'GHOSTS': json.dumps(ghosts),
            'BOGUS_KEY': bogus,
            'SENTENCES': json.dumps(says),
        })
        for s in steps:
            mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
            print(f'  {mark:6} {s["name"]}: {s["detail"]}')
            if s['ok'] is False:
                failed = True
    finally:
        if user_id:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        # The count is compared BEFORE any sweep of strays, so a user a step created by mistake is
        # reported as the leak it is rather than tidied away (the sibling harness's own note).
        after = admin.user_count()
        print(f'  fixture user deleted; users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray ghost-admin-harness-* user(s) existed after cleanup and were swept.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
