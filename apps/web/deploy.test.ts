// Story 7.18a — the deploy wizard's one rule (`lib/deploy.ts`), over the spec's I/O matrix: the stages and the rail, the
// version and the name, the staleness hash, Ghost's answers, the compile's refusals in plain words, Pre-flight's rows and
// the words the matrix names.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { CompileRefusal, REFUSAL } from '@inflozo/theme-compiler/refusal'
import type { Finding } from '@inflozo/theme-compiler/gate'
import { SETTING_WORDS } from '@inflozo/section-runtime/custom-settings'
import {
  activateAnswer, canonical, CHECK_FAILED, checkRows, DEPLOY_WORDS, deployError, endingOf, fileLabel, GHOST_PLANS_HELP, inputsHash, placeOf, refusalWords,
  SAFETY_PICTURE, SAFETY_WORDS, safetyOffered, stepNumber, stepOf, STEPS, stepsFor, themeNameOf, thrownCode, uploadAnswer, versionLabel, versionNumber, versionOf,
  type ShipState,
} from './lib/deploy.ts'
import { KEYS } from './lib/connect-rule.ts'
import { keysPath } from './lib/connect-rule.ts'
import { REFUSED_COPY } from './lib/journal.ts'

const P = '00000000-0000-4000-8000-0000000000aa'
const answer = (status: number, body: unknown = {}, text = JSON.stringify(body)) => ({ ok: status >= 200 && status < 300, status, body, text })
const ghost = (type: string, extra: Record<string, string> = {}) => ({ errors: [{ type, ...extra }] })

test('the rail is the steps that show, numbered from them; every stage maps to its step (the spec\'s stage table)', () => {
  // Story 7.19: an ordinary deploy is the four (7.18a's pin, kept as the `false` case), a first deploy that offers the Safety
  // net five — D1's rail less Backup (7.20's), in D1's order
  assert.deepEqual(stepsFor(false).map((s) => s.label), ['Destination', 'Check', 'Ship', 'Live'])
  assert.deepEqual(stepsFor(true).map((s) => s.label), ['Destination', 'Safety net', 'Check', 'Ship', 'Live'])
  assert.deepEqual(stepsFor(true), STEPS, 'every step any deploy shows')
  for (const steps of [stepsFor(false), stepsFor(true)]) assert.deepEqual(steps.map((s) => stepNumber(s.id, steps)), steps.map((_, i) => i + 1))
  assert.equal(stepNumber('check', stepsFor(true)), 3, 'Check is step 3 behind the Safety net')
  assert.equal(stepNumber('check', stepsFor(false)), 2)
  for (const stage of ['queued', 'compiling', 'checking', 'awaiting_ship'] as const) assert.equal(stepOf(stage), 'check', stage)
  assert.equal(stepOf('uploading'), 'ship')
  assert.equal(stepOf('activating'), 'ship')
  assert.equal(stepOf('done'), 'live')
  assert.equal(stepOf('cancelled'), 'destination')
  assert.equal(stepOf('failed', { compiling: { at: 'x' } }), 'check', 'blocked at Pre-flight')
  assert.equal(stepOf('failed', { compiling: { at: 'x' }, uploading: { at: 'y' } }), 'ship', 'S8d′')
  // the endings: Live, D2e (asked, not done), D2f (Deploy only)
  assert.equal(endingOf('done', { activated: true }), 'live')
  assert.equal(endingOf('done', { activated: false }, { activating: { at: 'x' } }), 'notLive')
  assert.equal(endingOf('done', { activated: false }, {}), 'uploadOnly')
  assert.equal(endingOf('failed', { activated: false }), null)
})

