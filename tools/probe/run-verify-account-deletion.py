#!/usr/bin/env python3
"""FR-A5's deletion window, driven through the real UI on the deployed site and read off the wire.

    python3 tools/probe/run-verify-account-deletion.py --check   # plumbing only: no browser, no UI
    python3 tools/probe/run-verify-account-deletion.py           # the whole round trip (Deploy run)
    python3 tools/probe/run-verify-account-deletion.py --to you@example.com   # A is an inbox you can open

WHY IT EXISTS. Story 2.5 rests on claims about Postgres, PostgREST and Storage, and CLAUDE.md's
first standing rule — cite or execute, never assert — makes each one a hypothesis until it is run
against the real thing: that a `security definer` function runs under the hosted project's own
`auth.uid()`; that `.rpc()` through `@supabase/ssr` carries the user's JWT, so `auth.uid()` IS the
caller and one tenant cannot move another's rows; that `revoke execute … from anon` is what a
session-less caller actually meets; that the service role can `createSignedUrl` on a bucket with NO
policy at all (AD-32 — the `site-snapshots` bucket has never been read from the app) and that the
URL serves the bytes; and that `sites(title, url)` embeds through the foreign key under RLS. Every
one is executed here, against `app.inflozo.com` and the real Supabase project.

WHAT IT PROVES, each step PASS, FAIL or RECORD, exiting non-zero if any step fails. The steps are
named here in the order the run prints them (a docstring that names fewer than the run prints is a
list gone stale — the sibling harness's own note):

  anon-rpc       THE CONTROL, AND IT RUNS FIRST. Both functions called with the PUBLISHABLE key and
                 no bearer at all: each must be refused (`42501`). Without this a green `request`
                 below proves only that SOMEBODY could open a window, not that only the owner can
  seeded         A's fixture is really there: the `sites` row, the `site_snapshots` row and the
                 object in the server-only bucket, read back rather than assumed
  frame          the Danger zone button's height, padding, radius, weight and colours read off the
                 DEPLOYED DOM as computed styles — not a grep of the class attribute, because a
                 class that loses to another class is still in the markup (2.1's review). The
                 geometry is `S12 Billing.dc.html:109`'s own; the colours are the TOKENS, read out
                 of globals.css by the sibling's `tokens_rgb` and never retyped here
  frame-390      the same button at 390, where the column is full width: still 34px, at the row's
                 END, and inside the viewport — the AC's "nothing clipped", measured
  dialog-focus   the confirm opens with focus on Cancel (EXPERIENCE.md § Destructive confirms), and
                 Escape, the Cancel button and a click on the backdrop EACH close it
  dialog-quiet   NOTHING left the browser while the confirm was opened and closed those three ways
  armed          the typed confirm, both halves: "delete my acc" leaves the red button
                 `aria-disabled` and Enter sends nothing; the phrase in full clears it
  sentence       the dialog's body sentence, read off the deployed page for an account that holds
                 ONE project and no assets: "Your 1 project, its full version history will be
                 permanently deleted in N days." — the counts path and the dropped asset clause,
                 observed where they render rather than only in the pure function
  rearm          the phrase typed and the dialog CANCELLED: reopened, the field is empty and the
                 red button is greyed again — a cancelled confirm must not reopen one click from
                 the irreversible thing
  axe-account-closed · axe-account-dialog
                 axe-core at WCAG 2.1 AA over /account with the card closed and the confirm open,
                 each at 1440 AND 390, and no horizontal scroll
  request        the phrase typed and the red button pressed: the browser lands on `/restore`, and
                 the WIRE — PostgREST with the secret key — shows `deleted_at` set, `purge_after`
                 exactly fourteen days after it, the seeded snapshot's `purge_after` equal to the
                 account's, and `download_offered_at` stamped
  server-phrase  the server action's own check, which the greyed button only mirrors: the POST the
                 `request` step made is captured and REPLAYED with a wrong phrase in its body, and
                 the action must answer `wrong_phrase` — the one guard on the irreversible action,
                 reached the way a forged request would reach it
  second-request a SECOND call with A's own bearer while the window is open: `null`, and the
                 deadline unmoved. This is what stops a stale tab sending a second email
  other-user-rpc B, a real second session, calls `restore_account()`: `false`, and A's rows
                 untouched — the definer function's WHERE clause, executed rather than reasoned
  door           `/` and `/account` both land on `/restore` while the window is open
  restore-page   the date sentence, and the seeded snapshot listed with its site's title and its
                 captured date — which is also the proof that `sites(title, url)` embeds under RLS
  download       the Download link answers 303 to a `…/storage/v1/object/sign/site-snapshots/…`
                 URL, and a GET of that URL returns the seeded bytes
  download-other B asks for A's snapshot: 404, and no URL is minted
  download-signed-out  no cookies at all: 303 to `/sign-in`
  restore-signed-out   `/restore` with no cookies at all: a redirect to `/sign-in` — the page
                 outside `(authed)` guards itself, executed rather than read out of its source
  axe-restore    axe-core over `/restore` before the deadline
  restore        Restore pressed: `/?restored=1` with the green sentence, both columns null on the
                 profile AND on the snapshot, and the dashboard usable again
  axe-restored   axe-core over `/?restored=1`
  restore-clean  `/restore` opened by the restored account: straight back to `/`, never a page
                 about a deletion that is not happening
  authed-rpc     A's OWN bearer calls `request_account_deletion()` directly: 200 and an ISO
                 timestamp fourteen days out. The window is re-opened for the two steps below
  magic-link-during  a fresh magic link for a PENDING A: it signs in to A's own user id and lands
                 on `/restore`, which is FR-A5's "signing in restores everything" as a URL
  past-deadline  `purge_after` moved into the past by the secret key: `/restore` says "being
                 deleted", offers no Restore, and `restore_account()` with A's own bearer is `false`
  axe-past       axe-core over `/restore` after the deadline

WHAT IT DOES NOT YET PROVE: that the email arrived. `RESEND_API_KEY` is send-only and answers every
READ with `401 restricted_api_key`, so this harness asserts the hand-off and the owner's manual test
step 5 is the delivery check. THAT IS NOW A CHOICE RATHER THAN A WALL: `RESEND_READ_API_KEY` exists
since 2026-09-11 (DW-22 closed, Story 3.9) and `GET https://api.resend.com/emails/{id}` answers
`last_event` — `delivered`, `bounced`, `complained`. `check-access.py` reads it with the sending key
refused beside it as the control. Epic 12, whose emails are acceptance-tested on delivery, is where
a harness first asserts `last_event`; adding it here wants the message id the app logged, which this
run does not capture.
`--to ADDRESS` makes A that address, so the run's one real send lands in an inbox a human can open
(the sibling harness's own escape hatch); without it A is a `deletion-harness-<stamp>@inflozo.com`
address the owner's domain receives.

NO KEY IS EVER PRINTED. Keys reach the browser half through its environment, never through argv
(argv is world-readable in `ps`), and every command is recorded by the key's variable NAME.

TWO FIXTURE USERS ARE CREATED AND DELETED HERE, and one Storage object with them. The Admin-API
user count is read before and after — BEFORE any sweep of strays, so a step that created a user it
should not have is reported as the leak it is rather than tidied away — and a count that could not
be read FAILS the run, because it is the cleanup's control. The bucket prefix is listed after the
delete to prove nothing is left behind.

Playwright and axe-core are resolved from the machine, and the helpers that do it — `Admin`,
`load_env`, `playwright_dir`, `axe_path`, `tokens_rgb` and the fixture sweep — are IMPORTED from
`run-verify-passkeys.py` through `run-verify-email-change.py`'s `_sibling` pattern rather than
copied, so a fix to any lands on all four (propagate, never localise).
"""
import argparse, importlib.util, json, os, re, subprocess, sys, tempfile, time
import urllib.error, urllib.request

