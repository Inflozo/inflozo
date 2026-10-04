#!/usr/bin/env node
/**
 * FR-D18'S EDIT LOCK, ON THE REAL SITE, WITH TWO REAL SESSIONS (Story 5.17).
 *
 *   env $(grep -E '^(SUPABASE_URL|SUPABASE_SECRET_KEY|VERCEL_TOKEN|VERCEL_TEAM_ID)=' tools/probe/.env | xargs) \
 *     node tools/probe/run-verify-lock.cjs                                   # the deployed app.inflozo.com
 *   … APP_ORIGIN=http://localhost:3000 APP_PREFIX=/app node tools/probe/run-verify-lock.cjs   # a local build
 *
 * TWO BROWSER CONTEXTS OF ONE ACCOUNT, and that is the whole point: `projects.user_id` is one account and team seats
 * are out of v1, so the other editing context is ALWAYS the same person — another tab, another browser, another
 * device. Two Playwright contexts are two tabs that cannot share `sessionStorage`, which is exactly the shape the
 * lock is about.
 *
 * WHAT IT WALKS — every row of the spec's I/O matrix that has a screen:
 *   A holds · B opens and is a READER (B5a, the bar, the 55% sidebar, `commit()` refusing)
 *   B presses Request editing (R-98's swapped label) · A gets B5b, a POPOVER and not a modal, announced assertively
 *   A presses Hand over · A's edits go up FIRST, then A becomes the reader and B gains the lock
 *   B keeps the lock unanswered · A takes over from B5c, which opens on Wait and never itemises the loss
 *   B is displaced: the bar, the assertive sentence, and its journal cleared unconditionally
 *   A reloads and KEEPS the lock · B asks and A keeps editing, and B's SECOND ask still reaches A
 *   a take-over with nothing owed asks without a danger panel · a silent holder goes stale and is taken silently,
 *   and learns it when it can reach the server again
 *   Story 6.3: the reader's Style Pack list opens (a view) with every cell greyed and unclickable, beside the holder's live one
 *   Story 5.24e, last: a reload keeps the lock with the other session reading inside its gap, and a late leave changes
 *   nothing (DW-240) · a tab going with an edit owed and a slow flush keeps the lock for it (DW-244) · Sign out sends
 *   the owed edit and erases this browser's copy (R-214)
 *
 * EVERY EXPECTATION IS DERIVED FROM THE APP'S OWN MODULES (`apps/web/lib/lock.ts`'s `LOCK_COPY` and its constants),
 * never restated here — R-170's "one name for one thing" made checkable, and standing rule 4 applied to a string.
 * Node 24 is required for that: it type-strips the `.ts` the walk reads.
 *
 * ITS OWN THROWAWAY ACCOUNT and its own seeded project, both deleted in a `finally`, with the user count read before
 * and after so a leak is loud. No key is ever printed.
 */
const fs = require('node:fs')
const path = require('node:path')
const { pathToFileURL } = require('node:url')
const { chromium } = require('@playwright/test')

const APP = process.env.APP_ORIGIN || 'https://app.inflozo.com'
const PREFIX = process.env.APP_PREFIX ?? ''
const LOCAL = Boolean(process.env.APP_ORIGIN)
for (const key of ['SUPABASE_URL', 'SUPABASE_SECRET_KEY', ...(LOCAL ? [] : ['VERCEL_TOKEN', 'VERCEL_TEAM_ID'])]) {
  if (!process.env[key]) { console.error(`${key} is not set — read it from tools/probe/.env into this command's environment`); process.exit(2) }
}
const SB = process.env.SUPABASE_URL.replace(/\/$/, '')
const SECRET = process.env.SUPABASE_SECRET_KEY
const REPO = path.join(__dirname, '..', '..')
const at = (p) => `${APP}${PREFIX}${p}`

const results = []
/** `cardOn`'s deadline: two of the app's own heartbeats, set once `lib/lock.ts` is read (standing rule 4) */
let LOCK_BEATS_MS = 35_000
let fails = 0
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; return ok }
const note = (name, detail) => results.push(`note  ${name} — ${detail}`)
const record = note

const call = async (base, p, init = {}) => {
  const r = await fetch(`${SB}${base}${p}`, { ...init, headers: { apikey: SECRET, Authorization: `Bearer ${SECRET}`, 'Content-Type': 'application/json', Prefer: 'return=representation', ...(init.headers || {}) } })
  const text = await r.text()
  let body = {}
  try { body = text ? JSON.parse(text) : {} } catch {}
  return { status: r.status, body }
}
const admin = (p, init) => call('/auth/v1', p, init)
const users = async () => {
  const out = []
  for (let page = 1; ; page++) {
    const { status, body } = await admin(`/admin/users?page=${page}&per_page=200`)
    if (status !== 200) return null
    if (!body.users || body.users.length === 0) return out
    out.push(...body.users)
  }
}

/** The editor's whole lock surface, read off the page. Everything is read from the DOM rather than from the
 *  harness's own memory, so a component that renders nothing fails here rather than passing on a variable. */
const surface = (page) =>
  page.evaluate(() => {
    const bar = document.getElementById('editor-lock-bar')
    const card = document.getElementById('editor-lock-ask')
    const dialog = document.getElementById('editor-takeover-confirm')?.closest('dialog') ?? null
    const aside = document.getElementById('editor-controls')
    const said = document.getElementById('editor-said')
    const shout = document.getElementById('editor-announced')
    return {
      bar: bar && !bar.hidden ? bar.innerText.replace(/\s+/g, ' ').trim() : null,
      barButton: bar ? (bar.querySelector('button')?.innerText.replace(/\s+/g, ' ').trim() ?? null) : null,
      barBusy: bar ? bar.querySelector('button')?.getAttribute('aria-busy') : null,
      // B5b is a POPOVER: it exists in the document and is NOT a <dialog>, which is the frame's own note made checkable
      card: card ? card.innerText.replace(/\s+/g, ' ').trim() : null,
      cardIsDialog: card ? card.tagName === 'DIALOG' || card.closest('dialog') !== null : null,
      cardWidth: card ? getComputedStyle(card).width : null,
      dialogOpen: dialog ? dialog.open : null,
      dialogText: dialog && dialog.open ? dialog.innerText.replace(/\s+/g, ' ').trim() : null,
      dialogWidth: dialog ? getComputedStyle(dialog).width : null,
      dialogRadius: dialog ? getComputedStyle(dialog).borderTopLeftRadius : null,
      confirmFill: dialog ? getComputedStyle(document.getElementById('editor-takeover-confirm')).backgroundColor : null,
      focus: document.activeElement?.textContent?.trim() ?? null,
      sidebarOpacity: aside ? getComputedStyle(aside).opacity : null,
      sidebarReadonly: aside ? aside.hasAttribute('data-readonly') : null,
      sidebarDescribed: aside ? aside.getAttribute('aria-describedby') : null,
      // UX-DR12: the polite region stays polite and the assertive one is a SECOND element
      politeLive: said ? said.getAttribute('aria-live') : null,
      assertiveLive: shout ? shout.getAttribute('aria-live') : null,
      announced: shout ? shout.textContent.trim() : null,
      sameElement: said !== null && shout !== null && said === shout,
    }
  })

/** THE ROW AS THE DATABASE HOLDS IT, read through the app's own route under a real user session.
 *
 *  NOT THROUGH THE SECRET KEY, and that is not a preference: `edit_locks` is absent from the `service_role` grant
 *  loop (`…complete_schema.sql:1163-1177`), so the secret key cannot so much as `select` from it and returns
 *  NOTHING without saying so (`MEASUREMENTS.md` §50). A first writing of this harness read it that way and every
 *  row assertion passed or failed on `null` — a control that did not pass, which is not a result (standing rule 2).
 *
 *  A `beat` from a session id that holds nothing matches no row, so it writes nothing and the route falls through
 *  to its own re-read: this is a READ expressed in the one intent that already does one. */
const lockRow = (page, P) =>
  page.evaluate(
    async (url) => {
      const r = await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ intent: 'beat', session: 'harness-observer' }) })
      return r.ok ? (await r.json()).row : null
    },
    `${PREFIX}/projects/${P}/lock`,
  )

/** R-192 — the settings panel's EDITING controls, and how many still act. What only changes the VIEW is left out by
 *  design: the two things that carry `aria-expanded` — a group's header and a list item's opener, both of which open
 *  so what is set can be READ — the panel's own fold, and D5d's Preview-page row. A
 *  `contenteditable` field is live only while it says "true"; a form control while it is neither disabled, nor
 *  `aria-disabled`, nor read-only. */
const livePanel = (page) =>
  page.evaluate(() => {
    const aside = document.getElementById('editor-controls')
    if (!aside) return null
    const all = [...aside.querySelectorAll('input, select, textarea, button, [contenteditable]')]
    // …and a box's Cancel (`data-cancel`, the codebase's own mark): closing a box is not editing
    const editing = all.filter((e) => !e.hasAttribute('aria-expanded') && !e.hasAttribute('data-cancel') && !e.closest('[data-page-row]') && !/(Collapse|Expand|Show|Hide) (controls|settings)/i.test(e.getAttribute('aria-label') || ''))
    const live = (e) => (e.hasAttribute('contenteditable') ? e.getAttribute('contenteditable') === 'true' : !e.matches(':disabled') && e.getAttribute('aria-disabled') !== 'true' && !e.readOnly)
    return { editing: editing.length, live: editing.filter(live).length, sample: editing.filter(live).slice(0, 5).map((e) => (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 30)) }
  })

/** a Layers row, pressed by its name — a VIEW action a reader keeps */
const pickLayer = async (page, name) => {
  await page.locator('#editor-layers [data-layer-row]').filter({ hasText: name }).first().locator('button').first().click()
  await page.waitForTimeout(700)
}

