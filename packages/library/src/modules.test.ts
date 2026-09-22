// Story 4.7 — the library rows of the I/O matrix: declaring, the union, `bundle` and the `assets/js/` rule.
// Every source here is an in-memory string (AD-1 bans `node:fs` in a core package). `core.js`'s real bytes
// are exercised by `modules/core.test.mjs`, which lives outside the ban, and by the stress harness.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { MODULES, RETIRED_MODULES, bundle, checkThemeJs, moduleFunctionName, moduleStringsRefusals, moduleUnion, parseModuleDeclaration } from './modules.ts'
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
  assert.deepEqual(checkThemeJs({ 'assets/js/main.js': bundle(['lightbox'], sources), 'assets/js/cards.js': '/* Ghost */', 'assets/css/screen.css': 'x' }, sources), [])
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
