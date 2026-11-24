// Story 7.21 — the drift rule (`lib/drift.ts`), the spec's I/O rows this layer owns: one hash rule on both sides (CRLF), identity
// by content (a move), the order the report lists, every label (never a section partial's raw path), the words (no digit but
// the count and the version handed in) and what the polite region says. The shell's rows are `deploy-run.test.ts`'.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { deployPath } from './lib/editor.ts'
import { SNAPSHOT_WORDS } from './lib/deploy.ts'
import { KEYS } from './lib/connect-rule.ts'
import {
  ADDS_TOKEN, causeBody, causeShown, compareManifests, contentManifest, DRIFT_CAUSES, DRIFT_WORDS, driftSaid, labelOf, liveCopyPath,
  liveDownloadPath, liveFileName, liveManifest, normalizedBytes, sha256Hex, type DriftRecord, type ManifestEntry,
} from './lib/drift.ts'

const enc = (s: string) => new TextEncoder().encode(s)
const h = (sha256: string) => ({ sha256 })

test('one hash rule: a CR directly before an LF is dropped — on text and bytes alike — and nothing else is; the hash is SHA-256 hex', async () => {
  assert.deepEqual(normalizedBytes('a\r\nb\r\n'), enc('a\nb\n'))
  assert.deepEqual(normalizedBytes(enc('a\r\nb\r\n')), enc('a\nb\n'), 'the same function runs on bytes')
  // the controls: a lone CR, a CR before anything else, and a CR at the very end stay
  assert.deepEqual(normalizedBytes('a\rb\r\rc\r'), enc('a\rb\r\rc\r'))
  assert.deepEqual(normalizedBytes('a\r\r\nb'), enc('a\r\nb'), 'only the CR next to the LF goes')
  assert.equal(await sha256Hex(enc('')), 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
  const crlf = await liveManifest({ 'default.hbs': enc('<html>\r\n</html>\r\n') })
  const lf = await contentManifest({ 'default.hbs': '<html>\n</html>\n' }, {})
  assert.equal(crlf['default.hbs']?.sha256, lf['default.hbs']?.sha256, 'a site that only rewrote line endings changed nothing')
  const other = await liveManifest({ 'default.hbs': enc('<html>\r\n</html >\r\n') })
  assert.notEqual(other['default.hbs']?.sha256, lf['default.hbs']?.sha256, 'the control: one changed byte is another hash')
})

test('the manifest: every file in code order, a section partial fingerprinted by its layer\'s id with its name and category, every other file by its own path — no fingerprint on the live side', async () => {
  const files = { 'package.json': '{}\n', 'partials/sections/home/hero.hbs': '<section/>\n', 'assets/fonts/x.woff2': new Uint8Array([1, 2, 3]) }
  const m = await contentManifest(files, { 'partials/sections/home/hero.hbs': { id: 'inst-1', layer: 'Hero', category: 'a4' } })
  assert.deepEqual(Object.keys(m), ['assets/fonts/x.woff2', 'package.json', 'partials/sections/home/hero.hbs'])
  assert.deepEqual({ ...m['partials/sections/home/hero.hbs'], sha256: '' }, { sha256: '', fingerprint: 'inst-1', layer: 'Hero', category: 'a4' })
  assert.deepEqual({ ...m['package.json'], sha256: '' }, { sha256: '', fingerprint: 'package.json' })
  const live = await liveManifest({ 'package.json': enc('{}\n') })
  assert.deepEqual(Object.keys(live['package.json'] ?? {}), ['sha256'])
  assert.equal(live['package.json']?.sha256, m['package.json']?.sha256)
})

test('the comparison: changed, added and removed in code-unit path order; a removed and an added path with ONE hash are a move and dropped as a pair; nothing else is paired', () => {
  // each object in an order of its own, so the answer's order is the rule's and never the input's
  const baseline = { 'z.css': h('3'), 'old/name.hbs': h('4'), 'gone.md': h('5'), 'b.hbs': h('1'), 'a.hbs': h('2'), 'also-gone.md': h('6') }
  const live = { 'added.hbs': h('8'), 'z.css': h('3x'), 'a.hbs': h('2x'), 'b.hbs': h('1'), 'new/name.hbs': h('4'), 'B.hbs': h('9') }
  assert.deepEqual(compareManifests(baseline, live), { changed: ['a.hbs', 'z.css'], added: ['B.hbs', 'added.hbs'], removed: ['also-gone.md', 'gone.md'] })
  // the controls: a move with a changed byte is a removal and an addition; one hash pairs once
  assert.deepEqual(compareManifests({ 'old.hbs': h('4') }, { 'new.hbs': h('4x') }), { changed: [], added: ['new.hbs'], removed: ['old.hbs'] })
  assert.deepEqual(compareManifests({ 'a.hbs': h('4'), 'b.hbs': h('4') }, { 'c.hbs': h('4') }), { changed: [], added: [], removed: ['b.hbs'] })
  assert.deepEqual(compareManifests(baseline, baseline), { changed: [], added: [], removed: [] })
})

test('labels: a section partial by its layer\'s CURRENT name, else the name the manifest kept — never its path; templates by their canvas; every other file Inflozo wrote by its kind word; a file the site gained by the two "didn\'t write" labels', () => {
  const L = DRIFT_WORDS.labels
  const partial: ManifestEntry = { sha256: 'x', fingerprint: 'inst-1', layer: 'Hero', category: 'a4' }
  const path = 'partials/sections/home/hero.hbs'
  assert.equal(labelOf({ path, entry: partial }, 'changed', { layers: { 'inst-1': 'Front page story' } }), 'Front page story', 'the current name')
  assert.equal(labelOf({ path, entry: partial }, 'removed', { layers: { 'inst-2': 'Someone else' } }), 'Hero', 'the stored name, the layer gone since')
  assert.equal(labelOf({ path, entry: partial }, 'changed', { layers: { 'inst-1': '   ' } }), 'Hero', 'a blank current name is no name')
  const own = (p: string) => labelOf({ path: p, entry: { sha256: 'x', fingerprint: p } }, 'changed', { canvases: { 'custom-landing': 'Landing' } })
  assert.equal(own('home.hbs'), 'Home')
  assert.equal(own('post.hbs'), 'Post')
  assert.equal(own('index.hbs'), 'Home page 2')
  assert.equal(own('custom-landing.hbs'), 'Landing', 'a Routes Manager template by its own name')
  assert.equal(own('unknown.hbs'), L.template)
  assert.equal(own('partials/content-cta.hbs'), 'Paywall')
  assert.equal(own('partials/post-card.hbs'), L.shared)
  const kinds: [string, string][] = [
    ['assets/css/screen.css', L.stylesheet], ['assets/css/cards.css', L.stylesheet], ['assets/js/main.js', L.script],
    ['assets/fonts/inter-roman-latin.woff2', L.font], ['assets/images/cover.webp', L.image], ['package.json', L.settings],
    ['locales/en.json', L.translations], ['locales/de.json', L.translations], ['README.md', L.readMe], ['LICENSE-inter.txt', L.licence],
    ['something.else', L.file],
  ]
  for (const [p, word] of kinds) assert.equal(own(p), word, p)
  assert.equal(labelOf({ path: 'custom-handmade.hbs' }, 'added'), "A template Inflozo didn't write")
  assert.equal(labelOf({ path: 'assets/hand.css' }, 'added'), "A file Inflozo didn't write")
  assert.equal(labelOf({ path: 'partials/sections/home/new.hbs' }, 'added'), "A template Inflozo didn't write", 'an added partial is no layer of ours')
  // never a raw path for a section partial, whatever the record holds
  assert.notEqual(labelOf({ path, entry: { sha256: 'x', fingerprint: 'inst-1' } }, 'changed'), path)
})

test('the words: D3\'s own, "this site" and "Add token" where earlier rulings correct the frame; the footer\'s number words; no digit but the count, a status and a version handed in', () => {
  assert.equal(DRIFT_WORDS.addToken, KEYS.staff.add, 'R-170: one name for adding the token')
  assert.equal(DRIFT_WORDS.causes.token_refused, 'Ghost no longer recognises the Staff Access Token stored for this site.')
  assert.ok(SNAPSHOT_WORDS.tokenRefused.startsWith(DRIFT_WORDS.causes.token_refused.slice(0, -1)), 'the snapshot\'s first clause')
  assert.equal(DRIFT_WORDS.chip(1), '1 file differs')
  assert.equal(DRIFT_WORDS.chip(5), '5 files differ')
  assert.equal(DRIFT_WORDS.foot(1), "Shipping replaces it with Inflozo's version. Take a copy of the live theme first if you want to keep those edits.")
  assert.equal(DRIFT_WORDS.foot(2), "Shipping replaces both with Inflozo's versions. Take a copy of the live theme first if you want to keep those edits.")
  assert.equal(DRIFT_WORDS.foot(5), "Shipping replaces all five with Inflozo's versions. Take a copy of the live theme first if you want to keep those edits.")
  assert.match(DRIFT_WORDS.foot(10), /replaces all ten /)
  assert.match(DRIFT_WORDS.foot(11), /replaces all 11 /)
  assert.equal(DRIFT_WORDS.clean(4), 'Nothing changed on your site since v4')
  for (const c of DRIFT_CAUSES) assert.ok(causeBody(c, { host: 'ghost6.inflozo.com', theme: 'inflozo-notes' }).endsWith(' Shipping anyway.'), c)
  assert.ok(!JSON.stringify(DRIFT_WORDS).includes('this project'), 'R-278: the grain is the site')
  // every word, its functions called with a count, a status and a version; none but those may carry a digit
  const said: string[] = []
  const walk = (v: unknown): void => {
    if (typeof v === 'string') said.push(v)
    else if (typeof v === 'function') said.push(String((v as (...a: unknown[]) => unknown)(7, 'h', 'inflozo-notes')).replaceAll('7', ''))
    else if (v !== null && typeof v === 'object') Object.values(v).forEach(walk)
  }
  walk(DRIFT_WORDS)
  said.push(DRIFT_WORDS.causes.unreachable('h', 503).replace('503', ''), DRIFT_WORDS.clean(42).replace('42', ''))
  for (const words of said) assert.doesNotMatch(words, /\d/, words)
})

test('D3b\'s causes: Add token on a missing, refused or too-weak token only; a missing token on a site whose Not now is recorded is the decline\'s own words, with no link (R-278)', () => {
  assert.deepEqual([...ADDS_TOKEN], ['no_token', 'token_refused', 'role'])
  assert.equal(causeShown('no_token', true), 'declined')
  assert.equal(causeShown('no_token', false), 'no_token')
  assert.equal(causeShown('missing', true), 'missing', 'only a missing token becomes the decline')
  assert.ok(!ADDS_TOKEN.includes('declined'))
  const ctx = { host: 'ghost6.inflozo.com', theme: 'inflozo-notes' }
  assert.equal(causeBody('missing', ctx), 'ghost6.inflozo.com no longer has inflozo-notes, the theme Inflozo last put there. Shipping anyway.')
  assert.equal(causeBody('unreachable', { ...ctx, status: 502 }), "ghost6.inflozo.com didn't hand over the live theme (502). Shipping anyway.")
  assert.equal(causeBody('unreachable', ctx), "ghost6.inflozo.com didn't hand over the live theme. Shipping anyway.")
  assert.equal(causeBody('unreadable', ctx), "The live theme ghost6.inflozo.com handed over couldn't be read. Shipping anyway.")
  assert.equal(causeBody('declined', ctx), "You chose to ship without a Staff Access Token on this site, so Inflozo can't read the live theme. Shipping anyway.")
})

test('driftSaid: each outcome in one polite sentence — the read, D3c\'s line, D3a\'s title and count, D3b\'s title and body (the decline\'s on a declined site)', () => {
  const found: DriftRecord = { kind: 'found', since: 3, theme: 'inflozo-notes', changed: [{ path: 'a', label: 'A' }], added: [{ path: 'b', label: 'B' }], removed: [] }
  assert.equal(driftSaid({ kind: 'reading' }, { host: 'h' }), 'Comparing with your live theme…')
  assert.equal(driftSaid({ kind: 'clean', since: 4 }, { host: 'h' }), 'Nothing changed on your site since v4.')
  assert.equal(driftSaid(found, { host: 'h' }), 'Something changed on your site since we last shipped. 2 files differ.')
  const missing: DriftRecord = { kind: 'unverified', cause: 'no_token', theme: 'inflozo-notes' }
  assert.equal(driftSaid(missing, { host: 'h' }), `Couldn't check whether your live theme changed. ${DRIFT_WORDS.causes.no_token} Shipping anyway.`)
  assert.equal(driftSaid(missing, { host: 'h', declined: true }), `Couldn't check whether your live theme changed. ${DRIFT_WORDS.causes.declined} Shipping anyway.`)
})

test('the live copy: one object per project × site, its address under the deploy route, saved as {theme}-live.zip', () => {
  assert.equal(liveCopyPath('p', 's'), 'p/live/s.zip')
  assert.equal(liveDownloadPath('p', 'j'), `${deployPath('p')}/live?job=j`)
  assert.equal(liveFileName('inflozo-drift-test'), 'inflozo-drift-test-live.zip')
})