test('the version is n.0.0, shown v{n}; the theme is inflozo-{slug}', () => {
  assert.equal(versionOf(1), '1.0.0')
  assert.equal(versionOf(12), '12.0.0')
  assert.equal(versionLabel(5), 'v5')
  assert.equal(versionNumber('7.0.0'), 7)
  assert.ok(Number.isNaN(versionNumber('1.4.0')), 'a version this rule never writes names no number')
  assert.equal(themeNameOf('field-notes'), 'inflozo-field-notes')
  assert.equal(DEPLOY_WORDS.chip(1, null), 'v1')
  assert.equal(DEPLOY_WORDS.chip(5, 4), 'v4 → v5')
  assert.equal(DEPLOY_WORDS.uploadOnlyCaption(1, null), 'Upload v1, keep your current theme active')
  assert.equal(DEPLOY_WORDS.uploadOnlyCaption(5, 4), 'Upload v5, keep v4 active')
  assert.equal(DEPLOY_WORDS.activateCaption(5), 'Ship v5 and make it live')
})

test('the staleness hash: the same rows in any key order hash alike; a moved row or another release does not', async () => {
  const rows = { project: { name: 'Notes', slug: 'notes' }, templates: [{ template_key: 'home', doc: { b: 1, a: [1, { z: 2, y: 3 }] } }] }
  const shuffled = { templates: [{ doc: { a: [1, { y: 3, z: 2 }], b: 1 }, template_key: 'home' }], project: { slug: 'notes', name: 'Notes' } }
  assert.equal(canonical(rows), canonical(shuffled))
  const h = await inputsHash(rows, 'abc123')
  assert.match(h, /^[0-9a-f]{64}$/)
  assert.equal(await inputsHash(shuffled, 'abc123'), h)
  assert.notEqual(await inputsHash(rows, 'def456'), h, 'a release moves it')
  assert.notEqual(await inputsHash({ ...rows, project: { name: 'Notes!', slug: 'notes' } }, 'abc123'), h, 'a row moves it')
})

test('uploadAnswer: Ghost\'s answers to the theme upload (F2), each its own code; Ghost\'s text only as detail', () => {
  assert.deepEqual(uploadAnswer(answer(200, { themes: [{ name: 'inflozo-notes' }] })), { ok: true, theme: 'inflozo-notes', active: false })
  assert.deepEqual(uploadAnswer(answer(401, ghost('UnauthorizedError'))), { failed: 'ghost_key_refused' })
  assert.deepEqual(uploadAnswer(answer(500, ghost('InternalServerError', { message: "EEXIST: file already exists, mkdir '/var/x'" }))), { failed: 'deploy_running' })
  assert.deepEqual(uploadAnswer(answer(500, ghost('InternalServerError'))), { failed: 'ghost_unavailable' }, 'a 500 without EEXIST')
  assert.deepEqual(uploadAnswer(answer(422, ghost('ThemeValidationError', { message: 'Theme is not compatible' }))), { failed: 'ghost_theme_refused', detail: 'Theme is not compatible' })
  assert.deepEqual(uploadAnswer(answer(422, ghost('ValidationError'))), { failed: 'ghost_theme_refused' })
  assert.deepEqual(uploadAnswer(answer(403, ghost('HostLimitError'))), { failed: 'ghost_plan_refused' })
  assert.deepEqual(uploadAnswer(answer(413)), { failed: 'theme_too_large' })
  assert.deepEqual(uploadAnswer(answer(415, ghost('UnsupportedMediaTypeError', { code: 'COMPRESSED_TOO_LARGE' }))), { failed: 'theme_too_large' })
  assert.deepEqual(uploadAnswer(answer(422, ghost('ValidationError', { code: 'ENTRY_TOO_LARGE' }))), { failed: 'theme_too_large' })
  assert.deepEqual(uploadAnswer(answer(429)), { failed: 'ghost_unavailable' })
  assert.deepEqual(uploadAnswer(answer(302)), { failed: 'ghost_redirected' })
})

