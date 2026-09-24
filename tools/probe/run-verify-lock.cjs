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
let fails = 0
const check = (name, ok, detail = '') => { results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ' — ' + detail : ''}`); if (!ok) fails++; return ok }
const note = (name, detail) => results.push(`note  ${name} — ${detail}`)

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
    await A.reload({ waitUntil: 'load' })
    await A.waitForTimeout(2500)
    const aBack = await surface(A)
    const backRow = await lockRow(A, P)
    check('matrix "Same session reloads": the lock is KEPT — no bar at its own reflection, the sidebar undimmed, and it is editing within a round trip rather than a heartbeat',
      aBack.bar === null && aBack.sidebarOpacity === '1' && backRow !== null && backRow.holderSessionId === beaten.holderSessionId,
      JSON.stringify({ bar: aBack.bar, opacity: aBack.sidebarOpacity, row: held(backRow) }))
    check('…and the reload took NOTHING from anybody: the generation did not move (it is the same session, not a take-over)',
      backRow !== null && backRow.generation === beaten.generation, JSON.stringify({ was: beaten.generation, now: backRow?.generation }))
    check('…and the reload kept A\'s UNSYNCED work: the generation never moved, so nothing cleared the journal',
      !(await layerNames(A)).includes(A_EDIT) && (await lockRow(A, P))?.unsyncedEdits === 1, (await layerNames(A)).join(' | '))

    // ── B opens second and is a reader ───────────────────────────────────────────────────────────────────────
    await B.goto(await magic(), { waitUntil: 'load' })
    await B.goto(editor, { waitUntil: 'load' })
    await B.waitForTimeout(2500)
    const bRead = await surface(B)
    check('matrix "Second opener": B5a\'s bar, in the ruled words (R-189 — it says WHERE, never WHO)', (bRead.bar ?? '').includes(LOCK.LOCK_COPY.reading), bRead.bar)
    check('B5a: Request editing is a real button on the right', bRead.barButton === LOCK.LOCK_COPY.request, bRead.barButton)
    check('B5a: the settings sidebar dims to 55%, stays readable and is DESCRIBED by the bar\'s own sentence (never hidden, never `inert`)', bRead.sidebarOpacity === '0.55' && bRead.sidebarReadonly === true && bRead.sidebarDescribed === 'editor-lock-reason', JSON.stringify({ opacity: bRead.sidebarOpacity, described: bRead.sidebarDescribed }))
    check('nobody is named anywhere on the reader\'s screen', !/Rosa|Dai|message /i.test(bRead.bar ?? ''), bRead.bar)
    check('the second opener wrote NOTHING: A still holds it at generation 1', JSON.stringify(held(await lockRow(B, P))) === JSON.stringify(held(beaten)), JSON.stringify(held(await lockRow(B, P))))

    // the read-only guard, proved on the DOCUMENT and not on the screen: nothing B types reaches the server
    const revisionBefore = (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision
    const rowsBefore = await layerNames(B)
    await deleteLayer(B, B_EDIT)
    await B.waitForTimeout(2000)
    check('matrix "Second opener": commit() REFUSES — the row does not move, not even for a frame', JSON.stringify(await layerNames(B)) === JSON.stringify(rowsBefore), (await layerNames(B)).join(' | '))
    check('…and nothing B did moved the revision', (await call('/rest/v1', `/projects?id=eq.${P}&select=revision`)).body?.[0]?.revision === revisionBefore)

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
    await A.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
    check('fixture — the first request reached A', (await surface(A)).card !== null)
    await A.getByRole('button', { name: LOCK.LOCK_COPY.keep, exact: true }).click()
    // THE POINTER MUST LEAVE THE CARD. The next card mounts in the same fixed corner, and a pointer resting on it is
    // PRESENCE, which restarts the countdown on every tick (F-079 — the owner's step 6 relies on exactly that). The
    // countdown checks below assume nobody is there; left where Keep editing was, the pointer held them at 30s → 30s
    // (executed, 2026-09-24). Far left, over the Layers panel: outside the card at any width this walk uses.
    await A.mouse.move(40, 450)
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
    await A.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
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

    // ── A hands over: the flush goes FIRST ───────────────────────────────────────────────────────────────────
    await A.locator('#editor-lock-hand-over').click()
    await A.waitForTimeout(4000)
    const afterFlush = (await call('/rest/v1', `/project_templates?project_id=eq.${P}&template_key=eq.home&select=doc`)).body?.[0]?.doc
    check('matrix "Hand over": the flush lands BEFORE the release — A\'s edit is on the server', !JSON.stringify(afterFlush ?? {}).includes(A_EDIT))
    check('…and only then is the row deleted', (await lockRow(A, P)) === null)
    const aAfter = await surface(A)
    check('A flips to read-only and gets B5a\'s own bar', (aAfter.bar ?? '').includes(LOCK.LOCK_COPY.reading) && aAfter.sidebarOpacity === '0.55', JSON.stringify({ bar: aAfter.bar, opacity: aAfter.sidebarOpacity }))

    await B.waitForTimeout(LOCK.HEARTBEAT_MS + 4000)
    const bHolds = await lockRow(B, P)
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

    // ── B is displaced, and told ─────────────────────────────────────────────────────────────────────────────
    await B.waitForTimeout(LOCK.HEARTBEAT_MS + 5000)
    const bLost = await surface(B)
    check('matrix "Displaced holder": B flips to read-only', (bLost.bar ?? '').includes(LOCK.LOCK_COPY.reading) && bLost.sidebarOpacity === '0.55', bLost.bar)
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
    await A.waitForTimeout(LOCK.HEARTBEAT_MS + 3000)
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
    await A.route('**/projects/*/lock', (r) => r.abort('failed'))
    await B.waitForTimeout(LOCK.STALE_MS + LOCK.HEARTBEAT_MS + 5000)
    const staleTaken = await lockRow(B, P)
    const bStale = await surface(B)
    check('matrix "Stale lock": B takes it SILENTLY at generation N+1 — no bar, no dialog, nothing asked',
      staleTaken !== null && staleTaken.generation === staleFrom.generation + 1 && staleTaken.holderSessionId === bBeat.holderSessionId && bStale.bar === null && bStale.dialogOpen === false,
      JSON.stringify({ from: held(staleFrom), to: held(staleTaken), bar: bStale.bar }))
    check('matrix "Heartbeat": a beat that fails on the NETWORK changes nothing — cut off, A still shows no bar', (await surface(A)).bar === null)
    await A.unroute('**/projects/*/lock')
    await A.waitForTimeout(LOCK.HEARTBEAT_MS + 5000)
    const aRevived = await surface(A)
    check('…and once A can reach the server again it learns it lost the lock: read-only, and told assertively (AD-15)',
      (aRevived.bar ?? '').includes(LOCK.LOCK_COPY.reading) && aRevived.announced === LOCK.LOCK_COPY.displaced(0), JSON.stringify({ bar: aRevived.bar, announced: aRevived.announced }))

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
