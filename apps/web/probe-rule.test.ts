import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  announcementOf,
  capabilityOf,
  injectionFlag,
  PLAN_COPY,
  portalState,
  PREVIEW_COPY,
  settingsOf,
  THEME_PREFIX,
} from './lib/probe-rule.ts'

/* Story 3.3 — the connect-time probes' pure half, and the I/O matrix's rows that are a PARSING
   question. The rest of the matrix — the two Admin calls, the merged write, the four blocks on
   the card and the one-time notice — runs on the DEPLOYED site under
   `tools/probe/run-verify-ghost-admin.py` against T1 and T3 (R-82).

   THE PAYLOADS HERE ARE THE ONES THE REAL SERVERS ANSWERED, on 2026-09-08 with the integration
   key and no Staff Access Token (MEASUREMENTS §39) — `{ meta, settings: [{key, value}] }`, and
   `announcement_visibility` a JSON *string*. One payload in this file is different and its name
   says so: `capabilityOf` cannot be given a real Ghost(Pro) `hostSettings`, because no Ghost(Pro)
   site exists until the launch-gate Starter trial (⛔ §4 T4). */

/** The executed shape, abbreviated to the keys this story reads. */
const payload = (values: Record<string, unknown>) => ({
  meta: {},
  settings: Object.entries(values).map(([key, value]) => ({ key, value })),
})

const T1_LIKE = payload({
  title: 'Ghost6',
  portal_button: false,
  codeinjection_head: '',
  codeinjection_foot: '',
  announcement_content: '<p>Fixture announcement — seeded for VERIFY 21.</p>',
  announcement_background: 'accent',
  announcement_visibility: '["visitors"]',
})

test('the settings payload flattens to a record, and anything else flattens to nothing', () => {
  const flat = settingsOf(T1_LIKE)
  assert.equal(flat.title, 'Ghost6')
  assert.equal(flat.portal_button, false)
  // Absence and nonsense land in the same place — every reader below answers from `{}`.
  for (const junk of [null, undefined, {}, { settings: {} }, { settings: 'no' }, 'nope', 42]) {
    assert.deepEqual(settingsOf(junk), {}, `${JSON.stringify(junk)} should flatten to {}`)
  }
  // A row without a string key is not a setting.
  assert.deepEqual(settingsOf({ settings: [{ value: 'x' }, { key: 7, value: 'y' }] }), {})
})

// ── The matrix's "Code injection set" and "No code injection" rows.

test('code injection is one boolean over head and foot, and whitespace is not code', () => {
  const flag = (values: Record<string, unknown>) => injectionFlag(settingsOf(payload(values)))
  assert.equal(flag({ codeinjection_head: '', codeinjection_foot: '' }), false, 'both empty — T1/T3 at rest')
  assert.equal(flag({}), false, 'neither key present at all')
  assert.equal(flag({ codeinjection_head: '<script>x</script>', codeinjection_foot: '' }), true, 'head alone')
  assert.equal(flag({ codeinjection_head: '', codeinjection_foot: '<!-- inflozo probe -->' }), true, 'foot alone')
  assert.equal(flag({ codeinjection_head: null, codeinjection_foot: null }), false, 'nulls are not code')
  assert.equal(flag({ codeinjection_foot: '   \n ' }), false, 'whitespace alone is not code')
})

test('the payload never leaves injectionFlag — it answers a boolean and nothing else', () => {
  // The shape of the guarantee NFR-3 asks for, asserted rather than trusted: whatever the box
  // held, what comes back out of this function is `true` or `false`.
  const answer = injectionFlag(settingsOf(payload({ codeinjection_head: '<script>secret()</script>' })))
  assert.equal(typeof answer, 'boolean')
  assert.equal(JSON.stringify(answer), 'true')
})

// ── The matrix's "Portal readable" and "Portal unreadable" rows.

test('portal_button is read when Ghost sends a boolean, and defaults to on when it does not', () => {
  const state = (values: Record<string, unknown>) => portalState(settingsOf(payload(values)))
  // Executed: BOTH test Ghosts answer a real `false`, so this is the branch the live proof takes.
  assert.deepEqual(state({ portal_button: false }), { portal_button: false, portal_button_source: 'probe' })
  assert.deepEqual(state({ portal_button: true }), { portal_button: true, portal_button_source: 'probe' })
  // Unreadable — absent, or any shape that is not a boolean — is ON, and the source says it was
  // assumed. That is what puts the one question on the card.
  for (const value of [undefined, null, 'true', 1, {}]) {
    assert.deepEqual(
      state({ portal_button: value }),
      { portal_button: true, portal_button_source: 'default' },
      `portal_button = ${JSON.stringify(value)} should default to on`,
    )
  }
  assert.deepEqual(state({}), { portal_button: true, portal_button_source: 'default' })
})

// ── The matrix's "Announcement present" row, and its "missing keys stored as null" handling.