test('activateAnswer: live, the key or the plan refused (failed), or anything else not live (D2e)', () => {
  assert.deepEqual(activateAnswer(answer(200)), { ok: true })
  assert.deepEqual(activateAnswer(answer(401)), { failed: 'ghost_key_refused' })
  assert.deepEqual(activateAnswer(answer(403, ghost('HostLimitError'))), { failed: 'ghost_plan_refused' })
  assert.deepEqual(activateAnswer(answer(422, ghost('ValidationError', { message: 'missing' }))), { notLive: true, detail: 'missing' })
  assert.deepEqual(activateAnswer(answer(503)), { notLive: true })
  // thrown chokepoint errors
  assert.equal(thrownCode(Object.assign(new Error('x'), { name: 'AdminError', code: 'ghost_unreachable' })), 'ghost_unreachable')
  assert.equal(thrownCode(Object.assign(new Error('x'), { name: 'AdminError', code: 'write_not_allowed' })), 'write_not_allowed')
  assert.equal(thrownCode(Object.assign(new Error('x'), { name: 'AdminError', code: 'credential_store_unavailable' })), 'deploy_infrastructure')
  assert.equal(thrownCode(new Error('plain')), 'deploy_infrastructure')
})

test('deployError: each code its sentence and fix (S8d′), the host named; the key\'s fix is Reconnect site at Manage keys', () => {
  const ctx = { host: 'ghost6.inflozo.com', siteId: 'site-1', version: '4.48.9' }
  assert.deepEqual(deployError('ghost_key_refused', ctx), { code: 'ghost_key_refused', message: DEPLOY_WORDS.keyRefused, detail: DEPLOY_WORDS.keyRefusedBody, action: 'Reconnect site', href: keysPath('site-1') })
  assert.equal(deployError('deploy_running', ctx).message, 'Another deploy to this site is already running — try again in a moment.')
  assert.deepEqual(deployError('ghost_plan_refused', ctx), { code: 'ghost_plan_refused', message: DEPLOY_WORDS.plan, action: DEPLOY_WORDS.plans, href: GHOST_PLANS_HELP })
  assert.equal(deployError('ghost_unavailable', ctx).message, 'ghost6.inflozo.com is busy or down right now. Try again in a few minutes.')
  assert.equal(deployError('ghost_unreachable', ctx).message, "We couldn't reach ghost6.inflozo.com. Check it's online, then try again.")
  assert.equal(deployError('ghost_redirected', ctx).message, 'ghost6.inflozo.com now answers at a different address. Reconnect it in Sites.')
  assert.equal(deployError('theme_too_large', ctx).message, 'Your theme is larger than ghost6.inflozo.com accepts.')
  assert.equal(deployError('ghost_version_unsupported', ctx).message, 'Inflozo ships to Ghost 5 and 6. ghost6.inflozo.com runs Ghost 4.48.9.')
  assert.equal(deployError('ghost_theme_refused', { ...ctx, detail: 'Theme is not compatible' }).detail, 'Theme is not compatible')
  for (const code of ['deploy_infrastructure', 'write_not_allowed'] as const) assert.equal(deployError(code, ctx).message, DEPLOY_WORDS.infrastructure, code)
})

