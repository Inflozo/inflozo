// Story 7.7 — the gscan gate, held to its spec's I/O matrix row by row on BOTH real pinned checkers (gscan 4.49.7 at `v5`
// for Ghost 5, 6.4.2 at `v6` for Ghost 6 — AD-34), never on a mock: what the gate promises is what Ghost's own checker
// answers, mapped. Also: each pin's rule inventory equals its AD-23 recording (`fixtures/gscan/`), with a planted level
// change as the control; `GSCAN` equals the installed checkers; and `GSCAN_INERT` holds on both — each witness trips
// its rule raw and not once inert, and each whole-word pattern IS its rule's recorded regex.
//
// The pilot theme's two rows (today's verdicts, and the clean control with §73's scaffold) are `tools/check-snapshots.mjs`'s,
// which compiles the pilots from disk; a core package's test opens no file (AD-1), so every theme here is made in memory,
// starting from the CLEAN BASE THEME — the smallest theme both pinned checkers pass at 0/0, which is its own row.

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { JSDOM } from 'jsdom'
import { escapeUserText, GSCAN_INERT, gscanInert } from '@inflozo/section-runtime'
import { DOCS_ROOT, GSCAN, gscanDirs, gscanGate, installedRules, installedVersion, plain, runGscan, verdict } from './index.ts'
import type { Finding, GscanReport, Major, ThemeFiles, Verdict } from './index.ts'
import rules4 from '../fixtures/gscan/rules-4.49.7.json' with { type: 'json' }
import rules6 from '../fixtures/gscan/rules-6.4.2.json' with { type: 'json' }

const MAJORS = Object.keys(GSCAN).map(Number) as Major[]
type Recording = { gscan: string; checkVersion: string; rules: Record<string, { level: string; fatal: boolean; regex?: string }> }
const RECORDED: Record<Major, Recording> = { 5: rules4, 6: rules6 }

// ─── the clean base theme ─────────────────────────────────────────────────────────────────────────────────────────

const pkg = (config: Record<string, unknown> = {}) =>
  `${JSON.stringify({ name: 'gate-base', version: '1.0.0', author: { email: 'hello@inflozo.com' }, keywords: ['ghost-theme'], config: { posts_per_page: 12, card_assets: true, ...config } }, null, 2)}\n`
const shell = (head = '', body = '') => `<!DOCTYPE html>
<html lang="{{@site.locale}}">
<head>
<title>{{meta_title}}</title>
<link rel="stylesheet" href="{{asset "css/screen.css"}}">
${head}{{ghost_head}}
</head>
<body class="{{body_class}}">
${body}{{{body}}}
{{ghost_foot}}
</body>
</html>
`
const BASE: Record<string, string> = {
  'package.json': pkg(),
  'default.hbs': shell(),
  'index.hbs': '{{!< default}}\n{{#foreach posts}}<a href="{{url}}">{{title}}</a>{{/foreach}}\n',
  'post.hbs': '{{!< default}}\n{{#post}}<article>{{content}}</article>{{/post}}\n',
  'page.hbs': '{{!< default}}\n{{#post}}{{#if @page.show_title_and_feature_image}}<h1>{{title}}</h1>{{/if}}{{content}}{{/post}}\n',
  'assets/css/screen.css': '.kg-width-wide { max-width: 1000px; }\n.kg-width-full { max-width: 100%; }\nbody { font-family: var(--gh-font-body, serif); }\nh1 { font-family: var(--gh-font-heading, serif); }\n',
}
/** The base less its page switch: a Page with no Post header. */
const NO_SWITCH = { ...BASE, 'page.hbs': '{{!< default}}\n{{#post}}{{content}}{{/post}}\n' }

/** Every finding any row produced — the markup row reads them all. */
const SEEN: Finding[] = []
const gate = async (files: ThemeFiles, major: Major): Promise<Verdict> => {
  const v = await gscanGate(files, major)
  SEEN.push(...v.errors, ...v.warnings)
  return v
}
const codes = (fs: readonly Finding[]) => fs.map((f) => `${f.code}${f.rule === undefined ? '' : ` ${f.rule}`}`)
const raw = (r: GscanReport) => r.results.map((x) => `${x.level} ${x.code}`)

