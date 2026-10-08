// Story 4.7 — the library rows of the I/O matrix: declaring, the union, `bundle` and the `assets/js/` rule.
// Every source here is an in-memory string (AD-1 bans `node:fs` in a core package). `core.js`'s real bytes
// are exercised by `modules/core.test.mjs`, which lives outside the ban, and by the stress harness.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { CARDS_JS_TAG, MAIN_JS_TAG, MODULES, RETIRED_MODULES, bundle, bundledNames, cardsJs, cardsVersion, checkThemeJs, checkThemeScripts, moduleFunctionName, moduleKeyRefusals, moduleStringsRefusals, moduleUnion, parseModuleDeclaration } from './modules.ts'
import { CATALOG } from './catalog.ts'

// Story 5.15: every module file is ONE EXPORTED DECLARATION, because the editor imports `core` (DW-136) — and
// `bundle` removes that one `export` as it pastes, so what main.js carries is each source with the keyword gone
const core = "// the runtime\nexport function core(win, modules, options) {\n  const s = '}' + \"{\" + `${'}'}`\n  return /\\}{/.test(s) ? { stop() {} } : null\n}\n"
const lightbox = 'export function lightbox(el, ctx) {\n  el.addEventListener("click", () => {}, { signal: ctx.signal })\n}\n'
const navDrawer = 'export function navDrawer(el) { el.hidden = false }'
/** A source as main.js carries it: exactly its one `export ` gone, and not a byte else. */
const pasted = (src: string) => {
  const at = src.indexOf('export ')
  return src.slice(0, at) + src.slice(at + 'export '.length)
}
/** A row as a probe hands one: `movesByItself` is required on the type, and `bundle` never reads it. */
const row = (name: string, editSafe: boolean, animates: boolean) => ({ name, editSafe, animates, movesByItself: false })

test('the registry is one row per name, none of them retired, and core is not a row', () => {
  const names = MODULES.map((m) => m.name)
  assert.equal(new Set(names).size, names.length)
  assert.ok(!names.includes('core'))
  for (const r of Object.keys(RETIRED_MODULES)) assert.ok(!names.includes(r), r)
  assert.ok(MODULES.every((m) => typeof m.editSafe === 'boolean' && typeof m.animates === 'boolean'))
  // Story 5.15, R-175: every row says whether it moves by itself — the type makes a row without it a compile error,
  // and this is the same claim over the file as it is read, which a JSON cast could otherwise hide
  assert.ok(MODULES.every((m) => typeof m.movesByItself === 'boolean'), 'every registry row carries movesByItself')
  // review: two names that camelCase to one function would be one declaration replacing the other in main.js
  const fns = names.map(moduleFunctionName)
  assert.equal(new Set(fns).size, fns.length, 'every module has its own function name')
})

test('a declaration is a registry name, optionally with the width below which it runs', () => {
  assert.deepEqual(parseModuleDeclaration('lightbox'), { name: 'lightbox' })
  assert.deepEqual(parseModuleDeclaration('accordion:768'), { name: 'accordion', below: 768 })
  for (const bad of ['core', 'search-overlay', 'back-to-top', 'accordion:0', 'accordion:', 'accordion:0768', 'Lightbox', 'lightbox:768:1', '']) {
    assert.equal(typeof parseModuleDeclaration(bad), 'string', bad)
  }
  assert.match(String(parseModuleDeclaration('sort')), /R-52/)
  assert.match(String(parseModuleDeclaration('search-overlay')), /R-24/)
  assert.match(String(parseModuleDeclaration('back-to-top')), /§2\.2/)
  assert.match(String(parseModuleDeclaration('core')), /platform runtime/)
})