test('refusalWords: every REFUSAL class in its plain words with its link; anything else our fault, the compile\'s words only as detail', () => {
  const ctx = { projectId: P, english: (key: string) => (key === 'nav.more' ? 'More' : undefined), names: { 'custom-tutorials-list': 'Tutorials List' } }
  const reached = new Set<string>()
  const said = (kind: keyof typeof REFUSAL, message: string, parts: Record<string, string> = {}) => (reached.add(kind), refusalWords(new CompileRefusal(kind, message, parts), ctx))
  const cases: [ReturnType<typeof said>, string, string | undefined][] = [
    [said('cardDesigns', 'card designs: x'), DEPLOY_WORDS.cardDesigns, `/projects/${P}/cards`],
    [said('language', 'language "xx": no', { code: 'xx' }), 'Your project\'s language "xx" isn\'t one Ghost accepts. Choose it again in Translations.', `/projects/${P}/settings/translations`],
    [said('translation', 'locales/en.json: …', { key: 'nav.more', sentence: 'The “{” in “Más {” is a placeholder.' }), 'The translation of "More" can\'t be used: The “{” in “Más {” is a placeholder. Fix it in Translations.', `/projects/${P}/settings/translations`],
    [said('settingCap', SETTING_WORDS.cap), SETTING_WORDS.cap, `/projects/${P}/settings`],
    [said('settingDeleted', 'x', { setting: 'Sub' }), SETTING_WORDS.deleted('Sub'), `/projects/${P}/settings`],
    [said('settingHidden', 'x', { setting: 'Sub' }), SETTING_WORDS.hidden('Sub'), `/projects/${P}/settings`],
    [said('settingChanged', 'x', { setting: 'Sub' }), SETTING_WORDS.changed('Sub'), `/projects/${P}/settings`],
    [said('settingChanged', 'x', { setting: 'Headline size', section: 'Latest post' }), 'Headline size is in Theme settings, but nothing on your site shows it any more — Latest post now uses a design where it works differently. Delete it in Theme settings, or put back what it controlled.', `/projects/${P}/settings`],
    [said('settingUnread', 'x', { setting: 'Per row', why: 'unpicked' }), DEPLOY_WORDS.unreadSetting('Per row', 'its hand-picked list has nothing picked'), `/projects/${P}/settings`],
    [said('settingUnread', 'x', { setting: 'Alt', why: 'noPicture' }), DEPLOY_WORDS.unreadSetting('Alt', 'its section has no picture to describe'), `/projects/${P}/settings`],
    [said('settingUnread', 'x', { setting: 'Sub', why: 'twice' }), DEPLOY_WORDS.unreadSetting('Sub', 'two settings were made for it at the same moment'), `/projects/${P}/settings`],
    [said('staleDesign', 'x', { file: 'home.hbs', layer: 'Mystery' }), 'Mystery on Home uses a design Inflozo no longer has. Replace it, then ship.', `/projects/${P}`],
    [said('staleDesign', 'x', { file: 'custom-tutorials-list.hbs', layer: 'Grid' }), 'Grid on Tutorials List uses a design Inflozo no longer has. Replace it, then ship.', `/projects/${P}/custom-tutorials-list`],
    [said('darkHook', 'Two sections share a hidden name, so …', { file: 'post.hbs' }), 'Post: Two sections share a hidden name, so …', `/projects/${P}/post`],
  ]
  for (const [error, message, href] of cases) {
    assert.equal(error.code, 'compile_refused', message)
    assert.equal(error.message, message)
    assert.equal(error.href, href, message)
    assert.equal(error.detail, undefined, 'a customer-caused refusal carries no compile words')
  }
  // every class is said by a case above — read off the cases themselves (the review, 2026-10-19: a hand-typed list was
  // compared with REFUSAL's own keys, so a class with no case passed) — and the list cannot grow one this test does not word
  assert.deepEqual([...reached].sort(), Object.keys(REFUSAL).sort())
  // the control: an unclassified throw is our fault; the compile's own words go to detail, never the message
  const ours = refusalWords(new Error('partials/x.hbs: two bodies'), ctx)
  assert.deepEqual(ours, { code: 'compile_failed', message: DEPLOY_WORDS.ourFault, detail: 'partials/x.hbs: two bodies' })
})