test('the clean base theme: both pinned checkers pass it at 0/0, so every row below is its one change', async () => {
  for (const major of MAJORS) {
    assert.deepEqual(raw(await runGscan(BASE, major)), [], `gscan ${GSCAN[major].version}`)
    assert.deepEqual(await gate(BASE, major), { major, gscan: GSCAN[major].version, blocked: false, errors: [], warnings: [] })
  }
})

// ─── the pins and the inventories ─────────────────────────────────────────────────────────────────────────────────

test('GSCAN equals the installed checkers: 4.49.7 under gscan4 for Ghost 5, 6.4.2 under gscan6 for Ghost 6 (AD-34)', () => {
  for (const major of MAJORS) assert.equal(installedVersion(major), GSCAN[major].version, `Ghost ${major}`)
})

test('each pin\'s rules — code, level, fatal and a regex rule\'s source — equal its AD-23 recording; a planted level change fails', () => {
  for (const major of MAJORS) {
    const recorded = RECORDED[major]
    assert.equal(recorded.gscan, GSCAN[major].version, `fixtures/gscan/ records gscan ${recorded.gscan} for Ghost ${major}, where ${GSCAN[major].version} is pinned`)
    assert.equal(recorded.checkVersion, GSCAN[major].checkVersion)
    assert.deepEqual(installedRules(major), recorded.rules, `gscan ${recorded.gscan}: re-record with node tools/record-gscan.mjs, by the bump procedure`)
    // the control: one recorded level changed is caught
    const planted = structuredClone(recorded.rules)
    const first = Object.keys(planted)[0] as string
    planted[first] = { ...(planted[first] as Recording['rules'][string]), level: planted[first]?.level === 'error' ? 'warning' : 'error' }
    assert.throws(() => assert.deepEqual(installedRules(major), planted), `gscan ${recorded.gscan}: a planted level change was not caught`)
  }
})

test('a moved pin: the installed checker differs from GSCAN — one theme_check_failed naming both versions, blocked', async () => {
  const pin = GSCAN[5] as { version: string }
  const kept = pin.version
  pin.version = '4.49.6'
  try {
    const v = await gate(BASE, 5)
    assert.deepEqual(codes(v.errors), ['theme_check_failed'])
    assert.equal(v.errors[0]?.detail, `gscan ${kept} is installed where 4.49.6 is pinned.`)
    assert.equal(v.gscan, kept, 'the verdict names the checker that ran, not the pin (Review, 2026-10-09)')
    assert.equal(v.blocked, true)
  } finally {
    pin.version = kept
  }
})

// ─── the I/O matrix ───────────────────────────────────────────────────────────────────────────────────────────────

test('Ghost\'s own verdicts: MEASUREMENTS §13a\'s probe theme gives 4.49.7 one error, GS110-NO-MISSING, and 6.4.2 two warnings, it and GS090-NO-LIMIT-ALL', async () => {
  // §13a: the clean base theme whose page.hbs reads no switch, plus one {{#get}} with limit="all"
  const probe = { ...NO_SWITCH, 'index.hbs': `${BASE['index.hbs']}{{#get "posts" limit="all"}}{{#foreach posts}}{{title}}{{/foreach}}{{/get}}\n` }
  assert.deepEqual(raw(await runGscan(probe, 5)), ['error GS110-NO-MISSING-PAGE-BUILDER-USAGE'])
  assert.deepEqual(raw(await runGscan(probe, 6)), ['warning GS090-NO-LIMIT-ALL-IN-GET-HELPER', 'warning GS110-NO-MISSING-PAGE-BUILDER-USAGE'])
})

test('a Page with no Post header: one warning, page_switch_unused, never blocking, on both; on Ghost 5 its detail says Ghost 5 counts it an error (Question 1)', async () => {
  for (const major of MAJORS) {
    const v = await gate(NO_SWITCH, major)
    assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [false, [], ['page_switch_unused GS110-NO-MISSING-PAGE-BUILDER-USAGE']], `Ghost ${major}`)
    const [w] = v.warnings as [Finding]
    assert.equal(w.message, 'The switch that hides a page\'s title and feature image does nothing on this site.')
    assert.equal(w.action, 'To use the switch, add a Post header to your Page template.')
    assert.deepEqual(w.refs, ['page.hbs'])
    assert.equal(w.detail?.includes('Ghost 5\'s own theme check counts this as an error and installs the theme anyway.'), major === 5, w.detail)
  }
})