test('the announcement is stored verbatim, visibility still a JSON string', () => {
  assert.deepEqual(announcementOf(settingsOf(T1_LIKE)), {
    content: '<p>Fixture announcement — seeded for VERIFY 21.</p>',
    background: 'accent',
    // NOT PARSED. §15h item 21 and §39: Ghost sends a JSON string, and 3.4's seed decides its shape.
    visibility: '["visitors"]',
  })
  assert.deepEqual(announcementOf(settingsOf(payload({}))), {
    content: null,
    background: null,
    visibility: null,
  })
  assert.deepEqual(announcementOf(settingsOf(payload({ announcement_content: 42 }))).content, null)
})

// ── The matrix's four `capabilityOf` rows. The first is executed live; the rest are not, and the
//    two that name a Ghost(Pro) payload say UNOBSERVED in their own names.

test('hostSettings absent is self-hosted and unlimited, flag on or off', () => {
  // Executed on both majors 2026-09-08 (§39) and at §15h item 2: neither T1's nor T3's
  // `GET /admin/config/` carries `hostSettings` at all. This is what the deployed probe writes.
  for (const flagOn of [true, false]) {
    assert.deepEqual(capabilityOf(undefined, flagOn), { capability: 'full', capability_source: 'probe' })
    assert.deepEqual(capabilityOf(null, flagOn), { capability: 'full', capability_source: 'probe' })
  }
})

test('UNOBSERVED, synthesised Ghost(Pro) Starter: an allowlist with no inflozo- entry is preview-only', () => {
  // ⛔ §4 T4 — NO GHOST(PRO) SITE EXISTS. This payload was written here, not received; the day the
  // Starter trial arrives it is `capabilityOf`'s allowlist branch that it confirms or refutes.
  const starter = { limits: { customThemes: ['casper', 'dawn', 'edition', 'source'] } }
  assert.deepEqual(capabilityOf(starter, true), { capability: 'preview_only', capability_source: 'probe' })
  // The limit service's own container shape, same answer.
  assert.deepEqual(
    capabilityOf({ limits: { customThemes: { allowlist: ['casper', 'source'] } } }, true),
    { capability: 'preview_only', capability_source: 'probe' },
  )
  // FR-J10 freezes `inflozo-{project-slug}` at first deploy, so at connect the question is whether
  // the allowlist could EVER admit an Inflozo theme — an entry beginning with the prefix.
  assert.deepEqual(
    capabilityOf({ limits: { customThemes: ['casper', `${THEME_PREFIX}orbit-weekly`] } }, true),
    { capability: 'full', capability_source: 'probe' },
  )
  // Present does not mean blocked: a plan with no customThemes limit at all restricts nothing.
  assert.deepEqual(capabilityOf({ limits: { members: 500 } }, true), {
    capability: 'full',
    capability_source: 'probe',
  })
})

test('UNOBSERVED: hostSettings present whose shape cannot be read is the ONE path that asks', () => {
  // FR-C8 — probes, never questions — has exactly this exception, and the answer is stored with
  // source `user_declared`, never `probe`.
  assert.deepEqual(capabilityOf({ limits: 'nope' }, true), { ask: true })
  assert.deepEqual(capabilityOf({}, true), { ask: true })
  assert.deepEqual(capabilityOf(true, true), { ask: true })
  assert.deepEqual(capabilityOf({ limits: { customThemes: 'all' } }, true), { ask: true })
  assert.deepEqual(capabilityOf({ limits: { customThemes: [1, 2] } }, true), { ask: true })
})

test('the flag off is the production seed: a Ghost(Pro) site is judged by nothing and written by nothing', () => {
  // `capability` UNTOUCHED — not "written as full". No chip, no B15, and no plan question can
  // exist, because `null` writes neither column and `{ ask: true }` is unreachable with the flag
  // off. This is the branch every production connect took before the launch gate.
  assert.equal(capabilityOf({ limits: { customThemes: ['casper'] } }, false), null)
  assert.equal(capabilityOf({ limits: 'nope' }, false), null)
  assert.equal(capabilityOf({}, false), null)
})

// ── B15's copy, and the two rules that bind it.

test('B15 says Publisher or higher, never Creator, and promises no control that does not exist', () => {
  const words = JSON.stringify([PREVIEW_COPY, PLAN_COPY])
  assert.match(PREVIEW_COPY.clears[0], /Publisher or higher/)
  // EXPERIENCE.md:628 — the A9 correction of 2026-09-04. "Creator" is the wording it replaced.
  assert.doesNotMatch(words, /Creator/i)
  assert.match(PREVIEW_COPY.clears[1], /self-hosted/)
  // UX-DR3: Export theme zip and Ship it are absent until E11 and E7, so the copy cannot offer
  // either — the frame's body sentence did, and that half went with the button.
  assert.doesNotMatch(words, /theme zip|Ship it|export/i)
  assert.equal(PREVIEW_COPY.chip, 'Preview-only')
  assert.equal(PREVIEW_COPY.recheck, 'Re-check plan')
})