/** the first group in the panel that is shut, opened — a VIEW action a reader keeps. Returns its header's words. */
const openAGroup = (page) =>
  page.evaluate(async () => {
    // a GROUP header (`kit/accordion.tsx` controls its `…-body`), never an item's opener
    const shut = document.querySelector('#editor-controls button[aria-expanded="false"][aria-controls$="-body"]')
    if (!shut) return { opened: null }
    shut.click()
    await new Promise((r) => setTimeout(r, 300))
    return { opened: shut.textContent.trim().slice(0, 30), expanded: shut.getAttribute('aria-expanded') }
  })

/** B5b ARRIVING, WAITED FOR AND NEVER SLEPT. The holder hears a request at its next beat, and a cold function on the
 *  nudge's write can push that past a fixed sleep (executed 2026-09-24: the card came ~3 s after an 18 s sleep, and
 *  every check on it failed on its absence). Two beats is the deadline; a card that never comes is still a FAIL,
 *  read by the checks that follow. */
const cardOn = (page) =>
  page.waitForSelector('#editor-lock-ask', { timeout: LOCK_BEATS_MS }).catch(() => null)

/** the part of the row that is a FACT about the lock, without the two ages, which move between two reads */
const held = (row) => (row === null ? null : { holder: row.holderSessionId, generation: row.generation, edits: row.unsyncedEdits, asked: row.nudgeRequestedBy })

/** The Layers rows, by name — the editor harness's own reader, so this walk needs no second selector. */
const layerNames = (page) =>
  page.evaluate(() => [...document.querySelectorAll('#editor-layers [data-layer-row]')].map((r) => r.querySelector('button').textContent))

/** ONE EDIT, in the shape `run-verify-editor.cjs` uses for exactly this purpose: a PAGE section deleted from its
 *  row's ⋯ menu. It is many operations and exactly ONE transaction (AD-16), which is the property the count this
 *  story surfaces is about — and a page row's Delete asks nothing, where a site-wide one would open FR-D5's confirm. */
const deleteLayer = async (page, name) => {
  await page.locator('#editor-layers [data-layer-row]').filter({ hasText: name }).getByRole('button', { name: `More for ${name}`, exact: true }).click()
  await page.waitForTimeout(350)
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page.waitForTimeout(700)
}

/** The seed's two PAGE sections this walk edits — read from the seed's own fixture, never restated. */
const A_EDIT = 'Newsletter — Inline Row'
const B_EDIT = 'Post Grid — Three Up'

