#!/usr/bin/env python3
"""The connect wizard, driven through the real UI on the deployed site and read off the wire. Story 3.2.

    python3 tools/probe/run-verify-ghost-admin.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-ghost-admin.py           # the whole round trip, T1 and T3
    python3 tools/probe/run-verify-ghost-admin.py --url https://app.inflozo.com
    python3 tools/probe/run-verify-ghost-admin.py --shots /tmp/shots   # + screenshots at 1440/834/390

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
  then, in the browser, as one throwaway account that starts on the Free plan:
  first-run      `/sites` with nothing connected is an EMPTY SCREEN — the owner's finding 7: his
                 own title and subtitle (read from the app, not retyped), a drawing, and TWO
                 "Connect site" buttons, the bar's and the centred one. No handshake and no key
                 field is on this route any more
  sites-bar      THE TOP BAR IS THE SHELL'S, like Projects' (his finding 5, amended): 64px with a
                 1px rule, the field placeholdered "Search sites…" — the frame's own (S11a :52) —
                 "Connect site" as its only other control, and NO BELL anywhere (Story 13.4's,
                 ruled out of this story at Question 4)
  axe-empty      axe over the empty screen, at 1440 and 390
  same-size      the empty screen's own button opens S11b, and the sheet's box is THE SAME at both
                 steps, at 1440 and again at 390. Measured before the fix: 520×665.7 then 520×608.5, a 57px shrink that swept
                 the sheet's top edge 28.6px down and uncovered the card behind it — his findings
                 1 and 2, which were one cause
  find-link      "Where do I find these?" is an `<a href="?step=integration">` with no border and no
                 chevron, above the fields and on the right (his finding 3 — a departure from the
                 frame, which draws a bordered box that reads as a dropdown)
  handshake      `/sites/connect`, where the "Connect site" LINK goes with JavaScript off, IS
                 S2b·1: "1/2", three numbered steps, the integration screenshot really served (not
                 a 404 behind an <img>), Back — an `<a href="/sites">` — and "Done — next" — a
                 LINK, so it is followed
  keys-step      "Done — next" lands on S2b·2: the three fields the frame draws, all three
                 `required`, and NO fourth. The Staff Access Token is not asked for here and the
                 page is read to prove it; and the page card is ONE SIZE at both steps (it was
                 480×694.7 then 560×661 before the fix)
  http-warned    `http://…` typed into the API URL: the app's own HTTP_WARNING appears UNDER THE
                 FIELD as it is typed, before anything is submitted
  js-off         the keys form is PROGRESSIVELY ENHANCED — `method=post`, an `action` attribute that
                 posts to the page, and React 19's encoded `$ACTION_*` hidden fields — so a scripts-off
                 browser submits it natively to the server action. (Whether the authed shell paints
                 it visibly without JS is DW-56, a shell question, not this story's.)
  http-connect   a plain-http address SUBMITTED after the warning: the browser skips its check, the
                 server's own call carries the key, the deployed function receives a 301 (read off the
                 audit) and answers `ghost_redirected`, and NO site connects
  malformed      `abc` as the Admin key: the field says what a key looks like, the wire shows NO
                 sites row — refused before Vault and before the network — and the other two
                 fields KEEP what was typed (React resets a form after its action; the values
                 are state)
  not-a-url      `orbit weekly` as the address: `url_invalid`'s sentence UNDER THE URL FIELD, no
                 row, and the audit shows no Ghost call was made for it (the I/O matrix's "Not a
                 URL" row, on the deployed site)
  unreachable    `https://nonexistent.inflozo.com`: the deployed function's own fetch fails and
                 `ghost_unreachable`'s sentence names the host, no row (the matrix's "Unreachable
                 host" row)
  bogus-key      a key of the right shape whose `kid` Ghost never issued: `ghost_unknown_key`'s
                 sentence under the field (§37 — a regenerated key, never an "expired" one), no row
  content-wrong-key  the Content API key with one character changed: the browser's own check (§38b)
                 answers 401 and the submit NEVER LEAVES THE PAGE — counted, not assumed
  connect        T1's real keys, its address typed as a BARE HOST (the matrix's "Bare host typed"
                 row — the row stores the https origin): the browser lands on `/sites` showing the card, whose title and
                 address are what `GET /admin/site/` answers with no key (§38a), the address a
                 link to the PUBLIC url, "Checked just now" stamped by that read; the wire shows
                 the row with `ghost_version`, `content_key`, `site_settings.public_url` and
                 `credentials_present {content,admin} = true, staff = false`; the pooler shows a
                 `private.site_credentials` row and a live `vault.secrets` row behind its ref
  card           the card the owner finalised (his findings 4 and 6), read off the rendered boxes:
                 the address carries the new-tab glyph, and "Connected" has left the pills' line to
                 sit just above "Checked …" and closer to it than to the pills
  dialog         S11a's "Connect site" is a LINK to /sites/connect that JavaScript turns into S11b:
                 the sheet opens with its title pair and the handshake, Escape closes it, and no
                 POST left the page (Cancel, Escape and the backdrop all send nothing)
  sheet-submit   "Done — next" INSIDE the sheet shows the three fields with the URL unchanged; the
                 same address submitted from the sheet is refused inside the still-open sheet
                 ("… is already connected."), and the account still has one site
  sheet-reopen   a reopened sheet is a FRESH one: at the handshake, no fields, no sentence from the
                 last attempt
  at-cap         T3's keys on a Free account that already has T1: Appendix F.1's own sentence,
                 evaluated from the app's `siteCapSentence('free')` rather than typed here, and no
                 second row
  re-adopt       FR-C6: the service role marks T1's record disconnected (nothing in the product
                 writes that until Story 3.5), `/sites` is the EMPTY SCREEN again, its button opens
                 the sheet, and reconnecting
                 RE-ADOPTS the record — same id, `disconnected_at` cleared, a NEW vault ref, the
                 OLD secret gone (DW-44's replace path, live — the `rotated` proof DW-54 deferred)
  pro-connect-t3 the service role flips the entitlement row to `pro_active` (no billing exists
                 until Epic 12), and T3 is connected THROUGH THE SHEET with a trailing-slash
                 address: the row stores the typed origin without it, the public url as Ghost
                 sends it, `ghost_version` from config/, a secret behind its ref; the sheet CLOSES
                 on success and the second card shows "Ghost 5.x"
  search         the shell's field on Sites, on the deployed page: the title of one site leaves one
                 card, the ADDRESS of the other leaves one, and a word that matches neither leaves
                 none with the app's own "No sites match …"
  audit          `private.credential_audit` read through the pooler: one `admin_read ok` for
                 `config/` with a NULL `site_id` per connect and one for `site/` carrying the id;
                 the bogus key's `admin_read error` at 401 and the plain-http one at 301 — BOTH
                 asserted by status; every
                 row stamped with the action's own route; and no `detail` anywhere holding a
                 `kid:secret`
  axe-sites · axe-sheet · axe-connect · axe-keys
                 axe-core at WCAG 2.1 AA over `/sites` with the cards, the open sheet,
                 `/sites/connect` and `/sites/connect?step=keys`, each at 1440 AND 390, and no
                 horizontal scroll (`axe-empty` above covers the empty screen)
  user-gone      `GET /auth/v1/admin/users/{id}` -> 404 after GoTrue deletes the throwaway user
  secret-gone    both sites' refs are gone from the vault — the CASCADE path of DW-44's trigger:
                 auth.users -> sites -> site_credentials -> the trigger, under GoTrue's role
  no-secret-leak no response body this run received contains any key it typed
  users before == after, read from the Admin API before any sweep and after cleanup.

THREE OF STORY 3.1's LIVE PROOFS LEFT WITH THE ROUTE, and DW-54 records it rather than letting
anyone believe they still run: `write-denied` (no product caller makes an allowed write until Epic
7's deploy path), `rotated` — which `re-adopt` above now drives live through the product, one story
early — and `staff-removed` (until Epic 7 stores and removes the token). The other two are unit
contracts in `apps/web/ghost-admin-rule.test.ts` and, for the trigger, the RLS gate, until the story
that re-drives each live. The decrypt path (`call()` → `vault.decrypted_secrets` → a signed call)
has no product caller either until Story 3.3's settings read; DW-54 names it too.

THE POOLER IS READ FROM THE BROWSER HALF, read-only, through the app's own installed `postgres`
driver (3.4.9) — `vault` and `private` answer 404 over PostgREST by design (§21j), so there is no
other way to see them, and reading them beside the UI steps is what lets "the card says Connected"
and "there is a secret behind the ref" be one assertion.

--shots DIR saves each surface at 1440, 834 and 390 (`s11-empty`, `s2b1`, `s2b2`, `s11a`, `s11b`) —
the frame comparison the spec's Review owes, re-takeable at Deploy — and asserts nothing extra. The
empty screen has no frame: it is the owner's finding 7, extrapolated from S3b (R-74).

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

ONE FIXTURE USER IS CREATED AND DELETED HERE, and its two sites go with it. Two states no UI can
yet produce are made on it by the service role and nothing else: a DISCONNECTED record (Story 3.5's
Disconnect does not exist) and a PRO entitlement (Epic 12's billing does not). The Admin-API user
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


def app_text():
    """The app's own sentences, EVALUATED from `lib/connect-rule.ts` and `lib/plan.ts` rather than
    parsed out of them or retyped here: Node strips the types (`--experimental-strip-types` is a
    no-op on 24 and the switch on 22.6+), both modules import nothing, and a wording change in
    either moves this run with it. `%s` stands where the app puts the host."""
    script = (
        f"import {{ connectMessage, HTTP_WARNING, SITES_EMPTY }} from 'file://{os.path.abspath(CONNECT_RULE)}';"
        f"import {{ siteCapSentence }} from 'file://{os.path.abspath(PLAN)}';"
        "console.log(JSON.stringify({"
        " credential_malformed: connectMessage('credential_malformed'),"
        " ghost_unknown_key: connectMessage('ghost_unknown_key'),"
        " content_key_unknown: connectMessage('content_key_unknown'),"
        " ghost_redirected: connectMessage('ghost_redirected'),"
        " url_invalid: connectMessage('url_invalid'),"
        " ghost_unreachable: connectMessage('ghost_unreachable', '%s'),"
        " already_connected: connectMessage('already_connected', '%s'),"
        " http_warning: HTTP_WARNING,"
        " empty_title: SITES_EMPTY.title,"
        " empty_sub: SITES_EMPTY.sub,"
        " no_match: SITES_EMPTY.noMatch('zzznomatch'),"
        " at_cap: siteCapSentence('free') }))")
    try:
        proc = subprocess.run(['node', '--experimental-strip-types', '--input-type=module', '-e', script],
                              capture_output=True, text=True, timeout=60)
    except FileNotFoundError:
        sys.exit('  FAIL  node is not on PATH; the sentences are read through it')
    lines = [l for l in proc.stdout.splitlines() if l.startswith('{')]
    if proc.returncode != 0 or not lines:
        sys.exit('  FAIL  the app\'s sentences could not be evaluated from lib/connect-rule.ts and lib/plan.ts: '
                 + proc.stderr.strip()[-400:])
    return json.loads(lines[-1])


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
const secretsBehind = async (ref) =>
  ref ? (await sql`select count(*)::int as n from vault.secrets where id = ${ref}`)[0].n : -1
const refOf = async (siteId) => {
  const rows = await sql`select admin_key_vault_ref from private.site_credentials where site_id = ${siteId}`
  return rows[0] ? rows[0].admin_key_vault_ref : null
}

/* PostgREST with the SERVICE ROLE — how the wire is read between two UI steps, and how the two
   fixture states no UI can yet produce are made: a DISCONNECTED record (Story 3.5's Disconnect does
   not exist) and a PRO entitlement (Epic 12's billing does not). It never stands in for a user:
   every claim about what a USER may do is made through that user's own session. */
const wire = async (path) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
const patch = async (path, body) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    method: 'PATCH',
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify(body),
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}
const rowsOf = async (select = 'id') => (await wire(`/sites?user_id=eq.${USER_ID}&select=${select}`)).body || []
/* The fixture's audit rows, by id: a step that must make NO Ghost call proves it by the count. */
const readAudit = () => sql`select id from private.credential_audit where user_id = ${USER_ID}`

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/* What `GET /admin/site/` answers WITH NO KEY (§38a) — the title and public url the card must show. */
const publicSite = async (ghost) =>
  fetch(`${ghost.url}/ghost/api/admin/site/`).then((r) => r.json()).then((j) => j.site || {}).catch(() => ({}))

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

/* A sentence with its `%s` hole taken out: the harness matches the halves it can be sure of
   rather than rebuilding the app's own interpolation. `within` narrows it to one region. */
const says = async (page, text, within = page) => {
  for (const part of text.split('%s').map((p) => p.trim()).filter(Boolean)) {
    if (!(await within.getByText(part, { exact: false }).first().isVisible().catch(() => false))) return false
  }
  return true
}

/* THE WIZARD'S OWN FORM, and every locator below is scoped to it. The shell around the page carries
   two more forms (Sign out, desktop and mobile) with their own submit buttons, and a Next form whose
   `action` is a server action carries HIDDEN inputs of its own — executed on the deployed site,
   2026-09-08: `form input` counted 9 and `form button[type="submit"]` matched three, and the run
   failed on the harness rather than on the product. */
const WIZARD = 'form:has(#s2b-api-url)'

const fill = async (page, url, adminKey, contentKey) => {
  await page.fill('#s2b-api-url', url)
  await page.fill('#s2b-admin-key', adminKey)
  await page.fill('#s2b-content-key', contentKey)
}
const submit = (page) => page.locator(`${WIZARD} button[type="submit"]`).click()
const errorAt = (page, field) => page.locator(`#s2b-${field}-error`)
const sheet = (page) => page.locator('dialog[open]')
/* TWO of these are drawn on the empty screen — the top bar's and the centred one, as Projects
   draws both (UX-DR6) — and one of the two is hidden behind the `tablet:` seam on the list. So
   the locator is the VISIBLE ones: `.count()` is then "how many can be pressed here". */
const opener = (page) => page.locator('a[href="/sites/connect"]:visible', { hasText: 'Connect site' })
const bar = (page) => page.locator('div:has(> form[role="search"])').first()
const boxOf = async (locator) => (await locator.boundingBox()) || { x: -1, y: -1, width: -1, height: -1 }
const same = (a, b) => Math.abs(a - b) < 0.5

/* `--shots`: each surface at the three widths the spec names, for the frame comparison. Assertion-free. */
const SHOTS = process.env.SHOTS_DIR || ''
const shoot = async (page, name) => {
  if (!SHOTS) return
  for (const width of [1440, 834, 390]) {
    await page.setViewportSize({ width, height: 900 })
    await page.screenshot({ path: `${SHOTS}/${name}-${width}.png`, fullPage: true })
  }
  await page.setViewportSize({ width: 1440, height: 900 })
}

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
  const short = (v) => v.split('.').slice(0, 2).join('.')
  let t1SiteId = null
  let t3SiteId = null
  const refs = []

  try {
    await page.goto(CONFIRM, { waitUntil: 'load' })

    // ── `/sites` WITH NOTHING CONNECTED IS AN EMPTY SCREEN — the owner's finding 7 (2026-09-08),
    //    and the words and the drawing are his rulings at Questions 5 and 6. It used to BE the
    //    handshake (EXPERIENCE.md:318, amended with this story); the handshake is now behind the
    //    button, in the sheet, and at `/sites/connect` for a browser with no JavaScript.
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.getByText(SAY.empty_title).waitFor()
    const drawing = await page.locator('main svg[aria-hidden="true"]').count()
    const openers = await opener(page).count()
    // THE SHEET IS RENDERED ON THIS PAGE — closed — because its button is what opens it, so the
    // key fields are PRESENT and hidden rather than absent. Visibility is the question the owner
    // asked ("show an empty screen"), and it is the one asked here (run 1 of the Fix failed on a
    // `.count() === 0` that was the harness's mistake, not the product's — the same lesson as
    // Review's run 1).
    const fieldsShown = await page.locator('#s2b-api-url').isVisible()
    const handshakeShown = await page.getByText('First, a quick handshake.').isVisible().catch(() => false)
    step('first-run',
      await says(page, SAY.empty_sub) && drawing >= 1 && openers === 2
      && handshakeShown === false && fieldsShown === false,
      `the empty screen: ${JSON.stringify(SAY.empty_title)} over ${JSON.stringify(SAY.empty_sub)}, a drawing ` +
      `(${drawing} aria-hidden svg), ${openers} "Connect site" buttons (the bar's and the centred one, as ` +
      `Projects draws both), and NOTHING of the handshake on screen: its headline visible = ` +
      `${handshakeShown}, the key fields visible = ${fieldsShown} (the closed sheet holds them)`)

    // ── THE TOP BAR IS THE SHELL'S, as Projects' is (his finding 5, amended): the field on the
    //    left, "Connect site" on the right, the frame's 1px rule under both — and NO BELL, which
    //    is Story 13.4's and which he ruled out of this story at Question 4.
    const field = page.locator('input[name="q"]:visible')
    const placeholder = await field.getAttribute('placeholder').catch(() => null)
    const rule = await bar(page).evaluate((el) => {
      const s = getComputedStyle(el)
      return { border: s.borderBottomWidth, height: el.getBoundingClientRect().height }
    }).catch(() => ({ border: 'none', height: 0 }))
    const inBar = await bar(page).locator('a, button').count()
    const bells = await page.locator('[aria-label*="otification" i], [aria-label*="ell" i]').count()
    step('sites-bar',
      placeholder === 'Search sites…' && rule.border === '1px' && Math.round(rule.height) === 64
      && inBar === 1 && bells === 0,
      `a ${Math.round(rule.height)}px bar with a ${rule.border} rule under it, the field placeholder ` +
      `${JSON.stringify(placeholder)} — the frame's own (S11a :52) — ${inBar} control beside it ` +
      `("Connect site"), and ${bells} bells anywhere on the page (Story 13.4's, ruled out at Question 4)`)
    await axeAt(page, 'empty')
    await shoot(page, 's11-empty')

    // ── THE EMPTY SCREEN'S BUTTON OPENS THE SHEET (the last line of his finding 7), and the sheet
    //    IS ONE SIZE AT BOTH STEPS (his findings 1 and 2). Measured on the deployed site before
    //    the fix: 520×665.7 at step 1, 520×608.5 at step 2 — it shrank 57px and its top edge swept
    //    28.6px down the page, which is the card he saw appear behind it. Both panes now share one
    //    grid cell, so the box cannot move.
    await opener(page).last().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    const shot = page.locator('dialog[open] img[src="/connect/integration.png"]')
    // The picture is served, not a broken <img> behind an alt: the app host rewrites every path
    // it sees onto /app/…, so a public/ folder outside the proxy matcher would 404 in silence.
    const shotOk = await shot.evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
    const box1 = await boxOf(sheet(page))
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    const box2 = await boxOf(sheet(page))
    // …and at 390, where the sheet is the viewport's width and the owner's step 12 looks
    // (review 2, 2026-09-08): back to step 1, measure, forward, measure.
    await page.setViewportSize({ width: 390, height: 844 })
    await sheet(page).locator('a[href="?step=integration"]', { hasText: 'Back' }).click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]:visible')
    const narrow1 = await boxOf(sheet(page))
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    const narrow2 = await boxOf(sheet(page))
    await page.setViewportSize({ width: 1440, height: 900 })
    const sameBox = (a, b) => same(a.width, b.width) && same(a.height, b.height) && same(a.x, b.x) && same(a.y, b.y)
    step('same-size',
      shotOk && sameBox(box1, box2) && sameBox(narrow1, narrow2),
      `the empty screen's own button opened the sheet with the integration screenshot served = ${shotOk}; ` +
      `the box is ${box1.width}×${box1.height} at (${box1.x}, ${box1.y}) at step 1 and ` +
      `${box2.width}×${box2.height} at (${box2.x}, ${box2.y}) at step 2 at 1440, and ` +
      `${narrow1.width}×${narrow1.height} then ${narrow2.width}×${narrow2.height} at 390 — nothing behind it is uncovered`)

    // ── "Where do I find these?" IS A LINK, NOT A DROPDOWN (his finding 3). The frame draws a
    //    bordered box with a chevron (S2 Onboarding.dc.html:135-138) and he read it as a select
    //    that would not open. It is now his words as a subtle link at the top right of the step,
    //    above the fields — a deliberate departure from the frame, and still the same
    //    `<a href="?step=integration">` that works with JavaScript off.
    const find = sheet(page).getByText('Where do I find these?')
    const shape = await find.evaluate((el) => {
      const a = el.closest('a')
      const s = a ? getComputedStyle(a) : null
      return { tag: a ? 'A' : el.tagName, href: a ? a.getAttribute('href') : null,
               border: s ? s.borderTopWidth : 'n/a', chevrons: a ? a.querySelectorAll('svg').length : -1 }
    })
    const findBox = await boxOf(find)
    const urlBox = await boxOf(sheet(page).locator('#s2b-api-url'))
    step('find-link',
      shape.tag === 'A' && shape.href === '?step=integration' && shape.border === '0px'
      && shape.chevrons === 0 && findBox.y < urlBox.y && findBox.x > box2.x + box2.width / 2,
      `it is an <${shape.tag} href=${JSON.stringify(shape.href)}> with a ${shape.border} border and ` +
      `${shape.chevrons} chevrons — a link, not the frame's bordered box — sitting above the fields ` +
      `(y ${Math.round(findBox.y)} < ${Math.round(urlBox.y)}) and on the right of the step`)
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})

    // ── THE FULL-PAGE PAIR, which is where the "Connect site" LINK goes with JavaScript off.
    await page.goto(`${APP}/sites/connect`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    const numbered = await page.locator('ol li').count()
    const nextLink = page.locator('a[href="?step=keys"]:visible', { hasText: 'Done — next' })
    const pageShot = await page.locator('img[src="/connect/integration.png"]')
      .evaluate((img) => img.complete && img.naturalWidth > 0).catch(() => false)
    const pageBox1 = await boxOf(page.locator('main div.bg-surface').first())
    const backHref = await page.locator('a:visible', { hasText: /^Back$/ }).first().getAttribute('href').catch(() => null)
    step('handshake',
      (await page.locator('text=1/2').count()) > 0 && numbered === 3 && pageShot
      && (await nextLink.count()) === 1 && backHref === '/sites',
      `S2b·1 on its own route: "1/2", ${numbered} numbered steps, the screenshot served = ${pageShot}, ` +
      `Back is <a href=${JSON.stringify(backHref)}> and "Done — next" is a link`)
    await shoot(page, 's2b1')

    await nextLink.click()
    await page.waitForSelector('#s2b-content-key')
    // The VISIBLE fields: a server-action form carries hidden `$ACTION_*` inputs of its own.
    const fields = await page.locator(`${WIZARD} input:not([type="hidden"])`).count()
    const required = await page.locator(`${WIZARD} input[required]`).count()
    const token = await page.locator('text=/staff access token/i').count()
    // The full-page pair jumped the same way the sheet did — 480×694.7 then 560×661, because the
    // frame draws step 1 at 480 and step 2 at 560. One card, one size, both steps (finding 1).
    const pageBox2 = await boxOf(page.locator('main div.bg-surface').first())
    step('keys-step',
      fields === 3 && required === 3 && token === 0 && (await page.locator('text=Where do I find these?').count()) === 1
      && same(pageBox1.width, pageBox2.width) && same(pageBox1.height, pageBox2.height),
      `S2b·2 shows ${fields} fields (API URL, Admin API key, Content API key), ${required} of them required, ` +
      `"Where do I find these?" at the top right, and mentions the Staff Access Token ${token} times ` +
      `(FR-C1: never here); the page card is ${pageBox1.width}×${pageBox1.height} at step 1 and ` +
      `${pageBox2.width}×${pageBox2.height} at step 2`)
    await shoot(page, 's2b2')

    // ── The `http://` warning, as the field is typed into and before anything is submitted.
    const typedHttp = await sent(async () => {
      await page.fill('#s2b-api-url', T3.url.replace('https://', 'http://'))
      await page.waitForSelector('#s2b-api-url-hint')
    })
    step('http-warned',
      await says(page, SAY.http_warning, page.locator('#s2b-api-url-hint')) && typedHttp === 0,
      `the warning under the field is the app's own HTTP_WARNING, shown as it is typed, and ${typedHttp} POSTs left the page`)

    // ── PROGRESSIVELY ENHANCED. The keys form is `<form action={serverAction}>` fed to
    //    `useActionState`, so React 19 renders it for a scripts-off submit: `method=post`, an
    //    `action` attribute that posts to the page itself, and the encoded `$ACTION_*` hidden
    //    fields a no-JS POST carries to reach the server action. This asserts that WIRING (what
    //    the story controls); whether the AUTHED SHELL paints the wizard visibly with scripts off
    //    is a separate, pre-existing shell question — the fields render in the HTML but compute a
    //    zero box without hydration (executed, Review 2) — recorded as DW-56 and owed a manual
    //    check, not this story's to fix.
    const njForm = page.locator(WIZARD)
    const njMethod = (await njForm.getAttribute('method')) || ''
    const njAction = await njForm.getAttribute('action')
    const njHidden = await page.locator(`${WIZARD} input[type="hidden"]`).evaluateAll((els) => els.map((e) => e.name))
    const njPE = njHidden.filter((n) => n.startsWith('$ACTION'))
    step('js-off',
      njMethod.toLowerCase() === 'post' && njAction !== null && njPE.length > 0,
      `the keys form is a progressively-enhanced server action: method=${JSON.stringify(njMethod)}, an action ` +
      `attribute present (${JSON.stringify(njAction)}, posts to the page), and React's ${njPE.length} ${JSON.stringify(njPE)} ` +
      `hidden field(s) a scripts-off POST carries. (Whether the authed shell paints it visibly without JS is ` +
      `DW-56, a shell question, not this story's.)`)

    // ── A plain-http address SUBMITTED. The field warned as it was typed; the customer submits
    //    anyway. The browser skips its Content-key check (`skipped_http`) and the server's own call
    //    carries the key — the deployed function receives a 301 to https (read off the audit below,
    //    Review 2: the 301 is what the Vercel function's own fetch gets, and `redirect: 'manual'`
    //    never follows it) and answers `ghost_redirected`. A plain-http address NEVER connects a
    //    site. (Until this review the submit itself silently did nothing — the dead-button fix.)
    await fill(page, T3.url.replace('https://', 'http://'), T3.adminKey, T3.contentKey)
    const httpPosted = await sent(async () => {
      await submit(page)
      await page.waitForSelector('text=sent us somewhere else', { timeout: 30000 }).catch(() => {})
    })
    const httpShown = await says(page, SAY.ghost_redirected)
    const afterHttp = await rowsOf()
    step('http-connect',
      httpPosted >= 1 && httpShown && afterHttp.length === 0,
      `a plain-http address is warned then submittable; ${httpPosted} POST(s) left the page, the deployed ` +
      `function received a 301 and answered ghost_redirected ("Your site sent us somewhere else…") = ${httpShown}, ` +
      `and NO site connected (${afterHttp.length} rows) — the audit step reads the 301 off the wire`)

    // ── A malformed Admin key: refused before Vault AND before the network — and the OTHER two
    //    fields keep what was typed. React resets a form after its action, so the wizard holds its
    //    values as state (review, 2026-09-08).
    await fill(page, T1.url, 'abc', T1.contentKey)
    await submit(page)
    await errorAt(page, 'admin-key').waitFor()
    const afterMalformed = await rowsOf()
    const keptUrl = await page.inputValue('#s2b-api-url')
    const keptContent = await page.inputValue('#s2b-content-key')
    step('malformed',
      await says(page, SAY.credential_malformed) && afterMalformed.length === 0
      && keptUrl === T1.url && keptContent === T1.contentKey,
      `the field says what a key looks like; the wire shows ${afterMalformed.length} sites rows; the URL ` +
      `and Content key fields kept what was typed = ${keptUrl === T1.url && keptContent === T1.contentKey}`)

    // ── NOT A URL: "orbit weekly" is a typo, not a site that did not answer, and the two never
    //    share a sentence — under the URL field, and no Ghost call made (review 2, 2026-09-08).
    const auditBeforeTypo = (await readAudit()).length
    await fill(page, 'orbit weekly', T1.adminKey, T1.contentKey)
    await submit(page)
    await errorAt(page, 'api-url').waitFor()
    const afterTypo = await rowsOf()
    const auditAfterTypo = (await readAudit()).length
    step('not-a-url',
      await says(page, SAY.url_invalid) && afterTypo.length === 0 && auditAfterTypo === auditBeforeTypo,
      `url_invalid's sentence is under the URL field, the wire shows ${afterTypo.length} sites rows, and the ` +
      `audit grew by ${auditAfterTypo - auditBeforeTypo} rows — Ghost was never called`)

    // ── UNREACHABLE: a host that does not exist. The browser's own check fails and lets the
    //    submit through, and the deployed function's fetch is what answers, naming the host.
    await fill(page, 'https://nonexistent.inflozo.com', T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector("text=We couldn't reach nonexistent.inflozo.com", { timeout: 45000 })
    const afterUnreachable = await rowsOf()
    step('unreachable',
      await says(page, SAY.ghost_unreachable.replace('%s', 'nonexistent.inflozo.com')) && afterUnreachable.length === 0,
      `ghost_unreachable's sentence names the host in the banner and the wire shows ${afterUnreachable.length} sites rows`)

    // ── A key of the right shape whose `kid` Ghost never issued (§37).
    await fill(page, T1.url, BOGUS, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Ghost said no')
    const afterBogus = await rowsOf()
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

    // ── T1, for real. The card's title and address are what `GET /admin/site/` answers (§38a),
    //    the address is a link to the PUBLIC url, and "Checked just now" is stamped by that read.
    const pub1 = await publicSite(T1)
    // Typed as a BARE HOST — the matrix's "Bare host typed" row: normalised to the https origin
    // before anything is called, and that origin is what the row stores (review 2, 2026-09-08).
    await fill(page, T1.url.replace(/^https:\/\//, ''), T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Connected')
    const rows = await rowsOf('*')
    const row = rows[0] || {}
    t1SiteId = row.id || null
    const ref1 = t1SiteId ? await refOf(t1SiteId) : null
    const present = row.credentials_present || {}
    const cardOf = (title) => page.locator('article', { hasText: title })
    const card = await cardOf('Connected').first().innerText().catch(() => '')
    const href = await cardOf('Connected').first().locator('a[target="_blank"]').getAttribute('href').catch(() => null)
    step('connect',
      rows.length === 1 && row.url === T1.url && row.ghost_version === T1.version && Boolean(row.content_key)
      && row.title === pub1.title && (row.site_settings || {}).public_url === pub1.url && href === pub1.url
      && Boolean(row.settings_read_at) && present.content === true && present.admin === true
      && present.staff === false && Boolean(ref1) && (await secretsBehind(ref1)) === 1
      && card.includes('Connected') && card.includes(`Ghost ${short(T1.version)}`) && card.includes('Checked just now')
      && page.url().replace(/\?.*$/, '') === `${APP}/sites`,
      `${rows.length} row: url ${row.url} from a bare host, ghost_version ${row.ghost_version}, content_key stored = ${Boolean(row.content_key)}, ` +
      `title ${JSON.stringify(row.title)} and site_settings.public_url ${(row.site_settings || {}).public_url} ` +
      `both as GET /admin/site/ answers them, the card's address links there = ${href === pub1.url}, ` +
      `settings_read_at set = ${Boolean(row.settings_read_at)}, credentials_present ${JSON.stringify(present)}, ` +
      `a site_credentials row with a ref = ${Boolean(ref1)}, vault.secrets rows behind it = ${await secretsBehind(ref1)}; ` +
      `the browser is on ${page.url()} showing ${JSON.stringify(card.replace(/\s+/g, ' ').trim())}`)
    await shoot(page, 's11a')

    // ── THE CARD THE OWNER FINALISED (his findings 4 and 6). The address carries the new-tab
    //    glyph; "Connected" left the pills' line and sits just above "Checked …", closer to it
    //    than to the pills. Read off the rendered boxes, not off the class attribute: the
    //    complaint was about what he saw.
    const first = cardOf('Connected').first()
    const arrow = await first.locator('a[target="_blank"] svg').count()
    const pillBox = await boxOf(first.getByText(`Ghost ${short(T1.version)}`))
    const connBox = await boxOf(first.getByText('Connected', { exact: true }))
    const checkBox = await boxOf(first.getByText('Checked just now'))
    const pillGap = connBox.y - (pillBox.y + pillBox.height)
    const stateGap = checkBox.y - (connBox.y + connBox.height)
    step('card',
      arrow === 1 && pillGap > 0 && stateGap >= 0 && stateGap < pillGap,
      `the address carries ${arrow} new-tab glyph; the pills line ends at y ` +
      `${Math.round(pillBox.y + pillBox.height)}, "Connected" starts at ${Math.round(connBox.y)} and ` +
      `"Checked just now" at ${Math.round(checkBox.y)} — so Connected is BELOW the pills and just above ` +
      `Checked, ${Math.round(stateGap)}px from it against ${Math.round(pillGap)}px from the pills`)

    // ── S11b: the same pair behind S11a's button. The opener is a LINK to /sites/connect that
    //    JavaScript turns into the sheet; Escape closes it and nothing is sent either way.
    const opened = await sent(async () => {
      await opener(page).first().click()
      await page.waitForSelector('dialog[open] #connect-site-title')
    })
    const sheetSays = await sheet(page).innerText().catch(() => '')
    await shoot(page, 's11b')
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})
    const stillOpen = await sheet(page).count()
    step('dialog',
      (await opener(page).count()) === 1 && opened === 0 && stillOpen === 0
      && sheetSays.includes('Connect your Ghost site') && sheetSays.includes('Same quick handshake as onboarding.')
      && !sheetSays.includes('First, a quick handshake.') && sheetSays.includes('Cancel'),
      `"Connect site" is a link to /sites/connect that opened S11b ("Connect your Ghost site — Same quick ` +
      `handshake as onboarding.", the handshake, Cancel); Escape closed it (${stillOpen} left open) and ` +
      `${opened} POSTs left the page`)

    // ── INSIDE THE SHEET: "Done — next" is the same anchor, intercepted into local state, so the
    //    URL does not move; the same address again, submitted from the sheet, is refused IN it.
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    const urlBefore = page.url()
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    await sheet(page).getByText('is already connected').waitFor()
    const stillOne = await rowsOf()
    step('sheet-submit',
      page.url() === urlBefore && await says(page, SAY.already_connected, sheet(page)) && (await sheet(page).count()) === 1
      && stillOne.length === 1,
      `"Done — next" inside the sheet showed the three fields with the URL unchanged (${urlBefore}); the same ` +
      `address again was answered inside the still-open sheet with the sentence, and the account still has ${stillOne.length} site`)

    // ── A REOPENED sheet is a fresh one: no last-attempt sentence, back at the handshake.
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    const reopened = await sheet(page).innerText().catch(() => '')
    // Both panes are always in the DOM — that is what makes the box one size — so "no fields"
    // is a VISIBILITY question, not a presence one.
    const reopenedFields = await sheet(page).locator('#s2b-api-url').isVisible()
    step('sheet-reopen',
      !reopened.includes('is already connected') && reopened.includes('1/2') && reopenedFields === false,
      `reopened: at the handshake ("1/2"), the keys pane hidden (visible = ${reopenedFields}), and no sentence ` +
      `from the last attempt = ${!reopened.includes('is already connected')}`)
    await page.keyboard.press('Escape')
    await sheet(page).waitFor({ state: 'detached' }).catch(() => {})

    // ── T3 on a Free account that already has T1: Appendix F.1's own sentence, from the page route.
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await fill(page, T3.url, T3.adminKey, T3.contentKey)
    await submit(page)
    await page.waitForSelector(`text=${SAY.at_cap}`)
    const capped = await rowsOf()
    step('at-cap',
      capped.length === 1,
      `the banner reads ${JSON.stringify(SAY.at_cap)} — the app's own siteCapSentence('free') — and ` +
      `the account still has ${capped.length} site`)

    // ── FR-C6: a DISCONNECTED record is RE-ADOPTED in place — same id, `disconnected_at` cleared,
    //    the key re-stored and the OLD secret dropped by the trigger (DW-44's replace path, live).
    //    Nothing in the product writes `disconnected_at` until Story 3.5, so the service role sets
    //    it here; with no active site, `/sites` is the empty screen again.
    const detached = await patch(`/sites?id=eq.${t1SiteId}`, { disconnected_at: new Date().toISOString() })
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    // …and with no active site `/sites` is the EMPTY SCREEN again, so the handshake is reached
    // the way the owner asked for it: press "Connect site" and the two steps open in the sheet.
    await page.getByText(SAY.empty_title).waitFor()
    await opener(page).last().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, T1.url, T1.adminKey, T1.contentKey)
    await submit(page)
    await page.waitForSelector('text=Connected')
    const readopted = await rowsOf('id,disconnected_at,ghost_version')
    const ref1b = t1SiteId ? await refOf(t1SiteId) : null
    step('re-adopt',
      detached.status === 200 && readopted.length === 1 && readopted[0].id === t1SiteId
      && readopted[0].disconnected_at === null && Boolean(ref1b) && ref1b !== ref1
      && (await secretsBehind(ref1)) === 0 && (await secretsBehind(ref1b)) === 1,
      `the record was disconnected (HTTP ${detached.status}), /sites became the empty screen, and reconnecting ` +
      `through the sheet its own button opens ` +
      `re-adopted it: same id = ${readopted[0] && readopted[0].id === t1SiteId}, disconnected_at cleared, a NEW ` +
      `vault ref = ${Boolean(ref1b) && ref1b !== ref1}, secrets behind the old ref ${await secretsBehind(ref1)}, ` +
      `behind the new ${await secretsBehind(ref1b)} (the trigger dropped the replaced one)`)
    refs.push(ref1b)

    // ── ON PRO, THROUGH THE SHEET: T3 with a trailing slash. The row stores the typed origin
    //    without it, the public url as Ghost sends it (with it), `5.130.6` from config/ — and a
    //    connect that succeeds from the sheet CLOSES it, leaving the second card behind. No
    //    billing exists yet (Epic 12), so the service role flips the entitlement row the signup
    //    trigger made.
    const pro = await patch(`/entitlements?user_id=eq.${USER_ID}`, { state: 'pro_active' })
    const pub3 = await publicSite(T3)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] a[href="?step=keys"]')
    await sheet(page).locator('a[href="?step=keys"]').click()
    await page.waitForSelector('dialog[open] #s2b-content-key')
    await fill(page, `${T3.url}/`, T3.adminKey, T3.contentKey)
    await submit(page)
    await page.waitForSelector(`text=Ghost ${short(T3.version)}`)
    const both = await rowsOf('*')
    const row3 = both.find((r) => r.url === T3.url) || {}
    t3SiteId = row3.id || null
    const ref3 = t3SiteId ? await refOf(t3SiteId) : null
    refs.push(ref3)
    const sheetLeft = await sheet(page).count()
    const card3 = await cardOf(pub3.title || 'Ghost5').first().innerText().catch(() => '')
    step('pro-connect-t3',
      pro.status === 200 && Array.isArray(pro.body) && pro.body.length === 1 && pro.body[0].state === 'pro_active'
      && both.length === 2 && row3.ghost_version === T3.version && row3.title === pub3.title
      && (row3.site_settings || {}).public_url === pub3.url && Boolean(row3.content_key)
      && Boolean(ref3) && (await secretsBehind(ref3)) === 1 && sheetLeft === 0
      && card3.includes('Connected') && card3.includes(`Ghost ${short(T3.version)}`)
      && page.url().replace(/\?.*$/, '') === `${APP}/sites`,
      `entitlement flipped to pro_active (HTTP ${pro.status}); ${both.length} rows, T3's url stored as ` +
      `${JSON.stringify(row3.url)} from a trailing-slash input, ghost_version ${row3.ghost_version}, ` +
      `public_url ${(row3.site_settings || {}).public_url}, a vault secret behind its ref = ${(await secretsBehind(ref3)) === 1}; ` +
      `the sheet closed on success (${sheetLeft} left open) and the second card reads ` +
      `${JSON.stringify(card3.replace(/\s+/g, ' ').trim())}`)

    // ── THE SEARCH HE ASKED FOR (finding 5, amended): the shell's own field, on Sites, matching a
    //    site by its TITLE or its ADDRESS. It is the dashboard's field with a different noun, so
    //    what is proved here is the match and the empty answer, on the deployed page.
    const searchFor = async (text) => {
      await page.fill('input[name="q"]:visible', text)
      await page.keyboard.press('Enter')
      await page.waitForURL((u) => u.searchParams.get('q') === text)
      // `next/form` navigates on the client, so the grid re-renders a beat after the URL moves.
      await page.waitForTimeout(800)
      return page.locator('article').count()
    }
    const byTitle = await searchFor(pub1.title || 'Ghost6')
    const byAddress = await searchFor(new URL(T3.url).host)
    const byNothing = await searchFor('zzznomatch')
    // `no_match` was evaluated from the app as `noMatch('zzznomatch')`, which is the word just
    //    searched for — so the sentence on screen is the app's own, whole.
    const emptyAnswer = await page.getByText(SAY.no_match).isVisible().catch(() => false)
    step('search',
      byTitle === 1 && byAddress === 1 && byNothing === 0 && emptyAnswer,
      `two cards, then one: searching the title ${JSON.stringify(pub1.title)} left ${byTitle} card, ` +
      `searching the address ${JSON.stringify(new URL(T3.url).host)} left ${byAddress}, and a word that ` +
      `matches nothing left ${byNothing} with the app's own "No sites match …" = ${emptyAnswer}`)
    await page.goto(`${APP}/sites`, { waitUntil: 'load' })
    await page.waitForSelector('text=Connected')

    // ── The audit trail, through the pooler: three connects, each `config/` with a NULL site_id
    //    and each `site/` carrying the id; the bogus key at 401; the plain-http call at 301.
    const audit = await sql`
      select action::text as action, route, site_id, outcome, detail
        from private.credential_audit
       where user_id = ${USER_ID}
       order by occurred_at, id
    `
    const reads = audit.filter((r) => r.action === 'admin_read')
    const beforeRow = reads.filter((r) => r.outcome === 'ok' && r.site_id === null)
    const withRow = reads.filter((r) => r.outcome === 'ok' && r.site_id !== null)
    const errs = reads.filter((r) => r.outcome === 'error')
    const at = (status) => errs.filter((r) => String((r.detail || {}).status) === status)
    const httpStatuses = errs.map((r) => (r.detail || {}).status).filter((v) => v !== undefined)
    const stamped = audit.every((r) => r.route === ROUTE)
    const objects = audit.every((r) => r.detail !== null && typeof r.detail === 'object')
    const leak = audit.filter((r) => /[0-9a-f]{16,}:[0-9a-f]{16,}/.test(JSON.stringify(r)))
    step('audit',
      beforeRow.length === 3 && withRow.length === 3
      && withRow.filter((r) => r.site_id === t1SiteId).length === 2 && withRow.some((r) => r.site_id === t3SiteId)
      && at('401').length >= 1 && at('301').length >= 1 && errs.length >= 2 && stamped && objects && leak.length === 0,
      `${audit.length} rows: ${beforeRow.length} admin_read ok with a NULL site_id (config/, one per connect), ` +
      `${withRow.length} with a site_id (site/: T1 twice, T3 once), ${errs.length} admin_read error(s) at ` +
      `status ${JSON.stringify(httpStatuses)} (the bogus key at 401 and the plain-http attempt — its status ` +
      `is what the Vercel function's own fetch received); every row stamped ${ROUTE} = ${stamped}; every ` +
      `detail a jsonb object = ${objects}; rows that look like they hold a key = ${leak.length}`)

    // ── axe over every surface: the list, both steps of the page pair, and the open sheet.
    await axeAt(page, 'sites')
    await opener(page).first().click()
    await page.waitForSelector('dialog[open] #connect-site-title')
    await axeAt(page, 'sheet')
    await page.keyboard.press('Escape')
    await page.goto(`${APP}/sites/connect`, { waitUntil: 'load' })
    await page.waitForSelector('text=First, a quick handshake.')
    await axeAt(page, 'connect')
    await page.goto(`${APP}/sites/connect?step=keys`, { waitUntil: 'load' })
    await page.waitForSelector('#s2b-content-key')
    await axeAt(page, 'keys')

    // ── The cascade: GoTrue deletes the user, Postgres cascades to both sites and their
    //    credentials rows, and DW-44's trigger takes both secrets with them.
    await admin(`/admin/users/${USER_ID}`, { method: 'DELETE' })
    const gone = await admin(`/admin/users/${USER_ID}`)
    step('user-gone', gone.status === 404, `GET /admin/users/{id} -> HTTP ${gone.status}`)

    const left = []
    for (const ref of refs) left.push(await secretsBehind(ref))
    step('secret-gone', refs.length === 2 && refs.every(Boolean) && left.every((n) => n === 0),
      `the vault after the account went: ${JSON.stringify(left)} row(s) behind the two sites' refs`)

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
    ap.add_argument('--shots', default='',
                    help='a directory to save each surface into at 1440, 834 and 390 — the frame '
                         'comparison. Created if missing; asserts nothing.')
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
        for code, text in app_text().items():
            print(f'  the app\'s own text, evaluated — {code}: {text!r}')
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
        # `%s` marks the app's own host hole, so the browser half matches the halves around it
        # rather than rebuilding the interpolation.
        says = app_text()
        if args.shots:
            os.makedirs(args.shots, exist_ok=True)
        steps = run_browser({
            'APP_URL': args.url.rstrip('/'),
            'SHOTS_DIR': os.path.abspath(args.shots) if args.shots else '',
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
        # The browser half deleted the user itself (`user-gone`); a second DELETE below would only
        # answer 404 and mask a step that made a user it should not have.
        if any(s['name'] == 'user-gone' and s['ok'] for s in steps):
            user_id = None
    finally:
        if user_id:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        # The count is compared BEFORE any sweep of strays, so a user a step created by mistake is
        # reported as the leak it is rather than tidied away (the sibling harness's own note).
        after = admin.user_count()
        print(f'  fixture user {"deleted" if user_id else "already gone (the cascade step)"}; users after: {after}')
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