test('placeOf: a template or a section partial is its canvas label and the canvas Fix in editor opens; a shared partial or a non-template is none', () => {
  assert.deepEqual(placeOf('home.hbs'), { label: 'Home', canvas: 'home' })
  assert.deepEqual(placeOf('partials/sections/post/sign-up.hbs'), { label: 'Post', canvas: 'post' })
  assert.deepEqual(placeOf('default.hbs'), { label: 'Every page', canvas: 'home' })
  assert.deepEqual(placeOf('partials/sections/default/header.hbs'), { label: 'Every page', canvas: 'home' })
  assert.deepEqual(placeOf('index.hbs'), { label: 'Home page 2', canvas: 'home' })
  assert.deepEqual(placeOf('partials/content-cta.hbs'), { label: 'Paywall', canvas: 'paywall' })
  assert.deepEqual(placeOf('partials/sections/content-cta/box.hbs'), { label: 'Paywall', canvas: 'paywall' })
  assert.deepEqual(placeOf('custom-signup.hbs'), { label: 'Signup', canvas: 'custom-signup' })
  assert.deepEqual(placeOf('custom-tutorials-list.hbs', { 'custom-tutorials-list': 'Tutorials List' }), { label: 'Tutorials List', canvas: 'custom-tutorials-list' })
  for (const none of ['partials/sections/shared/grid.hbs', 'package.json', 'assets/css/screen.css', 'locales/en.json', 'styles']) assert.equal(placeOf(none), null, none)
  assert.equal(fileLabel('tag.hbs'), 'Tag')
  assert.equal(fileLabel('package.json'), null)
})

test('checkRows: counts over BOTH gates, the three pass lines only where they hold, each finding a row with its place and canvas', () => {
  const f = (over: Partial<Finding>): Finding => ({ code: 'x', message: 'm', level: 'warning', fatal: false, refs: [], ...over })
  const gscan = { major: 6 as const, gscan: '6.4.2', blocked: false, errors: [], warnings: [f({ code: 'page_switch_unused', rule: 'GS110-NO-MISSING-PAGE-BUILDER-USAGE', refs: ['page.hbs'] })] }
  const quality = { blocked: false, errors: [], warnings: [f({ code: 'contrast_low', message: 'low', detail: 'd', action: 'a', refs: ['partials/sections/home/hero.hbs'] }), f({ code: 'heading_skip', refs: ['partials/sections/shared/grid.hbs'] })] }
  const clean = checkRows({ gscan, quality }, 6, ['author.hbs', 'default.hbs', 'index.hbs', 'post.hbs', 'tag.hbs'])
  assert.equal(clean.errors, 0)
  assert.equal(clean.warnings, 3)
  assert.equal(clean.blocked, false)
  assert.deepEqual(clean.passes, ['Ghost 6.x compatible', 'Required templates present (author, default, index, post, tag)', 'No deprecated helpers'])
  assert.deepEqual(clean.rows.map((r) => [r.code, r.place, r.canvas]), [['page_switch_unused', 'Page', 'page'], ['contrast_low', 'Home', 'home'], ['heading_skip', null, null]])
  assert.equal(clean.rows[1]?.detail, 'd')
  assert.equal(DEPLOY_WORDS.checkedMeta(clean.errors, clean.warnings), '0 errors · 3 warnings')
  // the control: a blocking error removes the major's pass line, a deprecated helper its own, a missing template its own
  const blocked = checkRows({
    gscan: { ...gscan, blocked: true, errors: [f({ level: 'error', code: 'theme_check_rule', rule: 'GS001-DEPR-USER-GET', refs: ['post.hbs'] })] },
    quality: { blocked: true, errors: [f({ level: 'error', code: 'template_missing', refs: ['tag.hbs'] })], warnings: [] },
  }, 5, ['default.hbs'])
  assert.deepEqual(blocked.passes, [])
  assert.equal(blocked.errors, 2)
  assert.equal(blocked.blocked, true)
  assert.equal(blocked.rows[0]?.level, 'error')
  assert.equal(DEPLOY_WORDS.fixErrors(1), 'Fix the error above to ship.')
  assert.equal(DEPLOY_WORDS.fixErrors(2), 'Fix the 2 errors above to ship.')
  // a checker that could not run checked nothing (the review, 2026-10-19 — production's first Pre-flight showed two passes
  // beside "We couldn't check your theme"): its finding is the one row, and no pass line is drawn
  const couldNot = checkRows({ gscan: { ...gscan, blocked: true, errors: [f({ level: 'error', code: CHECK_FAILED, message: 'We couldn\'t check your theme, so nothing was sent to your site.' })], warnings: [] }, quality }, 6, ['default.hbs'])
  assert.deepEqual(couldNot.passes, [])
  assert.equal(couldNot.rows[0]?.code, CHECK_FAILED)
})