async function main() {
  if (!LOCAL) {
    const { execSync } = require('node:child_process')
    const dirty = execSync('git status --porcelain -- packages apps tools/probe', { cwd: REPO, encoding: 'utf8' }).trim()
    if (dirty) throw new Error(`packages/, apps/ or tools/probe/ has uncommitted changes, so this checkout is not what ${APP} serves:\n${dirty}`)
    const head = execSync('git rev-parse HEAD', { cwd: REPO, encoding: 'utf8' }).trim()
    const answer = await fetch(`https://api.vercel.com/v13/deployments/${new URL(APP).host}?teamId=${process.env.VERCEL_TEAM_ID}`, { headers: { Authorization: `Bearer ${process.env.VERCEL_TOKEN}` } })
    const served = await answer.json().catch(() => ({}))
    if (!answer.ok) throw new Error(`Vercel answered ${answer.status} for ${new URL(APP).host}: ${served.error?.message ?? 'no message'}`)
    if (served.meta?.githubCommitSha !== head) throw new Error(`${APP} serves ${served.id ?? 'an unreadable deployment'}, built from ${served.meta?.githubCommitSha ?? 'no recorded commit'}, and this checkout is ${head}: push, wait for CI's deploy, then run this`)
    note('deployment', `${served.id} ${served.readyState}, built from ${head.slice(0, 8)} — this checkout's HEAD`)
  } else note('LOCAL RUN', `${APP}${PREFIX} — not a deployed result`)

  // THE APP'S OWN STRINGS AND CONSTANTS, so nothing below is a second copy of a sentence the owner ruled
  const LOCK = await import(pathToFileURL(path.join(REPO, 'apps/web/lib/lock.ts')).href)
  LOCK_BEATS_MS = LOCK.HEARTBEAT_MS * 2 + 5000
  const { seed } = await import(pathToFileURL(path.join(__dirname, 'seed-editor-project.mjs')).href)

  const all = await users()
  if (all === null) throw new Error('user list unreadable — no control for the cleanup')
  for (const u of all.filter((x) => /^lock-harness-\d+@inflozo\.com$/.test(x.email || ''))) await admin(`/admin/users/${u.id}`, { method: 'DELETE', body: '{}' })
  const before = (await users()).length

  const email = `lock-harness-${Date.now()}@inflozo.com`
  let browser = null
  let uid = null
  try {
    const made = await admin('/admin/users', { method: 'POST', body: JSON.stringify({ email, email_confirm: true }) })
    uid = made.body.id
    check('fixture — the account is created', made.status === 200 && !!uid, `HTTP ${made.status}`)
    // AUTOSAVE OFF FOR THIS ACCOUNT, so nothing here races the 3-minute timer. It ticks from each page's LOAD, not from
    // the edit, and a tick landing between B's edit and the take-over sends the very work the take-over is about
    // (executed 2026-09-24: this walk's own timeline drifted onto one). Every send below is then one the walk makes on
    // purpose — the hand-over's flush and B's ⌘S. The switch is FR-D10's own, `profiles.autosave_enabled`.
    const quiet = await call('/rest/v1', `/profiles?user_id=eq.${uid}`, { method: 'PATCH', body: JSON.stringify({ autosave_enabled: false }) })
    check('fixture — autosave is off for this account, so no timer races the walk', quiet.status === 200 && quiet.body?.[0]?.autosave_enabled === false, `HTTP ${quiet.status}`)
    const seeded = await seed({ email })
    check('fixture — "Pilot sections" seeded', seeded.created === true, seeded.id)
    const P = seeded.id
    // (read once a session exists — the row can only be read through one, see `lockRow`)

    const magic = async () => {
      const link = await admin('/admin/generate_link', { method: 'POST', body: JSON.stringify({ type: 'magiclink', email }) })
      if (link.status !== 200 || !link.body.hashed_token) throw new Error(`generate_link answered HTTP ${link.status}`)
      return at(`/auth/confirm?token_hash=${link.body.hashed_token}&type=magiclink`)
    }
    const editor = at(`/projects/${P}`)

    browser = await chromium.launch()
    // TWO CONTEXTS ARE TWO SESSIONS, because the tab's id lives in `sessionStorage` and a context has its own
    const ctxA = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const ctxB = await browser.newContext({ viewport: { width: 1440, height: 900 } })
    const A = await ctxA.newPage()
    const B = await ctxB.newPage()

    // ── A opens first and holds the lock ─────────────────────────────────────────────────────────────────────
    await A.goto(await magic(), { waitUntil: 'load' })
    await A.goto(editor, { waitUntil: 'load' })
    await A.waitForTimeout(2500)
    const heldByA = await lockRow(A, P)
    check('matrix "First opener": a plain INSERT, holder at lock_generation 1 (it is outside the INSERT grant, so it defaults)', heldByA !== null && heldByA.generation === 1, JSON.stringify(held(heldByA)))
    const aFirst = await surface(A)
    check('the holder sees NO bar, and its sidebar is not dimmed', aFirst.bar === null && aFirst.sidebarOpacity === '1' && aFirst.sidebarReadonly === false, JSON.stringify({ bar: aFirst.bar, opacity: aFirst.sidebarOpacity }))
    check('UX-DR12: #editor-said is still POLITE, and the assertive region is a SECOND element', aFirst.politeLive === 'polite' && aFirst.assertiveLive === 'assertive' && aFirst.sameElement === false, JSON.stringify({ polite: aFirst.politeLive, assertive: aFirst.assertiveLive }))

    // A makes one edit that has not gone up yet
    check('fixture — the seed\'s rows are on screen', (await layerNames(A)).includes(A_EDIT) && (await layerNames(A)).includes(B_EDIT), (await layerNames(A)).join(' | '))
    await deleteLayer(A, A_EDIT)
    check(`A has one unsynced edit: "${A_EDIT}" is off its canvas`, !(await layerNames(A)).includes(A_EDIT))
    await A.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
    const beaten = await lockRow(A, P)
    check('matrix "Heartbeat": the beat carries AD-16\'s count — ONE edit for a gesture of many operations', beaten !== null && beaten.unsyncedEdits === 1, JSON.stringify(held(beaten)))

    /* ── matrix "Same session reloads" — the row the walk did not have, and the defect it caught ─────────────
     *
     * A CUSTOMER'S OWN F5 MUST NOT COST THEM THE EDITOR. `pagehide` releases on the way out and that DELETE lands
     * AFTER the new page's server render, so the first beat matches no row; before the fix the session then sat
     * reading B5a's bar — "You are editing this site somewhere else" — about its OWN tab for a whole ~15 s
     * heartbeat, with every edit silently refused (measured on app.inflozo.com at d895c183; it is what made step 93
     * of run-verify-editor.cjs fail). Two seconds is the assertion: a round trip, not a heartbeat. */
    // the page's own policy, watched across the reload: a refusal must be loud, never a quiet pass. (Until Story 5.24e an
    // inline pre-paint script masked the reader's bar here; DW-242 removed it as dead — the shell mounts in the browser
    // alone since Story 5.22 and recognises itself in a layout effect, before its first paint.)
    await A.addInitScript(() => {
      window.__violations = []
      document.addEventListener('securitypolicyviolation', (e) => window.__violations.push(`${e.violatedDirective} ${e.blockedURI || 'inline'}`))
    })
    await A.reload({ waitUntil: 'load' })
    // SAMPLED, NOT GLANCED AT: the bar must never be SEEN, not for a frame. One look at 2.5 s passed while the bar
    // flashed at ~1 s on every navigation (executed 2026-09-24 — reader at 1 s, holder by 2 s, five of five). So: VISIBLE
    // samples fail, and one in the DOM but not visible is recorded (none is expected since DW-242: no server frame draws
    // the bar any more).
    let flashed = 0
    let masked = 0
    for (const t0 = Date.now(); Date.now() - t0 < 3000; ) {
      const bar = await A.evaluate(() => {
        const el = document.getElementById('editor-lock-bar')
        return el === null ? 'absent' : el.checkVisibility() ? 'visible' : 'masked'
      })
      if (bar === 'visible') flashed++
      if (bar === 'masked') masked++
      await A.waitForTimeout(100)
    }
    const aViolations = await A.evaluate(() => window.__violations ?? null)
    record('the server\'s first frame after the reload', `${masked} sample(s) held the reader's bar in the DOM, masked; ${flashed} showed it`)
    check('…and the page\'s own policy refused nothing across the reload',
      Array.isArray(aViolations) && aViolations.length === 0, JSON.stringify(aViolations))
    const aBack = await surface(A)
    const backRow = await lockRow(A, P)
    check('matrix "Same session reloads": the lock is KEPT — no bar at its own reflection, the sidebar undimmed, and it is editing within a round trip rather than a heartbeat',
      flashed === 0 && aBack.bar === null && aBack.sidebarOpacity === '1' && backRow !== null && backRow.holderSessionId === beaten.holderSessionId,
      JSON.stringify({ flashedInSamples: flashed, bar: aBack.bar, opacity: aBack.sidebarOpacity, row: held(backRow) }))
    check('…and the reload took NOTHING from anybody: the generation did not move (it is the same session, not a take-over)',
      backRow !== null && backRow.generation === beaten.generation, JSON.stringify({ was: beaten.generation, now: backRow?.generation }))
    check('…and the reload kept A\'s UNSYNCED work: the generation never moved, so nothing cleared the journal',
      !(await layerNames(A)).includes(A_EDIT) && (await lockRow(A, P))?.unsyncedEdits === 1, (await layerNames(A)).join(' | '))

    // ── B opens second and is a reader ───────────────────────────────────────────────────────────────────────
    await B.goto(await magic(), { waitUntil: 'load' })
    await B.goto(editor, { waitUntil: 'load' })
    // SERVER TRUTH AT FIRST PAINT, SAMPLED: a reader must never see an editable shell, not for a frame, before its own
    // `acquire` answers — `read.ts` hands the row over above the boundary for exactly this. One look at 2.5 s could not
    // tell that from "read-only after a round trip" (review, 2026-09-24), so the bar is read every ~100 ms from load.
    // Since Story 5.22 the shell mounts in the browser alone, so the first samples can hold the server's SKELETON — no
    // editor at all, editable or not. What may never be seen is the SHELL without the bar; a skeleton sample is recorded
    // (Story 5.24e: this row failed on one skeleton sample at a run against HEAD, the walk not having been run since 5.22).
    let bAbsent = 0
    let bSkeleton = 0
    let bSamples = 0
    for (const t0 = Date.now(); Date.now() - t0 < 2000; ) {
      const bar = await B.evaluate(() => {
        const el = document.getElementById('editor-lock-bar')
        if (el !== null && el.checkVisibility()) return 'visible'
        return document.getElementById('editor-layers') === null ? 'skeleton' : 'absent'
      })
      bSamples++
      if (bar === 'absent') bAbsent++
      if (bar === 'skeleton') bSkeleton++
      await B.waitForTimeout(100)
    }
    record('the reader\'s first samples', `${bSkeleton} of ${bSamples} held the skeleton, before the shell mounted`)
    check('the reader is a reader from its FIRST frame: the shell was never on screen without the bar, before its own acquire answered',
      bSamples > bSkeleton && bAbsent === 0, `${bAbsent} of ${bSamples} samples drew the shell with no bar`)
    await B.waitForTimeout(500)
    const bRead = await surface(B)
    check('matrix "Second opener": B5a\'s bar, in the ruled words (R-189 — it says WHERE, never WHO)', (bRead.bar ?? '').includes(LOCK.LOCK_COPY.reading), bRead.bar)
    check('B5a: Request editing is a real button on the right', bRead.barButton === LOCK.LOCK_COPY.request, bRead.barButton)
    check('B5a: the settings sidebar dims to 55%, stays readable and is DESCRIBED by the bar\'s own sentence (never hidden, never `inert`)', bRead.sidebarOpacity === '0.55' && bRead.sidebarReadonly === true && bRead.sidebarDescribed === 'editor-lock-reason', JSON.stringify({ opacity: bRead.sidebarOpacity, described: bRead.sidebarDescribed }))
    check('nobody is named anywhere on the reader\'s screen', !/Rosa|Dai|message /i.test(bRead.bar ?? ''), bRead.bar)
    check('the second opener wrote NOTHING: A still holds it at generation 1', JSON.stringify(held(await lockRow(B, P))) === JSON.stringify(held(beaten)), JSON.stringify(held(await lockRow(B, P))))

    // the read-only guard, proved on the DOCUMENT and not on the screen: nothing B does reaches the server. Since
    // R-192 the ⋯ menu that used to carry this attempt is disabled — the stronger guarantee — so the attempt goes the
    // one way a reader still has: pick the section (a view action) and press Delete, the `remove` shortcut.
    const revisionBefore = (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision
    const rowsBefore = await layerNames(B)
    await pickLayer(B, B_EDIT)
    await B.keyboard.press('Delete')
    await B.waitForTimeout(2000)
    check('matrix "Second opener": commit() REFUSES — the row does not move, not even for a frame', JSON.stringify(await layerNames(B)) === JSON.stringify(rowsBefore), (await layerNames(B)).join(' | '))
    check('…and nothing B did moved the revision', (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision === revisionBefore)

    /* ── R-192 (the owner's finding, 2026-09-24): in read-only EVERY EDITING CONTROL IS DISABLED, and reading still
     * works. Each negative has its positive: "0 live in B" is read beside A's panel for the same section, which must
     * find live controls, and "⌘K opens nothing in B" beside ⌘K opening the picker in A. */
    const MOD = process.platform === 'darwin' ? 'Meta' : 'Control'
    await pickLayer(B, B_EDIT)
    const bGroup = await openAGroup(B)
    await pickLayer(A, B_EDIT)
    await openAGroup(A)
    const [bPanel, aPanel] = [await livePanel(B), await livePanel(A)]
    check('R-192 control: the HOLDER\'s panel for the same section has live editing controls — so a zero below is a finding, not an empty query',
      aPanel !== null && aPanel.live > 0, JSON.stringify(aPanel))
    check('R-192: the READER can still select a section and open a group to read what is set — reading is not editing',
      bPanel !== null && bPanel.editing > 0 && (bGroup.opened === null || bGroup.expanded === 'true'), JSON.stringify({ group: bGroup, editing: bPanel?.editing }))
    check('R-192: in the reader\'s panel NOTHING that edits is live — fields, switches, pickers, the {} and link buttons, the rich field, Reset',
      bPanel !== null && bPanel.live === 0, JSON.stringify(bPanel))
    const bChrome = await B.evaluate(() => {
      const more = [...document.querySelectorAll('#editor-layers button[aria-label^="More for"]')]
      const off = (id) => { const el = document.getElementById(id); return el === null ? 'absent' : el.matches(':disabled') || el.getAttribute('aria-disabled') === 'true' }
      return { more: more.length, moreOff: more.every((b) => b.matches(':disabled')), add: off('editor-add-section'), remix: off('editor-remix'), undo: off('editor-undo'), redo: off('editor-redo') }
    })
    check('R-192: Layers\' ⋯ menus, + Add section, Site Remix, Undo and Redo are all unavailable to the reader',
      bChrome.more > 0 && bChrome.moreOff && bChrome.add !== false && bChrome.remix !== false && bChrome.undo === true && bChrome.redo === true, JSON.stringify(bChrome))
    await B.frameLocator('section[aria-label="Canvas"] iframe').locator('#canvas > *').nth(1).hover({ position: { x: 60, y: 40 } }).catch(() => {})
    await B.waitForTimeout(600)
    const bPill = await B.evaluate(() => {
      const pill = document.querySelector('[data-section-pill]')
      if (!pill) return null
      const buttons = [...pill.querySelectorAll('button')]
      return { buttons: buttons.length, allOff: buttons.every((b) => b.matches(':disabled')), grip: !!pill.querySelector('[title="Drag to reorder"]') }
    })
    check('R-192: the section pill\'s actions are disabled for the reader and its drag grip is absent — the pill still names the section',
      bPill !== null && bPill.buttons > 0 && bPill.allOff && !bPill.grip, JSON.stringify(bPill))
    const pickerOpen = (page) => page.evaluate(() => document.querySelector('dialog[aria-label="Add a section"]')?.open === true)
    await A.keyboard.press(`${MOD}+k`)
    await A.waitForTimeout(700)
    const aPicker = await pickerOpen(A)
    await A.keyboard.press('Escape')
    await A.waitForTimeout(400)
    await B.keyboard.press(`${MOD}+k`)
    await B.waitForTimeout(700)
    const bPicker = await pickerOpen(B)
    check('R-192: an editing SHORTCUT does nothing for the reader — ⌘K opens the section picker in A and nothing in B',
      aPicker === true && bPicker === false, JSON.stringify({ holder: aPicker, reader: bPicker }))
    if (bPicker) await B.keyboard.press('Escape')

    /* ── STORY 6.3 (R-192): THE STYLE PACK LIST OPENS FOR A READER — it is a view — AND EVERY CELL IS GREYED AND
     * UNCLICKABLE: choosing is an edit. Its positive is the holder's list for the same project, whose cells are live; and
     * a press on a reader's cell moves neither the canvas nor the revision. */
    const listOf = async (page) => {
      // nothing selected, so the panel is the rest panel and its Style Pack card carries Change
      await page.locator('section[aria-label="Canvas"]').focus()
      await page.keyboard.press('Escape')
      await page.waitForTimeout(300)
      await page.locator('#style-pack-change').click()
      await page.waitForTimeout(300)
      return page.evaluate(() => {
        const cells = [...document.querySelectorAll('#editor-controls [data-style-pack-roster] [data-style-pack]')]
        return { cells: cells.length, live: cells.filter((c) => !c.matches(':disabled')).length, head: document.getElementById('editor-panel-name')?.textContent ?? null }
      })
    }
    const presets63 = JSON.parse(fs.readFileSync(path.join(REPO, 'packages', 'library', 'packs', 'packs.json'), 'utf8')).presets
    const [aList, bList] = [await listOf(A), await listOf(B)]
    const wears63 = (page) => page.evaluate(() => document.querySelector('section[aria-label="Canvas"] iframe')?.dataset.pack ?? null)
    const before63 = { pack: await wears63(B), revision: (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision }
    // a press the browser itself refuses: a disabled button takes no click, so nothing reaches the editor
    await B.evaluate((id) => document.querySelector(`#editor-controls [data-style-pack="${id}"]`)?.click(), presets63[presets63.length - 1].id)
    await B.waitForTimeout(1500)
    const after63 = { pack: await wears63(B), revision: (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision }
    check('Story 6.3 (R-192) control: the HOLDER\'s Style Pack list has every preset, each live',
      aList.cells === presets63.length && aList.live === presets63.length, JSON.stringify(aList))
    check('Story 6.3 (R-192): the READER\'s Change opens the list — a view — and every cell is greyed and unclickable, so a press moves neither the canvas nor the revision',
      bList.cells === presets63.length && bList.live === 0 && bList.head === 'Style Pack' && after63.pack === before63.pack && after63.revision === before63.revision,
      JSON.stringify({ bList, before63, after63 }))

    /* ── STORY 6.4 (R-192): AND EVERY DOOR TO EDITING THE PACK — each pencil, "+ New pack", both font rows, every row and
     * Pill radius — is greyed and unclickable for the reader, live for the holder; a forced press on a pencil, a row and
     * "+ New pack" opens nothing and moves neither the canvas nor the revision. */
    const doorsOf = (page) => page.evaluate(() => {
      const doors = [...document.querySelectorAll('#editor-controls [data-style-pack-roster] :is([data-edit-pack], #style-pack-new, #style-pack-heading-font, #style-pack-body-font, [data-style-pack-rows] [role="radio"], #style-pack-pill button)')]
      return { doors: doors.length, live: doors.filter((d) => !d.matches(':disabled')).length, rows: document.querySelectorAll('#editor-controls [data-style-pack-rows] [role="radiogroup"]').length }
    })
    const [aDoors, bDoors] = [await doorsOf(A), await doorsOf(B)]
    const accent64 = (page) => page.evaluate(() => getComputedStyle(document.querySelector('section[aria-label="Canvas"] iframe').contentDocument.documentElement).getPropertyValue('--site-width').trim())
    const before64 = { width: await accent64(B), revision: (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision }
    // FORCED: a click on a disabled control is never dispatched, so the greying alone would answer this. The fieldsets'
    // and the controls' own `disabled` are lifted for the three presses and put back, and what refuses is the wall under
    // the greying — the handlers' lock guard and `commit`'s (the review, 2026-10-04).
    const forced64 = await B.evaluate(() => {
      const lifted = [...document.querySelectorAll('#editor-controls :is(fieldset, button):disabled')].filter((el) => el.disabled)
      for (const el of lifted) el.disabled = false
      const targets = ['[data-edit-pack]', '#style-pack-new', '#style-pack-width [role="radio"][aria-checked="false"]'].map((s) => document.querySelector(`#editor-controls ${s}`))
      const pressable = targets.filter((el) => el && !el.matches(':disabled')).length
      for (const el of targets) el?.click()
      for (const el of lifted) el.disabled = true
      return { lifted: lifted.length, pressable }
    })
    await B.waitForTimeout(1500)
    const after64 = { width: await accent64(B), revision: (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision, dialog: await B.evaluate(() => document.querySelector('dialog[data-pack-editor]')?.open === true) }
    check('Story 6.4 (R-192) control: the HOLDER\'s pencils, "+ New pack", font rows and rows are all live',
      aDoors.doors > presets63.length && aDoors.live === aDoors.doors && aDoors.rows > 0, JSON.stringify(aDoors))
    check('Story 6.4 (R-192): the READER\'s pencils, "+ New pack", font rows and rows are greyed and unclickable — a forced press opens nothing and moves neither the canvas nor the revision',
      bDoors.doors === aDoors.doors && bDoors.live === 0 && forced64.pressable === 3 && !after64.dialog && after64.width === before64.width && after64.revision === before64.revision,
      JSON.stringify({ bDoors, forced64, before64, after64 }))
    for (const page of [A, B]) {
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    /* ── matrix "Keep editing" — and the defect the audit found under it ─────────────────────────────────────
     *
     * B asks and A keeps editing. Then B asks AGAIN, below, and that second request must reach A. Before the fix it
     * never did: the holder dismissed a request by the asking TAB's id, so one Keep editing silenced that tab for
     * good, and B was then offered a take-over for a request A had never been shown. */
    await B.getByRole('button', { name: LOCK.LOCK_COPY.request, exact: true }).click()
    await B.waitForTimeout(2500)
    const bAsking = await surface(B)
    check('matrix "Request editing": the reader shows its waiting state — Asking…, aria-busy and still a button, never `disabled` (R-98)',
      bAsking.barButton === LOCK.LOCK_COPY.requesting && bAsking.barBusy === 'true', JSON.stringify({ button: bAsking.barButton, busy: bAsking.barBusy }))
    await cardOn(A)
    check('fixture — the first request reached A', (await surface(A)).card !== null)
    await A.getByRole('button', { name: LOCK.LOCK_COPY.keep, exact: true }).click()
    // THE POINTER MUST LEAVE THE CARD. The next card mounts in the same fixed corner, and a pointer resting on it is
    // PRESENCE, which restarts the countdown on every tick (F-079 — the owner's step 6 relies on exactly that). The
    // countdown checks below assume nobody is there; left where Keep editing was, the pointer held them at 30s → 30s
    // (executed, 2026-09-24). Far left, on the Layers panel's TITLE: outside the card at any width this walk uses, and off
    // every row, since a row under the pointer now outlines its section on the canvas (R-217, Story 5.24e).
    const titleA = await A.locator('#editor-layers > div:first-child > span').first().boundingBox({ timeout: 2000 }).catch(() => null)
    await A.mouse.move(titleA ? titleA.x + 20 : 40, titleA ? titleA.y + titleA.height / 2 : 450)
    await A.waitForTimeout(1500)
    const keptRow = await lockRow(A, P)
    check('matrix "Keep editing": the nudge columns are cleared and A\'s card is gone', keptRow !== null && keptRow.nudgeRequestedBy === null && (await surface(A)).card === null, JSON.stringify(held(keptRow)))
    await B.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
    const bKept = await surface(B)
    check('…and B is TOLD, assertively, in the one sentence built from the ruled words', bKept.announced === LOCK.LOCK_COPY.kept, bKept.announced)
    check('…and no take-over is offered from that request: B\'s bar offers Request editing again', bKept.barButton === LOCK.LOCK_COPY.request, bKept.barButton)

    // ── B asks, A is told ────────────────────────────────────────────────────────────────────────────────────
    await B.getByRole('button', { name: LOCK.LOCK_COPY.request, exact: true }).click()
    await B.waitForTimeout(2500)
    const asked = await lockRow(B, P)
    check('matrix "Request editing": nudge_requested_by is written, and it is not the holder\'s own', asked !== null && !!asked.nudgeRequestedBy && asked.nudgeRequestedBy !== asked.holderSessionId, JSON.stringify(held(asked)))
    await cardOn(A)
    const aAsked = await surface(A)
    check('the SAME tab asking AGAIN is a NEW request, and it reaches A — Keep editing answered one request, not every request that tab will ever make', aAsked.card !== null, aAsked.card)
    check('matrix "Holder receives it": B5b, in the ruled title (R-189)', (aAsked.card ?? '').includes(LOCK.LOCK_COPY.askTitle), aAsked.card)
    check('B5b is a POPOVER, not a modal, at the frame\'s 440', aAsked.cardIsDialog === false && aAsked.cardWidth === '440px', JSON.stringify({ dialog: aAsked.cardIsDialog, width: aAsked.cardWidth }))
    check('B5b states the sync position BEFORE asking — one edit, pluralised (R-190, AD-16)', (aAsked.card ?? '').includes(LOCK.LOCK_COPY.willSend(1)) && (aAsked.card ?? '').includes(LOCK.LOCK_COPY.pending(1)), aAsked.card)
    check('B5b offers Hand over and Keep editing, and a countdown', (aAsked.card ?? '').includes(LOCK.LOCK_COPY.handOver) && (aAsked.card ?? '').includes(LOCK.LOCK_COPY.keep) && /Expires in \d+s/.test(aAsked.card ?? ''), aAsked.card)
    check('UX-DR12: the request is announced ASSERTIVELY', aAsked.announced === LOCK.LOCK_COPY.askTitle, aAsked.announced)
    check('§AD2: B5b says "edits", never "changes"', !/changes/i.test(aAsked.card ?? ''), aAsked.card)

    // F-079 — the countdown RESTARTS on interaction, focus included, and DOES NOT STOP
    const first = Number(/Expires in (\d+)s/.exec(aAsked.card ?? '')?.[1] ?? 0)
    await A.waitForTimeout(4000)
    const mid = Number(/Expires in (\d+)s/.exec((await surface(A)).card ?? '')?.[1] ?? 0)
    check('the countdown really counts down', mid < first, `${first}s → ${mid}s`)
    await A.locator('#editor-lock-hand-over').focus()
    await A.waitForTimeout(1500)
    const afterFocus = Number(/Expires in (\d+)s/.exec((await surface(A)).card ?? '')?.[1] ?? 0)
    check('F-079: FOCUSING the popover RESTARTS the countdown — it does not stop', afterFocus > mid, `${mid}s → ${afterFocus}s`)

    // ── A hands over while its flush CANNOT land: the lock is KEPT ──────────────────────────────────────────
    // AD-15's flush contract, on its refusal side: unsynced work never crosses a lock boundary, so a Hand over whose
    // flush fails deletes nothing and says so. Nothing exercised this until the review (2026-09-24); the walk above is
    // its control — the same press with the route open releases.
    await A.route('**/projects/*/sync', (r) => r.abort('failed'))
    await A.locator('#editor-lock-hand-over').click()
    await A.waitForTimeout(3500)
    const refusedRow = await lockRow(A, P)
    const aRefused = await surface(A)
    check('matrix "Hand over" (flush fails): the row is NOT deleted — A still holds it, and its unsynced edit is still owed',
      refusedRow !== null && refusedRow.holderSessionId === beaten.holderSessionId && !(await layerNames(A)).includes(A_EDIT), JSON.stringify(held(refusedRow)))
    check('…and the popover says so and stays, with A still editing (no bar)',
      (aRefused.card ?? '').includes(LOCK.LOCK_COPY.handOverFailed) && aRefused.bar === null, JSON.stringify({ card: aRefused.card, bar: aRefused.bar }))
    await A.unroute('**/projects/*/sync')

    // ── A hands over: the flush goes FIRST ───────────────────────────────────────────────────────────────────
    // listened for BEFORE the press: B's gain can land inside the checks below, and its reload is the thing to see
    const bHydrates = B.waitForEvent('load', { timeout: LOCK.HEARTBEAT_MS * 2 + 15000 }).then(() => true, () => false)
    await A.locator('#editor-lock-hand-over').click()
    await A.waitForTimeout(4000)
    const afterFlush = (await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc
    check('matrix "Hand over": the flush lands BEFORE the release — A\'s edit is on the server', !JSON.stringify(afterFlush ?? {}).includes(A_EDIT))
    // released: gone — or, when the other session's own read fell inside these four seconds, already its (Story 5.24e:
    // the row was B's at a run against HEAD, B's ~15 s poll having landed in the window)
    const handed = await lockRow(A, P)
    check('…and only then is the row released: A no longer holds it — gone, or already taken by the other session',
      handed === null || handed.holderSessionId !== beaten.holderSessionId, JSON.stringify(handed && held(handed)))
    const aAfter = await surface(A)
    check('A flips to read-only and gets B5a\'s own bar', (aAfter.bar ?? '').includes(LOCK.LOCK_COPY.reading) && aAfter.sidebarOpacity === '0.55', JSON.stringify({ bar: aAfter.bar, opacity: aAfter.sidebarOpacity }))

    const bReloaded = await bHydrates
    await B.waitForTimeout(2500)
    const bHolds = await lockRow(B, P)
    check('the owner\'s finding: B HYDRATES the moment it gains the lock — it reloads and shows what A handed over, never the page it loaded as a reader',
      bReloaded && !(await layerNames(B)).includes(A_EDIT), JSON.stringify({ reloaded: bReloaded, layers: await layerNames(B) }))
    check('B gains the lock, and its bar is gone', bHolds !== null && (await surface(B)).bar === null, JSON.stringify(held(bHolds)))

    // B makes an edit of its own and keeps it local
    await deleteLayer(B, B_EDIT)
    check(`B has one unsynced edit of its own: "${B_EDIT}" is off its canvas`, !(await layerNames(B)).includes(B_EDIT))
    await B.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
    const bBeat = await lockRow(B, P)
    check('B\'s heartbeat carries its own one unsynced edit', bBeat !== null && bBeat.unsyncedEdits === 1, JSON.stringify(held(bBeat)))

    // ── A asks, nothing answers, and A takes over ────────────────────────────────────────────────────────────
    await A.getByRole('button', { name: LOCK.LOCK_COPY.request, exact: true }).click()
    // B is deliberately left alone: its popover expires with nobody there, which is what makes the request unanswered
    await A.waitForTimeout(LOCK.NUDGE_MS + 6000)
    const aWaited = await surface(A)
    check('matrix "Nudge unanswered": the bar reads the ruled sentence, with X from the ROW', (aWaited.bar ?? '').includes(LOCK.LOCK_COPY.noResponse(1)), aWaited.bar)
    check('…and Take over anyway is offered', (aWaited.barButton ?? '') === LOCK.LOCK_COPY.takeOver, aWaited.barButton)

    await A.locator('#editor-lock-take-over').click()
    await A.waitForTimeout(900)
    const confirm = await surface(A)
    const dangerFill = confirm.confirmFill
    check('B5c opens: the ruled heading, 440 wide, radius 16', confirm.dialogOpen === true && (confirm.dialogText ?? '').includes(LOCK.LOCK_COPY.takeoverTitle) && confirm.dialogWidth === '440px' && confirm.dialogRadius === '16px', JSON.stringify({ w: confirm.dialogWidth, r: confirm.dialogRadius }))
    check('UX-DR14, R-115: it opens with focus on the CANCELLING action', confirm.focus === LOCK.LOCK_COPY.wait, confirm.focus)
    check('its danger panel names the count and admits the limit honestly', (confirm.dialogText ?? '').includes(LOCK.LOCK_COPY.willBeLost(1)) && (confirm.dialogText ?? '').includes(LOCK.LOCK_COPY.lossIsFinal), confirm.dialogText)
    check('it NEVER itemises the loss per section, and names nobody', !/hero|footer|template —/i.test(confirm.dialogText ?? '') && !/Rosa|message /i.test(confirm.dialogText ?? ''), confirm.dialogText)

    const genBefore = (await lockRow(A, P))?.generation
    // by id: the bar's own Take over anyway is still in the document behind the dialog
    await A.locator('#editor-takeover-confirm').click()
    await A.waitForTimeout(8000)
    const taken = await lockRow(A, P)
    check('matrix "Take over": the generation advanced by exactly one, in the same statement as the holder change', taken !== null && taken.generation === genBefore + 1 && taken.holderSessionId !== bBeat.holderSessionId, JSON.stringify({ from: genBefore, to: taken?.generation, holder: taken?.holderSessionId === bBeat.holderSessionId ? 'unchanged' : 'moved' }))
    check(`A is editing the LAST SYNCED SNAPSHOT — B's unsynced deletion never happened, so "${B_EDIT}" is back`, (await layerNames(A)).includes(B_EDIT), (await layerNames(A)).join(' | '))
    check('…and A has no bar', (await surface(A)).bar === null)

    /* ── the lock boundary, enforced where the work is WRITTEN ─────────────────────────────────────────────────
     * B has not noticed — its next beat is up to ~15 s away — and it saves NOW. Before `/sync` knew about the lock,
     * this was the displaced session's orphaned edit reaching the cloud after the take-over (executed 2026-09-24,
     * through B's autosave). Now the route answers 423 and B's own lock read displaces it at once, with the count
     * still in its journal — which is what the "told ASSERTIVELY" check below reads. */
    await B.keyboard.press(`${process.platform === 'darwin' ? 'Meta' : 'Control'}+s`)
    await B.waitForTimeout(4000)
    const cloudAfter = JSON.stringify((await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc ?? {})
    check('AD-15: a session that was taken over from cannot save its orphaned work — B\'s ⌘S is refused and the cloud still has the section B deleted',
      cloudAfter.includes(B_EDIT), `the stored home doc ${cloudAfter.includes(B_EDIT) ? 'still has' : 'LOST'} "${B_EDIT}"`)

    // ── B is displaced, and told ─────────────────────────────────────────────────────────────────────────────
    await B.waitForTimeout(LOCK.HEARTBEAT_MS + 5000)
    const bLost = await surface(B)
    check('matrix "Displaced holder": B flips to read-only, and its bar SHOWS what it lost in the ruled sentence — told plainly, not only announced (EXPERIENCE.md F2)',
      (bLost.bar ?? '').includes(LOCK.LOCK_COPY.displaced(1)) && bLost.sidebarOpacity === '0.55', bLost.bar)
    check('…and is told ASSERTIVELY, in the ruled sentence — "This session", read where it is read (R-189)', bLost.announced === LOCK.LOCK_COPY.displaced(1), bLost.announced)
    check('R-190: the word is "unsynced" and "unsaved" appears nowhere on either screen', !/unsaved/i.test(`${bLost.bar} ${bLost.announced} ${confirm.dialogText}`))
    const undoable = await B.evaluate(() => document.getElementById('editor-undo')?.getAttribute('aria-disabled'))
    check('AD-15: B\'s journal is cleared UNCONDITIONALLY — there is nothing left to undo', undoable === 'true', String(undoable))

    /* ── matrix "Take over with nothing owed" ────────────────────────────────────────────────────────────────
     * A has just hydrated from the cloud, so it owes nothing. B asks and nobody answers: the confirm still ASKS — it
     * still ends a session — but with NO danger panel and NO danger fill, because nothing is being lost (UX-DR3:
     * absent, never "0 … will be lost" in red). Wait then takes nothing. */
    const askedAgainAt = Date.now()
    await B.getByRole('button', { name: LOCK.LOCK_COPY.request, exact: true }).click()
    await cardOn(A)
    const aOwesNothing = await surface(A)
    check('B5b with nothing owed: the strip says so — all synced, 0 pending', (aOwesNothing.card ?? '').includes(LOCK.LOCK_COPY.allSynced) && (aOwesNothing.card ?? '').includes(LOCK.LOCK_COPY.pending(0)), aOwesNothing.card)
    await B.waitForTimeout(Math.max(0, askedAgainAt + LOCK.NUDGE_MS + 4000 - Date.now()))
    const bNoAnswer = await surface(B)
    check('…and B, unanswered, reads the ruled sentence with the ROW\'s count — none', (bNoAnswer.bar ?? '').includes(LOCK.LOCK_COPY.noResponse(0)), bNoAnswer.bar)
    await B.locator('#editor-lock-take-over').click()
    await B.waitForTimeout(900)
    const nothing = await surface(B)
    // the body's owed sentence, DERIVED: what `takeoverBody` adds when something is owed
    const owedSentence = LOCK.LOCK_COPY.takeoverBody(1000, true).slice(LOCK.LOCK_COPY.takeoverBody(1000, false).length).trim()
    check('matrix "Take over with nothing owed": the confirm still ASKS — it still ends a session', nothing.dialogOpen === true && (nothing.dialogText ?? '').includes(LOCK.LOCK_COPY.takeoverTitle), nothing.dialogText)
    check('…but the danger panel is ABSENT, not empty, and so is the body\'s owed sentence (UX-DR3)',
      !(nothing.dialogText ?? '').includes(LOCK.LOCK_COPY.lossIsFinal) && !(nothing.dialogText ?? '').includes(LOCK.LOCK_COPY.willBeLost(0)) && !(nothing.dialogText ?? '').includes(owedSentence), nothing.dialogText)
    check('…and the confirm is not a danger FILL — compared against the owed confirm\'s own fill, never a literal colour', nothing.confirmFill !== null && dangerFill !== null && nothing.confirmFill !== dangerFill, JSON.stringify({ nothing: nothing.confirmFill, owed: dangerFill }))
    await B.getByRole('button', { name: LOCK.LOCK_COPY.wait, exact: true }).click()
    await B.waitForTimeout(800)
    const staleFrom = await lockRow(B, P)
    check('…and Wait takes nothing: the dialog closes and the generation has not moved', (await surface(B)).dialogOpen === false && staleFrom !== null && staleFrom.generation === taken.generation, JSON.stringify(held(staleFrom)))

    /* ── matrix "Stale lock", and the heartbeat's "network error ⇒ no state change" ─────────────────────────
     * From here A's lock route FAILS — a crashed tab, a dead network: it can neither beat nor release. Its row goes
     * stale after §AD4's window and B's own ~15 s poll then takes it with the CAS, filtered on the generation AND the
     * age in one statement (`lock/route.ts`), SILENTLY: nothing is being ended, so there is no confirm. */
    const bHydratesAgain = B.waitForEvent('load', { timeout: LOCK.STALE_MS + LOCK.HEARTBEAT_MS * 2 + 15000 }).then(() => true, () => false)
    await A.route('**/projects/*/lock', (r) => r.abort('failed'))
    const bReloadedAgain = await bHydratesAgain
    await B.waitForTimeout(2500)
    check('…and a stale lock taken is a GAIN like any other: B reloads onto the cloud copy', bReloadedAgain)
    const staleTaken = await lockRow(B, P)
    const bStale = await surface(B)
    check('matrix "Stale lock": B takes it SILENTLY at generation N+1 — no bar, no dialog, nothing asked',
      staleTaken !== null && staleTaken.generation === staleFrom.generation + 1 && staleTaken.holderSessionId === bBeat.holderSessionId && bStale.bar === null && bStale.dialogOpen === false,
      JSON.stringify({ from: held(staleFrom), to: held(staleTaken), bar: bStale.bar }))
    check('matrix "Heartbeat": a beat that fails on the NETWORK changes nothing — cut off, A still shows no bar', (await surface(A)).bar === null)
    await A.unroute('**/projects/*/lock')
    // IT WAITS FOR THE BAR, with room for ONE beat that gets no answer (the review of 5.24e, 2026-10-02): a fixed
    // heartbeat-and-five-seconds read A before its next tick whenever the first beat after the cut stalled on this
    // machine's network — the request never reached Vercel, `askLock` gave up at its own ten seconds and `land(null)`
    // changes nothing by design, so A learned a beat later and the row failed twice in three runs with no product fault.
    await A.waitForFunction(() => { const bar = document.getElementById('editor-lock-bar'); return !!bar && !bar.hidden }, null, { timeout: LOCK_BEATS_MS * 2 }).catch(() => null)
    await A.waitForTimeout(500)
    const aRevived = await surface(A)
    check('…and once A can reach the server again it learns it lost the lock: read-only and told assertively (AD-15) — and with NOTHING lost its bar is the ordinary reading-along one, never "0 … not included" (UX-DR3)',
      (aRevived.bar ?? '').includes(LOCK.LOCK_COPY.reading) && aRevived.announced === LOCK.LOCK_COPY.displaced(0), JSON.stringify({ bar: aRevived.bar, announced: aRevived.announced }))

    /* ══ STORY 5.24e — A GOING TAB LEAVES RATHER THAN RELEASES (DW-240, DW-244), AND SIGNING OUT SENDS FIRST (R-214) ══
     *
     * LAST, so a stop that goes red — as each does against a build from before the story — derails nothing above it, and
     * each reads WHO HOLDS from the row first rather than assuming the stop before it ended as designed. The other
     * session is made to read the lock at a chosen moment by the lock's own same-browser signal, `released`, posted in
     * ITS page (`lockSignals` hears every other channel of the name, its own page's included): a signal only says "read
     * the row now", so this moves nothing the protocol would not move on its next beat. */
    /** this page's tab id — read again while a page that has just gained the lock is reloading under the read */
    const tabOf = async (page) => {
      for (let i = 0; i < 40; i++) {
        try {
          return await page.evaluate((key) => sessionStorage.getItem(key), LOCK.TAB_SESSION_KEY)
        } catch {
          await new Promise((r) => setTimeout(r, 250))
        }
      }
      return null
    }
    const callOf = (request) => { try { return JSON.parse(request.postData() ?? '{}') } catch { return {} } }
    const isLockCall = (request) => /\/projects\/[^/]+\/lock$/.test(new URL(request.url()).pathname) && callOf(request).session !== 'harness-observer'
    const readNow = (page) => page.evaluate((name) => { const c = new BroadcastChannel(name); c.postMessage('released'); c.close() }, `inflozo-lock-${P}`)
    /** the page's own next beat, answered — after it the next is a heartbeat away, so a page that goes now cannot send
     *  one on its way out whose answer it never hears (a beat in flight moves the row past the one its leave carries:
     *  the ceiling `editor.tsx`'s `leaving` names, wider on a hard navigation, whose request runs before the unload) */
    const beatAnswered = (page) => page.waitForResponse((r) => isLockCall(r.request()) && ['beat', 'acquire'].includes(callOf(r.request()).intent), { timeout: LOCK.HEARTBEAT_MS + 5000 }).then(() => true, () => false)
    /** a row read that survives the page reloading under it (a session that gains the lock reloads) */
    const rowNow = (page) => lockRow(page, P).catch(() => undefined)
    /** the pages by role, read from the row — and a free lock picked up first, as either page's next read would. A
     *  session that has just GAINED the lock reloads onto the cloud copy, discarding what it held (the walk's own "B
     *  HYDRATES" row), so the holder is taken only once its page has settled: the same document for 2.5 s, no bar. */
    const whoHolds = async () => {
      const tabs = { a: await tabOf(A), b: await tabOf(B) }
      for (const by = Date.now() + LOCK_BEATS_MS * 2; Date.now() < by; await A.waitForTimeout(500)) {
        const row = await rowNow(A)
        const found = row && row.holderSessionId === tabs.a ? { H: A, R: B, row, rTab: tabs.b }
          : row && row.holderSessionId === tabs.b ? { H: B, R: A, row, rTab: tabs.a } : null
        if (row === null) await readNow(A).catch(() => {})
        if (found === null) continue
        const document0 = await found.H.evaluate(() => performance.timeOrigin).catch(() => null)
        await found.H.waitForTimeout(2500)
        const document1 = await found.H.evaluate(() => performance.timeOrigin).catch(() => null)
        if (document0 !== null && document0 === document1 && (await surface(found.H).catch(() => ({ bar: 'unread' }))).bar === null) return found
      }
      return null
    }
    /** the edits this browser holds unsent for the project, read from its own disk (`inflozo-doc-<user>`'s `meta`) */
    const owedOnDisk = (page) => page.evaluate((name) => new Promise((done) => {
      const asked = indexedDB.open(name)
      asked.onerror = () => done(null)
      asked.onsuccess = () => {
        const db = asked.result
        if (!db.objectStoreNames.contains('meta')) { db.close(); return done(null) }
        const all = db.transaction('meta').objectStore('meta').getAll()
        all.onsuccess = () => { db.close(); done(all.result.flatMap((row) => Object.keys(row.pending ?? {}))) }
        all.onerror = () => { db.close(); done(null) }
      }
    }), `inflozo-doc-${uid}`).catch(() => null)
    /** one PAGE section present on this page, deleted from its row: one owed edit (a site-wide row would ask first) */
    const oweOne = async (page) => {
      // a session that has just gained the lock reloads onto the cloud copy: its rows are read once that page is up
      await page.waitForSelector('#editor-layers [data-layer-row]', { timeout: 30000 }).catch(() => {})
      await page.waitForTimeout(1000)
      const names = await layerNames(page)
      const victim = [B_EDIT, 'Hero — Latest Post', A_EDIT].find((n) => names.includes(n)) ?? null
      if (victim !== null) await deleteLayer(page, victim)
      return victim !== null && !(await layerNames(page)).includes(victim) ? victim : null
    }
    const homeDoc = async () => JSON.stringify((await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc ?? {})
    /** the outgoing page's leave has landed: the row's beat backdated into the grace (or, before this story, the row gone) */
    const leftNow = async (page) => {
      let row
      for (const by = Date.now() + 8000; Date.now() < by; await page.waitForTimeout(100)) {
        row = await rowNow(page)
        if (row === null || (row && row.ageMs >= LOCK.STALE_MS - LOCK.LEAVE_GRACE_MS - 2000)) break
      }
      return row
    }
    /** …and whether it HAS, for the holder that went: the row gone (a release, before this story) or still that holder's
     *  and aged into the grace (a leave). Anything else — a later beat, another holder, a failed read — is not the race */
    const hasLeft = (row, holder) => row === null || (!!row && row.holderSessionId === holder && row.ageMs >= LOCK.STALE_MS - LOCK.LEAVE_GRACE_MS - 2000)

    // ── DW-240 (a): THE HOLDER RELOADS, AND THE OTHER SESSION READS THE LOCK INSIDE THE GAP ──
    // The reloaded page's first lock call is HELD until the other session's read has answered: that is the gap, made
    // wide on purpose. Before this story `pagehide` DELETED the row, so that read acquired a free lock and the reloaded
    // tab came back reading along. Now `leave` backdates the beat and the row stays the holder's for `LEAVE_GRACE_MS`.
    const gap = await whoHolds()
    if (gap === null) check('DW-240 (a) — fixture: one of the two sessions holds the lock', false)
    else {
      const { H, R, row: before } = gap
      const heldFirst = []
      let gateOpen = false
      const holdFirst = async (route) => {
        const { intent } = callOf(route.request())
        if (!gateOpen && isLockCall(route.request()) && (intent === 'acquire' || intent === 'beat')) { heldFirst.push(route); return }
        await route.continue().catch(() => {})
      }
      // the holder goes on a beat it has HEARD (as (b) and DW-244 do): a beat that stalled on the network leaves the tab
      // holding an old beat, and its leave then has less to backdate than `hasLeft` asks for (the review of 5.24e)
      await beatAnswered(H)
      await H.route('**/projects/*/lock', holdFirst)
      await H.reload({ waitUntil: 'load' })
      const inGap = await leftNow(R)
      const answered = R.waitForResponse((r) => isLockCall(r.request()) && callOf(r.request()).intent === 'acquire', { timeout: 6000 }).then(() => true, () => false)
      await readNow(R)
      const askedInGap = await answered
      const whileHeld = heldFirst.length
      gateOpen = true
      for (const route of heldFirst) await route.continue().catch(() => {})
      await H.unroute('**/projects/*/lock', holdFirst)
      await H.waitForTimeout(3000)
      const after = await rowNow(R)
      const [hNow, rNow] = [await surface(H), await surface(R)]
      // THE CONTROL includes the going page's leave having LANDED before the other session's read — the row gone or aged
      // into the grace — or the read was not inside the gap at all, and nothing below is a pass
      const control = whileHeld > 0 && askedInGap && hasLeft(inGap, before.holderSessionId)
      check('DW-240 (a) — control: the reloaded page\'s first lock call was held, the going page\'s leave had landed, and the other session read the lock while it was held',
        control, JSON.stringify({ held: whileHeld, askedInGap, inGap: inGap === undefined ? 'unread' : inGap && { ...held(inGap), ageMs: inGap.ageMs } }))
      check('DW-240 (a) — a reload with the other session reading inside its gap KEEPS the lock: the row is the holder\'s at the same generation, the holder has no bar and the other keeps its own',
        control && !!after && after.holderSessionId === before.holderSessionId && after.generation === before.generation && hNow.bar === null && (rNow.bar ?? '').includes(LOCK.LOCK_COPY.reading),
        (control ? '' : 'control not met — ') + JSON.stringify({ before: held(before), after: after && held(after), holderBar: hNow.bar, otherBar: rNow.bar }))
    }

    // ── DW-240 (b): THE OUTGOING PAGE'S LEAVE LANDS AFTER THE RELOADED PAGE HAS BEATEN ──
    // `review, 2026-09-24` saw this one with no second session at all: the reload's own re-acquire landed, then the old
    // page's release — filtered on the SAME session id — deleted it. The leave is filtered on the beat it last heard too,
    // so one that arrives after the reloaded page's beat matches nothing. The leave is held here, then sent.
    // ITS PAGEHIDE IS DISPATCHED IN THE PAGE, then the page reloads: a request an unloading document sends is one the
    // route met in some runs and missed in another (Story 5.24e's local runs), so the leave the walk holds is sent from
    // the live page by the editor's own `pagehide` listener — the same request — and the real reload's own, met or not,
    // only adds a second, timely one.
    const late = await whoHolds()
    if (late === null) check('DW-240 (b) — fixture: one of the two sessions holds the lock', false)
    else {
      const { H, R, row: before } = late
      const leaves = []
      const holdLeave = async (route) => {
        const { intent } = callOf(route.request())
        if (isLockCall(route.request()) && (intent === 'leave' || intent === 'release')) { leaves.push(route); return }
        await route.continue().catch(() => {})
      }
      await H.route('**/projects/*/lock', holdLeave)
      // straight after the page's own beat has answered, so the leave carries the beat the row holds
      await beatAnswered(H)
      await H.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })))
      for (const by = Date.now() + 5000; leaves.length === 0 && Date.now() < by;) await H.waitForTimeout(50)
      const reloadAt = Date.now()
      await H.reload({ waitUntil: 'load' })
      // the reloaded page has beaten when the row's beat is later than the reload — read with the server's own age
      let beaten = null
      for (const by = Date.now() + LOCK.HEARTBEAT_MS + 8000; Date.now() < by; await R.waitForTimeout(250)) {
        const row = await rowNow(R)
        if (row && row.holderSessionId === before.holderSessionId && Date.now() - row.ageMs > reloadAt + 1000) { beaten = row; break }
      }
      let leaveAnswer = 'never held'
      for (const route of leaves) {
        // the page that sent it is gone, so it is sent from the context, with its cookies — `route.fetch()`
        const answer = await route.fetch().catch(() => null)
        leaveAnswer = answer === null ? 'unsent' : answer.status()
        await route.fulfill(answer ? { response: answer } : { status: 204 }).catch(() => {})
      }
      await H.unroute('**/projects/*/lock', holdLeave)
      await H.waitForTimeout(1500)
      const after = await rowNow(R)
      check('DW-240 (b) — control: the going page\'s leave was held until the reloaded page had beaten, then sent and answered',
        leaves.length > 0 && beaten !== null && leaveAnswer === 200, JSON.stringify({ held: leaves.map((r) => callOf(r.request()).intent), beaten: beaten && held(beaten), leaveAnswer }))
      check('DW-240 (b) — a leave that lands after the reloaded page\'s beat changes nothing: the row is the holder\'s, at the same generation, and fresh',
        !!after && after.holderSessionId === before.holderSessionId && after.generation === before.generation && after.ageMs < LOCK.STALE_MS - LOCK.LEAVE_GRACE_MS - LOCK.HEARTBEAT_MS && (await surface(H)).bar === null,
        JSON.stringify({ after: after && { ...held(after), ageMs: after.ageMs }, holderBar: (await surface(H)).bar }))
    }

    // ── DW-244: THE HOLDER GOES WITH ONE EDIT OWED, ITS LAST FLUSH SLOW, AND THE OTHER SESSION READS IN BETWEEN ──
    // The flush (`visibilitychange`) and the leave (`pagehide`) go out together and nothing orders their landing. Here the
    // walk orders them the way that lost the edit: the flush HELD, the leave sent and ANSWERED, the tab gone, and only then
    // the other session's read, then the flush. Before this story the leave was a release that deleted the row, so that
    // read took the lock and the flush answered 423 — the edit lost. Now the leave backdates the beat, the row is still the
    // going tab's for the grace, the flush lands 200, and the other session takes the lock at the grace's edge (`edgePoll`).
    // THE HIDE AND THE PAGEHIDE ARE DISPATCHED IN THE PAGE (the journey's DW-203 precedent, and DW-240 (b) above): a request
    // issued from a document already unloading is one Playwright's route did not meet in two LOCAL RUNs against production,
    // so the walk sends both from the live page, where its routes hold them, and then the tab goes — at once, before its
    // next beat could refresh the row the leave just aged.
    const going = await whoHolds()
    if (going === null) check('DW-244 — fixture: one of the two sessions holds the lock', false)
    else {
      const { H, R, rTab, row: before } = going
      const victim = await oweOne(H)
      await H.waitForTimeout(500)
      const owedThen = await owedOnDisk(H)
      let flushAnswer = null
      let flushHeldAt = 0
      let flushSentAt = 0
      let releaseFlush = () => {}
      const flushGate = new Promise((done) => { releaseFlush = done })
      // HELD UNTIL THE OTHER SESSION HAS READ THE LOCK after the leave (at most twenty seconds), so the order the race needs
      // is the walk's, never the network's
      const slowFlush = async (route) => {
        if (flushHeldAt !== 0) return route.continue().catch(() => {})
        flushHeldAt = Date.now()
        await Promise.race([flushGate, new Promise((r) => setTimeout(r, 20000))])
        flushSentAt = Date.now()
        // the page that asked has gone by now: the context sends it, with its cookies
        const answer = await route.fetch().catch(() => null)
        flushAnswer = answer === null ? 'unsent' : answer.status()
        await route.fulfill(answer ? { response: answer } : { status: 204 }).catch(() => {})
      }
      const leaves = []
      const holdLeave = async (route) => {
        const { intent } = callOf(route.request())
        if (isLockCall(route.request()) && (intent === 'leave' || intent === 'release')) { leaves.push(route); return }
        await route.continue().catch(() => {})
      }
      await H.route('**/projects/*/sync', slowFlush)
      await H.route('**/projects/*/lock', holdLeave)
      // the tab goes straight after its own beat has answered — the designed path, never the in-flight beat's ceiling
      await beatAnswered(H)
      await H.evaluate(() => {
        Object.defineProperty(document, 'visibilityState', { configurable: true, get: () => 'hidden' })
        document.dispatchEvent(new Event('visibilitychange'))
      })
      for (const by = Date.now() + 5000; flushHeldAt === 0 && Date.now() < by;) await H.waitForTimeout(50)
      // the flush is out and held: now the page's own `pagehide` sends its leave (a release before this story), held too
      if (flushHeldAt > 0) await H.evaluate(() => window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: false })))
      for (const by = Date.now() + 5000; leaves.length === 0 && Date.now() < by;) await H.waitForTimeout(50)
      // …and sent first, its answer awaited: whatever it does to the row has happened before the other session reads it
      let leaveAnswer = 'never held'
      const [first] = leaves
      if (first) {
        const answer = await first.fetch().catch(() => null)
        leaveAnswer = answer === null ? 'unsent' : answer.status()
        await first.fulfill(answer ? { response: answer } : { status: 204 }).catch(() => {})
      }
      // the tab goes at once, before its next beat; a second leave its real `pagehide` may send stays held, and changes
      // nothing a first one did not
      await H.goto(at('/projects'), { waitUntil: 'commit' })
      const leftRow = await leftNow(R)
      // THE CONTROL: the leave landed before the read — the row gone (a release) or still the going tab's and aged into the
      // grace (a leave). A row anything else — a later beat, another holder — is not this race, and nothing below is a pass
      const left = hasLeft(leftRow, before.holderSessionId)
      const readAt = Date.now()
      const answered = R.waitForResponse((r) => isLockCall(r.request()) && callOf(r.request()).intent === 'acquire', { timeout: 6000 }).then(() => true, () => false)
      await readNow(R)
      const askedBetween = await answered
      releaseFlush()
      for (const by = Date.now() + 25000; flushAnswer === null && Date.now() < by;) await R.waitForTimeout(100)
      const cloud = await homeDoc()
      let taken
      for (const by = Date.now() + LOCK.LEAVE_GRACE_MS + LOCK.HEARTBEAT_MS + 10000; Date.now() < by; await new Promise((r) => setTimeout(r, 500))) {
        taken = await rowNow(R)
        if (taken && taken.holderSessionId === rTab) break
      }
      await H.unroute('**/projects/*/sync', slowFlush)
      await H.unroute('**/projects/*/lock', holdLeave)
      const control = victim !== null && Array.isArray(owedThen) && owedThen.length > 0 && flushHeldAt > 0 && leaveAnswer === 200 && left && askedBetween && flushSentAt > readAt
      const unmet = control ? '' : 'control not met — '
      check('DW-244 — control: one edit owed on this browser\'s disk, its flush held, the leave sent and answered 200 and LANDED (the row gone, or the going tab\'s and aged into the grace) before the other session read the lock, and the flush sent after that read',
        control,
        JSON.stringify({ victim, owedThen, held: flushHeldAt > 0, leaves: leaves.map((r) => callOf(r.request()).intent), leaveAnswer, left, leftRow: leftRow === undefined ? 'unread' : leftRow && { ...held(leftRow), ageMs: leftRow.ageMs }, askedBetween, flushAfterReadMs: flushSentAt > 0 ? flushSentAt - readAt : 'never sent' }))
      check('DW-244 — a tab that goes with an edit owed keeps its lock for its slow flush: the flush answers 200 and the edit is in the cloud',
        control && flushAnswer === 200 && victim !== null && !cloud.includes(victim), unmet + JSON.stringify({ flushAnswer, inCloud: victim !== null && cloud.includes(victim) }))
      check('DW-244 — …and the other session then takes the lock, at the grace\'s edge rather than a heartbeat later',
        control && !!taken && taken.holderSessionId === rTab, unmet + JSON.stringify(taken && held(taken)))
    }

    // ── R-214: SIGNING OUT SENDS WHAT THIS BROWSER STILL OWES, ERASES ITS COPY, AND ONLY THEN SIGNS OUT ──
    // The holder makes one edit with its every flush refused, so the edit is owed in this browser alone; a second tab of
    // the same browser opens Projects and signs out from the account menu, which sends it, erases the browser's copy
    // (`inflozo-doc-<user>` — the editor tab lets go of it as it is deleted) and signs out. The editor stays open, so no
    // way-out flush can carry the edit for it (a flush from an unloading page is not one the route reliably meets, above).
    // Before this story the copy survived the sign-out, with the edit in it unsent.
    const owner = await whoHolds()
    if (owner === null) check('R-214 — fixture: one of the two sessions holds the lock', false)
    else {
      const { H } = owner
      let refused = 0
      const refuse = (r) => { refused++; return r.abort('failed') }
      await H.route('**/projects/*/sync', refuse)
      const victim = await oweOne(H)
      await H.waitForTimeout(500)
      const owedThen = await owedOnDisk(H)
      const S = await H.context().newPage()
      await S.goto(at('/projects'), { waitUntil: 'load' })
      const database = `inflozo-doc-${uid}`
      const databases = () => S.evaluate(async () => (await indexedDB.databases()).map((d) => d.name)).catch(() => null)
      const before = await databases()
      const cloudBefore = await homeDoc()
      // A SEND THAT GOT NO ANSWER ASKS FIRST, which is the product working — and on 2026-10-02's Review run it is what a
      // network stall made of this stop: no save reached Vercel for the minute, the browser's own lock beats were missing
      // with it, and the row failed with nothing to say which. So the ask is LOOKED FOR: if "Sign out with unsent work?"
      // opens, that is recorded as a `stall` note, Wait is pressed, and the sign-out is pressed once more (the 5.24d rule:
      // an idempotent step is retried once and said). A second ask is the row's FAIL, with the ask named in its detail.
      const signOut = async () => {
        if (!(await S.locator('#account-menu').evaluate((m) => m.matches(':popover-open')))) await S.locator('button[popovertarget="account-menu"]').click()
        await S.locator('#account-menu').getByRole('button', { name: 'Sign out', exact: true }).click()
        return Promise.race([
          S.waitForURL(/\/sign-in/, { timeout: 60000 }).then(() => 'signed out', () => 'neither'),
          S.locator('#account-menu-sign-out-title').waitFor({ state: 'visible', timeout: 60000 }).then(() => 'asked', () => 'neither'),
        ])
      }
      let went = await signOut()
      if (went === 'asked') {
        note('stall', `${new Date().toISOString()} R-214's send got no answer and the ask opened — Wait pressed, sign-out pressed once more`)
        await S.getByRole('button', { name: LOCK.LOCK_COPY.wait, exact: true }).click()
        await S.waitForTimeout(1000)
        went = await signOut()
      }
      await S.waitForTimeout(1000)
      const after = await databases()
      const cloudAfter = await homeDoc()
      await H.unroute('**/projects/*/sync', refuse)
      check('R-214 — control: the edit was owed in this browser alone — on its disk, its copy listed, and the cloud still holding the section',
        victim !== null && Array.isArray(owedThen) && owedThen.length > 0 && Array.isArray(before) && before.includes(database) && cloudBefore.includes(victim),
        JSON.stringify({ victim, owedThen, refused, before, inCloud: victim !== null && cloudBefore.includes(victim) }))
      check('R-214 — Sign out sent the owed edit, erased this browser\'s copy and then signed out',
        /\/sign-in/.test(S.url()) && Array.isArray(after) && !after.includes(database) && victim !== null && !cloudAfter.includes(victim),
        JSON.stringify({ at: new URL(S.url()).pathname, went, after, inCloud: victim !== null && cloudAfter.includes(victim) }))
      await S.close()
    }

    await ctxA.close()
    await ctxB.close()
  } finally {
    if (browser) await browser.close()
    if (uid) {
      const gone = await admin(`/admin/users/${uid}`, { method: 'DELETE', body: '{}' })
      check('the fixture account is deleted', gone.status === 200, `HTTP ${gone.status}`)
    }
    const after = (await users())?.length
    check('no fixture leaked', after === before, `${before} before · ${after} after`)
  }
}

main()
  .then(() => {
    console.log(results.join('\n'))
    console.log(`\n${fails} FAIL, ${results.filter((r) => r.startsWith('PASS')).length} PASS`)
    if (process.env.OUT_FILE) fs.writeFileSync(process.env.OUT_FILE, results.join('\n'))
    process.exit(fails ? 1 : 0)
  })
  .catch((e) => {
    console.log(results.join('\n'))
    console.error('HARNESS ERROR', e)
    process.exit(2)
  })