HERE = os.path.dirname(os.path.abspath(__file__))
APP = 'https://app.inflozo.com'


def _sibling(name):
    """`run-verify-passkeys` is not an identifier, so it cannot be `import`ed by name."""
    spec = importlib.util.spec_from_file_location(name.replace('-', '_'), os.path.join(HERE, f'{name}.py'))
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


_passkeys = _sibling('run-verify-passkeys')
Admin, load_env = _passkeys.Admin, _passkeys.load_env
playwright_dir, axe_path, tokens_rgb = _passkeys.playwright_dir, _passkeys.axe_path, _passkeys.tokens_rgb

FIXTURE = r'^deletion-harness-\d+(-b)?@inflozo\.com$'
BUCKET = 'site-snapshots'
# The tokens the `frame` step asserts, `{key: css token name}`, read out of globals.css by the
# sibling's `tokens_rgb` — never retyped, because a hex written here is how a frame value goes stale.
FRAME_TOKENS = {
    'surface': 'surface',
    'dangerLine': 'danger-line',
    'dangerText': 'danger-text',
    'dangerTint': 'danger-tint',
}
# FR-A5's fourteen days, DERIVED from the app's own constant rather than restated here.
DELETION_RULE_TS = os.path.join(HERE, '..', '..', 'apps', 'web', 'app', '(app)', 'app',
                                '(authed)', 'account', 'deletion-rule.ts')
# The bytes the seeded snapshot holds; the `download` step compares what Storage serves with this.
SNAPSHOT_BYTES = b'PK\x03\x04 inflozo deletion harness snapshot'


def window_days():
    """`DELETION_WINDOW_DAYS` out of the app's own rule module. The harness must not carry its own
    copy of FR-A5's fourteen days: a number written twice is a number that goes stale once."""
    source = open(DELETION_RULE_TS, encoding='utf-8').read()
    found = re.search(r'DELETION_WINDOW_DAYS\s*=\s*(\d+)', source)
    if not found:
        sys.exit('  FAIL  DELETION_WINDOW_DAYS is not in account/deletion-rule.ts; the harness has no window to assert')
    return int(found.group(1))


def _request(method, url, key, body=None, content_type='application/json', extra=None):
    headers = {'apikey': key, 'Authorization': f'Bearer {key}'}
    if body is not None:
        headers['Content-Type'] = content_type
    headers.update(extra or {})
    data = body if isinstance(body, bytes) else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=data, method=method, headers=headers)
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            raw = r.read()
            try:
                return r.status, json.loads(raw) if raw else None
            except ValueError:
                return r.status, raw
    except urllib.error.HTTPError as e:
        raw = e.read()
        try:
            return e.code, json.loads(raw) if raw else None
        except ValueError:
            return e.code, raw
    except (urllib.error.URLError, TimeoutError, OSError) as e:
        return 0, str(e)


def rest(sb_url, secret, method, path, body=None, prefer=None):
    """PostgREST with `SUPABASE_SECRET_KEY` — the service role, so the fixture is seeded and read
    back without RLS in the way. Never used to STAND IN for a user: every assertion about what a
    user can do is made through that user's own session in the browser half."""
    extra = {'Prefer': prefer} if prefer else {}
    return _request(method, f'{sb_url.rstrip("/")}/rest/v1{path}', secret, body, extra=extra)


def storage_put(sb_url, secret, key, payload):
    return _request('POST', f'{sb_url.rstrip("/")}/storage/v1/object/{BUCKET}/{key}',
                    secret, payload, content_type='application/zip')


def storage_list(sb_url, secret, prefix):
    return _request('POST', f'{sb_url.rstrip("/")}/storage/v1/object/list/{BUCKET}',
                    secret, {'prefix': prefix, 'limit': 100})