test('a fatal error: a template invoking a partial it lacks — one GS005-TPL-ERR, fatal, gscan\'s message in detail, blocked, on both', async () => {
  for (const major of MAJORS) {
    const v = await gate({ ...BASE, 'custom-probe.hbs': '{{!< default}}\n{{> "no-such-partial"}}\n' }, major)
    assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [true, ['theme_check_rule GS005-TPL-ERR'], []], `Ghost ${major}`)
    const [e] = v.errors as [Finding]
    assert.equal(e.fatal, true)
    assert.equal(e.detail, 'custom-probe.hbs: The partial no-such-partial could not be found')
    assert.match(e.message, /^GS005-TPL-ERR: \S/)
    assert.match(e.action ?? '', /^Ghost's guide: https:\/\//)
  }
})

/** A select setting and its one read in default.hbs, with the visibility given. */
const withSetting = (key: string, visibility: unknown): ThemeFiles => ({
  ...BASE,
  'package.json': pkg({ custom: { [key]: { type: 'select', options: ['a', 'b'], default: 'a', visibility } } }),
  'default.hbs': shell('', `<i>{{@custom.${key}}}</i>\n`),
})

test('the cascade: a visibility of "true" — one package_check_failed naming the setting and its rule, no GS010-PJ-* finding, blocked, on both', async () => {
  for (const major of MAJORS) {
    const files = withSetting('accent_choice', 'true')
    // the premise: gscan itself reports the cascade — GS010-PJ-PARSE among a page of package.json rules
    const r = raw(await runGscan(files, major))
    assert.ok(r.includes('error GS010-PJ-PARSE') && r.filter((x) => x.includes(' GS010-PJ-')).length > 1, `Ghost ${major}: no cascade to map — ${r.join(', ')}`)
    const v = await gate(files, major)
    assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [true, ['package_check_failed GS010-PJ-PARSE'], []], `Ghost ${major}`)
    assert.equal(v.errors[0]?.message, 'Ghost\'s theme check can\'t read when theme setting “accent_choice” should show, so it reports every package.json rule as broken.')
    assert.match(v.errors[0]?.detail ?? '', /^Its rule, “true”, must name a theme setting at least two characters long\. /)
  }
})

test('the cascade, one-letter key: "x:a" with a declared key x — the same one finding, naming x', async () => {
  for (const major of MAJORS) {
    const v = await gate(withSetting('x', 'x:a'), major)
    assert.deepEqual(codes(v.errors), ['package_check_failed GS010-PJ-PARSE'], `Ghost ${major}`)
    assert.match(v.errors[0]?.message ?? '', /“x”/)
    assert.match(v.errors[0]?.detail ?? '', /“x:a”/)
  }
})

test('a valid visibility, "accent_choice:a": no finding on either checker', async () => {
  for (const major of MAJORS) {
    const files = {
      ...BASE,
      'package.json': pkg({ custom: { accent_choice: { type: 'select', options: ['a', 'b'], default: 'a' }, accent_text: { type: 'text', visibility: 'accent_choice:a' } } }),
      'default.hbs': shell('', '<i>{{@custom.accent_choice}}{{@custom.accent_text}}</i>\n'),
    }
    assert.deepEqual(await gate(files, major), { major, gscan: GSCAN[major].version, blocked: false, errors: [], warnings: [] })
  }
})

/** GS100's fixture: FR-Q5's three built-ins, read inside a block helper's argument, inside {{#if}}, and inside a partial. */
const gs100 = (invoke: boolean, partial: boolean): ThemeFiles => ({
  ...BASE,
  'package.json': pkg({ custom: { color_scheme: { type: 'select', options: ['Light', 'Dark'], default: 'Light' }, dark_accent_color: { type: 'color', default: '#ff0000' }, dark_logo: { type: 'image' } } }),
  'default.hbs': shell('{{#if @custom.dark_accent_color}}<style>:root { --dark-accent: {{@custom.dark_accent_color}}; }</style>{{/if}}\n', invoke ? '{{> "dark-logo"}}\n' : '')
    .replace('<body class="{{body_class}}">', '<body class="{{body_class}}{{#match @custom.color_scheme "Dark"}} scheme-dark{{/match}}">'),
  ...(partial ? { 'partials/dark-logo.hbs': '{{#if @custom.dark_logo}}<img src="{{@custom.dark_logo}}" alt="">{{/if}}\n' } : {}),
})

