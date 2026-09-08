import { test } from 'node:test'
import assert from 'node:assert/strict'
import type { CapabilityVerdict } from './lib/probe-rule.ts'
import {
  announcementOf,
  BRAND_COPY,
  brandOf,
  brandPath,
  brandTarget,
  capabilityOf,
  hasBrand,
  injectionFlag,
  isAccent,
  navOf,
  PLAN_COPY,
  portalState,
  PREVIEW_COPY,
  probePatch,
  settingsOf,
  settingsReadable,
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

// ── `probePatch` — THE WHOLE WRITE A PROBE MAKES. Before the review of 2026-09-08 this mapping
//    lived inside `server/site-probe.ts` behind `call()` and `supabaseAdmin()`, where nothing
//    could execute it: T1 and T3 send no `hostSettings`, so the live runs only ever take the pair
//    branch, and the harness SEEDS both questions rather than probing them. The two branches the
//    `ghostpro_preview_probe` flag exists to gate therefore ran in no test and on no server.

const patchOf = (args: {
  previous?: Record<string, unknown>
  previousSource?: string | null
  settings?: Record<string, unknown>
  verdict?: CapabilityVerdict
}) =>
  probePatch({
    previous: args.previous ?? {},
    previousSource: args.previousSource ?? null,
    settings: settingsOf(payload(args.settings ?? {})),
    verdict: args.verdict ?? null,
  })

test('the browse shape is checked before anything is read from it', () => {
  assert.equal(settingsReadable(T1_LIKE), true)
  assert.equal(settingsReadable({ settings: [] }), true, 'an empty browse is still a browse')
  // A 200 carrying anything else is a read that did not happen: writing from it would flatten to
  // `{}` and wipe every value while stamping "Checked just now" over it.
  for (const junk of [null, undefined, {}, { settings: {} }, { settings: 'no' }, 'nope', 42]) {
    assert.equal(settingsReadable(junk), false, `${JSON.stringify(junk)} is not the browse shape`)
  }
})

test('the patch gains keys and loses none — public_url survives every probe', () => {
  // Story 3.2 wrote `public_url` and this story knows nothing about it. The matrix's first row.
  const { site_settings } = patchOf({
    previous: { public_url: 'https://ghost6.inflozo.com/', something_later: 7 },
    settings: { portal_button: false, announcement_content: 'hi' },
  })
  assert.equal(site_settings.public_url, 'https://ghost6.inflozo.com/')
  assert.equal(site_settings.something_later, 7)
  assert.equal(site_settings.code_injection, false)
  assert.equal(site_settings.portal_button, false)
  assert.equal(site_settings.portal_button_source, 'probe')
  assert.deepEqual(site_settings.announcement, { content: 'hi', background: null, visibility: null })
})

test('a probe overwrites a declared Portal answer with a READING, never with an assumption', () => {
  const answered = { portal_button: false, portal_button_source: 'declared' }
  // Ghost still hides it: the user's "No, it's off" STANDS, and the question does not come back.
  // Without this, every Re-check and every one of Story 3.7's cron runs put `true`/`default` back.
  const kept = patchOf({ previous: answered, settings: {} }).site_settings
  assert.equal(kept.portal_button, false)
  assert.equal(kept.portal_button_source, 'declared')
  // Ghost answers a real boolean again: the READING wins, which is what "3.7 re-reads it, so
  // 'probe' always wins later" means.
  const read = patchOf({ previous: answered, settings: { portal_button: true } }).site_settings
  assert.equal(read.portal_button, true)
  assert.equal(read.portal_button_source, 'probe')
  // And a default over a default is still a default — nothing to preserve.
  const fresh = patchOf({ previous: {}, settings: {} }).site_settings
  assert.equal(fresh.portal_button, true)
  assert.equal(fresh.portal_button_source, 'default')
})

test('the ask verdict raises plan_ask, and never re-asks a question already answered', () => {
  const ask = { ask: true } as const
  // First time: `hostSettings` present, shape unreadable — the ONE question FR-C8 allows.
  const asked = patchOf({ verdict: ask }).site_settings
  assert.equal(asked.plan_ask, true)
  // The user answered, so `capability_source` is `user_declared`. The payload is just as
  // unreadable on the next probe, and the question must NOT come back.
  const answered = patchOf({ verdict: ask, previousSource: 'user_declared' }).site_settings
  assert.equal(answered.plan_ask, undefined)
  // A real verdict still clears it — B15's Re-check plan on a site that has since been upgraded.
  const cleared = patchOf({
    previous: { plan_ask: true },
    previousSource: 'user_declared',
    verdict: { capability: 'full', capability_source: 'probe' },
  })
  assert.equal(cleared.site_settings.plan_ask, undefined)
  assert.equal(cleared.capability, 'full')
  assert.equal(cleared.capability_source, 'probe')
})

test('a null verdict writes NEITHER capability column — the flag-off production seed', () => {
  // `capabilityOf` answers null for a Ghost(Pro) payload with the flag off, and the patch must
  // carry no capability at all: untouched, not "written as full".
  const patch = patchOf({ verdict: capabilityOf({ limits: { customThemes: ['casper'] } }, false) })
  assert.equal('capability' in patch, false)
  assert.equal('capability_source' in patch, false)
  assert.equal(patch.site_settings.plan_ask, undefined)
})

test('the preview_only pair is carried onto the row with its source', () => {
  const patch = patchOf({ verdict: capabilityOf({ limits: { customThemes: ['casper'] } }, true) })
  assert.equal(patch.capability, 'preview_only')
  assert.equal(patch.capability_source, 'probe')
})

/* ───────── STORY 3.4 — FR-C4's brand, and every I/O matrix row that is a PARSING or VALIDATION
   question. The payloads are what T1 6.58.0 and T3 5.130.6 really answered on 2026-09-08 with the
   INTEGRATION key (MEASUREMENTS §40): `navigation` is a JSON STRING on both, `logo` and `icon` are
   EMPTY STRINGS, `description` is null on T1 and a string on T3. The rest — the screen, the seed,
   the cap and the redirect — runs on the deployed site under `run-verify-ghost-admin.py` (R-82). */

const BRAND_LIKE = payload({
  accent_color: '#FF1A75',
  logo: '',
  icon: '',
  cover_image: 'https://static.ghost.org/v5.0.0/images/publication-cover.jpg',
  navigation: '[{"label":"Home","url":"/"},{"label":"About","url":"/about/"}]',
  title: 'Ghost6',
  description: null,
})

const brand = (values: Record<string, unknown>) => brandOf(settingsOf(payload(values)))

test('the brand is read off the payload T1 and T3 really answered', () => {
  const read = brandOf(settingsOf(BRAND_LIKE))
  assert.equal(read.accent, '#FF1A75')
  // An empty string is Ghost's "unset" — never an <img src="">.
  assert.equal(read.logo, null)
  assert.equal(read.icon, null)
  assert.equal(read.cover, 'https://static.ghost.org/v5.0.0/images/publication-cover.jpg')
  assert.deepEqual(read.nav, [
    { label: 'Home', url: '/' },
    { label: 'About', url: '/about/' },
  ])
  assert.equal(read.title, 'Ghost6')
  // T1 answers null here and T3 a string; absence is a fact, not a hole.
  assert.equal(read.description, null)
  assert.equal(brand({ description: 'Thoughts, stories and ideas.' }).description, 'Thoughts, stories and ideas.')
})

test('navigation is admitted as the JSON STRING Ghost sends AND as an already-parsed array', () => {
  const parsed = [{ label: 'Essays', url: '/essays/' }]
  // The matrix's "`navigation` as a JSON string" row — the container both majors actually use.
  assert.deepEqual(navOf('[{"label":"Essays","url":"/essays/"}]'), parsed)
  // And the container neither has ever sent, admitted so one major changing its mind is absorbed.
  assert.deepEqual(navOf(parsed), parsed)
  // Unparseable, or not a list, or not menu items: an EMPTY menu, never a throw.
  for (const junk of ['[{', 'null', '"a string"', '{}', 42, null, undefined, [1, 2], [{ label: 'x' }], [{ url: '/' }]]) {
    assert.deepEqual(navOf(junk), [], `${JSON.stringify(junk)} is not a menu`)
  }
  // A blank label is not a pill.
  assert.deepEqual(navOf([{ label: '  ', url: '/' }]), [])
})

test('a hostile accent never reaches an inline style', () => {
  // The matrix's "Hostile accent" row: the swatch is painted as `style`, so anything that is not
  // a hex is dropped and no swatch is drawn.
  for (const hostile of [
    'red;background:url(x)',
    'red',
    '#FF1A7',
    '#GGGGGG',
    'rgb(255,0,0)',
    '#FF1A75; }',
    123,
    null,
  ]) {
    assert.equal(brand({ accent_color: hostile }).accent, null, `${JSON.stringify(hostile)} is not a colour`)
    assert.equal(isAccent(hostile), false)
  }
  // Both lengths the rule admits, either case.
  for (const good of ['#fff', '#FFF', '#FF1A75', '#ff1a75']) assert.equal(isAccent(good), true, good)
})

test('a hostile logo never reaches an <img src> — https only, because img-src admits data:', () => {
  // The matrix's "Hostile logo" row. A `data:` SVG is script, and `img-src 'self' data: https:`
  // would have loaded it (csp.ts:60).
  for (const hostile of [
    'data:image/svg+xml,<svg onload=alert(1)>',
    'javascript:alert(1)',
    'http://example.com/logo.png',
    '/content/images/logo.png',
    '',
    null,
    42,
  ]) {
    const read = brand({ logo: hostile, icon: hostile, cover_image: hostile })
    assert.equal(read.logo, null, `${JSON.stringify(hostile)} is not an image URL`)
    assert.equal(read.icon, null)
    assert.equal(read.cover, null)
  }
  assert.equal(brand({ logo: 'https://ghost6.inflozo.com/content/images/logo.png' }).logo,
    'https://ghost6.inflozo.com/content/images/logo.png')
})

test('a card that offers nothing is not drawn — a TITLE is not a brand', () => {
  // The matrix's "Nothing readable" row: connect redirects to /sites, S2c 404s, no card link.
  assert.equal(hasBrand(brandOf(settingsOf(payload({ title: 'Ghost6', description: 'A blog' })))), false)
  assert.equal(hasBrand(brandOf(settingsOf({}))), false)
  // Any ONE of the three S2c actually shows is enough to offer.
  assert.equal(hasBrand(brand({ accent_color: '#FF1A75' })), true, 'an accent alone')
  assert.equal(hasBrand(brand({ logo: 'https://x.example/l.png' })), true, 'a logo alone')
  assert.equal(hasBrand(brand({ navigation: '[{"label":"Home","url":"/"}]' })), true, 'a menu alone')
  // And it is asked of a jsonb column, so it survives whatever is in one. IT NARROWS TO `Brand`,
  // so it refuses anything S2c would then dereference: a record with no `nav` ARRAY (the page maps
  // over it), and a `logo` that is a string but not an `https:` URL (the page puts it in an
  // `<img src>`) — review, 2026-09-08.
  for (const junk of [null, undefined, 'brand', 42, [], {}, { accent: 'red' }, { nav: 'x' }]) {
    assert.equal(hasBrand(junk), false, `${JSON.stringify(junk)} offers nothing`)
  }
  assert.equal(hasBrand({ accent: '#fff' }), false, 'no nav array: S2c would throw on brand.nav')
  assert.equal(hasBrand({ accent: '#fff', nav: [] }), true, 'an accent with the array present')
  assert.equal(
    hasBrand({ accent: null, logo: 'javascript:alert(1)', nav: [] }),
    false,
    'a logo that is a string but not an https: URL offers nothing and reaches no src',
  )
  assert.equal(hasBrand({ accent: null, logo: '', nav: [] }), false, "Ghost's own unset logo (§40)")
})

test('one rule decides which project wears the brand, and the second press makes no second project', () => {
  // THE CAPTION AND THE WRITE READ THE SAME FUNCTION. `S2c` prints what `brandTarget` returns and
  // `useBrand` re-makes the same call at the press; two copies of it disagreeing is how the page
  // promised a new project and rebranded an old one.
  const site = 'site-1'
  const made = { id: 'p1', name: 'Ghost6', linked_site_id: site }
  const mine = { id: 'p2', name: 'Field Notes', linked_site_id: null }

  // WITH ROOM AND NOTHING LINKED: one is made. The matrix's "Use your brand, no project".
  assert.equal(brandTarget(false, [], site), undefined)
  assert.equal(brandTarget(false, [mine], site), undefined, 'a project of mine is not this site’s')

  // WITH ROOM AND THE OFFER PRESSED AGAIN: the project already made for this site, never a second
  // one. The offer link never retires, so this is the whole of "seeding is idempotent" — and
  // without it a Pro account collected one "Ghost6" per press (review, 2026-09-08).
  assert.equal(brandTarget(false, [mine, made], site)?.id, 'p1')
  assert.equal(brandTarget(false, [made], 'another-site'), undefined, 'linked elsewhere is not linked here')

  // AT THE CAP: the most recently updated, whatever it is linked to — the owner's Question 1
  // ruling (option 1, 2026-09-08), and `updated_at desc` is the order the caller reads in.
  assert.equal(brandTarget(true, [mine, made], site)?.id, 'p2')
  assert.equal(brandTarget(true, [], site), undefined, 'no projects is never at a cap worth naming')
})

test('the patch carries the brand beside everything Story 3.3 wrote, and loses none of it', () => {
  // The matrix's first row, one story on: `brand` joins `public_url`, `announcement`,
  // `code_injection` and `portal_button` rather than replacing any of them.
  const { site_settings } = patchOf({
    previous: { public_url: 'https://ghost6.inflozo.com/' },
    settings: settingsOf(BRAND_LIKE),
  })
  assert.equal(site_settings.public_url, 'https://ghost6.inflozo.com/')
  assert.equal(site_settings.code_injection, false)
  assert.equal(site_settings.portal_button_source, 'default')
  assert.deepEqual(site_settings.announcement, { content: null, background: null, visibility: null })
  assert.deepEqual(site_settings.brand, brandOf(settingsOf(BRAND_LIKE)))
})

test('S2c reads its every sentence from the app, and the swatch is captioned with a hex', () => {
  // The frame's own words (`S2 Onboarding.dc.html:150-196`), so the harness cannot drift from them.
  assert.equal(BRAND_COPY.title, 'Nice site. Want to keep the vibe?')
  assert.equal(BRAND_COPY.sub('orbitweekly.com'), 'We pulled these from orbitweekly.com — your call.')
  assert.equal(BRAND_COPY.siteToday, 'Your site today')
  assert.equal(BRAND_COPY.accent, 'Accent color')
  assert.equal(BRAND_COPY.navigation, 'Navigation')
  assert.equal(BRAND_COPY.use, 'Use your brand')
  assert.equal(BRAND_COPY.skip, 'Skip')
  assert.ok(BRAND_COPY.fonts.startsWith('Fonts stay yours'))
  assert.ok(BRAND_COPY.homepage.endsWith('wearing your brand.'))
  // THE ONE DEPARTURE: the frame prints the accent's NAME. Ghost answers a hex and nothing else,
  // so no sentence in the app may name a colour — naming one would assert what was not read.
  for (const [key, value] of Object.entries(BRAND_COPY)) {
    if (typeof value !== 'string') continue
    assert.ok(!/burnt orange/i.test(value), `BRAND_COPY.${key} names a colour Ghost never said`)
  }
  // The owner's Question 1 ruling: at the cap the caption NAMES the project before the press, and
  // it is the only sentence that mentions the limit.
  assert.ok(BRAND_COPY.willBrand('Field Notes').includes('Field Notes'))
  assert.ok(BRAND_COPY.willBrand('Field Notes').includes('limit'))
  // THE OWNER'S QUESTION 3 RULING: a second press SAYS what it already did, and ASKS — and it is
  // the sentence for EVERY second press with room, not only the ones that draw cards, because his
  // B1 scoped the cards and not the question (review, 2026-09-08).
  assert.ok(BRAND_COPY.alreadyOn('Ghost6').includes('Ghost6'))
  assert.ok(BRAND_COPY.alreadyOn('Ghost6').trimEnd().endsWith('?'), 'it asks rather than tells')
  assert.ok(!BRAND_COPY.alreadyOn('Ghost6').includes('limit'), 'room to spare is not a limit')
  assert.ok(BRAND_COPY.whichProject.endsWith('?'))
  assert.ok(BRAND_COPY.thisSite.length > 0)
  // THREE CAPTIONS AND NO FOURTH: a sentence nothing prints is a sentence nothing can be wrong
  // about, and `atLimitPick` was one — it rendered only at the cap WITH cards, which no step and
  // no criterion ever reached, and it was the one caption that named no project.
  assert.ok(!('atLimitPick' in BRAND_COPY) && !('willRebrand' in BRAND_COPY))
  // The matrix's "insert fails → the page says so" has a sentence to say it with.
  assert.ok(BRAND_COPY.failed.length > 0)
  // ONE OFFER URL. The Sites card's link and the two redirects are the same address, and it was
  // typed out in both places (review, 2026-09-08).
  assert.equal(brandPath('abc'), '/sites/brand?site=abc')
})