test('R-260\'s row and the other sentences the matrix quotes', () => {
  assert.equal(DEPLOY_WORDS.unlistedOne('Office hours'), '“Office hours” appears on no page — not on Home, not in any collection. Its own address still works.')
  const seven = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
  assert.equal(DEPLOY_WORDS.unlistedMany(seven), '7 posts appear on no page — not on Home, not in any collection: “a”, “b”, “c”, “d”, “e”, and 2 more. Their own addresses still work.')
  assert.equal(DEPLOY_WORDS.unlistedMany(['a', 'b']), '2 posts appear on no page — not on Home, not in any collection: “a”, “b”. Their own addresses still work.')
  assert.equal(DEPLOY_WORDS.unlistedUnread('ghost6.inflozo.com'), "We couldn't read your posts from ghost6.inflozo.com, so we couldn't check that every one appears on a page.")
  assert.equal(DEPLOY_WORDS.compiledMeta(2340, 1536), '2.3s · 1.5 KB')
  assert.equal(DEPLOY_WORDS.notLiveBody(5, null, 'ghost6.inflozo.com'), "v5 uploaded cleanly. Ghost didn't switch to it, so ghost6.inflozo.com is still serving its current theme — nothing on your site changed.")
  assert.equal(DEPLOY_WORDS.uploadOnlyBody(2, 1, 'ghost6.inflozo.com'), 'v2 is on ghost6.inflozo.com and v1 is still what readers see. Make it live whenever you are ready.')
  assert.equal(DEPLOY_WORDS.uploadOnlyTitle, 'Uploaded. Not live yet.')
  assert.equal(DEPLOY_WORDS.sayChecked(1, 0), 'Checks finished: 1 error, 0 warnings.')
})

test('a theme\'s size as the frames draw it: bytes, then KB, then MB, one place', async () => {
  const { themeSize } = await import('./lib/deploy.ts')
  assert.equal(themeSize(900), '900 bytes')
  assert.equal(themeSize(1536), '1.5 KB')
  assert.equal(themeSize(Math.round(2.4 * 1024 * 1024)), '2.4 MB')
  assert.equal(DEPLOY_WORDS.uploadedRow(Math.round(2.4 * 1024 * 1024), 3100), 'Uploaded to Ghost · 2.4 MB · 3.1s')
})

test('R-264: Deploy only\'s guard — greyed with the ruled sentence while this project\'s theme is the live one, free otherwise; Ghost\'s upload answer read for `active`', async () => {
  const { uploadOnlyBlock } = await import('./lib/deploy.ts')
  const site = { id: 's', host: 'ghost6.inflozo.com', url: 'https://ghost6.inflozo.com', version: '6.58.0', capability: 'full' as const, source: null, locale: null, staff: false, declined: false }
  assert.equal(uploadOnlyBlock({ liveHere: true, prev: 1, n: 2, site }), 'v1 is already live on ghost6.inflozo.com, so Ghost would switch to v2 the moment it uploads. Use Deploy & activate.')
  // the controls: another theme live (or none), no site, no state at all
  assert.equal(uploadOnlyBlock({ liveHere: false, prev: 1, n: 2, site }), null)
  assert.equal(uploadOnlyBlock({ liveHere: true, prev: 1, n: 2, site: null }), null)
  assert.equal(uploadOnlyBlock(undefined), null)
  // (b): only an explicit `active: true` reads as live
  assert.deepEqual(uploadAnswer(answer(200, { themes: [{ name: 'inflozo-notes', active: true }] })), { ok: true, theme: 'inflozo-notes', active: true })
  assert.deepEqual(uploadAnswer(answer(200, { themes: [{ name: 'inflozo-notes', active: false }] })), { ok: true, theme: 'inflozo-notes', active: false })
  assert.deepEqual(uploadAnswer(answer(200, { themes: [{ name: 'inflozo-notes', active: 'true' }] })), { ok: true, theme: 'inflozo-notes', active: false })
})