test('GS100: three settings read in a block helper\'s argument, inside {{#if}} and inside an invoked partial — no finding on either checker', async () => {
  for (const major of MAJORS) assert.deepEqual(await gate(gs100(true, true), major), { major, gscan: GSCAN[major].version, blocked: false, errors: [], warnings: [] })
})

test('GS100\'s controls: the invocation removed, or the partial kept and never invoked — one setting_unused naming dark_logo, blocked, read from each checker\'s own wording', async () => {
  for (const major of MAJORS) {
    for (const [what, files] of [['the invocation removed', gs100(false, false)], ['an orphan partial', gs100(false, true)]] as const) {
      const r = await runGscan(files, major)
      // the premise: each checker's own wording names the key (4.49.7 one list, 6.4.2 one sentence per key)
      assert.match(r.results.find((x) => x.code === 'GS100-NO-UNUSED-CUSTOM-THEME-SETTING')?.failures[0]?.message ?? '', major === 5 ? /^Found unused variables: @custom\.dark_logo$/ : /^config\.custom\.dark_logo is declared but never referenced from a template$/)
      const v = await gate(files, major)
      assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [true, ['setting_unused GS100-NO-UNUSED-CUSTOM-THEME-SETTING'], []], `Ghost ${major}, ${what}`)
      assert.equal(v.errors[0]?.message, 'Theme settings declared but used nowhere on your site: dark_logo.')
    }
    // two unused keys, in one list on 4.49.7 and one sentence each on 6.4.2 — both named, sorted (Review, 2026-10-09)
    const two = gs100(false, false)
    const v = await gate({ ...two, 'default.hbs': (two['default.hbs'] as string).replace(/\{\{#if @custom\.dark_accent_color\}\}.*\{\{\/if\}\}\n/, '') }, major)
    assert.equal(v.errors[0]?.message, 'Theme settings declared but used nowhere on your site: dark_accent_color, dark_logo.', `Ghost ${major}`)
  }
})

/** A theme whose post.hbs carries each witness, written as `write` writes it, in a text run and in an href. */
const words = (write: (s: string) => string): ThemeFiles => ({
  ...BASE,
  'post.hbs': `{{!< default}}\n{{#post}}<article>{{content}}</article>{{/post}}\n${GSCAN_INERT.map((e) => `<p>${write(e.witness)}</p>\n<a href="${write(e.witness)}">x</a>\n`).join('')}`,
})
const RULES = GSCAN_INERT.map((e) => e.rule)

test('their control: each trigger written raw raises its rule on both checkers (GS030-ASSET-REQ for a relative /assets/ address in an href)', async () => {
  for (const major of MAJORS) {
    const hit = new Set((await runGscan(words((s) => s), major)).results.map((r) => r.code))
    assert.deepEqual(RULES.filter((rule) => !hit.has(rule)), [], `Ghost ${major}: raw triggers that raised nothing`)
  }
})

test('a customer\'s words: escapeUserText of each trigger, in text and in an href — neither checker raises any of the five rules, and the decoded text is the typed text', async () => {
  const files = words(escapeUserText)
  for (const major of MAJORS) {
    const hit = (await runGscan(files, major)).results.map((r) => r.code).filter((c) => RULES.includes(c as typeof RULES[number]))
    assert.deepEqual(hit, [], `Ghost ${major}`)
  }
  const page = new JSDOM(String(files['post.hbs'])).window.document.body
  assert.deepEqual([...page.querySelectorAll('p')].map((p) => p.textContent), GSCAN_INERT.map((e) => e.witness))
  assert.deepEqual([...page.querySelectorAll('a')].map((a) => a.getAttribute('href')), GSCAN_INERT.map((e) => e.witness))
})

test('GSCAN_INERT holds on both pinned checkers: each witness trips its rule raw and not once inert, and each whole-word pattern IS the rule\'s recorded regex', async () => {
  for (const major of MAJORS) {
    const raised = async (write: (s: string) => string) => new Set((await runGscan(words(write), major)).results.map((r) => r.code))
    const rawHit = await raised((s) => s)
    const inertHit = await raised(gscanInert)
    for (const e of GSCAN_INERT) {
      assert.ok(rawHit.has(e.rule), `Ghost ${major}: ${e.rule}'s witness does not trip it raw`)
      assert.ok(!inertHit.has(e.rule), `Ghost ${major}: ${e.rule} still trips once inert`)
      // GS030-ASSET-REQ's recorded regex is the whole src/href form, which differs between the checkers: held by its witness
      const recorded = RECORDED[major].rules[e.rule]
      if (e.rule !== 'GS030-ASSET-REQ') assert.equal(String(e.pattern), recorded?.regex, `Ghost ${major}: ${e.rule}'s pattern is not its recorded regex`)
    }
  }
})

test('any other rule: a planted .kg-card-markdown — one theme_check_rule warning, GS001-DEPR-CSS-KGMD: …, with its refs, messages and a docs link; not blocked', async () => {
  for (const major of MAJORS) {
    const v = await gate({ ...BASE, 'assets/css/screen.css': `${BASE['assets/css/screen.css']}.kg-card-markdown { margin: 0; }\n` }, major)
    assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [false, [], ['theme_check_rule GS001-DEPR-CSS-KGMD']], `Ghost ${major}`)
    const [w] = v.warnings as [Finding]
    assert.match(w.message, /^GS001-DEPR-CSS-KGMD: \S/)
    assert.deepEqual(w.refs, ['assets/css/screen.css'])
    assert.equal(w.detail, 'assets/css/screen.css: Please remove or replace .kg-card-markdown from this css file.')
    // the rule's own page, not the fallback (Review, 2026-10-09: both expectations used to accept any https link)
    // the rule is v1's in both checkers, and v1's docsBaseUrl is ghost.org/docs on both (6.4.2's v6.js alone moves to docs.ghost.org)
    assert.equal(w.action, 'Ghost\'s guide: https://ghost.org/docs/themes/content/', `Ghost ${major}`)
  }
})

test('gscan fails: a file that cannot be written, and a path that leaves the directory — one theme_check_failed, blocked, no stack; the directory is removed', async () => {
  const before = await gscanDirs()
  for (const major of MAJORS) {
    // `assets` written as a file where assets/css/ already is a directory
    for (const files of [{ ...BASE, assets: 'x' }, { ...BASE, '../escape.hbs': 'x' }, { ...BASE, '/tmp/abs.hbs': 'x' }]) {
      const v = await gate(files, major)
      assert.deepEqual(v, {
        major, gscan: GSCAN[major].version, blocked: true, warnings: [],
        errors: [{ code: 'theme_check_failed', message: 'We couldn\'t check your theme, so nothing was sent to your site.', action: 'Try again in a moment.', level: 'error', fatal: false, refs: [] }],
      }, `Ghost ${major}: ${Object.keys(files).at(-1)}`)
    }
  }
  // A run another test file has in flight (Story 7.10's compiled-theme gate) shares `os.tmpdir()` and is not a leftover
  // of these: its directory is gone within seconds, and a leftover never is — the whole-list equality this used to
  // assert went red intermittently under `pnpm check`'s parallel runs
  const fresh = (await gscanDirs()).filter((n) => !before.includes(n))
  for (let i = 0; i < 150 && (await gscanDirs()).some((n) => fresh.includes(n)); i++) await new Promise((r) => setTimeout(r, 100))
  assert.deepEqual((await gscanDirs()).filter((n) => fresh.includes(n)), [], 'a temporary directory was left behind')
})

test('determinism: the same files twice, their keys in another order, give equal verdicts', async () => {
  const files = { ...NO_SWITCH, 'assets/css/screen.css': `${BASE['assets/css/screen.css']}.kg-card-markdown { margin: 0; }\n`, 'custom-probe.hbs': '{{!< default}}\n{{> "no-such-partial"}}\n' }
  const reversed = Object.fromEntries(Object.entries(files).reverse())
  for (const major of MAJORS) {
    const a = await gate(files, major)
    assert.deepEqual(await gate(reversed, major), a, `Ghost ${major}`)
    assert.deepEqual(JSON.parse(JSON.stringify(a)), a, 'a verdict is plain JSON')
  }
})

test('gscan\'s markup: no tag, no &nbsp; and no other entity in any finding\'s message, detail or action above', () => {
  assert.ok(SEEN.length > 0, 'no finding was seen, so this row reads nothing')
  for (const f of SEEN) {
    for (const [field, text] of [['message', f.message], ['detail', f.detail ?? ''], ['action', f.action ?? '']] as const) {
      assert.doesNotMatch(text, /<\/?[a-zA-Z][^>]*>/, `${f.code} ${f.rule ?? ''} ${field} carries a tag: ${text}`)
      assert.doesNotMatch(text, /&(?:[a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/, `${f.code} ${f.rule ?? ''} ${field} carries an entity: ${text}`)
    }
  }
})

// ─── Review (2026-10-09): the pure rows the real-checker rows could not observe ──────────────────────────────────

test('plain(): tags go, <br> is a space, entities decode to their characters, a code point past U+10FFFF is left as written', () => {
  assert.equal(plain('<code>&lt;img src=&quot;x&quot;&gt;</code>'), '<img src="x">')
  assert.equal(plain('a<br>b<br/>c'), 'a b c')
  assert.equal(plain('&#123;&#x7b;x&#125;&nbsp;y'), '{{x} y')
  assert.equal(plain('&#1114112; &unknown;'), '&#1114112; &unknown;')
})

test('the cascade with no cause found: a hand-made error GS010-PJ-PARSE on a clean package.json gives one package_check_failed, gscan\'s reason in its detail, blocked', () => {
  const report: GscanReport = { gscan: '6.4.2', results: [
    { code: 'GS010-PJ-PARSE', level: 'error', fatal: false, rule: 'x', details: '', failures: [{ ref: 'package.json', message: 'Cannot read properties of <code>null</code>.' }] },
    { code: 'GS010-PJ-NAME-REQ', level: 'error', fatal: false, rule: 'x', details: '', failures: [{ ref: 'package.json' }] },
  ] }
  const v = verdict(report, BASE, 6)
  assert.deepEqual([v.blocked, codes(v.errors), codes(v.warnings)], [true, ['package_check_failed GS010-PJ-PARSE'], []])
  assert.equal(v.errors[0]?.message, 'Ghost\'s theme check failed while reading package.json, which is valid, so it reports every package.json rule as broken.')
  assert.match(v.errors[0]?.detail ?? '', /^Cannot read properties of null\. Those package\.json errors are not real\./)
})

test('a rule whose details carry no link falls back to Ghost\'s docs root; a fatal page switch is never a warning', () => {
  const r = (code: string, fatal: boolean, level: 'error' | 'warning') => ({ code, level, fatal, rule: 'Rule <b>text</b>', details: 'no link here', failures: [{ ref: 'page.hbs' }] })
  const v = verdict({ gscan: '6.4.2', results: [r('GS999-X', false, 'warning')] }, BASE, 6)
  assert.equal(v.warnings[0]?.action, `Ghost's guide: ${DOCS_ROOT}`)
  assert.equal(v.warnings[0]?.message, 'GS999-X: Rule text')
  const fatal = verdict({ gscan: '4.49.7', results: [r('GS110-NO-MISSING-PAGE-BUILDER-USAGE', true, 'error')] }, BASE, 5)
  assert.deepEqual([fatal.blocked, codes(fatal.errors)], [true, ['theme_check_rule GS110-NO-MISSING-PAGE-BUILDER-USAGE']])
})

// THE CEILING, derived (marks.ts's comment): every regex rule in both inventories whose source has no brace, outside the
// stylesheet families no customer word reaches (`GS050-CSS-*`, `GS001-DEPR-CSS-*`, `GS051-*` — `cssPart` takes library
// names only), is either in GSCAN_INERT or exempt here with its reason. A pin bump that adds one fails this row.
const EXEMPT: Record<string, string> = {
  'GS001-DEPR-AMP-TEMPLATE': 'needs a literal <html amp — a typed < is already &lt;',
  'GS080-CARD-LAST4': 'runs only under engines["ghost-api"] "v3", which Story 7.2 never writes',
}
test('every brace-free regex rule outside the stylesheet families is in GSCAN_INERT or exempt with a reason, on both inventories', () => {
  const inert = new Set<string>(GSCAN_INERT.map((e) => e.rule))
  for (const major of MAJORS) {
    const missing = Object.entries(RECORDED[major].rules)
      .filter(([code, r]) => r.regex !== undefined && !r.regex.includes('{') && !/^GS050-CSS-|^GS001-DEPR-CSS-|^GS051-/.test(code))
      .map(([code]) => code)
      .filter((code) => !inert.has(code) && !(code in EXEMPT))
    assert.deepEqual(missing, [], `gscan ${RECORDED[major].gscan}: brace-free rules a customer's words could reach, neither inert nor exempt`)
  }
  for (const code of Object.keys(EXEMPT)) assert.ok(MAJORS.some((m) => code in RECORDED[m].rules), `${code} is exempt but no inventory has it`)
})