def storage_delete(sb_url, secret, key):
    return _request('DELETE', f'{sb_url.rstrip("/")}/storage/v1/object/{BUCKET}/{key}', secret, {})


# ── The browser half. Node, because Playwright is Node; one file, so one catalogue row. The
#    privileged wire reads live here too, so the database can be read BETWEEN two UI steps.
BROWSER_JS = r'''
const { chromium } = require(process.env.PW_DIR)

const APP = process.env.APP_URL
const SB = process.env.SB_URL.replace(/\/$/, '')
const SECRET = process.env.SB_SECRET
const PUBLISHABLE = process.env.SB_PUBLISHABLE
const A_ID = process.env.A_USER_ID
const A_EMAIL = process.env.A_EMAIL
const B_ID = process.env.B_USER_ID
const CONFIRM_A = process.env.CONFIRM_URL_A
const CONFIRM_B = process.env.CONFIRM_URL_B
const SNAPSHOT_ID = process.env.SNAPSHOT_ID
const SNAPSHOT_KEY = process.env.SNAPSHOT_KEY
const SNAPSHOT_BODY = process.env.SNAPSHOT_BODY
const SITE_TITLE = process.env.SITE_TITLE
const PHRASE = process.env.DELETE_PHRASE
const DAYS = Number(process.env.WINDOW_DAYS)
const TOKENS = JSON.parse(process.env.TOKENS_RGB)

/* `load`, NOT `networkidle`, AND A MINUTE TO DO IT IN — the sibling harness's own finding: the
   FIRST authed render on a cold deployment took longer than Playwright's 30s default, and Deploy
   always meets a fresh deployment. Every step asserts through a locator that waits on its own. */
const NAV_TIMEOUT = 60000

const steps = []
const step = (name, ok, detail) => { steps.push({ name, ok, detail }); return ok }
const record = (name, detail) => steps.push({ name, ok: null, detail })

/* PostgREST with the SERVICE ROLE — how the wire is read between two UI steps. It never stands in
   for a user: every claim about what a USER may do is made through that user's own session. */
const wire = async (path, init = {}) => {
  const r = await fetch(`${SB}/rest/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json',
               ...(init.headers || {}) },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/* THE SAME FUNCTION, CALLED AS SOMEBODY. `token` null is the anon control — the publishable key
   and no bearer, which is exactly what a session-less browser presents. */
const rpc = async (fn, token) => {
  const r = await fetch(`${SB}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: { apikey: PUBLISHABLE, 'Content-Type': 'application/json',
               ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: '{}',
  })
  const body = await r.json().catch(() => null)
  return { status: r.status, code: (body && body.code) || null, body }
}

const admin = async (path, init = {}) => {
  const r = await fetch(`${SB}/auth/v1${path}`, {
    ...init,
    headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json' },
  })
  return { status: r.status, body: await r.json().catch(() => null) }
}

/* A magic link, minted HERE and only when it is about to be redeemed: GoTrue keeps ONE per user,
   so minting them up front invalidates all but the last (executed 2026-09-07 by the passkey
   harness). `generate_link` answers with the USER it minted for. */
const magicLink = async (email) => {
  const { status, body } = await admin('/admin/generate_link', {
    method: 'POST', body: JSON.stringify({ type: 'magiclink', email }),
  })
  if (status !== 200 || !body || !body.hashed_token) throw new Error(`generate_link -> HTTP ${status}`)
  return { url: `${APP}/auth/confirm?token_hash=${body.hashed_token}&type=magiclink`, id: body.id }
}

/* THE SESSION OUT OF A BROWSER CONTEXT'S OWN COOKIE JAR — `@supabase/ssr` writes it as
   `sb-<ref>-auth-token`, chunked when long, each part a `base64-`-prefixed JSON blob, `httpOnly`
   so script cannot read it but Playwright's jar can. A jar that cannot be parsed THROWS: a null
   token would make an authorisation assertion pass for the wrong reason. */
const accessTokenOf = async (context, whose) => {
  const parts = (await context.cookies(APP))
    .filter((c) => /^sb-.+-auth-token(\.\d+)?$/.test(c.name))
    .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }))
  if (!parts.length) throw new Error(`${whose} has no Supabase auth cookie — it is not signed in`)
  let raw = parts.map((c) => c.value).join('')
  try { raw = decodeURIComponent(raw) } catch { /* not encoded */ }
  if (raw.startsWith('base64-')) raw = Buffer.from(raw.slice('base64-'.length), 'base64').toString('utf8')
  const session = JSON.parse(raw)
  if (!session.access_token) throw new Error(`${whose}'s cookie carries no access_token`)
  return session.access_token
}

// axe-core at WCAG 2.1 AA, at BOTH widths — the cards go one column at 390 and a violation that
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

// The card's button and the dialog's primary share their words, so each is addressed by where it
// is rather than by its name alone.
const dangerButton = (page) => page.locator('section button', { hasText: 'Delete account' }).first()
const dialogPrimary = (page) => page.locator('dialog[open] button[type="submit"]')
const openConfirm = async (page) => {
  await dangerButton(page).click()
  await page.waitForSelector('dialog[open] #delete-account-title')
}

const profileRow = async () => (await wire(`/profiles?user_id=eq.${A_ID}&select=deleted_at,purge_after`)).body?.[0] || {}
const snapshotRow = async () => (await wire(`/site_snapshots?id=eq.${SNAPSHOT_ID}&select=purge_after,download_offered_at`)).body?.[0] || {}
const daysBetween = (later, earlier) =>
  (new Date(later).getTime() - new Date(earlier).getTime()) / 86400000

;(async () => {
  const browser = await chromium.launch()
  const a = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  a.setDefaultNavigationTimeout(NAV_TIMEOUT)
  const page = await a.newPage()

  // Every POST the page makes. "Nothing left the browser" is the promise for a confirm that was
  // opened and cancelled, and counting is the only way to see it.
  let posts = 0
  page.on('request', (r) => { if (r.method() === 'POST') posts += 1 })
  const sent = async (fn) => { const before = posts; await fn(); return posts - before }

  try {
    // ── THE CONTROL, FIRST. No bearer at all: `revoke execute … from public, anon` is what a
    //    session-less caller meets, and it is 42501, not an empty result.
    const anonRequest = await rpc('request_account_deletion', null)
    const anonRestore = await rpc('restore_account', null)
    step('anon-rpc',
      [401, 403].includes(anonRequest.status) && [401, 403].includes(anonRestore.status),
      `request_account_deletion -> HTTP ${anonRequest.status} ${JSON.stringify(anonRequest.code)}; ` +
      `restore_account -> HTTP ${anonRestore.status} ${JSON.stringify(anonRestore.code)}`)

    // ── the fixture, read back rather than assumed
    const seededSnapshot = await snapshotRow()
    const seededObject = await fetch(`${SB}/storage/v1/object/${encodeURI(SNAPSHOT_KEY)}`, {
      headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}` },
    })
    step('seeded',
      Object.keys(seededSnapshot).length > 0 && seededObject.status === 200,
      `site_snapshots row present = ${Object.keys(seededSnapshot).length > 0}; ` +
      `the object in the server-only bucket -> HTTP ${seededObject.status}`)

    // ── A signs in with the link the Python half minted.
    await page.goto(CONFIRM_A, { waitUntil: 'load' })
    await page.goto(`${APP}/account`, { waitUntil: 'load' })

    // ── the frame, MEASURED off the deployed DOM. `S12 Billing.dc.html:109`: 34px tall, 0 15px,
    //    radius 12, 13px/600, a `danger-line` border on `surface` with `danger-text` words and
    //    `danger-tint` on hover.
    const button = dangerButton(page)
    // `loading.tsx` is a Suspense skeleton over every authed page and the account page awaits
    // three reads before it renders, so at `load` the card can still be in the hidden streamed
    // segment: computed styles intact, bounding box 0×0. Wait for the button to be VISIBLE before
    // measuring (three of four review runs read `h: 0` — 2026-09-07).
    await button.waitFor({ state: 'visible', timeout: NAV_TIMEOUT })
    const look = await button.evaluate((n) => {
      const s = getComputedStyle(n), r = n.getBoundingClientRect()
      return { h: Math.round(r.height), radius: s.borderTopLeftRadius, size: s.fontSize,
               weight: s.fontWeight, padding: s.paddingLeft, border: s.borderTopColor,
               color: s.color, bg: s.backgroundColor }
    })
    await button.hover()
    // globals.css's --duration-fast (160ms) animates the fill in; read before it settles and the
    // colour is whatever the transition was passing through (the sibling harness's own note).
    await page.waitForTimeout(220)
    look.hover = await button.evaluate((n) => getComputedStyle(n).backgroundColor)
    step('frame',
      look.h === 34 && look.radius === '12px' && look.size === '13px' && look.weight === '600' &&
      look.padding === '15px' && look.border === TOKENS.dangerLine && look.bg === TOKENS.surface &&
      look.color === TOKENS.dangerText && look.hover === TOKENS.dangerTint,
      `${JSON.stringify(look)} vs tokens ${JSON.stringify(TOKENS)}`)

    // ── at 390 the column is full width; the button must still be the frame's 34px, sit at the
    //    row's END and lie inside the viewport — the AC's "nothing clipped", measured.
    await page.setViewportSize({ width: 390, height: 900 })
    const narrow = await button.evaluate((n) => {
      const b = n.getBoundingClientRect(), row = n.parentElement.getBoundingClientRect()
      return { h: Math.round(b.height), width: Math.round(b.width), right: Math.round(b.right),
               rowRight: Math.round(row.right), viewport: window.innerWidth,
               clipped: b.left < 0 || b.right > window.innerWidth }
    })
    step('frame-390',
      narrow.h === 34 && narrow.width > 0 && !narrow.clipped && Math.abs(narrow.rowRight - narrow.right) <= 1,
      JSON.stringify(narrow))
    await page.setViewportSize({ width: 1440, height: 900 })

    await axeAt(page, 'account-closed')

    // ── the confirm opens on Cancel; Escape, the Cancel button and a backdrop click EACH close
    //    it; and nothing was sent while it was open, all three closers under the one counter.
    const idlePosts = await sent(async () => {
      await openConfirm(page)
      await axeAt(page, 'account-dialog')
      const onCancel = await page.evaluate(() =>
        document.activeElement !== null && document.activeElement.hasAttribute('data-cancel'))
      const closers = {
        escape: () => page.keyboard.press('Escape'),
        cancel: () => page.locator('dialog[open] [data-cancel]').click(),
        // The `::backdrop` is the <dialog> itself for hit-testing, and `kit/dialog.ts` closes on a
        // click whose point lies outside the 460px sheet: the viewport's corner is one.
        backdrop: () => page.mouse.click(4, 4),
      }
      const closedBy = {}
      for (const [name, close] of Object.entries(closers)) {
        if (name !== 'escape') await openConfirm(page)
        await close()
        await page.waitForFunction(() => !document.querySelector('dialog[open]'),
                                   null, { timeout: 10000 }).catch(() => null)
        closedBy[name] = await page.locator('dialog[open]').count() === 0
        if (!closedBy[name]) await page.evaluate(() => document.querySelector('dialog[open]')?.close())
      }
      step('dialog-focus', onCancel && Object.values(closedBy).every(Boolean),
           `focus was on Cancel = ${onCancel}; closed by ${JSON.stringify(closedBy)}`)
    })
    step('dialog-quiet', idlePosts === 0,
         idlePosts === 0 ? 'nothing left the browser while the confirm was open and closed three ways'
                         : `${idlePosts} POST(s) left the browser while the confirm was merely open`)

    // ── THE TYPED CONFIRM, both halves. A wrong phrase leaves the button greyed and Enter does
    //    nothing; the phrase in full arms it.
    const armedPosts = await sent(async () => {
      await openConfirm(page)
      const field = page.locator('dialog[open] #delete-account-confirm')
      await field.fill(PHRASE.slice(0, PHRASE.length - 4))
      const greyed = await dialogPrimary(page).getAttribute('aria-disabled')
      await field.press('Enter')
      await page.waitForTimeout(500)
      const stillOpen = await page.locator('dialog[open]').count() === 1
      await field.fill(PHRASE)
      const armed = await dialogPrimary(page).getAttribute('aria-disabled')
      step('armed', greyed === 'true' && stillOpen && armed === null,
           `wrong phrase: aria-disabled=${JSON.stringify(greyed)}, dialog still open = ${stillOpen}; ` +
           `the phrase: aria-disabled=${JSON.stringify(armed)}`)

      // The sentence the person is deciding on, with THIS account's counts: one project seeded by
      // the Python half, no assets — so the asset clause must be absent, not "and 0 assets".
      const body = (await page.locator('dialog[open] #delete-account-body').textContent({ timeout: 5000 }).catch(() => null)) || ''
      const expected = `Your 1 project, its full version history will be permanently deleted in ${DAYS} days.`
      step('sentence', body.startsWith(expected), `the dialog says ${JSON.stringify(body.slice(0, 120))}`)

      // CANCELLED WITH THE PHRASE TYPED, then reopened: the field must be empty and the button
      // greyed again. A confirm that reopens armed is one click from the irreversible thing.
      await page.keyboard.press('Escape')
      await page.waitForFunction(() => !document.querySelector('dialog[open]'), null, { timeout: 10000 })
      await openConfirm(page)
      const reopened = await dialogPrimary(page).getAttribute('aria-disabled')
      const kept = await page.locator('dialog[open] #delete-account-confirm').inputValue()
      step('rearm', reopened === 'true' && kept === '',
           `reopened after Cancel: aria-disabled=${JSON.stringify(reopened)}, field holds ${JSON.stringify(kept)}`)
      await page.locator('dialog[open] #delete-account-confirm').fill(PHRASE)
    })
    if (armedPosts !== 0) step('armed-quiet', false, `${armedPosts} POST(s) left the browser on a wrong phrase`)

    // ── CONFIRMED. The wire is read straight afterwards: the deadline is a database fact. The
    //    server-action POST itself is captured on the way out, for the replay two steps down.
    let action = null
    page.on('request', (r) => {
      const h = r.headers()
      if (!action && r.method() === 'POST' && h['next-action']) action = { url: r.url(), headers: h, body: r.postData() }
    })
    await dialogPrimary(page).click()
    await page.waitForURL(/\/restore/, { timeout: 60000 }).catch(() => null)
    const landed = page.url()
    const profile = await profileRow()
    const snapshot = await snapshotRow()
    const gap = profile.purge_after && profile.deleted_at ? daysBetween(profile.purge_after, profile.deleted_at) : null
    step('request',
      landed.includes('/restore') && Boolean(profile.deleted_at) && gap === DAYS &&
      snapshot.purge_after === profile.purge_after && Boolean(snapshot.download_offered_at),
      `landed on ${landed}; deleted_at set = ${Boolean(profile.deleted_at)}, ` +
      `purge_after - deleted_at = ${gap} days (expected ${DAYS}); ` +
      `snapshot purge_after equal = ${snapshot.purge_after === profile.purge_after}, ` +
      `download_offered_at set = ${Boolean(snapshot.download_offered_at)}`)

    // ── THE SERVER'S OWN PHRASE CHECK. The greyed button is a courtesy; this is the guard, and
    //    it is reached here the way a forged request reaches it: the captured POST, replayed with
    //    A's own cookies and a wrong phrase in its body. Deleting `matchesPhrase` from the action
    //    is green under every local check — this is the one that would go red.
    const forwarded = {}
    for (const name of ['next-action', 'content-type', 'next-router-state-tree', 'accept', 'origin', 'referer']) {
      if (action && action.headers[name]) forwarded[name] = action.headers[name]
    }
    const forgeable = Boolean(action && action.body && action.body.includes(PHRASE))
    const forged = forgeable
      ? await a.request.post(action.url, { headers: forwarded, data: action.body.split(PHRASE).join(PHRASE.slice(0, PHRASE.length - 4)) })
      : null
    const forgedText = forged ? await forged.text() : ''
    step('server-phrase',
      forgeable && forged.status() === 200 && forgedText.includes('wrong_phrase') && !forgedText.includes('NEXT_REDIRECT'),
      forgeable
        ? `replayed with a wrong phrase -> HTTP ${forged.status()}; answered wrong_phrase = ${forgedText.includes('wrong_phrase')}; redirected = ${forgedText.includes('NEXT_REDIRECT')}`
        : `the server-action POST was not captured (next-action header seen = ${Boolean(action)}, body carries the phrase = ${Boolean(action && action.body && action.body.includes(PHRASE))})`)

    // ── A SECOND CALL IS NOT A SECOND WINDOW — the `null` that stops a second email.
    const aToken = await accessTokenOf(a, 'A')
    const again = await rpc('request_account_deletion', aToken)
    const afterSecond = await profileRow()
    step('second-request',
      again.status === 200 && again.body === null && afterSecond.purge_after === profile.purge_after,
      `HTTP ${again.status}, body ${JSON.stringify(again.body)}; deadline unchanged = ` +
      `${afterSecond.purge_after === profile.purge_after}`)

    // ── B: a REAL second session, and the definer function's WHERE clause executed rather than
    //    reasoned. B's restore must not touch A.
    const b = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    b.setDefaultNavigationTimeout(NAV_TIMEOUT)
    const bPage = await b.newPage()
    await bPage.goto(CONFIRM_B, { waitUntil: 'load' })
    await bPage.goto(`${APP}/account`, { waitUntil: 'load' })
    const bToken = await accessTokenOf(b, 'B')
    const bRestore = await rpc('restore_account', bToken)
    const afterB = await profileRow()
    step('other-user-rpc',
      bRestore.status === 200 && bRestore.body === false &&
      afterB.deleted_at === profile.deleted_at && afterB.purge_after === profile.purge_after,
      `B's restore_account() -> HTTP ${bRestore.status} ${JSON.stringify(bRestore.body)}; ` +
      `A untouched = ${afterB.purge_after === profile.purge_after}`)

    // ── THE DOOR. Every page under the shell sends a pending account back here.
    const atRoot = await page.goto(`${APP}/`, { waitUntil: 'load' })
    const rootUrl = page.url()
    await page.goto(`${APP}/account`, { waitUntil: 'load' })
    const accountUrl = page.url()
    step('door', rootUrl.includes('/restore') && accountUrl.includes('/restore'),
         `/ -> ${rootUrl} (HTTP ${atRoot && atRoot.status()}); /account -> ${accountUrl}`)

    // ── the page itself: the date, and the snapshot with its SITE — which is also the proof that
    //    `sites(title, url)` embeds through the foreign key under RLS.
    const heading = await page.locator('h1').first().textContent().catch(() => null)
    const bodyText = await page.locator('body').innerText()
    const download = page.getByRole('link', { name: 'Download', exact: true }).first()
    step('restore-page',
      (heading || '').includes('set to be deleted') &&
      /permanently deleted on \w{3} \d{1,2}, \d{4}/.test(bodyText) &&
      bodyText.includes(SITE_TITLE) && /captured \w{3} \d{1,2}, \d{4}/.test(bodyText) &&
      await download.count() > 0,
      `heading ${JSON.stringify(heading)}; the site title is on the page = ${bodyText.includes(SITE_TITLE)}; ` +
      `Download links = ${await download.count()}`)

    // ── AD-13: a 303 to a short-lived signed URL, and the URL really serves the bytes.
    const href = await download.getAttribute('href')
    const hop = await a.request.get(`${APP}${href}`, { maxRedirects: 0 })
    const signedUrl = hop.headers()['location'] || ''
    const served = signedUrl ? await fetch(signedUrl) : null
    const bytes = served ? await served.text() : ''
    step('download',
      hop.status() === 303 && signedUrl.includes(`/storage/v1/object/sign/${'site-snapshots'}/`) &&
      served && served.status === 200 && bytes === SNAPSHOT_BODY,
      `${href} -> HTTP ${hop.status()}; signed URL is a site-snapshots sign URL = ` +
      `${signedUrl.includes('/storage/v1/object/sign/site-snapshots/')}; ` +
      `GET it -> HTTP ${served && served.status}; the bytes match = ${bytes === SNAPSHOT_BODY}`)

    // ── B asks for A's snapshot: 404, never a 403 that would confirm the id exists.
    const bHop = await b.request.get(`${APP}${href}`, { maxRedirects: 0 })
    step('download-other', bHop.status() === 404,
         `B asked for A's snapshot -> HTTP ${bHop.status()} (a 403 would confirm the id exists)`)

    const anonContext = await browser.newContext()
    const anonHop = await anonContext.request.get(`${APP}${href}`, { maxRedirects: 0 })
    const anonWhere = anonHop.headers()['location'] || ''
    step('download-signed-out',
      anonHop.status() === 303 && anonWhere.includes('/sign-in'),
      `no cookies -> HTTP ${anonHop.status()} to ${JSON.stringify(anonWhere)}`)
    // The page outside `(authed)` guards itself: `signedIn()` is a page redirect, not a 303.
    const anonPage = await anonContext.request.get(`${APP}/restore`, { maxRedirects: 0 })
    const anonPageWhere = anonPage.headers()['location'] || ''
    step('restore-signed-out',
      [302, 303, 307, 308].includes(anonPage.status()) && anonPageWhere.includes('/sign-in'),
      `/restore with no cookies -> HTTP ${anonPage.status()} to ${JSON.stringify(anonPageWhere)}`)
    await anonContext.close()

    await axeAt(page, 'restore')

    // ── RESTORE. One click, and both columns clear on the profile AND on the snapshot.
    await page.getByRole('button', { name: 'Restore account', exact: true }).click()
    await page.waitForURL(/restored=1/, { timeout: 60000 }).catch(() => null)
    const restoredUrl = page.url()
    const said = await page.locator('[role="status"]', { hasText: 'Welcome back' })
      .first().textContent({ timeout: 20000 }).catch(() => null)
    const afterRestore = await profileRow()
    const snapshotAfter = await snapshotRow()
    step('restore',
      restoredUrl.includes('restored=1') &&
      (said || '').includes('Your account is restored — nothing was deleted.') &&
      afterRestore.deleted_at === null && afterRestore.purge_after === null &&
      snapshotAfter.purge_after === null,
      `landed on ${restoredUrl}; the banner said ${JSON.stringify(said)}; ` +
      `profile cleared = ${afterRestore.deleted_at === null && afterRestore.purge_after === null}; ` +
      `snapshot cleared = ${snapshotAfter.purge_after === null}`)

    await axeAt(page, 'restored')

    // ── A RESTORED ACCOUNT AT /restore is sent home, never shown a deletion that is not happening.
    await page.goto(`${APP}/restore`, { waitUntil: 'load' })
    const cleanUrl = page.url()
    step('restore-clean', !cleanUrl.includes('/restore'), `/restore for a clean account -> ${cleanUrl}`)

    // ── A's OWN bearer opens the window again, which is the second control the spec names and the
    //    setup for the two steps below.
    const reopened = await rpc('request_account_deletion', aToken)
    const reopenedRow = await profileRow()
    const reopenedGap = reopenedRow.purge_after && reopenedRow.deleted_at
      ? daysBetween(reopenedRow.purge_after, reopenedRow.deleted_at) : null
    step('authed-rpc',
      reopened.status === 200 && typeof reopened.body === 'string' && reopenedGap === DAYS,
      `A's own bearer -> HTTP ${reopened.status}, ${JSON.stringify(reopened.body)}; ` +
      `purge_after - deleted_at = ${reopenedGap} days`)

    // ── FR-A5's "on signing in": a FRESH magic link for a pending A lands on the window's page.
    const link = await magicLink(A_EMAIL)
    await page.goto(link.url, { waitUntil: 'load' })
    const afterLink = page.url()
    step('magic-link-during',
      link.id === A_ID && afterLink.includes('/restore'),
      `minted for ${link.id === A_ID ? 'A' : JSON.stringify(link.id)}; landed on ${afterLink}`)

    // ── PAST THE DEADLINE. The secret key moves it into the past — the one state no browser step
    //    could reach in fourteen days — and the page and the function must agree about it.
    const moved = await wire(`/profiles?user_id=eq.${A_ID}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({ purge_after: new Date(Date.now() - 86400000).toISOString() }),
    })
    await page.goto(`${APP}/restore`, { waitUntil: 'load' })
    const pastHeading = await page.locator('h1').first().textContent().catch(() => null)
    const restoreButtons = await page.getByRole('button', { name: 'Restore account', exact: true }).count()
    const refused = await rpc('restore_account', aToken)
    const stillPending = await profileRow()
    step('past-deadline',
      moved.status < 300 && (pastHeading || '').includes('being deleted') && restoreButtons === 0 &&
      refused.status === 200 && refused.body === false && Boolean(stillPending.deleted_at),
      `PATCH purge_after -> HTTP ${moved.status}; heading ${JSON.stringify(pastHeading)}; ` +
      `Restore buttons = ${restoreButtons}; restore_account() -> ${JSON.stringify(refused.body)}; ` +
      `still pending = ${Boolean(stillPending.deleted_at)}`)

    await axeAt(page, 'past')

    await b.close()
  } catch (error) {
    step('threw', false, String((error && error.message) || error).slice(0, 400))
  } finally {
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

    with tempfile.TemporaryDirectory() as work:
        script = os.path.join(work, 'account-deletion.js')
        open(script, 'w').write(BROWSER_JS)
        # SECRETS GO IN THE ENVIRONMENT, never in argv: argv is world-readable in `ps`.
        child = dict(os.environ, PW_DIR=pw, APP_URL=APP, AXE_PATH=axe_path() or '', **cfg)
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


def delete_phrase():
    """The phrase the dialog demands, read out of the app's own module rather than retyped: a
    harness that types its own copy proves nothing about the one the user is shown."""
    source = open(DELETION_RULE_TS, encoding='utf-8').read()
    found = re.search(r"DELETE_PHRASE\s*=\s*'([^']+)'", source)
    if not found:
        sys.exit('  FAIL  DELETE_PHRASE is not in account/deletion-rule.ts; the harness has no phrase to type')
    return found.group(1)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--to', metavar='ADDRESS',
                    help='make fixture user A this address, so the one real send of the run lands '
                         'in an inbox a human can open (DW-22: no key here can read one)')
    ap.add_argument('--check', action='store_true',
                    help='plumbing only: keys present, playwright and axe resolvable, one real '
                         'admin create-read-delete and one Storage put-list-delete under a harness '
                         'prefix. No browser and no UI, so it runs before the story is deployed.')
    args = ap.parse_args()

    env = load_env()
    needed = ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', 'SUPABASE_PUBLISHABLE_KEY']
    missing = [k for k in needed if not env.get(k)]
    if missing:
        print(f'  FAIL  tools/probe/.env is missing: {", ".join(missing)}')
        return 1
    sb, secret = env['SUPABASE_URL'], env['SUPABASE_SECRET_KEY']

    admin = Admin(sb, secret)
    stamp = int(time.time())
    a_email = args.to or f'deletion-harness-{stamp}@inflozo.com'
    b_email = f'deletion-harness-{stamp}-b@inflozo.com'

    swept = admin.sweep_stale_fixtures(FIXTURE)
    if swept:
        print(f'  swept {swept} stale deletion-harness-* user(s) an earlier run left behind')
    users = admin.users()
    if users is None:
        print('  FAIL  the Admin-API user count could not be read, so the cleanup has no control.')
        return 1
    before = len(users)
    print(f'  users before: {before}')
    if args.to and any((u.get('email') or '').lower() == args.to.lower() for u in users):
        print('  FAIL  --to names an address that already has an account, so the run would delete a real '
              'one. Pick another address, or delete that user in the Supabase dashboard first.')
        return 1

    created, key, failed = [], None, False
    try:
        for email in (a_email, b_email):
            status, user = admin.call('POST', '/admin/users', {'email': email, 'email_confirm': True})
            if status not in (200, 201) or not user.get('id'):
                print(f'  FAIL  could not create a fixture user: HTTP {status}')
                return 1
            created.append(user['id'])
        a_id, b_id = created
        print('  fixture users A and B created')

        # A's site, its pre-Inflozo snapshot, and the object the snapshot points at. Seeded with
        # the SERVICE ROLE, because `site_snapshots` is read-only to its owner and the bucket has
        # no policy at all (AD-32) — which is exactly what the download route exists to bridge.
        site_title = f'Deletion Harness {stamp}'
        status, site = rest(sb, secret, 'POST', '/sites',
                            {'user_id': a_id, 'url': f'https://harness-{stamp}.example', 'title': site_title},
                            prefer='return=representation')
        if status not in (200, 201) or not site:
            print(f'  FAIL  could not seed the sites row: HTTP {status} {json.dumps(site)[:200]}')
            return 1
        site_id = site[0]['id']

        key = f'{a_id}/{site_id}/theme.zip'
        status, body = storage_put(sb, secret, key, SNAPSHOT_BYTES)
        if status not in (200, 201):
            print(f'  FAIL  could not put the snapshot object: HTTP {status} {json.dumps(body)[:200]}')
            return 1

        status, snapshot = rest(sb, secret, 'POST', '/site_snapshots',
                                {'user_id': a_id, 'site_id': site_id,
                                 'storage_path': f'{BUCKET}/{key}', 'theme_name': 'casper'},
                                prefer='return=representation')
        if status not in (200, 201) or not snapshot:
            print(f'  FAIL  could not seed the site_snapshots row: HTTP {status} {json.dumps(snapshot)[:200]}')
            return 1
        snapshot_id = snapshot[0]['id']

        # ONE project and no assets, so the `sentence` step observes the counts path where it
        # renders — with an empty account the dialog's fallback sentence would render either way.
        status, project = rest(sb, secret, 'POST', '/projects',
                               {'user_id': a_id, 'name': 'Deletion Harness',
                                'slug': f'deletion-harness-{stamp}', 'style_pack': {}},
                               prefer='return=representation')
        if status not in (200, 201) or not project:
            print(f'  FAIL  could not seed the projects row: HTTP {status} {json.dumps(project)[:200]}')
            return 1
        print('  fixture site, snapshot row, snapshot object and one project seeded')

        if args.check:
            pw, axe = playwright_dir(), axe_path()
            print(f'  playwright: {"resolved" if pw else "NOT FOUND"}')
            print(f'  axe-core:   {"resolved" if axe else "NOT FOUND"}')
            read, back = admin.call('GET', f'/admin/users/{a_id}')
            listed, found = storage_list(sb, secret, f'{a_id}/{site_id}')
            names = [o.get('name') for o in (found or [])] if isinstance(found, list) else []
            ok = read == 200 and back.get('id') == a_id and listed == 200 and names
            print(f'  {"PASS" if ok else "FAIL"}  admin round trip: create, read back ({read})')
            print(f'  {"PASS" if ok else "FAIL"}  storage round trip: put, list ({listed}) -> {names}')
            print(f'  the phrase the dialog demands: {delete_phrase()!r}')
            print(f'  DELETION_WINDOW_DAYS read from the app: {window_days()}')
            failed = not ok or not pw or not axe
        else:
            links = {}
            for who, email in (('A', a_email), ('B', b_email)):
                status, link = admin.call('POST', '/admin/generate_link',
                                          {'type': 'magiclink', 'email': email})
                if status != 200 or not link.get('hashed_token'):
                    print(f"  FAIL  generate_link ({who}'s sign-in link) answered HTTP {status}")
                    return 1
                links[who] = f'{APP}/auth/confirm?token_hash={link["hashed_token"]}&type=magiclink'
            steps = run_browser({
                'SB_URL': sb,
                'SB_SECRET': secret,
                'SB_PUBLISHABLE': env['SUPABASE_PUBLISHABLE_KEY'],
                'A_USER_ID': a_id,
                'A_EMAIL': a_email,
                'B_USER_ID': b_id,
                'CONFIRM_URL_A': links['A'],
                'CONFIRM_URL_B': links['B'],
                'SNAPSHOT_ID': snapshot_id,
                'SNAPSHOT_KEY': f'{BUCKET}/{key}',
                'SNAPSHOT_BODY': SNAPSHOT_BYTES.decode('latin-1'),
                'SITE_TITLE': site_title,
                'DELETE_PHRASE': delete_phrase(),
                'WINDOW_DAYS': str(window_days()),
                'TOKENS_RGB': json.dumps(tokens_rgb(FRAME_TOKENS)),
            })
            for s in steps:
                mark = 'RECORD' if s['ok'] is None else ('PASS' if s['ok'] else 'FAIL')
                print(f'  {mark:6} {s["name"]}: {s["detail"]}')
                if s['ok'] is False:
                    failed = True
    finally:
        # The object FIRST — deleting the user cascades the rows that point at it, and an object
        # nothing points at is exactly the leak this proves does not happen (AD-32's order).
        if key:
            status, _ = storage_delete(sb, secret, key)
            listed, left = storage_list(sb, secret, key.rsplit('/', 1)[0])
            remaining = len(left) if isinstance(left, list) else 'unreadable'
            print(f'  snapshot object deleted (HTTP {status}); the prefix now lists {remaining} object(s)')
            if remaining != 0:
                print('  FAIL  the snapshot object outlived its account.')
                failed = True
        for user_id in created:
            admin.call('DELETE', f'/admin/users/{user_id}', {})
        # The count is compared BEFORE any sweep of strays, so a user a step created by mistake is
        # reported as the leak it is rather than tidied away (the sibling harness's own note).
        after = admin.user_count()
        print(f'  fixture users deleted; users after: {after}')
        if after is None:
            print('  FAIL  the Admin-API user count could not be read after cleanup — unverified.')
            failed = True
        elif after != before:
            print('  FAIL  the user count did not return to where it started — a user leaked.')
            failed = True
        strays = admin.sweep_stale_fixtures(FIXTURE)
        if strays:
            print(f'  FAIL  {strays} stray deletion-harness-* user(s) existed after cleanup and were swept.')
            failed = True

    print('  RESULT: ' + ('FAILED' if failed else 'all steps passed'))
    return 1 if failed else 0


if __name__ == '__main__':
    sys.exit(main())