test('7.18b: the new codes, each its sentence and fix — DW-374\'s two name the sites (R-269), the RTL block links to Translations', () => {
  assert.deepEqual(deployError('site_changed', { host: 'ghost6.inflozo.com', to: 'blog.example.com' }), {
    code: 'site_changed', message: 'This project now ships to blog.example.com, not ghost6.inflozo.com, so nothing was sent. Go back and run the checks again.',
  })
  assert.deepEqual(deployError('site_unlinked', { host: 'ghost6.inflozo.com' }), { code: 'site_unlinked', message: 'This project is no longer linked to ghost6.inflozo.com, so nothing was sent.' })
  assert.deepEqual(deployError('rtl_unacknowledged', { host: 'x', projectId: 'p1' }), {
    code: 'rtl_unacknowledged', message: 'Acknowledge it in Translations to ship.', action: 'Open Translations', href: '/projects/p1/settings/translations',
  })
  // Destination's new words (the spec's Words)
  assert.equal(DEPLOY_WORDS.switchSite, 'Switch')
  assert.equal(DEPLOY_WORDS.chooseSite, 'Choose a site')
  assert.equal(DEPLOY_WORDS.planRefused('ghost6.inflozo.com'),
    "Ghost(Pro) refused a custom theme on ghost6.inflozo.com when you last shipped. If you've upgraded the plan since, run the checks and ship — Ghost's answer clears this.")
})

test('R-274 (owner, 2026-10-20): one shorter sentence for edits that have not reached Inflozo — Run checks\' refusal and a switch\'s alike', () => {
  assert.equal(DEPLOY_WORDS.editsUnsent, "Your latest edits haven't reached Inflozo yet. Try again once they're saved.")
})