test('the union reads each entry\'s js, in registry order, and a removed design takes its names with it', () => {
  const a = { js: ['lightbox', 'carousel'] }
  const b = { js: ['carousel'] }
  assert.deepEqual(moduleUnion([a, b]), ['carousel', 'lightbox'])
  assert.deepEqual(moduleUnion([b]), ['carousel'])
  assert.deepEqual(moduleUnion([{}]), [])
  assert.throws(() => moduleUnion([{ js: ['back-to-top'] }]), /not in FR-G7's registry/)
  assert.equal(moduleFunctionName('nav-drawer'), 'navDrawer')
})

test('bundle([]) is a header naming core, core inside one function with exactly its one `export ` removed, then the start call', () => {
  const js = bundle([], { core })
  const [header, ...rest] = js.split('\n')
  assert.match(header ?? '', /^\/\/ .*: core$/)
  assert.equal(rest.join('\n'), `;(function () {\n'use strict'\n${pasted(core)}\ncore(window, [])\n})()\n`)
  // a classic script: an `export` anywhere in it is a SyntaxError that turns every site to its no-JS state
  assert.doesNotMatch(js, /\bexport\b/)
})

test('bundle carries modules in registry order with their rows, and refuses what it cannot trace', () => {
  const js = bundle(['lightbox', 'nav-drawer'], { core, lightbox, 'nav-drawer': navDrawer })
  assert.match(js.split('\n')[0] ?? '', /: core · nav-drawer · lightbox$/)
  assert.ok(js.indexOf(pasted(core)) < js.indexOf(pasted(navDrawer)) && js.indexOf(pasted(navDrawer)) < js.indexOf(pasted(lightbox)))
  assert.doesNotMatch(js, /\bexport\b/, 'no module keeps its keyword in main.js')
  assert.ok(js.includes('core(window, [["nav-drawer", navDrawer, { editSafe: false, animates: false }], ["lightbox", lightbox, { editSafe: false, animates: false }]])'), js)
  assert.throws(() => bundle(['lightbox'], { core }), /lightbox\.js has no source/)
  assert.throws(() => bundle(['back-to-top'], { core }), /back-to-top/)
  assert.throws(() => bundle([], {}), /core\.js has no source/)
  // the top level is exactly one declaration of the expected name
  const refusedShape = (src: string) => assert.throws(() => bundle(['lightbox'], { core, lightbox: src }), /lightbox\.js — /, src)
  refusedShape(lightbox + 'export function extra() {}\n')
  refusedShape(lightbox + 'function extra() {}\n')
  // Story 5.15: a BARE declaration is refused now — the editor could not import it — and so is any other export
  refusedShape(pasted(lightbox))
  refusedShape('export default ' + pasted(lightbox))
  refusedShape('export export ' + pasted(lightbox))
  // one literal space: `bundle`, core.test.mjs's byte check and run-verify-core.py all remove exactly `export ` (review)
  refusedShape('export\n' + pasted(lightbox))
  refusedShape('export  ' + pasted(lightbox))
  refusedShape(lightbox + 'window.leak = 1\n')
  refusedShape('export function lightBox(el) {}')
  refusedShape("'use strict'\n" + lightbox)
  refusedShape('export function lightbox(el) { const s = `${el}` ')
  assert.throws(() => bundle([], { core: 'export function core() {}\ncore()' }), /core\.js — /)
  assert.throws(() => bundle([], { core: pasted(core) }), /core\.js — .*export function core/)
  // comments and every literal that can hold a brace are not code
  const tricky = "/* a } */\nexport function lightbox(el, ctx) {\n  // a } in a comment\n  const a = '}', b = \"{\", c = `x${ { k: '}' }.k }y`, d = /[}]/g\n  return typeof /}/ === 'object' && a + b + c + d\n}\n// trailing\n"
  assert.ok(bundle(['lightbox'], { core, lightbox: tricky }).includes(pasted(tricky)))
  // review: a row's name reaches a RegExp and the start call, so a row outside the grammar is refused first
  for (const name of ['core', 'Probe', 'a.b', 'x)(']) {
    assert.throws(() => bundle([], { core }, [row(name, true, false)]), /is not a module name bundle\(\) can carry/, name)
  }
  // probe rows replace the registry for a probe theme
  const probe = 'export function probeThrows(el) { throw new Error(el.id) }'
  assert.match(bundle(['probe-throws'], { core, 'probe-throws': probe }, [row('probe-throws', true, true)]), /\["probe-throws", probeThrows, \{ editSafe: true, animates: true \}\]/)
})

test("assets/js/ holds bundle's bytes from repo sources and cards.js, and nothing else", () => {
  const sources = { core, lightbox }
  const main = bundle([], sources)
  assert.deepEqual(checkThemeJs({ 'assets/js/main.js': main }, sources), [])
  assert.deepEqual(checkThemeJs({ 'assets/js/main.js': bundle(['lightbox'], sources), 'assets/css/screen.css': 'x' }, sources), [])
  // Story 7.5 (DW-135): a cards.js is compared to Ghost's scripts, so a check handed none refuses one rather than skip it
  assert.match(checkThemeJs({ 'assets/js/main.js': main, 'assets/js/cards.js': '/* Ghost */' }, sources)[0] ?? '', /assets\/js\/cards\.js is compared to nothing/)
  // review: a theme with no main.js ships no runtime, and that is a sentence here rather than at each caller
  assert.match(checkThemeJs({ 'assets/js/cards.js': '/* Ghost */' }, sources)[0] ?? '', /assets\/js\/main\.js is missing/)
  assert.match(checkThemeJs({}, sources)[0] ?? '', /assets\/js\/main\.js is missing/)
  const vendor = checkThemeJs({ 'assets/js/main.js': main, 'assets/js/vendor.js': 'x' }, sources)
  assert.equal(vendor.length, 1)
  assert.match(vendor[0] ?? '', /assets\/js\/vendor\.js/)
  const appended = checkThemeJs({ 'assets/js/main.js': main + ' ' }, sources)
  assert.equal(appended.length, 1)
  assert.match(appended[0] ?? '', /assets\/js\/main\.js is not the bytes/)
  // an unreadable header and a name with no repo source are sentences, never throws
  assert.match(checkThemeJs({ 'assets/js/main.js': 'alert(1)' }, sources)[0] ?? '', /header/)
  const probe = bundle(['probe'], { core, probe: 'export function probe(el) {}' }, [row('probe', true, false)])
  assert.match(checkThemeJs({ 'assets/js/main.js': probe }, sources)[0] ?? '', /names probe, with no source/)
  assert.match(checkThemeJs({ 'assets/js/main.js': bundle(['lightbox'], sources) }, { core, lightbox: pasted(lightbox) })[0] ?? '', /lightbox\.js — /)
})

// Story 4.9 — S5's registry half. appendix-h1 §3.3a names `countdown` as the module every countdown.* key belongs
// to, so its row declares each one; the rule refuses a key that is not a live js key and two keys whose attribute
// would collide on the mount.
test('a module declares the live js keys it writes, and countdown declares every countdown.* key', () => {
  assert.deepEqual(moduleStringsRefusals(), [])
  const countdown = MODULES.find((m) => m.name === 'countdown')
  assert.deepEqual(countdown?.strings, Object.keys(CATALOG.keys).filter((k) => k.startsWith('countdown.')))
  assert.deepEqual(MODULES.filter((m) => m.strings !== undefined).map((m) => m.name), ['countdown'], 'strings on any other row is Ask First')
  const withStrings = (strings: string[]) => [{ ...row('countdown', true, false), strings }]
  assert.match(moduleStringsRefusals(withStrings(['nav.menu']))[0] ?? '', /not a js key/)
  assert.match(moduleStringsRefusals(withStrings(['search.overlay_empty']))[0] ?? '', /not live/)
  assert.match(moduleStringsRefusals(withStrings(['countdown.nope']))[0] ?? '', /not in the catalog/)
  // two declarations deriving one attribute — here the same key twice — would be one data-i18n-* on the mount
  assert.match(moduleStringsRefusals(withStrings(['gallery.next', 'pagination.load_more_loading', 'gallery.next']))[0] ?? '', /both derive data-i18n-next/)
})

// ─── Story 7.5: the header, the two tags, cards.js and the three checks ──────────────────────────────────────────────

test("(7.5) main.js's header names no builder and no internal reference, and bundledNames reads its list back", () => {
  const js = bundle(['lightbox'], { core, lightbox })
  assert.equal(js.split('\n')[0], "// This file's scripts, one function each, started together by its last line: core · lightbox")
  assert.doesNotMatch(js.split('\n')[0] ?? '', /inflozo|bundle\(|packages\/|\b(DW|AD|FR|NFR|R)-\d/i)
  assert.deepEqual(bundledNames(js), ['core', 'lightbox'])
  assert.equal(bundledNames('alert(1)\n'), null)
})

test('(7.5) the two tags: defer, one {{asset}} address each, in Ghost\'s own attribute order', () => {
  assert.equal(MAIN_JS_TAG, '<script defer src="{{asset "js/main.js"}}"></script>')
  assert.equal(CARDS_JS_TAG, '<script defer src="{{asset "js/cards.js"}}"></script>')
})

/** A chunk as `tools/probe/record-cards.py` vendors it: its two-line head, then Ghost's bytes. */
const chunk = (name: string, body: string, version = '6.58.0') =>
  `/* Vendored verbatim from Ghost ${version}, core/frontend/src/cards/js/${name}.js, by \`python3 tools/probe/record-cards.py\`.\n   Copyright (c) 2013-2026 Ghost Foundation. MIT licence — the full text is vendor/LICENSE-ghost.txt. */\n${body}`
const AUDIO = '(function() {\n    const a = 1;\n})();\n'
const TOGGLE = '(function() {\n    const t = 2;\n\n})();\n'
const SCRIPTS = { toggle: chunk('toggle', TOGGLE), audio: chunk('audio', AUDIO), video: chunk('video', '(function() {})();\n') }

test('(7.5) cardsJs: one header naming Ghost, the version, the cards and the licence file, then each chunk\'s own bytes in code-unit order under its label', () => {
  assert.equal(cardsJs(['toggle', 'audio', 'toggle'], SCRIPTS), [
    "/* Ghost's own scripts for these cards: audio · toggle — copied unchanged from Ghost 6.58.0, core/frontend/src/cards/js/.",
    '   Copyright (c) 2013-2026 Ghost Foundation. MIT licence: the full text is LICENSE-ghost.txt. */',
    '/* audio.js */',
  ].join('\n') + `\n${AUDIO}/* toggle.js */\n${TOGGLE}`)
  assert.equal(cardsVersion(['audio'], SCRIPTS), '6.58.0')
  // record-cards.py's head is cut whole: no repo path or tool name ships
  assert.doesNotMatch(cardsJs(['audio', 'toggle', 'video'], SCRIPTS), /record-cards|tools\/|vendor\/|Vendored/)
})

test('(7.5) cardsJs refuses, naming the card: a head not as vendored, two Ghost versions, no script, a name outside Ghost\'s grammar, nothing to carry', () => {
  assert.throws(() => cardsJs(['audio'], { audio: AUDIO }), /^Error: audio\.js does not open with record-cards\.py's head/)
  assert.throws(() => cardsJs(['audio'], { audio: chunk('toggle', AUDIO) }), /audio\.js does not open with record-cards\.py's head naming audio\.js/)
  assert.throws(() => cardsJs(['audio', 'toggle'], { ...SCRIPTS, toggle: chunk('toggle', TOGGLE, '5.130.6') }), /toggle\.js is copied from Ghost 5\.130\.6 .* and audio\.js from Ghost 6\.58\.0/)
  assert.throws(() => cardsJs(['gallery'], SCRIPTS), /gallery: Ghost's card scripts hold no gallery\.js/)
  assert.throws(() => cardsJs(['x|*'], SCRIPTS), /"x\|\*" is no Ghost card name/)
  assert.throws(() => cardsJs(['audio'], { audio: chunk('audio', '(function() {})();') }), /audio\.js: Ghost's chunk is empty or does not end its last line/)
  assert.throws(() => cardsJs([], SCRIPTS), /at least one card/)
})

const pkg = (cardAssets: unknown) => `${JSON.stringify({ name: 'x', config: { card_assets: cardAssets } }, null, 2)}\n`

test('(7.5) checkThemeJs compares cards.js to cardsJs over the scripted cards package.json excludes (DW-135)', () => {
  const sources = { core, lightbox }
  const main = bundle([], sources)
  const theme = (cards: string | undefined, exclude: unknown) => ({ 'assets/js/main.js': main, 'package.json': pkg(exclude), ...(cards === undefined ? {} : { 'assets/js/cards.js': cards }) })
  const good = cardsJs(['toggle'], SCRIPTS)
  // a designed callout has no script, so toggle alone is carried
  assert.deepEqual(checkThemeJs(theme(good, { exclude: ['callout', 'toggle'] }), sources, SCRIPTS), [])
  // one byte off, and a card package.json does not exclude
  assert.match(checkThemeJs(theme(`${good} `, { exclude: ['toggle'] }), sources, SCRIPTS)[0] ?? '', /^assets\/js\/cards\.js is not the bytes cardsJs\(\) makes from Ghost's scripts for toggle/)
  assert.match(checkThemeJs(theme(cardsJs(['audio', 'toggle'], SCRIPTS), { exclude: ['toggle'] }), sources, SCRIPTS)[0] ?? '', /is not the bytes cardsJs\(\) makes/)
  // a scripted card excluded with no cards.js: Ghost's own copy is switched off and nothing carries it
  assert.match(checkThemeJs(theme(undefined, { exclude: ['audio'] }), sources, SCRIPTS)[0] ?? '', /^assets\/js\/cards\.js is missing — package\.json excludes audio, .*audio's player would never play/)
  // the controls: no scripted card excluded, no cards.js, nothing owed; a cards.js nobody excluded a card for is refused
  assert.deepEqual(checkThemeJs(theme(undefined, { exclude: ['callout'] }), sources, SCRIPTS), [])
  assert.deepEqual(checkThemeJs(theme(undefined, true), sources, SCRIPTS), [])
  assert.match(checkThemeJs(theme(good, true), sources, SCRIPTS)[0] ?? '', /package\.json excludes no card Ghost has a script for/)
  assert.match(checkThemeJs({ 'assets/js/main.js': main, 'assets/js/cards.js': good }, sources, SCRIPTS)[0] ?? '', /package\.json is missing/)
  // a chunk not as vendored is a sentence, never a throw
  assert.match(checkThemeJs(theme(good, { exclude: ['toggle'] }), sources, { toggle: TOGGLE })[0] ?? '', /^assets\/js\/cards\.js — toggle\.js does not open/)
  // called without the scripts (run-verify-core.py, the stress fixture): main.js alone still passes
  assert.deepEqual(checkThemeJs({ 'assets/js/main.js': main }, sources), [])
})

const DEFAULT = (...extra: string[]) => ['<head>', '    <link rel="stylesheet" href="{{asset "css/screen.css"}}">', `    ${MAIN_JS_TAG}`, ...extra, '    {{ghost_head}}', '</head>', ''].join('\n')

test('(7.5) checkThemeScripts: the two tags in default.hbs and nothing else, in any template (DW-134)', () => {
  const clean = { 'default.hbs': DEFAULT(), 'index.hbs': '{{!< default}}\n' }
  assert.deepEqual(checkThemeScripts(clean), [])
  assert.deepEqual(checkThemeScripts({ ...clean, 'default.hbs': DEFAULT(`    ${CARDS_JS_TAG}`), 'assets/js/cards.js': 'x' }), [])
  const named = (files: Record<string, string>, pattern: RegExp, what: string) => assert.ok(checkThemeScripts(files).some((f) => pattern.test(f)), `${what}: ${JSON.stringify(checkThemeScripts(files))}`)
  named({ ...clean, 'partials/sections/home/x.hbs': '<section>\n  <script>alert(1)</script>\n</section>\n' }, /^partials\/sections\/home\/x\.hbs: "<script>alert\(1\)<\/script>" is no script/, 'a stray inline script')
  named({ ...clean, 'index.hbs': '<SCRIPT src="https://x.example/a.js"></SCRIPT>\n' }, /^index\.hbs: .* is no script/, 'an upper-case script')
  named({ ...clean, 'default.hbs': DEFAULT().replace(MAIN_JS_TAG, '') }, /carries .* 0 times/, 'MAIN_JS_TAG missing')
  named({ ...clean, 'default.hbs': DEFAULT(`    ${MAIN_JS_TAG}`) }, /carries .* 2 times/, 'MAIN_JS_TAG twice')
  named({ 'default.hbs': DEFAULT().replace(MAIN_JS_TAG, ''), 'post.hbs': `${MAIN_JS_TAG}\n` }, /^post\.hbs: .* is no script/, 'MAIN_JS_TAG outside default.hbs')
  named({ ...clean, 'default.hbs': DEFAULT(`    ${CARDS_JS_TAG}`) }, /no assets\/js\/cards\.js ships/, 'CARDS_JS_TAG without cards.js')
  named({ ...clean, 'assets/js/cards.js': 'x' }, /carries .*cards\.js.* 0 times, and assets\/js\/cards\.js ships/, 'cards.js without its tag')
  named({ ...clean, 'post.hbs': '<script>let a = 1\n' }, /^post\.hbs: .* opens a script that never closes/, 'an unclosed script')
  // a named inline source passes; one byte off is refused
  const src = 'document.documentElement.dataset.x = 1'
  assert.deepEqual(checkThemeScripts({ ...clean, 'default.hbs': DEFAULT(`    <script>${src}</script>`) }, { 'mode-toggle': src }), [])
  named({ ...clean, 'default.hbs': DEFAULT(`    <script>${src} </script>`) }, /is no script/, 'one byte off a named source')
  // a layer name inside a boundary comment is a comment: Ghost never prints it
  assert.deepEqual(checkThemeScripts({ ...clean, 'home.hbs': '{{!-- <script>alert(1)</script> · Heroes · Plain --}}\n{{! <script> }}\n' }), [])
})

test('(7.5) moduleKeyRefusals: every t() key a module calls derives from a string its row declares (DW-146)', () => {
  const countdown = (key: string) => `export function countdown(el, ctx) {\n  el.textContent = ctx.t('${key}')\n}\n`
  assert.deepEqual(moduleKeyRefusals({ core, countdown: countdown('days') }), [])
  assert.deepEqual(moduleKeyRefusals({ countdown: countdown('time-remaining') }), [], 'countdown.time_remaining derives data-i18n-time-remaining')
  assert.match(moduleKeyRefusals({ countdown: countdown('weeks') })[0] ?? '', /^countdown\.js calls t\('weeks'\), and its registry row declares no string that derives data-i18n-weeks/)
  assert.match(moduleKeyRefusals({ lightbox: 'export function lightbox(el, ctx) { const t = ctx.t; el.title = t("close") }' })[0] ?? '', /lightbox\.js calls t\('close'\)/, 'a row with no strings')
  assert.match(moduleKeyRefusals({ 'back-to-top': 'export function backToTop() {}' })[0] ?? '', /back-to-top\.js is no registry row/)
  // `set('x')` and `split("y")` are not t()
  assert.deepEqual(moduleKeyRefusals({ lightbox: 'export function lightbox(el) { el.dataset; new Set("x"); "a".split("y") }' }), [])
})