test('R-275 (Story 7.18c, DW-304): Run checks and Switch say the refusal\'s own sentence, word for word; R-274\'s stays for edits merely unsent', () => {
  const editor = readFileSync('app/(app)/app/(authed)/projects/[id]/(editor)/editor.tsx', 'utf8')
  // the editor's one answer: null (all sent), Can't sync's sentence, or R-274's
  assert.match(editor, /if \(!unsynced\(latest\.current\.journal\)\) return null\n\s*return refused\.current === null \? DEPLOY_WORDS\.editsUnsent : REFUSED_COPY\[refused\.current\]/)
  assert.match(editor, /const unsent = await flushForShip\(\)\n\s*if \(unsent !== null\) return \{ refused: unsent \}/, 'a switch is refused with it, and switchSite is never called')
  const wizard = readFileSync('components/editor/deploy-wizard.tsx', 'utf8')
  assert.match(wizard, /const answer = unsent === null \? await post\(/, 'Run checks starts no job over a refusal')
  assert.match(wizard, /const why = answer === null \? \(unsent \?\? W\.editsUnsent\)/)
  for (const why of ['gone', 'change'] as const) assert.notEqual(REFUSED_COPY[why], DEPLOY_WORDS.editsUnsent)
})


/* ── STORY 7.19 — the first deploy's Safety net (FR-C1, R-278–R-280) ── */

test('7.19: the Safety net is OFFERED on a first deploy to a site with no token and no recorded decline, where Run checks shows — and nowhere else', () => {
  const site = (over: Partial<NonNullable<ShipState['site']>> = {}): NonNullable<ShipState['site']> => ({
    id: 's', host: 'ghost6.inflozo.com', url: 'https://ghost6.inflozo.com', version: '6.58.0', capability: 'full', source: null, locale: 'en', staff: false, declined: false, ...over,
  })
  assert.equal(safetyOffered({ site: site(), firstDeploy: true }), true, 'Offered')
  // first deploy × token × declined × capability, each flipped alone
  assert.equal(safetyOffered({ site: site(), firstDeploy: false }), false, 'not the first deploy: a binding exists')
  assert.equal(safetyOffered({ site: site({ staff: true }), firstDeploy: true }), false, 'a token already stored')
  assert.equal(safetyOffered({ site: site({ declined: true }), firstDeploy: true }), false, 'declined before')
  assert.equal(safetyOffered({ site: site({ capability: 'preview_only', source: 'probe' }), firstDeploy: true }), false, 'probed Preview-only: no Run checks')
  assert.equal(safetyOffered({ site: site({ capability: 'preview_only', source: 'deploy_error' }), firstDeploy: true }), true, 'R-270: a refused upload keeps Run checks, so it is offered')
  assert.equal(safetyOffered({ site: null, firstDeploy: true }), false, 'no site')
  assert.equal(safetyOffered(undefined), false)
})

test('7.19: D1b\'s and D1c\'s words — the frame\'s, with the disclosure and the action Manage keys\' own (R-170)', () => {
  assert.equal(DEPLOY_WORDS.next, 'Next')
  assert.equal(SAFETY_WORDS.rail, 'Safety net')
  assert.equal(SAFETY_WORDS.rail, STEPS.find((s) => s.id === 'safety')?.label, 'the rail says the step\'s own name')
  assert.equal(SAFETY_WORDS.title, 'One more step unlocks a safety net')
  assert.equal(SAFETY_WORDS.full, KEYS.staff.full, 'one disclosure, read by both surfaces')
  assert.match(SAFETY_WORDS.full, /^It is a full-Administrator credential: anything that user can do in Ghost Admin, this token can do\.$/)
  assert.ok(KEYS.staff.enables.includes(KEYS.staff.full), 'Manage keys\' row is built from it')
  assert.match(SAFETY_WORDS.who, /an Administrator's is enough/)
  assert.equal(SAFETY_WORDS.add, 'Add token', 'one name for the action: Manage keys\' (D1b draws "Add the token")')
  assert.equal(SAFETY_WORDS.add, KEYS.staff.add)
  assert.equal(SAFETY_WORDS.adding, 'Adding…')
  assert.equal(SAFETY_WORDS.label, KEYS.staff.name)
  assert.equal(SAFETY_WORDS.back, DEPLOY_WORDS.back)
  assert.equal(SAFETY_WORDS.note('ghost6.inflozo.com'), 'Stored encrypted, and only ever sent to ghost6.inflozo.com.')
  assert.deepEqual(SAFETY_WORDS.lost, [
    'No copy of your current theme before we replace it',
    'No check that the live theme changed since we last shipped',
    'routes.yaml uploads by hand, with a guided card',
  ])
  assert.equal(`${SAFETY_WORDS.footBefore}${SAFETY_WORDS.footKeys}${SAFETY_WORDS.footAfter}`, 'You can add it any time from Manage keys.')
  // R-279: the owner's screenshot, its real size (the `<img>`'s width/height), served from `public/`
  const png = readFileSync(`public${SAFETY_PICTURE.src}`)
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], [SAFETY_PICTURE.width, SAFETY_PICTURE.height])
  assert.ok(png.equals(readFileSync('../../_bmad-output/planning-artifacts/user-provided-assets/Staff-access-token-screen.png')), 'byte for byte the owner\'s file')
})

test('7.19: the token is never asked at connect — the connect wizard draws no token field and names no KEYS.staff word', () => {
  const wizard = readFileSync('app/(app)/app/(authed)/sites/connect-wizard.tsx', 'utf8')
  assert.doesNotMatch(wizard, /staff_token/)
  assert.doesNotMatch(wizard, /KEYS\.staff/)
  // the control: the same read finds the field where it IS drawn
  assert.match(readFileSync('app/(app)/app/(authed)/sites/keys-panel.tsx', 'utf8'), /name="staff_token"/)
})
